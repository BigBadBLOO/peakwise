import React from 'react';
import { View, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTokens } from '../../hooks/useTokens';
import { useTheme } from '../../context/ThemeContext';
import { useLang } from '../../context/LanguageContext';
import { useUnits } from '../../context/UnitsContext';
import { Screen, Caption, SettingGroup, SettingRow, SegmentedToggle } from '../../components/Themed';
import { AvatarHeader } from './AvatarHeader';
import { StatsRow } from './StatsRow';
import { SubscriptionBanner } from './SubscriptionBanner';

export default function ProfileScreen() {
  const t = useTokens();
  const { mode, setMode } = useTheme();
  const { t: i18n, lang, setLang } = useLang();
  const { unit, setUnit } = useUnits();
  const p = i18n.profile;
  const secs = p.sections;

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <AvatarHeader />
        <StatsRow />
        <SubscriptionBanner />

        <View style={{ marginTop: t.spacing.md, paddingHorizontal: t.spacing.md }}>
          <Caption style={{ letterSpacing: t.font.tracking.wider, textTransform: 'uppercase', marginBottom: t.spacing.sm }}>{secs.account.title}</Caption>
          <SettingGroup>
            {secs.account.items.map((item, i) => (
              <SettingRow key={item} label={item} isLast={i === secs.account.items.length - 1} />
            ))}
          </SettingGroup>
        </View>

        <View style={{ marginTop: t.spacing.md, paddingHorizontal: t.spacing.md }}>
          <Caption style={{ letterSpacing: t.font.tracking.wider, textTransform: 'uppercase', marginBottom: t.spacing.sm }}>{secs.app.title}</Caption>
          <SettingGroup>
            <SettingRow
              label={secs.app.items[0]}
              control={
                <SegmentedToggle
                  options={['kg', 'lbs']}
                  selected={unit}
                  onSelect={v => { Haptics.selectionAsync(); setUnit(v as 'kg' | 'lbs'); }}
                />
              }
            />
            <SettingRow
              label={secs.app.items[2]}
              control={
                <SegmentedToggle
                  options={['EN', 'RU']}
                  selected={lang.toUpperCase()}
                  onSelect={v => { Haptics.selectionAsync(); setLang(v.toLowerCase() as 'en' | 'ru'); }}
                />
              }
            />
            <SettingRow
              label={secs.app.items[1]}
              isLast
              control={
                <SegmentedToggle
                  options={['☀️', '🌙']}
                  selected={mode === 'dark' ? '🌙' : '☀️'}
                  onSelect={v => { Haptics.selectionAsync(); setMode(v === '🌙' ? 'dark' : 'light'); }}
                />
              }
            />
          </SettingGroup>
        </View>

        <View style={{ marginTop: t.spacing.md, paddingHorizontal: t.spacing.md }}>
          <Caption style={{ letterSpacing: t.font.tracking.wider, textTransform: 'uppercase', marginBottom: t.spacing.sm }}>{secs.about.title}</Caption>
          <SettingGroup>
            {secs.about.items.map((item, i) => (
              <SettingRow key={item} label={item} isLast={i === secs.about.items.length - 1} />
            ))}
          </SettingGroup>
        </View>

        <View style={{ height: t.spacing.xl }} />
      </ScrollView>
    </Screen>
  );
}
