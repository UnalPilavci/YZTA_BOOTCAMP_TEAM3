'use client';

import { Eye, EyeOff, Star, Trash2 } from 'lucide-react';
import { useTransition } from 'react';

import { Button } from '@/components/ui';
import {
  deleteArticleAction,
  toggleFeaturedAction,
  togglePublishAction,
} from '@/features/blog/actions';

export function PublishToggle({ id, published }: { id: string; published: boolean }) {
  const [pending, start] = useTransition();
  return (
    <Button
      variant={published ? 'secondary' : 'primary'}
      size="sm"
      disabled={pending}
      onClick={() => start(() => togglePublishAction(id, !published))}>
      {published ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
      {published ? 'Yayından kaldır' : 'Yayınla'}
    </Button>
  );
}

export function FeatureToggle({ id, featured }: { id: string; featured: boolean }) {
  const [pending, start] = useTransition();
  return (
    <Button
      variant="secondary"
      size="sm"
      disabled={pending}
      onClick={() => start(() => toggleFeaturedAction(id, !featured))}
      className={featured ? 'border-lime bg-lime/20' : ''}>
      <Star className={`h-3.5 w-3.5 ${featured ? 'fill-current' : ''}`} />
      {featured ? 'Öne çıkan' : 'Öne çıkar'}
    </Button>
  );
}

export function DeleteButton({ id, title }: { id: string; title: string }) {
  const [pending, start] = useTransition();
  return (
    <Button
      variant="danger"
      size="sm"
      disabled={pending}
      onClick={() => {
        if (confirm(`"${title}" silinsin mi? Bu geri alınamaz.`)) {
          start(() => deleteArticleAction(id));
        }
      }}>
      <Trash2 className="h-3.5 w-3.5" />
      Sil
    </Button>
  );
}
