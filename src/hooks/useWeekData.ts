import { useState, useCallback } from 'react';
import { Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { PlanDay, getPlanForWeek, savePlanDays, getRecentWorkouts, getProfileValue } from '../db/database';
import { generateWeeklyPlan, getMondayOfCurrentWeek } from '../engine/planGenerator';

export interface WeekData {
  plan: PlanDay[];
  completedDates: Set<string>;
  regenerate: () => Promise<void>;
}

export function useWeekData(): WeekData {
  const [plan, setPlan] = useState<PlanDay[]>([]);
  const [completedDates, setCompletedDates] = useState<Set<string>>(new Set());

  const loadData = useCallback(async (forceRegenerate = false) => {
    if (Platform.OS === 'web') return;

    const weekStart = getMondayOfCurrentWeek();
    let weekPlan = forceRegenerate ? [] : await getPlanForWeek(weekStart).catch(() => []);

    if (weekPlan.length === 0) {
      const daysStr = await getProfileValue('days_per_week').catch(() => null);
      const days = parseInt(daysStr ?? '4', 10);
      weekPlan = generateWeeklyPlan(weekStart, days);
      await savePlanDays(weekPlan).catch(() => {});
    }

    const workouts = await getRecentWorkouts(30).catch(() => []);
    const done = new Set(workouts.filter(w => w.completed).map(w => w.date));

    setPlan(weekPlan);
    setCompletedDates(done);
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const regenerate = useCallback(async () => {
    await loadData(true);
  }, [loadData]);

  return { plan, completedDates, regenerate };
}
