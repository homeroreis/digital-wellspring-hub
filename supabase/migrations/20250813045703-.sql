-- Create categories table
CREATE TABLE public.content_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT NOT NULL DEFAULT '#3B82F6',
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tags table
CREATE TABLE public.content_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create content table
CREATE TABLE public.contents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  body TEXT,
  excerpt TEXT,
  content_type TEXT NOT NULL CHECK (content_type IN ('article', 'video', 'exercise', 'audio', 'quiz')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  category_id UUID REFERENCES public.content_categories(id),
  author_id UUID NOT NULL,
  
  -- Media fields
  featured_image_url TEXT,
  video_url TEXT,
  youtube_url TEXT,
  audio_url TEXT,
  external_url TEXT,
  
  -- Metadata
  difficulty_level TEXT DEFAULT 'iniciante' CHECK (difficulty_level IN ('iniciante', 'intermediario', 'avancado')),
  reading_time_minutes INTEGER DEFAULT 0,
  duration_minutes INTEGER DEFAULT 0,
  
  -- Track associations
  track_types TEXT[] DEFAULT '{}',
  
  -- Flags
  is_featured BOOLEAN DEFAULT false,
  is_premium BOOLEAN DEFAULT false,
  is_interactive BOOLEAN DEFAULT false,
  
  -- SEO
  seo_title TEXT,
  seo_description TEXT,
  seo_keywords TEXT[],
  
  -- Analytics
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  completion_count INTEGER DEFAULT 0,
  
  -- Publishing
  published_at TIMESTAMP WITH TIME ZONE,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create content-tags junction table
CREATE TABLE public.content_tag_relations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id UUID NOT NULL REFERENCES public.contents(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.content_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(content_id, tag_id)
);

-- Create user content interactions table
CREATE TABLE public.user_content_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  content_id UUID NOT NULL REFERENCES public.contents(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('view', 'like', 'bookmark', 'complete', 'rate')),
  interaction_value INTEGER, -- For ratings, completion percentage, etc.
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, content_id, interaction_type)
);

