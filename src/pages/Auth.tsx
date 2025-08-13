import Navbar from "@/components/Navbar";
import { Helmet } from "react-helmet-async";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLocation, useNavigate } from "react-router-dom";

const Auth = () => {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // If already logged in, redirect
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        const redirectTo = (location.state as any)?.redirectTo || "/";
        navigate(redirectTo, { replace: true });
      }
    });
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
          options: { emailRedirectTo: redirectUrl },
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

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>{title} — Além das Notificações</title>
        <meta name="description" content="Acesse sua conta para realizar o teste e salvar seus resultados." />
        <link rel="canonical" href={window.location.origin + "/auth"} />
      </Helmet>
      <Navbar />

      <main className="flex-1 py-12">
        <section className="max-w-md mx-auto px-4">
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="text-center">{title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center gap-4 mb-6">
                <Button variant={mode === "login" ? "default" : "outline"} onClick={() => setMode("login")}>Entrar</Button>
                <Button variant={mode === "signup" ? "default" : "outline"} onClick={() => setMode("signup")}>Criar conta</Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Processando..." : title}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm text-muted-foreground">
                <p>Ao continuar, você concorda com nossos termos de uso e política de privacidade.</p>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
};

export default Auth;
