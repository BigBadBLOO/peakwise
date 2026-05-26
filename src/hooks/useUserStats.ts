import { useCallback, useEffect, useState } from 'react';
import { getUserStats, xpProgressInLevel, UserStats } from '../db/stats';

export interface UserStatsView {
  totalXp: number;
  streak: number;
  level: number;
  xpInLevel: number;
  xpNeeded: number;
  xpPct: number;
  refresh: () => Promise<void>;
}

export function useUserStats(): UserStatsView {
  const [stats, setStats] = useState<UserStats>({ total_xp: 0, streak_days: 0, last_activity_date: '' });

  const refresh = useCallback(async () => {
    const s = await getUserStats();
    setStats(s);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const { level, current, needed, pct } = xpProgressInLevel(stats.total_xp);

  return {
    totalXp: stats.total_xp,
    streak: stats.streak_days,
    level,
    xpInLevel: current,
    xpNeeded: needed,
    xpPct: pct,
    refresh,
  };
}