-- Create content media assets table
CREATE TABLE public.content_media (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id UUID NOT NULL REFERENCES public.contents(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  alt_text TEXT,
  caption TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.content_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_tag_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_content_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_media ENABLE ROW LEVEL SECURITY;

-- RLS Policies for content_categories (public read, admin write)
CREATE POLICY "Anyone can view categories" ON public.content_categories FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage categories" ON public.content_categories FOR ALL USING (auth.uid() IS NOT NULL);

-- RLS Policies for content_tags (public read, admin write)
CREATE POLICY "Anyone can view tags" ON public.content_tags FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage tags" ON public.content_tags FOR ALL USING (auth.uid() IS NOT NULL);

-- RLS Policies for contents (public read published, admin write)
CREATE POLICY "Anyone can view published content" ON public.contents FOR SELECT USING (status = 'published');
CREATE POLICY "Authenticated users can view all content" ON public.contents FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can manage content" ON public.contents FOR ALL USING (auth.uid() IS NOT NULL);

-- RLS Policies for content_tag_relations
CREATE POLICY "Anyone can view content-tag relations" ON public.content_tag_relations FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage content-tag relations" ON public.content_tag_relations FOR ALL USING (auth.uid() IS NOT NULL);

-- RLS Policies for user_content_interactions
CREATE POLICY "Users can view their own interactions" ON public.user_content_interactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own interactions" ON public.user_content_interactions FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for content_media
CREATE POLICY "Anyone can view content media" ON public.content_media FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage content media" ON public.content_media FOR ALL USING (auth.uid() IS NOT NULL);

-- Create indexes for better performance
CREATE INDEX idx_contents_status ON public.contents(status);
CREATE INDEX idx_contents_category ON public.contents(category_id);
CREATE INDEX idx_contents_author ON public.contents(author_id);
CREATE INDEX idx_contents_type ON public.contents(content_type);
CREATE INDEX idx_contents_published ON public.contents(published_at);
CREATE INDEX idx_contents_track_types ON public.contents USING GIN(track_types);
CREATE INDEX idx_user_interactions_user ON public.user_content_interactions(user_id);
CREATE INDEX idx_user_interactions_content ON public.user_content_interactions(content_id);
CREATE INDEX idx_content_media_content ON public.content_media(content_id);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_content_categories_updated_at
BEFORE UPDATE ON public.content_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contents_updated_at
BEFORE UPDATE ON public.contents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_content_interactions_updated_at
BEFORE UPDATE ON public.user_content_interactions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage buckets for content media
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('content-images', 'content-images', true),
  ('content-videos', 'content-videos', true),
  ('content-audio', 'content-audio', true),
  ('content-documents', 'content-documents', true);

-- Create storage policies for content buckets
CREATE POLICY "Anyone can view content images" ON storage.objects FOR SELECT USING (bucket_id = 'content-images');
CREATE POLICY "Authenticated users can upload content images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'content-images' AND auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update content images" ON storage.objects FOR UPDATE USING (bucket_id = 'content-images' AND auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can delete content images" ON storage.objects FOR DELETE USING (bucket_id = 'content-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Anyone can view content videos" ON storage.objects FOR SELECT USING (bucket_id = 'content-videos');
CREATE POLICY "Authenticated users can upload content videos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'content-videos' AND auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update content videos" ON storage.objects FOR UPDATE USING (bucket_id = 'content-videos' AND auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can delete content videos" ON storage.objects FOR DELETE USING (bucket_id = 'content-videos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Anyone can view content audio" ON storage.objects FOR SELECT USING (bucket_id = 'content-audio');
CREATE POLICY "Authenticated users can upload content audio" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'content-audio' AND auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update content audio" ON storage.objects FOR UPDATE USING (bucket_id = 'content-audio' AND auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can delete content audio" ON storage.objects FOR DELETE USING (bucket_id = 'content-audio' AND auth.uid() IS NOT NULL);

CREATE POLICY "Anyone can view content documents" ON storage.objects FOR SELECT USING (bucket_id = 'content-documents');
CREATE POLICY "Authenticated users can upload content documents" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'content-documents' AND auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update content documents" ON storage.objects FOR UPDATE USING (bucket_id = 'content-documents' AND auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can delete content documents" ON storage.objects FOR DELETE USING (bucket_id = 'content-documents' AND auth.uid() IS NOT NULL);

-- Insert default categories
INSERT INTO public.content_categories (name, slug, description, color, icon) VALUES
  ('Consciência Digital', 'consciencia-digital', 'Conteúdos sobre uso consciente da tecnologia', '#3B82F6', 'brain'),
  ('Hábitos Saudáveis', 'habitos-saudaveis', 'Práticas para desenvolver hábitos digitais saudáveis', '#10B981', 'heart'),
  ('Relacionamentos', 'relacionamentos', 'Como manter relacionamentos saudáveis na era digital', '#F59E0B', 'users'),
  ('Espiritualidade', 'espiritualidade', 'Conexão espiritual e vida digital equilibrada', '#8B5CF6', 'church'),
  ('Produtividade', 'produtividade', 'Uso produtivo e consciente da tecnologia', '#EF4444', 'zap'),
  ('Família', 'familia', 'Harmonia familiar na era digital', '#06B6D4', 'home'),
  ('Juventude', 'juventude', 'Orientações especiais para jovens adventistas', '#84CC16', 'users');

-- Insert default tags
INSERT INTO public.content_tags (name, slug) VALUES
  ('nomofobia', 'nomofobia'),
  ('ansiedade', 'ansiedade'),
  ('família', 'familia'),
  ('trabalho', 'trabalho'),
  ('sono', 'sono'),
  ('oração', 'oracao'),
  ('meditação', 'meditacao'),
  ('exercício', 'exercicio'),
  ('detox', 'detox'),
  ('jejum digital', 'jejum-digital'),
  ('redes sociais', 'redes-sociais'),
  ('smartphone', 'smartphone'),
  ('vício digital', 'vicio-digital'),
  ('tempo de tela', 'tempo-de-tela'),
  ('mindfulness', 'mindfulness'),
  ('bem-estar', 'bem-estar'),
  ('saúde mental', 'saude-mental'),
  ('relacionamento', 'relacionamento'),
  ('comunicação', 'comunicacao'),
  ('limites', 'limites');

-- Create function to automatically generate slug
CREATE OR REPLACE FUNCTION public.generate_slug(title TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  slug TEXT;
BEGIN
  -- Convert to lowercase and replace spaces/special chars with hyphens
  slug := lower(trim(title));
  slug := regexp_replace(slug, '[^a-z0-9\s-]', '', 'g');
  slug := regexp_replace(slug, '\s+', '-', 'g');
  slug := regexp_replace(slug, '-+', '-', 'g');
  slug := trim(slug, '-');
  
  RETURN slug;
END;
$$;

-- Create function to update content metrics
CREATE OR REPLACE FUNCTION public.update_content_metrics(p_content_id UUID, p_metric_type TEXT)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  CASE p_metric_type
    WHEN 'view' THEN
      UPDATE public.contents 
      SET view_count = view_count + 1 
      WHERE id = p_content_id;
    WHEN 'like' THEN
      UPDATE public.contents 
      SET like_count = like_count + 1 
      WHERE id = p_content_id;
    WHEN 'complete' THEN
      UPDATE public.contents 
      SET completion_count = completion_count + 1 
      WHERE id = p_content_id;
  END CASE;
END;
$$;