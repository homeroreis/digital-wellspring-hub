import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  Flame,
  Timer,
  AlertTriangle,
  Shield
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { renovacaoTrackData } from '@/data/tracks/renovacao-content';

interface RenovacaoDayViewProps {
  userId: string;
  dayNumber: number;
  onNavigate: (day: number) => void;
  onComplete?: () => void;
}

interface ActivityProgress {
  [key: string]: boolean;
}

const RenovacaoDayView: React.FC<RenovacaoDayViewProps> = ({
  userId,
  dayNumber,
  onNavigate,
  onComplete
}) => {
  const [activityProgress, setActivityProgress] = useState<ActivityProgress>({});
  const [dayCompleted, setDayCompleted] = useState(false);
  const [totalPoints, setTotalPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  // Get day content from renovacaoTrackData
  const dayContent = renovacaoTrackData.dailyContent.find(day => day.day === dayNumber);

  useEffect(() => {
    loadProgress();
  }, [dayNumber]);

  const loadProgress = async () => {
    try {
      const { data: progress } = await supabase
        .from('user_activity_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('track_slug', 'renovacao')
        .eq('day_number', dayNumber);

      if (progress) {
        const progressMap: ActivityProgress = {};
        progress.forEach(p => {
          progressMap[`${p.activity_type}_${p.activity_index}`] = true;
        });
        setActivityProgress(progressMap);
        
        const dayPoints = progress.reduce((sum, p) => sum + p.points_earned, 0);
        setTotalPoints(dayPoints);
        setDayCompleted(dayPoints >= (dayContent?.maxPoints || 200));
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
            track_slug: 'renovacao',
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
          .eq('track_slug', 'renovacao')
          .eq('day_number', dayNumber)
          .eq('activity_title', title);
      }

      setActivityProgress(prev => ({
        ...prev,
        [activityKey]: isCompleted
      }));

      const newPoints = isCompleted ? totalPoints + points : totalPoints - points;
      setTotalPoints(newPoints);
      
      if (newPoints >= (dayContent?.maxPoints || 200) && !dayCompleted) {
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
        .eq('track_slug', 'renovacao')
        .single();

      if (trackProgress) {
        const newCurrentDay = Math.max(trackProgress.current_day, dayNumber + 1);
        const newTotalPoints = trackProgress.total_points + (dayContent?.maxPoints || 200);
        
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
          p_track_slug: 'renovacao'
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
          <div className="w-8 h-8 animate-spin mx-auto mb-4 border-4 border-red-500 border-t-transparent rounded-full"></div>
          <p>Carregando dia {dayNumber} da guerra...</p>
        </div>
      </div>
    );
  }

  if (!dayContent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-red-700">Dia {dayNumber} - Em preparação</h2>
          <p className="text-muted-foreground">Este conteúdo intensivo ainda está sendo finalizado.</p>
          <p className="text-red-600 mt-2">A guerra continua - volte em breve!</p>
        </div>
      </div>
    );
  }

  const progressPercentage = (totalPoints / dayContent.maxPoints) * 100;
  const completedActivities = Object.values(activityProgress).filter(Boolean).length;
  const totalActivities = 4; // Devocional, Atividade, Desafio, Bônus

  // Get phase info
  const currentPhase = renovacaoTrackData.phases.find(phase => 
    phase.days.includes(dayNumber)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm border-b-2 border-red-200">
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
                  <Calendar className="w-5 h-5 text-red-600" />
                  <span className="font-semibold text-red-600">DIA {dayNumber} DE GUERRA</span>
                  {dayCompleted && <CheckCircle className="w-5 h-5 text-green-600" />}
                </div>
                <h1 className="text-2xl font-bold text-red-700">{dayContent.title}</h1>
                <p className="text-red-600 font-medium">{dayContent.subtitle}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="destructive" className="bg-red-600">
                    <Flame className="w-3 h-3 mr-1" />
                    {currentPhase?.title || dayContent.phase}
                  </Badge>
                  <Badge variant="outline" className="border-red-300">
                    {currentPhase?.description}
                  </Badge>
                </div>
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
            <Badge variant="destructive">
              {Array.from({ length: dayContent.difficulty }, (_, i) => (
                <Star key={i} className="w-3 h-3 fill-current" />
              ))}
              EXTREMO
            </Badge>
            <span className="text-sm text-muted-foreground">
              {completedActivities} de {totalActivities} batalhas vencidas
            </span>
          </div>
        </div>
      </div>

      {/* Warning Alert for Critical Days */}
      {dayNumber <= 10 && (
        <div className="max-w-4xl mx-auto p-4">
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>FASE CRÍTICA:</strong> Você está na fase mais difícil. Sintomas de abstinência são normais. 
              Use seu apoiador quando necessário!
            </AlertDescription>
          </Alert>
        </div>
      )}

      <div className="max-w-4xl mx-auto p-4">
        <Tabs defaultValue="devocional" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="devocional" className="flex items-center gap-2">
              <Book className="w-4 h-4" />
              Devocional
            </TabsTrigger>
            <TabsTrigger value="atividade" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Atividade Intensiva
            </TabsTrigger>
            <TabsTrigger value="desafio" className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              Desafio de Guerra
            </TabsTrigger>
            <TabsTrigger value="bonus" className="flex items-center gap-2">
              <Gift className="w-4 h-4" />
              Sobrevivência
            </TabsTrigger>
          </TabsList>

          {/* Devocional */}
          <TabsContent value="devocional">
            <Card className="border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Book className="w-5 h-5 text-blue-600" />
                    Devocional de Guerra (15 min obrigatórios)
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={activityProgress['devotional_0'] || false}
                      onCheckedChange={() => handleActivityToggle('devotional_0', 50, 'Devocional de Guerra', 'devotional')}
                    />
                    <Badge variant="outline">50 pts</Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                  <h3 className="font-semibold text-blue-900 mb-2">Versículo de Batalha:</h3>
                  <p className="text-blue-800 italic font-medium">"{dayContent.devotional.verse}"</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-3 text-red-700">Reflexão Intensiva:</h3>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <p className="text-red-800 leading-relaxed whitespace-pre-line">
                      {dayContent.devotional.reflection}
                    </p>
                  </div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
                  <h3 className="font-semibold text-purple-900 mb-2">Oração de Guerra:</h3>
                  <p className="text-purple-800 italic font-medium">"{dayContent.devotional.prayer}"</p>
                </div>

                <div className="text-center">
                  <Badge variant="outline" className="text-blue-700">
                    💡 Leia em voz alta para maior impacto
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Atividade Principal */}
          <TabsContent value="atividade">
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-red-600" />
                    {dayContent.mainActivity.title}
                  </div>
                  <div className="flex items-center gap-2">
                    <Timer className="w-4 h-4 text-red-600" />
                    <span className="text-sm font-bold">{dayContent.mainActivity.duration} min</span>
                    <Checkbox
                      checked={activityProgress['activity_0'] || false}
                      onCheckedChange={() => handleActivityToggle('activity_0', 80, dayContent.mainActivity.title, 'main_activity')}
                    />
                    <Badge variant="destructive">80 pts</Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Alert className="border-red-200 bg-red-50 mb-4">
                  <Shield className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    <strong>OBRIGATÓRIO:</strong> Esta atividade é essencial para sua recuperação. 
                    Dedique o tempo completo sem interrupções.
                  </AlertDescription>
                </Alert>
                
                <div className="prose max-w-none">
                  <div className="whitespace-pre-line text-muted-foreground bg-gray-50 p-4 rounded-lg">
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
                      onCheckedChange={() => handleActivityToggle('challenge_0', 50, dayContent.challenge.title, 'challenge')}
                    />
                    <Badge variant="outline" className="border-orange-500">50 pts</Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-500">
                  <div className="prose max-w-none">
                    <div className="whitespace-pre-line text-orange-800">
                      {dayContent.challenge.description}
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 text-center">
                  <Badge variant="outline" className="text-orange-700">
                    ⚡ Desafio diário para fortalecer sua resistência
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bônus - Kit de Sobrevivência */}
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
                    <Badge variant="outline" className="border-purple-500">20 pts</Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="prose max-w-none">
                    <div className="whitespace-pre-line text-purple-800">
                      {dayContent.bonus.content}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Battle Progress Summary */}
        <Card className="mt-6 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-red-600" />
              Relatório de Batalha - Dia {dayNumber}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Progresso da Guerra</span>
                <div className="flex items-center gap-2">
                  <Progress value={progressPercentage} className="w-32" />
                  <span className="text-sm font-bold text-red-600">{Math.round(progressPercentage)}%</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-lg font-bold text-blue-600">
                    {activityProgress['devotional_0'] ? '🛡️' : '⚪'}
                  </div>
                  <div className="text-xs text-blue-600 font-medium">Devocional</div>
                </div>
                <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="text-lg font-bold text-red-600">
                    {activityProgress['activity_0'] ? '⚔️' : '⚪'}
                  </div>
                  <div className="text-xs text-red-600 font-medium">Atividade</div>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="text-lg font-bold text-orange-600">
                    {activityProgress['challenge_0'] ? '🔥' : '⚪'}
                  </div>
                  <div className="text-xs text-orange-600 font-medium">Desafio</div>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="text-lg font-bold text-purple-600">
                    {activityProgress['bonus_0'] ? '🎒' : '⚪'}
                  </div>
                  <div className="text-xs text-purple-600 font-medium">Sobrevivência</div>
                </div>
              </div>

              {dayCompleted ? (
                <div className="text-center p-6 bg-green-50 border-2 border-green-500 rounded-lg">
                  <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                  <h3 className="text-xl font-bold text-green-800">VITÓRIA! Dia {dayNumber} Conquistado!</h3>
                  <p className="text-green-700 mt-2">
                    🔥 {totalPoints} pontos de guerra conquistados!<br/>
                    💪 Você está mais forte que ontem!<br/>
                    ⚔️ Mais um dia de liberdade reconquistada!
                  </p>
                  <Badge className="bg-green-600 mt-3 text-lg px-4 py-2">
                    GUERREIRO VITORIOSO
                  </Badge>
                </div>
              ) : (
                <div className="text-center p-4 bg-yellow-50 border border-yellow-300 rounded-lg">
                  <AlertTriangle className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                  <h3 className="font-bold text-yellow-800">Batalha em andamento...</h3>
                  <p className="text-yellow-700 text-sm">
                    Complete todas as atividades para conquistar este dia!
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Emergency Support */}
        <Card className="mt-4 border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-red-600" />
              <div>
                <h4 className="font-bold text-red-800">Emergência de Recaída?</h4>
                <p className="text-red-700 text-sm">
                  Ligue AGORA para seu apoiador principal • CVV: 188 (24h grátis) • Não desista!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation Footer */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-red-200">
          <Button
            variant="outline"
            onClick={() => onNavigate(dayNumber - 1)}
            disabled={dayNumber === 1}
            className="border-red-300"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Batalha Anterior
          </Button>

          <div className="text-center">
            <div className="text-sm text-muted-foreground">
              Guerra Total: {dayNumber}/40 dias
            </div>
            <div className="text-xs text-red-600 font-medium">
              Fase: {currentPhase?.title}
            </div>
            {dayCompleted && (
              <Badge className="bg-green-600 mt-1">
                <CheckCircle className="w-4 h-4 mr-2" />
                CONQUISTADO!
              </Badge>
            )}
          </div>

          <Button
            onClick={() => onNavigate(dayNumber + 1)}
            disabled={dayNumber === 40}
            className="bg-red-600 hover:bg-red-700"
          >
            Próxima Batalha
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RenovacaoDayView;