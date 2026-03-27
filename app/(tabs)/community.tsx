import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Modal,
  Dimensions,
  Platform,
  Animated,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { useThemeColors } from '../../lib/hooks';
import { useAuth } from '../../lib/auth';
import {
  getCommunityPrayers,
  getSharedVerses,
  sharePrayer,
  getCommunityStats,
  GLOBE_POINTS,
  CommunityPrayer,
  SharedVerse,
  CommunityStats,
} from '../../lib/community';
import Globe3D from '../../components/Globe3D';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type Tab = 'globe' | 'prayers' | 'verses';

export default function CommunityScreen() {
  const colors = useThemeColors();
  const { user, signOut } = useAuth();
  const [tab, setTab] = useState<Tab>('globe');
  const [prayers, setPrayers] = useState<CommunityPrayer[]>([]);
  const [verses, setVerses] = useState<SharedVerse[]>([]);
  const [stats, setStats] = useState<CommunityStats>(getCommunityStats());
  const [showSharePrayer, setShowSharePrayer] = useState(false);
  const [prayerText, setPrayerText] = useState('');
  const [prayerVerse, setPrayerVerse] = useState('');
  const [showProfile, setShowProfile] = useState(false);

  const loadData = useCallback(async () => {
    const [p, v] = await Promise.all([getCommunityPrayers(), getSharedVerses()]);
    setPrayers(p);
    setVerses(v);
    setStats(getCommunityStats());
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleSharePrayer = async () => {
    if (!prayerText.trim() || !user) return;
    await sharePrayer(user.id, user.name, prayerText.trim(), prayerVerse.trim() || undefined);
    setPrayerText('');
    setPrayerVerse('');
    setShowSharePrayer(false);
    loadData();
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: 'globe', label: 'Globe' },
    { key: 'prayers', label: 'Prayer Wall' },
    { key: 'verses', label: 'Shared Verses' },
  ];

  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.authPrompt}>
          <Text style={styles.authIcon}>{'\u{1F30D}'}</Text>
          <Text style={[styles.authTitle, { color: colors.text }]}>Join the Community</Text>
          <Text style={[styles.authDesc, { color: colors.secondaryText }]}>
            Sign in to connect with believers worldwide, share prayer requests, and encourage one another.
          </Text>
          <TouchableOpacity
            style={[styles.authBtn, { backgroundColor: colors.tint }]}
            onPress={() => router.push('/auth' as any)}
          >
            <Text style={styles.authBtnText}>Sign In / Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Profile bar */}
      <View style={[styles.profileBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.profileBtn} onPress={() => setShowProfile(true)}>
          <View style={[styles.avatar, { backgroundColor: colors.tint }]}>
            <Text style={styles.avatarText}>{user.name.charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={[styles.profileName, { color: colors.text }]} numberOfLines={1}>{user.name}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.shareButton, { backgroundColor: colors.tint }]}
          onPress={() => setShowSharePrayer(true)}
        >
          <Text style={styles.shareButtonText}>+ Share Prayer</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={[styles.tabRow, { backgroundColor: colors.surfaceAlt }]}>
        {tabs.map(t => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tab, tab === t.key && { backgroundColor: colors.tint }]}
            onPress={() => setTab(t.key)}
          >
            <Text style={[styles.tabText, { color: tab === t.key ? '#fff' : colors.text }]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {tab === 'globe' && (
          <>
            <Globe3D points={GLOBE_POINTS} activeCount={stats.activePrayers} />

            {/* Stats */}
            <View style={styles.statsGrid}>
              {[
                { value: stats.totalMembers.toLocaleString(), label: 'Members', icon: '\u{1F465}' },
                { value: stats.activePrayers.toString(), label: 'Active Prayers', icon: '\u{1F64F}' },
                { value: stats.versesSharedToday.toString(), label: 'Verses Shared', icon: '\u{1F4D6}' },
                { value: stats.chaptersReadToday.toLocaleString(), label: 'Chapters Read', icon: '\u{1F525}' },
              ].map((stat, i) => (
                <View
                  key={i}
                  style={[styles.statCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}
                >
                  <Text style={styles.statIcon}>{stat.icon}</Text>
                  <Text style={[styles.statValue, { color: colors.text }]}>{stat.value}</Text>
                  <Text style={[styles.statLabel, { color: colors.secondaryText }]}>{stat.label}</Text>
                </View>
              ))}
            </View>

            {/* Recent activity */}
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Prayers</Text>
            {prayers.slice(0, 3).map(prayer => (
              <View
                key={prayer.id}
                style={[styles.activityCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}
              >
                <View style={styles.activityHeader}>
                  <View style={[styles.smallAvatar, { backgroundColor: colors.tint }]}>
                    <Text style={styles.smallAvatarText}>{prayer.userName.charAt(0)}</Text>
                  </View>
                  <Text style={[styles.activityName, { color: colors.text }]}>{prayer.userName}</Text>
                  <Text style={[styles.activityTime, { color: colors.secondaryText }]}>{timeAgo(prayer.createdAt)}</Text>
                </View>
                <Text style={[styles.activityText, { color: colors.text }]}>{prayer.text}</Text>
                {prayer.verseRef && (
                  <Text style={[styles.activityRef, { color: colors.tint }]}>{'\u{1F4D6}'} {prayer.verseRef}</Text>
                )}
                <View style={styles.activityFooter}>
                  <Text style={[styles.prayerCount, { color: colors.secondaryText }]}>
                    {'\u{1F64F}'} {prayer.prayerCount} praying
                  </Text>
                </View>
              </View>
            ))}
          </>
        )}

        {tab === 'prayers' && (
          <>
            {prayers.map(prayer => (
              <View
                key={prayer.id}
                style={[styles.prayerCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}
              >
                <View style={styles.activityHeader}>
                  <View style={[styles.smallAvatar, { backgroundColor: colors.tint }]}>
                    <Text style={styles.smallAvatarText}>{prayer.userName.charAt(0)}</Text>
                  </View>
                  <View style={styles.activityHeaderInfo}>
                    <Text style={[styles.activityName, { color: colors.text }]}>{prayer.userName}</Text>
                    <Text style={[styles.activityTime, { color: colors.secondaryText }]}>{timeAgo(prayer.createdAt)}</Text>
                  </View>
                </View>
                <Text style={[styles.prayerText, { color: colors.text }]}>{prayer.text}</Text>
                {prayer.verseRef && (
                  <Text style={[styles.activityRef, { color: colors.tint }]}>{'\u{1F4D6}'} {prayer.verseRef}</Text>
                )}
                <TouchableOpacity style={[styles.prayButton, { backgroundColor: colors.surfaceAlt }]}>
                  <Text style={[styles.prayButtonText, { color: colors.tint }]}>
                    {'\u{1F64F}'} Pray ({prayer.prayerCount})
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </>
        )}

        {tab === 'verses' && (
          <>
            {verses.map(verse => (
              <View
                key={verse.id}
                style={[styles.verseCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}
              >
                <View style={styles.activityHeader}>
                  <View style={[styles.smallAvatar, { backgroundColor: colors.tint }]}>
                    <Text style={styles.smallAvatarText}>{verse.userName.charAt(0)}</Text>
                  </View>
                  <View style={styles.activityHeaderInfo}>
                    <Text style={[styles.activityName, { color: colors.text }]}>{verse.userName}</Text>
                    <Text style={[styles.activityTime, { color: colors.secondaryText }]}>{timeAgo(verse.createdAt)}</Text>
                  </View>
                </View>
                <View style={[styles.verseQuote, { borderLeftColor: colors.tint }]}>
                  <Text style={[styles.verseQuoteText, { color: colors.text }]}>
                    {'\u201C'}{verse.text}{'\u201D'}
                  </Text>
                  <Text style={[styles.verseQuoteRef, { color: colors.tint }]}>
                    {'\u2014'} {verse.book} {verse.chapter}:{verse.verse}
                  </Text>
                </View>
                {verse.reflection && (
                  <Text style={[styles.reflectionText, { color: colors.secondaryText }]}>
                    {verse.reflection}
                  </Text>
                )}
                <View style={styles.verseActions}>
                  <TouchableOpacity style={[styles.likeBtn, { backgroundColor: colors.surfaceAlt }]}>
                    <Text style={[styles.likeBtnText, { color: colors.tint }]}>
                      {'\u2764\uFE0F'} {verse.likeCount}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>

      {/* Share Prayer Modal */}
      <Modal visible={showSharePrayer} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={() => setShowSharePrayer(false)}>
              <Text style={[styles.modalCancel, { color: colors.secondaryText }]}>Cancel</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Share a Prayer</Text>
            <TouchableOpacity onPress={handleSharePrayer} disabled={!prayerText.trim()}>
              <Text style={[styles.modalDone, { color: colors.tint, opacity: prayerText.trim() ? 1 : 0.4 }]}>Share</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            <Text style={[styles.modalLabel, { color: colors.tint }]}>Your Prayer</Text>
            <TextInput
              style={[styles.modalInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceAlt }]}
              value={prayerText}
              onChangeText={setPrayerText}
              placeholder="Share what's on your heart..."
              placeholderTextColor={colors.secondaryText}
              multiline
              autoFocus
            />

            <Text style={[styles.modalLabel, { color: colors.tint }]}>Related Verse (optional)</Text>
            <TextInput
              style={[styles.modalSmallInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceAlt }]}
              value={prayerVerse}
              onChangeText={setPrayerVerse}
              placeholder="e.g., Philippians 4:6"
              placeholderTextColor={colors.secondaryText}
            />

            <View style={[styles.privacyNote, { backgroundColor: colors.surfaceAlt }]}>
              <Text style={[styles.privacyText, { color: colors.secondaryText }]}>
                {'\u{1F512}'} Your prayer will be shared anonymously with first name only. The community can join in prayer with you.
              </Text>
            </View>
          </View>
        </View>
      </Modal>

      {/* Profile Modal */}
      <Modal visible={showProfile} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={() => setShowProfile(false)}>
              <Text style={[styles.modalCancel, { color: colors.secondaryText }]}>Close</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Profile</Text>
            <View style={{ width: 50 }} />
          </View>

          <View style={styles.profileContent}>
            <View style={[styles.largeAvatar, { backgroundColor: colors.tint }]}>
              <Text style={styles.largeAvatarText}>{user.name.charAt(0).toUpperCase()}</Text>
            </View>
            <Text style={[styles.profileNameLarge, { color: colors.text }]}>{user.name}</Text>
            <Text style={[styles.profileEmail, { color: colors.secondaryText }]}>{user.email}</Text>
            <Text style={[styles.profileJoined, { color: colors.secondaryText }]}>
              Joined {new Date(user.joinedAt).toLocaleDateString()}
            </Text>

            <TouchableOpacity
              style={[styles.signOutBtn, { borderColor: colors.error }]}
              onPress={async () => {
                await signOut();
                setShowProfile(false);
              }}
            >
              <Text style={[styles.signOutText, { color: colors.error }]}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  authPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  authIcon: { fontSize: 64, marginBottom: 20 },
  authTitle: { fontSize: 24, fontWeight: '700', marginBottom: 10 },
  authDesc: { fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  authBtn: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 14,
  },
  authBtnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  profileBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  profileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  profileName: { fontSize: 15, fontWeight: '600', flex: 1 },
  shareButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  shareButtonText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  tabRow: {
    flexDirection: 'row',
    margin: 16,
    marginBottom: 0,
    borderRadius: 10,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabText: { fontSize: 13, fontWeight: '600' },
  scrollView: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    minWidth: (SCREEN_WIDTH - 58) / 2,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
  },
  statIcon: { fontSize: 24, marginBottom: 6 },
  statValue: { fontSize: 22, fontWeight: '800' },
  statLabel: { fontSize: 11, marginTop: 4 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    marginTop: 8,
  },
  activityCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  activityHeaderInfo: { flex: 1 },
  smallAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallAvatarText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  activityName: { fontSize: 14, fontWeight: '700', flex: 1 },
  activityTime: { fontSize: 12 },
  activityText: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  activityRef: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 8,
  },
  activityFooter: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  prayerCount: { fontSize: 13 },
  prayerCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
  },
  prayerText: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    marginBottom: 8,
  },
  prayButton: {
    marginTop: 10,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  prayButtonText: { fontSize: 14, fontWeight: '700' },
  verseCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
  },
  verseQuote: {
    borderLeftWidth: 3,
    paddingLeft: 14,
    marginBottom: 10,
  },
  verseQuoteText: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontStyle: 'italic',
  },
  verseQuoteRef: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 8,
  },
  reflectionText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
  },
  verseActions: {
    flexDirection: 'row',
    gap: 10,
  },
  likeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  likeBtnText: { fontSize: 13, fontWeight: '600' },
  // Modal
  modalContainer: { flex: 1 },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  modalCancel: { fontSize: 16 },
  modalTitle: { fontSize: 17, fontWeight: '700' },
  modalDone: { fontSize: 16, fontWeight: '700' },
  modalBody: { padding: 20 },
  modalLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  modalInput: {
    minHeight: 120,
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    textAlignVertical: 'top',
    marginBottom: 20,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  modalSmallInput: {
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 16,
    marginBottom: 20,
  },
  privacyNote: {
    padding: 14,
    borderRadius: 10,
  },
  privacyText: { fontSize: 13, lineHeight: 18 },
  // Profile
  profileContent: {
    alignItems: 'center',
    padding: 40,
  },
  largeAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  largeAvatarText: { color: '#fff', fontSize: 32, fontWeight: '700' },
  profileNameLarge: { fontSize: 24, fontWeight: '700', marginBottom: 4 },
  profileEmail: { fontSize: 15, marginBottom: 4 },
  profileJoined: { fontSize: 13, marginBottom: 30 },
  signOutBtn: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  signOutText: { fontSize: 15, fontWeight: '700' },
});
