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
  attemptNumber: number;
  attemptDate: string;
}

export interface ProgressData {
  currentResult: TestResult | null;
  previousResults: TestResult[];
  canRetake: boolean;
  daysUntilRetake: number;
  trackDuration: number;
  remainingAttempts: number;
  todayAttempts: TestResult[];
}

export const useProgressTracking = () => {
  const [progressData, setProgressData] = useState<ProgressData>({
    currentResult: null,
    previousResults: [],
    canRetake: true,
    daysUntilRetake: 0,
    trackDuration: 0,
    remainingAttempts: 3,
    todayAttempts: []
  });

  const getTrackDuration = (trackType: string): number => {
    const durations = {
      liberdade: 7,
      equilibrio: 21,
      renovacao: 40
    };
    return durations[trackType as keyof typeof durations] || 21;
  };

  const saveRetryProgress = async (result: TestResult) => {
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
          track_type: result.trackType,
          attempt_number: result.attemptNumber,
          attempt_date: result.attemptDate
        });

      if (error) throw error;
      await updateProgressData();
    } catch (error) {
      console.error('Error saving retry result:', error);
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
        totalTimeSpent: result.total_time_spent,
        attemptNumber: result.attempt_number,
        attemptDate: result.attempt_date
      }));
    } catch (error) {
      console.error('Error fetching results:', error);
      return [];
    }
  };

  const getTodayAttempts = async (): Promise<TestResult[]> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('questionnaire_results')
        .select('*')
        .eq('user_id', user.id)
        .eq('attempt_date', today)
        .order('attempt_number', { ascending: true });

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
        totalTimeSpent: result.total_time_spent,
        attemptNumber: result.attempt_number,
        attemptDate: result.attempt_date
      }));
    } catch (error) {
      console.error('Error fetching today attempts:', error);
      return [];
    }
  };

  const canRetakeTest = (lastResult: TestResult, todayAttempts: TestResult[]): { canRetake: boolean; daysLeft: number; remainingAttempts: number } => {
    if (!lastResult) return { canRetake: true, daysLeft: 0, remainingAttempts: 3 };
    
    const today = new Date().toISOString().split('T')[0];
    
    // Check if we have attempts from today
    if (todayAttempts.length > 0) {
      const remainingAttempts = Math.max(0, 3 - todayAttempts.length);
      return { canRetake: remainingAttempts > 0, daysLeft: 0, remainingAttempts };
    }
    
    // Check track duration for period-based retakes
    const trackDuration = getTrackDuration(lastResult.trackType);
    const completedDate = new Date(lastResult.completedAt);
    const daysSinceCompletion = Math.floor((Date.now() - completedDate.getTime()) / (1000 * 60 * 60 * 24));
    
    const canRetake = daysSinceCompletion >= trackDuration;
    const daysLeft = Math.max(0, trackDuration - daysSinceCompletion);
    
    return { canRetake, daysLeft, remainingAttempts: canRetake ? 3 : 0 };
  };

  const updateProgressData = async () => {
    const results = await getStoredResults();
    const todayAttempts = await getTodayAttempts();
    const currentResult = results[0] || null;
    const previousResults = results.slice(1);
    
    let canRetake = true;
    let daysUntilRetake = 0;
    let trackDuration = 21;
    let remainingAttempts = 3;
    
    if (currentResult) {
      trackDuration = getTrackDuration(currentResult.trackType);
      const retakeInfo = canRetakeTest(currentResult, todayAttempts);
      canRetake = retakeInfo.canRetake;
      daysUntilRetake = retakeInfo.daysLeft;
      remainingAttempts = retakeInfo.remainingAttempts;
    }
    
    setProgressData({
      currentResult,
      previousResults,
      canRetake,
      daysUntilRetake,
      trackDuration,
      remainingAttempts,
      todayAttempts
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
      espiritual: result.categoryScores.espiritual,
      attempt: result.attemptNumber
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
    saveRetryProgress,
    getEvolutionData,
    getComparison,
    clearProgress,
    updateProgressData
  };
};