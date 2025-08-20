import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Target, Clock, Users, Lightbulb, ArrowRight } from 'lucide-react';
import { equilibrioTrackData } from '@/data/tracks/equilibrio-content';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EquilibrioOnboardingProps {
  userId: string;
  onComplete: () => void;
}

const EquilibrioOnboarding: React.FC<EquilibrioOnboardingProps> = ({ userId, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const steps = equilibrioTrackData.onboardingSteps;

  const handleComplete = async () => {
    setLoading(true);
    
    try {
      // Save user preferences and mark onboarding as completed
      await supabase.from('user_preferences').upsert({
        user_id: userId,
        track_slug: 'equilibrio',
        focus_areas: selectedPreferences,
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString()
      });

      // Initialize track progress
      await supabase.from('user_track_progress').insert({
        user_id: userId,
        track_slug: 'equilibrio',
        current_day: 1,
        total_points: 0,
        is_active: true
      });

      toast({
        title: "Boas-vindas à Trilha Equilíbrio! 🌱",
        description: "Sua jornada de 21 dias começou!"
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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Target className="w-8 h-8 text-amber-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Trilha Equilíbrio</h1>
                <p className="text-gray-600">21 dias para uso consciente</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-amber-100 text-amber-800">
              Etapa {currentStep + 1} de {steps.length}
            </Badge>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-amber-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                {currentStep === 0 && <Target className="w-5 h-5 text-amber-600" />}
                {currentStep === 1 && <Clock className="w-5 h-5 text-amber-600" />}
                {currentStep === 2 && <Users className="w-5 h-5 text-amber-600" />}
                {currentStep === 3 && <CheckCircle className="w-5 h-5 text-amber-600" />}
              </div>
              {currentStepData.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="prose max-w-none">
              <div dangerouslySetInnerHTML={{ __html: currentStepData.content.replace(/\n/g, '<br>') }} />
            </div>

            {/* Focus Areas Selection (Step 2) */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <h4 className="font-semibold">Selecione suas áreas de foco (opcional):</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    'Redução de ansiedade',
                    'Melhores relacionamentos',
                    'Produtividade no trabalho',
                    'Tempo em família',
                    'Vida espiritual',
                    'Exercícios físicos'
                  ].map((area) => (
                    <Button
                      key={area}
                      variant={selectedPreferences.includes(area) ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setSelectedPreferences(prev => 
                          prev.includes(area) 
                            ? prev.filter(p => p !== area)
                            : [...prev, area]
                        );
                      }}
                      className="justify-start"
                    >
                      {selectedPreferences.includes(area) && <CheckCircle className="w-4 h-4 mr-2" />}
                      {area}
                    </Button>
                  ))}
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
              className="bg-amber-600 hover:bg-amber-700"
            >
              Próximo
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              disabled={loading}
              className="bg-amber-600 hover:bg-amber-700"
            >
              {loading ? "Iniciando..." : "Começar Jornada"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EquilibrioOnboarding;