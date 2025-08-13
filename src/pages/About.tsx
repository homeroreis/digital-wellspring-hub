import Navbar from "@/components/Navbar";
import { Helmet } from "react-helmet-async";

const About = () => {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'Sobre — Além das Notificações',
    description:
      'Projeto dedicado a promover bem-estar digital com diagnóstico simples e trilhas práticas.',
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>Sobre — Além das Notificações</title>
        <meta
          name="description"
          content="Conheça nossa missão: ajudar você a transformar sua relação com o smartphone."
        />
        <link rel="canonical" href={window.location.origin + "/about"} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <Navbar />

      <main className="flex-1 py-12">
        <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">Sobre</h1>
          <p className="text-foreground/85 mb-4">
            O Além das Notificações é um projeto de bem-estar digital que une ciência de hábitos e design de
            comportamento. Nosso objetivo é oferecer ferramentas simples para que você recupere foco, presença e
            qualidade de vida.
          </p>
          <p className="text-muted-foreground">
            Comece pelo teste gratuito e, em seguida, siga a trilha recomendada para você. Pequenas mudanças geram
            grandes resultados ao longo do tempo.
          </p>
        </section>
      </main>
    </div>
  );
};

export default About;
