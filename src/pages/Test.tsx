import Navbar from "@/components/Navbar";
import { Helmet } from "react-helmet-async";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
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

  const maxScore = questions.length * 3;
  const currentScore = useMemo(
    () => Object.values(answers).reduce((sum, v) => sum + (v ?? 0), 0),
    [answers]
  );
  const progress = Math.round((Object.keys(answers).length / questions.length) * 100);

  const recommendation = useMemo(() => {
    if (currentScore <= 7) return { slug: "liberdade", title: "Trilha Liberdade" };
    if (currentScore <= 16) return { slug: "equilibrio", title: "Trilha Equilíbrio" };
    return { slug: "renovacao", title: "Trilha Renovação" };
  }, [currentScore]);

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
          content="Responda 8 perguntas e descubra seu nível de dependência do smartphone com recomendação de trilha."
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
              <div className="mb-6">
                <Progress value={progress} className="h-2" />
                <p className="mt-2 text-sm text-muted-foreground">
                  {Object.keys(answers).length} de {questions.length} respondidas
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {questions.map((q, idx) => (
                  <div key={idx} className="space-y-3">
                    <p className="font-medium">{idx + 1}. {q}</p>
                    <RadioGroup
                      value={answers[idx]?.toString() ?? ""}
                      onValueChange={(val) =>
                        setAnswers((prev) => ({ ...prev, [idx]: Number(val) }))
                      }
                      className="grid grid-cols-2 md:grid-cols-4 gap-3"
                    >
                      {options.map((opt) => (
                        <div key={opt.value} className="flex items-center space-x-2 bg-card p-2 rounded-md border">
                          <RadioGroupItem id={`q${idx}-${opt.value}`} value={String(opt.value)} />
                          <Label htmlFor={`q${idx}-${opt.value}`}>{opt.label}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                ))}

                <div className="pt-2 flex justify-end">
                  <Button type="submit" disabled={Object.keys(answers).length < questions.length}>
                    Ver resultado <ArrowRight className="ml-2 size-4" />
                  </Button>
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
