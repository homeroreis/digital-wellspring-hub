-- 1. Primeiro, vamos verificar se a constraint já existe antes de adicionar
DO $$ 
BEGIN
    -- Verificar se constraint já existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'user_activity_progress_unique_key'
    ) THEN
        -- Remover duplicatas de forma simples
        DELETE FROM user_activity_progress a USING user_activity_progress b
        WHERE a.id > b.id 
          AND a.user_id = b.user_id 
          AND a.track_slug = b.track_slug 
          AND a.day_number = b.day_number 
          AND a.activity_index = b.activity_index;
        
        -- Adicionar constraint única
        ALTER TABLE user_activity_progress 
        ADD CONSTRAINT user_activity_progress_unique_key 
        UNIQUE (user_id, track_slug, day_number, activity_index);
    END IF;
END $$;

-- 2. Fazer o mesmo para track_daily_activities
DO $$ 
BEGIN
    -- Verificar se constraint já existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'track_daily_activities_unique_sort'
    ) THEN
        -- Remover duplicatas
        DELETE FROM track_daily_activities a USING track_daily_activities b
        WHERE a.id > b.id 
          AND a.daily_content_id = b.daily_content_id 
          AND a.sort_order = b.sort_order;
        
        -- Adicionar constraint única
        ALTER TABLE track_daily_activities 
        ADD CONSTRAINT track_daily_activities_unique_sort 
        UNIQUE (daily_content_id, sort_order);
    END IF;
END $$;

-- 3. Atualizar a função complete_activity com melhor tratamento de erros
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
  result json;
BEGIN
  -- Verificar autenticação
  user_uuid := auth.uid();
  
  IF user_uuid IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Authentication required',
      'message', 'Você precisa estar logado para completar atividades.'
    );
  END IF;

  -- Buscar pontos da atividade (com fallback)
  SELECT COALESCE(tda.points_value, 10) INTO activity_points
  FROM track_daily_activities tda
  JOIN track_daily_content tdc ON tda.daily_content_id = tdc.id
  WHERE tdc.track_slug = p_track_slug 
    AND tdc.day_number = p_day_number 
    AND tda.sort_order = p_activity_index
  LIMIT 1;

  -- Se não encontrou, usar valor padrão
  activity_points := COALESCE(activity_points, 10);

  -- Inserir ou atualizar progresso da atividade
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

  -- Retornar resultado de sucesso
  RETURN json_build_object(
    'success', true, 
    'points_earned', activity_points, 
    'completed_at', now(),
    'message', 'Atividade completada com sucesso!'
  );
  
EXCEPTION
  WHEN OTHERS THEN
    -- Log do erro
    RAISE LOG 'Error in complete_activity: % - SQLSTATE: %', SQLERRM, SQLSTATE;
    
    -- Retornar erro amigável
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM,
      'message', 'Não foi possível completar a atividade. Tente novamente.'
    );
END;
$function$;