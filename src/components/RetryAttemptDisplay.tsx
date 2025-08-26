import React from 'react';
import { AlertCircle, RefreshCw, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useProgressTracking } from '@/hooks/useProgressTracking';
import { useNavigate } from 'react-router-dom';

const RetryAttemptDisplay = () => {
  const { progressData } = useProgressTracking();
  const navigate = useNavigate();

  if (progressData.canRetake && progressData.remainingAttempts === 3) {
    return null; // First time taking the test
  }

  const handleRetakeTest = () => {
    if (progressData.canRetake) {
      navigate('/test');
    }
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex items-start">
          {progressData.canRetake ? (
            <RefreshCw className="w-6 h-6 text-blue-600 mr-3 mt-1 flex-shrink-0" />
          ) : (
            <Clock className="w-6 h-6 text-orange-600 mr-3 mt-1 flex-shrink-0" />
          )}
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">
              {progressData.canRetake ? 'Refaça o Teste' : 'Aguarde para Refazer'}
            </h3>
            
            {progressData.canRetake ? (
              <div>
                <p className="text-gray-600 mb-4">
                  Você pode refazer o teste até {progressData.remainingAttempts} vez(es) hoje.
                </p>
                <Button onClick={handleRetakeTest} className="flex items-center">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refazer Teste ({progressData.remainingAttempts} restante{progressData.remainingAttempts !== 1 ? 's' : ''})
                </Button>
              </div>
            ) : (
              <div>
                <p className="text-gray-600 mb-2">
                  Você já fez suas 3 tentativas do dia. Complete sua trilha para desbloquear novamente.
                </p>
                <p className="text-sm text-gray-500">
                  Próxima oportunidade em {progressData.daysUntilRetake} dias
                </p>
                
                {progressData.todayAttempts.length > 0 && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-sm text-gray-700 mb-2">Tentativas de hoje:</h4>
                    <div className="space-y-1">
                      {progressData.todayAttempts.map((attempt, index) => (
                        <div key={attempt.id} className="flex justify-between text-xs text-gray-600">
                          <span>Tentativa {attempt.attemptNumber}</span>
                          <span>{attempt.totalScore} pontos</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RetryAttemptDisplay;