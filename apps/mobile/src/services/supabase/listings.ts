import { supabase } from './client';

export type RoleType = 'trainer' | 'dietitian';
export type WorkMode = 'remote' | 'onsite' | 'hybrid';

export type NewListing = {
  roleType: RoleType;
  title: string;
  specialties: string[];
  bio: string;
  city: string;
  workMode: WorkMode | null;
  contactPhone: string | null;
  contactInstagram: string | null;
  contactWhatsapp: string | null;
};

export type ListingView = {
  id: string;
  userId: string;
  authorName: string;
  authorUsername: string;
  authorAvatarUrl: string | null;
  roleType: RoleType;
  title: string;
  specialties: string[];
  bio: string;
  city: string;
  workMode: WorkMode | null;
  contactPhone: string | null;
  contactInstagram: string | null;
  contactWhatsapp: string | null;
  createdAt: number;
  isMine: boolean;
};

type ListingRow = {
  id: string;
  user_id: string;
  role_type: RoleType;
  title: string;
  specialties: string[];
  bio: string;
  city: string;
  work_mode: WorkMode | null;
  contact_phone: string | null;
  contact_instagram: string | null;
  contact_whatsapp: string | null;
  created_at: string;
};

type ProfileLite = {
  id: string;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
};

const LISTING_COLUMNS =
  'id, user_id, role_type, title, specialties, bio, city, work_mode, contact_phone, contact_instagram, contact_whatsapp, created_at';

async function fetchAuthors(userIds: string[]): Promise<Map<string, ProfileLite>> {
  const map = new Map<string, ProfileLite>();
  if (userIds.length === 0) return map;
  const { data, error } = await supabase
    .from('discover_profiles')
    .select('id, display_name, username, avatar_url')
    .in('id', userIds);
  if (error) throw error;
  for (const p of (data as ProfileLite[] | null) ?? []) map.set(p.id, p);
  return map;
}

function toView(row: ListingRow, authors: Map<string, ProfileLite>, myId: string): ListingView {
  const author = authors.get(row.user_id);
  return {
    id: row.id,
    userId: row.user_id,
    authorName: author?.display_name?.trim() || author?.username || '',
    authorUsername: author?.username ?? '',
    authorAvatarUrl: author?.avatar_url ?? null,
    roleType: row.role_type,
    title: row.title,
    specialties: row.specialties ?? [],
    bio: row.bio,
    city: row.city,
    workMode: row.work_mode,
    contactPhone: row.contact_phone,
    contactInstagram: row.contact_instagram,
    contactWhatsapp: row.contact_whatsapp,
    createdAt: Date.parse(row.created_at),
    isMine: row.user_id === myId,
  };
}

async function enrich(rows: ListingRow[], myId: string): Promise<ListingView[]> {
  const authors = await fetchAuthors([...new Set(rows.map((r) => r.user_id))]);
  return rows.map((r) => toView(r, authors, myId));
}

export async function createListing(userId: string, input: NewListing): Promise<void> {
  const { error } = await supabase.from('trainer_listings').insert({
    user_id: userId,
    role_type: input.roleType,
    title: input.title,
    specialties: input.specialties,
    bio: input.bio,
    city: input.city,
    work_mode: input.workMode,
    contact_phone: input.contactPhone,
    contact_instagram: input.contactInstagram,
    contact_whatsapp: input.contactWhatsapp,
  });
  if (error) throw error;
}

export async function fetchListings(myId: string, limit = 60): Promise<ListingView[]> {
  const { data, error } = await supabase
    .from('trainer_listings')
    .select(LISTING_COLUMNS)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return enrich((data as ListingRow[] | null) ?? [], myId);
}

export async function fetchMyListings(myId: string, limit = 60): Promise<ListingView[]> {
  const { data, error } = await supabase
    .from('trainer_listings')
    .select(LISTING_COLUMNS)
    .eq('user_id', myId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return enrich((data as ListingRow[] | null) ?? [], myId);
}

export async function fetchListing(id: string, myId: string): Promise<ListingView | null> {
  const { data, error } = await supabase
    .from('trainer_listings')
    .select(LISTING_COLUMNS)
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const [view] = await enrich([data as ListingRow], myId);
  return view;
}

export async function updateListing(id: string, input: NewListing): Promise<void> {
  const { error } = await supabase
    .from('trainer_listings')
    .update({
      role_type: input.roleType,
      title: input.title,
      specialties: input.specialties,
      bio: input.bio,
      city: input.city,
      work_mode: input.workMode,
      contact_phone: input.contactPhone,
      contact_instagram: input.contactInstagram,
      contact_whatsapp: input.contactWhatsapp,
    })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteListing(id: string): Promise<void> {
  const { error } = await supabase.from('trainer_listings').delete().eq('id', id);
  if (error) throw error;
}
