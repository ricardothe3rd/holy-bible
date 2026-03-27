import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  Modal,
} from 'react-native';
import { useThemeColors } from '../../lib/hooks';
import { useApp } from '../../lib/context';
import SceneRenderer from '../../components/scenes/SceneRenderer';
import { ALL_SCENES } from '../../components/scenes/scenes';
import type { SceneConfig } from '../../components/scenes/SceneRenderer';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function SpacesScreen() {
  const colors = useThemeColors();
  const { currentBook, currentChapter } = useApp();
  const [activeScene, setActiveScene] = useState<typeof ALL_SCENES[0] | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [exploreMode, setExploreMode] = useState(false);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Sacred Spaces</Text>
          <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
            Immerse yourself in 3D environments for reading & meditation
          </Text>
        </View>

        {/* Scene Cards */}
        {ALL_SCENES.map((scene) => (
          <TouchableOpacity
            key={scene.id}
            style={[styles.sceneCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}
            onPress={() => setActiveScene(scene)}
            activeOpacity={0.8}
          >
            <View style={styles.scenePreview}>
              <View style={[styles.previewBg, { backgroundColor: `#${(scene.config.bgColor ?? 0x1a0f0a).toString(16).padStart(6, '0')}` }]}>
                <Text style={styles.previewIcon}>{scene.icon}</Text>
              </View>
            </View>
            <View style={styles.sceneInfo}>
              <Text style={[styles.sceneName, { color: colors.text }]}>{scene.name}</Text>
              <Text style={[styles.sceneDesc, { color: colors.secondaryText }]}>{scene.desc}</Text>
            </View>
            <Text style={[styles.enterArrow, { color: colors.tint }]}>{'\u203A'}</Text>
          </TouchableOpacity>
        ))}

        {/* Verse at bottom */}
        <View style={styles.bottomVerse}>
          <Text style={[styles.verseText, { color: colors.secondaryText }]}>
            {'\u201C'}The heavens declare the glory of God;{'\n'}
            and the firmament sheweth his handywork.{'\u201D'}
          </Text>
          <Text style={[styles.verseRef, { color: colors.tint }]}>{'\u2014'} Psalm 19:1</Text>
        </View>
      </ScrollView>

      {/* Scene Viewer Modal */}
      <Modal visible={activeScene !== null} animationType="slide">
        {activeScene && (
          <View style={[styles.viewerContainer, { backgroundColor: '#000' }]}>
            {/* Top bar */}
            <View style={[styles.viewerHeader, { backgroundColor: 'rgba(0,0,0,0.7)' }]}>
              <TouchableOpacity onPress={() => { setActiveScene(null); setFullscreen(false); setExploreMode(false); }}>
                <Text style={styles.viewerClose}>{'\u2190'} Back</Text>
              </TouchableOpacity>
              <Text style={styles.viewerTitle}>{activeScene.icon} {activeScene.name}</Text>
              <View style={styles.headerActions}>
                <TouchableOpacity
                  style={[styles.exploreToggle, exploreMode && styles.exploreToggleActive]}
                  onPress={() => setExploreMode(!exploreMode)}
                >
                  <Text style={styles.exploreToggleText}>
                    {exploreMode ? '\u{1F6B6} Exploring' : '\u{1F3AE} Explore'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setFullscreen(!fullscreen)}>
                  <Text style={styles.viewerExpand}>{fullscreen ? '\u2716' : '\u26F6'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 3D Scene */}
            <View style={styles.sceneContainer}>
              <SceneRenderer
                config={activeScene.config}
                width={SCREEN_WIDTH}
                height={fullscreen ? SCREEN_HEIGHT : SCREEN_HEIGHT * 0.55}
                explorable={exploreMode}
              />
            </View>

            {/* Reading overlay (below scene) */}
            {!fullscreen && (
              <ScrollView
                style={[styles.readingOverlay, { backgroundColor: colors.background }]}
                contentContainerStyle={styles.readingContent}
              >
                <View style={[styles.readingCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
                  <Text style={[styles.readingLabel, { color: colors.tint }]}>
                    READING IN {activeScene.name.toUpperCase()}
                  </Text>
                  <Text style={[styles.readingChapter, { color: colors.text }]}>
                    {currentBook} {currentChapter}
                  </Text>

                  <View style={[styles.decorLine, { backgroundColor: colors.tint }]} />

                  <Text style={[styles.readingVerse, { color: colors.text }]}>
                    {'\u201C'}In the beginning God created the heaven and the earth. And the earth was without form, and void; and darkness was upon the face of the deep. And the Spirit of God moved upon the face of the waters.{'\u201D'}
                  </Text>
                  <Text style={[styles.readingRef, { color: colors.tint }]}>
                    {'\u2014'} Genesis 1:1-2 (KJV)
                  </Text>
                </View>

                <View style={styles.moodRow}>
                  <Text style={[styles.moodLabel, { color: colors.secondaryText }]}>How does this space feel?</Text>
                  <View style={styles.moodOptions}>
                    {[
                      { emoji: '\u{1F64F}', label: 'Prayerful' },
                      { emoji: '\u{1F54A}', label: 'Peaceful' },
                      { emoji: '\u{1F525}', label: 'Inspired' },
                      { emoji: '\u{1F49B}', label: 'Grateful' },
                    ].map((mood, i) => (
                      <TouchableOpacity key={i} style={[styles.moodBtn, { backgroundColor: colors.surfaceAlt }]}>
                        <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                        <Text style={[styles.moodText, { color: colors.secondaryText }]}>{mood.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </ScrollView>
            )}
          </View>
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  header: { marginBottom: 20 },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  sceneCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  scenePreview: {
    marginRight: 14,
  },
  previewBg: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewIcon: {
    fontSize: 28,
  },
  sceneInfo: {
    flex: 1,
  },
  sceneName: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 3,
  },
  sceneDesc: {
    fontSize: 13,
  },
  enterArrow: {
    fontSize: 28,
    fontWeight: '300',
  },
  bottomVerse: {
    alignItems: 'center',
    marginTop: 20,
    paddingVertical: 20,
  },
  verseText: {
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 22,
  },
  verseRef: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 8,
  },
  // Viewer
  viewerContainer: {
    flex: 1,
  },
  viewerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 54 : 16,
    paddingBottom: 12,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  viewerClose: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  viewerTitle: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  exploreToggle: {
    backgroundColor: 'rgba(196, 149, 106, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(196, 149, 106, 0.3)',
  },
  exploreToggleActive: {
    backgroundColor: 'rgba(196, 149, 106, 0.5)',
    borderColor: '#C4956A',
  },
  exploreToggleText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  viewerExpand: {
    color: '#fff',
    fontSize: 20,
  },
  sceneContainer: {
    marginTop: Platform.OS === 'ios' ? 90 : 56,
  },
  readingOverlay: {
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -16,
  },
  readingContent: {
    padding: 20,
    paddingBottom: 40,
  },
  readingCard: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 20,
  },
  readingLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 6,
  },
  readingChapter: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  decorLine: {
    width: 40,
    height: 2,
    borderRadius: 1,
    marginBottom: 16,
  },
  readingVerse: {
    fontSize: 16,
    lineHeight: 26,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontStyle: 'italic',
  },
  readingRef: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 12,
  },
  moodRow: {
    alignItems: 'center',
  },
  moodLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  moodOptions: {
    flexDirection: 'row',
    gap: 10,
  },
  moodBtn: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  moodEmoji: { fontSize: 22 },
  moodText: { fontSize: 11, marginTop: 4 },
});
