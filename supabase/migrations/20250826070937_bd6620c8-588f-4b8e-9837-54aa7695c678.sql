-- Alterar tabela profiles: campo age para birth_date
ALTER TABLE public.profiles 
DROP COLUMN IF EXISTS age,
ADD COLUMN birth_date DATE;

-- Criar função para calcular idade a partir da data de nascimento
CREATE OR REPLACE FUNCTION public.calculate_age_from_birth_date(birth_date DATE)
RETURNS INTEGER
LANGUAGE SQL
IMMUTABLE
AS $$
  SELECT EXTRACT(YEAR FROM AGE(birth_date))::INTEGER;
$$;

-- Criar função para sincronizar dados do auth.users para profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    user_id,
    full_name,
    phone,
    birth_date,
    gender,
    marital_status,
    city,
    state,
    profession,
    education_level,
    income_range,
    how_found_us,
    accept_terms
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

-- Criar trigger para novos usuários
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();