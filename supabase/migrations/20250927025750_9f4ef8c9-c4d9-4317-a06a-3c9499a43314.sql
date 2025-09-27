-- Corrigir as últimas políticas que ainda fazem consulta recursiva a user_roles

-- REMOVER políticas problemáticas que ainda consultam user_roles
DROP POLICY IF EXISTS "Only admins can manage materials" ON public.public_materials;
DROP POLICY IF EXISTS "Admins can view all quick test results" ON public.quick_test_results;

-- CRIAR políticas simples usando apenas auth.email()
CREATE POLICY "Admins manage materials"
ON public.public_materials
FOR ALL
USING (auth.email() IN ('jw@efeito.digital', 'johnasdmr@gmail.com'))
WITH CHECK (auth.email() IN ('jw@efeito.digital', 'johnasdmr@gmail.com'));

CREATE POLICY "Admins view quick test results"
ON public.quick_test_results
FOR SELECT
USING (auth.email() IN ('jw@efeito.digital', 'johnasdmr@gmail.com'));