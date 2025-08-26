import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  Target, 
  Book, 
  CheckCircle, 
  Calendar,
  Trophy,
  Lightbulb,
  Gift,
  ChevronLeft,
  ChevronRight,
  Star,
  Brain,
  Timer
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
// Note: equilibrioTrackData will be enhanced with daily content structure later

interface EquilibrioDayViewProps {
  userId: string;
  dayNumber: number;
  onNavigate: (day: number) => void;
  onComplete?: () => void;
}

interface ActivityProgress {
  [key: string]: boolean;
}

const EquilibrioDayView: React.FC<EquilibrioDayViewProps> = ({
  userId,
  dayNumber,
  onNavigate,
  onComplete
}) => {
  const [activityProgress, setActivityProgress] = useState<ActivityProgress>({});
  const [dayCompleted, setDayCompleted] = useState(false);
  const [totalPoints, setTotalPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  const [dayContent, setDayContent] = useState<any>(null);

  useEffect(() => {
    loadDayContent();
    loadProgress();
  }, [dayNumber]);

  const loadDayContent = async () => {
    try {
      const { data: content } = await supabase
        .from('track_daily_content')
        .select('*')
        .eq('track_slug', 'equilibrio')
        .eq('day_number', dayNumber)
        .single();

      if (content) {
        setDayContent({
          day: dayNumber,
          title: content.title,
          subtitle: content.objective,
          phase: 'EQUILIBRIO',
          difficulty: content.difficulty_level,
          maxPoints: content.max_points,
          devotional: {
            verse: content.devotional_verse,
            reflection: content.devotional_reflection,
            prayer: content.devotional_prayer
          },
          mainActivity: {
            title: content.main_activity_title,
            duration: 25, // Default duration
            content: content.main_activity_content
          },
          challenge: {
            title: content.main_challenge_title,
            description: content.main_challenge_content
          },
          bonus: {
            title: content.bonus_activity_title,
            content: content.bonus_activity_content
          }
        });
      }
    } catch (error) {
      console.error('Error loading day content:', error);
    }
  };

  const loadProgress = async () => {
    try {
      const { data: progress } = await supabase
        .from('user_activity_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('track_slug', 'equilibrio')
        .eq('day_number', dayNumber);

      if (progress) {
        const progressMap: ActivityProgress = {};
        progress.forEach(p => {
          progressMap[`${p.activity_type}_${p.activity_index}`] = true;
        });
        setActivityProgress(progressMap);
        
        const dayPoints = progress.reduce((sum, p) => sum + p.points_earned, 0);
        setTotalPoints(dayPoints);
        setDayCompleted(dayPoints >= (dayContent?.maxPoints || 120));
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleActivityToggle = async (activityKey: string, points: number, title: string, type: string) => {
    const isCompleted = !activityProgress[activityKey];
    
    try {
      if (isCompleted) {
        await supabase
          .from('user_activity_progress')
          .insert({
            user_id: userId,
            track_slug: 'equilibrio',
            day_number: dayNumber,
            activity_index: parseInt(activityKey.split('_')[1]),
            activity_title: title,
            activity_type: type,
            points_earned: points
          });
      } else {
        await supabase
          .from('user_activity_progress')
          .delete()
          .eq('user_id', userId)
          .eq('track_slug', 'equilibrio')
          .eq('day_number', dayNumber)
          .eq('activity_title', title);
      }

      setActivityProgress(prev => ({
        ...prev,
        [activityKey]: isCompleted
      }));

      const newPoints = isCompleted ? totalPoints + points : totalPoints - points;
      setTotalPoints(newPoints);
      
      if (newPoints >= (dayContent?.maxPoints || 120) && !dayCompleted) {
        setDayCompleted(true);
        await updateTrackProgress();
      }
    } catch (error) {
      console.error('Error updating activity:', error);
    }
  };

  const updateTrackProgress = async () => {
    try {
      const { data: trackProgress } = await supabase
        .from('user_track_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('track_slug', 'equilibrio')
        .single();

      if (trackProgress) {
        const newCurrentDay = Math.max(trackProgress.current_day, dayNumber + 1);
        const newTotalPoints = trackProgress.total_points + (dayContent?.maxPoints || 120);
        
        await supabase
          .from('user_track_progress')
          .update({
            current_day: newCurrentDay,
            total_points: newTotalPoints,
            last_activity_at: new Date().toISOString(),
            streak_days: dayNumber
          })
          .eq('id', trackProgress.id);

        await supabase.rpc('check_and_award_achievements', {
          p_user_id: userId,
          p_track_slug: 'equilibrio'
        });
      }
    } catch (error) {
      console.error('Error updating track progress:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 animate-spin mx-auto mb-4 border-4 border-yellow-500 border-t-transparent rounded-full"></div>
          <p>Carregando dia {dayNumber}...</p>
        </div>
      </div>
    );
  }

  if (!dayContent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Dia {dayNumber} não encontrado</h2>
          <p className="text-muted-foreground">Este conteúdo ainda não está disponível.</p>
        </div>
      </div>
    );
  }

  const progressPercentage = (totalPoints / dayContent.maxPoints) * 100;
  const completedActivities = Object.values(activityProgress).filter(Boolean).length;
  const totalActivities = 4; // Devocional, Atividade, Desafio, Bônus

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate(dayNumber - 1)}
                disabled={dayNumber === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              <div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-yellow-600" />
                  <span className="font-semibold text-yellow-600">Dia {dayNumber}</span>
                  {dayCompleted && <CheckCircle className="w-5 h-5 text-green-600" />}
                </div>
                <h1 className="text-2xl font-bold">{dayContent.title}</h1>
                <p className="text-muted-foreground">{dayContent.subtitle}</p>
                <Badge variant="outline" className="mt-1">
                  <Brain className="w-3 h-3 mr-1" />
                  {dayContent.phase}
                </Badge>
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span className="font-semibold">{totalPoints}/{dayContent.maxPoints} pontos</span>
              </div>
              <Progress value={progressPercentage} className="w-32" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant={dayContent.difficulty <= 2 ? "secondary" : 
                          dayContent.difficulty <= 3 ? "default" : "destructive"}>
              {Array.from({ length: dayContent.difficulty }, (_, i) => (
                <Star key={i} className="w-3 h-3 fill-current" />
              ))}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {completedActivities} de {totalActivities} atividades concluídas
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        <Tabs defaultValue="devocional" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="devocional" className="flex items-center gap-2">
              <Book className="w-4 h-4" />
              Devocional
            </TabsTrigger>
            <TabsTrigger value="atividade" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Técnica Principal
            </TabsTrigger>
            <TabsTrigger value="desafio" className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              Desafio
            </TabsTrigger>
            <TabsTrigger value="bonus" className="flex items-center gap-2">
              <Gift className="w-4 h-4" />
              Bônus
            </TabsTrigger>
          </TabsList>

          {/* Devocional */}
          <TabsContent value="devocional">
            <Card className="border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Book className="w-5 h-5 text-blue-600" />
                    Devocional Matinal
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={activityProgress['devotional_0'] || false}
                      onCheckedChange={() => handleActivityToggle('devotional_0', 30, 'Devocional Matinal', 'devotional')}
                    />
                    <Badge variant="outline">30 pts</Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">Versículo:</h3>
                  <p className="text-blue-800 italic">"{dayContent.devotional.verse}"</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Reflexão:</h3>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {dayContent.devotional.reflection}
                  </p>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-purple-900 mb-2">Oração:</h3>
                  <p className="text-purple-800 italic">"{dayContent.devotional.prayer}"</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Técnica Principal */}
          <TabsContent value="atividade">
            <Card className="border-yellow-200">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-yellow-600" />
                    {dayContent.mainActivity.title}
                  </div>
                  <div className="flex items-center gap-2">
                    <Timer className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm">{dayContent.mainActivity.duration} min</span>
                    <Checkbox
                      checked={activityProgress['activity_0'] || false}
                      onCheckedChange={() => handleActivityToggle('activity_0', 40, dayContent.mainActivity.title, 'main_activity')}
                    />
                    <Badge variant="outline">40 pts</Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <div className="whitespace-pre-line text-muted-foreground">
                    {dayContent.mainActivity.content}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Desafio */}
          <TabsContent value="desafio">
            <Card className="border-orange-200">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-orange-600" />
                    {dayContent.challenge.title}
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={activityProgress['challenge_0'] || false}
                      onCheckedChange={() => handleActivityToggle('challenge_0', 30, dayContent.challenge.title, 'challenge')}
                    />
                    <Badge variant="outline">30 pts</Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <div className="whitespace-pre-line text-muted-foreground">
                    {dayContent.challenge.description}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bônus */}
          <TabsContent value="bonus">
            <Card className="border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Gift className="w-5 h-5 text-purple-600" />
                    {dayContent.bonus.title}
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={activityProgress['bonus_0'] || false}
                      onCheckedChange={() => handleActivityToggle('bonus_0', 20, dayContent.bonus.title, 'bonus')}
                    />
                    <Badge variant="outline">20 pts</Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <div className="whitespace-pre-line text-muted-foreground">
                    {dayContent.bonus.content}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Progress Summary */}
        <Card className="mt-6 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Resumo do Progresso - Dia {dayNumber}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Progresso do dia</span>
                <div className="flex items-center gap-2">
                  <Progress value={progressPercentage} className="w-32" />
                  <span className="text-sm font-medium">{Math.round(progressPercentage)}%</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="text-lg font-bold text-blue-600">
                    {activityProgress['devotional_0'] ? '✓' : '○'}
                  </div>
                  <div className="text-xs text-blue-600">Devocional</div>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <div className="text-lg font-bold text-yellow-600">
                    {activityProgress['activity_0'] ? '✓' : '○'}
                  </div>
                  <div className="text-xs text-yellow-600">Técnica</div>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg">
                  <div className="text-lg font-bold text-orange-600">
                    {activityProgress['challenge_0'] ? '✓' : '○'}
                  </div>
                  <div className="text-xs text-orange-600">Desafio</div>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <div className="text-lg font-bold text-purple-600">
                    {activityProgress['bonus_0'] ? '✓' : '○'}
                  </div>
                  <div className="text-xs text-purple-600">Bônus</div>
                </div>
              </div>

              {dayCompleted && (
                <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <h3 className="font-bold text-green-800">Parabéns! Dia {dayNumber} Completo!</h3>
                  <p className="text-green-700 text-sm">
                    Você conquistou {totalPoints} pontos e está mais próximo do equilíbrio digital!
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Navigation Footer */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t">
          <Button
            variant="outline"
            onClick={() => onNavigate(dayNumber - 1)}
            disabled={dayNumber === 1}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Dia Anterior
          </Button>

          <div className="text-center">
            <div className="text-sm text-muted-foreground">
              Trilha Equilíbrio: {dayNumber}/21 dias
            </div>
            {dayCompleted && (
              <Badge className="bg-green-600 mt-1">
                <CheckCircle className="w-4 h-4 mr-2" />
                Completo!
              </Badge>
            )}
          </div>

          <Button
            onClick={() => onNavigate(dayNumber + 1)}
            disabled={dayNumber === 21}
            className="bg-yellow-600 hover:bg-yellow-700"
          >
            Próximo Dia
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EquilibrioDayView;