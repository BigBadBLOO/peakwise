import { useState, useCallback } from 'react';
import { Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Checkin, PlanDay, getCheckinByDate, getRecentWorkouts, getTodayPlan } from '../db/database';

export interface HomeData {
  checkin: Checkin | null;
  streak: number;
  todayPlan: PlanDay | null;
}

export function useHomeData(): HomeData {
  const [state, setState] = useState<HomeData>({ checkin: null, streak: 0, todayPlan: null });

  useFocusEffect(useCallback(() => {
    if (Platform.OS === 'web') return;

    const today = new Date().toISOString().split('T')[0];
    Promise.all([
      getCheckinByDate(today).catch(() => null),
      getRecentWorkouts(60).catch(() => []),
      getTodayPlan().catch(() => null),
    ]).then(([checkin, workouts, todayPlan]) => {
      let streak = 0;
      const now = new Date();
      for (let i = 0; i < 60; i++) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        if (workouts.some(w => w.date === d.toISOString().split('T')[0] && w.completed)) streak++;
        else if (i > 0) break;
      }
      setState({ checkin, streak, todayPlan });
    });
  }, []));

  return state;
}
