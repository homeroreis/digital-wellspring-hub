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
   * Personaliza o conteúdo baseado no perfil do usuário e na lógica das 4 áreas
   */
  private static personalizeContent(
    baseContent: any,
    profile: UserProfile,
    dayNumber: number
  ): PersonalizedContent {
    // Construir atividades do conteúdo base
    const activities: Activity[] = [];

    // 1. ÁREA ESPIRITUAL (sempre presente)
    activities.push({
      id: `devotional-${dayNumber}`,
      type: 'devotional',
      title: 'Momento Devocional',
      description: 'Fortalecimento espiritual diário',
      duration: 15,
      instructions: [
        'Leia o versículo do dia com atenção',
        'Medite na reflexão apresentada',
        'Faça a oração sugerida com o coração',
        'Aplique a lição em sua vida hoje'
      ],
      difficulty: 1,
      points: 25,
      isRequired: true,
      completed: false,
    });

    // 2. ATIVIDADE PRINCIPAL DA TRILHA
    if (baseContent.main_activity_title) {
      activities.push({
        id: `main-activity-${dayNumber}`,
        type: 'practice',
        title: baseContent.main_activity_title,
        description: baseContent.main_activity_content?.substring(0, 200) + '...' || 'Atividade principal do dia',
        duration: 45,
        instructions: [
          'Siga as instruções detalhadas fornecidas',
          'Execute com dedicação total',
          'Registre suas descobertas',
          'Aplique os aprendizados'
        ],
        difficulty: baseContent.difficulty_level || 3,
        points: Math.floor(baseContent.max_points * 0.4) || 40,
        isRequired: true,
        completed: false,
      });
    }

    // 3. DESAFIO DO DIA
    if (baseContent.main_challenge_title) {
      activities.push({
        id: `challenge-${dayNumber}`,
        type: 'challenge',
        title: baseContent.main_challenge_title,
        description: baseContent.main_challenge_content?.substring(0, 200) + '...' || 'Desafio diário',
        duration: 30,
        instructions: [
          'Aceite o desafio completamente',
          'Mantenha foco durante toda execução',
          'Supere as dificuldades com determinação',
          'Celebre cada pequena vitória'
        ],
        difficulty: baseContent.difficulty_level || 3,
        points: Math.floor(baseContent.max_points * 0.3) || 30,
        isRequired: true,
        completed: false,
      });
    }

    // 4. ATIVIDADE BÔNUS (baseada na área mais afetada do teste)
    const mostAffectedArea = this.getMostAffectedArea(profile.testResults.categoryScores);
    const bonusActivity = this.createAreaSpecificActivity(mostAffectedArea, dayNumber);
    if (bonusActivity) {
      activities.push(bonusActivity);
    }

    // 5. ATIVIDADE PERSONALIZADA (baseada na escolha do onboarding)
    const personalizedActivity = this.createPersonalizedActivity(profile.preferences.focusAreas, dayNumber);
    if (personalizedActivity) {
      activities.push(personalizedActivity);
    }

    return {
      dayNumber,
      title: baseContent.title || `Dia ${dayNumber}`,
      subtitle: baseContent.objective || 'Sua jornada continua',
      description: this.generatePersonalizedDescription(baseContent, profile, dayNumber),
      activities,
      mainFocus: this.calculateMainFocus(profile, mostAffectedArea),
      difficulty: this.calculateDifficulty(dayNumber, profile),
      estimatedTime: activities.reduce((total, act) => total + act.duration, 0),
      rewards: {
        points: baseContent.max_points || 100,
        achievement: this.checkForAchievement(dayNumber, profile.testResults.trackType),
      },
      devotionalContent: {
        verse: baseContent.devotional_verse || '"Tudo posso naquele que me fortalece." - Filipenses 4:13',
        reflection: baseContent.devotional_reflection || 'Hoje é uma nova oportunidade de crescimento e transformação.',
        prayer: baseContent.devotional_prayer || 'Senhor, guia-me neste dia de transformação. Amém.',
        audioUrl: baseContent.audio_url,
      },
    };
  }

  /**
   * Identifica a área mais afetada com base nos scores do teste
   */
  private static getMostAffectedArea(categoryScores: UserProfile['testResults']['categoryScores']): string {
    const scores = {
      comportamento: categoryScores.comportamento || 0,
      vida_cotidiana: categoryScores.vida_cotidiana || 0,
      relacoes: categoryScores.relacoes || 0,
      espiritual: categoryScores.espiritual || 0,
    };

    return Object.entries(scores).reduce((a, b) => 
      scores[a[0]] > scores[b[0]] ? a : b
    )[0];
  }

  /**
   * Cria atividade específica baseada na área mais afetada do teste
   */
  private static createAreaSpecificActivity(area: string, dayNumber: number): Activity | null {
    const areaActivities = {
      comportamento: {
        title: 'Controle Comportamental',
        description: 'Exercício focado em modificar padrões comportamentais prejudiciais',
        instructions: [
          'Identifique um comportamento específico para mudar',
          'Crie uma estratégia de substituição',
          'Pratique o novo comportamento por 30 minutos',
          'Monitore sua evolução'
        ]
      },
      vida_cotidiana: {
        title: 'Reorganização da Rotina',
        description: 'Atividade para estruturar melhor sua rotina diária',
        instructions: [
          'Analise sua rotina atual criticamente',
          'Identifique momentos de uso excessivo de tela',
          'Substitua por atividades produtivas',
          'Implemente as mudanças gradualmente'
        ]
      },
      relacoes: {
        title: 'Fortalecimento Relacional',
        description: 'Exercício para melhorar seus relacionamentos interpessoais',
        instructions: [
          'Escolha um relacionamento para fortalecer',
          'Planeje uma interação presencial significativa',
          'Execute sem interferência digital',
          'Reflita sobre a qualidade da conexão'
        ]
      },
      espiritual: {
        title: 'Aprofundamento Espiritual',
        description: 'Prática para fortalecer sua vida espiritual',
        instructions: [
          'Dedique tempo extra à oração/meditação',
          'Leia textos que alimentem sua alma',
          'Pratique gratidão ativa',
          'Conecte-se com sua comunidade de fé'
        ]
      }
    };

    const activityTemplate = areaActivities[area];
    if (!activityTemplate) return null;

    return {
      id: `area-specific-${area}-${dayNumber}`,
      type: 'focus',
      title: activityTemplate.title,
      description: activityTemplate.description,
      duration: 25,
      instructions: activityTemplate.instructions,
      difficulty: 2,
      points: 20,
      isRequired: false,
      completed: false,
    };
  }

  /**
   * Cria atividade personalizada baseada na escolha do onboarding
   */
  private static createPersonalizedActivity(focusAreas: string[], dayNumber: number): Activity | null {
    if (!focusAreas || focusAreas.length === 0) return null;

    const primaryFocus = focusAreas[0];
    const personalizedActivities = {
      'sleep_quality': {
        title: 'Melhoria do Sono',
        description: 'Prática para melhorar a qualidade do seu sono',
        instructions: [
          'Crie ritual de relaxamento antes de dormir',
          'Desligue telas 1 hora antes de deitar',
          'Pratique técnicas de respiração',
          'Prepare ambiente ideal para descanso'
        ]
      },
      'family_time': {
        title: 'Tempo de Qualidade Familiar',
        description: 'Atividade para fortalecer laços familiares',
        instructions: [
          'Planeje atividade familiar sem dispositivos',
          'Engaje-se ativamente na conversa',
          'Demonstre interesse genuíno',
          'Crie memórias significativas juntos'
        ]
      },
      'productivity': {
        title: 'Foco e Produtividade',
        description: 'Técnica para aumentar seu foco e produtividade',
        instructions: [
          'Defina período de trabalho focado',
          'Elimine todas as distrações digitais',
          'Use técnica Pomodoro modificada',
          'Monitore sua concentração'
        ]
      },
      'anxiety_control': {
        title: 'Controle da Ansiedade',
        description: 'Exercício para reduzir ansiedade sem recorrer às telas',
        instructions: [
          'Pratique mindfulness por 10 minutos',
          'Use técnicas de respiração profunda',
          'Faça atividade física leve',
          'Registre seus sentimentos'
        ]
      }
    };

    const activityTemplate = personalizedActivities[primaryFocus];
    if (!activityTemplate) return null;

    return {
      id: `personalized-${primaryFocus}-${dayNumber}`,
      type: 'personal',
      title: activityTemplate.title,
      description: activityTemplate.description,
      duration: 20,
      instructions: activityTemplate.instructions,
      difficulty: 2,
      points: 15,
      isRequired: false,
      completed: false,
    };
  }

  /**
   * Gera descrição personalizada baseada no perfil do usuário
   */
  private static generatePersonalizedDescription(
    baseContent: any,
    profile: UserProfile,
    dayNumber: number
  ): string {
    const userName = profile.personalData.fullName || 'Guerreiro';
    const trackType = profile.testResults.trackType;
    const mostAffectedArea = this.getMostAffectedArea(profile.testResults.categoryScores);
    
    const personalizedIntro = `${userName}, hoje é o dia ${dayNumber} da sua jornada de transformação na trilha ${trackType.toUpperCase()}.`;
    
    const areaFocus = {
      comportamento: 'Vamos trabalhar especialmente no controle de comportamentos compulsivos.',
      vida_cotidiana: 'O foco de hoje é reorganizar sua rotina para uma vida mais equilibrada.',
      relacoes: 'Hoje vamos fortalecer seus relacionamentos interpessoais.',
      espiritual: 'Momento especial para aprofundar sua conexão espiritual.'
    };

    const baseFocus = areaFocus[mostAffectedArea] || 'Vamos continuar fortalecendo sua transformação.';
    
    return `${personalizedIntro} ${baseFocus} ${baseContent.objective || 'Mantenha o foco e a determinação!'}`;
  }

  /**
   * Calcula o foco principal baseado no perfil do usuário
   */
  private static calculateMainFocus(profile: UserProfile, mostAffectedArea: string): string {
    const focusMap = {
      comportamento: 'Controle comportamental e quebra de padrões',
      vida_cotidiana: 'Reorganização da rotina e qualidade de vida',
      relacoes: 'Fortalecimento de relacionamentos interpessoais',
      espiritual: 'Crescimento e maturidade espiritual'
    };

    return focusMap[mostAffectedArea] || 'Desenvolvimento pessoal integral';
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
      
      // Inserir ou atualizar progresso do usuário
      const { error } = await supabase
        .from('user_track_progress')
        .upsert({
          user_id: userId,
          track_slug: trackSlug,
          current_day: Math.max(dayNumber + 1, 1),
          total_points: profile.progressData.totalPoints + points,
          streak_days: profile.progressData.streak + 1,
          level_number: Math.floor((profile.progressData.totalPoints + points) / 100) + 1,
          last_activity_at: new Date().toISOString(),
          is_active: true
        });

      if (error) {
        console.error('Erro ao completar dia:', error);
        throw error;
      }
      
      console.log('Dia completado com sucesso');
    } catch (error) {
      console.error('Erro ao completar dia:', error);
      throw error;
    }
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

  /**
   * Calculates difficulty level based on day number and user profile
   */
  private static calculateDifficulty(dayNumber: number, profile: UserProfile): 'easy' | 'medium' | 'hard' {
    const userScore = profile.testResults.totalScore;
    const trackType = profile.testResults.trackType;
    
    // Base difficulty on track type and day progression
    let baseDifficulty = 1;
    
    if (trackType === 'renovacao') {
      // Renovação starts very hard, gets easier as user adapts
      if (dayNumber <= 10) baseDifficulty = 3;
      else if (dayNumber <= 20) baseDifficulty = 2;
      else baseDifficulty = 1;
    } else if (trackType === 'equilibrio') {
      // Equilibrio has moderate, progressive difficulty
      if (dayNumber <= 7) baseDifficulty = 1;
      else if (dayNumber <= 14) baseDifficulty = 2;
      else baseDifficulty = 3;
    } else {
      // Liberdade has gentle progression
      baseDifficulty = dayNumber <= 3 ? 1 : 2;
    }
    
    // Adjust based on user score (higher score = more severe addiction = higher difficulty needed)
    const scoreMultiplier = userScore > 66 ? 1.2 : userScore > 33 ? 1.0 : 0.8;
    const finalDifficulty = baseDifficulty * scoreMultiplier;
    
    if (finalDifficulty <= 1.3) return 'easy';
    if (finalDifficulty <= 2.3) return 'medium';
    return 'hard';
  }

  /**
   * Checks for achievements based on day milestones
   */
  private static checkForAchievement(dayNumber: number, trackType: string): string | undefined {
    const achievements = {
      1: 'Primeiro Passo - Iniciou a jornada de transformação',
      3: 'Resistência Inicial - Sobreviveu aos primeiros dias',
      7: 'Guerreiro Semanal - Completou primeira semana',
      10: 'Marco de Resistência - 10 dias de transformação',
      15: 'Meio Caminho - Metade da jornada vencida',
      20: 'Veterano - 20 dias de disciplina',
      21: 'Hábito Formado - 21 dias de consistência',
      30: 'Mestre da Disciplina - 30 dias de transformação',
      40: 'Liberdade Total - Completou jornada completa'
    };

    const dayAchievements = {
      liberdade: [1, 3, 7],
      equilibrio: [1, 7, 15, 21],
      renovacao: [1, 3, 7, 10, 15, 20, 30, 40]
    };

    const trackAchievements = dayAchievements[trackType] || [];
    
    if (trackAchievements.includes(dayNumber)) {
      return achievements[dayNumber];
    }
    
    return undefined;
  }
}