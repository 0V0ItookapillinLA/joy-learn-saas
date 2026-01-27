import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type AICharacterRow = Database['public']['Tables']['ai_characters']['Row'];

export function useAICharacters() {
  return useQuery({
    queryKey: ['ai-characters'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_characters')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as AICharacterRow[];
    },
  });
}
