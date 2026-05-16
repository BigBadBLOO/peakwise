export const CREATE_TABLES = `
  CREATE TABLE IF NOT EXISTS checkins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL UNIQUE,
    sleep INTEGER NOT NULL,
    energy INTEGER NOT NULL,
    soreness INTEGER NOT NULL,
    mood INTEGER NOT NULL,
    readiness INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS workouts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    name TEXT NOT NULL,
    duration_seconds INTEGER NOT NULL DEFAULT 0,
    completed INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS workout_sets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    workout_id INTEGER NOT NULL REFERENCES workouts(id),
    exercise_name TEXT NOT NULL,
    set_number INTEGER NOT NULL,
    reps TEXT NOT NULL,
    weight TEXT NOT NULL,
    feedback TEXT
  );

  CREATE TABLE IF NOT EXISTS user_profile (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
`;
