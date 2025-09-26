-- Adicionar campo email na tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email text;