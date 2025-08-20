import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, Zap, Clock, Users, AlertTriangle, ArrowRight, Heart } from 'lucide-react';
import { renovacaoTrackData } from '@/data/tracks/renovacao-content';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface RenovacaoOnboardingProps {
  userId: string;
  onComplete: () => void;
}

const RenovacaoOnboarding: React.FC<RenovacaoOnboardingProps> = ({ userId, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [supportNetwork, setSupportNetwork] = useState({ primary: '', secondary: '', emergency: '' });
  const [commitment, setCommitment] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const steps = renovacaoTrackData.onboardingSteps;

  const handleComplete = async () => {
    if (!commitment) {
      toast({
        title: "Compromisso Necessário",
        description: "É necessário assumir o compromisso para iniciar a trilha.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      // Save user preferences and mark onboarding as completed
      await supabase.from('user_preferences').upsert({
        user_id: userId,
        track_slug: 'renovacao',
        focus_areas: selectedSymptoms,
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString()
      });

      // Initialize track progress
      await supabase.from('user_track_progress').insert({
        user_id: userId,
        track_slug: 'renovacao',
        current_day: 1,
        total_points: 0,
        is_active: true
      });

      toast({
        title: "Bem-vindo à Trilha Renovação! 🔥",
        description: "Sua jornada de transformação de 40 dias começou!"
      });

      onComplete();
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast({
        title: "Erro",
        description: "Erro ao inicializar trilha. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const currentStepData = steps[currentStep];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Alert Banner */}
        <Alert className="mb-8 border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Trilha Intensiva:</strong> Esta é uma jornada de 40 dias para casos de dependência severa. 
            Requer dedicação completa e pode necessitar acompanhamento profissional.
          </AlertDescription>
        </Alert>

        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Zap className="w-8 h-8 text-red-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Trilha Renovação</h1>
                <p className="text-gray-600">40 dias de transformação profunda</p>
              </div>
            </div>
            <Badge variant="destructive" className="bg-red-100 text-red-800">
              Etapa {currentStep + 1} de {steps.length}
            </Badge>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-red-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <Card className="mb-8 border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-red-800">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                {currentStep === 0 && <AlertTriangle className="w-5 h-5 text-red-600" />}
                {currentStep === 1 && <Users className="w-5 h-5 text-red-600" />}
                {currentStep === 2 && <Heart className="w-5 h-5 text-red-600" />}
                {currentStep === 3 && <CheckCircle className="w-5 h-5 text-red-600" />}
              </div>
              {currentStepData.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="prose max-w-none">
              <div dangerouslySetInnerHTML={{ __html: currentStepData.content.replace(/\n/g, '<br>') }} />
            </div>

            {/* Symptoms Assessment (Step 0) */}
            {currentStep === 0 && (
              <div className="space-y-4">
                <h4 className="font-semibold text-red-800">Marque TODOS os sintomas que você sente:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    'Pânico quando fico sem celular',
                    'Uso celular mais de 8h/dia',
                    'Já prejudiquei trabalho/estudos',
                    'Perdi relacionamentos importantes',
                    'Durmo menos de 5h por causa do celular',
                    'Sinto dores físicas (pescoço, olhos, mãos)',
                    'Tenho crises de ansiedade',
                    'Me isolo para usar celular',
                    'Minto sobre meu uso',
                    'Já tentei parar e não consegui'
                  ].map((symptom) => (
                    <Button
                      key={symptom}
                      variant={selectedSymptoms.includes(symptom) ? "destructive" : "outline"}
                      size="sm"
                      onClick={() => {
                        setSelectedSymptoms(prev => 
                          prev.includes(symptom) 
                            ? prev.filter(p => p !== symptom)
                            : [...prev, symptom]
                        );
                      }}
                      className="justify-start text-left h-auto py-3 px-4"
                    >
                      {selectedSymptoms.includes(symptom) && <CheckCircle className="w-4 h-4 mr-2" />}
                      {symptom}
                    </Button>
                  ))}
                </div>
                {selectedSymptoms.length >= 5 && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      Você marcou {selectedSymptoms.length} sintomas. Esta trilha é essencial para sua recuperação.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            {/* Commitment (Step 2) */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
                  <h4 className="font-semibold text-red-800 mb-4">Termo de Compromisso:</h4>
                  <div className="space-y-2 text-sm">
                    <p>✓ Reconheço que tenho dependência severa de tecnologia digital</p>
                    <p>✓ Preciso de ajuda profissional e espiritual</p>
                    <p>✓ Os próximos 40 dias serão extremamente difíceis</p>
                    <p>✓ Posso ter sintomas de abstinência</p>
                    <p>✓ Precisarei fazer sacrifícios significativos</p>
                  </div>
                  
                  <Button
                    variant={commitment ? "destructive" : "outline"}
                    onClick={() => setCommitment(!commitment)}
                    className="mt-4 w-full"
                  >
                    {commitment && <CheckCircle className="w-4 h-4 mr-2" />}
                    {commitment ? "Compromisso Assumido" : "Assumir Compromisso"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
            disabled={currentStep === 0}
          >
            Anterior
          </Button>
          
          {currentStep < steps.length - 1 ? (
            <Button
              onClick={() => setCurrentStep(prev => prev + 1)}
              className="bg-red-600 hover:bg-red-700"
              disabled={currentStep === 0 && selectedSymptoms.length < 3}
            >
              Próximo
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              disabled={loading || !commitment}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? "Iniciando..." : "Começar Transformação"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RenovacaoOnboarding;