import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Colors, Radius, Spacing } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

const SECTIONS = [
  {
    title: 'Account',
    items: ['Edit profile', 'Notification settings', 'Connect wearable'],
  },
  {
    title: 'App',
    items: ['Units (kg / lbs)', 'Dark mode', 'Language'],
  },
  {
    title: 'About',
    items: ['Privacy policy', 'Terms of service', 'App version 1.0.0'],
  },
];

export default function ProfileScreen() {
  const { isDark, mode, setMode } = useTheme();

  const toggleDark = () => {
    Haptics.selectionAsync();
    if (mode === 'system') setMode('dark');
    else if (mode === 'dark') setMode('light');
    else setMode('dark');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Avatar */}
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>A</Text>
        </View>
        <Text style={styles.name}>Alex Johnson</Text>
        <Text style={styles.meta}>Member since Jan 2025</Text>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[['124', 'Workouts'], ['12', 'Week streak'], ['18.4t', 'Best week']].map(([v, l]) => (
            <View key={l} style={styles.statItem}>
              <Text style={styles.statValue}>{v}</Text>
              <Text style={styles.statLabel}>{l}</Text>
            </View>
          ))}
        </View>

        {/* Subscription */}
        <View style={styles.subCard}>
          <View>
            <Text style={styles.subTitle}>Free trial</Text>
            <Text style={styles.subSub}>28 days remaining</Text>
          </View>
          <TouchableOpacity style={styles.upgradeBtn}>
            <Text style={styles.upgradeBtnText}>Upgrade</Text>
          </TouchableOpacity>
        </View>

        {/* Settings */}
        {SECTIONS.map((sec) => (
          <View key={sec.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{sec.title}</Text>
            <View style={styles.sectionCard}>
              {sec.items.map((item, i) => {
                const isDarkToggle = item === 'Dark mode';
                return (
                  <TouchableOpacity
                    key={item}
                    style={[styles.settingRow, i < sec.items.length - 1 && styles.settingBorder]}
                    onPress={isDarkToggle ? toggleDark : undefined}
                    activeOpacity={isDarkToggle ? 0.7 : 1}
                  >
                    <Text style={styles.settingText}>{item}</Text>
                    {isDarkToggle ? (
                      <Switch
                        value={isDark}
                        onValueChange={toggleDark}
                        trackColor={{ false: Colors.n200, true: Colors.green }}
                        thumbColor="#fff"
                      />
                    ) : (
                      <Text style={styles.chevron}>›</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.n50 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.green,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  avatarText: { fontSize: 32, fontWeight: '700', color: '#fff' },
  name: { fontSize: 22, fontWeight: '700', color: Colors.n900, textAlign: 'center', marginTop: 10, letterSpacing: -0.3 },
  meta: { fontSize: 13, color: Colors.n500, textAlign: 'center', marginTop: 4 },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: Spacing.md,
    marginTop: 20,
    backgroundColor: Colors.n0,
    borderRadius: Radius.md,
    padding: Spacing.md,
    shadowColor: '#0F1726',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '700', color: Colors.n900, letterSpacing: -0.4 },
  statLabel: { fontSize: 11, color: Colors.n500, marginTop: 2 },
  subCard: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    backgroundColor: Colors.navy,
    borderRadius: Radius.md,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  subTitle: { fontSize: 16, fontWeight: '700', color: '#fff' },
  subSub: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  upgradeBtn: {
    backgroundColor: Colors.green,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: Radius.full,
  },
  upgradeBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  section: { marginTop: Spacing.md, paddingHorizontal: Spacing.md },
  sectionTitle: { fontSize: 11, fontWeight: '600', color: Colors.n400, letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 8 },
  sectionCard: {
    backgroundColor: Colors.n0,
    borderRadius: Radius.md,
    shadowColor: '#0F1726',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  settingRow: { flexDirection: 'row', alignItems: 'center', padding: 16, justifyContent: 'space-between' },
  settingBorder: { borderBottomWidth: 1, borderBottomColor: Colors.n100 },
  settingText: { fontSize: 15, color: Colors.n900 },
  chevron: { fontSize: 20, color: Colors.n300 },
});
