import Navbar from "@/components/Navbar";
import { Helmet } from "react-helmet-async";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Award, TrendingUp, Users, Calendar } from "lucide-react";
import { useUserAchievements, useUserStats, useUserRanking } from "@/hooks/useGamification";

const Gamification = () => {
  const navigate = useNavigate();
  
  const { data: achievements, isLoading: achievementsLoading } = useUserAchievements();
  const { data: stats, isLoading: statsLoading } = useUserStats();
  const { data: ranking, isLoading: rankingLoading } = useUserRanking();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate("/auth", { replace: true, state: { redirectTo: "/gamification" } });
    });
  }, [navigate]);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Gamificação',
    description: 'Pontos, insígnias e ranking para motivar seu progresso.'
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>Gamificação — Pontos e Insígnias</title>
        <meta name="description" content="Veja seus pontos, insígnias conquistadas e ranking." />
        <link rel="canonical" href={window.location.origin + "/gamification"} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <Navbar />

      <main className="flex-1 py-10">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h1 className="text-3xl font-bold">Gamificação</h1>

          {statsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader className="animate-pulse">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-8 bg-muted rounded w-1/2 animate-pulse"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pontos Totais</CardTitle>
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.total_points || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Acumulados em todas as trilhas
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Sequência</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.current_streak || 0} dias</div>
                  <p className="text-xs text-muted-foreground">
                    Sua maior sequência atual
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Nível</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Nível {stats?.level || 1}</div>
                  <p className="text-xs text-muted-foreground">
                    Baseado nos seus pontos
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ranking</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {rankingLoading ? '...' : `#${ranking?.position || 'N/A'}`}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {rankingLoading ? 'Carregando...' : `de ${ranking?.total_users || 0} usuários`}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Achievements Section */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Suas Conquistas</h2>
            
            {achievementsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-3 bg-muted rounded w-full mb-2"></div>
                      <div className="h-3 bg-muted rounded w-2/3"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : achievements && achievements.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements.map((achievement) => (
                  <Card key={achievement.id} className="border-l-4 border-l-primary">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Award className="h-5 w-5 text-primary" />
                          {achievement.achievement_name}
                        </CardTitle>
                        <Badge variant="secondary">
                          +{achievement.points_awarded}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-2">
                        {achievement.achievement_description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Conquistado em {new Date(achievement.earned_at).toLocaleDateString('pt-BR')}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-8 text-center">
                  <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhuma conquista ainda</h3>
                  <p className="text-muted-foreground">
                    Complete atividades e dias para desbloquear suas primeiras conquistas!
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Gamification;
