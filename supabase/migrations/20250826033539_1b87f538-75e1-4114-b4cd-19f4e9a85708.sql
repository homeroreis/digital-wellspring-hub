-- Migrar conteúdo da Trilha Liberdade para o banco
INSERT INTO track_daily_content (
  track_slug, day_number, title, objective, 
  devotional_verse, devotional_reflection, devotional_prayer,
  main_activity_title, main_activity_content, 
  main_challenge_title, main_challenge_content,
  bonus_activity_title, bonus_activity_content,
  max_points, difficulty_level
) VALUES 
('liberdade', 1, 'DESPERTAR DA GRATIDÃO', 'Reconhecer e agradecer pelo equilíbrio atual',
 'Em tudo dai graças, porque esta é a vontade de Deus - 1 Tessalonicenses 5:18',
 'A gratidão é o antídoto mais poderoso contra a ansiedade digital. Quando reconhecemos as bênçãos que já temos, deixamos de buscar validação constante nas redes sociais. Hoje, vamos despertar para uma gratidão genuína que não depende de likes ou comentários.',
 'Senhor, obrigado por me dar sabedoria para usar a tecnologia com equilíbrio. Ajuda-me a ser grato pelas bênçãos reais da minha vida, não pelas virtuais. Que eu possa ser instrumento de equilíbrio para outros. Amém.',
 'Inventário de Gratidão Analógico',
 'Material: Papel e caneta (não digital!)\n\nPasso a passo:\n1. Divida a folha em 4 quadrantes:\n   - Pessoas que amo\n   - Conquistas pessoais\n   - Bênçãos diárias\n   - Dons e talentos\n\n2. Em cada quadrante, liste 5 itens (total: 20)\n   - Seja específico (não "família", mas "abraço da minha filha")\n   - Inclua coisas simples (café da manhã, sol na janela)\n\n3. Para cada item, escreva uma frase:\n   - Por que sou grato?\n   - Como isso enriquece minha vida?\n\n4. Ação concreta:\n   - Escolha 3 pessoas da lista\n   - Envie mensagem de voz (não texto!) agradecendo\n   - Ou melhor: agradeça pessoalmente',
 'Jejum de Notificações',
 'Duração: Das 19h às 22h (3 horas)\n\nComo fazer:\n1. Às 19h, coloque o celular no modo "Não Perturbe"\n2. Desative TODAS as notificações (exceto chamadas de emergência)\n3. Deixe o celular em outro cômodo\n4. Use esse tempo para:\n   - Jantar em família com conversa\n   - Ler um livro físico\n   - Fazer uma caminhada\n   - Hobby manual (desenho, música, artesanato)\n\nCheck-in:\nApós as 22h, reflita:\n- Como me senti sem as interrupções?\n- O que fiz com o tempo extra?\n- Perdi algo realmente importante?',
 'Fotografia Consciente',
 'Desafio: Tire apenas 1 foto hoje\n- Escolha algo verdadeiramente significativo\n- Pense 1 minuto antes de fotografar\n- Não poste imediatamente\n- Guarde para apreciar offline\n\nReflexão noturna:\n"Hoje eu escolhi viver o momento em vez de documentá-lo"',
 100, 1),

