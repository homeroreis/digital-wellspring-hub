import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Trophy, 
  Target, 
  Heart, 
  Smartphone, 
  Clock, 
  Users, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle, 
  ArrowRight,
  TrendingUp,
  Award,
  Shield,
  Printer,
  RotateCcw,
  Eye
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import PrintableResults from '@/components/PrintableResults';

interface ResultsData {
  totalScore: number;
  categoryScores: {
    comportamento: number;
    vida_cotidiana: number;
    relacoes: number;
    espiritual: number;
  };
  trackType: string;
  totalTimeSpent: number;
}

const Results = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [resultId, setResultId] = useState<string | null>(null);
  const [results, setResults] = useState<ResultsData | null>(null);
  const [showPrintable, setShowPrintable] = useState(false);
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    const loadResults = async () => {
      try {
        // Try to get from URL params first
        const score = searchParams.get('score');
        const track = searchParams.get('track');
        
        if (score && track) {
          setResults({
            totalScore: parseInt(score),
            categoryScores: {
              comportamento: parseInt(searchParams.get('comportamento') || '0'),
              vida_cotidiana: parseInt(searchParams.get('vida_cotidiana') || '0'),
              relacoes: parseInt(searchParams.get('relacoes') || '0'),
              espiritual: parseInt(searchParams.get('espiritual') || '0'),
            },
            trackType: track,
            totalTimeSpent: parseInt(searchParams.get('time') || '0')
          });
        } else {
          // Get latest result from database
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            // Get user display data for name
            const { data: userDisplayData } = await supabase
              .rpc('get_user_display_data', { user_uuid: user.id })
              .single();
            
            if (userDisplayData && userDisplayData.full_name) {
              setUserName(userDisplayData.full_name);
            } else {
              setUserName(user.email?.split('@')[0] || 'Usuário');
            }

            const { data } = await supabase
              .from('questionnaire_results')
              .select('*')
              .eq('user_id', user.id)
              .order('created_at', { ascending: false })
              .limit(1)
              .single();
            
            if (data) {
              setResultId(data.id);
              setResults({
                totalScore: data.total_score,
                categoryScores: {
                  comportamento: data.comportamento_score,
                  vida_cotidiana: data.vida_cotidiana_score,
                  relacoes: data.relacoes_score,
                  espiritual: data.espiritual_score,
                },
                trackType: data.track_type,
                totalTimeSpent: data.total_time_spent
              });
            }
          }
        }
      } catch (error) {
        console.error('Error loading results:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadResults();
  }, [searchParams]);

  const getTrackInfo = (trackType: string) => {
    switch (trackType) {
      case 'liberdade':
        return {
          name: 'Liberdade',
          description: 'Focada em libertação de vícios digitais e estabelecimento de limites saudáveis',
          duration: '7 dias',
          color: 'bg-[hsl(var(--track-liberdade))]',
          textColor: 'text-white',
          icon: Shield,
          difficulty: 'Iniciante'
        };
      case 'equilibrio':
        return {
          name: 'Equilíbrio',
          description: 'Balanceamento entre uso consciente da tecnologia e vida offline',
          duration: '21 dias',
          color: 'bg-[hsl(var(--track-equilibrio))]',
          textColor: 'text-[hsl(var(--primary-foreground))]',
          icon: Target,
          difficulty: 'Intermediário'
        };
      case 'renovacao':
        return {
          name: 'Renovação',
          description: 'Transformação profunda de hábitos e renovação espiritual',
          duration: '40 dias',
          color: 'bg-[hsl(var(--track-renovacao))]',
          textColor: 'text-white',
          icon: Sparkles,
          difficulty: 'Avançado'
        };
      default:
        return {
          name: 'Equilíbrio',
          description: 'Trilha padrão para desenvolvimento equilibrado',
          duration: '21 dias',
          color: 'bg-[hsl(var(--track-equilibrio))]',
          textColor: 'text-[hsl(var(--primary-foreground))]',
          icon: Target,
          difficulty: 'Intermediário'
        };
    }
  };

  const getCategoryInfo = (category: string) => {
    switch (category) {
      case 'comportamento':
        return {
          name: 'Comportamento com Smartphone',
          icon: Smartphone,
          color: 'hsl(217 91% 60%)', // Vibrant blue
          bgClass: 'bg-blue-50 border-blue-200',
          textClass: 'text-blue-700',
          description: 'Como você interage com seu dispositivo'
        };
      case 'vida_cotidiana':
        return {
          name: 'Impacto na Vida Cotidiana',
          icon: Clock,
          color: 'hsl(142 76% 36%)', // Vibrant green
          bgClass: 'bg-green-50 border-green-200',
          textClass: 'text-green-700',
          description: 'Efeitos no seu dia a dia e produtividade'
        };
      case 'relacoes':
        return {
          name: 'Impacto nas Relações',
          icon: Users,
          color: 'hsl(45 100% 52%)', // Vibrant yellow
          bgClass: 'bg-yellow-50 border-yellow-200',
          textClass: 'text-yellow-700',
          description: 'Influência nos seus relacionamentos'
        };
      case 'espiritual':
        return {
          name: 'Impacto Espiritual',
          icon: Sparkles,
          color: 'hsl(0 72% 51%)', // Vibrant red
          bgClass: 'bg-red-50 border-red-200',
          textClass: 'text-red-700',
          description: 'Efeitos na sua vida espiritual'
        };
      default:
        return {
          name: category,
          icon: Target,
          color: 'hsl(215 16% 47%)',
          bgClass: 'bg-gray-50 border-gray-200',
          textClass: 'text-gray-700',
          description: ''
        };
    }
  };

  const getRiskLevel = (score: number) => {
    if (score >= 20) return { level: 'Alto Risco', color: 'text-red-700 font-semibold', bgColor: 'bg-red-100 border-red-300' };
    if (score >= 15) return { level: 'Risco Moderado', color: 'text-yellow-700 font-semibold', bgColor: 'bg-yellow-100 border-yellow-300' };
    if (score >= 10) return { level: 'Risco Baixo', color: 'text-blue-700 font-semibold', bgColor: 'bg-blue-100 border-blue-300' };
    return { level: 'Muito Baixo Risco', color: 'text-green-700 font-semibold', bgColor: 'bg-green-100 border-green-300' };
  };

  const getScoreMessage = (totalScore: number) => {
    if (totalScore >= 80) return {
      title: 'Atenção Necessária',
      message: 'Seus resultados indicam padrões que podem estar impactando significativamente sua vida. A jornada de transformação será muito benéfica para você.',
      icon: AlertTriangle,
      color: 'text-red-600'
    };
    if (totalScore >= 60) return {
      title: 'Oportunidade de Melhoria',
      message: 'Você tem alguns desafios digitais que merecem atenção. Esta é uma excelente oportunidade para desenvolver hábitos mais saudáveis.',
      icon: TrendingUp,
      color: 'text-yellow-600'
    };
    if (totalScore >= 40) return {
      title: 'Caminho do Equilíbrio',
      message: 'Você já tem algumas práticas saudáveis, mas há espaço para crescimento e maior consciência digital.',
      icon: Target,
      color: 'text-blue-600'
    };
    return {
      title: 'Excelente Base',
      message: 'Você demonstra um bom controle digital! A trilha ajudará a fortalecer ainda mais esses hábitos saudáveis.',
      icon: CheckCircle,
      color: 'text-green-600'
    };
  };

  const handleContinue = () => {
    const params = new URLSearchParams();
    if (resultId) {
      params.set('result', resultId);
    }
    params.set('track', results?.trackType || 'equilibrio');
    navigate(`/onboarding?${params.toString()}`);
  };

  const handlePrint = () => {
    setShowPrintable(true);
    setTimeout(() => {
      window.print();
      setShowPrintable(false);
    }, 100);
  };

  const handleRetakeTest = () => {
    navigate('/test');
  };

  const handleViewHistory = () => {
    navigate('/dashboard');
    // Set the active tab to history - this would need to be handled by dashboard
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardContent className="p-12 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold mb-4">Analisando seus resultados...</h2>
            <p className="text-muted-foreground">Preparando sua jornada personalizada</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardContent className="p-12 text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-4">Resultados não encontrados</h2>
            <p className="text-muted-foreground mb-6">Não foi possível carregar seus resultados do teste.</p>
            <Button onClick={() => navigate('/test')}>
              Fazer o Teste Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const trackInfo = getTrackInfo(results.trackType);
  const scoreInfo = getScoreMessage(results.totalScore);
  const ScoreIcon = scoreInfo.icon;

  // Show printable view
  if (showPrintable) {
    return (
      <PrintableResults 
        results={results}
        userName={userName}
        testDate={new Date().toLocaleDateString('pt-BR')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center mb-6">
            <Trophy className="w-12 h-12 text-yellow-500 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">Seus Resultados</h1>
          </div>
          
          <Card className={`border-2 ${scoreInfo.color === 'text-red-600' ? 'border-red-200' : scoreInfo.color === 'text-yellow-600' ? 'border-yellow-200' : scoreInfo.color === 'text-blue-600' ? 'border-blue-200' : 'border-green-200'}`}>
            <CardContent className="p-8 text-center">
              <ScoreIcon className={`w-16 h-16 ${scoreInfo.color} mx-auto mb-4`} />
              <h2 className="text-2xl font-bold mb-2">{scoreInfo.title}</h2>
              <p className="text-muted-foreground text-lg">{scoreInfo.message}</p>
              
              <div className="mt-6 flex items-center justify-center gap-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">{results.totalScore}</div>
                  <div className="text-sm text-muted-foreground">Pontuação Total</div>
                </div>
                <Separator orientation="vertical" className="h-12" />
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">{Math.round(results.totalTimeSpent / 60)}</div>
                  <div className="text-sm text-muted-foreground">Minutos Investidos</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Análise por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(results.categoryScores).map(([category, score]) => {
                const categoryInfo = getCategoryInfo(category);
                const risk = getRiskLevel(score);
                const CategoryIcon = categoryInfo.icon;
                
                return (
                  <div key={category} className={`p-4 rounded-lg border-2 ${categoryInfo.bgClass}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <CategoryIcon 
                          className="w-6 h-6" 
                          style={{ color: categoryInfo.color }} 
                        />
                        <div>
                          <h3 className={`font-semibold text-sm ${categoryInfo.textClass}`}>{categoryInfo.name}</h3>
                          <p className="text-xs text-muted-foreground">{categoryInfo.description}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className={risk.color}>
                        {risk.level}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Pontuação:</span>
                        <span className="font-bold">{score}/25</span>
                      </div>
                      <Progress 
                        value={(score / 25) * 100} 
                        className="h-2"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recommended Track */}
        <Card className="border-2 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Sua Trilha Personalizada
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6 p-6 bg-white rounded-lg border">
              <div className={`w-16 h-16 ${trackInfo.color} rounded-full flex items-center justify-center`}>
                <trackInfo.icon className={`w-8 h-8 ${trackInfo.textColor}`} />
              </div>
              
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-1">Trilha {trackInfo.name}</h3>
                <p className="text-muted-foreground mb-3">{trackInfo.description}</p>
                
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{trackInfo.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    <span>{trackInfo.difficulty}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                <Button 
                  size="lg" 
                  onClick={handleContinue}
                  className="px-8"
                >
                  Começar Jornada
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handlePrint}
                    className="flex-1"
                  >
                    <Printer className="w-4 h-4 mr-2" />
                    Imprimir
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleRetakeTest}
                    className="flex-1"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Refazer Teste
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleViewHistory}
                    className="flex-1"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Ver Histórico
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">O que esperar:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>✓ Atividades diárias personalizadas baseadas no seu perfil</li>
                <li>✓ Reflexões bíblicas alinhadas com seus desafios</li>
                <li>✓ Exercícios práticos para transformar hábitos digitais</li>
                <li>✓ Acompanhamento de progresso e conquistas</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Notice */}
        <Card className="bg-gray-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-gray-600 mt-0.5" />
              <div className="text-sm text-gray-600">
                <p className="font-medium mb-1">Seus dados estão seguros</p>
                <p>Seus resultados são privados e apenas você tem acesso. Utilizamos essas informações exclusivamente para personalizar sua experiência de transformação.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Results;