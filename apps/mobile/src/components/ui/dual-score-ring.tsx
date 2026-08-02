import { Text, View } from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';

import { accentMeal } from '@/theme';

export function DualScoreRing({
  productScore,
  mealScore,
  size = 112,
}: {
  productScore: number;
  mealScore: number;
  size?: number;
}) {
  const stroke = 8;
  const gap = 6;
  const innerSize = size - (stroke + gap) * 2;

  return (
    <AnimatedCircularProgress
      size={size}
      width={stroke}
      fill={mealScore}
      tintColor={accentMeal}
      backgroundColor={`${accentMeal}33`}
      duration={1100}
      lineCap="round">
      {() => (
        <AnimatedCircularProgress
          size={innerSize}
          width={stroke}
          fill={productScore}
          tintColor="#DFFB4B"
          backgroundColor="rgba(255,255,255,0.15)"
          duration={1100}
          lineCap="round">
          {() => (
            <View className="items-center">
              <Text className="font-display text-[20px] leading-[22px] tabular-nums text-white">
                {productScore}
              </Text>
              <Text
                className="font-display text-[13px] leading-[15px] tabular-nums"
                style={{ color: accentMeal }}>
                {mealScore}
              </Text>
            </View>
          )}
        </AnimatedCircularProgress>
      )}
    </AnimatedCircularProgress>
  );
}
