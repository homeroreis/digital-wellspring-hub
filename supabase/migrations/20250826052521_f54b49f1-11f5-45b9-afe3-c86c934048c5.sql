-- Add retry control fields to questionnaire_results table
ALTER TABLE public.questionnaire_results 
ADD COLUMN IF NOT EXISTS attempt_number integer NOT NULL DEFAULT 1,
ADD COLUMN IF NOT EXISTS attempt_date date NOT NULL DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS track_type text NOT NULL DEFAULT 'equilibrio';

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_questionnaire_results_user_date 
ON public.questionnaire_results(user_id, attempt_date);

-- Create index for tracking attempts
CREATE INDEX IF NOT EXISTS idx_questionnaire_results_attempts 
ON public.questionnaire_results(user_id, attempt_date, attempt_number);