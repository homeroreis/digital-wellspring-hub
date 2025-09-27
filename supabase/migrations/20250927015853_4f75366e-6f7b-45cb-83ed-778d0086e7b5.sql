-- PHASE 1: Fix remaining functions with missing search_path

-- Fix all remaining functions with proper search_path
CREATE OR REPLACE FUNCTION public.save_user_preferences(p_user_id uuid, p_track_slug text, p_focus_areas text[] DEFAULT '{}'::text[], p_experience_level text DEFAULT 'iniciante'::text, p_reminder_time text DEFAULT '09:00'::text, p_notifications boolean DEFAULT true)
RETURNS TABLE(success boolean, message text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO user_preferences (
        user_id, track_slug, focus_areas, experience_level,
        reminder_time, notifications, onboarding_completed,
        onboarding_completed_at, created_at, updated_at
    ) 
    VALUES (
        p_user_id, p_track_slug, p_focus_areas, p_experience_level,
        p_reminder_time, p_notifications, true, NOW(), NOW(), NOW()
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

CREATE OR REPLACE FUNCTION public.add_admin_user(user_email text, user_role text DEFAULT 'admin'::text, user_display_name text DEFAULT NULL::text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_user_id UUID;
  result JSONB;
BEGIN
  IF NOT (current_user_is_super_admin() OR auth.email() = 'jw@efeito.digital') THEN
    RETURN '{"success": false, "error": "Sem permissão"}'::jsonb;
  END IF;

  SELECT id INTO target_user_id 
  FROM auth.users 
  WHERE email = user_email;
  
  IF target_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'Usuário não encontrado. O usuário precisa fazer login pelo menos uma vez.'
    );
  END IF;
  
  INSERT INTO admin_users (user_id, email, role, display_name, created_by)
  VALUES (target_user_id, user_email, user_role, COALESCE(user_display_name, user_email), auth.uid())
  ON CONFLICT (email) 
  DO UPDATE SET 
    role = EXCLUDED.role,
    display_name = EXCLUDED.display_name,
    is_active = true,
    updated_at = now();
    
  RETURN jsonb_build_object(
    'success', true, 
    'message', 'Admin adicionado com sucesso',
    'email', user_email,
    'role', user_role
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

CREATE OR REPLACE FUNCTION public.list_admin_users()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admins_list JSONB;
BEGIN
  IF NOT current_user_is_admin() THEN
    RETURN '{"error": "Sem permissão"}'::jsonb;
  END IF;
  
  SELECT jsonb_agg(jsonb_build_object(
    'id', a.id,
    'email', a.email,
    'role', a.role,
    'display_name', a.display_name,
    'is_active', a.is_active,
    'created_at', a.created_at
  )) INTO admins_list
  FROM admin_users a
  WHERE a.is_active = true
  ORDER BY a.created_at DESC;
  
  RETURN COALESCE(admins_list, '[]'::jsonb);
END;
$$;