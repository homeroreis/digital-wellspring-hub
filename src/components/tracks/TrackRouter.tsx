import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import LiberdadeOnboarding from './liberdade/LiberdadeOnboarding';
import LiberdadeDayView from './liberdade/LiberdadeDayView';
import EquilibrioOnboarding from './equilibrio/EquilibrioOnboarding';
import RenovacaoOnboarding from './renovacao/RenovacaoOnboarding';
import { Loader2 } from 'lucide-react';

interface TrackRouterProps {
  userId: string;
  trackSlug: string;
  userScore?: number;
}

const TrackRouter: React.FC<TrackRouterProps> = ({ userId, trackSlug, userScore = 0 }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [currentDay, setCurrentDay] = useState(1);

  const dayParam = searchParams.get('day');

  useEffect(() => {
    checkOnboardingStatus();
  }, [userId, trackSlug]);

  const checkOnboardingStatus = async () => {
    try {
      // Check if onboarding is completed
      const { data: preferences } = await supabase
        .from('user_preferences')
        .select('onboarding_completed')
        .eq('user_id', userId)
        .eq('track_slug', trackSlug)
        .single();

      if (preferences?.onboarding_completed) {
        setOnboardingCompleted(true);
        
        // Get current day from track progress
        const { data: progress } = await supabase
          .from('user_track_progress')
          .select('current_day')
          .eq('user_id', userId)
          .eq('track_slug', trackSlug)
          .eq('is_active', true)
          .single();

        if (progress) {
          const targetDay = dayParam ? parseInt(dayParam) : progress.current_day;
          setCurrentDay(Math.max(1, Math.min(targetDay, getMaxDays(trackSlug))));
        }
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMaxDays = (slug: string) => {
    switch (slug) {
      case 'liberdade': return 7;
      case 'equilibrio': return 21;
      case 'renovacao': return 40;
      default: return 7;
    }
  };

  const handleOnboardingComplete = () => {
    setOnboardingCompleted(true);
    setCurrentDay(1);
  };

  const handleDayNavigation = (day: number) => {
    const maxDays = getMaxDays(trackSlug);
    const targetDay = Math.max(1, Math.min(day, maxDays));
    setCurrentDay(targetDay);
    setSearchParams({ day: targetDay.toString() });
  };

  const handleTrackComplete = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Carregando sua trilha...</p>
        </div>
      </div>
    );
  }

  // Show onboarding if not completed
  if (!onboardingCompleted) {
    if (trackSlug === 'liberdade') {
      return (
        <LiberdadeOnboarding
          userId={userId}
          userScore={userScore}
          onComplete={handleOnboardingComplete}
        />
      );
    }
    
    if (trackSlug === 'equilibrio') {
      return (
        <EquilibrioOnboarding
          userId={userId}
          onComplete={handleOnboardingComplete}
        />
      );
    }
    
    if (trackSlug === 'renovacao') {
      return (
        <RenovacaoOnboarding
          userId={userId}
          onComplete={handleOnboardingComplete}
        />
      );
    }
    
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Onboarding para {trackSlug} não encontrado.</p>
      </div>
    );
  }

  // Show track content after onboarding
  if (trackSlug === 'liberdade') {
    return (
      <LiberdadeDayView
        userId={userId}
        dayNumber={currentDay}
        onNavigate={handleDayNavigation}
        onComplete={handleTrackComplete}
      />
    );
  }

  if (trackSlug === 'equilibrio') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Trilha Equilíbrio - Dia {currentDay}</h2>
          <p className="text-gray-600">Visualização do dia em desenvolvimento...</p>
        </div>
      </div>
    );
  }

  if (trackSlug === 'renovacao') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-red-600">Trilha Renovação - Dia {currentDay}</h2>
          <p className="text-gray-600">Jornada intensiva em desenvolvimento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Trilha {trackSlug} não encontrada.</p>
    </div>
  );
};

export default TrackRouter;