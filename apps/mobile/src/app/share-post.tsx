import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Camera, Globe, ImagePlus, Lock, Users, X } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PressableScale } from '@/components/ui/pressable-scale';
import { PrimaryButton } from '@/components/ui/primary-button';
import { postIcon } from '@/data/discover';
import { createPost, updatePost, type PostVisibility } from '@/services/supabase/posts';
import { uploadPostImage } from '@/services/supabase/storage';
import { useAuth } from '@/store/auth';
import { useMeals } from '@/store/meals';
import { useScans } from '@/store/scans';
import { accentLime, accentMeal, getScore, readableText, useThemeColors } from '@/theme';

const BODY_MAX = 500;
const NAME_MIN = 5;
const NAME_MAX = 50;

const VISIBILITY_OPTIONS: {
  key: PostVisibility;
  Icon: typeof Globe;
  titleKey: string;
  subtitleKey: string;
}[] = [
  { key: 'public', Icon: Globe, titleKey: 'discover.visPublicTitle', subtitleKey: 'discover.visPublicSub' },
  { key: 'followers', Icon: Users, titleKey: 'discover.visFollowersTitle', subtitleKey: 'discover.visFollowersSub' },
  { key: 'private', Icon: Lock, titleKey: 'discover.visPrivateTitle', subtitleKey: 'discover.visPrivateSub' },
];

type Shareable = {
  kind: 'product' | 'meal';
  scanId: string | null;
  name: string;
  score: number;
  kcal: number | null;
  defaultImage?: string;
};

function PhotoSourceButton({
  Icon,
  label,
  color,
  onPress,
  tall,
}: {
  Icon: typeof ImagePlus;
  label: string;
  color: string;
  onPress: () => void;
  tall?: boolean;
}) {
  return (
    <PressableScale haptic="light" accessibilityLabel={label} onPress={onPress} style={{ flex: 1 }}>
      <View
        className={`${tall ? 'h-[88px]' : 'h-11'} rounded-2xl flex-row items-center justify-center gap-1.5 bg-surface dark:bg-surface-raised-dark border border-dashed border-border dark:border-border-dark`}>
        <Icon size={tall ? 22 : 18} color={color} />
        <Text className="font-body-medium text-[13px] text-ink-muted dark:text-ink-dark-muted">
          {label}
        </Text>
      </View>
    </PressableScale>
  );
}

