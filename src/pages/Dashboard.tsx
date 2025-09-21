import React, { useState, useEffect } from 'react';
import { TracksPanel } from "@/components/TracksPanel";
import Navbar from "@/components/Navbar";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const Dashboard = () => {
  const [recommendedTrack, setRecommendedTrack] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  const checkAuthAndLoadData = async () => {
    try {
      // Verificar sessão
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth", { replace: true });
        return;
      }

      // Carregar perfil do usuário
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .maybeSingle();

      console.log('=== DASHBOARD LOAD PROFILE ===');
      console.log('User ID:', session.user.id);
      console.log('Profile carregado:', profile);
      console.log('Profile error:', profileError);

      if (profileError) {
        console.error('Erro ao carregar profile:', profileError);
      }

      setUserProfile(profile);

      // Buscar resultado do questionário
      const { data: result } = await supabase
        .from('questionnaire_results')
        .select('*')
        .eq('user_id', session.user.id)
        .order('completed_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (result) {
        setRecommendedTrack(result.track_type);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            Olá, {userProfile?.full_name || 'Usuário'}!
          </h1>
          <p className="text-muted-foreground">
            {recommendedTrack 
              ? 'Continue sua jornada de transformação digital'
              : 'Complete o questionário para receber sua trilha personalizada'}
          </p>
        </div>

        {recommendedTrack ? (
          <TracksPanel 
            trackSlug={recommendedTrack}
            trackTitle={
              recommendedTrack === 'liberdade' ? 'Trilha Liberdade (7 dias)' :
              recommendedTrack === 'equilibrio' ? 'Trilha Equilíbrio (21 dias)' :
              'Trilha Renovação (40 dias)'
            }
            maxDays={
              recommendedTrack === 'liberdade' ? 7 :
              recommendedTrack === 'equilibrio' ? 21 : 40
            }
          />
        ) : (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Comece Sua Jornada</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Para receber sua trilha personalizada, complete nosso questionário de avaliação.</p>
              <Button onClick={() => navigate('/test')} size="lg" className="w-full">
                Iniciar Questionário
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Dashboard;