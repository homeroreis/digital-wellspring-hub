import { useEffect } from "react";

const Contact = () => {
  useEffect(() => {
    window.location.href = "https://www.impactovitoria.com/atendimento";
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Redirecionando...</h1>
          <p className="text-muted-foreground">
            Você será redirecionado para nossa página de atendimento.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Contact;
