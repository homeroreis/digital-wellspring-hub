import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Trophy, 
  Flame, 
  CheckCircle, 
  Clock, 
  Lock, 
  ChevronLeft, 
  ChevronRight,
  Star,
  Target,
  Zap,
  Medal
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface TrackNavigationPanelProps {
  trackSlug: string;
  trackTitle: string;
  currentDay: number;
  maxDays: number;
  onDaySelect: (day: number) => void;
  userProgress: {
    streak: number;
    totalPoints: number;
    level: number;
    completedDays: number[];
  };
}

const TrackNavigationPanel: React.FC<TrackNavigationPanelProps> = ({
  trackSlug,
  trackTitle,
  currentDay,
  maxDays,
  onDaySelect,
  userProgress
}) => {
  const [currentWeek, setCurrentWeek] = useState(Math.ceil(currentDay / 7));
  const [isAnimating, setIsAnimating] = useState(false);

  const totalWeeks = Math.ceil(maxDays / 7);
  const weekStartDay = (currentWeek - 1) * 7 + 1;
  const weekEndDay = Math.min(weekStartDay + 6, maxDays);

  const getDayStatus = (dayNumber: number) => {
    if (userProgress.completedDays.includes(dayNumber)) return 'completed';
    if (dayNumber === currentDay + 1 && userProgress.completedDays.includes(currentDay)) return 'available';
    if (dayNumber <= currentDay) return 'current';
    return 'locked';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500 text-white border-green-500';
      case 'current': return 'bg-blue-500 text-white border-blue-500';
      case 'available': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-gray-100 text-gray-400 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'current': return <Target className="w-4 h-4" />;
      case 'available': return <Clock className="w-4 h-4" />;
      default: return <Lock className="w-4 h-4" />;
    }
  };

  const navigateWeek = async (direction: 'prev' | 'next') => {
    if (isAnimating) return;
    
    const newWeek = direction === 'next' ? currentWeek + 1 : currentWeek - 1;
    if (newWeek < 1 || newWeek > totalWeeks) return;

    setIsAnimating(true);
    setCurrentWeek(newWeek);
    
    setTimeout(() => setIsAnimating(false), 300);
  };

  const getLevelInfo = () => {
    const level = userProgress.level;
    const pointsInCurrentLevel = userProgress.totalPoints % 100;
    const pointsToNextLevel = 100 - pointsInCurrentLevel;
    
    return {
      level,
      progress: pointsInCurrentLevel,
      nextLevel: pointsToNextLevel,
      title: level < 3 ? 'Iniciante' : level < 7 ? 'Intermediário' : level < 15 ? 'Avançado' : 'Mestre'
    };
  };

  const levelInfo = getLevelInfo();

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            Seu Progresso
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Main Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{userProgress.completedDays.length}</div>
              <div className="text-xs text-muted-foreground">Dias completos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{userProgress.streak}</div>
              <div className="text-xs text-muted-foreground">Sequência</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{userProgress.totalPoints}</div>
              <div className="text-xs text-muted-foreground">Pontos</div>
            </div>
          </div>

          {/* Level Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium">Nível {levelInfo.level}</span>
              </div>
              <Badge variant="secondary" className="text-xs">
                {levelInfo.title}
              </Badge>
            </div>
            <Progress value={levelInfo.progress} className="h-2" />
            <div className="text-xs text-muted-foreground text-right">
              {levelInfo.nextLevel} pontos para o próximo nível
            </div>
          </div>

          {/* Overall Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progresso Geral</span>
              <span>{Math.round((userProgress.completedDays.length / maxDays) * 100)}%</span>
            </div>
            <Progress value={(userProgress.completedDays.length / maxDays) * 100} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Calendar Navigation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Semana {currentWeek} de {totalWeeks}
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigateWeek('prev')}
                disabled={currentWeek === 1 || isAnimating}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigateWeek('next')}
                disabled={currentWeek === totalWeeks || isAnimating}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentWeek}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-7 gap-2"
            >
              {Array.from({ length: 7 }, (_, i) => {
                const dayNumber = weekStartDay + i;
                if (dayNumber > maxDays) return null;

                const status = getDayStatus(dayNumber);
                const isSelected = dayNumber === currentDay;
                const canSelect = status !== 'locked';

                return (
                  <motion.button
                    key={dayNumber}
                    whileHover={canSelect ? { scale: 1.05 } : {}}
                    whileTap={canSelect ? { scale: 0.95 } : {}}
                    onClick={() => canSelect && onDaySelect(dayNumber)}
                    disabled={!canSelect}
                    className={cn(
                      "aspect-square rounded-lg border-2 transition-all duration-200",
                      "flex flex-col items-center justify-center text-sm font-medium",
                      getStatusColor(status),
                      isSelected && "ring-2 ring-primary ring-offset-2",
                      canSelect ? "hover:shadow-md cursor-pointer" : "cursor-not-allowed"
                    )}
                  >
                    <div className="flex items-center justify-center mb-1">
                      {getStatusIcon(status)}
                    </div>
                    <span>{dayNumber}</span>
                  </motion.button>
                );
              })}
            </motion.div>
          </AnimatePresence>

          {/* Legend */}
          <div className="flex items-center justify-center gap-4 mt-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-green-500"></div>
              <span>Completo</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-blue-500"></div>
              <span>Atual</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-yellow-100 border border-yellow-300"></div>
              <span>Disponível</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-gray-100 border border-gray-200"></div>
              <span>Bloqueado</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrackNavigationPanel;