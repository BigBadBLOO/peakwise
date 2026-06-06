import { getDb } from './database';

export interface Program {
  id: string;
  name: string;
  description: string;
  created_at: number;
}

export interface WorkoutDay {
  id: string;
  program_id: string;
  name: string;
  weekday: number | null;
  order_index: number;
  created_at: number;
}

export interface Exercise {
  id: string;
  day_id: string;
  name: string;
  order_index: number;
  rest_seconds: number;
  created_at: number;
}

export interface PlannedSet {
  id: string;
  exercise_id: string;
  set_number: number;
  target_reps: number | null;
  target_weight: number | null;
}

export interface WorkoutSession {
  id: string;
  program_id: string | null;
  day_id: string | null;
  day_name: string;
  date: string;
  started_at: number;
  finished_at: number | null;
  duration_seconds: number | null;
  notes: string;
  created_at: number;
}

export interface LoggedSet {
  id: string;
  session_id: string;
  exercise_id: string | null;
  exercise_name: string;
  set_number: number;
  reps: number | null;
  weight: number | null;
  feeling: number;
  duration_seconds: number | null;
  logged_at: number;
}

export const FEELING_LABELS = ['', 'Легко', 'Нормально', 'Тяжело'] as const;
export const FEELING_COLORS = ['', '#3CA86E', '#EC8B2F', '#E0455A'] as const;

function uuid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

// ── Programs ──────────────────────────────────────────────────────────────────

export async function getPrograms(): Promise<Program[]> {
  const db = await getDb();
  return db.getAllAsync<Program>('SELECT * FROM workout_programs ORDER BY created_at DESC');
}

export async function createProgram(name: string, description = ''): Promise<Program> {
  const db = await getDb();
  const p: Program = { id: uuid(), name, description, created_at: Date.now() };
  await db.runAsync(
    'INSERT INTO workout_programs (id, name, description, created_at) VALUES (?, ?, ?, ?)',
    p.id, p.name, p.description, p.created_at,
  );
  return p;
}

export async function updateProgram(id: string, name: string, description: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('UPDATE workout_programs SET name = ?, description = ? WHERE id = ?', name, description, id);
}

export async function deleteProgram(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM workout_programs WHERE id = ?', id);
}

// ── Days ──────────────────────────────────────────────────────────────────────

export async function getDays(programId: string): Promise<WorkoutDay[]> {
  const db = await getDb();
  return db.getAllAsync<WorkoutDay>(
    'SELECT * FROM workout_days WHERE program_id = ? ORDER BY order_index',
    programId,
  );
}

export async function createDay(programId: string, name: string, weekday: number | null = null): Promise<WorkoutDay> {
  const db = await getDb();
  const maxRow = await db.getFirstAsync<{ m: number }>(
    'SELECT COALESCE(MAX(order_index), -1) as m FROM workout_days WHERE program_id = ?', programId,
  );
  const order = (maxRow?.m ?? -1) + 1;
  const d: WorkoutDay = { id: uuid(), program_id: programId, name, weekday, order_index: order, created_at: Date.now() };
  await db.runAsync(
    'INSERT INTO workout_days (id, program_id, name, weekday, order_index, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    d.id, d.program_id, d.name, d.weekday, d.order_index, d.created_at,
  );
  return d;
}

export async function updateDay(id: string, name: string, weekday: number | null): Promise<void> {
  const db = await getDb();
  await db.runAsync('UPDATE workout_days SET name = ?, weekday = ? WHERE id = ?', name, weekday, id);
}

export async function deleteDay(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM workout_days WHERE id = ?', id);
}

export async function reorderDays(days: WorkoutDay[]): Promise<void> {
  const db = await getDb();
  await Promise.all(days.map((d, i) =>
    db.runAsync('UPDATE workout_days SET order_index = ? WHERE id = ?', i, d.id),
  ));
}

// ── Exercises ─────────────────────────────────────────────────────────────────

export async function getExercises(dayId: string): Promise<Exercise[]> {
  const db = await getDb();
  return db.getAllAsync<Exercise>(
    'SELECT * FROM workout_exercises WHERE day_id = ? ORDER BY order_index',
    dayId,
  );
}

