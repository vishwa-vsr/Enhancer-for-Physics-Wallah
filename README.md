<div align="center">
  <img src="assets/logo_300.png" width="120" height="120" alt="Enhancer for Physics Wallah Logo" />
  
  # Enhancer for Physics Wallah
  ### Video playback control, smart silence skipping, and focus tools for `pw.live`

  [![Version: 1.0.8.2](https://img.shields.io/badge/version-1.0.8.2-blue.svg)](#)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
  [![Chrome Web Store](https://img.shields.io/badge/Chrome-Extension-blue?logo=google-chrome&logoColor=white)](https://chromewebstore.google.com/detail/pw-control/ibepglcdcaanmkledmpgfapaffkhbadj)
  [![Firefox Add-ons](https://img.shields.io/badge/Firefox-Add--on-orange?logo=firefox-browser&logoColor=white)](https://addons.mozilla.org/en-US/firefox/addon/enhancer-for-physics-wallah/)
  [![Edge Add-ons](https://img.shields.io/badge/Edge-Add--on-green?logo=microsoft-edge&logoColor=white)](https://microsoftedge.microsoft.com/addons/detail/pw-control/cnoboofnelihfmnjfbpbelpfdmogfaan)

  **Enhancer for Physics Wallah** gives you full control over video playback on Physics Wallah student portals. Adjust playback speed up to 4.0x, automatically skip teacher pauses with smart audio detection, auto-pause when switching tabs, and hide distracting page elements.

  [Install](#-installation) • [Features](#-features) • [Hotkeys](#-keyboard-shortcuts) • [Building Locally](#-building-from-source) • [Contributing](#-contributing)
</div>

---

## 🚀 Installation

### Official Web Stores
Install the extension directly from your browser's official store:
* **Google Chrome:** [Chrome Web Store](https://chromewebstore.google.com/detail/pw-control/ibepglcdcaanmkledmpgfapaffkhbadj)
* **Mozilla Firefox:** [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/enhancer-for-physics-wallah/)
* **Microsoft Edge:** [Microsoft Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/pw-control/cnoboofnelihfmnjfbpbelpfdmogfaan)

### Developer Mode (Local Installation)
If you want to run the latest unreleased version directly from source:
1. Download or clone this repository.
2. Install dependencies and build:
   ```bash
   npm install
   npm run build
   ```
3. Open your browser's extension manager:
   * **Chrome / Brave:** Navigate to `chrome://extensions`
   * **Edge:** Navigate to `edge://extensions`
   * **Firefox:** Navigate to `about:debugging#/runtime/this-firefox`
4. Turn on **Developer mode** (top-right toggle).
5. Click **Load unpacked** (or **Load Temporary Add-on** in Firefox) and select the generated folder:
   * Chrome / Edge: Select `dist/chrome` or `dist/edge`
   * Firefox: Select `dist/firefox/manifest.json`

---

## ✨ Features

### ⚡ Playback Controls
* **Extended Speed Range:** Adjust playback speed from `0.5x` up to `4.0x` in fine `0.1x` steps.
* **Custom Speed Presets:** Configure up to 4 quick-select speed points (default: `1.0x`, `2.0x`, `3.0x`, `4.0x`).
* **Mouse Scroll Adjust:** Hover over the on-player speed slider and scroll your mouse wheel to change speeds quickly.
* **Hold Space to Accelerate:** Hold down <kbd>Spacebar</kbd> to temporarily boost speed (default `2.0x`), releasing to return to your normal speed.

### 🔇 Skip Silence (Beta)
* **Automatic Fast-Forward:** Speeds up through teacher pauses, whiteboard writing, and silent thinking time (from `1.5x` up to `6.0x`).
* **Auto Noise Calibration:** Analyzes background room noise over a rolling 10-second window to detect silence accurately without manual tuning.
* **Manual Threshold Option:** Adjust sensitivity manually from `-60 dB` to `-20 dB`.
* **Mute During Silence:** Optional toggle to mute audio while silent fast-forwarding is active.
* **Time Saved Tracker:** Displays the total study time saved across your lecture sessions.

### 🎯 Focus & Clean Mode
Hide distracting UI elements with one click from the popup menu:
* **Auto-pause on Tab Switch:** Pauses video automatically when you switch tabs or minimize the browser, resuming when you return.
* Hide **Ask AI** helper button
* Hide **Doubt Q&A** panel
* Hide **Live Chat** and comments
* Hide **Study Notes** tabs
* Hide **Timeline** or **Time Display**

---

## ⌨️ Keyboard Shortcuts

Hotkeys are **disabled by default**. You can enable and customize them inside the extension popup:

| Action | Default Shortcut | Description |
| :--- | :---: | :--- |
| **Speed Up** | <kbd>h</kbd> | Increases speed by `0.1x` |
| **Slow Down** | <kbd>j</kbd> | Decreases speed by `0.1x` |
| **Reset Speed** | <kbd>l</kbd> | Resets speed back to `1.0x` |
| **Hold Boost** | <kbd>Space</kbd> *(Hold)* | Plays at boost speed while held down |

---

## 🔒 Privacy & Permissions

This extension runs completely client-side in your browser.
* **Zero Telemetry / Tracking:** No user data, watch history, or login credentials are saved or transmitted.
* **Local Storage Only:** Uses browser `storage` strictly to remember your settings (speed presets, toggle states, theme).
* **Target Sites:** Runs only on Physics Wallah video portals:
  * `*://*.pw.live/*`
  * `*://*.penpencil.co/*`
  * `*://*.penpencil.xyz/*`
  * `*://*.pwnet.in/*`

Read our complete [Privacy Policy](PRIVACY_POLICY.md) for details.

---

## 📂 Project Structure

```
Enhancer-for-Physics-Wallah/
├── src/                  # Source code
│   ├── shared/           # Shared design tokens, types, components & storage
│   ├── popup/            # Extension popup (Preact + TypeScript + CSS Modules)
│   ├── content.js        # Video player injection & speed logic
│   ├── content.css       # Video player overlay styles
│   ├── background.js     # Background service worker
│   ├── manifest.json     # Extension manifest (Manifest V3)
│   └── icons/            # High-resolution extension icons
├── assets/               # Extension icons and promotional art
├── docs/                 # Specifications & study planner architecture
├── dist/                 # Generated production builds (Git-ignored)
│   ├── chrome/           # Build for Chrome / Chromium
│   ├── edge/             # Build for Microsoft Edge
│   └── firefox/          # Build for Mozilla Firefox (Gecko manifest)
├── package.json          # Dependencies, build scripts & package manifest
├── vite.config.ts        # Vite multi-target bundler configuration
└── tsconfig.json         # TypeScript strict-mode configuration
```

---

## 🛠️ Building from Source

### 1. Development Mode (Hot Reload)
```bash
npm run dev
```

### 2. Build Production Distribution Folders
```bash
npm run build
```
Outputs optimized production builds into `dist/chrome`, `dist/edge`, and `dist/firefox`.

### 3. Build Store-Ready Release Zip Archives
```bash
npm run zip
```
Creates upload-ready `.zip` bundles inside the `dist/` directory for the Chrome Web Store, Edge Add-ons, and Mozilla Add-ons.

---

## 🤝 Contributing

Contributions are welcome! Read our [CONTRIBUTING.md](CONTRIBUTING.md) guide for details on setting up your environment, code style, and submitting pull requests.

---

## 📄 License & Credits

* **License:** Distributed under the [MIT License](LICENSE).
* **Acknowledgements:** Special thanks to [vantezzen/skip-silence](https://github.com/vantezzen/skip-silence) for the open-source audio processing ideas and noise floor calibration patterns that inspired our Skip Silence feature.
