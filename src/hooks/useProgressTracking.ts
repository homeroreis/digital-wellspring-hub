import { useState, useEffect } from 'react';

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
  canRetake: boolean;
  daysUntilRetake: number;
  trackDuration: number;
}

export const useProgressTracking = () => {
  const [progressData, setProgressData] = useState<ProgressData>({
    currentResult: null,
    previousResults: [],
    canRetake: true,
    daysUntilRetake: 0,
    trackDuration: 0
  });

  const getTrackDuration = (trackType: string): number => {
    const durations = {
      liberdade: 7,
      equilibrio: 21,
      renovacao: 40
    };
    return durations[trackType as keyof typeof durations] || 21;
  };

  const saveResult = (result: TestResult) => {
    const existingResults = getStoredResults();
    const newResults = [result, ...existingResults].slice(0, 10); // Keep only last 10 results
    
    localStorage.setItem('questionnaire_results', JSON.stringify(newResults));
    updateProgressData();
  };

  const getStoredResults = (): TestResult[] => {
    try {
      const stored = localStorage.getItem('questionnaire_results');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const canRetakeTest = (lastResult: TestResult): { canRetake: boolean; daysLeft: number } => {
    if (!lastResult) return { canRetake: true, daysLeft: 0 };
    
    const trackDuration = getTrackDuration(lastResult.trackType);
    const completedDate = new Date(lastResult.completedAt);
    const daysSinceCompletion = Math.floor((Date.now() - completedDate.getTime()) / (1000 * 60 * 60 * 24));
    
    const canRetake = daysSinceCompletion >= trackDuration;
    const daysLeft = Math.max(0, trackDuration - daysSinceCompletion);
    
    return { canRetake, daysLeft };
  };

  const updateProgressData = () => {
    const results = getStoredResults();
    const currentResult = results[0] || null;
    const previousResults = results.slice(1);
    
    let canRetake = true;
    let daysUntilRetake = 0;
    let trackDuration = 21;
    
    if (currentResult) {
      trackDuration = getTrackDuration(currentResult.trackType);
      const retakeInfo = canRetakeTest(currentResult);
      canRetake = retakeInfo.canRetake;
      daysUntilRetake = retakeInfo.daysLeft;
    }
    
    setProgressData({
      currentResult,
      previousResults,
      canRetake,
      daysUntilRetake,
      trackDuration
    });
  };

  const getEvolutionData = () => {
    const results = getStoredResults().reverse(); // Chronological order
    
    return results.map((result, index) => ({
      test: `Teste ${index + 1}`,
      date: new Date(result.completedAt).toLocaleDateString('pt-BR'),
      totalScore: result.totalScore,
      comportamento: result.categoryScores.comportamento,
      vida_cotidiana: result.categoryScores.vida_cotidiana,
      relacoes: result.categoryScores.relacoes,
      espiritual: result.categoryScores.espiritual
    }));
  };

  const getComparison = () => {
    const results = getStoredResults();
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
      percentageChange: ((current.totalScore - previous.totalScore) / previous.totalScore) * 100
    };
  };

  const clearProgress = () => {
    localStorage.removeItem('questionnaire_results');
    updateProgressData();
  };

  useEffect(() => {
    updateProgressData();
  }, []);

  return {
    progressData,
    saveResult,
    getEvolutionData,
    getComparison,
    clearProgress,
    updateProgressData
  };
};