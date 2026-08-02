import { useRouter } from 'expo-router';
import { ArrowRight, Info } from 'lucide-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import { AddAllergenSheet } from '@/components/register/add-allergen-sheet';
import { AddAllergenChip, AllergenChip } from '@/components/register/allergen-chip';
import { RegisterScaffold } from '@/components/register/register-scaffold';
import { ALLERGEN_EMOJI, ALLERGENS } from '@/data/profile-options';
import { allergenLabel, CUSTOM_PREFIX, useProfile } from '@/store/profile';
import { useThemeColors } from '@/theme';

export default function AllergensScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const colors = useThemeColors();
  const allergens = useProfile((s) => s.allergens);
  const toggle = useProfile((s) => s.toggle);
  const addCustomAllergen = useProfile((s) => s.addCustomAllergen);
  const [sheetOpen, setSheetOpen] = useState(false);

  const customAllergens = allergens.filter((id) => id.startsWith(CUSTOM_PREFIX));

  return (
    <>
      <RegisterScaffold
        kicker={t('register.kickerAllergens')}
        step={4}
        totalSteps={7}
        onBack={() => router.back()}
        title={t('register.allergens.title')}
        subtitle={t('register.allergens.subtitle')}
        primaryLabel={t('common.continue')}
        onPrimary={() => router.push('/sensitivities')}
        PrimaryIcon={ArrowRight}
        footerAccessory={
          allergens.length > 0 ? (
            <View className="flex-row items-center gap-2 rounded-xl px-3.5 py-3 mb-3 bg-surface dark:bg-surface-raised-dark border border-border dark:border-border-dark">
              <Info size={16} color={colors.lime} />
              <Text className="flex-1 font-body text-[13px] text-ink-muted dark:text-ink-dark-muted">
                {t('register.allergens.selectedInfo', { count: allergens.length })}
              </Text>
            </View>
          ) : null
        }>
        <View className="flex-row flex-wrap gap-2.5">
          {ALLERGENS.map((o) => (
            <AllergenChip
              key={o.id}
              label={t(`options.allergens.${o.id}`)}
              emoji={ALLERGEN_EMOJI[o.id]}
              selected={allergens.includes(o.id)}
              onPress={() => toggle('allergens', o.id)}
            />
          ))}

          {customAllergens.map((id) => (
            <AllergenChip
              key={id}
              label={allergenLabel(id, t)}
              selected
              onPress={() => toggle('allergens', id)}
            />
          ))}

          <AddAllergenChip
            label={t('register.allergens.addOther')}
            onPress={() => setSheetOpen(true)}
          />
        </View>
      </RegisterScaffold>

      <AddAllergenSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onAdd={addCustomAllergen}
      />
    </>
  );
}
