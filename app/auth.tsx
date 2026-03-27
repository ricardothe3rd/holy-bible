import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../lib/auth';
import { useThemeColors } from '../lib/hooks';

const { width, height } = Dimensions.get('window');

type Mode = 'signin' | 'signup';

export default function AuthScreen() {
  const colors = useThemeColors();
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<Mode>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    if (mode === 'signup') {
      if (!name.trim()) {
        setError('Please enter your name');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
    }

    setLoading(true);
    const result = mode === 'signin'
      ? await signIn(email.trim(), password)
      : await signUp(name.trim(), email.trim(), password);

    setLoading(false);

    if (!result.success) {
      setError(result.error || 'Something went wrong');
    } else {
      router.back();
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={[styles.container, { backgroundColor: '#1a0f0a' }]}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Background glow */}
        <View style={styles.glowOuter} />

        {/* Cross */}
        <View style={styles.crossWrap}>
          <Text style={styles.cross}>{'\u271E'}</Text>
        </View>

        <Text style={styles.appTitle}>Holy Bible</Text>
        <Text style={styles.appSubtitle}>Community</Text>

        {/* Decorative */}
        <View style={styles.decorRow}>
          <View style={styles.decorLine} />
          <Text style={styles.decorDot}>{'\u2726'}</Text>
          <View style={styles.decorLine} />
        </View>

        {/* Form Card */}
        <View style={[styles.card, { backgroundColor: 'rgba(245, 230, 208, 0.06)' }]}>
          <Text style={styles.cardTitle}>
            {mode === 'signin' ? 'Welcome Back' : 'Join the Community'}
          </Text>
          <Text style={styles.cardSubtitle}>
            {mode === 'signin'
              ? 'Sign in to connect with fellow believers'
              : 'Create an account to share and grow together'}
          </Text>

          {mode === 'signup' && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Name</Text>
              <TextInput
                style={[styles.input, { color: '#F5E6D0', borderColor: 'rgba(196,149,106,0.3)' }]}
                value={name}
                onChangeText={setName}
                placeholder="Your name"
                placeholderTextColor="rgba(196,149,106,0.4)"
                autoCapitalize="words"
              />
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={[styles.input, { color: '#F5E6D0', borderColor: 'rgba(196,149,106,0.3)' }]}
              value={email}
              onChangeText={setEmail}
              placeholder="your@email.com"
              placeholderTextColor="rgba(196,149,106,0.4)"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Password</Text>
            <TextInput
              style={[styles.input, { color: '#F5E6D0', borderColor: 'rgba(196,149,106,0.3)' }]}
              value={password}
              onChangeText={setPassword}
              placeholder={mode === 'signup' ? 'Min 6 characters' : 'Your password'}
              placeholderTextColor="rgba(196,149,106,0.4)"
              secureTextEntry
            />
          </View>

          {mode === 'signup' && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Confirm Password</Text>
              <TextInput
                style={[styles.input, { color: '#F5E6D0', borderColor: 'rgba(196,149,106,0.3)' }]}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm your password"
                placeholderTextColor="rgba(196,149,106,0.4)"
                secureTextEntry
              />
            </View>
          )}

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#F5E6D0" />
            ) : (
              <Text style={styles.submitBtnText}>
                {mode === 'signin' ? 'Sign In' : 'Create Account'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.switchBtn}
            onPress={() => {
              setMode(mode === 'signin' ? 'signup' : 'signin');
              setError('');
            }}
          >
            <Text style={styles.switchText}>
              {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
              <Text style={styles.switchLink}>
                {mode === 'signin' ? 'Sign Up' : 'Sign In'}
              </Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* Bottom verse */}
        <Text style={styles.bottomVerse}>
          {'\u201C'}For where two or three are gathered together{'\n'}
          in my name, there am I in the midst of them.{'\u201D'}
        </Text>
        <Text style={styles.bottomRef}>{'\u2014'} Matthew 18:20</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 60,
    minHeight: height,
  },
  glowOuter: {
    position: 'absolute',
    width: 500,
    height: 500,
    borderRadius: 250,
    backgroundColor: 'rgba(196, 149, 106, 0.06)',
    top: -100,
    alignSelf: 'center',
  },
  crossWrap: { marginBottom: 12 },
  cross: {
    fontSize: 48,
    color: '#C4956A',
    textShadowColor: 'rgba(196, 149, 106, 0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 16,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: '300',
    color: '#F5E6D0',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    letterSpacing: 2,
  },
  appSubtitle: {
    fontSize: 13,
    color: '#C4956A',
    letterSpacing: 4,
    textTransform: 'uppercase',
    marginTop: 6,
    fontWeight: '600',
  },
  decorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
    gap: 12,
  },
  decorLine: {
    width: 40,
    height: 1,
    backgroundColor: '#C4956A',
    opacity: 0.3,
  },
  decorDot: {
    color: '#C4956A',
    fontSize: 10,
    opacity: 0.5,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    padding: 28,
    borderWidth: 1,
    borderColor: 'rgba(196,149,106,0.15)',
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#F5E6D0',
    textAlign: 'center',
    marginBottom: 6,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#C4956A',
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 20,
  },
  inputGroup: { marginBottom: 18 },
  inputLabel: {
    fontSize: 13,
    color: '#C4956A',
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: 'rgba(245,230,208,0.04)',
  },
  errorBox: {
    backgroundColor: 'rgba(220,38,38,0.15)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(220,38,38,0.3)',
  },
  errorText: {
    color: '#FCA5A5',
    fontSize: 14,
    textAlign: 'center',
  },
  submitBtn: {
    backgroundColor: '#8B4513',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#8B4513',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: {
    color: '#F5E6D0',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  switchBtn: {
    marginTop: 20,
    alignItems: 'center',
  },
  switchText: {
    color: 'rgba(196,149,106,0.6)',
    fontSize: 14,
  },
  switchLink: {
    color: '#C4956A',
    fontWeight: '700',
  },
  bottomVerse: {
    fontSize: 14,
    color: 'rgba(196,149,106,0.4)',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 36,
    lineHeight: 22,
  },
  bottomRef: {
    fontSize: 12,
    color: 'rgba(196,149,106,0.35)',
    marginTop: 8,
    fontWeight: '600',
  },
});
