'use client';

import { Trash2 } from 'lucide-react';
import { useTransition } from 'react';

import { Button } from '@/components/ui';
import { deleteListingAction } from '@/features/listings/actions';

export function DeleteListingButton({ id, title }: { id: string; title: string }) {
  const [pending, start] = useTransition();
  return (
    <Button
      variant="danger"
      size="sm"
      disabled={pending}
      onClick={() => confirm(`"${title}" ilanı silinsin mi?`) && start(() => deleteListingAction(id))}>
      <Trash2 className="h-3.5 w-3.5" /> Sil
    </Button>
  );
}
