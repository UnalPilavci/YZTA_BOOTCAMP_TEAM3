import { useRouter } from 'expo-router';
import {
  Activity,
  Baby,
  Bean,
  Bone,
  Brain,
  Droplet,
  Droplets,
  Flame,
  FlaskConical,
  Flower2,
  Gauge,
  Heart,
  HeartPulse,
  type LucideIcon,
  MilkOff,
  PersonStanding,
  Scale,
  ShieldAlert,
  Stethoscope,
  WheatOff,
  Wind,
  Zap,
} from 'lucide-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, View } from 'react-native';

import { ConditionRow } from '@/components/register/condition-row';
import { EditScaffold } from '@/components/profile/edit-scaffold';
import { CONDITIONS } from '@/data/profile-options';
import { useAuth } from '@/store/auth';
import { useProfile } from '@/store/profile';

const ICONS: Record<string, LucideIcon> = {
  diabetes: Droplet,
  hypertension: Gauge,
  celiac: WheatOff,
  high_cholesterol: Heart,
  kidney_disease: Bean,
  heart_disease: HeartPulse,
  reflux: Flame,
  ibs: Wind,
  lactose_intolerance: MilkOff,
  thyroid: Activity,
  gout: Bone,
  anemia: Droplets,
  obesity: Scale,
  pregnancy: Baby,
  pcos: Flower2,
  migraine: Brain,
  asthma: Stethoscope,
  gastritis: Zap,
  ibd: ShieldAlert,
  osteoporosis: PersonStanding,
  pku: FlaskConical,
};

export default function EditConditionsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const conditions = useProfile((s) => s.conditions);

  const [selected, setSelected] = useState<string[]>(conditions);
  const [saving, setSaving] = useState(false);

  const toggle = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const onSave = async () => {
    useProfile.getState().setCategory('conditions', selected);
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
      kicker={t('register.kickerConditions')}
      title={t('register.conditions.title')}
      subtitle={t('register.conditions.subtitle')}
      onBack={() => router.back()}
      saveLabel={t('common.save')}
      onSave={onSave}
      saving={saving}>
      <View className="gap-3">
        {CONDITIONS.map((id) => (
          <ConditionRow
            key={id}
            label={t(`options.conditions.${id}`)}
            Icon={ICONS[id]}
            selected={selected.includes(id)}
            onPress={() => toggle(id)}
          />
        ))}
      </View>
    </EditScaffold>
  );
}
