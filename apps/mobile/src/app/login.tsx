import { useRouter } from 'expo-router';
import { Apple, Eye, EyeOff, Leaf, Lock, Mail } from 'lucide-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PressableScale } from '@/components/ui/pressable-scale';
import { AuthError } from '@/services/supabase/auth';
import { useAuth } from '@/store/auth';
import { accentLime, onAccentLime, useResolvedScheme, useThemeColors } from '@/theme';

export default function LoginScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const colors = useThemeColors();
  const isDark = useResolvedScheme() === 'dark';
  const signIn = useAuth((s) => s.signIn);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errorKey, setErrorKey] = useState<string | null>(null);

  const canSubmit = email.trim().length > 0 && password.length > 0 && !busy;

  const onSignIn = async () => {
    if (!canSubmit) return;
    setBusy(true);
    setErrorKey(null);
    try {
      await signIn(email, password);
    } catch (e) {
      setErrorKey(e instanceof AuthError ? e.messageKey : 'auth.errUnknown');
      setBusy(false);
    }
  };

  return (
    <View className="flex-1 bg-surface dark:bg-[#0C0F0C]">
      <SafeAreaView edges={['top', 'bottom']} className="flex-1">
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerClassName="flex-grow justify-center px-5 py-8">
            <View className="rounded-[28px] bg-white dark:bg-surface-dark border border-border dark:border-border-dark p-6">
              <View className="items-center gap-2">
                <View className="w-14 h-14 rounded-2xl items-center justify-center bg-[#101410] dark:bg-lime">
                  <Leaf size={26} color={isDark ? onAccentLime : accentLime} />
                </View>
                <Text className="font-display text-3xl tracking-tight text-ink dark:text-ink-dark mt-1">
                  nutriLens
                </Text>
                <Text className="font-body text-sm text-ink-muted dark:text-ink-dark-muted">
                  {t('auth.tagline')}
                </Text>
              </View>

              <View className="mt-7 gap-1">
                <Text className="font-heading text-2xl tracking-tight text-ink dark:text-ink-dark">
                  {t('auth.welcomeBack')}
                </Text>
                <Text className="font-body text-sm text-ink-muted dark:text-ink-dark-muted">
                  {t('auth.signInSubtitle')}
                </Text>
              </View>

              <View className="mt-6 gap-2">
                <Text className="font-body-medium text-[13px] text-ink dark:text-ink-dark">
                  {t('auth.emailLabel')}
                </Text>
                <View className="flex-row items-center gap-2.5 h-[52px] rounded-xl px-3.5 bg-surface dark:bg-surface-raised-dark border border-border dark:border-border-dark">
                  <Mail size={18} color={colors.textMuted} />
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder={t('auth.emailPlaceholder')}
                    placeholderTextColor={colors.textMuted}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    className="flex-1 font-body text-[15px] text-ink dark:text-ink-dark"
                  />
                </View>
              </View>

              <View className="mt-4 gap-2">
                <Text className="font-body-medium text-[13px] text-ink dark:text-ink-dark">
                  {t('auth.passwordLabel')}
                </Text>
                <View className="flex-row items-center gap-2.5 h-[52px] rounded-xl px-3.5 bg-surface dark:bg-surface-raised-dark border border-border dark:border-border-dark">
                  <Lock size={18} color={colors.textMuted} />
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder={t('auth.passwordPlaceholder')}
                    placeholderTextColor={colors.textMuted}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoComplete="password"
                    className="flex-1 font-body text-[15px] text-ink dark:text-ink-dark"
                  />
                  <PressableScale
                    haptic="selection"
                    accessibilityLabel={t(
                      showPassword ? 'auth.hidePassword' : 'auth.showPassword',
                    )}
                    onPress={() => setShowPassword((v) => !v)}>
                    {showPassword ? (
                      <EyeOff size={18} color={colors.textMuted} />
                    ) : (
                      <Eye size={18} color={colors.textMuted} />
                    )}
                  </PressableScale>
                </View>
              </View>

              <PressableScale
                haptic="selection"
                onPress={() => router.push('/forgot-password')}>
                <Text className="self-end mt-3 font-body-bold text-[13px] text-ink dark:text-ink-dark">
                  {t('auth.forgotPassword')}
                </Text>
              </PressableScale>

              {errorKey && (
                <View className="mt-4 rounded-xl px-3.5 py-3 bg-danger/10 border border-danger/30">
                  <Text className="font-body text-[13px] leading-[18px] text-danger">
                    {t(errorKey)}
                  </Text>
                </View>
              )}

              <PressableScale
                haptic="medium"
                accessibilityLabel={t('auth.signIn')}
                onPress={onSignIn}
                disabled={!canSubmit}
                style={{ marginTop: 20 }}>
                <View className="h-[52px] rounded-xl items-center justify-center bg-[#101410] dark:bg-lime">
                  {busy ? (
                    <ActivityIndicator color={isDark ? onAccentLime : accentLime} />
                  ) : (
                    <Text className="font-heading text-base text-lime dark:text-lime-on">
                      {t('auth.signIn')}
                    </Text>
                  )}
                </View>
              </PressableScale>

              <View className="flex-row items-center gap-3 mt-6">
                <View className="flex-1 h-px bg-border dark:bg-border-dark" />
                <Text className="font-body text-xs text-ink-muted dark:text-ink-dark-muted">
                  {t('auth.orContinue')}
                </Text>
                <View className="flex-1 h-px bg-border dark:bg-border-dark" />
              </View>

              <View className="flex-row gap-3 mt-5">
                <View className="flex-1">
                  <SocialButton
                    label={t('auth.google')}
                    icon={<GoogleGlyph color={colors.text} />}
                  />
                </View>
                <View className="flex-1">
                  <SocialButton
                    label={t('auth.apple')}
                    icon={<Apple size={18} color={colors.text} />}
                  />
                </View>
              </View>
            </View>

            <View className="flex-row items-center justify-center gap-1.5 mt-6">
              <Text className="font-body text-sm text-ink-muted dark:text-ink-dark-muted">
                {t('auth.noAccount')}
              </Text>
              <PressableScale
                haptic="selection"
                onPress={() => router.push('/account')}>
                <Text className="font-body-bold text-sm text-ink dark:text-lime">
                  {t('auth.signUp')}
                </Text>
              </PressableScale>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

function SocialButton({
  label,
  icon,
}: {
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <PressableScale
      haptic="light"
      accessibilityLabel={label}
      onPress={() => {}}
      style={{ width: '100%' }}>
      <View className="w-full flex-row items-center justify-center gap-2 h-[52px] rounded-xl bg-white dark:bg-surface-raised-dark border border-border dark:border-border-dark">
        {icon}
        <Text className="font-body-medium text-sm text-ink dark:text-ink-dark">
          {label}
        </Text>
      </View>
    </PressableScale>
  );
}

function GoogleGlyph({ color }: { color: string }) {
  return (
    <Text
      className="font-body-bold text-[15px] leading-[18px]"
      style={{ color }}>
      G
    </Text>
  );
}
