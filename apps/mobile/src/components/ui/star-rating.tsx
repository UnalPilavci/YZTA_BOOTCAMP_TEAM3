import { Star } from 'lucide-react-native';
import { Text, View } from 'react-native';

import { PressableScale } from '@/components/ui/pressable-scale';

const LIME = '#DFFB4B';
const GOLD = '#F5B301';

export function StarRating({
  value,
  onRate,
  size = 20,
  count,
}: {
  value: number;
  onRate?: (rating: number) => void;
  size?: number;
  count?: number;
}) {
  const color = onRate ? LIME : GOLD;
  const stars = [1, 2, 3, 4, 5];

  return (
    <View className="flex-row items-center gap-1.5">
      <View className="flex-row items-center gap-0.5">
        {stars.map((n) => {
          const filled = onRate ? value >= n : value >= n - 0.5;
          const star = (
            <Star
              size={size}
              color={color}
              fill={filled ? color : 'transparent'}
              strokeWidth={2}
            />
          );
          if (!onRate) return <View key={n}>{star}</View>;
          return (
            <PressableScale
              key={n}
              haptic="light"
              accessibilityLabel={`${n}`}
              onPress={() => onRate(n)}
              style={{ padding: 3 }}>
              {star}
            </PressableScale>
          );
        })}
      </View>
      {count != null && count > 0 && (
        <Text className="font-body text-[12px] text-ink-muted dark:text-ink-dark-muted tabular-nums">
          {value.toFixed(1)} · {count}
        </Text>
      )}
    </View>
  );
}
