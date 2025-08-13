
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Smartphone, Heart, Users, Sparkles, CheckCircle, Clock, TrendingUp, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface Answer {
  value: number;
  timeSpent: number;
  timestamp: number;
}

interface QuestionnaireResults {
  totalScore: number;
  categoryScores: {
    comportamento: number;
    vida_cotidiana: number;
    relacoes: number;
    espiritual: number;
  };
  trackType: string;
  totalTimeSpent: number;
  answersData: Record<number, Answer>;
}

const InteractiveQuestionnaire = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, Answer>>({});
  const [timeStarted, setTimeStarted] = useState(Date.now());
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const questions = [
    // Categoria 1: Comportamento com o Smartphone (5 questões)
    {
      id: 1,
      category: 'comportamento',
      categoryName: 'Comportamento com o Smartphone',
      text: 'Verifico meu smartphone imediatamente ao acordar, antes mesmo de realizar minhas atividades matinais.',
      icon: Smartphone,
      color: '#3B82F6'
    },
    {
      id: 2,
      category: 'comportamento',
      categoryName: 'Comportamento com o Smartphone',
      text: 'Sinto-me ansioso ou inquieto quando percebo que meu celular está com pouca bateria ou sem sinal.',
      icon: Smartphone,
      color: '#3B82F6'
    },
    {
      id: 3,
      category: 'comportamento',
      categoryName: 'Comportamento com o Smartphone',
      text: 'Interrompo conversas presenciais para verificar notificações ou usar meu smartphone.',
      icon: Smartphone,
      color: '#3B82F6'
    },
    {
      id: 4,
      category: 'comportamento',
      categoryName: 'Comportamento com o Smartphone',
      text: 'Perco a noção do tempo quando estou usando meu smartphone.',
      icon: Smartphone,
      color: '#3B82F6'
    },
    {
      id: 5,
      category: 'comportamento',
      categoryName: 'Comportamento com o Smartphone',
      text: 'Durmo com o celular próximo a mim e verifico nos últimos momentos antes de dormir.',
      icon: Smartphone,
      color: '#3B82F6'
    },

    // Categoria 2: Impacto na Vida Cotidiana (5 questões)
    {
      id: 6,
      category: 'vida_cotidiana',
      categoryName: 'Impacto na Vida Cotidiana',
      text: 'Percebo que passo mais tempo do que pretendia nas redes sociais ou navegando na internet.',
      icon: Clock,
      color: '#10B981'
    },
    {
      id: 7,
      category: 'vida_cotidiana',
      categoryName: 'Impacto na Vida Cotidiana',
      text: 'Deixo de realizar tarefas importantes devido ao uso excessivo do smartphone.',
      icon: Clock,
      color: '#10B981'
    },
    {
      id: 8,
      category: 'vida_cotidiana',
      categoryName: 'Impacto na Vida Cotidiana',
      text: 'Familiares ou amigos próximos reclamam sobre o tempo que passo conectado.',
      icon: Clock,
      color: '#10B981'
    },
    {
      id: 9,
      category: 'vida_cotidiana',
      categoryName: 'Impacto na Vida Cotidiana',
      text: 'Tenho dificuldade em controlar o tempo de uso do meu smartphone, mesmo quando tento.',
      icon: Clock,
      color: '#10B981'
    },
    {
      id: 10,
      category: 'vida_cotidiana',
      categoryName: 'Impacto na Vida Cotidiana',
      text: 'Uso o smartphone como forma de evitar momentos de tédio, solidão ou reflexão.',
      icon: Clock,
      color: '#10B981'
    },

    // Categoria 3: Impacto nas Relações Pessoais (5 questões)
    {
      id: 11,
      category: 'relacoes',
      categoryName: 'Impacto nas Relações Pessoais',
      text: 'As pessoas ao meu redor comentam que estou sempre distraído com o celular.',
      icon: Users,
      color: '#F59E0B'
    },
    {
      id: 12,
      category: 'relacoes',
      categoryName: 'Impacto nas Relações Pessoais',
      text: 'Perco momentos importantes de interação familiar por estar atento às notificações.',
      icon: Users,
      color: '#F59E0B'
    },
    {
      id: 13,
      category: 'relacoes',
      categoryName: 'Impacto nas Relações Pessoais',
      text: 'Uso o smartphone durante momentos que deveriam ser de conexão com outras pessoas (refeições, encontros).',
      icon: Users,
      color: '#F59E0B'
    },
    {
      id: 14,
      category: 'relacoes',
      categoryName: 'Impacto nas Relações Pessoais',
      text: 'Comparo minha vida com o que vejo nas redes sociais e isso me deixa insatisfeito.',
      icon: Users,
      color: '#F59E0B'
    },
    {
      id: 15,
      category: 'relacoes',
      categoryName: 'Impacto nas Relações Pessoais',
      text: 'Tenho dificuldade em me concentrar em uma conversa sem verificar o celular.',
      icon: Users,
      color: '#F59E0B'
    },

    // Categoria 4: Impacto Espiritual (5 questões)
    {
      id: 16,
      category: 'espiritual',
      categoryName: 'Impacto Espiritual',
      text: 'O uso do smartphone interfere no tempo que dedico à oração, meditação ou estudo bíblico.',
      icon: Sparkles,
      color: '#8B5CF6'
    },
    {
      id: 17,
      category: 'espiritual',
      categoryName: 'Impacto Espiritual',
      text: 'Sinto-me espiritualmente desconectado após longos períodos usando o smartphone.',
      icon: Sparkles,
      color: '#8B5CF6'
    },
    {
      id: 18,
      category: 'espiritual',
      categoryName: 'Impacto Espiritual',
      text: 'Verifico o celular durante momentos de culto, oração ou reflexão espiritual.',
      icon: Sparkles,
      color: '#8B5CF6'
    },
    {
      id: 19,
      category: 'espiritual',
      categoryName: 'Impacto Espiritual',
      text: 'O conteúdo que consumo online frequentemente contradiz meus valores espirituais.',
      icon: Sparkles,
      color: '#8B5CF6'
    },
    {
      id: 20,
      category: 'espiritual',
      categoryName: 'Impacto Espiritual',
      text: 'Percebo que meus hábitos digitais me distanciam de práticas que fortalecem minha fé.',
      icon: Sparkles,
      color: '#8B5CF6'
    }
  ];

  const scaleLabels = [
    { value: 0, label: 'Nunca', color: '#10B981' },
    { value: 1, label: 'Raramente', color: '#84CC16' },
    { value: 2, label: 'Ocasionalmente', color: '#EAB308' },
    { value: 3, label: 'Frequentemente', color: '#F97316' },
    { value: 4, label: 'Quase sempre', color: '#EF4444' },
    { value: 5, label: 'Sempre', color: '#DC2626' }
  ];

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const currentQ = questions[currentQuestion];

  useEffect(() => {
    setQuestionStartTime(Date.now());
  }, [currentQuestion]);

  const handleAnswer = (value: number) => {
    const timeSpent = Date.now() - questionStartTime;
    setAnswers(prev => ({
      ...prev,
      [currentQ.id]: {
        value,
        timeSpent,
        timestamp: Date.now()
      }
    }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const calculateResults = (): QuestionnaireResults => {
    const categoryScores = {
      comportamento: 0,
      vida_cotidiana: 0,
      relacoes: 0,
      espiritual: 0
    };

    let totalScore = 0;

    Object.entries(answers).forEach(([questionId, answer]) => {
      const question = questions.find(q => q.id === parseInt(questionId));
      if (question) {
        categoryScores[question.category as keyof typeof categoryScores] += answer.value;
        totalScore += answer.value;
      }
    });

    const trackType = totalScore <= 33 ? 'liberdade' : 
                     totalScore <= 66 ? 'equilibrio' : 'renovacao';

    const totalTimeSpent = Math.round((Date.now() - timeStarted) / 1000);

    return {
      totalScore,
      categoryScores,
      trackType,
      totalTimeSpent,
      answersData: answers
    };
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const results = calculateResults();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        await supabase.from('questionnaire_results').insert({
          user_id: user.id,
          total_score: results.totalScore,
          total_time_spent: results.totalTimeSpent,
          comportamento_score: results.categoryScores.comportamento,
          vida_cotidiana_score: results.categoryScores.vida_cotidiana,
          relacoes_score: results.categoryScores.relacoes,
          espiritual_score: results.categoryScores.espiritual,
          answers: results.answersData as any
        });
      }
      
      // Redirecionar para onboarding com a trilha recomendada
      navigate(`/onboarding?track=${results.trackType}`);
      
    } catch (error) {
      console.error('Erro ao salvar resultados:', error);
    }
    
    setIsSubmitting(false);
  };

  const isAnswered = answers[currentQ.id] !== undefined;
  const currentAnswer = answers[currentQ.id]?.value;

  if (isSubmitting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardContent className="p-12 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold mb-4">Processando seus resultados...</h2>
            <p className="text-muted-foreground">Em alguns segundos você verá sua análise personalizada</p>
            <div className="mt-6">
              <Progress value={100} className="h-2 animate-pulse" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header with Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Smartphone className="w-8 h-8 text-primary" />
              <span className="text-xl font-bold">Além das Notificações</span>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">
                Questão {currentQuestion + 1} de {questions.length}
              </div>
              <div className="text-lg font-semibold text-primary">
                {Math.round(progress)}% completo
              </div>
            </div>
          </div>
          
          <Progress value={progress} className="h-4 mb-4" />
          
          {/* Progress Steps */}
          <div className="flex justify-between">
            {questions.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index < currentQuestion
                    ? 'bg-green-500 scale-125'
                    : index === currentQuestion
                      ? 'bg-primary scale-150 animate-pulse'
                      : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Question Card */}
        <Card className="mb-8 overflow-hidden">
          {/* Category Header */}
          <div 
            className="px-8 py-6 text-white"
            style={{ backgroundColor: currentQ.color }}
          >
            <div className="flex items-center">
              <currentQ.icon className="w-8 h-8 mr-3" />
              <div>
                <div className="text-sm opacity-90">{currentQ.categoryName}</div>
                <div className="text-lg font-semibold">
                  Questão {currentQuestion + 1}
                </div>
              </div>
            </div>
          </div>

          <CardContent className="p-8">
            <h2 className="text-2xl font-bold mb-8 leading-relaxed">
              {currentQ.text}
            </h2>

            <div className="space-y-4 mb-8">
              <p className="text-muted-foreground font-medium mb-6">
                Com que frequência isso acontece com você?
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {scaleLabels.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleAnswer(option.value)}
                    className={`relative p-6 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${
                      currentAnswer === option.value
                        ? 'border-primary bg-primary/10 shadow-lg scale-105'
                        : 'border-border hover:border-primary/50 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-lg font-semibold mb-1">
                          {option.label}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {option.value}/5
                        </div>
                      </div>
                      
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl"
                        style={{ backgroundColor: option.color }}
                      >
                        {option.value}
                      </div>
                    </div>
                    
                    {currentAnswer === option.value && (
                      <CheckCircle className="absolute top-2 right-2 w-6 h-6 text-green-500 animate-fade-in" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Insight Box */}
            {isAnswered && (
              <Card className="bg-secondary/40 animate-fade-in">
                <CardContent className="p-6">
                  <div className="flex items-start">
                    <AlertTriangle className="w-6 h-6 text-primary mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold mb-2">
                        {currentAnswer >= 4 ? 'Sinal de Alerta' : 
                         currentAnswer >= 2 ? 'Ponto de Atenção' : 'Muito bem!'}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {currentAnswer >= 4 
                          ? 'Esta resposta indica um padrão que pode estar impactando significativamente sua vida.'
                          : currentAnswer >= 2
                          ? 'Este comportamento merece atenção para não se tornar problemático.'
                          : 'Você demonstra um bom controle neste aspecto. Continue assim!'
                        }
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            variant="outline"
            className="transition-smooth"
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Anterior
          </Button>

          <div className="text-center">
            <div className="text-sm text-muted-foreground mb-2">
              {Object.keys(answers).length} de {questions.length} respondidas
            </div>
            <Progress 
              value={(Object.keys(answers).length / questions.length) * 100} 
              className="w-32 h-2"
            />
          </div>

          <Button
            onClick={handleNext}
            disabled={!isAnswered}
            className="transition-smooth"
          >
            {currentQuestion === questions.length - 1 ? (
              <>
                Ver Resultado
                <TrendingUp className="w-5 h-5 ml-2" />
              </>
            ) : (
              <>
                Próxima
                <ChevronRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        </div>

        {/* Help Text */}
        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            💡 Responda com sinceridade para receber uma análise precisa
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            🔒 Suas respostas são confidenciais e utilizadas apenas para gerar seu relatório personalizado
          </p>
        </div>
      </div>
    </div>
  );
};

export default InteractiveQuestionnaire;
