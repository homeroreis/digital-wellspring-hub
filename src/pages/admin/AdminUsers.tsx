import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  UserPlus, 
  Shield, 
  Edit, 
  Search,
  Filter,
  Download
} from 'lucide-react';
import { useAdminAction } from '@/hooks/useAdminAuth';

interface UserData {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string;
  role?: 'admin' | 'editor' | 'viewer';
  profile?: {
    full_name?: string;
    phone?: string;
  };
}

const AdminUsers = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const { logAction } = useAdminAction();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Fetch users from auth.users (requires admin privileges)
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select(`
          user_id,
          full_name,
          phone,
          created_at
        `);

      if (usersError) {
        console.error('Error fetching users:', usersError);
        return;
      }

      // Fetch user roles
      const { data: rolesData } = await supabase
        .from('user_roles')
        .select('user_id, role');

      // Combine data
      const combinedData = usersData?.map(user => ({
        id: user.user_id,
        email: 'user@example.com', // In production, this would come from auth metadata
        created_at: user.created_at,
        last_sign_in_at: user.created_at,
        role: rolesData?.find(r => r.user_id === user.user_id)?.role || 'viewer',
        profile: {
          full_name: user.full_name,
          phone: user.phone
        }
      })) || [];

      setUsers(combinedData);
      await logAction('view_users_list');
    } catch (error) {
      console.error('Error in fetchUsers:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: 'admin' | 'editor' | 'viewer') => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .upsert({
          user_id: userId,
          role: newRole
        });

      if (error) throw error;

      await logAction('update_user_role', 'user', userId, { newRole });
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeVariant = (role?: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'editor': return 'secondary';
      case 'viewer': return 'outline';
      default: return 'outline';
    }
  };

  const exportUsers = async () => {
    await logAction('export_users', 'users', undefined, { 
      totalUsers: users.length,
      filters: { searchTerm, selectedRole }
    });
    console.log('Exporting users...');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Gestão de Usuários</h2>
          <p className="text-muted-foreground">
            Gerencie usuários, papéis e permissões do sistema
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={exportUsers} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button size="sm">
            <UserPlus className="w-4 h-4 mr-2" />
            Adicionar Usuário
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Usuários</p>
                <p className="text-2xl font-bold">{users.length}</p>
              </div>
              <Users className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Administradores</p>
                <p className="text-2xl font-bold">{users.filter(u => u.role === 'admin').length}</p>
              </div>
              <Shield className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Editores</p>
                <p className="text-2xl font-bold">{users.filter(u => u.role === 'editor').length}</p>
              </div>
              <Edit className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Visualizadores</p>
                <p className="text-2xl font-bold">{users.filter(u => u.role === 'viewer').length}</p>
              </div>
              <Users className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-3 py-2 border border-input rounded-md bg-background"
            >
              <option value="all">Todos os papéis</option>
              <option value="admin">Administradores</option>
              <option value="editor">Editores</option>
              <option value="viewer">Visualizadores</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuários ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Usuário</th>
                  <th className="text-left py-2">Papel</th>
                  <th className="text-left py-2">Criado em</th>
                  <th className="text-left py-2">Último acesso</th>
                  <th className="text-left py-2">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-muted/50">
                    <td className="py-3">
                      <div>
                        <div className="font-medium">
                          {user.profile?.full_name || 'Nome não informado'}
                        </div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                    </td>
                    <td className="py-3">
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {user.role}
                      </Badge>
                    </td>
                    <td className="py-3 text-sm text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-3 text-sm text-muted-foreground">
                      {user.last_sign_in_at ? 
                        new Date(user.last_sign_in_at).toLocaleDateString('pt-BR') : 
                        'Nunca'
                      }
                    </td>
                    <td className="py-3">
                      <select
                        value={user.role}
                        onChange={(e) => updateUserRole(user.id, e.target.value as any)}
                        className="text-sm border border-input rounded px-2 py-1 bg-background"
                      >
                        <option value="viewer">Visualizador</option>
                        <option value="editor">Editor</option>
                        <option value="admin">Administrador</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredUsers.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum usuário encontrado
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUsers;