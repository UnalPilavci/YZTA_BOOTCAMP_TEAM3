'use client';

import { Check, Trash2, X } from 'lucide-react';
import { useTransition } from 'react';

import { Button } from '@/components/ui';
import {
  deleteCommentAction,
  deletePostAction,
  setReportStatusAction,
} from '@/features/moderation/actions';
import type { ReportStatus } from '@/features/moderation/service';

export function DeletePostButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return (
    <Button
      variant="danger"
      size="sm"
      disabled={pending}
      onClick={() => confirm('Bu gönderi silinsin mi?') && start(() => deletePostAction(id))}>
      <Trash2 className="h-3.5 w-3.5" /> Sil
    </Button>
  );
}

export function DeleteCommentButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return (
    <Button
      variant="danger"
      size="sm"
      disabled={pending}
      onClick={() => confirm('Bu yorum silinsin mi?') && start(() => deleteCommentAction(id))}>
      <Trash2 className="h-3.5 w-3.5" /> Sil
    </Button>
  );
}

export function ReportActions({ id, status }: { id: string; status: ReportStatus }) {
  const [pending, start] = useTransition();
  const set = (s: ReportStatus) => start(() => setReportStatusAction(id, s));
  if (status === 'resolved' || status === 'dismissed') {
    return (
      <Button variant="ghost" size="sm" disabled={pending} onClick={() => set('open')}>
        Yeniden aç
      </Button>
    );
  }
  return (
    <div className="flex items-center justify-end gap-2">
      <Button variant="secondary" size="sm" disabled={pending} onClick={() => set('resolved')}>
        <Check className="h-3.5 w-3.5" /> Çözüldü
      </Button>
      <Button variant="ghost" size="sm" disabled={pending} onClick={() => set('dismissed')}>
        <X className="h-3.5 w-3.5" /> Reddet
      </Button>
    </div>
  );
}
