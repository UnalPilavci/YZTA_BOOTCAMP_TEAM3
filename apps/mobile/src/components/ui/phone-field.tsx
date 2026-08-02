import { TextField } from '@/components/register/text-field';
import { Text } from 'react-native';

function toNationalDigits(raw: string): string {
  let d = raw.replace(/\D/g, '');
  if (d.startsWith('90')) d = d.slice(2);
  if (d.startsWith('0')) d = d.slice(1);
  return d.slice(0, 10);
}

function formatNational(d: string): string {
  const parts = [d.slice(0, 3), d.slice(3, 6), d.slice(6, 8), d.slice(8, 10)];
  return parts.filter(Boolean).join(' ');
}

export function PhoneField({
  label,
  value,
  onChangeText,
  placeholder = '5XX XXX XX XX',
}: {
  label: string;
  value: string;
  onChangeText: (canonical: string) => void;
  placeholder?: string;
}) {
  const national = toNationalDigits(value);
  const display = formatNational(national);

  const handle = (text: string) => {
    const d = toNationalDigits(text);
    onChangeText(d ? `+90 ${formatNational(d)}` : '');
  };

  return (
    <TextField
      label={label}
      value={display}
      onChangeText={handle}
      keyboardType="phone-pad"
      placeholder={placeholder}
      maxLength={13}
      leftAccessory={
        <Text className="font-body-medium text-[15px] text-ink dark:text-ink-dark">+90</Text>
      }
    />
  );
}
