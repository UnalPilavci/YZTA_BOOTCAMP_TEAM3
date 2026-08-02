import { useMemo } from 'react';

import {
  hasFeature,
  planOf,
  quotaWindowStart,
  type PlanDef,
  type PlanFeature,
  type PlanId,
  type QuotaPeriod,
} from '@/data/plans';
import { useMeals } from '@/store/meals';
import { useProfile } from '@/store/profile';
import { useScans } from '@/store/scans';

export function usePlan(): PlanId {
  return useProfile((s) => s.plan);
}

export function useHasFeature(feature: PlanFeature): boolean {
  const plan = usePlan();
  return hasFeature(plan, feature);
}

export type ScanQuota = {
  plan: PlanDef;
  period: QuotaPeriod;
  used: number;
  limit: number;
  remaining: number;
  canScan: boolean;
  resetsAt: number | null;
};

function computeQuota(
  plan: PlanDef,
  limit: number,
  period: QuotaPeriod,
  timestamps: number[],
): ScanQuota {
  const now = Date.now();
  const cutoff = quotaWindowStart(period, now);
  const windowMs = now - cutoff;
  const inWindow = timestamps.filter((ts) => ts >= cutoff).sort((a, b) => a - b);

  const used = inWindow.length;
  const remaining = Math.max(0, limit - used);
  const releaseIdx = used - limit;
  const resetsAt =
    remaining === 0 && inWindow[releaseIdx] != null ? inWindow[releaseIdx] + windowMs : null;

  return { plan, period, used, limit, remaining, canScan: remaining > 0, resetsAt };
}

export function useScanQuota(): ScanQuota {
  const planId = usePlan();
  const scans = useScans((s) => s.scans);
  return useMemo(() => {
    const plan = planOf(planId);
    return computeQuota(plan, plan.scanLimit, plan.scanPeriod, scans.map((s) => s.createdAt));
  }, [planId, scans]);
}

export function useMealQuota(): ScanQuota {
  const planId = usePlan();
  const meals = useMeals((s) => s.meals);
  return useMemo(() => {
    const plan = planOf(planId);
    return computeQuota(plan, plan.mealLimit, plan.mealPeriod, meals.map((m) => m.createdAt));
  }, [planId, meals]);
}
