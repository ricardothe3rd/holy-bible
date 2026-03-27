import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useThemeColors } from '../../lib/hooks';
import { useApp } from '../../lib/context';
import { getBookmarks, getHighlights, getNotes, removeBookmark, removeHighlight, removeNote } from '../../lib/database';
import { Bookmark, Highlight, Note } from '../../lib/types';

type TabType = 'bookmarks' | 'highlights' | 'notes';

export default function BookmarksScreen() {
  const colors = useThemeColors();
  const { navigateTo } = useApp();
  const [activeTab, setActiveTab] = useState<TabType>('bookmarks');
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);

  const loadData = useCallback(async () => {
    const [bm, hl, nt] = await Promise.all([
      getBookmarks(),
      getHighlights(),
      getNotes(),
    ]);
    setBookmarks(bm);
    setHighlights(hl);
    setNotes(nt);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const tabs: { key: TabType; label: string; count: number }[] = [
    { key: 'bookmarks', label: 'Bookmarks', count: bookmarks.length },
    { key: 'highlights', label: 'Highlights', count: highlights.length },
    { key: 'notes', label: 'Notes', count: notes.length },
  ];

  const handleDelete = async (type: TabType, item: Bookmark | Highlight | Note) => {
    if (type === 'bookmarks') {
      await removeBookmark(item.book, item.chapter, item.verse);
    } else if (type === 'highlights') {
      await removeHighlight(item.book, item.chapter, item.verse);
    } else {
      await removeNote(item.book, item.chapter, item.verse);
    }
    loadData();
  };

  const renderEmpty = () => (
    <View style={styles.empty}>
      <Text style={[styles.emptyIcon]}>
        {activeTab === 'bookmarks' ? '\u{1F516}' : activeTab === 'highlights' ? '\u{1F308}' : '\u{1F4DD}'}
      </Text>
      <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
        No {activeTab} yet.{'\n'}Tap any verse while reading to add one.
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Tabs */}
      <View style={[styles.tabRow, { backgroundColor: colors.surfaceAlt }]}>
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && { backgroundColor: colors.tint }]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[styles.tabText, { color: activeTab === tab.key ? '#fff' : colors.text }]}>
              {tab.label}
            </Text>
            {tab.count > 0 && (
              <View style={[styles.badge, { backgroundColor: activeTab === tab.key ? 'rgba(255,255,255,0.3)' : colors.tint }]}>
                <Text style={[styles.badgeText, { color: activeTab === tab.key ? '#fff' : '#fff' }]}>
                  {tab.count}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {activeTab === 'bookmarks' && (
          bookmarks.length === 0 ? renderEmpty() : bookmarks.map(bm => (
            <TouchableOpacity
              key={bm.id}
              style={[styles.item, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}
              onPress={() => navigateTo(bm.book, bm.chapter)}
            >
              <View style={styles.itemHeader}>
                <Text style={[styles.itemRef, { color: colors.tint }]}>
                  {'\u{1F516}'} {bm.book} {bm.chapter}:{bm.verse}
                </Text>
                <TouchableOpacity onPress={() => handleDelete('bookmarks', bm)}>
                  <Text style={{ color: colors.error, fontSize: 14 }}>Remove</Text>
                </TouchableOpacity>
              </View>
              <Text style={[styles.itemDate, { color: colors.secondaryText }]}>
                {new Date(bm.created_at).toLocaleDateString()}
              </Text>
            </TouchableOpacity>
          ))
        )}

        {activeTab === 'highlights' && (
          highlights.length === 0 ? renderEmpty() : highlights.map(hl => (
            <TouchableOpacity
              key={hl.id}
              style={[styles.item, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}
              onPress={() => navigateTo(hl.book, hl.chapter)}
            >
              <View style={styles.itemHeader}>
                <View style={styles.highlightRef}>
                  <View style={[styles.colorIndicator, { backgroundColor: hl.color }]} />
                  <Text style={[styles.itemRef, { color: colors.tint }]}>
                    {hl.book} {hl.chapter}:{hl.verse}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => handleDelete('highlights', hl)}>
                  <Text style={{ color: colors.error, fontSize: 14 }}>Remove</Text>
                </TouchableOpacity>
              </View>
              <Text style={[styles.itemDate, { color: colors.secondaryText }]}>
                {new Date(hl.created_at).toLocaleDateString()}
              </Text>
            </TouchableOpacity>
          ))
        )}

        {activeTab === 'notes' && (
          notes.length === 0 ? renderEmpty() : notes.map(note => (
            <TouchableOpacity
              key={note.id}
              style={[styles.item, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}
              onPress={() => navigateTo(note.book, note.chapter)}
            >
              <View style={styles.itemHeader}>
                <Text style={[styles.itemRef, { color: colors.tint }]}>
                  {'\u{1F4DD}'} {note.book} {note.chapter}:{note.verse}
                </Text>
                <TouchableOpacity onPress={() => handleDelete('notes', note)}>
                  <Text style={{ color: colors.error, fontSize: 14 }}>Remove</Text>
                </TouchableOpacity>
              </View>
              <Text style={[styles.notePreview, { color: colors.text }]} numberOfLines={3}>
                {note.text}
              </Text>
              <Text style={[styles.itemDate, { color: colors.secondaryText }]}>
                {new Date(note.updated_at).toLocaleDateString()}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabRow: {
    flexDirection: 'row',
    margin: 16,
    borderRadius: 10,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  tabText: { fontSize: 13, fontWeight: '600' },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  badgeText: { fontSize: 11, fontWeight: '700' },
  list: { flex: 1 },
  listContent: { paddingHorizontal: 16, paddingBottom: 40 },
  item: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemRef: { fontSize: 15, fontWeight: '700' },
  highlightRef: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  colorIndicator: { width: 14, height: 14, borderRadius: 7 },
  notePreview: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  itemDate: { fontSize: 12, marginTop: 8 },
  empty: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyText: { fontSize: 15, textAlign: 'center', lineHeight: 22 },
});
