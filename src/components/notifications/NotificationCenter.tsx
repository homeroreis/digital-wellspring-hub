import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Bell, BellOff, TestTube } from 'lucide-react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { toast } from '@/hooks/use-toast';

export const NotificationCenter: React.FC = () => {
  const {
    isSupported,
    isSubscribed,
    settings,
    subscribe,
    unsubscribe,
    updateSettings,
    sendTestNotification
  } = usePushNotifications();

  const handleSubscribe = async () => {
    const success = await subscribe();
    if (success) {
      toast({
        title: "Notificações Ativadas",
        description: "Você receberá lembretes sobre suas trilhas espirituais.",
      });
    } else {
      toast({
        title: "Erro",
        description: "Não foi possível ativar as notificações. Verifique as permissões do navegador.",
        variant: "destructive"
      });
    }
  };

  const handleUnsubscribe = async () => {
    await unsubscribe();
    toast({
      title: "Notificações Desativadas",
      description: "Você não receberá mais notificações push.",
    });
  };

  const handleTest = () => {
    sendTestNotification();
    toast({
      title: "Notificação de Teste Enviada",
      description: "Verifique se a notificação apareceu.",
    });
  };

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="h-5 w-5" />
            Notificações Não Suportadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Seu navegador não suporta notificações push. Para uma experiência completa, 
            recomendamos usar um navegador moderno como Chrome, Firefox ou Safari.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Subscription Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Central de Notificações
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Notificações Push</h4>
              <p className="text-sm text-muted-foreground">
                Receba lembretes diários e alertas de progresso
              </p>
            </div>
            <div className="flex gap-2">
              {!isSubscribed ? (
                <Button onClick={handleSubscribe}>
                  Ativar Notificações
                </Button>
              ) : (
                <Button variant="outline" onClick={handleUnsubscribe}>
                  Desativar
                </Button>
              )}
            </div>
          </div>
          
          {isSubscribed && (
            <Button variant="outline" size="sm" onClick={handleTest}>
              <TestTube className="h-4 w-4 mr-2" />
              Testar Notificação
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Notification Settings */}
      {isSubscribed && (
        <Card>
          <CardHeader>
            <CardTitle>Preferências de Notificação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="daily-reminder">Lembrete Diário</Label>
                  <p className="text-sm text-muted-foreground">
                    Receba um lembrete para completar suas atividades diárias
                  </p>
                </div>
                <Switch
                  id="daily-reminder"
                  checked={settings.dailyReminder}
                  onCheckedChange={(checked) => 
                    updateSettings({ dailyReminder: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="achievement-alerts">Alertas de Conquista</Label>
                  <p className="text-sm text-muted-foreground">
                    Seja notificado quando desbloquear novas conquistas
                  </p>
                </div>
                <Switch
                  id="achievement-alerts"
                  checked={settings.achievementAlerts}
                  onCheckedChange={(checked) => 
                    updateSettings({ achievementAlerts: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="weekly-progress">Relatório Semanal</Label>
                  <p className="text-sm text-muted-foreground">
                    Receba um resumo do seu progresso toda semana
                  </p>
                </div>
                <Switch
                  id="weekly-progress"
                  checked={settings.weeklyProgress}
                  onCheckedChange={(checked) => 
                    updateSettings({ weeklyProgress: checked })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tips for Better Experience */}
      <Card>
        <CardHeader>
          <CardTitle>Dicas para Melhor Experiência</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="font-medium">📱</span>
              <span>Adicione este app à tela inicial para acesso rápido</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-medium">⏰</span>
              <span>Configure um horário fixo para suas práticas espirituais</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-medium">🔔</span>
              <span>Mantenha as notificações ativadas para não perder o momentum</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-medium">🎯</span>
              <span>Defina metas realistas e celebre suas conquistas</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};