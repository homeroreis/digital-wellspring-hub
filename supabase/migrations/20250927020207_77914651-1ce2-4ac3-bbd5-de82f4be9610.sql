-- PHASE 1 FINAL: Fix all remaining functions without proper search_path

-- Fix all remaining functions that need search_path
CREATE OR REPLACE FUNCTION public.get_week_days(p_track_slug text, p_start_day integer DEFAULT 1)
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
$$;

CREATE OR REPLACE FUNCTION public.log_admin_activity(_action text, _resource_type text DEFAULT NULL::text, _resource_id uuid DEFAULT NULL::uuid, _details jsonb DEFAULT NULL::jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO admin_activity_logs (user_id, action, resource_type, resource_id, details)
  VALUES (auth.uid(), _action, _resource_type, _resource_id, _details);
END;
$$;

CREATE OR REPLACE FUNCTION public.update_content_metrics(p_content_id uuid, p_metric_type text)
RETURNS void
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  CASE p_metric_type
    WHEN 'view' THEN
      UPDATE contents 
      SET view_count = view_count + 1 
      WHERE id = p_content_id;
    WHEN 'like' THEN
      UPDATE contents 
      SET like_count = like_count + 1 
      WHERE id = p_content_id;
    WHEN 'complete' THEN
      UPDATE contents 
      SET completion_count = completion_count + 1 
      WHERE id = p_content_id;
  END CASE;
END;
$$;

CREATE OR REPLACE FUNCTION public.calculate_user_level(total_points integer)
RETURNS integer
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  RETURN GREATEST(1, (total_points / 100) + 1);
END;
$$;

CREATE OR REPLACE FUNCTION public.check_and_award_achievements(p_user_id uuid, p_track_slug text)
RETURNS void
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  current_streak INTEGER;
  total_days_completed INTEGER;
  track_progress RECORD;
BEGIN
  SELECT * INTO track_progress 
  FROM user_track_progress 
  WHERE user_id = p_user_id AND track_slug = p_track_slug AND is_active = true;
  
  IF track_progress.id IS NOT NULL THEN
    current_streak := track_progress.streak_days;
    
    SELECT COUNT(DISTINCT day_number) INTO total_days_completed
    FROM user_activity_progress
    WHERE user_id = p_user_id AND track_slug = p_track_slug;
    
    IF total_days_completed = 1 AND NOT EXISTS (
      SELECT 1 FROM user_achievements 
      WHERE user_id = p_user_id AND achievement_type = 'first_day'
    ) THEN
      INSERT INTO user_achievements (user_id, achievement_type, achievement_name, achievement_description, points_awarded)
      VALUES (p_user_id, 'first_day', 'Primeiro Passo', 'Completou seu primeiro dia de transformação', 50);
    END IF;
    
    IF current_streak >= 7 AND NOT EXISTS (
      SELECT 1 FROM user_achievements 
      WHERE user_id = p_user_id AND achievement_type = 'week_warrior'
    ) THEN
      INSERT INTO user_achievements (user_id, achievement_type, achievement_name, achievement_description, points_awarded)
      VALUES (p_user_id, 'week_warrior', 'Guerreiro da Semana', 'Manteve 7 dias consecutivos de atividades', 200);
    END IF;
    
    IF current_streak >= 21 AND NOT EXISTS (
      SELECT 1 FROM user_achievements 
      WHERE user_id = p_user_id AND achievement_type = 'dedication_master'
    ) THEN
      INSERT INTO user_achievements (user_id, achievement_type, achievement_name, achievement_description, points_awarded)
      VALUES (p_user_id, 'dedication_master', 'Mestre da Dedicação', 'Manteve 21 dias consecutivos - transformação real!', 500);
    END IF;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_slug(title text)
RETURNS text
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  slug TEXT;
BEGIN
  slug := lower(trim(title));
  slug := regexp_replace(slug, '[^a-z0-9\s-]', '', 'g');
  slug := regexp_replace(slug, '\s+', '-', 'g');
  slug := regexp_replace(slug, '-+', '-', 'g');
  slug := trim(slug, '-');
  
  RETURN slug;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO profiles (
    user_id, full_name, phone, birth_date, gender, marital_status,
    city, state, profession, education_level, income_range, how_found_us, accept_terms
  )
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'phone',
    CASE 
      WHEN NEW.raw_user_meta_data ->> 'birth_date' IS NOT NULL 
      THEN (NEW.raw_user_meta_data ->> 'birth_date')::DATE
      ELSE NULL
    END,
    NEW.raw_user_meta_data ->> 'gender',
    NEW.raw_user_meta_data ->> 'marital_status',
    NEW.raw_user_meta_data ->> 'city',
    NEW.raw_user_meta_data ->> 'state',
    NEW.raw_user_meta_data ->> 'profession',
    NEW.raw_user_meta_data ->> 'education_level',
    NEW.raw_user_meta_data ->> 'income_range',
    NEW.raw_user_meta_data ->> 'how_found_us',
    CASE 
      WHEN NEW.raw_user_meta_data ->> 'accept_terms' = 'true' 
      THEN true 
      ELSE false 
    END
  );
  RETURN NEW;
END;
$$;