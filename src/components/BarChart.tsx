import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';
import { Colors } from '../constants/theme';

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
  unit?: string;
}

export default function BarChart({
  data,
  height = 120,
  color = Colors.n200,
  activeColor = Colors.green,
  unit = '',
}: Props) {
  const max = Math.max(...data.map(d => d.value), 1);
  const barWidth = 22;
  const gap = 10;
  const totalWidth = data.length * (barWidth + gap) - gap;
  const svgHeight = height;
  const labelHeight = 18;
  const chartHeight = svgHeight - labelHeight;

  return (
    <View>
      <Svg width={totalWidth} height={svgHeight} style={{ overflow: 'visible' }}>
        {data.map((bar, i) => {
          const barH = Math.max((bar.value / max) * chartHeight, 4);
          const x = i * (barWidth + gap);
          const y = chartHeight - barH;
          const fill = bar.active ? activeColor : color;

          return (
            <React.Fragment key={i}>
              <Rect
                x={x}
                y={y}
                width={barWidth}
                height={barH}
                rx={6}
                fill={fill}
              />
              <SvgText
                x={x + barWidth / 2}
                y={svgHeight}
                textAnchor="middle"
                fontSize={10}
                fontWeight="600"
                fill={Colors.n400}
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
