import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PersonalizedContentHook {
  personalizedContent: any;
  loading: boolean;
  error: string | null;
}

export const usePersonalizedContent = (
  userId: string,
  trackSlug: string,
  dayNumber: number
): PersonalizedContentHook => {
  const [personalizedContent, setPersonalizedContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPersonalizedContent();
  }, [userId, trackSlug, dayNumber]);

  const loadPersonalizedContent = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Buscar conteúdo base do dia
      const { data: baseContent, error: baseError } = await supabase
        .from('track_daily_content')
        .select('*')
        .eq('track_slug', trackSlug)
        .eq('day_number', dayNumber)
        .single();

      if (baseError) throw baseError;

      // 2. Buscar dados do usuário para personalização
      const [userPreferences, questionnaireResult] = await Promise.all([
        supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', userId)
          .single(),
        supabase
          .from('questionnaire_results')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()
      ]);

      let mostAffectedArea = null;
      let userScore = 0;
      let focusAreas: string[] = [];

      // 3. Determinar área mais afetada do questionário
      if (questionnaireResult.data) {
        const scores = {
          vida_cotidiana: questionnaireResult.data.vida_cotidiana_score,
          comportamento: questionnaireResult.data.comportamento_score,
          relacoes: questionnaireResult.data.relacoes_score,
          espiritual: questionnaireResult.data.espiritual_score
        };

        mostAffectedArea = Object.entries(scores).reduce((a, b) => 
          scores[a[0] as keyof typeof scores] > scores[b[0] as keyof typeof scores] ? a : b
        )[0];

        userScore = questionnaireResult.data.total_score;
      }

      // 4. Extrair áreas de foco das preferências
      if (userPreferences.data?.focus_areas) {
        focusAreas = userPreferences.data.focus_areas;
      }

      // 5. Buscar regras de personalização aplicáveis
      const { data: personalizationRules } = await supabase
        .from('content_personalization_rules')
        .select('*')
        .eq('track_slug', trackSlug)
        .eq('day_number', dayNumber);

      // 6. Aplicar personalizações
      let finalContent = { ...baseContent };

      if (personalizationRules) {
        for (const rule of personalizationRules) {
          let shouldApply = false;

          switch (rule.rule_type) {
            case 'area_based':
              const conditionArea = (rule.condition_data as any)?.most_affected_area;
              shouldApply = conditionArea === mostAffectedArea;
              break;
            
            case 'score_based':
              const conditionScore = rule.condition_data as any;
              const minScore = conditionScore?.min_score || 0;
              const maxScore = conditionScore?.max_score || 100;
              shouldApply = userScore >= minScore && userScore <= maxScore;
              break;
            
            case 'preference_based':
              const conditionPref = rule.condition_data as any;
              const requiredAreas = conditionPref?.focus_areas || [];
              shouldApply = requiredAreas.some((area: string) => focusAreas.includes(area));
              break;
          }

          if (shouldApply) {
            // Aplicar personalização sobrescrevendo campos específicos
            Object.keys(rule.personalized_content).forEach(key => {
              if (rule.personalized_content[key]) {
                finalContent[key] = rule.personalized_content[key];
              }
            });
          }
        }
      }

      // 7. Adicionar metadados de personalização
      (finalContent as any)._personalization = {
        mostAffectedArea,
        userScore,
        focusAreas,
        appliedRules: personalizationRules?.filter(rule => {
          // Lógica para determinar quais regras foram aplicadas
          switch (rule.rule_type) {
            case 'area_based':
              const conditionArea = (rule.condition_data as any)?.most_affected_area;
              return conditionArea === mostAffectedArea;
            case 'score_based':
              const conditionScore = rule.condition_data as any;
              const minScore = conditionScore?.min_score || 0;
              const maxScore = conditionScore?.max_score || 100;
              return userScore >= minScore && userScore <= maxScore;
            case 'preference_based':
              const conditionPref = rule.condition_data as any;
              const requiredAreas = conditionPref?.focus_areas || [];
              return requiredAreas.some((area: string) => focusAreas.includes(area));
            default:
              return false;
          }
        }).map(rule => rule.rule_type) || []
      };

      setPersonalizedContent(finalContent);
    } catch (err) {
      console.error('Error loading personalized content:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  return {
    personalizedContent,
    loading,
    error
  };
};

// Hook para carregar atividades personalizadas
export const usePersonalizedActivities = (userId: string, trackSlug: string, dayNumber: number) => {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadActivities();
  }, [userId, trackSlug, dayNumber]);

  const loadActivities = async () => {
    try {
      setLoading(true);
      
      // Buscar atividades do dia com conteúdo
      const { data: dailyContent } = await supabase
        .from('track_daily_content')
        .select('id')
        .eq('track_slug', trackSlug)
        .eq('day_number', dayNumber)
        .single();

      if (!dailyContent) {
        setActivities([]);
        return;
      }

      const { data: baseActivities, error: activitiesError } = await supabase
        .from('track_daily_activities')
        .select('*')
        .eq('daily_content_id', dailyContent.id)
        .order('sort_order');

      if (activitiesError) throw activitiesError;

      // TODO: Implementar personalização de atividades se necessário
      setActivities(baseActivities || []);
    } catch (err) {
      console.error('Error loading activities:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar atividades');
    } finally {
      setLoading(false);
    }
  };

  return { activities, loading, error };
};

// Função utilitária para determinar área mais afetada
export const getMostAffectedArea = (scores: {
  vida_cotidiana_score: number;
  comportamento_score: number;
  relacoes_score: number;
  espiritual_score: number;
}): string => {
  return Object.entries(scores).reduce((a, b) => 
    scores[a[0] as keyof typeof scores] > scores[b[0] as keyof typeof scores] ? a : b
  )[0];
};

// Função para obter recomendações baseadas no perfil
export const getProfileBasedRecommendations = (mostAffectedArea: string, userScore: number) => {
  const recommendations = {
    relacoes: {
      focus: "Priorize atividades que reconectem você com pessoas importantes",
      tips: [
        "Faça mais ligações de voz em vez de mensagens",
        "Estabeleça horários sagrados sem dispositivos com família",
        "Pratique escuta ativa em conversas presenciais"
      ]
    },
    comportamento: {
      focus: "Foque em quebrar padrões automáticos e criar novos hábitos",
      tips: [
        "Use lembretes físicos para interromper automatismos",
        "Mude a localização do celular frequentemente",
        "Recompense-se por cada comportamento positivo"
      ]
    },
    espiritual: {
      focus: "Intensifique práticas espirituais e momentos de silêncio",
      tips: [
        "Dedique mais tempo à oração e meditação",
        "Use recursos analógicos para estudo bíblico",
        "Pratique adoração sem acompanhamento digital"
      ]
    },
    vida_cotidiana: {
      focus: "Reorganize rotinas e crie estruturas de apoio",
      tips: [
        "Estabeleça horários fixos para uso de tecnologia",
        "Crie rituais matinais e noturnos sem telas",
        "Organize ambientes para reduzir tentações"
      ]
    }
  };

  return recommendations[mostAffectedArea as keyof typeof recommendations] || recommendations.vida_cotidiana;
};