import { Verse, ChapterData } from './types';
import { cacheChapter, getCachedChapter } from './database';

const API_BASE = 'https://bible-api.com';

export async function fetchChapter(book: string, chapter: number): Promise<ChapterData> {
  // Check cache first
  try {
    const cached = await getCachedChapter(book, chapter);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch {}

  // Fetch from API
  const query = `${encodeURIComponent(book)}+${chapter}?translation=kjv`;
  const response = await fetch(`${API_BASE}/${query}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch ${book} ${chapter}`);
  }

  const data = await response.json();

  const verses: Verse[] = data.verses.map((v: any) => ({
    book: v.book_name || book,
    chapter: v.chapter || chapter,
    verse: v.verse,
    text: v.text.trim(),
  }));

  const chapterData: ChapterData = { book, chapter, verses };

  // Cache the result
  try {
    await cacheChapter(book, chapter, JSON.stringify(chapterData));
  } catch {}

  return chapterData;
}

export async function searchBible(query: string): Promise<Verse[]> {
  // Use the API search endpoint
  const response = await fetch(`${API_BASE}/${encodeURIComponent(query)}?translation=kjv`);

  if (!response.ok) {
    return [];
  }

  const data = await response.json();

  if (data.verses) {
    return data.verses.map((v: any) => ({
      book: v.book_name,
      chapter: v.chapter,
      verse: v.verse,
      text: v.text.trim(),
    }));
  }

  return [];
}
