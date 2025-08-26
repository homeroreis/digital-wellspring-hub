-- Migrar conteúdo da Trilha Renovação (primeiros 10 dias da fase QUEBRANTAMENTO)
INSERT INTO track_daily_content (
  track_slug, day_number, title, objective, 
  devotional_verse, devotional_reflection, devotional_prayer,
  main_activity_title, main_activity_content, 
  main_challenge_title, main_challenge_content,
  bonus_activity_title, bonus_activity_content,
  max_points, difficulty_level
) VALUES 
('renovacao', 1, 'RENDIÇÃO TOTAL', 'Admitir completa impotência e entregar-se ao processo',
 'Miserável homem que eu sou! Quem me livrará do corpo desta morte? - Romanos 7:24',
 'Paulo, o grande apóstolo, admitiu sua miséria. Você está no fundo do poço digital. Seu celular se tornou seu deus, seu refúgio, sua droga. Você perdeu empregos, amizades, momentos preciosos. Talvez seu casamento esteja por um fio. Seus filhos não reconhecem seu rosto sem a luz da tela. Você está doente. Admita. Só quando reconhecemos nossa total impotência é que o poder de Deus pode agir.',
 'Deus, eu não consigo mais. Estou completamente vencido. Sou escravo. Tentei parar sozinho e falhei. Preciso de Ti. Preciso de um milagre. Tomas o controle completo. Eu me rendo. Salva-me de mim mesmo. Em nome de Jesus, amém.',
 'Inventário Completo de Destruição',
 'Parte 1: A Verdade Nua e Crua (20 min)\n\nResponda com TOTAL honestidade:\n- Horas de tela ontem: _______ (seja preciso)\n- Vezes que pegou o celular: _______\n- Horas de sono perdidas: _______\n- Última vez que ficou 1h sem celular: _______\n- Mentiras contadas sobre uso: _______\n- Dinheiro gasto em apps/jogos: R$ _______\n- Compromissos perdidos: _______\n- Pessoas magoadas: _______\n\nCálculo do Custo:\n- Se continuar assim, em 5 anos terei perdido _____ anos em telas\n- Meus filhos terão crescido _____ anos sem minha presença real\n- Meu casamento/relacionamentos: _______\n- Minha saúde: _______\n- Minha carreira: _______\n\nParte 2: Carta de Rendição (20 min)\n\nEscreva carta para o celular:\n\n"Querido Celular,\nVocê me dominou completamente. Eu perdi...\n[Liste tudo que perdeu]\n\nVocê prometeu conexão, mas me deu solidão...\n[Liste as mentiras que acreditou]\n\nHoje eu declaro: CHEGA!\n[Declare sua decisão]\n\nAssinado: _______ Data: _______"\n\nParte 3: Ritual de Entrega (20 min)\n\n1. Entrega Física:\n   - Pegue seu celular\n   - Segure com as duas mãos\n   - Ore: "Deus, este aparelho me dominou. Eu o entrego a Ti."\n   - Entregue fisicamente para seu apoiador principal\n   - Combine: "Você vai controlar meu acesso por 10 dias"\n\n2. Entrega Simbólica:\n   - Escreva seus apps mais viciantes em papéis\n   - Queime ou rasgue um por um\n   - Para cada um: "Eu renuncio ao poder que ___ tinha sobre mim"\n\n3. Entrega Pública:\n   - Poste (última vez): "Iniciando detox digital radical de 40 dias. Não estarei disponível aqui. Emergências: [telefone de contato]"\n   - Delete apps de redes sociais\n   - Accountability partner muda suas senhas',
 'Primeiro Dia no Deserto',
 'Regras das Primeiras 24h:\n- Celular fica com outra pessoa\n- Você pode fazer 1 ligação de 5 min (supervisionada)\n- Sem TV, computador, tablet\n- Sem notícias, redes sociais, YouTube\n- Apenas: Bíblia física, diário, livros\n\nO que fazer com o tempo:\n- 6h: Acordar e orar 30 min\n- 7h: Exercício físico 30 min\n- 8h: Café + planejamento do dia\n- 9h-12h: Trabalho/tarefas pendentes\n- 12h: Almoço + caminhada\n- 14h-17h: Projetos manuais/limpeza/organização\n- 17h: Conectar com família/amigos (presencial)\n- 19h: Jantar sem pressa\n- 20h: Leitura/hobbies\n- 21h: Diário + oração\n- 22h: Dormir',
 'Kit Sobrevivência Dia 1',
 'Prepare esta noite:\n- 3 refeições para amanhã\n- 5 atividades de 30 min prontas\n- Lista de pessoas para visitar\n- Roupa de exercício separada\n- Livros/revistas ao alcance\n- Diário aberto na mesa\n- Versículos colados na parede\n- Foto da família na carteira (não digital)',
 200, 5),

