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
      // Busca o perfil do usuário
      const profile = await this.getUserProfile(userId);
      
      if (!profile) {
        throw new Error('Perfil do usuário não encontrado');
      }

      // Busca o conteúdo base para o dia
      const baseContent = await this.getBaseContent(trackType, dayNumber);
      
      // Personaliza o conteúdo
      return this.personalizeContent(baseContent, profile, dayNumber);
    } catch (error) {
      console.error('Erro ao obter conteúdo personalizado:', error);
      throw error;
    }
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
        .single();

      // Buscar progresso da trilha
      const { data: progressData } = await supabase
        .from('user_track_progress')
        .select('*')
        .eq('user_id', userId)
        .limit(1)
        .single();

      // Buscar preferências
      const { data: preferencesData } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .limit(1)
        .single();

      // Buscar perfil
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .limit(1)
        .single();

      if (!questionnaireData) {
        console.warn('Dados do questionário não encontrados para usuário:', userId);
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
            espiritual: questionnaireData.espiritual_score
          },
          trackType: questionnaireData.track_type,
          date: questionnaireData.created_at
        },
        progressData: {
          currentDay: progressData?.current_day || 1,
          currentTrack: progressData?.track_slug || questionnaireData.track_type,
          completedActivities: [],
          streak: progressData?.streak_days || 0,
          totalPoints: progressData?.total_points || 0
        },
        preferences: {
          focusAreas: preferencesData?.focus_areas || [],
          availableTime: 30,
          difficulty: 'medium'
        },
        personalData: {
          age: questionnaireData.age,
          occupation: questionnaireData.profession,
          location: questionnaireData.city,
          fullName: questionnaireData.full_name || profileData?.full_name
        }
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
        .single();

      if (!dailyContent) {
        console.warn(`Conteúdo não encontrado para ${trackType} dia ${dayNumber}`);
        return this.getDefaultContent(trackType, dayNumber);
      }

      // Buscar atividades do dia
      const { data: activities } = await supabase
        .from('track_daily_activities')
        .select('*')
        .eq('daily_content_id', dailyContent.id)
        .order('sort_order');

      return {
        title: dailyContent.title,
        subtitle: dailyContent.objective,
        description: dailyContent.objective,
        devotionalContent: {
          verse: dailyContent.devotional_verse,
          reflection: dailyContent.devotional_reflection,
          prayer: dailyContent.devotional_prayer
        },
        mainActivity: {
          title: dailyContent.main_activity_title,
          content: dailyContent.main_activity_content
        },
        mainChallenge: {
          title: dailyContent.main_challenge_title,
          content: dailyContent.main_challenge_content
        },
        bonusActivity: dailyContent.bonus_activity_title ? {
          title: dailyContent.bonus_activity_title,
          content: dailyContent.bonus_activity_content
        } : null,
        maxPoints: dailyContent.max_points,
        difficultyLevel: dailyContent.difficulty_level,
        activities: activities || []
      };
    } catch (error) {
      console.error(`Erro ao buscar conteúdo base para ${trackType} dia ${dayNumber}:`, error);
      return this.getDefaultContent(trackType, dayNumber);
    }
  }

  /**
   * Retorna conteúdo padrão
   */
  private static getDefaultContent(trackType: string, dayNumber: number) {
    return {
      title: `${this.getTrackName(trackType)} - Dia ${dayNumber}`,
      subtitle: 'Sua jornada de crescimento continua',
      description: 'Conteúdo personalizado baseado em seu perfil e necessidades',
      devotionalContent: {
        verse: 'Por isso não tema, pois estou com você; não tenha medo, pois sou o seu Deus.',
        reflection: 'Hoje é um novo dia para crescer e se transformar.',
        prayer: 'Senhor, me ajude a ser consciente de minhas escolhas hoje.'
      },
      activities: [],
      maxPoints: 100,
      difficultyLevel: 1
    };
  }

  /**
   * Obtém nome do track
   */
  private static getTrackName(trackType: string): string {
    const trackNames: { [key: string]: string } = {
      'renovacao': 'Renovação',
      'liberdade': 'Liberdade',
      'equilibrio': 'Equilíbrio'
    };
    
    return trackNames[trackType] || 'Desenvolvimento';
  }

  /**
   * Obtém duração do track
   */
  private static getTrackLength(trackType: string): number {
    const trackLengths: { [key: string]: number } = {
      'renovacao': 40,
      'liberdade': 7,
      'equilibrio': 21
    };
    
    return trackLengths[trackType] || 21;
  }

  /**
   * Método alias para compatibilidade com componentes existentes
   */
  static async getPersonalizedDay(userId: string, dayNumber: number): Promise<PersonalizedContent> {
    // Busca o perfil para determinar o trackType
    const profile = await this.getUserProfile(userId);
    if (!profile) {
      throw new Error('Perfil do usuário não encontrado');
    }
    
    return this.getPersonalizedContent(userId, profile.testResults.trackType, dayNumber);
  }

  /**
   * Método alias para compatibilidade - carrega perfil do usuário
   */
  static async loadUserProfile(userId: string): Promise<UserProfile | null> {
    return this.getUserProfile(userId);
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

      // Atualizar ou inserir progresso da trilha
      const { error } = await supabase
        .from('user_track_progress')
        .upsert({
          user_id: userId,
          track_slug: trackSlug,
          current_day: dayNumber + 1,
          total_points: (profile.progressData?.totalPoints || 0) + points,
          streak_days: (profile.progressData?.streak || 0) + 1,
          level_number: Math.floor(((profile.progressData?.totalPoints || 0) + points) / 100) + 1,
          last_activity_at: new Date().toISOString(),
          is_active: true
        });

      if (error) {
        console.error('Erro detalhado ao completar dia:', error);
        throw error;
      }
      
      console.log('Dia completado com sucesso:', { userId, dayNumber, points, trackSlug });
    } catch (error) {
      console.error('Erro ao completar dia:', error);
      throw error;
    }
  }

  /**
   * Personaliza o conteúdo baseado no perfil - INCLUINDO CONTEÚDO ESPIRITUAL
   */
  private static personalizeContent(
    baseContent: any,
    profile: UserProfile,
    dayNumber: number
  ): PersonalizedContent {
    const userNeeds = this.analyzeUserNeeds(profile);
    const difficulty = this.calculateDifficulty(dayNumber, profile);
    const activities = this.personalizeActivities(baseContent.activities || [], profile, userNeeds, baseContent, dayNumber);
    
    return {
      dayNumber,
      title: this.personalizeText(baseContent.title || `Dia ${dayNumber}`, profile),
      subtitle: this.personalizeText(baseContent.subtitle || '', profile),
      description: this.personalizeText(baseContent.description || '', profile),
      activities,
      mainFocus: this.determineMainFocus(
        dayNumber,
        userNeeds.primaryIssue,
        profile.testResults.trackType
      ),
      difficulty,
      estimatedTime: this.calculateEstimatedTime(activities),
      rewards: {
        points: baseContent.maxPoints || this.calculatePoints(activities, difficulty),
        achievement: this.checkForAchievement(dayNumber, profile.testResults.trackType)
      },
      // SEMPRE incluir conteúdo espiritual (base de todas as trilhas)
      devotionalContent: {
        verse: baseContent.devotionalContent?.verse || 'Não tenhas medo, eu estarei contigo.',
        reflection: this.personalizeText(
          baseContent.devotionalContent?.reflection || 'Momento de reflexão sobre nossa jornada.',
          profile
        ),
        prayer: this.personalizeText(
          baseContent.devotionalContent?.prayer || 'Senhor, me ajude a crescer hoje.',
          profile
        ),
        audioUrl: baseContent.devotionalContent?.audioUrl
      }
    };
  }

  /**
   * Personaliza atividades incluindo devotional como base
   */
  private static personalizeActivities(
    baseActivities: any[],
    profile: UserProfile,
    userNeeds: any,
    baseContent: any,
    dayNumber: number
  ): Activity[] {
    const activities: Activity[] = [];

    // 1. SEMPRE incluir atividade devocional/espiritual (base comum)
    activities.push({
      id: `devotional-${profile.testResults.trackType}-day${dayNumber}`,
      type: 'devotional',
      title: 'Momento Devocional',
      description: 'Comece o dia com reflexão espiritual',
      duration: 10,
      contentUrl: baseContent.devotionalContent?.audioUrl,
      instructions: [
        'Encontre um local tranquilo',
        'Leia o versículo do dia',
        'Reflita sobre a mensagem',
        'Faça uma oração pessoal'
      ],
      difficulty: 1,
      points: 15,
      isRequired: true,
      completed: false
    });

    // 2. Atividade principal do track
    if (baseContent.mainActivity) {
      activities.push({
        id: `main-${profile.testResults.trackType}-day${dayNumber}`,
        type: 'exercise',
        title: baseContent.mainActivity.title,
        description: baseContent.mainActivity.content,
        duration: 20,
        instructions: ['Execute com atenção', 'Mantenha o foco'],
        difficulty: baseContent.difficultyLevel || 2,
        points: 25,
        isRequired: true,
        completed: false
      });
    }

    // 3. Desafio do dia
    if (baseContent.mainChallenge) {
      activities.push({
        id: `challenge-${profile.testResults.trackType}-day${dayNumber}`,
        type: 'challenge',
        title: baseContent.mainChallenge.title,
        description: baseContent.mainChallenge.content,
        duration: 15,
        instructions: ['Aceite o desafio', 'Pratique durante o dia'],
        difficulty: baseContent.difficultyLevel || 2,
        points: 30,
        isRequired: true,
        completed: false
      });
    }

    // 4. Atividade bônus (opcional)
    if (baseContent.bonusActivity) {
      activities.push({
        id: `bonus-${profile.testResults.trackType}-day${dayNumber}`,
        type: 'bonus',
        title: baseContent.bonusActivity.title,
        description: baseContent.bonusActivity.content,
        duration: 10,
        instructions: ['Atividade opcional para aprofundar o aprendizado'],
        difficulty: 1,
        points: 10,
        isRequired: false,
        completed: false
      });
    }

    // 5. Adicionar atividades do banco se existirem
    baseActivities.forEach((activity, index) => {
      activities.push({
        id: `db-activity-${index}`,
        type: 'exercise',
        title: activity.activity_title,
        description: activity.activity_description,
        duration: 15,
        instructions: ['Siga as instruções'],
        difficulty: 2,
        points: activity.points_value,
        isRequired: activity.is_required,
        completed: false
      });
    });

    return activities;
  }

  /**
   * Analisa necessidades do usuário
   */
  private static analyzeUserNeeds(profile: UserProfile) {
    const needs = {
      primaryIssue: '' as string,
      strengthAreas: [] as string[],
      personalContext: {} as any
    };

    const scores = profile.testResults.categoryScores;

    // Determina a categoria com maior pontuação
    const entries = Object.entries(scores) as [keyof typeof scores, number][];
    let maxCategory = entries[0][0];
    for (const [category, value] of entries) {
      if (value > scores[maxCategory]) {
        maxCategory = category;
      }
    }
    needs.primaryIssue = maxCategory;

    // Identifica pontos fortes
    if (scores.comportamento < 10) needs.strengthAreas.push('autocontrole');
    if (scores.vida_cotidiana < 10) needs.strengthAreas.push('gestao_tempo');
    if (scores.relacoes < 10) needs.strengthAreas.push('conexoes_humanas');
    if (scores.espiritual < 10) needs.strengthAreas.push('vida_espiritual');

    return needs;
  }

  /**
   * Calcula dificuldade baseada no progresso
   */
  private static calculateDifficulty(
    dayNumber: number,
    profile: UserProfile
  ): 'easy' | 'medium' | 'hard' {
    const trackLength = this.getTrackLength(profile.testResults.trackType);
    const progress = dayNumber / trackLength;
    
    if (progress <= 0.3) return 'easy';
    if (progress <= 0.7) return 'medium';
    return 'hard';
  }

  /**
   * Personaliza texto substituindo variáveis
   */
  private static personalizeText(text: string, profile: UserProfile): string {
    if (!text) return '';
    
    const replacements: { [key: string]: string } = {
      '{{user_name}}': profile.personalData.fullName || 'amigo',
      '{{track_name}}': this.getTrackName(profile.testResults.trackType),
      '{{total_score}}': profile.testResults.totalScore.toString(),
      '{{current_day}}': profile.progressData.currentDay.toString(),
      '{{streak}}': profile.progressData.streak.toString()
    };
    
    let result = text;
    for (const [key, value] of Object.entries(replacements)) {
      result = result.replace(new RegExp(key, 'g'), value);
    }
    
    return result;
  }

  /**
   * Determina o foco principal do dia
   */
  private static determineMainFocus(
    dayNumber: number,
    primaryIssue: string,
    trackType: string
  ): string {
    const trackLength = this.getTrackLength(trackType);
    const phase = Math.ceil((dayNumber / trackLength) * 4);

    const focusMap: { [key: number]: string } = {
      1: 'Conscientização e Reconhecimento',
      2: 'Ação e Mudança',
      3: 'Integração e Hábito',
      4: 'Maestria e Manutenção'
    };

    const baseFocus = focusMap[phase] || 'Desenvolvimento Contínuo';
    return primaryIssue ? `${baseFocus} - foco em ${primaryIssue}` : baseFocus;
  }

  /**
   * Calcula tempo estimado
   */
  private static calculateEstimatedTime(activities: Activity[]): number {
    return activities.reduce((total, activity) => {
      return total + (activity.isRequired ? activity.duration : 0);
    }, 0);
  }

  /**
   * Calcula pontos totais
   */
  private static calculatePoints(activities: Activity[], difficulty: string): number {
    const multiplier = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 1.5 : 2;
    return Math.round(
      activities.reduce((total, activity) => total + activity.points, 0) * multiplier
    );
  }

  /**
   * Verifica se há conquista para o dia
   */
  private static checkForAchievement(dayNumber: number, trackType: string): string | undefined {
    const achievementMilestones = {
      1: 'Primeiro Passo',
      7: 'Uma Semana de Dedicação',
      14: 'Duas Semanas de Crescimento',
      21: 'Três Semanas de Transformação',
      30: 'Um Mês de Jornada',
      40: 'Transformação Completa'
    };
    
    return achievementMilestones[dayNumber as keyof typeof achievementMilestones];
  }
}