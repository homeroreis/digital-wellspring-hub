import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PersonalizedContent } from '@/services/personalizationEngine';

export const usePersonalizedDay = (userId: string, dayNumber: number) => {
  return useQuery<PersonalizedContent>({
    queryKey: ['personalizedDay', userId, dayNumber],
    queryFn: async () => {
      if (!userId) {
        throw new Error("User ID is required to fetch personalized content.");
      }
      
      const { data, error } = await (supabase as any)
        .from('personalized_track_days')
        .select('content')
        .eq('user_id', userId)
        .eq('day_number', dayNumber)
        .single();
      
      if (error) throw error;
      return data.content as PersonalizedContent;
    },
    enabled: !!userId && dayNumber > 0,
  });
};