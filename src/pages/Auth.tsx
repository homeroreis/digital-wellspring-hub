import Navbar from "@/components/Navbar";
import { Helmet } from "react-helmet-async";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Eye, EyeOff, CheckCircle, LogIn } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLocation, useNavigate } from "react-router-dom";
import InteractiveSignupForm from "@/components/auth/InteractiveSignupForm";

const Auth = () => {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Subscribe first, then get the session (prevents race conditions)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        const redirectTo = (location.state as any)?.redirectTo || "/";
        navigate(redirectTo, { replace: true });
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        const redirectTo = (location.state as any)?.redirectTo || "/";
        navigate(redirectTo, { replace: true });
      }
    });

    return () => { subscription.unsubscribe(); };
  }, [navigate, location.state]);

  const title = useMemo(() => (mode === "login" ? "Entrar" : "Criar conta"), [mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast({ title: "Bem-vindo(a)!", description: "Login realizado com sucesso." });
        const redirectTo = (location.state as any)?.redirectTo || "/";
        navigate(redirectTo, { replace: true });
      } else {
        const redirectUrl = `${window.location.origin}/`;
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: redirectUrl, data: { full_name: name, phone } },
        });
        if (error) throw error;
        toast({
          title: "Confirme seu e-mail",
          description: "Enviamos um link de confirmação para o seu e-mail.",
        });
      }
    } catch (err: any) {
      toast({
        title: "Ops",
        description: err?.message || "Não foi possível concluir a ação.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    try {
      console.log(`Tentando login com ${provider}...`);
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/profile-completion`
        }
      });
      
      if (error) {
        console.error(`Erro no login ${provider}:`, error);
        throw error;
      }
      
      console.log(`Login ${provider} iniciado:`, data);
    } catch (err: any) {
      console.error(`Erro capturado no login ${provider}:`, err);
      toast({
        title: "Erro no login social",
        description: err?.message || `Não foi possível fazer login com ${provider}. Verifique se o provedor está configurado no Supabase.`,
        variant: "destructive",
      });
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast({
        title: "E-mail necessário",
        description: "Digite seu e-mail para recuperar a senha.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth`,
      });

      if (error) throw error;

      toast({
        title: "E-mail enviado",
        description: "Enviamos um link para redefinir sua senha.",
      });
    } catch (err: any) {
      toast({
        title: "Erro",
        description: err?.message || "Não foi possível enviar o e-mail.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>{title} — Além das Notificações</title>
        <meta name="description" content="Acesse ou crie sua conta para realizar o teste e salvar seus resultados." />
        <link rel="canonical" href={window.location.origin + "/auth"} />
      </Helmet>
      <Navbar />

      <main className="flex-1 py-12">
        <section className="max-w-5xl mx-auto px-4 grid lg:grid-cols-2 gap-8 items-start">
          <article className="hidden lg:block self-stretch rounded-xl border bg-card p-8 shadow-soft">
            <h1 className="text-3xl font-bold mb-4">Entre para começar sua jornada</h1>
            <p className="text-muted-foreground mb-6">
              Faça login ou crie sua conta para acessar o teste, salvar seus resultados e receber uma trilha personalizada.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <CheckCircle className="text-primary size-5" />
                <span>Progresso salvo automaticamente</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="text-primary size-5" />
                <span>Resultados e recomendações personalizadas</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="text-primary size-5" />
                <span>Acesso a conteúdos exclusivos</span>
              </li>
            </ul>
          </article>

          <section aria-label="Formulário de autenticação">
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="text-center">{title}</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={mode} onValueChange={(v: "login" | "signup") => setMode(v)}>
                  <TabsList className="grid grid-cols-2 w-full mb-6">
                    <TabsTrigger value="login">Entrar</TabsTrigger>
                    <TabsTrigger value="signup">Criar conta</TabsTrigger>
                  </TabsList>

                  <TabsContent value="login">
                    {/* Social Login Buttons - Moved to top */}
                    <div className="space-y-4 mb-6">
                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleSocialLogin('google')}
                          className="w-full"
                        >
                          <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                          </svg>
                          Google
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleSocialLogin('facebook')}
                          className="w-full"
                        >
                          <svg className="w-4 h-4 mr-2" fill="#1877F2" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                          </svg>
                          Facebook
                        </Button>
                      </div>
                      
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-background px-2 text-muted-foreground">Ou use seu e-mail</span>
                        </div>
                      </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="login-email">E-mail</Label>
                        <Input
                          id="login-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          autoComplete="email"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="login-password">Senha</Label>
                        <div className="relative">
                          <Input
                            id="login-password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete="current-password"
                            className="pr-10"
                          />
                          <button
                            type="button"
                            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-foreground transition-smooth"
                            onClick={() => setShowPassword((s) => !s)}
                          >
                            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={handleForgotPassword}
                          className="text-sm text-primary hover:underline"
                        >
                          Esqueci minha senha
                        </button>
                      </div>

                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Processando..." : "Entrar"}
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="signup">
                    <InteractiveSignupForm />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </section>
        </section>
      </main>
    </div>
  );
};

export default Auth;
