-- Alterar tabela quick_test_results para usar data de nascimento ao invés de idade
ALTER TABLE public.quick_test_results 
ADD COLUMN birth_date DATE;

-- Comentário: Migração para substituir campo age por birth_date
-- O campo age será mantido temporariamente para compatibilidade
-- Em uma próxima migração, pode ser removido após garantir que todos os dados foram migrados