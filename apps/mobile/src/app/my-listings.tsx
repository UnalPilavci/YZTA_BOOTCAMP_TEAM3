import { useFocusEffect, useRouter } from 'expo-router';
import { ArrowLeft, Globe, MapPin, Megaphone, Pencil, Plus, Trash2 } from 'lucide-react-native';
import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PressableScale } from '@/components/ui/pressable-scale';
import { Reveal } from '@/components/ui/reveal';
import { useHasFeature } from '@/hooks/use-plan';
import {
  deleteListing,
  fetchMyListings,
  type ListingView,
  type RoleType,
} from '@/services/supabase/listings';
import { useAuth } from '@/store/auth';
import { accentLime, useThemeColors } from '@/theme';

const ROLE_LABEL_KEY: Record<RoleType, string> = {
  trainer: 'options.roleTypes.trainer',
  dietitian: 'options.roleTypes.dietitian',
};

export default function MyListingsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const colors = useThemeColors();
  const canPost = useHasFeature('listings');

  const [listings, setListings] = useState<ListingView[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const myId = useAuth.getState().userId;
    if (!myId) return;
    try {
      setListings(await fetchMyListings(myId));
    } catch {
    }
  }, []);

  const didLoad = useRef(false);
  useFocusEffect(
    useCallback(() => {
      let active = true;
      const firstLoad = !didLoad.current;
      if (firstLoad) setLoading(true);
      void load().finally(() => {
        didLoad.current = true;
        if (active && firstLoad) setLoading(false);
      });
      return () => {
        active = false;
      };
    }, [load]),
  );

  const onDelete = (id: string) =>
    Alert.alert(t('listings.deleteConfirmTitle'), '', [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('history.delete'),
        style: 'destructive',
        onPress: async () => {
          const backup = listings;
          setListings((prev) => prev.filter((l) => l.id !== id));
          try {
            await deleteListing(id);
          } catch {
            setListings(backup);
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
          <Text className="flex-1 font-heading text-2xl tracking-tight text-ink dark:text-ink-dark">
            {t('listings.myListingsTitle')}
          </Text>
        </View>

        {loading ? (
          <View className="flex-1 items-center justify-center pb-20">
            <ActivityIndicator color={colors.textMuted} />
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerClassName="px-4 pt-3 pb-10 gap-3">
            {canPost && (
              <PressableScale
                haptic="light"
                accessibilityLabel={t('listings.createCta')}
                onPress={() => router.push('/create-listing')}>
                <View className="flex-row items-center justify-center gap-2 h-12 rounded-2xl bg-[#101410] dark:bg-lime">
                  <Plus size={18} color={accentLime} />
                  <Text className="font-heading text-[14px] text-lime dark:text-lime-on">
                    {t('listings.createCta')}
                  </Text>
                </View>
              </PressableScale>
            )}

            {listings.length === 0 ? (
              <View className="items-center justify-center pt-16 px-8 gap-2">
                <Megaphone size={40} color={colors.textMuted} />
                <Text className="text-center font-body-medium text-[14px] text-ink-muted dark:text-ink-dark-muted">
                  {t('listings.myListingsEmpty')}
                </Text>
              </View>
            ) : (
              listings.map((listing, i) => (
                <Reveal key={listing.id} index={i} delayStep={40}>
                  <ListingCard
                    listing={listing}
                    roleLabel={t(ROLE_LABEL_KEY[listing.roleType])}
                    onOpen={() =>
                      router.push({
                        pathname: '/listing-detail',
                        params: { listingId: listing.id },
                      })
                    }
                    onEdit={() =>
                      router.push({
                        pathname: '/create-listing',
                        params: { listingId: listing.id },
                      })
                    }
                    onDelete={() => onDelete(listing.id)}
                  />
                </Reveal>
              ))
            )}
          </ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
}

function ListingCard({
  listing,
  roleLabel,
  onOpen,
  onEdit,
  onDelete,
}: {
  listing: ListingView;
  roleLabel: string;
  onOpen: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { t } = useTranslation();
  const colors = useThemeColors();

  return (
    <View className="rounded-2xl p-3.5 gap-3 bg-surface dark:bg-surface-raised-dark border border-border dark:border-border-dark">
      <PressableScale haptic="light" accessibilityLabel={listing.title} onPress={onOpen}>
        <View className="gap-2">
          <View className="flex-row items-center gap-2">
            <View className="rounded-pill px-2.5 py-0.5 bg-brand-tint dark:bg-brand-dark-tint">
              <Text className="font-body-bold text-[10px] text-brand dark:text-brand-dark">
                {roleLabel}
              </Text>
            </View>
          </View>
          <Text className="font-heading text-[16px] leading-[21px] text-ink dark:text-ink-dark">
            {listing.title}
          </Text>
          {(!!listing.city || !!listing.workMode) && (
            <View className="flex-row items-center flex-wrap gap-x-3 gap-y-1">
              {!!listing.city && (
                <View className="flex-row items-center gap-1.5">
                  <MapPin size={13} color={accentLime} />
                  <Text className="font-body text-[13px] text-ink-muted dark:text-ink-dark-muted">
                    {listing.city}
                  </Text>
                </View>
              )}
              {!!listing.workMode && (
                <View className="flex-row items-center gap-1.5">
                  <Globe size={13} color={accentLime} />
                  <Text className="font-body text-[13px] text-ink-muted dark:text-ink-dark-muted">
                    {t(`options.workModes.${listing.workMode}`)}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </PressableScale>

      <View className="flex-row items-center justify-end gap-2 pt-1 border-t border-border dark:border-border-dark">
        <PressableScale
          haptic="light"
          accessibilityLabel={t('listings.editCta')}
          onPress={onEdit}>
          <View className="flex-row items-center gap-1.5 h-9 px-3.5 rounded-full bg-cream dark:bg-surface-dark border border-border dark:border-border-dark">
            <Pencil size={14} color={colors.text} />
            <Text className="font-body-medium text-[13px] text-ink dark:text-ink-dark">
              {t('listings.editCta')}
            </Text>
          </View>
        </PressableScale>
        <PressableScale
          haptic="medium"
          accessibilityLabel={t('history.delete')}
          onPress={onDelete}>
          <View className="w-9 h-9 rounded-full items-center justify-center bg-danger/10 border border-danger/30">
            <Trash2 size={15} color="#E24C4C" />
          </View>
        </PressableScale>
      </View>
    </View>
  );
}
