import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { AtSign, Camera, ImagePlus, User, X } from 'lucide-react-native';
import { useState } from 'react';
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
import { BirthDateField } from '@/components/register/birth-date-field';
import { TextField } from '@/components/register/text-field';
import { DiscoverError } from '@/services/supabase/discover';
import { uploadAvatar } from '@/services/supabase/storage';
import { useAuth } from '@/store/auth';
import {
  normalizeUsername,
  resolveDisplayName,
  useDiscoverProfile,
} from '@/store/discover';
import { useProfile } from '@/store/profile';
import { accentLime, onAccentLime, useResolvedScheme, useThemeColors } from '@/theme';

const BIO_MAX = 150;

export default function DiscoverEditScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const colors = useThemeColors();
  const isDark = useResolvedScheme() === 'dark';

  const storedName = useDiscoverProfile((s) => s.displayName);
  const storedUsername = useDiscoverProfile((s) => s.username);
  const storedBio = useDiscoverProfile((s) => s.bio);
  const storedAvatar = useDiscoverProfile((s) => s.avatarUrl);
  const setProfile = useDiscoverProfile((s) => s.setProfile);
  const profileName = useProfile((s) => s.name);

  const [displayName, setDisplayName] = useState(storedName);
  const [username, setUsername] = useState(storedUsername);
  const [bio, setBio] = useState(storedBio);
  const [birthDate, setBirthDate] = useState<string | null>(useProfile.getState().birthDate);
  const [photo, setPhoto] = useState<string | undefined>(storedAvatar || undefined);
  const [busy, setBusy] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  const previewName = resolveDisplayName(displayName, profileName, t('profile.guest'));
  const initial = (previewName.trim()[0] ?? 'U').toLocaleUpperCase('tr');

  const normalizedUsername = normalizeUsername(username);
  const usernameLenOk = normalizedUsername.length === 0 || normalizedUsername.length >= 3;

  const pickFromGallery = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!res.canceled && res.assets[0]?.uri) {
      setAvatarError(null);
      setPhoto(res.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      setAvatarError(t('discover.sharePhotoCameraDenied'));
      return;
    }
    const res = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!res.canceled && res.assets[0]?.uri) {
      setAvatarError(null);
      setPhoto(res.assets[0].uri);
    }
  };

  const onSave = async () => {
    if (busy) return;
    setUsernameError(null);
    setAvatarError(null);
    if (!usernameLenOk) {
      setUsernameError(t('discover.usernameInvalid'));
      return;
    }
    setBusy(true);
    try {
      let avatarUrl = '';
      if (photo) {
        if (/^https?:/.test(photo)) {
          avatarUrl = photo;
        } else {
          const userId = useAuth.getState().userId;
          if (!userId) throw new DiscoverError('unknown', 'discover.saveFailed', 'no session');
          avatarUrl = await uploadAvatar(userId, photo);
        }
      }
      await setProfile({ displayName, username, bio, avatarUrl });
      const userId = useAuth.getState().userId;
      if (userId) {
        useProfile.getState().setGoalInfo({ birthDate });
        await useProfile.getState().saveToServer(userId);
      }
      router.back();
    } catch (e) {
      const isNewPhoto = !!photo && !/^https?:/.test(photo);
      if (isNewPhoto && !(e instanceof DiscoverError)) {
        setAvatarError(t('discover.avatarUploadFailed'));
      } else {
        setUsernameError(t(e instanceof DiscoverError ? e.messageKey : 'discover.saveFailed'));
      }
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
            {t('discover.editTitle')}
          </Text>
          <View className="w-[52px]" />
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          className="flex-1">
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerClassName="px-4 pt-4 pb-8 gap-5">
            <View className="items-center gap-5">
              <View>
                {photo ? (
                  <Image
                    source={{ uri: photo }}
                    style={{ width: 84, height: 84, borderRadius: 24 }}
                    contentFit="cover"
                  />
                ) : (
                  <View className="w-[84px] h-[84px] rounded-3xl items-center justify-center bg-[#101410] dark:bg-lime">
                    <Text
                      className="font-display text-4xl"
                      style={{ color: isDark ? onAccentLime : accentLime }}>
                      {initial}
                    </Text>
                  </View>
                )}
                {!!photo && (
                  <PressableScale
                    haptic="light"
                    accessibilityLabel={t('common.close')}
                    onPress={() => setPhoto(undefined)}
                    style={{ position: 'absolute', top: -6, right: -6 }}>
                    <View className="w-7 h-7 rounded-full items-center justify-center bg-black/70">
                      <X size={15} color="#FFFFFF" />
                    </View>
                  </PressableScale>
                )}
              </View>

              <View className="flex-row gap-2">
                <PressableScale
                  haptic="light"
                  accessibilityLabel={t('discover.sharePhotoGallery')}
                  onPress={pickFromGallery}>
                  <View className="flex-row items-center gap-1.5 h-9 px-3.5 rounded-full bg-surface dark:bg-surface-raised-dark border border-border dark:border-border-dark">
                    <ImagePlus size={16} color={colors.textMuted} />
                    <Text className="font-body-medium text-[13px] text-ink dark:text-ink-dark">
                      {t('discover.sharePhotoGallery')}
                    </Text>
                  </View>
                </PressableScale>
                <PressableScale
                  haptic="light"
                  accessibilityLabel={t('discover.sharePhotoCamera')}
                  onPress={takePhoto}>
                  <View className="flex-row items-center gap-1.5 h-9 px-3.5 rounded-full bg-surface dark:bg-surface-raised-dark border border-border dark:border-border-dark">
                    <Camera size={16} color={colors.textMuted} />
                    <Text className="font-body-medium text-[13px] text-ink dark:text-ink-dark">
                      {t('discover.sharePhotoCamera')}
                    </Text>
                  </View>
                </PressableScale>
              </View>
              {avatarError ? (
                <Text className="font-body text-[12px] text-danger">{avatarError}</Text>
              ) : (
                <Text className="font-body text-xs text-ink-muted dark:text-ink-dark-muted">
                  {t('discover.avatarHint')}
                </Text>
              )}
            </View>

            <TextField
              label={t('discover.fieldName')}
              Icon={User}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder={t('discover.namePlaceholder')}
              autoCapitalize="words"
              maxLength={40}
            />

            <TextField
              label={t('discover.fieldUsername')}
              Icon={AtSign}
              value={username}
              onChangeText={(v) => {
                setUsername(v);
                if (usernameError) setUsernameError(null);
              }}
              placeholder={t('discover.usernamePlaceholder')}
              autoCapitalize="none"
              maxLength={24}
              error={usernameError ?? undefined}
            />

            <View className="gap-2">
              <View className="flex-row items-center justify-between">
                <Text className="font-body-medium text-[13px] text-ink dark:text-ink-dark">
                  {t('discover.fieldBio')}
                </Text>
                <Text className="font-body text-[11px] text-ink-muted dark:text-ink-dark-muted tabular-nums">
                  {bio.length}/{BIO_MAX}
                </Text>
              </View>
              <View className="rounded-xl px-3.5 py-3 bg-surface dark:bg-surface-raised-dark border border-border dark:border-border-dark">
                <TextInput
                  value={bio}
                  onChangeText={setBio}
                  placeholder={t('discover.bioPlaceholder')}
                  placeholderTextColor={colors.textMuted}
                  multiline
                  maxLength={BIO_MAX}
                  textAlignVertical="top"
                  className="min-h-[88px] font-body text-[15px] leading-[21px] text-ink dark:text-ink-dark"
                />
              </View>
            </View>

            <BirthDateField
              label={t('register.account.birthDate')}
              hint={t('discover.privateHint')}
              value={birthDate}
              onChange={setBirthDate}
            />

            <PrimaryButton
              label={busy ? t('discover.saving') : t('common.save')}
              icon={null}
              onPress={onSave}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