('liberdade', 2, 'DOMÍNIO PRÓPRIO', 'Fortalecer o autocontrole sobre impulsos digitais',
 'Todo atleta que luta, exerce domínio próprio em todas as coisas - 1 Coríntios 9:25',
 'O domínio próprio é um fruto do Espírito. Não é sobre regras rígidas, mas sobre escolhas conscientes. Cada vez que você resiste ao impulso de verificar o celular, está fortalecendo seu "músculo" de autocontrole.',
 'Senhor, dá-me força para dominar meus impulsos, não ser dominado por eles. Que a tecnologia seja minha serva, não minha senhora. Ajuda-me a fazer escolhas que honrem a Ti e edifiquem minha vida. Amém.',
 'Mapeamento de Impulsos',
 'Parte 1: Consciência (10 min)\nConfigure um timer a cada hora (das 8h às 20h)\nQuando tocar, anote:\n- O que estava fazendo\n- Quantas vezes pegou o celular\n- Por quê? (tédio, ansiedade, hábito, necessidade real)\n- Sentimento antes e depois\n\nParte 2: Análise (10 min)\nAo final do dia, identifique:\n1. Horários críticos: Quando mais pego o celular?\n2. Gatilhos emocionais: Que sentimentos precedem o uso?\n3. Padrões: Uso mais em que situações?\n4. Apps ladrões: Quais apps consomem mais tempo?\n\nParte 3: Estratégia\nPara cada gatilho identificado, crie uma alternativa:\n- Tédio → Livro no bolso\n- Ansiedade → 3 respirações profundas\n- Espera → Observar pessoas, orar\n- Solidão → Ligar para alguém (não mensagem)',
 'Técnica Pomodoro Sagrada',
 '4 Ciclos de Foco Total:\n\nCiclo 1 - Trabalho/Estudo (25 min)\n- Celular em outra sala\n- Foco total em uma tarefa\n- Sem música ou distrações\n\nPausa (5 min)\n- Alongamento, água, olhar pela janela\n- SEM CELULAR\n\nCiclo 2 - Leitura Bíblica (25 min)\n- Bíblia física\n- Caderno para anotações\n- Meditação profunda\n\nCiclo 3 - Projeto Pessoal (25 min)\n- Algo criativo ou produtivo\n- Usar as mãos\n- Criar, não consumir\n\nCiclo 4 - Conexão Humana (25 min)\n- Conversa presencial\n- Ligação telefônica (voz)\n- Carta escrita à mão',
 'Limpeza Digital',
 '15 minutos para:\n1. Deletar 5 apps que não usa há 30 dias\n2. Sair de 3 grupos desnecessários\n3. Cancelar 3 inscrições de email\n4. Organizar tela inicial (só essenciais)\n5. Definir wallpaper calmante\n\nMantra do dia:\n"Eu controlo a tecnologia, ela não me controla"',
 100, 2),

('liberdade', 3, 'COMUNHÃO VERDADEIRA', 'Priorizar conexões reais sobre virtuais',
 'Melhor é serem dois do que um, pois têm melhor paga do seu trabalho - Eclesiastes 4:9',
 'Fomos criados para comunhão real, não virtual. Um abraço vale mais que mil emojis. Um olhar nos olhos transmite mais que mil mensagens. Hoje, vamos resgatar a arte perdida da presença.',
 'Senhor, ajuda-me a estar verdadeiramente presente com as pessoas. Que eu possa olhar nos olhos, ouvir com atenção e abraçar com carinho. Liberta-me da prisão da conexão superficial. Amém.',
 'Dia da Presença Plena',
 'Manhã: Café da Manhã Sagrado (15 min)\n- Mesa posta com carinho\n- Celulares em uma cesta longe\n- Cada pessoa compartilha:\n  - Uma gratidão\n  - Um desafio do dia\n  - Como podem ajudar um ao outro\n- Oração em conjunto\n- Abraço em cada pessoa\n\nTarde: Encontro Intencional (15 min)\nEscolha uma pessoa próxima:\n1. "Tenho 15 minutos só pra você, vamos conversar?"\n2. Sente-se frente a frente\n3. Faça perguntas profundas:\n   - "Como você realmente está?"\n   - "O que tem pesado em seu coração?"\n   - "Como posso te ajudar essa semana?"\n4. Escute sem interromper\n5. Ofereça ajuda específica\n6. Ore juntos',
 '5 Atos de Amor Real',
 'Complete todos:\n1. Carta à mão: Escreva para alguém distante\n2. Visita surpresa: Leve algo para um vizinho\n3. Ligação de voz: Para alguém que só recebe mensagens suas\n4. Ato de serviço: Faça algo por alguém sem que peçam\n5. Tempo de qualidade: 30 min com alguém, sem pressa\n\nRegra: Não documente nem poste sobre nenhum desses atos',
 'Jantar sem Telas',
 'Preparação:\n- Cozinhe algo especial (ou peça, mas com intenção)\n- Mesa arrumada, música ambiente suave\n- Velas ou iluminação aconchegante\n- Celulares em outro cômodo\n\nDurante o jantar:\n- Jogo: Cada um conta uma memória feliz\n- Sem pressa - mínimo 45 minutos\n- Sobremesa com conversa\n- Limpeza conjunta com música',
 100, 2),

