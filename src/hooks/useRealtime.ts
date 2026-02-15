import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

export function useRealtimeSubscription(table: string, queryKey: string[]) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel: RealtimeChannel = supabase
      .channel(`${table}-changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
        },
        (payload) => {
          console.log('Realtime change:', payload);
          
          if (payload.eventType === 'INSERT') {
            queryClient.setQueryData(queryKey, (old: unknown[]) => {
              if (Array.isArray(old)) {
                return [payload.new, ...old];
              }
              return [payload.new];
            });
          } else if (payload.eventType === 'UPDATE') {
            queryClient.setQueryData(queryKey, (old: unknown[]) => {
              if (Array.isArray(old)) {
                return old.map((item: unknown) => 
                  (item as { id: string }).id === payload.new.id ? payload.new : item
                );
              }
              return old;
            });
          } else if (payload.eventType === 'DELETE') {
            queryClient.setQueryData(queryKey, (old: unknown[]) => {
              if (Array.isArray(old)) {
                return old.filter((item: unknown) => 
                  (item as { id: string }).id !== payload.old.id
                );
              }
              return old;
            });
          }
          
          queryClient.invalidateQueries({ queryKey });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, queryKey, queryClient]);
}

export function useJobsRealtime() {
  useRealtimeSubscription('jobs', ['jobs']);
}

export function useCandidatesRealtime() {
  useRealtimeSubscription('candidates', ['candidates']);
}

export function useApplicationsRealtime() {
  useRealtimeSubscription('applications', ['applications']);
}

export function useActivityRealtime(onNewActivity?: (activity: unknown) => void) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel: RealtimeChannel = supabase
      .channel('activity-logs-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activity_logs',
        },
        (payload) => {
          queryClient.setQueryData(['activityLogs', 50], (old: unknown[]) => {
            if (Array.isArray(old)) {
              return [payload.new, ...old].slice(0, 50);
            }
            return [payload.new];
          });
          
          if (onNewActivity) {
            onNewActivity(payload.new);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, onNewActivity]);
}
