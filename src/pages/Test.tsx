
import Navbar from "@/components/Navbar";
import { Helmet } from "react-helmet-async";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import InteractiveQuestionnaire from "@/components/InteractiveQuestionnaire";
import RetryAttemptDisplay from "@/components/RetryAttemptDisplay";

const Test = () => {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth", { replace: true, state: { redirectTo: "/test" } });
      }
    });
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>Teste de Dependência de Smartphone - Além das Notificações</title>
        <meta
          name="description"
          content="Responda 20 perguntas organizadas em 4 categorias e descubra seu nível de dependência do smartphone com recomendação de trilha personalizada."
        />
        <link rel="canonical" href={window.location.origin + "/test"} />
      </Helmet>

      <Navbar />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-6">
          <RetryAttemptDisplay />
        </div>
        <InteractiveQuestionnaire />
      </main>
    </div>
  );
};

export default Test;
