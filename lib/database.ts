import * as SQLite from 'expo-sqlite';
import { Bookmark, Highlight, Note, Prayer, ReadingProgress } from './types';

let db: SQLite.SQLiteDatabase;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  db = await SQLite.openDatabaseAsync('holybible.db');
  await initDatabase(db);
  return db;
}

async function initDatabase(database: SQLite.SQLiteDatabase) {
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS bookmarks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      book TEXT NOT NULL,
      chapter INTEGER NOT NULL,
      verse INTEGER NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(book, chapter, verse)
    );

    CREATE TABLE IF NOT EXISTS highlights (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      book TEXT NOT NULL,
      chapter INTEGER NOT NULL,
      verse INTEGER NOT NULL,
      color TEXT NOT NULL DEFAULT '#FFD700',
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(book, chapter, verse)
    );

    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      book TEXT NOT NULL,
      chapter INTEGER NOT NULL,
      verse INTEGER NOT NULL,
      text TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      UNIQUE(book, chapter, verse)
    );

    CREATE TABLE IF NOT EXISTS reading_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      plan_id TEXT NOT NULL,
      day INTEGER NOT NULL,
      completed INTEGER DEFAULT 0,
      completed_at TEXT,
      UNIQUE(plan_id, day)
    );

    CREATE TABLE IF NOT EXISTS cached_chapters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      book TEXT NOT NULL,
      chapter INTEGER NOT NULL,
      data TEXT NOT NULL,
      cached_at TEXT DEFAULT (datetime('now')),
      UNIQUE(book, chapter)
    );

    CREATE TABLE IF NOT EXISTS reading_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      book TEXT NOT NULL,
      chapter INTEGER NOT NULL,
      read_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS prayers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      body TEXT,
      category TEXT DEFAULT 'general',
      is_answered INTEGER DEFAULT 0,
      answered_note TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
  `);
}

// Bookmarks
export async function addBookmark(book: string, chapter: number, verse: number): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    'INSERT OR REPLACE INTO bookmarks (book, chapter, verse) VALUES (?, ?, ?)',
    [book, chapter, verse]
  );
}

export async function removeBookmark(book: string, chapter: number, verse: number): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    'DELETE FROM bookmarks WHERE book = ? AND chapter = ? AND verse = ?',
    [book, chapter, verse]
  );
}

export async function getBookmarks(): Promise<Bookmark[]> {
  const database = await getDatabase();
  return database.getAllAsync<Bookmark>(
    'SELECT * FROM bookmarks ORDER BY created_at DESC'
  );
}

export async function isBookmarked(book: string, chapter: number, verse: number): Promise<boolean> {
  const database = await getDatabase();
  const result = await database.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM bookmarks WHERE book = ? AND chapter = ? AND verse = ?',
    [book, chapter, verse]
  );
  return (result?.count ?? 0) > 0;
}

// Highlights
export async function addHighlight(book: string, chapter: number, verse: number, color: string): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    'INSERT OR REPLACE INTO highlights (book, chapter, verse, color) VALUES (?, ?, ?, ?)',
    [book, chapter, verse, color]
  );
}

export async function removeHighlight(book: string, chapter: number, verse: number): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    'DELETE FROM highlights WHERE book = ? AND chapter = ? AND verse = ?',
    [book, chapter, verse]
  );
}

export async function getHighlights(): Promise<Highlight[]> {
  const database = await getDatabase();
  return database.getAllAsync<Highlight>(
    'SELECT * FROM highlights ORDER BY created_at DESC'
  );
}

export async function getChapterHighlights(book: string, chapter: number): Promise<Highlight[]> {
  const database = await getDatabase();
  return database.getAllAsync<Highlight>(
    'SELECT * FROM highlights WHERE book = ? AND chapter = ?',
    [book, chapter]
  );
}

// Notes
export async function addNote(book: string, chapter: number, verse: number, text: string): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    `INSERT INTO notes (book, chapter, verse, text) VALUES (?, ?, ?, ?)
     ON CONFLICT(book, chapter, verse) DO UPDATE SET text = ?, updated_at = datetime('now')`,
    [book, chapter, verse, text, text]
  );
}

export async function removeNote(book: string, chapter: number, verse: number): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    'DELETE FROM notes WHERE book = ? AND chapter = ? AND verse = ?',
    [book, chapter, verse]
  );
}

export async function getNotes(): Promise<Note[]> {
  const database = await getDatabase();
  return database.getAllAsync<Note>(
    'SELECT * FROM notes ORDER BY updated_at DESC'
  );
}

export async function getChapterNotes(book: string, chapter: number): Promise<Note[]> {
  const database = await getDatabase();
  return database.getAllAsync<Note>(
    'SELECT * FROM notes WHERE book = ? AND chapter = ?',
    [book, chapter]
  );
}

export async function getVerseNote(book: string, chapter: number, verse: number): Promise<Note | null> {
  const database = await getDatabase();
  return database.getFirstAsync<Note>(
    'SELECT * FROM notes WHERE book = ? AND chapter = ? AND verse = ?',
    [book, chapter, verse]
  );
}

// Reading Progress
export async function markDayComplete(planId: string, day: number): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    `INSERT OR REPLACE INTO reading_progress (plan_id, day, completed, completed_at) VALUES (?, ?, 1, datetime('now'))`,
    [planId, day]
  );
}

export async function getPlanProgress(planId: string): Promise<ReadingProgress[]> {
  const database = await getDatabase();
  return database.getAllAsync<ReadingProgress>(
    'SELECT * FROM reading_progress WHERE plan_id = ? ORDER BY day',
    [planId]
  );
}

export async function isDayComplete(planId: string, day: number): Promise<boolean> {
  const database = await getDatabase();
  const result = await database.getFirstAsync<{ completed: number }>(
    'SELECT completed FROM reading_progress WHERE plan_id = ? AND day = ?',
    [planId, day]
  );
  return result?.completed === 1;
}

// Chapter Cache
export async function cacheChapter(book: string, chapter: number, data: string): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    'INSERT OR REPLACE INTO cached_chapters (book, chapter, data) VALUES (?, ?, ?)',
    [book, chapter, data]
  );
}

export async function getCachedChapter(book: string, chapter: number): Promise<string | null> {
  const database = await getDatabase();
  const result = await database.getFirstAsync<{ data: string }>(
    'SELECT data FROM cached_chapters WHERE book = ? AND chapter = ?',
    [book, chapter]
  );
  return result?.data ?? null;
}

// Reading History
export async function addToHistory(book: string, chapter: number): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    'INSERT INTO reading_history (book, chapter) VALUES (?, ?)',
    [book, chapter]
  );
}

export async function getReadingHistory(limit = 20): Promise<{ book: string; chapter: number; read_at: string }[]> {
  const database = await getDatabase();
  return database.getAllAsync(
    'SELECT book, chapter, read_at FROM reading_history ORDER BY read_at DESC LIMIT ?',
    [limit]
  );
}

// Search across notes
export async function searchNotes(query: string): Promise<Note[]> {
  const database = await getDatabase();
  return database.getAllAsync<Note>(
    'SELECT * FROM notes WHERE text LIKE ? ORDER BY updated_at DESC',
    [`%${query}%`]
  );
}

// Prayers
export async function addPrayer(title: string, body: string | null, category: string): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    'INSERT INTO prayers (title, body, category) VALUES (?, ?, ?)',
    [title, body, category]
  );
}

export async function getPrayers(): Promise<Prayer[]> {
  const database = await getDatabase();
  return database.getAllAsync<Prayer>(
    'SELECT * FROM prayers ORDER BY created_at DESC'
  );
}

export async function updatePrayer(id: number, title: string, body: string | null, category: string): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    `UPDATE prayers SET title = ?, body = ?, category = ?, updated_at = datetime('now') WHERE id = ?`,
    [title, body, category, id]
  );
}

export async function markPrayerAnswered(id: number, answeredNote: string | null): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    `UPDATE prayers SET is_answered = 1, answered_note = ?, updated_at = datetime('now') WHERE id = ?`,
    [answeredNote, id]
  );
}

export async function deletePrayer(id: number): Promise<void> {
  const database = await getDatabase();
  await database.runAsync('DELETE FROM prayers WHERE id = ?', [id]);
}

export async function getPrayersByCategory(category: string): Promise<Prayer[]> {
  const database = await getDatabase();
  return database.getAllAsync<Prayer>(
    'SELECT * FROM prayers WHERE category = ? ORDER BY created_at DESC',
    [category]
  );
}
