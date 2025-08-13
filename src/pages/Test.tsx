import Navbar from "@/components/Navbar";
import { Helmet } from "react-helmet-async";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, CheckCircle } from "lucide-react";

const questions = [
  "Pego o celular sem pensar, apenas por hábito.",
  "Sinto ansiedade quando fico sem acessar o celular.",
  "Interrompo tarefas importantes para checar notificações.",
  "Uso o celular antes de dormir e isso atrapalha meu sono.",
  "Fico irritado(a) quando não posso usar o celular.",
  "Verifico as redes sociais repetidamente ao longo do dia.",
  "Já tentei reduzir o uso e não consegui por muito tempo.",
  "Me distraio facilmente do que estou fazendo por causa do celular.",
  "Uso o celular durante refeições ou conversas com outras pessoas.",
  "Sinto que perco a noção do tempo quando estou no celular.",
  "Adio tarefas importantes por causa do uso do celular.",
  "Uso o celular enquanto dirijo, atravesso a rua ou em outras situações de risco.",
  "Sinto necessidade de checar o celular logo ao acordar.",
  "Fico checando o celular mesmo quando não há notificações.",
  "Comparo minha vida com a dos outros nas redes sociais e me sinto pior.",
  "Tenho dores no pescoço, olhos cansados ou dores nas mãos por uso excessivo.",
  "Meu desempenho no trabalho/estudos já foi prejudicado pelo uso do celular.",
  "Já recebi comentários de familiares/amigos sobre meu uso excessivo.",
  "Uso o celular para lidar com emoções difíceis (tédio, tristeza, ansiedade).",
  "Sinto que o celular controla minha rotina mais do que eu controlo o celular.",
];

const options = [
  { value: 0, label: "Nunca" },
  { value: 1, label: "Raramente" },
  { value: 2, label: "Frequentemente" },
  { value: 3, label: "Quase sempre" },
];

const Test = () => {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResult, setShowResult] = useState(false);
const navigate = useNavigate();
useEffect(() => {
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (!session) {
      navigate("/auth", { replace: true, state: { redirectTo: "/test" } });
    }
  });
}, [navigate]);

const maxScore = questions.length * 3;
const currentScore = useMemo(
  () => Object.values(answers).reduce((sum, v) => sum + (v ?? 0), 0),
  [answers]
);
const progress = Math.round((Object.keys(answers).length / questions.length) * 100);
const scorePercent = currentScore / maxScore;

// Paginação de perguntas
const pageSize = 5;
const [page, setPage] = useState(0);
const totalPages = Math.ceil(questions.length / pageSize);
const startIndex = page * pageSize;
const displayedQuestions = questions.slice(startIndex, startIndex + pageSize);

const recommendation = useMemo(() => {
  if (scorePercent <= 0.29) return { slug: "liberdade", title: "Trilha Liberdade" };
  if (scorePercent <= 0.67) return { slug: "equilibrio", title: "Trilha Equilíbrio" };
  return { slug: "renovacao", title: "Trilha Renovação" };
}, [scorePercent]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.keys(answers).length < questions.length) return;
    setShowResult(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>Teste de Dependência de Smartphone</title>
        <meta
          name="description"
          content="Responda 20 perguntas e descubra seu nível de dependência do smartphone com recomendação de trilha."
        />
        <link rel="canonical" href={window.location.origin + "/test"} />
      </Helmet>

      <Navbar />

      <main className="flex-1 py-10">
        <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-center mb-2">Descubra seu nível</h1>
          <p className="text-center text-muted-foreground mb-8">
            Leva cerca de 2 minutos. Suas respostas são anônimas.
          </p>

          <Card className="border shadow-soft">
            <CardHeader>
              <CardTitle>Questionário</CardTitle>
            </CardHeader>
            <CardContent>
<div className="mb-6 sticky top-0 z-10 bg-card/80 backdrop-blur rounded-md p-3 border">
  <Progress value={progress} className="h-2" />
  <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
    <p>
      {Object.keys(answers).length} de {questions.length} respondidas — {progress}%
    </p>
    <p>
      Bloco {page + 1} de {totalPages}
    </p>
  </div>
</div>

<form onSubmit={handleSubmit} className="space-y-6">
  {displayedQuestions.map((q, idx) => {
    const globalIdx = startIndex + idx;
    return (
      <div key={globalIdx} className="space-y-3 animate-fade-in">
        <p className="font-medium">{globalIdx + 1}. {q}</p>
        <RadioGroup
          value={answers[globalIdx]?.toString() ?? ""}
          onValueChange={(val) =>
            setAnswers((prev) => ({ ...prev, [globalIdx]: Number(val) }))
          }
          className="grid grid-cols-2 md:grid-cols-4 gap-3"
        >
          {options.map((opt) => (
            <div key={opt.value} className={`flex items-center space-x-2 bg-card p-2 rounded-md border transition-smooth ${answers[globalIdx] === opt.value ? "border-primary bg-primary/10" : ""}`}>
              <RadioGroupItem id={`q${globalIdx}-${opt.value}`} value={String(opt.value)} />
              <Label htmlFor={`q${globalIdx}-${opt.value}`}>{opt.label}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    );
  })}

  <div className="pt-2 flex items-center justify-between">
    <Button
      type="button"
      variant="outline"
      onClick={() => { setAnswers({}); setShowResult(false); setPage(0); }}
    >
      Limpar respostas
    </Button>

    <div className="flex items-center gap-2">
      {page > 0 && (
        <Button type="button" variant="outline" onClick={() => setPage((p) => p - 1)}>
          Anterior
        </Button>
      )}
      {page < totalPages - 1 ? (
        <Button type="button" onClick={() => setPage((p) => p + 1)}>
          Próximo
        </Button>
      ) : (
        <Button type="submit" disabled={Object.keys(answers).length < questions.length}>
          Ver resultado <ArrowRight className="ml-2 size-4" />
        </Button>
      )}
    </div>
  </div>
</form>

              {showResult && (
                <div className="mt-8 rounded-lg border p-6 bg-secondary/40">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="text-primary size-6 mt-1" />
                    <div>
                      <h2 className="text-xl font-semibold">Seu resultado</h2>
                      <p className="text-muted-foreground">
                        Pontuação: <strong>{currentScore}</strong> de {maxScore}. Recomendamos a <strong>{recommendation.title}</strong>.
                      </p>
                      <div className="mt-4 flex gap-3">
                        <Button onClick={() => navigate(`/programs/${recommendation.slug}`)}>
                          Ver trilha recomendada
                        </Button>
                        <Button variant="outline" onClick={() => navigate("/programs")}>
                          Ver todas as trilhas
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
};

export default Test;
