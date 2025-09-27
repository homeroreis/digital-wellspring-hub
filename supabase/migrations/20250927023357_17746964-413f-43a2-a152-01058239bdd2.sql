-- Etapa 1: Simplificar RLS da tabela profiles
-- Remover todas as políticas existentes que podem estar causando conflitos
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;

-- Criar políticas simples e funcionais
CREATE POLICY "profiles_select_policy" ON public.profiles
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "profiles_insert_policy" ON public.profiles
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "profiles_update_policy" ON public.profiles
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "profiles_delete_policy" ON public.profiles
FOR DELETE USING (auth.uid() = user_id);

-- Criar função RPC para atualizar perfil de forma segura
CREATE OR REPLACE FUNCTION public.update_user_profile(
  p_full_name text DEFAULT NULL,
  p_email text DEFAULT NULL,
  p_phone text DEFAULT NULL,
  p_birth_date date DEFAULT NULL,
  p_gender text DEFAULT NULL,
  p_marital_status text DEFAULT NULL,
  p_city text DEFAULT NULL,
  p_state text DEFAULT NULL,
  p_profession text DEFAULT NULL,
  p_education_level text DEFAULT NULL,
  p_income_range text DEFAULT NULL,
  p_how_found_us text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_uuid uuid;
  result json;
BEGIN
  user_uuid := auth.uid();
  
  IF user_uuid IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Authentication required');
  END IF;

  -- Inserir ou atualizar perfil
  INSERT INTO public.profiles (
    user_id, full_name, email, phone, birth_date, gender, marital_status,
    city, state, profession, education_level, income_range, how_found_us
  )
  VALUES (
    user_uuid, p_full_name, p_email, p_phone, p_birth_date, p_gender, p_marital_status,
    p_city, p_state, p_profession, p_education_level, p_income_range, p_how_found_us
  )
  ON CONFLICT (user_id) 
  DO UPDATE SET
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    email = COALESCE(EXCLUDED.email, profiles.email),
    phone = COALESCE(EXCLUDED.phone, profiles.phone),
    birth_date = COALESCE(EXCLUDED.birth_date, profiles.birth_date),
    gender = COALESCE(EXCLUDED.gender, profiles.gender),
    marital_status = COALESCE(EXCLUDED.marital_status, profiles.marital_status),
    city = COALESCE(EXCLUDED.city, profiles.city),
    state = COALESCE(EXCLUDED.state, profiles.state),
    profession = COALESCE(EXCLUDED.profession, profiles.profession),
    education_level = COALESCE(EXCLUDED.education_level, profiles.education_level),
    income_range = COALESCE(EXCLUDED.income_range, profiles.income_range),
    how_found_us = COALESCE(EXCLUDED.how_found_us, profiles.how_found_us),
    updated_at = now();

  RETURN json_build_object('success', true, 'message', 'Profile updated successfully');
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;