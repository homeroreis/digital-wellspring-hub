-- PASSO 1: Remover política que depende da função current_user_is_admin
DROP POLICY IF EXISTS "Enable all for admin only" ON public.track_content;

-- PASSO 2: Remover todas as políticas RLS recursivas problemáticas
DROP POLICY IF EXISTS "admin_users_read_policy" ON public.admin_users;
DROP POLICY IF EXISTS "admin_users_write_policy" ON public.admin_users;
DROP POLICY IF EXISTS "Only super_admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can view activity logs" ON public.admin_activity_logs;

-- PASSO 3: Remover funções que causam recursão infinita
DROP FUNCTION IF EXISTS public.current_user_is_admin();
DROP FUNCTION IF EXISTS public.current_user_is_super_admin();
DROP FUNCTION IF EXISTS public.has_role(uuid, app_role);
DROP FUNCTION IF EXISTS public.get_user_role(uuid);

-- PASSO 4: Criar funções de segurança simples e não-recursivas
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT auth.email() IN ('jw@efeito.digital', 'johnasdmr@gmail.com');
$$;

CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT auth.email() IN ('jw@efeito.digital', 'johnasdmr@gmail.com');
$$;

-- PASSO 5: Recriar função get_user_role sem recursão
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT role FROM user_roles WHERE user_id = _user_id AND is_active = true ORDER BY 
      CASE role
        WHEN 'admin' THEN 1
        WHEN 'editor' THEN 2
        WHEN 'viewer' THEN 3
      END
    LIMIT 1), 
    'viewer'
  );
$$;

-- PASSO 6: Recriar política para track_content usando email direto
CREATE POLICY "Super admins can manage track content"
ON public.track_content
FOR ALL
USING (auth.email() IN ('jw@efeito.digital', 'johnasdmr@gmail.com'))
WITH CHECK (auth.email() IN ('jw@efeito.digital', 'johnasdmr@gmail.com'));

-- PASSO 7: Criar políticas RLS simples e seguras para admin_users
CREATE POLICY "Super admins can view admin users" 
ON public.admin_users 
FOR SELECT 
USING (auth.email() IN ('jw@efeito.digital', 'johnasdmr@gmail.com'));

CREATE POLICY "Super admins can manage admin users" 
ON public.admin_users 
FOR ALL 
USING (auth.email() IN ('jw@efeito.digital', 'johnasdmr@gmail.com'))
WITH CHECK (auth.email() IN ('jw@efeito.digital', 'johnasdmr@gmail.com'));

-- PASSO 8: Criar políticas RLS simples para user_roles
CREATE POLICY "Users can view own roles" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Super admins can manage all roles" 
ON public.user_roles 
FOR ALL 
USING (auth.email() IN ('jw@efeito.digital', 'johnasdmr@gmail.com'))
WITH CHECK (auth.email() IN ('jw@efeito.digital', 'johnasdmr@gmail.com'));

-- PASSO 9: Atualizar política de admin_activity_logs
CREATE POLICY "Super admins can view activity logs" 
ON public.admin_activity_logs 
FOR SELECT 
USING (auth.email() IN ('jw@efeito.digital', 'johnasdmr@gmail.com'));