<div align="center">

  <h1>Holy Bible</h1>

  <p><b>The most immersive Bible app ever built. Walk through 3D sacred spaces, record voice prayers, overlay verses on photos, and connect with believers worldwide.</b></p>

  <p>
    <img src="https://img.shields.io/badge/platform-iOS%20%7C%20Android%20%7C%20Web-blue?style=for-the-badge" alt="Platform" />
    <img src="https://img.shields.io/badge/Made%20with-Expo-4630EB?style=for-the-badge&logo=expo&logoColor=white" alt="Expo" />
    <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=threedotjs&logoColor=white" alt="Three.js" />
    <img src="https://img.shields.io/badge/license-MIT-green?style=for-the-badge" alt="License" />
  </p>

  <p>
    <a href="#-quick-start">Get Started</a>
    &middot;
    <a href="#-features">Features</a>
    &middot;
    <a href="#-sacred-spaces-3d">3D Spaces</a>
    &middot;
    <a href="#-roadmap">Roadmap</a>
  </p>

</div>

---

## The Problem

Every Bible app looks the same. Plain text on a white screen. No immersion. No wonder. No beauty.

**The Word of God deserves better.**

Holy Bible is the first Bible app where you can walk a character through a 3D church, record voice prayers, overlay verses on your photos, and explore sacred spaces — all from one beautiful, cross-platform app.

---

<details>
<summary><b>Table of Contents</b></summary>

