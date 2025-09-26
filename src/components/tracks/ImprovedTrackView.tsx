import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { PersonalizationService } from '@/services/personalizationEngine';
import { useToast } from '@/hooks/use-toast';
import { 
  Calendar, 
  Trophy, 
  Flame, 
  CheckCircle, 
  Clock, 
  Play,
  Pause,
  RotateCcw,
  Award,
  Star,
  Zap,
  BookOpen,
  Heart,
  Shield,
  Users
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import TrackNavigationPanel from './TrackNavigationPanel';
import { cn } from '@/lib/utils';

interface ImprovedTrackViewProps {
  userId: string;
  trackSlug: string;
  userScore: number;
  userProfile: any;
  initialDay?: number;
}

interface DayContent {
  dayNumber: number;
  title: string;
  description: string;
  mainFocus: string;
  estimatedTime: number;
  difficulty: 'easy' | 'medium' | 'hard';
  rewards: {
    points: number;
    achievements?: string[];
  };
  activities: Array<{
    id: string;
    title: string;
    description: string;
    type: string;
    duration: number;
    points: number;
    isRequired: boolean;
    completed: boolean;
    instructions: string[];
  }>;
  devotional?: {
    verse: string;
    reflection: string;
    prayer: string;
    audioUrl?: string;
  };
}

interface UserProgress {
  streak: number;
  totalPoints: number;
  level: number;
  completedDays: number[];
  currentDay: number;
}

const ImprovedTrackView: React.FC<ImprovedTrackViewProps> = ({
  userId,
  trackSlug,
  userScore,
  userProfile,
  initialDay = 1
}) => {
  const [selectedDay, setSelectedDay] = useState(initialDay);
  const [loading, setLoading] = useState(true);
  const [dayContent, setDayContent] = useState<DayContent | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress>({
    streak: 0,
    totalPoints: 0,
    level: 1,
    completedDays: [],
    currentDay: 1
  });
  const [isCompletingActivity, setIsCompletingActivity] = useState<string | null>(null);
  const [showDevotional, setShowDevotional] = useState(false);

  const { toast } = useToast();

  const trackInfo = {
    liberdade: { 
      name: 'Trilha Liberdade', 
      subtitle: 'Fortalecendo bons hábitos digitais', 
      duration: 7, 
      color: '#10B981',
      gradient: 'from-green-500 to-emerald-600'
    },
    equilibrio: { 
      name: 'Trilha Equilíbrio', 
      subtitle: 'Redescobrindo o controle em 21 dias', 
      duration: 21, 
      color: '#3B82F6',
      gradient: 'from-blue-500 to-blue-600'
    },
    renovacao: { 
      name: 'Trilha Renovação', 
      subtitle: 'Transformação profunda em 40 dias', 
      duration: 40, 
      color: '#8B5CF6',
      gradient: 'from-purple-500 to-violet-600'
    }
  };

  const currentTrack = trackInfo[trackSlug as keyof typeof trackInfo];

  useEffect(() => {
    loadUserProgress();
  }, [userId, trackSlug]);

  useEffect(() => {
    if (userProgress.currentDay > 0) {
      loadDayContent(selectedDay);
    }
  }, [selectedDay, userId, trackSlug]);

  const loadUserProgress = async () => {
    try {
      // Buscar progresso da trilha
      const { data: trackProgress } = await supabase
        .from('user_track_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('track_slug', trackSlug)
        .maybeSingle();

      // Buscar atividades completas
      const { data: completedActivities } = await supabase
        .from('user_activity_progress')
        .select('day_number')
        .eq('user_id', userId)
        .eq('track_slug', trackSlug);

      const completedDays = [...new Set(completedActivities?.map(a => a.day_number) || [])];

      setUserProgress({
        streak: trackProgress?.streak_days || 0,
        totalPoints: trackProgress?.total_points || 0,
        level: trackProgress?.level_number || 1,
        completedDays,
        currentDay: trackProgress?.current_day || 1
      });

      setSelectedDay(trackProgress?.current_day || 1);
    } catch (error) {
      console.error('Erro ao carregar progresso:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar seu progresso",
        variant: "destructive",
      });
    }
  };

  const loadDayContent = async (day: number) => {
    try {
      setLoading(true);
      const content = await PersonalizationService.getPersonalizedContent(userId, trackSlug, day);
      
      if (content) {
        // Converter para o formato esperado
        const dayContentFormatted: DayContent = {
          dayNumber: content.dayNumber,
          title: content.title,
          description: content.description,
          mainFocus: content.mainFocus,
          estimatedTime: content.estimatedTime,
          difficulty: content.difficulty,
          rewards: content.rewards,
          activities: content.activities,
          devotional: content.devotionalContent
        };
        setDayContent(dayContentFormatted);
      } else {
        throw new Error('Conteúdo não encontrado');
      }
    } catch (error) {
      console.error('Erro ao carregar conteúdo do dia:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o conteúdo do dia",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const completeActivity = async (activityId: string, activityIndex: number) => {
    if (isCompletingActivity) return;
    
    try {
      setIsCompletingActivity(activityId);
      
      // Usar supabase diretamente para completar atividade
      const { error } = await supabase.rpc('complete_activity', {
        p_track_slug: trackSlug,
        p_day_number: selectedDay,
        p_activity_index: activityIndex,
        p_activity_title: dayContent?.activities[activityIndex]?.title || 'Atividade',
        p_activity_type: 'activity'
      });

      if (error) throw error;
      
      // Atualizar conteúdo local
      if (dayContent) {
        const updatedActivities = dayContent.activities.map(activity => 
          activity.id === activityId ? { ...activity, completed: true } : activity
        );
        setDayContent({ ...dayContent, activities: updatedActivities });
      }

      // Atualizar progresso do usuário
      await loadUserProgress();

      toast({
        title: "Atividade concluída!",
        description: "Você ganhou pontos por completar esta atividade",
      });
    } catch (error) {
      console.error('Erro ao completar atividade:', error);
      toast({
        title: "Erro",
        description: "Não foi possível completar a atividade",
        variant: "destructive",
      });
    } finally {
      setIsCompletingActivity(null);
    }
  };

  const completeDayProgress = async () => {
    try {
      // Usar supabase diretamente para completar o dia
      const { data, error } = await supabase.rpc('complete_day', {
        p_track_slug: trackSlug,
        p_day_number: selectedDay
      });

      if (error) throw error;
      
      const result = data as any;
      if (result?.success) {
        await loadUserProgress();
        
        // Avançar para o próximo dia se disponível
        if (selectedDay < currentTrack.duration) {
          setSelectedDay(selectedDay + 1);
        }

        toast({
          title: "Dia completo! 🎉",
          description: `Você ganhou ${result.points_earned || 100} pontos!`,
        });
      }
    } catch (error) {
      console.error('Erro ao completar dia:', error);
      toast({
        title: "Erro",
        description: "Não foi possível completar o dia",
        variant: "destructive",
      });
    }
  };

  const allRequiredActivitiesCompleted = () => {
    if (!dayContent) return false;
    return dayContent.activities
      .filter(activity => activity.isRequired)
      .every(activity => activity.completed);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando sua experiência personalizada...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Header */}
      <div className={`bg-gradient-to-r ${currentTrack.gradient} text-white`}>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <Trophy className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">{currentTrack.name}</h1>
                <p className="text-white/90">{currentTrack.subtitle}</p>
                <div className="flex items-center mt-2 space-x-4 text-sm">
                  <span>Dia {selectedDay} de {currentTrack.duration}</span>
                  <span>•</span>
                  <span>{dayContent?.estimatedTime || 30} min estimados</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="text-3xl font-bold">{userProgress.streak}</div>
                <div className="text-sm text-white/80">Dias consecutivos</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{userProgress.totalPoints}</div>
                <div className="text-sm text-white/80">Pontos totais</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">Nível {userProgress.level}</div>
                <div className="text-sm text-white/80">
                  {userProgress.level < 3 ? 'Iniciante' : userProgress.level < 7 ? 'Intermediário' : 'Avançado'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Navigation Panel */}
          <div className="lg:col-span-1">
            <TrackNavigationPanel
              trackSlug={trackSlug}
              trackTitle={currentTrack.name}
              currentDay={selectedDay}
              maxDays={currentTrack.duration}
              onDaySelect={setSelectedDay}
              userProgress={userProgress}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedDay}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Day Overview */}
                <Card className="border-2 border-primary/20">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-2xl">{dayContent?.title}</CardTitle>
                        <p className="text-muted-foreground mt-2">{dayContent?.description}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                          {dayContent?.mainFocus}
                        </Badge>
                        <Badge variant="outline">
                          {dayContent?.difficulty === 'easy' ? '⭐' : dayContent?.difficulty === 'medium' ? '⭐⭐' : '⭐⭐⭐'}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>

                  {dayContent && (
                    <CardContent className="space-y-6">
                      {/* Progress Bar for Today */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progresso do Dia</span>
                          <span>
                            {dayContent.activities.filter(a => a.completed).length} de {dayContent.activities.length} completas
                          </span>
                        </div>
                        <Progress 
                          value={(dayContent.activities.filter(a => a.completed).length / dayContent.activities.length) * 100} 
                          className="h-3"
                        />
                      </div>

                      <Separator />

                      {/* Activities */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-primary" />
                          Atividades de Hoje
                        </h3>

                        <div className="grid gap-4">
                          {dayContent.activities.map((activity, index) => (
                            <motion.div
                              key={activity.id}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: index * 0.1 }}
                              className={cn(
                                "border-2 rounded-xl p-6 transition-all duration-200",
                                activity.completed 
                                  ? "border-green-200 bg-green-50 shadow-sm" 
                                  : "border-gray-200 hover:border-primary/30 hover:shadow-md"
                              )}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                  <div className={cn(
                                    "p-3 rounded-lg transition-colors",
                                    activity.completed 
                                      ? "bg-green-500 text-white" 
                                      : "bg-primary/10 text-primary"
                                  )}>
                                    {activity.completed ? <CheckCircle className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                                  </div>
                                  
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-gray-900">{activity.title}</h4>
                                    <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                                    <div className="flex items-center gap-4 mt-3">
                                      <div className="flex items-center text-sm text-gray-600">
                                        <Clock className="w-4 h-4 mr-1" />
                                        {activity.duration} min
                                      </div>
                                      <Badge variant="outline" className="text-xs">
                                        +{activity.points} pontos
                                      </Badge>
                                      {activity.isRequired && (
                                        <Badge variant="destructive" className="text-xs">
                                          Obrigatório
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="flex items-center space-x-3">
                                  {activity.completed ? (
                                    <div className="flex items-center text-green-600 font-medium">
                                      <CheckCircle className="w-5 h-5 mr-2" />
                                      Completo
                                    </div>
                                  ) : (
                                    <Button 
                                      onClick={() => completeActivity(activity.id, index)}
                                      disabled={isCompletingActivity === activity.id}
                                      className="min-w-[100px]"
                                    >
                                      {isCompletingActivity === activity.id ? (
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                                      ) : (
                                        <>
                                          <Play className="w-4 h-4 mr-1" />
                                          Iniciar
                                        </>
                                      )}
                                    </Button>
                                  )}
                                </div>
                              </div>

                              {/* Instructions */}
                              {activity.instructions && activity.instructions.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                  <h5 className="text-sm font-medium text-gray-700 mb-2">Como fazer:</h5>
                                  <ul className="text-sm text-gray-600 space-y-1">
                                    {activity.instructions.map((instruction, i) => (
                                      <li key={i} className="flex items-start">
                                        <span className="text-primary mr-2">•</span>
                                        {instruction}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      {/* Complete Day Button */}
                      {allRequiredActivitiesCompleted() && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-center pt-6"
                        >
                          <Button 
                            onClick={completeDayProgress}
                            size="lg"
                            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-3 text-lg font-semibold"
                          >
                            <Trophy className="w-5 h-5 mr-2" />
                            Finalizar Dia {selectedDay}
                          </Button>
                          <p className="text-sm text-muted-foreground mt-2">
                            Ganhe {dayContent.rewards.points} pontos extras!
                          </p>
                        </motion.div>
                      )}

                      {/* Devotional Section */}
                      {dayContent.devotional && (
                        <Card className="border-amber-200 bg-amber-50">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-amber-800">
                              <Heart className="w-5 h-5 text-amber-600" />
                              Reflexão Espiritual
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="bg-white/50 p-4 rounded-lg">
                              <p className="font-medium text-amber-900 mb-2">Versículo:</p>
                              <p className="italic text-amber-800">{dayContent.devotional.verse}</p>
                            </div>
                            <div>
                              <p className="font-medium text-amber-900 mb-2">Reflexão:</p>
                              <p className="text-amber-800">{dayContent.devotional.reflection}</p>
                            </div>
                            <div>
                              <p className="font-medium text-amber-900 mb-2">Oração:</p>
                              <p className="text-amber-800">{dayContent.devotional.prayer}</p>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </CardContent>
                  )}
                </Card>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImprovedTrackView;