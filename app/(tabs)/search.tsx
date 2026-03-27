import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useThemeColors } from '../../lib/hooks';
import { useApp } from '../../lib/context';
import { searchBible } from '../../lib/api';
import { Verse } from '../../lib/types';

export default function SearchScreen() {
  const colors = useThemeColors();
  const { navigateTo } = useApp();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setSearched(true);
    try {
      const data = await searchBible(query.trim());
      setResults(data);
    } catch {
      setError('Search failed. Try a specific reference like "John 3:16" or "Psalm 23".');
    } finally {
      setLoading(false);
    }
  }, [query]);

  const highlightMatch = (text: string, searchQuery: string) => {
    if (!searchQuery.trim()) return text;
    const words = searchQuery.trim().split(/\s+/);
    const regex = new RegExp(`(${words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, i) =>
      regex.test(part) ? (
        <Text key={i} style={{ backgroundColor: colors.highlight, fontWeight: '700' }}>
          {part}
        </Text>
      ) : (
        part
      )
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.searchBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={[styles.inputContainer, { backgroundColor: colors.surfaceAlt }]}>
          <Text style={styles.searchIcon}>{'\u{1F50D}'}</Text>
          <TextInput
            style={[styles.input, { color: colors.text }]}
            value={query}
            onChangeText={setQuery}
            placeholder="Search verses (e.g., John 3:16, love)"
            placeholderTextColor={colors.secondaryText}
            returnKeyType="search"
            onSubmitEditing={handleSearch}
            autoCorrect={false}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => { setQuery(''); setResults([]); setSearched(false); }}>
              <Text style={[styles.clearBtn, { color: colors.secondaryText }]}>{'\u2715'}</Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[styles.searchBtn, { backgroundColor: colors.tint }]}
          onPress={handleSearch}
        >
          <Text style={styles.searchBtnText}>Search</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.tipContainer, { backgroundColor: colors.surfaceAlt }]}>
        <Text style={[styles.tipText, { color: colors.secondaryText }]}>
          Search by reference (John 3:16), passage (Romans 8:28-30), or keyword (faith, love)
        </Text>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.tint} />
          <Text style={[styles.loadingText, { color: colors.secondaryText }]}>Searching...</Text>
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
        </View>
      ) : (
        <ScrollView style={styles.results} contentContainerStyle={styles.resultsContent}>
          {searched && results.length === 0 ? (
            <View style={styles.centered}>
              <Text style={[styles.noResults, { color: colors.secondaryText }]}>
                No results found for "{query}"
              </Text>
            </View>
          ) : (
            <>
              {results.length > 0 && (
                <Text style={[styles.resultCount, { color: colors.secondaryText }]}>
                  {results.length} verse{results.length !== 1 ? 's' : ''} found
                </Text>
              )}
              {results.map((verse, index) => (
                <TouchableOpacity
                  key={`${verse.book}-${verse.chapter}-${verse.verse}-${index}`}
                  style={[styles.resultItem, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}
                  onPress={() => navigateTo(verse.book, verse.chapter)}
                >
                  <Text style={[styles.resultRef, { color: colors.tint }]}>
                    {verse.book} {verse.chapter}:{verse.verse}
                  </Text>
                  <Text style={[styles.resultText, { color: colors.text }]}>
                    {highlightMatch(verse.text, query)}
                  </Text>
                </TouchableOpacity>
              ))}
            </>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  input: { flex: 1, fontSize: 16, height: '100%' },
  clearBtn: { fontSize: 16, padding: 4 },
  searchBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  searchBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  tipContainer: {
    marginHorizontal: 16,
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
  },
  tipText: { fontSize: 12, textAlign: 'center' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  loadingText: { marginTop: 12, fontSize: 16 },
  errorText: { fontSize: 15, textAlign: 'center' },
  noResults: { fontSize: 16 },
  results: { flex: 1 },
  resultsContent: { padding: 16, paddingBottom: 40 },
  resultCount: { fontSize: 13, marginBottom: 12, textAlign: 'center' },
  resultItem: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  resultRef: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
  },
  resultText: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
});
