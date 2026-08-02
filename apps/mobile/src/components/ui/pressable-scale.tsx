import * as Haptics from 'expo-haptics';
import { MotiPressable } from 'moti/interactions';
import type { ReactNode } from 'react';
import { Platform, type ViewStyle } from 'react-native';

type HapticKind = 'light' | 'medium' | 'selection' | 'none';

function fireHaptic(kind: HapticKind) {
  if (Platform.OS === 'web' || kind === 'none') return;
  if (kind === 'selection') {
    void Haptics.selectionAsync();
    return;
  }
  void Haptics.impactAsync(
    kind === 'medium' ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light,
  );
}

type Props = {
  onPress?: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
  children: ReactNode;
  accessibilityRole?: 'button';
  accessibilityLabel?: string;
  haptic?: HapticKind;
  style?: ViewStyle;
};

export function PressableScale({
  onPress,
  onLongPress,
  disabled,
  children,
  accessibilityRole = 'button',
  accessibilityLabel,
  haptic = 'light',
  style,
}: Props) {
  return (
    <MotiPressable
      disabled={disabled}
      onPressIn={() => fireHaptic(haptic)}
      onPress={onPress}
      onLongPress={onLongPress}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      animate={({ pressed }) => ({ scale: pressed ? 0.96 : 1 })}
      transition={{ type: 'spring', damping: 16, stiffness: 320 }}
      style={[disabled ? { opacity: 0.5 } : undefined, style]}
    >
      {children}
    </MotiPressable>
  );
}
