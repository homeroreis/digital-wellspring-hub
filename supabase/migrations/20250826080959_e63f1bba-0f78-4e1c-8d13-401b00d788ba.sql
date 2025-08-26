-- Fix security vulnerability: Remove public access to content_personalization_rules
-- This table contains sensitive user behavior analysis and psychological profiling data

-- Drop the overly permissive policy that allows anyone to view personalization rules
DROP POLICY IF EXISTS "Anyone can view personalization rules" ON public.content_personalization_rules;

-- Create a secure policy that only allows authenticated users to view personalization rules
-- This is still broad but much more secure than public access
CREATE POLICY "Authenticated users can view personalization rules"
ON public.content_personalization_rules
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

-- For additional security, let's also create a more restrictive policy for admins only
-- First, let's check if we have admin functionality and create an admin-only policy as well
CREATE POLICY "Admins can manage personalization rules"
ON public.content_personalization_rules
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin'::app_role, 'editor'::app_role)
  )
);

-- Remove the broad "Authenticated users can manage personalization rules" policy
-- and replace it with the more specific admin-only policy above
DROP POLICY IF EXISTS "Authenticated users can manage personalization rules" ON public.content_personalization_rules;