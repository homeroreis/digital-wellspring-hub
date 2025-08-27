import React, { useState, useEffect } from 'react';
import { PersonalizationService, PersonalizedContent } from '@/services/personalizationEngine';
import { Calendar, CheckCircle, Clock, Star, Trophy, Target, PlayCircle, BookOpen, Heart, Zap, Gift, Lock, Unlock, ChevronRight, BarChart3, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface DayViewManagerProps {
  userId: string;
  trackSlug: string;
  userScore: number;
  userProfile?: any;
  currentDay?: number;
}

const DayViewManager: React.FC<DayViewManagerProps> = ({
  userId,
  trackSlug,
  userScore,
  userProfile,
  currentDay = 1
}) => {
  const { toast } = useToast();
  const [selectedDay, setSelectedDay] = useState(currentDay);
  const [loading, setLoading] = useState(false);
  const [dayContent, setDayContent] = useState<PersonalizedContent | null>(null);
  const [userProgress, setUserProgress] = useState({
    completedDays: userProfile?.progressData?.completedDays || [],
    totalPoints: userProfile?.progressData?.totalPoints || 0,
    streak: userProfile?.progressData?.streak || 0,
    level: userProfile?.progressData?.level || 1,
    currentDay: currentDay
  });

  // Informações da trilha
  const trackInfo = {
    liberdade: {
      name: 'Trilha Liberdade',
      subtitle: 'Uso Consciente',
      duration: 7,
      color: '#4CAF50',
      icon: CheckCircle,
    },
    equilibrio: {
      name: 'Trilha Equilíbrio',
      subtitle: 'Uso em Alerta',
      duration: 21,
      color: '#FFC107',
      icon: Target,
    },
    renovacao: {
      name: 'Trilha Renovação',
      subtitle: 'Uso Problemático',
      duration: 40,
      color: '#F44336',
      icon: Zap,
    }
  }[trackSlug] || {
    name: 'Trilha',
    subtitle: '',
    duration: 7,
    color: '#4CAF50',
    icon: CheckCircle,
  };

  useEffect(() => {
    loadDayContent(selectedDay);
  }, [selectedDay, userId]);

  const loadDayContent = async (dayNumber: number) => {
    try {
      setLoading(true);
      const content = await PersonalizationService.getPersonalizedDay(userId, dayNumber);
      setDayContent(content);
    } catch (error) {
      console.error('Erro ao carregar conteúdo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o conteúdo do dia",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'video': return <PlayCircle className="w-5 h-5" />;
      case 'article': return <BookOpen className="w-5 h-5" />;
      case 'exercise': return <Target className="w-5 h-5" />;
      case 'reflection': return <Heart className="w-5 h-5" />;
      case 'challenge': return <Trophy className="w-5 h-5" />;
      case 'prayer': return <Heart className="w-5 h-5" />;
      case 'meditation': return <Zap className="w-5 h-5" />;
      default: return <CheckCircle className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'reflection': return 'text-purple-600 bg-purple-100';
      case 'exercise': return 'text-blue-600 bg-blue-100';
      case 'meditation': return 'text-green-600 bg-green-100';
      case 'challenge': return 'text-orange-600 bg-orange-100';
      case 'prayer': return 'text-indigo-600 bg-indigo-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const completeActivity = async (activityId: string, index: number) => {
    try {
      await PersonalizationService.completeActivity(userId, selectedDay, activityId);
      
      // Atualiza estado local
      if (dayContent) {
        const updatedActivities = [...dayContent.activities];
        updatedActivities[index] = { ...updatedActivities[index], completed: true };
        setDayContent({ ...dayContent, activities: updatedActivities });
      }

      toast({
        title: "Atividade completa!",
        description: "Continue assim! 🎉",
      });
    } catch (error) {
      console.error('Erro ao completar atividade:', error);
      toast({
        title: "Erro",
        description: "Não foi possível marcar a atividade como completa",
        variant: "destructive",
      });
    }
  };

  const completeDayProgress = async () => {
    if (!dayContent) return;

    try {
      await PersonalizationService.completeDay(userId, selectedDay, dayContent.rewards.points);
      
      setUserProgress(prev => ({
        ...prev,
        completedDays: [...prev.completedDays, selectedDay],
        totalPoints: prev.totalPoints + dayContent.rewards.points,
        streak: prev.streak + 1,
        currentDay: selectedDay + 1
      }));

      toast({
        title: "Dia completo! 🎊",
        description: `Você ganhou ${dayContent.rewards.points} pontos!`,
      });

      // Avança para o próximo dia se disponível
      if (selectedDay < trackInfo.duration) {
        setSelectedDay(selectedDay + 1);
      }
    } catch (error) {
      console.error('Erro ao completar dia:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar seu progresso",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando conteúdo personalizado...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: trackInfo.color }}
              >
                <trackInfo.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {trackInfo.name}
                </h1>
                <p className="text-gray-600">{trackInfo.subtitle}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{userProgress.streak}</div>
                <div className="text-sm text-gray-600">Dias consecutivos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold" style={{ color: trackInfo.color }}>
                  {userProgress.totalPoints}
                </div>
                <div className="text-sm text-gray-600">Pontos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">Nível {userProgress.level}</div>
                <div className="text-sm text-gray-600">
                  {userProgress.level < 3 ? 'Iniciante' : userProgress.level < 7 ? 'Intermediário' : 'Avançado'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Progress Overview */}
          <div className="lg:col-span-1 space-y-6">
            {/* Progress Card */}
            <Card>
              <CardHeader>
                <CardTitle>Seu Progresso</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progresso Geral</span>
                      <span>{Math.round((userProgress.completedDays.length / trackInfo.duration) * 100)}%</span>
                    </div>
                    <Progress 
                      value={(userProgress.completedDays.length / trackInfo.duration) * 100}
                      className="h-3"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-xl font-bold text-gray-900">
                        {userProgress.completedDays.length}
                      </div>
                      <div className="text-sm text-gray-600">Dias completos</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-xl font-bold text-gray-900">
                        {trackInfo.duration - userProgress.completedDays.length}
                      </div>
                      <div className="text-sm text-gray-600">Dias restantes</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Calendar */}
            <Card>
              <CardHeader>
                <CardTitle>Calendário da Semana</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: Math.min(7, trackInfo.duration) }, (_, i) => {
                    const dayNum = i + 1 + Math.floor((selectedDay - 1) / 7) * 7;
                    if (dayNum > trackInfo.duration) return null;
                    
                    const isCompleted = userProgress.completedDays.includes(dayNum);
                    const isCurrent = dayNum === selectedDay;
                    const isLocked = dayNum > userProgress.currentDay;
                    
                    return (
                      <button
                        key={dayNum}
                        className={`aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all ${
                          isCompleted 
                            ? 'bg-green-500 text-white' 
                            : isCurrent 
                              ? 'bg-yellow-500 text-white ring-2 ring-yellow-200' 
                              : isLocked
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                        }`}
                        onClick={() => !isLocked && setSelectedDay(dayNum)}
                        disabled={isLocked}
                      >
                        {isCompleted ? <CheckCircle className="w-4 h-4" /> : 
                         isLocked ? <Lock className="w-4 h-4" /> : dayNum}
                      </button>
                    );
                  })}
                </div>
                
                <div className="mt-4 text-xs text-gray-600 space-y-1">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                    Completo
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-yellow-500 rounded mr-2"></div>
                    Hoje
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-gray-100 rounded mr-2"></div>
                    Bloqueado
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Today's Activity */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden">
              {/* Day Header */}
              <div 
                className="px-8 py-6 text-white"
                style={{ backgroundColor: trackInfo.color }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm opacity-90">Dia {selectedDay}</div>
                    <h2 className="text-2xl font-bold">{dayContent?.title}</h2>
                    <p className="opacity-90 mt-1">{dayContent?.description}</p>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-3xl font-bold">{dayContent?.rewards.points}</div>
                    <div className="text-sm opacity-90">pontos</div>
                  </div>
                </div>
                
                <div className="flex items-center mt-4 space-x-4">
                  <Badge variant="secondary" className={`${getTypeColor(dayContent?.mainFocus || '')}`}>
                    {dayContent?.mainFocus}
                  </Badge>
                  <div className="flex items-center text-sm opacity-90">
                    <Clock className="w-4 h-4 mr-1" />
                    {dayContent?.estimatedTime} min
                  </div>
                  <Badge variant="secondary">
                    Dificuldade: {dayContent?.difficulty === 'easy' ? 'Fácil' : dayContent?.difficulty === 'medium' ? 'Médio' : 'Difícil'}
                  </Badge>
                </div>
              </div>

              {/* Activities List */}
              <CardContent className="p-8">
                <h3 className="text-lg font-semibold mb-6">Atividades de Hoje</h3>
                
                {!dayContent?.activities || dayContent.activities.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Nenhuma atividade disponível para este dia.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {dayContent.activities.map((activity, index) => (
                      <div 
                        key={activity.id}
                        className={`border-2 rounded-xl p-6 transition-all ${
                          activity.completed 
                            ? 'border-green-200 bg-green-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className={`p-2 rounded-lg ${
                              activity.completed ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {getActivityIcon(activity.type)}
                            </div>
                            
                            <div>
                              <h4 className="font-semibold text-gray-900">{activity.title}</h4>
                              {activity.description && (
                                <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                              )}
                              <div className="flex items-center text-sm text-gray-600 mt-2">
                                <Clock className="w-4 h-4 mr-1" />
                                {activity.duration} min
                                {activity.isRequired && (
                                  <Badge variant="outline" className="ml-2">
                                    Obrigatório
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            {activity.completed ? (
                              <div className="flex items-center text-green-600 font-medium">
                                <CheckCircle className="w-5 h-5 mr-1" />
                                Completo
                              </div>
                            ) : (
                              <Button 
                                onClick={() => completeActivity(activity.id, index)}
                                size="sm"
                              >
                                Começar
                              </Button>
                            )}
                          </div>
                        </div>

                        {activity.instructions && activity.instructions.length > 0 && (
                          <div className="mt-4 pt-4 border-t">
                            <h5 className="text-sm font-medium text-gray-700 mb-2">Instruções:</h5>
                            <ol className="list-decimal list-inside space-y-1">
                              {activity.instructions.map((instruction, idx) => (
                                <li key={idx} className="text-sm text-gray-600">{instruction}</li>
                              ))}
                            </ol>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Day Completion */}
                {dayContent && (
                  <div className="mt-8 p-6 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">
                          Completar Dia {selectedDay}
                        </h4>
                        <p className="text-gray-600">
                          Finalize todas as atividades obrigatórias para ganhar {dayContent.rewards.points} pontos
                        </p>
                      </div>
                      
                      <Button
                        onClick={completeDayProgress}
                        disabled={!dayContent.activities.filter(a => a.isRequired).every(a => a.completed)}
                        className={`${
                          dayContent.activities.filter(a => a.isRequired).every(a => a.completed)
                            ? 'bg-green-600 hover:bg-green-700'
                            : ''
                        }`}
                      >
                        {userProgress.completedDays.includes(selectedDay) ? (
                          <>
                            <CheckCircle className="w-5 h-5 mr-2" />
                            Completo
                          </>
                        ) : (
                          <>
                            Finalizar Dia
                            <ChevronRight className="w-5 h-5 ml-2" />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DayViewManager;