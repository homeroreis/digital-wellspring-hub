-- PHASE 1 CONTINUATION: Fix remaining functions without proper search_path

-- Fix save_user_preferences function
CREATE OR REPLACE FUNCTION public.save_user_preferences(p_user_id uuid, p_track_slug text, p_focus_areas text[] DEFAULT '{}'::text[], p_experience_level text DEFAULT 'iniciante'::text, p_reminder_time text DEFAULT '09:00'::text, p_notifications boolean DEFAULT true)
RETURNS TABLE(success boolean, message text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO user_preferences (
        user_id, track_slug, focus_areas, experience_level, reminder_time,
        notifications, onboarding_completed, onboarding_completed_at, created_at, updated_at
    ) 
    VALUES (
        p_user_id, p_track_slug, p_focus_areas, p_experience_level, p_reminder_time,
        p_notifications, true, NOW(), NOW(), NOW()
    )
    ON CONFLICT (user_id, track_slug) 
    DO UPDATE SET 
        focus_areas = EXCLUDED.focus_areas,
        experience_level = EXCLUDED.experience_level,
        reminder_time = EXCLUDED.reminder_time,
        notifications = EXCLUDED.notifications,
        onboarding_completed = true,
        onboarding_completed_at = NOW(),
        updated_at = NOW();
    
    RETURN QUERY SELECT true, 'Preferências salvas com sucesso'::TEXT;
    
EXCEPTION WHEN OTHERS THEN
    RETURN QUERY SELECT false, SQLERRM::TEXT;
END;
$$;

-- Fix get_track_day function
CREATE OR REPLACE FUNCTION public.get_track_day(p_track_slug text, p_day_number integer)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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
      SELECT json_agg(json_build_object(
        'activity', to_json(tda.*),
        'completed', CASE WHEN uap.id IS NOT NULL THEN true ELSE false END,
        'completed_at', uap.completed_at,
        'points_earned', COALESCE(uap.points_earned, 0)
      ))
      FROM track_daily_activities tda
      LEFT JOIN user_activity_progress uap ON (
        uap.user_id = user_uuid AND uap.track_slug = p_track_slug 
        AND uap.day_number = p_day_number AND uap.activity_index = tda.sort_order
      )
      WHERE tda.daily_content_id = tdc.id
      ORDER BY tda.sort_order
    )
  ) INTO result
  FROM track_daily_content tdc
  WHERE tdc.track_slug = p_track_slug AND tdc.day_number = p_day_number;

  RETURN COALESCE(result, '{}'::json);
END;
$$;

-- Fix complete_day function
CREATE OR REPLACE FUNCTION public.complete_day(p_track_slug text, p_day_number integer)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_uuid uuid;
  required_activities_count integer;
  completed_activities_count integer;
  day_points integer;
  total_points integer;
  new_level integer;
BEGIN
  user_uuid := auth.uid();
  
  IF user_uuid IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT COUNT(*) INTO required_activities_count
  FROM track_daily_activities tda
  JOIN track_daily_content tdc ON tda.daily_content_id = tdc.id
  WHERE tdc.track_slug = p_track_slug AND tdc.day_number = p_day_number AND tda.is_required = true;

  SELECT COUNT(*) INTO completed_activities_count
  FROM track_daily_activities tda
  JOIN track_daily_content tdc ON tda.daily_content_id = tdc.id
  JOIN user_activity_progress uap ON (
    uap.user_id = user_uuid AND uap.track_slug = p_track_slug 
    AND uap.day_number = p_day_number AND uap.activity_index = tda.sort_order
  )
  WHERE tdc.track_slug = p_track_slug AND tdc.day_number = p_day_number AND tda.is_required = true;

  IF completed_activities_count < required_activities_count THEN
    RETURN json_build_object('success', false, 'message', 'All required activities must be completed first');
  END IF;

  SELECT max_points INTO day_points FROM track_daily_content
  WHERE track_slug = p_track_slug AND day_number = p_day_number;
  day_points := COALESCE(day_points, 100);

  INSERT INTO user_track_progress (user_id, track_slug, current_day, total_points, streak_days, level_number, last_activity_at)
  VALUES (user_uuid, p_track_slug, GREATEST(p_day_number + 1, 1), day_points, 1, 1, now())
  ON CONFLICT (user_id, track_slug) DO UPDATE SET 
    current_day = GREATEST(user_track_progress.current_day, p_day_number + 1),
    total_points = user_track_progress.total_points + day_points,
    last_activity_at = now();

  SELECT total_points, level_number INTO total_points, new_level
  FROM user_track_progress WHERE user_id = user_uuid AND track_slug = p_track_slug;

  RETURN json_build_object('success', true, 'day_completed', p_day_number, 'points_earned', day_points, 'total_points', total_points);
END;
$$;

-- Fix other functions with missing search_path
CREATE OR REPLACE FUNCTION public.make_admin(user_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = user_email;
  
  IF v_user_id IS NULL THEN
    RAISE NOTICE 'Usuário com email % não encontrado', user_email;
    RETURN;
  END IF;
  
  INSERT INTO user_roles (user_id, role)
  VALUES (v_user_id, 'admin')
  ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
  
  RAISE NOTICE 'Usuário % promovido a admin com sucesso', user_email;
END;
$$;