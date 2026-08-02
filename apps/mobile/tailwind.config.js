module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        lime: {
          DEFAULT: '#DFFB4B',
          on: '#0C0F0C',
        },
        brand: {
          DEFAULT: '#5A6650',
          bright: '#8FA377',
          deep: '#3A4235',
          tint: '#EEF0E7',
          dark: '#B8C99A',
          'dark-tint': '#20261D',
        },
        accent: {
          DEFAULT: '#D9674A',
          dark: '#FF8A5C',
        },
        cream: '#FDFDFB',
        ink: {
          DEFAULT: '#101410',
          muted: '#7A857A',
          dark: '#F4F6F1',
          'dark-muted': '#8A928A',
        },
        surface: {
          DEFAULT: '#F1F3EE',
          dark: '#161B15',
          raised: '#F1F3EE',
          'raised-dark': '#1A1F1A',
        },
        border: {
          DEFAULT: '#E7E9E3',
          dark: '#232B22',
        },
        safe: '#7CB342',
        warning: '#F5A623',
        danger: '#E24C4C',
      },
      borderRadius: {
        card: '16px',
        pill: '999px',
      },
      fontFamily: {
        display: ['SpaceGrotesk_700Bold'],
        heading: ['SpaceGrotesk_600SemiBold'],
        'heading-medium': ['SpaceGrotesk_500Medium'],
        body: ['DMSans_400Regular'],
        'body-medium': ['DMSans_500Medium'],
        'body-bold': ['DMSans_700Bold'],
      },
    },
  },
  plugins: [],
};
