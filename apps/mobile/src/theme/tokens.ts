import { Platform, type TextStyle, type ViewStyle } from 'react-native';

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
  huge: 64,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 20,
  xl: 28,
  pill: 999,
} as const;

export const FontFamily = {
  display: 'SpaceGrotesk_700Bold',
  heading: 'SpaceGrotesk_600SemiBold',
  headingMedium: 'SpaceGrotesk_500Medium',
  body: 'DMSans_400Regular',
  bodyMedium: 'DMSans_500Medium',
  bodyBold: 'DMSans_700Bold',
} as const;

export const Typography = {
  display: { fontFamily: FontFamily.display, fontSize: 44, lineHeight: 48 },
  h1: { fontFamily: FontFamily.heading, fontSize: 28, lineHeight: 34 },
  h2: { fontFamily: FontFamily.heading, fontSize: 22, lineHeight: 28 },
  h3: { fontFamily: FontFamily.heading, fontSize: 18, lineHeight: 24 },
  body: { fontFamily: FontFamily.body, fontSize: 16, lineHeight: 24 },
  bodyMedium: { fontFamily: FontFamily.bodyMedium, fontSize: 16, lineHeight: 24 },
  label: { fontFamily: FontFamily.bodyMedium, fontSize: 14, lineHeight: 20 },
  caption: { fontFamily: FontFamily.body, fontSize: 12, lineHeight: 16 },
} satisfies Record<string, TextStyle>;

export const Elevation = {
  card: {
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  raised: {
    shadowColor: '#0F172A',
    shadowOpacity: 0.1,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
} satisfies Record<string, ViewStyle>;

export function glow(color: string, opacity = 0.26): ViewStyle {
  return {
    shadowColor: color,
    shadowOpacity: opacity,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  };
}

export const tabularNums: TextStyle = {
  fontVariant: ['tabular-nums'],
};

export const MIN_TOUCH = 44;

export const isIOS = Platform.OS === 'ios';
