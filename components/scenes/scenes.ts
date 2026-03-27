import * as THREE from 'three';
import type { SceneConfig } from './SceneRenderer';

// Helper: create a material with color
function mat(color: number, emissive?: number): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color,
    emissive: emissive ?? 0x000000,
    emissiveIntensity: emissive ? 0.3 : 0,
    roughness: 0.8,
    metalness: 0.1,
  });
}

function addFloor(scene: THREE.Scene, color: number, size = 80) {
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(size, size),
    mat(color)
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = 0;
  floor.receiveShadow = true;
  scene.add(floor);
}

// ─── CHURCH ──────────────────────────────────────────────────────
export const churchScene: SceneConfig = {
  cameraPosition: [18, 12, 18],
  cameraLookAt: [0, 4, 0],
  bgColor: 0x0a0612,
  ambientColor: 0xffd4a0,
  ambientIntensity: 0.3,
  rotationSpeed: 0.002,
  buildScene: (scene: THREE.Scene) => {
    // Floor — dark stone
    addFloor(scene, 0x2a1f1a);

    // Main building walls
    const wallMat = mat(0x8B7355);
    // Back wall
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(16, 12, 0.5), wallMat);
    backWall.position.set(0, 6, -6);
    scene.add(backWall);

    // Side walls
    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.5, 12, 12), wallMat);
    leftWall.position.set(-8, 6, 0);
    scene.add(leftWall);

    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.5, 12, 12), wallMat);
    rightWall.position.set(8, 6, 0);
    scene.add(rightWall);

    // Roof — pitched
    const roofGeo = new THREE.ConeGeometry(12, 5, 4);
    const roof = new THREE.Mesh(roofGeo, mat(0x5C3A21));
    roof.position.set(0, 14.5, 0);
    roof.rotation.y = Math.PI / 4;
    scene.add(roof);

    // Steeple
    const steeple = new THREE.Mesh(
      new THREE.ConeGeometry(2, 8, 4),
      mat(0x6B4226)
    );
    steeple.position.set(0, 20, -4);
    scene.add(steeple);

    // Cross on top
    const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.3, 3, 0.3), mat(0xFFD700, 0xFFD700));
    crossV.position.set(0, 25.5, -4);
    scene.add(crossV);
    const crossH = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.3, 0.3), mat(0xFFD700, 0xFFD700));
    crossH.position.set(0, 26.2, -4);
    scene.add(crossH);

    // Altar cross at front
    const altarCrossV = new THREE.Mesh(new THREE.BoxGeometry(0.2, 2.5, 0.2), mat(0xFFD700, 0xDAA520));
    altarCrossV.position.set(0, 3.25, -5);
    scene.add(altarCrossV);
    const altarCrossH = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.2, 0.2), mat(0xFFD700, 0xDAA520));
    altarCrossH.position.set(0, 3.8, -5);
    scene.add(altarCrossH);

    // Altar table
    const altar = new THREE.Mesh(new THREE.BoxGeometry(4, 1.5, 1.5), mat(0x5C3317));
    altar.position.set(0, 0.75, -4.5);
    scene.add(altar);

    // Pews (3 rows each side)
    const pewMat = mat(0x6B3A2A);
    for (let row = 0; row < 4; row++) {
      for (let side of [-1, 1]) {
        const pew = new THREE.Mesh(new THREE.BoxGeometry(5, 0.8, 0.4), pewMat);
        pew.position.set(side * 3, 0.4, row * 2 - 1);
        scene.add(pew);
        // Back rest
        const back = new THREE.Mesh(new THREE.BoxGeometry(5, 1.2, 0.15), pewMat);
        back.position.set(side * 3, 1, row * 2 - 1.15);
        scene.add(back);
      }
    }

    // Stained glass windows (glowing panels)
    const windowColors = [0xFF4444, 0x4444FF, 0xFFFF44, 0x44FF44];
    for (let i = 0; i < 4; i++) {
      const windowPane = new THREE.Mesh(
        new THREE.PlaneGeometry(1.5, 3),
        new THREE.MeshStandardMaterial({
          color: windowColors[i],
          emissive: windowColors[i],
          emissiveIntensity: 0.5,
          transparent: true,
          opacity: 0.6,
          side: THREE.DoubleSide,
        })
      );
      windowPane.position.set(-7.7, 6, i * 2.5 - 3);
      windowPane.rotation.y = Math.PI / 2;
      scene.add(windowPane);

      // Copy on right side
      const rightWindow = windowPane.clone();
      rightWindow.position.set(7.7, 6, i * 2.5 - 3);
      scene.add(rightWindow);
    }

    // Candles on altar
    for (let x of [-1.2, 1.2]) {
      const candle = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.6), mat(0xFFF8DC));
      candle.position.set(x, 1.8, -4.5);
      scene.add(candle);

      const flame = new THREE.Mesh(
        new THREE.SphereGeometry(0.1),
        new THREE.MeshStandardMaterial({
          color: 0xFF8C00,
          emissive: 0xFF6600,
          emissiveIntensity: 1,
        })
      );
      flame.position.set(x, 2.2, -4.5);
      scene.add(flame);

      const candleLight = new THREE.PointLight(0xFF8C00, 0.5, 8);
      candleLight.position.set(x, 2.3, -4.5);
      scene.add(candleLight);
    }
  },
};

