export interface BibleBook {
  id: number;
  name: string;
  abbrev: string;
  testament: 'OT' | 'NT';
  chapters: number;
}

export interface Verse {
  book: string;
  chapter: number;
  verse: number;
  text: string;
}

export interface Bookmark {
  id: number;
  book: string;
  chapter: number;
  verse: number;
  created_at: string;
}

export interface Highlight {
  id: number;
  book: string;
  chapter: number;
  verse: number;
  color: string;
  created_at: string;
}

export interface Note {
  id: number;
  book: string;
  chapter: number;
  verse: number;
  text: string;
  created_at: string;
  updated_at: string;
}

export interface ReadingPlan {
  id: string;
  name: string;
  description: string;
  days: number;
  readings: ReadingPlanDay[];
}

export interface ReadingPlanDay {
  day: number;
  passages: { book: string; chapter: number }[];
  title?: string;
}

export interface ReadingProgress {
  id: number;
  plan_id: string;
  day: number;
  completed: boolean;
  completed_at: string | null;
}

export interface ChapterData {
  book: string;
  chapter: number;
  verses: Verse[];
}

export interface Prayer {
  id: number;
  title: string;
  body: string | null;
  category: string;
  is_answered: number;
  answered_note: string | null;
  created_at: string;
  updated_at: string;
}

export const PRAYER_CATEGORIES = [
  { key: 'general', label: 'General', icon: '\u{1F64F}' },
  { key: 'thanksgiving', label: 'Thanksgiving', icon: '\u{1F49B}' },
  { key: 'intercession', label: 'For Others', icon: '\u{1F465}' },
  { key: 'healing', label: 'Healing', icon: '\u2764\uFE0F\u200D\u{1FA79}' },
  { key: 'guidance', label: 'Guidance', icon: '\u{1F31F}' },
  { key: 'provision', label: 'Provision', icon: '\u{1F331}' },
];

export type HighlightColor = '#FFD700' | '#90EE90' | '#87CEEB' | '#FFB6C1' | '#DDA0DD' | '#FFA07A';

export const HIGHLIGHT_COLORS: { color: HighlightColor; name: string }[] = [
  { color: '#FFD700', name: 'Gold' },
  { color: '#90EE90', name: 'Green' },
  { color: '#87CEEB', name: 'Blue' },
  { color: '#FFB6C1', name: 'Pink' },
  { color: '#DDA0DD', name: 'Purple' },
  { color: '#FFA07A', name: 'Orange' },
];
