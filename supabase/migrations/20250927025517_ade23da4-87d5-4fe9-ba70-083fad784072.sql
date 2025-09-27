-- PASSO 1: Desabilitar RLS temporariamente para limpeza
ALTER TABLE public.admin_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.track_content DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_activity_logs DISABLE ROW LEVEL SECURITY;

-- PASSO 2: Dropar TODAS as políticas existentes usando CASCADE
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE tablename IN ('admin_users', 'user_roles', 'track_content', 'admin_activity_logs')
          AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- PASSO 3: Reabilitar RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.track_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_activity_logs ENABLE ROW LEVEL SECURITY;

-- PASSO 4: Criar políticas simples e finais

-- admin_users: só super admins podem acessar
CREATE POLICY "admin_users_access"
ON public.admin_users
FOR ALL
USING (auth.email() IN ('jw@efeito.digital', 'johnasdmr@gmail.com'))
WITH CHECK (auth.email() IN ('jw@efeito.digital', 'johnasdmr@gmail.com'));

-- user_roles: usuários veem próprias, admins tudo
CREATE POLICY "user_roles_own_access"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "user_roles_admin_access"
ON public.user_roles
FOR ALL
USING (auth.email() IN ('jw@efeito.digital', 'johnasdmr@gmail.com'))
WITH CHECK (auth.email() IN ('jw@efeito.digital', 'johnasdmr@gmail.com'));

-- track_content: só admins
CREATE POLICY "track_content_access"
ON public.track_content
FOR ALL
USING (auth.email() IN ('jw@efeito.digital', 'johnasdmr@gmail.com'))
WITH CHECK (auth.email() IN ('jw@efeito.digital', 'johnasdmr@gmail.com'));

-- admin_activity_logs: só admins
CREATE POLICY "admin_logs_access"
ON public.admin_activity_logs
FOR SELECT
USING (auth.email() IN ('jw@efeito.digital', 'johnasdmr@gmail.com'));