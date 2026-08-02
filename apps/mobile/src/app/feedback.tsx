import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Bug,
  Check,
  CheckCircle2,
  Lightbulb,
  MessageCircle,
  Newspaper,
  type LucideIcon,
} from 'lucide-react-native';
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
import { submitFeedback, type FeedbackCategory } from '@/services/supabase/feedback';
import { useAuth } from '@/store/auth';
import { useProfile } from '@/store/profile';
import { accentLime, onAccentLime, useThemeColors } from '@/theme';

const MSG_MAX = 2000;

const CATEGORIES: { id: FeedbackCategory; Icon: LucideIcon; labelKey: string }[] = [
  { id: 'bug', Icon: Bug, labelKey: 'feedback.catBug' },
  { id: 'suggestion', Icon: Lightbulb, labelKey: 'feedback.catSuggestion' },
  { id: 'content', Icon: Newspaper, labelKey: 'feedback.catContent' },
  { id: 'other', Icon: MessageCircle, labelKey: 'feedback.catOther' },
];

function CategoryRow({
  Icon,
  label,
  active,
  onPress,
}: {
  Icon: LucideIcon;
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <PressableScale haptic="selection" accessibilityLabel={label} onPress={onPress}>
      <View
        className={`flex-row items-center gap-3 rounded-2xl p-3.5 border ${
          active
            ? 'border-lime bg-lime/10'
            : 'bg-surface dark:bg-surface-raised-dark border-border dark:border-border-dark'
        }`}>
        <View className="w-10 h-10 rounded-xl items-center justify-center bg-[#101410] dark:bg-white/[0.06]">
          <Icon size={19} color={accentLime} />
        </View>
        <Text className="flex-1 font-heading text-[15px] text-ink dark:text-ink-dark">{label}</Text>
        <View
          className={`w-6 h-6 rounded-full items-center justify-center ${
            active ? '' : 'border-2 border-border dark:border-border-dark'
          }`}
          style={active ? { backgroundColor: accentLime } : undefined}>
          {active && <Check size={15} color={onAccentLime} strokeWidth={3} />}
        </View>
      </View>
    </PressableScale>
  );
}

export default function FeedbackScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const colors = useThemeColors();
  const profileEmail = useProfile((s) => s.email);

  const [category, setCategory] = useState<FeedbackCategory>('bug');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState(profileEmail);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSend = message.trim().length > 0 && !busy;

  const onSubmit = async () => {
    if (!canSend) return;
    const userId = useAuth.getState().userId;
    if (!userId) {
      setError(t('feedback.failed'));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await submitFeedback({ userId, category, message, email, appVersion: '1.0.0' });
      setSent(true);
    } catch {
      setError(t('feedback.failed'));
      setBusy(false);
    }
  };

  return (
    <View className="flex-1 bg-cream dark:bg-surface-dark">
      <SafeAreaView edges={['top', 'bottom']} className="flex-1">
        <View className="flex-row items-center gap-3 px-4 pt-2 pb-1">
          <PressableScale
            haptic="selection"
            accessibilityLabel={t('common.back')}
            onPress={() => router.back()}>
            <ArrowLeft size={24} color={colors.text} />
          </PressableScale>
          <Text className="font-heading text-2xl tracking-tight text-ink dark:text-ink-dark">
            {t('feedback.title')}
          </Text>
        </View>

        {sent ? (
          <View className="flex-1 items-center justify-center px-10 gap-4 pb-16">
            <View
              className="w-20 h-20 rounded-full items-center justify-center"
              style={{ backgroundColor: accentLime }}>
              <CheckCircle2 size={40} color={onAccentLime} />
            </View>
            <Text className="font-heading text-xl text-center text-ink dark:text-ink-dark">
              {t('feedback.thanksTitle')}
            </Text>
            <Text className="font-body text-[14px] leading-[20px] text-center text-ink-muted dark:text-ink-dark-muted">
              {t('feedback.thanksBody')}
            </Text>
            <PressableScale haptic="light" accessibilityLabel={t('common.close')} onPress={() => router.back()}>
              <View className="h-12 px-6 rounded-2xl items-center justify-center bg-surface dark:bg-surface-raised-dark border border-border dark:border-border-dark mt-2">
                <Text className="font-heading text-[15px] text-ink dark:text-ink-dark">
                  {t('common.close')}
                </Text>
              </View>
            </PressableScale>
          </View>
        ) : (
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            className="flex-1">
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerClassName="px-4 pt-3 pb-8 gap-5">
              <Text className="font-body text-[14px] leading-[20px] text-ink-muted dark:text-ink-dark-muted">
                {t('feedback.subtitle')}
              </Text>

              <View className="gap-2">
                <Text className="font-body-medium text-[13px] text-ink dark:text-ink-dark">
                  {t('feedback.categoryLabel')}
                </Text>
                <View className="gap-2.5">
                  {CATEGORIES.map((c) => (
                    <CategoryRow
                      key={c.id}
                      Icon={c.Icon}
                      label={t(c.labelKey)}
                      active={category === c.id}
                      onPress={() => setCategory(c.id)}
                    />
                  ))}
                </View>
              </View>

              <View className="gap-2">
                <View className="flex-row items-center justify-between">
                  <Text className="font-body-medium text-[13px] text-ink dark:text-ink-dark">
                    {t('feedback.messageLabel')}
                  </Text>
                  <Text className="font-body text-[11px] text-ink-muted dark:text-ink-dark-muted tabular-nums">
                    {message.length}/{MSG_MAX}
                  </Text>
                </View>
                <View className="rounded-xl px-3.5 py-3 bg-surface dark:bg-surface-raised-dark border border-border dark:border-border-dark">
                  <TextInput
                    value={message}
                    onChangeText={setMessage}
                    placeholder={t('feedback.messagePlaceholder')}
                    placeholderTextColor={colors.textMuted}
                    multiline
                    maxLength={MSG_MAX}
                    textAlignVertical="top"
                    className="min-h-[140px] font-body text-[15px] leading-[21px] text-ink dark:text-ink-dark"
                  />
                </View>
              </View>

              <View className="gap-2">
                <Text className="font-body-medium text-[13px] text-ink dark:text-ink-dark">
                  {t('feedback.emailLabel')}
                </Text>
                <View className="rounded-xl px-3.5 py-3 bg-surface dark:bg-surface-raised-dark border border-border dark:border-border-dark">
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="ornek@eposta.com"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    className="font-body text-[15px] text-ink dark:text-ink-dark"
                  />
                </View>
              </View>

              {error && <Text className="font-body text-[13px] text-danger">{error}</Text>}

              <PrimaryButton
                label={busy ? t('feedback.sending') : t('feedback.send')}
                icon={null}
                onPress={onSubmit}
                style={canSend ? undefined : { opacity: 0.4 }}
              />
            </ScrollView>
          </KeyboardAvoidingView>
        )}
      </SafeAreaView>
    </View>
  );
}
