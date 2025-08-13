-- Create user_track_progress table to track overall progress in tracks
CREATE TABLE public.user_track_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  track_slug TEXT NOT NULL,
  current_day INTEGER NOT NULL DEFAULT 1,
  total_points INTEGER NOT NULL DEFAULT 0,
  streak_days INTEGER NOT NULL DEFAULT 0,
  level_number INTEGER NOT NULL DEFAULT 1,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_activity_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_activity_progress table to track individual activity completion
CREATE TABLE public.user_activity_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  track_slug TEXT NOT NULL,
  day_number INTEGER NOT NULL,
  activity_index INTEGER NOT NULL,
  activity_type TEXT NOT NULL,
  activity_title TEXT NOT NULL,
  points_earned INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_achievements table for gamification
CREATE TABLE public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  achievement_type TEXT NOT NULL,
  achievement_name TEXT NOT NULL,
  achievement_description TEXT NOT NULL,
  points_awarded INTEGER NOT NULL DEFAULT 0,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.user_track_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_track_progress
CREATE POLICY "Users can view their own track progress" 
ON public.user_track_progress 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own track progress" 
ON public.user_track_progress 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own track progress" 
ON public.user_track_progress 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own track progress" 
ON public.user_track_progress 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for user_activity_progress
CREATE POLICY "Users can view their own activity progress" 
ON public.user_activity_progress 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activity progress" 
ON public.user_activity_progress 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own activity progress" 
ON public.user_activity_progress 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own activity progress" 
ON public.user_activity_progress 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for user_achievements
CREATE POLICY "Users can view their own achievements" 
ON public.user_achievements 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements" 
ON public.user_achievements 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_user_track_progress_user_id ON public.user_track_progress(user_id);
CREATE INDEX idx_user_track_progress_track_slug ON public.user_track_progress(track_slug);
CREATE INDEX idx_user_activity_progress_user_id ON public.user_activity_progress(user_id);
CREATE INDEX idx_user_activity_progress_track_day ON public.user_activity_progress(track_slug, day_number);
CREATE INDEX idx_user_achievements_user_id ON public.user_achievements(user_id);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_user_track_progress_updated_at
BEFORE UPDATE ON public.user_track_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to calculate user level based on points
CREATE OR REPLACE FUNCTION public.calculate_user_level(total_points INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Simple leveling system: 100 points per level
  RETURN GREATEST(1, (total_points / 100) + 1);
END;
$$;

-- Create function to award achievements
CREATE OR REPLACE FUNCTION public.check_and_award_achievements(p_user_id UUID, p_track_slug TEXT)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  current_streak INTEGER;
  total_days_completed INTEGER;
  track_progress RECORD;
BEGIN
  -- Get current track progress
  SELECT * INTO track_progress 
  FROM public.user_track_progress 
  WHERE user_id = p_user_id AND track_slug = p_track_slug AND is_active = true;
  
  IF track_progress.id IS NOT NULL THEN
    current_streak := track_progress.streak_days;
    
    -- Count total completed days for this track
    SELECT COUNT(DISTINCT day_number) INTO total_days_completed
    FROM public.user_activity_progress
    WHERE user_id = p_user_id AND track_slug = p_track_slug;
    
    -- Award "First Step" achievement (first day completed)
    IF total_days_completed = 1 AND NOT EXISTS (
      SELECT 1 FROM public.user_achievements 
      WHERE user_id = p_user_id AND achievement_type = 'first_day'
    ) THEN
      INSERT INTO public.user_achievements (user_id, achievement_type, achievement_name, achievement_description, points_awarded)
      VALUES (p_user_id, 'first_day', 'Primeiro Passo', 'Completou seu primeiro dia de transformação', 50);
    END IF;
    
    -- Award "Week Warrior" achievement (7 consecutive days)
    IF current_streak >= 7 AND NOT EXISTS (
      SELECT 1 FROM public.user_achievements 
      WHERE user_id = p_user_id AND achievement_type = 'week_warrior'
    ) THEN
      INSERT INTO public.user_achievements (user_id, achievement_type, achievement_name, achievement_description, points_awarded)
      VALUES (p_user_id, 'week_warrior', 'Guerreiro da Semana', 'Manteve 7 dias consecutivos de atividades', 200);
    END IF;
    
    -- Award "Dedication Master" achievement (21 consecutive days)
    IF current_streak >= 21 AND NOT EXISTS (
      SELECT 1 FROM public.user_achievements 
      WHERE user_id = p_user_id AND achievement_type = 'dedication_master'
    ) THEN
      INSERT INTO public.user_achievements (user_id, achievement_type, achievement_name, achievement_description, points_awarded)
      VALUES (p_user_id, 'dedication_master', 'Mestre da Dedicação', 'Manteve 21 dias consecutivos - transformação real!', 500);
    END IF;
  END IF;
END;
$$;