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
  `);
  return db;
}
