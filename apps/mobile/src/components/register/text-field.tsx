import type { LucideIcon } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Text, TextInput, View, type TextInputProps } from 'react-native';

import { useThemeColors } from '@/theme';

type Props = {
  label: string;
  hint?: string;
  hintTone?: 'muted' | 'danger';
  Icon?: LucideIcon;
  leftAccessory?: ReactNode;
  rightAccessory?: ReactNode;
  error?: string;
} & Pick<
  TextInputProps,
  | 'value'
  | 'onChangeText'
  | 'placeholder'
  | 'secureTextEntry'
  | 'keyboardType'
  | 'autoCapitalize'
  | 'autoComplete'
  | 'maxLength'
  | 'returnKeyType'
  | 'onSubmitEditing'
  | 'editable'
>;

export function TextField({
  label,
  hint,
  hintTone = 'muted',
  Icon,
  leftAccessory,
  rightAccessory,
  error,
  ...input
}: Props) {
  const colors = useThemeColors();
  const borderClass = error
    ? 'border-danger'
    : 'border-border dark:border-border-dark';

  return (
    <View className="gap-2">
      <View className="flex-row items-center justify-between">
        <Text className="font-body-medium text-[13px] text-ink dark:text-ink-dark">
          {label}
        </Text>
        {hint && (
          <Text
            className={`font-body text-[11px] ${
              hintTone === 'danger'
                ? 'text-danger'
                : 'text-ink-muted dark:text-ink-dark-muted'
            }`}>
            {hint}
          </Text>
        )}
      </View>
      <View
        className={`flex-row items-center gap-2.5 h-[52px] rounded-xl px-3.5 bg-surface dark:bg-surface-raised-dark border ${borderClass}`}>
        {leftAccessory}
        {Icon && <Icon size={18} color={colors.textMuted} />}
        <TextInput
          placeholderTextColor={colors.textMuted}
          className="flex-1 font-body text-[15px] text-ink dark:text-ink-dark"
          {...input}
        />
        {rightAccessory}
      </View>
      {error && (
        <Text className="font-body text-[11px] text-danger">{error}</Text>
      )}
    </View>
  );
}
