import Navbar from "@/components/Navbar";
import { Helmet } from "react-helmet-async";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Gamification = () => {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate("/auth", { replace: true, state: { redirectTo: "/gamification" } });
    });
  }, [navigate]);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Gamificação',
    description: 'Pontos, insígnias e ranking para motivar seu progresso.'
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>Gamificação — Pontos e Insígnias</title>
        <meta name="description" content="Veja seus pontos, insígnias conquistadas e ranking." />
        <link rel="canonical" href={window.location.origin + "/gamification"} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <Navbar />

      <main className="flex-1 py-10">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h1 className="text-3xl font-bold">Gamificação</h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Pontos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Total acumulado e metas semanais.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Insígnias</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Conquistas desbloqueadas e próximas insígnias.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ranking</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Sua posição no ranking da comunidade.</p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Gamification;
