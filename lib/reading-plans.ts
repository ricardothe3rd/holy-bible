import { ReadingPlan } from './types';

export const READING_PLANS: ReadingPlan[] = [
  {
    id: 'gospels-30',
    name: 'The Gospels in 30 Days',
    description: 'Read through all four Gospels in one month',
    days: 30,
    readings: [
      { day: 1, passages: [{ book: 'Matthew', chapter: 1 }, { book: 'Matthew', chapter: 2 }], title: 'The Birth of Christ' },
      { day: 2, passages: [{ book: 'Matthew', chapter: 3 }, { book: 'Matthew', chapter: 4 }], title: 'Baptism & Temptation' },
      { day: 3, passages: [{ book: 'Matthew', chapter: 5 }, { book: 'Matthew', chapter: 6 }], title: 'Sermon on the Mount I' },
      { day: 4, passages: [{ book: 'Matthew', chapter: 7 }, { book: 'Matthew', chapter: 8 }], title: 'Sermon on the Mount II & Miracles' },
      { day: 5, passages: [{ book: 'Matthew', chapter: 9 }, { book: 'Matthew', chapter: 10 }], title: 'Healings & The Twelve' },
      { day: 6, passages: [{ book: 'Matthew', chapter: 11 }, { book: 'Matthew', chapter: 12 }, { book: 'Matthew', chapter: 13 }], title: 'Parables of the Kingdom' },
      { day: 7, passages: [{ book: 'Matthew', chapter: 14 }, { book: 'Matthew', chapter: 15 }, { book: 'Matthew', chapter: 16 }], title: 'Miracles & Peter\'s Confession' },
      { day: 8, passages: [{ book: 'Matthew', chapter: 17 }, { book: 'Matthew', chapter: 18 }, { book: 'Matthew', chapter: 19 }], title: 'Transfiguration & Teaching' },
      { day: 9, passages: [{ book: 'Matthew', chapter: 20 }, { book: 'Matthew', chapter: 21 }, { book: 'Matthew', chapter: 22 }], title: 'Entry into Jerusalem' },
      { day: 10, passages: [{ book: 'Matthew', chapter: 23 }, { book: 'Matthew', chapter: 24 }, { book: 'Matthew', chapter: 25 }], title: 'Olivet Discourse' },
      { day: 11, passages: [{ book: 'Matthew', chapter: 26 }, { book: 'Matthew', chapter: 27 }, { book: 'Matthew', chapter: 28 }], title: 'Passion & Resurrection' },
      { day: 12, passages: [{ book: 'Mark', chapter: 1 }, { book: 'Mark', chapter: 2 }], title: 'Mark: The Beginning' },
      { day: 13, passages: [{ book: 'Mark', chapter: 3 }, { book: 'Mark', chapter: 4 }, { book: 'Mark', chapter: 5 }], title: 'Authority & Parables' },
      { day: 14, passages: [{ book: 'Mark', chapter: 6 }, { book: 'Mark', chapter: 7 }, { book: 'Mark', chapter: 8 }], title: 'Feeding & Healing' },
      { day: 15, passages: [{ book: 'Mark', chapter: 9 }, { book: 'Mark', chapter: 10 }, { book: 'Mark', chapter: 11 }], title: 'The Way to Jerusalem' },
      { day: 16, passages: [{ book: 'Mark', chapter: 12 }, { book: 'Mark', chapter: 13 }], title: 'Temple Teaching' },
      { day: 17, passages: [{ book: 'Mark', chapter: 14 }, { book: 'Mark', chapter: 15 }, { book: 'Mark', chapter: 16 }], title: 'Mark: The Cross & Resurrection' },
      { day: 18, passages: [{ book: 'Luke', chapter: 1 }, { book: 'Luke', chapter: 2 }], title: 'Luke: The Nativity' },
      { day: 19, passages: [{ book: 'Luke', chapter: 3 }, { book: 'Luke', chapter: 4 }, { book: 'Luke', chapter: 5 }], title: 'Ministry Begins' },
      { day: 20, passages: [{ book: 'Luke', chapter: 6 }, { book: 'Luke', chapter: 7 }, { book: 'Luke', chapter: 8 }], title: 'Sermon on the Plain' },
      { day: 21, passages: [{ book: 'Luke', chapter: 9 }, { book: 'Luke', chapter: 10 }, { book: 'Luke', chapter: 11 }], title: 'Mission & Prayer' },
      { day: 22, passages: [{ book: 'Luke', chapter: 12 }, { book: 'Luke', chapter: 13 }, { book: 'Luke', chapter: 14 }], title: 'Warnings & Parables' },
      { day: 23, passages: [{ book: 'Luke', chapter: 15 }, { book: 'Luke', chapter: 16 }, { book: 'Luke', chapter: 17 }], title: 'Lost & Found' },
      { day: 24, passages: [{ book: 'Luke', chapter: 18 }, { book: 'Luke', chapter: 19 }, { book: 'Luke', chapter: 20 }], title: 'The Coming King' },
      { day: 25, passages: [{ book: 'Luke', chapter: 21 }, { book: 'Luke', chapter: 22 }, { book: 'Luke', chapter: 23 }, { book: 'Luke', chapter: 24 }], title: 'Luke: The Cross & Resurrection' },
      { day: 26, passages: [{ book: 'John', chapter: 1 }, { book: 'John', chapter: 2 }, { book: 'John', chapter: 3 }], title: 'John: The Word Made Flesh' },
      { day: 27, passages: [{ book: 'John', chapter: 4 }, { book: 'John', chapter: 5 }, { book: 'John', chapter: 6 }], title: 'Living Water & Bread of Life' },
      { day: 28, passages: [{ book: 'John', chapter: 7 }, { book: 'John', chapter: 8 }, { book: 'John', chapter: 9 }, { book: 'John', chapter: 10 }], title: 'Light of the World' },
      { day: 29, passages: [{ book: 'John', chapter: 11 }, { book: 'John', chapter: 12 }, { book: 'John', chapter: 13 }, { book: 'John', chapter: 14 }], title: 'Lazarus & The Upper Room' },
      { day: 30, passages: [{ book: 'John', chapter: 15 }, { book: 'John', chapter: 16 }, { book: 'John', chapter: 17 }, { book: 'John', chapter: 18 }, { book: 'John', chapter: 19 }, { book: 'John', chapter: 20 }, { book: 'John', chapter: 21 }], title: 'John: The Cross & Resurrection' },
    ],
  },
  {
    id: 'psalms-30',
    name: 'Psalms in 30 Days',
    description: 'Read through all 150 Psalms in one month — 5 per day',
    days: 30,
    readings: Array.from({ length: 30 }, (_, i) => ({
      day: i + 1,
      passages: Array.from({ length: 5 }, (_, j) => ({
        book: 'Psalms',
        chapter: i * 5 + j + 1,
      })).filter(p => p.chapter <= 150),
      title: `Psalms ${i * 5 + 1}–${Math.min(i * 5 + 5, 150)}`,
    })),
  },
  {
    id: 'proverbs-31',
    name: 'Proverbs in 31 Days',
    description: 'One chapter of Proverbs each day for a month of wisdom',
    days: 31,
    readings: Array.from({ length: 31 }, (_, i) => ({
      day: i + 1,
      passages: [{ book: 'Proverbs', chapter: i + 1 }],
      title: `Proverbs ${i + 1}`,
    })),
  },
  {
    id: 'nt-90',
    name: 'New Testament in 90 Days',
    description: 'Read the entire New Testament in three months',
    days: 90,
    readings: (() => {
      const ntChapters: { book: string; chapter: number }[] = [];
      const ntBooks = [
        { name: 'Matthew', chapters: 28 }, { name: 'Mark', chapters: 16 },
        { name: 'Luke', chapters: 24 }, { name: 'John', chapters: 21 },
        { name: 'Acts', chapters: 28 }, { name: 'Romans', chapters: 16 },
        { name: '1 Corinthians', chapters: 16 }, { name: '2 Corinthians', chapters: 13 },
        { name: 'Galatians', chapters: 6 }, { name: 'Ephesians', chapters: 6 },
        { name: 'Philippians', chapters: 4 }, { name: 'Colossians', chapters: 4 },
        { name: '1 Thessalonians', chapters: 5 }, { name: '2 Thessalonians', chapters: 3 },
        { name: '1 Timothy', chapters: 6 }, { name: '2 Timothy', chapters: 4 },
        { name: 'Titus', chapters: 3 }, { name: 'Philemon', chapters: 1 },
        { name: 'Hebrews', chapters: 13 }, { name: 'James', chapters: 5 },
        { name: '1 Peter', chapters: 5 }, { name: '2 Peter', chapters: 3 },
        { name: '1 John', chapters: 5 }, { name: '2 John', chapters: 1 },
        { name: '3 John', chapters: 1 }, { name: 'Jude', chapters: 1 },
        { name: 'Revelation', chapters: 22 },
      ];
      for (const book of ntBooks) {
        for (let ch = 1; ch <= book.chapters; ch++) {
          ntChapters.push({ book: book.name, chapter: ch });
        }
      }
      const perDay = Math.ceil(ntChapters.length / 90);
      return Array.from({ length: 90 }, (_, i) => ({
        day: i + 1,
        passages: ntChapters.slice(i * perDay, (i + 1) * perDay),
        title: (() => {
          const dayPassages = ntChapters.slice(i * perDay, (i + 1) * perDay);
          if (dayPassages.length === 0) return '';
          const first = dayPassages[0];
          const last = dayPassages[dayPassages.length - 1];
          if (first.book === last.book) return `${first.book} ${first.chapter}–${last.chapter}`;
          return `${first.book} ${first.chapter} – ${last.book} ${last.chapter}`;
        })(),
      })).filter(d => d.passages.length > 0);
    })(),
  },
];
