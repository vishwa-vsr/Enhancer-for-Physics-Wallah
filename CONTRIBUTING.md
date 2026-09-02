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
* **Popup UI Framework:** [Preact 10](https://preactjs.com/) + [@preact/signals](https://preactjs.com/guide/v10/signals/) (Reactive state management)
* **Bundler & Build Tool:** [Vite 6](https://vitejs.dev/) + [esbuild](https://esbuild.github.io/) (High-speed multi-browser compilation)
* **Styling System:** Scoped [CSS Modules](https://github.com/css-modules/css-modules) + CSS Custom Property Design Tokens (`tokens.css`)
* **Audio DSP Engine:** [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) + [AudioWorklet](https://developer.mozilla.org/en-US/docs/Web/API/AudioWorklet) (Real-time background noise calibration & silence detection)
* **Extension Platform:** Chrome Extension [Manifest V3](https://developer.chrome.com/docs/extensions/mv3/intro/) (Chrome, Edge, Brave, Opera) & Gecko MV3 (Firefox compatibility)

---

## 🗺️ Architecture & Code Map

The codebase is organized into three clean layers:

```
src/
├── shared/                       # Reusable foundation (types, storage, tokens, theme)
│   ├── tokens.css                # CSS Variables for dark/light themes & design tokens
│   ├── types.ts                  # Shared TypeScript interfaces for storage settings
│   ├── storage.ts                # Type-safe wrapper around chrome.storage.local
│   ├── theme.ts                  # Signal-based dark/light theme switcher
│   └── components/               # Shared Preact components (Toggle, Stepper, TabBar, FeatureRow)
│
├── popup/                        # Extension popup UI (Preact + CSS Modules)
│   ├── main.tsx                  # Preact entry point
│   ├── App.tsx                   # Main root view & tab manager
│   ├── store.ts                  # Reactive state using Preact Signals
│   ├── components/               # Header, Footer, and modal views
│   └── features/                 # SpeedTab, FocusTab, SilenceTab, ReviewModal
│
├── content/                      # Modular in-page content script (TypeScript)
│   ├── index.ts                  # Initialization entry point & global listener coordinator
│   ├── types.ts                  # Content state & audio engine types
│   ├── state.ts                  # Reactive content state & chrome.storage.onChanged handler
│   └── modules/
│       ├── video/
│       │   ├── detector.ts       # Shadow-DOM piercing video locator & PIP detector
│       │   └── controller.ts     # PlaybackRate controller with anti-oscillation guards
│       ├── distractions/
│       │   ├── elements.ts       # PW toolbar locator (#footer-right-section) & button matchers
│       │   └── focus-css.ts      # Settings-offset button index hider & zero-flicker classes
│       ├── ui/
│       │   ├── speed-hud.ts      # Speedometer button, segmented slider & needle dial
│       │   ├── finish-time.ts    # Dynamic lecture finish clock & remaining time badge
│       │   ├── focus-mode.ts     # Instant Focus arrow button & full-player collapse
│       │   ├── silence-hud.ts    # Skip silence toolbar button, 5-bar equalizer & status text
│       │   └── toast.ts          # On-screen warning & notification overlay
│       ├── audio/
│       │   └── skip-silence.ts   # Inline AudioWorklet processor & noise floor calibration
│       ├── shortcuts/
│       │   ├── keyboard.ts       # Hotkeys listener (h, j, l) with input protection
│       │   └── space-hold.ts     # Capture-phase spacebar speed boost & tap play/pause
│       ├── visibility/
│       │   └── auto-pause.ts     # Auto pause/resume when switching tabs
│       └── dom/
│           └── observer.ts       # Throttled MutationObserver & safety interval
│
├── content.css                   # Styles for injected in-player widgets & focus hiding
├── background.js                 # Background service worker (Manifest V3 lifecycle)
└── manifest.json                 # Base extension manifest configuration
```

---

## 🍳 Step-by-Step Developer Recipes

### 💡 Recipe 1: Adding a new distraction toggle for PW Live
1. **Define the setting key:**
   - Add the new boolean key to `HideSettings` in `src/content/types.ts` and `src/shared/types.ts`.
   - Add the default value (`false`) in `src/content/state.ts` and `DEFAULT_SETTINGS` in `src/shared/types.ts`.
2. **Add CSS / DOM Hiding Logic:**
   - Map the class in `classMap` inside `src/content/modules/distractions/focus-css.ts`.
   - Add CSS rules in `src/content.css` under `/* Focus Toggle Hiding Rules */` (e.g. `html.pwc-hide-myfeature .my-target-class { display: none !important; }`).
3. **Add the UI toggle in Popup:**
   - Open `src/popup/features/focus/FocusTab.tsx` and add a `<FeatureRow>` with a `<Toggle>` bound to the new setting.

---

### 💡 Recipe 2: Adding or modifying in-player HUD widgets
1. **Create or edit the component module:**
   - Edit the relevant module in `src/content/modules/ui/` (e.g., `speed-hud.ts` or `finish-time.ts`).
   - Use `findPWToolbar()` from `src/content/modules/distractions/elements.ts` to attach buttons safely inside the player bar without breaking PhysicsWallah's existing layout.
2. **Hook into the DOM monitor:**
   - Ensure your injection function is called inside `monitor()` in `src/content/modules/dom/observer.ts`.

---

### 💡 Recipe 3: Modifying or adding keyboard shortcuts
1. **Add the handler:**
   - Edit `src/content/modules/shortcuts/keyboard.ts`.
   - Always use `isUserTyping()` protection to prevent hotkeys from triggering when students type in doubt boxes, chat, or search inputs.
2. **Expose hotkey settings in popup:**
   - If configurable, add the key state to `src/shared/types.ts` and UI controls in `src/popup/features/speed/SpeedTab.tsx`.

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
npm run dev        # Starts Vite dev server for popup UI development
npm run build      # Compiles production extension into dist/chrome, dist/firefox, dist/edge
npm run package    # Compiles and creates store-ready .zip packages inside dist/
npm run lint       # Runs ESLint and strict TypeScript typechecking
npm run format     # Formats all TS, TSX, CSS, and HTML files with Prettier
```

---

## 🔍 Testing & Debugging Guide

### How to Load the Extension in Your Browser
1. Run `npm run build` to generate the `dist/` directory.
2. Open your browser's extension manager:
   * **Chrome / Brave:** Navigate to `chrome://extensions`
   * **Edge:** Navigate to `edge://extensions`
   * **Firefox:** Navigate to `about:debugging#/runtime/this-firefox`
3. Enable **Developer Mode** (top-right toggle).
4. Click **Load unpacked** and select:
   * **Chrome / Edge / Brave:** `dist/chrome` or `dist/edge`
   * **Firefox:** Click *Load Temporary Add-on* and select `dist/firefox/manifest.json`.

### How to Debug Different Components
* **Popup Window:** Right-click the extension icon in your browser toolbar and click **Inspect popup**.
* **Content Script (Video Player HUD & Audio Engine):** Open any Physics Wallah lecture page (`pw.live`), press <kbd>F12</kbd>, and check the **Console** tab.
* **Background Service Worker:** In `chrome://extensions`, click **Inspect views: service worker** on the extension card.
* **Reloading Changes:** After running `npm run build`, click the 🔄 **Reload** icon on the extension card in `chrome://extensions`, then refresh the `pw.live` tab.

---

## 🎨 Coding Standards & Design Tokens

1. **Strict TypeScript:**
   - Maintain full type safety with `strict: true`.
   - Avoid using `any`. Use proper interfaces from `src/shared/types.ts` or `src/content/types.ts`.

2. **Scoped CSS Modules:**
   - Style popup components using scoped CSS Modules (`[Component].module.css`) to prevent global style leaks.

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

1. Verify that all tests, types, and formatting pass:
   ```bash
   npm run format
   npm run lint
   npm run build
   ```
2. Commit your changes:
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
