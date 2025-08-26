-- Create table for quick test results for missionaries
CREATE TABLE public.quick_test_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  full_name TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  age INTEGER,
  city TEXT,
  accept_contact BOOLEAN NOT NULL DEFAULT false,
  missionary_id UUID,
  answers JSONB NOT NULL,
  total_score INTEGER NOT NULL,
  recommended_track TEXT NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.quick_test_results ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can insert quick test results" 
ON public.quick_test_results 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can view their own quick test results" 
ON public.quick_test_results 
FOR SELECT 
USING (auth.uid() = user_id OR auth.uid() IS NULL);

CREATE POLICY "Admins can view all quick test results" 
ON public.quick_test_results 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for better performance
CREATE INDEX idx_quick_test_results_missionary_id ON public.quick_test_results(missionary_id);
CREATE INDEX idx_quick_test_results_created_at ON public.quick_test_results(created_at DESC);