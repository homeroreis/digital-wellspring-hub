import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import InteractiveOnboardingSystem from '@/components/InteractiveOnboardingSystem';
import Navbar from '@/components/Navbar';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const Onboarding = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  
  const trackSlug = searchParams.get('track') || 'equilibrio';

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
          toast.error('Você precisa estar logado para acessar o onboarding');
          navigate('/auth');
          return;
        }

        // Verificar se já completou o onboarding
        const { data: preferences } = await supabase
          .from('user_preferences' as any)
          .select('onboarding_completed')
          .eq('user_id', user.id)
          .maybeSingle();

        if (preferences && (preferences as any).onboarding_completed) {
          toast.info('Onboarding já foi concluído, redirecionando para o dashboard');
          navigate('/dashboard');
          return;
        }

        setUser(user);
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        toast.error('Erro ao carregar página');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando onboarding...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>Configuração Inicial - Além das Notificações</title>
        <meta name="description" content="Configure suas preferências e comece sua jornada de transformação digital" />
      </Helmet>
      
      <Navbar />
      
      <main className="flex-1">
        <InteractiveOnboardingSystem 
          trackSlug={trackSlug} 
          userId={user.id} 
        />
      </main>
    </div>
  );
};

export default Onboarding;