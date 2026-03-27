import React, { useRef, useEffect, useCallback, useState } from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import * as THREE from 'three';
import { createCharacter, updateCharacter, createFollowCamera } from './Character';
import { KeyboardController, MouseOrbitController } from './InputController';
import VirtualJoystick from './VirtualJoystick';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface SceneConfig {
  buildScene: (scene: THREE.Scene) => void;
  cameraPosition: [number, number, number];
  cameraLookAt?: [number, number, number];
  ambientColor?: number;
  ambientIntensity?: number;
  bgColor?: number;
  rotationSpeed?: number;
}

interface Props {
  config: SceneConfig;
  width?: number;
  height?: number;
  explorable?: boolean; // Enable character exploration mode
}

export default function SceneRenderer({ config, width = SCREEN_WIDTH, height = SCREEN_HEIGHT * 0.55, explorable = false }: Props) {
  const [joystickInput, setJoystickInput] = useState({ forward: 0, right: 0 });
  const joystickRef = useRef({ forward: 0, right: 0 });

  const handleJoystickMove = useCallback((forward: number, right: number) => {
    joystickRef.current = { forward, right };
    setJoystickInput({ forward, right });
  }, []);

  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, { width, height }]}>
        <WebSceneRenderer
          config={config}
          width={width}
          height={height}
          explorable={explorable}
          joystickInput={joystickRef}
        />
        {explorable && <VirtualJoystick onMove={handleJoystickMove} />}
      </View>
    );
  }

  return (
    <View style={[styles.container, { width, height }]}>
      <NativeSceneRenderer
        config={config}
        width={width}
        height={height}
        explorable={explorable}
        joystickInput={joystickRef}
      />
      {explorable && <VirtualJoystick onMove={handleJoystickMove} />}
    </View>
  );
}

// Native renderer using expo-gl
function NativeSceneRenderer({
  config, width, height, explorable, joystickInput,
}: {
  config: SceneConfig; width: number; height: number;
  explorable: boolean; joystickInput: React.MutableRefObject<{ forward: number; right: number }>;
}) {
  const requestRef = useRef<number>(0);

  const onContextCreate = useCallback(async (gl: any) => {
    const ExpoThree = require('expo-three');
    const Renderer = ExpoThree.default?.Renderer || ExpoThree.Renderer;

    const renderer = new Renderer({ gl });
    renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);
    renderer.setClearColor(config.bgColor ?? 0x1a0f0a);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(config.bgColor ?? 0x1a0f0a, 0.012);

    const camera = new THREE.PerspectiveCamera(60, gl.drawingBufferWidth / gl.drawingBufferHeight, 0.1, 1000);
    camera.position.set(...config.cameraPosition);
    camera.lookAt(new THREE.Vector3(...(config.cameraLookAt ?? [0, 0, 0])));

    // Lighting
    scene.add(new THREE.AmbientLight(config.ambientColor ?? 0xfff0d4, config.ambientIntensity ?? 0.4));
    const dirLight = new THREE.DirectionalLight(0xffeedd, 0.8);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);
    scene.add(new THREE.PointLight(0xffaa44, 0.6, 50).translateY(8));

    config.buildScene(scene);

    let character: ReturnType<typeof createCharacter> | null = null;
    const orbit = { theta: Math.PI, phi: 1.0, radius: 5 };

    if (explorable) {
      character = createCharacter();
      scene.add(character.group);
    }

    let rotation = 0;
    const speed = config.rotationSpeed ?? 0.003;
    const radius = Math.sqrt(config.cameraPosition[0] ** 2 + config.cameraPosition[2] ** 2);

    const animate = () => {
      requestRef.current = requestAnimationFrame(animate);

      if (explorable && character) {
        const input = joystickInput.current;
        updateCharacter(character.group, character.state, {
          forward: input.forward,
          right: input.right,
          cameraAngle: orbit.theta,
        }, 1);
        createFollowCamera(camera, character.state, orbit);
      } else {
        rotation += speed;
        camera.position.x = Math.sin(rotation) * radius;
        camera.position.z = Math.cos(rotation) * radius;
        camera.lookAt(new THREE.Vector3(...(config.cameraLookAt ?? [0, 0, 0])));
      }

      renderer.render(scene, camera);
      gl.endFrameEXP();
    };

    animate();
  }, [config, explorable]);

  useEffect(() => {
    return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
  }, []);

  const GLView = require('expo-gl').GLView;

  return <GLView style={{ width, height }} onContextCreate={onContextCreate} />;
}

// Web renderer
function WebSceneRenderer({
  config, width, height, explorable, joystickInput,
}: {
  config: SceneConfig; width: number; height: number;
  explorable: boolean; joystickInput: React.MutableRefObject<{ forward: number; right: number }>;
}) {
  const containerRef = useRef<any>(null);
  const requestRef = useRef<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(config.bgColor ?? 0x1a0f0a, 0.012);

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(...config.cameraPosition);
    camera.lookAt(new THREE.Vector3(...(config.cameraLookAt ?? [0, 0, 0])));

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(config.bgColor ?? 0x1a0f0a);
    renderer.shadowMap.enabled = true;

    while (container.firstChild) container.removeChild(container.firstChild);
    container.appendChild(renderer.domElement);

    // Lighting
    scene.add(new THREE.AmbientLight(config.ambientColor ?? 0xfff0d4, config.ambientIntensity ?? 0.4));
    const dirLight = new THREE.DirectionalLight(0xffeedd, 0.8);
    dirLight.position.set(10, 20, 10);
    dirLight.castShadow = true;
    scene.add(dirLight);
    const pointLight = new THREE.PointLight(0xffaa44, 0.6, 50);
    pointLight.position.set(0, 8, 0);
    scene.add(pointLight);

    config.buildScene(scene);

    // Character + controllers
    let character: ReturnType<typeof createCharacter> | null = null;
    let keyboard: KeyboardController | null = null;
    let mouseOrbit: MouseOrbitController | null = null;

    if (explorable) {
      character = createCharacter();
      scene.add(character.group);
      keyboard = new KeyboardController();
      mouseOrbit = new MouseOrbitController(renderer.domElement);
    }

    let rotation = 0;
    const speed = config.rotationSpeed ?? 0.003;
    const radius = Math.sqrt(config.cameraPosition[0] ** 2 + config.cameraPosition[2] ** 2);

    const animate = () => {
      requestRef.current = requestAnimationFrame(animate);

      if (explorable && character && keyboard && mouseOrbit) {
        // Combine keyboard + joystick input
        const kb = keyboard.getInput();
        const js = joystickInput.current;
        const forward = Math.max(-1, Math.min(1, kb.forward + js.forward));
        const right = Math.max(-1, Math.min(1, kb.right + js.right));

        updateCharacter(character.group, character.state, {
          forward,
          right,
          cameraAngle: mouseOrbit.theta,
        }, 1);

        createFollowCamera(camera, character.state, {
          theta: mouseOrbit.theta,
          phi: mouseOrbit.phi,
          radius: mouseOrbit.radius,
        });
      } else {
        rotation += speed;
        camera.position.x = Math.sin(rotation) * radius;
        camera.position.z = Math.cos(rotation) * radius;
        camera.lookAt(new THREE.Vector3(...(config.cameraLookAt ?? [0, 0, 0])));
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      keyboard?.dispose();
      mouseOrbit?.dispose();
      renderer.dispose();
    };
  }, [config, width, height, explorable]);

  return <div ref={containerRef} style={{ width, height }} />;
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
});
