import { useEffect, useRef, useState } from 'react';
import { Text, type TextProps } from 'react-native';

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

type Props = Omit<TextProps, 'children'> & {
  value: number;
  duration?: number;
  decimals?: number;
  formatter?: (n: number) => string;
};

export function AnimatedNumber({
  value,
  duration = 800,
  decimals = 0,
  formatter,
  ...textProps
}: Props) {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const from = fromRef.current;
    const to = value;
    if (from === to) return;
    const start = Date.now();

    const tick = () => {
      const t = Math.min(1, (Date.now() - start) / duration);
      const eased = easeOutCubic(t);
      setDisplay(from + (to - from) * eased);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = to;
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [value, duration]);

  const rounded = decimals > 0 ? display.toFixed(decimals) : String(Math.round(display));
  const text = formatter ? formatter(Number(rounded)) : rounded;

  return <Text {...textProps}>{text}</Text>;
}
