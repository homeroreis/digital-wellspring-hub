import Navbar from "@/components/Navbar";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { programTracks } from "@/data/programs";
import { ArrowRight } from "lucide-react";

const Programs = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>Programas de Bem-estar Digital</title>
        <meta
          name="description"
          content="Conheça as trilhas de bem-estar digital e escolha o caminho ideal para sua rotina."
        />
        <link rel="canonical" href={window.location.origin + "/programs"} />
      </Helmet>

      <Navbar />

      <main className="flex-1 py-12">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-center mb-6">Programas de Bem-Estar Digital</h1>
          <p className="text-center text-muted-foreground max-w-3xl mx-auto mb-10">
            Trilhas práticas e progressivas para transformar sua relação com o celular.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {programTracks.map((t) => (
              <article
                key={t.slug}
                className={`p-6 rounded-xl bg-card border shadow-soft hover:shadow-elevated transition-smooth ${t.variantClass}`}
              >
                <h2 className="text-xl font-bold mb-1">{t.title}</h2>
                <p className="font-medium mb-2">{t.durationDays} dias • Intensidade {t.level}</p>
                <p className="text-muted-foreground mb-4">{t.description}</p>
                <ul className="list-disc list-inside text-sm text-foreground/85 mb-4">
                  {t.benefits.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
                <Link
                  to={`/programs/${t.slug}`}
                  className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
                  aria-label={`Ver detalhes da ${t.title}`}
                >
                  Ver detalhes <ArrowRight className="size-4" />
                </Link>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Programs;
