import type { TFunction } from 'i18next';
import {
  Activity,
  Candy,
  Cookie,
  Droplet,
  FlaskConical,
  HeartPulse,
  Microscope,
  Milk,
  Scale,
  ShieldAlert,
  Soup,
  UtensilsCrossed,
  Wheat,
  type LucideIcon,
} from 'lucide-react-native';

export type BlogCat =
  | 'all'
  | 'recipes'
  | 'nutrition'
  | 'fitness'
  | 'wellness'
  | 'allergies'
  | 'weight'
  | 'science';

const POST_ICONS: Record<string, LucideIcon> = {
  default: UtensilsCrossed,
  milk: Milk,
  cookie: Cookie,
  soup: Soup,
  droplet: Droplet,
  candy: Candy,
  wheat: Wheat,
};

export function postIcon(key: string): LucideIcon {
  return POST_ICONS[key] ?? UtensilsCrossed;
}

export function formatTimeAgo(createdAt: number, t: TFunction): string {
  const diff = Math.max(0, Date.now() - createdAt);
  const min = Math.floor(diff / 60000);
  if (min < 1) return t('discover.timeNow');
  if (min < 60) return t('discover.timeMin', { count: min });
  const hr = Math.floor(min / 60);
  if (hr < 24) return t('discover.timeHour', { count: hr });
  const day = Math.floor(hr / 24);
  if (day < 7) return t('discover.timeDay', { count: day });
  const week = Math.floor(day / 7);
  return t('discover.timeWeek', { count: week });
}

export const CAT_META: Record<
  Exclude<BlogCat, 'all'>,
  { Icon: LucideIcon; color: string; tint: string; labelKey: string }
> = {
  recipes: { Icon: UtensilsCrossed, color: '#F2A73B', tint: '#FBF0DC', labelKey: 'discover.catRecipes' },
  nutrition: { Icon: FlaskConical, color: '#2FAFC4', tint: '#DCF1F4', labelKey: 'discover.catNutrition' },
  fitness: { Icon: Activity, color: '#8B7BF0', tint: '#E7E4FB', labelKey: 'discover.catFitness' },
  wellness: { Icon: HeartPulse, color: '#4CAF7D', tint: '#DFF3E7', labelKey: 'discover.catWellness' },
  allergies: { Icon: ShieldAlert, color: '#D2607A', tint: '#FBE1E8', labelKey: 'discover.catAllergies' },
  weight: { Icon: Scale, color: '#4E7CC4', tint: '#E1EAF8', labelKey: 'discover.catWeight' },
  science: { Icon: Microscope, color: '#64748B', tint: '#E7EAEE', labelKey: 'discover.catScience' },
};

export const BLOG_FILTERS: BlogCat[] = [
  'all',
  'recipes',
  'nutrition',
  'fitness',
  'wellness',
  'allergies',
  'weight',
  'science',
];
