import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  Dimensions,
} from 'react-native';
import { BIBLE_BOOKS, OT_BOOKS, NT_BOOKS } from '../lib/bible-data';
import { BibleBook } from '../lib/types';
import { useThemeColors } from '../lib/hooks';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelectBook: (book: BibleBook) => void;
  currentBook?: string;
}

export default function BookSelector({ visible, onClose, onSelectBook, currentBook }: Props) {
  const [testament, setTestament] = useState<'OT' | 'NT'>('OT');
  const colors = useThemeColors();
  const books = testament === 'OT' ? OT_BOOKS : NT_BOOKS;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={[styles.closeText, { color: colors.tint }]}>Close</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Select Book</Text>
          <View style={styles.closeBtn} />
        </View>

        <View style={[styles.tabRow, { backgroundColor: colors.surfaceAlt }]}>
          <TouchableOpacity
            style={[styles.tab, testament === 'OT' && { backgroundColor: colors.tint }]}
            onPress={() => setTestament('OT')}
          >
            <Text style={[styles.tabText, { color: testament === 'OT' ? '#fff' : colors.text }]}>
              Old Testament
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, testament === 'NT' && { backgroundColor: colors.tint }]}
            onPress={() => setTestament('NT')}
          >
            <Text style={[styles.tabText, { color: testament === 'NT' ? '#fff' : colors.text }]}>
              New Testament
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.list} contentContainerStyle={styles.grid}>
          {books.map(book => (
            <TouchableOpacity
              key={book.id}
              style={[
                styles.bookItem,
                { backgroundColor: colors.cardBg, borderColor: colors.cardBorder },
                currentBook === book.name && { backgroundColor: colors.tint, borderColor: colors.tint },
              ]}
              onPress={() => {
                onSelectBook(book);
                onClose();
              }}
            >
              <Text
                style={[
                  styles.bookName,
                  { color: currentBook === book.name ? '#fff' : colors.text },
                ]}
                numberOfLines={1}
              >
                {book.name}
              </Text>
              <Text
                style={[
                  styles.bookChapters,
                  { color: currentBook === book.name ? 'rgba(255,255,255,0.7)' : colors.secondaryText },
                ]}
              >
                {book.chapters} ch.
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
}

const { width } = Dimensions.get('window');
const itemWidth = (width - 48) / 3;

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  closeBtn: { width: 60 },
  closeText: { fontSize: 16, fontWeight: '600' },
  title: { fontSize: 18, fontWeight: '700' },
  tabRow: {
    flexDirection: 'row',
    margin: 16,
    borderRadius: 10,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabText: { fontSize: 14, fontWeight: '600' },
  list: { flex: 1, paddingHorizontal: 12 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingBottom: 40,
  },
  bookItem: {
    width: itemWidth,
    margin: 4,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  bookName: { fontSize: 13, fontWeight: '600', textAlign: 'center' },
  bookChapters: { fontSize: 11, marginTop: 4 },
});
