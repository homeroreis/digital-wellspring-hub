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
   * Busca perfil do usuário
   */
  private static async getUserProfile(userId: string): Promise<UserProfile | null> {
    // TODO: Implementar busca no Supabase
    // Por enquanto, retorna dados mock
    return {
      id: userId,
      testResults: {
        totalScore: 45,
        categoryScores: {
          comportamento: 12,
          vida_cotidiana: 15,
          relacoes: 8,
          espiritual: 10
        },
        trackType: 'renovacao',
        date: new Date().toISOString()
      },
      progressData: {
        currentDay: 1,
        currentTrack: 'renovacao',
        completedActivities: [],
        streak: 0,
        totalPoints: 0
      },
      preferences: {
        focusAreas: ['vida_cotidiana'],
        availableTime: 30,
        difficulty: 'medium'
      },
      personalData: {
        age: 30,
        occupation: 'Profissional'
      }
    };
  }

  /**
   * Busca conteúdo base para um dia específico
   */
  private static async getBaseContent(trackType: string, dayNumber: number) {
    try {
      // TODO: Implementar busca no Supabase
      // Por enquanto, retorna estrutura base
      return {
        title: `Dia ${dayNumber}`,
        subtitle: 'Sua jornada de transformação',
        description: 'Conteúdo personalizado para seu crescimento',
        activities: [
          {
            type: 'reflection',
            title: 'Reflexão Diária',
            description: 'Momento de autoavaliação',
            duration: 10,
            baseDifficulty: 1,
            points: 10,
            isRequired: true,
            instructions: ['Encontre um local tranquilo', 'Reflita sobre o dia']
          },
          {
            type: 'exercise',
            title: 'Exercício Prático',
            description: 'Atividade para aplicar o aprendizado',
            duration: 20,
            baseDifficulty: 2,
            points: 20,
            isRequired: true,
            instructions: ['Prepare os materiais necessários', 'Execute com atenção']
          }
        ]
      };
    } catch (error) {
      console.error(`Erro ao buscar conteúdo base para ${trackType} dia ${dayNumber}:`, error);
      
      // Retorna conteúdo padrão se não encontrar
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
      activities: []
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
      'renovacao': 21,
      'liberdade': 30,
      'equilibrio': 14
    };
    
    return trackLengths[trackType] || 21;
  }

  /**
   * Busca conteúdo do Supabase
   */
  private static async fetchContentFromSupabase(trackType: string, dayNumber: number) {
    try {
      // TODO: Implementar busca real no Supabase
      const data = null; // await supabase.from('track_contents').select('*')...
      
      if (!data) {
        // Retorna conteúdo padrão se não encontrar
        return this.getDefaultContent(trackType, dayNumber);
      }
      
      return data;
    } catch (error) {
      console.error('Erro ao buscar do Supabase:', error);
      
      // Retorna conteúdo padrão se não encontrar
      return this.getDefaultContent(trackType, dayNumber);
    }
    
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
   * Completa uma atividade
   */
  static async completeActivity(userId: string, dayNumber: number, activityId: string): Promise<void> {
    try {
      // TODO: Implementar lógica de completar atividade no Supabase
      console.log('Completando atividade:', { userId, dayNumber, activityId });
      return this.updateUserProgress(userId, activityId, true);
    } catch (error) {
      console.error('Erro ao completar atividade:', error);
      throw error;
    }
  }

  /**
   * Completa um dia
   */
  static async completeDay(userId: string, dayNumber: number, points: number): Promise<void> {
    try {
      // TODO: Implementar lógica de completar dia no Supabase
      console.log('Completando dia:', { userId, dayNumber, points });
    } catch (error) {
      console.error('Erro ao completar dia:', error);
      throw error;
    }
  }

  /**
   * Personaliza o conteúdo baseado no perfil
   */
  private static personalizeContent(
    baseContent: any,
    profile: UserProfile,
    dayNumber: number
  ): PersonalizedContent {
    const userNeeds = this.analyzeUserNeeds(profile);
    const difficulty = this.calculateDifficulty(dayNumber, profile);
    const activities = this.personalizeActivities(baseContent.activities || [], profile, userNeeds);
    
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
        points: this.calculatePoints(activities, difficulty),
        achievement: this.checkForAchievement(dayNumber, profile.testResults.trackType)
      }
    };
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
   * Personaliza atividades
   */
  private static personalizeActivities(
    baseActivities: any[],
    profile: UserProfile,
    userNeeds: any
  ): Activity[] {
    const focusAreas = profile.preferences.focusAreas || [];
    const totalScore = profile.testResults.totalScore;
    const primaryIssue = userNeeds.primaryIssue as string;

    const areaActivityMap: Record<string, string[]> = {
      comportamento: ['challenge', 'exercise'],
      vida_cotidiana: ['exercise', 'reflection'],
      relacoes: ['reflection', 'challenge'],
      espiritual: ['prayer', 'meditation'],
      produtividade: ['exercise', 'challenge', 'reflection'],
      relacionamentos: ['reflection', 'challenge'],
      espiritualidade: ['prayer', 'meditation']
    };

    const targetAreas = new Set<string>([primaryIssue, ...focusAreas]);
    const allowedTypes = new Set<string>();
    targetAreas.forEach(area => {
      const types = areaActivityMap[area];
      if (types) types.forEach(t => allowedTypes.add(t));
    });

    const requiredActivities = baseActivities.filter(a => a.isRequired !== false);
    let optionalActivities = baseActivities.filter(a => a.isRequired === false);

    if (allowedTypes.size > 0) {
      optionalActivities = optionalActivities.filter(a => allowedTypes.has(a.type));
    }

    const maxOptional = Math.min(
      optionalActivities.length,
      Math.floor(totalScore / 50)
    );
    optionalActivities = optionalActivities.slice(0, maxOptional);

    const selected = [...requiredActivities, ...optionalActivities];

    return selected.map((activity, index) => ({
      id: `activity-${profile.testResults.trackType}-day${profile.progressData.currentDay}-${index}`,
      type: activity.type || 'exercise',
      title: this.personalizeText(activity.title || 'Atividade', profile),
      description: activity.description || '',
      duration: activity.duration || 15,
      contentUrl: activity.contentUrl,
      instructions: activity.instructions || [],
      difficulty: activity.baseDifficulty || 1,
      points: activity.points || 10,
      isRequired: activity.isRequired !== false,
      completed: false
    }));
  }

  /**
   * Personaliza texto substituindo variáveis
   */
  private static personalizeText(text: string, profile: UserProfile): string {
    if (!text) return '';
    
    const replacements: { [key: string]: string } = {
      '{{user_name}}': 'amigo',
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
  private static calculatePoints(
    activities: Activity[],
    difficulty: string
  ): number {
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
      30: 'Um Mês de Jornada'
    };
    
    return achievementMilestones[dayNumber as keyof typeof achievementMilestones];
  }

  /**
   * Salva conteúdo personalizado
   */
  static async savePersonalizedContent(
    userId: string,
    dayNumber: number,
    content: PersonalizedContent
  ): Promise<void> {
    try {
      // TODO: Implementar salvamento no Supabase
      console.log('Salvando conteúdo personalizado:', { userId, dayNumber, content });
    } catch (error) {
      console.error('Erro ao salvar conteúdo personalizado:', error);
      throw error;
    }
  }

  /**
   * Atualiza progresso do usuário
   */
  static async updateUserProgress(
    userId: string,
    activityId: string,
    completed: boolean
  ): Promise<void> {
    try {
      // TODO: Implementar atualização no Supabase
      console.log('Atualizando progresso:', { userId, activityId, completed });
    } catch (error) {
      console.error('Erro ao atualizar progresso:', error);
      throw error;
    }
  }
}