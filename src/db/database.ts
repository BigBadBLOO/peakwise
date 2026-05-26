import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  db = await SQLite.openDatabaseAsync('peakwise.db');
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS card_decks (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS cards (
      id TEXT PRIMARY KEY,
      deck_id TEXT NOT NULL,
      front TEXT NOT NULL,
      back TEXT NOT NULL,
      chain_id TEXT,
      chain_position INTEGER DEFAULT 0,
      -- SM-2 fields
      interval INTEGER DEFAULT 1,
      repetitions INTEGER DEFAULT 0,
      ease_factor REAL DEFAULT 2.5,
      due_date INTEGER NOT NULL,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (deck_id) REFERENCES card_decks(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS user_stats (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      total_xp INTEGER NOT NULL DEFAULT 0,
      streak_days INTEGER NOT NULL DEFAULT 0,
      last_activity_date TEXT NOT NULL DEFAULT ''
    );

    INSERT OR IGNORE INTO user_stats (id, total_xp, streak_days, last_activity_date)
    VALUES (1, 0, 0, '');
  `);
  return db;
}
