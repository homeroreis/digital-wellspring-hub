import { useState } from "react";
import { Shield, Mail, Bell, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AccountSettingsSectionProps {
  user: any;
}

const AccountSettingsSection = ({ user }: AccountSettingsSectionProps) => {
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const { toast } = useToast();

  const handlePasswordReset = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast({
        title: "Senha alterada",
        description: "Sua senha foi alterada com sucesso.",
      });

      setNewPassword("");
      setConfirmPassword("");
      setShowResetPassword(false);
    } catch (error: any) {
      toast({
        title: "Erro ao alterar senha",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/auth`,
      });

      if (error) throw error;

      toast({
        title: "E-mail enviado",
        description: "Enviamos um link para redefinir sua senha.",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Configurações da Conta</h2>
        <p className="text-muted-foreground">
          Gerencie sua segurança e preferências
        </p>
      </div>

      <div className="grid gap-6">
        {/* Account Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Informações da Conta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>E-mail</Label>
              <p className="py-2 px-3 bg-muted/50 rounded-md text-muted-foreground">
                {user?.email}
              </p>
            </div>
            <div>
              <Label>Data de criação</Label>
              <p className="py-2 px-3 bg-muted rounded-md">
                {new Date(user?.created_at).toLocaleDateString("pt-BR")}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Password Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Segurança
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!showResetPassword ? (
              <div className="flex gap-3">
                <Button 
                  onClick={() => setShowResetPassword(true)}
                  variant="outline"
                >
                  Alterar Senha
                </Button>
                <Button 
                  onClick={handleForgotPassword}
                  variant="outline"
                  disabled={loading}
                >
                  {loading ? "Enviando..." : "Esqueci minha senha"}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="new_password">Nova senha</Label>
                  <div className="relative">
                    <Input
                      id="new_password"
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Digite sua nova senha"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="confirm_password">Confirmar nova senha</Label>
                  <Input
                    id="confirm_password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Digite novamente sua nova senha"
                  />
                </div>
                <div className="flex gap-3">
                  <Button onClick={handlePasswordReset} disabled={loading}>
                    {loading ? "Alterando..." : "Alterar Senha"}
                  </Button>
                  <Button 
                    onClick={() => {
                      setShowResetPassword(false);
                      setNewPassword("");
                      setConfirmPassword("");
                    }}
                    variant="outline"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notificações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>E-mail de lembrete</Label>
                <p className="text-sm text-muted-foreground">
                  Receber lembretes sobre suas atividades
                </p>
              </div>
              <Switch
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Novidades e atualizações</Label>
                <p className="text-sm text-muted-foreground">
                  Receber informações sobre novos recursos
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AccountSettingsSection;