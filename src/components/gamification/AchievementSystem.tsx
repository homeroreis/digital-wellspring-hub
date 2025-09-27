import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Star, Zap, Target, Calendar, Flame } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUserAchievements, useUserStats } from '@/hooks/useGamification';
import { toast } from '@/hooks/use-toast';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  points: number;
  requirement: number;
  progress?: number;
  unlocked: boolean;
  unlockedAt?: Date;
}

const ACHIEVEMENT_DEFINITIONS: Omit<Achievement, 'id' | 'progress' | 'unlocked' | 'unlockedAt'>[] = [
  {
    name: 'Primeiro Passo',
    description: 'Complete sua primeira atividade diária',
    icon: <Star className="h-6 w-6" />,
    category: 'Início',
    points: 50,
    requirement: 1
  },
  {
    name: 'Dedicação Semanal',
    description: 'Complete 7 dias consecutivos',
    icon: <Calendar className="h-6 w-6" />,
    category: 'Consistência',
    points: 200,
    requirement: 7
  },
  {
    name: 'Mestre da Disciplina',
    description: 'Complete 21 dias consecutivos',
    icon: <Trophy className="h-6 w-6" />,
    category: 'Consistência',
    points: 500,
    requirement: 21
  },
  {
    name: 'Transformação Total',
    description: 'Complete 40 dias consecutivos',
    icon: <Flame className="h-6 w-6" />,
    category: 'Consistência',
    points: 1000,
    requirement: 40
  },
  {
    name: 'Colecionador',
    description: 'Complete 100 atividades totais',
    icon: <Target className="h-6 w-6" />,
    category: 'Progresso',
    points: 300,
    requirement: 100
  },
  {
    name: 'Superar Limites',
    description: 'Alcance 1000 pontos totais',
    icon: <Zap className="h-6 w-6" />,
    category: 'Pontuação',
    points: 400,
    requirement: 1000
  }
];

export const AchievementSystem: React.FC = () => {
  const { data: userAchievements = [] } = useUserAchievements();
  const { data: userStats } = useUserStats();
  const [showUnlockedAnimation, setShowUnlockedAnimation] = useState<string | null>(null);

  // Calculate progress for each achievement
  const achievementsWithProgress = ACHIEVEMENT_DEFINITIONS.map(achievement => {
    const unlockedAchievement = userAchievements.find(ua => 
      ua.achievement_name === achievement.name
    );
    
    let progress = 0;
    if (userStats) {
      switch (achievement.name) {
        case 'Primeiro Passo':
          progress = Math.min(userStats.active_tracks || 0, achievement.requirement);
          break;
        case 'Dedicação Semanal':
        case 'Mestre da Disciplina': 
        case 'Transformação Total':
          progress = Math.min(userStats.current_streak || 0, achievement.requirement);
          break;
        case 'Colecionador':
          progress = Math.min(userStats.total_achievements || 0, achievement.requirement);
          break;
        case 'Superar Limites':
          progress = Math.min(userStats.total_points || 0, achievement.requirement);
          break;
      }
    }

    return {
      ...achievement,
      id: achievement.name.toLowerCase().replace(/\s+/g, '-'),
      progress,
      unlocked: !!unlockedAchievement,
      unlockedAt: unlockedAchievement?.earned_at ? new Date(unlockedAchievement.earned_at) : undefined
    };
  });

  // Check for newly unlocked achievements
  useEffect(() => {
    const newlyUnlocked = achievementsWithProgress.find(a => 
      !a.unlocked && a.progress >= a.requirement
    );
    
    if (newlyUnlocked && userStats) {
      // Trigger achievement unlock animation
      setShowUnlockedAnimation(newlyUnlocked.id);
      
      // Show celebration toast
      toast({
        title: "🎉 Nova Conquista!",
        description: `Você desbloqueou: ${newlyUnlocked.name}`,
        duration: 5000,
      });
      
      // Auto-hide animation after 3 seconds
      setTimeout(() => setShowUnlockedAnimation(null), 3000);
    }
  }, [userStats, achievementsWithProgress]);

  const categorizedAchievements = achievementsWithProgress.reduce((acc, achievement) => {
    if (!acc[achievement.category]) acc[achievement.category] = [];
    acc[achievement.category].push(achievement);
    return acc;
  }, {} as Record<string, Achievement[]>);

  const totalPoints = achievementsWithProgress
    .filter(a => a.unlocked)
    .reduce((sum, a) => sum + a.points, 0);

  const unlockedCount = achievementsWithProgress.filter(a => a.unlocked).length;
  const totalCount = achievementsWithProgress.length;

  return (
    <div className="space-y-6">
      {/* Achievement Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Trophy className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{unlockedCount}/{totalCount}</p>
                <p className="text-sm text-muted-foreground">Conquistas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Star className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{totalPoints}</p>
                <p className="text-sm text-muted-foreground">Pontos de Conquistas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Target className="h-8 w-8 text-primary" />
              <div>
                <Progress value={(unlockedCount / totalCount) * 100} className="w-16 h-2" />
                <p className="text-sm text-muted-foreground mt-1">
                  {Math.round((unlockedCount / totalCount) * 100)}% Completo
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Achievement Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Suas Conquistas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={Object.keys(categorizedAchievements)[0]} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              {Object.keys(categorizedAchievements).map(category => (
                <TabsTrigger key={category} value={category}>{category}</TabsTrigger>
              ))}
            </TabsList>
            
            {Object.entries(categorizedAchievements).map(([category, achievements]) => (
              <TabsContent key={category} value={category} className="space-y-4">
                <div className="grid gap-4">
                  {achievements.map(achievement => (
                    <Card 
                      key={achievement.id} 
                      className={`transition-all duration-300 ${
                        achievement.unlocked ? 'bg-primary/5 border-primary/20' : 'opacity-70'
                      } ${
                        showUnlockedAnimation === achievement.id ? 'animate-pulse border-primary' : ''
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-full ${
                              achievement.unlocked ? 'bg-primary text-primary-foreground' : 'bg-muted'
                            }`}>
                              {achievement.icon}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold">{achievement.name}</h4>
                                {achievement.unlocked && (
                                  <Badge variant="secondary" className="bg-primary/20">
                                    +{achievement.points} pts
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">{achievement.description}</p>
                              
                              {!achievement.unlocked && (
                                <div className="mt-2">
                                  <Progress 
                                    value={(achievement.progress / achievement.requirement) * 100} 
                                    className="w-full h-2"
                                  />
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {achievement.progress}/{achievement.requirement}
                                  </p>
                                </div>
                              )}
                              
                              {achievement.unlocked && achievement.unlockedAt && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Desbloqueado em {achievement.unlockedAt.toLocaleDateString('pt-BR')}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};