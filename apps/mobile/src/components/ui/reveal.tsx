import { MotiView } from 'moti';
import type { ReactNode } from 'react';
import type { ViewStyle } from 'react-native';

type Props = {
  index?: number;
  delayStep?: number;
  baseDelay?: number;
  children: ReactNode;
  style?: ViewStyle;
};

export function Reveal({ index = 0, delayStep = 70, baseDelay = 0, children, style }: Props) {
  return (
    <MotiView
      style={style}
      from={{ opacity: 0, translateY: 18 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{
        type: 'timing',
        duration: 420,
        delay: baseDelay + index * delayStep,
      }}
    >
      {children}
    </MotiView>
  );
}
