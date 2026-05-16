import React from 'react';
import { View } from 'react-native';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';
import { useTokens } from '../hooks/useTokens';

interface Bar {
  label: string;
  value: number;
  active?: boolean;
}

interface Props {
  data: Bar[];
  height?: number;
  color?: string;
  activeColor?: string;
}

export default function BarChart({ data, height = 120, color, activeColor }: Props) {
  const t = useTokens();

  const barColor   = color       ?? t.bgSubtle;
  const activeBarColor = activeColor ?? t.colorPrimary;

  const max = Math.max(...data.map(d => d.value), 1);
  const barWidth   = 22;
  const gap        = t.spacing.snug;
  const totalWidth = data.length * (barWidth + gap) - gap;
  const labelHeight = 18;
  const chartHeight = height - labelHeight;

  return (
    <View>
      <Svg width={totalWidth} height={height} style={{ overflow: 'visible' }}>
        {data.map((bar, i) => {
          const barH = Math.max((bar.value / max) * chartHeight, t.radius.xs);
          const x    = i * (barWidth + gap);
          const y    = chartHeight - barH;

          return (
            <React.Fragment key={i}>
              <Rect
                x={x} y={y}
                width={barWidth} height={barH}
                rx={t.radius.sm}
                fill={bar.active ? activeBarColor : barColor}
              />
              <SvgText
                x={x + barWidth / 2}
                y={height}
                textAnchor="middle"
                fontSize={t.font.size.xs}
                fontWeight={t.font.weight.semibold}
                fill={t.textTertiary}
              >
                {bar.label}
              </SvgText>
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
}