export async function createExercise(dayId: string, name: string, restSeconds = 90): Promise<Exercise> {
  const db = await getDb();
  const maxRow = await db.getFirstAsync<{ m: number }>(
    'SELECT COALESCE(MAX(order_index), -1) as m FROM workout_exercises WHERE day_id = ?', dayId,
  );
  const order = (maxRow?.m ?? -1) + 1;
  const e: Exercise = { id: uuid(), day_id: dayId, name, order_index: order, rest_seconds: restSeconds, created_at: Date.now() };
  await db.runAsync(
    'INSERT INTO workout_exercises (id, day_id, name, order_index, rest_seconds, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    e.id, e.day_id, e.name, e.order_index, e.rest_seconds, e.created_at,
  );
  return e;
}

export async function updateExercise(id: string, name: string, restSeconds: number): Promise<void> {
  const db = await getDb();
  await db.runAsync('UPDATE workout_exercises SET name = ?, rest_seconds = ? WHERE id = ?', name, restSeconds, id);
}

export async function deleteExercise(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM workout_exercises WHERE id = ?', id);
}

export async function reorderExercises(exercises: Exercise[]): Promise<void> {
  const db = await getDb();
  await Promise.all(exercises.map((e, i) =>
    db.runAsync('UPDATE workout_exercises SET order_index = ? WHERE id = ?', i, e.id),
  ));
}

// ── Planned sets ──────────────────────────────────────────────────────────────

export async function getPlannedSets(exerciseId: string): Promise<PlannedSet[]> {
  const db = await getDb();
  return db.getAllAsync<PlannedSet>(
    'SELECT * FROM workout_planned_sets WHERE exercise_id = ? ORDER BY set_number',
    exerciseId,
  );
}

export async function upsertPlannedSet(
  exerciseId: string, setNumber: number, targetReps: number | null, targetWeight: number | null,
): Promise<void> {
  const db = await getDb();
  const existing = await db.getFirstAsync<PlannedSet>(
    'SELECT * FROM workout_planned_sets WHERE exercise_id = ? AND set_number = ?',
    exerciseId, setNumber,
  );
  if (existing) {
    await db.runAsync(
      'UPDATE workout_planned_sets SET target_reps = ?, target_weight = ? WHERE id = ?',
      targetReps, targetWeight, existing.id,
    );
  } else {
    await db.runAsync(
      'INSERT INTO workout_planned_sets (id, exercise_id, set_number, target_reps, target_weight) VALUES (?, ?, ?, ?, ?)',
      uuid(), exerciseId, setNumber, targetReps, targetWeight,
    );
  }
}

export async function deletePlannedSet(exerciseId: string, setNumber: number): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'DELETE FROM workout_planned_sets WHERE exercise_id = ? AND set_number = ?',
    exerciseId, setNumber,
  );
}

// ── Sessions ──────────────────────────────────────────────────────────────────

