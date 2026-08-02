import { useRouter } from 'expo-router';
import {
  AlertTriangle,
  ArrowLeft,
  Bell,
  ChevronRight,
  CircleQuestionMark,
  Crown,
  EyeOff,
  HeartPulse,
  Languages,
  Leaf,
  Lightbulb,
  ListChecks,
  Lock,
  LogOut,
  Mail,
  Megaphone,
  MessageSquare,
  Moon,
  Ruler,
  ShieldCheck,
  Sparkles,
  Target,
  Star,
  Trash2,
  User,
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Alert, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PressableScale } from '@/components/ui/pressable-scale';
import {
  SettingsDivider,
  SettingsRow,
  SettingsSection,
} from '@/components/ui/settings-list';
import { Toggle } from '@/components/ui/toggle';
import { planOf } from '@/data/plans';
import { usePlan } from '@/hooks/use-plan';
import { deleteAccountAndClear, signOutAndClear } from '@/services/session';
import { useProfile } from '@/store/profile';
import { useSettings, type ThemeMode } from '@/store/settings';
import { onAccentLime, useThemeColors } from '@/theme';

export default function SettingsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const colors = useThemeColors();

  const theme = useSettings((s) => s.theme);
  const setTheme = useSettings((s) => s.setTheme);
  const language = useSettings((s) => s.language);
  const setLanguage = useSettings((s) => s.setLanguage);
  const notifications = useSettings((s) => s.notifications);
  const setNotifications = useSettings((s) => s.setNotifications);
  const dailyTip = useSettings((s) => s.dailyTip);
  const setDailyTip = useSettings((s) => s.setDailyTip);
  const units = useSettings((s) => s.units);
  const setUnits = useSettings((s) => s.setUnits);
  const plan = usePlan();

  const conditions = useProfile((s) => s.conditions);
  const allergens = useProfile((s) => s.allergens);
  const sensitivities = useProfile((s) => s.sensitivities);
  const diets = useProfile((s) => s.diets);
  const heightCm = useProfile((s) => s.heightCm);
  const weightKg = useProfile((s) => s.weightKg);
  const goal = useProfile((s) => s.goal);
  const countText = (n: number) => (n > 0 ? String(n) : t('profile.none'));
  const bodyText = heightCm && weightKg ? `${heightCm} · ${weightKg}` : t('profile.bodyMetricsEmpty');

  const confirmSignOut = () =>
    Alert.alert(t('settings.signOutConfirmTitle'), t('settings.signOutConfirmMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('settings.logOut'), style: 'destructive', onPress: () => void signOutAndClear() },
    ]);

  const confirmDeleteAccount = () =>
    Alert.alert(t('settings.deleteConfirmTitle'), t('settings.deleteConfirmMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('settings.deleteAccount'),
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteAccountAndClear();
          } catch {
            Alert.alert(t('settings.deleteFailedTitle'), t('settings.deleteFailedMessage'));
          }
        },
      },
    ]);

  return (
    <View className="flex-1 bg-cream dark:bg-surface-dark">
      <SafeAreaView edges={['top', 'bottom']} className="flex-1">
        <View className="flex-row items-center gap-3 px-4 pt-2 pb-1">
          <PressableScale
            haptic="selection"
            accessibilityLabel={t('common.back')}
            onPress={() => router.back()}>
            <ArrowLeft size={24} color={colors.text} />
          </PressableScale>
          <Text className="font-heading text-2xl tracking-tight text-ink dark:text-ink-dark">
            {t('settings.title')}
          </Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerClassName="px-4 pt-3 pb-8 gap-6">
          <SettingsSection title={t('settings.healthSection')}>
            <SettingsRow
              Icon={HeartPulse}
              label={t('profile.conditionsLabel')}
              onPress={() => router.push('/edit-conditions')}>
              <Value text={countText(conditions.length)} />
            </SettingsRow>
            <SettingsDivider />
            <SettingsRow
              Icon={AlertTriangle}
              label={t('profile.allergensLabel')}
              onPress={() => router.push('/edit-allergens')}>
              <Value text={countText(allergens.length)} />
            </SettingsRow>
            <SettingsDivider />
            <SettingsRow
              Icon={Sparkles}
              label={t('profile.sensitivitiesLabel')}
              onPress={() => router.push('/edit-sensitivities')}>
              <Value text={countText(sensitivities.length)} />
            </SettingsRow>
            <SettingsDivider />
            <SettingsRow
              Icon={Leaf}
              label={t('profile.dietsLabel')}
              onPress={() => router.push('/edit-diets')}>
              <Value text={countText(diets.length)} />
            </SettingsRow>
            <SettingsDivider />
            <SettingsRow
              Icon={Ruler}
              label={t('profile.bodyMetricsLabel')}
              onPress={() => router.push('/edit-body')}>
              <Value text={bodyText} />
            </SettingsRow>
            <SettingsDivider />
            <SettingsRow
              Icon={Target}
              label={t('goal.rowLabel')}
              onPress={() => router.push('/edit-goal')}>
              <Value text={goal ? t(`options.goal.${goal}`) : t('goal.notSet')} />
            </SettingsRow>
          </SettingsSection>

          <SettingsSection title={t('profile.communitySection')}>
            <SettingsRow
              Icon={ListChecks}
              label={t('profile.activityRow')}
              onPress={() => router.push('/discover-settings')}>
              <ChevronRight size={18} color={colors.textMuted} />
            </SettingsRow>
            <SettingsDivider />
            <SettingsRow
              Icon={Megaphone}
              label={t('listings.myListingsTitle')}
              onPress={() => router.push('/my-listings')}>
              <ChevronRight size={18} color={colors.textMuted} />
            </SettingsRow>
            <SettingsDivider />
            <SettingsRow
              Icon={Crown}
              label={t('profile.planLabel')}
              onPress={() => router.push('/plans')}>
              <View
                className="rounded-pill px-2.5 py-1"
                style={{ backgroundColor: planOf(plan).accent }}>
                <Text
                  className="font-body-bold text-[11px] tracking-wider"
                  style={{ color: onAccentLime }}>
                  {t(`plans.names.${plan}`).toLocaleUpperCase(language)}
                </Text>
              </View>
            </SettingsRow>
          </SettingsSection>

          <SettingsSection title={t('settings.preferences')}>
            <SettingsRow Icon={Moon} label={t('settings.theme')}>
              <ThemeSegmented value={theme} onChange={setTheme} />
            </SettingsRow>
            <SettingsDivider />
            <SettingsRow Icon={Bell} label={t('settings.notifications')}>
              <Toggle value={notifications} onChange={setNotifications} />
            </SettingsRow>
            <SettingsDivider />
            <SettingsRow Icon={Lightbulb} label={t('settings.dailyTip')}>
              <Toggle value={dailyTip} onChange={setDailyTip} />
            </SettingsRow>
            <SettingsDivider />
            <SettingsRow
              Icon={Mail}
              label={t('settings.newsletter')}
              onPress={() => router.push('/newsletter')}>
              <ChevronRight size={18} color={colors.textMuted} />
            </SettingsRow>
            <SettingsDivider />
            <SettingsRow
              Icon={Ruler}
              label={t('settings.units')}
              onPress={() =>
                setUnits(units === 'metric' ? 'imperial' : 'metric')
              }>
              <Value
                text={t(
                  units === 'metric'
                    ? 'settings.unitsMetric'
                    : 'settings.unitsImperial',
                )}
              />
            </SettingsRow>
            <SettingsDivider />
            <SettingsRow
              Icon={Languages}
              label={t('settings.language')}
              onPress={() => setLanguage(language === 'tr' ? 'en' : 'tr')}>
              <Value text={language === 'tr' ? 'Türkçe' : 'English'} />
            </SettingsRow>
          </SettingsSection>

          <SettingsSection title={t('settings.account')}>
            <SettingsRow
              Icon={User}
              label={t('settings.editProfile')}
              onPress={() => router.push('/discover-edit')}>
              <ChevronRight size={18} color={colors.textMuted} />
            </SettingsRow>
            <SettingsDivider />
            <SettingsRow
              Icon={EyeOff}
              label={t('settings.privacyRow')}
              onPress={() => router.push('/privacy-settings')}>
              <ChevronRight size={18} color={colors.textMuted} />
            </SettingsRow>
            <SettingsDivider />
            <SettingsRow
              Icon={Lock}
              label={t('settings.changePassword')}
              onPress={() => router.push('/change-password')}>
              <ChevronRight size={18} color={colors.textMuted} />
            </SettingsRow>
          </SettingsSection>

          <SettingsSection title={t('settings.support')}>
            <SettingsRow
              Icon={MessageSquare}
              label={t('settings.feedback')}
              onPress={() => router.push('/feedback')}>
              <ChevronRight size={18} color={colors.textMuted} />
            </SettingsRow>
            <SettingsDivider />
            <SettingsRow
              Icon={CircleQuestionMark}
              label={t('settings.help')}
              onPress={() => router.push('/help')}>
              <ChevronRight size={18} color={colors.textMuted} />
            </SettingsRow>
            <SettingsDivider />
            <SettingsRow
              Icon={ShieldCheck}
              label={t('settings.privacy')}
              onPress={() => router.push('/privacy')}>
              <ChevronRight size={18} color={colors.textMuted} />
            </SettingsRow>
            <SettingsDivider />
            <SettingsRow
              Icon={Star}
              label={t('settings.rate')}
              onPress={() => Alert.alert(t('common.comingSoon'), t('settings.rateSoonBody'))}>
              <ChevronRight size={18} color={colors.textMuted} />
            </SettingsRow>
          </SettingsSection>

          <PressableScale
            haptic="medium"
            accessibilityLabel={t('settings.logOut')}
            onPress={confirmSignOut}>
            <View className="flex-row items-center justify-center gap-2 h-[54px] rounded-2xl bg-surface dark:bg-surface-raised-dark border border-border dark:border-border-dark">
              <LogOut size={18} color="#DB4C40" />
              <Text className="font-heading text-base" style={{ color: '#DB4C40' }}>
                {t('settings.logOut')}
              </Text>
            </View>
          </PressableScale>

          <PressableScale
            haptic="medium"
            accessibilityLabel={t('settings.deleteAccount')}
            onPress={confirmDeleteAccount}>
            <View className="flex-row items-center justify-center gap-2 h-11">
              <Trash2 size={16} color={colors.textMuted} />
              <Text className="font-body-medium text-[13px] text-ink-muted dark:text-ink-dark-muted">
                {t('settings.deleteAccount')}
              </Text>
            </View>
          </PressableScale>

          <Text className="text-center font-body text-xs text-ink-muted dark:text-ink-dark-muted">
            nutriLens v1.0.0
          </Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function Value({ text }: { text: string }) {
  const colors = useThemeColors();
  return (
    <View className="flex-row items-center gap-1">
      <Text className="font-body text-sm text-ink-muted dark:text-ink-dark-muted">
        {text}
      </Text>
      <ChevronRight size={16} color={colors.textMuted} />
    </View>
  );
}

function ThemeSegmented({
  value,
  onChange,
}: {
  value: ThemeMode;
  onChange: (v: ThemeMode) => void;
}) {
  const options: { value: ThemeMode; label: string }[] = [
    { value: 'light', label: 'settings.themeLight' },
    { value: 'dark', label: 'settings.themeDark' },
    { value: 'system', label: 'settings.themeAuto' },
  ];
  const { t } = useTranslation();
  return (
    <View className="flex-row rounded-lg p-0.5 bg-cream dark:bg-[#0C0F0C]">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <PressableScale
            key={o.value}
            haptic="selection"
            accessibilityLabel={t(o.label)}
            onPress={() => onChange(o.value)}>
            <View
              className={`px-2.5 py-1 rounded-md ${
                active ? 'bg-[#101410] dark:bg-lime' : ''
              }`}>
              <Text
                className={`font-body-medium text-[12px] ${
                  active
                    ? 'text-white dark:text-lime-on'
                    : 'text-ink-muted dark:text-ink-dark-muted'
                }`}>
                {t(o.label)}
              </Text>
            </View>
          </PressableScale>
        );
      })}
    </View>
  );
}
