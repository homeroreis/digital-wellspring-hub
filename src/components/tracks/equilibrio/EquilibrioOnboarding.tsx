import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, CheckCircle, Play, Book, Users, Target, Gift, Sparkles, Heart, Clock, ArrowRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EquilibrioOnboardingProps {
  userId: string;
  userScore: number;
  onComplete: () => void;
}

const EquilibrioOnboarding: React.FC<EquilibrioOnboardingProps> = ({
  userId,
  userScore,
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [showTooltip, setShowTooltip] = useState<number | null>(null);
  const [userPreferences, setUserPreferences] = useState({
    notifications: true,
    reminderTime: '09:00',
    focusAreas: [] as string[],
    experience: '',
    timeCommitment: '',
    commitment: false
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const onboardingSteps = [
    {
      id: 'welcome',
      title: 'Sua jornada de equilíbrio começa agora! 🧘',
      subtitle: 'Detectamos sinais de uso em alerta - vamos restaurar o equilíbrio juntos',
      icon: Sparkles,
      color: 'hsl(var(--track-equilibrio))',
      content: 'welcome'
    },
    {
      id: 'understanding',
      title: 'Entendendo sua situação atual',
      subtitle: 'Trilha Equilíbrio - 21 dias para dominar a ansiedade digital',
      icon: Target,
      color: 'hsl(45 100% 40%)',
      content: 'understanding'
    },
    {
      id: 'features',
      title: 'Suas ferramentas de transformação',
      subtitle: 'Técnicas científicas e espirituais para vencer a dependência',
      icon: Gift,
      color: 'hsl(45 96% 45%)',
      content: 'features'
    },
    {
      id: 'preferences',
      title: 'Configure sua experiência',
      subtitle: 'Personalize sua jornada para máxima eficácia',
      icon: Heart,
      color: 'hsl(45 100% 52%)',
      content: 'preferences'
    },
    {
      id: 'first-activity',
      title: 'Primeira técnica anti-ansiedade',
      subtitle: 'Respiração 4-7-8 para controlar impulsos digitais',
      icon: Play,
      color: 'hsl(45 100% 40%)',
      content: 'first-activity'
    },
    {
      id: 'complete',
      title: 'Preparado para a transformação! 💪',
      subtitle: 'Sua Trilha Equilíbrio está configurada e pronta',
      icon: CheckCircle,
      color: 'hsl(142 76% 36%)',
      content: 'complete'
    }
  ];

  const features = [
    {
      icon: Book,
      title: 'Técnicas Anti-Ansiedade',
      description: 'Respiração 4-7-8, mindfulness e grounding para controlar impulsos',
      highlight: '15+ técnicas científicas'
    },
    {
      icon: Users,
      title: 'Estratégias Anti-FOMO',
      description: 'Vença o medo de perder algo e reconecte-se com o presente',
      highlight: 'Método exclusivo'
    },
    {
      icon: Target,
      title: 'Conexão Humana Real',
      description: 'Exercícios para fortalecer relacionamentos presenciais',
      highlight: '21 desafios progressivos'
    },
    {
      icon: Clock,
      title: 'Ritual de Descompressão',
      description: 'Rotinas noturnas para quebrar o ciclo de checagem compulsiva',
      highlight: 'Sono reparador garantido'
    }
  ];

  const focusAreasOptions = [
    { id: 'anxiety', label: 'Reduzir ansiedade digital', icon: '😌' },
    { id: 'fomo', label: 'Vencer FOMO (Fear of Missing Out)', icon: '🎯' },
    { id: 'sleep', label: 'Melhorar qualidade do sono', icon: '😴' },
    { id: 'focus', label: 'Aumentar concentração no trabalho', icon: '💼' },
    { id: 'relationships', label: 'Conectar-se mais com pessoas', icon: '❤️' },
    { id: 'spiritual', label: 'Fortalecer vida espiritual', icon: '🙏' }
  ];

  const currentStepData = onboardingSteps[currentStep];

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCompletedSteps([...completedSteps, currentStep]);
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFocusAreaToggle = (areaId: string) => {
    setUserPreferences(prev => ({
      ...prev,
      focusAreas: prev.focusAreas.includes(areaId)
        ? prev.focusAreas.filter(id => id !== areaId)
        : [...prev.focusAreas, areaId]
    }));
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      // Save user preferences
      await supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          track_slug: 'equilibrio',
          experience_level: userPreferences.experience,
          focus_areas: userPreferences.focusAreas,
          reminder_time: userPreferences.reminderTime,
          notifications: userPreferences.notifications,
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString()
        });

      // Initialize track progress
      await supabase
        .from('user_track_progress')
        .insert({
          user_id: userId,
          track_slug: 'equilibrio',
          current_day: 1,
          level_number: 1,
          total_points: 0,
          streak_days: 0,
          is_active: true
        });

      toast({
        title: "Onboarding concluído!",
        description: "Sua Trilha Equilíbrio está pronta. Vamos começar!",
      });

      onComplete();
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar suas preferências. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return true;
      case 1: return true;
      case 2: return true;
      case 3: return userPreferences.focusAreas.length > 0 && userPreferences.experience !== '' && userPreferences.timeCommitment !== '' && userPreferences.commitment;
      case 4: return true;
      case 5: return true;
      default: return false;
    }
  };

  const renderWelcomeContent = () => (
    <div className="text-center space-y-6">
      <div className="w-32 h-32 mx-auto bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mb-8">
        <Sparkles className="w-16 h-16 text-white" />
      </div>
      
      <div className="max-w-md mx-auto">
        <h3 className="text-xl font-bold mb-4">Você está no caminho certo!</h3>
        <p className="text-muted-foreground mb-6">
          Detectamos sinais de uso em alerta, mas você teve a sabedoria de buscar ajuda. 
          Milhares já reconquistaram o equilíbrio usando nosso método científico.
        </p>
        
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">89%</div>
            <div className="text-sm text-muted-foreground">Redução ansiedade</div>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">73%</div>
            <div className="text-sm text-muted-foreground">Melhora no sono</div>
          </div>
          <div className="p-4 bg-amber-50 rounded-lg">
            <div className="text-2xl font-bold text-amber-600">21</div>
            <div className="text-sm text-muted-foreground">Dias para equilíbrio</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUnderstandingContent = () => (
    <div className="space-y-6">
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg">
        <div className="flex items-center mb-4">
          <Target className="w-8 h-8 text-yellow-600 mr-3" />
          <div>
            <h3 className="text-lg font-bold text-yellow-800">Trilha Equilíbrio</h3>
            <p className="text-yellow-700">Uso em Alerta - Recuperação em 21 dias</p>
          </div>
        </div>
        
        <p className="text-muted-foreground mb-4">
          Seu teste revelou ansiedade digital e sinais de dependência moderada. A boa notícia? 
          É o momento perfeito para reverter isso antes que se torne severo!
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-semibold mb-2">🎯 Sintomas que vamos tratar:</h4>
            <ul className="text-sm space-y-1">
              <li>• Ansiedade quando sem celular</li>
              <li>• FOMO (medo de perder algo)</li>
              <li>• Checagem compulsiva</li>
              <li>• Insônia digital</li>
            </ul>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-semibold mb-2">📈 Resultados esperados:</h4>
            <ul className="text-sm space-y-1">
              <li>• Controle total sobre impulsos</li>
              <li>• Sono reparador</li>
              <li>• Relacionamentos mais profundos</li>
              <li>• Paz interior duradoura</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="text-center">
        <p className="text-muted-foreground">
          <strong>Método Científico:</strong> Combinamos neurociência, terapia cognitiva e princípios espirituais 
          para resultados duradouros em apenas 21 dias.
        </p>
      </div>
    </div>
  );

  const renderFeaturesContent = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-xl font-bold mb-2">Suas armas contra a ansiedade digital</h3>
        <p className="text-muted-foreground">Ferramentas científicas testadas por milhares de pessoas</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((feature, index) => (
          <div 
            key={index}
            className="bg-white p-6 rounded-xl border-2 border-gray-100 hover:border-yellow-200 transition-all cursor-pointer group"
            onMouseEnter={() => setShowTooltip(index)}
            onMouseLeave={() => setShowTooltip(null)}
          >
            <div className="flex items-start">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-yellow-200 transition-colors">
                <feature.icon className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-2">{feature.title}</h4>
                <p className="text-muted-foreground text-sm mb-3">{feature.description}</p>
                <div className="text-xs font-medium text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full inline-block">
                  {feature.highlight}
                </div>
              </div>
            </div>
            
            {showTooltip === index && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm text-muted-foreground">
                Disponível assim que você completar o onboarding!
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderPreferencesContent = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h3 className="text-xl font-bold mb-2">Configure sua transformação</h3>
        <p className="text-muted-foreground">Personalize para resultados máximos</p>
      </div>
      
      {/* Focus Areas */}
      <div>
        <h4 className="font-semibold mb-4">🎯 Principais focos (escolha pelo menos 2):</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {focusAreasOptions.map((area) => (
            <button
              key={area.id}
              onClick={() => handleFocusAreaToggle(area.id)}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                userPreferences.focusAreas.includes(area.id)
                  ? 'border-yellow-500 bg-yellow-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <span className="text-2xl mr-3">{area.icon}</span>
                <span className="font-medium">{area.label}</span>
                {userPreferences.focusAreas.includes(area.id) && (
                  <CheckCircle className="w-5 h-5 text-yellow-500 ml-auto" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
      
      {/* Time Commitment */}
      <div>
        <h4 className="font-semibold mb-4">⏰ Quanto tempo por dia você pode dedicar?</h4>
        <div className="space-y-2">
          {[
            { value: '30min', label: '30 minutos - Essencial', desc: 'Atividades principais apenas' },
            { value: '45min', label: '45 minutos - Recomendado', desc: 'Experiência completa' },
            { value: '60min', label: '60+ minutos - Intensivo', desc: 'Transformação acelerada' }
          ].map((option) => (
            <label key={option.value} className="flex items-center p-3 border rounded-lg hover:bg-gray-50">
              <input
                type="radio"
                name="timeCommitment"
                value={option.value}
                checked={userPreferences.timeCommitment === option.value}
                onChange={(e) => setUserPreferences(prev => ({ ...prev, timeCommitment: e.target.value }))}
                className="mr-3 w-4 h-4 text-yellow-600"
              />
              <div>
                <span className="font-medium">{option.label}</span>
                <p className="text-sm text-muted-foreground">{option.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>
      
      {/* Experience Level */}
      <div>
        <h4 className="font-semibold mb-4">🧘 Sua experiência com técnicas de bem-estar:</h4>
        <div className="space-y-2">
          {[
            { value: 'beginner', label: 'Iniciante - Nunca pratiquei' },
            { value: 'some', label: 'Alguma experiência - Já tentei' },
            { value: 'regular', label: 'Praticante ocasional' },
            { value: 'advanced', label: 'Experiente - Pratico regularmente' }
          ].map((option) => (
            <label key={option.value} className="flex items-center">
              <input
                type="radio"
                name="experience"
                value={option.value}
                checked={userPreferences.experience === option.value}
                onChange={(e) => setUserPreferences(prev => ({ ...prev, experience: e.target.value }))}
                className="mr-3 w-4 h-4 text-yellow-600"
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Notification Preferences */}
      <div>
        <h4 className="font-semibold mb-4">🔔 Lembretes e notificações:</h4>
        <div className="space-y-4">
          <label className="flex items-center">
            <Checkbox
              checked={userPreferences.notifications}
              onCheckedChange={(checked) => setUserPreferences(prev => ({ ...prev, notifications: !!checked }))}
              className="mr-3"
            />
            <span>Receber lembretes diários de práticas</span>
          </label>
          
          {userPreferences.notifications && (
            <div className="ml-7">
              <label className="block text-sm font-medium mb-2">Melhor horário:</label>
              <select
                value={userPreferences.reminderTime}
                onChange={(e) => setUserPreferences(prev => ({ ...prev, reminderTime: e.target.value }))}
                className="border border-input rounded-lg px-3 py-2"
              >
                <option value="07:00">07:00 - Manhã cedo</option>
                <option value="09:00">09:00 - Início do trabalho</option>
                <option value="12:00">12:00 - Pausa do almoço</option>
                <option value="18:00">18:00 - Final do trabalho</option>
                <option value="21:00">21:00 - À noite</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Commitment */}
      <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
        <label className="flex items-start">
          <Checkbox
            checked={userPreferences.commitment}
            onCheckedChange={(checked) => setUserPreferences(prev => ({ ...prev, commitment: !!checked }))}
            className="mr-3 mt-1"
          />
          <div>
            <p className="font-medium text-yellow-800 mb-2">
              💪 Eu me comprometo com minha transformação:
            </p>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Dedicar o tempo escolhido diariamente por 21 dias</li>
              <li>• Praticar as técnicas ensinadas</li>
              <li>• Ser honesto(a) sobre meu progresso</li>
              <li>• Persistir mesmo quando desafiador</li>
              <li>• Celebrar cada pequena vitória</li>
            </ul>
          </div>
        </label>
      </div>
    </div>
  );

  const renderFirstActivityContent = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-24 h-24 mx-auto bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mb-6">
          <Play className="w-12 h-12 text-white" />
        </div>
        <h3 className="text-xl font-bold mb-2">Sua primeira arma anti-ansiedade!</h3>
        <p className="text-muted-foreground">Técnica 4-7-8: Controle instantâneo de impulsos digitais</p>
      </div>
      
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-xl">
        <h4 className="font-semibold mb-4">🌬️ Respiração 4-7-8 (Funciona em 60 segundos!)</h4>
        <div className="space-y-4">
          <div className="flex items-start">
            <div className="w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center mr-3 text-sm font-bold">1</div>
            <div>
              <p className="font-medium">INSPIRE por 4 segundos</p>
              <p className="text-sm text-muted-foreground">Pelo nariz, enchendo completamente os pulmões</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center mr-3 text-sm font-bold">2</div>
            <div>
              <p className="font-medium">SEGURE por 7 segundos</p>
              <p className="text-sm text-muted-foreground">Mantenha o ar nos pulmões, conte mentalmente</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center mr-3 text-sm font-bold">3</div>
            <div>
              <p className="font-medium">EXPIRE por 8 segundos</p>
              <p className="text-sm text-muted-foreground">Pela boca, soltando completamente o ar</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center mr-3 text-sm font-bold">4</div>
            <div>
              <p className="font-medium">REPITA 4 ciclos</p>
              <p className="text-sm text-muted-foreground">Sinta a ansiedade diminuindo a cada repetição</p>
            </div>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-white rounded-lg">
          <p className="text-sm text-muted-foreground mb-3">
            <strong>Quando usar:</strong> Sempre que sentir vontade de pegar o celular compulsivamente, 
            antes de dormir, ao acordar, ou em qualquer momento de ansiedade.
          </p>
          <div className="text-center">
            <Badge className="bg-yellow-600 hover:bg-yellow-700">
              💡 Esta técnica será sua companheira por 21 dias!
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCompleteContent = () => (
    <div className="text-center space-y-6">
      <div className="w-32 h-32 mx-auto bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mb-8">
        <CheckCircle className="w-16 h-16 text-white" />
      </div>
      
      <div>
        <h3 className="text-2xl font-bold mb-4">🎉 Tudo configurado!</h3>
        <p className="text-muted-foreground mb-6">
          Sua Trilha Equilíbrio está personalizada e pronta. Em 21 dias você será uma nova pessoa, 
          livre da ansiedade digital!
        </p>
        
        <div className="bg-gray-50 p-6 rounded-xl max-w-md mx-auto">
          <h4 className="font-semibold mb-4">📅 Próximos passos:</h4>
          <div className="space-y-3 text-left">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
              <span className="text-sm">Acesso liberado a todos os 21 dias</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
              <span className="text-sm">Lembretes configurados para {userPreferences.reminderTime}</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
              <span className="text-sm">Técnicas anti-ansiedade disponíveis</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
              <span className="text-sm">Sistema de pontuação ativado</span>
            </div>
          </div>
        </div>
        
        <div className="mt-8">
          <p className="text-sm text-muted-foreground mb-4">
            <strong>Focos selecionados:</strong> {userPreferences.focusAreas.map(area => 
              focusAreasOptions.find(opt => opt.id === area)?.label).join(', ')}
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            <strong>Tempo diário:</strong> {userPreferences.timeCommitment} de dedicação
          </p>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (currentStepData.content) {
      case 'welcome': return renderWelcomeContent();
      case 'understanding': return renderUnderstandingContent();
      case 'features': return renderFeaturesContent();
      case 'preferences': return renderPreferencesContent();
      case 'first-activity': return renderFirstActivityContent();
      case 'complete': return renderCompleteContent();
      default: return <div>Conteúdo não encontrado</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50">
      {/* Progress Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-800">Trilha Equilíbrio - Configuração</h1>
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center space-x-4 overflow-x-auto">
            {onboardingSteps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-shrink-0">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all
                  ${index <= currentStep 
                    ? 'bg-yellow-500 text-white' 
                    : completedSteps.includes(index)
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }
                `}>
                  {completedSteps.includes(index) ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </div>
                
                {index < onboardingSteps.length - 1 && (
                  <div className={`
                    w-16 h-1 mx-2 transition-all
                    ${index < currentStep || completedSteps.includes(index) 
                      ? 'bg-yellow-300' 
                      : 'bg-gray-200'
                    }
                  `} />
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-4 text-center">
            <span className="text-sm text-muted-foreground">
              Passo {currentStep + 1} de {onboardingSteps.length}
            </span>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Step Header */}
          <div 
            className="px-8 py-6 text-white"
            style={{ backgroundColor: currentStepData.color }}
          >
            <div className="flex items-center mb-4">
              <currentStepData.icon className="w-8 h-8 mr-3" />
              <div>
                <h2 className="text-2xl font-bold">{currentStepData.title}</h2>
                <p className="opacity-90">{currentStepData.subtitle}</p>
              </div>
            </div>
          </div>
          
          {/* Step Content */}
          <div className="p-8">
            {renderContent()}
          </div>
          
          {/* Navigation */}
          <div className="px-8 py-6 bg-gray-50 flex justify-between items-center">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              <ChevronLeft className="w-5 h-5 mr-2" />
              Anterior
            </Button>
            
            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-2">
                {Math.round(((currentStep + 1) / onboardingSteps.length) * 100)}% completo
              </div>
              <div className="w-48 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-yellow-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${((currentStep + 1) / onboardingSteps.length) * 100}%` }}
                />
              </div>
            </div>
            
            {currentStep === onboardingSteps.length - 1 ? (
              <Button
                onClick={handleComplete}
                disabled={!canProceed() || loading}
                className="bg-green-600 hover:bg-green-700"
              >
                {loading ? 'Salvando...' : 'Iniciar Jornada'}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                Próximo
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Help Tooltip */}
      <div className="fixed bottom-6 right-6">
        <Button className="w-14 h-14 bg-yellow-500 text-white rounded-full shadow-lg hover:bg-yellow-600">
          <span className="text-xl">💬</span>
        </Button>
      </div>
    </div>
  );
};

export default EquilibrioOnboarding;