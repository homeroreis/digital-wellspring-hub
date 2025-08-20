// Trilha Equilíbrio - 21 dias para uso consciente
export interface OnboardingStep {
  title: string;
  content: string;
}

export interface TrackData {
  slug: string;
  title: string;
  description: string;
  duration: number;
  onboardingSteps: OnboardingStep[];
}

export const equilibrioTrackData: TrackData = {
  slug: 'equilibrio',
  title: 'Trilha Equilíbrio',
  description: 'Jornada de 21 dias para transformar sua relação com a tecnologia através do equilíbrio consciente',
  duration: 21,
  onboardingSteps: [
    {
      title: 'Bem-vindo à Trilha Equilíbrio',
      content: `🌱 **Parabéns por dar este passo corajoso!**

Você está iniciando uma jornada de 21 dias que transformará sua relação com a tecnologia. Seu teste indicou sinais de uso problemático, mas você tem o poder de mudar isso.

**O que você descobrirá nos próximos 21 dias:**
• Como criar limites saudáveis com dispositivos
• Técnicas práticas para reduzir ansiedade digital
• Estratégias para melhorar relacionamentos
• Ferramentas de mindfulness digital
• Métodos para aumentar sua produtividade

**Esta trilha é para você que:**
• Percebe que está passando muito tempo nas telas
• Sente ansiedade quando não tem o celular
• Quer melhorar relacionamentos prejudicados
• Busca mais equilíbrio entre online e offline
• Deseja redescobrir atividades do mundo real

Preparado para esta transformação? Vamos começar!`
    },
    {
      title: 'Definindo Seu Ritmo',
      content: `⏰ **Vamos personalizar sua jornada**

Cada pessoa tem um ritmo diferente. Para maximizar seus resultados, precisamos adaptar o programa à sua rotina.

**Quando você prefere fazer as atividades?**
• Manhã (antes do trabalho)
• Almoço (pausa do meio-dia)
• Tarde (final do dia)
• Noite (antes de dormir)

**Quanto tempo você pode dedicar por dia?**
• 15-20 minutos (básico)
• 20-30 minutos (recomendado)
• 30-45 minutos (intensivo)

**Seus maiores desafios atualmente:**
• Scroll infinito nas redes sociais
• Interrupções durante o trabalho
• Usar celular antes de dormir
• Ansiedade sem notificações
• Comparação social online
• Procrastinação digital

**Definir expectativas realistas é fundamental para o sucesso!**`
    },
    {
      title: 'Suas Áreas de Foco',
      content: `🎯 **Vamos personalizar seu plano**

Cada pessoa tem motivações diferentes. Selecionar suas áreas de foco nos ajudará a personalizar as atividades para seus objetivos específicos.

**Selecione suas prioridades principais:**

**Saúde Mental:**
• Reduzir ansiedade e estresse
• Melhorar qualidade do sono
• Aumentar foco e concentração
• Desenvolver autoconsciência

**Relacionamentos:**
• Mais tempo de qualidade com família
• Melhorar conversas presenciais
• Reduzir conflitos sobre uso de tecnologia
• Fortalecer conexões reais

**Produtividade:**
• Eliminar distrações no trabalho
• Completar tarefas importantes
• Desenvolver disciplina pessoal
• Criar rotinas saudáveis

**Bem-estar Físico:**
• Mais atividade física
• Melhor postura
• Reduzir dores de cabeça
• Cuidar da visão

Suas escolhas nos ajudarão a criar uma experiência sob medida!`
    },
    {
      title: 'Compromisso e Expectativas',
      content: `🤝 **Hora de selar nosso compromisso**

Para que esta jornada seja verdadeiramente transformadora, precisamos estabelecer expectativas claras e um compromisso real.

**Nos próximos 21 dias, você vai:**
• Dedicar 20-30 minutos diários às atividades
• Experimentar técnicas novas (mesmo se parecerem estranhas)
• Ser honesto sobre seus desafios e recaídas
• Celebrar pequenas vitórias
• Persistir mesmo nos dias difíceis

**O que esperar:**
• **Primeiros 3 dias:** Resistência e dificuldade
• **Dias 4-10:** Altos e baixos, mas primeiros resultados
• **Dias 11-16:** Novos hábitos começam a se formar
• **Dias 17-21:** Consolidação e maior controle

**Importante lembrar:**
✅ Progresso, não perfeição
✅ Cada dia é uma nova oportunidade
✅ Recaídas fazem parte do processo
✅ Pequenas mudanças geram grandes resultados

**Você está pronto para se comprometer com esta transformação?**

Esta é sua chance de recuperar o controle e criar uma relação mais saudável com a tecnologia!`
    }
  ]
};