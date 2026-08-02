import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, View } from 'react-native';

import { AllergenChip } from '@/components/register/allergen-chip';
import { EditScaffold } from '@/components/profile/edit-scaffold';
import { SENSITIVITIES, SENSITIVITY_EMOJI } from '@/data/profile-options';
import { useAuth } from '@/store/auth';
import { useProfile } from '@/store/profile';

export default function EditSensitivitiesScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const sensitivities = useProfile((s) => s.sensitivities);

  const [selected, setSelected] = useState<string[]>(sensitivities);
  const [saving, setSaving] = useState(false);

  const toggle = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const onSave = async () => {
    useProfile.getState().setCategory('sensitivities', selected);
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
      kicker={t('register.kickerSensitivities')}
      title={t('register.sensitivities.title')}
      subtitle={t('register.sensitivities.subtitle')}
      onBack={() => router.back()}
      saveLabel={t('common.save')}
      onSave={onSave}
      saving={saving}>
      <View className="flex-row flex-wrap gap-2.5">
        {SENSITIVITIES.map((o) => (
          <AllergenChip
            key={o.id}
            label={t(`options.sensitivities.${o.id}`)}
            emoji={SENSITIVITY_EMOJI[o.id]}
            selected={selected.includes(o.id)}
            onPress={() => toggle(o.id)}
          />
        ))}
      </View>
    </EditScaffold>
  );
}
