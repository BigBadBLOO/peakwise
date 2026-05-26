import React, { useEffect, useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, Colors } from '../../context/ThemeContext';
import { Icon } from '../../components/Icon';
import { ExerciseHistoryEntry, getExerciseHistory, FEELING_COLORS, FEELING_LABELS } from '../../db/workout';

type Interval = 'week' | 'month' | 'year';
const INTERVALS: { key: Interval; label: string; days: number }[] = [
  { key: 'week', label: 'Неделя', days: 7 },
  { key: 'month', label: 'Месяц', days: 30 },
  { key: 'year', label: 'Год', days: 365 },
];

const PAGE_SIZE = 10;

interface Props {
  route: { params: { exerciseName: string } };
}

export function ExerciseHistoryScreen({ route }: Props) {
  const { exerciseName } = route.params;
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);

  const [allHistory, setAllHistory] = useState<ExerciseHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [interval, setInterval] = useState<Interval>('month');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    getExerciseHistory(exerciseName)
      .then(h => { setAllHistory(h); setLoading(false); })
      .catch(() => setLoading(false));
  }, [exerciseName]);

  if (loading) {
    return <View style={s.center}><ActivityIndicator color={colors.accent} size="large" /></View>;
  }

  if (allHistory.length === 0) {
    return (
      <SafeAreaView style={s.container} edges={['bottom']}>
        <View style={s.empty}>
          <Icon name="chart-bar" size={40} color={colors.text4} />
          <Text style={s.emptyText}>Нет истории</Text>
          <Text style={s.emptyHint}>Выполни упражнение хотя бы один раз</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Filter for chart by selected interval
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - INTERVALS.find(i => i.key === interval)!.days);
  const cutoffStr = cutoff.toISOString().slice(0, 10);
  const chartHistory = [...allHistory].reverse().filter(e => e.date >= cutoffStr);

  // Visible session entries (pagination)
  const visibleHistory = allHistory.slice(0, visibleCount);
  const hasMore = visibleCount < allHistory.length;

  // Summary stats (all time)
  const latestVol = allHistory[0]?.totalVolume ?? 0;
  const oldestVol = allHistory[allHistory.length - 1]?.totalVolume ?? 0;
  const trendPct = oldestVol > 0 ? Math.round(((latestVol - oldestVol) / oldestVol) * 100) : 0;
  const trendUp = trendPct > 0;
  const maxSets = Math.max(...allHistory.map(h => h.sets.length));

  // Chart: max volume in selected interval for scaling
  const maxVol = Math.max(...chartHistory.map(h => h.totalVolume), 1);

  return (
    <SafeAreaView style={s.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={s.content}>

        {/* Summary cards */}
        <View style={s.summaryRow}>
          <View style={s.summaryCard}>
            <Text style={s.summaryNum}>{allHistory.length}</Text>
            <Text style={s.summaryLbl}>Тренировок</Text>
          </View>
          <View style={s.summaryCard}>
            <Text style={s.summaryNum}>{maxSets}</Text>
            <Text style={s.summaryLbl}>Макс. подходов</Text>
          </View>
          <View style={[s.summaryCard, trendPct !== 0 && { borderColor: trendUp ? colors.mint : colors.rateForgot }]}>
            <Text style={[s.summaryNum, { color: trendPct === 0 ? colors.text : trendUp ? colors.mint : colors.rateForgot }]}>
              {trendPct > 0 ? `+${trendPct}%` : `${trendPct}%`}
            </Text>
            <Text style={s.summaryLbl}>Тренд объёма</Text>
          </View>
        </View>

        {/* Volume bar chart */}
        {allHistory.some(h => h.totalVolume > 0) && (
          <View style={s.section}>
            <View style={s.sectionRow}>
              <Text style={s.sectionTitle}>Объём тренировок</Text>
              <View style={s.intervalTabs}>
                {INTERVALS.map(iv => (
                  <TouchableOpacity
                    key={iv.key}
                    style={[s.intervalTab, interval === iv.key && s.intervalTabActive]}
                    onPress={() => setInterval(iv.key)}
                  >
                    <Text style={[s.intervalTabText, interval === iv.key && s.intervalTabTextActive]}>
                      {iv.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {chartHistory.length === 0 ? (
              <View style={s.noChartData}>
                <Text style={s.noChartText}>Нет тренировок за этот период</Text>
              </View>
            ) : (
              <View style={s.barChart}>
                {chartHistory.map((entry, i) => {
                  const barH = Math.max(4, Math.round((entry.totalVolume / maxVol) * 80));
                  const isLatest = i === chartHistory.length - 1;
                  return (
                    <View key={entry.session_id} style={s.barWrapper}>
                      <Text style={s.barVol}>{entry.totalVolume > 0 ? formatKg(entry.totalVolume) : ''}</Text>
                      <View style={[s.bar, { height: barH, backgroundColor: isLatest ? colors.mint : colors.mintSoft }]} />
                      <Text style={s.barDate}>{shortDate(entry.date)}</Text>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        )}

        {/* Session history */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>История подходов</Text>

          {visibleHistory.map(entry => (
            <View key={entry.session_id} style={s.sessionCard}>
              <View style={s.sessionHead}>
                <View>
                  <Text style={s.sessionDate}>{formatDate(entry.date)}</Text>
                  <Text style={s.sessionDay}>{entry.day_name}</Text>
                </View>
                <View style={s.sessionMeta}>
                  {entry.totalVolume > 0 && (
                    <Text style={s.sessionVol}>{formatKg(entry.totalVolume)} кг</Text>
                  )}
                  <View style={[s.feelingPill, { backgroundColor: FEELING_COLORS[entry.avgFeeling] + '20' }]}>
                    <Text style={[s.feelingPillText, { color: FEELING_COLORS[entry.avgFeeling] }]}>
                      {FEELING_LABELS[entry.avgFeeling]}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={s.setsTable}>
                <View style={s.setsTableHead}>
                  <Text style={[s.stCol, s.stNum]}>#</Text>
                  <Text style={[s.stCol, s.stReps]}>Повт</Text>
                  <Text style={[s.stCol, s.stWeight]}>Вес</Text>
                  <Text style={[s.stCol, { flex: 1 }]}>Объём</Text>
                  <Text style={[s.stCol, s.stFeeling]}>Ощущ.</Text>
                </View>
                {entry.sets.map(set => (
                  <View key={set.id} style={s.stRow}>
                    <Text style={[s.stCell, s.stNum]}>{set.set_number}</Text>
                    <Text style={[s.stCell, s.stReps]}>{set.reps ?? '—'}</Text>
                    <Text style={[s.stCell, s.stWeight]}>{set.weight != null ? `${set.weight}кг` : '—'}</Text>
                    <Text style={[s.stCell, { flex: 1 }]}>
                      {set.reps && set.weight ? formatKg(set.reps * set.weight) : '—'}
                    </Text>
                    <View style={s.stFeeling}>
                      <View style={[s.feelingDot, { backgroundColor: FEELING_COLORS[set.feeling] + '25' }]}>
                        <Text style={[s.feelingDotText, { color: FEELING_COLORS[set.feeling] }]}>
                          {FEELING_LABELS[set.feeling][0]}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ))}

          {hasMore && (
            <TouchableOpacity
              style={s.loadMoreBtn}
              onPress={() => setVisibleCount(v => v + PAGE_SIZE)}
            >
              <Icon name="arrow-down" size={15} color={colors.accent} />
              <Text style={s.loadMoreText}>
                Загрузить ещё ({allHistory.length - visibleCount} осталось)
              </Text>
            </TouchableOpacity>
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

function shortDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }).replace('.', '');
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatKg(kg: number): string {
  return kg >= 1000 ? `${(kg / 1000).toFixed(1)}т` : `${kg}`;
}

const makeStyles = (c: Colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: c.bg },
  content: { padding: 16, paddingBottom: 40 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, paddingTop: 80 },
  emptyText: { fontSize: 18, fontWeight: '700', color: c.text },
  emptyHint: { fontSize: 14, color: c.text4 },

  summaryRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  summaryCard: {
    flex: 1, backgroundColor: c.surface, borderRadius: 14,
    padding: 14, alignItems: 'center', gap: 4,
    borderWidth: 1, borderColor: c.border,
  },
  summaryNum: { fontSize: 20, fontWeight: '800', color: c.text },
  summaryLbl: { fontSize: 11, color: c.text4, fontWeight: '600', textAlign: 'center' },

  section: { marginBottom: 24 },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: c.text2, letterSpacing: 0.5, textTransform: 'uppercase' },

  intervalTabs: { flexDirection: 'row', backgroundColor: c.surface2, borderRadius: 10, padding: 2 },
  intervalTab: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  intervalTabActive: { backgroundColor: c.surface, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  intervalTabText: { fontSize: 12, fontWeight: '700', color: c.text4 },
  intervalTabTextActive: { color: c.text },

  noChartData: {
    backgroundColor: c.surface, borderRadius: 14, padding: 24,
    borderWidth: 1, borderColor: c.border, alignItems: 'center',
  },
  noChartText: { fontSize: 14, color: c.text4 },

  barChart: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 4,
    backgroundColor: c.surface, borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: c.border, minHeight: 130,
  },
  barWrapper: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', gap: 4, minWidth: 20 },
  barVol: { fontSize: 9, color: c.text4, fontWeight: '700' },
  bar: { width: '100%', borderRadius: 4, minHeight: 4 },
  barDate: { fontSize: 9, color: c.text4, fontWeight: '600' },

  sessionCard: {
    backgroundColor: c.surface, borderRadius: 14, marginBottom: 10,
    borderWidth: 1, borderColor: c.border, overflow: 'hidden',
  },
  sessionHead: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 12, borderBottomWidth: 1, borderBottomColor: c.border,
  },
  sessionDate: { fontSize: 14, fontWeight: '700', color: c.text },
  sessionDay: { fontSize: 12, color: c.text4, marginTop: 2 },
  sessionMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sessionVol: { fontSize: 14, fontWeight: '700', color: c.mint },
  feelingPill: { borderRadius: 99, paddingHorizontal: 8, paddingVertical: 3 },
  feelingPillText: { fontSize: 11, fontWeight: '700' },

  setsTable: { padding: 12 },
  setsTableHead: { flexDirection: 'row', paddingBottom: 6, borderBottomWidth: 1, borderBottomColor: c.border },
  stCol: { fontSize: 11, fontWeight: '700', color: c.text3, textTransform: 'uppercase' },
  stNum: { width: 24 },
  stReps: { width: 48 },
  stWeight: { width: 56 },
  stFeeling: { width: 36, alignItems: 'center' },
  stRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: c.border + '50' },
  stCell: { fontSize: 13, color: c.text, fontWeight: '600' },
  feelingDot: { width: 22, height: 22, borderRadius: 99, alignItems: 'center', justifyContent: 'center' },
  feelingDotText: { fontSize: 10, fontWeight: '800' },

  loadMoreBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: c.accentSurface, borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: c.accent + '30',
  },
  loadMoreText: { fontSize: 14, fontWeight: '700', color: c.accent },
});
