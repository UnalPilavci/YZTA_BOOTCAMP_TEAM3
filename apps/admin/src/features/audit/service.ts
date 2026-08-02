import 'server-only';

import { createAdminClient } from '@/lib/supabase/admin';

export type AuditEntry = {
  id: string;
  actorId: string | null;
  actorName: string;
  action: string;
  entity: string;
  entityId: string | null;
  createdAt: string;
};

export async function listAudit(action?: string): Promise<AuditEntry[]> {
  const supabase = createAdminClient();
  let query = supabase
    .from('admin_audit_log')
    .select('id, actor_id, action, entity, entity_id, created_at')
    .order('created_at', { ascending: false })
    .limit(300);
  if (action?.trim()) query = query.ilike('action', `${action.trim()}%`);
  const { data, error } = await query;
  if (error) throw error;
  const rows =
    (data as {
      id: string;
      actor_id: string | null;
      action: string;
      entity: string;
      entity_id: string | null;
      created_at: string;
    }[] | null) ?? [];

  const names = new Map<string, string>();
  const ids = [...new Set(rows.map((r) => r.actor_id).filter(Boolean) as string[])];
  if (ids.length) {
    const { data: profs } = await supabase
      .from('discover_profiles')
      .select('id, display_name, username')
      .in('id', ids);
    for (const p of (profs as { id: string; display_name: string | null; username: string | null }[] | null) ?? []) {
      names.set(p.id, p.display_name?.trim() || p.username || p.id.slice(0, 8));
    }
  }

  return rows.map((r) => ({
    id: r.id,
    actorId: r.actor_id,
    actorName: r.actor_id ? (names.get(r.actor_id) ?? r.actor_id.slice(0, 8)) : '(sistem)',
    action: r.action,
    entity: r.entity,
    entityId: r.entity_id,
    createdAt: r.created_at,
  }));
}
