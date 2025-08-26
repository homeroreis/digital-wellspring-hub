-- Criar sistema de personalização baseado em onboarding e questionário
CREATE TABLE IF NOT EXISTS content_personalization_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  track_slug TEXT NOT NULL,
  day_number INTEGER NOT NULL,
  rule_type TEXT NOT NULL CHECK (rule_type IN ('score_based', 'area_based', 'preference_based')),
  condition_data JSONB NOT NULL,
  personalized_content JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE content_personalization_rules ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view personalization rules" 
ON content_personalization_rules 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can manage personalization rules" 
ON content_personalization_rules 
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Inserir regras de personalização para diferentes áreas afetadas
INSERT INTO content_personalization_rules (track_slug, day_number, rule_type, condition_data, personalized_content) VALUES

-- Personalização para área RELAÇÕES mais afetada
('liberdade', 1, 'area_based', 
 '{"most_affected_area": "relacoes"}',
 '{"bonus_activity_title": "Reconexão Familiar", "bonus_activity_content": "Atividade especial para relações:\n1. Identifique 3 relacionamentos prejudicados pelo uso excessivo\n2. Escreva carta de desculpas para cada um\n3. Proponha atividade presencial com cada pessoa\n4. Estabeleça \"horário sagrado da família\" - sem dispositivos\n5. Crie ritual de reconexão: 10 min de conversa real por dia"}'),

('liberdade', 2, 'area_based',
 '{"most_affected_area": "relacoes"}', 
 '{"main_activity_content": "Mapeamento Relacional + Impulsos:\nAlém do mapeamento normal de impulsos, identifique:\n- Quantas vezes uso celular durante conversas?\n- Quando mais ignoro pessoas próximas?\n- Que conflitos o celular já causou?\n- Como posso usar gatilhos para CONECTAR em vez de DESCONECTAR?\n\nEstrategias relacionais:\n- Tédio → Ligar para alguém (não mensagem)\n- Ansiedade → Abraçar alguém próximo\n- Solidão → Sair de casa, ir onde há pessoas\n- Raiva → Conversar presencialmente sobre o problema"}'),

-- Personalização para área COMPORTAMENTO mais afetada  
('liberdade', 1, 'area_based',
 '{"most_affected_area": "comportamento"}',
 '{"bonus_activity_title": "Quebra de Padrões", "bonus_activity_content": "Atividade especial para comportamentos:\n1. Liste 5 comportamentos automáticos com celular\n2. Para cada um, crie uma interrupção física:\n   - Elástico no pulso para estalar\n   - Mudar celular de lugar a cada hora\n   - Colocar foto da família na capa\n   - Timer a cada 30 min: \"Preciso mesmo?\"\n3. Substitua cada comportamento por ação positiva\n4. Recompense-se por cada padrão quebrado"}'),

('liberdade', 2, 'area_based',
 '{"most_affected_area": "comportamento"}',
 '{"main_challenge_title": "Quebra de Hábitos Extrema", "main_challenge_content": "Versão intensificada para dependência comportamental:\n\n6 Ciclos Anti-Hábito (não 4):\n- Ciclo 1: Trabalho com celular em OUTRA SALA\n- Ciclo 2: Leitura bíblica + anotações MANUAIS\n- Ciclo 3: Exercício físico INTENSO (quebrar automatismos)\n- Ciclo 4: Projeto criativo MANUAL (ceramica, desenho, música)\n- Ciclo 5: Conversa presencial OBRIGATÓRIA\n- Ciclo 6: Meditação/oração em local DIFERENTE\n\nEntre cada ciclo: 10 respirações + affirmação:\n\"Eu controlo meus comportamentos\""}'),

-- Personalização para área ESPIRITUAL mais afetada
('liberdade', 1, 'area_based',
 '{"most_affected_area": "espiritual"}',
 '{"devotional_reflection": "A gratidão é ponte entre o carnal e o espiritual. Quando o celular domina nossa atenção, perdemos a capacidade de contemplar as maravilhas de Deus. Cada notificação nos rouba um momento de adoração. Cada scroll infinito é tempo que poderíamos estar em oração. Hoje, além da gratidão pelas bênçãos materiais, vamos despertar gratidão pelas bênçãos espirituais: salvação, perdão, presença do Espírito Santo, esperança eterna.", "bonus_activity_title": "Adoração Analógica", "bonus_activity_content": "Atividade espiritual intensificada:\n1. 30 min de adoração APENAS com voz (sem música de fundo)\n2. Caminhada contemplativa: veja Deus na criação\n3. Jejum parcial + oração pelos viciados em tela\n4. Escreva carta para Deus sobre sua luta digital\n5. 10 min de silêncio absoluto: escute a voz de Deus"}'),

-- Personalização baseada em pontuação do questionário
('liberdade', 3, 'score_based',
 '{"min_score": 50, "max_score": 66}',
 '{"difficulty_adjustment": "moderate", "additional_support": "Você está no nível moderado. Precisa de mais estrutura e apoio."}'),

('renovacao', 1, 'score_based', 
 '{"min_score": 80, "max_score": 100}',
 '{"intensity_multiplier": 1.5, "support_frequency": "daily", "crisis_protocols": true}'),

-- Personalização baseada em preferências do onboarding
('liberdade', 4, 'preference_based',
 '{"focus_areas": ["tempo_qualidade_familia", "reducao_ansiedade"]}',
 '{"main_activity_content": "Mini Sábado Familiar Personalizado:\n\nPROGRAMA FOCADO EM FAMÍLIA E ANSIEDADE:\n\n14h - Cerimônia de Abertura EM FAMÍLIA\n- Cada pessoa declara gratidão\n- Oração em círculo de mãos dadas\n- Vela acesa = tempo sagrado familiar\n\n14h30 - NATUREZA EM FAMÍLIA\n- Caminhada/parque JUNTOS\n- Cada um coleta algo especial\n- Exercícios de respiração ao ar livre (anti-ansiedade)\n- Sem pressa, foco na presença\n\n16h - CRIATIVIDADE COLABORATIVA\n- Cozinhar juntos algo especial\n- Cada um contribui com uma habilidade\n- Música ambiente suave (anti-ansiedade)\n\n17h30 - CONEXÃO PROFUNDA\n- Jogos que envolvem conversa\n- Cada pessoa conta: maior medo e maior sonho\n- Abraços de 20 segundos (libera oxitocina)\n\n19h30 - ENCERRAMENTO FORTALECIDO\n- Reflexão em família sobre o dia\n- Compromissos mútuos de apoio\n- Oração específica contra ansiedade\n- Vela apagada = compromisso renovado"}');

-- Criar índices para performance
CREATE INDEX idx_personalization_track_day ON content_personalization_rules(track_slug, day_number);
CREATE INDEX idx_personalization_rule_type ON content_personalization_rules(rule_type);

-- Trigger para updated_at
CREATE TRIGGER update_personalization_updated_at
BEFORE UPDATE ON content_personalization_rules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();