'use client';

import { Ban, Loader2, PenSquare, ShieldCheck, Trash2, UserCheck } from 'lucide-react';
import { useTransition } from 'react';

import { Button, Select } from '@/components/ui';
import {
  deleteUserAction,
  setAdminAction,
  setBannedAction,
  setBloggerAction,
  setPlanAction,
  setTrainerAction,
} from '@/features/users/actions';
import type { PlanId } from '@/features/users/service';

export function PlanControl({ id, plan }: { id: string; plan: PlanId }) {
  const [pending, start] = useTransition();
  return (
    <div className="flex items-center gap-2">
      <Select
        defaultValue={plan}
        disabled={pending}
        onChange={(e) => start(() => setPlanAction(id, e.target.value as PlanId))}
        className="w-40">
        <option value="free">Free</option>
        <option value="premium">Premium</option>
        <option value="pro">Pro</option>
      </Select>
      {pending && <Loader2 className="h-4 w-4 animate-spin text-muted" />}
    </div>
  );
}

export function TrainerControl({ id, isTrainer }: { id: string; isTrainer: boolean }) {
  const [pending, start] = useTransition();
  return (
    <Button
      variant="secondary"
      size="sm"
      disabled={pending}
      onClick={() => start(() => setTrainerAction(id, !isTrainer))}>
      <UserCheck className="h-3.5 w-3.5" />
      {isTrainer ? 'Antrenör rozetini al' : 'Antrenör rozeti ver'}
    </Button>
  );
}

export function AdminControl({ id, isAdmin }: { id: string; isAdmin: boolean }) {
  const [pending, start] = useTransition();
  return (
    <Button
      variant="secondary"
      size="sm"
      disabled={pending}
      onClick={() => start(() => setAdminAction(id, !isAdmin))}
      className={isAdmin ? 'border-lime bg-lime/20' : ''}>
      <ShieldCheck className="h-3.5 w-3.5" />
      {isAdmin ? 'Admin yetkisini al' : 'Admin yap'}
    </Button>
  );
}

export function BloggerControl({ id, isBlogger }: { id: string; isBlogger: boolean }) {
  const [pending, start] = useTransition();
  return (
    <Button
      variant="secondary"
      size="sm"
      disabled={pending}
      onClick={() => start(() => setBloggerAction(id, !isBlogger))}
      className={isBlogger ? 'border-lime bg-lime/20' : ''}>
      <PenSquare className="h-3.5 w-3.5" />
      {isBlogger ? 'Blog yazarlığını al' : 'Blog yazarı yap'}
    </Button>
  );
}

export function BanControl({ id, banned }: { id: string; banned: boolean }) {
  const [pending, start] = useTransition();
  return (
    <Button
      variant={banned ? 'secondary' : 'danger'}
      size="sm"
      disabled={pending}
      onClick={() => start(() => setBannedAction(id, !banned))}>
      <Ban className="h-3.5 w-3.5" />
      {banned ? 'Askıyı kaldır' : 'Askıya al'}
    </Button>
  );
}

export function DeleteUserControl({ id, label }: { id: string; label: string }) {
  const [pending, start] = useTransition();
  return (
    <Button
      variant="danger"
      size="sm"
      disabled={pending}
      onClick={() => {
        if (confirm(`"${label}" hesabı KALICI olarak silinsin mi? Bu geri alınamaz (KVKK).`)) {
          start(() => deleteUserAction(id));
        }
      }}>
      <Trash2 className="h-3.5 w-3.5" />
      Hesabı sil
    </Button>
  );
}
