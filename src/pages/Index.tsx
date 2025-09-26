import { Button } from "@/components/ui/button";
import { AlertTriangle, Heart, TrendingUp, CheckCircle, ArrowRight } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
const Index = () => {
  const navigate = useNavigate();
  const statistics = [
    { number: "3h47min", text: "tempo médio diário nas redes sociais" },
    { number: "2.617", text: "toques no celular por dia (média)" },
    { number: "76%", text: "verificam o celular nos primeiros 30 min" }
  ];

  const benefits = [
    { icon: <Heart className="size-8" />, title: "Relacionamentos Mais Saudáveis", description: "Reconecte-se com família e amigos de forma genuína." },
    { icon: <TrendingUp className="size-8" />, title: "Produtividade Aumentada", description: "Foque no que realmente importa em sua vida." },
    { icon: <CheckCircle className="size-8" />, title: "Bem-estar Espiritual", description: "Encontre tempo para reflexão e crescimento pessoal." },
  ];

  const handleStartTest = () => {
    navigate('/test');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>Além das Notificações — Bem-estar digital</title>
        <meta name="description" content="Descubra seu nível de dependência do smartphone e siga trilhas personalizadas para bem-estar digital." />
        <link rel="canonical" href={window.location.origin + "/"} />
      </Helmet>
      <Navbar />

      <main className="flex-1">
        <section className="bg-hero text-foreground py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
                Você está vivendo ou apenas <span className="underline decoration-primary/40">notificando</span>?
              </h1>
              <p className="mt-5 text-lg text-foreground/80">
                Descubra seu nível de dependência tecnológica e transforme sua relação com o smartphone com um programa personalizado e científico.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Button size="lg" variant="hero" onClick={handleStartTest}>
                  Descobrir meu nível
                  <ArrowRight className="ml-2" />
                </Button>
                <div className="text-sm text-foreground/80 grid">
                  <span>Teste gratuito e anônimo</span>
                  <span>Resultado em 2 minutos</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-card p-8 rounded-2xl shadow-elevated card-tilt">
                <div className="text-center">
                  <AlertTriangle className="size-14 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-4">Sinais de alerta</h3>
                  <ul className="text-left space-y-2 text-muted-foreground">
                    <li className="flex items-center gap-3"><span className="h-2 w-2 rounded-full bg-destructive" />Ansiedade sem o celular</li>
                    <li className="flex items-center gap-3"><span className="h-2 w-2 rounded-full bg-primary" />Verificação constante</li>
                    <li className="flex items-center gap-3"><span className="h-2 w-2 rounded-full bg-accent" />Interrupção de atividades</li>
                    <li className="flex items-center gap-3"><span className="h-2 w-2 rounded-full bg-secondary-foreground" />Impacto nos relacionamentos</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10 border-y-2 border-primary/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-pulse"></div>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center">
              <div className="inline-flex items-center gap-3 bg-primary/20 text-primary-foreground px-6 py-3 rounded-full text-base font-bold mb-6 shadow-soft animate-bounce">
                <span className="h-3 w-3 bg-primary rounded-full animate-pulse"></span>
                ⚡ TESTE RÁPIDO DISPONÍVEL
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Teste Rápido
              </h2>
              <p className="text-lg text-foreground/80 mb-8 max-w-2xl mx-auto leading-relaxed">
                Versão simplificada de 4 perguntas para triagem rápida. 
                Ideal para uma avaliação express de dependência digital.
              </p>
              
              <div className="flex flex-col items-center gap-6 mb-8">
                <Button 
                  variant="missionary" 
                  size="lg"
                  onClick={() => navigate('/quick-test')}
                  className="text-xl px-12 py-6 font-bold shadow-elevated hover:scale-105 transition-all duration-300 animate-pulse hover:animate-none"
                >
                  🚀 FAZER TESTE RÁPIDO (2 min)
                  <ArrowRight className="ml-3 w-6 h-6" />
                </Button>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center max-w-2xl">
                  <div className="bg-card/80 backdrop-blur-sm p-4 rounded-xl shadow-soft">
                    <div className="text-2xl mb-2">✅</div>
                    <span className="text-sm font-medium text-foreground/90">4 perguntas estratégicas</span>
                  </div>
                  <div className="bg-card/80 backdrop-blur-sm p-4 rounded-xl shadow-soft">
                    <div className="text-2xl mb-2">📱</div>
                    <span className="text-sm font-medium text-foreground/90">Otimizado para mobile</span>
                  </div>
                  <div className="bg-card/80 backdrop-blur-sm p-4 rounded-xl shadow-soft">
                    <div className="text-2xl mb-2">⚡</div>
                    <span className="text-sm font-medium text-foreground/90">Resultado instantâneo</span>
                  </div>
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-4 max-w-md mx-auto">
                <span className="font-medium">💡 Perfeito para uso evangelístico:</span> Ferramenta rápida e impactante para abordar o tema com outras pessoas
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-subtle relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                A realidade da nomofobia
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Nomofobia é o medo irracional de ficar sem acesso ao celular. Dados científicos revelam o impacto 
                dessa condição moderna na população global.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-center max-w-5xl mx-auto">
              {statistics.map((s, i) => (
                <div key={i} className="text-center p-8 rounded-2xl border-2 border-primary/10 bg-card/80 backdrop-blur-sm hover:shadow-elevated hover:border-primary/20 transition-all duration-300 hover:scale-105">
                  <div className="text-5xl md:text-6xl font-bold text-primary mb-4">{s.number}</div>
                  <p className="text-muted-foreground text-lg">{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Transforme sua vida digital
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {benefits.map((b, i) => (
                <article key={i} className="bg-card/80 backdrop-blur-sm p-10 rounded-2xl shadow-soft hover:shadow-elevated border border-primary/10 hover:border-primary/20 transition-all duration-300 hover:scale-105 card-tilt">
                  <div className="mb-6 text-primary p-3 bg-primary/10 rounded-xl w-fit">{b.icon}</div>
                  <h3 className="text-2xl font-semibold mb-4 text-foreground">{b.title}</h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">{b.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-primary/5"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Trilhas personalizadas
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-8 rounded-2xl bg-card/80 backdrop-blur-sm track-border-liberdade hover:shadow-elevated transition-all duration-300 hover:scale-105"> 
                <h3 className="text-2xl font-bold mb-2">🟢 Trilha Liberdade</h3>
                <p className="font-semibold text-lg mb-3 text-primary">7 dias</p>
                <p className="text-muted-foreground leading-relaxed">Para quem já tem bons hábitos e quer fortalecê-los.</p>
              </div>
              <div className="p-8 rounded-2xl bg-card/80 backdrop-blur-sm track-border-equilibrio hover:shadow-elevated transition-all duration-300 hover:scale-105">
                <h3 className="text-2xl font-bold mb-2">🟡 Trilha Equilíbrio</h3>
                <p className="font-semibold text-lg mb-3 text-primary">21 dias</p>
                <p className="text-muted-foreground leading-relaxed">Para quem percebe sinais de alerta e quer recuperar o controle.</p>
              </div>
              <div className="p-8 rounded-2xl bg-card/80 backdrop-blur-sm track-border-renovacao hover:shadow-elevated transition-all duration-300 hover:scale-105">
                <h3 className="text-2xl font-bold mb-2">🔴 Trilha Renovação</h3>
                <p className="font-semibold text-lg mb-3 text-primary">40 dias</p>
                <p className="text-muted-foreground leading-relaxed">Para transformação profunda e mudança de hábitos enraizados.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-hero relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20"></div>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Pronto para descobrir sua trilha?</h2>
            <p className="text-xl text-foreground/90 mb-12 leading-relaxed">Faça o teste agora e receba um diagnóstico personalizado com ações práticas.</p>
            <Button size="lg" variant="elevated" onClick={handleStartTest} className="text-xl px-12 py-6 shadow-elevated hover:scale-105 transition-all duration-300">
              Iniciar meu teste gratuito
              <ArrowRight className="ml-3 w-6 h-6" />
            </Button>
            <p className="mt-6 text-foreground/80 bg-card/20 backdrop-blur-sm rounded-lg px-6 py-3 inline-block">
              ⏱️ Leva 2 minutos • 🔒 100% confidencial • 🎯 Resultado imediato
            </p>
          </div>
        </section>
      </main>

      <footer className="bg-accent text-accent-foreground py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <img src="/lovable-uploads/620a6f7e-7753-420e-b5f9-e8043ee4012b.png" alt="Marca Além das Notificações fundo amarelo" className="h-8 w-8 rounded" loading="lazy" />
              <span className="font-semibold">Além das Notificações</span>
            </div>
            <p className="text-sm opacity-85">© 2025 Bem-estar digital. Todos os direitos reservados.</p>
          </div>
          
          {/* Medical Disclaimer */}
          <div className="border-t border-accent-foreground/20 pt-4">
            <p className="text-xs text-center opacity-75">
              ⚠️ Os testes e conteúdos desta plataforma não substituem avaliação psicológica ou médica profissional. 
              São ferramentas de autoavaliação e conscientização sobre hábitos digitais.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
