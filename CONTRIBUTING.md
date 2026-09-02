# Contributing to Enhancer for Physics Wallah

First off, thank you for considering contributing to **Enhancer for Physics Wallah**! Whether you're fixing a bug, adding a new distraction toggle, or helping build the Study Planner dashboard, your contributions help thousands of students study with fewer distractions.

This guide provides everything you need to know to get started quickly and write code that integrates seamlessly with the project.

---

## 📑 Table of Contents
1. [Architecture & Code Map](#-architecture--code-map)
2. [Development Setup](#-development-setup)
3. [Testing & Debugging Like a Pro](#-testing--debugging-like-a-pro)
4. [Coding Standards & Best Practices](#-coding-standards--best-practices)
5. [Commit Message Conventions](#-commit-message-conventions)
6. [Pull Request Process](#-pull-request-process)
7. [Good First Issues & Areas to Contribute](#-good-first-issues--areas-to-contribute)

---

## 🗺️ Architecture & Code Map

Before writing code, it helps to understand how the extension is organized:

```
src/
├── shared/                  # Reusable foundation (used by popup & upcoming dashboard)
│   ├── tokens.css           # Single source of truth for all colors, themes & spacing
│   ├── types.ts             # TypeScript interfaces for all 30+ settings & storage keys
│   ├── storage.ts           # Type-safe wrapper for chrome.storage.local (with fallback)
│   ├── theme.ts             # Signal-based dark/light theme manager
│   └── components/          # Shared Preact UI blocks (Toggle, FeatureRow, Stepper, TabBar)
│
├── popup/                   # Extension popup interface
│   ├── main.tsx             # Preact entry point
│   ├── App.tsx              # Root component & tab layout
│   ├── store.ts             # Reactive state management using Preact Signals
│   ├── components/          # Header (logo, theme toggle) & Footer (links, version)
│   └── features/            # Feature tabs: SpeedTab, FocusTab, SilenceTab, ReviewModal
│
├── content.js               # In-page script running directly inside pw.live video pages
│                            # Controls <video> playback, speed sliders, and audio analyzer
├── content.css              # Styling for on-player controls & UI decluttering
├── background.js            # Background service worker (uninstall survey, lifecycle)
└── manifest.json            # Manifest V3 permissions & match patterns
```

### 💡 Where should your code go?
* **Adding a new toggle for pw.live?** Add the CSS/DOM selector in `content.js`, the type in `src/shared/types.ts`, and the toggle in `src/popup/features/focus/FocusTab.tsx`.
* **Tweaking popup styles?** Edit the corresponding `.module.css` file using design tokens from `src/shared/tokens.css`.
* **Adding video player features?** Edit `src/content.js` and `src/content.css`.

---

## 🛠️ Development Setup

### 1. Prerequisites
* **Node.js (v18 or higher)** and **npm**
* **Git**
* A Chromium-based browser (Chrome, Edge, Brave) or Mozilla Firefox

### 2. Fork and Clone
```bash
# 1. Clone your fork locally
git clone https://github.com/YOUR-USERNAME/Enhancer-for-Physics-Wallah.git
cd Enhancer-for-Physics-Wallah

# 2. Install development dependencies
npm install

# 3. Create a feature branch
git checkout -b feat/your-feature-name
```

### 3. Build Commands
```bash
npm run dev        # Starts Vite dev server (for fast component iteration)
npm run build      # Compiles production extension into dist/chrome, dist/firefox, dist/edge
npm run zip        # Packages distribution zips inside dist/
npm run lint       # Checks code for TypeScript & ESLint errors
npm run format     # Formats all TS, TSX, CSS, and HTML files with Prettier
```

---

## 🔍 Testing & Debugging Like a Pro

### How to Load the Extension in Your Browser
1. Run `npm run build` to generate the `dist/` folder.
2. Open your browser's extension manager:
   * **Chrome / Brave:** Navigate to `chrome://extensions`
   * **Edge:** Navigate to `edge://extensions`
   * **Firefox:** Navigate to `about:debugging#/runtime/this-firefox`
3. Enable **Developer Mode** (top-right toggle).
4. Click **Load unpacked** and select the **`dist/chrome`** directory (or **`dist/firefox/manifest.json`** in Firefox).

### Debugging Different Parts of the Extension
* **Debugging the Popup:** Right-click the extension icon in your browser toolbar and select **Inspect popup**. This opens Chrome DevTools specifically for the popup window.
* **Debugging the Content Script (Video Player):** Open any Physics Wallah lecture page (`pw.live`), press <kbd>F12</kbd> to open DevTools, and switch to the **Console** tab.
* **Debugging the Background Service Worker:** In `chrome://extensions`, locate the extension card and click the **Inspect views: service worker** link.
* **Applying Code Changes:** After running `npm run build`, click the 🔄 **Reload** icon on the extension card in `chrome://extensions`, then refresh the `pw.live` tab.

---

## 🎨 Coding Standards & Best Practices

1. **Always Use Design Tokens (Never Hardcode Colors):**
   * Use CSS custom properties from `src/shared/tokens.css` (e.g. `var(--accent-primary)`, `var(--bg-card)`, `var(--text-primary)`).
   * This ensures your UI works automatically in both Dark Mode and Light Mode.

2. **Strict TypeScript:**
   * Provide explicit types for component props and storage data.
   * Avoid using `any`. If unsure, use `unknown` or define a strict interface in `src/shared/types.ts`.

3. **CSS Modules:**
   * Style popup components using scoped CSS Modules (`Component.module.css`).
   * This prevents class name collisions across different features.

4. **Reactive State via Preact Signals:**
   * Popup state is managed via `@preact/signals` in `src/popup/store.ts`.
   * Update signals and save to storage using the `saveSetting()` helper from `src/shared/storage.ts`.

5. **Client-Side Privacy:**
   * Never introduce analytics, tracking pixels, or remote external scripts. All code must run 100% locally.

---

## 💬 Commit Message Conventions

We follow [Conventional Commits](https://www.conventionalcommits.org/) to keep our git history readable:

| Prefix | When to use | Example |
| :--- | :--- | :--- |
| `feat:` | Adding a new user-facing feature | `feat: add auto-pause on window blur` |
| `fix:` | Fixing a bug | `fix: prevent spacebar boost from locking on text input` |
| `docs:` | Updating documentation or changelog | `docs: add troubleshooting steps to README` |
| `style:` | Formatting, whitespace, or visual CSS tweaks | `style: adjust stepper button hover radius` |
| `refactor:`| Code refactoring without changing functionality | `refactor: split speed slider math into utility file` |
| `perf:` | Performance or memory optimization | `perf: throttle audio analyser calculation` |
| `chore:` | Tooling, build scripts, or dependency updates | `chore: update vite and typescript dependencies` |

---

## 🚀 Pull Request Process

1. Make sure your code passes all checks before opening a PR:
   ```bash
   npm run format
   npm run lint
   npm run build
   ```
2. Commit your changes with a clear conventional commit message:
   ```bash
   git add .
   git commit -m "feat: add lecture finish time format setting"
   ```
3. Push to your fork:
   ```bash
   git push origin feat/your-feature-name
   ```
4. Open a **Pull Request** on GitHub against the `main` branch.
5. In your PR description, explain:
   * **What:** What changes did you make?
   * **Why:** Why was this change needed?
   * **Testing:** How did you test your changes (which browser, what steps)?

---

## 💡 Good First Issues & Areas to Contribute

Looking for ideas to contribute? Here are great places to start:
* **Study Planner Dashboard (`src/dashboard/`):** Help implement the Organise or Workflow Kanban tabs (see [`docs/STUDY_PLANNER.md`](docs/STUDY_PLANNER.md)).
* **New Declutter Options:** Notice new distracting popups or banners on `pw.live`? Add a new 1-click toggle to hide them.
* **Keyboard Shortcuts:** Add customizable shortcuts for seeking forward/backward.
* **Accessibility:** Improve keyboard navigation, ARIA attributes, and high-contrast styling.

Thank you for building with the open-source community! 💜
