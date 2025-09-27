-- Popular atividades da trilha Renovação baseadas no conteúdo existente
-- Primeiro vamos criar as atividades para cada dia da trilha Renovação

-- Função auxiliar para inserir atividades de um dia
CREATE OR REPLACE FUNCTION populate_renovacao_activities()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  daily_content_record RECORD;
BEGIN
  -- Para cada dia da trilha renovação, criar as atividades padrão
  FOR daily_content_record IN 
    SELECT id, day_number, title FROM track_daily_content 
    WHERE track_slug = 'renovacao' 
    ORDER BY day_number
  LOOP
    -- Atividade 1: Devocional (sempre presente)
    INSERT INTO track_daily_activities (
      daily_content_id, 
      sort_order, 
      activity_title, 
      activity_description, 
      points_value, 
      is_required
    ) VALUES (
      daily_content_record.id,
      1,
      'Devocional Matinal', 
      'Leia o versículo do dia, faça a reflexão e ore conforme orientado',
      30,
      true
    );

    -- Atividade 2: Atividade Principal (sempre presente)
    INSERT INTO track_daily_activities (
      daily_content_id, 
      sort_order, 
      activity_title, 
      activity_description, 
      points_value, 
      is_required
    ) VALUES (
      daily_content_record.id,
      2,
      'Atividade Principal', 
      'Complete a atividade principal do dia conforme descrito no conteúdo',
      50,
      true
    );

    -- Atividade 3: Desafio do Dia (sempre presente)
    INSERT INTO track_daily_activities (
      daily_content_id, 
      sort_order, 
      activity_title, 
      activity_description, 
      points_value, 
      is_required
    ) VALUES (
      daily_content_record.id,
      3,
      'Desafio do Dia', 
      'Complete o desafio específico proposto para hoje',
      40,
      true
    );

    -- Atividade 4: Exercício Físico (obrigatório nos primeiros 10 dias)
    INSERT INTO track_daily_activities (
      daily_content_id, 
      sort_order, 
      activity_title, 
      activity_description, 
      points_value, 
      is_required
    ) VALUES (
      daily_content_record.id,
      4,
      'Exercício Físico', 
      'Faça 30 minutos de exercício físico para ajudar na desintoxicação',
      30,
      CASE WHEN daily_content_record.day_number <= 10 THEN true ELSE false END
    );

    -- Atividade 5: Diário de Guerra (sempre presente)
    INSERT INTO track_daily_activities (
      daily_content_id, 
      sort_order, 
      activity_title, 
      activity_description, 
      points_value, 
      is_required
    ) VALUES (
      daily_content_record.id,
      5,
      'Diário de Guerra', 
      'Registre suas batalhas, vitórias e aprendizados do dia',
      25,
      true
    );

    -- Atividade Bônus: Conexão Social (opcional, mais pontos após dia 7)
    INSERT INTO track_daily_activities (
      daily_content_id, 
      sort_order, 
      activity_title, 
      activity_description, 
      points_value, 
      is_required
    ) VALUES (
      daily_content_record.id,
      6,
      'Conexão Social', 
      'Passe tempo de qualidade com família/amigos sem dispositivos',
      CASE WHEN daily_content_record.day_number > 7 THEN 35 ELSE 25 END,
      false
    );

  END LOOP;
END;
$$;

-- Limpar atividades existentes se houver
DELETE FROM track_daily_activities 
WHERE daily_content_id IN (
  SELECT id FROM track_daily_content WHERE track_slug = 'renovacao'
);

-- Popular as atividades
SELECT populate_renovacao_activities();

-- Remover função auxiliar
DROP FUNCTION populate_renovacao_activities();