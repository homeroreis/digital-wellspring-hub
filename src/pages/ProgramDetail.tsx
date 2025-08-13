import Navbar from "@/components/Navbar";
import { Helmet } from "react-helmet-async";
import { useParams, Link } from "react-router-dom";
import { programTracks } from "@/data/programs";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const ProgramDetail = () => {
  const { slug } = useParams();
  const track = programTracks.find((t) => t.slug === slug);

  if (!track) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 grid place-items-center px-4">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">Trilha não encontrada</h1>
            <Link to="/programs" className="text-primary hover:underline">
              Voltar para Programas
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>{`${track.title} — ${track.durationDays} dias`}</title>
        <meta
          name="description"
          content={`${track.title}: ${track.description}`}
        />
        <link
          rel="canonical"
          href={window.location.origin + "/programs/" + track.slug}
        />
      </Helmet>

      <Navbar />

      <main className="flex-1 py-12">
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <article className={`bg-card p-8 rounded-xl shadow-elevated border ${track.variantClass}`}>
            <h1 className="text-3xl font-bold mb-1">{track.title}</h1>
            <p className="text-foreground/85 mb-2">
              Duração: <strong>{track.durationDays} dias</strong> • Intensidade {track.level}
            </p>
            <p className="text-muted-foreground mb-6">{track.description}</p>

            <h2 className="text-xl font-semibold mb-2">Benefícios</h2>
            <ul className="list-disc list-inside text-foreground/85 mb-6">
              {track.benefits.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>

            <h2 className="text-xl font-semibold mb-2">Plano</h2>
            <ol className="list-decimal list-inside space-y-2 text-foreground/85">
              {track.steps.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>

            <div className="mt-8 flex items-center gap-3">
              <Button asChild>
                <Link to="/test" aria-label="Fazer teste para recomendação">
                  Fazer o teste <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/programs">Outras trilhas</Link>
              </Button>
            </div>
          </article>
        </section>
      </main>
    </div>
  );
};

export default ProgramDetail;
