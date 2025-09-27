import React from 'react';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import { AchievementSystem } from '@/components/gamification/AchievementSystem';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Trophy, Target, Calendar, Zap, Bell, BarChart3 } from 'lucide-react';
import { useUserStats } from '@/hooks/useGamification';

const Gamification = () => {
  const { data: userStats, isLoading } = useUserStats();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Gamificação — Digital Wellspring Hub',
    description: 'Sistema de conquistas, níveis e progresso para motivar sua jornada espiritual'
  };

  const calculateLevelProgress = (totalPoints: number) => {
    const pointsPerLevel = 100;
    const currentLevel = Math.floor(totalPoints / pointsPerLevel) + 1;
    const pointsInCurrentLevel = totalPoints % pointsPerLevel;
    const progressPercentage = (pointsInCurrentLevel / pointsPerLevel) * 100;
    
    return {
      currentLevel,
      pointsInCurrentLevel,
      pointsToNextLevel: pointsPerLevel - pointsInCurrentLevel,
      progressPercentage
    };
  };

  const levelInfo = userStats ? calculateLevelProgress(userStats.total_points) : null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>Gamificação — Digital Wellspring Hub</title>
        <meta name="description" content="Acompanhe seu progresso, conquiste objetivos e mantenha a motivação em sua jornada espiritual" />
        <link rel="canonical" href={window.location.origin + "/gamification"} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">Sistema de Gamificação</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Acompanhe seu progresso, conquiste objetivos e mantenha a motivação em sua jornada espiritual
            </p>
          </div>

          {/* User Level and Progress Overview */}
          {!isLoading && userStats && levelInfo && (
            <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {/* Level Info */}
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Trophy className="h-8 w-8 text-primary mr-2" />
                      <span className="text-3xl font-bold text-primary">
                        Nível {levelInfo.currentLevel}
                      </span>
                    </div>
                    <Progress value={levelInfo.progressPercentage} className="w-full h-3" />
                    <p className="text-sm text-muted-foreground mt-2">
                      {levelInfo.pointsInCurrentLevel}/{levelInfo.pointsToNextLevel + levelInfo.pointsInCurrentLevel} pontos
                    </p>
                  </div>

                  {/* Stats Grid */}
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Zap className="h-6 w-6 text-amber-500 mr-2" />
                      <span className="text-2xl font-bold">{userStats.total_points}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Pontos Totais</p>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Calendar className="h-6 w-6 text-green-500 mr-2" />
                      <span className="text-2xl font-bold">{userStats.current_streak}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Dias Consecutivos</p>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Target className="h-6 w-6 text-blue-500 mr-2" />
                      <span className="text-2xl font-bold">{userStats.total_achievements}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Conquistas</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Main Content Tabs */}
          <Tabs defaultValue="achievements" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="achievements" className="flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                Conquistas
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notificações
              </TabsTrigger>
              <TabsTrigger value="stats" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Estatísticas
              </TabsTrigger>
            </TabsList>

            <TabsContent value="achievements" className="space-y-6">
              <AchievementSystem />
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <NotificationCenter />
            </TabsContent>

            <TabsContent value="stats" className="space-y-6">
              {/* Detailed Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Progresso Geral</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {levelInfo ? `${Math.round(levelInfo.progressPercentage)}%` : '0%'}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Progresso para o próximo nível
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Trilhas Ativas</CardTitle>
                    <Target className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {userStats?.active_tracks || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Trilhas em andamento
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Sequência Atual</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {userStats?.current_streak || 0} dias
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Mantenha o ritmo!
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Motivational Messages */}
              <Card>
                <CardHeader>
                  <CardTitle>Sua Jornada Espiritual</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {userStats?.current_streak === 0 && (
                      <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p className="text-blue-800 dark:text-blue-200">
                          🌱 <strong>Comece sua jornada!</strong> O primeiro passo é sempre o mais importante. 
                          Complete uma atividade hoje para iniciar sua sequência.
                        </p>
                      </div>
                    )}

                    {userStats?.current_streak === 1 && (
                      <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                        <p className="text-green-800 dark:text-green-200">
                          🌿 <strong>Excelente começo!</strong> Você deu o primeiro passo. 
                          A consistência é a chave para a transformação espiritual.
                        </p>
                      </div>
                    )}

                    {userStats && userStats.current_streak >= 7 && userStats.current_streak < 21 && (
                      <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                        <p className="text-amber-800 dark:text-amber-200">
                          🔥 <strong>Você está no fogo!</strong> {userStats.current_streak} dias consecutivos. 
                          Continue assim e você verá uma transformação real em sua vida.
                        </p>
                      </div>
                    )}

                    {userStats && userStats.current_streak >= 21 && (
                      <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                        <p className="text-purple-800 dark:text-purple-200">
                          👑 <strong>Você é um mestre da disciplina!</strong> {userStats.current_streak} dias consecutivos. 
                          Sua dedicação é inspiradora e está transformando sua vida espiritual.
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                      <div className="text-center p-4">
                        <h4 className="font-semibold mb-2">Próxima Meta</h4>
                        {userStats && userStats.current_streak < 7 && (
                          <div>
                            <Badge variant="outline">7 Dias Consecutivos</Badge>
                            <p className="text-sm text-muted-foreground mt-2">
                              Faltam {7 - userStats.current_streak} dias
                            </p>
                          </div>
                        )}
                        {userStats && userStats.current_streak >= 7 && userStats.current_streak < 21 && (
                          <div>
                            <Badge variant="outline">21 Dias Consecutivos</Badge>
                            <p className="text-sm text-muted-foreground mt-2">
                              Faltam {21 - userStats.current_streak} dias
                            </p>
                          </div>
                        )}
                        {userStats && userStats.current_streak >= 21 && userStats.current_streak < 40 && (
                          <div>
                            <Badge variant="outline">40 Dias Consecutivos</Badge>
                            <p className="text-sm text-muted-foreground mt-2">
                              Faltam {40 - userStats.current_streak} dias
                            </p>
                          </div>
                        )}
                        {userStats && userStats.current_streak >= 40 && (
                          <div>
                            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500">
                              Mestre Espiritual
                            </Badge>
                            <p className="text-sm text-muted-foreground mt-2">
                              Continue sua jornada de excelência!
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="text-center p-4">
                        <h4 className="font-semibold mb-2">Dica do Dia</h4>
                        <p className="text-sm text-muted-foreground">
                          "A disciplina é a ponte entre objetivos e conquistas. Mantenha-se firme em sua jornada."
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Gamification;
