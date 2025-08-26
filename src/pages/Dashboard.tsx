import { TracksPanel } from "@/components/TracksPanel";
import Navbar from "@/components/Navbar";
import { Helmet } from "react-helmet-async";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { programTracks } from "@/data/programs";

const Dashboard = () => {
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          
          {!selectedTrack ? (
            <div className="space-y-6">
              <p className="text-muted-foreground">Selecione uma trilha para começar sua jornada de transformação:</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {programTracks.map((track) => (
                  <Card key={track.slug} className="cursor-pointer hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle>{track.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        {track.description}
                      </p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {track.level}
                        </span>
                      </div>
                      <Button 
                        className="w-full" 
                        onClick={() => setSelectedTrack(track.slug)}
                      >
                        Começar Trilha
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Button 
                variant="outline" 
                onClick={() => setSelectedTrack(null)}
                className="mb-4"
              >
                ← Voltar às Trilhas
              </Button>
              
              <TracksPanel 
                trackSlug={selectedTrack} 
                trackTitle={programTracks.find(t => t.slug === selectedTrack)?.title || selectedTrack}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
