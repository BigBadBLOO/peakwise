import * as SQLite from 'expo-sqlite';

// Singleton promise — prevents double-open when called concurrently from multiple components
let initPromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function init(): Promise<SQLite.SQLiteDatabase> {
  const database = await SQLite.openDatabaseAsync('peakwise.db');

  // WAL mode: allows concurrent reads during a write, prevents database locks
  await database.execAsync('PRAGMA journal_mode = WAL;');
  await database.execAsync('PRAGMA foreign_keys = ON;');

  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS card_decks (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );
  `);

  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS cards (
      id TEXT PRIMARY KEY,
      deck_id TEXT NOT NULL,
      front TEXT NOT NULL,
      back TEXT NOT NULL,
      chain_id TEXT,
      chain_position INTEGER DEFAULT 0,
      interval INTEGER DEFAULT 1,
      repetitions INTEGER DEFAULT 0,
      ease_factor REAL DEFAULT 2.5,
      due_date INTEGER NOT NULL,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (deck_id) REFERENCES card_decks(id) ON DELETE CASCADE
    );
  `);

  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS user_stats (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      total_xp INTEGER NOT NULL DEFAULT 0,
      streak_days INTEGER NOT NULL DEFAULT 0,
      last_activity_date TEXT NOT NULL DEFAULT ''
    );
  `);

  await database.execAsync(
    `INSERT OR IGNORE INTO user_stats (id, total_xp, streak_days, last_activity_date) VALUES (1, 0, 0, '');`,
  );

  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS workout_programs (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      created_at INTEGER NOT NULL
    );
  `);

  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS workout_days (
      id TEXT PRIMARY KEY,
      program_id TEXT NOT NULL,
      name TEXT NOT NULL,
      weekday INTEGER DEFAULT NULL,
      order_index INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (program_id) REFERENCES workout_programs(id) ON DELETE CASCADE
    );
  `);

  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS workout_exercises (
      id TEXT PRIMARY KEY,
      day_id TEXT NOT NULL,
      name TEXT NOT NULL,
      order_index INTEGER NOT NULL DEFAULT 0,
      rest_seconds INTEGER NOT NULL DEFAULT 90,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (day_id) REFERENCES workout_days(id) ON DELETE CASCADE
    );
  `);

  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS workout_planned_sets (
      id TEXT PRIMARY KEY,
      exercise_id TEXT NOT NULL,
      set_number INTEGER NOT NULL,
      target_reps INTEGER DEFAULT NULL,
      target_weight REAL DEFAULT NULL,
      FOREIGN KEY (exercise_id) REFERENCES workout_exercises(id) ON DELETE CASCADE
    );
  `);

  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS workout_sessions (
      id TEXT PRIMARY KEY,
      program_id TEXT DEFAULT NULL,
      day_id TEXT DEFAULT NULL,
      day_name TEXT NOT NULL,
      date TEXT NOT NULL,
      started_at INTEGER NOT NULL,
      finished_at INTEGER DEFAULT NULL,
      duration_seconds INTEGER DEFAULT NULL,
      notes TEXT DEFAULT '',
      created_at INTEGER NOT NULL
    );
  `);

  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS workout_logged_sets (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      exercise_id TEXT DEFAULT NULL,
      exercise_name TEXT NOT NULL,
      set_number INTEGER NOT NULL,
      reps INTEGER DEFAULT NULL,
      weight REAL DEFAULT NULL,
      feeling INTEGER DEFAULT 2,
      duration_seconds INTEGER DEFAULT NULL,
      logged_at INTEGER NOT NULL,
      FOREIGN KEY (session_id) REFERENCES workout_sessions(id) ON DELETE CASCADE
    );
  `);

  return database;
}

export function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!initPromise) initPromise = init();
  return initPromise;
}
