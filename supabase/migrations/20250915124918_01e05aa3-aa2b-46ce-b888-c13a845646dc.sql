-- Adicionar campo UF para quick_test_results
ALTER TABLE public.quick_test_results 
ADD COLUMN state TEXT;