-- 🔧 CORREÇÃO DEFINITIVA: RESOLVER ERRO DE PREFERÊNCIAS DUPLICADAS

-- 1. LIMPAR TABELA user_preferences E RECRIAR ESTRUTURA CORRETA
BEGIN;

-- Verificar se existe constraint problemática e removê-la
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'user_preferences_user_id_idx') THEN
        ALTER TABLE public.user_preferences DROP CONSTRAINT user_preferences_user_id_idx;
    END IF;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- Limpar registros duplicados (manter apenas o mais recente por usuário)
DELETE FROM public.user_preferences 
WHERE id NOT IN (
    SELECT DISTINCT ON (user_id) id 
    FROM public.user_preferences 
    ORDER BY user_id, created_at DESC
);

-- Verificar se a tabela tem campos que precisamos
DO $$
BEGIN
    -- Adicionar campos que podem estar faltando
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_preferences' AND column_name = 'critical_area') THEN
        ALTER TABLE public.user_preferences ADD COLUMN critical_area TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_preferences' AND column_name = 'chosen_area') THEN
        ALTER TABLE public.user_preferences ADD COLUMN chosen_area TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_preferences' AND column_name = 'personal_goals') THEN
        ALTER TABLE public.user_preferences ADD COLUMN personal_goals JSONB DEFAULT '[]'::jsonb;
    END IF;
END $$;

-- Recriar constraint UNIQUE correta
ALTER TABLE public.user_preferences 
ADD CONSTRAINT user_preferences_user_id_track_unique UNIQUE (user_id, track_slug);

-- 2. CORRIGIR TRIGGER PROBLEMÁTICO
CREATE OR REPLACE FUNCTION public.initialize_personalized_track_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_profile JSONB;
BEGIN
  -- Update user_profiles with new preferences from onboarding (sem spiritual_level)
  UPDATE public.user_profiles
  SET
    preferences = jsonb_build_object(
      'focusAreas', NEW.focus_areas,
      'timeCommitment', NEW.reminder_time,
      'experience', NEW.experience_level
    ),
    updated_at = now()
  WHERE user_id = NEW.user_id
  RETURNING test_results || demographics || preferences || progress_data INTO v_user_profile;

  -- Create basic personalized track entries if profile exists
  IF v_user_profile IS NOT NULL AND v_user_profile->'testResults'->>'trackType' IS NOT NULL THEN
    INSERT INTO public.personalized_track_days (user_id, day_number, content)
    SELECT
      NEW.user_id,
      day_number,
      jsonb_build_object(
        'dayNumber', day_number,
        'title', title,
        'subtitle', subtitle,
        'description', description,
        'activities', activities,
        'mainFocus', COALESCE(tags[1], 'desenvolvimento'), -- Use first tag or default
        'difficulty', 'medium',
        'estimatedTime', base_duration,
        'rewards', jsonb_build_object('points', base_difficulty * 10)
      )
    FROM public.track_content
    WHERE track_type = (v_user_profile->'testResults'->>'trackType')::TEXT
    ON CONFLICT (user_id, day_number) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

-- 3. FUNÇÃO PARA SALVAR PREFERÊNCIAS COM UPSERT SEGURO
CREATE OR REPLACE FUNCTION public.save_user_preferences(
    p_user_id UUID,
    p_track_slug TEXT,
    p_focus_areas TEXT[] DEFAULT '{}',
    p_experience_level TEXT DEFAULT 'iniciante',
    p_reminder_time TEXT DEFAULT '09:00',
    p_notifications BOOLEAN DEFAULT true
) RETURNS TABLE(success BOOLEAN, message TEXT) AS $$
BEGIN
    -- Inserir ou atualizar preferências de forma segura
    INSERT INTO public.user_preferences (
        user_id, 
        track_slug,
        focus_areas,
        experience_level,
        reminder_time,
        notifications,
        onboarding_completed,
        onboarding_completed_at,
        created_at,
        updated_at
    ) 
    VALUES (
        p_user_id, 
        p_track_slug,
        p_focus_areas,
        p_experience_level,
        p_reminder_time,
        p_notifications,
        true,
        NOW(),
        NOW(),
        NOW()
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;