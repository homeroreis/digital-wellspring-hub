import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, CheckCircle, AlertTriangle, Shield, Clock, ArrowRight, X, Phone, User, Heart, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface RenovacaoOnboardingProps {
  userId: string;
  userScore: number;
  onComplete: () => void;
}

const RenovacaoOnboarding: React.FC<RenovacaoOnboardingProps> = ({
  userId,
  userScore,
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [supportNetwork, setSupportNetwork] = useState({
    primary: { name: '', phone: '' },
    secondary: { name: '', phone: '' },
    professional: { name: '', phone: '' },
    spiritual: { name: '', phone: '' },
    group: { name: '' }
  });
  const [commitment, setCommitment] = useState({
    terms: false,
    dedication: false,
    honesty: false,
    support: false,
    persistence: false
  });
  const [emergencyKit, setEmergencyKit] = useState({
    books: false,
    arts: false,
    games: false,
    environment: false,
    substitutes: false,
    contacts: false
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const onboardingSteps = [
    {
      id: 'alert',
      title: '🔴 ALERTA VERMELHO - Mas há ESPERANÇA!',
      subtitle: 'Dependência severa detectada - Você teve CORAGEM de buscar ajuda!',
      icon: AlertTriangle,
      color: 'hsl(0 84% 60%)',
      content: 'alert'
    },
    {
      id: 'symptoms',
      title: 'Avaliação Completa de Sintomas',
      subtitle: 'Identifique TODOS os sinais que você sente - honestidade é crucial',
      icon: CheckCircle,
      color: 'hsl(15 100% 50%)',
      content: 'symptoms'
    },
    {
      id: 'support',
      title: 'Rede de Apoio OBRIGATÓRIA',
      subtitle: 'Você PRECISA de ajuda - Ninguém vence dependência sozinho',
      icon: Shield,
      color: 'hsl(25 100% 50%)',
      content: 'support'
    },
    {
      id: 'commitment',
      title: 'Termo de Compromisso SÉRIO',
      subtitle: 'Este é um contrato com sua nova vida - Leia cada palavra',
      icon: Heart,
      color: 'hsl(0 72% 51%)',
      content: 'commitment'
    },
    {
      id: 'preparation',
      title: 'Kit de Sobrevivência',
      subtitle: 'Prepare-se para 40 dias de guerra contra a dependência',
      icon: Zap,
      color: 'hsl(15 100% 45%)',
      content: 'preparation'
    },
    {
      id: 'ready',
      title: '💪 GUERREIRO EQUIPADO!',
      subtitle: 'Você está pronto para os 40 dias mais transformadores da sua vida',
      icon: CheckCircle,
      color: 'hsl(142 76% 36%)',
      content: 'ready'
    }
  ];

  const symptoms = [
    'Pânico quando fico sem celular',
    'Uso celular mais de 8h/dia',
    'Já prejudiquei trabalho/estudos por causa do celular',
    'Perdi relacionamentos importantes',
    'Durmo menos de 5h por causa do celular',
    'Sinto dores físicas (pescoço, olhos, mãos)',
    'Tenho crises de ansiedade sem celular',
    'Me isolo para usar celular',
    'Minto sobre meu tempo de uso',
    'Já tentei parar várias vezes e não consegui',
    'Acordo de madrugada para checar celular',
    'Negligencie família/filhos pelo celular'
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

  const handleSymptomToggle = (symptom: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptom) 
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      // Save user preferences
      await supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          track_slug: 'renovacao',
          focus_areas: selectedSymptoms,
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString()
        });

      // Initialize track progress
      await supabase
        .from('user_track_progress')
        .insert({
          user_id: userId,
          track_slug: 'renovacao',
          current_day: 1,
          level_number: 1,
          total_points: 0,
          streak_days: 0,
          is_active: true
        });

      toast({
        title: "JORNADA INICIADA! 💪",
        description: "Seus 40 dias de transformação começam AGORA!",
      });

      onComplete();
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast({
        title: "Erro",
        description: "Não foi possível iniciar sua jornada. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return true;
      case 1: return selectedSymptoms.length >= 5; // Mínimo 5 sintomas
      case 2: return supportNetwork.primary.name && supportNetwork.secondary.name;
      case 3: return Object.values(commitment).every(Boolean);
      case 4: return Object.values(emergencyKit).filter(Boolean).length >= 4;
      case 5: return true;
      default: return false;
    }
  };

  const renderAlertContent = () => (
    <div className="space-y-6">
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          <strong>ATENÇÃO:</strong> Seu teste revelou dependência SEVERA. Isso requer ação IMEDIATA e compromisso total.
        </AlertDescription>
      </Alert>

      <div className="text-center space-y-4">
        <div className="w-32 h-32 mx-auto bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center mb-6">
          <AlertTriangle className="w-16 h-16 text-white" />
        </div>
        
        <h3 className="text-2xl font-bold text-red-700">Você está no fundo do poço digital</h3>
        <p className="text-lg text-red-600">Mas PROCUROU AJUDA - isso é CORAGEM!</p>
      </div>

      <div className="bg-red-50 border border-red-200 p-6 rounded-lg">
        <h4 className="font-bold text-red-800 mb-4">❌ O que sua dependência causou:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center text-red-700">
              <span className="text-red-500 mr-2">•</span>
              <span>Relacionamentos destruídos</span>
            </div>
            <div className="flex items-center text-red-700">
              <span className="text-red-500 mr-2">•</span>
              <span>Carreira/estudos prejudicados</span>
            </div>
            <div className="flex items-center text-red-700">
              <span className="text-red-500 mr-2">•</span>
              <span>Saúde física comprometida</span>
            </div>
            <div className="flex items-center text-red-700">
              <span className="text-red-500 mr-2">•</span>
              <span>Vida espiritual em ruínas</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center text-red-700">
              <span className="text-red-500 mr-2">•</span>
              <span>Ansiedade e depressão</span>
            </div>
            <div className="flex items-center text-red-700">
              <span className="text-red-500 mr-2">•</span>
              <span>Isolamento social completo</span>
            </div>
            <div className="flex items-center text-red-700">
              <span className="text-red-500 mr-2">•</span>
              <span>Perda de controle total</span>
            </div>
            <div className="flex items-center text-red-700">
              <span className="text-red-500 mr-2">•</span>
              <span>Desesperança profunda</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 p-6 rounded-lg">
        <h4 className="font-bold text-green-800 mb-4">✅ Mas há ESPERANÇA REAL:</h4>
        <div className="space-y-3">
          <p className="text-green-700">
            🔥 <strong>Milhares já venceram</strong> - casos mais graves que o seu
          </p>
          <p className="text-green-700">
            ⛪ <strong>Jesus no deserto 40 dias</strong> - você também vai vencer
          </p>
          <p className="text-green-700">
            💪 <strong>Método científico comprovado</strong> - neurociência + fé
          </p>
          <p className="text-green-700">
            👥 <strong>Apoio 24/7</strong> - você não está sozinho
          </p>
          <p className="text-green-700">
            ⚡ <strong>Transformação TOTAL</strong> - nova pessoa em 40 dias
          </p>
        </div>
      </div>

      <div className="text-center bg-orange-50 p-6 rounded-lg">
        <p className="text-xl font-bold text-orange-800 mb-2">
          ⚠️ AVISO: Os próximos 40 dias serão os MAIS DIFÍCEIS da sua vida
        </p>
        <p className="text-orange-700">
          Mas também serão os mais TRANSFORMADORES. Você vai renascer!
        </p>
      </div>
    </div>
  );

  const renderSymptomsContent = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold mb-2">Marque TODOS os sintomas que você sente</h3>
        <p className="text-muted-foreground">Honestidade total é crucial para sua recuperação</p>
        <Badge variant="outline" className="mt-2">
          Mínimo: 5 sintomas | Selecionados: {selectedSymptoms.length}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {symptoms.map((symptom, index) => (
          <button
            key={index}
            onClick={() => handleSymptomToggle(symptom)}
            className={`p-4 rounded-lg border-2 text-left transition-all ${
              selectedSymptoms.includes(symptom)
                ? 'border-red-500 bg-red-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-start">
              <Checkbox
                checked={selectedSymptoms.includes(symptom)}
                onChange={() => {}}
                className="mr-3 mt-1"
              />
              <span className={`font-medium ${selectedSymptoms.includes(symptom) ? 'text-red-800' : ''}`}>
                {symptom}
              </span>
            </div>
          </button>
        ))}
      </div>

      {selectedSymptoms.length >= 8 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>DEPENDÊNCIA CRÍTICA:</strong> Você marcou {selectedSymptoms.length} sintomas. 
            Recomendamos acompanhamento médico paralelo ao programa.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );

  const renderSupportContent = () => (
    <div className="space-y-6">
      <Alert className="border-orange-200 bg-orange-50">
        <Shield className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-800">
          <strong>OBRIGATÓRIO:</strong> Você PRECISA de apoio. Dependência severa não se vence sozinho.
          Estas pessoas serão notificadas sobre sua jornada.
        </AlertDescription>
      </Alert>

      <div className="space-y-6">
        <div>
          <h4 className="font-semibold mb-3 flex items-center">
            <User className="w-5 h-5 mr-2 text-red-600" />
            Apoio Principal (OBRIGATÓRIO)
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="primary-name">Nome completo</Label>
              <Input
                id="primary-name"
                value={supportNetwork.primary.name}
                onChange={(e) => setSupportNetwork(prev => ({
                  ...prev,
                  primary: { ...prev.primary, name: e.target.value }
                }))}
                placeholder="Ex: Maria Silva"
              />
            </div>
            <div>
              <Label htmlFor="primary-phone">Telefone</Label>
              <Input
                id="primary-phone"
                value={supportNetwork.primary.phone}
                onChange={(e) => setSupportNetwork(prev => ({
                  ...prev,
                  primary: { ...prev.primary, phone: e.target.value }
                }))}
                placeholder="(11) 99999-9999"
              />
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-3 flex items-center">
            <User className="w-5 h-5 mr-2 text-orange-600" />
            Apoio Secundário (OBRIGATÓRIO)
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="secondary-name">Nome completo</Label>
              <Input
                id="secondary-name"
                value={supportNetwork.secondary.name}
                onChange={(e) => setSupportNetwork(prev => ({
                  ...prev,
                  secondary: { ...prev.secondary, name: e.target.value }
                }))}
                placeholder="Ex: João Santos"
              />
            </div>
            <div>
              <Label htmlFor="secondary-phone">Telefone</Label>
              <Input
                id="secondary-phone"
                value={supportNetwork.secondary.phone}
                onChange={(e) => setSupportNetwork(prev => ({
                  ...prev,
                  secondary: { ...prev.secondary, phone: e.target.value }
                }))}
                placeholder="(11) 99999-9999"
              />
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-3 flex items-center">
            <Heart className="w-5 h-5 mr-2 text-blue-600" />
            Profissional de Saúde (Se tiver)
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="professional-name">Nome do profissional</Label>
              <Input
                id="professional-name"
                value={supportNetwork.professional.name}
                onChange={(e) => setSupportNetwork(prev => ({
                  ...prev,
                  professional: { ...prev.professional, name: e.target.value }
                }))}
                placeholder="Dr(a). Nome"
              />
            </div>
            <div>
              <Label htmlFor="professional-phone">Telefone</Label>
              <Input
                id="professional-phone"
                value={supportNetwork.professional.phone}
                onChange={(e) => setSupportNetwork(prev => ({
                  ...prev,
                  professional: { ...prev.professional, phone: e.target.value }
                }))}
                placeholder="(11) 99999-9999"
              />
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-3 flex items-center">
            <Heart className="w-5 h-5 mr-2 text-purple-600" />
            Líder Espiritual
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="spiritual-name">Nome do líder</Label>
              <Input
                id="spiritual-name"
                value={supportNetwork.spiritual.name}
                onChange={(e) => setSupportNetwork(prev => ({
                  ...prev,
                  spiritual: { ...prev.spiritual, name: e.target.value }
                }))}
                placeholder="Pastor, Padre, etc."
              />
            </div>
            <div>
              <Label htmlFor="spiritual-phone">Telefone</Label>
              <Input
                id="spiritual-phone"
                value={supportNetwork.spiritual.phone}
                onChange={(e) => setSupportNetwork(prev => ({
                  ...prev,
                  spiritual: { ...prev.spiritual, phone: e.target.value }
                }))}
                placeholder="(11) 99999-9999"
              />
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-3">Grupo de Apoio</h4>
          <div>
            <Label htmlFor="group-name">Nome do grupo/igreja</Label>
            <Input
              id="group-name"
              value={supportNetwork.group.name}
              onChange={(e) => setSupportNetwork(prev => ({
                ...prev,
                group: { name: e.target.value }
              }))}
              placeholder="Igreja, grupo de oração, etc."
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderCommitmentContent = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold mb-2 text-red-700">TERMO DE COMPROMISSO SÉRIO</h3>
        <p className="text-red-600">Este é um contrato com sua nova vida. Leia CADA palavra.</p>
      </div>

      <div className="bg-red-50 border border-red-200 p-6 rounded-lg">
        <h4 className="font-bold text-red-800 mb-4">EU RECONHEÇO QUE:</h4>
        <ul className="space-y-2 text-red-700">
          <li>• Tenho dependência SEVERA de tecnologia digital</li>
          <li>• Preciso de ajuda profissional e espiritual</li>
          <li>• Os próximos 40 dias serão extremamente difíceis</li>
          <li>• Posso ter sintomas de abstinência graves</li>
          <li>• Precisarei fazer sacrifícios significativos</li>
          <li>• A recuperação é um processo, não um evento</li>
        </ul>
      </div>

      <div className="space-y-4">
        <h4 className="font-bold text-orange-800">EU ME COMPROMETO A:</h4>
        
        {[
          { key: 'dedication', text: 'Dedicar 60-90 minutos por dia ao programa religiosamente' },
          { key: 'honesty', text: 'Ser 100% HONESTO sobre recaídas e dificuldades' },
          { key: 'support', text: 'Aceitar ajuda e não tentar fazer sozinho' },
          { key: 'persistence', text: 'NÃO DESISTIR, mesmo quando parecer impossível' },
          { key: 'terms', text: 'Seguir TODAS as orientações, mesmo as difíceis' }
        ].map((item) => (
          <div key={item.key} className="flex items-start p-3 border rounded-lg">
            <Checkbox
              checked={commitment[item.key as keyof typeof commitment]}
              onCheckedChange={(checked) => setCommitment(prev => ({
                ...prev,
                [item.key]: !!checked
              }))}
              className="mr-3 mt-1"
            />
            <span className="font-medium">{item.text}</span>
          </div>
        ))}
      </div>

      <Alert className="border-yellow-200 bg-yellow-50">
        <AlertTriangle className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="text-yellow-800">
          <strong>IMPORTANTE:</strong> Este programa não substitui tratamento médico. 
          Se você tem sintomas graves, procure um profissional de saúde mental.
        </AlertDescription>
      </Alert>
    </div>
  );

  const renderPreparationContent = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold mb-2">🎒 Kit de Sobrevivência para 40 Dias</h3>
        <p className="text-muted-foreground">Prepare-se para a guerra contra a dependência</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Checkbox
                checked={emergencyKit.books}
                onCheckedChange={(checked) => setEmergencyKit(prev => ({ ...prev, books: !!checked }))}
                className="mr-2"
              />
              📚 Caixa Detox
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-1">
              <li>• 10 livros/revistas físicas</li>
              <li>• Material de arte/escrita</li>
              <li>• Jogos analógicos (cartas, tabuleiro)</li>
              <li>• Instrumentos musicais/hobbies</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Checkbox
                checked={emergencyKit.environment}
                onCheckedChange={(checked) => setEmergencyKit(prev => ({ ...prev, environment: !!checked }))}
                className="mr-2"
              />
              🏠 Ambiente Preparado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-1">
              <li>• TV removida do quarto</li>
              <li>• Estação de carga LONGE da cama</li>
              <li>• Despertador analógico comprado</li>
              <li>• Espaço de meditação criado</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Checkbox
                checked={emergencyKit.substitutes}
                onCheckedChange={(checked) => setEmergencyKit(prev => ({ ...prev, substitutes: !!checked }))}
                className="mr-2"
              />
              🔄 Substitutos Saudáveis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-1">
              <li>• Alimentos anti-ansiedade</li>
              <li>• Playlist músicas calmantes (CD/MP3)</li>
              <li>• Óleos essenciais relaxantes</li>
              <li>• Diário físico para desabafos</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Checkbox
                checked={emergencyKit.contacts}
                onCheckedChange={(checked) => setEmergencyKit(prev => ({ ...prev, contacts: !!checked }))}
                className="mr-2"
              />
              📞 Contatos de Emergência
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-1">
              <li>• Cartão com números na carteira</li>
              <li>• Apoiador principal: {supportNetwork.primary.name || 'Não informado'}</li>
              <li>• CVV: 188 (24h grátis)</li>
              <li>• Emergência médica: 192</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Alert className="border-red-200 bg-red-50">
        <Zap className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          <strong>CRÍTICO:</strong> Você DEVE preparar tudo HOJE. Amanhã começamos e não pode faltar nada!
        </AlertDescription>
      </Alert>
    </div>
  );

  const renderReadyContent = () => (
    <div className="text-center space-y-6">
      <div className="w-32 h-32 mx-auto bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-8">
        <CheckCircle className="w-16 h-16 text-white" />
      </div>
      
      <div>
        <h3 className="text-3xl font-bold mb-4">💪 GUERREIRO EQUIPADO!</h3>
        <p className="text-lg text-muted-foreground mb-6">
          Você está pronto para os 40 dias mais transformadores da sua vida!
          Como Jesus no deserto, você vai vencer!
        </p>
        
        <div className="bg-green-50 p-6 rounded-xl max-w-md mx-auto">
          <h4 className="font-semibold mb-4">🔥 Sua Trilha Renovação:</h4>
          <div className="space-y-3 text-left">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
              <span className="text-sm">40 dias de guerra contra dependência</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
              <span className="text-sm">{selectedSymptoms.length} sintomas identificados</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
              <span className="text-sm">Rede de apoio configurada</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
              <span className="text-sm">Kit de sobrevivência preparado</span>
            </div>
          </div>
        </div>
        
        <div className="mt-8 p-6 bg-red-50 border border-red-200 rounded-lg">
          <h4 className="font-bold text-red-800 mb-2">⚡ PRIMEIRA MISSÃO:</h4>
          <p className="text-red-700">
            AGORA entregue seu celular para {supportNetwork.primary.name} por 24h. 
            Sua jornada de liberdade começa HOJE!
          </p>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (currentStepData.content) {
      case 'alert': return renderAlertContent();
      case 'symptoms': return renderSymptomsContent();
      case 'support': return renderSupportContent();
      case 'commitment': return renderCommitmentContent();
      case 'preparation': return renderPreparationContent();
      case 'ready': return renderReadyContent();
      default: return <div>Conteúdo não encontrado</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
      {/* Progress Header */}
      <div className="bg-white shadow-sm border-b-2 border-red-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-red-700">🔴 Trilha Renovação - CONFIGURAÇÃO CRÍTICA</h1>
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
                    ? 'bg-red-500 text-white' 
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
                      ? 'bg-red-300' 
                      : 'bg-gray-200'
                    }
                  `} />
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-4 text-center">
            <span className="text-sm text-muted-foreground">
              Etapa CRÍTICA {currentStep + 1} de {onboardingSteps.length}
            </span>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-red-100">
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
                {Math.round(((currentStep + 1) / onboardingSteps.length) * 100)}% preparado
              </div>
              <div className="w-48 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-red-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${((currentStep + 1) / onboardingSteps.length) * 100}%` }}
                />
              </div>
            </div>
            
            {currentStep === onboardingSteps.length - 1 ? (
              <Button
                onClick={handleComplete}
                disabled={!canProceed() || loading}
                className="bg-green-600 hover:bg-green-700 text-lg px-8 py-3"
              >
                {loading ? 'Iniciando...' : '🔥 INICIAR GUERRA!'}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className="bg-red-600 hover:bg-red-700"
              >
                Próximo
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Emergency Help */}
      <div className="fixed bottom-6 right-6 space-y-2">
        <Button className="w-14 h-14 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600">
          <Phone className="w-6 h-6" />
        </Button>
        <div className="text-xs text-center text-muted-foreground">
          Emergência:<br/>CVV 188
        </div>
      </div>
    </div>
  );
};

export default RenovacaoOnboarding;