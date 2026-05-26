import { getDb } from './database';

export interface Deck {
  id: string;
  name: string;
  created_at: number;
}

export interface Card {
  id: string;
  deck_id: string;
  front: string;
  back: string;
  chain_id: string | null;
  chain_position: number;
  interval: number;
  repetitions: number;
  ease_factor: number;
  due_date: number;
  created_at: number;
}

function uuid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// SM-2 algorithm
// quality: 0-5 (0-2 = fail, 3-5 = pass)
export function sm2(card: Card, quality: number): Partial<Card> {
  let { repetitions, ease_factor, interval } = card;
  const ef = Math.max(1.3, ease_factor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

  if (quality < 3) {
    repetitions = 0;
    interval = 1;
  } else {
    if (repetitions === 0) interval = 1;
    else if (repetitions === 1) interval = 6;
    else interval = Math.round(interval * ef);
    repetitions += 1;
  }

  const now = Date.now();
  const due_date = now + interval * 24 * 60 * 60 * 1000;

  return { repetitions, ease_factor: ef, interval, due_date };
}

export async function getDecks(): Promise<Deck[]> {
  const db = await getDb();
  return db.getAllAsync<Deck>('SELECT * FROM card_decks ORDER BY created_at DESC');
}

export async function createDeck(name: string): Promise<Deck> {
  const db = await getDb();
  const deck: Deck = { id: uuid(), name, created_at: Date.now() };
  await db.runAsync(
    'INSERT INTO card_decks (id, name, created_at) VALUES (?, ?, ?)',
    deck.id, deck.name, deck.created_at,
  );
  return deck;
}

export async function deleteDeck(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM card_decks WHERE id = ?', id);
}

export async function getCards(deckId: string): Promise<Card[]> {
  const db = await getDb();
  return db.getAllAsync<Card>('SELECT * FROM cards WHERE deck_id = ? ORDER BY chain_position', deckId);
}

export async function createCard(
  deckId: string,
  front: string,
  back: string,
  chainId?: string,
  chainPosition?: number,
): Promise<Card> {
  const db = await getDb();
  const card: Card = {
    id: uuid(),
    deck_id: deckId,
    front,
    back,
    chain_id: chainId ?? null,
    chain_position: chainPosition ?? 0,
    interval: 1,
    repetitions: 0,
    ease_factor: 2.5,
    due_date: Date.now(),
    created_at: Date.now(),
  };
  await db.runAsync(
    `INSERT INTO cards (id, deck_id, front, back, chain_id, chain_position,
     interval, repetitions, ease_factor, due_date, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    card.id, card.deck_id, card.front, card.back,
    card.chain_id, card.chain_position,
    card.interval, card.repetitions, card.ease_factor,
    card.due_date, card.created_at,
  );
  return card;
}

export async function updateCard(id: string, fields: Partial<Card>): Promise<void> {
  const db = await getDb();
  const keys = Object.keys(fields).filter(k => k !== 'id');
  const sets = keys.map(k => `${k} = ?`).join(', ');
  const vals = keys.map(k => (fields as any)[k]);
  await db.runAsync(`UPDATE cards SET ${sets} WHERE id = ?`, ...vals, id);
}

export async function deleteCard(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM cards WHERE id = ?', id);
}

// Returns cards due today, including chain heads (chain_position = 0)
export async function getDueCards(deckId: string): Promise<Card[]> {
  const db = await getDb();
  const now = Date.now();
  // Only return cards that are due and either not in a chain, or at position 0
  return db.getAllAsync<Card>(
    `SELECT * FROM cards
     WHERE deck_id = ? AND due_date <= ?
       AND (chain_id IS NULL OR chain_position = 0)
     ORDER BY due_date`,
    deckId, now,
  );
}

// Get entire chain ordered by position
export async function getChain(chainId: string): Promise<Card[]> {
  const db = await getDb();
  return db.getAllAsync<Card>(
    'SELECT * FROM cards WHERE chain_id = ? ORDER BY chain_position',
    chainId,
  );
}

export async function getDeckStats(deckId: string): Promise<{ total: number; due: number }> {
  const db = await getDb();
  const total = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM cards WHERE deck_id = ?', deckId,
  );
  const due = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM cards WHERE deck_id = ? AND due_date <= ?',
    deckId, Date.now(),
  );
  return { total: total?.count ?? 0, due: due?.count ?? 0 };
}
