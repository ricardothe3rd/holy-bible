import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { Verse, Highlight, Note, HighlightColor, HIGHLIGHT_COLORS } from '../lib/types';
import { useThemeColors } from '../lib/hooks';
import { isRedLetter } from '../lib/red-letter';
import {
  addBookmark,
  removeBookmark,
  addHighlight,
  removeHighlight,
  addNote,
  removeNote,
} from '../lib/database';
import VerseCard from './VerseCard';
import VerseCamera from './VerseCamera';

interface Props {
  verse: Verse;
  fontSize: number;
  isBookmarked: boolean;
  highlight?: Highlight;
  note?: Note;
  redLetterEnabled?: boolean;
  onUpdate: () => void;
}

export default function VerseText({ verse, fontSize, isBookmarked, highlight, note, redLetterEnabled = true, onUpdate }: Props) {
  const colors = useThemeColors();
  const [showActions, setShowActions] = useState(false);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [noteText, setNoteText] = useState(note?.text || '');
  const [showColors, setShowColors] = useState(false);
  const [showVerseCard, setShowVerseCard] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  const handleBookmark = async () => {
    if (isBookmarked) {
      await removeBookmark(verse.book, verse.chapter, verse.verse);
    } else {
      await addBookmark(verse.book, verse.chapter, verse.verse);
    }
    onUpdate();
  };

  const handleHighlight = async (color: HighlightColor) => {
    if (highlight?.color === color) {
      await removeHighlight(verse.book, verse.chapter, verse.verse);
    } else {
      await addHighlight(verse.book, verse.chapter, verse.verse, color);
    }
    setShowColors(false);
    onUpdate();
  };

  const handleSaveNote = async () => {
    if (noteText.trim()) {
      await addNote(verse.book, verse.chapter, verse.verse, noteText.trim());
    } else {
      await removeNote(verse.book, verse.chapter, verse.verse);
    }
    setShowNoteInput(false);
    onUpdate();
  };

  const bgColor = highlight ? highlight.color + '33' : 'transparent';
  const isRed = redLetterEnabled && isRedLetter(verse.book, verse.chapter, verse.verse);
  const textColor = isRed ? '#C41E3A' : colors.text;

  return (
    <View>
      <TouchableOpacity
        style={[styles.verseContainer, { backgroundColor: bgColor }]}
        onPress={() => setShowActions(!showActions)}
        activeOpacity={0.7}
      >
        <Text style={[styles.verseText, { fontSize, color: textColor, lineHeight: fontSize * 1.7 }]}>
          <Text style={[styles.verseNumber, { color: colors.verseNumber, fontSize: fontSize * 0.75 }]}>
            {verse.verse}{' '}
          </Text>
          {verse.text}{' '}
          {isBookmarked && <Text style={styles.bookmarkIcon}>{'\u{1F516}'}</Text>}
        </Text>
      </TouchableOpacity>

      {note && !showNoteInput && (
        <TouchableOpacity
          style={[styles.noteDisplay, { backgroundColor: colors.surfaceAlt, borderLeftColor: colors.tint }]}
          onPress={() => {
            setNoteText(note.text);
            setShowNoteInput(true);
          }}
        >
          <Text style={[styles.noteLabel, { color: colors.tint }]}>Note:</Text>
          <Text style={[styles.noteText, { color: colors.secondaryText }]}>{note.text}</Text>
        </TouchableOpacity>
      )}

      {showActions && (
        <View style={[styles.actions, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <TouchableOpacity style={styles.actionBtn} onPress={handleBookmark}>
            <Text style={styles.actionIcon}>{isBookmarked ? '\u{1F516}' : '\u{1F517}'}</Text>
            <Text style={[styles.actionLabel, { color: colors.text }]}>
              {isBookmarked ? 'Unbookmark' : 'Bookmark'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} onPress={() => setShowColors(!showColors)}>
            <Text style={styles.actionIcon}>{'\u{1F308}'}</Text>
            <Text style={[styles.actionLabel, { color: colors.text }]}>Highlight</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => {
              setNoteText(note?.text || '');
              setShowNoteInput(!showNoteInput);
              setShowActions(false);
            }}
          >
            <Text style={styles.actionIcon}>{'\u{1F4DD}'}</Text>
            <Text style={[styles.actionLabel, { color: colors.text }]}>Note</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => {
              setShowVerseCard(true);
              setShowActions(false);
            }}
          >
            <Text style={styles.actionIcon}>{'\u{1F5BC}'}</Text>
            <Text style={[styles.actionLabel, { color: colors.text }]}>Card</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => {
              setShowCamera(true);
              setShowActions(false);
            }}
          >
            <Text style={styles.actionIcon}>{'\u{1F4F7}'}</Text>
            <Text style={[styles.actionLabel, { color: colors.text }]}>Photo</Text>
          </TouchableOpacity>
        </View>
      )}

      {showColors && (
        <View style={[styles.colorRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {HIGHLIGHT_COLORS.map(({ color, name }) => (
            <TouchableOpacity
              key={color}
              style={[
                styles.colorDot,
                { backgroundColor: color },
                highlight?.color === color && styles.colorDotSelected,
              ]}
              onPress={() => handleHighlight(color)}
            />
          ))}
          {highlight && (
            <TouchableOpacity
              style={[styles.removeHighlight, { borderColor: colors.border }]}
              onPress={async () => {
                await removeHighlight(verse.book, verse.chapter, verse.verse);
                setShowColors(false);
                onUpdate();
              }}
            >
              <Text style={{ color: colors.error, fontSize: 12 }}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {showNoteInput && (
        <View style={[styles.noteInput, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <TextInput
            style={[styles.noteTextInput, { color: colors.text, borderColor: colors.border }]}
            value={noteText}
            onChangeText={setNoteText}
            placeholder="Write a note..."
            placeholderTextColor={colors.secondaryText}
            multiline
            autoFocus
          />
          <View style={styles.noteButtons}>
            <TouchableOpacity
              style={[styles.noteBtn, { backgroundColor: colors.surfaceAlt }]}
              onPress={() => setShowNoteInput(false)}
            >
              <Text style={{ color: colors.text }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.noteBtn, { backgroundColor: colors.tint }]}
              onPress={handleSaveNote}
            >
              <Text style={{ color: '#fff' }}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <VerseCard
        visible={showVerseCard}
        onClose={() => setShowVerseCard(false)}
        verseText={verse.text}
        reference={`${verse.book} ${verse.chapter}:${verse.verse}`}
      />

      <VerseCamera
        visible={showCamera}
        onClose={() => setShowCamera(false)}
        verseText={verse.text}
        reference={`${verse.book} ${verse.chapter}:${verse.verse}`}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  verseContainer: {
    paddingHorizontal: 20,
    paddingVertical: 2,
    borderRadius: 4,
  },
  verseText: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  verseNumber: {
    fontWeight: '700',
  },
  bookmarkIcon: { fontSize: 12 },
  actions: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'space-around',
  },
  actionBtn: { alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4 },
  actionIcon: { fontSize: 20 },
  actionLabel: { fontSize: 11, marginTop: 4 },
  colorRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  colorDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  colorDotSelected: {
    borderWidth: 3,
    borderColor: '#333',
  },
  removeHighlight: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  noteDisplay: {
    marginHorizontal: 20,
    marginBottom: 8,
    padding: 10,
    borderRadius: 8,
    borderLeftWidth: 3,
  },
  noteLabel: { fontSize: 12, fontWeight: '700', marginBottom: 2 },
  noteText: { fontSize: 14 },
  noteInput: {
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  noteTextInput: {
    minHeight: 80,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
    textAlignVertical: 'top',
  },
  noteButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    gap: 10,
  },
  noteBtn: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
});