- [Quick Start](#-quick-start)
- [Features](#-features)
- [Sacred Spaces 3D](#-sacred-spaces-3d)
- [The Character](#-the-character)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)

</details>

---

## Quick Start

**Prerequisites:** Node.js 18+ and npm/yarn installed.

```bash
# Clone the repo
git clone https://github.com/your-username/holy-bible.git

# Install dependencies
cd holy-bible
npm install

# Run on web
npm run web

# Run on iOS
npm run ios

# Run on Android
npm run android
```

The app opens at `http://localhost:8081`. First-time visitors see a welcome screen with Psalm 119:105.

<p align="right">(<a href="#holy-bible">back to top</a>)</p>

---

## Features

### Core Bible Experience

| Feature | Description |
|---|---|
| **KJV Bible Reader** | Full King James Version with chapter-by-chapter navigation and offline caching |
| **Red Letter Edition** | Jesus's words displayed in crimson red across 1,200+ mapped verses (Matthew–Revelation) |
| **Search** | Search by reference (`John 3:16`), passage range (`Romans 8:28-30`), or keyword |
| **Audio Playback** | Listen to chapters read aloud via text-to-speech with play/pause/stop controls |
| **Dark & Light Mode** | Automatic theme switching with 16 semantic color tokens per theme |

### Personal Tools

| Feature | Description |
|---|---|
| **Bookmarks** | Save any verse with one tap |
| **Highlights** | 6 colors — Gold, Green, Blue, Pink, Purple, Orange |
| **Notes** | Write personal notes on any verse, edit inline |
| **Reading Streak** | Track consecutive days with flame badge and lifetime stats |
| **Reading Plans** | 4 guided plans: Gospels (30d), Psalms (30d), Proverbs (31d), New Testament (90d) |
| **Daily Verse** | 31 curated rotating verses with save and share |
| **Reading History** | Recently read chapters log |
| **Font Size** | Adjustable 14pt–30pt with live preview |

### Prayer & Voice

| Feature | Description |
|---|---|
| **Prayer Journal** | Log prayers with 6 categories (General, Thanksgiving, For Others, Healing, Guidance, Provision) |
| **Answered Prayers** | Mark prayers as answered with a note about how God moved |
| **Voice Prayer** | Tap the mic to record a prayer — real-time transcription on web, audio recording on native |
| **Community Prayer Wall** | See and join community prayer requests worldwide |

### Creative & Sharing

| Feature | Description |
|---|---|
| **Verse Image Cards** | Generate beautiful shareable cards with 6 themes (Sunrise, Ocean, Forest, Royal, Parchment, Night) |
| **Verse Photo Overlay** | Take a photo or pick from gallery, overlay a Bible verse on it with adjustable positioning |
| **Share Everywhere** | One-tap share to any platform |

### Community

| Feature | Description |
|---|---|
| **3D Community Globe** | Animated globe showing prayer points worldwide with depth-based scaling |
| **Prayer Wall** | Browse and pray for community requests |
| **Shared Verses** | See what others are reading with reflections and likes |
| **Sign In / Sign Up** | Authentication with persistent login |
| **Profile** | User profile with sign-out |

<p align="right">(<a href="#holy-bible">back to top</a>)</p>

---

## Sacred Spaces (3D)

Walk through five immersive 3D environments built entirely from **programmatic Three.js geometry** — no 3D model files needed.

| Space | Elements | Atmosphere |
|---|---|---|
| **Church** | Pews, altar, gold cross, stained glass windows (4 colors), glowing candles, steeple | Dark candlelit warmth |
| **Study Room** | Wooden desk, open Bible, desk lamp, leather chair, bookshelf with colored books, red rug | Cozy devotional glow |
| **Office** | Monitor, keyboard, Bible with gold bookmark, coffee mug, plant, whiteboard | Cool modern blue |
| **Garden** | Stone path, 5 trees, 20 flowers, bench, fountain with water, wooden cross | Warm sunlit paradise |
| **Mountain** | Snow-capped peaks, reflective lake, pine trees, hilltop cross, panoramic view | Majestic open sky |

**Each environment features:**
- Auto-rotating camera orbit for ambient viewing
- Explorable mode with a walkable character
- Warm multi-source lighting (ambient + directional + point lights)
- Scene fog for depth and atmosphere
- Fullscreen toggle for total immersion

<p align="right">(<a href="#holy-bible">back to top</a>)</p>

---

## The Character

A **Minecraft-style blocky humanoid** built from ~20 box geometries — inspired by [Claw3D](https://github.com/iamlukethedev/Claw3D).

```
Character (scale 0.8)
├── Head — skin box with eyes, mouth, brown hair
├── Torso — green shirt with gold cross necklace
├── Left Arm — swings forward/back while walking
├── Right Arm — holds a small Bible
├── Left Leg — alternates with right arm
├── Right Leg — alternates with left arm
└── Shadow — circle underneath
```

### Procedural Animation

All animation is `Math.sin()` — no keyframes, no animation files:

- **Walk cycle** — Arms and legs swing in opposite phases at 0.5 rad amplitude
- **Bounce** — Body oscillates on Y axis while walking
- **Head bob** — Subtle Z-rotation sway
- **Idle breathing** — Slow Y oscillation when standing still
- **Smooth turning** — Shortest-path rotation delta at 12% per frame

### Controls

| Platform | Move | Camera |
|---|---|---|
| **Web** | `WASD` or Arrow Keys | Mouse drag to orbit, scroll to zoom |
| **Mobile** | Virtual joystick (bottom-left) | Touch drag to orbit |

Movement is **relative to camera angle** — press W to walk toward where the camera is looking.

<p align="right">(<a href="#holy-bible">back to top</a>)</p>

---

## Tech Stack

<p align="center">
  <img src="https://img.shields.io/badge/Expo_55-000020?style=for-the-badge&logo=expo&logoColor=white" alt="Expo" />
  <img src="https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/React_Native_0.83-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React Native" />
  <img src="https://img.shields.io/badge/TypeScript_5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Three.js_0.183-000000?style=for-the-badge&logo=threedotjs&logoColor=white" alt="Three.js" />
  <img src="https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLite" />
</p>

| Layer | Technology | Purpose |
|---|---|---|
| Framework | Expo 55 | Cross-platform (iOS, Android, Web) from one codebase |
| UI | React 19 + React Native 0.83 | Component-based UI rendering |
| Navigation | Expo Router | File-based routing with tabs |
| Language | TypeScript 5.9 (strict) | Full type safety |
| 3D Graphics | Three.js + expo-gl + expo-three | 3D scene rendering on all platforms |
| Database | expo-sqlite | Local persistence for bookmarks, notes, prayers, chapter cache |
| Storage | AsyncStorage | Key-value persistence for settings, auth, streaks |
| Audio | expo-speech | Text-to-speech Bible reading |
| Camera | expo-camera + expo-image-picker | Verse photo overlays |
| Microphone | expo-av | Voice prayer recording |
| Animations | react-native-reanimated | Performant UI animations |

<p align="right">(<a href="#holy-bible">back to top</a>)</p>

---

## Architecture

```
holy-bible/
├── app/                          # Screens (file-based routing)
│   ├── _layout.tsx               # Root: Auth → App → Theme → Stack
│   ├── auth.tsx                  # Sign In / Sign Up
│   └── (tabs)/
│       ├── index.tsx             # Bible Reader
│       ├── spaces.tsx            # 3D Sacred Spaces
│       ├── community.tsx         # Globe + Prayer Wall
│       ├── daily.tsx             # Daily Verse
│       ├── more.tsx              # Settings + Navigation Hub
│       ├── search.tsx            # Verse Search
│       ├── bookmarks.tsx         # Saved Items
│       └── prayers.tsx           # Prayer Journal
│
├── lib/                          # Business Logic
│   ├── database.ts               # SQLite (7 tables, 30+ functions)
│   ├── api.ts                    # Bible API + caching
│   ├── bible-data.ts             # 66 book metadata
│   ├── red-letter.ts             # 1,200+ verse refs for Jesus's words
│   ├── auth.tsx                  # Auth context
│   ├── context.tsx               # App state context
│   ├── streak.ts                 # Reading streak logic
│   ├── community.ts              # Community data layer
│   ├── reading-plans.ts          # 4 guided plans
│   └── daily-verse.ts            # 31 rotating verses
│
├── components/                   # Reusable UI
│   ├── VerseText.tsx             # Verse display + actions
│   ├── VerseCard.tsx             # Shareable image cards
│   ├── VerseCamera.tsx           # Photo verse overlay
│   ├── VoicePrayer.tsx           # Mic recording + transcription
│   ├── Globe3D.tsx               # Animated community globe
│   ├── WelcomeScreen.tsx         # Onboarding
│   ├── BookSelector.tsx          # Book picker modal
│   ├── ChapterSelector.tsx       # Chapter picker modal
│   ├── StreakBadge.tsx            # Streak flame display
│   └── scenes/                   # 3D System
│       ├── SceneRenderer.tsx     # Three.js renderer (web + native)
│       ├── Character.ts          # Blocky humanoid character
│       ├── InputController.ts    # Keyboard + mouse controllers
│       ├── VirtualJoystick.tsx   # Touch joystick
│       └── scenes.ts             # 5 environment configs
│
└── constants/
    └── Colors.ts                 # 16 semantic tokens × 2 themes
```

**~7,000 lines of TypeScript** | **40+ source files** | **0 external 3D model files**

<p align="right">(<a href="#holy-bible">back to top</a>)</p>

---

## Roadmap

- [x] KJV Bible reader with offline caching
- [x] Red Letter Edition (Jesus's words in red)
- [x] Bookmarks, highlights (6 colors), notes
- [x] Reading plans with progress tracking
- [x] Prayer journal with categories + answered tracking
- [x] Voice prayer recording with transcription
- [x] Reading streak tracker
- [x] Daily verse with sharing
- [x] Verse image card generator (6 themes)
- [x] Verse photo overlay (camera integration)
- [x] Text-to-speech audio playback
- [x] 5 immersive 3D Sacred Spaces
- [x] Explorable character with walk animation
- [x] WASD + virtual joystick + follow camera
- [x] Community globe with prayer wall
- [x] Auth system (sign in/up)
- [x] Dark/light theme
- [x] Welcome onboarding
- [ ] Multiple Bible translations (NIV, ESV, NLT)
- [ ] AI Bible assistant (verse explanation, Q&A)
- [ ] Gamification (XP, badges, verse memorization, quizzes)
- [ ] Guided meditations in 3D spaces
- [ ] Biblical scene recreations (Creation, Exodus, Crucifixion)
- [ ] Multiplayer Sacred Spaces
- [ ] Push notification reminders
- [ ] Lock screen widget
- [ ] Church integration
- [ ] AR Bible mode

See the full plan in [`MASTER-PLAN.md`](MASTER-PLAN.md).

<p align="right">(<a href="#holy-bible">back to top</a>)</p>

---

## Contributing

Contributions make this project better. Any contribution is **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/amazing-feature`)
3. Commit your Changes (`git commit -m 'Add amazing feature'`)
4. Push to the Branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Top Contributors

<a href="https://github.com/your-username/holy-bible/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=your-username/holy-bible" />
</a>

<p align="right">(<a href="#holy-bible">back to top</a>)</p>

---

## License

Distributed under the MIT License. See `LICENSE` for more information.

The King James Version Bible text is in the public domain.

---

<div align="center">
  <p><i>"Thy word is a lamp unto my feet, and a light unto my path."</i></p>
  <p><b>— Psalm 119:105</b></p>
</div>
