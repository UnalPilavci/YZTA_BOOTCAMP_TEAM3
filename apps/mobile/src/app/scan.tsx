import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import type { TFunction } from 'i18next';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/ui/primary-button';
import { useMealQuota, useScanQuota } from '@/hooks/use-plan';
import {
  accentLime,
  FontFamily,
  onAccentLime,
  palette,
  Radius,
  Spacing,
  Typography,
  useThemeColors,
} from '@/theme';

type ScanMode = 'product' | 'meal';

export default function ScanScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const colors = useThemeColors();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<ScanMode>('product');
  const productQuota = useScanQuota();
  const mealQuota = useMealQuota();
  const quota = mode === 'meal' ? mealQuota : productQuota;

  const goToResult = (uri: string) => {
    router.replace({ pathname: mode === 'meal' ? '/meal-result' : '/result', params: { uri } });
  };

  const onCapture = async () => {
    if (busy) return;
    setBusy(true);
    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      const photo = await cameraRef.current?.takePictureAsync({ quality: 0.6 });
      if (photo?.uri) goToResult(photo.uri);
      else setBusy(false);
    } catch {
      setBusy(false);
    }
  };

  const onGallery = async () => {
    if (busy) return;
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.6,
    });
    if (!res.canceled && res.assets[0]?.uri) {
      setBusy(true);
      goToResult(res.assets[0].uri);
    }
  };

  const resetDate = quota.resetsAt
    ? new Date(quota.resetsAt).toLocaleDateString(i18n.language, {
        day: 'numeric',
        month: 'long',
      })
    : null;

  if (!permission) {
    return <View style={[styles.screen, { backgroundColor: colors.bg }]} />;
  }

  if (!permission.granted) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.bg }]}>
        <SafeAreaView edges={['top', 'bottom']} style={styles.permWrap}>
          <CloseButton onPress={() => router.back()} colors={colors} floating={false} />
          <View style={styles.permCenter}>
            <View style={[styles.permIcon, { backgroundColor: colors.brandTint }]}>
              <Ionicons name="camera-outline" size={40} color={colors.brand} />
            </View>
            <Text style={[styles.permTitle, { color: colors.text }]}>
              {t('scan.permissionTitle')}
            </Text>
            <Text style={[styles.permText, { color: colors.textMuted }]}>
              {t('scan.permissionText')}
            </Text>
          </View>
          <PrimaryButton
            label={t('scan.permissionButton')}
            icon={null}
            onPress={requestPermission}
            style={styles.permCta}
          />
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="back" />

      <SafeAreaView edges={['top', 'bottom']} style={styles.overlay}>
        <View style={styles.topRow}>
          <CloseButton onPress={() => router.back()} floating />
        </View>

        <ModeToggle mode={mode} onChange={setMode} t={t} />

        <View style={styles.frameArea}>
          {quota.canScan ? (
            <>
              <View style={styles.frame} />
              <Text style={styles.hint}>
                {mode === 'meal' ? t('scan.hintMeal') : t('scan.hint')}
              </Text>
            </>
          ) : (
            <View style={styles.limitCard}>
              <Ionicons name="lock-closed-outline" size={30} color="#FFFFFF" />
              <Text style={styles.limitTitle}>{t('plans.limitTitle')}</Text>
              <Text style={styles.limitText}>
                {resetDate
                  ? t('plans.limitMessageResets', {
                      limit: quota.limit,
                      period: t(quota.period === 'week' ? 'plans.periodWeek' : 'plans.periodMonth'),
                      date: resetDate,
                    })
                  : t('plans.limitMessage')}
              </Text>
              <Pressable
                onPress={() => router.push('/plans')}
                accessibilityRole="button"
                accessibilityLabel={t('plans.viewPlansCta')}
                style={styles.limitCta}>
                <Text style={styles.limitCtaText}>{t('plans.viewPlansCta')}</Text>
              </Pressable>
            </View>
          )}
        </View>

        <View style={styles.bottomRow}>
          <Pressable
            onPress={onGallery}
            accessibilityRole="button"
            accessibilityLabel={t('scan.gallery')}
            disabled={!quota.canScan}
            style={[styles.roundBtn, !quota.canScan && styles.disabled]}>
            <Ionicons name="images-outline" size={24} color="#FFFFFF" />
          </Pressable>

          <Pressable
            onPress={onCapture}
            accessibilityRole="button"
            accessibilityLabel={t('scan.capture')}
            disabled={busy || !quota.canScan}
            style={({ pressed }) => [
              styles.shutter,
              pressed && styles.shutterPressed,
              !quota.canScan && styles.disabled,
            ]}>
            <View style={styles.shutterInner}>
              {busy ? (
                <ActivityIndicator color={palette.green700} />
              ) : (
                <Ionicons name="scan-outline" size={30} color={palette.green700} />
              )}
            </View>
          </Pressable>

          <View style={styles.roundBtn} />
        </View>
      </SafeAreaView>
    </View>
  );
}

function ModeToggle({
  mode,
  onChange,
  t,
}: {
  mode: ScanMode;
  onChange: (m: ScanMode) => void;
  t: TFunction;
}) {
  const items: { key: ScanMode; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: 'product', label: t('scan.modeProduct'), icon: 'barcode-outline' },
    { key: 'meal', label: t('scan.modeMeal'), icon: 'restaurant-outline' },
  ];
  return (
    <View style={styles.modeWrap}>
      {items.map((it) => {
        const active = mode === it.key;
        return (
          <Pressable
            key={it.key}
            onPress={() => {
              if (Platform.OS !== 'web') Haptics.selectionAsync();
              onChange(it.key);
            }}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={it.label}
            style={[styles.modeBtn, active && styles.modeBtnActive]}>
            <Ionicons
              name={it.icon}
              size={16}
              color={active ? palette.green700 : '#FFFFFF'}
            />
            <Text style={[styles.modeText, active && styles.modeTextActive]}>{it.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function CloseButton({
  onPress,
  colors,
  floating,
}: {
  onPress: () => void;
  colors?: ReturnType<typeof useThemeColors>;
  floating?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel="Kapat"
      style={[
        styles.close,
        floating
          ? { backgroundColor: 'rgba(0,0,0,0.4)' }
          : { backgroundColor: colors?.surface, borderColor: colors?.border, borderWidth: 1 },
      ]}>
      <Ionicons name="close" size={22} color={floating ? '#FFFFFF' : colors?.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#000000' },
  overlay: { flex: 1, justifyContent: 'space-between', paddingHorizontal: Spacing.lg },

  topRow: { flexDirection: 'row', paddingTop: Spacing.sm },
  close: {
    width: 40,
    height: 40,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },

  modeWrap: {
    flexDirection: 'row',
    alignSelf: 'center',
    marginTop: Spacing.sm,
    padding: 4,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(0,0,0,0.45)',
    gap: 4,
  },
  modeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radius.pill,
  },
  modeBtnActive: { backgroundColor: accentLime },
  modeText: { fontFamily: FontFamily.heading, fontSize: 13, color: '#FFFFFF' },
  modeTextActive: { color: onAccentLime },

  limitCard: {
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
    marginHorizontal: Spacing.lg,
    borderRadius: Radius.xl,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  limitTitle: {
    fontFamily: FontFamily.heading,
    fontSize: 17,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  limitText: {
    fontFamily: FontFamily.body,
    fontSize: 13,
    lineHeight: 19,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  limitCta: {
    marginTop: Spacing.sm,
    paddingHorizontal: 20,
    height: 44,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: accentLime,
  },
  limitCtaText: { fontFamily: FontFamily.heading, fontSize: 14, color: onAccentLime },
  disabled: { opacity: 0.4 },

  frameArea: { alignItems: 'center', justifyContent: 'center', gap: Spacing.lg },
  frame: {
    width: '82%',
    aspectRatio: 1.15,
    borderRadius: Radius.xl,
    borderWidth: 3,
    borderColor: palette.green400,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  hint: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowRadius: 6,
  },

  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: Spacing.xl,
  },
  roundBtn: {
    width: 52,
    height: 52,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  shutter: {
    width: 76,
    height: 76,
    borderRadius: Radius.pill,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterPressed: { transform: [{ scale: 0.94 }] },
  shutterInner: {
    width: 60,
    height: 60,
    borderRadius: Radius.pill,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  permWrap: { flex: 1, paddingHorizontal: Spacing.lg },
  permCenter: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  permIcon: {
    width: 88,
    height: 88,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  permTitle: { ...Typography.h2, textAlign: 'center' },
  permText: {
    fontFamily: FontFamily.body,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    maxWidth: 280,
  },
  permCta: { marginBottom: Spacing.md },
});
