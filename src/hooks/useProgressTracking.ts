import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface TestResult {
  id: string;
  totalScore: number;
  categoryScores: {
    comportamento: number;
    vida_cotidiana: number;
    relacoes: number;
    espiritual: number;
  };
  trackType: string;
  completedAt: string;
  totalTimeSpent: number;
}

export interface ProgressData {
  currentResult: TestResult | null;
  previousResults: TestResult[];
}

export const useProgressTracking = () => {
  const [progressData, setProgressData] = useState<ProgressData>({
    currentResult: null,
    previousResults: []
  });

  const saveTestResult = async (result: TestResult) => {
    try {
      const { error } = await supabase
        .from('questionnaire_results')
        .insert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          total_score: result.totalScore,
          comportamento_score: result.categoryScores.comportamento,
          vida_cotidiana_score: result.categoryScores.vida_cotidiana,
          relacoes_score: result.categoryScores.relacoes,
          espiritual_score: result.categoryScores.espiritual,
          total_time_spent: result.totalTimeSpent,
          answers: {},
          track_type: result.trackType
        });

      if (error) throw error;
      await updateProgressData();
    } catch (error) {
      console.error('Error saving test result:', error);
    }
  };

  const getStoredResults = async (): Promise<TestResult[]> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('questionnaire_results')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      return (data || []).map(result => ({
        id: result.id,
        totalScore: result.total_score,
        categoryScores: {
          comportamento: result.comportamento_score,
          vida_cotidiana: result.vida_cotidiana_score,
          relacoes: result.relacoes_score,
          espiritual: result.espiritual_score
        },
        trackType: result.track_type,
        completedAt: result.created_at,
        totalTimeSpent: result.total_time_spent
      }));
    } catch (error) {
      console.error('Error fetching results:', error);
      return [];
    }
  };


  const updateProgressData = async () => {
    const results = await getStoredResults();
    const currentResult = results[0] || null;
    const previousResults = results.slice(1);
    
    setProgressData({
      currentResult,
      previousResults
    });
  };

  const getEvolutionData = async () => {
    const results = await getStoredResults();
    const chronologicalResults = results.reverse();
    
    return chronologicalResults.map((result, index) => ({
      test: `Teste ${index + 1}`,
      date: new Date(result.completedAt).toLocaleDateString('pt-BR'),
      totalScore: result.totalScore,
      comportamento: result.categoryScores.comportamento,
      vida_cotidiana: result.categoryScores.vida_cotidiana,
      relacoes: result.categoryScores.relacoes,
      espiritual: result.categoryScores.espiritual
    }));
  };

  const getComparison = async () => {
    const results = await getStoredResults();
    if (results.length < 2) return null;
    
    const current = results[0];
    const previous = results[1];
    
    const improvement = {
      totalScore: current.totalScore - previous.totalScore,
      comportamento: current.categoryScores.comportamento - previous.categoryScores.comportamento,
      vida_cotidiana: current.categoryScores.vida_cotidiana - previous.categoryScores.vida_cotidiana,
      relacoes: current.categoryScores.relacoes - previous.categoryScores.relacoes,
      espiritual: current.categoryScores.espiritual - previous.categoryScores.espiritual
    };
    
    return {
      current,
      previous,
      improvement,
      percentageChange: previous.totalScore > 0 ? ((current.totalScore - previous.totalScore) / previous.totalScore) * 100 : 0
    };
  };

  const clearProgress = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('questionnaire_results')
        .delete()
        .eq('user_id', user.id);
      
      if (error) throw error;
      await updateProgressData();
    } catch (error) {
      console.error('Error clearing progress:', error);
    }
  };

  useEffect(() => {
    updateProgressData();
  }, []);

  return {
    progressData,
    saveTestResult,
    getEvolutionData,
    getComparison,
    clearProgress,
    updateProgressData
  };
};