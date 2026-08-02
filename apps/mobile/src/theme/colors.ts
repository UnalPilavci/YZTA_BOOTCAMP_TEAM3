export const palette = {
  green50: '#EEF0E7',
  green100: '#DCE1D0',
  green200: '#C3CDB0',
  green300: '#A8B896',
  green400: '#8FA377',
  green500: '#5A6650',
  green600: '#4A5442',
  green700: '#3A4235',
  green800: '#262B21',

  oliveAccent: '#DFFB4B',
  oliveAccentDark: '#DFFB4B',

  clay: '#C46F4E',
  claySoft: '#E3A184',
  coral: '#FF7A5A',
  amber: '#F2A73B',
  sky: '#2CB8DE',
  violet: '#8B7BF0',
  honey: '#E3A72E',
  teal: '#2FAFC4',
  olive: '#65A30D',

  white: '#FFFFFF',
  cream: '#FDFDFB',
  creamCard: '#F1F3EE',
  warmText: '#101410',
  warmMuted: '#7A857A',
  warmBorder: '#E7E9E3',

  inkBg: '#0C0F0C',
  inkSurface: '#161B15',
  inkRaised: '#1A1F1A',
  inkText: '#F4F6F1',
  inkMuted: '#8A928A',
  inkBorder: '#232B22',
} as const;

export const accentLime = '#DFFB4B';
export const onAccentLime = '#0C0F0C';

export const accentMeal = '#FF2E7E';

export const brandGradient = ['#141814', '#101410'] as const;
export const brandGradientDark = ['#181D17', '#161B15'] as const;

export const scoreColors = {
  A: '#2FA34B',
  B: '#84BB2E',
  C: '#E6B325',
  D: '#E67E2E',
  E: '#DB4C40',
} as const;

export type ScoreGrade = keyof typeof scoreColors;

export function getScore(value: number): { grade: ScoreGrade; color: string } {
  if (value >= 80) return { grade: 'A', color: scoreColors.A };
  if (value >= 65) return { grade: 'B', color: scoreColors.B };
  if (value >= 45) return { grade: 'C', color: scoreColors.C };
  if (value >= 25) return { grade: 'D', color: scoreColors.D };
  return { grade: 'E', color: scoreColors.E };
}

export function readableText(hex: string): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.6 ? '#0C0F0C' : '#FFFFFF';
}

export const stateColors = {
  safe: '#7CB342',
  caution: '#F5A623',
  risk: '#E24C4C',
  info: '#4E7C59',
} as const;

export type ColorScheme = 'light' | 'dark';

export type ThemeColors = {
  brand: string;
  brandBright: string;
  brandDeep: string;
  brandTint: string;
  onBrand: string;
  accentBrand: string;
  accent: string;
  accentCitrus: string;
  lime: string;
  onLime: string;
  pulse: string;
  pulseTrack: string;
  bg: string;
  surface: string;
  surfaceRaised: string;
  text: string;
  textMuted: string;
  border: string;
  scrim: string;
};

export const Colors: Record<ColorScheme, ThemeColors> = {
  light: {
    brand: palette.green500,
    brandBright: palette.green400,
    brandDeep: palette.green700,
    brandTint: palette.green50,
    onBrand: palette.white,
    accentBrand: palette.oliveAccent,
    accent: '#D9674A',
    accentCitrus: palette.honey,
    lime: accentLime,
    onLime: onAccentLime,
    pulse: '#B9E01F',
    pulseTrack: '#E6EAD8',

    bg: palette.cream,
    surface: palette.creamCard,
    surfaceRaised: palette.creamCard,
    text: palette.warmText,
    textMuted: palette.warmMuted,
    border: palette.warmBorder,
    scrim: 'rgba(12,15,12,0.5)',
  },
  dark: {
    brand: '#B8C99A',
    brandBright: '#CFE0B0',
    brandDeep: palette.green500,
    brandTint: '#20261D',
    onBrand: '#0A140D',
    accentBrand: palette.oliveAccentDark,
    accent: '#FF8A5C',
    accentCitrus: '#F0C24A',
    lime: accentLime,
    onLime: onAccentLime,
    pulse: accentLime,
    pulseTrack: '#232B1C',

    bg: palette.inkBg,
    surface: palette.inkSurface,
    surfaceRaised: palette.inkRaised,
    text: palette.inkText,
    textMuted: palette.inkMuted,
    border: palette.inkBorder,
    scrim: 'rgba(0,0,0,0.65)',
  },
};

export const heroSurface: Record<ColorScheme, { bg: string; text: string; muted: string; border: string }> = {
  light: { bg: '#101410', text: '#FFFFFF', muted: '#8A928A', border: 'transparent' },
  dark: { bg: palette.inkSurface, text: palette.inkText, muted: '#7E867C', border: palette.inkBorder },
};
