import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  Dimensions,
} from 'react-native';
import { useThemeColors } from '../lib/hooks';

interface Props {
  visible: boolean;
  onClose: () => void;
  bookName: string;
  totalChapters: number;
  currentChapter: number;
  onSelectChapter: (chapter: number) => void;
}

export default function ChapterSelector({
  visible,
  onClose,
  bookName,
  totalChapters,
  currentChapter,
  onSelectChapter,
}: Props) {
  const colors = useThemeColors();
  const chapters = Array.from({ length: totalChapters }, (_, i) => i + 1);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={[styles.closeText, { color: colors.tint }]}>Close</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>{bookName}</Text>
          <View style={styles.closeBtn} />
        </View>

        <ScrollView contentContainerStyle={styles.grid}>
          {chapters.map(ch => (
            <TouchableOpacity
              key={ch}
              style={[
                styles.chapterItem,
                { backgroundColor: colors.cardBg, borderColor: colors.cardBorder },
                currentChapter === ch && { backgroundColor: colors.tint, borderColor: colors.tint },
              ]}
              onPress={() => {
                onSelectChapter(ch);
                onClose();
              }}
            >
              <Text
                style={[
                  styles.chapterNum,
                  { color: currentChapter === ch ? '#fff' : colors.text },
                ]}
              >
                {ch}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
}

const { width } = Dimensions.get('window');
const itemSize = (width - 80) / 6;

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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    paddingBottom: 40,
    justifyContent: 'flex-start',
  },
  chapterItem: {
    width: itemSize,
    height: itemSize,
    margin: 6,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chapterNum: { fontSize: 16, fontWeight: '600' },
});
