import { Coffee, Cookie, Moon, Sun, type LucideIcon } from 'lucide-react-native';

export type DiarySlot = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export type SlotMeta = { id: DiarySlot; Icon: LucideIcon; labelKey: string };

export const DIARY_SLOTS: SlotMeta[] = [
  { id: 'breakfast', Icon: Coffee, labelKey: 'diary.slotBreakfast' },
  { id: 'lunch', Icon: Sun, labelKey: 'diary.slotLunch' },
  { id: 'dinner', Icon: Moon, labelKey: 'diary.slotDinner' },
  { id: 'snack', Icon: Cookie, labelKey: 'diary.slotSnack' },
];

export function defaultSlotForNow(now = new Date()): DiarySlot {
  const h = now.getHours();
  if (h < 11) return 'breakfast';
  if (h < 16) return 'lunch';
  if (h < 21) return 'dinner';
  return 'snack';
}
