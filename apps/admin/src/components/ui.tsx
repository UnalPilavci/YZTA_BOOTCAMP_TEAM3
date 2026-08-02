import Link from 'next/link';
import type { ComponentProps } from 'react';

import { cn } from '@/lib/utils';

const btnBase =
  'inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none';
const btnVariants = {
  primary: 'bg-ink text-lime hover:bg-ink/90',
  secondary: 'bg-white border border-line text-ink hover:bg-cream',
  danger: 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100',
  ghost: 'text-muted hover:text-ink hover:bg-cream',
} as const;
const btnSizes = { md: 'h-9 px-4', sm: 'h-8 px-3 text-[13px]', icon: 'h-8 w-8' } as const;

type BtnStyle = { variant?: keyof typeof btnVariants; size?: keyof typeof btnSizes };

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: ComponentProps<'button'> & BtnStyle) {
  return <button className={cn(btnBase, btnVariants[variant], btnSizes[size], className)} {...props} />;
}

export function LinkButton({
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: ComponentProps<typeof Link> & BtnStyle) {
  return <Link className={cn(btnBase, btnVariants[variant], btnSizes[size], className)} {...props} />;
}

export function Input({ className, ...props }: ComponentProps<'input'>) {
  return (
    <input
      className={cn(
        'w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-ink',
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: ComponentProps<'textarea'>) {
  return (
    <textarea
      className={cn(
        'w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-ink',
        className,
      )}
      {...props}
    />
  );
}

export function Select({ className, ...props }: ComponentProps<'select'>) {
  return (
    <select
      className={cn(
        'w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-ink',
        className,
      )}
      {...props}
    />
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-ink">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );
}

export function Badge({
  children,
  color = '#6B7280',
  className,
}: {
  children: React.ReactNode;
  color?: string;
  className?: string;
}) {
  return (
    <span
      className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', className)}
      style={{ backgroundColor: `${color}1a`, color }}>
      {children}
    </span>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="mb-6 flex items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold text-ink">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      </div>
      {action}
    </header>
  );
}
