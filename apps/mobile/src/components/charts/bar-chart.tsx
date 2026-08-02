import { MotiView } from 'moti';
import { ScrollView, Text, View } from 'react-native';

export type BarDatum = { key: string; label: string; value: number };

const BAR_MAX_H = 120;
const BAR_W = 34;

export function BarChart({
  data,
  color,
  formatValue,
}: {
  data: BarDatum[];
  color: string;
  formatValue: (n: number) => string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 10, paddingVertical: 4 }}>
      {data.map((d, i) => {
        const h = Math.max(3, Math.round((d.value / max) * BAR_MAX_H));
        return (
          <View key={d.key} style={{ width: BAR_W }} className="items-center gap-1.5">
            <Text className="font-body-medium text-[10px] text-ink-muted dark:text-ink-dark-muted tabular-nums">
              {formatValue(d.value)}
            </Text>
            <View style={{ height: BAR_MAX_H, justifyContent: 'flex-end' }}>
              <MotiView
                from={{ height: 0 }}
                animate={{ height: h }}
                transition={{ type: 'timing', duration: 550, delay: i * 40 }}
                style={{ width: BAR_W - 8, borderRadius: 8, backgroundColor: color }}
              />
            </View>
            <Text
              numberOfLines={1}
              className="font-body text-[10px] text-ink-muted dark:text-ink-dark-muted">
              {d.label}
            </Text>
          </View>
        );
      })}
    </ScrollView>
  );
}
