import { useRouter } from 'expo-router';
import { ArrowLeft, CheckCircle2, Mail } from 'lucide-react-native';
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

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const colors = useThemeColors();
  const isDark = useResolvedScheme() === 'dark';
  const resetPassword = useAuth((s) => s.resetPassword);

  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorKey, setErrorKey] = useState<string | null>(null);

  const emailOk = EMAIL_RE.test(email.trim());

  const onSubmit = async () => {
    if (!emailOk || busy) return;
    setBusy(true);
    setErrorKey(null);
    try {
      await resetPassword(email);
      setSent(true);
    } catch (e) {
      setErrorKey(e instanceof AuthError ? e.messageKey : 'auth.errUnknown');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View className="flex-1 bg-surface dark:bg-[#0C0F0C]">
      <SafeAreaView edges={['top', 'bottom']} className="flex-1">
        <View className="flex-row items-center gap-3 px-4 pt-2 pb-1">
          <PressableScale
            haptic="selection"
            accessibilityLabel={t('common.back')}
            onPress={() => router.back()}>
            <ArrowLeft size={24} color={colors.text} />
          </PressableScale>
        </View>

        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerClassName="grow px-5 pt-4 pb-6">
            {sent ? (
              <View className="grow items-center justify-center gap-5">
                <View className="w-20 h-20 rounded-full items-center justify-center bg-lime/15">
                  <CheckCircle2 size={44} color={colors.lime} />
                </View>
                <View className="items-center gap-2">
                  <Text className="font-display text-[26px] tracking-tight text-ink dark:text-ink-dark text-center">
                    {t('forgot.sentTitle')}
                  </Text>
                  <Text className="font-body text-[15px] leading-[22px] text-ink-muted dark:text-ink-dark-muted text-center">
                    {t('forgot.sentMessage', { email: email.trim() })}
                  </Text>
                </View>
                <PressableScale
                  haptic="medium"
                  accessibilityLabel={t('forgot.backToLogin')}
                  onPress={() => router.back()}
                  style={{ marginTop: 8, alignSelf: 'stretch' }}>
                  <View className="h-[52px] rounded-xl items-center justify-center bg-[#101410] dark:bg-lime">
                    <Text className="font-heading text-base text-lime dark:text-lime-on">
                      {t('forgot.backToLogin')}
                    </Text>
                  </View>
                </PressableScale>
              </View>
            ) : (
              <>
                <Text className="font-display text-[28px] leading-9 tracking-tight text-ink dark:text-ink-dark">
                  {t('forgot.title')}
                </Text>
                <Text className="font-body text-sm text-ink-muted dark:text-ink-dark-muted mt-1.5">
                  {t('forgot.subtitle')}
                </Text>

                <View className="mt-7 gap-2">
                  <Text className="font-body-medium text-[13px] text-ink dark:text-ink-dark">
                    {t('auth.emailLabel')}
                  </Text>
                  <View className="flex-row items-center gap-2.5 h-[52px] rounded-xl px-3.5 bg-white dark:bg-surface-raised-dark border border-border dark:border-border-dark">
                    <Mail size={18} color={colors.textMuted} />
                    <TextInput
                      value={email}
                      onChangeText={setEmail}
                      placeholder={t('auth.emailPlaceholder')}
                      placeholderTextColor={colors.textMuted}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoComplete="email"
                      returnKeyType="send"
                      onSubmitEditing={onSubmit}
                      className="flex-1 font-body text-[15px] text-ink dark:text-ink-dark"
                    />
                  </View>
                </View>

                {errorKey && (
                  <View className="mt-4 rounded-xl px-3.5 py-3 bg-danger/10 border border-danger/30">
                    <Text className="font-body text-[13px] leading-[18px] text-danger">
                      {t(errorKey)}
                    </Text>
                  </View>
                )}

                <PressableScale
                  haptic="medium"
                  accessibilityLabel={t('forgot.submit')}
                  onPress={onSubmit}
                  disabled={!emailOk || busy}
                  style={{ marginTop: 24, opacity: !emailOk || busy ? 0.5 : 1 }}>
                  <View className="h-[52px] rounded-xl items-center justify-center bg-[#101410] dark:bg-lime">
                    {busy ? (
                      <ActivityIndicator color={isDark ? onAccentLime : accentLime} />
                    ) : (
                      <Text className="font-heading text-base text-lime dark:text-lime-on">
                        {t('forgot.submit')}
                      </Text>
                    )}
                  </View>
                </PressableScale>
              </>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
