<div align="center">
  <img src="assets/logo_300.png" width="120" height="120" alt="Enhancer for Physics Wallah Logo" />
  
  #  Enhancer for Physics Wallah
  ### Playback Speed & Focus Extension for Physics Wallah (`pw.live`)

  [![Version: 1.0.7.2](https://img.shields.io/badge/version-1.0.7.2-blue.svg)](#)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
  [![Chrome Web Store](https://img.shields.io/badge/Chrome-Extension-blue?logo=google-chrome&logoColor=white)](https://chromewebstore.google.com/detail/pw-control/ibepglcdcaanmkledmpgfapaffkhbadj)
  [![Firefox Add-ons](https://img.shields.io/badge/Firefox-Add--on-orange?logo=firefox-browser&logoColor=white)](https://addons.mozilla.org/en-US/firefox/addon/enhancer-for-physics-wallah/)
  [![Edge Add-ons](https://img.shields.io/badge/Edge-Add--on-green?logo=microsoft-edge&logoColor=white)](https://microsoftedge.microsoft.com/addons/detail/pw-control/cnoboofnelihfmnjfbpbelpfdmogfaan)

  **Enhancer for Physics Wallah** is a simple, lightweight browser extension that gives you complete control over your video playback on the `pw.live` student portal. It adds a custom speed slider (from `0.5x` up to `4.0x`), automatic **Skip Silence (Beta)** acceleration, Picture-in-Picture mode, and toggles to hide distracting screen elements (like chats, notes, and doubt boxes) directly inside the video player.

  [Direct Download](#-direct-store-downloads) • [Key Features](#-key-features) • [Project Structure](#-project-structure) • [How to Build](#-how-to-build)
</div>

---

## 📖 Overview

Default online video players are often slow, limited to 2x speed, and filled with distracting sidebars. 

This extension lets you:
- **Set any speed** up to `4.0x` (with customized preset buttons and a hold-space speedup option).
- **Pop out Picture-in-Picture** floating player to multitask while watching lectures across any app.
- **Hide screen clutter** with simple toggles to hide notes, doubt boxes, and floating AI buttons.

> [!NOTE]
> Enhancer for Physics Wallah is built with **zero external dependencies** (no frameworks, no heavy libraries) using vanilla JavaScript, HTML, and CSS. This keeps it incredibly light, memory-efficient, and fast.

---

## 🚀 Installation & Download

### 🌐 Direct Store Downloads
Get the extension officially from your browser's store:
* **Google Chrome:** [Download from Chrome Web Store](https://chromewebstore.google.com/detail/pw-control/ibepglcdcaanmkledmpgfapaffkhbadj)
* **Mozilla Firefox:** [Download from Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/pw-control/)
* **Microsoft Edge:** [Download from Microsoft Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/pw-control/cnoboofnelihfmnjfbpbelpfdmogfaan)

### 🛠️ Developer Mode Install (Local Testing)
If you want to run the latest development code locally:
1. Clone or download this repository.
2. Open your browser's extensions page (`chrome://extensions` or `edge://extensions`).
3. Toggle **Developer mode** on in the top-right.
4. Click **Load unpacked** in the top-left and select the `dist/chrome` (or `dist/edge`) folder.

---

## 🌟 Key Features

### 🔇 Skip Silence (Beta)
* **Intelligent Auto-Skipping**: Automatically accelerates through teacher pauses, whiteboard writing, and silent thinking time.
* **Auto Noise Calibration**: Automatically calculates the room's noise floor over a rolling 10-second history so you don't have to fiddle with manual settings.
* **Decibel-Based Silence Threshold**: Fine-tune the sensitivity in real decibels (`-60 dB` to `-20 dB`) with intuitive **Strict** vs. **Aggressive** controls.
* **Smooth 200ms Acceleration**: Glides smoothly into silence speed on each audio sample tick (~23ms) with studio-grade clickless audio fades.
* **Live On-Player Controls**: 1-click toggle button and real-time audio visualizer right in the player toolbar.
* **Time Saved Tracker**: Shows exactly how much study time you've saved.

### ⏱️ Playback Optimization
* **Fine-Tuning Slider**: Smoothly adjust speed from `0.5x` to `4.0x` in increments of `0.1x`.
* **Instant Snap Presets**: Define 4 custom favorite speeds and switch to them instantly.
* **Hold Space to Speed Up**: Press and hold <kbd>Spacebar</kbd> to temporarily play at your configured speedup rate (default: `2.0x`).
* **Mouse Wheel Adjust**: Simply hover your cursor over the speed slider widget and scroll to step the speed up or down.

### 🎯 Focus & Decluttering Toggles
Quickly toggle off interface distractions:
* **Hide 'Ask AI'**: Hide the floating AI helper capsule.
* **Hide Doubt Q&A**: Remove the floating doubt-entry buttons.
* **Hide Live Chat**: Clean up the live chat overlay and side-panel comments.
* **Hide Study Notes**: Hide secondary lecture attachment sheets.
* **Hide Time Elements**: Hide player seek timelines or time labels if they make you anxious.

---

## ⌨️ Configurable Hotkeys

You can map keyboard shortcuts inside the dashboard popup. The default shortcuts are:

| Action | Default Key | Description |
| :--- | :---: | :--- |
| **Speed Up** | <kbd>h</kbd> | Increases speed by `0.1x` |
| **Slow Down** | <kbd>j</kbd> | Decreases speed by `0.1x` |
| **Reset Speed** | <kbd>l</kbd> | Resets playback rate to `1.0x` |

---

## 📂 Project Structure

A clean overview of the source files and build folders:

```
pw-control/
├── src/                  # Source files
│   ├── manifest.json     # Extension setup & permissions
│   ├── content.js        # Script injected into the video page
│   ├── content.css       # Style overrides for the video player
│   ├── popup.html        # Settings dashboard HTML layout
│   ├── popup.js          # Settings dashboard logic
│   ├── popup.css         # Sleek obsidian dashboard styles
│   └── build.py          # Python compiler/minifier script
├── assets/               # Promotional images & icons
└── dist/                 # Generated builds (Git-ignored)
    ├── chrome/           # Build optimized for Chrome/Edge
    └── firefox/          # Build optimized for Firefox
```

---

## 🛠️ How to Build & Pack

The project uses a custom Python build script to automate cleaning, compiling, minifying, and packaging the extension.

### Standard Build
To compile the files for local use (output goes to `dist/`):
```bash
python src/build.py --skip-prompt
```

### Store Release Build (Zipped)
To package the extension into store-uploadable zip archives:
```bash
python src/build.py --zip
```
*(This will ask if you want to automatically bump the version in `manifest.json` and will output ready-to-upload zip packages inside `dist/`.)*

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork this repository and create a new feature branch (`git checkout -b feature/awesome-feature`).
2. Make your edits and ensure files are properly structured.
3. Run `python src/build.py` to verify the code compiles and minifies correctly.
4. Submit a Pull Request describing your changes.

---

## 📢 Recent Updates (v1.0.7.2)

Here are the latest updates and changes in version `1.0.7.2`:
* **Skip Silence (Beta)**: High-performance audio worklet silence detection that seamlessly fast-forwards through lecture pauses.
* **Auto Noise Calibration & Decibel Thresholds**: Smart noise floor calibration with fine-grained `-60 dB` to `-20 dB` controls.
* **Studio-Grade Fades & Smooth Speed Ramps**: Exponential audio curves and tick-based speed acceleration eliminating all pops and clicks.
* **Permanent Audio Graph Caching**: Rock-solid Web Audio API lifecycle handling preventing duplicate connection errors across video switches.

---

## 📄 License & Credits

* **License**: This project is licensed under the MIT License. See [LICENSE](LICENSE) for more details.
* **Acknowledgements**: Special thanks and credit to [vantezzen/skip-silence](https://github.com/vantezzen/skip-silence) for the open-source audio worklet architecture, noise floor calibration algorithm, and hysteresis pattern that inspired the Skip Silence feature.
