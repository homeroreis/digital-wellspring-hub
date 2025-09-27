-- REMOVER TODAS as políticas duplicadas e problemáticas
DROP POLICY IF EXISTS "Admins manage admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Admins view admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Super admins can manage admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Super admins can view admin users" ON public.admin_users;

DROP POLICY IF EXISTS "Admins manage track content" ON public.track_content;

DROP POLICY IF EXISTS "Admins view activity logs" ON public.admin_activity_logs;
DROP POLICY IF EXISTS "Super admins can view activity logs" ON public.admin_activity_logs;

DROP POLICY IF EXISTS "Admins manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Super admins can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Usuários podem ver suas próprias roles" ON public.user_roles;

-- CRIAR POLÍTICAS FINAIS LIMPAS E SEM RECURSÃO

-- Para admin_users: só admins podem ver e gerenciar
CREATE POLICY "admin_users_select_policy"
ON public.admin_users
FOR SELECT
USING (auth.email() IN ('jw@efeito.digital', 'johnasdmr@gmail.com'));

CREATE POLICY "admin_users_modify_policy"
ON public.admin_users
FOR ALL
USING (auth.email() IN ('jw@efeito.digital', 'johnasdmr@gmail.com'))
WITH CHECK (auth.email() IN ('jw@efeito.digital', 'johnasdmr@gmail.com'));

-- Para track_content: só admins podem gerenciar
CREATE POLICY "track_content_admin_policy"
ON public.track_content
FOR ALL
USING (auth.email() IN ('jw@efeito.digital', 'johnasdmr@gmail.com'))
WITH CHECK (auth.email() IN ('jw@efeito.digital', 'johnasdmr@gmail.com'));

-- Para user_roles: usuários veem próprias roles, admins gerenciam tudo
CREATE POLICY "user_roles_select_own_policy"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "user_roles_admin_policy"
ON public.user_roles
FOR ALL
USING (auth.email() IN ('jw@efeito.digital', 'johnasdmr@gmail.com'))
WITH CHECK (auth.email() IN ('jw@efeito.digital', 'johnasdmr@gmail.com'));

-- Para admin_activity_logs: só admins veem
CREATE POLICY "admin_logs_select_policy"
ON public.admin_activity_logs
FOR SELECT
USING (auth.email() IN ('jw@efeito.digital', 'johnasdmr@gmail.com'));