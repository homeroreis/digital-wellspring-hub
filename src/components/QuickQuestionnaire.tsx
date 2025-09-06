import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Smartphone, Users, Heart, Church, ArrowRight, ArrowLeft } from "lucide-react";
import DataStepForm from "./quick-test/DataStepForm";

interface Answer {
  questionIndex: number;
  value: number;
  timeSpent: number;
  timestamp: Date;
}

interface PersonalData {
  fullName: string;
  whatsapp: string;
  age: string;
  city: string;
  acceptContact: boolean;
}

const QuickQuestionnaire = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<'intro' | 'questions' | 'data' | 'result'>('intro');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [personalData, setPersonalData] = useState<PersonalData>({
    fullName: "",
    whatsapp: "",
    age: "",
    city: "",
    acceptContact: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());

  const handleInputChange = React.useCallback((field: keyof PersonalData, value: string | boolean) => {
    setPersonalData(prev => ({ ...prev, [field]: value }));
  }, []);

  // 4 perguntas estratégicas - uma de cada categoria
  const questions = [
    {
      id: 0,
      category: "Comportamento com o Smartphone",
      question: "Verifico meu smartphone imediatamente ao acordar",
      icon: Smartphone,
      color: "from-blue-500 to-blue-600"
    },
    {
      id: 1,
      category: "Impacto na Vida Cotidiana", 
      question: "Passo mais tempo do que pretendia nas redes sociais",
      icon: Users,
      color: "from-green-500 to-green-600"
    },
    {
      id: 2,
      category: "Impacto nas Relações Pessoais",
      question: "Uso meu smartphone durante momentos de conexão com pessoas próximas",
      icon: Heart,
      color: "from-orange-500 to-orange-600"
    },
    {
      id: 3,
      category: "Impacto Espiritual",
      question: "O uso do smartphone interfere no meu tempo de oração ou estudo bíblico",
      icon: Church,
      color: "from-purple-500 to-purple-600"
    }
  ];

  const frequencyOptions = [
    { value: 1, label: "Nunca", description: "Não se aplica" },
    { value: 2, label: "Raramente", description: "Algumas vezes por mês" },
    { value: 3, label: "Às vezes", description: "Algumas vezes por semana" },
    { value: 4, label: "Frequentemente", description: "Diariamente" },
    { value: 5, label: "Sempre", description: "Múltiplas vezes por dia" }
  ];

  const handleAnswerSelect = (value: number) => {
    const timeSpent = Date.now() - questionStartTime;
    const newAnswer: Answer = {
      questionIndex: currentQuestion,
      value,
      timeSpent,
      timestamp: new Date()
    };

    const updatedAnswers = [...answers];
    const existingIndex = updatedAnswers.findIndex(a => a.questionIndex === currentQuestion);
    
    if (existingIndex >= 0) {
      updatedAnswers[existingIndex] = newAnswer;
    } else {
      updatedAnswers.push(newAnswer);
    }
    
    setAnswers(updatedAnswers);

    if (currentQuestion < questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestion(currentQuestion + 1);
        setQuestionStartTime(Date.now());
      }, 500);
    } else {
      setTimeout(() => {
        setCurrentStep('data');
      }, 500);
    }
  };

  const calculateResults = () => {
    const totalScore = answers.reduce((sum, answer) => sum + answer.value, 0);
    const maxScore = questions.length * 5;
    const percentage = (totalScore / maxScore) * 100;

    let trackType = "equilibrio";
    let trackName = "Equilíbrio Digital";
    let description = "Você tem um bom equilíbrio no uso da tecnologia, mas pode aprimorar alguns aspectos.";
    let recommendation = "Foque em criar limites saudáveis e momentos de desconexão consciente.";

    if (percentage <= 40) {
      trackType = "liberdade";
      trackName = "Liberdade Digital";
      description = "Você demonstra um uso consciente da tecnologia. Parabéns!";
      recommendation = "Continue mantendo seus bons hábitos e ajude outros a encontrar o mesmo equilíbrio.";
    } else if (percentage >= 70) {
      trackType = "renovacao";
      trackName = "Renovação Digital";
      description = "Seu uso da tecnologia pode estar impactando sua vida significativamente.";
      recommendation = "É hora de uma transformação profunda. Vamos juntos nessa jornada de renovação!";
    }

    return {
      totalScore,
      percentage: Math.round(percentage),
      trackType,
      trackName,
      description,
      recommendation
    };
  };

  const handleSubmit = async () => {
    if (!personalData.fullName || !personalData.whatsapp) {
      toast.error("Por favor, preencha pelo menos o nome e WhatsApp");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const results = calculateResults();
      setResults(results);

      // Get current user session
      const { data: { session } } = await supabase.auth.getSession();

      const { error } = await supabase
        .from('quick_test_results')
        .insert({
          user_id: session?.user?.id || null, // Save user_id if logged in
          full_name: personalData.fullName,
          whatsapp: personalData.whatsapp,
          age: personalData.age ? parseInt(personalData.age) : null,
          city: personalData.city || null,
          accept_contact: personalData.acceptContact,
          answers: JSON.parse(JSON.stringify(answers)),
          total_score: results.totalScore,
          recommended_track: results.trackType
        });

      if (error) throw error;

      setCurrentStep('result');
      toast.success("Teste concluído com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar resultado:", error);
      toast.error("Erro ao salvar o resultado. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const IntroStep = () => (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <div className="bg-gradient-to-r from-primary to-primary-glow rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
          <Smartphone className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
          Teste Rápido
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Uma avaliação rápida em apenas 4 perguntas
        </p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-center">Como funciona?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="text-center">
              <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4 mb-3">
                <span className="text-2xl font-bold text-blue-600">4</span>
              </div>
              <h3 className="font-semibold mb-2">Perguntas Estratégicas</h3>
              <p className="text-sm text-muted-foreground">
                Uma pergunta de cada categoria essencial para avaliar seu relacionamento com a tecnologia
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-50 dark:bg-green-950 rounded-lg p-4 mb-3">
                <span className="text-2xl font-bold text-green-600">2min</span>
              </div>
              <h3 className="font-semibold mb-2">Tempo Estimado</h3>
              <p className="text-sm text-muted-foreground">
                Rapidez e praticidade em qualquer lugar
              </p>
            </div>
          </div>
          <div className="text-center mt-6">
            <div className="bg-purple-50 dark:bg-purple-950 rounded-lg p-4 mb-3">
              <ArrowRight className="w-8 h-8 text-purple-600 mx-auto" />
            </div>
            <h3 className="font-semibold mb-2">Resultado Imediato</h3>
            <p className="text-sm text-muted-foreground">
              Classificação instantânea com recomendação de trilha personalizada
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="text-center">
        <Button 
          onClick={() => {
            setCurrentStep('questions');
            setQuestionStartTime(Date.now());
          }}
          variant="elevated"
          size="lg"
          className="px-12 py-4 text-lg font-semibold"
        >
          Iniciar Teste Rápido
          <ArrowRight className="ml-2 w-6 h-6" />
        </Button>
      </div>
    </div>
  );

  const QuestionsStep = () => {
    const question = questions[currentQuestion];
    const IconComponent = question.icon;
    const progress = ((currentQuestion + 1) / questions.length) * 100;

    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-6 sm:py-8 max-w-4xl">
          {/* Progress Header */}
          <div className="mb-8 sm:mb-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-bold text-primary">{currentQuestion + 1}</span>
                </div>
                <span className="text-sm font-medium text-muted-foreground">
                  de {questions.length} perguntas
                </span>
              </div>
              <div className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-full">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <span className="text-sm font-medium text-primary">
                  {Math.round(progress)}% concluído
                </span>
              </div>
            </div>
            
            <div className="relative">
              <div className="w-full bg-muted/60 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-primary via-primary-glow to-primary h-2 rounded-full transition-all duration-700 ease-out shadow-sm"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full animate-pulse" />
            </div>
          </div>

          {/* Question Card */}
          <div className="mb-8 sm:mb-12 animate-in slide-in-from-bottom-4 duration-500">
            <Card className="border-0 shadow-elevated bg-card/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-8 pt-8 sm:pt-12">
                <div className={`bg-gradient-to-r ${question.color} rounded-2xl p-5 w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 flex items-center justify-center shadow-soft transition-transform hover:scale-105`}>
                  <IconComponent className="w-9 h-9 sm:w-12 sm:h-12 text-white" />
                </div>
                <div className="space-y-3">
                  <div className="inline-block bg-muted/80 px-4 py-2 rounded-full">
                    <span className="text-sm font-medium text-muted-foreground">
                      {question.category}
                    </span>
                  </div>
                  <CardTitle className="text-xl sm:text-2xl lg:text-3xl leading-tight px-4 sm:px-8">
                    {question.question}
                  </CardTitle>
                </div>
              </CardHeader>
              
              <CardContent className="px-6 sm:px-8 pb-8 sm:pb-12">
                <div className="space-y-3 sm:space-y-4 max-w-2xl mx-auto">
                  {frequencyOptions.map((option, index) => (
                    <Button
                      key={option.value}
                      variant="outline"
                      className="w-full text-left justify-start p-4 sm:p-6 h-auto border-2 hover:border-primary hover:bg-primary/5 hover:shadow-soft transition-all duration-300 group animate-in slide-in-from-left-2"
                      style={{ animationDelay: `${index * 100}ms` }}
                      onClick={() => handleAnswerSelect(option.value)}
                    >
                      <div className="flex items-start gap-4 w-full">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-muted-foreground/30 group-hover:border-primary transition-colors flex items-center justify-center flex-shrink-0 mt-0.5">
                          <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-transparent group-hover:bg-primary transition-colors" />
                        </div>
                        <div className="flex flex-col items-start gap-1 flex-1 min-w-0">
                          <div className="font-semibold text-base sm:text-lg group-hover:text-primary transition-colors">
                            {option.label}
                          </div>
                          <div className="text-sm text-muted-foreground group-hover:text-primary/70 transition-colors leading-relaxed">
                            {option.description}
                          </div>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Navigation */}
          {currentQuestion > 0 && (
            <div className="text-center animate-in slide-in-from-bottom-2 duration-300">
              <Button
                variant="ghost"
                onClick={() => setCurrentQuestion(currentQuestion - 1)}
                className="hover:bg-muted/60 transition-colors"
              >
                <ArrowLeft className="mr-2 w-4 h-4" />
                Pergunta Anterior
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const DataStepMemo = React.useMemo(() => (
    <DataStepForm
      personalData={personalData}
      onInputChange={handleInputChange}
      onBack={() => setCurrentStep('questions')}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
    />
  ), [personalData, handleInputChange, isSubmitting]);

  const DataStep = () => DataStepMemo;

  const ResultStep = () => {
    if (!results) return null;

    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-primary to-primary-glow rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            <span className="text-2xl font-bold text-white">{results.percentage}%</span>
          </div>
          <h1 className="text-3xl font-bold mb-4">Seu Resultado</h1>
          <p className="text-xl text-muted-foreground">
            Trilha recomendada: <span className="font-semibold text-primary">{results.trackName}</span>
          </p>
        </div>

        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Sua pontuação</h3>
                <div className="flex justify-center items-center gap-4 text-sm text-muted-foreground">
                  <span>Baixa dependência</span>
                  <div className="flex-1 bg-muted rounded-full h-2 max-w-xs">
                    <div 
                      className="bg-gradient-to-r from-primary to-primary-glow h-2 rounded-full"
                      style={{ width: `${results.percentage}%` }}
                    />
                  </div>
                  <span>Alta dependência</span>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-3">Interpretação</h3>
                <p className="text-muted-foreground mb-4">{results.description}</p>
                <p className="text-primary font-medium">{results.recommendation}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center space-y-4">
          <Button
            onClick={() => navigate("/dashboard")}
            size="lg"
            className="mr-4"
          >
            Ir para Minha Trilha
          </Button>
          <Button
            onClick={() => navigate("/test")}
            size="lg"
            variant="outline"
            className="mr-4"
          >
            Fazer Teste Completo
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/programs")}
            size="lg"
          >
            Ver Programa {results.trackName}
          </Button>
        </div>

        <div className="mt-8 p-4 bg-muted/50 rounded-lg text-center text-sm text-muted-foreground">
          <p>Este é um teste simplificado para triagem inicial.</p>
          <p>Para uma avaliação completa e personalizada, faça o teste completo de 20 perguntas.</p>
        </div>
      </div>
    );
  };

  const stepComponents = {
    intro: IntroStep,
    questions: QuestionsStep,
    data: DataStep,
    result: ResultStep
  };

  const StepComponent = stepComponents[currentStep];

  return <StepComponent />;
};

export default QuickQuestionnaire;