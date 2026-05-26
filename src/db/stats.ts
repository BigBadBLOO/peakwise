import { getDb } from './database';

export interface UserStats {
  total_xp: number;
  streak_days: number;
  last_activity_date: string;
}

// XP needed to reach level N (cumulative)
// Level 1: 0, Level 2: 200, Level 3: 500, Level 4: 900, Level 5: 1400 ...
// Formula: 200 * (N-1) + 100 * (N-1)*(N-2)/2  →  simplified: 100 * N * (N-1) / 2 + 100 * (N-1)
export function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  // threshold[1]=0, [2]=200, [3]=500, [4]=900, [5]=1400, [6]=2000...
  return 100 * (level - 1) + 100 * ((level - 1) * (level - 2)) / 2;
}

export function levelFromXp(xp: number): number {
  let level = 1;
  while (xpForLevel(level + 1) <= xp) level++;
  return level;
}

export function xpProgressInLevel(xp: number): { level: number; current: number; needed: number; pct: number } {
  const level = levelFromXp(xp);
  const start = xpForLevel(level);
  const end = xpForLevel(level + 1);
  const current = xp - start;
  const needed = end - start;
  return { level, current, needed, pct: Math.min(1, current / needed) };
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

function yesterdayStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export async function getUserStats(): Promise<UserStats> {
  const db = await getDb();
  const row = await db.getFirstAsync<UserStats>(
    'SELECT total_xp, streak_days, last_activity_date FROM user_stats WHERE id = 1',
  );
  return row ?? { total_xp: 0, streak_days: 0, last_activity_date: '' };
}

// Call this after any activity that earns XP.
// Handles streak: extends if last activity was yesterday, resets if older, no-op if same day.
export async function addXp(amount: number): Promise<UserStats> {
  const db = await getDb();
  const stats = await getUserStats();
  const today = todayStr();
  const yesterday = yesterdayStr();

  let newStreak = stats.streak_days;

  if (stats.last_activity_date === today) {
    // Already active today — just add XP, don't touch streak
  } else if (stats.last_activity_date === yesterday) {
    // Consecutive day
    newStreak = stats.streak_days + 1;
  } else {
    // Gap — reset to 1
    newStreak = 1;
  }

  const newXp = stats.total_xp + amount;

  await db.runAsync(
    'UPDATE user_stats SET total_xp = ?, streak_days = ?, last_activity_date = ? WHERE id = 1',
    newXp, newStreak, today,
  );

  return { total_xp: newXp, streak_days: newStreak, last_activity_date: today };
}

// XP awarded per card rating (used in ReviewScreen and exported for display)
export const CARD_XP = { forgot: 5, hard: 8, good: 12, easy: 15 } as const;

// XP awarded for essay activities
export const ESSAY_XP = { retelling: 20, essay: 30 } as const;
