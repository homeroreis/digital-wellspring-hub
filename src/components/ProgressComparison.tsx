import React from 'react';
import { LineChart, Line, BarChart, Bar, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Minus, Calendar, Trophy, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useProgressTracking } from '@/hooks/useProgressTracking';

const ProgressComparison = () => {
  const { getEvolutionData, getComparison } = useProgressTracking();
  
  const evolutionData = getEvolutionData();
  const comparison = getComparison();

  if (evolutionData.length < 2) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Target className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold mb-2">Evolução em Progresso</h3>
          <p className="text-gray-600">
            Refaça o teste após completar sua trilha para ver sua evolução!
          </p>
        </CardContent>
      </Card>
    );
  }

  const renderTrendIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="w-5 h-5 text-red-500" />;
    if (value < 0) return <TrendingDown className="w-5 h-5 text-green-500" />;
    return <Minus className="w-5 h-5 text-gray-500" />;
  };

  const renderImprovementText = (value: number, category: string) => {
    const absValue = Math.abs(value);
    if (value > 0) {
      return <span className="text-red-600">+{absValue} pontos (precisa melhorar)</span>;
    } else if (value < 0) {
      return <span className="text-green-600">-{absValue} pontos (melhorou!)</span>;
    }
    return <span className="text-gray-600">Sem mudança</span>;
  };

  return (
    <div className="space-y-8">
      {/* Comparison Summary */}
      {comparison && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-6 h-6 mr-2" />
              Comparação: Antes vs Depois
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Previous Result */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-700 mb-2">Resultado Anterior</h4>
                <div className="text-3xl font-bold text-gray-600 mb-2">
                  {comparison.previous.totalScore}
                </div>
                <p className="text-sm text-gray-600">
                  {new Date(comparison.previous.completedAt).toLocaleDateString('pt-BR')}
                </p>
              </div>

              {/* Current Result */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-blue-700 mb-2">Resultado Atual</h4>
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {comparison.current.totalScore}
                </div>
                <p className="text-sm text-blue-600">
                  {new Date(comparison.current.completedAt).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>

            {/* Overall Change */}
            <div className="bg-white border rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center">
                {renderTrendIcon(comparison.improvement.totalScore)}
                <span className="ml-2 text-lg font-semibold">
                  Mudança geral: {renderImprovementText(comparison.improvement.totalScore, 'total')}
                </span>
              </div>
              {comparison.percentageChange !== 0 && (
                <p className="text-center text-sm text-gray-600 mt-2">
                  {comparison.percentageChange > 0 ? 'Aumento' : 'Redução'} de {Math.abs(comparison.percentageChange).toFixed(1)}%
                </p>
              )}
            </div>

            {/* Category Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: 'comportamento', name: 'Comportamento' },
                { key: 'vida_cotidiana', name: 'Vida Cotidiana' },
                { key: 'relacoes', name: 'Relacionamentos' },
                { key: 'espiritual', name: 'Vida Espiritual' }
              ].map(category => (
                <div key={category.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">{category.name}</span>
                  <div className="flex items-center">
                    {renderTrendIcon(comparison.improvement[category.key as keyof typeof comparison.improvement])}
                    <span className="ml-2 text-sm">
                      {renderImprovementText(comparison.improvement[category.key as keyof typeof comparison.improvement], category.name)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Evolution Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Trophy className="w-6 h-6 mr-2" />
            Evolução ao Longo do Tempo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={evolutionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="test" />
                <YAxis domain={[0, 100]} />
                <Tooltip 
                  formatter={(value, name) => [value, name]}
                  labelFormatter={(label) => {
                    const data = evolutionData.find(d => d.test === label);
                    return data ? `${label} - ${data.date}` : label;
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="totalScore" 
                  stroke="#2563eb" 
                  strokeWidth={3}
                  name="Pontuação Total"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Category Evolution */}
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={evolutionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="test" />
                <YAxis domain={[0, 25]} />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="comportamento" 
                  stroke="#dc2626" 
                  name="Comportamento"
                />
                <Line 
                  type="monotone" 
                  dataKey="vida_cotidiana" 
                  stroke="#16a34a" 
                  name="Vida Cotidiana"
                />
                <Line 
                  type="monotone" 
                  dataKey="relacoes" 
                  stroke="#ea580c" 
                  name="Relacionamentos"
                />
                <Line 
                  type="monotone" 
                  dataKey="espiritual" 
                  stroke="#7c3aed" 
                  name="Vida Espiritual"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProgressComparison;