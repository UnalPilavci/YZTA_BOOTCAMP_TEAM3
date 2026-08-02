import { colorScheme as nativewindColorScheme } from 'nativewind';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';

import { useSettings } from '@/store/settings';
import { Colors, type ColorScheme, type ThemeColors } from './colors';

export * from './colors';
export * from './tokens';
export { appFonts } from './fonts';

export function useResolvedScheme(): ColorScheme {
  const mode = useSettings((s) => s.theme);
  const system = useColorScheme();
  if (mode === 'system') return system === 'dark' ? 'dark' : 'light';
  return mode;
}

export function useThemeColors(): ThemeColors {
  return Colors[useResolvedScheme()];
}

export function useSyncNativeWindScheme(): void {
  const scheme = useResolvedScheme();
  useEffect(() => {
    nativewindColorScheme.set(scheme);
  }, [scheme]);
}