('renovacao', 2, 'ENFRENTANDO A ABSTINÊNCIA', 'Sobreviver aos sintomas físicos e mentais',
 'A minha graça te basta, pois o meu poder se aperfeiçoa na fraqueza - 2 Coríntios 12:9',
 'Hoje seu corpo e mente vão gritar. Ansiedade, irritabilidade, até sintomas físicos. É a abstinência digital - prova de quão dependente você estava. Mas Deus promete: Sua graça é suficiente. Quando você estiver mais fraco, Ele será mais forte.',
 'Senhor, meu corpo está em guerra. Minha mente grita pelo celular. Mas eu escolho depender de Ti. Seja minha força quando eu não tiver nenhuma. Passa comigo por este vale. Amém.',
 'Protocolo de Gerenciamento de Crise',
 'Parte 1: Monitoramento de Sintomas (20 min)\n\nA cada 2 horas, registre:\n\n| Hora | Sintoma | Intensidade (1-10) | O que fiz | Resultado |\n|------|---------|-------------------|-----------|-------------------|\n| 8h | Ansiedade | 8 | Respiração + caminhada | Diminuiu para 5 |\n| 10h | Mãos tremendo | 6 | Exercício físico | Melhorou |\n\nSintomas Comuns:\n- [ ] Ansiedade extrema\n- [ ] Irritabilidade/raiva\n- [ ] Mãos inquietas\n- [ ] "Vibração fantasma"\n- [ ] Dificuldade concentração\n- [ ] Tédio insuportável\n- [ ] Tristeza/vazio\n- [ ] Insônia\n- [ ] Dor de cabeça\n- [ ] Suor frio\n\nParte 2: Técnicas de Sobrevivência (20 min)\n\nPara Crise de Ansiedade:\n1. Técnica 5-4-3-2-1:\n   - 5 coisas que vejo\n   - 4 que posso tocar\n   - 3 que ouço\n   - 2 que cheiro\n   - 1 que posso saborear\n\n2. Respiração de Combate:\n   - Inspire 4 segundos\n   - Segure 4 segundos\n   - Expire 4 segundos\n   - Segure 4 segundos\n   - Repita 10x\n\n3. Âncora Física:\n   - Gelo na nuca\n   - Banho frio\n   - 50 polichinelos\n   - Aperte stress ball\n\nPara Tédio Extremo:\n- Lista de 20 tarefas de 5 minutos\n- Mude de ambiente a cada hora\n- Alterne: físico → mental → social → espiritual\n\nParte 3: Protocolo S.O.S (20 min)\n\nQuando sentir que vai ceder:\n\nS - STOP (PARE):\n- Pare tudo\n- Saia do ambiente\n- Respire 10x\n\nO - OBSERVE (OBSERVE):\n- O que estou sentindo?\n- O que meu corpo precisa?\n- Que mentira estou acreditando?\n\nS - SUPPORT (SUPORTE):\n- Ligue para apoiador\n- Ore em voz alta\n- Vá para lugar público\n- Não fique sozinho\n\nCrie Cartão de Emergência:\n🚨 EMERGÊNCIA DIGITAL 🚨\n1. RESPIRE 10X\n2. BEBA ÁGUA\n3. SAIA DO AMBIENTE\n4. LIGUE: [APOIADOR] - XXXXXX\n5. LEMBRE: "ISSO VAI PASSAR"\n6. VOCÊ JÁ CONSEGUIU _____ HORAS\n7. VOCÊ É MAIS FORTE QUE PENSA',
 'Sobrevivência Minuto a Minuto',
 'Método dos Micro-Compromissos:\n- "Vou resistir pelos próximos 5 minutos"\n- Conseguiu? "Mais 5 minutos"\n- Continue até completar 1 hora\n- Celebre cada hora vencida\n- Meta: 16 horas acordado sem ceder\n\nRecompensas a cada 2h resistidas:\n- 2h: Lanche favorito\n- 4h: Episódio de série (TV, não celular)\n- 6h: Ligação para amigo\n- 8h: Presente pequeno para si\n- 10h: Jantar especial\n- 12h: Você é guerreiro!',
 'Diário de Guerra',
 'Modelo para hoje:\nDIÁRIO DE GUERRA - DIA 2\n\nHora de acordar: _____\nPior momento: _____\nComo sobrevivi: _____\n\nBATALHAS:\n[ ] Manhã - Venci/Perdi\n[ ] Tarde - Venci/Perdi  \n[ ] Noite - Venci/Perdi\n\nSintoma mais forte: _____\nO que funcionou: _____\nO que não funcionou: _____\n\nGratidão: Sobrevivi ao dia 2!\nAmanhã vou: _____\n\nAssinatura do Guerreiro: _____',
 200, 5),