export async function createSession(
  programId: string | null, dayId: string | null, dayName: string,
): Promise<WorkoutSession> {
  const db = await getDb();
  const now = Date.now();
  const s: WorkoutSession = {
    id: uuid(), program_id: programId, day_id: dayId, day_name: dayName,
    date: today(), started_at: now, finished_at: null, duration_seconds: null,
    notes: '', created_at: now,
  };
  await db.runAsync(
    `INSERT INTO workout_sessions (id, program_id, day_id, day_name, date, started_at, finished_at, duration_seconds, notes, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    s.id, s.program_id, s.day_id, s.day_name,
    s.date, s.started_at, s.finished_at, s.duration_seconds, s.notes, s.created_at,
  );
  return s;
}

export async function finishSession(id: string, durationSeconds: number): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'UPDATE workout_sessions SET finished_at = ?, duration_seconds = ? WHERE id = ?',
    Date.now(), durationSeconds, id,
  );
}

export async function deleteSession(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM workout_sessions WHERE id = ?', id);
}

export async function getSessionsByDay(dayId: string, limit = 20): Promise<WorkoutSession[]> {
  const db = await getDb();
  return db.getAllAsync<WorkoutSession>(
    'SELECT * FROM workout_sessions WHERE day_id = ? AND finished_at IS NOT NULL ORDER BY started_at DESC LIMIT ?',
    dayId, limit,
  );
}

export async function getRecentSessions(limit = 10): Promise<WorkoutSession[]> {
  const db = await getDb();
  return db.getAllAsync<WorkoutSession>(
    'SELECT * FROM workout_sessions WHERE finished_at IS NOT NULL ORDER BY started_at DESC LIMIT ?',
    limit,
  );
}

// ── Logged sets ───────────────────────────────────────────────────────────────

export async function logSet(
  sessionId: string,
  exerciseId: string | null,
  exerciseName: string,
  setNumber: number,
  reps: number | null,
  weight: number | null,
  feeling: number,
  durationSeconds: number | null = null,
): Promise<LoggedSet> {
  const db = await getDb();
  const ls: LoggedSet = {
    id: uuid(), session_id: sessionId, exercise_id: exerciseId, exercise_name: exerciseName,
    set_number: setNumber, reps, weight, feeling, duration_seconds: durationSeconds,
    logged_at: Date.now(),
  };
  await db.runAsync(
    `INSERT INTO workout_logged_sets (id, session_id, exercise_id, exercise_name, set_number, reps, weight, feeling, duration_seconds, logged_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ls.id, ls.session_id, ls.exercise_id, ls.exercise_name,
    ls.set_number, ls.reps, ls.weight, ls.feeling, ls.duration_seconds, ls.logged_at,
  );
  return ls;
}

export async function getSessionLogs(sessionId: string): Promise<LoggedSet[]> {
  const db = await getDb();
  return db.getAllAsync<LoggedSet>(
    'SELECT * FROM workout_logged_sets WHERE session_id = ? ORDER BY logged_at',
    sessionId,
  );
}

export async function deleteLoggedSet(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM workout_logged_sets WHERE id = ?', id);
}

// ── Analytics ─────────────────────────────────────────────────────────────────

export interface ExerciseHistoryEntry {
  session_id: string;
  date: string;
  day_name: string;
  sets: LoggedSet[];
  totalVolume: number;
  avgFeeling: number;
}

export async function getExerciseHistory(exerciseName: string, limit = 200): Promise<ExerciseHistoryEntry[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<LoggedSet & { session_date: string; session_day_name: string }>(
    `SELECT wls.*, ws.date as session_date, ws.day_name as session_day_name
     FROM workout_logged_sets wls
     JOIN workout_sessions ws ON wls.session_id = ws.id
     WHERE wls.exercise_name = ? AND ws.finished_at IS NOT NULL
     ORDER BY ws.started_at DESC`,
    exerciseName,
  );

  const sessionMap = new Map<string, ExerciseHistoryEntry>();
  for (const row of rows) {
    if (!sessionMap.has(row.session_id)) {
      sessionMap.set(row.session_id, {
        session_id: row.session_id,
        date: row.session_date,
        day_name: row.session_day_name,
        sets: [],
        totalVolume: 0,
        avgFeeling: 0,
      });
    }
    const entry = sessionMap.get(row.session_id)!;
    entry.sets.push(row);
    entry.totalVolume += (row.reps ?? 0) * (row.weight ?? 0);
  }

  const entries = Array.from(sessionMap.values()).slice(0, limit);
  for (const e of entries) {
    e.avgFeeling = e.sets.length > 0
      ? Math.round(e.sets.reduce((s, r) => s + r.feeling, 0) / e.sets.length)
      : 2;
  }
  return entries;
}

export interface SessionStats {
  totalSets: number;
  totalReps: number;
  totalVolume: number;
  exerciseCount: number;
}

export async function getSessionStats(sessionId: string): Promise<SessionStats> {
  const db = await getDb();
  const rows = await db.getAllAsync<LoggedSet>(
    'SELECT * FROM workout_logged_sets WHERE session_id = ?', sessionId,
  );
  const exerciseNames = new Set(rows.map(r => r.exercise_name));
  return {
    totalSets: rows.length,
    totalReps: rows.reduce((s, r) => s + (r.reps ?? 0), 0),
    totalVolume: rows.reduce((s, r) => s + (r.reps ?? 0) * (r.weight ?? 0), 0),
    exerciseCount: exerciseNames.size,
  };
}

export async function getProgramStats(programId: string): Promise<{ sessionCount: number; lastDate: string | null }> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ count: number; lastDate: string | null }>(
    `SELECT COUNT(*) as count, MAX(date) as lastDate FROM workout_sessions
     WHERE program_id = ? AND finished_at IS NOT NULL`,
    programId,
  );
  return { sessionCount: row?.count ?? 0, lastDate: row?.lastDate ?? null };
}

