import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useThemeColors } from '../lib/hooks';
import { getStreakData, checkAndUpdateStreak, StreakData } from '../lib/streak';

interface Props {
  style?: ViewStyle;
}

export default function StreakBadge({ style }: Props) {
  const colors = useThemeColors();
  const [streak, setStreak] = useState<StreakData | null>(null);

  useEffect(() => {
    checkAndUpdateStreak().then(setStreak);
  }, []);

  // Also refresh when component re-renders (e.g. after reading)
  useEffect(() => {
    const interval = setInterval(() => {
      getStreakData().then(setStreak);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!streak) return null;

  const isActive = streak.currentStreak > 0;
  const icon = isActive ? '\uD83D\uDD25' : '\uD83D\uDD4A\uFE0F';

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isActive ? '#FFF3E0' : colors.surfaceAlt,
          borderColor: isActive ? '#FFB74D' : colors.border,
        },
        style,
      ]}
    >
      <Text style={styles.icon}>{icon}</Text>
      <Text
        style={[
          styles.count,
          { color: isActive ? '#E65100' : colors.secondaryText },
        ]}
      >
        {streak.currentStreak}
      </Text>
      <Text
        style={[
          styles.label,
          { color: isActive ? '#BF360C' : colors.secondaryText },
        ]}
      >
        day streak
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    gap: 4,
  },
  icon: {
    fontSize: 14,
  },
  count: {
    fontSize: 14,
    fontWeight: '700',
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
  },
});
