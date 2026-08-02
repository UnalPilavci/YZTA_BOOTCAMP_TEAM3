import {
  BadgeCheck,
  Crown,
  Leaf,
  type LucideIcon,
} from 'lucide-react-native';

export type PlanId = 'free' | 'premium' | 'pro';

export type PlanFeature =
  | 'community'
  | 'healthReport'
  | 'fitness'
  | 'listings';

export type QuotaPeriod = 'week' | 'month';

export type PlanDef = {
  id: PlanId;
  scanLimit: number;
  scanPeriod: QuotaPeriod;
  mealLimit: number;
  mealPeriod: QuotaPeriod;
  features: PlanFeature[];
  priceMonthly: number;
  Icon: LucideIcon;
  accent: string;
  perkKeys: string[];
};

export const PLANS: Record<PlanId, PlanDef> = {
  free: {
    id: 'free',
    scanLimit: 1,
    scanPeriod: 'week',
    mealLimit: 1,
    mealPeriod: 'week',
    features: ['community'],
    priceMonthly: 0,
    Icon: Leaf,
    accent: '#3F8F4E',
    perkKeys: ['freeScan', 'community', 'basicScore'],
  },
  premium: {
    id: 'premium',
    scanLimit: 100,
    scanPeriod: 'month',
    mealLimit: 100,
    mealPeriod: 'month',
    features: ['community', 'healthReport', 'fitness'],
    priceMonthly: 149,
    Icon: Crown,
    accent: '#DFFB4B',
    perkKeys: ['premiumScan', 'community', 'healthReport', 'fitness', 'noAds'],
  },
  pro: {
    id: 'pro',
    scanLimit: 100,
    scanPeriod: 'month',
    mealLimit: 100,
    mealPeriod: 'month',
    features: ['community', 'healthReport', 'fitness', 'listings'],
    priceMonthly: 299,
    Icon: BadgeCheck,
    accent: '#2FAFC4',
    perkKeys: ['premiumScan', 'everything', 'listings', 'proBadge'],
  },
};

export const PLAN_ORDER: PlanId[] = ['free', 'premium', 'pro'];

export function normalizePlan(raw: string | null | undefined): PlanId {
  return raw === 'premium' || raw === 'pro' ? raw : 'free';
}

export function planOf(id: PlanId): PlanDef {
  return PLANS[id];
}

export function hasFeature(plan: PlanId, feature: PlanFeature): boolean {
  return PLANS[plan].features.includes(feature);
}

export function requiredPlanFor(feature: PlanFeature): PlanId {
  return PLAN_ORDER.find((id) => hasFeature(id, feature)) ?? 'pro';
}

const DAY = 86_400_000;

export function quotaWindowStart(period: QuotaPeriod, now = Date.now()): number {
  return now - (period === 'week' ? 7 : 30) * DAY;
}
