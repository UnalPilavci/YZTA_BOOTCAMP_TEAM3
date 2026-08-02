'use client';

import {
  BookOpen,
  Dumbbell,
  LayoutDashboard,
  Mail,
  Megaphone,
  MessagesSquare,
  MessageSquareText,
  ScrollText,
  Settings,
  Tags,
  Users,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';

type NavItem = { href: string; label: string; Icon: LucideIcon; soon?: boolean; adminOnly?: boolean };

const ITEMS: NavItem[] = [
  { href: '/', label: 'Genel Bakış', Icon: LayoutDashboard, adminOnly: true },
  { href: '/blog', label: 'Blog', Icon: BookOpen },
  { href: '/categories', label: 'Kategoriler', Icon: Tags, adminOnly: true },
  { href: '/exercises', label: 'Spor Hareketleri', Icon: Dumbbell, adminOnly: true },
  { href: '/users', label: 'Kullanıcılar', Icon: Users, adminOnly: true },
  { href: '/community', label: 'Topluluk & Moderasyon', Icon: MessagesSquare, adminOnly: true },
  { href: '/listings', label: 'İlanlar', Icon: Megaphone, adminOnly: true },
  { href: '/feedback', label: 'Geri Bildirim', Icon: MessageSquareText, adminOnly: true },
  { href: '/newsletter', label: 'Bülten Aboneleri', Icon: Mail, adminOnly: true },
  { href: '/settings', label: 'Ayarlar', Icon: Settings, adminOnly: true },
  { href: '/audit', label: 'Denetim Kaydı', Icon: ScrollText, adminOnly: true },
];

export function Nav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const items = isAdmin ? ITEMS : ITEMS.filter((i) => !i.adminOnly);

  return (
    <nav className="flex flex-col gap-1 px-3 py-4">
      {items.map(({ href, label, Icon, soon }) => {
        const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
        const content = (
          <span
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
              active ? 'bg-lime text-lime-on font-medium' : 'text-white/70 hover:bg-white/10',
              soon && 'cursor-default opacity-50 hover:bg-transparent',
            )}>
            <Icon className="h-4 w-4" />
            <span className="flex-1">{label}</span>
            {soon && <span className="text-[10px] uppercase tracking-wide">yakında</span>}
          </span>
        );
        return soon ? (
          <div key={href}>{content}</div>
        ) : (
          <Link key={href} href={href}>
            {content}
          </Link>
        );
      })}
    </nav>
  );
}
