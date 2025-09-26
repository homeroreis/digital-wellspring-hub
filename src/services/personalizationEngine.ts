import { supabase } from '@/integrations/supabase/client';

export interface UserProfile {
  id: string;
  testResults: {
    totalScore: number;
    categoryScores: {
      comportamento: number;
      vida_cotidiana: number;
      relacoes: number;
      espiritual: number;
    };
    trackType: string;
    date: string;
  };
  progressData: {
    currentDay: number;
    currentTrack: string;
    completedActivities: string[];
    streak: number;
    totalPoints: number;
  };
  preferences: {
    focusAreas: string[];
    availableTime: number;
    difficulty: string;
  };
  personalData: {
    age?: number;
    occupation?: string;
    location?: string;
    churchAffiliation?: string;
    fullName?: string;
  };
}

export interface Activity {
  id: string;
  type: string;
  title: string;
  description: string;
  duration: number;
  contentUrl?: string;
  instructions: string[];
  difficulty: number;
  points: number;
  isRequired: boolean;
  completed: boolean;
}

export interface PersonalizedContent {
  dayNumber: number;
  title: string;
  subtitle: string;
  description: string;
  activities: Activity[];
  mainFocus: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: number;
  rewards: {
    points: number;
    achievement?: string;
  };
  devotionalContent?: {
    verse: string;
    reflection: string;
    prayer: string;
    audioUrl?: string;
  };
}

export class PersonalizationService {
  /**
   * Obtém conteúdo personalizado para o usuário
   */
  static async getPersonalizedContent(
    userId: string,
    trackType: string,
    dayNumber: number
  ): Promise<PersonalizedContent> {
    try {
      console.log(`🎯 PersonalizationEngine: Gerando conteúdo personalizado`);
      console.log(`📊 Parâmetros: userId=${userId}, trackType=${trackType}, dayNumber=${dayNumber}`);

      // Busca o perfil do usuário
      const profile = await this.getUserProfile(userId);
      console.log('👤 Perfil do usuário:', profile);
      
      if (!profile) {
        console.log('⚠️ Perfil não encontrado, criando perfil básico');
        await this.createBasicProfile(userId, trackType);
        return this.getDefaultContent(trackType, dayNumber);
      }

      // Busca o conteúdo base para o dia
      const baseContent = await this.getBaseContent(trackType, dayNumber);
      console.log('📋 Conteúdo base encontrado:', !!baseContent);
      
      // Se não há conteúdo base, retorna conteúdo padrão
      if (!baseContent) {
        console.log('⚠️ Conteúdo base não encontrado, retornando conteúdo padrão');
        return this.getDefaultContent(trackType, dayNumber);
      }
      
      // Personaliza o conteúdo
      const personalizedContent = this.personalizeContent(baseContent, profile, dayNumber);
      console.log('✅ Conteúdo personalizado gerado com sucesso');
      
      return personalizedContent;
    } catch (error) {
      console.error('❌ Erro ao obter conteúdo personalizado:', error);
      // Return fallback content instead of throwing
      console.log('🔄 Retornando conteúdo de fallback');
      return this.getDefaultContent(trackType, dayNumber);
    }
  }

  /**
   * Cria um perfil básico para usuários sem perfil
   */
  static async createBasicProfile(userId: string, trackType: string) {
    try {
      const basicProfile = {
        id: userId,
        testResults: {
          totalScore: 50, // Default moderate score
          categoryScores: {
            comportamento: 12,
            vida_cotidiana: 13,
            relacoes: 12,
            espiritual: 13,
          },
          trackType,
          date: new Date().toISOString(),
        },
        progressData: {
          currentDay: 1,
          currentTrack: trackType,
          completedActivities: [],
          streak: 0,
          totalPoints: 0,
        },
        preferences: {
          focusAreas: ['anxiety', 'focus'],
          availableTime: 30,
          difficulty: 'medium',
        },
        personalData: {
          fullName: 'Usuário'
        },
      };

      // Insert basic profile data
      await supabase.from('user_profiles').upsert({
        user_id: userId,
        test_results: basicProfile.testResults,
        progress_data: basicProfile.progressData,
        preferences: basicProfile.preferences,
        demographics: basicProfile.personalData,
      });

      console.log('✅ Perfil básico criado:', basicProfile);
      return basicProfile;
    } catch (error) {
      console.error('❌ Erro ao criar perfil básico:', error);
      return null;
    }
  }

