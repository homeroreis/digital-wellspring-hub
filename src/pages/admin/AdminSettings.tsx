import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Settings, 
  Database, 
  Mail, 
  Shield, 
  Bell, 
  Palette,
  Save,
  AlertTriangle
} from 'lucide-react';
import { useAdminAction } from '@/hooks/useAdminAuth';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    siteName: 'Além das Notificações',
    siteDescription: 'Plataforma de transformação digital adventista',
    maintenanceMode: false,
    registrationEnabled: true,
    emailNotifications: true,
    analyticsEnabled: true,
    backupFrequency: 'daily',
    maxFileSize: '10',
    sessionTimeout: '24'
  });

  const { logAction } = useAdminAction();

  const handleSaveSettings = async () => {
    try {
      await logAction('update_system_settings', 'settings', undefined, settings);
      console.log('Salvando configurações:', settings);
      // In production: await supabase.from('system_settings').upsert(settings)
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const handleBackupNow = async () => {
    await logAction('manual_backup', 'system');
    console.log('Iniciando backup manual...');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Configurações do Sistema</h2>
        <p className="text-muted-foreground">
          Gerencie as configurações globais da plataforma
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Configurações Gerais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="siteName">Nome do Site</Label>
              <Input
                id="siteName"
                value={settings.siteName}
                onChange={(e) => setSettings({...settings, siteName: e.target.value})}
              />
            </div>
            
            <div>
              <Label htmlFor="siteDescription">Descrição do Site</Label>
              <Input
                id="siteDescription"
                value={settings.siteDescription}
                onChange={(e) => setSettings({...settings, siteDescription: e.target.value})}
              />
            </div>

            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Modo de Manutenção</Label>
                <p className="text-sm text-muted-foreground">
                  Desabilita acesso público ao site
                </p>
              </div>
              <Switch
                checked={settings.maintenanceMode}
                onCheckedChange={(checked) => 
                  setSettings({...settings, maintenanceMode: checked})
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Registro de Usuários</Label>
                <p className="text-sm text-muted-foreground">
                  Permite novos cadastros
                </p>
              </div>
              <Switch
                checked={settings.registrationEnabled}
                onCheckedChange={(checked) => 
                  setSettings({...settings, registrationEnabled: checked})
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Segurança
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="sessionTimeout">Timeout da Sessão (horas)</Label>
              <Input
                id="sessionTimeout"
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => setSettings({...settings, sessionTimeout: e.target.value})}
              />
            </div>
            
            <div>
              <Label htmlFor="maxFileSize">Tamanho Máximo de Arquivo (MB)</Label>
              <Input
                id="maxFileSize"
                type="number"
                value={settings.maxFileSize}
                onChange={(e) => setSettings({...settings, maxFileSize: e.target.value})}
              />
            </div>

            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Analytics Habilitado</Label>
                <p className="text-sm text-muted-foreground">
                  Coleta dados de uso
                </p>
              </div>
              <Switch
                checked={settings.analyticsEnabled}
                onCheckedChange={(checked) => 
                  setSettings({...settings, analyticsEnabled: checked})
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Email Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="w-5 h-5 mr-2" />
              Configurações de Email
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Notificações por Email</Label>
                <p className="text-sm text-muted-foreground">
                  Envia emails automáticos
                </p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => 
                  setSettings({...settings, emailNotifications: checked})
                }
              />
            </div>

            <div className="bg-muted/30 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Configurações SMTP podem ser ajustadas através das variáveis de ambiente do Supabase.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Backup Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="w-5 h-5 mr-2" />
              Backup e Dados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="backupFrequency">Frequência de Backup</Label>
              <select
                id="backupFrequency"
                value={settings.backupFrequency}
                onChange={(e) => setSettings({...settings, backupFrequency: e.target.value})}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
              >
                <option value="hourly">A cada hora</option>
                <option value="daily">Diariamente</option>
                <option value="weekly">Semanalmente</option>
                <option value="monthly">Mensalmente</option>
              </select>
            </div>

            <Button onClick={handleBackupNow} variant="outline" className="w-full">
              <Database className="w-4 h-4 mr-2" />
              Fazer Backup Agora
            </Button>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-900/50">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Importante
                  </p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    Backups automáticos são gerenciados pelo Supabase. Use o backup manual apenas quando necessário.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Alterações serão aplicadas imediatamente após salvar
            </p>
            <Button onClick={handleSaveSettings}>
              <Save className="w-4 h-4 mr-2" />
              Salvar Configurações
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettings;