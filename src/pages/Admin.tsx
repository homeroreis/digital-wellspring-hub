import Navbar from "@/components/Navbar";
import { Helmet } from "react-helmet-async";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Admin = () => {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate("/auth", { replace: true, state: { redirectTo: "/admin" } });
    });
  }, [navigate]);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Painel Admin',
    description: 'Gerencie usuários, trilhas e conteúdo (acesso restrito).'
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>Admin — Gestão do Sistema</title>
        <meta name="description" content="Painel administrativo para gestão de usuários, trilhas e conteúdo." />
        <link rel="canonical" href={window.location.origin + "/admin"} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <Navbar />

      <main className="flex-1 py-10">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h1 className="text-3xl font-bold">Painel Admin</h1>

          <Card>
            <CardHeader>
              <CardTitle>Acesso restrito</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Em breve: validação de papéis (admin) via Supabase. Por enquanto, esta página é um esqueleto
                de navegação. Confirme as regras de papéis para habilitarmos o acesso.
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Usuários</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Listagem, busca e bloqueio.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Trilhas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">CRUD de trilhas e módulos.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Conteúdo</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Artigos, FAQs e materiais de apoio.</p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Admin;
