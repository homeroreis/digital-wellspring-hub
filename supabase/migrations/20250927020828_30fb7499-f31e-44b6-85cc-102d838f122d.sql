-- Fix critical RPC functions that are causing 400 errors

-- Fix calculate_user_gamification_stats function 
CREATE OR REPLACE FUNCTION public.calculate_user_gamification_stats(user_uuid uuid)
RETURNS TABLE(total_points integer, current_level integer, points_to_next_level integer, days_streak integer, activities_completed integer, tracks_completed integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_total_points INTEGER := 0;
    v_level INTEGER := 1;
    v_next_level_points INTEGER := 100;
    v_streak INTEGER := 0;
    v_activities INTEGER := 0;
    v_tracks INTEGER := 0;
BEGIN
    -- Get total points and active tracks from user_track_progress
    SELECT 
        COALESCE(SUM(total_points), 0)::INTEGER,
        COALESCE(MAX(streak_days), 0)::INTEGER,
        COALESCE(COUNT(DISTINCT track_slug), 0)::INTEGER
    INTO v_total_points, v_streak, v_tracks
    FROM user_track_progress 
    WHERE user_id = user_uuid AND is_active = true;
    
    -- Get activities completed count
    SELECT COALESCE(COUNT(*), 0)::INTEGER 
    INTO v_activities
    FROM user_activity_progress 
    WHERE user_id = user_uuid;
    
    -- Calculate level based on points
    v_level := CASE 
        WHEN v_total_points < 100 THEN 1
        WHEN v_total_points < 300 THEN 2
        WHEN v_total_points < 600 THEN 3
        WHEN v_total_points < 1000 THEN 4
        ELSE 5
    END;
    
    -- Calculate points to next level
    v_next_level_points := CASE 
        WHEN v_total_points < 100 THEN 100 - v_total_points
        WHEN v_total_points < 300 THEN 300 - v_total_points
        WHEN v_total_points < 600 THEN 600 - v_total_points
        WHEN v_total_points < 1000 THEN 1000 - v_total_points
        ELSE 0
    END;
    
    RETURN QUERY SELECT 
        v_total_points,
        v_level,
        v_next_level_points,
        v_streak,
        v_activities,
        v_tracks;
END;
$$;

-- Fix get_user_display_data function
CREATE OR REPLACE FUNCTION public.get_user_display_data(user_uuid uuid)
RETURNS TABLE(full_name text, email text, phone text, birth_date date, gender text, city text, state text, profession text, has_profile boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    WITH user_data AS (
        SELECT u.id, u.email as auth_email 
        FROM auth.users u 
        WHERE u.id = user_uuid
    ),
    profile_data AS (
        SELECT p.* 
        FROM profiles p 
        WHERE p.user_id = user_uuid 
        LIMIT 1
    ),
    questionnaire_data AS (
        SELECT q.* 
        FROM questionnaire_results q 
        WHERE q.user_id = user_uuid 
        ORDER BY q.completed_at DESC 
        LIMIT 1
    )
    SELECT 
        COALESCE(pd.full_name, qd.full_name, '')::TEXT,
        COALESCE(pd.email, qd.email, ud.auth_email, '')::TEXT,
        COALESCE(pd.phone, qd.phone, '')::TEXT,
        COALESCE(pd.birth_date, qd.birth_date)::DATE,
        COALESCE(pd.gender, qd.gender, '')::TEXT,
        COALESCE(pd.city, qd.city, '')::TEXT,
        COALESCE(pd.state, qd.state, '')::TEXT,
        COALESCE(pd.profession, qd.profession, '')::TEXT,
        (pd.full_name IS NOT NULL OR qd.full_name IS NOT NULL)::BOOLEAN
    FROM user_data ud
    LEFT JOIN profile_data pd ON true
    LEFT JOIN questionnaire_data qd ON true;
END;
$$;

-- Fix complete_activity function
CREATE OR REPLACE FUNCTION public.complete_activity(p_track_slug text, p_day_number integer, p_activity_index integer, p_activity_title text, p_activity_type text DEFAULT 'activity'::text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_uuid uuid;
  activity_points integer;
  existing_record uuid;
BEGIN
  -- Get authenticated user
  user_uuid := auth.uid();
  
  IF user_uuid IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Authentication required',
      'message', 'Please log in to complete activities'
    );
  END IF;

  -- Get activity points or use default
  SELECT tda.points_value INTO activity_points
  FROM track_daily_activities tda
  JOIN track_daily_content tdc ON tda.daily_content_id = tdc.id
  WHERE tdc.track_slug = p_track_slug 
    AND tdc.day_number = p_day_number 
    AND tda.sort_order = p_activity_index
  LIMIT 1;

  -- Use default points if not found
  activity_points := COALESCE(activity_points, 10);

  -- Check if already completed
  SELECT id INTO existing_record
  FROM user_activity_progress
  WHERE user_id = user_uuid 
    AND track_slug = p_track_slug 
    AND day_number = p_day_number 
    AND activity_index = p_activity_index
  LIMIT 1;

  IF existing_record IS NOT NULL THEN
    -- Update existing record
    UPDATE user_activity_progress 
    SET completed_at = now(), 
        points_earned = activity_points,
        activity_title = p_activity_title,
        activity_type = p_activity_type
    WHERE id = existing_record;
  ELSE
    -- Insert new record
    INSERT INTO user_activity_progress (
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
    );
  END IF;

  -- Return success
  RETURN json_build_object(
    'success', true, 
    'points_earned', activity_points, 
    'completed_at', now(),
    'message', 'Activity completed successfully'
  );
  
EXCEPTION
  WHEN OTHERS THEN
    -- Return error details
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM,
      'error_code', SQLSTATE,
      'message', 'Failed to complete activity. Please try again.'
    );
END;
$$;