function VisibilityRow({
  Icon,
  title,
  subtitle,
  selected,
  onPress,
}: {
  Icon: typeof Globe;
  title: string;
  subtitle: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <PressableScale haptic="selection" accessibilityLabel={title} onPress={onPress}>
      <View
        className={`flex-row items-center gap-3 rounded-2xl p-3.5 border ${
          selected
            ? 'border-lime bg-lime/10'
            : 'bg-surface dark:bg-surface-raised-dark border-border dark:border-border-dark'
        }`}>
        <Icon size={20} color={selected ? accentLime : '#9AA0A6'} />
        <View className="flex-1">
          <Text className="font-heading text-[14px] text-ink dark:text-ink-dark">{title}</Text>
          <Text className="font-body text-[12px] text-ink-muted dark:text-ink-dark-muted">
            {subtitle}
          </Text>
        </View>
        <View
          className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
            selected ? 'border-lime' : 'border-border dark:border-border-dark'
          }`}>
          {selected && <View className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: accentLime }} />}
        </View>
      </View>
    </PressableScale>
  );
}

export default function SharePostScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const colors = useThemeColors();
  const params = useLocalSearchParams<{
    scanId?: string;
    mealId?: string;
    editPostId?: string;
    eName?: string;
    eBody?: string;
    eScore?: string;
    eKcal?: string;
    eImage?: string;
    eIsMeal?: string;
    eVis?: string;
  }>();
  const { scanId, mealId, editPostId } = params;
  const isEdit = !!editPostId;

  const scan = useScans((s) => (scanId ? s.scans.find((r) => r.id === scanId) : undefined));
  const meal = useMeals((s) => (mealId ? s.meals.find((m) => m.id === mealId) : undefined));

  const source: Shareable | null = useMemo(() => {
    if (isEdit) {
      return {
        kind: params.eIsMeal === '1' ? 'meal' : 'product',
        scanId: null,
        name: params.eName ?? '',
        score: Number(params.eScore ?? 0),
        kcal: params.eKcal ? Number(params.eKcal) : null,
        defaultImage: params.eImage || undefined,
      };
    }
    if (meal) {
      return {
        kind: 'meal',
        scanId: null,
        name: meal.mealName ?? '',
        score: meal.mealScore,
        kcal: meal.estCalories,
        defaultImage: meal.imageUri,
      };
    }
    if (scan) {
      return {
        kind: 'product',
        scanId: scan.id,
        name: scan.productName ?? '',
        score: scan.healthScore,
        kcal: null,
        defaultImage: scan.imageUri,
      };
    }
    return null;
  }, [scan, meal, isEdit, params.eIsMeal, params.eName, params.eScore, params.eKcal, params.eImage]);

  const [name, setName] = useState(source?.name ?? '');
  const [body, setBody] = useState(params.eBody ?? '');
  const [photo, setPhoto] = useState<string | undefined>(source?.defaultImage);
  const [visibility, setVisibility] = useState<PostVisibility>(
    (params.eVis as PostVisibility) || 'public',
  );
  const [busy, setBusy] = useState(false);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);

  const isMeal = source?.kind === 'meal';
  const meta = useMemo(() => (source ? getScore(source.score) : null), [source]);
  const badgeColor = isMeal ? accentMeal : meta?.color;
  const Icon = postIcon('default');

  if (!source || !meta) {
    return (
      <View className="flex-1 bg-cream dark:bg-[#0C0F0C]">
        <SafeAreaView edges={['top', 'bottom']} className="flex-1 items-center justify-center px-8 gap-3">
          <Text className="font-heading text-lg text-ink dark:text-ink-dark text-center">
            {t('discover.shareMissingTitle')}
          </Text>
          <PressableScale haptic="light" onPress={() => router.back()}>
            <Text className="font-body-medium text-[15px]" style={{ color: colors.text }}>
              {t('common.back')}
            </Text>
          </PressableScale>
        </SafeAreaView>
      </View>
    );
  }

  const pickFromGallery = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (!res.canceled && res.assets[0]?.uri) setPhoto(res.assets[0].uri);
  };

  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      setErrorKey('discover.sharePhotoCameraDenied');
      return;
    }
    const res = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (!res.canceled && res.assets[0]?.uri) {
      setErrorKey(null);
      setPhoto(res.assets[0].uri);
    }
  };

  const onSubmit = async () => {
    if (busy) return;
    const trimmedName = name.trim();
    if (trimmedName.length < NAME_MIN) {
      setNameError(t('discover.shareProductNameTooShort', { min: NAME_MIN }));
      return;
    }
    setNameError(null);
    const userId = useAuth.getState().userId;
    if (!userId) {
      setErrorKey('discover.saveFailed');
      return;
    }
    setBusy(true);
    setErrorKey(null);
    try {
      let imageUrl: string | null = null;
      if (photo) {
        imageUrl =
          /^https?:/.test(photo) ? photo : await uploadPostImage(userId, photo);
      }
      if (isEdit && editPostId) {
        await updatePost(editPostId, { productName: trimmedName, body, imageUrl, visibility });
      } else {
        await createPost(userId, {
          scanId: source.scanId,
          productName: trimmedName,
          healthScore: source.score,
          kcal: source.kcal,
          iconKey: 'default',
          body,
          imageUrl,
          visibility,
        });
      }
      router.back();
    } catch {
      const isNewPhoto = !!photo && !/^https?:/.test(photo);
      setErrorKey(isNewPhoto ? 'discover.shareImageFailed' : 'discover.saveFailed');
      setBusy(false);
    }
  };

  return (
    <View className="flex-1 bg-cream dark:bg-[#0C0F0C]">
      <SafeAreaView edges={['top', 'bottom']} className="flex-1">
        <View className="flex-row items-center justify-between px-4 pt-2 pb-1">
          <PressableScale
            haptic="selection"
            accessibilityLabel={t('common.cancel')}
            onPress={() => router.back()}>
            <Text className="font-body-medium text-[15px] text-ink-muted dark:text-ink-dark-muted">
              {t('common.cancel')}
            </Text>
          </PressableScale>
          <Text className="font-heading text-[17px] tracking-tight text-ink dark:text-ink-dark">
            {isEdit ? t('discover.editPostTitle') : t('discover.shareTitle')}
          </Text>
          <View className="w-[52px]" />
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          className="flex-1">
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerClassName="px-4 pt-4 pb-8 gap-4">
            <View className="flex-row items-center gap-3 p-3 rounded-2xl bg-[#101410] dark:bg-surface-raised-dark">
              <View className="w-9 h-9 rounded-lg items-center justify-center bg-white/10">
                <Icon size={20} color={isMeal ? accentMeal : accentLime} />
              </View>
              <View className="flex-1">
                <Text numberOfLines={1} className="font-heading text-[14px] text-white">
                  {name.trim() || t('common.unknownProduct')}
                </Text>
                {source.kcal != null && (
                  <Text className="font-body text-xs text-white/60">
                    {t('discover.kcal', { count: source.kcal })}
                  </Text>
                )}
              </View>
              <View className="rounded-pill px-2.5 py-1" style={{ backgroundColor: badgeColor }}>
                <Text
                  className="font-body-bold text-[13px] tabular-nums"
                  style={{ color: isMeal ? '#FFFFFF' : readableText(meta.color) }}>
                  {isMeal ? source.score : `${meta.grade}·${source.score}`}
                </Text>
              </View>
            </View>

            <View className="gap-2">
              <Text className="font-body-medium text-[13px] text-ink dark:text-ink-dark">
                {t('discover.sharePhotoLabel')}
              </Text>
              {photo ? (
                <View className="gap-2">
                  <View className="rounded-2xl overflow-hidden">
                    <Image
                      source={{ uri: photo }}
                      style={{ width: '100%', height: 200 }}
                      contentFit="cover"
                    />
                    <PressableScale
                      haptic="light"
                      accessibilityLabel={t('common.close')}
                      onPress={() => setPhoto(undefined)}
                      style={{ position: 'absolute', top: 8, right: 8 }}>
                      <View className="w-8 h-8 rounded-full items-center justify-center bg-black/60">
                        <X size={16} color="#FFFFFF" />
                      </View>
                    </PressableScale>
                  </View>
                  <View className="flex-row gap-2">
                    <PhotoSourceButton
                      Icon={ImagePlus}
                      label={t('discover.sharePhotoGallery')}
                      color={colors.textMuted}
                      onPress={pickFromGallery}
                    />
                    <PhotoSourceButton
                      Icon={Camera}
                      label={t('discover.sharePhotoCamera')}
                      color={colors.textMuted}
                      onPress={takePhoto}
                    />
                  </View>
                </View>
              ) : (
                <View className="flex-row gap-2">
                  <PhotoSourceButton
                    Icon={ImagePlus}
                    label={t('discover.sharePhotoGallery')}
                    color={colors.textMuted}
                    onPress={pickFromGallery}
                    tall
                  />
                  <PhotoSourceButton
                    Icon={Camera}
                    label={t('discover.sharePhotoCamera')}
                    color={colors.textMuted}
                    onPress={takePhoto}
                    tall
                  />
                </View>
              )}
            </View>

            <View className="gap-2">
              <Text className="font-body-medium text-[13px] text-ink dark:text-ink-dark">
                {isMeal ? t('discover.shareMealNameLabel') : t('discover.shareProductNameLabel')}
              </Text>
              <View
                className={`rounded-xl px-3.5 py-3 bg-surface dark:bg-surface-raised-dark border ${
                  nameError ? 'border-danger' : 'border-border dark:border-border-dark'
                }`}>
                <TextInput
                  value={name}
                  onChangeText={(v) => {
                    setName(v);
                    if (nameError) setNameError(null);
                  }}
                  placeholder={
                    isMeal
                      ? t('discover.shareMealNamePlaceholder')
                      : t('discover.shareProductNamePlaceholder')
                  }
                  placeholderTextColor={colors.textMuted}
                  maxLength={NAME_MAX}
                  className="font-body text-[15px] text-ink dark:text-ink-dark"
                />
              </View>
              {nameError && (
                <Text className="font-body text-[11px] text-danger">{nameError}</Text>
              )}
            </View>

            <View className="gap-2">
              <View className="flex-row items-center justify-between">
                <Text className="font-body-medium text-[13px] text-ink dark:text-ink-dark">
                  {t('discover.shareBodyLabel')}
                </Text>
                <Text className="font-body text-[11px] text-ink-muted dark:text-ink-dark-muted tabular-nums">
                  {body.length}/{BODY_MAX}
                </Text>
              </View>
              <View className="rounded-xl px-3.5 py-3 bg-surface dark:bg-surface-raised-dark border border-border dark:border-border-dark">
                <TextInput
                  value={body}
                  onChangeText={setBody}
                  placeholder={t('discover.shareBodyPlaceholder')}
                  placeholderTextColor={colors.textMuted}
                  multiline
                  maxLength={BODY_MAX}
                  textAlignVertical="top"
                  className="min-h-[100px] font-body text-[15px] leading-[21px] text-ink dark:text-ink-dark"
                />
              </View>
            </View>

            <View className="gap-2">
              <Text className="font-body-medium text-[13px] text-ink dark:text-ink-dark">
                {t('discover.visibilityLabel')}
              </Text>
              <View className="gap-2">
                {VISIBILITY_OPTIONS.map((opt) => (
                  <VisibilityRow
                    key={opt.key}
                    Icon={opt.Icon}
                    title={t(opt.titleKey)}
                    subtitle={t(opt.subtitleKey)}
                    selected={visibility === opt.key}
                    onPress={() => setVisibility(opt.key)}
                  />
                ))}
              </View>
            </View>

            {errorKey && (
              <Text className="font-body text-[13px] text-danger">{t(errorKey)}</Text>
            )}

            <PrimaryButton
              label={
                busy
                  ? t('discover.sharing')
                  : isEdit
                    ? t('discover.editPostSave')
                    : t('discover.shareCta')
              }
              icon={null}
              onPress={onSubmit}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
