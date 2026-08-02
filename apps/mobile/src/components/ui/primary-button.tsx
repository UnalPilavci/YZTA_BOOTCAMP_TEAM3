import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { MotiPressable } from 'moti/interactions';
import { Platform, StyleSheet, Text, type ViewStyle } from 'react-native';

import { accentLime, FontFamily, glow, onAccentLime, Radius, Spacing } from '@/theme';

type IconName = keyof typeof Ionicons.glyphMap;

type Props = {
  label: string;
  onPress: () => void;
  icon?: IconName | null;
  style?: ViewStyle;
};

export function PrimaryButton({
  label,
  onPress,
  icon = 'arrow-forward',
  style,
}: Props) {
  return (
    <MotiPressable
      onPressIn={() =>
        Platform.OS !== 'web' && Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      }
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      animate={({ pressed }) => ({ scale: pressed ? 0.97 : 1 })}
      transition={{ type: 'spring', damping: 16, stiffness: 320 }}
      style={[styles.button, glow(accentLime, 0.3), style]}>
      <Text style={styles.label}>{label}</Text>
      {icon && <Ionicons name={icon} size={20} color={onAccentLime} />}
    </MotiPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 54,
    borderRadius: Radius.md,
    backgroundColor: accentLime,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  label: { fontFamily: FontFamily.heading, fontSize: 16, color: onAccentLime },
});
