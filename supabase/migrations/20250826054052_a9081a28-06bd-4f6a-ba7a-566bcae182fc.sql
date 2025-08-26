-- Remove retry-related columns from questionnaire_results table
ALTER TABLE public.questionnaire_results 
DROP COLUMN IF EXISTS attempt_number,
DROP COLUMN IF EXISTS attempt_date;

-- Remove indexes that were created for retry functionality
DROP INDEX IF EXISTS idx_questionnaire_results_attempt_date;
DROP INDEX IF EXISTS idx_questionnaire_results_user_attempt;