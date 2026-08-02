import type { RealtimePostgresInsertPayload } from '@supabase/supabase-js';
import { useEffect, useRef } from 'react';

import { supabase } from '@/services/supabase/client';

let channelSeq = 0;

export function useRealtimeInsert<T extends { [key: string]: unknown }>({
  channelName,
  table,
  filter,
  enabled = true,
  onInsert,
}: {
  channelName: string;
  table: string;
  filter?: string;
  enabled?: boolean;
  onInsert: (row: T) => void;
}): void {
  const cb = useRef(onInsert);
  cb.current = onInsert;

  useEffect(() => {
    if (!enabled) return;
    const topic = `${channelName}#${(channelSeq++).toString(36)}`;
    const channel = supabase
      .channel(topic)
      .on<T>(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table, ...(filter ? { filter } : {}) },
        (payload: RealtimePostgresInsertPayload<T>) => cb.current(payload.new),
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [channelName, table, filter, enabled]);
}
