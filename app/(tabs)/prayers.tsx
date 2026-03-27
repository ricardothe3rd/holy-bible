import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useThemeColors } from '../../lib/hooks';
import { getPrayers, addPrayer, updatePrayer, markPrayerAnswered, deletePrayer } from '../../lib/database';
import { Prayer, PRAYER_CATEGORIES } from '../../lib/types';
import VoicePrayer from '../../components/VoicePrayer';

type FilterType = 'all' | 'active' | 'answered';

function getCategoryIcon(category: string): string {
  const found = PRAYER_CATEGORIES.find(c => c.key === category);
  return found ? found.icon : '\u{1F64F}';
}

function getCategoryLabel(category: string): string {
  const found = PRAYER_CATEGORIES.find(c => c.key === category);
  return found ? found.label : 'General';
}

export default function PrayersScreen() {
  const colors = useThemeColors();
  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showAnsweredModal, setShowAnsweredModal] = useState(false);
  const [selectedPrayer, setSelectedPrayer] = useState<Prayer | null>(null);

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formBody, setFormBody] = useState('');
  const [formCategory, setFormCategory] = useState('general');
  const [answeredNote, setAnsweredNote] = useState('');
  const [showVoicePrayer, setShowVoicePrayer] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const loadData = useCallback(async () => {
    const data = await getPrayers();
    setPrayers(data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const filteredPrayers = prayers.filter(p => {
    if (filter === 'active') return p.is_answered === 0;
    if (filter === 'answered') return p.is_answered === 1;
    return true;
  });

  const activePrayers = prayers.filter(p => p.is_answered === 0);
  const answeredPrayers = prayers.filter(p => p.is_answered === 1);

  const filters: { key: FilterType; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: prayers.length },
    { key: 'active', label: 'Active', count: activePrayers.length },
    { key: 'answered', label: 'Answered', count: answeredPrayers.length },
  ];

  const resetForm = () => {
    setFormTitle('');
    setFormBody('');
    setFormCategory('general');
    setIsEditing(false);
    setSelectedPrayer(null);
  };

  const handleAdd = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleSave = async () => {
    if (!formTitle.trim()) {
      Alert.alert('Required', 'Please enter a prayer title.');
      return;
    }
    if (isEditing && selectedPrayer) {
      await updatePrayer(selectedPrayer.id, formTitle.trim(), formBody.trim() || null, formCategory);
    } else {
      await addPrayer(formTitle.trim(), formBody.trim() || null, formCategory);
    }
    setShowAddModal(false);
    resetForm();
    loadData();
  };

  const handleTapPrayer = (prayer: Prayer) => {
    setSelectedPrayer(prayer);
    setShowViewModal(true);
  };

  const handleEdit = () => {
    if (!selectedPrayer) return;
    setShowViewModal(false);
    setFormTitle(selectedPrayer.title);
    setFormBody(selectedPrayer.body || '');
    setFormCategory(selectedPrayer.category);
    setIsEditing(true);
    setShowAddModal(true);
  };

  const handleMarkAnswered = () => {
    if (!selectedPrayer) return;
    setShowViewModal(false);
    setAnsweredNote('');
    setShowAnsweredModal(true);
  };

  const handleConfirmAnswered = async () => {
    if (!selectedPrayer) return;
    await markPrayerAnswered(selectedPrayer.id, answeredNote.trim() || null);
    setShowAnsweredModal(false);
    setSelectedPrayer(null);
    loadData();
  };

  const handleDelete = () => {
    if (!selectedPrayer) return;
    Alert.alert(
      'Delete Prayer',
      'Are you sure you want to delete this prayer?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deletePrayer(selectedPrayer.id);
            setShowViewModal(false);
            setSelectedPrayer(null);
            loadData();
          },
        },
      ]
    );
  };

  const renderEmpty = () => (
    <View style={styles.empty}>
      <Text style={styles.emptyIcon}>{'\u{1F64F}'}</Text>
      <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
        No prayers yet.{'\n'}Tap the + button to add your first prayer.
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Filter Tabs */}
      <View style={[styles.tabRow, { backgroundColor: colors.surfaceAlt }]}>
        {filters.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, filter === tab.key && { backgroundColor: colors.tint }]}
            onPress={() => setFilter(tab.key)}
          >
            <Text style={[styles.tabText, { color: filter === tab.key ? '#fff' : colors.text }]}>
              {tab.label}
            </Text>
            {tab.count > 0 && (
              <View style={[styles.badge, { backgroundColor: filter === tab.key ? 'rgba(255,255,255,0.3)' : colors.tint }]}>
                <Text style={[styles.badgeText, { color: '#fff' }]}>
                  {tab.count}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {filteredPrayers.length === 0
          ? renderEmpty()
          : filteredPrayers.map(prayer => (
              <TouchableOpacity
                key={prayer.id}
                style={[
                  styles.item,
                  {
                    backgroundColor: colors.cardBg,
                    borderColor: prayer.is_answered ? colors.success : colors.cardBorder,
                    borderLeftWidth: 4,
                    borderLeftColor: prayer.is_answered ? colors.success : colors.tint,
                  },
                ]}
                onPress={() => handleTapPrayer(prayer)}
              >
                <View style={styles.itemHeader}>
                  <View style={styles.titleRow}>
                    <Text style={styles.categoryIcon}>{getCategoryIcon(prayer.category)}</Text>
                    <Text
                      style={[
                        styles.itemTitle,
                        { color: colors.text },
                        prayer.is_answered ? { textDecorationLine: 'line-through' as const, opacity: 0.7 } : null,
                      ]}
                      numberOfLines={1}
                    >
                      {prayer.title}
                    </Text>
                  </View>
                  {prayer.is_answered === 1 && (
                    <View style={[styles.answeredBadge, { backgroundColor: colors.success + '20' }]}>
                      <Text style={[styles.answeredBadgeText, { color: colors.success }]}>
                        {'\u2714'} Answered
                      </Text>
                    </View>
                  )}
                </View>
                {prayer.body ? (
                  <Text
                    style={[styles.bodyPreview, { color: colors.secondaryText }]}
                    numberOfLines={2}
                  >
                    {prayer.body}
                  </Text>
                ) : null}
                <View style={styles.itemFooter}>
                  <Text style={[styles.categoryLabel, { color: colors.accent }]}>
                    {getCategoryLabel(prayer.category)}
                  </Text>
                  <Text style={[styles.itemDate, { color: colors.secondaryText }]}>
                    {new Date(prayer.created_at).toLocaleDateString()}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
      </ScrollView>

      {/* FABs */}
      <TouchableOpacity
        style={[styles.fab, styles.fabSecondary, { backgroundColor: colors.surfaceAlt, borderColor: colors.tint }]}
        onPress={() => setShowVoicePrayer(true)}
      >
        <Text style={styles.fabText}>{'\u{1F399}'}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.tint }]}
        onPress={handleAdd}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Voice Prayer */}
      <VoicePrayer
        visible={showVoicePrayer}
        onClose={() => setShowVoicePrayer(false)}
        onSave={async (text) => {
          await addPrayer('Voice Prayer', text, 'general');
          loadData();
        }}
      />

      {/* Add/Edit Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {isEditing ? 'Edit Prayer' : 'New Prayer'}
              </Text>
              <TouchableOpacity onPress={() => { setShowAddModal(false); resetForm(); }}>
                <Text style={{ color: colors.secondaryText, fontSize: 16 }}>Cancel</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.fieldLabel, { color: colors.secondaryText }]}>Title</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surfaceAlt, color: colors.text, borderColor: colors.border }]}
              value={formTitle}
              onChangeText={setFormTitle}
              placeholder="What are you praying for?"
              placeholderTextColor={colors.secondaryText}
            />

            <Text style={[styles.fieldLabel, { color: colors.secondaryText }]}>Details (optional)</Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                { backgroundColor: colors.surfaceAlt, color: colors.text, borderColor: colors.border },
              ]}
              value={formBody}
              onChangeText={setFormBody}
              placeholder="Add more details about your prayer..."
              placeholderTextColor={colors.secondaryText}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <Text style={[styles.fieldLabel, { color: colors.secondaryText }]}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryRow}>
              {PRAYER_CATEGORIES.map(cat => (
                <TouchableOpacity
                  key={cat.key}
                  style={[
                    styles.categoryChip,
                    {
                      backgroundColor: formCategory === cat.key ? colors.tint : colors.surfaceAlt,
                      borderColor: formCategory === cat.key ? colors.tint : colors.border,
                    },
                  ]}
                  onPress={() => setFormCategory(cat.key)}
                >
                  <Text style={styles.categoryChipIcon}>{cat.icon}</Text>
                  <Text
                    style={[
                      styles.categoryChipText,
                      { color: formCategory === cat.key ? '#fff' : colors.text },
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: colors.tint }]}
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>
                {isEditing ? 'Update Prayer' : 'Add Prayer'}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* View Prayer Modal */}
      <Modal visible={showViewModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Prayer Details</Text>
              <TouchableOpacity onPress={() => { setShowViewModal(false); setSelectedPrayer(null); }}>
                <Text style={{ color: colors.secondaryText, fontSize: 16 }}>Close</Text>
              </TouchableOpacity>
            </View>

            {selectedPrayer && (
              <ScrollView style={styles.viewContent}>
                <View style={styles.viewCategoryRow}>
                  <Text style={styles.viewCategoryIcon}>{getCategoryIcon(selectedPrayer.category)}</Text>
                  <Text style={[styles.viewCategoryLabel, { color: colors.accent }]}>
                    {getCategoryLabel(selectedPrayer.category)}
                  </Text>
                </View>

                <Text style={[styles.viewTitle, { color: colors.text }]}>
                  {selectedPrayer.title}
                </Text>

                {selectedPrayer.body ? (
                  <Text style={[styles.viewBody, { color: colors.text }]}>
                    {selectedPrayer.body}
                  </Text>
                ) : null}

                <Text style={[styles.viewDate, { color: colors.secondaryText }]}>
                  Created {new Date(selectedPrayer.created_at).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Text>

                {selectedPrayer.is_answered === 1 && (
                  <View style={[styles.answeredSection, { backgroundColor: colors.success + '15', borderColor: colors.success + '30' }]}>
                    <Text style={[styles.answeredSectionTitle, { color: colors.success }]}>
                      {'\u2714'} Prayer Answered
                    </Text>
                    {selectedPrayer.answered_note ? (
                      <Text style={[styles.answeredSectionNote, { color: colors.text }]}>
                        {selectedPrayer.answered_note}
                      </Text>
                    ) : null}
                  </View>
                )}

                <View style={styles.actionRow}>
                  {selectedPrayer.is_answered === 0 && (
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: colors.success + '15', borderColor: colors.success }]}
                      onPress={handleMarkAnswered}
                    >
                      <Text style={[styles.actionButtonText, { color: colors.success }]}>
                        {'\u2714'} Mark Answered
                      </Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.tint + '15', borderColor: colors.tint }]}
                    onPress={handleEdit}
                  >
                    <Text style={[styles.actionButtonText, { color: colors.tint }]}>
                      {'\u270F\uFE0F'} Edit
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.error + '15', borderColor: colors.error }]}
                    onPress={handleDelete}
                  >
                    <Text style={[styles.actionButtonText, { color: colors.error }]}>
                      {'\u{1F5D1}'} Delete
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Mark Answered Modal */}
      <Modal visible={showAnsweredModal} animationType="fade" transparent>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={[styles.answeredModalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text, marginBottom: 8 }]}>
              {'\u{1F389}'} Prayer Answered!
            </Text>
            <Text style={[styles.answeredPrompt, { color: colors.secondaryText }]}>
              How was this prayer answered? (optional)
            </Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                { backgroundColor: colors.surfaceAlt, color: colors.text, borderColor: colors.border },
              ]}
              value={answeredNote}
              onChangeText={setAnsweredNote}
              placeholder="Share how God answered this prayer..."
              placeholderTextColor={colors.secondaryText}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <View style={styles.answeredActions}>
              <TouchableOpacity
                style={[styles.answeredCancelBtn, { borderColor: colors.border }]}
                onPress={() => { setShowAnsweredModal(false); setSelectedPrayer(null); }}
              >
                <Text style={{ color: colors.secondaryText, fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.answeredConfirmBtn, { backgroundColor: colors.success }]}
                onPress={handleConfirmAnswered}
              >
                <Text style={{ color: '#fff', fontWeight: '700' }}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  listContent: { paddingHorizontal: 16, paddingBottom: 100 },
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  categoryIcon: { fontSize: 18 },
  itemTitle: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  answeredBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginLeft: 8,
  },
  answeredBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  bodyPreview: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
    marginLeft: 26,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginLeft: 26,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  itemDate: { fontSize: 12 },
  empty: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyText: { fontSize: 15, textAlign: 'center', lineHeight: 22 },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  fabSecondary: {
    bottom: 96,
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    right: 24,
  },
  fabText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '300',
    marginTop: -1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  categoryRow: {
    flexDirection: 'row',
    marginTop: 4,
    marginBottom: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
    gap: 4,
  },
  categoryChipIcon: { fontSize: 14 },
  categoryChipText: { fontSize: 13, fontWeight: '600' },
  saveButton: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  viewContent: {
    paddingBottom: 20,
  },
  viewCategoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  viewCategoryIcon: { fontSize: 24 },
  viewCategoryLabel: { fontSize: 14, fontWeight: '600' },
  viewTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 12,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  viewBody: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  viewDate: {
    fontSize: 13,
    marginBottom: 16,
  },
  answeredSection: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  answeredSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
  },
  answeredSectionNote: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },
  answeredModalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  answeredPrompt: {
    fontSize: 14,
    marginBottom: 12,
  },
  answeredActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  answeredCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  answeredConfirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
});
