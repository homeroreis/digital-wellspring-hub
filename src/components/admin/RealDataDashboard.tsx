import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { Users, BookOpen, Trophy, TrendingUp, Activity, Clock, Target, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalContent: number;
  publishedContent: number;
  totalProgress: number;
  completedActivities: number;
  averageScore: number;
  topTrack: string;
}

interface TimelineData {
  date: string;
  users: number;
  activities: number;
  content: number;
}

interface TrackStats {
  track_slug: string;
  user_count: number;
  completion_rate: number;
  avg_points: number;
}

const RealDataDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalContent: 0,
    publishedContent: 0,
    totalProgress: 0,
    completedActivities: 0,
    averageScore: 0,
    topTrack: 'equilibrio'
  });
  const [timelineData, setTimelineData] = useState<TimelineData[]>([]);
  const [trackStats, setTrackStats] = useState<TrackStats[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load user stats
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const { count: activeUsers } = await supabase
        .from('user_track_progress')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // Load content stats
      const { count: totalContent } = await supabase
        .from('contents')
        .select('*', { count: 'exact', head: true });

      const { count: publishedContent } = await supabase
        .from('contents')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'published');

      // Load progress stats
      const { count: totalProgress } = await supabase
        .from('user_track_progress')
        .select('*', { count: 'exact', head: true });

      const { count: completedActivities } = await supabase
        .from('user_activity_progress')
        .select('*', { count: 'exact', head: true });

      // Load average scores
      const { data: scoreData } = await supabase
        .from('questionnaire_results')
        .select('total_score');

      const averageScore = scoreData?.length 
        ? Math.round(scoreData.reduce((sum, item) => sum + item.total_score, 0) / scoreData.length)
        : 0;

      // Load track statistics
      const { data: trackData } = await supabase
        .from('user_track_progress')
        .select('track_slug, total_points, current_day')
        .eq('is_active', true);

      const trackStatsMap = new Map();
      trackData?.forEach(item => {
        if (!trackStatsMap.has(item.track_slug)) {
          trackStatsMap.set(item.track_slug, {
            track_slug: item.track_slug,
            user_count: 0,
            total_points: 0,
            completed_days: 0
          });
        }
        
        const stats = trackStatsMap.get(item.track_slug);
        stats.user_count++;
        stats.total_points += item.total_points;
        if (item.current_day > 1) stats.completed_days++;
      });

      const processedTrackStats = Array.from(trackStatsMap.values()).map(track => ({
        ...track,
        completion_rate: track.user_count ? Math.round((track.completed_days / track.user_count) * 100) : 0,
        avg_points: track.user_count ? Math.round(track.total_points / track.user_count) : 0
      }));

      const topTrack = processedTrackStats.length > 0 
        ? processedTrackStats.sort((a, b) => b.user_count - a.user_count)[0].track_slug
        : 'equilibrio';

      // Generate timeline data (last 30 days)
      const timelineDataArray: TimelineData[] = [];
      const now = new Date();
      
      for (let i = 29; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        
        const { count: dailyUsers } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .lte('created_at', date.toISOString());

        const { count: dailyActivities } = await supabase
          .from('user_activity_progress')
          .select('*', { count: 'exact', head: true })
          .gte('completed_at', date.toISOString().split('T')[0])
          .lt('completed_at', new Date(date.getTime() + 24*60*60*1000).toISOString().split('T')[0]);

        const { count: dailyContent } = await supabase
          .from('contents')
          .select('*', { count: 'exact', head: true })
          .lte('created_at', date.toISOString());

        timelineDataArray.push({
          date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
          users: dailyUsers || 0,
          activities: dailyActivities || 0,
          content: dailyContent || 0
        });
      }

      setStats({
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        totalContent: totalContent || 0,
        publishedContent: publishedContent || 0,
        totalProgress: totalProgress || 0,
        completedActivities: completedActivities || 0,
        averageScore,
        topTrack
      });

      setTimelineData(timelineDataArray);
      setTrackStats(processedTrackStats);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do dashboard.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const KPICard: React.FC<{
    title: string;
    value: string | number;
    change?: string;
    icon: React.ReactNode;
    color?: string;
  }> = ({ title, value, change, icon, color = "primary" }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
            {change && (
              <p className={`text-sm flex items-center gap-1 mt-1 ${
                change.startsWith('+') ? 'text-green-600' : 'text-red-600'
              }`}>
                <TrendingUp className="w-4 h-4" />
                {change}
              </p>
            )}
          </div>
          <div className={`p-3 rounded-full bg-${color}/10`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const trackDistributionData = trackStats.map(track => ({
    name: track.track_slug,
    value: track.user_count,
    completion: track.completion_rate
  }));

  const COLORS = ['#F59E0B', '#10B981', '#3B82F6', '#8B5CF6'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard Analytics</h2>
        <p className="text-muted-foreground">
          Visão geral em tempo real da plataforma
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total de Usuários"
          value={stats.totalUsers}
          icon={<Users className="w-6 h-6 text-primary" />}
        />
        <KPICard
          title="Usuários Ativos"
          value={stats.activeUsers}
          icon={<Activity className="w-6 h-6 text-green-600" />}
          color="green"
        />
        <KPICard
          title="Conteúdos Publicados"
          value={stats.publishedContent}
          icon={<BookOpen className="w-6 h-6 text-blue-600" />}
          color="blue"
        />
        <KPICard
          title="Atividades Completadas"
          value={stats.completedActivities}
          icon={<Trophy className="w-6 h-6 text-yellow-600" />}
          color="yellow"
        />
      </div>

      {/* Tabs Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="tracks">Trilhas</TabsTrigger>
          <TabsTrigger value="content">Conteúdo</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Evolution Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Evolução dos Últimos 30 Dias</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={timelineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="users"
                      stackId="1"
                      stroke="#F59E0B"
                      fill="#F59E0B"
                      name="Usuários"
                    />
                    <Area
                      type="monotone"
                      dataKey="activities"
                      stackId="2"
                      stroke="#10B981"
                      fill="#10B981"
                      name="Atividades"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Track Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Trilhas</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={trackDistributionData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {trackDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tracks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance das Trilhas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trackStats.map((track) => (
                  <div key={track.track_slug} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <h4 className="font-medium capitalize">{track.track_slug}</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {track.user_count} usuários
                        </span>
                        <span className="flex items-center gap-1">
                          <Target className="w-4 h-4" />
                          {track.completion_rate}% concluído
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="w-4 h-4" />
                          {track.avg_points} pontos
                        </span>
                      </div>
                    </div>
                    <Badge variant={track.completion_rate > 70 ? "default" : "secondary"}>
                      {track.completion_rate > 70 ? "Excelente" : track.completion_rate > 40 ? "Bom" : "Em desenvolvimento"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <BookOpen className="w-8 h-8 mx-auto text-primary mb-2" />
                <p className="text-2xl font-bold">{stats.totalContent}</p>
                <p className="text-sm text-muted-foreground">Total de Conteúdos</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <Clock className="w-8 h-8 mx-auto text-green-600 mb-2" />
                <p className="text-2xl font-bold">{stats.publishedContent}</p>
                <p className="text-sm text-muted-foreground">Publicados</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <TrendingUp className="w-8 h-8 mx-auto text-blue-600 mb-2" />
                <p className="text-2xl font-bold">
                  {stats.totalContent > 0 ? Math.round((stats.publishedContent / stats.totalContent) * 100) : 0}%
                </p>
                <p className="text-sm text-muted-foreground">Taxa de Publicação</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RealDataDashboard;