  /**
   * Retorna conteúdo padrão quando não há personalização disponível
   */
  static getDefaultContent(trackType: string, dayNumber: number): PersonalizedContent {
    const trackNames = {
      liberdade: 'Liberdade',
      equilibrio: 'Equilíbrio', 
      renovacao: 'Renovação'
    };

    const defaultActivities: Activity[] = [
      {
        id: `default-reflection-${dayNumber}`,
        type: 'reflection',
        title: 'Reflexão Diária',
        description: 'Momento de introspecção e autoconhecimento',
        duration: 10,
        instructions: [
          'Encontre um lugar tranquilo',
          'Respire profundamente 3 vezes',
          'Reflita sobre suas motivações para mudança',
          'Anote seus pensamentos no diário'
        ],
        difficulty: 1,
        points: 20,
        isRequired: true,
        completed: false,
      },
      {
        id: `default-practice-${dayNumber}`,
        type: 'practice',
        title: 'Prática do Dia',
        description: 'Exercício prático para transformação de hábitos',
        duration: 15,
        instructions: [
          'Defina um horário específico para a prática',
          'Execute a atividade com atenção plena',
          'Registre sua experiência',
          'Celebre pequenas vitórias'
        ],
        difficulty: 2,
        points: 30,
        isRequired: true,
        completed: false,
      },
      {
        id: `default-devotional-${dayNumber}`,
        type: 'devotional',
        title: 'Momento Devocional',
        description: 'Conexão espiritual e fortalecimento interior',
        duration: 10,
        instructions: [
          'Leia o versículo do dia',
          'Medite na reflexão apresentada',
          'Faça a oração sugerida',
          'Aplique a lição em sua vida'
        ],
        difficulty: 1,
        points: 25,
        isRequired: false,
        completed: false,
      }
    ];

    return {
      dayNumber,
      title: `Dia ${dayNumber} - Trilha ${trackNames[trackType] || trackType}`,
      subtitle: `Sua jornada de transformação continua`,
      description: `Continue firme em sua caminhada. Cada dia é uma nova oportunidade de crescimento e mudança positiva.`,
      activities: defaultActivities,
      mainFocus: 'Desenvolvimento pessoal e espiritual',
      difficulty: 'medium',
      estimatedTime: 35,
      rewards: {
        points: 75,
      },
      devotionalContent: {
        verse: '"Tudo posso naquele que me fortalece." - Filipenses 4:13',
        reflection: 'A força para transformar nossos hábitos digitais vem de uma fonte superior. Quando reconhecemos nossa dependência de Deus, encontramos o poder para vencer qualquer vício ou comportamento prejudicial.',
        prayer: 'Senhor, obrigado por me dar forças para continuar essa jornada. Ajude-me a perseverar mesmo quando for difícil. Que eu possa encontrar em Ti a motivação para viver de forma mais equilibrada e saudável. Amém.',
      }
    };
  }

