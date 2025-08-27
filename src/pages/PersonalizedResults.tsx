import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Calendar, Trophy, Flame, Target, CheckCircle, Clock, Lock, ChevronLeft, ChevronRight, PlayCircle, BookOpen, Heart, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import {
  useWeekDays,
  useDayDetail,
  useTrackProgress,
  useCompleteActivity,
  useCompleteDay,
  type WeekDay,
  type DayDetail,
  type DayActivity,
} from '@/hooks/useTrackRPCs';

interface TracksPanelProps {
  trackSlug: string;
  trackTitle: string;
  maxDays?: number;
}

// Helper to safely render HTML content
const renderHtml = (htmlContent: string) => {
  return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />;
};

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'video': return <PlayCircle className="w-5 h-5" />;
    case 'article': return <BookOpen className="w-5 h-5" />;
    case 'exercise': return <Target className="w-5 h-5" />;
    case 'reflection': return <Heart className="w-5 h-5" />;
    case 'challenge': return <Trophy className="w-5 h-5" />;
    default: return <CheckCircle className="w-5 h-5" />;
  }
};

const PersonalizedResults = () => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  // Get track data from URL params or use defaults
  const trackSlug = searchParams.get('track') || 'equilibrio';
  const trackTitle = searchParams.get('title') || 'Trilha Equilíbrio';
  const maxDays = parseInt(searchParams.get('maxDays') || '21');
  
  const [selectedDay, setSelectedDay] = useState(1);
  const [currentWeek, setCurrentWeek] = useState(1);

  const totalWeeks = Math.ceil(maxDays / 7);
  const weekStartDay = (currentWeek - 1) * 7 + 1;

  // Data queries
  const { data: weekDays, isLoading: weekLoading } = useWeekDays(trackSlug, weekStartDay);
  const { data: dayDetail, isLoading: dayLoading } = useDayDetail(trackSlug, selectedDay);
  const { data: trackProgress } = useTrackProgress(trackSlug);

  // Mutations
  const completeActivityMutation = useCompleteActivity();
  const completeDayMutation = useCompleteDay();

  const handleActivityComplete = async (activityIndex: number, activityTitle: string) => {
    try {
      await completeActivityMutation.mutateAsync({
        trackSlug,
        dayNumber: selectedDay,
        activityIndex,
        activityTitle,
      });
      
      toast({
        title: 'Atividade concluída!',
        description: `Você completou: ${activityTitle}`,
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível completar a atividade.',
        variant: 'destructive',
      });
    }
  };

  const handleDayComplete = async () => {
    try {
      const result = await completeDayMutation.mutateAsync({
        trackSlug,
        dayNumber: selectedDay,
      });

      if (result.success) {
        toast({
          title: 'Dia concluído!',
          description: `Parabéns! Você completou o dia ${selectedDay}.`,
        });
        if (selectedDay < maxDays) {
          const nextDay = selectedDay + 1;
          setSelectedDay(nextDay);
          const nextWeek = Math.ceil(nextDay / 7);
          if (nextWeek !== currentWeek) {
            setCurrentWeek(nextWeek);
          }
        }
      } else {
        toast({
          title: 'Atividades pendentes',
          description: result.message || 'Complete todas as atividades obrigatórias primeiro.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível finalizar o dia.',
        variant: 'destructive',
      });
    }
  };

  const getDayStatus = (day: WeekDay) => {
    if (day.day_completed) return 'completed';
    if (day.day_number === selectedDay) return 'current';
    if (day.day_number <= (trackProgress?.current_day || 1)) return 'available';
    return 'locked';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'current':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'locked':
        return <Lock className="h-4 w-4 text-gray-400" />;
      default:
        return <Target className="h-4 w-4 text-gray-600" />;
    }
  };

  if (weekLoading || dayLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-32 bg-muted rounded-lg" />
        <div className="h-20 bg-muted rounded-lg" />
        <div className="h-96 bg-muted rounded-lg" />
      </div>
    );
  }

  const allActivitiesCompleted = dayDetail?.activities?.every((activity: DayActivity) => 
    !activity.activity.is_required || activity.completed
  ) || false;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pontos Totais</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {trackProgress?.total_points || 0}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sequência</CardTitle>
            <Flame className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {trackProgress?.streak_days || 0} dias
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nível</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {trackProgress?.level_number || 1}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Week Calendar */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {trackTitle} - Semana {currentWeek}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (currentWeek > 1) {
                    setCurrentWeek(currentWeek - 1);
                    setSelectedDay((currentWeek - 2) * 7 + 1);
                  }
                }}
                disabled={currentWeek <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                {currentWeek} de {totalWeeks}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (currentWeek < totalWeeks) {
                    setCurrentWeek(currentWeek + 1);
                    setSelectedDay(currentWeek * 7 + 1);
                  }
                }}
                disabled={currentWeek >= totalWeeks}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {weekDays?.map((day: WeekDay) => {
              const status = getDayStatus(day);
              const isSelected = day.day_number === selectedDay;
              
              return (
                <Button
                  key={day.day_number}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  className={`h-16 flex flex-col items-center justify-center gap-1 ${
                    status === 'locked' ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  onClick={() => {
                    if (status !== 'locked') {
                      setSelectedDay(day.day_number);
                    }
                  }}
                  disabled={status === 'locked'}
                >
                  <div className="flex items-center justify-center">
                    {getStatusIcon(status)}
                  </div>
                  <span className="text-xs">Dia {day.day_number}</span>
                  {status === 'completed' && (
                    <Badge variant="secondary" className="text-xs px-1 py-0">
                      {day.activities_completed}/{day.total_activities}
                    </Badge>
                  )}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Day Content */}
      {dayDetail && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl" dangerouslySetInnerHTML={{ __html: dayDetail.day_content?.title }} />
                <p className="text-muted-foreground mt-1" dangerouslySetInnerHTML={{ __html: dayDetail.day_content?.objective }} />
              </div>
              <Badge variant="outline">
                Dia {dayDetail.day_content?.day_number}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Devotional Section */}
            {dayDetail.day_content?.devotional_verse && (
              <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                <h3 className="font-semibold text-primary">Devocional</h3>
                <blockquote className="italic border-l-4 border-primary pl-4" dangerouslySetInnerHTML={{ __html: dayDetail.day_content.devotional_verse }} />
                <p className="text-sm text-muted-foreground" dangerouslySetInnerHTML={{ __html: dayDetail.day_content.devotional_reflection }} />
                {dayDetail.day_content.devotional_prayer && (
                  <div className="mt-3">
                    <p className="font-medium text-sm">Oração:</p>
                    <p className="text-sm italic" dangerouslySetInnerHTML={{ __html: dayDetail.day_content.devotional_prayer }} />
                  </div>
                )}
              </div>
            )}

            {/* Main Activity */}
            {dayDetail.day_content?.main_activity_title && (
              <div className="space-y-3">
                <h3 className="font-semibold text-primary" dangerouslySetInnerHTML={{ __html: dayDetail.day_content.main_activity_title }} />
                <p className="text-sm" dangerouslySetInnerHTML={{ __html: dayDetail.day_content.main_activity_content }} />
              </div>
            )}

            {/* Activities List */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Target className="h-4 w-4" />
                Atividades do Dia
              </h3>
              
              <div className="space-y-3">
                {dayDetail.activities?.map((activityData: DayActivity, index: number) => {
                  const activity = activityData.activity;
                  const isCompleted = activityData.completed;
                  
                  return (
                    <div
                      key={activity.id}
                      className={`p-4 rounded-lg border ${
                        isCompleted ? 'bg-green-50 border-green-200' : 'bg-card'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium" dangerouslySetInnerHTML={{ __html: activity.activity_title }} />
                            {activity.is_required && (
                              <Badge variant="secondary" className="text-xs">
                                Obrigatório
                              </Badge>
                            )}
                            {isCompleted && (
                              <Badge variant="default" className="text-xs bg-green-500">
                                Concluído
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground" dangerouslySetInnerHTML={{ __html: activity.activity_description }} />
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Trophy className="h-3 w-3" />
                            {activity.points_value} pontos
                          </div>
                        </div>
                        
                        {!isCompleted && (
                          <Button
                            size="sm"
                            onClick={() => handleActivityComplete(activity.sort_order, activity.activity_title)}
                            disabled={completeActivityMutation.isPending}
                          >
                            {completeActivityMutation.isPending ? 'Salvando...' : 'Começar'}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Day Progress */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Progresso do Dia</span>
                <span className="text-sm text-muted-foreground">
                  {dayDetail.activities?.filter((a: DayActivity) => a.completed).length || 0} / {dayDetail.activities?.length || 0}
                </span>
              </div>
              <Progress 
                value={((dayDetail.activities?.filter((a: DayActivity) => a.completed).length || 0) / (dayDetail.activities?.length || 1)) * 100} 
                className="h-2"
              />
            </div>

            {/* Complete Day Button */}
            <div className="flex justify-center pt-4">
              <Button
                size="lg"
                onClick={handleDayComplete}
                disabled={!allActivitiesCompleted || completeDayMutation.isPending || dayDetail.day_completed}
                className="px-8"
              >
                {dayDetail.day_completed 
                  ? 'Dia Concluído' 
                  : completeDayMutation.isPending 
                    ? 'Finalizando...' 
                    : 'Finalizar Dia'
                }
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PersonalizedResults;
