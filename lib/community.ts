import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CommunityPrayer {
  id: string;
  userId: string;
  userName: string;
  text: string;
  verseRef?: string;
  prayerCount: number;
  createdAt: string;
  lat: number;
  lng: number;
}

export interface SharedVerse {
  id: string;
  userId: string;
  userName: string;
  book: string;
  chapter: number;
  verse: number;
  text: string;
  reflection?: string;
  likeCount: number;
  createdAt: string;
}

export interface CommunityStats {
  totalMembers: number;
  activePrayers: number;
  versesSharedToday: number;
  chaptersReadToday: number;
}

// Simulated community data for demo — would connect to a real API in production
const DEMO_PRAYERS: CommunityPrayer[] = [
  { id: '1', userId: 'u1', userName: 'Sarah M.', text: 'Praying for peace in our family during this season of change', prayerCount: 24, createdAt: '2026-03-27T08:00:00Z', lat: 40.7, lng: -74.0 },
  { id: '2', userId: 'u2', userName: 'James K.', text: 'Lord, guide me in my new job. Help me be a light in my workplace', verseRef: 'Matthew 5:16', prayerCount: 18, createdAt: '2026-03-27T07:30:00Z', lat: 51.5, lng: -0.1 },
  { id: '3', userId: 'u3', userName: 'Maria G.', text: 'Please pray for my mother\'s healing. She is in the hospital', prayerCount: 47, createdAt: '2026-03-26T22:00:00Z', lat: 19.4, lng: -99.1 },
  { id: '4', userId: 'u4', userName: 'David L.', text: 'Thanksgiving for answered prayer! Our adoption went through!', prayerCount: 89, createdAt: '2026-03-26T20:00:00Z', lat: -33.9, lng: 18.4 },
  { id: '5', userId: 'u5', userName: 'Ruth A.', text: 'Praying for revival in our community and church', verseRef: '2 Chronicles 7:14', prayerCount: 31, createdAt: '2026-03-26T15:00:00Z', lat: 35.7, lng: 139.7 },
  { id: '6', userId: 'u6', userName: 'Peter N.', text: 'Seeking wisdom for a difficult decision. God\'s will be done', verseRef: 'James 1:5', prayerCount: 12, createdAt: '2026-03-27T06:00:00Z', lat: -1.3, lng: 36.8 },
  { id: '7', userId: 'u7', userName: 'Grace W.', text: 'Praying for persecuted Christians around the world', prayerCount: 56, createdAt: '2026-03-26T12:00:00Z', lat: 37.6, lng: 127.0 },
  { id: '8', userId: 'u8', userName: 'Emmanuel O.', text: 'Praise God for His faithfulness! He never fails', verseRef: 'Lamentations 3:23', prayerCount: 33, createdAt: '2026-03-27T05:00:00Z', lat: 6.5, lng: 3.4 },
];

const DEMO_VERSES: SharedVerse[] = [
  { id: 'v1', userId: 'u1', userName: 'Sarah M.', book: 'Psalms', chapter: 23, verse: 1, text: 'The LORD is my shepherd; I shall not want.', reflection: 'This verse gives me so much comfort during uncertain times.', likeCount: 34, createdAt: '2026-03-27T09:00:00Z' },
  { id: 'v2', userId: 'u3', userName: 'Maria G.', book: 'Isaiah', chapter: 41, verse: 10, text: 'Fear thou not; for I am with thee: be not dismayed; for I am thy God: I will strengthen thee; yea, I will help thee; yea, I will uphold thee with the right hand of my righteousness.', reflection: 'Reading this during my mother\'s illness. God is faithful.', likeCount: 52, createdAt: '2026-03-27T07:00:00Z' },
  { id: 'v3', userId: 'u5', userName: 'Ruth A.', book: 'Philippians', chapter: 4, verse: 13, text: 'I can do all things through Christ which strengtheneth me.', likeCount: 28, createdAt: '2026-03-26T20:00:00Z' },
  { id: 'v4', userId: 'u7', userName: 'Grace W.', book: 'Romans', chapter: 8, verse: 28, text: 'And we know that all things work together for good to them that love God, to them who are the called according to his purpose.', reflection: 'Even when we can\'t see the plan, God is working.', likeCount: 41, createdAt: '2026-03-26T18:00:00Z' },
  { id: 'v5', userId: 'u8', userName: 'Emmanuel O.', book: 'Proverbs', chapter: 3, verse: 5, text: 'Trust in the LORD with all thine heart; and lean not unto thine own understanding.', likeCount: 19, createdAt: '2026-03-26T14:00:00Z' },
];

export async function getCommunityPrayers(): Promise<CommunityPrayer[]> {
  // In production, fetch from API. For now, combine demo + user-shared prayers
  const userPrayers = await AsyncStorage.getItem('community_prayers');
  const custom: CommunityPrayer[] = userPrayers ? JSON.parse(userPrayers) : [];
  return [...custom, ...DEMO_PRAYERS].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function sharePrayer(userId: string, userName: string, text: string, verseRef?: string): Promise<void> {
  const existing = await AsyncStorage.getItem('community_prayers');
  const prayers: CommunityPrayer[] = existing ? JSON.parse(existing) : [];
  prayers.unshift({
    id: Date.now().toString(36),
    userId,
    userName,
    text,
    verseRef,
    prayerCount: 1,
    createdAt: new Date().toISOString(),
    lat: 25.8 + Math.random() * 20,
    lng: -80.2 + Math.random() * 40,
  });
  await AsyncStorage.setItem('community_prayers', JSON.stringify(prayers));
}

export async function getSharedVerses(): Promise<SharedVerse[]> {
  const userVerses = await AsyncStorage.getItem('community_verses');
  const custom: SharedVerse[] = userVerses ? JSON.parse(userVerses) : [];
  return [...custom, ...DEMO_VERSES].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function shareVerse(
  userId: string,
  userName: string,
  book: string,
  chapter: number,
  verse: number,
  text: string,
  reflection?: string
): Promise<void> {
  const existing = await AsyncStorage.getItem('community_verses');
  const verses: SharedVerse[] = existing ? JSON.parse(existing) : [];
  verses.unshift({
    id: Date.now().toString(36),
    userId,
    userName,
    book,
    chapter,
    verse,
    text,
    reflection,
    likeCount: 0,
    createdAt: new Date().toISOString(),
  });
  await AsyncStorage.setItem('community_verses', JSON.stringify(verses));
}

export function getCommunityStats(): CommunityStats {
  return {
    totalMembers: 12847,
    activePrayers: DEMO_PRAYERS.length + Math.floor(Math.random() * 50),
    versesSharedToday: DEMO_VERSES.length + Math.floor(Math.random() * 30),
    chaptersReadToday: 1523 + Math.floor(Math.random() * 200),
  };
}

// Globe point data — coordinates for community markers
export const GLOBE_POINTS = DEMO_PRAYERS.map(p => ({
  lat: p.lat,
  lng: p.lng,
  label: p.userName,
  type: 'prayer' as const,
}));
