import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ModuleConfig, useSettings } from '../../context/SettingsContext';
import { APP_VERSION } from '../../constants/version';

export function SettingsScreen() {
  const { settings, setClaudeApiKey, setModules } = useSettings();
  const [apiKey, setApiKeyLocal] = useState(settings.claudeApiKey);
  const [modules, setModulesLocal] = useState<ModuleConfig[]>(settings.modules);

  const saveApiKey = async () => {
    await setClaudeApiKey(apiKey.trim());
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
        <Text style={s.section}>Claude API</Text>
        <Text style={s.label}>API токен</Text>
        <TextInput
          style={s.input}
          value={apiKey}
          onChangeText={setApiKeyLocal}
          placeholder="sk-ant-..."
          placeholderTextColor="#555"
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity style={s.btn} onPress={saveApiKey}>
          <Text style={s.btnText}>Сохранить токен</Text>
        </TouchableOpacity>

        <Text style={[s.section, { marginTop: 32 }]}>Порядок вкладок</Text>
        <Text style={s.hint}>Используйте стрелки для изменения порядка</Text>
        {[...modules].sort((a, b) => a.order - b.order).map((m, idx) => (
          <View key={m.id} style={s.moduleRow}>
            <TouchableOpacity onPress={() => toggleModule(m.id)} style={s.toggleBtn}>
              <View style={[s.toggle, m.enabled && s.toggleOn]} />
            </TouchableOpacity>
            <Text style={s.moduleIcon}>{m.icon}</Text>
            <Text style={[s.moduleLabel, !m.enabled && s.dimmed]}>{m.label}</Text>
            <View style={s.arrows}>
              <TouchableOpacity onPress={() => moveModule(idx, -1)} style={s.arrow}>
                <Text style={s.arrowText}>▲</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => moveModule(idx, 1)} style={s.arrow}>
                <Text style={s.arrowText}>▼</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <Text style={s.version}>Peakwise v{APP_VERSION}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1a' },
  content: { padding: 20 },
  section: { fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 12 },
  label: { fontSize: 14, color: '#aaa', marginBottom: 6 },
  hint: { fontSize: 13, color: '#666', marginBottom: 12 },
  input: {
    backgroundColor: '#1e1e30',
    borderRadius: 10,
    padding: 14,
    color: '#fff',
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#2d2d4e',
    marginBottom: 12,
  },
  btn: {
    backgroundColor: '#7c6af7',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
  },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  moduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e1e30',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    gap: 10,
  },
  toggleBtn: { padding: 4 },
  toggle: {
    width: 36,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#333',
  },
  toggleOn: { backgroundColor: '#7c6af7' },
  moduleIcon: { fontSize: 22 },
  moduleLabel: { flex: 1, color: '#fff', fontSize: 15 },
  dimmed: { color: '#555' },
  arrows: { flexDirection: 'row', gap: 4 },
  arrow: {
    backgroundColor: '#2d2d4e',
    borderRadius: 6,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: { color: '#aaa', fontSize: 14 },
  version: { marginTop: 40, textAlign: 'center', color: '#444', fontSize: 12 },
});
