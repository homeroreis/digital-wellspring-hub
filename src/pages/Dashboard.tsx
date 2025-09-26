import React, { useState, useEffect } from 'react';
import Navbar from "@/components/Navbar";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, Trophy, Star, Flame, TrendingUp, Target } from "lucide-react";

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

      // Usar a função RPC para buscar dados consolidados
      const { data: userDisplayData, error: rpcError } = await supabase
        .rpc('get_user_display_data', { user_uuid: session.user.id })
        .single();

      if (!rpcError && userDisplayData && userDisplayData.full_name) {
        setUserName(userDisplayData.full_name);
        setUserProfile(userDisplayData);
      } else {
        // Fallback: Tentar múltiplas fontes de dados
        // 1. Buscar do questionário mais recente
        const { data: questionnaireData } = await supabase
          .from('questionnaire_results')
          .select('full_name, email, age, city, state, phone, gender, profession')
          .eq('user_id', session.user.id)
          .order('completed_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        if (questionnaireData && questionnaireData.full_name) {
          setUserName(questionnaireData.full_name);
          setUserProfile(questionnaireData);
          
          // Salvar no profile para próximas vezes
          await supabase
            .from('profiles')
            .upsert({
              user_id: session.user.id,
              full_name: questionnaireData.full_name,
              email: questionnaireData.email || session.user.email,
              phone: questionnaireData.phone,
              gender: questionnaireData.gender,
              city: questionnaireData.city,
              state: questionnaireData.state,
              profession: questionnaireData.profession
            }, {
              onConflict: 'user_id'
            });
        } else {
          // 2. Buscar da tabela profiles
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .maybeSingle();
          
          if (profileData && profileData.full_name) {
            setUserName(profileData.full_name);
            setUserProfile(profileData);
          } else {
            // 3. Usar email como fallback
            const emailName = session.user.email?.split('@')[0] || 'Usuário';
            setUserName(emailName);
            setUserProfile({ email: session.user.email });
          }
        }
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
        // Verificar se já completou onboarding para esta trilha
        const { data: preferences } = await supabase
          .from('user_preferences')
          .select('onboarding_completed')
          .eq('user_id', session.user.id)
          .eq('track_slug', result.track_type)
          .maybeSingle();
        
        // Se não completou onboarding, sugerir mas não forçar redirecionamento
        if (!preferences?.onboarding_completed) {
          console.log('Onboarding não completado, mas permitindo acesso ao dashboard');
          // Não redireciona automaticamente, deixa o usuário escolher
        }
        
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
      // Tentar calcular estatísticas de gamificação
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
        // Fallback com dados padrão
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
      // Dados padrão em caso de erro
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

        {/* Gamification Progress Bar */}
        {gamificationStats && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Progresso do Nível</span>
                <Badge variant="secondary">
                  Nível {gamificationStats.currentLevel} → {gamificationStats.currentLevel + 1}
                </Badge>
              </div>
              <Progress 
                value={((gamificationStats.totalPoints % 100))} 
                className="h-2 mb-1"
              />
              <div className="flex justify-between text-xs text-gray-600">
                <span>{gamificationStats.totalPoints % 100} pontos</span>
                <span>{gamificationStats.pointsToNextLevel} para o próximo nível</span>
              </div>
            </CardContent>
          </Card>
        )}

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
                      
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">
                            {recommendedTrack === 'liberdade' ? '7' :
                             recommendedTrack === 'equilibrio' ? '21' : '40'}
                          </div>
                          <div className="text-sm text-blue-600">Dias</div>
                        </div>
                        <div className="p-4 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">15-30</div>
                          <div className="text-sm text-green-600">Min/dia</div>
                        </div>
                        <div className="p-4 bg-purple-50 rounded-lg">
                          <div className="text-2xl font-bold text-purple-600">100%</div>
                          <div className="text-sm text-purple-600">Personalizada</div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <Button 
                          onClick={() => navigate(`/onboarding?track=${recommendedTrack}`)} 
                          size="lg"
                          className="w-full"
                        >
                          <TrendingUp className="w-4 h-4 mr-2" />
                          Configurar e Iniciar Trilha
                        </Button>
                        <div className="text-center">
                          <Button 
                            onClick={() => navigate(`/track/${recommendedTrack}`)} 
                            variant="outline"
                            size="sm"
                          >
                            Pular configuração e ir direto
                          </Button>
                        </div>
                      </div>
                      
                      <p className="text-xs text-muted-foreground">
                        * Conteúdo baseado no seu resultado do teste e preferências pessoais
                      </p>
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

        {activeTab === 'gamification' && gamificationStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Stats Cards */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Nível Atual</p>
                    <p className="text-2xl font-bold text-primary">{gamificationStats.currentLevel}</p>
                    <p className="text-xs text-muted-foreground">{getLevelTitle(gamificationStats.currentLevel)}</p>
                  </div>
                  <Trophy className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pontos Totais</p>
                    <p className="text-2xl font-bold text-green-600">{gamificationStats.totalPoints}</p>
                    <p className="text-xs text-muted-foreground">
                      {gamificationStats.pointsToNextLevel} para próximo nível
                    </p>
                  </div>
                  <Star className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Sequência</p>
                    <p className="text-2xl font-bold text-orange-600">{gamificationStats.daysStreak}</p>
                    <p className="text-xs text-muted-foreground">dias consecutivos</p>
                  </div>
                  <Flame className="w-8 h-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Atividades</p>
                    <p className="text-2xl font-bold text-blue-600">{gamificationStats.activitiesCompleted}</p>
                    <p className="text-xs text-muted-foreground">completadas</p>
                  </div>
                  <Target className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            {/* Full Gamification Link */}
            <div className="col-span-full">
              <Card>
                <CardContent className="p-6 text-center">
                  <h3 className="text-lg font-semibold mb-2">Sistema Completo de Gamificação</h3>
                  <p className="text-gray-600 mb-4">
                    Veja todas suas conquistas, rankings e progresso detalhado
                  </p>
                  <Button onClick={() => navigate('/gamification')}>
                    Ver Sistema Completo
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;