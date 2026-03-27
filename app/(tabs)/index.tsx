import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Dimensions,
} from 'react-native';
import * as Speech from 'expo-speech';
import { useThemeColors } from '../../lib/hooks';
import { useApp } from '../../lib/context';
import { fetchChapter } from '../../lib/api';
import { getBook } from '../../lib/bible-data';
import { BIBLE_BOOKS } from '../../lib/bible-data';
import {
  getBookmarks,
  getChapterHighlights,
  getChapterNotes,
  addToHistory,
} from '../../lib/database';
import { Verse, Highlight, Note, Bookmark } from '../../lib/types';
import VerseText from '../../components/VerseText';
import BookSelector from '../../components/BookSelector';
import ChapterSelector from '../../components/ChapterSelector';
import StreakBadge from '../../components/StreakBadge';
import { recordReading } from '../../lib/streak';

export default function ReadScreen() {
  const colors = useThemeColors();
  const { currentBook, currentChapter, setCurrentBook, setCurrentChapter, fontSize, redLetterEnabled, dbReady } = useApp();

  const [verses, setVerses] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [showBookSelector, setShowBookSelector] = useState(false);
  const [showChapterSelector, setShowChapterSelector] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentReadingVerse, setCurrentReadingVerse] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const isPlayingRef = useRef(false);

  const book = getBook(currentBook);
  const totalChapters = book?.chapters || 1;

  const loadChapter = useCallback(async () => {
    if (!dbReady) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchChapter(currentBook, currentChapter);
      setVerses(data.verses);
      await addToHistory(currentBook, currentChapter);
      await recordReading();
    } catch (err) {
      setError('Failed to load chapter. Check your connection.');
    } finally {
      setLoading(false);
    }
  }, [currentBook, currentChapter, dbReady]);

  const loadAnnotations = useCallback(async () => {
    if (!dbReady) return;
    try {
      const [bm, hl, nt] = await Promise.all([
        getBookmarks(),
        getChapterHighlights(currentBook, currentChapter),
        getChapterNotes(currentBook, currentChapter),
      ]);
      setBookmarks(bm);
      setHighlights(hl);
      setNotes(nt);
    } catch {}
  }, [currentBook, currentChapter, dbReady]);

  useEffect(() => {
    loadChapter();
    loadAnnotations();
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [loadChapter, loadAnnotations]);

  const goToPrevChapter = () => {
    if (currentChapter > 1) {
      setCurrentChapter(currentChapter - 1);
    } else {
      const bookIndex = BIBLE_BOOKS.findIndex(b => b.name === currentBook);
      if (bookIndex > 0) {
        const prevBook = BIBLE_BOOKS[bookIndex - 1];
        setCurrentBook(prevBook.name);
        setCurrentChapter(prevBook.chapters);
      }
    }
  };

  const goToNextChapter = () => {
    if (currentChapter < totalChapters) {
      setCurrentChapter(currentChapter + 1);
    } else {
      const bookIndex = BIBLE_BOOKS.findIndex(b => b.name === currentBook);
      if (bookIndex < BIBLE_BOOKS.length - 1) {
        const nextBook = BIBLE_BOOKS[bookIndex + 1];
        setCurrentBook(nextBook.name);
        setCurrentChapter(1);
      }
    }
  };

  const isVerseBookmarked = (verseNum: number) =>
    bookmarks.some(b => b.book === currentBook && b.chapter === currentChapter && b.verse === verseNum);

  const getVerseHighlight = (verseNum: number) =>
    highlights.find(h => h.verse === verseNum);

  const getVerseNote = (verseNum: number) =>
    notes.find(n => n.verse === verseNum);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // Stop reading when chapter changes
  useEffect(() => {
    stopReading();
  }, [currentBook, currentChapter]);

  const startReading = async () => {
    if (verses.length === 0) return;
    setIsPlaying(true);
    isPlayingRef.current = true;
    for (let i = 0; i < verses.length; i++) {
      setCurrentReadingVerse(verses[i].verse);
      await new Promise<void>((resolve, reject) => {
        Speech.speak(verses[i].text, {
          language: 'en-US',
          rate: 0.9,
          onDone: resolve,
          onError: reject,
          onStopped: reject,
        });
      }).catch(() => {});
      if (!isPlayingRef.current) break;
    }
    setIsPlaying(false);
    setCurrentReadingVerse(0);
    isPlayingRef.current = false;
  };

  const stopReading = () => {
    Speech.stop();
    isPlayingRef.current = false;
    setIsPlaying(false);
    setCurrentReadingVerse(0);
  };

  const toggleReading = () => {
    if (isPlaying) {
      stopReading();
    } else {
      startReading();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Navigation Header */}
      <View style={[styles.navHeader, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.bookButton, { backgroundColor: colors.surfaceAlt }]}
          onPress={() => setShowBookSelector(true)}
        >
          <Text style={[styles.bookButtonText, { color: colors.text }]} numberOfLines={1}>
            {currentBook}
          </Text>
          <Text style={[styles.chevron, { color: colors.secondaryText }]}>{'\u25BC'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.chapterButton, { backgroundColor: colors.surfaceAlt }]}
          onPress={() => setShowChapterSelector(true)}
        >
          <Text style={[styles.chapterButtonText, { color: colors.text }]}>
            Ch. {currentChapter}
          </Text>
          <Text style={[styles.chevron, { color: colors.secondaryText }]}>{'\u25BC'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.listenButton, { backgroundColor: isPlaying ? colors.tint : colors.surfaceAlt }]}
          onPress={toggleReading}
          disabled={loading || verses.length === 0}
        >
          <Text style={[styles.listenButtonText, { color: isPlaying ? '#fff' : colors.tint }]}>
            {isPlaying ? '\u23F8' : '\uD83D\uDD0A'}
          </Text>
        </TouchableOpacity>

        <StreakBadge />
      </View>

      {/* Chapter Content */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.tint} />
          <Text style={[styles.loadingText, { color: colors.secondaryText }]}>Loading...</Text>
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
          <TouchableOpacity
            style={[styles.retryBtn, { backgroundColor: colors.tint }]}
            onPress={loadChapter}
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          ref={scrollRef}
          style={styles.scrollView}
          contentContainerStyle={[styles.content, isPlaying && { paddingBottom: 120 }]}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.chapterTitle, { color: colors.tint }]}>
            {currentBook} {currentChapter}
          </Text>

          {verses.map(verse => (
            <VerseText
              key={verse.verse}
              verse={verse}
              fontSize={fontSize}
              isBookmarked={isVerseBookmarked(verse.verse)}
              highlight={getVerseHighlight(verse.verse)}
              note={getVerseNote(verse.verse)}
              redLetterEnabled={redLetterEnabled}
              onUpdate={loadAnnotations}
            />
          ))}

          {/* Chapter Navigation */}
          <View style={styles.chapterNav}>
            <TouchableOpacity
              style={[
                styles.navBtn,
                { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
              ]}
              onPress={goToPrevChapter}
              disabled={currentBook === 'Genesis' && currentChapter === 1}
            >
              <Text style={[styles.navBtnText, { color: colors.text }]}>{'\u2190'} Previous</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.navBtn,
                { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
              ]}
              onPress={goToNextChapter}
              disabled={currentBook === 'Revelation' && currentChapter === 22}
            >
              <Text style={[styles.navBtnText, { color: colors.text }]}>Next {'\u2192'}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {/* Audio Control Bar */}
      {isPlaying && (
        <View style={[styles.audioBar, { backgroundColor: colors.tint }]}>
          <TouchableOpacity onPress={toggleReading} style={styles.audioBarBtn}>
            <Text style={styles.audioBarIcon}>{isPlaying ? '\u23F8' : '\u25B6'}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={stopReading} style={styles.audioBarBtn}>
            <Text style={styles.audioBarIcon}>{'\u23F9'}</Text>
          </TouchableOpacity>

          <Text style={styles.audioBarText} numberOfLines={1}>
            {currentReadingVerse > 0
              ? `Verse ${currentReadingVerse} of ${verses.length}`
              : 'Starting...'}
          </Text>
        </View>
      )}

      <BookSelector
        visible={showBookSelector}
        onClose={() => setShowBookSelector(false)}
        onSelectBook={book => {
          setCurrentBook(book.name);
          setCurrentChapter(1);
        }}
        currentBook={currentBook}
      />

      <ChapterSelector
        visible={showChapterSelector}
        onClose={() => setShowChapterSelector(false)}
        bookName={currentBook}
        totalChapters={totalChapters}
        currentChapter={currentChapter}
        onSelectChapter={ch => setCurrentChapter(ch)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  navHeader: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
    borderBottomWidth: 1,
  },
  bookButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  bookButtonText: { fontSize: 16, fontWeight: '600', flex: 1 },
  chapterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  chapterButtonText: { fontSize: 16, fontWeight: '600' },
  chevron: { fontSize: 10 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  loadingText: { marginTop: 12, fontSize: 16 },
  errorText: { fontSize: 16, textAlign: 'center', marginBottom: 16 },
  retryBtn: { paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8 },
  retryText: { color: '#fff', fontWeight: '600' },
  scrollView: { flex: 1 },
  content: { paddingBottom: 60 },
  chapterTitle: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    paddingVertical: 20,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  chapterNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 30,
    gap: 16,
  },
  navBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  navBtnText: { fontSize: 15, fontWeight: '600' },
  listenButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  listenButtonText: {
    fontSize: 18,
  },
  audioBar: {
    position: 'absolute',
    bottom: 0,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    gap: 12,
  },
  audioBarBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioBarIcon: {
    fontSize: 16,
    color: '#fff',
  },
  audioBarText: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
