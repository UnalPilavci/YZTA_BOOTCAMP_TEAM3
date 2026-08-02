import * as Haptics from 'expo-haptics';
import type { LucideIcon } from 'lucide-react-native';
import { Platform, Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { accentLime, useThemeColors } from '@/theme';

export type SegmentItem<K extends string> = {
  key: K;
  labelKey: string;
  Icon: LucideIcon;
};

export function SegmentControl<K extends string>({
  segments,
  value,
  onChange,
}: {
  segments: SegmentItem<K>[];
  value: K;
  onChange: (k: K) => void;
}) {
  return (
    <View className="flex-row overflow-hidden rounded-pill p-1 bg-surface dark:bg-surface-dark border border-border dark:border-border-dark">
      {segments.map((s) => (
        <SegmentButton
          key={s.key}
          Icon={s.Icon}
          labelKey={s.labelKey}
          active={value === s.key}
          onPress={() => onChange(s.key)}
        />
      ))}
    </View>
  );
}

function SegmentButton({
  Icon,
  labelKey,
  active,
  onPress,
}: {
  Icon: LucideIcon;
  labelKey: string;
  active: boolean;
  onPress: () => void;
}) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const tint = active ? accentLime : colors.textMuted;
  const label = t(labelKey);

  return (
    <View className="flex-1">
      <Pressable
        onPress={onPress}
        onPressIn={() => Platform.OS !== 'web' && Haptics.selectionAsync()}
        accessibilityRole="button"
        accessibilityState={{ selected: active }}
        accessibilityLabel={label}
        className={`flex-row items-center justify-center gap-2 py-2.5 rounded-pill ${
          active ? 'bg-[#101410] dark:bg-surface-raised-dark' : ''
        }`}>
        <Icon size={17} color={tint} strokeWidth={active ? 2.4 : 2} />
        <Text
          numberOfLines={1}
          className="font-body-medium text-[14px]"
          style={{ color: tint }}>
          {label}
        </Text>
      </Pressable>
    </View>
  );
}
