import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Job } from '@/types';

export function useJobs() {
  return useQuery({
    queryKey: ['jobs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Job[];
    },
  });
}

export function useEmployerJobs(employerId: string) {
  return useQuery({
    queryKey: ['jobs', 'employer', employerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('employer_id', employerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Job[];
    },
    enabled: !!employerId,
  });
}
