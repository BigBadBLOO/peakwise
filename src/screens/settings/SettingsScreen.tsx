import React, { useMemo, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ModuleConfig, useSettings } from '../../context/SettingsContext';
import { useTheme, Colors } from '../../context/ThemeContext';
import { Icon } from '../../components/Icon';
import { APP_VERSION, APP_BUILD } from '../../constants/version';
import { useUserStats } from '../../hooks/useUserStats';

export function SettingsScreen() {
  const { settings, setClaudeApiKey, setModules } = useSettings();
  const { colors, toggleTheme } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);

  const userStats = useUserStats();
  const [apiKey, setApiKeyLocal] = useState(settings.claudeApiKey);
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(true);
  const [modules, setModulesLocal] = useState<ModuleConfig[]>(settings.modules);

  const saveApiKey = async () => {
    await setClaudeApiKey(apiKey.trim());
    setSaved(true);
    Alert.alert('Сохранено', 'Токен Claude API сохранён');
  };

  const moveModule = (index: number, dir: -1 | 1) => {
    const next = [...modules];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    const reordered = next.map((m, i) => ({ ...m, order: i }));
    setModulesLocal(reordered);
    setModules(reordered);
  };

  const toggleModule = (id: string) => {
    const updated = modules.map(m =>
      m.id === id ? { ...m, enabled: !m.enabled } : m,
    );
    setModulesLocal(updated);
    setModules(updated);
  };

  return (
    <SafeAreaView style={s.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={s.content}>
        {/* Profile card */}
        <View style={s.profileCard}>
          <View style={s.profileAvatar}>
            <Text style={s.profileAvatarText}>P</Text>
          </View>
          <View style={s.profileInfo}>
            <Text style={s.profileName}>Peakwise</Text>
            <Text style={s.profileSub}>Уровень {userStats.level} · {userStats.totalXp} XP</Text>
          </View>
          <View style={s.streakPill}>
            <Icon name="flame" size={14} color={colors.peak} strokeWidth={2.2} />
            <Text style={s.streakText}>{userStats.streak}</Text>
          </View>
        </View>

        {/* Claude API */}
        <Text style={s.sectionTitle}>AI Provider</Text>
        <View style={s.card}>
          <View style={s.apiHeader}>
            <View style={s.claudeIcon}>
              <Icon name="sparkle" size={16} color="#fff" />
            </View>
            <View style={s.apiInfo}>
              <Text style={s.apiName}>Claude API</Text>
              <Text style={s.apiDomain}>anthropic.com</Text>
            </View>
            {settings.claudeApiKey ? (
              <View style={s.statusPill}>
                <View style={s.statusDot} />
                <Text style={s.statusText}>активен</Text>
              </View>
            ) : (
              <View style={[s.statusPill, s.statusPillOff]}>
                <Text style={[s.statusText, { color: colors.rateForgot }]}>не настроен</Text>
              </View>
            )}
          </View>

          <View style={s.inputWrap}>
            <Text style={s.inputLabel}>API-токен</Text>
            <View style={s.inputRow}>
              <TextInput
                style={s.input}
                value={apiKey}
                onChangeText={v => { setApiKeyLocal(v); setSaved(false); }}
                placeholder="sk-ant-..."
                placeholderTextColor={colors.text4}
                secureTextEntry={!showKey}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity style={s.eyeBtn} onPress={() => setShowKey(v => !v)}>
                <Icon name={showKey ? 'eye-off' : 'eye'} size={18} color={colors.text3} />
              </TouchableOpacity>
            </View>
            <Text style={s.inputHint}>Токен хранится только на устройстве</Text>
          </View>

          <TouchableOpacity
            style={[s.saveBtn, saved && s.saveBtnSaved]}
            onPress={saveApiKey}
            disabled={saved}
          >
            {saved ? (
              <>
                <Icon name="check" size={16} color={colors.mint} strokeWidth={2.5} />
                <Text style={[s.saveBtnText, { color: colors.mint }]}>Сохранено</Text>
              </>
            ) : (
              <Text style={s.saveBtnText}>Сохранить</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Appearance */}
        <Text style={s.sectionTitle}>Внешний вид</Text>
        <View style={s.card}>
          <View style={s.settingsRow}>
            <View style={[s.settingsIcon, { backgroundColor: colors.accentSurface }]}>
              <Text style={{ fontSize: 16 }}>{colors.isDark ? '🌙' : '☀️'}</Text>
            </View>
            <View style={s.settingsInfo}>
              <Text style={s.settingsLabel}>{colors.isDark ? 'Тёмная тема' : 'Светлая тема'}</Text>
            </View>
            <Switch
              value={colors.isDark}
              onValueChange={toggleTheme}
              trackColor={{ true: colors.accent, false: colors.border }}
              thumbColor={colors.isDark ? colors.accent : '#fff'}
            />
          </View>
        </View>

        {/* Modules */}
        <Text style={s.sectionTitle}>Модули</Text>
        <Text style={s.sectionHint}>Нажмите стрелки для изменения порядка</Text>
        {[...modules].sort((a, b) => a.order - b.order).map((m, idx) => (
          <View key={m.id} style={[s.moduleRow, !m.enabled && s.moduleRowDimmed]}>
            <Icon name="drag" size={16} color={colors.text4} />
            <View style={[s.moduleIcon, { backgroundColor: m.enabled ? colors.accentSurface : colors.surface2 }]}>
              <Icon
                name={m.id === 'flashcards' ? 'cards' : m.id === 'essay' ? 'essay' : m.id === 'workout' ? 'dumbbell' : 'settings'}
                size={18}
                color={m.enabled ? colors.accent : colors.text4}
              />
            </View>
            <View style={s.moduleInfo}>
              <Text style={[s.moduleLabel, !m.enabled && { color: colors.text4 }]}>{m.label}</Text>
            </View>
            <View style={s.arrowGroup}>
              <TouchableOpacity
                onPress={() => moveModule(idx, -1)}
                style={[s.arrowBtn, idx === 0 && s.arrowBtnDisabled]}
                disabled={idx === 0}
              >
                <Icon name="chevron-up" size={14} color={idx === 0 ? colors.text4 : colors.text2} strokeWidth={2.4} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => moveModule(idx, 1)}
                style={[s.arrowBtn, idx === modules.length - 1 && s.arrowBtnDisabled]}
                disabled={idx === modules.length - 1}
              >
                <Icon name="chevron-down" size={14} color={idx === modules.length - 1 ? colors.text4 : colors.text2} strokeWidth={2.4} />
              </TouchableOpacity>
            </View>
            <Switch
              value={m.enabled}
              onValueChange={() => toggleModule(m.id)}
              trackColor={{ true: colors.accent, false: colors.border }}
              thumbColor={m.enabled ? colors.accent : '#fff'}
            />
          </View>
        ))}

        <View style={s.footer}>
          <View style={s.footerNameRow}>
            <Icon name="peak" size={22} color={colors.accent} />
            <Text style={s.footerTitle}>Peakwise</Text>
          </View>
          <Text style={s.footerSub}>версия {APP_VERSION} (build {APP_BUILD})</Text>
          <Text style={s.footerHeart}>сделано с ❤️ для тех, кто учится</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (c: Colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.bg },
  content: { padding: 16, gap: 0, paddingBottom: 40 },

  profileCard: {
    backgroundColor: c.accent, borderRadius: 16, padding: 16,
    flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 24,
    shadowColor: c.accent, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 16,
    elevation: 8,
  },
  profileAvatar: {
    width: 52, height: 52, borderRadius: 99,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center', justifyContent: 'center',
  },
  profileAvatarText: { fontSize: 20, fontWeight: '800', color: '#fff' },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 16, fontWeight: '700', color: '#fff' },
  profileSub: { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  streakPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 99,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  streakText: { fontSize: 14, fontWeight: '800', color: c.peak },

  sectionTitle: { fontSize: 13, fontWeight: '800', color: c.text2, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 10, marginTop: 8 },
  sectionHint: { fontSize: 12, color: c.text4, marginBottom: 10, marginTop: -6 },

  card: {
    backgroundColor: c.surface, borderRadius: 16,
    borderWidth: 1, borderColor: c.border, marginBottom: 20, overflow: 'hidden',
  },
  apiHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderBottomWidth: 1, borderBottomColor: c.border },
  claudeIcon: {
    width: 32, height: 32, borderRadius: 8, backgroundColor: '#D97757',
    alignItems: 'center', justifyContent: 'center',
  },
  apiInfo: { flex: 1 },
  apiName: { fontSize: 14, fontWeight: '700', color: c.text },
  apiDomain: { fontSize: 11, color: c.text4 },
  statusPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: c.mintSoft, borderRadius: 99, paddingHorizontal: 8, paddingVertical: 4,
  },
  statusPillOff: { backgroundColor: c.rateForgotSoft },
  statusDot: { width: 6, height: 6, borderRadius: 99, backgroundColor: c.mint },
  statusText: { fontSize: 11, fontWeight: '800', color: c.mint, textTransform: 'uppercase', letterSpacing: 0.3 },

  inputWrap: { padding: 14, gap: 6, borderBottomWidth: 1, borderBottomColor: c.border },
  inputLabel: { fontSize: 12, fontWeight: '700', color: c.text3 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  input: {
    flex: 1, backgroundColor: c.inputBg, borderRadius: 10,
    padding: 10, color: c.text, fontSize: 14, borderWidth: 1, borderColor: c.border,
  },
  eyeBtn: {
    width: 38, height: 38, alignItems: 'center', justifyContent: 'center',
    backgroundColor: c.inputBg, borderRadius: 10, borderWidth: 1, borderColor: c.border,
  },
  inputHint: { fontSize: 11, color: c.text4 },
  saveBtn: {
    margin: 14, borderRadius: 12, padding: 14,
    backgroundColor: c.accent, alignItems: 'center',
    flexDirection: 'row', justifyContent: 'center', gap: 6,
  },
  saveBtnSaved: { backgroundColor: c.successBg, borderWidth: 1, borderColor: c.successBorder },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  settingsRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14,
  },
  settingsIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  settingsInfo: { flex: 1 },
  settingsLabel: { fontSize: 15, color: c.text, fontWeight: '600' },

  moduleRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: c.surface, borderRadius: 14, padding: 12,
    marginBottom: 8, borderWidth: 1, borderColor: c.border,
  },
  moduleRowDimmed: { opacity: 0.55 },
  moduleIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  moduleInfo: { flex: 1 },
  moduleLabel: { fontSize: 14, fontWeight: '700', color: c.text },
  arrowGroup: { flexDirection: 'column', gap: 2 },
  arrowBtn: {
    width: 28, height: 28, alignItems: 'center', justifyContent: 'center',
    backgroundColor: c.surface2, borderRadius: 7,
  },
  arrowBtnDisabled: { opacity: 0.3 },

  footer: { marginTop: 32, alignItems: 'center', gap: 6, paddingBottom: 8 },
  footerNameRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  footerTitle: { fontSize: 18, fontWeight: '800', color: c.text },
  footerSub: { fontSize: 13, color: c.text3 },
  footerHeart: { fontSize: 12, color: c.text4 },
});
