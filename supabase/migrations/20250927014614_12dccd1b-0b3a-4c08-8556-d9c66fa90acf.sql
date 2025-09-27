-- Tentar com tipos de conteúdo básicos que provavelmente estão no check constraint
INSERT INTO public.contents (
  title, slug, description, body, content_type, track_types, status, 
  difficulty_level, author_id, reading_time_minutes, is_featured
) VALUES 
(
  'Introdução às Trilhas Espirituais',
  'introducao-trilhas-espirituais',
  'Descubra como as trilhas podem transformar sua jornada espiritual',
  '# Bem-vindo às Trilhas de Transformação

Sua jornada de transformação começa agora!',
  'article',
  ARRAY['liberdade', 'equilibrio', 'renovacao'],
  'published',
  'iniciante',
  (SELECT id FROM auth.users LIMIT 1),
  5,
  true
),
(
  'Guia de Oração Matinal',
  'guia-oracao-matinal',
  'Aprenda a estruturar sua vida de oração logo nas primeiras horas do dia',
  'Transforme suas manhãs e veja a diferença em toda sua vida!',
  'article',
  ARRAY['liberdade', 'equilibrio', 'renovacao'],
  'published', 
  'iniciante',
  (SELECT id FROM auth.users LIMIT 1),
  8,
  true
),
(
  'Áudio: Meditação Guiada - Paz Interior',
  'meditacao-paz-interior',
  'Sessão de meditação guiada de 10 minutos para encontrar paz e tranquilidade',
  'Uma experiência de meditação cristã focada em encontrar paz interior através da presença de Deus.',
  'audio',
  ARRAY['equilibrio', 'renovacao'],
  'published',
  'iniciante', 
  (SELECT id FROM auth.users LIMIT 1),
  10,
  false
),
(
  'Vídeo: Como Vencer a Ansiedade pela Fé',
  'vencer-ansiedade-fe',
  'Estratégias bíblicas práticas para lidar com ansiedade e preocupação',
  'Neste vídeo, exploramos o que a Bíblia ensina sobre ansiedade.',
  'video',
  ARRAY['liberdade', 'equilibrio'],
  'published',
  'intermediario',
  (SELECT id FROM auth.users LIMIT 1),
  15,
  true
);