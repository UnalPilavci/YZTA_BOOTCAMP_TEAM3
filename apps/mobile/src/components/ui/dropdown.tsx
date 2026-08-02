import { Check, ChevronDown } from 'lucide-react-native';
import { useState } from 'react';
import { LayoutAnimation, Platform, Text, UIManager, View } from 'react-native';

import { PressableScale } from '@/components/ui/pressable-scale';
import { accentLime, useThemeColors } from '@/theme';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export type DropdownOption = { id: string; label: string };

export function Dropdown({
  label,
  placeholder,
  options,
  selectedId,
  onSelect,
}: {
  label: string;
  placeholder: string;
  options: DropdownOption[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const colors = useThemeColors();
  const [open, setOpen] = useState(false);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen((v) => !v);
  };

  const select = (id: string) => {
    onSelect(id);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen(false);
  };

  const selectedLabel = options.find((o) => o.id === selectedId)?.label ?? '';

  return (
    <View className="gap-2">
      <Text className="font-body-medium text-[13px] text-ink dark:text-ink-dark">{label}</Text>

      <PressableScale haptic="selection" accessibilityLabel={label} onPress={toggle}>
        <View className="flex-row items-center justify-between rounded-xl px-3.5 h-[52px] bg-surface dark:bg-surface-raised-dark border border-border dark:border-border-dark">
          <Text
            className={`flex-1 font-body text-[15px] ${
              selectedLabel ? 'text-ink dark:text-ink-dark' : 'text-ink-muted dark:text-ink-dark-muted'
            }`}
            numberOfLines={1}>
            {selectedLabel || placeholder}
          </Text>
          <View style={{ transform: [{ rotate: open ? '180deg' : '0deg' }] }}>
            <ChevronDown size={18} color={colors.textMuted} />
          </View>
        </View>
      </PressableScale>

      {open && (
        <View className="rounded-xl overflow-hidden bg-surface dark:bg-surface-raised-dark border border-border dark:border-border-dark">
          {options.map((o, i) => {
            const selected = o.id === selectedId;
            return (
              <PressableScale
                key={o.id}
                haptic="selection"
                accessibilityLabel={o.label}
                onPress={() => select(o.id)}>
                <View
                  className={`flex-row items-center justify-between px-3.5 h-[48px] ${
                    i > 0 ? 'border-t border-border dark:border-border-dark' : ''
                  }`}>
                  <Text
                    className={`flex-1 font-body text-[15px] text-ink dark:text-ink-dark ${
                      selected ? 'font-body-medium' : ''
                    }`}
                    numberOfLines={1}>
                    {o.label}
                  </Text>
                  {selected && <Check size={17} color={accentLime} />}
                </View>
              </PressableScale>
            );
          })}
        </View>
      )}
    </View>
  );
}
