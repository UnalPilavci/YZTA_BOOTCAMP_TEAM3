import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0C0F0C',
        lime: '#DFFB4B',
        'lime-on': '#0C0F0C',
        cream: '#F7F7F2',
        meal: '#FF2E7E',
        muted: '#6B7280',
        line: '#E6E7E2',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
