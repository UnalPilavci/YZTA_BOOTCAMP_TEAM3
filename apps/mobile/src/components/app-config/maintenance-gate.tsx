import { Wrench } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppConfig } from '@/store/app-config';
import { accentLime, onAccentLime } from '@/theme';

export function MaintenanceGate() {
  const { t, i18n } = useTranslation();
  const maintenance = useAppConfig((s) => s.maintenance);
  if (!maintenance.enabled) return null;

  const isTr = i18n.language.toLowerCase().startsWith('tr');
  const message = (isTr ? maintenance.messageTr : maintenance.messageEn).trim();

  return (
    <View
      style={{ position: 'absolute', inset: 0, zIndex: 999 }}
      className="bg-cream dark:bg-[#0C0F0C]">
      <SafeAreaView edges={['top', 'bottom']} className="flex-1 items-center justify-center px-10 gap-4">
        <View
          className="w-20 h-20 rounded-3xl items-center justify-center"
          style={{ backgroundColor: accentLime }}>
          <Wrench size={36} color={onAccentLime} />
        </View>
        <Text className="font-heading text-2xl text-ink dark:text-ink-dark text-center">
          {t('maintenance.title')}
        </Text>
        <Text className="font-body text-[15px] leading-[22px] text-ink-muted dark:text-ink-dark-muted text-center">
          {message || t('maintenance.subtitle')}
        </Text>
      </SafeAreaView>
    </View>
  );
}
