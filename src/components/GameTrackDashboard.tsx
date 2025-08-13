import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, CheckCircle, Clock, Star, Trophy, Target, PlayCircle, BookOpen, Heart, Zap, Gift, Lock, Unlock, ChevronRight, BarChart3, User, Flame } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { programTracks } from '@/data/programs';

const GameTrackDashboard = () => {
  const [selectedTrack, setSelectedTrack] = useState('equilibrio');
  const [currentDay, setCurrentDay] = useState(1);
  const [user, setUser] = useState(null);
  const [trackProgress, setTrackProgress] = useState(null);
  const [completedActivities, setCompletedActivities] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Dados das trilhas com atividades adaptadas ao contexto adventista
  const tracks = {
    liberdade: {
      name: 'Trilha Liberdade',
      subtitle: 'Uso Consciente',
      description: 'Para quem já demonstra consciência digital e quer aprofundar práticas espirituais.',
      duration: 7,
      color: '#4CAF50',
      icon: CheckCircle,
      difficulty: 'Iniciante',
      focus: ['Mindfulness Espiritual', 'Hábitos Sagrados', 'Reflexão Bíblica'],
      outcomes: [
        'Maior consciência sobre uso da tecnologia com propósito divino',
        'Rituais digitais mais saudáveis e espirituais',
        'Equilíbrio entre conexão digital e comunhão com Deus'
      ]
    },
    equilibrio: {
      name: 'Trilha Equilíbrio',
      subtitle: 'Uso em Alerta',
      description: 'Para quem percebe sinais de dependência e busca restauração através da fé.',
      duration: 21,
      color: '#FFC107',
      icon: Target,
      difficulty: 'Intermediário',
      focus: ['Redução de Ansiedade', 'Controle Espiritual', 'Relacionamentos Cristãos'],
      outcomes: [
        'Redução significativa da ansiedade digital através da oração',
        'Melhoria nos relacionamentos familiares e fraternais',
        'Controle sobre impulsos tecnológicos com ajuda divina'
      ]
    },
    renovacao: {
      name: 'Trilha Renovação',
      subtitle: 'Uso Problemático',
      description: 'Para transformação integral através do poder restaurador de Deus.',
      duration: 40,
      color: '#F44336',
      icon: Zap,
      difficulty: 'Avançado',
      focus: ['Detox Espiritual', 'Reconstrução em Cristo', 'Suporte Comunitário'],
      outcomes: [
        'Transformação completa da relação com tecnologia através de Cristo',
        'Redescoberta de atividades espirituais e familiares',
        'Fortalecimento espiritual e emocional em comunidade'
      ]
    }
  };

  // Atividades adaptadas ao contexto adventista
  const trackActivities = {
    equilibrio: {
      1: {
        title: 'Diagnóstico Espiritual',
        type: 'reflection',
        duration: '15 min',
        description: 'Reflita sobre seus padrões digitais à luz da Palavra de Deus',
        points: 10,
        activities: [
          {
            type: 'video',
            title: 'Tecnologia e Espiritualidade',
            duration: '8 min',
            completed: false
          },
          {
            type: 'exercise',
            title: 'Mapeamento de Gatilhos Espirituais',
            duration: '7 min',
            completed: false
          }
        ]
      },
      2: {
        title: 'Criando Limites Sagrados',
        type: 'exercise',
        duration: '20 min',
        description: 'Estabeleça suas primeiras barreiras digitais com propósito espiritual',
        points: 15,
        activities: [
          {
            type: 'article',
            title: 'Santificação do Tempo Digital',
            duration: '5 min',
            completed: false
          },
          {
            type: 'exercise',
            title: 'Configurando Horários de Oração',
            duration: '10 min',
            completed: false
          },
          {
            type: 'challenge',
            title: 'Primeira Hora com Deus',
            duration: '60 min',
            completed: false
          }
        ]
      },
      3: {
        title: 'Presença Divina no Digital',
        type: 'mindfulness',
        duration: '25 min',
        description: 'Pratique a presença de Deus mesmo no ambiente digital',
        points: 20,
        activities: [
          {
            type: 'video',
            title: 'Meditação Bíblica - Presença Digital',
            duration: '12 min',
            completed: false
          },
          {
            type: 'exercise',
            title: 'Respiração e Oração Consciente',
            duration: '8 min',
            completed: false
          },
          {
            type: 'reflection',
            title: 'Diário de Gratidão a Deus',
            duration: '5 min',
            completed: false
          }
        ]
      },
      4: {
        title: 'Fortalecendo Laços Fraternais',
        type: 'social',
        duration: '30 min',
        description: 'Reconecte-se genuinamente com família e irmãos na fé',
        points: 25,
        activities: [
          {
            type: 'video',
            title: 'Relacionamentos Cristãos na Era Digital',
            duration: '10 min',
            completed: false
          },
          {
            type: 'exercise',
            title: 'Tempo de Qualidade Familiar',
            duration: '20 min',
            completed: false
          }
        ]
      },
      5: {
        title: 'Propósito Eterno',
        type: 'spiritual',
        duration: '35 min',
        description: 'Encontre significado eterno além das telas',
        points: 30,
        activities: [
          {
            type: 'video',
            title: 'Missão e Tecnologia',
            duration: '15 min',
            completed: false
          },
          {
            type: 'reflection',
            title: 'Plano de Vida Espiritual',
            duration: '20 min',
            completed: false
          }
        ]
      }
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      loadUserProgress();
    }
  }, [user, selectedTrack]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/auth');
      return;
    }
    setUser(session.user);
  };

  const loadUserProgress = async () => {
    try {
      setLoading(true);
      
      // Load track progress
      const { data: progress } = await supabase
        .from('user_track_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('track_slug', selectedTrack)
        .eq('is_active', true)
        .maybeSingle();

      if (progress) {
        setTrackProgress(progress);
        setCurrentDay(progress.current_day);
      } else {
        // Initialize track progress if doesn't exist
        await initializeTrackProgress();
      }

      // Load completed activities
      const { data: activities } = await supabase
        .from('user_activity_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('track_slug', selectedTrack);

      setCompletedActivities(activities || []);

      // Load achievements
      const { data: userAchievements } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false });

      setAchievements(userAchievements || []);

    } catch (error) {
      console.error('Error loading progress:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar progresso. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const initializeTrackProgress = async () => {
    try {
      const { data } = await supabase
        .from('user_track_progress')
        .insert({
          user_id: user.id,
          track_slug: selectedTrack,
          current_day: 1,
          total_points: 0,
          streak_days: 0,
          level_number: 1
        })
        .select()
        .single();

      setTrackProgress(data);
    } catch (error) {
      console.error('Error initializing track:', error);
    }
  };

  const completeActivity = async (dayNumber, activityIndex, activity) => {
    try {
      const activityKey = `${dayNumber}-${activityIndex}`;
      
      // Check if already completed
      if (completedActivities.some(a => a.day_number === dayNumber && a.activity_index === activityIndex)) {
        return;
      }

      // Insert activity completion
      const { error } = await supabase
        .from('user_activity_progress')
        .insert({
          user_id: user.id,
          track_slug: selectedTrack,
          day_number: dayNumber,
          activity_index: activityIndex,
          activity_type: activity.type,
          activity_title: activity.title,
          points_earned: 5
        });

      if (error) throw error;

      // Update local state
      setCompletedActivities(prev => [...prev, {
        day_number: dayNumber,
        activity_index: activityIndex,
        activity_type: activity.type,
        activity_title: activity.title,
        points_earned: 5
      }]);

      toast({
        title: "Atividade Concluída! 🎉",
        description: `+5 pontos adicionados`,
      });

    } catch (error) {
      console.error('Error completing activity:', error);
      toast({
        title: "Erro",
        description: "Erro ao completar atividade. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const completeDayProgress = async () => {
    try {
      const dayActivities = trackActivities[selectedTrack]?.[currentDay]?.activities || [];
      const completedToday = completedActivities.filter(a => a.day_number === currentDay);
      
      if (completedToday.length < dayActivities.length) {
        toast({
          title: "Dia Incompleto",
          description: "Complete todas as atividades antes de finalizar o dia.",
          variant: "destructive",
        });
        return;
      }

      const dayPoints = trackActivities[selectedTrack]?.[currentDay]?.points || 0;
      const newPoints = trackProgress.total_points + dayPoints;
      const newStreak = trackProgress.streak_days + 1;
      const newLevel = Math.floor(newPoints / 100) + 1;
      const nextDay = currentDay + 1;

      // Update track progress
      const { error } = await supabase
        .from('user_track_progress')
        .update({
          current_day: nextDay,
          total_points: newPoints,
          streak_days: newStreak,
          level_number: newLevel,
          last_activity_at: new Date().toISOString()
        })
        .eq('id', trackProgress.id);

      if (error) throw error;

      // Check for achievements
      await supabase.rpc('check_and_award_achievements', {
        p_user_id: user.id,
        p_track_slug: selectedTrack
      });

      // Update local state
      setTrackProgress(prev => ({
        ...prev,
        current_day: nextDay,
        total_points: newPoints,
        streak_days: newStreak,
        level_number: newLevel
      }));

      setCurrentDay(nextDay);

      toast({
        title: "Dia Concluído! 🌟",
        description: `+${dayPoints} pontos • Nível ${newLevel} • ${newStreak} dias consecutivos`,
      });

      // Reload achievements
      loadUserProgress();

    } catch (error) {
      console.error('Error completing day:', error);
      toast({
        title: "Erro",
        description: "Erro ao completar dia. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const currentTrackInfo = tracks[selectedTrack];
  const todayActivity = trackActivities[selectedTrack]?.[currentDay];
  const maxDays = Math.min(currentTrackInfo.duration, 7); // Show max 7 days for demo

  const getActivityIcon = (type) => {
    switch (type) {
      case 'video': return <PlayCircle className="w-5 h-5" />;
      case 'article': return <BookOpen className="w-5 h-5" />;
      case 'exercise': return <Target className="w-5 h-5" />;
      case 'reflection': return <Heart className="w-5 h-5" />;
      case 'challenge': return <Trophy className="w-5 h-5" />;
      default: return <CheckCircle className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'reflection': return 'text-purple-600 bg-purple-100';
      case 'exercise': return 'text-blue-600 bg-blue-100';
      case 'mindfulness': return 'text-green-600 bg-green-100';
      case 'social': return 'text-orange-600 bg-orange-100';
      case 'spiritual': return 'text-indigo-600 bg-indigo-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const isActivityCompleted = (dayNumber, activityIndex) => {
    return completedActivities.some(a => a.day_number === dayNumber && a.activity_index === activityIndex);
  };

  const isDayCompleted = (dayNumber) => {
    const dayActivities = trackActivities[selectedTrack]?.[dayNumber]?.activities || [];
    const completedCount = completedActivities.filter(a => a.day_number === dayNumber).length;
    return completedCount >= dayActivities.length;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Carregando sua jornada espiritual...</p>
        </div>
      </div>
    );
  }

  if (!todayActivity) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Parabéns!</h2>
          <p className="text-gray-600">Você completou todos os dias disponíveis nesta trilha!</p>
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
                style={{ backgroundColor: currentTrackInfo.color }}
              >
                <currentTrackInfo.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {currentTrackInfo.name}
                </h1>
                <p className="text-gray-600">{currentTrackInfo.subtitle}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="flex items-center">
                  <Flame className="w-5 h-5 text-orange-500 mr-1" />
                  <div className="text-2xl font-bold text-gray-900">{trackProgress?.streak_days || 0}</div>
                </div>
                <div className="text-sm text-gray-600">Dias consecutivos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold" style={{ color: currentTrackInfo.color }}>
                  {trackProgress?.total_points || 0}
                </div>
                <div className="text-sm text-gray-600">Pontos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">Nível {trackProgress?.level_number || 1}</div>
                <div className="text-sm text-gray-600">{currentTrackInfo.difficulty}</div>
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
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Seu Progresso Espiritual</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progresso Geral</span>
                    <span>{Math.round(((trackProgress?.current_day - 1) / currentTrackInfo.duration) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="h-3 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${Math.max(0, ((trackProgress?.current_day - 1) / currentTrackInfo.duration) * 100)}%`,
                        backgroundColor: currentTrackInfo.color 
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-xl font-bold text-gray-900">
                      {trackProgress ? trackProgress.current_day - 1 : 0}
                    </div>
                    <div className="text-sm text-gray-600">Dias completos</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-xl font-bold text-gray-900">
                      {currentTrackInfo.duration - (trackProgress ? trackProgress.current_day - 1 : 0)}
                    </div>
                    <div className="text-sm text-gray-600">Dias restantes</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Weekly Calendar */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Calendário da Semana</h3>
              
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: maxDays }, (_, i) => {
                  const dayNum = i + 1;
                  const isCompleted = isDayCompleted(dayNum);
                  const isCurrent = dayNum === currentDay;
                  const isLocked = dayNum > currentDay;
                  
                  return (
                    <div 
                      key={dayNum}
                      className={`aspect-square rounded-lg flex items-center justify-center text-sm font-medium cursor-pointer transition-all ${
                        isCompleted 
                          ? 'bg-green-500 text-white' 
                          : isCurrent 
                            ? 'bg-yellow-500 text-white ring-2 ring-yellow-200' 
                            : isLocked
                              ? 'bg-gray-100 text-gray-400'
                              : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                      onClick={() => !isLocked && dayNum <= currentDay && setCurrentDay(dayNum)}
                    >
                      {isCompleted ? <CheckCircle className="w-4 h-4" /> : 
                       isLocked ? <Lock className="w-4 h-4" /> : dayNum}
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-4 text-xs text-gray-600 space-y-1">
                <div className="flex items-center"><div className="w-3 h-3 bg-green-500 rounded mr-2"></div>Completo</div>
                <div className="flex items-center"><div className="w-3 h-3 bg-yellow-500 rounded mr-2"></div>Hoje</div>
                <div className="flex items-center"><div className="w-3 h-3 bg-gray-100 rounded mr-2"></div>Bloqueado</div>
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Conquistas Espirituais</h3>
              
              <div className="space-y-3">
                {achievements.length > 0 ? (
                  achievements.slice(0, 3).map((achievement, index) => (
                    <div key={index} className="flex items-center p-3 bg-yellow-50 rounded-lg">
                      <Trophy className="w-6 h-6 text-yellow-500 mr-3" />
                      <div>
                        <div className="font-medium text-gray-900">{achievement.achievement_name}</div>
                        <div className="text-sm text-gray-600">{achievement.achievement_description}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg opacity-50">
                    <Star className="w-6 h-6 text-gray-400 mr-3" />
                    <div>
                      <div className="font-medium text-gray-500">Primeira Conquista</div>
                      <div className="text-sm text-gray-400">Complete seu primeiro dia</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content - Today's Activity */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* Day Header */}
              <div 
                className="px-8 py-6 text-white"
                style={{ backgroundColor: currentTrackInfo.color }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm opacity-90">Dia {currentDay}</div>
                    <h2 className="text-2xl font-bold">{todayActivity.title}</h2>
                    <p className="opacity-90 mt-1">{todayActivity.description}</p>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-3xl font-bold">{todayActivity.points}</div>
                    <div className="text-sm opacity-90">pontos</div>
                  </div>
                </div>
                
                <div className="flex items-center mt-4 space-x-4">
                  <div className={`px-3 py-1 rounded-full text-sm ${getTypeColor(todayActivity.type)}`}>
                    {todayActivity.type}
                  </div>
                  <div className="flex items-center text-sm opacity-90">
                    <Clock className="w-4 h-4 mr-1" />
                    {todayActivity.duration}
                  </div>
                </div>
              </div>

              {/* Activities List */}
              <div className="p-8">
                <h3 className="text-lg font-semibold mb-6">Atividades de Hoje</h3>
                
                <div className="space-y-4">
                  {todayActivity.activities?.map((activity, index) => {
                    const completed = isActivityCompleted(currentDay, index);
                    
                    return (
                      <div 
                        key={index}
                        className={`border-2 rounded-xl p-6 transition-all ${
                          completed 
                            ? 'border-green-200 bg-green-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className={`p-2 rounded-lg ${
                              completed ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {getActivityIcon(activity.type)}
                            </div>
                            
                            <div>
                              <h4 className="font-semibold text-gray-900">{activity.title}</h4>
                              <div className="flex items-center text-sm text-gray-600 mt-1">
                                <Clock className="w-4 h-4 mr-1" />
                                {activity.duration}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            {completed ? (
                              <div className="flex items-center text-green-600 font-medium">
                                <CheckCircle className="w-5 h-5 mr-1" />
                                Completo
                              </div>
                            ) : (
                              <button 
                                onClick={() => completeActivity(currentDay, index, activity)}
                                className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                              >
                                Começar
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Day Completion */}
                <div className="mt-8 p-6 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Completar Dia {currentDay}
                      </h4>
                      <p className="text-gray-600">
                        Finalize todas as atividades para ganhar {todayActivity.points} pontos
                      </p>
                    </div>
                    
                    <button 
                      onClick={completeDayProgress}
                      disabled={!todayActivity.activities?.every((_, index) => isActivityCompleted(currentDay, index)) || isDayCompleted(currentDay)}
                      className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                        isDayCompleted(currentDay)
                          ? 'bg-green-500 text-white'
                          : todayActivity.activities?.every((_, index) => isActivityCompleted(currentDay, index))
                            ? 'bg-green-500 text-white hover:bg-green-600 transform hover:scale-105'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {isDayCompleted(currentDay) ? (
                        <>
                          <CheckCircle className="w-5 h-5 mr-2 inline" />
                          Completo
                        </>
                      ) : (
                        <>
                          Finalizar Dia
                          <ChevronRight className="w-5 h-5 ml-2 inline" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <button 
                onClick={() => navigate('/dashboard')}
                className="p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow text-left"
              >
                <div className="flex items-center">
                  <BarChart3 className="w-6 h-6 text-blue-500 mr-3" />
                  <div>
                    <div className="font-medium">Meu Progresso</div>
                    <div className="text-sm text-gray-600">Ver estatísticas</div>
                  </div>
                </div>
              </button>
              
              <button className="p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow text-left">
                <div className="flex items-center">
                  <Gift className="w-6 h-6 text-purple-500 mr-3" />
                  <div>
                    <div className="font-medium">Recursos Espirituais</div>
                    <div className="text-sm text-gray-600">Materiais extras</div>
                  </div>
                </div>
              </button>
              
              <button 
                onClick={() => navigate('/contact')}
                className="p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow text-left"
              >
                <div className="flex items-center">
                  <Heart className="w-6 h-6 text-red-500 mr-3" />
                  <div>
                    <div className="font-medium">Suporte Pastoral</div>
                    <div className="text-sm text-gray-600">Precisa de oração?</div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameTrackDashboard;