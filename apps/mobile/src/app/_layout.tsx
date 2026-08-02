import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { AppState } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import '../global.css';
import '@/i18n';
import { MaintenanceGate } from '@/components/app-config/maintenance-gate';
import { useAppConfig } from '@/store/app-config';
import { useAuth } from '@/store/auth';
import { useDiary, useDiaryHydrated } from '@/store/diary';
import { useDiscoverHydrated, useDiscoverProfile } from '@/store/discover';
import { useMeals, useMealsHydrated } from '@/store/meals';
import { useProfile, useProfileHydrated } from '@/store/profile';
import { useSaved } from '@/store/saved';
import { useScans, useScansHydrated } from '@/store/scans';
import { useSettingsHydrated } from '@/store/settings';
import { appFonts, Colors, useResolvedScheme, useSyncNativeWindScheme } from '@/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(appFonts);
  const profileHydrated = useProfileHydrated();
  const settingsHydrated = useSettingsHydrated();
  const scansHydrated = useScansHydrated();
  const mealsHydrated = useMealsHydrated();
  const diaryHydrated = useDiaryHydrated();
  const discoverHydrated = useDiscoverHydrated();
  const sessionReady = useAuth((s) => s.sessionReady);

  useEffect(() => useAuth.getState().init(), []);

  const ready =
    (fontsLoaded || !!fontError) &&
    profileHydrated &&
    settingsHydrated &&
    scansHydrated &&
    mealsHydrated &&
    diaryHydrated &&
    discoverHydrated &&
    sessionReady;

  useEffect(() => {
    if (ready) {
      SplashScreen.hideAsync();
    }
  }, [ready]);

  if (!ready) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <RootNavigator />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function RootNavigator() {
  const scheme = useResolvedScheme();
  const colors = Colors[scheme];
  useSyncNativeWindScheme();
  const completed = useProfile((s) => s.completed);
  const profileStatus = useProfile((s) => s.status);
  const signedIn = useAuth((s) => s.signedIn);
  const userId = useAuth((s) => s.userId);
  const email = useAuth((s) => s.email);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (signedIn && userId) {
      void useProfile.getState().loadFromServer(userId, email ?? '');
      void useScans.getState().syncFromServer(userId);
      void useMeals.getState().syncFromServer(userId);
      void useDiary.getState().syncFromServer(userId);
      void useDiscoverProfile.getState().loadFromServer(userId);
      void useSaved.getState().loadFromServer(userId);
    }
  }, [signedIn, userId, email]);

  useEffect(() => {
    void useAppConfig.getState().syncFromServer();
  }, []);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      if (next !== 'active') return;
      void useAppConfig.getState().syncFromServer();
      const { signedIn: isIn, userId: uid } = useAuth.getState();
      if (isIn && uid) {
        void useScans.getState().syncFromServer(uid);
        void useMeals.getState().syncFromServer(uid);
        void useDiary.getState().syncFromServer(uid);
      }
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    const seg0 = segments[0];
    const inLogin = seg0 === 'login';
    const inRegister = seg0 === '(register)';
    const inPublic = seg0 === 'forgot-password' || seg0 === 'privacy';

    if (!signedIn) {
      if (!inLogin && !inRegister && !inPublic) router.replace('/login');
      return;
    }

    if (profileStatus !== 'ready') return;

    if (!completed) {
      if (!inRegister) router.replace('/account');
    } else if (inLogin || inRegister) {
      router.replace('/');
    }
  }, [completed, profileStatus, signedIn, segments, router]);

  return (
    <>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg },
        }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(register)" />
        <Stack.Screen name="login" />
        <Stack.Screen name="forgot-password" />
        <Stack.Screen name="privacy" />
        <Stack.Screen
          name="scan"
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="result"
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="meal-result"
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen name="history" />
        <Stack.Screen name="health-report" />
        <Stack.Screen name="diary" />
        <Stack.Screen
          name="diary-add"
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen name="edit-conditions" />
        <Stack.Screen name="edit-allergens" />
        <Stack.Screen name="edit-sensitivities" />
        <Stack.Screen name="edit-diets" />
        <Stack.Screen name="edit-body" />
        <Stack.Screen name="edit-goal" />
        <Stack.Screen name="dictionary" />
        <Stack.Screen name="saved" />
        <Stack.Screen name="search" />
        <Stack.Screen name="daily-tip" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="privacy-settings" />
        <Stack.Screen name="change-password" />
        <Stack.Screen name="help" />
        <Stack.Screen name="feedback" />
        <Stack.Screen name="newsletter" />
        <Stack.Screen name="plans" />
        <Stack.Screen name="discover-profile" />
        <Stack.Screen name="discover-settings" />
        <Stack.Screen name="post-collection" />
        <Stack.Screen name="my-comments" />
        <Stack.Screen name="my-ratings" />
        <Stack.Screen name="my-listings" />
        <Stack.Screen name="my-posts-feed" />
        <Stack.Screen name="user-list" />
        <Stack.Screen name="follow-requests" />
        <Stack.Screen name="notifications" />
        <Stack.Screen
          name="discover-edit"
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="share-post"
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="create-listing"
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="listing-detail"
          options={{
            presentation: 'transparentModal',
            animation: 'none',
            contentStyle: { backgroundColor: 'transparent' },
          }}
        />
        <Stack.Screen
          name="post-comments"
          options={{
            presentation: 'transparentModal',
            animation: 'none',
            contentStyle: { backgroundColor: 'transparent' },
          }}
        />
        <Stack.Screen name="article" />
        <Stack.Screen name="exercise-detail" />
        <Stack.Screen
          name="ingredient"
          options={{
            presentation: 'formSheet',
            animation: 'slide_from_bottom',
            sheetAllowedDetents: 'fitToContents',
            sheetGrabberVisible: true,
            sheetCornerRadius: 28,
          }}
        />
      </Stack>
      <MaintenanceGate />
    </>
  );
}
