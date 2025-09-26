import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { 
  Trophy, 
  Star, 
  Flame, 
  Award,
  TrendingUp,
  Target,
  Medal,
  Crown,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface GamificationStats {
  totalPoints: number;
  currentLevel: number;
  pointsToNextLevel: number;
  daysStreak: number;
  activitiesCompleted: number;
  tracksCompleted: number;
  achievements: Array<{
    id: string;
    name: string;
    description: string;
    points: number;
    earnedAt: string;
    icon: string;
  }>;
}

interface EnhancedGamificationPanelProps {
  userId: string;
  className?: string;
}

const EnhancedGamificationPanel: React.FC<EnhancedGamificationPanelProps> = ({
  userId,
  className
}) => {
  const [stats, setStats] = useState<GamificationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'achievements'>('overview');
  const { toast } = useToast();

  useEffect(() => {
    loadGamificationStats();
  }, [userId]);

  const loadGamificationStats = async () => {
    try {
      setLoading(true);

      // Buscar estatísticas gerais
      const { data: statsData, error: statsError } = await supabase
        .rpc('calculate_user_gamification_stats', { user_uuid: userId });

      if (statsError) throw statsError;

      const baseStats = statsData?.[0] || {
        total_points: 0,
        current_level: 1,
        points_to_next_level: 100,
        days_streak: 0,
        activities_completed: 0,
        tracks_completed: 0
      };

      // Buscar conquistas
      const { data: achievementsData } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', userId)
        .order('earned_at', { ascending: false });

      const achievements = achievementsData?.map(achievement => ({
        id: achievement.id,
        name: achievement.achievement_name,
        description: achievement.achievement_description,
        points: achievement.points_awarded,
        earnedAt: achievement.earned_at,
        icon: achievement.achievement_type
      })) || [];

      setStats({
        totalPoints: baseStats.total_points,
        currentLevel: baseStats.current_level,
        pointsToNextLevel: baseStats.points_to_next_level,
        daysStreak: baseStats.days_streak,
        activitiesCompleted: baseStats.activities_completed,
        tracksCompleted: baseStats.tracks_completed,
        achievements
      });

    } catch (error: any) {
      console.error('Erro ao carregar gamificação:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar suas estatísticas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getLevelTitle = (level: number): string => {
    if (level < 5) return 'Iniciante Digital';
    if (level < 10) return 'Explorador Consciente';
    if (level < 20) return 'Guardião do Tempo';
    if (level < 30) return 'Mentor da Liberdade';
    return 'Mestre da Renovação';
  };

  const getLevelIcon = (level: number) => {
    if (level < 5) return <Star className="w-6 h-6 text-yellow-500" />;
    if (level < 10) return <Target className="w-6 h-6 text-blue-500" />;
    if (level < 20) return <Award className="w-6 h-6 text-purple-500" />;
    if (level < 30) return <Medal className="w-6 h-6 text-orange-500" />;
    return <Crown className="w-6 h-6 text-yellow-600" />;
  };

  const getAchievementIcon = (type: string) => {
    switch (type) {
      case 'first_day': return <Star className="w-5 h-5 text-yellow-500" />;
      case 'week_warrior': return <Flame className="w-5 h-5 text-orange-500" />;
      case 'dedication_master': return <Trophy className="w-5 h-5 text-purple-500" />;
      default: return <Award className="w-5 h-5 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <Card className={cn("animate-pulse", className)}>
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Dados de gamificação não disponíveis</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            Suas Conquistas
          </CardTitle>
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <Button
              variant={selectedTab === 'overview' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSelectedTab('overview')}
              className="h-8 px-3 text-xs"
            >
              Visão Geral
            </Button>
            <Button
              variant={selectedTab === 'achievements' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSelectedTab('achievements')}
              className="h-8 px-3 text-xs"
            >
              Conquistas
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {selectedTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Level Section */}
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  {getLevelIcon(stats.currentLevel)}
                  <div>
                    <div className="font-semibold">Nível {stats.currentLevel}</div>
                    <div className="text-sm text-muted-foreground">
                      {getLevelTitle(stats.currentLevel)}
                    </div>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-primary/20 text-primary">
                  {stats.totalPoints} pontos
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progresso para o próximo nível</span>
                  <span>{stats.pointsToNextLevel} pontos restantes</span>
                </div>
                <Progress 
                  value={((stats.totalPoints % 100))} 
                  className="h-2"
                />
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-orange-50 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full mx-auto mb-2">
                  <Flame className="w-6 h-6 text-orange-600" />
                </div>
                <div className="text-2xl font-bold text-orange-600">{stats.daysStreak}</div>
                <div className="text-sm text-orange-700">Dias consecutivos</div>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto mb-2">
                  <Zap className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-green-600">{stats.activitiesCompleted}</div>
                <div className="text-sm text-green-700">Atividades</div>
              </div>
            </div>

            {/* Recent Achievement */}
            {stats.achievements.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  {getAchievementIcon(stats.achievements[0].icon)}
                  <div>
                    <div className="font-medium text-yellow-800">
                      Última conquista: {stats.achievements[0].name}
                    </div>
                    <div className="text-sm text-yellow-700">
                      +{stats.achievements[0].points} pontos
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {selectedTab === 'achievements' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {stats.achievements.length > 0 ? (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {stats.achievements.map((achievement, index) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-shrink-0">
                      {getAchievementIcon(achievement.icon)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{achievement.name}</div>
                      <div className="text-sm text-muted-foreground truncate">
                        {achievement.description}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(achievement.earnedAt).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                    <Badge variant="outline" className="flex-shrink-0">
                      +{achievement.points}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <div className="text-gray-600 mb-2">Nenhuma conquista ainda</div>
                <div className="text-sm text-muted-foreground">
                  Complete atividades para desbloquear conquistas!
                </div>
              </div>
            )}
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedGamificationPanel;