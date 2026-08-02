import { useState } from 'react';
import { View, type LayoutChangeEvent } from 'react-native';
import Svg, {
  Circle,
  Defs,
  Line,
  LinearGradient,
  Path,
  Stop,
  Text as SvgText,
} from 'react-native-svg';

import { getScore, useThemeColors } from '@/theme';

export type SeriesPoint = { ts: number; value: number };

const CHART_H = 190;
const PAD_L = 30;
const PAD_R = 12;
const PAD_T = 14;
const PAD_B = 26;
const Y_TICKS = [0, 50, 100];

export function ScoreLineChart({
  points,
  avg,
  formatDate,
  avgLabel,
  color,
}: {
  points: SeriesPoint[];
  avg: number;
  formatDate: (ts: number) => string;
  avgLabel: string;
  color?: string;
}) {
  const colors = useThemeColors();
  const lineColor = color ?? colors.lime;
  const [width, setWidth] = useState(0);

  const onLayout = (e: LayoutChangeEvent) => {
    const w = Math.round(e.nativeEvent.layout.width);
    if (w !== width) setWidth(w);
  };

  const innerW = Math.max(0, width - PAD_L - PAD_R);
  const innerH = CHART_H - PAD_T - PAD_B;
  const n = points.length;

  const xAt = (i: number) =>
    PAD_L + (n <= 1 ? innerW / 2 : (i / (n - 1)) * innerW);
  const yAt = (v: number) => PAD_T + (1 - Math.min(100, Math.max(0, v)) / 100) * innerH;

  const ready = width > 0 && n > 0;

  let linePath = '';
  let areaPath = '';
  if (ready) {
    linePath = points
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${xAt(i)} ${yAt(p.value)}`)
      .join(' ');
    const baseY = PAD_T + innerH;
    areaPath = `${linePath} L ${xAt(n - 1)} ${baseY} L ${xAt(0)} ${baseY} Z`;
  }

  const labelIdx =
    n <= 1 ? [0] : n === 2 ? [0, n - 1] : [0, Math.floor((n - 1) / 2), n - 1];

  return (
    <View onLayout={onLayout} style={{ height: CHART_H }}>
      {ready && (
        <Svg width={width} height={CHART_H}>
          <Defs>
            <LinearGradient id="scoreArea" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={lineColor} stopOpacity={0.35} />
              <Stop offset="1" stopColor={lineColor} stopOpacity={0.02} />
            </LinearGradient>
          </Defs>

          {Y_TICKS.map((tick) => (
            <Line
              key={`grid-${tick}`}
              x1={PAD_L}
              y1={yAt(tick)}
              x2={PAD_L + innerW}
              y2={yAt(tick)}
              stroke={colors.border}
              strokeWidth={1}
            />
          ))}
          {Y_TICKS.map((tick) => (
            <SvgText
              key={`ylabel-${tick}`}
              x={PAD_L - 6}
              y={yAt(tick) + 3.5}
              fontSize={9}
              fill={colors.textMuted}
              textAnchor="end">
              {String(tick)}
            </SvgText>
          ))}

          {avg > 0 && (
            <>
              <Line
                x1={PAD_L}
                y1={yAt(avg)}
                x2={PAD_L + innerW}
                y2={yAt(avg)}
                stroke={colors.textMuted}
                strokeWidth={1}
                strokeDasharray="4 4"
                opacity={0.7}
              />
              <SvgText
                x={PAD_L + innerW}
                y={yAt(avg) - 5}
                fontSize={9}
                fill={colors.textMuted}
                textAnchor="end">
                {`${avgLabel} ${avg}`}
              </SvgText>
            </>
          )}

          <Path d={areaPath} fill="url(#scoreArea)" />
          <Path
            d={linePath}
            stroke={lineColor}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />

          {points.map((p, i) => (
            <Circle
              key={`dot-${p.ts}`}
              cx={xAt(i)}
              cy={yAt(p.value)}
              r={4}
              fill={getScore(p.value).color}
              stroke={colors.surface}
              strokeWidth={1.5}
            />
          ))}

          {labelIdx.map((i) => (
            <SvgText
              key={`xlabel-${i}`}
              x={xAt(i)}
              y={CHART_H - 8}
              fontSize={9}
              fill={colors.textMuted}
              textAnchor={i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'}>
              {formatDate(points[i].ts)}
            </SvgText>
          ))}
        </Svg>
      )}
    </View>
  );
}
