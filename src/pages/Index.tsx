import { Button } from "@/components/ui/button";
import { Smartphone, AlertTriangle, Heart, Users, TrendingUp, CheckCircle, ArrowRight } from 'lucide-react';

const Index = () => {
  const statistics = [
    { number: "89%", text: "dos jovens sentem ansiedade sem o celular" },
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
    console.log('Iniciando teste...');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="w-full border-b bg-card/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/lovable-uploads/6d26456f-f9b2-44cd-b3ba-16cc677e4993.png" alt="Logotipo Além das Notificações" className="h-10 w-10" loading="lazy" />
            <span className="text-xl font-bold">Além das Notificações</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline">Como funciona</Button>
            <Button variant="elevated">Fazer Teste</Button>
          </div>
        </div>
      </header>

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

        <section className="py-16 bg-subtle">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">A realidade da nomofobia</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {statistics.map((s, i) => (
                <div key={i} className="text-center p-6 rounded-xl border bg-card hover:shadow-soft transition-smooth">
                  <div className="text-4xl font-bold text-primary mb-2">{s.number}</div>
                  <p className="text-muted-foreground">{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">Transforme sua vida digital</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {benefits.map((b, i) => (
                <article key={i} className="bg-card p-8 rounded-xl shadow-soft hover:shadow-elevated transition-smooth">
                  <div className="mb-4 text-accent">{b.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{b.title}</h3>
                  <p className="text-muted-foreground">{b.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">Trilhas personalizadas</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-lg bg-card track-border-liberdade"> 
                <h3 className="text-xl font-bold mb-1">🟢 Trilha Liberdade</h3>
                <p className="font-medium mb-2">7 dias</p>
                <p className="text-muted-foreground">Para quem já tem bons hábitos e quer fortalecê-los.</p>
              </div>
              <div className="p-6 rounded-lg bg-card track-border-equilibrio">
                <h3 className="text-xl font-bold mb-1">🟡 Trilha Equilíbrio</h3>
                <p className="font-medium mb-2">21 dias</p>
                <p className="text-muted-foreground">Para quem percebe sinais de alerta e quer recuperar o controle.</p>
              </div>
              <div className="p-6 rounded-lg bg-card track-border-renovacao">
                <h3 className="text-xl font-bold mb-1">🔴 Trilha Renovação</h3>
                <p className="font-medium mb-2">40 dias</p>
                <p className="text-muted-foreground">Para transformação profunda e mudança de hábitos enraizados.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-hero">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Pronto para descobrir sua trilha?</h2>
            <p className="text-lg text-foreground/85 mb-8">Faça o teste agora e receba um diagnóstico personalizado com ações práticas.</p>
            <Button size="lg" variant="elevated" onClick={handleStartTest}>
              Iniciar meu teste gratuito
              <ArrowRight className="ml-2" />
            </Button>
            <p className="mt-3 text-sm text-foreground/80">⏱️ Leva 2 minutos • 🔒 100% confidencial • 🎯 Resultado imediato</p>
          </div>
        </section>
      </main>

      <footer className="bg-accent text-accent-foreground py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/lovable-uploads/620a6f7e-7753-420e-b5f9-e8043ee4012b.png" alt="Marca Além das Notificações fundo amarelo" className="h-8 w-8 rounded" loading="lazy" />
            <span className="font-semibold">Além das Notificações</span>
          </div>
          <p className="text-sm opacity-85">© 2025 Bem-estar digital. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
