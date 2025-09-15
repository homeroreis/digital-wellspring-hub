import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, CheckCircle, Play, Book, Users, Target, Gift, Sparkles, Heart, Clock, ArrowRight, X, Shield, Zap, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { programTracks } from '@/data/programs';
import { AudioPlayer } from '@/components/ui/audio-player';

interface OnboardingProps {
  trackSlug: string;
  userId: string;
}

const InteractiveOnboardingSystem = ({ trackSlug, userId }: OnboardingProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [showTooltip, setShowTooltip] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  const [userPreferences, setUserPreferences] = useState({
    notifications: true,
    reminderTime: '09:00',
    focusAreas: [] as string[],
    experience: ''
  });

  // Encontrar a trilha atual
  const currentTrack = programTracks.find(track => track.slug === trackSlug) || programTracks[1];

  const getTrackConfig = () => {
    switch (trackSlug) {
      case 'liberdade':
        return {
          icon: Shield,
          primaryColor: '#10B981',
          description: 'Você já tem bons hábitos e quer fortalecê-los',
          focusMessage: 'Fortalecimento e manutenção de hábitos saudáveis',
          duration: '7 dias',
          level: 'Leve',
          mainGoals: [
            'Clareza sobre hábitos digitais',
            'Rotinas rápidas e eficazes',
            'Mais presença no dia a dia'
          ],
          expectations: [
            'Limpeza digital diária',
            'Momentos de pausa consciente',
            'Práticas de mindfulness simples'
          ]
        };
      
      case 'renovacao':
        return {
          icon: RefreshCw,
          primaryColor: '#8B5CF6',
          description: 'Para transformação profunda de hábitos enraizados',
          focusMessage: 'Reprogramação completa e mudança sustentável',
          duration: '40 dias',
          level: 'Intenso',
          mainGoals: [
            'Reprogramação de hábitos digitais',
            'Alta autoconsciência',
            'Transformação sustentável'
          ],
          expectations: [
            'Detox digital guiado',
            'Reconstrução de rotinas',
            'Suporte constante e comunidade'
          ]
        };
      
      default: // equilibrio
        return {
          icon: Target,
          primaryColor: '#F59E0B',
          description: 'Para quem percebe sinais de alerta e quer recuperar o controle',
          focusMessage: 'Controle de impulsos e redução da ansiedade digital',
          duration: '21 dias',
          level: 'Moderado',
          mainGoals: [
            'Redução gradual de uso compulsivo',
            'Mais foco e produtividade',
            'Sono e humor mais estáveis'
          ],
          expectations: [
            'Técnicas anti-ansiedade',
            'Estratégias para lidar com FOMO',
            'Exercícios de conexão humana'
          ]
        };
    }
  };

  const trackConfig = getTrackConfig();

  const onboardingSteps = [
    {
      id: 'welcome',
      title: `Bem-vindo(a) à ${currentTrack.title}!`,
      subtitle: 'Vamos conhecer você melhor para personalizar sua experiência',
      icon: Sparkles,
      color: trackConfig.primaryColor,
      content: 'welcome'
    },
    {
      id: 'understanding',
      title: 'Entendendo sua situação',
      subtitle: `Baseado no seu teste, você foi direcionado(a) para a ${currentTrack.title}`,
      icon: trackConfig.icon,
      color: trackConfig.primaryColor,
      content: 'understanding'
    },
    {
      id: 'features',
      title: 'Conheça suas ferramentas',
      subtitle: 'Descubra tudo que preparamos para ajudar você',
      icon: Gift,
      color: '#2196F3',
      content: 'features'
    },
    {
      id: 'preferences',
      title: 'Personalize sua experiência',
      subtitle: 'Configure suas preferências para uma jornada mais eficaz',
      icon: Heart,
      color: '#9C27B0',
      content: 'preferences'
    },
    {
      id: 'first-activity',
      title: 'Sua primeira atividade',
      subtitle: 'Vamos começar com um exercício adaptado à sua trilha',
      icon: Play,
      color: '#FF5722',
      content: 'first-activity'
    },
    {
      id: 'complete',
      title: 'Tudo pronto!',
      subtitle: 'Você está preparado(a) para começar sua transformação',
      icon: CheckCircle,
      color: trackConfig.primaryColor,
      content: 'complete'
    }
  ];

  const features = [
    {
      icon: Book,
      title: 'Conteúdo Personalizado',
      description: `Recursos específicos para a ${currentTrack.title}`,
      highlight: trackSlug === 'renovacao' ? '100+ recursos exclusivos' : 
                 trackSlug === 'liberdade' ? '30+ exercícios práticos' : '50+ recursos exclusivos'
    },
    {
      icon: Users,
      title: 'Comunidade de Apoio',
      description: 'Conecte-se com pessoas na mesma trilha que você',
      highlight: '2.847+ membros ativos'
    },
    {
      icon: Target,
      title: 'Progresso Visual',
      description: `Acompanhe sua evolução nos ${trackConfig.duration}`,
      highlight: 'Analytics em tempo real'
    },
    {
      icon: Clock,
      title: 'Lembretes Inteligentes',
      description: `Notificações adaptadas ao nível ${trackConfig.level}`,
      highlight: 'IA otimizada para você'
    }
  ];

  const getFocusAreasOptions = () => {
    const baseOptions = [
      { id: 'anxiety', label: 'Reduzir ansiedade digital', icon: '😌' },
      { id: 'productivity', label: 'Aumentar produtividade', icon: '⚡' },
      { id: 'relationships', label: 'Melhorar relacionamentos', icon: '💕' },
      { id: 'sleep', label: 'Dormir melhor', icon: '😴' },
      { id: 'mindfulness', label: 'Praticar mindfulness', icon: '🧘' },
      { id: 'family', label: 'Tempo de qualidade em família', icon: '👨‍👩‍👧‍👦' }
    ];

    if (trackSlug === 'liberdade') {
      return [
        ...baseOptions,
        { id: 'maintenance', label: 'Manter bons hábitos', icon: '✨' },
        { id: 'presence', label: 'Aumentar presença', icon: '🎯' }
      ];
    }

    if (trackSlug === 'renovacao') {
      return [
        ...baseOptions,
        { id: 'detox', label: 'Detox digital profundo', icon: '🔄' },
        { id: 'habits', label: 'Reconstruir rotinas', icon: '🏗️' },
        { id: 'spiritual', label: 'Conexão espiritual', icon: '🙏' }
      ];
    }

    return baseOptions;
  };

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
    setIsLoading(true);
    
    try {
      // Salvar preferências do usuário usando query builder genérico
      const { error } = await supabase
        .from('user_preferences' as any)
        .upsert({
          user_id: userId,
          track_slug: trackSlug,
          notifications: userPreferences.notifications,
          reminder_time: userPreferences.reminderTime,
          focus_areas: userPreferences.focusAreas,
          experience_level: userPreferences.experience,
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString()
        });

      if (error) throw error;

      toast.success('Onboarding concluído com sucesso!');
      navigate(`/track/${trackSlug}`);
      
    } catch (error) {
      console.error('Erro ao salvar preferências:', error);
      toast.error('Erro ao salvar preferências. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderWelcomeContent = () => (
    <div className="text-center space-y-6">
      <div 
        className="w-32 h-32 mx-auto rounded-full flex items-center justify-center mb-8"
        style={{ background: `linear-gradient(135deg, ${trackConfig.primaryColor}, ${trackConfig.primaryColor}CC)` }}
      >
        <trackConfig.icon className="w-16 h-16 text-white" />
      </div>
      
      <div className="max-w-md mx-auto">
        <h3 className="text-xl font-bold mb-4">Você está no lugar certo!</h3>
        <p className="text-muted-foreground mb-6">
          {trackConfig.description}. Milhares de pessoas já transformaram sua relação com a tecnologia. 
          Agora é sua vez!
        </p>
        
        <div className="grid grid-cols-3 gap-4 text-center">
          <div 
            className="p-4 rounded-lg"
            style={{ backgroundColor: `${trackConfig.primaryColor}20` }}
          >
            <div className="text-2xl font-bold" style={{ color: trackConfig.primaryColor }}>
              {trackSlug === 'renovacao' ? '97%' : trackSlug === 'liberdade' ? '91%' : '94%'}
            </div>
            <div className="text-sm text-muted-foreground">Satisfação</div>
          </div>
          <div 
            className="p-4 rounded-lg"
            style={{ backgroundColor: `${trackConfig.primaryColor}20` }}
          >
            <div className="text-2xl font-bold" style={{ color: trackConfig.primaryColor }}>
              {trackSlug === 'renovacao' ? '67%' : trackSlug === 'liberdade' ? '23%' : '41%'}
            </div>
            <div className="text-sm text-muted-foreground">Melhoria</div>
          </div>
          <div 
            className="p-4 rounded-lg"
            style={{ backgroundColor: `${trackConfig.primaryColor}20` }}
          >
            <div className="text-2xl font-bold" style={{ color: trackConfig.primaryColor }}>
              {currentTrack.durationDays}
            </div>
            <div className="text-sm text-muted-foreground">Dias</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUnderstandingContent = () => (
    <div className="space-y-6">
      <div 
        className="border-l-4 p-6 rounded-lg"
        style={{ 
          borderColor: trackConfig.primaryColor,
          backgroundColor: `${trackConfig.primaryColor}10`
        }}
      >
        <div className="flex items-center mb-4">
          <trackConfig.icon className="w-8 h-8 mr-3" style={{ color: trackConfig.primaryColor }} />
          <div>
            <h3 className="text-lg font-bold">{currentTrack.title}</h3>
            <p style={{ color: trackConfig.primaryColor }}>
              {trackConfig.level} - {trackConfig.duration}
            </p>
          </div>
        </div>
        
        <p className="text-foreground mb-4">
          {trackConfig.focusMessage}. Esta trilha foi especialmente desenhada para sua situação atual.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-background p-4 rounded-lg">
            <h4 className="font-semibold mb-2">🎯 Focos principais:</h4>
            <ul className="text-sm space-y-1">
              {trackConfig.mainGoals.map((goal, index) => (
                <li key={index}>• {goal}</li>
              ))}
            </ul>
          </div>
          <div className="bg-background p-4 rounded-lg">
            <h4 className="font-semibold mb-2">📈 O que esperar:</h4>
            <ul className="text-sm space-y-1">
              {trackConfig.expectations.map((expectation, index) => (
                <li key={index}>• {expectation}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      
      <div className="text-center">
        <p className="text-muted-foreground">
          <strong>Lembre-se:</strong> Você não está sozinho(a) nesta jornada. Milhares de pessoas 
          já passaram pela mesma situação e conseguiram se transformar.
        </p>
      </div>
    </div>
  );

  const renderFeaturesContent = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-xl font-bold mb-2">Tudo que você precisa, em um só lugar</h3>
        <p className="text-muted-foreground">Ferramentas poderosas para apoiar sua transformação</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((feature, index) => (
          <div 
            key={index}
            className="bg-background p-6 rounded-xl border-2 border-border hover:border-primary/20 transition-all cursor-pointer group"
            onMouseEnter={() => setShowTooltip(index)}
            onMouseLeave={() => setShowTooltip(null)}
          >
            <div className="flex items-start">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mr-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-foreground mb-2">{feature.title}</h4>
                <p className="text-muted-foreground text-sm mb-3">{feature.description}</p>
                <div className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full inline-block">
                  {feature.highlight}
                </div>
              </div>
            </div>
            
            {showTooltip === index && (
              <div className="mt-4 p-3 bg-muted rounded-lg text-sm text-muted-foreground">
                Esta funcionalidade estará disponível assim que você completar o onboarding!
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
        <h3 className="text-xl font-bold mb-2">Personalize sua experiência</h3>
        <p className="text-muted-foreground">Essas configurações nos ajudam a tornar sua jornada mais eficaz</p>
      </div>
      
      {/* Focus Areas */}
      <div>
        <h4 className="font-semibold mb-4">🎯 Em que você gostaria de focar?</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {getFocusAreasOptions().map((area) => (
            <button
              key={area.id}
              onClick={() => handleFocusAreaToggle(area.id)}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                userPreferences.focusAreas.includes(area.id)
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-border/70'
              }`}
            >
              <div className="flex items-center">
                <span className="text-2xl mr-3">{area.icon}</span>
                <span className="font-medium">{area.label}</span>
                {userPreferences.focusAreas.includes(area.id) && (
                  <CheckCircle className="w-5 h-5 text-primary ml-auto" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
      
      {/* Notification Preferences */}
      <div>
        <h4 className="font-semibold mb-4">🔔 Preferências de notificação</h4>
        <div className="space-y-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={userPreferences.notifications}
              onChange={(e) => setUserPreferences(prev => ({ ...prev, notifications: e.target.checked }))}
              className="mr-3 w-4 h-4 text-primary rounded focus:ring-primary"
            />
            <span>Receber lembretes diários de mindfulness</span>
          </label>
          
          {userPreferences.notifications && (
            <div className="ml-7">
              <label className="block text-sm font-medium mb-2">Melhor horário para lembretes:</label>
              <select
                value={userPreferences.reminderTime}
                onChange={(e) => setUserPreferences(prev => ({ ...prev, reminderTime: e.target.value }))}
                className="border border-border rounded-lg px-3 py-2 bg-background"
              >
                <option value="07:00">07:00 - Manhã cedo</option>
                <option value="09:00">09:00 - Início do trabalho</option>
                <option value="12:00">12:00 - Hora do almoço</option>
                <option value="18:00">18:00 - Final do trabalho</option>
                <option value="21:00">21:00 - À noite</option>
              </select>
            </div>
          )}
        </div>
      </div>
      
      {/* Experience Level */}
      <div>
        <h4 className="font-semibold mb-4">🧘 Experiência com mindfulness</h4>
        <div className="space-y-2">
          {[
            { value: 'beginner', label: 'Iniciante - Nunca pratiquei' },
            { value: 'some', label: 'Alguma experiência - Já tentei algumas vezes' },
            { value: 'regular', label: 'Praticante regular - Tenho uma rotina' },
            { value: 'advanced', label: 'Avançado - Pratico há anos' }
          ].map((option) => (
            <label key={option.value} className="flex items-center">
              <input
                type="radio"
                name="experience"
                value={option.value}
                checked={userPreferences.experience === option.value}
                onChange={(e) => setUserPreferences(prev => ({ ...prev, experience: e.target.value }))}
                className="mr-3 w-4 h-4 text-primary"
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const getFirstActivity = () => {
    switch (trackSlug) {
      case 'liberdade':
        return {
          title: '✨ Momento de Gratidão Digital',
          description: 'Reconheça os aspectos positivos da tecnologia em sua vida',
          steps: [
            { number: 1, title: 'Reflexão inicial', desc: 'Pense em 3 formas como a tecnologia te ajudou hoje' },
            { number: 2, title: 'Registre mentalmente', desc: 'Não precisa anotar, apenas observe internamente' },
            { number: 3, title: 'Defina uma intenção', desc: 'Como você quer usar a tecnologia no resto do dia?' },
            { number: 4, title: 'Respire conscientemente', desc: '3 respirações profundas antes de usar o celular' }
          ],
          audioText: '🎵 Iniciar Meditação de Gratidão (2 min)'
        };
      
      case 'renovacao':
        return {
          title: '🔄 Desintoxicação Guiada',
          description: 'Primeiro passo para reprogramar seus hábitos digitais',
          steps: [
            { number: 1, title: 'Postura consciente', desc: 'Sente-se confortavelmente, longe de dispositivos' },
            { number: 2, title: 'Escaneamento corporal', desc: 'Observe sensações de ansiedade ou impulsos' },
            { number: 3, title: 'Respiração 4-7-8', desc: 'Inspire por 4, segure por 7, expire por 8' },
            { number: 4, title: 'Afirmação de controle', desc: 'Repita: "Eu tenho controle sobre meus impulsos"' }
          ],
          audioText: '🎵 Iniciar Detox Guiado (10 min)'
        };
      
      default: // equilibrio
        return {
          title: '🌬️ Respiração Anti-Ansiedade',
          description: 'Técnica para reduzir a compulsão digital',
          steps: [
            { number: 1, title: 'Posição confortável', desc: 'Sente-se com a coluna ereta, celular longe' },
            { number: 2, title: 'Observe a ansiedade', desc: 'Reconheça o impulso de checar o celular sem julgamento' },
            { number: 3, title: 'Respiração consciente', desc: 'Respire profundamente focando na expiração' },
            { number: 4, title: 'Contagem regressiva', desc: 'De 10 a 1, a cada expiração, solte a ansiedade' }
          ],
          audioText: '🎵 Iniciar Respiração Guiada (5 min)'
        };
    }
  };

  const renderFirstActivityContent = () => {
    const activity = getFirstActivity();
    
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div 
            className="w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6"
            style={{ background: `linear-gradient(135deg, ${trackConfig.primaryColor}, ${trackConfig.primaryColor}CC)` }}
          >
            <Play className="w-12 h-12 text-white" />
          </div>
          <h3 className="text-xl font-bold mb-2">Vamos praticar juntos?</h3>
          <p className="text-muted-foreground">Sua primeira atividade: {activity.title}</p>
        </div>
        
        <div 
          className="p-6 rounded-xl"
          style={{ background: `linear-gradient(135deg, ${trackConfig.primaryColor}10, ${trackConfig.primaryColor}05)` }}
        >
          <h4 className="font-semibold mb-4">{activity.title}</h4>
          <p className="text-sm text-muted-foreground mb-4">{activity.description}</p>
          
          <div className="space-y-4">
            {activity.steps.map((step, index) => (
              <div key={index} className="flex items-start">
                <div 
                  className="w-8 h-8 text-white rounded-full flex items-center justify-center mr-3 text-sm font-bold"
                  style={{ backgroundColor: trackConfig.primaryColor }}
                >
                  {step.number}
                </div>
                <div>
                  <p className="font-medium">{step.title}</p>
                  <p className="text-sm text-muted-foreground">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-background rounded-lg">
            <p className="text-sm text-muted-foreground mb-3">
              <strong>Dica:</strong> É normal sentir resistência no início. O importante é praticar com gentileza consigo mesmo.
            </p>
            <button 
              className="w-full font-semibold py-3 rounded-lg text-white transition-colors"
              style={{ backgroundColor: trackConfig.primaryColor }}
            >
              {activity.audioText}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderCompleteContent = () => (
    <div className="text-center space-y-6">
      <div 
        className="w-32 h-32 mx-auto rounded-full flex items-center justify-center mb-8"
        style={{ background: `linear-gradient(135deg, ${trackConfig.primaryColor}, ${trackConfig.primaryColor}CC)` }}
      >
        <CheckCircle className="w-16 h-16 text-white" />
      </div>
      
      <div>
        <h3 className="text-2xl font-bold mb-4">Parabéns! 🎉</h3>
        <p className="text-muted-foreground mb-6">
          Você está oficialmente pronto(a) para começar sua jornada de transformação. 
          Sua {currentTrack.title} te aguarda!
        </p>
        
        <div className="bg-muted p-6 rounded-xl max-w-md mx-auto">
          <h4 className="font-semibold mb-4">📅 O que acontece agora:</h4>
          <div className="space-y-3 text-left">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
              <span className="text-sm">Acesso liberado para todo o conteúdo</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
              <span className="text-sm">Primeiro email da trilha em 1 hora</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
              <span className="text-sm">Lembretes configurados para {userPreferences.reminderTime}</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
              <span className="text-sm">Comunidade de apoio disponível 24/7</span>
            </div>
          </div>
        </div>
        
        <div className="mt-8">
          <button 
            onClick={handleComplete}
            disabled={isLoading}
            className="font-bold px-8 py-4 rounded-xl text-lg text-white transition-all transform hover:scale-105 inline-flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: trackConfig.primaryColor }}
          >
            {isLoading ? 'Salvando...' : 'Ir para Meu Dashboard'}
            <ArrowRight className="ml-2 w-6 h-6" />
          </button>
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
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      {/* Progress Header */}
      <div className="bg-background shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-foreground">Configuração Inicial</h1>
            <button 
              className="p-2 text-muted-foreground hover:text-foreground"
              onClick={() => navigate('/dashboard')}
            >
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
                    ? 'text-white' 
                    : completedSteps.includes(index)
                      ? 'bg-green-500 text-white'
                      : 'bg-muted text-muted-foreground'
                  }
                `}
                style={index <= currentStep ? { backgroundColor: trackConfig.primaryColor } : {}}
                >
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
                      ? 'bg-primary/30' 
                      : 'bg-muted'
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
        <div className="bg-background rounded-2xl shadow-lg overflow-hidden border">
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
          <div className="px-8 py-6 bg-muted/30 flex justify-between items-center">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className={`flex items-center px-6 py-3 rounded-lg font-semibold transition-all ${
                currentStep === 0
                  ? 'bg-muted text-muted-foreground cursor-not-allowed'
                  : 'bg-muted text-foreground hover:bg-muted/70'
              }`}
            >
              <ChevronLeft className="w-5 h-5 mr-2" />
              Anterior
            </button>
            
            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-2">
                {Math.round(((currentStep + 1) / onboardingSteps.length) * 100)}% completo
              </div>
              <div className="w-48 bg-muted rounded-full h-2">
                <div 
                  className="h-2 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${((currentStep + 1) / onboardingSteps.length) * 100}%`,
                    backgroundColor: trackConfig.primaryColor
                  }}
                />
              </div>
            </div>
            
            {currentStep === onboardingSteps.length - 1 ? (
              <button
                onClick={handleComplete}
                disabled={isLoading}
                className="flex items-center px-6 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Salvando...' : 'Finalizar'}
                <CheckCircle className="w-5 h-5 ml-2" />
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="flex items-center px-6 py-3 text-white font-semibold rounded-lg transition-colors"
                style={{ backgroundColor: trackConfig.primaryColor }}
              >
                Próximo
                <ChevronRight className="w-5 h-5 ml-2" />
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Help Tooltip */}
      <div className="fixed bottom-6 right-6">
        <button 
          className="w-14 h-14 text-white rounded-full shadow-lg transition-colors flex items-center justify-center"
          style={{ backgroundColor: trackConfig.primaryColor }}
        >
          <span className="text-xl">💬</span>
        </button>
      </div>
    </div>
  );
};

export default InteractiveOnboardingSystem;