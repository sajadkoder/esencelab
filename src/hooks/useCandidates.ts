import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Candidate } from '@/types';

export function useCandidates() {
  return useQuery({
    queryKey: ['candidates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Candidate[];
    },
  });
}
