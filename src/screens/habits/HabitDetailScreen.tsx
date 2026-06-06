import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useTheme, Colors } from '../../context/ThemeContext';
import { Icon } from '../../components/Icon';
import { HabitStats, getHabitStats, getLocalDateString } from '../../db/habits';

const MONTHS_RU = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
const DAYS_SHORT = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  return `${d} ${MONTHS_RU[m - 1]} ${y}`;
}

type GridCell = { date: string; dayNum: number; approved: boolean } | null;

export function HabitDetailScreen({ route, navigation }: any) {
  const { habitId, habitName } = route.params as { habitId: string; habitName: string };
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);

  const [stats, setStats] = useState<HabitStats | null>(null);
  const [loading, setLoading] = useState(true);

  const today = useMemo(() => getLocalDateString(), []);

  const load = useCallback(async () => {
    setLoading(true);
    const st = await getHabitStats(habitId, today);
    setStats(st);
    setLoading(false);
  }, [habitId, today]);

  useEffect(() => {
    const unsub = navigation.addListener('focus', load);
    return unsub;
  }, [navigation, load]);

  // Build a 28-day grid aligned to Monday columns
  const gridRows = useMemo((): GridCell[][] => {
    if (!stats) return [];
    const approvedSet = new Set(stats.logs.map(l => l.date));
    const base = new Date(today + 'T00:00:00');

    const cells: GridCell[] = Array.from({ length: 28 }, (_, i) => {
      const d = new Date(base);
      d.setDate(d.getDate() - (27 - i));
      const dateStr = getLocalDateString(d);
      return { date: dateStr, dayNum: d.getDate(), approved: approvedSet.has(dateStr) };
    });

    // Pad start so first cell falls on Monday (0=Mon … 6=Sun)
    const firstDate = new Date(cells[0]!.date + 'T00:00:00');
    const dow = (firstDate.getDay() + 6) % 7;
    const padded: GridCell[] = [...Array(dow).fill(null), ...cells];

    // Pad end to complete last row
    const rem = padded.length % 7;
    if (rem > 0) for (let i = 0; i < 7 - rem; i++) padded.push(null);

    const rows: GridCell[][] = [];
    for (let r = 0; r < padded.length / 7; r++) {
      rows.push(padded.slice(r * 7, r * 7 + 7));
    }
    return rows;
  }, [stats, today]);

  if (loading || !stats) {
    return (
      <View style={s.center}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={s.scroll} contentContainerStyle={s.content}>
      {/* Stats row */}
      <View style={s.statsRow}>
        <View style={s.statCard}>
          <Icon name="flame" size={20} color={colors.peak} />
          <Text style={s.statValue}>{stats.streak}</Text>
          <Text style={s.statLabel}>Серия</Text>
        </View>
        <View style={s.statCard}>
          <Icon name="trophy" size={20} color={colors.accent} />
          <Text style={s.statValue}>{stats.longestStreak}</Text>
          <Text style={s.statLabel}>Рекорд</Text>
        </View>
        <View style={s.statCard}>
          <Icon name="check" size={20} color={colors.mint} />
          <Text style={s.statValue}>{stats.total}</Text>
          <Text style={s.statLabel}>Всего</Text>
        </View>
      </View>

      {/* 28-day grid */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>Последние 4 недели</Text>
        <View style={s.dayHeaders}>
          {DAYS_SHORT.map(d => (
            <Text key={d} style={s.dayHeader}>{d}</Text>
          ))}
        </View>
        <View style={s.grid}>
          {gridRows.map((row, ri) => (
            <View key={ri} style={s.gridRow}>
              {row.map((cell, ci) =>
                cell ? (
                  <View
                    key={cell.date}
                    style={[
                      s.gridCell,
                      cell.approved ? s.gridCellApproved : s.gridCellEmpty,
                      cell.date === today && s.gridCellToday,
                    ]}
                  >
                    <Text style={[s.gridNum, cell.approved && s.gridNumApproved]}>
                      {cell.dayNum}
                    </Text>
                  </View>
                ) : (
                  <View key={`pad-${ri}-${ci}`} style={s.gridCell} />
                ),
              )}
            </View>
          ))}
        </View>
      </View>

      {/* History */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>История</Text>
        {stats.logs.length === 0 ? (
          <Text style={s.emptyHistory}>Нет выполнений. Начни сегодня!</Text>
        ) : (
          stats.logs.map(log => (
            <View key={log.id} style={s.historyItem}>
              <View style={s.historyDot} />
              <Text style={s.historyDate}>{formatDate(log.date)}</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const makeStyles = (c: Colors) => StyleSheet.create({
  scroll: { flex: 1, backgroundColor: c.bg },
  content: { padding: 20, paddingBottom: 40 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: c.bg },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  statCard: {
    flex: 1, backgroundColor: c.surface, borderRadius: 16, padding: 14,
    alignItems: 'center', gap: 4, borderWidth: 1, borderColor: c.border,
  },
  statValue: { fontSize: 26, fontWeight: '800', color: c.text },
  statLabel: { fontSize: 12, color: c.text4, fontWeight: '600' },
  section: { marginBottom: 28 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: c.text2, marginBottom: 10 },
  dayHeaders: { flexDirection: 'row', gap: 5, marginBottom: 6 },
  dayHeader: { flex: 1, textAlign: 'center', fontSize: 11, color: c.text4, fontWeight: '600' },
  grid: { gap: 5 },
  gridRow: { flexDirection: 'row', gap: 5 },
  gridCell: {
    flex: 1, aspectRatio: 1, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  gridCellEmpty: { backgroundColor: c.surface2, borderWidth: 1, borderColor: c.border },
  gridCellApproved: { backgroundColor: c.mint },
  gridCellToday: { borderWidth: 2, borderColor: c.accent },
  gridNum: { fontSize: 11, fontWeight: '600', color: c.text4 },
  gridNumApproved: { color: '#fff', fontWeight: '700' },
  historyItem: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: c.border,
  },
  historyDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: c.mint },
  historyDate: { fontSize: 14, color: c.text2, fontWeight: '500' },
  emptyHistory: { fontSize: 14, color: c.text4, paddingVertical: 8 },
});
