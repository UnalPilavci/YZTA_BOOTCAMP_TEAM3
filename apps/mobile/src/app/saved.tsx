import { useRouter } from 'expo-router';
import { ArrowLeft, BookmarkCheck, ChevronRight } from 'lucide-react-native';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PressableScale } from '@/components/ui/pressable-scale';
import { Reveal } from '@/components/ui/reveal';
import { getDictionaryEntry, pickText, type DictionaryEntry } from '@/data/dictionary';
import type { RiskLevel } from '@/services/analysis/types';
import { useSaved } from '@/store/saved';
import { accentLime, stateColors, useThemeColors } from '@/theme';

const RISK_COLOR: Record<RiskLevel, string> = {
  safe: stateColors.safe,
  caution: stateColors.caution,
  risk: stateColors.risk,
};
const RISK_KEY: Record<RiskLevel, string> = {
  safe: 'result.riskSafe',
  caution: 'result.riskCaution',
  risk: 'result.riskRisk',
};

export default function SavedScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const colors = useThemeColors();
  const ids = useSaved((s) => s.ids);
  const toggleSaved = useSaved((s) => s.toggle);

  const entries = useMemo(
    () => ids.map((id) => getDictionaryEntry(id)).filter((e): e is DictionaryEntry => !!e),
    [ids],
  );

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
            {t('saved.title')}
          </Text>
        </View>

        {entries.length === 0 ? (
          <View className="flex-1 items-center justify-center px-10 gap-3 pb-20">
            <BookmarkCheck size={40} color={colors.textMuted} />
            <Text className="text-center font-body-medium text-[14px] text-ink-muted dark:text-ink-dark-muted">
              {t('saved.empty')}
            </Text>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-4 pt-2 pb-10 gap-3">
            {entries.map((e, i) => {
              const color = RISK_COLOR[e.risk];
              return (
                <Reveal key={e.id} index={Math.min(i, 8)}>
                  <PressableScale
                    haptic="light"
                    accessibilityLabel={pickText(e.name, i18n.language)}
                    onPress={() => router.push({ pathname: '/ingredient', params: { id: e.id } })}>
                    <View className="flex-row items-center gap-3 rounded-2xl p-3.5 bg-surface dark:bg-surface-raised-dark border border-border dark:border-border-dark">
                      <View className="w-11 h-11 rounded-xl items-center justify-center bg-cream dark:bg-surface-dark">
                        <Text className="font-body-bold text-[11px] text-ink dark:text-ink-dark">
                          {e.code}
                        </Text>
                      </View>
                      <View className="flex-1">
                        <Text numberOfLines={1} className="font-heading text-[15px] text-ink dark:text-ink-dark">
                          {pickText(e.name, i18n.language)}
                        </Text>
                        <View className="flex-row items-center gap-1.5 mt-0.5">
                          <View className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                          <Text className="font-body text-[12px] text-ink-muted dark:text-ink-dark-muted">
                            {t(`dictionary.cat.${e.category}`)} · {t(RISK_KEY[e.risk])}
                          </Text>
                        </View>
                      </View>
                      <PressableScale
                        haptic="light"
                        accessibilityLabel={t('saved.remove')}
                        onPress={() => toggleSaved(e.id)}>
                        <BookmarkCheck size={20} color={accentLime} />
                      </PressableScale>
                      <ChevronRight size={18} color={colors.textMuted} />
                    </View>
                  </PressableScale>
                </Reveal>
              );
            })}
          </ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
}
