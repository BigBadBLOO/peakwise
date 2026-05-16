import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors, Radius, Spacing } from '../constants/theme';
import { useColors } from '../hooks/useColors';
import { useTheme } from '../context/ThemeContext';
import { useLang } from '../context/LanguageContext';
import { Screen } from '../components/Themed';

export default function ProfileScreen() {
  const c = useColors();
  const { isDark, mode, setMode } = useTheme();
  const { t, lang, setLang } = useLang();
  const p = t.profile;
  const secs = p.sections;

  const toggleDark = () => {
    Haptics.selectionAsync();
    setMode(mode === 'dark' ? 'light' : 'dark');
  };

  const toggleLang = () => {
    Haptics.selectionAsync();
    setLang(lang === 'en' ? 'ru' : 'en');
  };

  const SECTIONS = [
    { title: secs.account.title, items: secs.account.items },
    {
      title: secs.app.title,
      items: secs.app.items,
      controls: {
        [secs.app.items[1]]: (
          <Switch
            value={isDark}
            onValueChange={toggleDark}
            trackColor={{ false: c.border, true: Colors.green }}
            thumbColor="#fff"
          />
        ),
        [secs.app.items[2]]: (
          <TouchableOpacity
            style={[styles.langToggle, { backgroundColor: c.surface2, borderColor: c.border }]}
            onPress={toggleLang}
          >
            <Text style={[styles.langText, { color: lang === 'en' ? Colors.green : c.text3 }]}>EN</Text>
            <Text style={[styles.langDivider, { color: c.border }]}>/</Text>
            <Text style={[styles.langText, { color: lang === 'ru' ? Colors.green : c.text3 }]}>RU</Text>
          </TouchableOpacity>
        ),
      } as Record<string, React.ReactNode>,
    },
    { title: secs.about.title, items: secs.about.items },
  ];

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Avatar */}
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>A</Text>
        </View>
        <Text style={[styles.name, { color: c.text }]}>Alex Johnson</Text>
        <Text style={[styles.meta, { color: c.text3 }]}>{p.member_since}</Text>

        {/* Stats */}
        <View style={[styles.statsRow, { backgroundColor: c.surface }]}>
          {([
            ['124', p.workouts],
            ['12', p.week_streak],
            ['18.4t', p.best_week],
          ] as [string, string][]).map(([v, l]) => (
            <View key={l} style={styles.statItem}>
              <Text style={[styles.statValue, { color: c.text }]}>{v}</Text>
              <Text style={[styles.statLabel, { color: c.text3 }]}>{l}</Text>
            </View>
          ))}
        </View>

        {/* Subscription */}
        <View style={styles.subCard}>
          <View>
            <Text style={styles.subTitle}>{p.free_trial}</Text>
            <Text style={styles.subSub}>{p.days_remaining(28)}</Text>
          </View>
          <TouchableOpacity style={styles.upgradeBtn}>
            <Text style={styles.upgradeBtnText}>{p.upgrade}</Text>
          </TouchableOpacity>
        </View>

        {/* Settings */}
        {SECTIONS.map(sec => (
          <View key={sec.title} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: c.text3 }]}>{sec.title}</Text>
            <View style={[styles.sectionCard, { backgroundColor: c.surface }]}>
              {sec.items.map((item, i) => {
                const control = (sec as any).controls?.[item];
                return (
                  <TouchableOpacity
                    key={item}
                    style={[
                      styles.settingRow,
                      i < sec.items.length - 1 && { borderBottomWidth: 1, borderBottomColor: c.border },
                    ]}
                    onPress={!control ? undefined : undefined}
                    activeOpacity={control ? 1 : 0.6}
                  >
                    <Text style={[styles.settingText, { color: c.text }]}>{item}</Text>
                    {control ?? <Text style={[styles.chevron, { color: c.border }]}>›</Text>}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}

        <View style={{ height: 32 }} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.green,
    alignSelf: 'center', alignItems: 'center', justifyContent: 'center', marginTop: 24,
  },
  avatarText: { fontSize: 32, fontWeight: '700', color: '#fff' },
  name: { fontSize: 22, fontWeight: '700', textAlign: 'center', marginTop: 10, letterSpacing: -0.3 },
  meta: { fontSize: 13, textAlign: 'center', marginTop: 4 },
  statsRow: {
    flexDirection: 'row', marginHorizontal: Spacing.md, marginTop: 20,
    borderRadius: Radius.md, padding: Spacing.md,
    shadowColor: '#0F1726', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '700', letterSpacing: -0.4 },
  statLabel: { fontSize: 11, marginTop: 2 },
  subCard: {
    marginHorizontal: Spacing.md, marginTop: Spacing.sm,
    backgroundColor: Colors.navy, borderRadius: Radius.md, padding: Spacing.md,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  subTitle: { fontSize: 16, fontWeight: '700', color: '#fff' },
  subSub: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  upgradeBtn: { backgroundColor: Colors.green, paddingHorizontal: 16, paddingVertical: 10, borderRadius: Radius.full },
  upgradeBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  section: { marginTop: Spacing.md, paddingHorizontal: Spacing.md },
  sectionTitle: { fontSize: 11, fontWeight: '600', letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 8 },
  sectionCard: { borderRadius: Radius.md, shadowColor: '#0F1726', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  settingRow: { flexDirection: 'row', alignItems: 'center', padding: 16, justifyContent: 'space-between' },
  settingText: { fontSize: 15 },
  chevron: { fontSize: 20 },
  langToggle: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderWidth: 1, borderRadius: Radius.full,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  langText: { fontSize: 13, fontWeight: '700' },
  langDivider: { fontSize: 12 },
});
