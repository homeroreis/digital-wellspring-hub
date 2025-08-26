-- Completar os dias restantes da Trilha Equilíbrio (dias 6-9, 11-14, 16-20) - Corrigindo caracteres especiais

-- DIA 6 - RECONSTRUINDO CONEXÕES
INSERT INTO public.track_daily_content (
  track_slug, day_number, title, objective,
  devotional_verse, devotional_reflection, devotional_prayer,
  main_activity_title, main_activity_content,
  main_challenge_title, main_challenge_content,
  bonus_activity_title, bonus_activity_content,
  max_points, difficulty_level
) VALUES (
  'equilibrio', 6, 'Reconstruindo Conexões',
  'Reparar relacionamentos prejudicados pela dependência digital',
  'Quanto depender de vós, tende paz com todos os homens - Romanos 12:18',
  'Quantas vezes alguém falou com você enquanto olhava o celular? Quantos "ahã" automáticos você deu? Paulo nos ensina que, quanto depende de nós, devemos viver em paz. Hoje é dia de pedir perdão e reconstruir pontes que a tecnologia danificou.',
  'Senhor, reconheço que negligencie pessoas importantes por causa das telas. Perdoa-me por dar mais atenção ao virtual que ao real. Restaura os relacionamentos que prejudiquei. Ensina-me a estar verdadeiramente presente. Amém.',
  'Operação Reconexão',
  'Lista de Reparos (10 min):
Pessoas que negligenciei:
1. _________ - Como: _________
2. _________ - Como: _________  
3. _________ - Como: _________

Pedidos de Perdão (20 min):
Para cada pessoa (pessoalmente):
"Percebi que tenho dado mais atenção ao celular do que a você. Isso não é justo. Me perdoa? Quero mudar isso."

Atos de Reparação (10 min):
• Cônjuge: Jantar especial sem celular
• Filhos: Brincadeira com atenção total
• Amigos: Encontro presencial
• Pais: Visita demorada',
  'Dia 100% Presente',
  'Regras para hoje:
• Olho no olho em todas conversas
• Celular longe durante interações
• Perguntas profundas, escuta ativa
• Abraços de 20 segundos
• Sem "multitasking" social',
  'Carta de Compromisso',
  'Escreva para pessoa mais afetada:
"Querido(a) ___,
Reconheço que...
Me comprometo a...
Você pode me cobrar quando...
Com amor, ___"

Entregue pessoalmente com abraço!',
  150, 3
);

-- DIA 7 - CELEBRAÇÃO E REFLEXÃO
INSERT INTO public.track_daily_content (
  track_slug, day_number, title, objective,
  devotional_verse, devotional_reflection, devotional_prayer,
  main_activity_title, main_activity_content,
  main_challenge_title, main_challenge_content,
  bonus_activity_title, bonus_activity_content,
  max_points, difficulty_level
) VALUES (
  'equilibrio', 7, 'Celebração e Reflexão',
  'Consolidar aprendizados da primeira semana',
  'Até aqui nos ajudou o Senhor - 1 Samuel 7:12',
  'Samuel ergueu uma pedra e disse: "Até aqui nos ajudou o Senhor". Você completou 7 dias! Como Samuel, reconheça que foi Deus quem te sustentou. Esta pedra marca sua primeira vitória significativa.',
  'Senhor, como Samuel, ergo minha pedra de gratidão. Até aqui Tu me ajudaste. Nos momentos de fraqueza, Tu me fortaleceste. Esta primeira semana é prova de que posso vencer. Obrigado pela graça que me sustenta! Amém.',
  'Balanço da Semana',
  'Reflexões Profundas:
• Maior descoberta sobre mim: ___
• Momento mais difícil: ___
• Maior vitória: ___
• O que mais mudou: ___
• Como me sinto agora vs. dia 1: ___

Dados Concretos:
• Redução de tempo de tela: ___%
• Pickups reduzidos: ___%
• Tempo recuperado: ___ horas
• Atividades substitutas: ___

Lições Aprendidas:
1. _______________
2. _______________
3. _______________',
  'Mini Detox de 24h',
  'Próximas 24 horas apenas funções essenciais:
• Ligações (emergência)
• GPS (se necessário)  
• Trabalho urgente (máx 30 min)
• Sem redes sociais
• Sem entretenimento digital',
  'Celebração Offline',
  'Comemore o progresso sem postar:
• Jantar especial preparado por você
• Passeio na natureza
• Filme em família
• Jogos e risadas
• Conversa com amigo próximo

Foto mental, não digital!',
  200, 2
);

