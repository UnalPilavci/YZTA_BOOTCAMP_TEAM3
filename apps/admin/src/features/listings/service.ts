import 'server-only';

import { createAdminClient } from '@/lib/supabase/admin';

export type Listing = {
  id: string;
  userId: string;
  authorName: string;
  roleType: 'trainer' | 'dietitian';
  title: string;
  specialties: string[];
  bio: string;
  city: string;
  workMode: string | null;
  contactPhone: string | null;
  contactInstagram: string | null;
  contactWhatsapp: string | null;
  createdAt: string;
};

type Row = {
  id: string;
  user_id: string;
  role_type: 'trainer' | 'dietitian';
  title: string;
  specialties: string[];
  bio: string;
  city: string;
  work_mode: string | null;
  contact_phone: string | null;
  contact_instagram: string | null;
  contact_whatsapp: string | null;
  created_at: string;
};

export async function listListings(): Promise<Listing[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('trainer_listings')
    .select(
      'id, user_id, role_type, title, specialties, bio, city, work_mode, contact_phone, contact_instagram, contact_whatsapp, created_at',
    )
    .order('created_at', { ascending: false })
    .limit(300);
  if (error) throw error;
  const rows = (data as Row[] | null) ?? [];

  const names = new Map<string, string>();
  const ids = [...new Set(rows.map((r) => r.user_id))];
  if (ids.length) {
    const { data: profs } = await supabase
      .from('discover_profiles')
      .select('id, display_name, username')
      .in('id', ids);
    for (const p of (profs as { id: string; display_name: string | null; username: string | null }[] | null) ?? []) {
      names.set(p.id, p.display_name?.trim() || p.username || '(isimsiz)');
    }
  }

  return rows.map((r) => ({
    id: r.id,
    userId: r.user_id,
    authorName: names.get(r.user_id) ?? '(isimsiz)',
    roleType: r.role_type,
    title: r.title,
    specialties: r.specialties ?? [],
    bio: r.bio,
    city: r.city,
    workMode: r.work_mode,
    contactPhone: r.contact_phone,
    contactInstagram: r.contact_instagram,
    contactWhatsapp: r.contact_whatsapp,
    createdAt: r.created_at,
  }));
}

export async function deleteListing(id: string): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.from('trainer_listings').delete().eq('id', id);
  if (error) throw error;
}
