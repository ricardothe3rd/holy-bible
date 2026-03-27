import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Platform,
  Share,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useThemeColors } from '../lib/hooks';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = Math.min(SCREEN_WIDTH - 40, 400);
const CARD_HEIGHT = CARD_WIDTH * 1.2;

interface Props {
  visible: boolean;
  onClose: () => void;
  verseText: string;
  reference: string;
}

const CARD_THEMES = [
  {
    name: 'Sunrise',
    bg: ['#FF6B35', '#F7931E', '#FFD700'],
    textColor: '#fff',
    refColor: 'rgba(255,255,255,0.85)',
    gradient: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 50%, #FFD700 100%)',
  },
  {
    name: 'Ocean',
    bg: ['#0F2027', '#203A43', '#2C5364'],
    textColor: '#E0F7FA',
    refColor: 'rgba(224,247,250,0.75)',
    gradient: 'linear-gradient(135deg, #0F2027 0%, #203A43 50%, #2C5364 100%)',
  },
  {
    name: 'Forest',
    bg: ['#134E5E', '#2E8B57', '#3CB371'],
    textColor: '#F0FFF0',
    refColor: 'rgba(240,255,240,0.8)',
    gradient: 'linear-gradient(135deg, #134E5E 0%, #2E8B57 50%, #3CB371 100%)',
  },
  {
    name: 'Royal',
    bg: ['#2C003E', '#512DA8', '#7C4DFF'],
    textColor: '#EDE7F6',
    refColor: 'rgba(237,231,246,0.8)',
    gradient: 'linear-gradient(135deg, #2C003E 0%, #512DA8 50%, #7C4DFF 100%)',
  },
  {
    name: 'Parchment',
    bg: ['#F5E6D0', '#E8D5B7', '#D4C5A9'],
    textColor: '#3E2723',
    refColor: '#5D4037',
    gradient: 'linear-gradient(135deg, #F5E6D0 0%, #E8D5B7 50%, #D4C5A9 100%)',
  },
  {
    name: 'Night',
    bg: ['#0D1B2A', '#1B2838', '#2D3748'],
    textColor: '#F7FAFC',
    refColor: 'rgba(247,250,252,0.7)',
    gradient: 'linear-gradient(135deg, #0D1B2A 0%, #1B2838 50%, #2D3748 100%)',
  },
];

export default function VerseCard({ visible, onClose, verseText, reference }: Props) {
  const colors = useThemeColors();
  const [selectedTheme, setSelectedTheme] = useState(0);
  const theme = CARD_THEMES[selectedTheme];

  const handleShare = async () => {
    const text = `"${verseText}"\n\n\u2014 ${reference} (KJV)`;
    try {
      if (Platform.OS === 'web') {
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(text);
        }
      } else {
        await Share.share({ message: text });
      }
    } catch {}
  };

  const fontSize = verseText.length > 200 ? 16 : verseText.length > 100 ? 18 : 22;

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: colors.surface }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Verse Card</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={[styles.closeText, { color: colors.tint }]}>Done</Text>
            </TouchableOpacity>
          </View>

          {/* Card Preview */}
          <View style={styles.cardContainer}>
            <View
              style={[
                styles.card,
                { backgroundColor: theme.bg[1] },
              ]}
            >
              {/* Decorative cross watermark */}
              <Text style={[styles.watermark, { color: theme.textColor }]}>{'\u271E'}</Text>

              <View style={styles.cardContent}>
                <View style={[styles.decorBar, { backgroundColor: theme.textColor + '40' }]} />
                <Text
                  style={[
                    styles.cardVerse,
                    { color: theme.textColor, fontSize },
                  ]}
                >
                  {'\u201C'}{verseText}{'\u201D'}
                </Text>
                <Text style={[styles.cardRef, { color: theme.refColor }]}>
                  {'\u2014'} {reference}
                </Text>
                <Text style={[styles.cardKjv, { color: theme.refColor }]}>
                  King James Version
                </Text>
              </View>
            </View>
          </View>

          {/* Theme Picker */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.themePicker}
            contentContainerStyle={styles.themePickerContent}
          >
            {CARD_THEMES.map((t, i) => (
              <TouchableOpacity
                key={i}
                style={[
                  styles.themeOption,
                  { backgroundColor: t.bg[1] },
                  selectedTheme === i && styles.themeOptionSelected,
                ]}
                onPress={() => setSelectedTheme(i)}
              >
                <Text style={[styles.themeName, { color: t.textColor }]}>{t.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.shareBtn, { backgroundColor: colors.tint }]}
              onPress={handleShare}
            >
              <Text style={styles.shareBtnText}>
                {Platform.OS === 'web' ? 'Copy Text' : 'Share'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    width: '100%',
    maxWidth: 440,
    borderRadius: 20,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: { fontSize: 18, fontWeight: '700' },
  closeText: { fontSize: 16, fontWeight: '600' },
  cardContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    width: CARD_WIDTH,
    minHeight: CARD_HEIGHT,
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  watermark: {
    position: 'absolute',
    fontSize: 200,
    opacity: 0.05,
    top: -20,
    right: -30,
  },
  cardContent: {
    padding: 32,
    alignItems: 'center',
    zIndex: 1,
  },
  decorBar: {
    width: 40,
    height: 3,
    borderRadius: 2,
    marginBottom: 24,
  },
  cardVerse: {
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontStyle: 'italic',
    lineHeight: 30,
    marginBottom: 20,
  },
  cardRef: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  cardKjv: {
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  themePicker: {
    marginTop: 16,
  },
  themePickerContent: {
    paddingHorizontal: 20,
    gap: 10,
  },
  themeOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    minWidth: 70,
    alignItems: 'center',
  },
  themeOptionSelected: {
    borderWidth: 2,
    borderColor: '#fff',
  },
  themeName: {
    fontSize: 12,
    fontWeight: '600',
  },
  actions: {
    padding: 20,
    alignItems: 'center',
  },
  shareBtn: {
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  shareBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
