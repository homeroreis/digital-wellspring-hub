import Navbar from "@/components/Navbar";
import { Helmet } from "react-helmet-async";
import QuickQuestionnaire from "@/components/QuickQuestionnaire";

const QuickTest = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>Teste Rápido - Avaliação Missionária | Além das Notificações</title>
        <meta
          name="description"
          content="Teste rápido de 4 perguntas para avaliação de dependência digital em trabalho missionário. Resultados imediatos com recomendação personalizada."
        />
        <link rel="canonical" href={window.location.origin + "/quick-test"} />
      </Helmet>

      <Navbar />

      <main className="flex-1">
        <QuickQuestionnaire />
      </main>
    </div>
  );
};

export default QuickTest;