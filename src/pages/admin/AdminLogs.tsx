import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Activity, Search, Download, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdminLog {
  id: string;
  user_id: string;
  action: string;
  resource_type?: string;
  resource_id?: string;
  details?: any;
  created_at: string;
  user_email?: string;
}

const AdminLogs = () => {
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAction, setSelectedAction] = useState('all');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('admin_activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resource_type?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAction = selectedAction === 'all' || log.action === selectedAction;
    
    return matchesSearch && matchesAction;
  });

  const getActionBadgeVariant = (action: string) => {
    if (action.includes('create') || action.includes('add')) return 'default';
    if (action.includes('update') || action.includes('edit')) return 'secondary';
    if (action.includes('delete') || action.includes('remove')) return 'destructive';
    if (action.includes('view') || action.includes('read')) return 'outline';
    return 'outline';
  };

  const uniqueActions = Array.from(new Set(logs.map(log => log.action)));

  const exportLogs = () => {
    console.log('Exporting logs...');
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
          <h2 className="text-2xl font-bold">Logs de Atividade</h2>
          <p className="text-muted-foreground">
            Acompanhe todas as atividades administrativas do sistema
          </p>
        </div>
        
        <Button onClick={exportLogs} variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Exportar Logs
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Logs</p>
                <p className="text-2xl font-bold">{logs.length}</p>
              </div>
              <Activity className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Hoje</p>
                <p className="text-2xl font-bold">
                  {logs.filter(log => 
                    new Date(log.created_at).toDateString() === new Date().toDateString()
                  ).length}
                </p>
              </div>
              <Activity className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Esta Semana</p>
                <p className="text-2xl font-bold">
                  {logs.filter(log => {
                    const logDate = new Date(log.created_at);
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return logDate >= weekAgo;
                  }).length}
                </p>
              </div>
              <Activity className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ações Únicas</p>
                <p className="text-2xl font-bold">{uniqueActions.length}</p>
              </div>
              <Filter className="w-8 h-8 text-blue-500" />
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
                  placeholder="Buscar por ação ou tipo de recurso..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="px-3 py-2 border border-input rounded-md bg-background"
            >
              <option value="all">Todas as ações</option>
              {uniqueActions.map(action => (
                <option key={action} value={action}>{action}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Logs de Atividade ({filteredLogs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredLogs.map((log) => (
              <div key={log.id} className="border rounded-lg p-4 hover:bg-muted/50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={getActionBadgeVariant(log.action)}>
                        {log.action}
                      </Badge>
                      {log.resource_type && (
                        <Badge variant="outline">
                          {log.resource_type}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="text-sm text-muted-foreground mb-2">
                      Usuário: {log.user_id} • {new Date(log.created_at).toLocaleString('pt-BR')}
                    </div>
                    
                    {log.details && (
                      <div className="text-sm bg-muted/30 rounded p-2 mt-2">
                        <pre className="text-xs overflow-x-auto">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {filteredLogs.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum log encontrado
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogs;