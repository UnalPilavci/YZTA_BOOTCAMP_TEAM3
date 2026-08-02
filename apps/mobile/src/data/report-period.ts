export type ReportPeriod = 'week' | 'month';

const DAY_MS = 86_400_000;
const PERIOD_DAYS: Record<ReportPeriod, number> = { week: 7, month: 30 };

export function periodCutoff(period: ReportPeriod): number {
  return Date.now() - PERIOD_DAYS[period] * DAY_MS;
}
