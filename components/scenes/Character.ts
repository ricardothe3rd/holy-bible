import * as THREE from 'three';

const SKIN_COLOR = 0xE8B88A;
const HAIR_COLOR = 0x3D2314;
const SHIRT_COLOR = 0x4A6741;
const PANTS_COLOR = 0x2C3E50;
const SHOE_COLOR = 0x3D2314;
const EYE_COLOR = 0x1a1a2e;

export interface CharacterState {
  position: THREE.Vector3;
  rotation: number; // Y-axis facing angle
  velocity: THREE.Vector3;
  isMoving: boolean;
  frame: number;
}

export function createCharacter(): { group: THREE.Group; state: CharacterState } {
  const group = new THREE.Group();
  group.scale.setScalar(0.8);

  const mat = (color: number) => new THREE.MeshLambertMaterial({ color });

  // ── HEAD ──
  const headGroup = new THREE.Group();
  headGroup.position.y = 1.85;

  const head = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.35), mat(SKIN_COLOR));
  headGroup.add(head);

  // Eyes
  const leftEye = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.02), mat(EYE_COLOR));
  leftEye.position.set(-0.09, 0.04, 0.175);
  headGroup.add(leftEye);

  const rightEye = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.02), mat(EYE_COLOR));
  rightEye.position.set(0.09, 0.04, 0.175);
  headGroup.add(rightEye);

  // Mouth
  const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.03, 0.02), mat(0xCC7755));
  mouth.position.set(0, -0.08, 0.175);
  headGroup.add(mouth);

  // Hair
  const hair = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.18, 0.38), mat(HAIR_COLOR));
  hair.position.y = 0.14;
  headGroup.add(hair);

  // Hair sides
  const hairSideL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.25, 0.38), mat(HAIR_COLOR));
  hairSideL.position.set(-0.22, 0.02, 0);
  headGroup.add(hairSideL);

  const hairSideR = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.25, 0.38), mat(HAIR_COLOR));
  hairSideR.position.set(0.22, 0.02, 0);
  headGroup.add(hairSideR);

  group.add(headGroup);

  // ── NECK ──
  const neck = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.08, 0.12), mat(SKIN_COLOR));
  neck.position.y = 1.6;
  group.add(neck);

  // ── TORSO ──
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.5, 0.22), mat(SHIRT_COLOR));
  torso.position.y = 1.3;
  group.add(torso);

  // Cross necklace
  const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.1, 0.01), mat(0xFFD700));
  crossV.position.set(0, 1.35, 0.115);
  group.add(crossV);

  const crossH = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.02, 0.01), mat(0xFFD700));
  crossH.position.set(0, 1.38, 0.115);
  group.add(crossH);

  // ── ARMS ──
  // Left arm
  const leftArmGroup = new THREE.Group();
  leftArmGroup.position.set(-0.3, 1.45, 0);

  const leftUpperArm = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.3, 0.14), mat(SHIRT_COLOR));
  leftUpperArm.position.y = -0.15;
  leftArmGroup.add(leftUpperArm);

  const leftHand = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.1), mat(SKIN_COLOR));
  leftHand.position.y = -0.35;
  leftArmGroup.add(leftHand);

  group.add(leftArmGroup);

  // Right arm
  const rightArmGroup = new THREE.Group();
  rightArmGroup.position.set(0.3, 1.45, 0);

  const rightUpperArm = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.3, 0.14), mat(SHIRT_COLOR));
  rightUpperArm.position.y = -0.15;
  rightArmGroup.add(rightUpperArm);

  const rightHand = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.1), mat(SKIN_COLOR));
  rightHand.position.y = -0.35;
  rightArmGroup.add(rightHand);

  // Bible in right hand
  const bible = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.04, 0.2), mat(0x8B4513));
  bible.position.set(0, -0.38, 0.08);
  rightArmGroup.add(bible);

  group.add(rightArmGroup);

  // ── LEGS ──
  const leftLegGroup = new THREE.Group();
  leftLegGroup.position.set(-0.11, 1.0, 0);

  const leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.4, 0.16), mat(PANTS_COLOR));
  leftLeg.position.y = -0.2;
  leftLegGroup.add(leftLeg);

  const leftShoe = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.08, 0.24), mat(SHOE_COLOR));
  leftShoe.position.set(0, -0.44, 0.04);
  leftLegGroup.add(leftShoe);

  group.add(leftLegGroup);

  const rightLegGroup = new THREE.Group();
  rightLegGroup.position.set(0.11, 1.0, 0);

  const rightLeg = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.4, 0.16), mat(PANTS_COLOR));
  rightLeg.position.y = -0.2;
  rightLegGroup.add(rightLeg);

  const rightShoe = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.08, 0.24), mat(SHOE_COLOR));
  rightShoe.position.set(0, -0.44, 0.04);
  rightLegGroup.add(rightShoe);

  group.add(rightLegGroup);

  // Shadow
  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(0.3, 16),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.2 })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.01;
  group.add(shadow);

  // Store references for animation
  (group as any)._parts = {
    head: headGroup,
    leftArm: leftArmGroup,
    rightArm: rightArmGroup,
    leftLeg: leftLegGroup,
    rightLeg: rightLegGroup,
  };

  const state: CharacterState = {
    position: new THREE.Vector3(0, 0, 0),
    rotation: 0,
    velocity: new THREE.Vector3(),
    isMoving: false,
    frame: 0,
  };

  return { group, state };
}

