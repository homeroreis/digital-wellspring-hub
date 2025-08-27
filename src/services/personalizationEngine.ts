// src/services/personalizationEngine.ts
import { supabase } from '@/integrations/supabase/client';

export interface UserProfile {
  userId: string;
  demographics: {
    age?: number;
    occupation?: string;
    city?: string;
    hasChildren?: boolean;
    relationshipStatus?: string;
  };
  testResults: {
    totalScore: number;
    categoryScores: {
      comportamento: number;
      vida_cotidiana: number;
      relacoes: number;
      espiritual: number;
    };
    trackType: 'liberdade' | 'equilibrio' | 'renovacao';
    timestamp: string;
  };
  preferences: {
    focusAreas?: string[];
    timeCommitment?: string;
    experience?: string;
    spiritualLevel?: string;
  };
  progressData: {
    currentDay: number;
    completedDays: number[];
    totalPoints: number;
    streak: number;
    level: number;
    achievements: string[];
  };
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

export interface Activity {
  id: string;
  type: 'video' | 'article' | 'exercise' | 'reflection' | 'challenge' | 'prayer' | 'meditation';
  title: string;
  description: string;
  duration: number;
  contentUrl?: string;
  instructions?: string[];
  difficulty: number;
  points: number;
  isRequired: boolean;
  completed?: boolean;
}

export class PersonalizationService {
  /**
   * Carrega o perfil completo do usuário
   */
  static async loadUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await (supabase as any)
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error || !data) {
        console.error('Erro ao carregar perfil:', error);
        return null;
      }
      
