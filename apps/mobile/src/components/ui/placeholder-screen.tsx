import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FontFamily, Radius, Spacing, Typography, useThemeColors } from '@/theme';

type IconName = keyof typeof Ionicons.glyphMap;

type Props = {
  title: string;
  subtitle: string;
  icon: IconName;
};

export function PlaceholderScreen({ title, subtitle, icon }: Props) {
  const colors = useThemeColors();
  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>
      <SafeAreaView edges={['top']} style={styles.safe}>
        <View
          style={[styles.iconWrap, { backgroundColor: colors.brandTint }]}>
          <Ionicons name={icon} size={40} color={colors.brand} />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          {subtitle}
        </Text>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  safe: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  title: { ...Typography.h2, textAlign: 'center' },
  subtitle: {
    fontFamily: FontFamily.body,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    maxWidth: 260,
  },
});
