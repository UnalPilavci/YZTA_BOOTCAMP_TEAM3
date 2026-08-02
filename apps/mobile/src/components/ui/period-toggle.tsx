import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import type { ReportPeriod } from '@/data/report-period';
import { accentLime, onAccentLime } from '@/theme';

import { PressableScale } from './pressable-scale';

const OPTIONS: { key: ReportPeriod; labelKey: string }[] = [
  { key: 'week', labelKey: 'home.periodWeek' },
  { key: 'month', labelKey: 'home.periodMonth' },
];

export function PeriodToggle({
  value,
  onChange,
}: {
  value: ReportPeriod;
  onChange: (p: ReportPeriod) => void;
}) {
  const { t } = useTranslation();
  return (
    <View className="flex-row self-start gap-0.5 rounded-pill p-0.5 bg-white/10">
      {OPTIONS.map((o) => {
        const active = value === o.key;
        return (
          <PressableScale key={o.key} haptic="selection" onPress={() => onChange(o.key)}>
            <View
              className="rounded-pill px-2.5 py-1"
              style={{ backgroundColor: active ? accentLime : 'transparent' }}>
              <Text
                className="font-body-bold text-[10px] tracking-wide"
                style={{ color: active ? onAccentLime : 'rgba(255,255,255,0.6)' }}>
                {t(o.labelKey)}
              </Text>
            </View>
          </PressableScale>
        );
      })}
    </View>
  );
}
