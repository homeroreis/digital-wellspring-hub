-- 1. Primeiro, identificar e remover registros duplicados manualmente
DELETE FROM user_activity_progress 
WHERE id NOT IN (
  SELECT DISTINCT ON (user_id, track_slug, day_number, activity_index) id
  FROM user_activity_progress 
  ORDER BY user_id, track_slug, day_number, activity_index, created_at ASC
);

-- 2. Agora adicionar a constraint única
ALTER TABLE user_activity_progress 
ADD CONSTRAINT user_activity_progress_unique_key 
UNIQUE (user_id, track_slug, day_number, activity_index);

-- 3. Melhorar a função complete_activity
CREATE OR REPLACE FUNCTION public.complete_activity(
  p_track_slug text, 
  p_day_number integer, 
  p_activity_index integer, 
  p_activity_title text, 
  p_activity_type text DEFAULT 'activity'::text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_uuid uuid;
  activity_points integer;
BEGIN
  -- Verificar autenticação
  user_uuid := auth.uid();
  
  IF user_uuid IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Authentication required',
      'message', 'Please log in to complete activities'
    );
  END IF;

  -- Obter pontos da atividade (usar padrão se não encontrar)
  SELECT COALESCE(tda.points_value, 10) INTO activity_points
  FROM track_daily_activities tda
  JOIN track_daily_content tdc ON tda.daily_content_id = tdc.id
  WHERE tdc.track_slug = p_track_slug 
    AND tdc.day_number = p_day_number 
    AND tda.sort_order = p_activity_index
  LIMIT 1;

  -- Usar pontos padrão se não encontrou
  activity_points := COALESCE(activity_points, 10);

  -- Inserir ou atualizar progresso (ON CONFLICT agora funcionará)
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
  )
  ON CONFLICT (user_id, track_slug, day_number, activity_index) 
  DO UPDATE SET 
    completed_at = now(), 
    points_earned = EXCLUDED.points_earned,
    activity_title = EXCLUDED.activity_title,
    activity_type = EXCLUDED.activity_type;

  -- Retornar sucesso
  RETURN json_build_object(
    'success', true, 
    'points_earned', activity_points, 
    'completed_at', now(),
    'message', 'Activity completed successfully'
  );
  
EXCEPTION
  WHEN OTHERS THEN
    -- Log e retornar erro
    RAISE LOG 'Error in complete_activity: % - SQLSTATE: %', SQLERRM, SQLSTATE;
    
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM,
      'message', 'Failed to complete activity. Please try again.'
    );
END;
$function$;