('liberdade', 4, 'SÁBADO DIGITAL', 'Experimentar um descanso verdadeiro',
 'Lembra-te do dia de sábado, para o santificar - Êxodo 20:8',
 'O sábado é um presente de Deus - 24 horas para desconectar do mundo e reconectar com o Céu. Hoje, mesmo que não seja sábado, vamos praticar um "sábado digital" - um descanso sagrado das telas.',
 'Senhor do sábado, ensina-me a descansar em Ti. Que eu encontre paz não no scroll infinito, mas em Tua presença. Ajuda-me a guardar momentos sagrados em minha semana. Amém.',
 'Mini Sábado (6 horas)',
 'Preparação (Sexta à noite ou manhã cedo):\n1. Avise contatos importantes sobre seu "período offline"\n2. Configure resposta automática\n3. Prepare atividades analógicas:\n   - Livros físicos\n   - Material para hobbies\n   - Jogos de tabuleiro\n   - Instrumentos musicais\n4. Prepare comida antecipadamente\n\nPrograma do Mini Sábado (14h às 20h):\n\n14h - Cerimônia de Abertura\n- Desligue todos os dispositivos (não só silencioso)\n- Acenda uma vela (símbolo do tempo sagrado)\n- Oração de dedicação\n- Leitura de Salmo 23\n\n14h30 - Natureza\n- Caminhada no parque/jardim\n- Observar sem fotografar\n- Coletar elementos naturais (folhas, pedras)\n- Meditação ao ar livre\n\n16h - Criatividade\n- Desenho, pintura ou escrita\n- Música (tocar ou cantar)\n- Artesanato ou culinária\n- Jardinagem\n\n17h30 - Comunhão\n- Visita a alguém\n- Jogos em família\n- Histórias compartilhadas\n- Lanche especial juntos\n\n19h30 - Encerramento\n- Reflexão: O que aprendi?\n- Gratidão: Pelo que sou grato?\n- Compromisso: O que vou manter?\n- Oração final\n- Apagar a vela',
 'Redescobrindo Prazeres Simples',
 'Durante as 6 horas offline, experimente:\n1. Observação: 10 min só observando nuvens\n2. Tato: Andar descalço na grama\n3. Audição: Identificar 10 sons da natureza\n4. Olfato: Cheirar flores, temperos, ar fresco\n5. Paladar: Comer algo devagar, saboreando\n\nDescubra: 3 atividades prazerosas que não exigem telas',
 'Diário do Sábado Digital',
 'No fim do dia, escreva:\n- Como me senti nas primeiras 2 horas?\n- Que "coceira digital" senti?\n- O que fiz em vez de usar telas?\n- Que descobertas fiz sobre mim?\n- O que foi mais difícil?\n- O que foi surpreendentemente bom?\n- Vou repetir? Quando?',
 100, 3),

