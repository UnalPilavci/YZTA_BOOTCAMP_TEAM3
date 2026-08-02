import { useRouter } from 'expo-router';
import { ArrowLeft, ChevronDown, HelpCircle, MessageSquare } from 'lucide-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LayoutAnimation, Platform, ScrollView, Text, UIManager, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PressableScale } from '@/components/ui/pressable-scale';
import { accentLime, useThemeColors } from '@/theme';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type FaqItem = { id: string; qKey: string; aKey: string };
type FaqGroup = { titleKey: string; items: FaqItem[] };

const GROUPS: FaqGroup[] = [
  {
    titleKey: 'help.groupScan',
    items: [
      { id: 'q1', qKey: 'help.q1', aKey: 'help.a1' },
      { id: 'q2', qKey: 'help.q2', aKey: 'help.a2' },
      { id: 'q3', qKey: 'help.q3', aKey: 'help.a3' },
    ],
  },
  {
    titleKey: 'help.groupHealth',
    items: [
      { id: 'q4', qKey: 'help.q4', aKey: 'help.a4' },
      { id: 'q5', qKey: 'help.q5', aKey: 'help.a5' },
    ],
  },
  {
    titleKey: 'help.groupCommunity',
    items: [
      { id: 'q6', qKey: 'help.q6', aKey: 'help.a6' },
      { id: 'q7', qKey: 'help.q7', aKey: 'help.a7' },
    ],
  },
  {
    titleKey: 'help.groupAccount',
    items: [
      { id: 'q8', qKey: 'help.q8', aKey: 'help.a8' },
      { id: 'q9', qKey: 'help.q9', aKey: 'help.a9' },
    ],
  },
];

export default function HelpScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const colors = useThemeColors();
  const [open, setOpen] = useState<string | null>('q1');

  const toggle = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen((cur) => (cur === id ? null : id));
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
            {t('help.title')}
          </Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerClassName="px-4 pt-3 pb-10 gap-6">
          <View className="flex-row items-start gap-3">
            <View className="w-11 h-11 rounded-2xl items-center justify-center bg-[#101410] dark:bg-white/[0.06]">
              <HelpCircle size={22} color={accentLime} />
            </View>
            <Text className="flex-1 font-body text-[14px] leading-[20px] text-ink-muted dark:text-ink-dark-muted mt-1">
              {t('help.subtitle')}
            </Text>
          </View>

          {GROUPS.map((group) => (
            <View key={group.titleKey} className="gap-2">
              <Text className="font-body-bold text-[11px] tracking-[1.5px] text-ink-muted dark:text-ink-dark-muted uppercase px-1">
                {t(group.titleKey)}
              </Text>
              <View className="rounded-2xl bg-surface dark:bg-surface-raised-dark border border-border dark:border-border-dark overflow-hidden">
                {group.items.map((item, i) => (
                  <FaqRow
                    key={item.id}
                    question={t(item.qKey)}
                    answer={t(item.aKey)}
                    expanded={open === item.id}
                    first={i === 0}
                    onPress={() => toggle(item.id)}
                  />
                ))}
              </View>
            </View>
          ))}

          <View className="rounded-2xl p-4 gap-2.5 bg-[#101410] dark:bg-surface-raised-dark border-l-[3px] border-lime">
            <Text className="font-heading text-[16px] text-white">{t('help.stillTitle')}</Text>
            <Text className="font-body text-[13.5px] leading-[19px] text-white/60">
              {t('help.stillBody')}
            </Text>
            <PressableScale
              haptic="light"
              accessibilityLabel={t('help.contactCta')}
              onPress={() => router.push('/feedback')}
              style={{ alignSelf: 'flex-start', marginTop: 2 }}>
              <View
                className="flex-row items-center gap-2 h-10 px-4 rounded-xl"
                style={{ backgroundColor: accentLime }}>
                <MessageSquare size={16} color="#0C0F0C" />
                <Text className="font-heading text-[13px]" style={{ color: '#0C0F0C' }}>
                  {t('help.contactCta')}
                </Text>
              </View>
            </PressableScale>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function FaqRow({
  question,
  answer,
  expanded,
  first,
  onPress,
}: {
  question: string;
  answer: string;
  expanded: boolean;
  first: boolean;
  onPress: () => void;
}) {
  const colors = useThemeColors();
  return (
    <View className={first ? '' : 'border-t border-border dark:border-border-dark'}>
      <PressableScale haptic="selection" accessibilityLabel={question} onPress={onPress}>
        <View className="flex-row items-center gap-3 px-4 py-3.5">
          <Text className="flex-1 font-heading text-[14.5px] leading-[20px] text-ink dark:text-ink-dark">
            {question}
          </Text>
          <ChevronDown
            size={18}
            color={expanded ? accentLime : colors.textMuted}
            style={{ transform: [{ rotate: expanded ? '180deg' : '0deg' }] }}
          />
        </View>
      </PressableScale>
      {expanded && (
        <View className="px-4 pb-4 -mt-0.5">
          <Text className="font-body text-[13.5px] leading-[20px] text-ink-muted dark:text-ink-dark-muted">
            {answer}
          </Text>
        </View>
      )}
    </View>
  );
}
