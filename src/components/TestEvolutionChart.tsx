import React from 'react';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

interface TestEvolutionChartProps {
  data: any[];
}

const TestEvolutionChart: React.FC<TestEvolutionChartProps> = ({ data }) => {
  const formatTooltip = (value: any, name: string) => {
    const nameMap: { [key: string]: string } = {
      totalScore: 'Pontuação Total',
      comportamento: 'Comportamento',
      vida_cotidiana: 'Vida Cotidiana',
      relacoes: 'Relacionamentos',
      espiritual: 'Espiritual'
    };
    return [value, nameMap[name] || name];
  };

  const formatLabel = (label: string) => {
    const dataPoint = data.find(d => d.test === label);
    return dataPoint ? `${label} - ${dataPoint.date}` : label;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Evolução dos Testes
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Pontuação Total */}
        <div className="mb-8">
          <h4 className="text-lg font-semibold mb-4">Pontuação Total ao Longo do Tempo</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="test" 
                  className="text-xs"
                />
                <YAxis 
                  domain={[0, 100]} 
                  className="text-xs"
                />
                <Tooltip 
                  formatter={formatTooltip}
                  labelFormatter={formatLabel}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="totalScore" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categorias */}
        <div>
          <h4 className="text-lg font-semibold mb-4">Evolução por Categoria</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="test" 
                  className="text-xs"
                />
                <YAxis 
                  domain={[0, 25]} 
                  className="text-xs"
                />
                <Tooltip 
                  formatter={formatTooltip}
                  labelFormatter={formatLabel}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="comportamento" 
                  stroke="hsl(217 91% 60%)" 
                  strokeWidth={2}
                  name="Comportamento"
                />
                <Line 
                  type="monotone" 
                  dataKey="vida_cotidiana" 
                  stroke="hsl(142 76% 36%)" 
                  strokeWidth={2}
                  name="Vida Cotidiana"
                />
                <Line 
                  type="monotone" 
                  dataKey="relacoes" 
                  stroke="hsl(45 100% 52%)" 
                  strokeWidth={2}
                  name="Relacionamentos"
                />
                <Line 
                  type="monotone" 
                  dataKey="espiritual" 
                  stroke="hsl(0 72% 51%)" 
                  strokeWidth={2}
                  name="Espiritual"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Insights */}
        {data.length >= 2 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h5 className="font-semibold text-blue-900 mb-2">📊 Insights da sua evolução:</h5>
            <ul className="text-sm text-blue-800 space-y-1">
              {(() => {
                const first = data[0];
                const last = data[data.length - 1];
                const improvement = first.totalScore - last.totalScore;
                const insights = [];

                if (improvement > 0) {
                  insights.push(`✅ Você melhorou ${improvement} pontos desde o primeiro teste!`);
                } else if (improvement < 0) {
                  insights.push(`⚠️ Aumento de ${Math.abs(improvement)} pontos - continue focando na sua trilha`);
                } else {
                  insights.push(`📊 Sua pontuação se manteve estável em ${last.totalScore} pontos`);
                }

                // Verificar categoria com maior melhoria
                const categories = ['comportamento', 'vida_cotidiana', 'relacoes', 'espiritual'];
                let bestCategory = '';
                let bestImprovement = -Infinity;

                categories.forEach(cat => {
                  const catImprovement = first[cat] - last[cat];
                  if (catImprovement > bestImprovement) {
                    bestImprovement = catImprovement;
                    bestCategory = cat;
                  }
                });

                if (bestImprovement > 0) {
                  const categoryNames = {
                    comportamento: 'Comportamento',
                    vida_cotidiana: 'Vida Cotidiana', 
                    relacoes: 'Relacionamentos',
                    espiritual: 'Vida Espiritual'
                  };
                  insights.push(`🎯 Maior melhoria na categoria: ${categoryNames[bestCategory as keyof typeof categoryNames]}`);
                }

                return insights.map((insight, i) => <li key={i}>{insight}</li>);
              })()}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TestEvolutionChart;