import { View, type ViewProps } from 'react-native';

import { useResolvedScheme } from '@/theme';

type Elevation = 'card' | 'raised' | 'none';

const SHADOW: Record<Exclude<Elevation, 'none'>, object> = {
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
};

type Props = ViewProps & { className?: string; elevation?: Elevation };

export function Card({ className = '', elevation = 'card', style, ...props }: Props) {
  const scheme = useResolvedScheme();
  const shadow = scheme === 'dark' || elevation === 'none' ? {} : SHADOW[elevation];
  return (
    <View
      className={`rounded-card border border-border dark:border-border-dark bg-surface dark:bg-surface-dark ${className}`}
      style={[shadow, style]}
      {...props}
    />
  );
}
