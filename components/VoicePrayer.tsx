import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import { useThemeColors } from '../lib/hooks';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSave: (text: string) => void;
}

export default function VoicePrayer({ visible, onClose, onSave }: Props) {
  const colors = useThemeColors();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current as Animated.Value;
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);

  useEffect(() => {
    if (isRecording) {
      // Pulse animation
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.3, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      );
      pulse.start();

      // Timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      return () => {
        pulse.stop();
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [isRecording]);

  const startRecording = async () => {
    try {
      // Web Speech API for transcription (web only)
      if (Platform.OS === 'web' && 'webkitSpeechRecognition' in window) {
        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let finalTranscript = '';
          for (let i = 0; i < event.results.length; i++) {
            finalTranscript += event.results[i][0].transcript;
          }
          setTranscript(finalTranscript);
        };

        recognition.onerror = () => {
          setIsRecording(false);
        };

        recognition.start();
        (window as any)._speechRecognition = recognition;
        setHasPermission(true);
      } else {
        // Native: request mic permission and use expo-av Audio Recording
        const { Audio } = require('expo-av');
        const { status } = await Audio.requestPermissionsAsync();
        if (status !== 'granted') {
          setHasPermission(false);
          return;
        }
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
        const recording = new Audio.Recording();
        await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
        await recording.startAsync();
        (global as any)._activeRecording = recording;
        setHasPermission(true);
      }

      setIsRecording(true);
      setRecordingTime(0);
      setTranscript('');
    } catch {
      setHasPermission(false);
    }
  };

  const stopRecording = async () => {
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);

    if (Platform.OS === 'web' && (window as any)._speechRecognition) {
      (window as any)._speechRecognition.stop();
      (window as any)._speechRecognition = null;
    } else if ((global as any)._activeRecording) {
      try {
        const recording = (global as any)._activeRecording;
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        (global as any)._activeRecording = null;
        // URI is available for playback or upload
        if (uri && !transcript) {
          setTranscript(`[Voice recording saved — ${formatTime(recordingTime)}]`);
        }
      } catch {}
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => { stopRecording(); onClose(); }}>
            <Text style={[styles.cancelText, { color: colors.secondaryText }]}>Cancel</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Voice Prayer</Text>
          <TouchableOpacity
            onPress={() => { stopRecording(); if (transcript.trim()) onSave(transcript.trim()); onClose(); }}
            disabled={!transcript.trim()}
          >
            <Text style={[styles.saveText, { color: colors.tint, opacity: transcript.trim() ? 1 : 0.3 }]}>Save</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Mic visualization */}
          <View style={styles.micArea}>
            <Animated.View style={[
              styles.pulseRing,
              {
                borderColor: isRecording ? '#C41E3A' : colors.border,
                transform: [{ scale: isRecording ? pulseAnim : 1 }],
                opacity: isRecording ? 0.3 : 0,
              },
            ]} />
            <TouchableOpacity
              style={[
                styles.micButton,
                { backgroundColor: isRecording ? '#C41E3A' : colors.tint },
              ]}
              onPress={isRecording ? stopRecording : startRecording}
              activeOpacity={0.7}
            >
              <Text style={styles.micIcon}>{isRecording ? '\u23F9' : '\u{1F399}'}</Text>
            </TouchableOpacity>
          </View>

          {isRecording && (
            <View style={styles.recordingInfo}>
              <View style={styles.recordingDot} />
              <Text style={[styles.recordingText, { color: '#C41E3A' }]}>Recording</Text>
              <Text style={[styles.recordingTime, { color: colors.secondaryText }]}>{formatTime(recordingTime)}</Text>
            </View>
          )}

          <Text style={[styles.instructions, { color: colors.secondaryText }]}>
            {isRecording
              ? 'Speak your prayer... your words will be transcribed'
              : 'Tap the microphone to record your prayer'}
          </Text>

          {/* Transcript */}
          {transcript ? (
            <View style={[styles.transcriptBox, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
              <Text style={[styles.transcriptLabel, { color: colors.tint }]}>Transcription</Text>
              <Text style={[styles.transcriptText, { color: colors.text }]}>{transcript}</Text>
            </View>
          ) : null}

          {hasPermission === false && (
            <Text style={[styles.errorText, { color: colors.error }]}>
              Microphone permission denied. Please enable it in your device settings.
            </Text>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  cancelText: { fontSize: 16 },
  title: { fontSize: 17, fontWeight: '700' },
  saveText: { fontSize: 16, fontWeight: '700' },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  micArea: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  pulseRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 3,
  },
  micButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  micIcon: { fontSize: 40 },
  recordingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#C41E3A',
  },
  recordingText: { fontSize: 15, fontWeight: '700' },
  recordingTime: { fontSize: 15, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  instructions: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 20,
  },
  transcriptBox: {
    width: '100%',
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
  },
  transcriptLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
  },
  transcriptText: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 20,
  },
});