('liberdade', 5, 'MORDOMIA DO TEMPO', 'Tornar-se mordomo fiel do tempo dado por Deus',
 'Ensina-nos a contar os nossos dias, para que alcancemos coração sábio - Salmos 90:12',
 'Tempo é o único recurso verdadeiramente não renovável. Cada minuto gasto em scroll sem propósito é um minuto roubado de relacionamentos, crescimento e propósito. Hoje, vamos aprender a investir, não gastar, nosso tempo.',
 'Senhor, Tu és o dono do tempo. Ajuda-me a ser mordomo fiel das horas que me dás. Que eu invista meu tempo em coisas eternas, não em distrações passageiras. Amém.',
 'Auditoria Temporal Completa',
 'Parte 1: Realidade Atual (10 min)\nInstale um app de tracking por 1 dia OU anote manualmente:\n- Tempo em cada app\n- Tempo em cada atividade\n- Crie um gráfico pizza da sua dia\n\nChoque de Realidade:\n- Quanto tempo em redes sociais por semana?\n- Quantas horas isso dá por ano?\n- O que poderia ter feito com esse tempo?\n\nParte 2: Tempo Ideal (10 min)\nDesenhe seu dia perfeito:\n- 8h sono\n- X horas trabalho/estudo\n- X horas família\n- X horas crescimento pessoal\n- X horas lazer saudável\n- X horas serviço/ajuda outros\n- X horas com Deus\n\nCompare com a realidade. Onde está a discrepância?\n\nParte 3: Plano de Ação (10 min)\nPara cada hora mal gasta, defina substituição:\n- 1h Instagram → 1h leitura\n- 30min YouTube → 30min exercício\n- 1h jogos → 1h com família\n- 30min notícias → 30min oração/meditação',
 'Dia do Investimento',
 'Cada hora, faça algo que seja investimento, não gasto:\n\nManhã:\n- 30 min: Exercício (investir em saúde)\n- 30 min: Leitura/estudo (investir em mente)\n- 30 min: Organização (investir em produtividade)\n\nTarde:\n- 30 min: Skill nova (investir em habilidades)\n- 30 min: Relacionamento (investir em pessoas)\n- 30 min: Projeto pessoal (investir em sonhos)\n\nNoite:\n- 30 min: Família (investir em amor)\n- 30 min: Reflexão/diário (investir em autoconhecimento)\n- 30 min: Preparação amanhã (investir em futuro)\n\nRegra: Nada de consumo passivo (scroll, vídeos aleatórios, etc.)',
 'Criando Rituais Produtivos',
 'Crie 3 rituais para substituir momentos de tela:\n\nRitual Matinal (em vez de checar celular):\n1. Agradecer por 3 coisas\n2. Definir 3 prioridades\n3. Ler 1 página inspiracional\n4. Fazer 10 respirações profundas\n5. Tomar água\n\nRitual de Transição (chegando em casa):\n1. Trocar roupa\n2. 5 min de silêncio\n3. Abraçar família\n4. Perguntar sobre o dia\n5. Celular na gaveta\n\nRitual Noturno (em vez de scroll na cama):\n1. Preparar roupa de amanhã\n2. Escrever 3 vitórias do dia\n3. Ler 10 páginas\n4. Orar\n5. Dormir',
 100, 2),