('renovacao', 3, 'QUEBRANDO IDENTIFICAÇÃO', 'Separar sua identidade da dependência',
 'Já estou crucificado com Cristo; e vivo, não mais eu, mas Cristo vive em mim - Gálatas 2:20',
 'Você não É um viciado. Você ESTÁ com comportamento viciante. Há diferença crucial. Hoje vamos separar quem você é do que você faz. Sua identidade está em Cristo, não no celular.',
 'Senhor, ajuda-me a ver quem eu realmente sou em Ti. Quebra as mentiras que acredito sobre mim mesmo. Mostra-me minha verdadeira identidade como filho/filha Teu. Amém.',
 'Reconstrução de Identidade',
 'Parte 1: Desprogramação Mental (20 min)\n\nMentiras que Acreditei:\n- "Eu SOU viciado" → "Eu ESTOU em recuperação"\n- "Não consigo viver sem" → "Estou aprendendo a viver livre"\n- "Sempre serei assim" → "Estou em transformação"\n- "Sou fraco" → "Estou ficando mais forte"\n- "É impossível" → "É difícil, mas possível"\n\nEscreva 10x:\n"Eu não sou meus comportamentos"\n"Eu sou filho(a) de Deus"\n"Eu sou mais que vencedor"\n"Eu posso todas as coisas em Cristo"\n\nParte 2: Arqueologia do Eu Real (20 min)\n\nQuem eu era antes do celular dominar?\n- Meus sonhos eram: _____\n- Eu gostava de: _____\n- As pessoas diziam que eu era: _____\n- Meus talentos incluíam: _____\n- Eu me orgulhava de: _____\n\nQuem Deus diz que eu sou?\n- Filho amado (João 1:12)\n- Nova criatura (2 Cor 5:17)\n- Mais que vencedor (Rom 8:37)\n- Templo do Espírito (1 Cor 6:19)\n- Obra-prima de Deus (Ef 2:10)\n\nQuem eu escolho ser hoje?\n- Alguém que _____\n- Que valoriza _____\n- Que prioriza _____\n- Que serve _____\n- Que ama _____\n\nParte 3: Decreto de Nova Identidade (20 min)\n\nEscreva e assine:\n\n"DECRETO DE NOVA IDENTIDADE\n\nEu, _______, declaro que:\n\n❌ NÃO SOU MAIS:\n- Escravo do celular\n- Dependente de aprovação virtual\n- Prisioneiro da dopamina\n- Vício sem controle\n- Vítima das circunstâncias\n\n✅ EU SOU:\n- Livre em Cristo\n- Controlador da tecnologia\n- Presente nos relacionamentos\n- Dono do meu tempo\n- Testemunha de transformação\n\nEsta é minha nova identidade.\nEsta é quem eu escolho ser.\nEsta é a verdade sobre mim.\n\nAssinado: _______ Data: _______\nTestemunha: _______"',
 'Renascimento Simbólico',
 'Cerimônia de Morte e Ressurreição:\n\n1. Morte do Velho Eu (10 min):\n   - Escreva em papel: "Aqui jaz [seu nome], escravo digital"\n   - Liste todos os vícios e comportamentos ruins\n   - Rasgue e enterre no jardim (ou queime)\n   - Declare: "Este eu está morto"\n\n2. Renascimento (10 min):\n   - Vista roupa limpa e nova\n   - Olhe-se no espelho\n   - Declare: "Eu nasci de novo"\n   - Apresente-se: "Meu nome é _____ e eu sou livre"\n\n3. Primeira Ação do Novo Eu (10 min):\n   - Faça algo que o velho você nunca faria\n   - Ligue para alguém que negligenciou\n   - Escreva carta de agradecimento\n   - Ore por seus inimigos\n   - Declare: "Esta é a prova de que mudei"',
 'Fotografia da Transformação',
 'Crie um marco visual:\n\n1. Foto "Antes" (simbólica):\n   - Pegue foto antiga sua usando celular obsessivamente\n   - Ou tire foto representando dependência\n   - Escreva atrás: "Quem eu era"\n\n2. Foto "Durante":\n   - Tire foto hoje (sem celular na mão)\n   - Sorrindo, olhando para frente\n   - Escreva atrás: "Dia 3 - Renascendo"\n\n3. Espaço "Depois":\n   - Deixe espaço para foto no dia 40\n   - Escreva: "Quem eu me tornei"\n\n4. Monte um quadro:\n   - Cole as fotos\n   - Adicione versículo: "Se alguém está em Cristo, nova criatura é"\n   - Coloque na parede como lembrete',
 200, 5);

-- Adicionar atividades para os primeiros dias da Trilha Renovação
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
    ('Inventário completo de destruição', 'Análise honesta de todos os danos causados', 50, 1, true),
    ('Carta de rendição escrita', 'Admissão formal da derrota e pedido de ajuda', 40, 2, true),
    ('Ritual de entrega física', 'Entregar dispositivos para accountability partner', 40, 3, true),
    ('24 horas sem dispositivos', 'Primeiro dia completo de detox', 50, 4, true),
    ('Plano de emergência criado', 'Sistema de apoio e protocolo de crise', 20, 5, true)
) AS activity(title, description, points, sort_order, required)
WHERE tdc.track_slug = 'renovacao' AND tdc.day_number = 1;

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
    ('Monitoramento de sintomas completo', 'Registro detalhado de todos os sintomas', 40, 1, true),
    ('Técnicas de sobrevivência aplicadas', 'Uso de pelo menos 3 técnicas diferentes', 40, 2, true),
    ('Protocolo SOS testado', 'Ativação do sistema de apoio', 30, 3, true),
    ('16 horas sem ceder', 'Resistir completamente por um dia inteiro', 60, 4, true),
    ('Diário de guerra preenchido', 'Documentação detalhada da luta', 30, 5, true)
) AS activity(title, description, points, sort_order, required)
WHERE tdc.track_slug = 'renovacao' AND tdc.day_number = 2;

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
    ('Desprogramação mental completa', 'Quebrar todas as crenças limitantes', 40, 1, true),
    ('Arqueologia do eu real', 'Redescobrir identidade anterior à dependência', 40, 2, true),
    ('Decreto de nova identidade assinado', 'Compromisso formal com nova versão', 50, 3, true),
    ('Cerimônia de renascimento', 'Ritual simbólico de morte e ressurreição', 40, 4, true),
    ('Marco fotográfico criado', 'Documentação visual da transformação', 30, 5, true)
) AS activity(title, description, points, sort_order, required)
WHERE tdc.track_slug = 'renovacao' AND tdc.day_number = 3;