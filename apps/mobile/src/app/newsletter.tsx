import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Check,
  Lightbulb,
  Mail,
  Sparkles,
  Trophy,
  UtensilsCrossed,
  type LucideIcon,
} from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
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
import {
  fetchNewsletter,
  saveNewsletter,
  type NewsletterTopic,
} from '@/services/supabase/newsletter';
import { useAuth } from '@/store/auth';
import { useProfile } from '@/store/profile';
import { accentLime, onAccentLime, useThemeColors } from '@/theme';

const TOPICS: { id: NewsletterTopic; Icon: LucideIcon; labelKey: string; descKey: string }[] = [
  { id: 'recipes', Icon: UtensilsCrossed, labelKey: 'newsletter.topicRecipes', descKey: 'newsletter.topicRecipesDesc' },
  { id: 'tips', Icon: Lightbulb, labelKey: 'newsletter.topicTips', descKey: 'newsletter.topicTipsDesc' },
  { id: 'contests', Icon: Trophy, labelKey: 'newsletter.topicContests', descKey: 'newsletter.topicContestsDesc' },
  { id: 'features', Icon: Sparkles, labelKey: 'newsletter.topicFeatures', descKey: 'newsletter.topicFeaturesDesc' },
];

export default function NewsletterScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const colors = useThemeColors();
  const profileEmail = useProfile((s) => s.email);

  const [loading, setLoading] = useState(true);
  const [subscribed, setSubscribed] = useState(false);
  const [topics, setTopics] = useState<NewsletterTopic[]>(['recipes', 'tips', 'contests', 'features']);
  const [email, setEmail] = useState(profileEmail);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    const userId = useAuth.getState().userId;
    if (!userId) {
      setLoading(false);
      return;
    }
    void fetchNewsletter(userId)
      .then((sub) => {
        if (!active || !sub) return;
        setSubscribed(sub.subscribed);
        if (sub.topics.length) setTopics(sub.topics);
        if (sub.email) setEmail(sub.email);
      })
      .catch(() => {})
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const toggleTopic = (id: NewsletterTopic) =>
    setTopics((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const persist = async (nextSubscribed: boolean) => {
    const userId = useAuth.getState().userId;
    if (!userId) return;
    setBusy(true);
    try {
      await saveNewsletter(userId, { subscribed: nextSubscribed, topics, email });
      setSubscribed(nextSubscribed);
      if (nextSubscribed) Alert.alert(t('newsletter.subscribedTitle'), t('newsletter.subscribedBody'));
    } catch {
      Alert.alert(t('common.error'), t('newsletter.failed'));
    } finally {
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
            {t('newsletter.title')}
          </Text>
        </View>

        {loading ? (
          <View className="flex-1 items-center justify-center pb-16">
            <ActivityIndicator color={colors.textMuted} />
          </View>
        ) : (
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            className="flex-1">
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerClassName="px-4 pt-3 pb-8 gap-5">
              <View
                className="overflow-hidden rounded-[26px] p-5 gap-2.5 bg-[#101410] dark:bg-surface-raised-dark"
                style={{ borderLeftWidth: 3, borderLeftColor: accentLime }}>
                <View
                  pointerEvents="none"
                  className="absolute -top-10 -right-8 w-40 h-40 rounded-full opacity-20"
                  style={{ backgroundColor: accentLime }}
                />
                <View
                  className="w-11 h-11 rounded-2xl items-center justify-center"
                  style={{ backgroundColor: accentLime }}>
                  <Mail size={22} color={onAccentLime} />
                </View>
                <Text className="font-heading text-[22px] leading-[27px] text-white mt-1">
                  {t('newsletter.heroTitle')}
                </Text>
                <Text className="font-body text-[14px] leading-[20px] text-white/60">
                  {t('newsletter.heroBody')}
                </Text>
                {subscribed && (
                  <View className="flex-row items-center gap-1.5 mt-1">
                    <Check size={15} color={accentLime} />
                    <Text className="font-heading text-[13px]" style={{ color: accentLime }}>
                      {t('newsletter.activeBadge')}
                    </Text>
                  </View>
                )}
              </View>

              <View className="gap-2">
                <Text className="font-body-medium text-[13px] text-ink dark:text-ink-dark">
                  {t('newsletter.topicsLabel')}
                </Text>
                <View className="gap-2.5">
                  {TOPICS.map((topic) => {
                    const active = topics.includes(topic.id);
                    const Icon = topic.Icon;
                    return (
                      <PressableScale
                        key={topic.id}
                        haptic="selection"
                        accessibilityLabel={t(topic.labelKey)}
                        onPress={() => toggleTopic(topic.id)}>
                        <View
                          className={`flex-row items-center gap-3 rounded-2xl p-3.5 border ${
                            active
                              ? 'border-lime bg-lime/10'
                              : 'bg-surface dark:bg-surface-raised-dark border-border dark:border-border-dark'
                          }`}>
                          <View
                            className="w-10 h-10 rounded-xl items-center justify-center bg-[#101410] dark:bg-white/[0.06]">
                            <Icon size={19} color={accentLime} />
                          </View>
                          <View className="flex-1">
                            <Text className="font-heading text-[14px] text-ink dark:text-ink-dark">
                              {t(topic.labelKey)}
                            </Text>
                            <Text className="font-body text-[12px] text-ink-muted dark:text-ink-dark-muted">
                              {t(topic.descKey)}
                            </Text>
                          </View>
                          <View
                            className={`w-6 h-6 rounded-md items-center justify-center ${
                              active ? '' : 'border-2 border-border dark:border-border-dark'
                            }`}
                            style={active ? { backgroundColor: accentLime } : undefined}>
                            {active && <Check size={15} color={onAccentLime} strokeWidth={3} />}
                          </View>
                        </View>
                      </PressableScale>
                    );
                  })}
                </View>
              </View>

              <View className="gap-2">
                <Text className="font-body-medium text-[13px] text-ink dark:text-ink-dark">
                  {t('newsletter.emailLabel')}
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

              <PrimaryButton
                label={
                  busy
                    ? t('newsletter.saving')
                    : subscribed
                      ? t('newsletter.update')
                      : t('newsletter.subscribe')
                }
                icon={null}
                onPress={() => void persist(true)}
                style={email.trim() && !busy ? undefined : { opacity: 0.4 }}
              />

              {subscribed && (
                <PressableScale
                  haptic="medium"
                  accessibilityLabel={t('newsletter.unsubscribe')}
                  onPress={() => void persist(false)}>
                  <Text className="text-center font-body-medium text-[13px] text-ink-muted dark:text-ink-dark-muted py-1">
                    {t('newsletter.unsubscribe')}
                  </Text>
                </PressableScale>
              )}
            </ScrollView>
          </KeyboardAvoidingView>
        )}
      </SafeAreaView>
    </View>
  );
}
