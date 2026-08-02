import { useRouter } from 'expo-router';
import { ArrowRight } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { AllergenChip } from '@/components/register/allergen-chip';
import { RegisterScaffold } from '@/components/register/register-scaffold';
import { SENSITIVITIES, SENSITIVITY_EMOJI } from '@/data/profile-options';
import { useProfile } from '@/store/profile';

export default function SensitivitiesScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const sensitivities = useProfile((s) => s.sensitivities);
  const toggle = useProfile((s) => s.toggle);

  return (
    <RegisterScaffold
      kicker={t('register.kickerSensitivities')}
      step={5}
      totalSteps={7}
      onBack={() => router.back()}
      title={t('register.sensitivities.title')}
      subtitle={t('register.sensitivities.subtitle')}
      primaryLabel={t('common.continue')}
      onPrimary={() => router.push('/diets')}
      PrimaryIcon={ArrowRight}>
      <View className="flex-row flex-wrap gap-2.5">
        {SENSITIVITIES.map((o) => (
          <AllergenChip
            key={o.id}
            label={t(`options.sensitivities.${o.id}`)}
            emoji={SENSITIVITY_EMOJI[o.id]}
            selected={sensitivities.includes(o.id)}
            onPress={() => toggle('sensitivities', o.id)}
          />
        ))}
      </View>
    </RegisterScaffold>
  );
}
