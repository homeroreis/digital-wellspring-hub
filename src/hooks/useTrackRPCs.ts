import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Types for RPC return values
export interface WeekDay {
  day_number: number;
  title: string;
  objective: string;
  difficulty_level: number;
  max_points: number;
  day_completed: boolean;
  activities_completed: number;
  total_activities: number;
}

export interface DayActivity {
  activity: {
    id: string;
    activity_title: string;
    activity_description: string;
    is_required: boolean;
    sort_order: number;
    points_value: number;
  };
  completed: boolean;
  completed_at?: string;
  points_earned: number;
}

export interface DayDetail {
  day_content: {
    id: string;
    day_number: number;
    title: string;
    objective: string;
    main_activity_title: string;
    main_activity_content: string;
    main_challenge_title: string;
    main_challenge_content: string;
    devotional_verse: string;
    devotional_reflection: string;
    devotional_prayer: string;
    bonus_activity_title?: string;
    bonus_activity_content?: string;
    max_points: number;
    difficulty_level: number;
  };
  activities: DayActivity[];
  day_completed: boolean;
}

export interface CompleteActivityResult {
  success: boolean;
  points_earned: number;
  completed_at: string;
}

export interface CompleteDayResult {
  success: boolean;
  message?: string;
  day_completed?: number;
  points_earned?: number;
  total_points?: number;
  current_streak?: number;
  level?: number;
  next_day?: number;
  required?: number;
  completed?: number;
}

// Hook to get week days data
export const useWeekDays = (trackSlug: string, startDay: number = 1) => {
  return useQuery<WeekDay[]>({
    queryKey: ['weekDays', trackSlug, startDay],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_week_days', {
        p_track_slug: trackSlug,
        p_start_day: startDay,
      });

      if (error) throw error;
      return data as unknown as WeekDay[];
    },
    enabled: !!trackSlug,
  });
};

// Hook to get day detail data
export const useDayDetail = (trackSlug: string, dayNumber: number) => {
  return useQuery<DayDetail>({
    queryKey: ['dayDetail', trackSlug, dayNumber],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_track_day', {
        p_track_slug: trackSlug,
        p_day_number: dayNumber,
      });

      if (error) throw error;
      return data as unknown as DayDetail;
    },
    enabled: !!trackSlug && dayNumber > 0,
  });
};

// Hook to get user track progress
export const useTrackProgress = (trackSlug: string) => {
  return useQuery({
    queryKey: ['trackProgress', trackSlug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_track_progress')
        .select('*')
        .eq('track_slug', trackSlug)
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!trackSlug,
  });
};

// Mutation to complete an activity
export const useCompleteActivity = () => {
  const queryClient = useQueryClient();

  return useMutation<CompleteActivityResult, Error, {
    trackSlug: string;
    dayNumber: number;
    activityIndex: number;
    activityTitle: string;
    activityType?: string;
  }>({
    mutationFn: async ({
      trackSlug,
      dayNumber,
      activityIndex,
      activityTitle,
      activityType = 'activity',
    }) => {
      const { data, error } = await supabase.rpc('complete_activity', {
        p_track_slug: trackSlug,
        p_day_number: dayNumber,
        p_activity_index: activityIndex,
        p_activity_title: activityTitle,
        p_activity_type: activityType,
      });

      if (error) throw error;
      return data as unknown as CompleteActivityResult;
    },
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: ['dayDetail', variables.trackSlug, variables.dayNumber],
      });
      queryClient.invalidateQueries({
        queryKey: ['weekDays', variables.trackSlug],
      });
      queryClient.invalidateQueries({
        queryKey: ['trackProgress', variables.trackSlug],
      });
    },
  });
};

// Mutation to complete a day
export const useCompleteDay = () => {
  const queryClient = useQueryClient();

  return useMutation<CompleteDayResult, Error, {
    trackSlug: string;
    dayNumber: number;
  }>({
    mutationFn: async ({
      trackSlug,
      dayNumber,
    }) => {
      const { data, error } = await supabase.rpc('complete_day', {
        p_track_slug: trackSlug,
        p_day_number: dayNumber,
      });

      if (error) throw error;
      return data as unknown as CompleteDayResult;
    },
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: ['dayDetail', variables.trackSlug, variables.dayNumber],
      });
      queryClient.invalidateQueries({
        queryKey: ['weekDays', variables.trackSlug],
      });
      queryClient.invalidateQueries({
        queryKey: ['trackProgress', variables.trackSlug],
      });
    },
  });
};