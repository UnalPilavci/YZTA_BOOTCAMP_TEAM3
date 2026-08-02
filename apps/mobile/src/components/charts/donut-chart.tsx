import { Text, View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

import { useThemeColors } from '@/theme';

export type DonutSegment = { key: string; value: number; color: string };

export function DonutChart({
  segments,
  size = 132,
  strokeWidth = 20,
  centerValue,
  centerLabel,
}: {
  segments: DonutSegment[];
  size?: number;
  strokeWidth?: number;
  centerValue: string;
  centerLabel: string;
}) {
  const colors = useThemeColors();
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const r = (size - strokeWidth) / 2;
  const c = 2 * Math.PI * r;
  const center = size / 2;

  let acc = 0;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <G rotation={-90} origin={`${center}, ${center}`}>
          <Circle
            cx={center}
            cy={center}
            r={r}
            stroke={colors.border}
            strokeWidth={strokeWidth}
            fill="none"
          />
          {total > 0 &&
            segments.map((s) => {
              if (s.value <= 0) return null;
              const frac = s.value / total;
              const dash = frac * c;
              const offset = -acc * c;
              acc += frac;
              return (
                <Circle
                  key={s.key}
                  cx={center}
                  cy={center}
                  r={r}
                  stroke={s.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${dash} ${c - dash}`}
                  strokeDashoffset={offset}
                  strokeLinecap="butt"
                  fill="none"
                />
              );
            })}
        </G>
      </Svg>

      <View
        pointerEvents="none"
        className="items-center justify-center"
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
        <Text className="font-display text-[22px] text-ink dark:text-ink-dark tabular-nums">
          {centerValue}
        </Text>
        <Text className="font-body text-[10px] text-ink-muted dark:text-ink-dark-muted">
          {centerLabel}
        </Text>
      </View>
    </View>
  );
}
