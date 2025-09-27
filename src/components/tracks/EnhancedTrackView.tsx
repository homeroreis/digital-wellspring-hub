import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MediaPlayer } from '@/components/ui/media-player';
import { ExpandableText } from '@/components/ui/expandable-text';
import { Separator } from '@/components/ui/separator';
import TrackNavigationPanel from './TrackNavigationPanel';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Target, 
  Award,
  Book,
  PlayCircle,
  FileText,
  Sparkles,
  Heart,
  Dumbbell,
  Users,
  Trophy,
  Flame,
  Play,
  Pause,
  BookOpen,
  Shield
} from 'lucide-react';

interface EnhancedTrackViewProps {
  userId: string;
  trackSlug: string;
  userScore: number;
  userProfile: any;
  initialDay?: number;
}

interface DayContent {
  title: string;
  description: string;
  activities: Array<{
    id: string;
    title: string;
    description: string;
    type: string;
    duration: number;
    points: number;
    isRequired: boolean;
    isCompleted: boolean;
  }>;
  devotional: {
    verse: string;
    reflection: string;
    prayer: string;
    audioUrl?: string;
  } | null;
  mainActivity: {
    title: string;
    content: string;
  } | null;
  challenge: {
    title: string;
    content: string;
  } | null;
  mainFocus: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: number;
  rewards: { points: number };
}

interface UserProgress {
  streak: number;
  totalPoints: number;
  level: number;
  completedDays: number[];
  currentDay: number;
}

