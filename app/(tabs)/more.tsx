import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { useThemeColors } from '../../lib/hooks';
import { useApp } from '../../lib/context';
import { READING_PLANS } from '../../lib/reading-plans';
import { getPlanProgress, markDayComplete, isDayComplete, getReadingHistory } from '../../lib/database';
import { ReadingPlan, ReadingProgress } from '../../lib/types';

type Section = 'menu' | 'plans' | 'plan-detail' | 'history' | 'settings';

export default function MoreScreen() {
  const colors = useThemeColors();
  const { fontSize, setFontSize, redLetterEnabled, setRedLetterEnabled, navigateTo } = useApp();
  const [section, setSection] = useState<Section>('menu');
  const [selectedPlan, setSelectedPlan] = useState<ReadingPlan | null>(null);
  const [progress, setProgress] = useState<ReadingProgress[]>([]);
  const [history, setHistory] = useState<{ book: string; chapter: number; read_at: string }[]>([]);

  const loadProgress = useCallback(async () => {
    if (selectedPlan) {
      const p = await getPlanProgress(selectedPlan.id);
      setProgress(p);
    }
  }, [selectedPlan]);

  const loadHistory = useCallback(async () => {
    const h = await getReadingHistory(50);
    setHistory(h);
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (section === 'plan-detail') loadProgress();
      if (section === 'history') loadHistory();
    }, [section, loadProgress, loadHistory])
  );

  useEffect(() => {
    if (selectedPlan) loadProgress();
  }, [selectedPlan, loadProgress]);

  const handleDayToggle = async (day: number) => {
    if (!selectedPlan) return;
    await markDayComplete(selectedPlan.id, day);
    loadProgress();
  };

  const completedDays = progress.filter(p => p.completed).length;

  if (section === 'plans') {
    return (
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => setSection('menu')}>
          <Text style={[styles.backText, { color: colors.tint }]}>{'\u2190'} Back</Text>
        </TouchableOpacity>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Reading Plans</Text>
        {READING_PLANS.map(plan => (
          <TouchableOpacity
            key={plan.id}
            style={[styles.planCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}
            onPress={() => { setSelectedPlan(plan); setSection('plan-detail'); }}
          >
            <Text style={[styles.planName, { color: colors.text }]}>{plan.name}</Text>
            <Text style={[styles.planDesc, { color: colors.secondaryText }]}>{plan.description}</Text>
            <Text style={[styles.planDays, { color: colors.tint }]}>{plan.days} days</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  }

  if (section === 'plan-detail' && selectedPlan) {
    return (
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => setSection('plans')}>
          <Text style={[styles.backText, { color: colors.tint }]}>{'\u2190'} Plans</Text>
        </TouchableOpacity>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>{selectedPlan.name}</Text>
        <Text style={[styles.planDesc, { color: colors.secondaryText, marginHorizontal: 20, marginBottom: 10 }]}>
          {selectedPlan.description}
        </Text>

        {/* Progress Bar */}
        <View style={[styles.progressContainer, { backgroundColor: colors.surfaceAlt }]}>
          <View style={styles.progressRow}>
            <Text style={[styles.progressText, { color: colors.text }]}>
              {completedDays} of {selectedPlan.days} days completed
            </Text>
            <Text style={[styles.progressPercent, { color: colors.tint }]}>
              {Math.round((completedDays / selectedPlan.days) * 100)}%
            </Text>
          </View>
          <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
            <View
              style={[
                styles.progressFill,
                { backgroundColor: colors.tint, width: `${(completedDays / selectedPlan.days) * 100}%` },
              ]}
            />
          </View>
        </View>

        {selectedPlan.readings.map(day => {
          const isComplete = progress.some(p => p.day === day.day && p.completed);
          return (
            <View
              key={day.day}
              style={[styles.dayItem, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}
            >
              <View style={styles.dayHeader}>
                <TouchableOpacity
                  style={[
                    styles.checkbox,
                    { borderColor: colors.tint },
                    isComplete && { backgroundColor: colors.tint },
                  ]}
                  onPress={() => handleDayToggle(day.day)}
                >
                  {isComplete && <Text style={styles.checkmark}>{'\u2713'}</Text>}
                </TouchableOpacity>
                <View style={styles.dayInfo}>
                  <Text style={[styles.dayLabel, { color: colors.text }]}>
                    Day {day.day}{day.title ? ` — ${day.title}` : ''}
                  </Text>
                  <Text style={[styles.dayPassages, { color: colors.secondaryText }]}>
                    {day.passages.map(p => `${p.book} ${p.chapter}`).join(', ')}
                  </Text>
                </View>
              </View>
              <View style={styles.dayLinks}>
                {day.passages.map((p, i) => (
                  <TouchableOpacity
                    key={i}
                    style={[styles.readLink, { backgroundColor: colors.surfaceAlt }]}
                    onPress={() => navigateTo(p.book, p.chapter)}
                  >
                    <Text style={[styles.readLinkText, { color: colors.tint }]}>
                      {p.book} {p.chapter}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          );
        })}
        <View style={{ height: 60 }} />
      </ScrollView>
    );
  }

  if (section === 'history') {
    return (
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => setSection('menu')}>
          <Text style={[styles.backText, { color: colors.tint }]}>{'\u2190'} Back</Text>
        </TouchableOpacity>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Reading History</Text>
        {history.length === 0 ? (
          <Text style={[styles.emptyText, { color: colors.secondaryText }]}>No reading history yet.</Text>
        ) : (
          history.map((h, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.historyItem, { borderBottomColor: colors.border }]}
              onPress={() => navigateTo(h.book, h.chapter)}
            >
              <Text style={[styles.historyRef, { color: colors.text }]}>{h.book} {h.chapter}</Text>
              <Text style={[styles.historyDate, { color: colors.secondaryText }]}>
                {new Date(h.read_at).toLocaleString()}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    );
  }

  if (section === 'settings') {
    return (
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => setSection('menu')}>
          <Text style={[styles.backText, { color: colors.tint }]}>{'\u2190'} Back</Text>
        </TouchableOpacity>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Settings</Text>

        <View style={[styles.settingItem, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
          <Text style={[styles.settingLabel, { color: colors.text }]}>Font Size</Text>
          <View style={styles.fontSizeRow}>
            <TouchableOpacity
              style={[styles.fontSizeBtn, { backgroundColor: colors.surfaceAlt }]}
              onPress={() => setFontSize(Math.max(14, fontSize - 2))}
            >
              <Text style={[styles.fontSizeBtnText, { color: colors.text }]}>A-</Text>
            </TouchableOpacity>
            <Text style={[styles.fontSizeValue, { color: colors.tint }]}>{fontSize}pt</Text>
            <TouchableOpacity
              style={[styles.fontSizeBtn, { backgroundColor: colors.surfaceAlt }]}
              onPress={() => setFontSize(Math.min(30, fontSize + 2))}
            >
              <Text style={[styles.fontSizeBtnText, { color: colors.text }]}>A+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.settingItem, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
          <Text style={[styles.settingLabel, { color: colors.text }]}>Preview</Text>
          <Text
            style={{
              fontSize,
              fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
              color: colors.text,
              lineHeight: fontSize * 1.7,
              marginTop: 10,
            }}
          >
            <Text style={{ color: colors.verseNumber, fontSize: fontSize * 0.75, fontWeight: '700' }}>1 </Text>
            In the beginning God created the heaven and the earth.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.settingItem, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}
          onPress={() => setRedLetterEnabled(!redLetterEnabled)}
        >
          <View style={styles.settingRow}>
            <View>
              <Text style={[styles.settingLabel, { color: colors.text }]}>Red Letter Edition</Text>
              <Text style={[styles.settingDesc, { color: colors.secondaryText }]}>
                Show Jesus's words in red
              </Text>
            </View>
            <View style={[
              styles.toggle,
              { backgroundColor: redLetterEnabled ? '#C41E3A' : colors.border },
            ]}>
              <View style={[
                styles.toggleDot,
                { transform: [{ translateX: redLetterEnabled ? 20 : 2 }] },
              ]} />
            </View>
          </View>
        </TouchableOpacity>

        <View style={[styles.settingItem, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
          <Text style={[styles.settingLabel, { color: colors.text }]}>Translation</Text>
          <Text style={[styles.settingValue, { color: colors.tint }]}>King James Version (KJV)</Text>
        </View>

        <View style={[styles.settingItem, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
          <Text style={[styles.settingLabel, { color: colors.text }]}>About</Text>
          <Text style={[styles.aboutText, { color: colors.secondaryText }]}>
            Holy Bible App{'\n'}
            King James Version{'\n'}
            Built with Expo{'\n\n'}
            {'\u201C'}All scripture is given by inspiration of God{'\u201D'}{'\n'}
            {'\u2014'} 2 Timothy 3:16
          </Text>
        </View>
      </ScrollView>
    );
  }

  // Main Menu
  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.menuContent}>
      <Text style={[styles.menuTitle, { color: colors.text }]}>More</Text>

      {/* Navigation links */}
      <TouchableOpacity
        style={[styles.menuItem, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}
        onPress={() => router.push('/(tabs)/search')}
      >
        <Text style={styles.menuIcon}>{'\u{1F50D}'}</Text>
        <View style={styles.menuInfo}>
          <Text style={[styles.menuLabel, { color: colors.text }]}>Search</Text>
          <Text style={[styles.menuDesc, { color: colors.secondaryText }]}>Search verses & passages</Text>
        </View>
        <Text style={[styles.menuArrow, { color: colors.secondaryText }]}>{'\u203A'}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.menuItem, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}
        onPress={() => router.push('/(tabs)/bookmarks')}
      >
        <Text style={styles.menuIcon}>{'\u{1F516}'}</Text>
        <View style={styles.menuInfo}>
          <Text style={[styles.menuLabel, { color: colors.text }]}>Saved</Text>
          <Text style={[styles.menuDesc, { color: colors.secondaryText }]}>Bookmarks, highlights & notes</Text>
        </View>
        <Text style={[styles.menuArrow, { color: colors.secondaryText }]}>{'\u203A'}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.menuItem, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}
        onPress={() => router.push('/(tabs)/prayers')}
      >
        <Text style={styles.menuIcon}>{'\u{1F64F}'}</Text>
        <View style={styles.menuInfo}>
          <Text style={[styles.menuLabel, { color: colors.text }]}>Prayer Journal</Text>
          <Text style={[styles.menuDesc, { color: colors.secondaryText }]}>Personal prayer requests & praise</Text>
        </View>
        <Text style={[styles.menuArrow, { color: colors.secondaryText }]}>{'\u203A'}</Text>
      </TouchableOpacity>

      {[
        { key: 'plans' as Section, icon: '\u{1F4D6}', label: 'Reading Plans', desc: 'Guided reading schedules' },
        { key: 'history' as Section, icon: '\u{1F551}', label: 'Reading History', desc: 'Recently read chapters' },
        { key: 'settings' as Section, icon: '\u2699', label: 'Settings', desc: 'Font size and preferences' },
      ].map(item => (
        <TouchableOpacity
          key={item.key}
          style={[styles.menuItem, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}
          onPress={() => setSection(item.key)}
        >
          <Text style={styles.menuIcon}>{item.icon}</Text>
          <View style={styles.menuInfo}>
            <Text style={[styles.menuLabel, { color: colors.text }]}>{item.label}</Text>
            <Text style={[styles.menuDesc, { color: colors.secondaryText }]}>{item.desc}</Text>
          </View>
          <Text style={[styles.menuArrow, { color: colors.secondaryText }]}>{'\u203A'}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backBtn: { paddingHorizontal: 20, paddingTop: 16 },
  backText: { fontSize: 16, fontWeight: '600' },
  sectionTitle: {
    fontSize: 28,
    fontWeight: '800',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  menuContent: { padding: 16 },
  menuTitle: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  menuIcon: { fontSize: 28, marginRight: 16 },
  menuInfo: { flex: 1 },
  menuLabel: { fontSize: 17, fontWeight: '600' },
  menuDesc: { fontSize: 13, marginTop: 2 },
  menuArrow: { fontSize: 24 },
  planCard: {
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
  },
  planName: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  planDesc: { fontSize: 14, marginBottom: 8 },
  planDays: { fontSize: 13, fontWeight: '700' },
  progressContainer: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressText: { fontSize: 14 },
  progressPercent: { fontSize: 14, fontWeight: '700' },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 3 },
  dayItem: {
    marginHorizontal: 20,
    marginBottom: 8,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkmark: { color: '#fff', fontSize: 14, fontWeight: '700' },
  dayInfo: { flex: 1 },
  dayLabel: { fontSize: 15, fontWeight: '600' },
  dayPassages: { fontSize: 13, marginTop: 2 },
  dayLinks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
    paddingLeft: 36,
  },
  readLink: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  readLinkText: { fontSize: 13, fontWeight: '600' },
  historyItem: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyRef: { fontSize: 16, fontWeight: '600' },
  historyDate: { fontSize: 13 },
  emptyText: {
    textAlign: 'center',
    padding: 40,
    fontSize: 16,
  },
  settingItem: {
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
  },
  settingLabel: { fontSize: 16, fontWeight: '700' },
  fontSizeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    gap: 20,
  },
  fontSizeBtn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fontSizeBtnText: { fontSize: 18, fontWeight: '700' },
  fontSizeValue: { fontSize: 18, fontWeight: '700' },
  settingValue: { fontSize: 14, marginTop: 6 },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingDesc: { fontSize: 13, marginTop: 2 },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
  },
  toggleDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  aboutText: { fontSize: 14, marginTop: 8, lineHeight: 22 },
});
