-- Habilitar RLS na tabela tracks que não tinha RLS ativado
ALTER TABLE public.tracks ENABLE ROW LEVEL SECURITY;

-- Criar políticas básicas para a tabela tracks (apenas leitura pública por enquanto)
CREATE POLICY "Anyone can view tracks" ON public.tracks FOR SELECT USING (true);