('liberdade', 6, 'TESTEMUNHO DIGITAL', 'Usar tecnologia para abençoar, não impressionar',
 'Vós sois a luz do mundo; não se pode esconder uma cidade edificada sobre um monte - Mateus 5:14',
 'Sua presença online é um testemunho. Cada post, comentário e compartilhamento reflete seus valores. Hoje, vamos aprender a ser luz no mundo digital sem nos perder nele.',
 'Senhor, faz de mim um influenciador do bem. Que minhas palavras online edifiquem, não destruam. Que meu testemunho digital aponte para Ti, não para mim. Amém.',
 'Limpeza e Propósito Digital',
 'Parte 1: Auditoria de Presença (10 min)\nRevise seus últimos 20 posts/stories:\n- Quantos foram para edificar outros?\n- Quantos foram para autopromoção?\n- Quantos foram reativos/negativos?\n- Quantos agregaram valor real?\n- Que imagem de você eles passam?\n\nParte 2: Limpeza (10 min)\n1. Delete posts que:\n   - Não representam quem você é hoje\n   - Foram feitos por impulso/raiva\n   - Podem ferir alguém\n   - São apenas "ruído"\n\n2. Unfollow/mute:\n   - Contas que trazem comparação\n   - Conteúdo que gera ansiedade\n   - Páginas de fofoca/negatividade\n   - Influencers que promovem consumismo\n\n3. Follow/ative notificações:\n   - Conteúdo inspirador\n   - Páginas educativas\n   - Pessoas que admira de verdade\n   - Ministérios/causas importantes\n\nParte 3: Missão Digital (5 min)\nEscreva sua missão para presença online:\n"Vou usar minhas redes para..."\n- Encorajar pessoas em dificuldade\n- Compartilhar aprendizados úteis\n- Celebrar outros, não só a mim\n- Ser ponte, não muro\n- Espalhar esperança',
 '7 Atos de Luz Digital',
 '1. Comentário edificante: Em 3 posts de amigos (específico, não genérico)\n2. Mensagem de encorajamento: Para alguém que está quieto há tempo\n3. Compartilhar o bem: Post de alguém que fez algo bom (dar crédito)\n4. Conteúdo útil: Compartilhe algo que realmente ajude pessoas\n5. Reconhecimento público: Agradeça alguém publicamente\n6. Conserto: Peça desculpas se feriu alguém online\n7. Silêncio sábio: Não responda aquela provocação\n\nRegra: Faça tudo sem esperar retorno (likes, comentários)',
 'Jejum de Vanidade',
 '24 horas sem:\n- Verificar quantos likes recebeu\n- Postar selfies\n- Stories do que está comendo/fazendo\n- Compartilhar conquistas pessoais\n- Verificar quem viu seus stories\n\nEm vez disso:\n- Celebre conquistas dos outros\n- Compartilhe conteúdo útil (não seu)\n- Envie mensagens privadas de apoio\n- Ore por cada pessoa que vier à mente',
 100, 2),

('liberdade', 7, 'LIBERDADE COMPLETA', 'Celebrar a conquista e planejar a manutenção',
 'Se o Filho vos libertar, verdadeiramente sereis livres - João 8:36',
 'Você chegou ao fim da jornada - mas não ao fim da liberdade. Hoje celebramos sua vitória e planejamos como manter essa liberdade conquistada. A liberdade não é um destino, é um estilo de vida.',
 'Senhor, obrigado pela liberdade conquistada. Ajuda-me a nunca mais voltar à prisão digital. Que eu seja testemunho vivo de que a liberdade é possível. Amém.',
 'Cerimônia de Formatura Digital',
 'Preparação Especial:\n1. Vista sua melhor roupa\n2. Prepare um lanche especial\n3. Convide família/amigos\n4. Ambiente festivo mas reflexivo\n\nPrograma da Cerimônia (60 min):\n\n1. Abertura com Gratidão (10 min)\n   - Oração de agradecimento\n   - Lista de 7 conquistas dos últimos dias\n   - Compartilhe com presentes\n\n2. Queima dos Contratos Antigos (10 min)\n   - Escreva em papel: "Eu era escravo de..."\n   - Liste todos os vícios digitais\n   - Queime simbolicamente\n   - "Isso não me define mais"\n\n3. Assinatura da Declaração de Independência (10 min)\n   - "Eu, _____, declaro minha independência digital"\n   - "Prometo usar tecnologia como ferramenta, não droga"\n   - "Comprometo-me a priorizar pessoas reais"\n   - Assine e faça testemunhas assinarem\n\n4. Certificação das Conquistas (10 min)\n   - Liste habilidades desenvolvidas\n   - Relacionamentos restaurados\n   - Tempo recuperado\n   - Paz interior conquistada\n\n5. Plano de Manutenção (10 min)\n   - Defina check-ups mensais\n   - Escolha accountability partner\n   - Estabeleça sinais de alerta\n   - Crie sistema de recompensas\n\n6. Brinde Final (10 min)\n   - "À liberdade conquistada!"\n   - Foto para marcar o momento\n   - Abraços e celebração\n   - Compromisso de apoio mútuo',
 'Passando o Testemunho',
 'Hoje você vira mentor:\n\n1. Identifique 3 pessoas que sofrem com dependência digital\n2. Compartilhe sua jornada (sem pregar)\n3. Ofereça apoio se quiserem tentar\n4. Crie grupo de apoio local\n5. Seja exemplo vivo de liberdade\n\nMissão Especial:\n- Escreva carta para "você de 7 dias atrás"\n- Conte o que aprendeu\n- Incentive quem está começando\n- Poste (se quiser) testemunho de vitória',
 'Protocolo de Liberdade Perpétua',
 'Sistema de Manutenção Criado:\n\n🛡️ PROTEÇÕES ATIVAS:\n- Apps de controle instalados\n- Horários definidos para redes\n- Celular fora do quarto\n- Rituais matinais/noturnos\n- Rede de apoio ativa\n\n⚡ SINAIS DE ALERTA:\n- Mais de 3h de tela/dia\n- Primeiro pensamento ao acordar\n- Irritação quando interrompido\n- Negligenciar pessoas próximas\n- Perda de sono por causa de telas\n\n🚨 PROTOCOLO DE EMERGÊNCIA:\n- Dia completo offline\n- Conversa com accountability partner\n- Revisar motivações originais\n- Ajustar estratégias\n- Celebrar pequenas vitórias\n\n🎯 METAS FUTURAS:\n- Trilha Equilíbrio ou Renovação?\n- Liderar grupo de apoio?\n- Desenvolver novo hobby?\n- Fortalecer relacionamentos?\n- Servir mais a Deus e outros?',
 150, 1);

