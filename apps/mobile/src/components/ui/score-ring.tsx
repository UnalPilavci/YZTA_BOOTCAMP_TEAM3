import { Text, View } from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';

import { getScore } from '@/theme';

type Props = {
  value: number;
  size?: number;
  strokeWidth?: number;
  trackColor?: string;
  showGrade?: boolean;
  duration?: number;
  textColor?: string;
  ringColor?: string;
};

export function ScoreRing({
  value,
  size = 120,
  strokeWidth = 10,
  trackColor,
  showGrade = true,
  duration = 1100,
  textColor,
  ringColor,
}: Props) {
  const { grade, color: scoreColor } = getScore(value);
  const color = ringColor ?? scoreColor;

  return (
    <AnimatedCircularProgress
      size={size}
      width={strokeWidth}
      fill={value}
      tintColor={color}
      backgroundColor={trackColor ?? `${color}22`}
      duration={duration}
      lineCap="round"
    >
      {(fill: number) =>
        showGrade ? (
          <View className="items-center">
            <Text
              className="font-display text-ink dark:text-ink-dark"
              style={[{ fontSize: size * 0.34 }, textColor ? { color: textColor } : null]}
            >
              {grade}
            </Text>
            <Text
              className="font-body-medium text-ink-muted dark:text-ink-dark-muted text-xs mt-0.5 tabular-nums"
              style={textColor ? { color: textColor } : null}
            >
              {value} / 100
            </Text>
          </View>
        ) : (
          <Text
            className="font-display text-ink dark:text-ink-dark tabular-nums"
            style={[{ fontSize: size * 0.28 }, textColor ? { color: textColor } : null]}
          >
            {Math.round(fill)}
          </Text>
        )
      }
    </AnimatedCircularProgress>
  );
}
