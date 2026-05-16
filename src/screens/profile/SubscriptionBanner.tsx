import React from 'react';
import { View, Text } from 'react-native';
import { useTokens } from '../../hooks/useTokens';
import { useLang } from '../../context/LanguageContext';

export function SubscriptionBanner() {
  const t = useTokens();
  const { t: i18n } = useLang();
  const p = i18n.profile;

  return (
    <View style={{
      backgroundColor: t.colorNavy, borderRadius: t.radius.md, padding: t.spacing.md,
      marginHorizontal: t.spacing.md, marginTop: t.spacing.sm,
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <View>
        <Text style={{ fontSize: t.font.size.xl, fontWeight: t.font.weight.bold, color: t.textOnColor }}>{p.free_trial}</Text>
        <Text style={{ fontSize: t.font.size.small, color: t.textOnNavySoft, marginTop: t.spacing.xxs }}>{p.days_remaining(28)}</Text>
      </View>
      <View style={{ backgroundColor: t.colorPrimary, paddingHorizontal: t.spacing.md, paddingVertical: t.spacing.snug, borderRadius: t.radius.full }}>
        <Text style={{ color: t.textOnColor, fontSize: t.font.size.md, fontWeight: t.font.weight.bold }}>{p.upgrade}</Text>
      </View>
    </View>
  );
}
