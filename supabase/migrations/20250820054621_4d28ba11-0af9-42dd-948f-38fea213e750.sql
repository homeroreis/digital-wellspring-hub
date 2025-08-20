-- Create table for daily track content
CREATE TABLE public.track_daily_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  track_slug TEXT NOT NULL,
  day_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  objective TEXT NOT NULL,
  devotional_verse TEXT NOT NULL,
  devotional_reflection TEXT NOT NULL,
  devotional_prayer TEXT NOT NULL,
  main_activity_title TEXT NOT NULL,
  main_activity_content TEXT NOT NULL,
  main_challenge_title TEXT NOT NULL,
  main_challenge_content TEXT NOT NULL,
  bonus_activity_title TEXT,
  bonus_activity_content TEXT,
  max_points INTEGER NOT NULL DEFAULT 100,
  difficulty_level INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(track_slug, day_number)
);

-- Enable RLS
ALTER TABLE public.track_daily_content ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view daily content" 
ON public.track_daily_content 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can manage daily content" 
ON public.track_daily_content 
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Create trigger for updated_at
CREATE TRIGGER update_track_daily_content_updated_at
BEFORE UPDATE ON public.track_daily_content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create table for activity checklists within each day
CREATE TABLE public.track_daily_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  daily_content_id UUID NOT NULL REFERENCES public.track_daily_content(id) ON DELETE CASCADE,
  activity_title TEXT NOT NULL,
  activity_description TEXT NOT NULL,
  points_value INTEGER NOT NULL DEFAULT 10,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_required BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.track_daily_activities ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view daily activities" 
ON public.track_daily_activities 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can manage daily activities" 
ON public.track_daily_activities 
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Add index for performance
CREATE INDEX idx_track_daily_content_track_day ON public.track_daily_content(track_slug, day_number);
CREATE INDEX idx_track_daily_activities_content ON public.track_daily_activities(daily_content_id, sort_order);