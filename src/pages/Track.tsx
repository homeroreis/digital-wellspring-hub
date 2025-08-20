import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import TrackRouter from '@/components/tracks/TrackRouter';
import { Loader2 } from 'lucide-react';

const Track = () => {
  const { trackSlug } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [userScore, setUserScore] = useState(0);

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/auth', { replace: true, state: { redirectTo: `/track/${trackSlug}` } });
        return;
      }

      setUser(session.user);

      // Get user's latest questionnaire score
      const { data: result } = await supabase
        .from('questionnaire_results')
        .select('total_score')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (result) {
        setUserScore(result.total_score);
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
      navigate('/auth', { replace: true });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Preparando sua trilha...</p>
        </div>
      </div>
    );
  }

  if (!user || !trackSlug) {
    return null;
  }

  const getTrackName = (slug: string) => {
    switch (slug) {
      case 'liberdade': return 'Trilha Liberdade';
      case 'equilibrio': return 'Trilha Equilíbrio';
      case 'renovacao': return 'Trilha Renovação';
      default: return 'Trilha';
    }
  };

  const getTrackDescription = (slug: string) => {
    switch (slug) {
      case 'liberdade': return 'Fortalecendo bons hábitos digitais em 7 dias';
      case 'equilibrio': return 'Redescobrindo o controle em 21 dias';
      case 'renovacao': return 'Transformação profunda em 40 dias';
      default: return 'Sua jornada de transformação digital';
    }
  };

  return (
    <>
      <Helmet>
        <title>{getTrackName(trackSlug)} — Além das Notificações</title>
        <meta name="description" content={getTrackDescription(trackSlug)} />
        <link rel="canonical" href={`${window.location.origin}/track/${trackSlug}`} />
      </Helmet>

      <TrackRouter 
        userId={user.id}
        trackSlug={trackSlug}
        userScore={userScore}
      />
    </>
  );
};

export default Track;