      return {
        userId: data.user_id as string,
        demographics: (data.demographics as any) || {},
        testResults: data.test_results as any,
        preferences: (data.preferences as any) || {},
        progressData: (data.progress_data as any) || {
          currentDay: 1,
          completedDays: [],
          totalPoints: 0,
          streak: 0,
          level: 1,
          achievements: []
        }
      };
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      return null;
    }
  }

  /**
   * Salva o perfil do usuário
   */
  static async saveUserProfile(profile: UserProfile): Promise<void> {
    const { error } = await (supabase as any)
      .from('user_profiles')
      .upsert({
        user_id: profile.userId,
        demographics: profile.demographics,
        test_results: profile.testResults,
        preferences: profile.preferences,
        progress_data: profile.progressData,
        updated_at: new Date().toISOString()
      });
    
    if (error) throw error;
  }

  /**
   * Atualiza o progresso do usuário
   */
  static async updateProgress(
    userId: string,
    progressUpdate: Partial<UserProfile['progressData']>
  ): Promise<void> {
    const profile = await this.loadUserProfile(userId);
    if (!profile) throw new Error('Perfil não encontrado');
    
    profile.progressData = {
      ...profile.progressData,
      ...progressUpdate
    };
    
    await this.saveUserProfile(profile);
  }

  /**
   * Gera conteúdo personalizado para um dia
   */
  static async getPersonalizedDay(
    userId: string,
    dayNumber: number
  ): Promise<PersonalizedContent> {
    // Primeiro tenta buscar conteúdo já personalizado
    const { data: existingContent } = await (supabase as any)
      .from('personalized_track_days')
      .select('content')
      .eq('user_id', userId)
      .eq('day_number', dayNumber)
      .single();
    
    if (existingContent?.content) {
      return existingContent.content as PersonalizedContent;
    }
    
    // Se não existe, gera novo conteúdo personalizado
    const profile = await this.loadUserProfile(userId);
    if (!profile) throw new Error('Perfil não encontrado');
    
    const baseContent = await this.fetchBaseContent(profile.testResults.trackType, dayNumber);
    const personalizedContent = this.personalizeContent(baseContent, profile, dayNumber);
    
    // Salva para futuras consultas
    await (supabase as any)
      .from('personalized_track_days')
      .upsert({
        user_id: userId,
        day_number: dayNumber,
        content: personalizedContent,
        created_at: new Date().toISOString()
      });
    
    return personalizedContent;
  }

  /**
   * Busca conteúdo base da trilha
   */
  private static async fetchBaseContent(
    trackType: string,
    dayNumber: number
  ): Promise<any> {
    const { data, error } = await (supabase as any)
      .from('track_content')
      .select('*')
      .eq('track_type', trackType)
      .eq('day_number', dayNumber)
      .single();
    
    if (error || !data) {
      // Retorna conteúdo padrão se não encontrar
      return this.getDefaultContent(trackType, dayNumber);
    }
    
    return data;
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
      mainFocus: this.determineMainFocus(dayNumber, userNeeds, profile.testResults.trackType),
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
      primaryIssues: [] as string[],
      strengthAreas: [] as string[],
      personalContext: {} as any
    };

    const scores = profile.testResults.categoryScores;
    
    // Identifica áreas problemáticas
    if (scores.comportamento > 15) needs.primaryIssues.push('comportamento');
    if (scores.vida_cotidiana > 15) needs.primaryIssues.push('produtividade');
    if (scores.relacoes > 15) needs.primaryIssues.push('relacionamentos');
    if (scores.espiritual > 15) needs.primaryIssues.push('espiritualidade');
    
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
    return baseActivities.map((activity, index) => ({
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
    userNeeds: any,
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
    
    return focusMap[phase] || 'Desenvolvimento Contínuo';
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
   * Verifica conquistas
   */
  private static checkForAchievement(
    dayNumber: number,
    trackType: string
  ): string | undefined {
    const achievements: { [key: number]: string } = {
      1: 'first_step',
      3: 'three_day_streak',
      7: 'week_warrior'
    };
    
    if (trackType === 'equilibrio') {
      achievements[14] = 'two_week_champion';
      achievements[21] = 'equilibrium_master';
    } else if (trackType === 'renovacao') {
      achievements[21] = 'three_week_warrior';
      achievements[30] = 'month_master';
      achievements[40] = 'transformation_complete';
    }
    
    return achievements[dayNumber];
  }

  /**
   * Helpers
   */
  private static getTrackLength(trackType: string): number {
    switch (trackType) {
      case 'liberdade': return 7;
      case 'equilibrio': return 21;
      case 'renovacao': return 40;
      default: return 7;
    }
  }

  private static getTrackName(trackType: string): string {
    switch (trackType) {
      case 'liberdade': return 'Trilha Liberdade';
      case 'equilibrio': return 'Trilha Equilíbrio';
      case 'renovacao': return 'Trilha Renovação';
      default: return 'Trilha';
    }
  }

  /**
   * Conteúdo padrão caso não encontre no banco
   */
  private static getDefaultContent(trackType: string, dayNumber: number): any {
    const defaults: any = {
      liberdade: {
        title: `Dia ${dayNumber}: Fortalecendo Consciência`,
        subtitle: 'Continue desenvolvendo bons hábitos',
        description: 'Hoje vamos aprofundar sua consciência digital com práticas simples e efetivas.',
        activities: [
          {
            type: 'reflection',
            title: 'Reflexão Matinal',
            duration: 10,
            baseDifficulty: 1,
            points: 10,
            isRequired: true
          },
          {
            type: 'exercise',
            title: 'Prática de Presença',
            duration: 15,
            baseDifficulty: 2,
            points: 15,
            isRequired: false
          }
        ]
      },
      equilibrio: {
        title: `Dia ${dayNumber}: Recuperando Controle`,
        subtitle: 'Equilibre sua vida digital',
        description: 'Pratique técnicas comprovadas para reduzir ansiedade e recuperar o controle.',
        activities: [
          {
            type: 'exercise',
            title: 'Respiração 4-7-8',
            duration: 15,
            baseDifficulty: 2,
            points: 15,
            isRequired: true
          },
          {
            type: 'challenge',
            title: 'Desafio do Dia',
            duration: 30,
            baseDifficulty: 3,
            points: 25,
            isRequired: false
          }
        ]
      },
      renovacao: {
        title: `Dia ${dayNumber}: Transformação Profunda`,
        subtitle: 'Reconstrua sua relação com a tecnologia',
        description: 'Trabalhe na raiz dos comportamentos para uma mudança duradoura.',
        activities: [
          {
            type: 'challenge',
            title: 'Detox Diário',
            duration: 30,
            baseDifficulty: 3,
            points: 25,
            isRequired: true
          },
          {
            type: 'prayer',
            title: 'Momento Espiritual',
            duration: 15,
            baseDifficulty: 1,
            points: 15,
            isRequired: true
          }
        ]
      }
    };
    
    return defaults[trackType] || defaults.liberdade;
  }

  /**
   * Marca atividade como completa
   */
  static async completeActivity(
    userId: string,
    dayNumber: number,
    activityId: string
  ): Promise<void> {
    await (supabase as any)
      .from('activity_progress')
      .upsert({
        user_id: userId,
        day_number: dayNumber,
        activity_id: activityId,
        status: 'completed',
        completed_at: new Date().toISOString(),
        points_earned: 10
      });
  }

  /**
   * Completa um dia inteiro
   */
  static async completeDay(
    userId: string,
    dayNumber: number,
    pointsEarned: number
  ): Promise<void> {
    const profile = await this.loadUserProfile(userId);
    if (!profile) throw new Error('Perfil não encontrado');
    
    // Atualiza dias completados
    if (!profile.progressData.completedDays.includes(dayNumber)) {
      profile.progressData.completedDays.push(dayNumber);
    }
    
    // Atualiza pontos e streak
    profile.progressData.totalPoints += pointsEarned;
    profile.progressData.currentDay = dayNumber + 1;
    
    // Calcula streak
    const today = new Date().toDateString();
    const lastCompleted = localStorage.getItem(`lastCompletedDate_${userId}`);
    
    if (lastCompleted !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (lastCompleted === yesterday.toDateString()) {
        profile.progressData.streak += 1;
      } else {
        profile.progressData.streak = 1;
      }
      
      localStorage.setItem(`lastCompletedDate_${userId}`, today);
    }
    
    // Atualiza nível
    profile.progressData.level = Math.floor(profile.progressData.totalPoints / 100) + 1;
    
    await this.saveUserProfile(profile);
    
    // Marca dia como completo
    await (supabase as any)
      .from('personalized_track_days')
      .update({
        is_completed: true,
        completed_at: new Date().toISOString(),
        points_earned: pointsEarned
      })
      .eq('user_id', userId)
      .eq('day_number', dayNumber);
  }
}