-- Adicionar atividades específicas para cada dia da Trilha Liberdade
INSERT INTO track_daily_activities (daily_content_id, activity_title, activity_description, points_value, sort_order, is_required)
SELECT 
  tdc.id,
  activity.title,
  activity.description,
  activity.points,
  activity.sort_order,
  activity.required
FROM track_daily_content tdc
CROSS JOIN (
  VALUES 
    ('Devocional matinal completo', 'Leia verso, reflexão e faça oração', 20, 1, true),
    ('Lista de gratidão criada (20 itens)', 'Complete os 4 quadrantes', 30, 2, true),
    ('3 agradecimentos enviados/feitos', 'Agradeça 3 pessoas da sua lista', 20, 3, true),
    ('3 horas sem notificações', 'Das 19h às 22h offline', 20, 4, true),
    ('1 foto consciente (ou nenhuma)', 'Fotografe com intenção', 10, 5, false)
) AS activity(title, description, points, sort_order, required)
WHERE tdc.track_slug = 'liberdade' AND tdc.day_number = 1;

INSERT INTO track_daily_activities (daily_content_id, activity_title, activity_description, points_value, sort_order, is_required)
SELECT 
  tdc.id,
  activity.title,
  activity.description,
  activity.points,
  activity.sort_order,
  activity.required
FROM track_daily_content tdc
CROSS JOIN (
  VALUES 
    ('Mapeamento de impulsos completo', 'Análise de gatilhos e padrões', 25, 1, true),
    ('4 ciclos Pomodoro realizados', 'Foco profundo sem distrações', 30, 2, true),
    ('Limpeza digital feita', 'Apps, grupos e organização', 20, 3, true),
    ('Celular longe durante refeições', 'Presença nas 3 refeições', 15, 4, true),
    ('Primeira e última hora sem telas', 'Acordar e dormir sem celular', 10, 5, true)
) AS activity(title, description, points, sort_order, required)
WHERE tdc.track_slug = 'liberdade' AND tdc.day_number = 2;

INSERT INTO track_daily_activities (daily_content_id, activity_title, activity_description, points_value, sort_order, is_required)
SELECT 
  tdc.id,
  activity.title,
  activity.description,
  activity.points,
  activity.sort_order,
  activity.required
FROM track_daily_content tdc
CROSS JOIN (
  VALUES 
    ('3 refeições sem celular', 'Presença total durante as refeições', 20, 1, true),
    ('5 atos de amor completados', 'Demonstrações concretas de amor', 30, 2, true),
    ('1 hora de presença plena', 'Tempo focado em alguém', 20, 3, true),
    ('Carta escrita e enviada', 'Comunicação analógica e carinhosa', 15, 4, true),
    ('Noite em família sem telas', 'Conexão real no fim do dia', 15, 5, true)
) AS activity(title, description, points, sort_order, required)
WHERE tdc.track_slug = 'liberdade' AND tdc.day_number = 3;

