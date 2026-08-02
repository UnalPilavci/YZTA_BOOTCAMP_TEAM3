import { Check } from 'lucide-react-native';
import { AnimatePresence, MotiView } from 'moti';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import { onAccentLime, useThemeColors } from '@/theme';

export function passwordChecks(pw: string) {
  return {
    length: pw.length >= 8 && pw.length <= 20,
    upper: /[A-Z]/.test(pw),
    special: /[^A-Za-z0-9]/.test(pw),
  };
}

export function isPasswordValid(pw: string): boolean {
  const c = passwordChecks(pw);
  return c.length && c.upper && c.special;
}

const ORDER = ['length', 'upper', 'special'] as const;

export function PasswordRules({ password }: { password: string }) {
  const { t } = useTranslation();
  const checks = passwordChecks(password);

  return (
    <View className="gap-2 mt-1">
      {ORDER.map((key) => (
        <RuleRow key={key} met={checks[key]} label={t(`register.account.rules.${key}`)} />
      ))}
    </View>
  );
}

function RuleRow({ met, label }: { met: boolean; label: string }) {
  const colors = useThemeColors();

  return (
    <View className="flex-row items-center gap-2.5">
      <MotiView
        animate={{
          backgroundColor: met ? '#DFFB4B' : 'transparent',
          borderColor: met ? '#DFFB4B' : colors.border,
        }}
        transition={{ type: 'timing', duration: 200 }}
        style={{
          width: 20,
          height: 20,
          borderRadius: 999,
          borderWidth: 1.5,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <AnimatePresence>
          {met && (
            <MotiView
              from={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', damping: 12, stiffness: 320 }}>
              <Check size={13} color={onAccentLime} strokeWidth={3.5} />
            </MotiView>
          )}
        </AnimatePresence>
      </MotiView>
      <Text
        className={`font-body text-[13px] ${
          met
            ? 'text-ink dark:text-ink-dark'
            : 'text-ink-muted dark:text-ink-dark-muted'
        }`}>
        {label}
      </Text>
    </View>
  );
}
