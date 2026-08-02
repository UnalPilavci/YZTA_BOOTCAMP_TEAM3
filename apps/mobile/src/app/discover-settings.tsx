import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  Heart,
  LayoutGrid,
  MessageCircle,
  Pencil,
  ShieldCheck,
  Star,
  UserMinus,
  Users,
  UserPlus,
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PressableScale } from '@/components/ui/pressable-scale';
import {
  SettingsChevron,
  SettingsDivider,
  SettingsRow,
  SettingsSection,
} from '@/components/ui/settings-list';
import { useThemeColors } from '@/theme';

export default function DiscoverSettingsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const colors = useThemeColors();

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
            {t('discoverSettings.title')}
          </Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerClassName="px-4 pt-3 pb-8 gap-6">
          <SettingsSection title={t('discoverSettings.activitySection')}>
            <SettingsRow
              Icon={LayoutGrid}
              label={t('discoverSettings.myPosts')}
              onPress={() => router.push('/my-posts-feed')}>
              <SettingsChevron />
            </SettingsRow>
            <SettingsDivider />
            <SettingsRow
              Icon={Heart}
              label={t('discoverSettings.likedPosts')}
              onPress={() => router.push({ pathname: '/post-collection', params: { mode: 'liked' } })}>
              <SettingsChevron />
            </SettingsRow>
            <SettingsDivider />
            <SettingsRow
              Icon={Bookmark}
              label={t('discoverSettings.savedPosts')}
              onPress={() => router.push({ pathname: '/post-collection', params: { mode: 'saved' } })}>
              <SettingsChevron />
            </SettingsRow>
            <SettingsDivider />
            <SettingsRow
              Icon={BookmarkCheck}
              label={t('saved.rowLabel')}
              onPress={() => router.push('/saved')}>
              <SettingsChevron />
            </SettingsRow>
            <SettingsDivider />
            <SettingsRow
              Icon={MessageCircle}
              label={t('discoverSettings.myComments')}
              onPress={() => router.push('/my-comments')}>
              <SettingsChevron />
            </SettingsRow>
            <SettingsDivider />
            <SettingsRow
              Icon={Star}
              label={t('discoverSettings.myRatings')}
              onPress={() => router.push('/my-ratings')}>
              <SettingsChevron />
            </SettingsRow>
          </SettingsSection>

          <SettingsSection title={t('discoverSettings.networkSection')}>
            <SettingsRow
              Icon={Users}
              label={t('discoverSettings.followers')}
              onPress={() => router.push({ pathname: '/user-list', params: { mode: 'followers' } })}>
              <SettingsChevron />
            </SettingsRow>
            <SettingsDivider />
            <SettingsRow
              Icon={UserPlus}
              label={t('discoverSettings.following')}
              onPress={() => router.push({ pathname: '/user-list', params: { mode: 'following' } })}>
              <SettingsChevron />
            </SettingsRow>
            <SettingsDivider />
            <SettingsRow
              Icon={UserMinus}
              label={t('discoverSettings.blocked')}
              onPress={() => router.push({ pathname: '/user-list', params: { mode: 'blocked' } })}>
              <SettingsChevron />
            </SettingsRow>
          </SettingsSection>

          <SettingsSection title={t('discoverSettings.accountSection')}>
            <SettingsRow
              Icon={Pencil}
              label={t('discover.editProfile')}
              onPress={() => router.push('/discover-edit')}>
              <SettingsChevron />
            </SettingsRow>
            <SettingsDivider />
            <SettingsRow
              Icon={ShieldCheck}
              label={t('settings.privacy')}
              onPress={() => router.push('/privacy')}>
              <SettingsChevron />
            </SettingsRow>
          </SettingsSection>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
