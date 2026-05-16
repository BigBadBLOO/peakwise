import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTokens } from '../../hooks/useTokens';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

interface Props {
  seconds: number;
  onDone: () => void;
  restLabel: string;
  skipLabel: string;
}

export function RestTimer({ seconds, onDone, restLabel, skipLabel }: Props) {
  const t = useTokens();
  const [remaining, setRemaining] = useState(seconds);
  const progress = useState(new Animated.Value(1))[0];

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 0,
      duration: seconds * 1000,
      useNativeDriver: false,
    }).start();

    const interval = setInterval(() => {
      setRemaining(r => {
        if (r <= 1) {
          clearInterval(interval);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          onDone();
          return 0;
        }
        if (r === 11) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        return r - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const barColor = progress.interpolate({
    inputRange: [0, 0.3, 1],
    outputRange: [t.colorError, t.colorWarning, t.colorPrimary],
  });

  return (
    <View style={{ backgroundColor: t.bgSubtle, borderRadius: t.radius.sm, padding: t.spacing.inset, marginTop: t.spacing.snug }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: t.spacing.sm }}>
        <Text style={{ fontSize: t.font.size.small, fontWeight: t.font.weight.semibold, color: t.textTertiary, flex: 1 }}>{restLabel}</Text>
        <Text style={{ fontSize: t.font.size.large, fontWeight: t.font.weight.bold, color: t.textPrimary, letterSpacing: t.font.tracking.tighter }}>{formatTime(remaining)}</Text>
        <TouchableOpacity style={{ flex: 1, alignItems: 'flex-end' }} onPress={onDone}>
          <Text style={{ fontSize: t.font.size.md, color: t.colorPrimary, fontWeight: t.font.weight.semibold }}>{skipLabel}</Text>
        </TouchableOpacity>
      </View>
      <View style={{ height: 4, backgroundColor: t.borderDefault, borderRadius: t.radius.xs, overflow: 'hidden' }}>
        <Animated.View style={{
          height: '100%', borderRadius: t.radius.xs,
          width: progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) as any,
          backgroundColor: barColor,
        }} />
      </View>
    </View>
  );
}
