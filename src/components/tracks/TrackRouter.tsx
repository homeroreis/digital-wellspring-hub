import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { PersonalizationService } from '@/services/personalizationEngine';
import DayViewManager from './DayViewManager';
import LiberdadeOnboarding from './liberdade/LiberdadeOnboarding';
import EquilibrioOnboarding from './equilibrio/EquilibrioOnboarding';
import RenovacaoOnboarding from './renovacao/RenovacaoOnboarding';
import { Loader2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface TrackRouterProps {
  userId: string;
  trackSlug: string;
  userScore: number;
}

const TrackRouter: React.FC<TrackRouterProps> = ({ userId, trackSlug, userScore }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [currentDay, setCurrentDay] = useState(1);

  useEffect(() => {
    checkOnboardingStatus();
  }, [userId, trackSlug]);

  const checkOnboardingStatus = async () => {
    try {
      setLoading(true);
      setError(null);

      // Carrega o perfil completo do usuário
      const profile = await PersonalizationService.loadUserProfile(userId);
      
      if (!profile) {
        // Se não tem perfil, precisa criar um primeiro
        setError('Perfil não encontrado. Redirecionando para o teste...');
        setTimeout(() => navigate('/test'), 2000);
        return;
      }

      setUserProfile(profile);
      setCurrentDay(profile.progressData.currentDay || 1);

      // Verifica se já fez onboarding
      const { data: preferences, error: prefError } = await supabase
        .from('user_preferences')
        .select('onboarding_completed')
        .eq('user_id', userId)
        .eq('track_slug', trackSlug)
        .single();

      if (prefError && prefError.code !== 'PGRST116') {
        throw prefError;
      }

      setHasCompletedOnboarding(preferences?.onboarding_completed || false);

      // Se não completou onboarding, inicializa a trilha personalizada
      if (!preferences?.onboarding_completed) {
        // Gera conteúdo personalizado para os primeiros dias
        await PersonalizationService.getPersonalizedDay(userId, 1);
      }
    } catch (error: any) {
      console.error('Erro ao verificar status do onboarding:', error);
      setError('Erro ao carregar sua trilha. Por favor, tente novamente.');
      toast({
        title: "Erro ao carregar trilha",
        description: error.message || "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOnboardingComplete = async () => {
    try {
      // Marca onboarding como completo
      await supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          track_slug: trackSlug,
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString()
        });

      // Inicializa progresso da trilha
      await supabase
        .from('user_track_progress')
        .upsert({
          user_id: userId,
          track_slug: trackSlug,
          current_day: 1,
          level_number: 1,
          total_points: 0,
          streak_days: 0,
          is_active: true
        });

      // Gera conteúdo personalizado para a trilha completa
      for (let day = 1; day <= 3; day++) {
        await PersonalizationService.getPersonalizedDay(userId, day);
      }

      setHasCompletedOnboarding(true);
      
      toast({
        title: "Onboarding concluído!",
        description: "Sua jornada personalizada está pronta!",
      });
    } catch (error: any) {
      console.error('Erro ao completar onboarding:', error);
      toast({
        title: "Erro",
        description: "Não foi possível completar o onboarding",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg font-medium">Preparando sua experiência personalizada...</p>
          <p className="text-muted-foreground mt-2">Analisando seu perfil e criando conteúdo exclusivo</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Se não completou onboarding, mostra o componente apropriado
  if (!hasCompletedOnboarding) {
    switch (trackSlug) {
      case 'liberdade':
        return <LiberdadeOnboarding userId={userId} onComplete={handleOnboardingComplete} />;
      case 'equilibrio':
        return <EquilibrioOnboarding userId={userId} onComplete={handleOnboardingComplete} />;
      case 'renovacao':
        return <RenovacaoOnboarding userId={userId} onComplete={handleOnboardingComplete} />;
      default:
        return (
          <div className="min-h-[80vh] flex items-center justify-center">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Trilha não encontrada. Redirecionando...
              </AlertDescription>
            </Alert>
          </div>
        );
    }
  }

  // Se completou onboarding, mostra a trilha personalizada
  return (
    <DayViewManager 
      userId={userId}
      trackSlug={trackSlug}
      userScore={userScore}
      userProfile={userProfile}
      currentDay={currentDay}
    />
  );
};

export default TrackRouter;