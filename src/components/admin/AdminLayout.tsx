import React from 'react';
import { Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  SidebarProvider, 
  SidebarTrigger,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  BarChart3, 
  Settings,
  Shield,
  Activity,
  Database
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

const AdminSidebar = () => {
  const location = useLocation();
  const { isAdmin, isEditor } = useAdminAuth();
  
  const adminItems = [
    { title: 'Dashboard', url: '/admin', icon: LayoutDashboard, roles: ['admin', 'editor', 'viewer'] },
    { title: 'Analytics', url: '/admin/analytics', icon: BarChart3, roles: ['admin', 'editor', 'viewer'] },
    { title: 'Relatórios', url: '/admin/reports', icon: FileText, roles: ['admin', 'editor', 'viewer'] },
    { title: 'CMS', url: '/admin/cms', icon: Database, roles: ['admin', 'editor'] },
    { title: 'Mídia', url: '/admin/media', icon: Database, roles: ['admin', 'editor'] },
    { title: 'Usuários', url: '/admin/users', icon: Users, roles: ['admin'] },
    { title: 'Logs', url: '/admin/logs', icon: Activity, roles: ['admin'] },
    { title: 'Configurações', url: '/admin/settings', icon: Settings, roles: ['admin'] }
  ];

  const hasPermission = (roles: string[]) => {
    if (isAdmin) return true;
    if (isEditor && roles.includes('editor')) return true;
    return roles.includes('viewer');
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarTrigger className="m-2 self-end" />
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Painel Administrativo</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminItems.filter(item => hasPermission(item.roles)).map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        `flex items-center space-x-2 ${
                          isActive ? 'bg-muted text-primary font-medium' : 'hover:bg-muted/50'
                        }`
                      }
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

const AdminLayout: React.FC<AdminLayoutProps> = ({ 
  children, 
  title = 'Painel Administrativo',
  description = 'Sistema de gestão e analytics'
}) => {
  const { user, hasAccess, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ redirectTo: '/admin' }} replace />;
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Shield className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Acesso Negado</h1>
          <p className="text-muted-foreground">Você não tem permissão para acessar esta área.</p>
        </div>
      </div>
    );
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: title,
    description: description
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>{title} — Admin</title>
        <meta name="description" content={description} />
        <meta name="robots" content="noindex, nofollow" />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AdminSidebar />
          
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <header className="h-12 flex items-center border-b bg-background/80 backdrop-blur px-4">
              <SidebarTrigger />
              <div className="ml-4">
                <h1 className="text-lg font-semibold">{title}</h1>
              </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 p-6">
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default AdminLayout;