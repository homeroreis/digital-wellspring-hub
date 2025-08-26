import React from 'react';
import { AlertTriangle, Heart, Users, Sparkles, Smartphone, Target, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface CategoryScores {
  comportamento: number;
  vida_cotidiana: number;
  relacoes: number;
  espiritual: number;
}

interface PersonalizedFeedbackProps {
  categoryScores: CategoryScores;
  totalScore: number;
  trackType: string;
}

const PersonalizedFeedback: React.FC<PersonalizedFeedbackProps> = ({
  categoryScores,
  totalScore,
  trackType
}) => {
  // Determinar a categoria com maior pontuação
  const getHighestCategory = () => {
    const entries = Object.entries(categoryScores);
    const highest = entries.reduce((max, current) => 
      current[1] > max[1] ? current : max
    );
    return highest[0] as keyof CategoryScores;
  };

  const highestCategory = getHighestCategory();
  const maxCategoryScore = 25; // 5 questões × 5 pontos máximos

  // Configurações das categorias
  const categoryInfo = {
    comportamento: {
      name: 'Comportamento com o Smartphone',
      icon: Smartphone,
      color: '#3B82F6',
      description: 'Seus hábitos comportamentais com o dispositivo'
    },
    vida_cotidiana: {
      name: 'Impacto na Vida Cotidiana',
      icon: Target,
      color: '#10B981',
      description: 'Como o uso afeta sua produtividade e rotina'
    },
    relacoes: {
      name: 'Impacto nas Relações Pessoais',
      icon: Users,
      color: '#F59E0B',
      description: 'Efeitos nos relacionamentos e conexões sociais'
    },
    espiritual: {
      name: 'Impacto Espiritual',
      icon: Sparkles,
      color: '#8B5CF6',
      description: 'Interferência na vida espiritual e práticas de fé'
    }
  };

  // Feedback personalizado baseado na categoria dominante
  const getPersonalizedFeedback = () => {
    const categoryScore = categoryScores[highestCategory];
    const percentage = (categoryScore / maxCategoryScore) * 100;
    
    const feedbacks = {
      comportamento: {
        title: 'Foco em Controle de Impulsos',
        priority: 'Seu maior desafio está no controle comportamental',
        recommendations: [
          'Mantenha o celular fora do quarto durante a noite',
          'Use apps de bloqueio durante períodos de foco',
          'Pratique a técnica "Pausa antes de pegar" - conte até 10',
          'Crie rituais matinais sem telas',
          'Configure horários específicos para verificar notificações'
        ],
        techniques: [
          'Técnica Pomodoro para períodos sem celular',
          'Mindfulness para identificar impulsos',
          'Exercícios de respiração quando sentir "coceira digital"'
        ],
        urgentActions: [
          'Desative notificações não essenciais AGORA',
          'Mude o celular para escala de cinza',
          'Remova apps mais viciantes da tela inicial'
        ]
      },
      vida_cotidiana: {
        title: 'Foco em Produtividade e Gestão do Tempo',
        priority: 'O uso excessivo está prejudicando sua produtividade',
        recommendations: [
          'Defina blocos de tempo sem tecnologia para trabalho focado',
          'Use aplicativos de monitoramento de tempo de tela',
          'Crie uma agenda estruturada com horários para uso digital',
          'Implemente a regra dos 90 minutos focados',
          'Estabeleça metas diárias de tempo máximo em apps'
        ],
        techniques: [
          'Time-blocking para atividades importantes',
          'Técnica Getting Things Done (GTD)',
          'Batch processing para verificar mensagens'
        ],
        urgentActions: [
          'Identifique suas 3 principais distrações digitais',
          'Configure limites de tempo em apps específicos',
          'Crie um espaço de trabalho livre de distrações'
        ]
      },
      relacoes: {
        title: 'Foco em Presença e Conexão Real',
        priority: 'Seus relacionamentos estão sendo impactados',
        recommendations: [
          'Estabeleça "zonas livres de celular" durante refeições',
          'Pratique escuta ativa sem distrações digitais',
          'Combine encontros presenciais sem uso de dispositivos',
          'Use o modo "não perturbe" durante tempo em família',
          'Crie rituais de conexão sem tecnologia'
        ],
        techniques: [
          'Técnica do "olho no olho" durante conversas',
          'Comunicação presencial intencional',
          'Atividades compartilhadas sem telas'
        ],
        urgentActions: [
          'Converse com pessoas próximas sobre seu desafio',
          'Peça apoio da família/amigos para sua mudança',
          'Planeje uma atividade especial sem celular hoje'
        ]
      },
      espiritual: {
        title: 'Foco em Jejum Digital e Vida Devocional',
        priority: 'Sua vida espiritual precisa de atenção especial',
        recommendations: [
          'Implemente jejuns digitais regulares durante devoção',
          'Use Bíblia física em vez de aplicativos',
          'Crie um cantinho sagrado livre de tecnologia',
          'Pratique oração contemplativa sem distrações',
          'Dedique o primeiro tempo do dia só para Deus'
        ],
        techniques: [
          'Lectio Divina (leitura meditativa das Escrituras)',
          'Oração de Jesus repetitiva para foco',
          'Caminhadas de oração na natureza'
        ],
        urgentActions: [
          'Remova dispositivos do local de oração/meditação',
          'Comprometa-se com 15 min diários de silêncio',
          'Encontre um mentor espiritual para accountability'
        ]
      }
    };

    return feedbacks[highestCategory];
  };

  const feedback = getPersonalizedFeedback();
  const categoryScore = categoryScores[highestCategory];
  const percentage = (categoryScore / maxCategoryScore) * 100;
  const severityLevel = percentage > 80 ? 'crítico' : percentage > 60 ? 'alto' : percentage > 40 ? 'moderado' : 'baixo';

  return (
    <div className="space-y-6">
      {/* Categoria Dominante */}
      <Card className="border-l-4" style={{ borderLeftColor: categoryInfo[highestCategory].color }}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div 
                className="p-3 rounded-full"
                style={{ backgroundColor: `${categoryInfo[highestCategory].color}20` }}
              >
                {React.createElement(categoryInfo[highestCategory].icon, {
                  className: "w-6 h-6",
                  style: { color: categoryInfo[highestCategory].color }
                })}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{feedback.title}</h3>
                <p className="text-gray-600">{categoryInfo[highestCategory].description}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold" style={{ color: categoryInfo[highestCategory].color }}>
                {categoryScore}/{maxCategoryScore}
              </div>
              <div className="text-sm text-gray-500">
                {Math.round(percentage)}% de impacto
              </div>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Nível de Impacto</span>
              <span className={`text-sm font-bold ${
                severityLevel === 'crítico' ? 'text-red-600' :
                severityLevel === 'alto' ? 'text-orange-600' :
                severityLevel === 'moderado' ? 'text-yellow-600' : 'text-green-600'
              }`}>
                {severityLevel.toUpperCase()}
              </span>
            </div>
            <Progress 
              value={percentage} 
              className="h-3"
            />
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Análise Personalizada</h4>
                <p className="text-gray-700 text-sm">{feedback.priority}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ações Urgentes */}
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <div className="p-2 bg-red-100 rounded-full">
              <TrendingUp className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-red-800">Ações Imediatas (Faça Hoje)</h3>
          </div>
          <ul className="space-y-2">
            {feedback.urgentActions.map((action, index) => (
              <li key={index} className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-red-700 font-medium">{action}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Recomendações Personalizadas */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <div className="p-2 bg-blue-100 rounded-full">
              <Target className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Estratégias Específicas para Você</h3>
          </div>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Recomendações Práticas:</h4>
              <ul className="space-y-2">
                {feedback.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Técnicas Específicas:</h4>
              <ul className="space-y-2">
                {feedback.techniques.map((technique, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700">{technique}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Outras Categorias */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Panorama Completo</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(categoryScores).map(([category, score]) => {
              const info = categoryInfo[category as keyof typeof categoryInfo];
              const percent = (score / maxCategoryScore) * 100;
              const isHighest = category === highestCategory;
              
              return (
                <div 
                  key={category}
                  className={`p-4 rounded-lg border-2 ${isHighest ? 'border-orange-200 bg-orange-50' : 'border-gray-200 bg-gray-50'}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {React.createElement(info.icon, { 
                        className: "w-4 h-4", 
                        style: { color: info.color } 
                      })}
                      <span className="font-medium text-sm">{info.name}</span>
                    </div>
                    <span className="text-sm font-bold">{score}/{maxCategoryScore}</span>
                  </div>
                  <Progress value={percent} className="h-2" />
                  {isHighest && (
                    <div className="mt-2 text-xs text-orange-700 font-medium">
                      🎯 Área de foco principal
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PersonalizedFeedback;