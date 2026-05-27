import { getDb } from './database';

export type EssayType = 'retelling' | 'essay';

export interface EssaySession {
  id: string;
  type: EssayType;
  source_text: string;
  user_text: string;
  feedback: string;
  created_at: number;
}

export async function saveEssaySession(
  type: EssayType,
  sourceText: string,
  userText: string,
  feedback: string,
): Promise<void> {
  const db = await getDb();
  const id = Math.random().toString(36).slice(2) + Date.now().toString(36);
  await db.runAsync(
    `INSERT INTO essay_sessions (id, type, source_text, user_text, feedback, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id, type, sourceText, userText, feedback, Date.now()],
  );
}

export async function getEssaySessions(limit: number, offset: number): Promise<EssaySession[]> {
  const db = await getDb();
  return db.getAllAsync<EssaySession>(
    `SELECT * FROM essay_sessions ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [limit, offset],
  );
}
