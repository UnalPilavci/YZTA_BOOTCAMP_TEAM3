import { useRouter } from 'expo-router';
import { Info } from 'lucide-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Text, View } from 'react-native';

import { AddAllergenSheet } from '@/components/register/add-allergen-sheet';
import { AddAllergenChip, AllergenChip } from '@/components/register/allergen-chip';
import { EditScaffold } from '@/components/profile/edit-scaffold';
import { ALLERGEN_EMOJI, ALLERGENS } from '@/data/profile-options';
import { useAuth } from '@/store/auth';
import { allergenLabel, CUSTOM_PREFIX, useProfile } from '@/store/profile';
import { useThemeColors } from '@/theme';

export default function EditAllergensScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const colors = useThemeColors();
  const allergens = useProfile((s) => s.allergens);

  const [selected, setSelected] = useState<string[]>(allergens);
  const [saving, setSaving] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  const customAllergens = selected.filter((id) => id.startsWith(CUSTOM_PREFIX));

  const toggle = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const addCustom = (label: string) =>
    setSelected((prev) => {
      const id = `${CUSTOM_PREFIX}${label.trim()}`;
      if (!label.trim() || prev.includes(id)) return prev;
      return [...prev, id];
    });

  const onSave = async () => {
    useProfile.getState().setCategory('allergens', selected);
    const uid = useAuth.getState().userId;
    if (!uid) return router.back();
    setSaving(true);
    try {
      await useProfile.getState().saveToServer(uid);
      router.back();
    } catch {
      Alert.alert(t('profile.editSaveFailed'));
      setSaving(false);
    }
  };

  return (
    <>
      <EditScaffold
        kicker={t('register.kickerAllergens')}
        title={t('register.allergens.title')}
        subtitle={t('register.allergens.subtitle')}
        onBack={() => router.back()}
        saveLabel={t('common.save')}
        onSave={onSave}
        saving={saving}
        footerAccessory={
          selected.length > 0 ? (
            <View className="flex-row items-center gap-2 rounded-xl px-3.5 py-3 mb-3 bg-surface dark:bg-surface-raised-dark border border-border dark:border-border-dark">
              <Info size={16} color={colors.lime} />
              <Text className="flex-1 font-body text-[13px] text-ink-muted dark:text-ink-dark-muted">
                {t('register.allergens.selectedInfo', { count: selected.length })}
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
              selected={selected.includes(o.id)}
              onPress={() => toggle(o.id)}
            />
          ))}

          {customAllergens.map((id) => (
            <AllergenChip
              key={id}
              label={allergenLabel(id, t)}
              selected
              onPress={() => toggle(id)}
            />
          ))}

          <AddAllergenChip
            label={t('register.allergens.addOther')}
            onPress={() => setSheetOpen(true)}
          />
        </View>
      </EditScaffold>

      <AddAllergenSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onAdd={addCustom}
      />
    </>
  );
}
