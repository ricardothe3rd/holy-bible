import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDatabase } from './database';

interface AppState {
  currentBook: string;
  currentChapter: number;
  fontSize: number;
  redLetterEnabled: boolean;
  dbReady: boolean;
}

interface AppContextType extends AppState {
  setCurrentBook: (book: string) => void;
  setCurrentChapter: (chapter: number) => void;
  navigateTo: (book: string, chapter: number) => void;
  setFontSize: (size: number) => void;
  setRedLetterEnabled: (enabled: boolean) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>({
    currentBook: 'Genesis',
    currentChapter: 1,
    fontSize: 18,
    redLetterEnabled: true,
    dbReady: false,
  });

  useEffect(() => {
    (async () => {
      try {
        await getDatabase();
        const savedBook = await AsyncStorage.getItem('currentBook');
        const savedChapter = await AsyncStorage.getItem('currentChapter');
        const savedFontSize = await AsyncStorage.getItem('fontSize');
        const savedRedLetter = await AsyncStorage.getItem('redLetterEnabled');
        setState(prev => ({
          ...prev,
          currentBook: savedBook || 'Genesis',
          currentChapter: savedChapter ? parseInt(savedChapter) : 1,
          fontSize: savedFontSize ? parseInt(savedFontSize) : 18,
          redLetterEnabled: savedRedLetter !== 'false',
          dbReady: true,
        }));
      } catch {
        setState(prev => ({ ...prev, dbReady: true }));
      }
    })();
  }, []);

  const setCurrentBook = useCallback((book: string) => {
    setState(prev => ({ ...prev, currentBook: book }));
    AsyncStorage.setItem('currentBook', book);
  }, []);

  const setCurrentChapter = useCallback((chapter: number) => {
    setState(prev => ({ ...prev, currentChapter: chapter }));
    AsyncStorage.setItem('currentChapter', String(chapter));
  }, []);

  const navigateTo = useCallback((book: string, chapter: number) => {
    setState(prev => ({ ...prev, currentBook: book, currentChapter: chapter }));
    AsyncStorage.setItem('currentBook', book);
    AsyncStorage.setItem('currentChapter', String(chapter));
  }, []);

  const setFontSize = useCallback((size: number) => {
    setState(prev => ({ ...prev, fontSize: size }));
    AsyncStorage.setItem('fontSize', String(size));
  }, []);

  const setRedLetterEnabled = useCallback((enabled: boolean) => {
    setState(prev => ({ ...prev, redLetterEnabled: enabled }));
    AsyncStorage.setItem('redLetterEnabled', String(enabled));
  }, []);

  return (
    <AppContext.Provider
      value={{
        ...state,
        setCurrentBook,
        setCurrentChapter,
        navigateTo,
        setFontSize,
        setRedLetterEnabled,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
