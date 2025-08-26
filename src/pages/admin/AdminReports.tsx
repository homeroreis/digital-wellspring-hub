import React, { useState } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Download, TrendingUp, Users, Target, Award, MapPin, Briefcase } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const AdminReports = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('3months');

  const impactData = {
    totalParticipants: 2847,
    periodParticipants: 1236,
    averageScore: {
      initial: 58.4,
      final: 34.2,
      improvement: 41.4
    }
  };

  const categoryImpactData = [
    { category: 'Comportamento', before: 14.8, after: 8.2, improvement: 44.6 },
    { category: 'Vida Cotidiana', before: 15.2, after: 9.1, improvement: 40.1 },
    { category: 'Relacionamentos', before: 13.9, after: 7.8, improvement: 43.9 },
    { category: 'Espiritual', before: 14.5, after: 8.9, improvement: 38.6 }
  ];

  const geographicData = [
    { state: 'SP', participants: 687, avgImprovement: 42.1, topConcern: 'Ansiedade digital' },
    { state: 'RJ', participants: 423, avgImprovement: 39.8, topConcern: 'FOMO' },
    { state: 'MG', participants: 312, avgImprovement: 44.2, topConcern: 'Dependência' },
    { state: 'RS', participants: 234, avgImprovement: 41.7, topConcern: 'Relacionamentos' },
    { state: 'PR', participants: 198, avgImprovement: 38.9, topConcern: 'Produtividade' }
  ];

  const testimonialData = [
    {
      name: 'Maria Silva',
      age: 34,
      city: 'São Paulo',
      track: 'Equilíbrio',
      before: 67,
      after: 32,
      quote: 'Minha ansiedade digital diminuiu drasticamente. Consigo ter conversas inteiras sem pensar no celular.',
      daysCompleted: 21
    },
    {
      name: 'João Santos',
      age: 28,
      city: 'Rio de Janeiro',
      track: 'Renovação',
      before: 78,
      after: 28,
      quote: 'Reconquistei minha vida! Agora leio livros, faço exercícios e tenho tempo para oração.',
      daysCompleted: 40
    },
    {
      name: 'Ana Costa',
      age: 42,
      city: 'Belo Horizonte',
      track: 'Liberdade',
      before: 29,
      after: 18,
      quote: 'Já tinha bons hábitos, mas o programa me ajudou a ser ainda mais consciente.',
      daysCompleted: 7
    }
  ];

  const generatePDFReport = () => {
    console.log('Gerando relatório PDF...');
  };

  return (
    <div className="space-y-8">
      {/* Header Executivo */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-4">Relatório de Impacto</h1>
            <p className="text-muted-foreground text-lg">
              Projeto "Além das Notificações" - Transformando vidas através da consciência digital
            </p>
          </div>
          
          <div className="flex gap-4">
            <select 
              value={selectedPeriod} 
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring bg-background"
            >
              <option value="1month">Último mês</option>
              <option value="3months">Últimos 3 meses</option>
              <option value="6months">Últimos 6 meses</option>
              <option value="1year">Último ano</option>
            </select>
            
            <Button onClick={generatePDFReport} className="flex items-center">
              <Download className="w-4 h-4 mr-2" />
              Baixar PDF
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-background/50 rounded-xl p-4">
            <div className="text-3xl font-bold">{impactData.totalParticipants.toLocaleString()}</div>
            <div className="text-muted-foreground">Total de Participantes</div>
          </div>
          <div className="bg-background/50 rounded-xl p-4">
            <div className="text-3xl font-bold">{impactData.averageScore.improvement.toFixed(1)}%</div>
            <div className="text-muted-foreground">Melhoria Média</div>
          </div>
          <div className="bg-background/50 rounded-xl p-4">
            <div className="text-3xl font-bold">65.5%</div>
            <div className="text-muted-foreground">Taxa de Conclusão</div>
          </div>
          <div className="bg-background/50 rounded-xl p-4">
            <div className="text-3xl font-bold">94.2%</div>
            <div className="text-muted-foreground">Satisfação</div>
          </div>
        </div>
      </div>

      {/* Impacto por Categoria */}
      <Card>
        <CardHeader>
          <CardTitle>Impacto por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryImpactData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="before" fill="hsl(var(--chart-1))" name="Antes" />
                <Bar dataKey="after" fill="hsl(var(--chart-2))" name="Depois" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Casos de Sucesso */}
      <Card>
        <CardHeader>
          <CardTitle>Casos de Sucesso</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonialData.map((testimonial, index) => (
              <div key={index} className="border-l-4 border-primary bg-primary/5 p-6 rounded-lg">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mr-4">
                    <Award className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <div className="font-bold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.age} anos, {testimonial.city}</div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="text-sm text-muted-foreground mb-2">Trilha {testimonial.track}</div>
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-500">{testimonial.before}</div>
                      <div className="text-xs text-muted-foreground">Antes</div>
                    </div>
                    <div className="text-primary">→</div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-500">{testimonial.after}</div>
                      <div className="text-xs text-muted-foreground">Depois</div>
                    </div>
                  </div>
                </div>
                
                <blockquote className="text-sm italic text-muted-foreground border-l-2 border-primary pl-4">
                  "{testimonial.quote}"
                </blockquote>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Impacto Geográfico */}
      <Card>
        <CardHeader>
          <CardTitle>Impacto Geográfico</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {geographicData.map((location, index) => (
              <div key={index} className="text-center p-6 bg-muted/50 rounded-xl">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-8 h-8 text-primary" />
                </div>
                <div className="font-bold text-xl">{location.state}</div>
                <div className="text-3xl font-bold text-primary my-2">
                  {location.avgImprovement}%
                </div>
                <div className="text-sm text-muted-foreground mb-2">{location.participants} pessoas</div>
                <div className="text-xs text-muted-foreground">Foco: {location.topConcern}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Conclusões e Recomendações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="w-6 h-6 mr-2 text-primary" />
            Conclusões e Recomendações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold text-primary mb-4">✅ Principais Sucessos</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>• 41.4% de melhoria média na pontuação de dependência</li>
                <li>• 94.2% de satisfação dos participantes</li>
                <li>• Maior impacto em jovens de 18-25 anos</li>
                <li>• Profissionais de tecnologia com melhor resposta</li>
                <li>• Crescimento consistente de participação mensal</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-primary mb-4">🎯 Oportunidades de Melhoria</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Aumentar taxa de conclusão da Trilha Renovação</li>
                <li>• Criar conteúdo específico para +55 anos</li>
                <li>• Expandir programa para outras regiões</li>
                <li>• Desenvolver módulo para pais e educadores</li>
                <li>• Implementar sistema de mentoria peer-to-peer</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminReports;