'use client';

import { Trash2 } from 'lucide-react';
import { useTransition } from 'react';

import { Button } from '@/components/ui';
import { deleteFeedbackAction } from '@/features/feedback/actions';

export function DeleteFeedbackButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return (
    <Button
      variant="danger"
      size="sm"
      disabled={pending}
      onClick={() => confirm('Bu geri bildirim silinsin mi?') && start(() => deleteFeedbackAction(id))}>
      <Trash2 className="h-3.5 w-3.5" /> Sil
    </Button>
  );
}
