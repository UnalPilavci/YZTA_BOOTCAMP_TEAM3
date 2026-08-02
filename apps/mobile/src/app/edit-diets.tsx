import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, View } from 'react-native';

import { AllergenChip } from '@/components/register/allergen-chip';
import { EditScaffold } from '@/components/profile/edit-scaffold';
import { DIET_EMOJI, DIETS } from '@/data/profile-options';
import { useAuth } from '@/store/auth';
import { useProfile } from '@/store/profile';

export default function EditDietsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const diets = useProfile((s) => s.diets);

  const [selected, setSelected] = useState<string[]>(diets);
  const [saving, setSaving] = useState(false);

  const toggle = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const onSave = async () => {
    useProfile.getState().setCategory('diets', selected);
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
    <EditScaffold
      kicker={t('register.kickerDiets')}
      title={t('register.diets.title')}
      subtitle={t('register.diets.subtitle')}
      onBack={() => router.back()}
      saveLabel={t('common.save')}
      onSave={onSave}
      saving={saving}>
      <View className="flex-row flex-wrap gap-2.5">
        {DIETS.map((o) => (
          <AllergenChip
            key={o.id}
            label={t(`options.diets.${o.id}`)}
            emoji={DIET_EMOJI[o.id]}
            selected={selected.includes(o.id)}
            onPress={() => toggle(o.id)}
          />
        ))}
      </View>
    </EditScaffold>
  );
}
