import { Switch } from 'react-native';

import { accentLime, useThemeColors } from '@/theme';

export function Toggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  const colors = useThemeColors();
  return (
    <Switch
      value={value}
      onValueChange={onChange}
      trackColor={{ false: colors.border, true: accentLime }}
      thumbColor="#FFFFFF"
      ios_backgroundColor={colors.border}
    />
  );
}
