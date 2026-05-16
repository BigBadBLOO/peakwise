import React from 'react';
import { View } from 'react-native';
import Svg, { Polyline, Circle, Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { Colors } from '../constants/theme';

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

export default function LineChart({
  data,
  width,
  height = 80,
  color = Colors.green,
  showDots = true,
}: Props) {
  if (data.length < 2) return <View style={{ width, height }} />;

  const min = Math.min(...data.map(d => d.value));
  const max = Math.max(...data.map(d => d.value));
  const range = max - min || 1;
  const padV = 8;

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = padV + ((1 - (d.value - min) / range) * (height - padV * 2));
    return { x, y };
  });

  const polylinePoints = points.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <Svg width={width} height={height}>
      <Polyline
        points={polylinePoints}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {showDots && points.map((p, i) => (
        <Circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={i === points.length - 1 ? 5 : 3}
          fill={i === points.length - 1 ? color : Colors.n0}
          stroke={color}
          strokeWidth={2}
        />
      ))}
    </Svg>
  );
}
