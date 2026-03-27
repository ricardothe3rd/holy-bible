import AsyncStorage from '@react-native-async-storage/async-storage';

const STREAK_KEY = 'reading_streak';

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastReadDate: string | null; // ISO date string YYYY-MM-DD
  totalDaysRead: number;
  startDate: string | null;
}

const DEFAULT_STREAK: StreakData = {
  currentStreak: 0,
  longestStreak: 0,
  lastReadDate: null,
  totalDaysRead: 0,
  startDate: null,
};

function getTodayDate(): string {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

function getYesterdayDate(): string {
  const now = new Date();
  now.setDate(now.getDate() - 1);
  return now.toISOString().split('T')[0];
}

export async function getStreakData(): Promise<StreakData> {
  try {
    const raw = await AsyncStorage.getItem(STREAK_KEY);
    if (!raw) return { ...DEFAULT_STREAK };
    return JSON.parse(raw) as StreakData;
  } catch {
    return { ...DEFAULT_STREAK };
  }
}

async function saveStreakData(data: StreakData): Promise<void> {
  await AsyncStorage.setItem(STREAK_KEY, JSON.stringify(data));
}

export async function recordReading(): Promise<StreakData> {
  const data = await getStreakData();
  const today = getTodayDate();
  const yesterday = getYesterdayDate();

  // Already recorded today, nothing to do
  if (data.lastReadDate === today) {
    return data;
  }

  if (data.lastReadDate === yesterday) {
    // Consecutive day — increment streak
    data.currentStreak += 1;
  } else {
    // First day ever or gap in reading — start new streak
    data.currentStreak = 1;
    data.startDate = today;
  }

  data.lastReadDate = today;
  data.totalDaysRead += 1;
  data.longestStreak = Math.max(data.longestStreak, data.currentStreak);

  await saveStreakData(data);
  return data;
}

export async function checkAndUpdateStreak(): Promise<StreakData> {
  const data = await getStreakData();
  const today = getTodayDate();
  const yesterday = getYesterdayDate();

  // If last read was today or yesterday, streak is still active
  if (data.lastReadDate === today || data.lastReadDate === yesterday) {
    return data;
  }

  // Streak is broken — reset current streak but keep longestStreak and totalDaysRead
  if (data.currentStreak > 0) {
    data.currentStreak = 0;
    data.startDate = null;
    await saveStreakData(data);
  }

  return data;
}
