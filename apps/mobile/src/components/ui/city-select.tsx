import { Check, ChevronDown, Search, X } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FlatList,
  Modal,
  Pressable,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PressableScale } from '@/components/ui/pressable-scale';
import { CITIES } from '@/data/trainer-options';
import { accentLime, useThemeColors } from '@/theme';

const SHEET_RATIO = 0.6;
const CLOSE_DISTANCE = 120;
const CLOSE_VELOCITY = 900;
const OPEN_MS = 240;
const CLOSE_MS = 200;
const BACKDROP_MAX_OPACITY = 0.4;

function normalize(s: string): string {
  return s
    .toLocaleLowerCase('tr')
    .replaceAll('ı', 'i')
    .replaceAll('İ', 'i')
    .replaceAll('ş', 's')
    .replaceAll('ğ', 'g')
    .replaceAll('ü', 'u')
    .replaceAll('ö', 'o')
    .replaceAll('ç', 'c');
}

export function CitySelect({
  value,
  onChange,
  label,
  placeholder,
}: {
  value: string;
  onChange: (city: string) => void;
  label: string;
  placeholder: string;
}) {
  const colors = useThemeColors();
  const [open, setOpen] = useState(false);

  return (
    <View className="gap-2">
      <Text className="font-body-medium text-[13px] text-ink dark:text-ink-dark">{label}</Text>
      <PressableScale haptic="selection" accessibilityLabel={label} onPress={() => setOpen(true)}>
        <View className="flex-row items-center justify-between rounded-xl px-3.5 h-[52px] bg-surface dark:bg-surface-raised-dark border border-border dark:border-border-dark">
          <Text
            className={`font-body text-[15px] ${
              value ? 'text-ink dark:text-ink-dark' : 'text-ink-muted dark:text-ink-dark-muted'
            }`}>
            {value || placeholder}
          </Text>
          <ChevronDown size={18} color={colors.textMuted} />
        </View>
      </PressableScale>

      {open && (
        <CitySheet
          title={label}
          value={value}
          onPick={(city) => onChange(city)}
          onClose={() => setOpen(false)}
        />
      )}
    </View>
  );
}

function CitySheet({
  title,
  value,
  onPick,
  onClose,
}: {
  title: string;
  value: string;
  onPick: (city: string) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const [query, setQuery] = useState('');

  const sheetHeight = Math.round(height * SHEET_RATIO);
  const translateY = useSharedValue(sheetHeight);

  useEffect(() => {
    translateY.value = withTiming(0, { duration: OPEN_MS });
  }, [translateY]);

  const dismiss = () => {
    translateY.value = withTiming(sheetHeight, { duration: CLOSE_MS }, (finished) => {
      if (finished) runOnJS(onClose)();
    });
  };

  const pick = (city: string) => {
    onPick(city);
    dismiss();
  };

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      translateY.value = Math.max(0, e.translationY);
    })
    .onEnd((e) => {
      if (e.translationY > CLOSE_DISTANCE || e.velocityY > CLOSE_VELOCITY) {
        translateY.value = withTiming(sheetHeight, { duration: CLOSE_MS }, (finished) => {
          if (finished) runOnJS(onClose)();
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

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) return CITIES;
    return CITIES.filter((c) => normalize(c).includes(q));
  }, [query]);

  return (
    <Modal visible transparent animationType="none" onRequestClose={dismiss}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View className="flex-1 justify-end">
          <Animated.View
            style={[{ position: 'absolute', inset: 0, backgroundColor: '#000' }, backdropStyle]}>
            <Pressable className="flex-1" onPress={dismiss} accessibilityLabel={t('common.close')} />
          </Animated.View>

          <Animated.View
            style={[{ height: sheetHeight }, sheetStyle]}
            className="rounded-t-[28px] overflow-hidden bg-cream dark:bg-surface-dark">
            <GestureDetector gesture={pan}>
              <View className="pt-2.5 pb-3 px-4 border-b border-border dark:border-border-dark">
                <View className="self-center w-10 h-1 rounded-full bg-ink-muted/40 dark:bg-ink-dark-muted/40 mb-3" />
                <View className="flex-row items-center gap-3">
                  <Text className="flex-1 font-heading text-[17px] tracking-tight text-ink dark:text-ink-dark">
                    {title}
                  </Text>
                  <PressableScale
                    haptic="selection"
                    accessibilityLabel={t('common.close')}
                    onPress={dismiss}>
                    <View className="w-8 h-8 rounded-full items-center justify-center bg-surface dark:bg-surface-raised-dark border border-border dark:border-border-dark">
                      <X size={16} color={colors.text} />
                    </View>
                  </PressableScale>
                </View>
              </View>
            </GestureDetector>

            <View className="mx-4 my-3 flex-row items-center gap-2 rounded-xl px-3.5 h-11 bg-surface dark:bg-surface-raised-dark border border-border dark:border-border-dark">
              <Search size={17} color={colors.textMuted} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder={t('listings.citySearchPlaceholder')}
                placeholderTextColor={colors.textMuted}
                className="flex-1 font-body text-[15px] text-ink dark:text-ink-dark"
              />
            </View>

            <FlatList
              data={filtered}
              keyExtractor={(c) => c}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: 16,
                paddingBottom: Math.max(insets.bottom, 16),
              }}
              ListEmptyComponent={
                <Text className="text-center font-body text-[14px] text-ink-muted dark:text-ink-dark-muted mt-8">
                  {t('listings.cityNoResult')}
                </Text>
              }
              renderItem={({ item }) => {
                const selected = item === value;
                return (
                  <Pressable
                    onPress={() => pick(item)}
                    className="flex-row items-center justify-between py-3.5 border-b border-border dark:border-border-dark">
                    <Text
                      className={`font-body text-[16px] text-ink dark:text-ink-dark ${
                        selected ? 'font-body-medium' : ''
                      }`}>
                      {item}
                    </Text>
                    {selected && <Check size={18} color={accentLime} />}
                  </Pressable>
                );
              }}
            />
          </Animated.View>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}
