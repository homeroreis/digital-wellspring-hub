import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import LiberdadeOnboarding from '@/components/tracks/liberdade/LiberdadeOnboarding';
import EquilibrioOnboarding from '@/components/tracks/equilibrio/EquilibrioOnboarding';
import RenovacaoOnboarding from '@/components/tracks/renovacao/RenovacaoOnboarding';
import Navbar from '@/components/Navbar';
import { toast } from 'sonner';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const Onboarding = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [userScore, setUserScore] = useState(0);
  
  const trackSlug = searchParams.get('track') || 'equilibrio';

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
          toast.error('Você precisa estar logado para acessar o onboarding');
          navigate('/auth');
          return;
        }

        // Buscar resultado do teste do usuário para obter o score
        const { data: testResult } = await supabase
          .from('questionnaire_results')
          .select('total_score')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!testResult) {
          toast.error('Resultado do teste não encontrado. Redirecionando...');
          navigate('/test');
          return;
        }

        // Verificar se já completou o onboarding para esta trilha específica
        const { data: preferences } = await supabase
          .from('user_preferences' as any)
          .select('onboarding_completed')
          .eq('user_id', user.id)
          .eq('track_slug', trackSlug)
          .maybeSingle();

        if (preferences && (preferences as any).onboarding_completed) {
          toast.info('Onboarding já foi concluído, redirecionando para a trilha');
          navigate(`/track/${trackSlug}`);
          return;
        }

        setUser(user);
        setUserScore(testResult.total_score);
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        toast.error('Erro ao carregar página');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando onboarding...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleOnboardingComplete = () => {
    toast.success('Onboarding concluído com sucesso!');
    navigate(`/track/${trackSlug}`);
  };

  const getOnboardingComponent = () => {
    switch (trackSlug) {
      case 'liberdade':
        return <LiberdadeOnboarding userId={user.id} userScore={userScore} onComplete={handleOnboardingComplete} />;
      case 'equilibrio':
        return <EquilibrioOnboarding userId={user.id} userScore={userScore} onComplete={handleOnboardingComplete} />;
      case 'renovacao':
        return <RenovacaoOnboarding userId={user.id} userScore={userScore} onComplete={handleOnboardingComplete} />;
      default:
        return (
          <div className="min-h-[80vh] flex items-center justify-center">
            <Alert className="max-w-md">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Trilha não encontrada. Redirecionando...
              </AlertDescription>
            </Alert>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>Configuração Inicial - Além das Notificações</title>
        <meta name="description" content="Configure suas preferências e comece sua jornada de transformação digital" />
      </Helmet>
      
      <Navbar />
      
      <main className="flex-1">
        {getOnboardingComponent()}
      </main>
    </div>
  );
};

export default Onboarding;