import { Megaphone } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import { useAppConfig } from '@/store/app-config';
import { accentLime, onAccentLime } from '@/theme';

export function AnnouncementBanner() {
  const { i18n } = useTranslation();
  const announcement = useAppConfig((s) => s.announcement);
  if (!announcement.active) return null;

  const isTr = i18n.language.toLowerCase().startsWith('tr');
  const text = (isTr ? announcement.textTr : announcement.textEn).trim();
  if (!text) return null;

  return (
    <View
      className="flex-row items-center gap-2.5 rounded-2xl px-3.5 py-2.5"
      style={{ backgroundColor: accentLime }}>
      <Megaphone size={16} color={onAccentLime} />
      <Text className="flex-1 font-body-medium text-[13px] leading-[18px]" style={{ color: onAccentLime }}>
        {text}
      </Text>
    </View>
  );
}
