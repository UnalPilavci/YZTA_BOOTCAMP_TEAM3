import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react-native';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PressableScale } from '@/components/ui/pressable-scale';
import { useAuth } from '@/store/auth';
import { accentLime, onAccentLime, useThemeColors } from '@/theme';

const CODE_LEN = 6;

const STEP_META: { Icon: LucideIcon; labelKey: string }[] = [
  { Icon: Lock, labelKey: 'changePw.stepCurrent' },
  { Icon: ShieldCheck, labelKey: 'changePw.stepCode' },
  { Icon: KeyRound, labelKey: 'changePw.stepNew' },
];

export default function ChangePasswordScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const colors = useThemeColors();
  const email = useAuth((s) => s.email) ?? 'e-posta';

  const [step, setStep] = useState(0);
  const [current, setCurrent] = useState('');
  const [code, setCode] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');

  const rules = [
    { key: 'len', ok: newPw.length >= 8, label: t('changePw.ruleLen') },
    { key: 'num', ok: /[0-9]/.test(newPw), label: t('changePw.ruleNum') },
    { key: 'upper', ok: /[A-ZĞÜŞİÖÇ]/.test(newPw), label: t('changePw.ruleUpper') },
  ];
  const match = newPw.length > 0 && newPw === confirmPw;
  const canSave = rules.every((r) => r.ok) && match;

  const onBack = () => {
    if (step > 0 && step < 3) setStep((s) => s - 1);
    else router.back();
  };

  return (
    <View className="flex-1 bg-cream dark:bg-surface-dark">
      <SafeAreaView edges={['top', 'bottom']} className="flex-1">
        <View className="flex-row items-center gap-3 px-4 pt-2 pb-1">
          <PressableScale haptic="selection" accessibilityLabel={t('common.back')} onPress={onBack}>
            <ArrowLeft size={24} color={colors.text} />
          </PressableScale>
          <Text className="font-heading text-2xl tracking-tight text-ink dark:text-ink-dark">
            {t('changePw.title')}
          </Text>
        </View>

        {step < 3 && <StepIndicator step={step} />}

        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerClassName="grow px-5 pt-4 pb-8">
            {step === 0 && (
              <StepShell
                Icon={Lock}
                title={t('changePw.currentTitle')}
                subtitle={t('changePw.currentSubtitle')}>
                <PasswordField
                  label={t('changePw.currentLabel')}
                  placeholder={t('changePw.currentPlaceholder')}
                  value={current}
                  onChangeText={setCurrent}
                  autoFocus
                />
                <View className="grow" />
                <PrimaryBar
                  label={t('changePw.continue')}
                  enabled={current.length > 0}
                  onPress={() => setStep(1)}
                />
              </StepShell>
            )}

            {step === 1 && (
              <StepShell
                Icon={ShieldCheck}
                title={t('changePw.codeTitle')}
                subtitle={t('changePw.codeSubtitle', { email })}>
                <CodeInput value={code} onChange={setCode} />
                <ResendRow />
                <View className="grow" />
                <PrimaryBar
                  label={t('changePw.verify')}
                  enabled={code.length === CODE_LEN}
                  onPress={() => setStep(2)}
                />
              </StepShell>
            )}

            {step === 2 && (
              <StepShell
                Icon={KeyRound}
                title={t('changePw.newTitle')}
                subtitle={t('changePw.newSubtitle')}>
                <PasswordField
                  label={t('changePw.newLabel')}
                  placeholder={t('changePw.newPlaceholder')}
                  value={newPw}
                  onChangeText={setNewPw}
                  autoFocus
                />

                <View className="gap-2 mt-1">
                  {rules.map((r) => (
                    <RuleRow key={r.key} ok={r.ok} label={r.label} />
                  ))}
                </View>

                <View className="mt-2">
                  <PasswordField
                    label={t('changePw.confirmLabel')}
                    placeholder={t('changePw.confirmPlaceholder')}
                    value={confirmPw}
                    onChangeText={setConfirmPw}
                  />
                  {confirmPw.length > 0 && !match && (
                    <Text className="font-body text-[12.5px] text-danger mt-1.5">
                      {t('changePw.mismatch')}
                    </Text>
                  )}
                </View>

                <View className="grow" />
                <PrimaryBar
                  label={t('changePw.save')}
                  enabled={canSave}
                  onPress={() => setStep(3)}
                />
              </StepShell>
            )}

            {step === 3 && (
              <View className="grow items-center justify-center gap-5">
                <View className="w-20 h-20 rounded-full items-center justify-center bg-lime/15">
                  <CheckCircle2 size={44} color={accentLime} />
                </View>
                <View className="items-center gap-2">
                  <Text className="font-display text-[26px] tracking-tight text-ink dark:text-ink-dark text-center">
                    {t('changePw.doneTitle')}
                  </Text>
                  <Text className="font-body text-[15px] leading-[22px] text-ink-muted dark:text-ink-dark-muted text-center">
                    {t('changePw.doneBody')}
                  </Text>
                </View>
                <PressableScale
                  haptic="medium"
                  accessibilityLabel={t('changePw.doneCta')}
                  onPress={() => router.back()}
                  style={{ marginTop: 8, alignSelf: 'stretch' }}>
                  <View className="h-[52px] rounded-xl items-center justify-center bg-[#101410] dark:bg-lime">
                    <Text className="font-heading text-base text-lime dark:text-lime-on">
                      {t('changePw.doneCta')}
                    </Text>
                  </View>
                </PressableScale>
              </View>
            )}

            {step < 3 && (
              <Text className="text-center font-body text-[11px] text-ink-muted dark:text-ink-dark-muted mt-4">
                {t('changePw.previewNote')}
              </Text>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

function StepIndicator({ step }: { step: number }) {
  const { t } = useTranslation();
  return (
    <View className="flex-row items-center px-5 pt-3 pb-1">
      {STEP_META.map((meta, i) => {
        const done = i < step;
        const active = i === step;
        const on = done || active;
        const Icon = meta.Icon;
        return (
          <View key={meta.labelKey} className="flex-row items-center" style={{ flex: i < 2 ? 1 : 0 }}>
            <View className="items-center gap-1">
              <View
                className={`w-9 h-9 rounded-full items-center justify-center ${
                  on ? '' : 'bg-surface dark:bg-surface-raised-dark border border-border dark:border-border-dark'
                }`}
                style={on ? { backgroundColor: accentLime } : undefined}>
                {done ? (
                  <Check size={17} color={onAccentLime} strokeWidth={3} />
                ) : (
                  <Icon size={16} color={active ? onAccentLime : '#9AA39A'} />
                )}
              </View>
              <Text
                className={`font-body-medium text-[10.5px] ${
                  on ? 'text-ink dark:text-ink-dark' : 'text-ink-muted dark:text-ink-dark-muted'
                }`}>
                {t(meta.labelKey)}
              </Text>
            </View>
            {i < 2 && (
              <View
                className="flex-1 h-0.5 mx-1.5 mb-4 rounded-full"
                style={{ backgroundColor: i < step ? accentLime : '#D8DCD6' }}
              />
            )}
          </View>
        );
      })}
    </View>
  );
}

function StepShell({
  Icon,
  title,
  subtitle,
  children,
}: {
  Icon: LucideIcon;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <View className="grow gap-4">
      <View className="gap-3">
        <View
          className="w-12 h-12 rounded-2xl items-center justify-center bg-[#101410] dark:bg-white/[0.06]">
          <Icon size={22} color={accentLime} />
        </View>
        <View className="gap-1.5">
          <Text className="font-display text-[24px] leading-8 tracking-tight text-ink dark:text-ink-dark">
            {title}
          </Text>
          <Text className="font-body text-[14px] leading-[20px] text-ink-muted dark:text-ink-dark-muted">
            {subtitle}
          </Text>
        </View>
      </View>
      {children}
    </View>
  );
}

function PasswordField({
  label,
  placeholder,
  value,
  onChangeText,
  autoFocus,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (v: string) => void;
  autoFocus?: boolean;
}) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const [show, setShow] = useState(false);
  return (
    <View className="gap-2">
      <Text className="font-body-medium text-[13px] text-ink dark:text-ink-dark">{label}</Text>
      <View className="flex-row items-center gap-2.5 h-[52px] rounded-xl px-3.5 bg-surface dark:bg-surface-raised-dark border border-border dark:border-border-dark">
        <Lock size={18} color={colors.textMuted} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={!show}
          autoCapitalize="none"
          autoFocus={autoFocus}
          className="flex-1 font-body text-[15px] text-ink dark:text-ink-dark"
        />
        <PressableScale
          haptic="selection"
          accessibilityLabel={t(show ? 'auth.hidePassword' : 'auth.showPassword')}
          onPress={() => setShow((v) => !v)}>
          {show ? (
            <EyeOff size={18} color={colors.textMuted} />
          ) : (
            <Eye size={18} color={colors.textMuted} />
          )}
        </PressableScale>
      </View>
    </View>
  );
}

function CodeInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const ref = useRef<TextInput>(null);
  return (
    <Pressable onPress={() => ref.current?.focus()}>
      <View className="flex-row gap-2 justify-between">
        {Array.from({ length: CODE_LEN }).map((_, i) => {
          const filled = i < value.length;
          const active = i === value.length;
          return (
            <View
              key={i}
              className={`flex-1 h-14 rounded-xl items-center justify-center border ${
                active || filled
                  ? 'border-lime bg-lime/10'
                  : 'border-border dark:border-border-dark bg-surface dark:bg-surface-raised-dark'
              }`}>
              <Text className="font-heading text-[22px] text-ink dark:text-ink-dark tabular-nums">
                {value[i] ?? ''}
              </Text>
            </View>
          );
        })}
      </View>
      <TextInput
        ref={ref}
        value={value}
        onChangeText={(txt) => onChange(txt.replace(/[^0-9]/g, '').slice(0, CODE_LEN))}
        keyboardType="number-pad"
        maxLength={CODE_LEN}
        autoFocus
        caretHidden
        className="absolute opacity-0"
        style={{ width: '100%', height: 56 }}
      />
    </Pressable>
  );
}

function ResendRow() {
  const { t } = useTranslation();
  const [sec, setSec] = useState(0);
  const start = () => {
    if (sec > 0) return;
    setSec(30);
    const id = setInterval(() => {
      setSec((s) => {
        if (s <= 1) {
          clearInterval(id);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  };
  return (
    <PressableScale
      haptic="selection"
      accessibilityLabel={t('changePw.resend')}
      onPress={start}
      style={{ alignSelf: 'center', opacity: sec > 0 ? 0.5 : 1 }}>
      <Text className="font-body-bold text-[13px] text-ink dark:text-lime mt-1">
        {sec > 0 ? t('changePw.resendIn', { sec }) : t('changePw.resend')}
      </Text>
    </PressableScale>
  );
}

function RuleRow({ ok, label }: { ok: boolean; label: string }) {
  return (
    <View className="flex-row items-center gap-2">
      <View
        className={`w-5 h-5 rounded-full items-center justify-center ${
          ok ? '' : 'border border-border dark:border-border-dark'
        }`}
        style={ok ? { backgroundColor: accentLime } : undefined}>
        {ok && <Check size={13} color={onAccentLime} strokeWidth={3} />}
      </View>
      <Text
        className={`font-body text-[13px] ${
          ok ? 'text-ink dark:text-ink-dark' : 'text-ink-muted dark:text-ink-dark-muted'
        }`}>
        {label}
      </Text>
    </View>
  );
}

function PrimaryBar({
  label,
  enabled,
  onPress,
}: {
  label: string;
  enabled: boolean;
  onPress: () => void;
}) {
  return (
    <PressableScale
      haptic="medium"
      accessibilityLabel={label}
      onPress={enabled ? onPress : () => {}}
      style={{ marginTop: 20, opacity: enabled ? 1 : 0.4 }}>
      <View className="h-[52px] rounded-xl items-center justify-center bg-[#101410] dark:bg-lime">
        <Text className="font-heading text-base text-lime dark:text-lime-on">{label}</Text>
      </View>
    </PressableScale>
  );
}
