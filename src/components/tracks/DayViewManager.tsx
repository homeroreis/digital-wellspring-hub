import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock, Star, ArrowLeft, ArrowRight, Award, Target } from 'lucide-react';
import { liberdadeContent } from '@/data/tracks/liberdade-content';
import { equilibrioTrackData } from '@/data/tracks/equilibrio-content';
import { renovacaoTrackData } from '@/data/tracks/renovacao-content';

interface DayContent {
  day_number: number;
  title: string;
  objective: string;
  devotional_verse: string;
  devotional_reflection: string;
  devotional_prayer: string;
  main_activity_title: string;
  main_activity_content: string;
  main_challenge_title: string;
  main_challenge_content: string;
  bonus_activity_title?: string;
  bonus_activity_content?: string;
  max_points: number;
  difficulty_level: number;
  activities: Array<{
    title: string;
    description: string;
    points: number;
    required: boolean;
  }>;
}

interface DayViewManagerProps {
  userId: string;
  trackSlug: string;
  dayNumber: number;
  onNavigate: (day: number) => void;
  onComplete: () => void;
}

const DayViewManager: React.FC<DayViewManagerProps> = ({
  userId,
  trackSlug,
  dayNumber,
  onNavigate,
  onComplete
}) => {
  const [dayContent, setDayContent] = useState<DayContent | null>(null);
  const [completedActivities, setCompletedActivities] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [totalPoints, setTotalPoints] = useState(0);
  const [maxDays, setMaxDays] = useState(7);

  useEffect(() => {
    loadDayContent();
    loadUserProgress();
  }, [trackSlug, dayNumber]);

  const loadDayContent = () => {
    let content: DayContent | undefined;
    let maxDaysForTrack = 7;

    try {
      switch (trackSlug) {
        case 'liberdade':
          content = liberdadeContent.find(c => c.day_number === dayNumber);
          maxDaysForTrack = 7;
          break;
        case 'equilibrio':
          // Para equilibrio, usar dados mock por enquanto
          if (dayNumber <= 21) {
            content = {
              day_number: dayNumber,
              title: `Dia ${dayNumber} - Equilíbrio`,
              objective: "Desenvolver uso consciente da tecnologia",
              devotional_verse: "Tudo tem o seu tempo determinado - Eclesiastes 3:1",
              devotional_reflection: "Hoje é um dia para encontrar equilíbrio digital.",
              devotional_prayer: "Senhor, me ajude a usar a tecnologia com sabedoria.",
              main_activity_title: "Atividade de Equilíbrio",
              main_activity_content: "Pratique 30 minutos de atividade sem telas.",
              main_challenge_title: "Desafio do Equilíbrio",
              main_challenge_content: "Mantenha o celular em silêncio por 2 horas.",
              max_points: 100,
              difficulty_level: 2,
              activities: [
                { title: "Devocional completo", description: "Leia verso, reflexão e oração", points: 20, required: true },
                { title: "Atividade principal", description: "Atividade de Equilíbrio", points: 40, required: true },
                { title: "Desafio do dia", description: "Desafio do Equilíbrio", points: 30, required: true },
                { title: "Atividade bônus", description: "Atividade opcional", points: 10, required: false }
              ]
            };
          }
          maxDaysForTrack = 21;
          break;
        case 'renovacao':
          // Para renovacao, usar dados mock por enquanto  
          if (dayNumber <= 40) {
            content = {
              day_number: dayNumber,
              title: `Dia ${dayNumber} - Renovação`,
              objective: "Transformação profunda e renovação total",
              devotional_verse: "Portanto, se alguém está em Cristo, é nova criatura - 2 Coríntios 5:17",
              devotional_reflection: "Hoje é um dia de renovação e transformação profunda.",
              devotional_prayer: "Senhor, renova-me completamente. Quebra toda dependência.",
              main_activity_title: "Atividade de Renovação",
              main_activity_content: "Pratique 60 minutos de atividades sem qualquer tela.",
              main_challenge_title: "Desafio Radical",
              main_challenge_content: "Mantenha-se longe de todas as telas por 4 horas.",
              max_points: 200,
              difficulty_level: 5,
              activities: [
                { title: "Devocional completo", description: "Leia verso, reflexão e oração", points: 30, required: true },
                { title: "Atividade principal", description: "Atividade de Renovação", points: 50, required: true },
                { title: "Desafio crítico", description: "Desafio Radical", points: 40, required: true },
                { title: "Atividade bônus", description: "Atividade opcional", points: 20, required: false }
              ]
            };
          }
          maxDaysForTrack = 40;
          break;
      }

      setDayContent(content || null);
      setMaxDays(maxDaysForTrack);
    } catch (error) {
      console.error('Erro ao carregar conteúdo do dia:', error);
      setDayContent(null);
    } finally {
      setLoading(false);
    }
  };

  const loadUserProgress = async () => {
    try {
      const { data } = await supabase
        .from('user_activity_progress')
        .select('activity_index, points_earned')
        .eq('user_id', userId)
        .eq('track_slug', trackSlug)
        .eq('day_number', dayNumber);

      if (data) {
        const completed = new Set(data.map(item => item.activity_index));
        const points = data.reduce((sum, item) => sum + item.points_earned, 0);
        setCompletedActivities(completed);
        setTotalPoints(points);
      }
    } catch (error) {
      console.error('Erro ao carregar progresso:', error);
    }
  };

  const handleActivityComplete = async (activityIndex: number, points: number) => {
    if (completedActivities.has(activityIndex)) return;

    try {
      await supabase.from('user_activity_progress').insert({
        user_id: userId,
        track_slug: trackSlug,
        day_number: dayNumber,
        activity_index: activityIndex,
        activity_type: 'daily',
        activity_title: dayContent?.activities[activityIndex]?.title || '',
        points_earned: points
      });

      setCompletedActivities(prev => new Set([...prev, activityIndex]));
      setTotalPoints(prev => prev + points);

      // Update track progress - simplified for now
      const { data: existingProgress } = await supabase
        .from('user_track_progress')
        .select('total_points')
        .eq('user_id', userId)
        .eq('track_slug', trackSlug)
        .single();

      if (existingProgress) {
        await supabase
          .from('user_track_progress')
          .update({ 
            total_points: existingProgress.total_points + points,
            last_activity_at: new Date().toISOString()
          })
          .eq('user_id', userId)
          .eq('track_slug', trackSlug);
      }

    } catch (error) {
      console.error('Erro ao marcar atividade como completa:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 animate-spin mx-auto mb-4 border-4 border-primary border-t-transparent rounded-full"></div>
          <p>Carregando conteúdo do dia...</p>
        </div>
      </div>
    );
  }

  if (!dayContent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <Target className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2 text-red-600">Conteúdo não encontrado</h2>
            <p className="text-muted-foreground mb-4">
              Não foi possível carregar o conteúdo para o dia {dayNumber} da trilha {trackSlug}.
            </p>
            <Button onClick={() => onNavigate(1)} variant="outline">
              Voltar ao início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const progressPercentage = (totalPoints / dayContent.max_points) * 100;
  const isCompleted = progressPercentage >= 100;
  const requiredActivitiesCompleted = dayContent.activities
    .filter(activity => activity.required)
    .every((_, index) => completedActivities.has(index));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Button
              onClick={() => onNavigate(Math.max(1, dayNumber - 1))}
              variant="outline"
              disabled={dayNumber <= 1}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Dia Anterior
            </Button>
            
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900">
                Dia {dayNumber} - {dayContent.title}
              </h1>
              <p className="text-gray-600 mt-1">{dayContent.objective}</p>
            </div>

            <Button
              onClick={() => onNavigate(Math.min(maxDays, dayNumber + 1))}
              variant="outline"
              disabled={dayNumber >= maxDays}
            >
              Próximo Dia
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {/* Progress */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold">Progresso do Dia</span>
              <span className="text-2xl font-bold text-primary">
                {totalPoints}/{dayContent.max_points} pts
              </span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
            {isCompleted && (
              <div className="flex items-center justify-center mt-2 text-green-600">
                <CheckCircle className="w-5 h-5 mr-2" />
                <span className="font-semibold">Dia Concluído!</span>
              </div>
            )}
          </div>
        </div>

        {/* Devotional */}
        <Card className="mb-6 border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <Star className="w-6 h-6 mr-2 text-purple-500" />
              Devocional do Dia
            </h2>
            <div className="space-y-4">
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="font-semibold text-purple-800 italic">
                  "{dayContent.devotional_verse}"
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Reflexão:</h3>
                <p className="text-gray-700 leading-relaxed">
                  {dayContent.devotional_reflection}
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Oração:</h3>
                <p className="text-gray-700 italic leading-relaxed">
                  {dayContent.devotional_prayer}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Activity */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <Target className="w-6 h-6 mr-2 text-blue-500" />
              {dayContent.main_activity_title}
            </h2>
            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap text-gray-700">
                {dayContent.main_activity_content}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Challenge */}
        <Card className="mb-6 border-l-4 border-l-orange-500">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <Award className="w-6 h-6 mr-2 text-orange-500" />
              {dayContent.main_challenge_title}
            </h2>
            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap text-gray-700">
                {dayContent.main_challenge_content}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bonus Activity */}
        {dayContent.bonus_activity_title && (
          <Card className="mb-6 border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <Star className="w-6 h-6 mr-2 text-green-500" />
                {dayContent.bonus_activity_title}
              </h2>
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap text-gray-700">
                  {dayContent.bonus_activity_content}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Activities Checklist */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-4">Atividades do Dia</h2>
            <div className="space-y-3">
              {dayContent.activities.map((activity, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                    completedActivities.has(index)
                      ? 'border-green-200 bg-green-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleActivityComplete(index, activity.points)}
                      disabled={completedActivities.has(index)}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        completedActivities.has(index)
                          ? 'border-green-500 bg-green-500'
                          : 'border-gray-300 hover:border-primary'
                      }`}
                    >
                      {completedActivities.has(index) && (
                        <CheckCircle className="w-4 h-4 text-white" />
                      )}
                    </button>
                    <div>
                      <h3 className="font-semibold">{activity.title}</h3>
                      <p className="text-sm text-gray-600">{activity.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-primary">{activity.points} pts</div>
                    <div className="text-xs text-gray-500">
                      {activity.required ? 'Obrigatória' : 'Opcional'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            onClick={() => onNavigate(Math.max(1, dayNumber - 1))}
            variant="outline"
            disabled={dayNumber <= 1}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Dia {dayNumber - 1}
          </Button>

          {requiredActivitiesCompleted && dayNumber < maxDays && (
            <Button
              onClick={() => onNavigate(dayNumber + 1)}
              className="bg-primary hover:bg-primary/90"
            >
              Continuar para Dia {dayNumber + 1}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}

          {dayNumber === maxDays && isCompleted && (
            <Button
              onClick={onComplete}
              className="bg-green-600 hover:bg-green-700"
            >
              <Award className="w-4 h-4 mr-2" />
              Concluir Trilha
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DayViewManager;