-- Migration: Track RPC Functions for efficient track management
-- Created: 2025-08-26

-- Function to get a specific day with user completion status
CREATE OR REPLACE FUNCTION public.get_track_day(
  p_track_slug text,
  p_day_number integer
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
  user_uuid uuid;
BEGIN
  user_uuid := auth.uid();
  
  IF user_uuid IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT json_build_object(
    'day_content', to_json(tdc.*),
    'activities', (
      SELECT json_agg(
        json_build_object(
          'activity', to_json(tda.*),
          'completed', CASE 
            WHEN uap.id IS NOT NULL THEN true 
            ELSE false 
          END,
          'completed_at', uap.completed_at,
          'points_earned', COALESCE(uap.points_earned, 0)
        )
      )
      FROM public.track_daily_activities tda
      LEFT JOIN public.user_activity_progress uap ON (
        uap.user_id = user_uuid 
        AND uap.track_slug = p_track_slug 
        AND uap.day_number = p_day_number 
        AND uap.activity_index = tda.sort_order
      )
      WHERE tda.daily_content_id = tdc.id
      ORDER BY tda.sort_order
    ),
    'day_completed', (
      SELECT CASE 
        WHEN COUNT(*) = COUNT(uap.id) THEN true 
        ELSE false 
      END
      FROM public.track_daily_activities tda
      LEFT JOIN public.user_activity_progress uap ON (
        uap.user_id = user_uuid 
        AND uap.track_slug = p_track_slug 
        AND uap.day_number = p_day_number 
        AND uap.activity_index = tda.sort_order
      )
      WHERE tda.daily_content_id = tdc.id AND tda.is_required = true
    )
  )
  INTO result
  FROM public.track_daily_content tdc
  WHERE tdc.track_slug = p_track_slug AND tdc.day_number = p_day_number;

  RETURN COALESCE(result, '{}'::json);
END;
$$;

-- Function to get a week of days (7 days) with completion status
CREATE OR REPLACE FUNCTION public.get_week_days(
  p_track_slug text,
  p_start_day integer DEFAULT 1
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
  user_uuid uuid;
BEGIN
  user_uuid := auth.uid();
  
  IF user_uuid IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT json_agg(
    json_build_object(
      'day_number', tdc.day_number,
      'title', tdc.title,
      'objective', tdc.objective,
      'difficulty_level', tdc.difficulty_level,
      'max_points', tdc.max_points,
      'day_completed', (
        SELECT CASE 
          WHEN COUNT(*) = COUNT(uap.id) THEN true 
          ELSE false 
        END
        FROM public.track_daily_activities tda
        LEFT JOIN public.user_activity_progress uap ON (
          uap.user_id = user_uuid 
          AND uap.track_slug = p_track_slug 
          AND uap.day_number = tdc.day_number 
          AND uap.activity_index = tda.sort_order
        )
        WHERE tda.daily_content_id = tdc.id AND tda.is_required = true
      ),
      'activities_completed', (
        SELECT COUNT(uap.id)
        FROM public.track_daily_activities tda
        LEFT JOIN public.user_activity_progress uap ON (
          uap.user_id = user_uuid 
          AND uap.track_slug = p_track_slug 
          AND uap.day_number = tdc.day_number 
          AND uap.activity_index = tda.sort_order
        )
        WHERE tda.daily_content_id = tdc.id
      ),
      'total_activities', (
        SELECT COUNT(*)
        FROM public.track_daily_activities tda
        WHERE tda.daily_content_id = tdc.id
      )
    )
  )
  INTO result
  FROM public.track_daily_content tdc
  WHERE tdc.track_slug = p_track_slug 
    AND tdc.day_number >= p_start_day 
    AND tdc.day_number < p_start_day + 7
  ORDER BY tdc.day_number;

  RETURN COALESCE(result, '[]'::json);
END;
$$;

-- Function to complete an activity
CREATE OR REPLACE FUNCTION public.complete_activity(
  p_track_slug text,
  p_day_number integer,
  p_activity_index integer,
  p_activity_title text,
  p_activity_type text DEFAULT 'activity'
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_uuid uuid;
  activity_points integer;
  result json;
BEGIN
  user_uuid := auth.uid();
  
  IF user_uuid IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Get activity points
  SELECT tda.points_value INTO activity_points
  FROM public.track_daily_activities tda
  JOIN public.track_daily_content tdc ON tda.daily_content_id = tdc.id
  WHERE tdc.track_slug = p_track_slug 
    AND tdc.day_number = p_day_number 
    AND tda.sort_order = p_activity_index;

  -- Default points if not found
  activity_points := COALESCE(activity_points, 10);

  -- Insert or update activity progress (idempotent)
  INSERT INTO public.user_activity_progress (
    user_id,
    track_slug,
    day_number,
    activity_index,
    activity_type,
    activity_title,
    points_earned,
    completed_at
  )
  VALUES (
    user_uuid,
    p_track_slug,
    p_day_number,
    p_activity_index,
    p_activity_type,
    p_activity_title,
    activity_points,
    now()
  )
  ON CONFLICT (user_id, track_slug, day_number, activity_index) 
  DO UPDATE SET 
    completed_at = now(),
    points_earned = activity_points;

  -- Return result
  SELECT json_build_object(
    'success', true,
    'points_earned', activity_points,
    'completed_at', now()
  ) INTO result;

  RETURN result;
END;
$$;

-- Function to complete a day (only if all required activities are done)
CREATE OR REPLACE FUNCTION public.complete_day(
  p_track_slug text,
  p_day_number integer
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_uuid uuid;
  required_activities_count integer;
  completed_activities_count integer;
  day_points integer;
  current_streak integer;
  total_points integer;
  new_level integer;
  result json;
BEGIN
  user_uuid := auth.uid();
  
  IF user_uuid IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Count required activities for this day
  SELECT COUNT(*) INTO required_activities_count
  FROM public.track_daily_activities tda
  JOIN public.track_daily_content tdc ON tda.daily_content_id = tdc.id
  WHERE tdc.track_slug = p_track_slug 
    AND tdc.day_number = p_day_number 
    AND tda.is_required = true;

  -- Count completed required activities
  SELECT COUNT(*) INTO completed_activities_count
  FROM public.track_daily_activities tda
  JOIN public.track_daily_content tdc ON tda.daily_content_id = tdc.id
  JOIN public.user_activity_progress uap ON (
    uap.user_id = user_uuid 
    AND uap.track_slug = p_track_slug 
    AND uap.day_number = p_day_number 
    AND uap.activity_index = tda.sort_order
  )
  WHERE tdc.track_slug = p_track_slug 
    AND tdc.day_number = p_day_number 
    AND tda.is_required = true;

  -- Check if all required activities are completed
  IF completed_activities_count < required_activities_count THEN
    RETURN json_build_object(
      'success', false,
      'message', 'All required activities must be completed first',
      'required', required_activities_count,
      'completed', completed_activities_count
    );
  END IF;

  -- Get day points
  SELECT max_points INTO day_points
  FROM public.track_daily_content
  WHERE track_slug = p_track_slug AND day_number = p_day_number;

  day_points := COALESCE(day_points, 100);

  -- Update or create user track progress
  INSERT INTO public.user_track_progress (
    user_id,
    track_slug,
    current_day,
    total_points,
    streak_days,
    level_number,
    last_activity_at
  )
  VALUES (
    user_uuid,
    p_track_slug,
    GREATEST(p_day_number + 1, 1),
    day_points,
    1,
    1,
    now()
  )
  ON CONFLICT (user_id, track_slug) 
  DO UPDATE SET 
    current_day = GREATEST(user_track_progress.current_day, p_day_number + 1),
    total_points = user_track_progress.total_points + day_points,
    streak_days = CASE 
      WHEN user_track_progress.last_activity_at::date = (now() - interval '1 day')::date 
      THEN user_track_progress.streak_days + 1
      WHEN user_track_progress.last_activity_at::date = now()::date 
      THEN user_track_progress.streak_days
      ELSE 1
    END,
    level_number = public.calculate_user_level(user_track_progress.total_points + day_points),
    last_activity_at = now();

  -- Get updated values
  SELECT total_points, streak_days, level_number 
  INTO total_points, current_streak, new_level
  FROM public.user_track_progress 
  WHERE user_id = user_uuid AND track_slug = p_track_slug;

  -- Check and award achievements
  PERFORM public.check_and_award_achievements(user_uuid, p_track_slug);

  -- Return success result
  SELECT json_build_object(
    'success', true,
    'day_completed', p_day_number,
    'points_earned', day_points,
    'total_points', total_points,
    'current_streak', current_streak,
    'level', new_level,
    'next_day', p_day_number + 1
  ) INTO result;

  RETURN result;
END;
$$;