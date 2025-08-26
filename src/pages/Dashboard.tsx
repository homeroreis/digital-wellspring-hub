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
  const [recommendedTrack, setRecommendedTrack] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthAndLoadTrack = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth", { replace: true, state: { redirectTo: "/dashboard" } });
        return;
      }

      // Fetch user's latest questionnaire result to determine recommended track
      try {
        // Try to get full questionnaire result first
        const { data: fullTest, error: fullTestError } = await supabase
          .from('questionnaire_results')
          .select('track_type, total_score')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (fullTestError && fullTestError.code !== 'PGRST116') {
          console.error('Error fetching questionnaire results:', fullTestError);
        }

        if (fullTest) {
          setRecommendedTrack(fullTest.track_type);
        } else {
          // Try to get quick test result
          const { data: quickTest, error: quickTestError } = await supabase
            .from('quick_test_results')
            .select('recommended_track, total_score')
            .eq('user_id', session.user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (quickTestError && quickTestError.code !== 'PGRST116') {
            console.error('Error fetching quick test results:', quickTestError);
          }

          if (quickTest) {
            setRecommendedTrack(quickTest.recommended_track);
          } else {
            // No test completed yet, redirect to test
            navigate('/test', { replace: true });
            return;
          }
        }
      } catch (error) {
        console.error('Error loading recommended track:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndLoadTrack();
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
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Carregando sua trilha personalizada...</p>
              </div>
            </div>
          ) : recommendedTrack ? (
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-3xl font-bold mb-4">
                  Sua Trilha Personalizada
                </h1>
                <p className="text-muted-foreground">
                  Baseada no seu resultado do questionário
                </p>
              </div>
              <TracksPanel 
                trackSlug={recommendedTrack} 
                trackTitle={programTracks.find(t => t.slug === recommendedTrack)?.title || recommendedTrack}
                maxDays={programTracks.find(t => t.slug === recommendedTrack)?.durationDays || 21}
              />
            </div>
          ) : (
            <div className="text-center space-y-6">
              <h1 className="text-3xl font-bold mb-4">
                Complete o Questionário
              </h1>
              <p className="text-muted-foreground mb-8">
                Responda ao questionário para receber sua trilha personalizada
              </p>
              <Button onClick={() => navigate('/test')}>
                Fazer Questionário
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