// ─── STUDY ROOM ──────────────────────────────────────────────────
export const studyRoomScene: SceneConfig = {
  cameraPosition: [10, 8, 10],
  cameraLookAt: [0, 2, 0],
  bgColor: 0x1a120a,
  ambientColor: 0xffd4a0,
  ambientIntensity: 0.35,
  rotationSpeed: 0.002,
  buildScene: (scene: THREE.Scene) => {
    addFloor(scene, 0x3E2723);

    // Room walls
    const wallMat = mat(0x5D4037);
    const back = new THREE.Mesh(new THREE.BoxGeometry(14, 8, 0.3), wallMat);
    back.position.set(0, 4, -5);
    scene.add(back);

    const leftW = new THREE.Mesh(new THREE.BoxGeometry(0.3, 8, 10), wallMat);
    leftW.position.set(-7, 4, 0);
    scene.add(leftW);

    const rightW = new THREE.Mesh(new THREE.BoxGeometry(0.3, 8, 10), wallMat);
    rightW.position.set(7, 4, 0);
    scene.add(rightW);

    // Wooden desk
    const deskTop = new THREE.Mesh(new THREE.BoxGeometry(5, 0.2, 2.5), mat(0x6D4C2A));
    deskTop.position.set(0, 2.5, -2);
    scene.add(deskTop);

    // Desk legs
    for (let x of [-2.2, 2.2]) {
      for (let z of [-3, -1]) {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.15, 2.5, 0.15), mat(0x5C3A1E));
        leg.position.set(x, 1.25, z);
        scene.add(leg);
      }
    }

    // Open Bible on desk
    const bookLeft = new THREE.Mesh(new THREE.BoxGeometry(1, 0.08, 1.4), mat(0xF5E6D0));
    bookLeft.position.set(-0.55, 2.65, -2);
    bookLeft.rotation.z = -0.05;
    scene.add(bookLeft);

    const bookRight = new THREE.Mesh(new THREE.BoxGeometry(1, 0.08, 1.4), mat(0xF5E6D0));
    bookRight.position.set(0.55, 2.65, -2);
    bookRight.rotation.z = 0.05;
    scene.add(bookRight);

    const spine = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.15, 1.4), mat(0x8B4513));
    spine.position.set(0, 2.63, -2);
    scene.add(spine);

    // Desk lamp
    const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.5, 0.15), mat(0x2F4F2F));
    lampBase.position.set(2, 2.65, -2.5);
    scene.add(lampBase);

    const lampArm = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2), mat(0x2F4F2F));
    lampArm.position.set(2, 3.65, -2.5);
    lampArm.rotation.z = -0.2;
    scene.add(lampArm);

    const lampShade = new THREE.Mesh(
      new THREE.ConeGeometry(0.6, 0.5, 8, 1, true),
      new THREE.MeshStandardMaterial({
        color: 0x2F4F2F,
        emissive: 0x2F4F2F,
        emissiveIntensity: 0.2,
        side: THREE.DoubleSide,
      })
    );
    lampShade.position.set(1.8, 4.6, -2.5);
    scene.add(lampShade);

    const lampLight = new THREE.PointLight(0xFFD700, 1, 10);
    lampLight.position.set(1.8, 4.3, -2.5);
    scene.add(lampLight);

    // Chair
    const chairSeat = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.15, 1.5), mat(0x8B4513));
    chairSeat.position.set(0, 1.5, 0);
    scene.add(chairSeat);

    const chairBack = new THREE.Mesh(new THREE.BoxGeometry(1.5, 2, 0.15), mat(0x8B4513));
    chairBack.position.set(0, 2.5, 0.7);
    scene.add(chairBack);

    for (let x of [-0.6, 0.6]) {
      for (let z of [-0.6, 0.6]) {
        const chairLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.5), mat(0x6B3A2A));
        chairLeg.position.set(x, 0.75, z);
        scene.add(chairLeg);
      }
    }

    // Bookshelf
    const shelfFrame = new THREE.Mesh(new THREE.BoxGeometry(4, 6, 0.8), mat(0x5C3317));
    shelfFrame.position.set(-5, 3, -4.5);
    scene.add(shelfFrame);

    // Books on shelf
    const bookColors = [0xC41E3A, 0x2E5090, 0x2E8B57, 0x8B4513, 0xDAA520, 0x4B0082];
    for (let row = 0; row < 3; row++) {
      for (let i = 0; i < 5; i++) {
        const bookHeight = 0.6 + Math.random() * 0.4;
        const book = new THREE.Mesh(
          new THREE.BoxGeometry(0.3, bookHeight, 0.5),
          mat(bookColors[(row * 5 + i) % bookColors.length])
        );
        book.position.set(-6.2 + i * 0.5, 0.8 + row * 2 + bookHeight / 2, -4.5);
        scene.add(book);
      }
    }

    // Window with warm light
    const windowFrame = new THREE.Mesh(new THREE.BoxGeometry(3, 3, 0.2), mat(0x4A3728));
    windowFrame.position.set(5, 4.5, -4.85);
    scene.add(windowFrame);

    const windowGlass = new THREE.Mesh(
      new THREE.PlaneGeometry(2.6, 2.6),
      new THREE.MeshStandardMaterial({
        color: 0x87CEEB,
        emissive: 0x87CEEB,
        emissiveIntensity: 0.3,
        transparent: true,
        opacity: 0.5,
      })
    );
    windowGlass.position.set(5, 4.5, -4.7);
    scene.add(windowGlass);

    // Rug
    const rug = new THREE.Mesh(
      new THREE.PlaneGeometry(6, 4),
      new THREE.MeshStandardMaterial({
        color: 0x8B0000,
        roughness: 1,
      })
    );
    rug.rotation.x = -Math.PI / 2;
    rug.position.set(0, 0.02, -1);
    scene.add(rug);
  },
};

