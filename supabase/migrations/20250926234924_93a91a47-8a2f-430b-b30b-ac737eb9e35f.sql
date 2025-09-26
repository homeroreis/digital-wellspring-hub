-- Corrigir tabela user_preferences para permitir upserts corretos
-- Primeiro, remover registros duplicados se existirem
DELETE FROM user_preferences a USING user_preferences b 
WHERE a.id > b.id AND a.user_id = b.user_id AND a.track_slug = b.track_slug;

-- Adicionar constraint única para permitir ON CONFLICT
ALTER TABLE user_preferences 
ADD CONSTRAINT user_preferences_user_track_unique 
UNIQUE (user_id, track_slug);