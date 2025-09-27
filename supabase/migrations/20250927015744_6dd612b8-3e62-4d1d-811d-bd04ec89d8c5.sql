-- PHASE 1: CRITICAL SECURITY FIXES (Fixed approach)
-- First drop dependent policies, then recreate functions

-- Drop policies that depend on has_role function
DROP POLICY IF EXISTS "Only admins can view activity logs" ON admin_activity_logs;
DROP POLICY IF EXISTS "Enable all for admin only" ON track_content;

-- Now safely drop and recreate functions
DROP FUNCTION IF EXISTS public.has_role(uuid, app_role) CASCADE;
DROP FUNCTION IF EXISTS public.get_user_role(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.current_user_is_admin() CASCADE;
DROP FUNCTION IF EXISTS public.current_user_is_super_admin() CASCADE;

-- Recreate has_role function with proper security
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM user_roles
    WHERE user_id = _user_id AND role::app_role = _role AND is_active = true
  )
$$;

-- Recreate get_user_role function with proper security
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role::app_role
  FROM user_roles
  WHERE user_id = _user_id AND is_active = true
  ORDER BY 
    CASE role
      WHEN 'admin' THEN 1
      WHEN 'editor' THEN 2
      WHEN 'viewer' THEN 3
    END
  LIMIT 1
$$;

-- Recreate admin check functions with proper security
CREATE OR REPLACE FUNCTION public.current_user_is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Super admin direct check
  IF auth.email() = 'jw@efeito.digital' THEN
    RETURN true;
  END IF;
  
  -- Check in admin_users table
  RETURN EXISTS (
    SELECT 1 FROM admin_users 
    WHERE user_id = auth.uid() 
    AND is_active = true
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN auth.email() = 'jw@efeito.digital';
END;
$$;

CREATE OR REPLACE FUNCTION public.current_user_is_super_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Super admin direct check
  IF auth.email() = 'jw@efeito.digital' THEN
    RETURN true;
  END IF;
  
  -- Check super_admin role
  RETURN EXISTS (
    SELECT 1 FROM admin_users 
    WHERE user_id = auth.uid() 
    AND role = 'super_admin' 
    AND is_active = true
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN auth.email() = 'jw@efeito.digital';
END;
$$;

-- Recreate the policies with the new functions
CREATE POLICY "Only admins can view activity logs" 
ON admin_activity_logs 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Enable all for admin only" 
ON track_content 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));