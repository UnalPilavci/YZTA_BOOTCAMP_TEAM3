import { useLocalSearchParams } from 'expo-router';
import { Bookmark, BookmarkCheck, CircleAlert, CircleCheck, TriangleAlert } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import { PressableScale } from '@/components/ui/pressable-scale';
import {
  findDictionaryEntry,
  getDictionaryEntry,
  pickText,
  type DictionaryEntry,
} from '@/data/dictionary';
import type { RiskLevel } from '@/services/analysis/types';
import { useSaved } from '@/store/saved';
import { accentLime, stateColors, useThemeColors } from '@/theme';

const RISK_META: Record<
  RiskLevel,
  { Icon: typeof CircleCheck; color: string; labelKey: string }
> = {
  safe: { Icon: CircleCheck, color: stateColors.safe, labelKey: 'result.riskSafe' },
  caution: { Icon: CircleAlert, color: stateColors.caution, labelKey: 'result.riskCaution' },
  risk: { Icon: TriangleAlert, color: stateColors.risk, labelKey: 'result.riskRisk' },
};

export default function IngredientSheet() {
  const { t, i18n } = useTranslation();
  const colors = useThemeColors();
  const saved = useSaved((s) => s.ids);
  const toggleSaved = useSaved((s) => s.toggle);
  const params = useLocalSearchParams<{
    id?: string;
    code?: string;
    name?: string;
    note?: string;
    risk?: string;
  }>();

  const entry: DictionaryEntry | undefined = params.id
    ? getDictionaryEntry(params.id)
    : findDictionaryEntry({ code: params.code, name: params.name });

  const lang = i18n.language;
  const risk: RiskLevel = entry?.risk ?? riskFromParam(params.risk);
  const meta = RISK_META[risk];
  const RiskIcon = meta.Icon;
  const title = entry ? pickText(entry.name, lang) : (params.name ?? '—');
  const code = entry?.code ?? params.code;

  return (
    <View className="bg-cream dark:bg-[#0C0F0C] px-5 pt-6 pb-10 gap-4">
      {(!!code || !!entry) && (
        <View className="flex-row items-center gap-2">
          {!!code && (
            <View className="rounded-md px-2.5 py-1 bg-surface dark:bg-surface-raised-dark">
              <Text className="font-body-bold text-[13px] text-ink dark:text-ink-dark">
                {code}
              </Text>
            </View>
          )}
          {entry && (
            <View className="rounded-pill border border-border dark:border-border-dark px-3 py-1">
              <Text className="font-body-medium text-xs text-ink-muted dark:text-ink-dark-muted">
                {t(`dictionary.cat.${entry.category}`)}
              </Text>
            </View>
          )}
          {entry && (
            <PressableScale
              haptic="light"
              accessibilityLabel={t('saved.save')}
              onPress={() => toggleSaved(entry.id)}
              style={{ marginLeft: 'auto' }}>
              <View className="w-9 h-9 rounded-xl items-center justify-center bg-surface dark:bg-surface-raised-dark">
                {saved.includes(entry.id) ? (
                  <BookmarkCheck size={18} color={accentLime} />
                ) : (
                  <Bookmark size={18} color={colors.text} />
                )}
              </View>
            </PressableScale>
          )}
        </View>
      )}

      <Text className="font-heading text-2xl text-ink dark:text-ink-dark">{title}</Text>

      <View
        className="self-start flex-row items-center gap-2 rounded-pill px-3 py-1.5"
        style={{ backgroundColor: `${meta.color}18`, borderColor: `${meta.color}40`, borderWidth: 1 }}>
        <RiskIcon size={18} color={meta.color} />
        <Text className="font-body-bold text-[13px]" style={{ color: meta.color }}>
          {t(meta.labelKey)}
        </Text>
      </View>

      {entry ? (
        <>
          <Section title={t('dictionary.whatIs')}>{pickText(entry.what, lang)}</Section>
          <Section title={t('dictionary.foundIn')}>{pickText(entry.foundIn, lang)}</Section>
          <Text className="font-body-medium text-xs text-ink-muted dark:text-ink-dark-muted">
            {t('dictionary.source')}: {entry.source}
          </Text>
        </>
      ) : (
        <>
          <Text className="font-body text-[13px] leading-[18px] text-ink-muted dark:text-ink-dark-muted">
            {t('dictionary.aiNoteHint')}
          </Text>
          {!!params.note && (
            <Section title={t('dictionary.aiNote')}>{params.note}</Section>
          )}
        </>
      )}

      <Text className="font-body text-xs leading-4 text-center text-ink-muted dark:text-ink-dark-muted mt-2">
        {t('dictionary.disclaimer')}
      </Text>
    </View>
  );
}

function riskFromParam(raw?: string): RiskLevel {
  return raw === 'risk' || raw === 'caution' || raw === 'safe' ? raw : 'safe';
}

function Section({ title, children }: { title: string; children: string }) {
  return (
    <View className="rounded-2xl border border-border dark:border-border-dark bg-surface dark:bg-surface-dark p-4 gap-1">
      <Text className="font-heading text-[15px] text-ink dark:text-ink-dark">{title}</Text>
      <Text className="font-body text-sm leading-[21px] text-ink-muted dark:text-ink-dark-muted">
        {children}
      </Text>
    </View>
  );
}
