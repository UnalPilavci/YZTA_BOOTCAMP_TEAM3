import { Plus } from 'lucide-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PressableScale } from '@/components/ui/pressable-scale';
import { accentLime, onAccentLime, useResolvedScheme, useThemeColors } from '@/theme';

type Props = {
  visible: boolean;
  onClose: () => void;
  onAdd: (label: string) => void;
};

export function AddAllergenSheet({ visible, onClose, onAdd }: Props) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const isDark = useResolvedScheme() === 'dark';
  const [value, setValue] = useState('');

  const submit = () => {
    const label = value.trim();
    if (!label) return;
    onAdd(label);
    setValue('');
    onClose();
  };

  const dismiss = () => {
    setValue('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={dismiss}
      statusBarTranslucent>
      <Pressable className="flex-1 bg-black/50" onPress={dismiss} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View className="rounded-t-[28px] bg-cream dark:bg-surface-dark border-t border-border dark:border-border-dark px-5 pt-3">
          <View className="self-center w-10 h-1.5 rounded-full bg-border dark:bg-border-dark mb-4" />
          <Text className="font-heading text-lg text-ink dark:text-ink-dark">
            {t('register.allergens.addTitle')}
          </Text>
          <View className="flex-row items-center gap-2.5 h-[52px] rounded-xl px-3.5 mt-4 bg-surface dark:bg-surface-raised-dark border border-border dark:border-border-dark">
            <TextInput
              autoFocus
              value={value}
              onChangeText={setValue}
              placeholder={t('register.allergens.addPlaceholder')}
              placeholderTextColor={colors.textMuted}
              returnKeyType="done"
              onSubmitEditing={submit}
              className="flex-1 font-body text-[15px] text-ink dark:text-ink-dark"
            />
          </View>
          <PressableScale
            haptic="medium"
            disabled={!value.trim()}
            accessibilityLabel={t('register.allergens.add')}
            onPress={submit}>
            <View className="flex-row items-center justify-center gap-2 h-[54px] rounded-xl mt-4 bg-[#101410] dark:bg-lime">
              <Plus size={18} color={isDark ? onAccentLime : accentLime} />
              <Text className="font-heading text-base text-lime dark:text-lime-on">
                {t('register.allergens.add')}
              </Text>
            </View>
          </PressableScale>
          <SafeAreaView edges={['bottom']} />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
