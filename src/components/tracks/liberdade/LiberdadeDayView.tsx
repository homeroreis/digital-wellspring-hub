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
  Star
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { liberdadeContent } from '@/data/tracks/liberdade-content';

interface LiberdadeDayViewProps {
  userId: string;
  dayNumber: number;
  onNavigate: (day: number) => void;
  onComplete?: () => void;
}

interface ActivityProgress {
  [key: string]: boolean;
}

const LiberdadeDayView: React.FC<LiberdadeDayViewProps> = ({
  userId,
  dayNumber,
  onNavigate,
  onComplete
}) => {
  const [activityProgress, setActivityProgress] = useState<ActivityProgress>({});
  const [dayCompleted, setDayCompleted] = useState(false);
  const [totalPoints, setTotalPoints] = useState(0);

  const dayContent = liberdadeContent.find(day => day.day_number === dayNumber);

  useEffect(() => {
    loadProgress();
  }, [dayNumber]);

  const loadProgress = async () => {
    try {
      const { data: progress } = await supabase
        .from('user_activity_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('track_slug', 'liberdade')
        .eq('day_number', dayNumber);

      if (progress) {
        const progressMap: ActivityProgress = {};
        progress.forEach(p => {
          progressMap[`${p.activity_type}_${p.activity_index}`] = true;
        });
        setActivityProgress(progressMap);
        
        const dayPoints = progress.reduce((sum, p) => sum + p.points_earned, 0);
        setTotalPoints(dayPoints);
        setDayCompleted(dayPoints >= (dayContent?.max_points || 100));
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  };

  const handleActivityToggle = async (activityKey: string, activity: any) => {
    const isCompleted = !activityProgress[activityKey];
    
    try {
      if (isCompleted) {
        // Mark as completed
        await supabase
          .from('user_activity_progress')
          .insert({
            user_id: userId,
            track_slug: 'liberdade',
            day_number: dayNumber,
            activity_index: activity.title.length % 10, // Simple index
            activity_title: activity.title,
            activity_type: activity.required ? 'required' : 'bonus',
            points_earned: activity.points
          });
      } else {
        // Mark as not completed
        await supabase
          .from('user_activity_progress')
          .delete()
          .eq('user_id', userId)
          .eq('track_slug', 'liberdade')
          .eq('day_number', dayNumber)
          .eq('activity_title', activity.title);
      }

      setActivityProgress(prev => ({
        ...prev,
        [activityKey]: isCompleted
      }));

      // Recalculate points
      const newPoints = isCompleted ? totalPoints + activity.points : totalPoints - activity.points;
      setTotalPoints(newPoints);
      
      if (newPoints >= (dayContent?.max_points || 100) && !dayCompleted) {
        setDayCompleted(true);
        // Update track progress
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
        .eq('track_slug', 'liberdade')
        .single();

      if (trackProgress) {
        const newCurrentDay = Math.max(trackProgress.current_day, dayNumber + 1);
        const newTotalPoints = trackProgress.total_points + (dayContent?.max_points || 100);
        
        await supabase
          .from('user_track_progress')
          .update({
            current_day: newCurrentDay,
            total_points: newTotalPoints,
            last_activity_at: new Date().toISOString(),
            streak_days: dayNumber // Simple streak calculation
          })
          .eq('id', trackProgress.id);

        // Check for achievements
        await supabase.rpc('check_and_award_achievements', {
          p_user_id: userId,
          p_track_slug: 'liberdade'
        });
      }
    } catch (error) {
      console.error('Error updating track progress:', error);
    }
  };

  if (!dayContent) {
    return <div>Dia não encontrado</div>;
  }

  const completedActivities = Object.values(activityProgress).filter(Boolean).length;
  const progressPercentage = (totalPoints / dayContent.max_points) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
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
                  <Calendar className="w-5 h-5 text-emerald-600" />
                  <span className="font-semibold text-emerald-600">Dia {dayNumber}</span>
                  {dayCompleted && <CheckCircle className="w-5 h-5 text-green-600" />}
                </div>
                <h1 className="text-2xl font-bold">{dayContent.title}</h1>
                <p className="text-muted-foreground">{dayContent.objective}</p>
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span className="font-semibold">{totalPoints}/{dayContent.max_points} pontos</span>
              </div>
              <Progress value={progressPercentage} className="w-32" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant={dayContent.difficulty_level === 1 ? "secondary" : 
                          dayContent.difficulty_level === 2 ? "default" : "destructive"}>
              {Array.from({ length: dayContent.difficulty_level }, (_, i) => (
                <Star key={i} className="w-3 h-3 fill-current" />
              ))}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {completedActivities} de {dayContent.activities.length} atividades concluídas
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
              Atividade
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Book className="w-5 h-5 text-blue-600" />
                  Devocional Matinal (5-10 min)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">Versículo:</h3>
                  <p className="text-blue-800 italic">"{dayContent.devotional_verse}"</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Reflexão:</h3>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {dayContent.devotional_reflection}
                  </p>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-purple-900 mb-2">Oração:</h3>
                  <p className="text-purple-800 italic">"{dayContent.devotional_prayer}"</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Atividade Principal */}
          <TabsContent value="atividade">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-green-600" />
                  {dayContent.main_activity_title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <div className="whitespace-pre-line text-muted-foreground">
                    {dayContent.main_activity_content}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Desafio */}
          <TabsContent value="desafio">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-orange-600" />
                  {dayContent.main_challenge_title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <div className="whitespace-pre-line text-muted-foreground">
                    {dayContent.main_challenge_content}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bônus */}
          <TabsContent value="bonus">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="w-5 h-5 text-purple-600" />
                  {dayContent.bonus_activity_title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <div className="whitespace-pre-line text-muted-foreground">
                    {dayContent.bonus_activity_content}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Activity Checklist */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              Lista de Atividades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dayContent.activities.map((activity, index) => {
                const activityKey = `activity_${index}`;
                const isCompleted = activityProgress[activityKey] || false;
                
                return (
                  <div
                    key={index}
                    className={`flex items-start gap-3 p-3 rounded-lg transition-all ${
                      isCompleted ? 'bg-green-50 border-green-200' : 'bg-muted/20'
                    } border`}
                  >
                    <Checkbox
                      checked={isCompleted}
                      onCheckedChange={() => handleActivityToggle(activityKey, activity)}
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className={`font-medium ${isCompleted ? 'text-green-800' : ''}`}>
                          {activity.title}
                        </h4>
                        <div className="flex items-center gap-2">
                          <Badge variant={activity.required ? "default" : "secondary"}>
                            {activity.points} pts
                          </Badge>
                          {activity.required && (
                            <Badge variant="outline" className="text-xs">
                              Obrigatório
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {activity.description}
                      </p>
                    </div>
                  </div>
                );
              })}
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

          {dayCompleted && (
            <Badge className="bg-green-600">
              <CheckCircle className="w-4 h-4 mr-2" />
              Dia Completo!
            </Badge>
          )}

          <Button
            onClick={() => onNavigate(dayNumber + 1)}
            disabled={dayNumber === 7}
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