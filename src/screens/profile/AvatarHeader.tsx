import React from 'react';
import { View, Text } from 'react-native';
import { useTokens } from '../../hooks/useTokens';
import { useLang } from '../../context/LanguageContext';
import { Heading, Caption } from '../../components/Themed';

export function AvatarHeader() {
  const t = useTokens();
  const { t: i18n } = useLang();
  const p = i18n.profile;

  return (
    <View style={{ alignItems: 'center', marginTop: t.spacing.lg }}>
      <View style={{ width: 80, height: 80, borderRadius: t.radius.full, backgroundColor: t.colorPrimary, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: t.font.size.hero, fontWeight: t.font.weight.bold, color: t.textOnColor }}>A</Text>
      </View>
      <Heading style={{ fontSize: t.font.size.subheading, marginTop: t.spacing.snug }}>Alex Johnson</Heading>
      <Caption style={{ marginTop: t.spacing.xs }}>{p.member_since}</Caption>
    </View>
  );
}
