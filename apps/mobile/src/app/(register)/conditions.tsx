import { useRouter } from 'expo-router';
import {
  Activity,
  ArrowRight,
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
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import { ConditionRow } from '@/components/register/condition-row';
import { RegisterScaffold } from '@/components/register/register-scaffold';
import { PressableScale } from '@/components/ui/pressable-scale';
import { CONDITIONS } from '@/data/profile-options';
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

export default function ConditionsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const conditions = useProfile((s) => s.conditions);
  const toggle = useProfile((s) => s.toggle);

  const next = () => router.push('/allergens');

  const onNone = () => {
    conditions.forEach((id) => toggle('conditions', id));
    next();
  };

  return (
    <RegisterScaffold
      kicker={t('register.kickerConditions')}
      step={3}
      totalSteps={7}
      onBack={() => router.back()}
      title={t('register.conditions.title')}
      subtitle={t('register.conditions.subtitle')}
      primaryLabel={t('common.continue')}
      onPrimary={next}
      PrimaryIcon={ArrowRight}>
      <View className="gap-3">
        {CONDITIONS.map((id) => (
          <ConditionRow
            key={id}
            label={t(`options.conditions.${id}`)}
            Icon={ICONS[id]}
            selected={conditions.includes(id)}
            onPress={() => toggle('conditions', id)}
          />
        ))}

        <PressableScale haptic="selection" onPress={onNone}>
          <Text className="text-center font-body-medium text-sm text-ink-muted dark:text-ink-dark-muted py-2">
            {t('register.conditions.none')} →
          </Text>
        </PressableScale>
      </View>
    </RegisterScaffold>
  );
}
