-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'editor', 'viewer');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'viewer',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  ORDER BY 
    CASE role
      WHEN 'admin' THEN 1
      WHEN 'editor' THEN 2
      WHEN 'viewer' THEN 3
    END
  LIMIT 1
$$;

-- RLS Policies
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create admin activity logs table
CREATE TABLE public.admin_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on admin logs
ALTER TABLE public.admin_activity_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view logs
CREATE POLICY "Only admins can view activity logs"
ON public.admin_activity_logs
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Function to log admin activity
CREATE OR REPLACE FUNCTION public.log_admin_activity(
  _action TEXT,
  _resource_type TEXT DEFAULT NULL,
  _resource_id UUID DEFAULT NULL,
  _details JSONB DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.admin_activity_logs (
    user_id, action, resource_type, resource_id, details
  ) VALUES (
    auth.uid(), _action, _resource_type, _resource_id, _details
  );
END;
$$;

-- Create triggers for updated_at
CREATE TRIGGER update_user_roles_updated_at
BEFORE UPDATE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default admin role (replace with your user UUID after first signup)
-- INSERT INTO public.user_roles (user_id, role) VALUES ('YOUR_USER_UUID_HERE', 'admin');