import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { ArrowRight, Camera, Eye, EyeOff, Lock, Mail, Phone } from 'lucide-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Text, View } from 'react-native';

import {
  isPasswordValid,
  PasswordRules,
} from '@/components/register/password-rules';
import { BirthDateField } from '@/components/register/birth-date-field';
import { RegisterScaffold } from '@/components/register/register-scaffold';
import { TextField } from '@/components/register/text-field';
import { PressableScale } from '@/components/ui/pressable-scale';
import { AuthError } from '@/services/supabase/auth';
import { useAuth } from '@/store/auth';
import { useDiscoverProfile } from '@/store/discover';
import { useProfile } from '@/store/profile';
import { onAccentLime, useThemeColors } from '@/theme';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AccountScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const colors = useThemeColors();
  const profile = useProfile();
  const signUp = useAuth((s) => s.signUp);
  const signedIn = useAuth((s) => s.signedIn);
  const pendingAvatar = useDiscoverProfile((s) => s.pendingAvatarUri);
  const setPendingAvatar = useDiscoverProfile((s) => s.setPendingAvatar);

  const [email, setEmail] = useState(profile.email);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [height, setHeight] = useState(profile.heightCm);
  const [weight, setWeight] = useState(profile.weightKg);
  const [birthDate, setBirthDate] = useState<string | null>(profile.birthDate);
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; confirm?: string }>({});

  const emailOk = EMAIL_RE.test(email.trim());
  const pwOk = isPasswordValid(password);
  const confirmOk = confirm.length > 0 && password === confirm;
  const canContinue = busy ? false : signedIn ? emailOk : emailOk && pwOk && confirmOk;

  const pickFromGallery = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!res.canceled && res.assets[0]?.uri) setPendingAvatar(res.assets[0].uri);
  };

  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) return;
    const res = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!res.canceled && res.assets[0]?.uri) setPendingAvatar(res.assets[0].uri);
  };

  const chooseAvatar = () =>
    Alert.alert(t('register.account.photoLabel'), undefined, [
      { text: t('discover.sharePhotoGallery'), onPress: pickFromGallery },
      { text: t('discover.sharePhotoCamera'), onPress: takePhoto },
      { text: t('common.cancel'), style: 'cancel' },
    ]);

  const goNext = () => {
    profile.setAccount({
      email: email.trim(),
      phone: phone.trim() ? `+90 ${phone.trim()}` : '',
      heightCm: height.trim(),
      weightKg: weight.trim(),
    });
    profile.setGoalInfo({ birthDate });
    router.push('/goal');
  };

  const onContinue = async () => {
    const next: typeof errors = {};
    if (!emailOk) next.email = t('register.account.errEmail');
    if (!signedIn && pwOk && !confirmOk) next.confirm = t('register.account.errConfirm');
    setErrors(next);
    if (!canContinue) return;

    if (signedIn) {
      goNext();
      return;
    }

    setBusy(true);
    try {
      await signUp(email.trim(), password);
    } catch (e) {
      setErrors({
        email: t(e instanceof AuthError ? e.messageKey : 'auth.errUnknown'),
      });
      setBusy(false);
      return;
    }
    setBusy(false);
    goNext();
  };

  return (
    <RegisterScaffold
      kicker={t('register.kickerAccount')}
      step={1}
      totalSteps={7}
      onBack={signedIn ? undefined : () => router.replace('/login')}
      backIcon="close"
      title={t('register.account.title')}
      subtitle={t('register.account.subtitle')}
      primaryLabel={t('common.continue')}
      onPrimary={onContinue}
      primaryDisabled={!canContinue}
      PrimaryIcon={ArrowRight}>
      <View className="gap-4">
        <View className="items-center gap-2 pb-1">
          <PressableScale
            haptic="light"
            accessibilityLabel={t('register.account.photoLabel')}
            onPress={chooseAvatar}>
            <View>
              {pendingAvatar ? (
                <Image
                  source={{ uri: pendingAvatar }}
                  style={{ width: 88, height: 88, borderRadius: 28 }}
                  contentFit="cover"
                />
              ) : (
                <View className="w-[88px] h-[88px] rounded-[28px] items-center justify-center bg-surface dark:bg-surface-raised-dark border border-dashed border-border dark:border-border-dark">
                  <Camera size={26} color={colors.textMuted} />
                </View>
              )}
              <View className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full items-center justify-center bg-lime border-2 border-cream dark:border-surface-dark">
                <Camera size={13} color={onAccentLime} />
              </View>
            </View>
          </PressableScale>
          {pendingAvatar ? (
            <PressableScale
              haptic="light"
              accessibilityLabel={t('common.close')}
              onPress={() => setPendingAvatar(null)}>
              <Text className="font-body-medium text-[12px] text-ink-muted dark:text-ink-dark-muted">
                {t('register.account.photoRemove')}
              </Text>
            </PressableScale>
          ) : (
            <Text className="font-body text-[12px] text-ink-muted dark:text-ink-dark-muted">
              {t('register.account.photoOptional')}
            </Text>
          )}
        </View>

        <TextField
          label={t('register.account.email')}
          hint={signedIn ? undefined : t('register.account.required')}
          hintTone="danger"
          Icon={Mail}
          value={email}
          onChangeText={setEmail}
          editable={!signedIn}
          placeholder={t('register.account.emailPlaceholder')}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          error={errors.email}
        />

        {signedIn && (
          <View className="rounded-xl px-3.5 py-3 bg-surface dark:bg-surface-raised-dark border border-border dark:border-border-dark">
            <Text className="font-body text-[13px] text-ink-muted dark:text-ink-dark-muted">
              {t('register.account.alreadyCreated')}
            </Text>
          </View>
        )}

        <TextField
          label={t('register.account.phone')}
          hint={t('register.account.optional')}
          Icon={Phone}
          leftAccessory={
            <View className="flex-row items-center pr-2 mr-0.5 border-r border-border dark:border-border-dark">
              <Text className="font-body-medium text-[15px] text-ink dark:text-ink-dark">
                +90
              </Text>
            </View>
          }
          value={phone}
          onChangeText={setPhone}
          placeholder={t('register.account.phonePlaceholder')}
          keyboardType="phone-pad"
          maxLength={13}
        />

        {!signedIn && (
          <>
            <View className="gap-3">
              <TextField
                label={t('register.account.password')}
                Icon={Lock}
                value={password}
                onChangeText={setPassword}
                placeholder={t('register.account.passwordPlaceholder')}
                secureTextEntry={!showPw}
                autoCapitalize="none"
                maxLength={20}
                rightAccessory={
                  <PressableScale
                    haptic="selection"
                    accessibilityLabel={t('register.account.password')}
                    onPress={() => setShowPw((v) => !v)}>
                    {showPw ? (
                      <EyeOff size={18} color={colors.textMuted} />
                    ) : (
                      <Eye size={18} color={colors.textMuted} />
                    )}
                  </PressableScale>
                }
              />
              <PasswordRules password={password} />
            </View>

            <TextField
              label={t('register.account.confirmPassword')}
              Icon={Lock}
              value={confirm}
              onChangeText={setConfirm}
              placeholder={t('register.account.passwordPlaceholder')}
              secureTextEntry={!showPw}
              autoCapitalize="none"
              maxLength={20}
              error={errors.confirm}
            />
          </>
        )}

        <View className="flex-row gap-3">
          <View className="flex-1">
            <TextField
              label={t('register.account.height')}
              value={height}
              onChangeText={setHeight}
              placeholder="175"
              keyboardType="number-pad"
              maxLength={3}
            />
          </View>
          <View className="flex-1">
            <TextField
              label={t('register.account.weight')}
              value={weight}
              onChangeText={setWeight}
              placeholder="70"
              keyboardType="number-pad"
              maxLength={3}
            />
          </View>
        </View>

        <BirthDateField
          label={t('register.account.birthDate')}
          hint={t('register.account.optional')}
          value={birthDate}
          onChange={setBirthDate}
        />
      </View>
    </RegisterScaffold>
  );
}
