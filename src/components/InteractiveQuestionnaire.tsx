import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, CheckCircle, Smartphone, Clock, Award, Users, AlertCircle, Target, Sparkles, Plus, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Question {
  id: string;
  question: string;
  category: 'comportamento' | 'vida_cotidiana' | 'relacoes' | 'espiritual';
  options?: { label: string; value: number }[];
  type: 'slider' | 'radio' | 'custom';
}

const questions: Question[] = [
  { id: 'q1', question: 'Com que frequência você sente ansiedade ou estresse por estar longe do seu celular (Nomofobia)?', category: 'comportamento', options: [
    { label: 'Nunca', value: 1 }, { label: 'Raramente', value: 2 }, { label: 'Às vezes', value: 3 }, { label: 'Frequentemente', value: 4 }, { label: 'Sempre', value: 5 }
  ], type: 'radio' },
  { id: 'q2', question: 'Qual a sua nota para o impacto da tecnologia em seus momentos de oração, meditação e estudo da Bíblia?', category: 'espiritual', options: [
    { label: 'Totalmente negativo', value: 5 }, { label: 'Negativo', value: 4 }, { label: 'Neutro', value: 3 }, { label: 'Positivo', value: 2 }, { label: 'Totalmente positivo', value: 1 }
  ], type: 'radio' },
  { id: 'q3', question: 'Em uma escala de 1 a 5, quão bem você gerencia seu tempo de tela, em relação às suas responsabilidades (trabalho, família)?', category: 'vida_cotidiana', type: 'slider' },
  { id: 'q4', question: 'O uso excessivo de tecnologia já causou conflitos em seus relacionamentos familiares ou fraternos?', category: 'relacoes', options: [
    { label: 'Nunca', value: 1 }, { label: 'Raramente', value: 2 }, { label: 'Às vezes', value: 3 }, { label: 'Frequentemente', value: 4 }, { label: 'Sempre', value: 5 }
  ], type: 'radio' },
  { id: 'q5', question: 'Em uma escala de 1 a 5, o uso de tecnologia prejudica sua qualidade de sono?', category: 'comportamento', type: 'slider' },
  { id: 'q6', question: 'Com que frequência você interrompe conversas pessoais para olhar o celular?', category: 'relacoes', options: [
    { label: 'Nunca', value: 1 }, { label: 'Raramente', value: 2 }, { label: 'Às vezes', value: 3 }, { label: 'Frequentemente', value: 4 }, { label: 'Sempre', value: 5 }
  ], type: 'radio' },
  { id: 'q7', question: 'Você sente a necessidade de verificar notificações constantemente, mesmo quando não há razão para isso?', category: 'comportamento', options: [
    { label: 'Nunca', value: 1 }, { label: 'Raramente', value: 2 }, { label: 'Às vezes', value: 3 }, { label: 'Frequentemente', value: 4 }, { label: 'Sempre', value: 5 }
  ], type: 'radio' },
  { id: 'q8', question: 'Qual a sua nota para o impacto da tecnologia em sua capacidade de concentração e foco nas tarefas diárias?', category: 'vida_cotidiana', options: [
    { label: 'Totalmente positivo', value: 1 }, { label: 'Positivo', value: 2 }, { label: 'Neutro', value: 3 }, { label: 'Negativo', value: 4 }, { label: 'Totalmente negativo', value: 5 }
  ], type: 'radio' },
  { id: 'q9', question: 'Você já se sentiu culpado ou envergonhado pelo tempo que passa em dispositivos eletrônicos?', category: 'espiritual', options: [
    { label: 'Nunca', value: 1 }, { label: 'Raramente', value: 2 }, { label: 'Às vezes', value: 3 }, { label: 'Frequentemente', value: 4 }, { label: 'Sempre', value: 5 }
  ], type: 'radio' },
  { id: 'q10', question: 'Qual a sua nota para o impacto da tecnologia em sua capacidade de estar presente e aproveitar momentos de lazer offline?', category: 'vida_cotidiana', options: [
    { label: 'Totalmente positivo', value: 1 }, { label: 'Positivo', value: 2 }, { label: 'Neutro', value: 3 }, { label: 'Negativo', value: 4 }, { label: 'Totalmente negativo', value: 5 }
  ], type: 'radio' },
];

