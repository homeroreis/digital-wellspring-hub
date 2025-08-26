import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Achievement {
  id: string;
  achievement_type: string;
  achievement_name: string;
  achievement_description: string;
  points_awarded: number;
  earned_at: string;
}

export interface UserStats {
  total_points: number;
  current_streak: number;
  level: number;
  active_tracks: number;
  total_achievements: number;
}

// Hook to get user achievements
export const useUserAchievements = () => {
  return useQuery<Achievement[]>({
    queryKey: ['userAchievements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_achievements')
        .select('*')
        .order('earned_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });
};

// Hook to get user overall stats
export const useUserStats = () => {
  return useQuery<UserStats>({
    queryKey: ['userStats'],
    queryFn: async () => {
      // Get total points, max streak, and max level across all tracks
      const { data: trackProgress, error: trackError } = await supabase
        .from('user_track_progress')
        .select('total_points, streak_days, level_number, is_active');

      if (trackError) throw trackError;

      // Get total achievements
      const { data: achievements, error: achievementsError } = await supabase
        .from('user_achievements')
        .select('points_awarded');

      if (achievementsError) throw achievementsError;

      const totalPoints = trackProgress?.reduce((sum, track) => sum + (track.total_points || 0), 0) || 0;
      const currentStreak = Math.max(...(trackProgress?.map(track => track.streak_days || 0) || [0]));
      const level = Math.max(...(trackProgress?.map(track => track.level_number || 1) || [1]));
      const activeTracks = trackProgress?.filter(track => track.is_active)?.length || 0;
      const totalAchievements = achievements?.length || 0;

      return {
        total_points: totalPoints,
        current_streak: currentStreak,
        level: level,
        active_tracks: activeTracks,
        total_achievements: totalAchievements,
      };
    },
  });
};

// Hook to get user ranking (simplified version)
export const useUserRanking = () => {
  return useQuery<{ position: number; total_users: number }>({
    queryKey: ['userRanking'],
    queryFn: async () => {
      // Get current user's total points
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) throw new Error('User not authenticated');

      const { data: userProgress } = await supabase
        .from('user_track_progress')
        .select('total_points')
        .eq('user_id', currentUser.user.id);

      const currentUserPoints = userProgress?.reduce((sum, track) => sum + (track.total_points || 0), 0) || 0;

      // Count users with more points (simplified ranking)
      const { data: allUsers, error } = await supabase
        .from('user_track_progress')
        .select('user_id, total_points');

      if (error) throw error;

      // Group by user and sum points
      const userPointsMap = new Map();
      allUsers?.forEach(track => {
        const currentPoints = userPointsMap.get(track.user_id) || 0;
        userPointsMap.set(track.user_id, currentPoints + (track.total_points || 0));
      });

      const userPointsArray = Array.from(userPointsMap.values()).sort((a, b) => b - a);
      const position = userPointsArray.findIndex(points => points <= currentUserPoints) + 1;
      const totalUsers = userPointsArray.length;

      return {
        position: position || totalUsers,
        total_users: totalUsers,
      };
    },
  });
};