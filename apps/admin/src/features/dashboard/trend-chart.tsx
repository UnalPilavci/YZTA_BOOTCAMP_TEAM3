'use client';

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import type { TrendPoint } from '@/features/dashboard/trends';

export function TrendChart({ data }: { data: TrendPoint[] }) {
  const fmt = (d: string) => {
    const [, m, day] = d.split('-');
    return `${day}.${m}`;
  };

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
          <defs>
            <linearGradient id="gScans" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#DFFB4B" stopOpacity={0.5} />
              <stop offset="100%" stopColor="#DFFB4B" stopOpacity={0.03} />
            </linearGradient>
            <linearGradient id="gMeals" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FF2E7E" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#FF2E7E" stopOpacity={0.03} />
            </linearGradient>
            <linearGradient id="gSignups" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4C86E8" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#4C86E8" stopOpacity={0.03} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E6E7E2" vertical={false} />
          <XAxis dataKey="date" tickFormatter={fmt} tick={{ fontSize: 11, fill: '#6B7280' }} minTickGap={24} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#6B7280' }} width={32} />
          <Tooltip
            labelFormatter={(label) => fmt(String(label))}
            contentStyle={{ borderRadius: 12, border: '1px solid #E6E7E2', fontSize: 12 }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Area type="monotone" dataKey="signups" name="Kayıt" stroke="#4C86E8" fill="url(#gSignups)" strokeWidth={2} />
          <Area type="monotone" dataKey="scans" name="Tarama" stroke="#8AAF00" fill="url(#gScans)" strokeWidth={2} />
          <Area type="monotone" dataKey="meals" name="Öğün" stroke="#FF2E7E" fill="url(#gMeals)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
