-- Create views and materialized views for executive reports
-- Views for AdminDashboard.tsx and AdminReports.tsx components

-- Create testimonials table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    quote TEXT NOT NULL,
    track TEXT NOT NULL,
    before_score INTEGER NOT NULL DEFAULT 0,
    after_score INTEGER NOT NULL DEFAULT 0,
    completed_days INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on testimonials table
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Create policy for testimonials - only admins can manage
CREATE POLICY "Admins can manage testimonials"
ON public.testimonials
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- VIEW: Track completion rates
CREATE OR REPLACE VIEW public.v_track_completion_rates AS
SELECT 
    track_slug,
    COUNT(*) as total_users,
    COUNT(CASE WHEN completed_at IS NOT NULL THEN 1 END) as completed_users,
    ROUND(
        (COUNT(CASE WHEN completed_at IS NOT NULL THEN 1 END)::DECIMAL / COUNT(*)) * 100, 2
    ) as completion_rate_percentage,
    AVG(total_points) as avg_points,
    AVG(current_day) as avg_current_day,
    AVG(streak_days) as avg_streak_days
FROM public.user_track_progress
WHERE is_active = true
GROUP BY track_slug;

-- RLS for track completion rates
ALTER VIEW public.v_track_completion_rates SET (security_invoker = true);
CREATE POLICY "Admins can view track completion rates"
ON public.user_track_progress
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- VIEW: Demographics impact analysis
CREATE OR REPLACE VIEW public.v_demographics_impact AS
SELECT 
    CASE 
        WHEN public.calculate_age_from_birth_date(p.birth_date) BETWEEN 18 AND 25 THEN '18-25'
        WHEN public.calculate_age_from_birth_date(p.birth_date) BETWEEN 26 AND 35 THEN '26-35'
        WHEN public.calculate_age_from_birth_date(p.birth_date) BETWEEN 36 AND 45 THEN '36-45'
        WHEN public.calculate_age_from_birth_date(p.birth_date) BETWEEN 46 AND 55 THEN '46-55'
        WHEN public.calculate_age_from_birth_date(p.birth_date) > 55 THEN '55+'
        ELSE 'Unknown'
    END as age_group,
    p.gender,
    p.profession,
    qr.track_type,
    COUNT(*) as user_count,
    AVG(qr.total_score) as avg_initial_score,
    AVG(utp.total_points) as avg_final_points,
    AVG(utp.current_day) as avg_completion_days,
    ROUND(
        AVG(CASE WHEN utp.completed_at IS NOT NULL THEN 1.0 ELSE 0.0 END) * 100, 2
    ) as completion_rate
FROM public.profiles p
LEFT JOIN public.questionnaire_results qr ON p.user_id = qr.user_id
LEFT JOIN public.user_track_progress utp ON p.user_id = utp.user_id 
    AND qr.track_type = utp.track_slug
WHERE p.birth_date IS NOT NULL
GROUP BY age_group, p.gender, p.profession, qr.track_type
HAVING COUNT(*) >= 3; -- Only show groups with at least 3 users for privacy

-- RLS for demographics impact
ALTER VIEW public.v_demographics_impact SET (security_invoker = true);

-- MATERIALIZED VIEW: Daily statistics
CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_daily_stats AS
SELECT 
    date_created,
    new_users,
    tests_completed,
    avg_score,
    total_points_earned
FROM (
    SELECT 
        DATE(created_at) as date_created,
        COUNT(*) as new_users,
        0 as tests_completed,
        0 as avg_score,
        0 as total_points_earned
    FROM auth.users
    WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
    GROUP BY DATE(created_at)
    
    UNION ALL
    
    SELECT 
        DATE(created_at) as date_created,
        0 as new_users,
        COUNT(*) as tests_completed,
        AVG(total_score) as avg_score,
        0 as total_points_earned
    FROM public.questionnaire_results
    WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
    GROUP BY DATE(created_at)
    
    UNION ALL
    
    SELECT 
        DATE(last_activity_at) as date_created,
        0 as new_users,
        0 as tests_completed,
        0 as avg_score,
        SUM(total_points) as total_points_earned
    FROM public.user_track_progress
    WHERE last_activity_at >= CURRENT_DATE - INTERVAL '30 days'
    GROUP BY DATE(last_activity_at)
) combined_stats
ORDER BY date_created;

-- Function to refresh daily stats
CREATE OR REPLACE FUNCTION public.refresh_daily_stats()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    REFRESH MATERIALIZED VIEW public.mv_daily_stats;
END;
$$;

-- RLS for materialized view (admins only)
ALTER MATERIALIZED VIEW public.mv_daily_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view daily stats"
ON public.mv_daily_stats
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- VIEW: Top testimonials
CREATE OR REPLACE VIEW public.v_top_testimonials AS
SELECT 
    t.id,
    t.user_id,
    t.quote,
    t.track,
    t.before_score,
    t.after_score,
    (t.after_score - t.before_score) as improvement_score,
    t.completed_days,
    t.created_at,
    p.full_name
FROM public.testimonials t
LEFT JOIN public.profiles p ON t.user_id = p.user_id
WHERE t.after_score > t.before_score
ORDER BY (t.after_score - t.before_score) DESC, t.completed_days DESC
LIMIT 3;

-- RLS for top testimonials
ALTER VIEW public.v_top_testimonials SET (security_invoker = true);

-- Create indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_user_track_progress_track_slug ON public.user_track_progress(track_slug);
CREATE INDEX IF NOT EXISTS idx_user_track_progress_completed_at ON public.user_track_progress(completed_at) WHERE completed_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_birth_date ON public.profiles(birth_date) WHERE birth_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_questionnaire_results_track_type ON public.questionnaire_results(track_type);
CREATE INDEX IF NOT EXISTS idx_questionnaire_results_created_at ON public.questionnaire_results(created_at);
CREATE INDEX IF NOT EXISTS idx_testimonials_improvement ON public.testimonials((after_score - before_score)) WHERE after_score > before_score;
CREATE INDEX IF NOT EXISTS idx_user_track_progress_activity_date ON public.user_track_progress(DATE(last_activity_at));

-- Grant permissions for admin role functions
GRANT EXECUTE ON FUNCTION public.refresh_daily_stats() TO authenticated;