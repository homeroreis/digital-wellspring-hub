-- Fix security issues: Add missing search_path to SECURITY DEFINER functions
-- This prevents search_path manipulation attacks

-- Fix has_role with proper type casting
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM user_roles
    WHERE user_id = _user_id AND role::app_role = _role
  )
$function$;

-- Fix get_user_role with proper enum casting
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT role::app_role
  FROM user_roles
  WHERE user_id = _user_id
  ORDER BY 
    CASE role
      WHEN 'admin' THEN 1
      WHEN 'editor' THEN 2
      WHEN 'viewer' THEN 3
    END
  LIMIT 1
$function$;

-- Fix functions missing search_path (keeping SECURITY DEFINER because they need auth access)
CREATE OR REPLACE FUNCTION public.calculate_user_gamification_stats(user_uuid uuid)
RETURNS TABLE(total_points integer, current_level integer, points_to_next_level integer, days_streak integer, activities_completed integer, tracks_completed integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
    v_total_points INTEGER := 0;
    v_level INTEGER := 1;
    v_next_level_points INTEGER := 100;
    v_streak INTEGER := 0;
    v_activities INTEGER := 0;
    v_tracks INTEGER := 0;
BEGIN
    SELECT 
        COALESCE(SUM(total_points), 0)::INTEGER,
        COALESCE(COUNT(*)::INTEGER, 0),
        COALESCE(COUNT(DISTINCT track_slug)::INTEGER, 0)
    INTO v_total_points, v_activities, v_tracks
    FROM user_track_progress 
    WHERE user_id = user_uuid;
    
    v_level := CASE 
        WHEN v_total_points < 100 THEN 1
        WHEN v_total_points < 300 THEN 2
        WHEN v_total_points < 600 THEN 3
        WHEN v_total_points < 1000 THEN 4
        ELSE 5
    END;
    
    v_next_level_points := CASE 
        WHEN v_total_points < 100 THEN 100 - v_total_points
        WHEN v_total_points < 300 THEN 300 - v_total_points
        WHEN v_total_points < 600 THEN 600 - v_total_points
        WHEN v_total_points < 1000 THEN 1000 - v_total_points
        ELSE 0
    END;
    
    SELECT COUNT(DISTINCT DATE(last_activity_at))::INTEGER 
    INTO v_streak
    FROM user_track_progress 
    WHERE user_id = user_uuid 
    AND last_activity_at >= CURRENT_DATE - INTERVAL '30 days';
    
    RETURN QUERY SELECT 
        v_total_points,
        v_level,
        v_next_level_points,
        COALESCE(v_streak, 0),
        v_activities,
        v_tracks;
END;
$function$;

CREATE OR REPLACE FUNCTION public.complete_activity(p_track_slug text, p_day_number integer, p_activity_index integer, p_activity_title text, p_activity_type text DEFAULT 'activity'::text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  user_uuid uuid;
  activity_points integer;
  result json;
BEGIN
  user_uuid := auth.uid();
  
  IF user_uuid IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT tda.points_value INTO activity_points
  FROM track_daily_activities tda
  JOIN track_daily_content tdc ON tda.daily_content_id = tdc.id
  WHERE tdc.track_slug = p_track_slug 
    AND tdc.day_number = p_day_number 
    AND tda.sort_order = p_activity_index;

  activity_points := COALESCE(activity_points, 10);

  INSERT INTO user_activity_progress (
    user_id, track_slug, day_number, activity_index, activity_type, activity_title, points_earned, completed_at
  )
  VALUES (user_uuid, p_track_slug, p_day_number, p_activity_index, p_activity_type, p_activity_title, activity_points, now())
  ON CONFLICT (user_id, track_slug, day_number, activity_index) 
  DO UPDATE SET completed_at = now(), points_earned = activity_points;

  SELECT json_build_object('success', true, 'points_earned', activity_points, 'completed_at', now()) INTO result;
  RETURN result;
END;
$function$;

CREATE OR REPLACE FUNCTION public.complete_day(p_track_slug text, p_day_number integer)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.get_track_day(p_track_slug text, p_day_number integer)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.get_user_display_data(user_uuid uuid)
RETURNS TABLE(full_name text, email text, phone text, birth_date date, gender text, city text, state text, profession text, has_profile boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
    RETURN QUERY
    WITH user_data AS (
        SELECT u.id, u.email as auth_email FROM auth.users u WHERE u.id = user_uuid
    ),
    profile_data AS (
        SELECT p.* FROM profiles p WHERE p.user_id = user_uuid LIMIT 1
    ),
    questionnaire_data AS (
        SELECT q.* FROM questionnaire_results q WHERE q.user_id = user_uuid ORDER BY q.completed_at DESC LIMIT 1
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
$function$;

CREATE OR REPLACE FUNCTION public.get_week_days(p_track_slug text, p_start_day integer DEFAULT 1)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  result json;
  user_uuid uuid;
BEGIN
  user_uuid := auth.uid();
  
  IF user_uuid IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT json_agg(json_build_object(
    'day_number', tdc.day_number,
    'title', tdc.title,
    'objective', tdc.objective,
    'difficulty_level', tdc.difficulty_level,
    'max_points', tdc.max_points
  )) INTO result
  FROM track_daily_content tdc
  WHERE tdc.track_slug = p_track_slug 
    AND tdc.day_number >= p_start_day 
    AND tdc.day_number < p_start_day + 7
  ORDER BY tdc.day_number;

  RETURN COALESCE(result, '[]'::json);
END;
$function$;

CREATE OR REPLACE FUNCTION public.log_admin_activity(_action text, _resource_type text DEFAULT NULL::text, _resource_id uuid DEFAULT NULL::uuid, _details jsonb DEFAULT NULL::jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO admin_activity_logs (user_id, action, resource_type, resource_id, details)
  VALUES (auth.uid(), _action, _resource_type, _resource_id, _details);
END;
$function$;

CREATE OR REPLACE FUNCTION public.make_admin(user_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
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
$function$;