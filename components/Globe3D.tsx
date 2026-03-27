import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Platform,
  Animated,
  Easing,
} from 'react-native';
import { useThemeColors } from '../lib/hooks';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GLOBE_SIZE = Math.min(SCREEN_WIDTH - 60, 320);

interface GlobePoint {
  lat: number;
  lng: number;
  label: string;
  type: 'prayer' | 'verse';
}

interface Props {
  points: GlobePoint[];
  activeCount: number;
}

/**
 * Animated 3D Globe using CSS transforms on web and
 * animated transforms on native. Shows community prayer
 * points orbiting around a stylized sphere.
 */
export default function Globe3D({ points, activeCount }: Props) {
  const colors = useThemeColors();
  const rotation = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Continuous rotation
    const rotateAnim = Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 30000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    rotateAnim.start();

    // Pulse animation for glow
    const pulseAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.8,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnim.start();

    return () => {
      rotateAnim.stop();
      pulseAnim.stop();
    };
  }, []);

  const spinInterpolate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Convert lat/lng to 3D position on sphere surface
  const getPointPosition = (lat: number, lng: number, time: number) => {
    const phi = ((90 - lat) * Math.PI) / 180;
    const theta = ((lng + time * 12) * Math.PI) / 180;
    const r = GLOBE_SIZE / 2 - 10;

    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.cos(phi);
    const z = r * Math.sin(phi) * Math.sin(theta);

    return { x, y, z };
  };

  // Render animated dots that orbit
  const [time, setTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(prev => prev + 0.5);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      {/* Outer glow */}
      <Animated.View
        style={[
          styles.glow,
          {
            transform: [{ scale: pulse }],
          },
        ]}
      />

      {/* Globe sphere */}
      <View style={[styles.globe]}>
        {/* Equator lines */}
        {[0, 30, 60, -30, -60].map((offset, i) => (
          <View
            key={`lat-${i}`}
            style={[
              styles.latLine,
              {
                top: GLOBE_SIZE / 2 + (offset / 90) * (GLOBE_SIZE / 2) - 0.5,
                width: GLOBE_SIZE * Math.cos((offset * Math.PI) / 180),
                left: (GLOBE_SIZE - GLOBE_SIZE * Math.cos((offset * Math.PI) / 180)) / 2,
              },
            ]}
          />
        ))}

        {/* Meridian lines */}
        {[0, 45, 90, 135].map((angle, i) => (
          <Animated.View
            key={`lng-${i}`}
            style={[
              styles.meridianLine,
              {
                transform: [
                  { rotateY: `${angle}deg` },
                  { rotateZ: spinInterpolate },
                ],
              },
            ]}
          />
        ))}

        {/* Community points */}
        {points.map((point, i) => {
          const pos = getPointPosition(point.lat, point.lng, time);
          const isVisible = pos.z > 0;
          const scale = 0.5 + (pos.z / (GLOBE_SIZE / 2)) * 0.5;
          const opacity = isVisible ? 0.4 + scale * 0.6 : 0.1;

          return (
            <View
              key={i}
              style={[
                styles.point,
                {
                  left: GLOBE_SIZE / 2 + pos.x - 5,
                  top: GLOBE_SIZE / 2 - pos.y - 5,
                  opacity,
                  transform: [{ scale: Math.max(0.3, scale) }],
                  zIndex: isVisible ? 10 : 1,
                },
              ]}
            >
              <View style={[styles.pointDot, { backgroundColor: point.type === 'prayer' ? '#FFD700' : '#87CEEB' }]} />
              {isVisible && scale > 0.7 && (
                <View style={styles.pointPulse}>
                  <View style={[styles.pointRing, { borderColor: point.type === 'prayer' ? '#FFD700' : '#87CEEB' }]} />
                </View>
              )}
            </View>
          );
        })}

        {/* Center cross */}
        <View style={styles.centerCross}>
          <Text style={styles.centerCrossText}>{'\u271E'}</Text>
        </View>
      </View>

      {/* Active counter */}
      <View style={styles.activeBar}>
        <View style={styles.activeDot} />
        <Text style={styles.activeText}>
          {activeCount} active prayers worldwide
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  glow: {
    position: 'absolute',
    width: GLOBE_SIZE + 60,
    height: GLOBE_SIZE + 60,
    borderRadius: (GLOBE_SIZE + 60) / 2,
    backgroundColor: 'rgba(196, 149, 106, 0.06)',
  },
  globe: {
    width: GLOBE_SIZE,
    height: GLOBE_SIZE,
    borderRadius: GLOBE_SIZE / 2,
    backgroundColor: 'rgba(26, 15, 10, 0.9)',
    borderWidth: 1.5,
    borderColor: 'rgba(196, 149, 106, 0.25)',
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#C4956A',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  latLine: {
    position: 'absolute',
    height: 1,
    backgroundColor: 'rgba(196, 149, 106, 0.08)',
  },
  meridianLine: {
    position: 'absolute',
    width: 1,
    height: GLOBE_SIZE,
    backgroundColor: 'rgba(196, 149, 106, 0.06)',
    left: GLOBE_SIZE / 2,
    top: 0,
  },
  point: {
    position: 'absolute',
    width: 10,
    height: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  pointPulse: {
    position: 'absolute',
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointRing: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    opacity: 0.3,
  },
  centerCross: {
    position: 'absolute',
    top: GLOBE_SIZE / 2 - 16,
    left: GLOBE_SIZE / 2 - 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerCrossText: {
    fontSize: 24,
    color: 'rgba(196, 149, 106, 0.15)',
  },
  activeBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 8,
    backgroundColor: 'rgba(196, 149, 106, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4ADE80',
  },
  activeText: {
    fontSize: 13,
    color: '#C4956A',
    fontWeight: '600',
  },
});
