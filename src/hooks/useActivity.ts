import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { ActivityLog } from '@/types';

export function useActivityLogs(limit = 50) {
  return useQuery({
    queryKey: ['activityLogs', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as ActivityLog[];
    },
  });
}

export function useUserActivityLogs(userId: string, limit = 20) {
  return useQuery({
    queryKey: ['activityLogs', 'user', userId, limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as ActivityLog[];
    },
    enabled: !!userId,
  });
}

export function useLogActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ action, details, metadata }: { action: string; details: string; metadata?: Record<string, unknown> }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('activity_logs')
        .insert({
          user_id: user?.id || null,
          action,
          details,
          metadata: metadata || {},
        })
        .select()
        .single();

      if (error) throw error;
      return data as ActivityLog;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activityLogs'] });
    },
  });
}
