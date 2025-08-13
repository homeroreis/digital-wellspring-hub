import GameTrackDashboard from "@/components/GameTrackDashboard";
import { Helmet } from "react-helmet-async";

const Dashboard = () => {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    name: 'Painel da Trilha',
    description: 'Acompanhe seu progresso, próximas ações e conteúdo da trilha.'
  };

  return (
    <>
      <Helmet>
        <title>Painel da Trilha — Progresso e Ações</title>
        <meta name="description" content="Acompanhe seu progresso na trilha e veja suas próximas ações." />
        <link rel="canonical" href={window.location.origin + "/dashboard"} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <GameTrackDashboard />
    </>
  );
};

export default Dashboard;
