import React, { useState } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Users, TrendingUp, MapPin, Briefcase, Clock, Share2, Download, Calendar, Eye, ThumbsUp, Play } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAdminAction } from '@/hooks/useAdminAuth';

const AdminDashboard = () => {
  const [dateRange, setDateRange] = useState('30');
  const [activeTab, setActiveTab] = useState('overview');
  const { logAction } = useAdminAction();

  // Mock data - em produção viriam do Supabase
  const kpis = {
    totalUsers: 2847,
    newUsers30d: 342,
    totalAssessments: 2154,
    avgScore: 58.4,
    conversionRate: 75.6,
    shareRate: 23.8
  };

  const genderData = [
    { name: 'Feminino', value: 1542, percentage: 54.2, color: 'hsl(var(--chart-1))' },
    { name: 'Masculino', value: 1205, percentage: 42.3, color: 'hsl(var(--chart-2))' },
    { name: 'Outro', value: 68, percentage: 2.4, color: 'hsl(var(--chart-3))' },
    { name: 'Não informado', value: 32, percentage: 1.1, color: 'hsl(var(--chart-4))' }
  ];

  const trackDistribution = [
    { name: 'Trilha Liberdade', value: 512, percentage: 23.8, color: 'hsl(var(--chart-1))' },
    { name: 'Trilha Equilíbrio', value: 1089, percentage: 50.6, color: 'hsl(var(--chart-2))' },
    { name: 'Trilha Renovação', value: 553, percentage: 25.7, color: 'hsl(var(--chart-3))' }
  ];

  const timelineData = [
    { month: 'Jun', users: 156, assessments: 142, avg_score: 55.2 },
    { month: 'Jul', users: 234, assessments: 218, avg_score: 56.8 },
    { month: 'Ago', users: 298, assessments: 275, avg_score: 57.4 },
    { month: 'Set', users: 367, assessments: 334, avg_score: 58.1 },
    { month: 'Out', users: 445, assessments: 398, avg_score: 58.9 },
    { month: 'Nov', users: 512, assessments: 467, avg_score: 59.2 },
    { month: 'Dez', users: 578, assessments: 523, avg_score: 58.4 }
  ];

  const KPICard = ({ title, value, change, icon: Icon, color = 'primary' }) => (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
            {change && (
              <p className={`text-sm flex items-center mt-1 ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                <TrendingUp className="w-4 h-4 mr-1" />
                {change > 0 ? '+' : ''}{change}% vs mês anterior
              </p>
            )}
          </div>
          <div className="p-3 rounded-full bg-primary/10">
            <Icon className="w-8 h-8 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const handleExportReport = async () => {
    await logAction('export_report', 'dashboard', undefined, { 
      dateRange, 
      exportType: 'overview' 
    });
    console.log('Exportando relatório...');
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dashboard Executivo</h2>
          <p className="text-muted-foreground">
            Visão geral dos dados do projeto "Além das Notificações"
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 mt-4 lg:mt-0">
          <select 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background"
          >
            <option value="7">Últimos 7 dias</option>
            <option value="30">Últimos 30 dias</option>
            <option value="90">Últimos 90 dias</option>
            <option value="365">Último ano</option>
          </select>
          
          <Button onClick={handleExportReport} className="flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Exportar Relatório
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', name: 'Visão Geral', icon: TrendingUp },
            { id: 'demographics', name: 'Demografia', icon: Users },
            { id: 'content', name: 'Conteúdo', icon: Play },
            { id: 'tracks', name: 'Trilhas', icon: MapPin }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
              }`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <KPICard
          title="Total de Usuários"
          value={kpis.totalUsers.toLocaleString()}
          change={12.5}
          icon={Users}
        />
        <KPICard
          title="Novos Usuários (30d)"
          value={kpis.newUsers30d}
          change={8.3}
          icon={TrendingUp}
        />
        <KPICard
          title="Testes Realizados"
          value={kpis.totalAssessments.toLocaleString()}
          change={15.7}
          icon={Clock}
        />
        <KPICard
          title="Pontuação Média"
          value={kpis.avgScore}
          change={-2.1}
          icon={Briefcase}
        />
        <KPICard
          title="Taxa de Conversão"
          value={`${kpis.conversionRate}%`}
          change={5.2}
          icon={TrendingUp}
        />
        <KPICard
          title="Taxa de Compartilhamento"
          value={`${kpis.shareRate}%`}
          change={3.8}
          icon={Share2}
        />
      </div>

      {/* Content based on active tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Evolução Temporal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timelineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="users" 
                      stackId="1" 
                      stroke="hsl(var(--chart-1))" 
                      fill="hsl(var(--chart-1))" 
                      fillOpacity={0.6} 
                      name="Usuários" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="assessments" 
                      stackId="1" 
                      stroke="hsl(var(--chart-2))" 
                      fill="hsl(var(--chart-2))" 
                      fillOpacity={0.6} 
                      name="Testes" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Track Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Trilhas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={trackDistribution}
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {trackDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-4">
                {trackDistribution.map((track, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl font-bold" style={{ color: track.color }}>
                      {track.value}
                    </div>
                    <div className="text-sm text-muted-foreground">{track.percentage}%</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'demographics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Gênero</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={genderData}
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percentage }) => `${name}: ${percentage}%`}
                    >
                      {genderData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;