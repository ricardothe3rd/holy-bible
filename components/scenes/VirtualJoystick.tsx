import React, { useRef, useState } from 'react';
import { View, StyleSheet, PanResponder, Dimensions, Text, Platform } from 'react-native';

const JOYSTICK_SIZE = 120;
const KNOB_SIZE = 48;
const MAX_DISTANCE = (JOYSTICK_SIZE - KNOB_SIZE) / 2;

interface Props {
  onMove: (forward: number, right: number) => void;
}

export default function VirtualJoystick({ onMove }: Props) {
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const centerRef = useRef({ x: 0, y: 0 });

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (e) => {
      const touch = e.nativeEvent;
      centerRef.current = { x: touch.locationX, y: touch.locationY };
    },
    onPanResponderMove: (e, gestureState) => {
      let dx = gestureState.dx;
      let dy = gestureState.dy;

      // Clamp to max distance
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > MAX_DISTANCE) {
        dx = (dx / dist) * MAX_DISTANCE;
        dy = (dy / dist) * MAX_DISTANCE;
      }

      setKnobPos({ x: dx, y: dy });

      // Normalize to -1..1
      const right = dx / MAX_DISTANCE;
      const forward = -dy / MAX_DISTANCE; // Invert Y
      onMove(forward, right);
    },
    onPanResponderRelease: () => {
      setKnobPos({ x: 0, y: 0 });
      onMove(0, 0);
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.joystickBase} {...panResponder.panHandlers}>
        <View
          style={[
            styles.knob,
            {
              transform: [
                { translateX: knobPos.x },
                { translateY: knobPos.y },
              ],
            },
          ]}
        />
      </View>
      {Platform.OS === 'web' && (
        <Text style={styles.hint}>WASD or Arrow Keys to move{'\n'}Mouse drag to orbit camera</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    alignItems: 'center',
  },
  joystickBase: {
    width: JOYSTICK_SIZE,
    height: JOYSTICK_SIZE,
    borderRadius: JOYSTICK_SIZE / 2,
    backgroundColor: 'rgba(196, 149, 106, 0.15)',
    borderWidth: 2,
    borderColor: 'rgba(196, 149, 106, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  knob: {
    width: KNOB_SIZE,
    height: KNOB_SIZE,
    borderRadius: KNOB_SIZE / 2,
    backgroundColor: 'rgba(196, 149, 106, 0.5)',
    borderWidth: 2,
    borderColor: 'rgba(196, 149, 106, 0.7)',
  },
  hint: {
    color: 'rgba(196, 149, 106, 0.6)',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 8,
  },
});
