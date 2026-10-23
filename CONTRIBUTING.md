# Contributing to Enhancer for Physics Wallah

First off, thank you for considering contributing to **Enhancer for Physics Wallah**! 💜

Whether you're fixing a bug, adding a new UI toggle, fine-tuning the silence skip audio DSP engine, or optimizing performance, your contributions directly help thousands of students study with fewer distractions.

This guide provides everything you need to know to get started quickly and write clean code that integrates seamlessly with our modular TypeScript architecture.

---

## 📑 Table of Contents
1. [Technology Stack & Prerequisites](#-technology-stack--prerequisites)
2. [Architecture & Code Map](#-architecture--code-map)
3. [Step-by-Step Developer Recipes](#-step-by-step-developer-recipes)
4. [Development Setup & Commands](#-development-setup--commands)
5. [Testing & Debugging Guide](#-testing--debugging-guide)
6. [Coding Standards & Design Tokens](#-coding-standards--design-tokens)
7. [Commit Message Conventions](#-commit-message-conventions)
8. [Pull Request Process](#-pull-request-process)

---

## 🧰 Technology Stack & Prerequisites

The extension is built with modern, ultra-lightweight web technologies:

* **Language & Core:** [TypeScript 5.7](https://www.typescriptlang.org/) (Strict Mode)
* **Popup & Dashboard UI Framework:** [Preact 10](https://preactjs.com/) + [@preact/signals](https://preactjs.com/guide/v10/signals/) (Reactive state management for popup controls and the full-page study planner)
* **Bundler & Build Tool:** [Vite 6](https://vitejs.dev/) + [esbuild](https://esbuild.github.io/) (High-speed multi-browser compilation)
* **Styling System:** Scoped [CSS Modules](https://github.com/css-modules/css-modules) + CSS Custom Property Design Tokens (`tokens.css`)
* **Audio DSP Engine:** [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) + [AudioWorklet](https://developer.mozilla.org/en-US/docs/Web/API/AudioWorklet) (Real-time background noise calibration & silence detection)
* **Extension Platform:** Chrome Extension [Manifest V3](https://developer.chrome.com/docs/extensions/mv3/intro/) (Chrome, Edge, Brave, Opera) & Gecko MV3 (Firefox compatibility)

---

## 🗺️ Architecture & Code Map

The codebase is organized into four main layers:

```
src/
├── shared/                       # Reusable foundation (types, storage, tokens, theme)
│   ├── tokens.css                # CSS Variables for dark/light themes & design tokens
│   ├── types.ts                  # Shared TypeScript interfaces for storage settings (PopupSettings)
│   ├── storage.ts                # Type-safe wrapper around chrome.storage.local
│   ├── theme.ts                  # Signal-based dark/light theme switcher
│   ├── colors.ts                 # Preset subject and tag color constants
│   ├── shortcuts.ts              # Keybinding configuration constants & reserved keys
│   └── components/               # Shared Preact components (Toggle, Stepper, TabBar, FeatureRow, SelectDropdown, ColorPicker, StudyIcons)
│
├── popup/                        # Extension popup UI (Preact + CSS Modules)
│   ├── main.tsx                  # Preact entry point
│   ├── App.tsx                   # Main root view & tab manager
│   ├── store.ts                  # Reactive state using Preact Signals (synced with chrome.storage)
│   ├── components/               # Header, Footer, and shared modal layouts
│   └── features/                 # Modular tab and dialog features
│       ├── speed/                # SpeedTab (playback rate, snap points, speed hotkeys)
│       ├── focus/                # FocusTab (distraction hiding toggles, focus lock, UI hotkeys)
│       ├── silence/              # SilenceTab (skip silence DSP & speech volume balancer)
│       ├── review/               # ReviewModal (in-popup rating / feedback prompt)
│       └── refresh/              # RefreshModal (reminder prompt to refresh open lecture tabs)
│
├── dashboard/                    # Full-page Study Planner & To-Do Dashboard (Preact + Signals)
│   ├── main.tsx                  # Dashboard entry point
│   ├── App.tsx                   # Main Kanban / task board layout
│   ├── store.ts                  # Task, subject, and chapter persistence store
│   ├── types.ts                  # Task, subject, and filter data models
│   └── components/               # TaskItem, AddTaskDialog, Sidebar, DatePicker, SettingsView, AddSubjectModal, AddChapterModal, DisplayMenu
│
├── content/                      # Modular in-page content script & bridge (TypeScript)
│   ├── index.ts                  # Initialization entry point & global listener coordinator
│   ├── engine-bridge.ts          # MAIN world bridge script for video player & audio hooking
│   ├── types.ts                  # Content state & audio engine types (HideSettings, ContentState)
│   ├── state.ts                  # Reactive content state & chrome.storage.onChanged handler
│   └── modules/
│       ├── video/
│       │   ├── detector.ts            # Shadow-DOM piercing video locator & PIP detector
│       │   ├── controller.ts          # PlaybackRate controller with anti-oscillation guards
│       │   ├── quality-controller.ts  # Constant 720p HD resolution switcher & watcher
│       │   └── volume-scroll.ts       # Mouse wheel over video to adjust volume
│       ├── distractions/
│       │   ├── elements.ts            # PW toolbar locator (#footer-right-section) & button matchers
│       │   ├── focus-css.ts           # Settings-offset button index hider & zero-flicker classes
│       │   └── promo-skipper.ts       # Auto-skip promotional banners and popups
│       ├── ui/
│       │   ├── speed-hud.ts           # Speed badge button, direct speed entry & segmented slider
│       │   ├── finish-time.ts         # Dynamic lecture finish clock & remaining time badge
│       │   ├── focus-mode.ts          # Instant Focus arrow button & full-player collapse
│       │   ├── focus-lock.ts          # Strict study lock (fullscreen reminder overlay)
│       │   ├── silence-hud.ts         # Skip silence toolbar button, 5-bar equalizer & status text
│       │   ├── quality-hud.ts         # Constant 720p HD toolbar toggle button
│       │   ├── volume-hud.ts          # Volume percentage overlay bubble
│       │   ├── autohide.ts            # Idle cursor & controls auto-hider
│       │   └── toast.ts               # On-screen warning & notification overlay
│       ├── audio/
│       │   ├── skip-silence.ts        # Inline AudioWorklet processor & noise floor calibration
│       │   └── volume-balancer.ts     # Speech level balancer for quiet microphones
│       ├── shortcuts/
│       │   ├── keyboard.ts            # Hotkeys listener with input protection
│       │   └── space-hold.ts          # Capture-phase spacebar speed boost, tap play/pause
│       ├── visibility/
│       │   └── auto-pause.ts          # Auto pause/resume when switching tabs
│       └── dom/
│           └── observer.ts            # Throttled MutationObserver & safety interval
│
├── icons/                        # Extension icons (16, 48, 128 px) & store assets
├── content.css                   # Styles for injected in-player widgets & focus hiding
├── background.js                 # Background service worker (Manifest V3 lifecycle)
└── manifest.json                 # Base extension manifest configuration
```

---

## 🍳 Step-by-Step Developer Recipes

### 💡 Recipe 1: Adding a new distraction toggle for PW Live
1. **Define the setting keys and defaults:**
   - In `src/content/types.ts`: Add your new boolean key to the `HideSettings` interface.
   - In `src/content/state.ts`: Add the key with its default (`false`) to `DEFAULT_HIDE_SETTINGS`.
   - In `src/shared/types.ts`: Add the same boolean key to the `PopupSettings` interface and to `DEFAULT_SETTINGS`.
2. **Wire into the Popup Store:**
   - In `src/popup/store.ts`: Create and export the reactive signal:
     ```typescript
     export const hideMyFeature = signal<boolean>(DEFAULT_SETTINGS.hideMyFeature);
     ```
   - In the same file, add `hideMyFeature` into `initStore()` and the storage change listener so it syncs automatically with `chrome.storage.local`.
3. **Add CSS / DOM Hiding Logic:**
   - Map your key to a CSS class name in `classMap` inside `src/content/modules/distractions/focus-css.ts`.
   - Add the corresponding CSS rule in `src/content.css` under `/* Focus Toggle Hiding Rules */` (e.g. `html.pwc-hide-myfeature .my-target-class { display: none !important; }`).
4. **Add the UI toggle in Popup:**
   - Open `src/popup/features/focus/FocusTab.tsx` and add a `<FeatureRow>` with a `<Toggle>` bound to your new signal:
     ```tsx
     <FeatureRow label="Hide My Feature" description="Hide distraction on PW lecture player">
       <Toggle
         checked={hideMyFeature.value}
         onChange={(val) => {
           hideMyFeature.value = val;
           saveSetting('hideMyFeature', val);
         }}
       />
     </FeatureRow>
     ```

---

### 💡 Recipe 2: Adding or modifying in-player HUD widgets
1. **Create or edit the component module:**
   - Edit or add your module in `src/content/modules/ui/` (e.g., `speed-hud.ts`, `volume-hud.ts`, or `finish-time.ts`).
   - Use `findPWToolbar()` from `src/content/modules/distractions/elements.ts` to attach buttons safely inside the player toolbar without breaking Physics Wallah's native layout.
2. **Hook into the DOM monitor:**
   - Ensure your widget injection function is called inside `monitor()` in `src/content/modules/dom/observer.ts` so it re-attaches gracefully across page navigations.

---

### 💡 Recipe 3: Modifying or adding keyboard shortcuts
1. **Add the handler in content script:**
   - Edit `src/content/modules/shortcuts/keyboard.ts`.
   - Always wrap execution in the `isUserTyping()` guard to prevent shortcuts from firing while students are typing in doubt boxes, search inputs, or chat.
2. **Check reserved keys:**
   - Refer to `src/shared/shortcuts.ts` to make sure your key is not in `RESERVED_PLAYER_KEYS` (keys like Spacebar, Enter, Escape, and Arrow keys are reserved for video playback).
3. **Expose hotkey settings in popup:**
   - Add the key setting to `PopupSettings` in `src/shared/types.ts`.
   - For playback speed hotkeys, place UI controls in `src/popup/features/speed/SpeedTab.tsx`.
   - For distraction / layout toggles, place UI controls in `src/popup/features/focus/FocusTab.tsx`.

---

### 💡 Recipe 4: Updating Popup Theme & Colors
1. **Edit design tokens:**
   - Update `src/shared/tokens.css`. All colors, shadows, borders, and transitions are defined as CSS custom properties (`var(--accent-primary)`, `var(--bg-card)`, etc.).
2. **Never hardcode hex colors in popup components:**
   - Always reference tokens to guarantee seamless support for both **Dark Mode** and **Light Mode**.

---

## 🛠️ Development Setup & Commands

### 1. Prerequisites
* **Node.js (v18 or higher)** and **npm**
* **Git**
* A Chromium-based browser (Chrome, Edge, Brave) or Mozilla Firefox

### 2. Fork and Clone
```bash
# 1. Clone your fork locally
git clone https://github.com/YOUR-USERNAME/Enhancer-for-Physics-Wallah.git
cd Enhancer-for-Physics-Wallah

# 2. Install dependencies
npm install

# 3. Create a feature branch
git checkout -b feat/your-feature-name
```

### 3. NPM Scripts & Commands
```bash
npm run dev        # Starts Vite dev server (serves popup and study dashboard locally)
npm run build      # Full production build: runs TypeScript check (tsc --noEmit) and builds dist/
npm run build:fast # Fast incremental build (skips tsc check during rapid UI testing)
npm run zip        # Compiles store-ready zip packages for Chrome, Firefox, and Edge
npm run package    # Runs build followed by zip creation inside dist/
npm run lint       # Runs ESLint across TypeScript and TSX source files
npm run format     # Formats all TS, TSX, CSS, and HTML files with Prettier
```

> [!TIP]
> **Windows Users:** If PowerShell blocks script execution (`UnauthorizedAccess` error when running `npm`), use `npm.cmd <script>` (e.g., `npm.cmd run build`) or execute your commands inside standard Command Prompt (`cmd.exe`).

---

## 🔍 Testing & Debugging Guide

### How to Load the Extension in Your Browser
1. Run `npm run build` to generate the `dist/` directory.
2. Open your browser's extension manager:
   * **Chrome / Brave:** Navigate to `chrome://extensions`
   * **Edge:** Navigate to `edge://extensions`
   * **Firefox:** Navigate to `about:debugging#/runtime/this-firefox`
3. Enable **Developer Mode** (top-right toggle in Chromium browsers).
4. Click **Load unpacked** and select:
   * **Chrome / Edge / Brave:** Select `dist/chrome` (or the root `dist/` folder).
   * **Firefox:** Click *Load Temporary Add-on* and select `dist/firefox/manifest.json`.

> [!NOTE]
> **Testing Live Lecture Features:** Player HUD buttons, speed adjustments, and skip silence require an active lecture player on `pw.live` (or supported subdomains `penpencil.co`, `penpencil.xyz`, `pwnet.in`).

### How to Debug Different Components
* **Popup Window:** Right-click the extension icon in your browser toolbar and click **Inspect popup**.
* **Study Planner Dashboard:** Click the dashboard icon in the popup header (or navigate to `chrome-extension://<id>/src/dashboard/index.html`), then press <kbd>F12</kbd> to inspect the task board.
* **Content Script (Video Player HUD & Audio Engine):** Open any Physics Wallah lecture page (`pw.live`), press <kbd>F12</kbd>, and check the **Console** tab.
* **Background Service Worker:** In `chrome://extensions`, click **Inspect views: service worker** on the extension card.
* **Reloading Changes:** After running `npm run build`, click the 🔄 **Reload** icon on the extension card in `chrome://extensions`, then refresh the `pw.live` tab.

---

## 🎨 Coding Standards & Design Tokens

1. **Strict TypeScript:**
   - Maintain full type safety with `strict: true`.
   - Avoid using `any`. Use proper interfaces from `src/shared/types.ts` or `src/content/types.ts`.

2. **Scoped CSS Modules:**
   - Style popup and dashboard components using scoped CSS Modules (`[Component].module.css`) to prevent global style leaks.

3. **Client-Side Privacy:**
   - Never add third-party analytics, remote scripts, or tracking libraries. Everything must execute locally on the user's machine.

---

## 💬 Commit Message Conventions

We follow [Conventional Commits](https://www.conventionalcommits.org/):

| Type | Purpose | Example |
| :--- | :--- | :--- |
| `feat:` | New user-facing feature | `feat: add instant focus mode chevron button` |
| `fix:` | Bug fix | `fix: prevent spacebar hold from triggering in chat inputs` |
| `refactor:` | Code restructuring without behavior change | `refactor: split content script into TypeScript modules` |
| `perf:` | Performance optimization | `perf: throttle audio noise floor recalculations` |
| `docs:` | Documentation changes | `docs: update architecture map in CONTRIBUTING.md` |
| `style:` | Formatting, whitespace, or CSS styling | `style: improve segmented slider tick glow` |
| `chore:` | Tooling, build scripts, or dependency updates | `chore: update vite bundler config` |

---

## 🚀 Pull Request Process

1. Verify that your TypeScript types compile cleanly:
   ```bash
   npm run build
   ```
2. Commit your changes using Conventional Commit messages:
   ```bash
   git add .
   git commit -m "feat: add customizable speed step setting"
   ```
3. Push to your fork:
   ```bash
   git push origin feat/your-feature-name
   ```
4. Open a **Pull Request** on GitHub against the `main` branch.
5. In your PR description, outline:
   * **Summary:** What changes were made?
   * **Motivation:** What problem does this solve?
   * **Testing:** Which browsers (Chrome, Firefox, Edge) did you test on?

---

Thank you for helping make studying on Physics Wallah better for everyone! 🚀
