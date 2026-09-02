<div align="center">
  <img src="assets/logo_300.png" width="120" height="120" alt="Enhancer for Physics Wallah Logo" />
  
  # Enhancer for Physics Wallah
  ### Supercharge your lecture experience on `pw.live` with speed controls, smart silence skipping, and 1-click focus tools

  [![Version: 1.0.8.2](https://img.shields.io/badge/version-1.0.8.2-blue.svg)](#)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Preact](https://img.shields.io/badge/Preact-10-673AB8?logo=preact&logoColor=white)](https://preactjs.com/)
  [![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
  [![Manifest V3](https://img.shields.io/badge/Manifest-V3-success)](#)
  
  [![Chrome Web Store](https://img.shields.io/badge/Chrome-Extension-4285F4?logo=google-chrome&logoColor=white)](https://chromewebstore.google.com/detail/pw-control/ibepglcdcaanmkledmpgfapaffkhbadj)
  [![Firefox Add-ons](https://img.shields.io/badge/Firefox-Add--on-FF7139?logo=firefox-browser&logoColor=white)](https://addons.mozilla.org/en-US/firefox/addon/enhancer-for-physics-wallah/)
  [![Edge Add-ons](https://img.shields.io/badge/Edge-Add--on-0078D7?logo=microsoft-edge&logoColor=white)](https://microsoftedge.microsoft.com/addons/detail/pw-control/cnoboofnelihfmnjfbpbelpfdmogfaan)

  **Enhancer for Physics Wallah** gives students total control over their learning workflow on Physics Wallah student portals. Speed up lectures up to 4.0x, automatically skip teacher pauses with real-time audio detection, calculate dynamic finish times, auto-pause when switching tabs, and instantly declutter on-screen distractions with 1 click.

  [Install](#-installation) • [Features](#-features) • [Hotkeys](#-keyboard-shortcuts) • [Architecture](#-project-architecture) • [Building Locally](#-building-from-source) • [Contributing](#-contributing)
</div>

---

## 🚀 Installation

### 🌐 Official Web Stores
Install the extension directly with one click from your browser's official store:

| Store Link | Active Users | Rating & Reviews |
| :--- | :--- | :--- |
| [**Chrome Web Store**](https://chromewebstore.google.com/detail/pw-control/ibepglcdcaanmkledmpgfapaffkhbadj) | [![Chrome Web Store Users](https://img.shields.io/chrome-web-store/users/ibepglcdcaanmkledmpgfapaffkhbadj?style=flat&logo=google-chrome&logoColor=white&color=blue&label=Users)](https://chromewebstore.google.com/detail/pw-control/ibepglcdcaanmkledmpgfapaffkhbadj) | [![Chrome Web Store Rating](https://img.shields.io/chrome-web-store/rating/ibepglcdcaanmkledmpgfapaffkhbadj?style=flat&logo=google-chrome&logoColor=white&color=brightgreen&label=Rating)](https://chromewebstore.google.com/detail/pw-control/ibepglcdcaanmkledmpgfapaffkhbadj) |
| [**Firefox Add-ons**](https://addons.mozilla.org/en-US/firefox/addon/enhancer-for-physics-wallah/) | [![Firefox Add-ons Users](https://img.shields.io/amo/users/enhancer-for-physics-wallah?style=flat&logo=firefox-browser&logoColor=white&color=orange&label=Users)](https://addons.mozilla.org/en-US/firefox/addon/enhancer-for-physics-wallah/) | [![Firefox Add-ons Rating](https://img.shields.io/amo/rating/enhancer-for-physics-wallah?style=flat&logo=firefox-browser&logoColor=white&color=brightgreen&label=Rating)](https://addons.mozilla.org/en-US/firefox/addon/enhancer-for-physics-wallah/) |
| [**Microsoft Edge Add-ons**](https://microsoftedge.microsoft.com/addons/detail/pw-control/cnoboofnelihfmnjfbpbelpfdmogfaan) | [![Edge Users](https://img.shields.io/badge/Users-Active-0078D7?style=flat&logo=microsoft-edge&logoColor=white)](https://microsoftedge.microsoft.com/addons/detail/pw-control/cnoboofnelihfmnjfbpbelpfdmogfaan) | [![Edge Rating](https://img.shields.io/badge/Rating-★★★★★-brightgreen?style=flat&logo=microsoft-edge&logoColor=white)](https://microsoftedge.microsoft.com/addons/detail/pw-control/cnoboofnelihfmnjfbpbelpfdmogfaan) |

---

### 💻 Developer Mode (Run from Source)
To test the latest unreleased features directly from source:
1. Clone this repository:
   ```bash
   git clone https://github.com/vishwa-vsr/Enhancer-for-Physics-Wallah.git
   cd Enhancer-for-Physics-Wallah
   ```
2. Install dependencies and compile:
   ```bash
   npm install
   npm run build
   ```
3. Open your browser's extension management page:
   * **Chrome / Brave:** `chrome://extensions`
   * **Edge:** `edge://extensions`
   * **Firefox:** `about:debugging#/runtime/this-firefox`
4. Enable **Developer mode** (top-right toggle).
5. Click **Load unpacked** (or **Load Temporary Add-on** in Firefox) and select the generated folder:
   * **Chrome / Edge / Brave:** Select `dist/chrome` or `dist/edge`
   * **Firefox:** Select `dist/firefox/manifest.json`

---

## ✨ Features

### ⚡ 1. Video Playback & Speed HUD
* **Extended Speed Range:** Fine-tune video speeds from `0.5x` up to `4.0x` in precise `0.1x` increments.
* **4-Point Segmented Slider:** Equal-distance quick-snap slider with magnetic point attraction (customizable defaults: `1.0x`, `2.0x`, `3.0x`, `4.0x`).
* **SVG Speedometer Dial:** Real-time animated dial needle reflecting your exact playback rate.
* **Mouse Wheel Adjustment:** Hover over the on-player speed badge and scroll your mouse wheel to effortlessly step speeds up or down by `0.1x`.
* **Hold Space to Accelerate:** Hold down <kbd>Spacebar</kbd> to temporarily boost speed (default `2.0x`), releasing it to instantly return to your normal speed. Quick-tap toggles Play/Pause.

---

### 🔇 2. Smart Skip Silence (Beta)
* **Automatic Fast-Forwarding:** Accelerates through teacher pauses, whiteboard writing, and quiet thinking moments (from `1.5x` up to `6.0x`).
* **Rolling Noise-Floor Auto Calibration:** Analyzes background room noise over a 10-second rolling window to adaptively detect silence without manual tuning.
* **Manual Threshold Sensitivity:** Optional manual threshold slider ranging from `-60 dB` (quietest) to `-20 dB` (loudest).
* **Mute During Silence:** Optional toggle to mute audio while silent fast-forwarding is active.
* **Live Visualizer & Time Saved Tracker:** 5-bar live audio equalizer inside the player toolbar and an accumulated study time saved tracker.

---

### ⏰ 3. Dynamic Lecture Finish Time Badge
* **Real-Time Finish Clock:** Displays the exact wall-clock time your lecture will end, dynamically recalculated whenever you change video speeds or skip forward.
* **Customizable Formats:**
  * **Minimal:** `10:45 AM`
  * **Clock:** `Ends at 10:45 AM`
  * **Full:** `Ends at 10:45 AM • 28m left`

---

### 🎯 4. Focus Mode & Distraction Decluttering
* **1-Click Instant Focus Mode:** Click the chevron arrow button on the toolbar to collapse all controls, sidebars, and mouse cursor for a cinematic study experience. Move your mouse or touch the screen to bring them back.
* **Auto-Pause on Tab Switch:** Pauses the lecture automatically when switching tabs or minimizing the browser, and resumes seamlessly when you return.
* **Granular Element Toggles:** Individually hide:
  * 🤖 **Ask AI** helper button
  * ❓ **Doubt / Q&A** panel
  * 💬 **Live Chat** and comments
  * 📝 **Study Notes** buttons & Note Timeline
  * ⚙️ **Settings gear** icon
  * ⏱️ **Video Timeline / Seekbar** & Time texts

---

## ⌨️ Keyboard Shortcuts

Hotkeys can be customized or toggled on/off in the extension popup:

| Action | Default Shortcut | Description |
| :--- | :---: | :--- |
| **Speed Up** | <kbd>h</kbd> | Increases playback speed by `0.1x` |
| **Slow Down** | <kbd>j</kbd> | Decreases playback speed by `0.1x` |
| **Reset Speed** | <kbd>l</kbd> | Resets playback speed back to `1.0x` |
| **Hold Boost** | <kbd>Space</kbd> *(Hold)* | Plays at boost speed while held down |
| **Play / Pause** | <kbd>Space</kbd> *(Tap)* | Standard play / pause toggle |

---

## 🔒 Privacy & Permissions

This extension runs **100% locally** in your browser:
* **Zero Telemetry / Tracking:** No user data, viewing habits, or login credentials are collected, stored, or sent to external servers.
* **Local Storage Only:** Uses browser `storage` exclusively on your device to remember your speed presets, hotkeys, and toggle preferences.
* **Strict Target Permissions:** Runs only on official Physics Wallah video portals:
  * `*://*.pw.live/*`
  * `*://*.penpencil.co/*`
  * `*://*.penpencil.xyz/*`
  * `*://*.pwnet.in/*`

Read our complete [Privacy Policy](PRIVACY_POLICY.md) for details.

---

## 📂 Project Architecture

```
Enhancer-for-Physics-Wallah/
├── src/
│   ├── shared/                   # Shared types, storage helpers, design tokens & theme
│   ├── popup/                    # Preact + TypeScript + CSS Modules popup interface
│   │   ├── components/           # Header, Footer, and shared layouts
│   │   └── features/             # SpeedTab, FocusTab, SilenceTab, ReviewModal
│   ├── content/                  # Modular TypeScript content script architecture
│   │   ├── index.ts              # Entry point coordinating listeners & observers
│   │   ├── types.ts              # Content state interfaces & AudioGraph types
│   │   ├── state.ts              # Safe storage access & reactive state store
│   │   └── modules/
│   │       ├── video/            # Shadow-DOM video detector & playback rate controller
│   │       ├── distractions/     # PW toolbar finder & relative offset button hider
│   │       ├── ui/               # Speed HUD, finish time badge, focus mode, visualizer & toast
│   │       ├── audio/            # Skip silence AudioWorklet & noise-floor calibration engine
│   │       ├── shortcuts/        # Hotkeys & capture-phase spacebar hold handlers
│   │       ├── visibility/       # Auto pause/resume on background tab switch
│   │       └── dom/              # Throttled MutationObserver & safety interval
│   ├── content.css               # In-player widget styling & CSS declutter rules
│   ├── background.js             # Background service worker (Manifest V3 lifecycle)
│   └── manifest.json             # Base extension manifest configuration
├── dist/                         # Generated production distributions (Git-ignored)
│   ├── chrome/                   # Production build for Chrome / Brave / Opera
│   ├── edge/                     # Production build for Microsoft Edge
│   └── firefox/                  # Production build for Mozilla Firefox
├── vite.config.ts                # Multi-target Vite & esbuild bundler configuration
└── tsconfig.json                 # TypeScript strict configuration
```

---

## 🛠️ Building from Source

### 1. Development Mode (Hot Module Replacement)
```bash
npm run dev
```

### 2. Build Production Distribution Folders
```bash
npm run build
```
Typechecks with `tsc --noEmit` and bundles optimized production builds into `dist/chrome`, `dist/edge`, and `dist/firefox`.

### 3. Package Store-Ready Zip Archives
```bash
npm run package
```
Builds the project and compresses upload-ready `.zip` bundles inside `dist/` (`pw-chrome-*.zip`, `pw-firefox-*.zip`, `pw-edge-*.zip`).

### 4. Lint and Code Formatting
```bash
npm run lint      # Runs ESLint across all TypeScript and TSX files
npm run format    # Auto-formats all code using Prettier
```

---

## 🤝 Contributing

Contributions are warmly welcomed! Please read our [CONTRIBUTING.md](CONTRIBUTING.md) guide for environment setup, developer recipes, coding standards, and PR guidelines.

---

## 📄 License & Acknowledgements

* **License:** Distributed under the [MIT License](LICENSE).
* **Acknowledgements:** Special thanks to [vantezzen/skip-silence](https://github.com/vantezzen/skip-silence) for the open-source audio processing ideas and noise-floor calibration patterns that inspired our Skip Silence feature.
