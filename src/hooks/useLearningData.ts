import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useLearningStreaks() {
  return useQuery({
    queryKey: ['learning-streaks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('learning_streaks')
        .select('*')
        .order('check_in_date', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useTrainingProgress() {
  return useQuery({
    queryKey: ['training-progress-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('training_progress')
        .select('*')
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useProfiles() {
  return useQuery({
    queryKey: ['profiles-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*');
      if (error) throw error;
      return data;
    },
  });
}

export function useDepartments() {
  return useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data;
    },
  });
}
