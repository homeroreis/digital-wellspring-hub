import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  History, 
  Trophy, 
  Calendar, 
  TrendingUp, 
  Target, 
  Sparkles, 
  Shield,
  Eye,
  Plus
} from 'lucide-react';
import { useProgressTracking } from '@/hooks/useProgressTracking';
import { useNavigate } from 'react-router-dom';
import TestEvolutionChart from './TestEvolutionChart';
import TestResultCard from './TestResultCard';

const TestHistoryPanel = () => {
  const { progressData, getEvolutionData } = useProgressTracking();
  const [evolutionData, setEvolutionData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadEvolutionData = async () => {
      try {
        const data = await getEvolutionData();
        setEvolutionData(data);
      } catch (error) {
        console.error('Error loading evolution data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadEvolutionData();
  }, []);

  const getTrackInfo = (trackType: string) => {
    switch (trackType) {
      case 'liberdade':
        return {
          name: 'Liberdade',
          icon: Shield,
          color: 'hsl(var(--track-liberdade))',
          duration: '7 dias'
        };
      case 'equilibrio':
        return {
          name: 'Equilíbrio',
          icon: Target,
          color: 'hsl(var(--track-equilibrio))',
          duration: '21 dias'
        };
      case 'renovacao':
        return {
          name: 'Renovação',
          icon: Sparkles,
          color: 'hsl(var(--track-renovacao))',
          duration: '40 dias'
        };
      default:
        return {
          name: 'Equilíbrio',
          icon: Target,
          color: 'hsl(var(--track-equilibrio))',
          duration: '21 dias'
        };
    }
  };

  const allResults = [
    ...(progressData.currentResult ? [progressData.currentResult] : []),
    ...progressData.previousResults
  ];

  const handleViewResult = (result: any) => {
    const params = new URLSearchParams({
      score: result.totalScore.toString(),
      track: result.trackType,
      comportamento: result.categoryScores.comportamento.toString(),
      vida_cotidiana: result.categoryScores.vida_cotidiana.toString(),
      relacoes: result.categoryScores.relacoes.toString(),
      espiritual: result.categoryScores.espiritual.toString(),
      time: result.totalTimeSpent.toString()
    });
    navigate(`/results?${params.toString()}`);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando histórico de testes...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{allResults.length}</div>
            <p className="text-sm text-muted-foreground">Testes Realizados</p>
          </CardContent>
        </Card>
        
        {allResults.length > 0 && (
          <>
            <Card>
              <CardContent className="p-4 text-center">
                <TrendingUp className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">
                  {Math.min(...allResults.map(r => r.totalScore))}
                </div>
                <p className="text-sm text-muted-foreground">Melhor Pontuação</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Calendar className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">
                  {new Date(allResults[0].completedAt).toLocaleDateString('pt-BR')}
                </div>
                <p className="text-sm text-muted-foreground">Último Teste</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Gráfico de Evolução */}
      {evolutionData.length > 1 && (
        <TestEvolutionChart data={evolutionData} />
      )}

      {/* Lista de Testes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Histórico de Testes
          </CardTitle>
          <Button onClick={() => navigate('/test')} variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Novo Teste
          </Button>
        </CardHeader>
        <CardContent>
          {allResults.length === 0 ? (
            <div className="text-center py-8">
              <Target className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold mb-2">Nenhum teste realizado</h3>
              <p className="text-gray-600 mb-4">
                Faça seu primeiro teste para começar a acompanhar seu progresso
              </p>
              <Button onClick={() => navigate('/test')}>
                Fazer Teste Agora
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {allResults.map((result, index) => (
                <TestResultCard
                  key={result.id}
                  result={result}
                  index={index}
                  trackInfo={getTrackInfo(result.trackType)}
                  onView={() => handleViewResult(result)}
                  isMostRecent={index === 0}
                  totalResults={allResults.length}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TestHistoryPanel;