import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Image,
  Platform,
  Dimensions,
} from 'react-native';
import { useThemeColors } from '../lib/hooks';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Props {
  visible: boolean;
  onClose: () => void;
  verseText: string;
  reference: string;
}

export default function VerseCamera({ visible, onClose, verseText, reference }: Props) {
  const colors = useThemeColors();
  const [photo, setPhoto] = useState<string | null>(null);
  const [overlayStyle, setOverlayStyle] = useState<'bottom' | 'center' | 'top'>('bottom');

  const takePhoto = async () => {
    try {
      if (Platform.OS === 'web') {
        // Use browser camera API
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        const video = document.createElement('video');
        video.srcObject = stream;
        await video.play();

        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(video, 0, 0);

        stream.getTracks().forEach(track => track.stop());
        setPhoto(canvas.toDataURL('image/jpeg'));
      } else {
        // For native, request permission then use expo-image-picker
        const ImagePicker = require('expo-image-picker');
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          alert('Camera permission is needed to take verse photos.');
          return;
        }
        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          quality: 0.8,
        });
        if (!result.canceled && result.assets?.[0]) {
          setPhoto(result.assets[0].uri);
        }
      }
    } catch (err) {
      console.log('Camera error:', err);
    }
  };

  const overlayPositions = {
    bottom: { justifyContent: 'flex-end' as const, paddingBottom: 40 },
    center: { justifyContent: 'center' as const },
    top: { justifyContent: 'flex-start' as const, paddingTop: 40 },
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={[styles.container, { backgroundColor: '#000' }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => { setPhoto(null); onClose(); }}>
            <Text style={styles.headerBtn}>{'\u2190'} Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Verse Photo</Text>
          <View style={{ width: 60 }} />
        </View>

        {!photo ? (
          /* Camera preview placeholder */
          <View style={styles.cameraPreview}>
            <Text style={styles.cameraIcon}>{'\u{1F4F7}'}</Text>
            <Text style={styles.cameraText}>
              Take a photo and overlay{'\n'}a Bible verse on it
            </Text>
            <TouchableOpacity style={styles.captureBtn} onPress={takePhoto}>
              <Text style={styles.captureBtnText}>Open Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.captureBtn, { backgroundColor: 'rgba(255,255,255,0.15)', marginTop: 12 }]}
              onPress={async () => {
                try {
                  if (Platform.OS !== 'web') {
                    const ImagePicker = require('expo-image-picker');
                    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                    if (status !== 'granted') {
                      alert('Photo library permission is needed to select photos.');
                      return;
                    }
                    const result = await ImagePicker.launchImageLibraryAsync({
                      mediaTypes: ['images'],
                      quality: 0.8,
                    });
                    if (!result.canceled && result.assets?.[0]) {
                      setPhoto(result.assets[0].uri);
                    }
                  } else {
                    // Web file picker
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.onchange = (e: any) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = () => setPhoto(reader.result as string);
                        reader.readAsDataURL(file);
                      }
                    };
                    input.click();
                  }
                } catch {}
              }}
            >
              <Text style={[styles.captureBtnText, { color: 'rgba(255,255,255,0.8)' }]}>Choose from Gallery</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Photo with verse overlay */
          <View style={styles.photoContainer}>
            <Image source={{ uri: photo }} style={styles.photo} resizeMode="cover" />

            {/* Verse overlay */}
            <View style={[styles.verseOverlay, overlayPositions[overlayStyle]]}>
              <View style={styles.verseOverlayCard}>
                <Text style={styles.overlayVerse}>
                  {'\u201C'}{verseText.length > 150 ? verseText.slice(0, 150) + '...' : verseText}{'\u201D'}
                </Text>
                <Text style={styles.overlayRef}>{'\u2014'} {reference} (KJV)</Text>
              </View>
            </View>

            {/* Position controls */}
            <View style={styles.positionRow}>
              {(['top', 'center', 'bottom'] as const).map(pos => (
                <TouchableOpacity
                  key={pos}
                  style={[
                    styles.positionBtn,
                    overlayStyle === pos && styles.positionBtnActive,
                  ]}
                  onPress={() => setOverlayStyle(pos)}
                >
                  <Text style={styles.positionBtnText}>{pos.charAt(0).toUpperCase() + pos.slice(1)}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Actions */}
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.retakeBtn} onPress={() => setPhoto(null)}>
                <Text style={styles.retakeBtnText}>Retake</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.shareBtn}
                onPress={() => {
                  // In production, composite the image + overlay and share
                  onClose();
                }}
              >
                <Text style={styles.shareBtnText}>Share</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
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
    paddingTop: Platform.OS === 'ios' ? 54 : 16,
    paddingBottom: 12,
  },
  headerBtn: { color: '#fff', fontSize: 16, fontWeight: '600' },
  headerTitle: { color: '#fff', fontSize: 17, fontWeight: '700' },
  cameraPreview: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  cameraIcon: { fontSize: 64, marginBottom: 20 },
  cameraText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  captureBtn: {
    backgroundColor: '#8B4513',
    paddingHorizontal: 36,
    paddingVertical: 14,
    borderRadius: 14,
  },
  captureBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  photoContainer: { flex: 1 },
  photo: {
    flex: 1,
    width: SCREEN_WIDTH,
  },
  verseOverlay: {
    ...StyleSheet.absoluteFillObject,
    paddingHorizontal: 20,
  },
  verseOverlayCard: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 14,
    padding: 20,
    backdropFilter: 'blur(10px)',
  },
  overlayVerse: {
    color: '#fff',
    fontSize: 18,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 28,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  overlayRef: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 10,
  },
  positionRow: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  positionBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  positionBtnActive: {
    backgroundColor: 'rgba(196, 149, 106, 0.6)',
  },
  positionBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  actionRow: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 20,
  },
  retakeBtn: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  retakeBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  shareBtn: {
    flex: 1,
    backgroundColor: '#8B4513',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  shareBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
