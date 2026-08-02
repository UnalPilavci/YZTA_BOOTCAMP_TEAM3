import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';

import { useThemeColors } from '@/theme';

const pad = (n: number, len: number) => String(n).padStart(len, '0');

export function toBirthIso(d: string, m: string, y: string): string | null {
  const dd = Number(d);
  const mm = Number(m);
  const yy = Number(y);
  if (!d || !m || !y || !Number.isInteger(dd) || !Number.isInteger(mm) || !Number.isInteger(yy)) {
    return null;
  }
  const now = new Date().getFullYear();
  if (yy < 1900 || yy > now || mm < 1 || mm > 12 || dd < 1 || dd > 31) return null;
  const dt = new Date(yy, mm - 1, dd);
  if (dt.getFullYear() !== yy || dt.getMonth() !== mm - 1 || dt.getDate() !== dd) return null;
  return `${yy}-${pad(mm, 2)}-${pad(dd, 2)}`;
}

function isoToParts(iso: string | null): { d: string; m: string; y: string } {
  if (!iso) return { d: '', m: '', y: '' };
  const [y, m, d] = iso.split('-');
  return { d: String(Number(d)), m: String(Number(m)), y };
}

const onlyDigits = (s: string) => s.replace(/[^0-9]/g, '');

export function BirthDateField({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: string | null;
  onChange: (iso: string | null) => void;
}) {
  const colors = useThemeColors();
  const initial = isoToParts(value);
  const [d, setD] = useState(initial.d);
  const [m, setM] = useState(initial.m);
  const [y, setY] = useState(initial.y);

  const update = (nd: string, nm: string, ny: string) => {
    setD(nd);
    setM(nm);
    setY(ny);
    onChange(toBirthIso(nd, nm, ny));
  };

  return (
    <View className="gap-2">
      <View className="flex-row items-center justify-between">
        <Text className="font-body-medium text-[13px] text-ink dark:text-ink-dark">{label}</Text>
        {hint && (
          <Text className="font-body text-[11px] text-ink-muted dark:text-ink-dark-muted">{hint}</Text>
        )}
      </View>
      <View className="flex-row items-center gap-2">
        <Cell value={d} onChange={(v) => update(onlyDigits(v).slice(0, 2), m, y)} placeholder="GG" width={64} colors={colors} />
        <Sep />
        <Cell value={m} onChange={(v) => update(d, onlyDigits(v).slice(0, 2), y)} placeholder="AA" width={64} colors={colors} />
        <Sep />
        <Cell value={y} onChange={(v) => update(d, m, onlyDigits(v).slice(0, 4))} placeholder="YYYY" width={88} colors={colors} />
      </View>
    </View>
  );
}

function Cell({
  value,
  onChange,
  placeholder,
  width,
  colors,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  width: number;
  colors: ReturnType<typeof useThemeColors>;
}) {
  return (
    <View
      className="h-[52px] rounded-xl px-3 justify-center bg-surface dark:bg-surface-raised-dark border border-border dark:border-border-dark"
      style={{ width }}>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        keyboardType="number-pad"
        className="font-body text-[15px] text-center text-ink dark:text-ink-dark"
      />
    </View>
  );
}

function Sep() {
  return <Text className="font-body text-[15px] text-ink-muted dark:text-ink-dark-muted">/</Text>;
}