INSERT INTO track_daily_activities (daily_content_id, activity_title, activity_description, points_value, sort_order, is_required)
SELECT 
  tdc.id,
  activity.title,
  activity.description,
  activity.points,
  activity.sort_order,
  activity.required
FROM track_daily_content tdc
CROSS JOIN (
  VALUES 
    ('6 horas completamente offline', 'Desconexão total das 14h às 20h', 40, 1, true),
    ('3 atividades analógicas novas', 'Experimente coisas sem tela', 20, 2, true),
    ('Tempo em natureza (mínimo 1 hora)', 'Conexão com a criação', 15, 3, true),
    ('Conexão presencial significativa', 'Tempo real com pessoas', 15, 4, true),
    ('Diário reflexivo preenchido', 'Registre suas descobertas', 10, 5, true)
) AS activity(title, description, points, sort_order, required)
WHERE tdc.track_slug = 'liberdade' AND tdc.day_number = 4;

INSERT INTO track_daily_activities (daily_content_id, activity_title, activity_description, points_value, sort_order, is_required)
SELECT 
  tdc.id,
  activity.title,
  activity.description,
  activity.points,
  activity.sort_order,
  activity.required
FROM track_daily_content tdc
CROSS JOIN (
  VALUES 
    ('Auditoria temporal completa', 'Análise detalhada do uso do tempo', 25, 1, true),
    ('4,5 horas de investimento ativo', 'Atividades que agregam valor', 30, 2, true),
    ('3 rituais criados e testados', 'Substitutos para momentos de tela', 20, 3, true),
    ('Zero tempo em scroll sem propósito', 'Consumo digital consciente', 15, 4, true),
    ('Planejamento da semana feito', 'Organização do tempo futuro', 10, 5, true)
) AS activity(title, description, points, sort_order, required)
WHERE tdc.track_slug = 'liberdade' AND tdc.day_number = 5;

INSERT INTO track_daily_activities (daily_content_id, activity_title, activity_description, points_value, sort_order, is_required)
SELECT 
  tdc.id,
  activity.title,
  activity.description,
  activity.points,
  activity.sort_order,
  activity.required
FROM track_daily_content tdc
CROSS JOIN (
  VALUES 
    ('Auditoria e limpeza digital', 'Review completo da presença online', 25, 1, true),
    ('7 atos de luz completados', 'Impacto positivo nas redes', 30, 2, true),
    ('24h sem vanidade digital', 'Jejum de autopromoção', 20, 3, true),
    ('Missão digital escrita', 'Definir propósito para redes', 15, 4, true),
    ('Pelo menos 3 pessoas edificadas', 'Usar redes para o bem', 10, 5, true)
) AS activity(title, description, points, sort_order, required)
WHERE tdc.track_slug = 'liberdade' AND tdc.day_number = 6;

INSERT INTO track_daily_activities (daily_content_id, activity_title, activity_description, points_value, sort_order, is_required)
SELECT 
  tdc.id,
  activity.title,
  activity.description,
  activity.points,
  activity.sort_order,
  activity.required
FROM track_daily_content tdc
CROSS JOIN (
  VALUES 
    ('Cerimônia de formatura completa', 'Celebração estruturada da conquista', 40, 1, true),
    ('Declaração de independência assinada', 'Compromisso formal com liberdade', 30, 2, true),
    ('3 pessoas impactadas positivamente', 'Compartilhar testemunho e esperança', 25, 3, true),
    ('Sistema de manutenção criado', 'Protocolo para manter liberdade', 30, 4, true),
    ('Planos futuros definidos', 'Próximos passos na jornada', 25, 5, true)
) AS activity(title, description, points, sort_order, required)
WHERE tdc.track_slug = 'liberdade' AND tdc.day_number = 7;