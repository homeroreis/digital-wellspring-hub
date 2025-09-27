import React from 'react';
import { Trophy, Target, Smartphone, Clock, Users, Sparkles, Shield } from 'lucide-react';

interface PrintableResultsProps {
  results: {
    totalScore: number;
    categoryScores: {
      comportamento: number;
      vida_cotidiana: number;
      relacoes: number;
      espiritual: number;
    };
    trackType: string;
    totalTimeSpent: number;
  };
  userName?: string;
  testDate?: string;
}

const PrintableResults: React.FC<PrintableResultsProps> = ({ 
  results, 
  userName = 'Usuário',
  testDate = new Date().toLocaleDateString('pt-BR')
}) => {
  const getTrackInfo = (trackType: string) => {
    switch (trackType) {
      case 'liberdade':
        return {
          name: 'Liberdade',
          description: 'Focada em libertação de vícios digitais e estabelecimento de limites saudáveis',
          duration: '7 dias',
          icon: '🛡️',
          difficulty: 'Iniciante'
        };
      case 'equilibrio':
        return {
          name: 'Equilíbrio',
          description: 'Balanceamento entre uso consciente da tecnologia e vida offline',
          duration: '21 dias',
          icon: '🎯',
          difficulty: 'Intermediário'
        };
      case 'renovacao':
        return {
          name: 'Renovação',
          description: 'Transformação profunda de hábitos e renovação espiritual',
          duration: '40 dias',
          icon: '✨',
          difficulty: 'Avançado'
        };
      default:
        return {
          name: 'Equilíbrio',
          description: 'Trilha padrão para desenvolvimento equilibrado',
          duration: '21 dias',
          icon: '🎯',
          difficulty: 'Intermediário'
        };
    }
  };

  const getCategoryInfo = (category: string) => {
    switch (category) {
      case 'comportamento':
        return {
          name: 'Comportamento com Smartphone',
          icon: '📱',
          description: 'Como você interage com seu dispositivo'
        };
      case 'vida_cotidiana':
        return {
          name: 'Impacto na Vida Cotidiana',
          icon: '⏰',
          description: 'Efeitos no seu dia a dia e produtividade'
        };
      case 'relacoes':
        return {
          name: 'Impacto nas Relações',
          icon: '👥',
          description: 'Influência nos seus relacionamentos'
        };
      case 'espiritual':
        return {
          name: 'Impacto Espiritual',
          icon: '✨',
          description: 'Efeitos na sua vida espiritual'
        };
      default:
        return {
          name: category,
          icon: '🎯',
          description: ''
        };
    }
  };

  const getRiskLevel = (score: number) => {
    if (score >= 20) return { level: 'Alto Risco', description: 'Necessita atenção imediata' };
    if (score >= 15) return { level: 'Risco Moderado', description: 'Oportunidade de melhoria' };
    if (score >= 10) return { level: 'Risco Baixo', description: 'Situação controlada' };
    return { level: 'Muito Baixo Risco', description: 'Excelente controle' };
  };

  const trackInfo = getTrackInfo(results.trackType);
  const overallRisk = getRiskLevel(results.totalScore);

  return (
    <div className="printable-results print:p-0 p-8 bg-white text-black max-w-4xl mx-auto">
      <style>{`
        @media print {
          .printable-results {
            font-size: 12px;
            line-height: 1.4;
          }
          .no-print {
            display: none !important;
          }
          .page-break {
            page-break-before: always;
          }
          body {
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
          }
        }
      `}</style>

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">🏆 Relatório de Dependência Digital</h1>
        <h2 className="text-xl text-gray-600 mb-4">Além das Notificações</h2>
        <div className="border-b-2 border-gray-300 pb-4">
          <p className="text-lg"><strong>Participante:</strong> {userName}</p>
          <p className="text-lg"><strong>Data do Teste:</strong> {testDate}</p>
          <p className="text-lg"><strong>Tempo Investido:</strong> {Math.round(results.totalTimeSpent / 60)} minutos</p>
        </div>
      </div>

      {/* Resultado Geral */}
      <div className="mb-8 text-center bg-gray-50 p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">📊 Resultado Geral</h2>
        <div className="text-6xl font-bold mb-2">{results.totalScore}</div>
        <div className="text-xl mb-2">de 100 pontos possíveis</div>
        <div className="text-lg font-semibold text-gray-700">
          {overallRisk.level} - {overallRisk.description}
        </div>
      </div>

      {/* Análise por Categoria */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6">📋 Análise por Categoria</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(results.categoryScores).map(([category, score]) => {
            const categoryInfo = getCategoryInfo(category);
            const risk = getRiskLevel(score);
            
            return (
              <div key={category} className="border-2 border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{categoryInfo.icon}</span>
                  <h3 className="font-bold text-lg">{categoryInfo.name}</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">{categoryInfo.description}</p>
                
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">Pontuação:</span>
                  <span className="text-xl font-bold">{score}/25</span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                  <div 
                    className="bg-blue-500 h-3 rounded-full" 
                    style={{ width: `${(score / 25) * 100}%` }}
                  ></div>
                </div>
                
                <div className="text-sm font-semibold text-gray-700">
                  {risk.level}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Trilha Recomendada */}
      <div className="mb-8 bg-blue-50 p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">🎯 Trilha Personalizada Recomendada</h2>
        
        <div className="flex items-center gap-4 mb-4">
          <div className="text-4xl">{trackInfo.icon}</div>
          <div>
            <h3 className="text-2xl font-bold">Trilha {trackInfo.name}</h3>
            <p className="text-lg text-gray-600">{trackInfo.duration} • {trackInfo.difficulty}</p>
          </div>
        </div>
        
        <p className="text-lg mb-4">{trackInfo.description}</p>
        
        <div className="bg-white p-4 rounded border">
          <h4 className="font-bold mb-2">O que esperar na sua jornada:</h4>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Atividades diárias personalizadas baseadas no seu perfil</li>
            <li>Reflexões bíblicas alinhadas com seus desafios específicos</li>
            <li>Exercícios práticos para transformar hábitos digitais</li>
            <li>Acompanhamento de progresso e conquistas</li>
            <li>Comunidade de apoio e crescimento mútuo</li>
          </ul>
        </div>
      </div>

      {/* Recomendações */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">💡 Recomendações Personalizadas</h2>
        
        <div className="space-y-4">
          {(() => {
            const recommendations = [];
            
            // Recomendações baseadas na pontuação total
            if (results.totalScore >= 80) {
              recommendations.push({
                type: "🚨 Urgente",
                text: "Considere buscar apoio profissional e implementar mudanças significativas imediatamente."
              });
            } else if (results.totalScore >= 60) {
              recommendations.push({
                type: "⚠️ Importante", 
                text: "Implemente estratégias de controle digital de forma consistente e gradual."
              });
            } else {
              recommendations.push({
                type: "✅ Manutenção",
                text: "Continue desenvolvendo hábitos saudáveis e mantendo o equilíbrio atual."
              });
            }
            
            // Recomendações por categoria com maior pontuação
            const maxCategory = Object.entries(results.categoryScores)
              .sort(([,a], [,b]) => b - a)[0];
            
            const categoryRecommendations = {
              comportamento: "Foque em criar rituais de desconexão e estabelecer limites claros de uso.",
              vida_cotidiana: "Organize melhor sua rotina e crie espaços livres de tecnologia.",
              relacoes: "Priorize momentos de qualidade presencial com pessoas importantes.",
              espiritual: "Dedique tempo regular para reflexão, oração e crescimento espiritual."
            };
            
            if (maxCategory && maxCategory[1] >= 15) {
              const [category] = maxCategory;
              const categoryInfo = getCategoryInfo(category);
              recommendations.push({
                type: `🎯 Área Prioritária - ${categoryInfo.name}`,
                text: categoryRecommendations[category as keyof typeof categoryRecommendations]
              });
            }
            
            return recommendations.map((rec, index) => (
              <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                <h4 className="font-bold">{rec.type}</h4>
                <p>{rec.text}</p>
              </div>
            ));
          })()}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-gray-600 border-t pt-4">
        <p>Este relatório é confidencial e destinado exclusivamente ao participante.</p>
        <p className="mt-2">Para mais informações, acesse: www.alemdas-notificacoes.com</p>
        <p className="mt-2 font-semibold">© 2024 Além das Notificações - Todos os direitos reservados</p>
      </div>
    </div>
  );
};

export default PrintableResults;