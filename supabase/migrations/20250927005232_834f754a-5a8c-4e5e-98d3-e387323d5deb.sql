-- Apenas melhorar a função complete_activity para lidar com duplicatas e erros

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
  existing_record uuid;
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

  -- Verificar se a atividade existe e obter pontos
  SELECT tda.points_value INTO activity_points
  FROM track_daily_activities tda
  JOIN track_daily_content tdc ON tda.daily_content_id = tdc.id
  WHERE tdc.track_slug = p_track_slug 
    AND tdc.day_number = p_day_number 
    AND tda.sort_order = p_activity_index
  LIMIT 1;

  -- Se não encontrou atividade específica, usar pontos padrão
  activity_points := COALESCE(activity_points, 10);

  -- Verificar se já existe registro
  SELECT id INTO existing_record
  FROM user_activity_progress
  WHERE user_id = user_uuid 
    AND track_slug = p_track_slug 
    AND day_number = p_day_number 
    AND activity_index = p_activity_index
  LIMIT 1;

  IF existing_record IS NOT NULL THEN
    -- Atualizar registro existente
    UPDATE user_activity_progress 
    SET completed_at = now(), 
        points_earned = activity_points,
        activity_title = p_activity_title,
        activity_type = p_activity_type
    WHERE id = existing_record;
  ELSE
    -- Inserir novo registro
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

  -- Retornar resultado de sucesso
  RETURN json_build_object(
    'success', true, 
    'points_earned', activity_points, 
    'completed_at', now(),
    'message', 'Activity completed successfully'
  );
  
EXCEPTION
  WHEN OTHERS THEN
    -- Log do erro para debugging
    RAISE LOG 'Error in complete_activity: % - SQLSTATE: %', SQLERRM, SQLSTATE;
    
    -- Retornar erro estruturado
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM,
      'error_code', SQLSTATE,
      'message', 'Failed to complete activity. Please try again.'
    );
END;
$function$;