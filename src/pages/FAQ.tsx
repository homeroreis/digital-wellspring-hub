import Navbar from "@/components/Navbar";
import { Helmet } from "react-helmet-async";

const faqs = [
  {
    q: "O teste é realmente anônimo?",
    a: "Sim. Nenhuma informação pessoal é coletada. O cálculo acontece localmente no seu navegador.",
  },
  {
    q: "Preciso pagar para usar as trilhas?",
    a: "Não. As trilhas apresentadas aqui são gratuitas e autoaplicáveis.",
  },
  {
    q: "Funciona para qualquer idade?",
    a: "O conteúdo é pensado para jovens e adultos. Para crianças, recomenda-se acompanhamento responsável.",
  },
];

const FAQ = () => {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>FAQ — Além das Notificações</title>
        <meta name="description" content="Perguntas frequentes sobre o teste e as trilhas de bem-estar digital." />
        <link rel="canonical" href={window.location.origin + "/faq"} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <Navbar />

      <main className="flex-1 py-12">
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-center mb-6">FAQ</h1>
          <div className="space-y-6">
            {faqs.map((f, i) => (
              <article key={i} className="bg-card border rounded-xl p-6 shadow-soft">
                <h2 className="text-lg font-semibold mb-2">{f.q}</h2>
                <p className="text-muted-foreground">{f.a}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default FAQ;