// ─── OFFICE ──────────────────────────────────────────────────────
export const officeScene: SceneConfig = {
  cameraPosition: [10, 8, 10],
  cameraLookAt: [0, 2, 0],
  bgColor: 0x0f1520,
  ambientColor: 0xE0E8FF,
  ambientIntensity: 0.3,
  rotationSpeed: 0.002,
  buildScene: (scene: THREE.Scene) => {
    addFloor(scene, 0x2C3E50);

    // Modern office walls
    const wallMat = mat(0x34495E);
    const back = new THREE.Mesh(new THREE.BoxGeometry(14, 8, 0.3), wallMat);
    back.position.set(0, 4, -5);
    scene.add(back);

    const left = new THREE.Mesh(new THREE.BoxGeometry(0.3, 8, 10), wallMat);
    left.position.set(-7, 4, 0);
    scene.add(left);

    // Modern desk
    const deskTop = new THREE.Mesh(new THREE.BoxGeometry(6, 0.12, 2.5), mat(0xDEB887));
    deskTop.position.set(0, 2.4, -2);
    scene.add(deskTop);

    // Metal desk legs
    const metalMat = mat(0x808080);
    for (let x of [-2.7, 2.7]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.4, 2.3), metalMat);
      leg.position.set(x, 1.2, -2);
      scene.add(leg);
    }

    // Monitor
    const monitor = new THREE.Mesh(new THREE.BoxGeometry(2.5, 1.5, 0.08), mat(0x1a1a1a));
    monitor.position.set(-1, 3.6, -3);
    scene.add(monitor);

    const screen = new THREE.Mesh(
      new THREE.PlaneGeometry(2.3, 1.3),
      new THREE.MeshStandardMaterial({
        color: 0x1a2940,
        emissive: 0x2244aa,
        emissiveIntensity: 0.4,
      })
    );
    screen.position.set(-1, 3.6, -2.95);
    scene.add(screen);

    const monitorStand = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.5, 0.3), metalMat);
    monitorStand.position.set(-1, 2.7, -3);
    scene.add(monitorStand);

    // Bible on desk
    const bible = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.2, 1.1), mat(0x8B4513));
    bible.position.set(1.8, 2.6, -2);
    bible.rotation.y = 0.3;
    scene.add(bible);

    // Cross bookmark
    const bibleGold = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.01, 0.02), mat(0xFFD700, 0xFFD700));
    bibleGold.position.set(1.8, 2.71, -2);
    bibleGold.rotation.y = 0.3;
    scene.add(bibleGold);

    // Coffee mug
    const mug = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.18, 0.4), mat(0xFFF8DC));
    mug.position.set(2.2, 2.7, -1.2);
    scene.add(mug);

    // Plant
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.25, 0.5), mat(0xCD853F));
    pot.position.set(5, 0.25, -3);
    scene.add(pot);

    const plant = new THREE.Mesh(new THREE.SphereGeometry(0.8, 8, 8), mat(0x228B22));
    plant.position.set(5, 1.2, -3);
    scene.add(plant);

    // Keyboard
    const keyboard = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.05, 0.5), mat(0x333333));
    keyboard.position.set(-1, 2.5, -1.5);
    scene.add(keyboard);

    // Office chair
    const chairSeat = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.15), mat(0x1a1a1a));
    chairSeat.position.set(0, 1.6, 0.5);
    scene.add(chairSeat);

    const chairBack = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.5, 0.12), mat(0x1a1a1a));
    chairBack.position.set(0, 2.6, 1.1);
    chairBack.rotation.x = 0.1;
    scene.add(chairBack);

    const chairPole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.5), metalMat);
    chairPole.position.set(0, 0.8, 0.5);
    scene.add(chairPole);

    // Window
    const windowFrame = new THREE.Mesh(new THREE.BoxGeometry(5, 4, 0.2), mat(0x2C3E50));
    windowFrame.position.set(0, 5, -4.85);
    scene.add(windowFrame);

    const windowGlass = new THREE.Mesh(
      new THREE.PlaneGeometry(4.5, 3.5),
      new THREE.MeshStandardMaterial({
        color: 0x1a2a40,
        emissive: 0x2244aa,
        emissiveIntensity: 0.15,
        transparent: true,
        opacity: 0.4,
      })
    );
    windowGlass.position.set(0, 5, -4.75);
    scene.add(windowGlass);

    // Whiteboard
    const whiteboard = new THREE.Mesh(new THREE.BoxGeometry(4, 2.5, 0.1), mat(0xFFFFFF));
    whiteboard.position.set(-5, 4, -4.8);
    scene.add(whiteboard);
  },
};

