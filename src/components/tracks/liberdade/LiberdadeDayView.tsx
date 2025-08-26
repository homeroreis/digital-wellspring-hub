import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronLeft, ChevronRight, Calendar, Target, Book, Zap, Gift, CheckCircle, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { usePersonalizedContent, usePersonalizedActivities, getProfileBasedRecommendations } from '@/hooks/usePersonalizedContent';

interface LiberdadeDayViewProps {
  userId: string;
  currentDay: number;
  onDayChange: (day: number) => void;
  onTrackComplete?: () => void;
}

const LiberdadeDayView: React.FC<LiberdadeDayViewProps> = ({
  userId,
  currentDay,
  onDayChange,
  onTrackComplete
}) => {
  const [completedActivities, setCompletedActivities] = useState<Set<number>>(new Set());
  const [totalPoints, setTotalPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  // Hook para conteúdo personalizado
  const { personalizedContent, loading: contentLoading, error: contentError } = usePersonalizedContent(userId, 'liberdade', currentDay);
  const { activities, loading: activitiesLoading } = usePersonalizedActivities(userId, 'liberdade', currentDay);

  const progress = ((currentDay - 1) / 7) * 100;

  useEffect(() => {
    loadProgress();
  }, [userId, currentDay]);

  const loadProgress = async () => {
    try {
      const { data: progress } = await supabase
        .from('user_activity_progress')
        .select('activity_index, points_earned')
        .eq('user_id', userId)
        .eq('track_slug', 'liberdade')
        .eq('day_number', currentDay);

      if (progress) {
        const completed = new Set(progress.map(p => p.activity_index));
        const points = progress.reduce((sum, p) => sum + p.points_earned, 0);
        setCompletedActivities(completed);
        setTotalPoints(points);
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleActivityToggle = async (activityIndex: number, points: number, checked: boolean) => {
    try {
      if (checked) {
        // Marcar como concluída
        await supabase
          .from('user_activity_progress')
          .insert({
            user_id: userId,
            track_slug: 'liberdade',
            day_number: currentDay,
            activity_index: activityIndex,
            activity_title: activities[activityIndex]?.activity_title || '',
            activity_type: 'daily',
            points_earned: points
          });

        setCompletedActivities(prev => new Set(prev).add(activityIndex));
        setTotalPoints(prev => prev + points);
        
        toast.success(`+${points} pontos!`);
      } else {
        // Desmarcar
        await supabase
          .from('user_activity_progress')
          .delete()
          .eq('user_id', userId)
          .eq('track_slug', 'liberdade')
          .eq('day_number', currentDay)
          .eq('activity_index', activityIndex);

        setCompletedActivities(prev => {
          const newSet = new Set(prev);
          newSet.delete(activityIndex);
          return newSet;
        });
        setTotalPoints(prev => prev - points);
      }

      // Verificar se o dia foi completado
      const newTotal = checked ? totalPoints + points : totalPoints - points;
      if (newTotal >= (personalizedContent?.max_points || 100)) {
        await updateTrackProgress(newTotal);
      }
    } catch (error) {
      console.error('Error toggling activity:', error);
      toast.error('Erro ao atualizar atividade');
    }
  };

  const updateTrackProgress = async (dayPoints: number) => {
    try {
      const { data: trackProgress } = await supabase
        .from('user_track_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('track_slug', 'liberdade')
        .single();

      if (trackProgress) {
        const newCurrentDay = Math.max(trackProgress.current_day, currentDay + 1);
        
        await supabase
          .from('user_track_progress')
          .update({
            current_day: newCurrentDay,
            total_points: trackProgress.total_points + dayPoints,
            last_activity_at: new Date().toISOString(),
            streak_days: trackProgress.streak_days + 1
          })
          .eq('id', trackProgress.id);

        // Verificar conquistas
        await supabase.rpc('check_and_award_achievements', {
          p_user_id: userId,
          p_track_slug: 'liberdade'
        });

        toast.success('Dia completado! 🎉');
        
        if (currentDay === 7) {
          toast.success('Parabéns! Você completou a Trilha Liberdade! 🏆');
          onTrackComplete?.();
        }
      }
    } catch (error) {
      console.error('Error updating track progress:', error);
    }
  };

  if (loading || contentLoading || activitiesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando seu conteúdo personalizado...</p>
        </div>
      </div>
    );
  }

  if (contentError || !personalizedContent) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Erro ao carregar conteúdo</h2>
          <p className="text-muted-foreground mb-4">{contentError || 'Não conseguimos encontrar o conteúdo para este dia.'}</p>
          <Button onClick={() => onDayChange(1)}>Voltar ao Dia 1</Button>
        </div>
      </div>
    );
  }

  // Obter recomendações baseadas no perfil
  const recommendations = (personalizedContent as any)._personalization ? 
    getProfileBasedRecommendations(
      (personalizedContent as any)._personalization.mostAffectedArea,
      (personalizedContent as any)._personalization.userScore
    ) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <Calendar className="w-5 h-5 text-primary" />
          <h1 className="text-3xl font-bold">{personalizedContent.title}</h1>
          <Badge variant="outline" className="track-border-liberdade">
            Dia {currentDay}/7
          </Badge>
          {(personalizedContent as any)._personalization?.appliedRules?.length > 0 && (
            <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-purple-200">
              <Sparkles className="w-3 h-3 mr-1" />
              Personalizado
            </Badge>
          )}
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-primary" />
            <span className="font-semibold">Objetivo do Dia:</span>
          </div>
          <p className="text-muted-foreground">{personalizedContent.objective}</p>
        </div>

        {/* Seção de personalização */}
        {recommendations && (
          <Card className="mb-6 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2 text-purple-800">
                <Sparkles className="w-5 h-5" />
                Recomendações Personalizadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-purple-700 font-medium mb-3">{recommendations.focus}</p>
              <ul className="space-y-2">
                {recommendations.tips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-purple-600">
                    <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    {tip}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progresso da Trilha</span>
            <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Devocional */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Book className="w-5 h-5" />
              Devocional
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Versículo do Dia</h4>
              <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground">
                {personalizedContent.devotional_verse}
              </blockquote>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Reflexão</h4>
              <p className="text-muted-foreground leading-relaxed">
                {personalizedContent.devotional_reflection}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Oração</h4>
              <p className="text-muted-foreground leading-relaxed italic">
                {personalizedContent.devotional_prayer}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Atividade Principal */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              {personalizedContent.main_activity_title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-line text-muted-foreground">
                {personalizedContent.main_activity_content}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Desafio Principal */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              {personalizedContent.main_challenge_title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-line text-muted-foreground">
                {personalizedContent.main_challenge_content}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Atividade Bônus */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5" />
              {personalizedContent.bonus_activity_title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-line text-muted-foreground">
                {personalizedContent.bonus_activity_content}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Checklist de Atividades */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Atividades do Dia
              <Badge variant="secondary">
                {totalPoints}/{personalizedContent.max_points} pontos
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activities.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                  <Checkbox
                    id={`activity-${index}`}
                    checked={completedActivities.has(index)}
                    onCheckedChange={(checked) => handleActivityToggle(index, activity.points_value, checked as boolean)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <label 
                      htmlFor={`activity-${index}`}
                      className={`font-medium cursor-pointer ${completedActivities.has(index) ? 'line-through text-muted-foreground' : ''}`}
                    >
                      {activity.activity_title}
                    </label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {activity.activity_description}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {activity.points_value} pontos
                      </Badge>
                      {activity.is_required && (
                        <Badge variant="destructive" className="text-xs">
                          Obrigatório
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => onDayChange(currentDay - 1)}
            disabled={currentDay === 1}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Dia Anterior
          </Button>
          
          <Button
            onClick={() => onDayChange(currentDay + 1)}
            disabled={currentDay === 7}
          >
            Próximo Dia
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LiberdadeDayView;