<div align="center">
  <img src="assets/logo_300.png" width="120" height="120" alt="Enhancer for Physics Wallah Logo" />
  
  # Enhancer for Physics Wallah
  ### Supercharge your lecture experience on `pw.live` with speed controls, smart silence skipping, and 1-click focus tools

  [![Version: 1.0.8.2](https://img.shields.io/badge/version-1.0.8.2-blue.svg)](#)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Preact](https://img.shields.io/badge/Preact-10-673AB8?logo=preact&logoColor=white)](https://preactjs.com/)
  [![Manifest V3](https://img.shields.io/badge/Manifest-V3-success)](#)
  [![Privacy](https://img.shields.io/badge/Privacy-100%25%20Local-brightgreen)](#-privacy--security)

  <p align="center">
    <a href="https://chromewebstore.google.com/detail/pw-control/ibepglcdcaanmkledmpgfapaffkhbadj"><img src="https://developer.chrome.com/static/docs/webstore/branding/image/206x58-chrome-web-bcb82d15b2486.png" alt="Available in the Chrome Web Store" height="46"></a>
    &nbsp;&nbsp;
    <a href="https://addons.mozilla.org/en-US/firefox/addon/enhancer-for-physics-wallah/"><img src="https://blog.mozilla.org/addons/files/2020/04/get-the-addon-fx-apr-2020.svg" alt="Get the Add-on for Firefox" height="46"></a>
    &nbsp;&nbsp;
    <a href="https://microsoftedge.microsoft.com/addons/detail/pw-control/cnoboofnelihfmnjfbpbelpfdmogfaan"><img src="https://developer.microsoft.com/store/badges/images/English_get-it-from-MS.png" alt="Get it from Microsoft Edge" height="46"></a>
  </p>

  **Enhancer for Physics Wallah** gives students total control over their learning workflow on Physics Wallah student portals. Speed up lectures up to 4.0x, automatically skip teacher pauses with real-time audio detection, calculate dynamic finish times, auto-pause when switching tabs, and instantly declutter on-screen distractions with 1 click.

  [Install](#-installation) • [Features](#-features) • [Hotkeys](#-keyboard-shortcuts) • [FAQ](#-frequently-asked-questions) • [Privacy](#-privacy--security) • [Contributing](CONTRIBUTING.md)
</div>

---

## 🚀 Installation

Install the extension directly with one click from your browser's official store:

| Store Link | Active Users | Rating & Reviews |
| :--- | :--- | :--- |
| [**Chrome Web Store**](https://chromewebstore.google.com/detail/pw-control/ibepglcdcaanmkledmpgfapaffkhbadj) | [![Chrome Web Store Users](https://img.shields.io/chrome-web-store/users/ibepglcdcaanmkledmpgfapaffkhbadj?style=flat&logo=google-chrome&logoColor=white&color=blue&label=Users)](https://chromewebstore.google.com/detail/pw-control/ibepglcdcaanmkledmpgfapaffkhbadj) | [![Chrome Web Store Rating](https://img.shields.io/chrome-web-store/rating/ibepglcdcaanmkledmpgfapaffkhbadj?style=flat&logo=google-chrome&logoColor=white&color=brightgreen&label=Rating)](https://chromewebstore.google.com/detail/pw-control/ibepglcdcaanmkledmpgfapaffkhbadj) |
| [**Firefox Add-ons**](https://addons.mozilla.org/en-US/firefox/addon/enhancer-for-physics-wallah/) | [![Firefox Add-ons Users](https://img.shields.io/amo/users/enhancer-for-physics-wallah?style=flat&logo=firefox-browser&logoColor=white&color=orange&label=Users)](https://addons.mozilla.org/en-US/firefox/addon/enhancer-for-physics-wallah/) | [![Firefox Add-ons Rating](https://img.shields.io/amo/rating/enhancer-for-physics-wallah?style=flat&logo=firefox-browser&logoColor=white&color=brightgreen&label=Rating)](https://addons.mozilla.org/en-US/firefox/addon/enhancer-for-physics-wallah/) |
| [**Microsoft Edge Add-ons**](https://microsoftedge.microsoft.com/addons/detail/pw-control/cnoboofnelihfmnjfbpbelpfdmogfaan) | [![Edge Users](https://img.shields.io/badge/Users-Active-0078D7?style=flat&logo=microsoft-edge&logoColor=white)](https://microsoftedge.microsoft.com/addons/detail/pw-control/cnoboofnelihfmnjfbpbelpfdmogfaan) | [![Edge Rating](https://img.shields.io/badge/Rating-★★★★★-brightgreen?style=flat&logo=microsoft-edge&logoColor=white)](https://microsoftedge.microsoft.com/addons/detail/pw-control/cnoboofnelihfmnjfbpbelpfdmogfaan) |

---

## ✨ Features

### ⚡ 1. Video Playback & Speed HUD
* **Extended Speed Range:** Fine-tune video playback speed from `0.5x` up to `4.0x` in precise `0.1x` steps.
* **4-Point Segmented Slider:** Equal-distance quick-snap slider with magnetic point attraction (customizable defaults: `1.0x`, `2.0x`, `3.0x`, `4.0x`).
* **SVG Speedometer Dial:** Real-time animated dial needle reflecting your exact playback speed.
* **Mouse Wheel Adjustment:** Hover over the on-player speed badge and scroll your mouse wheel to quickly step speeds up or down by `0.1x`.
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
* **Real-Time Finish Clock:** Displays the exact wall-clock time your lecture will end, dynamically recalculated whenever you change video speeds or seek.
* **Customizable Formats:**
  * **Minimal:** `10:45 AM`
  * **Clock:** `Ends at 10:45 AM`
  * **Full:** `Ends at 10:45 AM • 28m left`

---

### 🎯 4. Focus Mode & Distraction Decluttering
* **1-Click Instant Focus Mode:** Click the chevron arrow button on the toolbar to collapse all controls, sidebars, and mouse cursor for a clean, cinematic study experience. Move your mouse or touch the screen to bring them back.
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

## ❓ Frequently Asked Questions

<details>
<summary><b>1. Why aren't keyboard shortcuts working when I press keys?</b></summary>
<br/>
Keyboard shortcuts are <b>disabled by default</b> so they don't accidentally interfere when you are typing search queries, comments, or study notes. You can enable them with one click inside the extension popup under the <b>Speed</b> tab.
</details>

<details>
<summary><b>2. How does Skip Silence detect teacher pauses?</b></summary>
<br/>
Skip Silence uses real-time audio analysis directly inside your browser. It continuously measures the teacher's background room noise over a rolling 10-second buffer. When the sound drops below the speech threshold, the video automatically speeds up and smoothly returns to normal speed as soon as the teacher begins talking.
</details>

<details>
<summary><b>3. How do I exit Instant Focus Mode?</b></summary>
<br/>
Simply move your mouse cursor or tap anywhere on your screen. The player controls, toolbar, and badges will smoothly fade back into view.
</details>

<details>
<summary><b>4. Does this work on live lectures or only recorded videos?</b></summary>
<br/>
All speed controls, focus mode decluttering, and finish time estimates work seamlessly on recorded batch lectures. On live streams, speed adjustments are handled dynamically within the available live stream buffer.
</details>

---

## 🔒 Privacy & Security

This extension runs **100% locally** on your computer:
* **Zero Telemetry / Analytics:** No personal information, watch history, or login credentials are saved or transmitted to any external server.
* **Local Storage Only:** Settings (custom speeds, hotkeys, theme) are saved strictly inside your browser's local storage.
* **Official Domains Only:** Operates exclusively on Physics Wallah portals (`pw.live`, `penpencil.co`, `penpencil.xyz`, `pwnet.in`).

Read our complete [Privacy Policy](PRIVACY_POLICY.md) for details.

---

## 👩‍💻 Want to Build or Contribute?

We welcome open-source contributions! Whether you want to add new features, fix a bug, or improve styling, check out our developer guide:

👉 **[Read CONTRIBUTING.md](CONTRIBUTING.md)** for:
- 🛠️ Local development setup (`git clone`, `npm run dev`)
- 🗺️ Complete TypeScript architecture map
- 🍳 Step-by-step developer recipes (Adding toggles, HUD widgets, hotkeys)
- 🔍 Testing, debugging & PR guidelines

---

## 📄 License & Acknowledgements

* **License:** Distributed under the [MIT License](LICENSE).
* **Acknowledgements:** Special thanks to [vantezzen/skip-silence](https://github.com/vantezzen/skip-silence) for the open-source audio processing ideas that inspired our Skip Silence feature.