// ─── GARDEN ──────────────────────────────────────────────────────
export const gardenScene: SceneConfig = {
  cameraPosition: [15, 10, 15],
  cameraLookAt: [0, 1, 0],
  bgColor: 0x87CEEB,
  ambientColor: 0xFFFFFF,
  ambientIntensity: 0.6,
  rotationSpeed: 0.0015,
  buildScene: (scene: THREE.Scene) => {
    // Grass
    addFloor(scene, 0x228B22, 100);

    // Garden path
    const pathMat = mat(0xD2B48C);
    for (let i = -5; i < 8; i++) {
      const stone = new THREE.Mesh(
        new THREE.CylinderGeometry(0.6 + Math.random() * 0.3, 0.6, 0.1, 6),
        pathMat
      );
      stone.position.set(Math.sin(i * 0.5) * 1.5, 0.05, i * 1.2);
      stone.rotation.y = Math.random() * Math.PI;
      scene.add(stone);
    }

    // Trees
    function addTree(x: number, z: number, height: number) {
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.3, height),
        mat(0x8B4513)
      );
      trunk.position.set(x, height / 2, z);
      scene.add(trunk);

      const leaves = new THREE.Mesh(
        new THREE.SphereGeometry(height * 0.6, 8, 6),
        mat(0x2E8B57)
      );
      leaves.position.set(x, height + 0.5, z);
      scene.add(leaves);
    }

    addTree(-6, -3, 4);
    addTree(6, -2, 5);
    addTree(-4, 6, 3.5);
    addTree(7, 5, 4.5);
    addTree(-8, 1, 3);

    // Flowers
    const flowerColors = [0xFF69B4, 0xFF4500, 0xFFD700, 0x9370DB, 0xFF6347];
    for (let i = 0; i < 20; i++) {
      const flower = new THREE.Mesh(
        new THREE.SphereGeometry(0.15, 6, 6),
        mat(flowerColors[i % flowerColors.length], flowerColors[i % flowerColors.length])
      );
      const angle = Math.random() * Math.PI * 2;
      const r = 3 + Math.random() * 8;
      flower.position.set(Math.cos(angle) * r, 0.3, Math.sin(angle) * r);
      scene.add(flower);

      const stem = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.02, 0.3),
        mat(0x228B22)
      );
      stem.position.set(Math.cos(angle) * r, 0.15, Math.sin(angle) * r);
      scene.add(stem);
    }

    // Stone bench
    const benchSeat = new THREE.Mesh(new THREE.BoxGeometry(3, 0.3, 1), mat(0xA9A9A9));
    benchSeat.position.set(-2, 0.8, -1);
    scene.add(benchSeat);

    const benchLegL = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.8, 1), mat(0x808080));
    benchLegL.position.set(-3, 0.4, -1);
    scene.add(benchLegL);

    const benchLegR = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.8, 1), mat(0x808080));
    benchLegR.position.set(-1, 0.4, -1);
    scene.add(benchLegR);

    // Small fountain
    const basin = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1, 0.8, 12), mat(0x808080));
    basin.position.set(3, 0.4, -2);
    scene.add(basin);

    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 1.5), mat(0x808080));
    pillar.position.set(3, 1.55, -2);
    scene.add(pillar);

    const water = new THREE.Mesh(
      new THREE.CylinderGeometry(1, 1, 0.3, 12),
      new THREE.MeshStandardMaterial({
        color: 0x4169E1,
        transparent: true,
        opacity: 0.6,
        metalness: 0.8,
        roughness: 0.2,
      })
    );
    water.position.set(3, 0.6, -2);
    scene.add(water);

    // Wooden cross in garden
    const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.3, 4, 0.3), mat(0x6B3A2A));
    crossV.position.set(0, 2, -5);
    scene.add(crossV);

    const crossH = new THREE.Mesh(new THREE.BoxGeometry(2, 0.3, 0.3), mat(0x6B3A2A));
    crossH.position.set(0, 3.2, -5);
    scene.add(crossH);

    // Sun glow
    const sun = new THREE.PointLight(0xFFD700, 1.5, 100);
    sun.position.set(20, 30, 20);
    scene.add(sun);
  },
};

// ─── MOUNTAIN ────────────────────────────────────────────────────
export const mountainScene: SceneConfig = {
  cameraPosition: [20, 12, 20],
  cameraLookAt: [0, 5, 0],
  bgColor: 0x87CEEB,
  ambientColor: 0xFFFFFF,
  ambientIntensity: 0.5,
  rotationSpeed: 0.001,
  buildScene: (scene: THREE.Scene) => {
    // Ground
    addFloor(scene, 0x4A6741, 200);

    // Mountains
    function addMountain(x: number, z: number, r: number, h: number, color: number) {
      const mountain = new THREE.Mesh(
        new THREE.ConeGeometry(r, h, 6),
        mat(color)
      );
      mountain.position.set(x, h / 2, z);
      scene.add(mountain);

      // Snow cap
      if (h > 12) {
        const snow = new THREE.Mesh(
          new THREE.ConeGeometry(r * 0.3, h * 0.2, 6),
          mat(0xFFFAFA)
        );
        snow.position.set(x, h * 0.9, z);
        scene.add(snow);
      }
    }

    addMountain(0, -15, 12, 20, 0x5C4033);
    addMountain(-18, -20, 10, 16, 0x6B4226);
    addMountain(15, -18, 14, 22, 0x4A3728);
    addMountain(-10, -25, 8, 14, 0x5D4037);
    addMountain(25, -22, 9, 12, 0x6B4226);

    // Small hills
    for (let i = 0; i < 6; i++) {
      const hill = new THREE.Mesh(
        new THREE.SphereGeometry(3 + Math.random() * 3, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2),
        mat(0x3A7D3A)
      );
      hill.position.set(
        Math.cos(i * 1.1) * 15,
        0,
        Math.sin(i * 1.1) * 15
      );
      scene.add(hill);
    }

    // Lake
    const lake = new THREE.Mesh(
      new THREE.CircleGeometry(6, 24),
      new THREE.MeshStandardMaterial({
        color: 0x1E90FF,
        transparent: true,
        opacity: 0.7,
        metalness: 0.9,
        roughness: 0.1,
      })
    );
    lake.rotation.x = -Math.PI / 2;
    lake.position.set(-5, 0.05, 5);
    scene.add(lake);

    // Trees by the lake
    for (let i = 0; i < 8; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = 7 + Math.random() * 3;
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.15, 0.2, 2),
        mat(0x5C3317)
      );
      trunk.position.set(-5 + Math.cos(angle) * r, 1, 5 + Math.sin(angle) * r);
      scene.add(trunk);

      const leaves = new THREE.Mesh(
        new THREE.ConeGeometry(1, 3, 6),
        mat(0x1B5E20)
      );
      leaves.position.set(-5 + Math.cos(angle) * r, 3, 5 + Math.sin(angle) * r);
      scene.add(leaves);
    }

    // Wooden cross on hilltop
    const crossHill = new THREE.Mesh(
      new THREE.SphereGeometry(3, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2),
      mat(0x3A7D3A)
    );
    crossHill.position.set(8, 0, 2);
    scene.add(crossHill);

    const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.4, 5, 0.4), mat(0x6B3A2A));
    crossV.position.set(8, 5, 2);
    scene.add(crossV);

    const crossH = new THREE.Mesh(new THREE.BoxGeometry(3, 0.35, 0.35), mat(0x6B3A2A));
    crossH.position.set(8, 6.5, 2);
    scene.add(crossH);

    // Sun
    const sun = new THREE.PointLight(0xFFD700, 2, 200);
    sun.position.set(30, 40, 30);
    scene.add(sun);
  },
};

export const ALL_SCENES = [
  { id: 'church', name: 'Church', icon: '\u26EA', desc: 'A sacred sanctuary', config: churchScene },
  { id: 'study', name: 'Study Room', icon: '\u{1F4DA}', desc: 'A quiet place for devotion', config: studyRoomScene },
  { id: 'office', name: 'Office', icon: '\u{1F5A5}', desc: 'Faith in the workplace', config: officeScene },
  { id: 'garden', name: 'Garden', icon: '\u{1F33F}', desc: 'A peaceful garden of prayer', config: gardenScene },
  { id: 'mountain', name: 'Mountain', icon: '\u26F0\uFE0F', desc: 'The mountaintop of God', config: mountainScene },
];