const WALK_SPEED = 0.08;
const WALK_ANIM_SPEED = 0.15;
const ARM_SWING = 0.5;
const LEG_SWING = 0.45;
const BOUNCE_HEIGHT = 0.04;
const BREATHE_SPEED = 0.03;
const BREATHE_HEIGHT = 0.01;
const TURN_SPEED = 0.12;

export function updateCharacter(
  group: THREE.Group,
  state: CharacterState,
  input: { forward: number; right: number; cameraAngle: number },
  dt: number
) {
  state.frame++;
  const parts = (group as any)._parts;

  // Calculate movement direction relative to camera
  const moveX = input.right;
  const moveZ = input.forward;
  const hasInput = Math.abs(moveX) > 0.1 || Math.abs(moveZ) > 0.1;

  if (hasInput) {
    // Direction relative to camera
    const angle = input.cameraAngle;
    const worldX = moveX * Math.cos(angle) + moveZ * Math.sin(angle);
    const worldZ = -moveX * Math.sin(angle) + moveZ * Math.cos(angle);

    // Normalize
    const len = Math.sqrt(worldX * worldX + worldZ * worldZ);
    const nx = worldX / len;
    const nz = worldZ / len;

    // Move
    state.position.x += nx * WALK_SPEED;
    state.position.z += nz * WALK_SPEED;

    // Clamp to world bounds
    state.position.x = Math.max(-30, Math.min(30, state.position.x));
    state.position.z = Math.max(-30, Math.min(30, state.position.z));

    // Face movement direction
    const targetRotation = Math.atan2(nx, nz);
    let rotDelta = targetRotation - state.rotation;
    // Shortest path
    while (rotDelta > Math.PI) rotDelta -= Math.PI * 2;
    while (rotDelta < -Math.PI) rotDelta += Math.PI * 2;
    state.rotation += rotDelta * TURN_SPEED;

    state.isMoving = true;
  } else {
    state.isMoving = false;
  }

  // Apply position and rotation
  group.position.copy(state.position);
  group.rotation.y = state.rotation;

  // ── ANIMATION ──
  if (state.isMoving) {
    const t = state.frame * WALK_ANIM_SPEED;

    // Arm swing
    parts.leftArm.rotation.x = Math.sin(t) * ARM_SWING;
    parts.rightArm.rotation.x = -Math.sin(t) * ARM_SWING;

    // Leg swing
    parts.leftLeg.rotation.x = -Math.sin(t) * LEG_SWING;
    parts.rightLeg.rotation.x = Math.sin(t) * LEG_SWING;

    // Bounce
    group.position.y = Math.abs(Math.sin(t)) * BOUNCE_HEIGHT;

    // Head bob
    parts.head.rotation.z = Math.sin(t * 0.5) * 0.03;
  } else {
    // Idle breathing
    const breathe = Math.sin(state.frame * BREATHE_SPEED);

    parts.leftArm.rotation.x *= 0.9; // Ease back
    parts.rightArm.rotation.x *= 0.9;
    parts.leftLeg.rotation.x *= 0.9;
    parts.rightLeg.rotation.x *= 0.9;

    group.position.y = breathe * BREATHE_HEIGHT;
    parts.head.rotation.z *= 0.95;

    // Subtle arm rest
    parts.leftArm.rotation.z = -0.05;
    parts.rightArm.rotation.z = 0.05;
  }
}

export function createFollowCamera(
  camera: THREE.PerspectiveCamera,
  state: CharacterState,
  orbitAngle: { theta: number; phi: number; radius: number }
) {
  const offsetY = 1.5;
  const lookY = 1.0;

  const x = state.position.x + orbitAngle.radius * Math.sin(orbitAngle.phi) * Math.sin(orbitAngle.theta);
  const y = offsetY + orbitAngle.radius * Math.cos(orbitAngle.phi);
  const z = state.position.z + orbitAngle.radius * Math.sin(orbitAngle.phi) * Math.cos(orbitAngle.theta);

  // Smooth lerp
  camera.position.lerp(new THREE.Vector3(x, y, z), 0.08);
  camera.lookAt(
    state.position.x,
    lookY,
    state.position.z
  );
}
