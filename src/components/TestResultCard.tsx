import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar, 
  Clock, 
  Eye, 
  Star,
  Smartphone,
  Users,
  Sparkles
} from 'lucide-react';

interface TestResultCardProps {
  result: any;
  index: number;
  trackInfo: any;
  onView: () => void;
  isMostRecent?: boolean;
  totalResults: number;
}

const TestResultCard: React.FC<TestResultCardProps> = ({
  result,
  index,
  trackInfo,
  onView,
  isMostRecent = false,
  totalResults
}) => {
  const getRiskLevel = (score: number) => {
    if (score >= 20) return { level: 'Alto Risco', color: 'destructive' };
    if (score >= 15) return { level: 'Risco Moderado', color: 'secondary' };
    if (score >= 10) return { level: 'Risco Baixo', color: 'outline' };
    return { level: 'Muito Baixo', color: 'default' };
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'comportamento': return Smartphone;
      case 'vida_cotidiana': return Clock;
      case 'relacoes': return Users;
      case 'espiritual': return Sparkles;
      default: return Star;
    }
  };

  const risk = getRiskLevel(result.totalScore);
  const TrackIcon = trackInfo.icon;

  return (
    <Card className={`transition-all hover:shadow-md ${isMostRecent ? 'border-primary bg-primary/5' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {isMostRecent && (
              <Badge variant="default" className="mb-2">
                <Star className="w-3 h-3 mr-1" />
                Mais Recente
              </Badge>
            )}
            <div>
              <h3 className="font-semibold text-lg">
                Teste #{totalResults - index}
              </h3>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(result.completedAt).toLocaleDateString('pt-BR')}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {Math.round(result.totalTimeSpent / 60)} min
                </div>
              </div>
            </div>
          </div>
          
          <Button onClick={onView} variant="outline" size="sm">
            <Eye className="w-4 h-4 mr-2" />
            Ver Detalhes
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Pontuação */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Pontuação Total</span>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{result.totalScore}</span>
                <Badge variant={risk.color as any}>
                  {risk.level}
                </Badge>
              </div>
            </div>
            <Progress value={(result.totalScore / 100) * 100} className="h-2" />
          </div>

          {/* Trilha Recomendada */}
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: trackInfo.color, opacity: 0.2 }}
            >
              <TrackIcon 
                className="w-5 h-5"
                style={{ color: trackInfo.color }}
              />
            </div>
            <div>
              <p className="font-medium">Trilha {trackInfo.name}</p>
              <p className="text-sm text-muted-foreground">{trackInfo.duration}</p>
            </div>
          </div>
        </div>

        {/* Scores por categoria */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
          {Object.entries(result.categoryScores).map(([category, score]) => {
            const CategoryIcon = getCategoryIcon(category);
            const categoryName = {
              comportamento: 'Comportamento',
              vida_cotidiana: 'Vida Cotidiana',
              relacoes: 'Relacionamentos',
              espiritual: 'Espiritual'
            }[category] || category;

            return (
              <div key={category} className="text-center p-2 bg-gray-50 rounded-lg">
                <CategoryIcon className="w-4 h-4 mx-auto mb-1 text-gray-600" />
                <div className="text-sm font-medium">{score as number}/25</div>
                <div className="text-xs text-gray-600">{categoryName}</div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default TestResultCard;