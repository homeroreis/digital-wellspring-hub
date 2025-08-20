import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Heart, Target, Clock, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface LiberdadeOnboardingProps {
  userId: string;
  userScore: number;
  onComplete: () => void;
}

const LiberdadeOnboarding: React.FC<LiberdadeOnboardingProps> = ({
  userId,
  userScore,
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState({
    feeling: '',
    objectives: [] as string[],
    timeCommitment: '',
    commitment: false
  });

  const steps = [
    {
      title: 'Parabéns! 🎉',
      subtitle: 'Seu Nível: LIBERDADE',
      content: 'welcome'
    },
    {
      title: 'Seu Perfil',
      subtitle: 'Como você se sente sobre seu uso atual?',
      content: 'profile'
    },
    {
      title: 'Seus Objetivos',
      subtitle: 'O que você busca nestes 7 dias?',
      content: 'objectives'
    },
    {
      title: 'Seu Compromisso',
      subtitle: 'Quanto tempo por dia você pode dedicar?',
      content: 'commitment'
    }
  ];

  const objectiveOptions = [
    'Mais tempo de qualidade com família',
    'Aumentar produtividade',
    'Fortalecer vida espiritual',
    'Ser exemplo para outros'
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleObjectiveToggle = (objective: string) => {
    const updatedObjectives = responses.objectives.includes(objective)
      ? responses.objectives.filter(o => o !== objective)
      : [...responses.objectives, objective];
    
    setResponses({ ...responses, objectives: updatedObjectives });
  };

  const handleComplete = async () => {
    try {
      // Save user preferences
      await supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          track_slug: 'liberdade',
          experience_level: responses.feeling,
          focus_areas: responses.objectives,
          reminder_time: responses.timeCommitment === '15min' ? '09:00' : 
                        responses.timeCommitment === '30min' ? '08:30' : '08:00',
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString()
        });

      // Initialize track progress
      await supabase
        .from('user_track_progress')
        .insert({
          user_id: userId,
          track_slug: 'liberdade',
          current_day: 1,
          level_number: 1,
          total_points: 0,
          streak_days: 0,
          is_active: true
        });

      onComplete();
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return true;
      case 1: return responses.feeling !== '';
      case 2: return responses.objectives.length > 0;
      case 3: return responses.timeCommitment !== '' && responses.commitment;
      default: return false;
    }
  };

  const renderWelcomeContent = () => (
    <div className="text-center space-y-6">
      <div className="w-20 h-20 mx-auto bg-emerald-100 rounded-full flex items-center justify-center">
        <Heart className="w-10 h-10 text-emerald-600" />
      </div>
      
      <div className="space-y-2">
        <p className="text-lg text-muted-foreground">
          Seu teste mostrou que você já tem uma relação saudável com a tecnologia.
        </p>
        <p className="text-xl font-semibold text-emerald-600">
          Pontuação: {userScore} pontos - Nível LIBERDADE
        </p>
      </div>

      <div className="bg-emerald-50 p-4 rounded-lg space-y-2">
        <p className="font-medium">Isso significa que você:</p>
        <div className="space-y-1 text-left">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Usa a tecnologia como ferramenta, não muleta</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Consegue períodos sem celular sem ansiedade</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Tem relacionamentos presenciais saudáveis</span>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="text-blue-800 font-medium">
          Nos próximos 7 dias, vamos FORTALECER ainda mais seus bons hábitos
          e criar uma blindagem contra futuras dependências.
        </p>
        <p className="text-blue-700 mt-2">
          Sua jornada será leve, prática e inspiradora!
        </p>
      </div>
    </div>
  );

  const renderProfileContent = () => (
    <div className="space-y-4">
      <div className="grid gap-3">
        {['Satisfeito', 'Pode melhorar', 'Quero prevenir problemas'].map((option) => (
          <Card 
            key={option}
            className={`cursor-pointer transition-all ${
              responses.feeling === option ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-muted/50'
            }`}
            onClick={() => setResponses({ ...responses, feeling: option })}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full border-2 ${
                  responses.feeling === option ? 'bg-primary border-primary' : 'border-muted-foreground'
                }`} />
                <span>{option}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderObjectivesContent = () => (
    <div className="space-y-4">
      <div className="grid gap-3">
        {objectiveOptions.map((objective) => (
          <Card 
            key={objective}
            className={`cursor-pointer transition-all ${
              responses.objectives.includes(objective) ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-muted/50'
            }`}
            onClick={() => handleObjectiveToggle(objective)}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Checkbox 
                  checked={responses.objectives.includes(objective)}
                  onChange={() => {}}
                />
                <span>{objective}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderCommitmentContent = () => (
    <div className="space-y-6">
      <div className="grid gap-3">
        {[
          { value: '15min', label: '15 minutos por dia', desc: 'Foco nas atividades essenciais' },
          { value: '30min', label: '30 minutos por dia', desc: 'Experiência completa recomendada' },
          { value: '45min', label: '45 minutos por dia', desc: 'Transformação profunda' }
        ].map((option) => (
          <Card 
            key={option.value}
            className={`cursor-pointer transition-all ${
              responses.timeCommitment === option.value ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-muted/50'
            }`}
            onClick={() => setResponses({ ...responses, timeCommitment: option.value })}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full border-2 ${
                  responses.timeCommitment === option.value ? 'bg-primary border-primary' : 'border-muted-foreground'
                }`} />
                <div>
                  <div className="font-medium">{option.label}</div>
                  <div className="text-sm text-muted-foreground">{option.desc}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Checkbox 
              checked={responses.commitment}
              onCheckedChange={(checked) => setResponses({ ...responses, commitment: !!checked })}
            />
            <div className="space-y-2">
              <p className="font-medium text-orange-800">
                Eu me comprometo a:
              </p>
              <ul className="text-sm text-orange-700 space-y-1">
                <li>• Dedicar o tempo escolhido diariamente</li>
                <li>• Fazer todas as atividades propostas</li>
                <li>• Ser honesto(a) comigo mesmo</li>
                <li>• Não desistir quando ficar desafiador</li>
                <li>• Buscar ajuda quando precisar</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (steps[currentStep].content) {
      case 'welcome': return renderWelcomeContent();
      case 'profile': return renderProfileContent();
      case 'objectives': return renderObjectivesContent();
      case 'commitment': return renderCommitmentContent();
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-emerald-600" />
              <span className="font-medium text-emerald-600">Trilha Liberdade</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {currentStep + 1} de {steps.length}
            </span>
          </div>
          
          <Progress value={(currentStep + 1) / steps.length * 100} className="h-2" />
        </div>

        {/* Content Card */}
        <Card className="mb-6">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{steps[currentStep].title}</CardTitle>
            <p className="text-muted-foreground">{steps[currentStep].subtitle}</p>
          </CardHeader>
          <CardContent>
            {renderContent()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            Anterior
          </Button>
          
          {currentStep === steps.length - 1 ? (
            <Button onClick={handleComplete} disabled={!canProceed()}>
              Iniciar Jornada
            </Button>
          ) : (
            <Button onClick={handleNext} disabled={!canProceed()}>
              Próximo
            </Button>
          )}
        </div>

        {/* Help */}
        <div className="fixed bottom-6 right-6">
          <Button size="sm" variant="outline" className="rounded-full">
            <Clock className="w-4 h-4 mr-2" />
            Ajuda
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LiberdadeOnboarding;