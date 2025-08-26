-- Inserir atividades específicas para cada dia da trilha equilíbrio na tabela track_daily_activities

-- Primeiro, vamos buscar os IDs de cada day content criado para associar as atividades
-- Para cada dia, criar as 4 atividades principais: Devocional, Atividade Principal, Desafio, Bônus

-- DIA 1 - DESPERTAR PARA A REALIDADE
WITH day1_content AS (
    SELECT id FROM track_daily_content 
    WHERE track_slug = 'equilibrio' AND day_number = 1
)
INSERT INTO public.track_daily_activities (daily_content_id, activity_title, activity_description, points_value, sort_order, is_required)
SELECT 
    day1_content.id,
    'Devocional Matinal',
    'Leia versículo, reflexão e faça oração sobre reconhecer a dependência digital',
    30,
    1,
    true
FROM day1_content
UNION ALL
SELECT 
    day1_content.id,
    'Diagnóstico Brutal e Honesto',
    'Complete o teste de realidade, inventário de perdas e foto do momento',
    40,
    2,
    true
FROM day1_content
UNION ALL
SELECT 
    day1_content.id,
    'Confissão e Compromisso Público',
    'Confessar para 3 pessoas e estabelecer accountability',
    30,
    3,
    true
FROM day1_content
UNION ALL
SELECT 
    day1_content.id,
    'Kit de Emergência Anti-Ansiedade',
    'Aprenda e pratique técnicas para momentos de ansiedade digital',
    20,
    4,
    false
FROM day1_content;

-- DIA 2 - IDENTIFICANDO GATILHOS
WITH day2_content AS (
    SELECT id FROM track_daily_content 
    WHERE track_slug = 'equilibrio' AND day_number = 2
)
INSERT INTO public.track_daily_activities (daily_content_id, activity_title, activity_description, points_value, sort_order, is_required)
SELECT 
    day2_content.id,
    'Devocional Matinal',
    'Reflexão sobre vigiar e orar para não entrar em tentação',
    30,
    1,
    true
FROM day2_content
UNION ALL
SELECT 
    day2_content.id,
    'Mapeamento de Gatilhos',
    'Mantenha diário de gatilhos durante todo o dia e analise padrões',
    40,
    2,
    true
FROM day2_content
UNION ALL
SELECT 
    day2_content.id,
    'Quebra de Padrão Radical',
    'Sem celular ao acordar, no banheiro e antes de dormir',
    30,
    3,
    true
FROM day2_content
UNION ALL
SELECT 
    day2_content.id,
    'Caixa de Distração Física',
    'Monte kit físico com alternativas para momentos de fissura',
    20,
    4,
    false
FROM day2_content;

-- DIA 3 - COMPREENDENDO O CICLO VICIOSO
WITH day3_content AS (
    SELECT id FROM track_daily_content 
    WHERE track_slug = 'equilibrio' AND day_number = 3
)
INSERT INTO public.track_daily_activities (daily_content_id, activity_title, activity_description, points_value, sort_order, is_required)
SELECT 
    day3_content.id,
    'Devocional Matinal',
    'Reflexão sobre a luta interna e renovação da mente',
    30,
    1,
    true
FROM day3_content
UNION ALL
SELECT 
    day3_content.id,
    'Quebrando o Ciclo da Dopamina',
    'Aprenda e pratique a técnica dos 4 Ps durante o dia',
    40,
    2,
    true
FROM day3_content
UNION ALL
SELECT 
    day3_content.id,
    'Dopamina Natural Challenge',
    'Substitua dopamina artificial por 4 fontes naturais',
    30,
    3,
    true
FROM day3_content
UNION ALL
SELECT 
    day3_content.id,
    'Diário de Vitórias',
    'Registre cada resistência e vitória do dia',
    20,
    4,
    false
FROM day3_content;

-- DIA 4 - QUEBRANDO PADRÕES AUTOMÁTICOS
WITH day4_content AS (
    SELECT id FROM track_daily_content 
    WHERE track_slug = 'equilibrio' AND day_number = 4
)
INSERT INTO public.track_daily_activities (daily_content_id, activity_title, activity_description, points_value, sort_order, is_required)
SELECT 
    day4_content.id,
    'Devocional Matinal',
    'Oração pela renovação da mente e quebra de padrões automáticos',
    30,
    1,
    true
FROM day4_content
UNION ALL
SELECT 
    day4_content.id,
    'Criando Fricção Intencional',
    'Implemente barreiras físicas, mentais e torne apps difíceis de acessar',
    40,
    2,
    true
FROM day4_content
UNION ALL
SELECT 
    day4_content.id,
    'Dia do Caminho Difícil',
    'Siga todas as regras de dificuldade para uso consciente',
    30,
    3,
    true
FROM day4_content
UNION ALL
SELECT 
    day4_content.id,
    'Ritual de Uso Consciente',
    'Implemente ritual de 6 passos antes de cada uso do celular',
    20,
    4,
    false
FROM day4_content;

-- DIA 5 - FORTALECENDO A VONTADE
WITH day5_content AS (
    SELECT id FROM track_daily_content 
    WHERE track_slug = 'equilibrio' AND day_number = 5
)
INSERT INTO public.track_daily_activities (daily_content_id, activity_title, activity_description, points_value, sort_order, is_required)
SELECT 
    day5_content.id,
    'Devocional Matinal',
    'Oração por disciplina e fortalecimento da vontade',
    30,
    1,
    true
FROM day5_content
UNION ALL
SELECT 
    day5_content.id,
    'Academia Mental - Resistência Progressiva',
    'Complete exercícios progressivos de resistência e foco sustentado',
    40,
    2,
    true
FROM day5_content
UNION ALL
SELECT 
    day5_content.id,
    'Maratona de Resistência',
    'Das 14h às 20h: celular no avião, verificar só 1x/hora',
    30,
    3,
    true
FROM day5_content
UNION ALL
SELECT 
    day5_content.id,
    'Desconforto Voluntário',
    'Pratique domínio através de exercícios desconfortáveis',
    20,
    4,
    false
FROM day5_content;