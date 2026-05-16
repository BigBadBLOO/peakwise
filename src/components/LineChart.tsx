import React from 'react';
import { View } from 'react-native';
import Svg, { Polyline, Circle } from 'react-native-svg';
import { useTokens } from '../hooks/useTokens';

interface Point {
  value: number;
  label?: string;
}

interface Props {
  data: Point[];
  width: number;
  height?: number;
  color?: string;
  showDots?: boolean;
}

export default function LineChart({ data, width, height = 80, color, showDots = true }: Props) {
  const t = useTokens();
  const lineColor = color ?? t.colorPrimary;

  if (data.length < 2) return <View style={{ width, height }} />;

  const min   = Math.min(...data.map(d => d.value));
  const max   = Math.max(...data.map(d => d.value));
  const range = max - min || 1;
  const padV  = t.spacing.sm;

  const points = data.map((d, i) => ({
    x: (i / (data.length - 1)) * width,
    y: padV + (1 - (d.value - min) / range) * (height - padV * 2),
  }));

  const polylinePoints = points.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <Svg width={width} height={height}>
      <Polyline
        points={polylinePoints}
        fill="none"
        stroke={lineColor}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {showDots && points.map((p, i) => {
        const isLast = i === points.length - 1;
        return (
          <Circle
            key={i}
            cx={p.x} cy={p.y}
            r={isLast ? t.spacing.xs + 1 : t.radius.xs}
            fill={isLast ? lineColor : t.bgCard}
            stroke={lineColor}
            strokeWidth={2}
          />
        );
      })}
    </Svg>
  );
}
