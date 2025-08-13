export type ProgramTrack = {
  slug: string;
  title: string;
  durationDays: number;
  level: "Leve" | "Moderado" | "Intenso";
  description: string;
  benefits: string[];
  steps: string[];
  variantClass: string; // CSS helper for left border color
};

export const programTracks: ProgramTrack[] = [
  {
    slug: "liberdade",
    title: "Trilha Liberdade",
    durationDays: 7,
    level: "Leve",
    description:
      "Para quem já tem bons hábitos e quer fortalecê-los com ações simples e objetivas.",
    benefits: [
      "Clareza sobre hábitos digitais",
      "Rotinas rápidas e eficazes",
      "Mais presença no dia a dia",
    ],
    steps: [
      "Dia 1: Limpeza das notificações não essenciais",
      "Dia 2: Primeira hora do dia 100% off-line",
      "Dia 3: Check-in de redes apenas 2x ao dia",
      "Dia 4: Organize a tela inicial (menos ícones, menos gatilhos)",
      "Dia 5: Lembrete de pausa consciente a cada 90 minutos",
      "Dia 6: Tempo de qualidade com alguém (sem celular por 30min)",
      "Dia 7: Revisão e plano de manutenção",
    ],
    variantClass: "track-border-liberdade",
  },
  {
    slug: "equilibrio",
    title: "Trilha Equilíbrio",
    durationDays: 21,
    level: "Moderado",
    description:
      "Para quem percebe sinais de alerta e quer recuperar o controle com hábitos consistentes.",
    benefits: [
      "Redução gradual de uso compulsivo",
      "Mais foco e produtividade",
      "Sono e humor mais estáveis",
    ],
    steps: [
      "Semana 1: Diagnóstico e ajustes de ambiente digital",
      "Semana 2: Protocolos de foco (Pomodoro, tempo profundo)",
      "Semana 3: Recompensas saudáveis e revisão de progresso",
    ],
    variantClass: "track-border-equilibrio",
  },
  {
    slug: "renovacao",
    title: "Trilha Renovação",
    durationDays: 40,
    level: "Intenso",
    description:
      "Para transformação profunda e mudança de hábitos enraizados, com suporte e constância.",
    benefits: [
      "Reprogramação de hábitos digitais",
      "Alta autoconsciência",
      "Transformação sustentável",
    ],
    steps: [
      "Fase 1 (10 dias): Detox digital guiado",
      "Fase 2 (20 dias): Reconstrução de rotinas e propósito",
      "Fase 3 (10 dias): Manutenção e marcos de longo prazo",
    ],
    variantClass: "track-border-renovacao",
  },
];
