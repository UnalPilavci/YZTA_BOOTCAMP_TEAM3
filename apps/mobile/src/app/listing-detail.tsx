import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowUpRight,
  AtSign,
  ChevronsLeftRight,
  Globe,
  MapPin,
  MessageCircle,
  Pencil,
  Phone,
  Trash2,
} from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  type LayoutChangeEvent,
  Linking,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/avatar';
import { PressableScale } from '@/components/ui/pressable-scale';
import { SPECIALTY_EMOJI } from '@/data/trainer-options';
import {
  deleteListing,
  fetchListing,
  type ListingView,
  type RoleType,
} from '@/services/supabase/listings';
import { useAuth } from '@/store/auth';
import { accentLime, useThemeColors } from '@/theme';

const SHEET_RATIO = 0.62;
const CLOSE_DISTANCE = 130;
const CLOSE_VELOCITY = 900;
const OPEN_MS = 240;
const CLOSE_MS = 200;
const BACKDROP_MAX_OPACITY = 0.4;

const ROLE_LABEL_KEY: Record<RoleType, string> = {
  trainer: 'options.roleTypes.trainer',
  dietitian: 'options.roleTypes.dietitian',
};

export default function ListingDetailScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const { listingId } = useLocalSearchParams<{ listingId?: string }>();

  const sheetHeight = Math.round(height * SHEET_RATIO);
  const translateY = useSharedValue(sheetHeight);

  const [listing, setListing] = useState<ListingView | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    translateY.value = withTiming(0, { duration: OPEN_MS });
  }, [translateY]);

  const goBack = useCallback(() => router.back(), [router]);

  const dismiss = useCallback(() => {
    translateY.value = withTiming(sheetHeight, { duration: CLOSE_MS }, (finished) => {
      if (finished) runOnJS(goBack)();
    });
  }, [translateY, sheetHeight, goBack]);

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      translateY.value = Math.max(0, e.translationY);
    })
    .onEnd((e) => {
      if (e.translationY > CLOSE_DISTANCE || e.velocityY > CLOSE_VELOCITY) {
        translateY.value = withTiming(sheetHeight, { duration: CLOSE_MS }, (finished) => {
          if (finished) runOnJS(goBack)();
        });
      } else {
        translateY.value = withTiming(0, { duration: 160 });
      }
    });

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateY.value,
      [0, sheetHeight],
      [BACKDROP_MAX_OPACITY, 0],
      Extrapolation.CLAMP,
    ),
  }));
  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }] }));

  useEffect(() => {
    const myId = useAuth.getState().userId;
    if (!listingId || !myId) return;
    setLoading(true);
    void fetchListing(listingId, myId)
      .then(setListing)
      .finally(() => setLoading(false));
  }, [listingId]);

  const onDelete = () =>
    Alert.alert(t('listings.deleteConfirmTitle'), '', [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('history.delete'),
        style: 'destructive',
        onPress: async () => {
          if (!listingId) return;
          try {
            await deleteListing(listingId);
          } catch {
          }
          dismiss();
        },
      },
    ]);

  const onEdit = () => {
    router.replace({ pathname: '/create-listing', params: { listingId } });
  };

  return (
    <View className="flex-1 justify-end">
      <Animated.View style={[{ position: 'absolute', inset: 0, backgroundColor: '#000' }, backdropStyle]}>
        <Pressable className="flex-1" onPress={dismiss} accessibilityLabel={t('common.cancel')} />
      </Animated.View>

      <Animated.View
        style={[{ height: sheetHeight }, sheetStyle]}
        className="rounded-t-[28px] overflow-hidden bg-cream dark:bg-[#0C0F0C]">
        <GestureDetector gesture={pan}>
          <View className="pt-2.5 pb-3 items-center border-b border-border dark:border-border-dark">
            <View className="w-10 h-1 rounded-full bg-ink-muted/40 dark:bg-ink-dark-muted/40 mb-3" />
            <Text className="font-heading text-[16px] tracking-tight text-ink dark:text-ink-dark">
              {t('listings.detailTitle')}
            </Text>
          </View>
        </GestureDetector>

        {loading || !listing ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color={colors.textMuted} />
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: 20, paddingBottom: Math.max(insets.bottom, 20), gap: 16 }}>
            <View className="flex-row items-center gap-3">
              <Avatar
                initial={(listing.authorName.trim()[0] ?? '?').toLocaleUpperCase('tr')}
                uri={listing.authorAvatarUrl}
                size={44}
              />
              <View className="flex-1">
                <Text className="font-heading text-[16px] text-ink dark:text-ink-dark">
                  {listing.authorName || t('profile.guest')}
                </Text>
                {listing.isMine && (
                  <Text className="font-body text-[12px] text-ink-muted dark:text-ink-dark-muted">
                    {t('listings.myListingBadge')}
                  </Text>
                )}
              </View>
              <View className="rounded-pill px-2.5 py-1 bg-brand-tint dark:bg-brand-dark-tint">
                <Text className="font-body-bold text-[11px] text-brand dark:text-brand-dark">
                  {t(ROLE_LABEL_KEY[listing.roleType])}
                </Text>
              </View>
            </View>

            <Text className="font-display text-[22px] leading-[28px] text-ink dark:text-ink-dark">
              {listing.title}
            </Text>

            {(!!listing.city || !!listing.workMode) && (
              <View className="flex-row items-center flex-wrap gap-x-3 gap-y-1.5">
                {!!listing.city && (
                  <View className="flex-row items-center gap-1.5">
                    <MapPin size={14} color={accentLime} />
                    <Text className="font-body text-[14px] text-ink-muted dark:text-ink-dark-muted">
                      {listing.city}
                    </Text>
                  </View>
                )}
                {!!listing.workMode && (
                  <View className="flex-row items-center gap-1.5">
                    <Globe size={14} color={accentLime} />
                    <Text className="font-body text-[14px] text-ink-muted dark:text-ink-dark-muted">
                      {t(`options.workModes.${listing.workMode}`)}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {listing.specialties.length > 0 && (
              <View className="flex-row flex-wrap gap-1.5">
                {listing.specialties.map((id) => (
                  <View
                    key={id}
                    className="flex-row items-center gap-1 rounded-pill px-2.5 py-1 bg-surface dark:bg-surface-raised-dark border border-border dark:border-border-dark">
                    {!!SPECIALTY_EMOJI[id] && <Text className="text-[12px]">{SPECIALTY_EMOJI[id]}</Text>}
                    <Text className="font-body-medium text-[12px] text-ink-muted dark:text-ink-dark-muted">
                      {t(`options.specialties.${id}`)}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {!!listing.bio && (
              <Text className="font-body text-[14px] leading-[21px] text-ink dark:text-ink-dark">
                {listing.bio}
              </Text>
            )}

            {listing.isMine ? (
              <SlideActions onEdit={onEdit} onDelete={onDelete} />
            ) : (
              <View className="gap-2.5 pt-1">
                {!!listing.contactPhone && (
                  <ContactRow
                    Icon={Phone}
                    label={t('listings.callCta')}
                    value={listing.contactPhone}
                    onPress={() => Linking.openURL(`tel:${listing.contactPhone}`)}
                  />
                )}
                {!!listing.contactInstagram && (
                  <ContactRow
                    Icon={AtSign}
                    label={t('listings.instagramCta')}
                    value={listing.contactInstagram}
                    onPress={() =>
                      Linking.openURL(
                        `https://instagram.com/${listing.contactInstagram!.replace(/^@/, '')}`,
                      )
                    }
                  />
                )}
                {!!listing.contactWhatsapp && (
                  <ContactRow
                    Icon={MessageCircle}
                    label={t('listings.whatsappCta')}
                    value={listing.contactWhatsapp}
                    onPress={() =>
                      Linking.openURL(
                        `https://wa.me/${listing.contactWhatsapp!.replace(/[^0-9]/g, '')}`,
                      )
                    }
                  />
                )}
              </View>
            )}
          </ScrollView>
        )}
      </Animated.View>
    </View>
  );
}

const KNOB = 54;
const KNOB_PAD = 5;
const TRIGGER_RATIO = 0.72;

function SlideActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const [trackW, setTrackW] = useState(0);
  const x = useSharedValue(0);

  const maxTravel = trackW > 0 ? trackW / 2 - KNOB / 2 - KNOB_PAD : 0;

  const onLayout = (e: LayoutChangeEvent) => setTrackW(Math.round(e.nativeEvent.layout.width));

  const fire = (dir: 'edit' | 'delete') => (dir === 'edit' ? onEdit() : onDelete());

  const pan = Gesture.Pan()
    .activeOffsetX([-8, 8])
    .onUpdate((e) => {
      x.value = Math.max(-maxTravel, Math.min(maxTravel, e.translationX));
    })
    .onEnd(() => {
      const threshold = maxTravel * TRIGGER_RATIO;
      if (maxTravel > 0 && x.value <= -threshold) {
        runOnJS(fire)('edit');
      } else if (maxTravel > 0 && x.value >= threshold) {
        runOnJS(fire)('delete');
      }
      x.value = withTiming(0, { duration: 200 });
    });

  const knobStyle = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
  const editStyle = useAnimatedStyle(() => ({
    opacity: interpolate(x.value, [-maxTravel, 0], [1, 0.4], Extrapolation.CLAMP),
  }));
  const deleteStyle = useAnimatedStyle(() => ({
    opacity: interpolate(x.value, [0, maxTravel], [0.4, 1], Extrapolation.CLAMP),
  }));

  return (
    <View
      onLayout={onLayout}
      className="h-16 rounded-full mt-1 items-center justify-center overflow-hidden bg-surface dark:bg-surface-raised-dark border border-border dark:border-border-dark">
      <Animated.View
        pointerEvents="none"
        style={[{ position: 'absolute', left: 18 }, editStyle]}
        className="flex-row items-center gap-1.5">
        <Pencil size={16} color={colors.text} />
        <Text className="font-heading text-[13px] text-ink dark:text-ink-dark">
          {t('listings.editCta')}
        </Text>
      </Animated.View>

      <Animated.View
        pointerEvents="none"
        style={[{ position: 'absolute', right: 18 }, deleteStyle]}
        className="flex-row items-center gap-1.5">
        <Text className="font-heading text-[13px] text-danger">{t('history.delete')}</Text>
        <Trash2 size={16} color="#E24C4C" />
      </Animated.View>

      <GestureDetector gesture={pan}>
        <Animated.View
          style={[
            {
              width: KNOB,
              height: KNOB,
              borderRadius: KNOB / 2,
              backgroundColor: '#101410',
            },
            knobStyle,
          ]}
          className="items-center justify-center">
          <ChevronsLeftRight size={22} color={accentLime} />
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

function ContactRow({
  Icon,
  label,
  value,
  onPress,
}: {
  Icon: typeof Phone;
  label: string;
  value: string;
  onPress: () => void;
}) {
  const colors = useThemeColors();
  return (
    <PressableScale haptic="light" onPress={onPress}>
      <View className="flex-row items-center gap-3 rounded-2xl p-3.5 bg-surface dark:bg-surface-raised-dark border border-border dark:border-border-dark">
        <View
          className="w-10 h-10 rounded-xl items-center justify-center"
          style={{ backgroundColor: `${accentLime}22` }}>
          <Icon size={18} color={accentLime} />
        </View>
        <View className="flex-1">
          <Text className="font-heading text-[14px] text-ink dark:text-ink-dark">{label}</Text>
          <Text className="font-body text-[13px] text-ink-muted dark:text-ink-dark-muted">
            {value}
          </Text>
        </View>
        <ArrowUpRight size={16} color={colors.textMuted} />
      </View>
    </PressableScale>
  );
}