const InteractiveQuestionnaire = () => {
  const navigate = useNavigate();
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timer, setTimer] = useState(0);
  const [timerActive, setTimerActive] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      if (timerActive) {
        setTimer(prev => prev + 1);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [timerActive]);

  const currentQ = questions[currentQIndex];

  const handleAnswerChange = (value: number) => {
    setAnswers(prev => ({ ...prev, [currentQ.id]: { value, category: currentQ.category } }));
  };

  const handleNext = () => {
    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex(currentQIndex + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentQIndex > 0) {
      setCurrentQIndex(currentQIndex - 1);
    }
  };

  const calculateResults = () => {
    let totalScore = 0;
    const categoryScores: { [key: string]: number } = {
      comportamento: 0,
      vida_cotidiana: 0,
      relacoes: 0,
      espiritual: 0,
    };

    const answersData: { [key: string]: any } = {};

    Object.entries(answers).forEach(([qId, answer]) => {
      const { value, category } = answer as { value: number; category: string };
      totalScore += value;
      categoryScores[category] += value;
      answersData[qId] = value;
    });

    // Normalize scores to 0-100 scale
    // Max score for each category is 25 (5 questions * 5 points)
    // Max total score is 100 (20 questions, but we only have 10, so let's adjust)
    // Let's assume max score for these 10 questions is 50.
    const maxPossibleScore = 50;
    const normalizedScore = Math.min(Math.round((totalScore / maxPossibleScore) * 100), 100);

    let trackType: 'liberdade' | 'equilibrio' | 'renovacao';
    if (totalScore <= 20) {
      trackType = 'liberdade';
    } else if (totalScore <= 35) {
      trackType = 'equilibrio';
    } else {
      trackType = 'renovacao';
    }

    return {
      totalScore: normalizedScore,
      categoryScores,
      totalTimeSpent: timer,
      answersData,
      trackType,
    };
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setTimerActive(false);
    
    try {
      const results = calculateResults();
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('User not authenticated');
        toast.error('Você precisa estar logado para salvar os resultados.');
        return;
      }

      const { error } = await supabase
        .from('questionnaire_results')
        .insert({
          user_id: user.id,
          total_score: results.totalScore,
          comportamento_score: results.categoryScores.comportamento,
          vida_cotidiana_score: results.categoryScores.vida_cotidiana,
          relacoes_score: results.categoryScores.relacoes,
          espiritual_score: results.categoryScores.espiritual,
          total_time_spent: results.totalTimeSpent,
          answers: results.answersData as any,
          track_type: results.trackType,
          completed_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error saving questionnaire results:', error);
        toast.error('Ocorreu um erro ao salvar os resultados.');
        return;
      }

      // Navigate to personalized results page with data
      navigate(`/results?score=${results.totalScore}&track=${results.trackType}&comportamento=${results.categoryScores.comportamento}&vida_cotidiana=${results.categoryScores.vida_cotidiana}&relacoes=${results.categoryScores.relacoes}&espiritual=${results.categoryScores.espiritual}&time=${results.totalTimeSpent}`);
    } catch (error) {
      console.error('Error submitting questionnaire:', error);
      toast.error('Ocorreu um erro ao enviar o questionário.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isAnswered = answers[currentQ.id] !== undefined;
  const currentAnswer = answers[currentQ.id]?.value;

  if (isSubmitting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardContent className="p-12 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-6"></div>
            <h2 className="text-xl font-bold">Processando seus resultados...</h2>
            <p className="text-muted-foreground">Isso não deve demorar muito. Prepare-se para a sua jornada!</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex flex-col justify-between">
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center p-6 sm:p-12 space-y-4">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Teste de Consciência Digital
            </h1>
            <p className="text-muted-foreground">
              Responda às perguntas abaixo para entender sua relação com a tecnologia e iniciar sua jornada de transformação espiritual.
            </p>
          </CardHeader>
          <Separator />
          <CardContent className="p-6 sm:p-12 space-y-8">
            <div className="text-center">
              <span className="text-sm font-medium text-gray-600">
                Questão {currentQIndex + 1} de {questions.length}
              </span>
              <Progress
                value={((currentQIndex + 1) / questions.length) * 100}
                className="mt-2 h-2"
              />
            </div>
            
            <div className="space-y-6">
              <p className="text-2xl font-bold text-gray-900 leading-relaxed">
                {currentQ.question}
              </p>
              
              {currentQ.type === 'slider' && (
                <div className="space-y-4">
                  <Slider
                    defaultValue={[currentAnswer || 3]}
                    max={5}
                    step={1}
                    onValueChange={(value) => handleAnswerChange(value[0])}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>1</span>
                    <span>2</span>
                    <span>3</span>
                    <span>4</span>
                    <span>5</span>
                  </div>
                </div>
              )}
              
              {currentQ.type === 'radio' && (
                <RadioGroup
                  onValueChange={(value) => handleAnswerChange(parseInt(value))}
                  value={currentAnswer?.toString()}
                >
                  {currentQ.options?.map((option) => (
                    <div
                      key={option.value}
                      className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <RadioGroupItem value={option.value.toString()} id={`${currentQ.id}-${option.value}`} />
                      <Label htmlFor={`${currentQ.id}-${option.value}`} className="flex-1 text-base cursor-pointer">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}
            </div>
          </CardContent>
          <Separator />
          <div className="p-6 flex justify-between items-center">
            <Button
              onClick={handlePrevious}
              disabled={currentQIndex === 0}
              variant="outline"
              className="flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Anterior
            </Button>
            
            <Button
              onClick={handleNext}
              disabled={!isAnswered}
              className="flex items-center bg-yellow-500 text-gray-800 hover:bg-yellow-600"
            >
              {currentQIndex === questions.length - 1 ? 'Finalizar' : 'Próximo'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </Card>
      </div>
      <footer className="text-center text-xs text-muted-foreground py-4">
        Tempo gasto: {Math.floor(timer / 60)} min {timer % 60} seg
      </footer>
    </div>
  );
};

export default InteractiveQuestionnaire;