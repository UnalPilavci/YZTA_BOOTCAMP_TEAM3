import { useAuth } from '@/store/auth';
import { useDiary } from '@/store/diary';
import { useDiscoverProfile } from '@/store/discover';
import { useMeals } from '@/store/meals';
import { useProfile } from '@/store/profile';
import { useSaved } from '@/store/saved';
import { useScans } from '@/store/scans';

export function clearLocalUserData(): void {
  useProfile.getState().reset();
  useScans.getState().clear();
  useMeals.getState().clear();
  useDiary.getState().clear();
  useDiscoverProfile.getState().reset();
  useSaved.getState().reset();
}

export async function signOutAndClear(): Promise<void> {
  clearLocalUserData();
  try {
    await useAuth.getState().signOut();
  } catch {
  }
}

export async function deleteAccountAndClear(): Promise<void> {
  await useAuth.getState().deleteAccount();
  clearLocalUserData();
}