  /**
   * Busca perfil do usuário REAL do Supabase
   */
  private static async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      // Buscar dados do questionário
      const { data: questionnaireData } = await supabase
        .from('questionnaire_results')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      // Buscar dados de progresso
      const { data: progressData } = await supabase
        .from('user_track_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .maybeSingle();

      // Buscar preferências
      const { data: preferencesData } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      // Buscar perfil adicional
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (!questionnaireData) {
        console.log('Dados do questionário não encontrados');
        return null;
      }

      return {
        id: userId,
        testResults: {
          totalScore: questionnaireData.total_score,
          categoryScores: {
            comportamento: questionnaireData.comportamento_score,
            vida_cotidiana: questionnaireData.vida_cotidiana_score,
            relacoes: questionnaireData.relacoes_score,
            espiritual: questionnaireData.espiritual_score,
          },
          trackType: questionnaireData.track_type,
          date: questionnaireData.created_at,
        },
        progressData: {
          currentDay: progressData?.current_day || 1,
          currentTrack: progressData?.track_slug || questionnaireData.track_type,
          completedActivities: [],
          streak: progressData?.streak_days || 0,
          totalPoints: progressData?.total_points || 0,
        },
        preferences: {
          focusAreas: preferencesData?.focus_areas || [],
          availableTime: 30,
          difficulty: preferencesData?.experience_level || 'medium',
        },
        personalData: {
          fullName: questionnaireData.full_name,
          age: questionnaireData.age,
          location: `${questionnaireData.city || ''} ${questionnaireData.state || ''}`.trim(),
        },
      };
    } catch (error) {
      console.error('Erro ao buscar perfil do usuário:', error);
      return null;
    }
  }

  /**
   * Busca conteúdo base REAL do Supabase
   */
  private static async getBaseContent(trackType: string, dayNumber: number) {
    try {
      // Buscar conteúdo diário
      const { data: dailyContent } = await supabase
        .from('track_daily_content')
        .select('*')
        .eq('track_slug', trackType)
        .eq('day_number', dayNumber)
        .maybeSingle();

      if (!dailyContent) {
        console.log(`Conteúdo diário não encontrado para ${trackType} dia ${dayNumber}`);
        return null;
      }

      // Buscar atividades do dia
      const { data: activities } = await supabase
        .from('track_daily_activities')
        .select('*')
        .eq('daily_content_id', dailyContent.id)
        .order('sort_order');

      return {
        ...dailyContent,
        activities: activities || [],
        devotionalContent: {
          verse: dailyContent.devotional_verse,
          reflection: dailyContent.devotional_reflection,
          prayer: dailyContent.devotional_prayer,
        }
      };
    } catch (error) {
      console.error('Erro ao buscar conteúdo base:', error);
      return null;
    }
  }

  /**
   * Personaliza o conteúdo baseado no perfil do usuário
   */
  private static personalizeContent(
    baseContent: any,
    profile: UserProfile,
    dayNumber: number
  ): PersonalizedContent {
    const activities: Activity[] = baseContent.activities?.map((activity: any, index: number) => ({
      id: `activity-${index}`,
      type: activity.activity_type || 'practice',
      title: activity.activity_title,
      description: activity.activity_description,
      duration: 15,
      instructions: [
        'Execute com atenção plena',
        'Mantenha o foco no objetivo',
        'Registre sua experiência'
      ],
      difficulty: activity.difficulty_level || 2,
      points: activity.points_value || 20,
      isRequired: activity.is_required !== false,
      completed: false,
    })) || [];

    // Adicionar atividade devocional se não existir
    if (!activities.some(a => a.type === 'devotional')) {
      activities.unshift({
        id: `devotional-${dayNumber}`,
        type: 'devotional',
        title: 'Momento Devocional',
        description: 'Fortalecimento espiritual diário',
        duration: 10,
        instructions: [
          'Leia o versículo',
          'Reflita sobre a mensagem',
          'Faça uma oração pessoal'
        ],
        difficulty: 1,
        points: 15,
        isRequired: true,
        completed: false,
      });
    }

    return {
      dayNumber,
      title: baseContent.title || `Dia ${dayNumber}`,
      subtitle: baseContent.objective || 'Sua jornada continua',
      description: baseContent.main_activity_content || 'Atividades personalizadas para seu crescimento',
      activities,
      mainFocus: 'Crescimento pessoal e espiritual',
      difficulty: this.calculateDifficulty(dayNumber, profile),
      estimatedTime: activities.reduce((total, act) => total + act.duration, 0),
      rewards: {
        points: baseContent.max_points || 100,
        achievement: this.checkForAchievement(dayNumber, profile.testResults.trackType),
      },
      devotionalContent: baseContent.devotionalContent,
    };
  }

  /**
   * Completa uma atividade - IMPLEMENTAÇÃO DIRETA NO BANCO
   */
  static async completeActivity(userId: string, dayNumber: number, activityId: string): Promise<void> {
    try {
      console.log('PersonalizationService.completeActivity iniciado:', { userId, dayNumber, activityId });
      
      // Buscar o perfil do usuário para obter a trilha
      const profile = await this.getUserProfile(userId);
      if (!profile) {
        throw new Error('Perfil do usuário não encontrado');
      }

      const trackSlug = profile.testResults.trackType;
      console.log('Track identificada:', trackSlug);
      
      // Verificar se já existe registro de atividade para evitar duplicatas
      const { data: existingActivity } = await supabase
        .from('user_activity_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('track_slug', trackSlug)
        .eq('day_number', dayNumber)
        .eq('activity_index', parseInt(activityId.replace('activity-', '')))
        .maybeSingle();

      if (existingActivity) {
        console.log('Atividade já completada anteriormente');
        return; // Atividade já foi completada
      }
      
      // Inserir diretamente na tabela user_activity_progress
      const activityData = {
        user_id: userId,
        track_slug: trackSlug,
        day_number: dayNumber,
        activity_index: parseInt(activityId.replace('activity-', '')),
        activity_type: 'activity',
        activity_title: `Atividade do dia ${dayNumber}`,
        points_earned: 10,
        completed_at: new Date().toISOString()
      };
      
      console.log('Dados da atividade a serem inseridos:', activityData);
      
      const { error } = await supabase
        .from('user_activity_progress')
        .insert(activityData);

      if (error) {
        console.error('Erro detalhado ao completar atividade:', error);
        throw new Error(`Erro no banco de dados: ${error.message} (Código: ${error.code})`);
      }
      
      console.log('Atividade completada com sucesso no banco');
    } catch (error) {
      console.error('Erro ao completar atividade:', error);
      throw error;
    }
  }

  /**
   * Completa um dia - IMPLEMENTAÇÃO DIRETA NO BANCO
   */
  static async completeDay(userId: string, dayNumber: number, points: number): Promise<void> {
    try {
      // Buscar o perfil do usuário para obter a trilha
      const profile = await this.getUserProfile(userId);
      if (!profile) {
        throw new Error('Perfil do usuário não encontrado');
      }

      const trackSlug = profile.testResults.trackType;
      
      // Atualizar progresso da trilha diretamente
      const { error } = await supabase
        .from('user_track_progress')
        .upsert({
          user_id: userId,
          track_slug: trackSlug,
          current_day: Math.max(dayNumber + 1, profile.progressData.currentDay + 1),
          total_points: (profile.progressData.totalPoints || 0) + points,
          streak_days: (profile.progressData.streak || 0) + 1,
          level_number: Math.floor(((profile.progressData.totalPoints || 0) + points) / 100) + 1,
          last_activity_at: new Date().toISOString(),
          is_active: true
        }, {
          onConflict: 'user_id,track_slug'
        });

      if (error) {
        console.error('Erro ao completar dia:', error);
        throw error;
      }

      console.log(`Dia ${dayNumber} completado com sucesso`);
    } catch (error) {
      console.error('Erro ao completar dia:', error);
      throw error;
    }
  }

  // Utility methods
  private static calculateDifficulty(dayNumber: number, profile: UserProfile): 'easy' | 'medium' | 'hard' {
    const trackLength = this.getTrackLength(profile.testResults.trackType);
    const progress = dayNumber / trackLength;
    
    if (progress <= 0.3) return 'easy';
    if (progress <= 0.7) return 'medium';
    return 'hard';
  }

  private static getTrackLength(trackType: string): number {
    const trackLengths: { [key: string]: number } = {
      'renovacao': 40,
      'liberdade': 7,
      'equilibrio': 21
    };
    return trackLengths[trackType] || 21;
  }

  private static checkForAchievement(dayNumber: number, trackType: string): string | undefined {
    const achievementMilestones = {
      1: 'Primeiro Passo',
      7: 'Uma Semana de Dedicação',
      14: 'Duas Semanas de Crescimento',
      21: 'Três Semanas de Transformação',
      30: 'Um Mês de Progresso',
      40: 'Jornada Completa'
    };
    
    return achievementMilestones[dayNumber as keyof typeof achievementMilestones];
  }

  // Alias methods for compatibility
  static async getPersonalizedDay(userId: string, dayNumber: number): Promise<PersonalizedContent> {
    const profile = await this.getUserProfile(userId);
    if (!profile) {
      return this.getDefaultContent('equilibrio', dayNumber);
    }
    return this.getPersonalizedContent(userId, profile.testResults.trackType, dayNumber);
  }

  static async loadUserProfile(userId: string): Promise<UserProfile | null> {
    return this.getUserProfile(userId);
  }
}