// ── Export / Import ───────────────────────────────────────────────────────────

export interface ExportedSet {
  set_number: number;
  target_reps: number | null;
  target_weight: number | null;
}

export interface ExportedExercise {
  name: string;
  rest_seconds: number;
  planned_sets: ExportedSet[];
}

export interface ExportedDay {
  name: string;
  exercises: ExportedExercise[];
}

export interface ExportedProgram {
  name: string;
  description: string;
  days: ExportedDay[];
}

export interface HistorySetEntry {
  set_number: number;
  reps: number | null;
  weight: number | null;
  feeling: number;
}

export interface HistoryExerciseEntry {
  name: string;
  sets: HistorySetEntry[];
}

export interface HistorySessionEntry {
  date: string;
  day_name: string;
  duration_minutes: number | null;
  exercises: HistoryExerciseEntry[];
}

export interface WorkoutExport {
  version: '1';
  exported_at: string;
  programs: ExportedProgram[];
  recent_history: HistorySessionEntry[];
}

export interface ImportProgram {
  name: string;
  description?: string;
  days: Array<{
    name: string;
    exercises: Array<{
      name: string;
      rest_seconds?: number;
      sets: Array<{
        set_number: number;
        target_reps?: number | null;
        target_weight?: number | null;
      }>;
    }>;
  }>;
}

export async function exportWorkoutData(): Promise<WorkoutExport> {
  const db = await getDb();

  const programs = await getPrograms();
  const exportedPrograms: ExportedProgram[] = [];

  for (const prog of programs) {
    const days = await getDays(prog.id);
    const exportedDays: ExportedDay[] = [];
    for (const day of days) {
      const exercises = await getExercises(day.id);
      const exportedExercises: ExportedExercise[] = [];
      for (const ex of exercises) {
        const sets = await getPlannedSets(ex.id);
        exportedExercises.push({
          name: ex.name,
          rest_seconds: ex.rest_seconds,
          planned_sets: sets.map(s => ({
            set_number: s.set_number,
            target_reps: s.target_reps,
            target_weight: s.target_weight,
          })),
        });
      }
      exportedDays.push({ name: day.name, exercises: exportedExercises });
    }
    exportedPrograms.push({ name: prog.name, description: prog.description, days: exportedDays });
  }

  const sessions = await db.getAllAsync<WorkoutSession>(
    `SELECT * FROM workout_sessions WHERE finished_at IS NOT NULL ORDER BY started_at DESC LIMIT 30`,
  );

  const history: HistorySessionEntry[] = [];
  for (const s of sessions) {
    const logs = await getSessionLogs(s.id);
    const exMap = new Map<string, HistorySetEntry[]>();
    for (const log of logs) {
      if (!exMap.has(log.exercise_name)) exMap.set(log.exercise_name, []);
      exMap.get(log.exercise_name)!.push({
        set_number: log.set_number,
        reps: log.reps,
        weight: log.weight,
        feeling: log.feeling,
      });
    }
    history.push({
      date: s.date,
      day_name: s.day_name,
      duration_minutes: s.duration_seconds != null ? Math.round(s.duration_seconds / 60) : null,
      exercises: Array.from(exMap.entries()).map(([name, sets]) => ({ name, sets })),
    });
  }

  return {
    version: '1',
    exported_at: new Date().toISOString().slice(0, 10),
    programs: exportedPrograms,
    recent_history: history,
  };
}

export async function importProgram(data: ImportProgram): Promise<Program> {
  const prog = await createProgram(data.name, data.description ?? '');
  for (const dayDef of data.days) {
    const day = await createDay(prog.id, dayDef.name);
    for (const exDef of dayDef.exercises) {
      const ex = await createExercise(day.id, exDef.name, exDef.rest_seconds ?? 90);
      for (const setDef of exDef.sets) {
        await upsertPlannedSet(ex.id, setDef.set_number, setDef.target_reps ?? null, setDef.target_weight ?? null);
      }
    }
  }
  return prog;
}
