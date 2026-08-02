import { useRouter } from 'expo-router';
import { ArrowRight } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { AllergenChip } from '@/components/register/allergen-chip';
import { RegisterScaffold } from '@/components/register/register-scaffold';
import { DIET_EMOJI, DIETS } from '@/data/profile-options';
import { useProfile } from '@/store/profile';

export default function DietsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const diets = useProfile((s) => s.diets);
  const toggle = useProfile((s) => s.toggle);

  return (
    <RegisterScaffold
      kicker={t('register.kickerDiets')}
      step={6}
      totalSteps={7}
      onBack={() => router.back()}
      title={t('register.diets.title')}
      subtitle={t('register.diets.subtitle')}
      primaryLabel={t('common.continue')}
      onPrimary={() => router.push('/done')}
      PrimaryIcon={ArrowRight}>
      <View className="flex-row flex-wrap gap-2.5">
        {DIETS.map((o) => (
          <AllergenChip
            key={o.id}
            label={t(`options.diets.${o.id}`)}
            emoji={DIET_EMOJI[o.id]}
            selected={diets.includes(o.id)}
            onPress={() => toggle('diets', o.id)}
          />
        ))}
      </View>
    </RegisterScaffold>
  );
}
