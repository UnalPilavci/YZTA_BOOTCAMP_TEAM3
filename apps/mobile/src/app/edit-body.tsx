import { useRouter } from 'expo-router';
import { Ruler, Weight } from 'lucide-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Text, View } from 'react-native';

import { EditScaffold } from '@/components/profile/edit-scaffold';
import { TextField } from '@/components/register/text-field';
import { useAuth } from '@/store/auth';
import { useProfile } from '@/store/profile';

const onlyDigits = (s: string) => s.replace(/[^0-9]/g, '');

export default function EditBodyScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  const [height, setHeight] = useState(useProfile.getState().heightCm);
  const [weight, setWeight] = useState(useProfile.getState().weightKg);
  const [waist, setWaist] = useState(useProfile.getState().waistCm);
  const [hip, setHip] = useState(useProfile.getState().hipCm);
  const [neck, setNeck] = useState(useProfile.getState().neckCm);
  const [chest, setChest] = useState(useProfile.getState().chestCm);
  const [arm, setArm] = useState(useProfile.getState().armCm);
  const [thigh, setThigh] = useState(useProfile.getState().thighCm);
  const [saving, setSaving] = useState(false);

  const onSave = async () => {
    useProfile.getState().setBody({
      heightCm: height.trim(),
      weightKg: weight.trim(),
      waistCm: waist.trim(),
      hipCm: hip.trim(),
      neckCm: neck.trim(),
      chestCm: chest.trim(),
      armCm: arm.trim(),
      thighCm: thigh.trim(),
    });
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
      kicker={t('profile.bodyMetricsLabel')}
      title={t('profile.editBodyTitle')}
      subtitle={t('profile.editBodySubtitle')}
      onBack={() => router.back()}
      saveLabel={t('common.save')}
      onSave={onSave}
      saving={saving}>
      <View className="gap-4">
        <View className="flex-row gap-3">
          <Field label={t('register.account.height')} Icon={Ruler} value={height} onChange={setHeight} placeholder="175" />
          <Field label={t('register.account.weight')} Icon={Weight} value={weight} onChange={setWeight} placeholder="70" />
        </View>

        <Text className="font-body-medium text-[13px] text-ink-muted dark:text-ink-dark-muted -mb-1">
          {t('profile.measuresOptional')}
        </Text>
        <View className="flex-row gap-3">
          <Field label={t('profile.waistLabel')} Icon={Ruler} value={waist} onChange={setWaist} placeholder="82" />
          <Field label={t('profile.hipLabel')} Icon={Ruler} value={hip} onChange={setHip} placeholder="96" />
        </View>
        <View className="flex-row gap-3">
          <Field label={t('profile.neckLabel')} Icon={Ruler} value={neck} onChange={setNeck} placeholder="38" />
          <Field label={t('profile.chestLabel')} Icon={Ruler} value={chest} onChange={setChest} placeholder="100" />
        </View>
        <View className="flex-row gap-3">
          <Field label={t('profile.armLabel')} Icon={Ruler} value={arm} onChange={setArm} placeholder="34" />
          <Field label={t('profile.thighLabel')} Icon={Ruler} value={thigh} onChange={setThigh} placeholder="56" />
        </View>
      </View>
    </EditScaffold>
  );
}

function Field({
  label,
  Icon,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  Icon: typeof Ruler;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <View className="flex-1">
      <TextField
        label={label}
        Icon={Icon}
        value={value}
        onChangeText={(v) => onChange(onlyDigits(v))}
        placeholder={placeholder}
        keyboardType="number-pad"
        maxLength={3}
      />
    </View>
  );
}
