import { getDb } from './database';

export interface Habit {
  id: string;
  name: string;
  description: string;
  created_at: number;
  archived_at: number | null;
}

export interface HabitLog {
  id: string;
  habit_id: string;
  date: string;
  created_at: number;
}

export interface HabitStats {
  total: number;
  streak: number;
  longestStreak: number;
  approvedToday: boolean;
  logs: HabitLog[];
}

export function getLocalDateString(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function uuid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function computeStreak(dateSet: Set<string>, today: string): number {
  const d = new Date(today + 'T00:00:00');
  // If today not approved, count from yesterday
  if (!dateSet.has(today)) {
    d.setDate(d.getDate() - 1);
  }
  let streak = 0;
  while (dateSet.has(getLocalDateString(d))) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

function computeLongestStreak(logs: HabitLog[]): number {
  if (!logs.length) return 0;
  const sorted = [...logs].sort((a, b) => a.date.localeCompare(b.date));
  let longest = 1;
  let current = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1].date + 'T00:00:00');
    const curr = new Date(sorted[i].date + 'T00:00:00');
    const diff = Math.round((curr.getTime() - prev.getTime()) / 86400000);
    if (diff === 1) {
      current++;
      if (current > longest) longest = current;
    } else if (diff > 1) {
      current = 1;
    }
  }
  return longest;
}

export async function createHabit(name: string): Promise<Habit> {
  const db = await getDb();
  const id = uuid();
  const now = Date.now();
  await db.runAsync(
    'INSERT INTO habits (id, name, description, created_at) VALUES (?, ?, ?, ?)',
    [id, name, '', now],
  );
  return { id, name, description: '', created_at: now, archived_at: null };
}

export async function getHabits(): Promise<Habit[]> {
  const db = await getDb();
  return db.getAllAsync<Habit>(
    'SELECT * FROM habits WHERE archived_at IS NULL ORDER BY created_at ASC',
  );
}

export async function getArchivedHabits(): Promise<Habit[]> {
  const db = await getDb();
  return db.getAllAsync<Habit>(
    'SELECT * FROM habits WHERE archived_at IS NOT NULL ORDER BY archived_at DESC',
  );
}

export async function deleteHabit(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM habits WHERE id = ?', [id]);
}

export async function archiveHabit(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('UPDATE habits SET archived_at = ? WHERE id = ?', [Date.now(), id]);
}

export async function restoreHabit(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('UPDATE habits SET archived_at = NULL WHERE id = ?', [id]);
}

export async function approveHabit(habitId: string, date: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'INSERT OR IGNORE INTO habit_logs (id, habit_id, date, created_at) VALUES (?, ?, ?, ?)',
    [uuid(), habitId, date, Date.now()],
  );
}

export async function unapproveHabit(habitId: string, date: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM habit_logs WHERE habit_id = ? AND date = ?', [habitId, date]);
}

export async function getHabitStats(habitId: string, today: string): Promise<HabitStats> {
  const db = await getDb();
  const logs = await db.getAllAsync<HabitLog>(
    'SELECT * FROM habit_logs WHERE habit_id = ? ORDER BY date ASC',
    [habitId],
  );
  const dateSet = new Set(logs.map(l => l.date));
  return {
    total: logs.length,
    streak: computeStreak(dateSet, today),
    longestStreak: computeLongestStreak(logs),
    approvedToday: dateSet.has(today),
    logs: [...logs].reverse(),
  };
}

export async function getAllHabitsStats(
  today: string,
): Promise<Record<string, { streak: number; total: number; approvedToday: boolean }>> {
  const db = await getDb();
  const allLogs = await db.getAllAsync<HabitLog>(
    `SELECT hl.* FROM habit_logs hl
     JOIN habits h ON hl.habit_id = h.id
     WHERE h.archived_at IS NULL
     ORDER BY hl.date ASC`,
  );

  const byHabit: Record<string, HabitLog[]> = {};
  for (const log of allLogs) {
    if (!byHabit[log.habit_id]) byHabit[log.habit_id] = [];
    byHabit[log.habit_id].push(log);
  }

  const result: Record<string, { streak: number; total: number; approvedToday: boolean }> = {};
  for (const [habitId, logs] of Object.entries(byHabit)) {
    const dateSet = new Set(logs.map(l => l.date));
    result[habitId] = {
      streak: computeStreak(dateSet, today),
      total: logs.length,
      approvedToday: dateSet.has(today),
    };
  }
  return result;
}