-- DIA 8 - DETOX PROGRESSIVO  
INSERT INTO public.track_daily_content (
  track_slug, day_number, title, objective,
  devotional_verse, devotional_reflection, devotional_prayer,
  main_activity_title, main_activity_content,
  main_challenge_title, main_challenge_content,
  bonus_activity_title, bonus_activity_content,
  max_points, difficulty_level
) VALUES (
  'equilibrio', 8, 'Detox Progressivo',
  'Iniciar redução sistemática do uso digital',
  'Despojando-vos do velho homem... e vos renoveis no espírito - Efésios 4:22-23',
  'Como uma cobra que troca de pele, você precisa se despojar dos velhos hábitos digitais. Será desconfortável, até doloroso, mas necessário para o crescimento. A segunda semana começa com redução mais intensa.',
  'Senhor, como a cobra se despoja da pele velha, me ajuda a me despojar dos velhos hábitos digitais. Que o desconforto da mudança me fortaleça, não me desanime. Renova-me dia a dia. Amém.',
  'Plano de Redução Gradual',
  'Metas da Semana 2:
• Dia 8: Máximo 4 horas de tela
• Dia 9: Máximo 3,5 horas
• Dia 10: Máximo 3 horas
• Dia 11: Máximo 2,5 horas
• Dia 12: Máximo 2 horas
• Dia 13: Máximo 1,5 horas
• Dia 14: Máximo 1 hora

Horários Proibidos:
• 6h-8h: Manhã sagrada
• 12h-13h: Almoço presente
• 18h-20h: Família primeiro
• 21h-6h: Descanso digital

Método 5-4-3-2-1:
• 5 min redes sociais/hora
• 4 verificações mensagens/dia
• 3 apps permitidos
• 2 horas produtivas
• 1 hora lazer digital',
  'Substituição Ativa',
  'Para cada 30 min cortados do celular:
• 10 min exercício físico
• 10 min leitura analógica
• 10 min conexão humana real

Configure contador e comprove!',
  'App Detox Professional',
  'Configure app de controle:
• Limites diários por categoria
• Bloqueios automáticos
• Relatórios semanais detalhados
• Alertas de excesso
• Modo foco para trabalho

Configure HOJE e mantenha ativo!',
  150, 3
);

-- DIA 9 - LIDANDO COM ABSTINÊNCIA
INSERT INTO public.track_daily_content (
  track_slug, day_number, title, objective,
  devotional_verse, devotional_reflection, devotional_prayer,
  main_activity_title, main_activity_content,
  main_challenge_title, main_challenge_content,
  bonus_activity_title, bonus_activity_content,
  max_points, difficulty_level
) VALUES (
  'equilibrio', 9, 'Lidando com Abstinência',
  'Gerenciar sintomas de "fissura digital"',
  'Não veio sobre vós tentação, senão humana... Deus é fiel - 1 Coríntios 10:13',
  'Hoje você pode sentir irritação, ansiedade, até sintomas físicos - é a "síndrome de abstinência digital". Paulo nos lembra que toda tentação é humana e Deus promete que você pode suportar. A fissura passa, a liberdade fica.',
  'Senhor, quando vier a ansiedade pela falta das telas, lembra-me que Tu és fiel. Não permitirás que eu seja tentado além de minhas forças. Dá-me a saída que prometes. Transforma esta fissura em oportunidade de crescimento. Amém.',
  'Kit de Sobrevivência Anti-Fissura',
  'Reconhecendo Sintomas - Marque o que sentir:
☐ Ansiedade/agitação
☐ Irritabilidade  
☐ Mãos inquietas
☐ Checagem fantasma
☐ Dificuldade concentração
☐ Tédio extremo
☐ FOMO intenso

Técnicas de Alívio Imediato:
Para Ansiedade: Respiração 4-7-8 (3 ciclos)
Para Inquietação: Fidget toy, desenhar
Para Tédio: Lista "Sempre quis fazer"

A "onda" dura 15-20 minutos - SURF a onda!',
  'Surfando a Onda',
  'Quando vier a "fissura":
1. Reconheça: "Estou sentindo vontade"
2. Observe: "É só sensação, vai passar"  
3. Respire: 10 respirações profundas
4. Espere: 15 minutos cronometrados
5. Celebre: "Eu consegui surfar!"

Registre cada onda surfada com sucesso',
  'Diário de Vitórias Específico',
  'Registro diário:
"Hoje resisti a ___ fissuras"
"A mais forte foi às ___h"
"O que funcionou: ___"
"Estou orgulhoso porque ___"
"Minha força está crescendo: ___"

Cada resistência é treino para músculos mentais!',
  150, 4
);