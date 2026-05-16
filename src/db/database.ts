import * as SQLite from 'expo-sqlite';
import { CREATE_TABLES } from './schema';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  db = await SQLite.openDatabaseAsync('peakwise.db');
  await db.execAsync(CREATE_TABLES);
  return db;
}

// ─── Check-ins ─────────────────────────────────────────────────────────────

export interface Checkin {
  id?: number;
  date: string;
  sleep: number;
  energy: number;
  soreness: number;
  mood: number;
  readiness: number;
}

export async function saveCheckin(checkin: Omit<Checkin, 'id'>): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT OR REPLACE INTO checkins (date, sleep, energy, soreness, mood, readiness)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [checkin.date, checkin.sleep, checkin.energy, checkin.soreness, checkin.mood, checkin.readiness]
  );
}

export async function getCheckinByDate(date: string): Promise<Checkin | null> {
  const db = await getDb();
  return db.getFirstAsync<Checkin>('SELECT * FROM checkins WHERE date = ?', [date]);
}

export async function getRecentCheckins(limit = 7): Promise<Checkin[]> {
  const db = await getDb();
  return db.getAllAsync<Checkin>(
    'SELECT * FROM checkins ORDER BY date DESC LIMIT ?',
    [limit]
  );
}

// ─── Workouts ───────────────────────────────────────────────────────────────

export interface Workout {
  id?: number;
  date: string;
  name: string;
  duration_seconds: number;
  completed: number;
}

export interface WorkoutSet {
  exercise_name: string;
  set_number: number;
  reps: string;
  weight: string;
  feedback?: string;
}

export async function saveWorkout(
  workout: Omit<Workout, 'id'>,
  sets: WorkoutSet[]
): Promise<number> {
  const db = await getDb();
  const result = await db.runAsync(
    `INSERT INTO workouts (date, name, duration_seconds, completed) VALUES (?, ?, ?, ?)`,
    [workout.date, workout.name, workout.duration_seconds, workout.completed ? 1 : 0]
  );
  const workoutId = result.lastInsertRowId;
  for (const set of sets) {
    await db.runAsync(
      `INSERT INTO workout_sets (workout_id, exercise_name, set_number, reps, weight, feedback)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [workoutId, set.exercise_name, set.set_number, set.reps, set.weight, set.feedback ?? null]
    );
  }
  return workoutId;
}

export async function getRecentWorkouts(limit = 10): Promise<Workout[]> {
  const db = await getDb();
  return db.getAllAsync<Workout>(
    'SELECT * FROM workouts ORDER BY date DESC LIMIT ?',
    [limit]
  );
}

export async function getWorkoutVolume(weeks = 7): Promise<{ week: string; volume: number }[]> {
  const db = await getDb();
  return db.getAllAsync<{ week: string; volume: number }>(
    `SELECT strftime('%W', date) as week, COUNT(*) as volume
     FROM workouts WHERE completed = 1
     GROUP BY week ORDER BY week DESC LIMIT ?`,
    [weeks]
  );
}

// ─── Workout plan ───────────────────────────────────────────────────────────

export interface PlanDay {
  date: string;
  session_type: string;
  session_name: string;
}

export async function savePlanDays(days: PlanDay[]): Promise<void> {
  const db = await getDb();
  for (const day of days) {
    await db.runAsync(
      'INSERT OR REPLACE INTO workout_plan (date, session_type, session_name) VALUES (?, ?, ?)',
      [day.date, day.session_type, day.session_name]
    );
  }
}

export async function getPlanForWeek(weekStart: string): Promise<PlanDay[]> {
  const db = await getDb();
  return db.getAllAsync<PlanDay>(
    `SELECT date, session_type, session_name FROM workout_plan
     WHERE date >= ? AND date <= date(?, '+6 days') ORDER BY date`,
    [weekStart, weekStart]
  );
}

export async function getTodayPlan(): Promise<PlanDay | null> {
  const db = await getDb();
  const today = new Date().toISOString().split('T')[0];
  return db.getFirstAsync<PlanDay>(
    'SELECT date, session_type, session_name FROM workout_plan WHERE date = ?',
    [today]
  );
}

// ─── User profile (key-value) ───────────────────────────────────────────────

export async function setProfileValue(key: string, value: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'INSERT OR REPLACE INTO user_profile (key, value) VALUES (?, ?)',
    [key, value]
  );
}

export async function getProfileValue(key: string): Promise<string | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM user_profile WHERE key = ?',
    [key]
  );
  return row?.value ?? null;
}
