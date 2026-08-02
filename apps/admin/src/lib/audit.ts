import 'server-only';

import { createAdminClient } from '@/lib/supabase/admin';

export type AuditInput = {
  actorId: string;
  action: string;
  entity: string;
  entityId?: string | null;
  diff?: unknown;
};

export async function writeAudit(input: AuditInput): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.from('admin_audit_log').insert({
    actor_id: input.actorId,
    action: input.action,
    entity: input.entity,
    entity_id: input.entityId ?? null,
    diff: input.diff ?? null,
  });
  if (error) console.error('[audit] yazılamadı:', error.message);
}
