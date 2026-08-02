import type { ComponentProps } from 'react';
import { Skeleton as MotiSkeleton } from 'moti/skeleton';

import { useResolvedScheme } from '@/theme';

type Props = ComponentProps<typeof MotiSkeleton>;

export function Skeleton(props: Props) {
  const scheme = useResolvedScheme();
  return <MotiSkeleton colorMode={scheme} radius={12} {...props} />;
}

Skeleton.Group = MotiSkeleton.Group;
