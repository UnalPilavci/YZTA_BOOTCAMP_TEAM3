import { Text, View } from 'react-native';

export type PillTone = 'safe' | 'warning' | 'danger' | 'brand' | 'neutral';

const TONE_CLASS: Record<PillTone, { bg: string; text: string }> = {
  safe: { bg: 'bg-safe/15', text: 'text-safe' },
  warning: { bg: 'bg-warning/15', text: 'text-warning' },
  danger: { bg: 'bg-danger/15', text: 'text-danger' },
  brand: { bg: 'bg-brand/10 dark:bg-brand-dark/15', text: 'text-brand dark:text-brand-dark' },
  neutral: { bg: 'bg-ink/8 dark:bg-ink-dark/10', text: 'text-ink-muted dark:text-ink-dark-muted' },
};

type Props = {
  label: string;
  tone?: PillTone;
  className?: string;
};

export function Pill({ label, tone = 'neutral', className = '' }: Props) {
  const t = TONE_CLASS[tone];
  return (
    <View className={`self-start rounded-pill px-3 py-1 ${t.bg} ${className}`}>
      <Text className={`font-body-medium text-xs ${t.text}`}>{label}</Text>
    </View>
  );
}
