import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { useThemeColors } from '../lib/hooks';

const { width, height } = Dimensions.get('window');

interface Props {
  onGetStarted: () => void;
}

export default function WelcomeScreen({ onGetStarted }: Props) {
  const colors = useThemeColors();

  return (
    <View style={[styles.container, { backgroundColor: '#1a0f0a' }]}>
      {/* Background glow */}
      <View style={styles.glowOuter} />
      <View style={styles.glowInner} />

      {/* Cross symbol */}
      <View style={styles.crossContainer}>
        <Text style={styles.cross}>{'\u271E'}</Text>
      </View>

      {/* Title */}
      <Text style={styles.title}>Holy Bible</Text>
      <Text style={styles.subtitle}>King James Version</Text>

      {/* Decorative line */}
      <View style={styles.decorRow}>
        <View style={styles.decorLine} />
        <Text style={styles.decorDot}>{'\u2726'}</Text>
        <View style={styles.decorLine} />
      </View>

      {/* Welcome verse */}
      <Text style={styles.welcomeVerse}>
        {'\u201C'}Thy word is a lamp unto my feet,{'\n'}and a light unto my path.{'\u201D'}
      </Text>
      <Text style={styles.welcomeRef}>{'\u2014'} Psalm 119:105</Text>

      {/* Features */}
      <View style={styles.features}>
        {[
          { icon: '\u{1F4D6}', text: 'Read the complete KJV Bible' },
          { icon: '\u{1F50D}', text: 'Search verses and passages' },
          { icon: '\u{1F525}', text: 'Track your reading streak' },
          { icon: '\u{1F64F}', text: 'Keep a prayer journal' },
        ].map((f, i) => (
          <View key={i} style={styles.featureRow}>
            <Text style={styles.featureIcon}>{f.icon}</Text>
            <Text style={styles.featureText}>{f.text}</Text>
          </View>
        ))}
      </View>

      {/* Get Started Button */}
      <TouchableOpacity style={styles.startBtn} onPress={onGetStarted} activeOpacity={0.8}>
        <Text style={styles.startBtnText}>Begin Reading</Text>
      </TouchableOpacity>

      <Text style={styles.footer}>
        {'\u201C'}In the beginning was the Word{'\u201D'} {'\u2014'} John 1:1
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  glowOuter: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: 'rgba(196, 149, 106, 0.08)',
    top: height * 0.1,
  },
  glowInner: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(196, 149, 106, 0.12)',
    top: height * 0.2,
  },
  crossContainer: {
    marginBottom: 20,
  },
  cross: {
    fontSize: 64,
    color: '#C4956A',
    textShadowColor: 'rgba(196, 149, 106, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  title: {
    fontSize: 42,
    fontWeight: '300',
    color: '#F5E6D0',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#C4956A',
    letterSpacing: 4,
    textTransform: 'uppercase',
    marginTop: 8,
    fontWeight: '600',
  },
  decorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 28,
    gap: 12,
  },
  decorLine: {
    width: 50,
    height: 1,
    backgroundColor: '#C4956A',
    opacity: 0.4,
  },
  decorDot: {
    color: '#C4956A',
    fontSize: 12,
    opacity: 0.6,
  },
  welcomeVerse: {
    fontSize: 18,
    color: '#E8D5B7',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 28,
  },
  welcomeRef: {
    fontSize: 13,
    color: '#C4956A',
    marginTop: 10,
    fontWeight: '600',
  },
  features: {
    marginTop: 36,
    gap: 14,
    width: '100%',
    maxWidth: 300,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  featureIcon: {
    fontSize: 20,
    width: 30,
    textAlign: 'center',
  },
  featureText: {
    fontSize: 15,
    color: '#D4C5A9',
    flex: 1,
  },
  startBtn: {
    marginTop: 40,
    backgroundColor: '#8B4513',
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 14,
    shadowColor: '#8B4513',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  startBtnText: {
    color: '#F5E6D0',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    fontSize: 12,
    color: 'rgba(196, 149, 106, 0.5)',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontStyle: 'italic',
  },
});
