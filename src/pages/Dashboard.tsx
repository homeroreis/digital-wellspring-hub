import Navbar from "@/components/Navbar";
import { Helmet } from "react-helmet-async";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Dashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate("/auth", { replace: true, state: { redirectTo: "/dashboard" } });
    });
  }, [navigate]);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    name: 'Painel da Trilha',
    description: 'Acompanhe seu progresso, próximas ações e conteúdo da trilha.'
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>Painel da Trilha — Progresso e Ações</title>
        <meta name="description" content="Acompanhe seu progresso na trilha e veja suas próximas ações." />
        <link rel="canonical" href={window.location.origin + "/dashboard"} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <Navbar />

      <main className="flex-1 py-10">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h1 className="text-3xl font-bold">Painel da Trilha</h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Progresso</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Resumo do seu avanço na trilha selecionada.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Próximas ações</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Tarefas do dia e hábitos sugeridos.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Minha trilha</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Detalhes da trilha atual e acesso aos módulos.</p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
