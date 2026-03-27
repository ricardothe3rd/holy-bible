import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Share,
  Dimensions,
} from 'react-native';
import { useThemeColors } from '../../lib/hooks';
import { getDailyVerse, isFavoriteVerse, toggleFavoriteVerse } from '../../lib/daily-verse';

const { width } = Dimensions.get('window');

export default function DailyScreen() {
  const colors = useThemeColors();
  const dailyVerse = getDailyVerse();
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    isFavoriteVerse(dailyVerse.ref).then(setIsFavorite);
  }, [dailyVerse.ref]);

  const handleFavorite = async () => {
    await toggleFavoriteVerse(dailyVerse.ref);
    setIsFavorite(!isFavorite);
  };

  const handleShare = async () => {
    const text = `"${dailyVerse.text}"\n\n— ${dailyVerse.ref} (KJV)`;
    try {
      if (Platform.OS === 'web') {
        if (navigator.share) {
          await navigator.share({ text });
        } else {
          await navigator.clipboard.writeText(text);
        }
      } else {
        await Share.share({ message: text });
      }
    } catch {}
  };

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.date, { color: colors.secondaryText }]}>{dateStr}</Text>

      <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
        <View style={[styles.decorLine, { backgroundColor: colors.tint }]} />

        <Text style={[styles.label, { color: colors.tint }]}>VERSE OF THE DAY</Text>

        <Text style={[styles.verseText, { color: colors.text }]}>
          {'\u201C'}{dailyVerse.text}{'\u201D'}
        </Text>

        <Text style={[styles.reference, { color: colors.tint }]}>
          — {dailyVerse.ref}
        </Text>

        <View style={styles.actions}>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.surfaceAlt }]} onPress={handleFavorite}>
            <Text style={styles.actionIcon}>{isFavorite ? '\u2764\uFE0F' : '\u2661'}</Text>
            <Text style={[styles.actionLabel, { color: colors.text }]}>
              {isFavorite ? 'Saved' : 'Save'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.surfaceAlt }]} onPress={handleShare}>
            <Text style={styles.actionIcon}>{'\u{1F4E4}'}</Text>
            <Text style={[styles.actionLabel, { color: colors.text }]}>Share</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.reflectionCard, { backgroundColor: colors.surfaceAlt }]}>
        <Text style={[styles.reflectionTitle, { color: colors.text }]}>Reflect</Text>
        <Text style={[styles.reflectionText, { color: colors.secondaryText }]}>
          Take a moment to meditate on today's verse. What does it mean to you? How can you apply it in your life today?
        </Text>
      </View>

      <View style={[styles.crossLine, { borderColor: colors.border }]} />

      <Text style={[styles.kjvLabel, { color: colors.secondaryText }]}>
        King James Version
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    padding: 20,
    paddingBottom: 60,
    alignItems: 'center',
  },
  date: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 500,
    borderRadius: 16,
    borderWidth: 1,
    padding: 28,
    marginBottom: 20,
    alignItems: 'center',
  },
  decorLine: {
    width: 40,
    height: 3,
    borderRadius: 2,
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 20,
  },
  verseText: {
    fontSize: 22,
    lineHeight: 34,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontStyle: 'italic',
    marginBottom: 20,
  },
  reference: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 24,
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
  },
  actionIcon: { fontSize: 18 },
  actionLabel: { fontSize: 14, fontWeight: '600' },
  reflectionCard: {
    width: '100%',
    maxWidth: 500,
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
  },
  reflectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  reflectionText: {
    fontSize: 14,
    lineHeight: 22,
  },
  crossLine: {
    width: 1,
    height: 40,
    borderLeftWidth: 1,
    marginBottom: 10,
  },
  kjvLabel: {
    fontSize: 12,
    letterSpacing: 1,
  },
});
