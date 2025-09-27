import React, { useState, useEffect } from 'react';
import Navbar from "@/components/Navbar";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, Trophy, Star, Flame, TrendingUp, Target } from "lucide-react";
import EnhancedGamificationPanel from "@/components/tracks/EnhancedGamificationPanel";
import TestHistoryPanel from "@/components/TestHistoryPanel";

interface GamificationStats {
  totalPoints: number;
  currentLevel: number;
  pointsToNextLevel: number;
  daysStreak: number;
  activitiesCompleted: number;
  tracksCompleted: number;
  recentAchievements: any[];
}

const Dashboard = () => {
  const [recommendedTrack, setRecommendedTrack] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userName, setUserName] = useState<string>('');
  const [activeTab, setActiveTab] = useState('trilhas');
  const [gamificationStats, setGamificationStats] = useState<GamificationStats | null>(null);
  const [session, setSession] = useState<any>(null);
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

      setSession(session);

      // Usar a função RPC para buscar dados consolidados
      const { data: userDisplayData, error: rpcError } = await supabase
        .rpc('get_user_display_data', { user_uuid: session.user.id })
        .single();

      if (!rpcError && userDisplayData && userDisplayData.full_name) {
        setUserName(userDisplayData.full_name);
        setUserProfile(userDisplayData);
      } else {
        // Fallback: usar email
        const emailName = session.user.email?.split('@')[0] || 'Usuário';
        setUserName(emailName);
        setUserProfile({ email: session.user.email });
      }

      // Buscar resultado do questionário para trilha recomendada
      const { data: result } = await supabase
        .from('questionnaire_results')
        .select('track_type, total_score, created_at')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (result && result.track_type) {
        setRecommendedTrack(result.track_type);
      }

      // Carregar estatísticas de gamificação
      await loadGamificationStats(session.user.id);

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadGamificationStats = async (userId: string) => {
    try {
      const { data, error } = await supabase.rpc('calculate_user_gamification_stats', {
        user_uuid: userId
      });

      if (!error && data && data.length > 0) {
        const stats = data[0];
        setGamificationStats({
          totalPoints: stats.total_points || 0,
          currentLevel: stats.current_level || 1,
          pointsToNextLevel: stats.points_to_next_level || 100,
          daysStreak: stats.days_streak || 0,
          activitiesCompleted: stats.activities_completed || 0,
          tracksCompleted: stats.tracks_completed || 0,
          recentAchievements: []
        });
      } else {
        setGamificationStats({
          totalPoints: 0,
          currentLevel: 1,
          pointsToNextLevel: 100,
          daysStreak: 0,
          activitiesCompleted: 0,
          tracksCompleted: 0,
          recentAchievements: []
        });
      }
    } catch (error) {
      console.error('Erro ao carregar gamificação:', error);
      setGamificationStats({
        totalPoints: 0,
        currentLevel: 1,
        pointsToNextLevel: 100,
        daysStreak: 0,
        activitiesCompleted: 0,
        tracksCompleted: 0,
        recentAchievements: []
      });
    }
  };

  const getLevelTitle = (level: number) => {
    if (level < 5) return 'Iniciante Digital';
    if (level < 10) return 'Explorador Consciente';
    if (level < 20) return 'Guardião do Tempo';
    if (level < 30) return 'Mentor da Liberdade';
    return 'Mestre da Renovação';
  };

  const getTrackTitle = (trackSlug: string) => {
    switch(trackSlug) {
      case 'liberdade': return 'Trilha Liberdade (7 dias)';
      case 'equilibrio': return 'Trilha Equilíbrio (21 dias)';
      case 'renovacao': return 'Trilha Renovação (40 dias)';
      default: return 'Trilha Personalizada';
    }
  };

  const getTrackDescription = (trackSlug: string) => {
    switch(trackSlug) {
      case 'liberdade': return 'Foque na desintoxicação digital e recupere sua liberdade';
      case 'equilibrio': return 'Encontre o equilíbrio saudável com a tecnologia';
      case 'renovacao': return 'Transforme completamente sua relação com o digital';
      default: return 'Sua jornada personalizada de transformação digital';
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                Olá, {userName}!
              </h1>
              <p className="text-muted-foreground">
                {recommendedTrack 
                  ? 'Continue sua jornada de transformação digital'
                  : 'Complete o teste para receber sua trilha personalizada'}
              </p>
            </div>
            
            {/* Quick Gamification Stats */}
            {gamificationStats && (
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-full mb-1">
                    <Trophy className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="text-sm font-medium">Nível {gamificationStats.currentLevel}</div>
                  <div className="text-xs text-gray-600">{getLevelTitle(gamificationStats.currentLevel)}</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-1">
                    <Star className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="text-sm font-medium">{gamificationStats.totalPoints}</div>
                  <div className="text-xs text-gray-600">Pontos</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full mb-1">
                    <Flame className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="text-sm font-medium">{gamificationStats.daysStreak}</div>
                  <div className="text-xs text-gray-600">Dias</div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate('/gamification')}
                >
                  Ver Completo
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('trilhas')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'trilhas'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                🎯 Minhas Trilhas
              </button>
              <button
                onClick={() => setActiveTab('gamification')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'gamification'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                🏆 Gamificação
              </button>
              <button
                onClick={() => setActiveTab('historico')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'historico'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📊 Histórico de Testes
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'trilhas' && (
          <div>
            {recommendedTrack ? (
              <div className="max-w-4xl mx-auto">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-6 h-6 text-primary" />
                      {getTrackTitle(recommendedTrack)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="text-center space-y-4">
                      <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-6">
                        <h3 className="text-lg font-semibold mb-2">Sua Trilha Personalizada</h3>
                        <p className="text-muted-foreground">
                          {getTrackDescription(recommendedTrack)}
                        </p>
                      </div>
                      
                      <div className="space-y-3">
                        <Button 
                          onClick={() => navigate(`/track/${recommendedTrack}`)} 
                          size="lg"
                          className="w-full"
                        >
                          <TrendingUp className="w-4 h-4 mr-2" />
                          Continuar Trilha
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="max-w-2xl mx-auto">
                <CardHeader>
                  <CardTitle>Comece Sua Jornada</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>Para receber sua trilha personalizada, complete nosso teste de dependência digital.</p>
                  <Button onClick={() => navigate('/test')} size="lg" className="w-full">
                    Iniciar Teste
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'gamification' && session && (
          <div className="max-w-4xl mx-auto">
            <EnhancedGamificationPanel 
              userId={session.user.id}
              className="mb-6"
            />
          </div>
        )}

        {activeTab === 'historico' && (
          <div className="max-w-6xl mx-auto">
            <TestHistoryPanel />
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;