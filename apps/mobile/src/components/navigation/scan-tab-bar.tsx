import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { TabTrigger, type TabTriggerSlotProps } from 'expo-router/ui';
import { Compass, Dumbbell, House, Scan, User, type LucideIcon } from 'lucide-react-native';
import { MotiView } from 'moti';
import { MotiPressable } from 'moti/interactions';
import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { GestureResponderEvent } from 'react-native';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  accentLime,
  FontFamily,
  glow,
  MIN_TOUCH,
  onAccentLime,
  Radius,
  Spacing,
  useThemeColors,
} from '@/theme';

type TabDef = {
  name: string;
  labelKey: string;
  Icon: LucideIcon;
};

function syntheticPressEvent(): GestureResponderEvent {
  return {
    isDefaultPrevented: () => false,
    defaultPrevented: false,
    preventDefault: () => {},
  } as unknown as GestureResponderEvent;
}

const TABS_LEFT: TabDef[] = [
  { name: 'index', labelKey: 'tabs.home', Icon: House },
  { name: 'fitness', labelKey: 'tabs.fitness', Icon: Dumbbell },
];

const TABS_RIGHT: TabDef[] = [
  { name: 'insights', labelKey: 'tabs.insights', Icon: Compass },
  { name: 'profile', labelKey: 'tabs.profile', Icon: User },
];

export function ScanTabBar() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useTranslation();

  const onScanPress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    router.push('/scan');
  };

  return (
    <View
      style={[
        styles.wrapper,
        {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          paddingBottom: insets.bottom || Spacing.sm,
        },
      ]}>
      <View style={styles.row}>
        <View style={styles.group}>
          {TABS_LEFT.map((tab) => (
            <TabTrigger key={tab.name} name={tab.name} asChild>
              <TabBarButton tab={tab} />
            </TabTrigger>
          ))}
        </View>

        <View style={styles.fabSlot} />

        <View style={styles.group}>
          {TABS_RIGHT.map((tab) => (
            <TabTrigger key={tab.name} name={tab.name} asChild>
              <TabBarButton tab={tab} />
            </TabTrigger>
          ))}
        </View>
      </View>

      <View style={styles.fabWrap} pointerEvents="box-none">
        <MotiView
          pointerEvents="none"
          style={styles.fabHalo}
          from={{ opacity: 0.4, scale: 0.85 }}
          animate={{ opacity: 0, scale: 1.6 }}
          transition={{ type: 'timing', duration: 1900, loop: true, repeatReverse: false }}
        />
        <MotiPressable
          onPressIn={() =>
            Platform.OS !== 'web' && Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
          }
          onPress={onScanPress}
          accessibilityRole="button"
          accessibilityLabel={t('scan.title')}
          animate={({ pressed }) => ({ scale: pressed ? 0.9 : 1 })}
          transition={{ type: 'spring', damping: 13, stiffness: 300 }}
          style={[styles.fab, glow(accentLime, 0.4), { backgroundColor: accentLime }]}>
          <MotiView
            from={{ scale: 1 }}
            animate={{ scale: 1.08 }}
            transition={{ type: 'timing', duration: 1400, loop: true, repeatReverse: true }}>
            <Scan size={28} color={onAccentLime} strokeWidth={2.25} />
          </MotiView>
        </MotiPressable>
      </View>
    </View>
  );
}

type TabBarButtonProps = TabTriggerSlotProps & { tab: TabDef };

const TabBarButton = forwardRef<View, TabBarButtonProps>(
  ({ tab, isFocused, onPress, onLongPress, disabled, testID }, ref) => {
  const colors = useThemeColors();
  const { t } = useTranslation();
  const tint = isFocused ? colors.text : colors.textMuted;
  const label = t(tab.labelKey);
  const Icon = tab.Icon;

  return (
    <MotiPressable
      ref={ref}
      onPress={onPress ? () => onPress(syntheticPressEvent()) : undefined}
      onLongPress={onLongPress ? () => onLongPress(syntheticPressEvent()) : undefined}
      disabled={disabled ?? undefined}
      testID={testID}
      onPressIn={() => Platform.OS !== 'web' && Haptics.selectionAsync()}
      accessibilityRole="button"
      accessibilityState={{ selected: !!isFocused }}
      accessibilityLabel={label}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      animate={({ pressed }) => ({ scale: pressed ? 0.9 : 1 })}
      transition={{ type: 'spring', damping: 16, stiffness: 320 }}
      style={styles.tabButton}>
      <MotiView
        style={StyleSheet.absoluteFillObject}
        animate={{ opacity: isFocused ? 1 : 0 }}
        transition={{ type: 'timing', duration: 220 }}>
        <View style={[styles.activePill, { backgroundColor: colors.surfaceRaised }]} />
      </MotiView>

      <MotiView
        animate={{ translateY: isFocused ? -2 : 0 }}
        transition={{ type: 'spring', damping: 12, stiffness: 260 }}>
        <Icon size={22} color={tint} strokeWidth={isFocused ? 2.4 : 2} />
      </MotiView>
      <Text numberOfLines={1} style={[styles.tabLabel, { color: tint }]}>
        {label}
      </Text>
    </MotiPressable>
  );
});

TabBarButton.displayName = 'TabBarButton';

const FAB_SIZE = 64;

const styles = StyleSheet.create({
  wrapper: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: Spacing.sm,
    overflow: 'visible',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
  },
  group: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  fabSlot: {
    width: FAB_SIZE + Spacing.lg,
  },
  tabButton: {
    minWidth: MIN_TOUCH,
    minHeight: MIN_TOUCH,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingVertical: Spacing.xs,
  },
  activePill: {
    flex: 1,
    margin: 2,
    borderRadius: Radius.md,
  },
  tabLabel: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 11,
    lineHeight: 14,
  },
  fabWrap: {
    position: 'absolute',
    left: '50%',
    marginLeft: -FAB_SIZE / 2,
    top: -FAB_SIZE * 0.2,
    width: FAB_SIZE,
    height: FAB_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  fab: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabHalo: {
    position: 'absolute',
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: 22,
    backgroundColor: accentLime,
  },
});
