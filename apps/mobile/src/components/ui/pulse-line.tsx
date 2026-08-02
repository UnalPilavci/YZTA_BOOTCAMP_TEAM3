import { useEffect, useMemo, useState } from 'react';
import { View, type LayoutChangeEvent } from 'react-native';
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';

import { useResolvedScheme, useThemeColors } from '@/theme';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type Props = {
  height?: number;
  duration?: number;
};

const SHAPE: { fx: number; up: number }[] = [
  { fx: 0, up: 0 },
  { fx: 0.4, up: 0 },
  { fx: 0.44, up: 2 },
  { fx: 0.47, up: 0 },
  { fx: 0.49, up: -5 },
  { fx: 0.505, up: 13 },
  { fx: 0.52, up: -9 },
  { fx: 0.535, up: 0 },
  { fx: 0.6, up: 0 },
  { fx: 0.63, up: 4 },
  { fx: 0.66, up: 0 },
  { fx: 1, up: 0 },
];

const SEGMENT_RATIO = 0.2;

export function PulseLine({ height = 34, duration = 2400 }: Props) {
  const colors = useThemeColors();
  const isDark = useResolvedScheme() === 'dark';
  const [width, setWidth] = useState(0);

  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration, easing: Easing.linear }),
      -1,
      false,
    );
  }, [duration, progress]);

  const geo = useMemo(() => {
    if (width <= 0) return null;
    const mid = height / 2;
    const pts = SHAPE.map((s) => ({ x: s.fx * width, y: mid - s.up }));
    let d = `M ${pts[0].x} ${pts[0].y}`;
    const xs = [pts[0].x];
    const ys = [pts[0].y];
    const ds = [0];
    let len = 0;
    for (let i = 1; i < pts.length; i++) {
      d += ` L ${pts[i].x} ${pts[i].y}`;
      len += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
      xs.push(pts[i].x);
      ys.push(pts[i].y);
      ds.push(len);
    }
    return { d, xs, ys, ds, len, seg: len * SEGMENT_RATIO };
  }, [width, height]);

  const dashProps = useAnimatedProps(() => {
    'worklet';
    if (!geo) return { strokeDashoffset: 0 };
    const period = geo.seg + geo.len;
    const head = progress.value * period - geo.seg;
    return { strokeDashoffset: geo.seg - head };
  });

  const dotProps = useAnimatedProps(() => {
    'worklet';
    if (!geo) return { cx: 0, cy: 0, opacity: 0 };
    const period = geo.seg + geo.len;
    const head = progress.value * period - geo.seg;
    const cx = interpolate(head, geo.ds, geo.xs, Extrapolation.CLAMP);
    const cy = interpolate(head, geo.ds, geo.ys, Extrapolation.CLAMP);
    const visible = head >= 0 && head <= geo.len ? 1 : 0;
    return { cx, cy, opacity: visible };
  });

  const dotGlowProps = useAnimatedProps(() => {
    'worklet';
    if (!geo) return { cx: 0, cy: 0, opacity: 0 };
    const period = geo.seg + geo.len;
    const head = progress.value * period - geo.seg;
    const cx = interpolate(head, geo.ds, geo.xs, Extrapolation.CLAMP);
    const cy = interpolate(head, geo.ds, geo.ys, Extrapolation.CLAMP);
    const visible = head >= 0 && head <= geo.len ? 0.28 : 0;
    return { cx, cy, opacity: visible };
  });

  const onLayout = (e: LayoutChangeEvent) => {
    const w = Math.round(e.nativeEvent.layout.width);
    if (w !== width) setWidth(w);
  };

  return (
    <View onLayout={onLayout} style={{ height }}>
      {geo && (
        <Svg width={width} height={height}>
          <Path
            d={geo.d}
            stroke={colors.pulseTrack}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />

          {isDark && (
            <AnimatedPath
              animatedProps={dashProps}
              d={geo.d}
              stroke={colors.pulse}
              strokeWidth={7}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={[geo.seg, geo.len]}
              opacity={0.4}
              fill="none"
            />
          )}

          <AnimatedPath
            animatedProps={dashProps}
            d={geo.d}
            stroke={colors.pulse}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={[geo.seg, geo.len]}
            fill="none"
          />

          {isDark && (
            <AnimatedCircle animatedProps={dotGlowProps} r={7} fill={colors.pulse} />
          )}

          <AnimatedCircle animatedProps={dotProps} r={3} fill={colors.pulse} />
        </Svg>
      )}
    </View>
  );
}
