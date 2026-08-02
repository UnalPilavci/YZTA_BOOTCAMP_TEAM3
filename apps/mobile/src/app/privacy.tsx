import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PressableScale } from '@/components/ui/pressable-scale';
import { privacyPolicy } from '@/data/legal';
import { useThemeColors } from '@/theme';

export default function PrivacyScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const colors = useThemeColors();
  const doc = privacyPolicy(i18n.language);

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
            {doc.title}
          </Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerClassName="px-5 pt-3 pb-10">
          <Text className="font-body text-[12px] text-ink-muted dark:text-ink-dark-muted">
            {doc.updated}
          </Text>
          <Text className="font-body text-[15px] leading-[23px] text-ink dark:text-ink-dark mt-3">
            {doc.intro}
          </Text>

          {doc.sections.map((s) => (
            <View key={s.heading} className="mt-6">
              <Text className="font-heading text-[16px] tracking-tight text-ink dark:text-ink-dark">
                {s.heading}
              </Text>
              <Text className="font-body text-[14px] leading-[22px] text-ink-muted dark:text-ink-dark-muted mt-1.5">
                {s.body}
              </Text>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
