-- Reset user data to allow testing onboarding flows
-- This will clear existing progress for testing purposes

-- Clear user preferences onboarding status
UPDATE user_preferences 
SET onboarding_completed = false, 
    onboarding_completed_at = NULL 
WHERE track_slug IN ('equilibrio', 'renovacao');

-- Clear user track progress 
DELETE FROM user_track_progress 
WHERE track_slug IN ('equilibrio', 'renovacao');

-- Clear user activity progress
DELETE FROM user_activity_progress 
WHERE track_slug IN ('equilibrio', 'renovacao');