const EnhancedTrackView: React.FC<EnhancedTrackViewProps> = ({
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
      loadDayContent(userId, trackSlug, selectedDay);
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

  // Load day content from database and personalization service
  const loadDayContent = async (userId: string, trackSlug: string, dayNumber: number) => {
    try {
      setLoading(true);
      
      // First try to get content from database
      const { data: dbContent, error } = await supabase
        .rpc('get_track_day', {
          p_track_slug: trackSlug,
          p_day_number: dayNumber
        });

      if (error) {
        console.error('Database error:', error);
      }

      if (dbContent && typeof dbContent === 'object' && !Array.isArray(dbContent) && 'day_content' in dbContent) {
        // Convert database content to our format
        const dayData = (dbContent as any).day_content;
        const activities = (dbContent as any).activities || [];
        
        setDayContent({
          title: dayData.title || `Dia ${dayNumber}`,
          description: dayData.objective || "Conteúdo do dia",
          activities: activities.map((act: any, index: number) => ({
            id: `activity-${index}`,
            title: act.activity?.activity_title || `Atividade ${index + 1}`,
            description: act.activity?.activity_description || "",
            type: getActivityType(act.activity?.activity_title || ""),
            duration: 15,
            points: act.activity?.points_value || 10,
            isRequired: act.activity?.is_required || false,
            isCompleted: act.completed || false
          })),
          devotional: dayData.devotional_verse ? {
            verse: dayData.devotional_verse,
            reflection: dayData.devotional_reflection,
            prayer: dayData.devotional_prayer
          } : null,
          mainActivity: {
            title: dayData.main_activity_title || "Atividade Principal",
            content: dayData.main_activity_content || ""
          },
          challenge: {
            title: dayData.main_challenge_title || "Desafio do Dia", 
            content: dayData.main_challenge_content || ""
          },
          mainFocus: "Transformação digital",
          difficulty: dayData.difficulty_level === 1 ? "easy" : dayData.difficulty_level === 2 ? "medium" : "hard",
          estimatedTime: 45,
          rewards: { points: dayData.max_points || 100 }
        });
      } else {
        // Fallback content
        setDayContent({
          title: `Dia ${dayNumber}`,
          description: "Conteúdo em desenvolvimento",
          activities: [],
          devotional: null,
          mainActivity: null,
          challenge: null,
          mainFocus: "Desenvolvimento pessoal",
          difficulty: "medium",
          estimatedTime: 30,
          rewards: { points: 100 }
        });
      }
    } catch (error) {
      console.error('Error loading day content:', error);
      toast({
        title: "Erro ao carregar conteúdo",
        description: "Não foi possível carregar o conteúdo do dia",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper function to determine activity type from title
  const getActivityType = (title: string): string => {
    const lTitle = title.toLowerCase();
    if (lTitle.includes('devocional') || lTitle.includes('oração') || lTitle.includes('bíblia')) return 'devotional';
    if (lTitle.includes('exercício') || lTitle.includes('físico') || lTitle.includes('caminhada')) return 'exercise';
    if (lTitle.includes('social') || lTitle.includes('família') || lTitle.includes('amigos')) return 'social';
    if (lTitle.includes('diário') || lTitle.includes('reflexão') || lTitle.includes('escrita')) return 'reflection';
    if (lTitle.includes('desafio') || lTitle.includes('tarefa') || lTitle.includes('missão')) return 'challenge';
    return 'activity';
  };

  // Get icon for activity type
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'devotional': return Heart;
      case 'exercise': return Dumbbell;
      case 'social': return Users;
      case 'reflection': return FileText;
      case 'challenge': return Target;
      default: return PlayCircle;
    }
  };

  const completeActivity = async (activityId: string, activityIndex: number) => {
    if (isCompletingActivity) return;
    
    try {
      setIsCompletingActivity(activityId);
      
      // Use supabase RPC to complete activity
      const { data, error } = await supabase.rpc('complete_activity', {
        p_track_slug: trackSlug,
        p_day_number: selectedDay,
        p_activity_index: activityIndex,
        p_activity_title: dayContent?.activities[activityIndex]?.title || 'Atividade',
        p_activity_type: 'activity'
      });

      if (error) throw error;
      
      // Update local content
      if (dayContent) {
        const updatedActivities = dayContent.activities.map(activity => 
          activity.id === activityId ? { ...activity, isCompleted: true } : activity
        );
        setDayContent({ ...dayContent, activities: updatedActivities });
      }

      // Update user progress
      await loadUserProgress();

      toast({
        title: "Atividade concluída!",
        description: `Você ganhou ${typeof data === 'object' && data && 'points_earned' in data ? data.points_earned : 10} pontos!`,
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
      // Use supabase RPC to complete day
      const { data, error } = await supabase.rpc('complete_day', {
        p_track_slug: trackSlug,
        p_day_number: selectedDay
      });

      if (error) throw error;
      
      const result = data as any;
      if (result?.success) {
        await loadUserProgress();
        
        // Move to next day if available
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
      .every(activity => activity.isCompleted);
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
    <div className="min-h-screen bg-background">
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
                <div className="text-sm text-white/80">Sequência</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{userProgress.totalPoints}</div>
                <div className="text-sm text-white/80">Pontos</div>
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
                            {dayContent.activities.filter(a => a.isCompleted).length} de {dayContent.activities.length} completas
                          </span>
                        </div>
                        <Progress 
                          value={(dayContent.activities.filter(a => a.isCompleted).length / dayContent.activities.length) * 100 || 0} 
                          className="h-3"
                        />
                      </div>

                      <Separator />

                      {/* Devotional Section */}
                      {dayContent.devotional && (
                        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Heart className="w-5 h-5 text-blue-600" />
                                <CardTitle className="text-lg">Reflexão Espiritual</CardTitle>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowDevotional(!showDevotional)}
                              >
                                {showDevotional ? 'Ocultar' : 'Ver'}
                              </Button>
                            </div>
                          </CardHeader>
                          
                          {showDevotional && (
                            <CardContent className="space-y-4">
                              <div className="bg-white p-4 rounded-lg border border-blue-200">
                                <h4 className="font-semibold text-blue-900 mb-2">Versículo do Dia</h4>
                                <p className="italic text-blue-800">{dayContent.devotional.verse}</p>
                              </div>
                              
                              <div className="bg-white p-4 rounded-lg border border-blue-200">
                                <h4 className="font-semibold text-blue-900 mb-2">Reflexão</h4>
                                <ExpandableText content={dayContent.devotional.reflection} maxLength={200} />
                              </div>
                              
                              <div className="bg-white p-4 rounded-lg border border-blue-200">
                                <h4 className="font-semibold text-blue-900 mb-2">Oração</h4>
                                <ExpandableText content={dayContent.devotional.prayer} maxLength={200} />
                              </div>
                              
                              {dayContent.devotional.audioUrl && (
                                <MediaPlayer
                                  src={dayContent.devotional.audioUrl}
                                  title="Áudio da Reflexão"
                                  type="audio"
                                />
                              )}
                            </CardContent>
                          )}
                        </Card>
                      )}

                      {/* Main Activity Section */}
                      {dayContent.mainActivity && (
                        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
                          <CardHeader>
                            <div className="flex items-center space-x-2">
                              <BookOpen className="w-5 h-5 text-green-600" />
                              <CardTitle className="text-lg">{dayContent.mainActivity.title}</CardTitle>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <ExpandableText content={dayContent.mainActivity.content} maxLength={300} />
                          </CardContent>
                        </Card>
                      )}

                      {/* Challenge Section */}
                      {dayContent.challenge && (
                        <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
                          <CardHeader>
                            <div className="flex items-center space-x-2">
                              <Target className="w-5 h-5 text-orange-600" />
                              <CardTitle className="text-lg">{dayContent.challenge.title}</CardTitle>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <ExpandableText content={dayContent.challenge.content} maxLength={300} />
                          </CardContent>
                        </Card>
                      )}

                      {/* Activities */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-primary" />
                          Atividades de Hoje
                        </h3>

                        <div className="grid gap-4">
                          {dayContent.activities.map((activity, index) => {
                            const IconComponent = getActivityIcon(activity.type);
                            
                            return (
                              <motion.div
                                key={activity.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.1 }}
                                className={cn(
                                  "border-2 rounded-xl p-6 transition-all duration-200",
                                  activity.isCompleted 
                                    ? "border-green-200 bg-green-50 shadow-sm" 
                                    : "border-gray-200 hover:border-primary/30 hover:shadow-md"
                                )}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-4">
                                    <div className={cn(
                                      "p-3 rounded-lg transition-colors",
                                      activity.isCompleted 
                                        ? "bg-green-500 text-white" 
                                        : "bg-primary/10 text-primary"
                                    )}>
                                      {activity.isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <IconComponent className="w-5 h-5" />}
                                    </div>
                                    
                                    <div className="flex-1">
                                      <h4 className="font-semibold text-foreground">{activity.title}</h4>
                                      <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
                                      <div className="flex items-center gap-4 mt-3">
                                        <div className="flex items-center text-sm text-muted-foreground">
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
                                    {activity.isCompleted ? (
                                      <div className="flex items-center text-green-600 font-medium">
                                        <CheckCircle2 className="w-5 h-5 mr-2" />
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
                              </motion.div>
                            );
                          })}
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
                            className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold px-8 py-3 rounded-xl shadow-lg"
                          >
                            <Award className="w-5 h-5 mr-2" />
                            Finalizar Dia - Ganhar {dayContent.rewards.points} pontos!
                          </Button>
                        </motion.div>
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

export default EnhancedTrackView;