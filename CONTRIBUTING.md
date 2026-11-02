# Contributing to Enhancer for Physics Wallah

First off, thank you for considering contributing to **Enhancer for Physics Wallah**! 💜

Whether you're fixing a bug, adding a new distraction toggle, or polishing the player interface, your contributions directly help thousands of students study with fewer distractions.

---

## ⚡ Quick Start (60 Seconds)

### 1. Clone & Install
```bash
# 1. Clone your fork locally
git clone https://github.com/YOUR-USERNAME/Enhancer-for-Physics-Wallah.git
cd Enhancer-for-Physics-Wallah

# 2. Install dependencies
npm install
```

### 2. Build the Extension
```bash
npm run build
```

### 3. Load into Your Browser
1. Open Google Chrome (or Brave / Edge) and navigate to `chrome://extensions`.
2. Toggle on **Developer Mode** in the top-right corner.
3. Click **Load unpacked** and select the `dist/chrome` folder inside this project.

> [!TIP]
> **Windows Users:** If PowerShell blocks running scripts (`UnauthorizedAccess` error), use `npm.cmd run build` or run commands inside standard Command Prompt (`cmd.exe`).

---

## 🛠️ Daily Development Commands

You only need **three** commands while working on the project:

```bash
npm run dev     # Starts Vite dev server (for live-previewing popup & study planner UI)
npm run build   # Full production build: checks TypeScript types and updates dist/chrome
npm run format  # Formats all TS, TSX, CSS, and HTML files cleanly with Prettier
```

---

## 🗺️ Project Architecture Overview

The codebase is organized into four clean areas under `src/`:

* **`src/popup/`** – The extension popup UI (settings tabs, speed controls, toggles) built with Preact and reactive signals.
* **`src/content/`** – The scripts injected into `pw.live`:
  * `index.ts` – Coordinates all listeners and feature initialization.
  * `engine-bridge.ts` – Directly interfaces with the native video player.
  * `modules/` – Individual feature controllers (`video/`, `distractions/`, `ui/`, `audio/`, `shortcuts/`).
* **`src/dashboard/`** – The full-page Study Planner and To-Do Kanban task board.
* **`src/shared/`** – Shared design tokens (`tokens.css`), storage helpers, types, and UI components.

---

## 🍳 Recipe: Adding a New Distraction Toggle

Most contributions involve adding a new toggle to hide distracting elements on the player. Here is the complete, step-by-step recipe:

### 1. Define the Setting Keys
* In `src/content/types.ts`: Add your new boolean key to `HideSettings` (e.g., `hideMyFeature: boolean;`).
* In `src/content/state.ts`:
  * Add `hideMyFeature: false` to `DEFAULT_HIDE_SETTINGS`.
  * Add `'hideMyFeature'` to the string list inside `safeGetSettings()` so Chrome loads it from storage on startup.
* In `src/shared/types.ts`: Add `hideMyFeature: boolean;` to `PopupSettings` and `DEFAULT_SETTINGS`.

### 2. Wire into the Popup Store
* In `src/popup/store.ts`:
  * Create the reactive signal:
    ```typescript
    export const hideMyFeature = signal(false);
    ```
  * In `initStore()`: Add `hideMyFeature.value = !!s.hideMyFeature;`.
  * In the storage change listener: Add `if (changes.hideMyFeature !== undefined) hideMyFeature.value = !!changes.hideMyFeature;`.

### 3. Add CSS Hiding Logic
* In `src/content/modules/distractions/focus-css.ts`: Add your mapping to `classMap`:
  ```typescript
  hideMyFeature: 'pwc-hide-myfeature',
  ```
* In `src/content.css`: Add the zero-flicker CSS rule under the hiding section:
  ```css
  html.pwc-hide-myfeature .target-element-class {
    display: none !important;
  }
  ```

### 4. Add the Toggle in Popup UI
* In `src/popup/features/focus/FocusTab.tsx`: Add a `<FeatureRow>` bound to your new signal:
  ```tsx
  <FeatureRow label="Hide My Feature" sublabel="Hide distraction on PW lecture player">
    <Toggle
      checked={hideMyFeature.value}
      onChange={(val) => {
        hideMyFeature.value = val;
        saveSetting('hideMyFeature', val);
      }}
      ariaLabel="Toggle Hide My Feature"
    />
  </FeatureRow>
  ```

---

## 🔍 Testing & Debugging

1. **How to Test on PhysicsWallah:**
   * Open any lecture on `pw.live`. *(Note: You do not need a paid course—free demo lectures and trial videos work great for testing!)*
2. **Reloading Changes:**
   * After making changes, run `npm run build`.
   * Go to `chrome://extensions` and click the 🔄 **Reload** icon on the extension card.
   * Refresh your lecture tab on `pw.live`.
3. **Inspecting Elements & Errors:**
   * **Player scripts:** Press <kbd>F12</kbd> on `pw.live` to check the console for logs.
   * **Popup UI:** Right-click the extension icon in your browser toolbar and click **Inspect popup**.

---

## 🚀 Pull Request Process

1. **Verify your build completes with zero errors:**
   ```bash
   npm run build
   ```
2. **Add a note to CHANGELOG.md:**
   * Add a short bullet under `## [Unreleased]` describing your change with your GitHub handle.
3. **Commit using [Conventional Commits](https://www.conventionalcommits.org/):**
   ```bash
   git add .
   git commit -m "feat(focus): add toggle to hide my feature"
   ```
4. **Push & open your PR:**
   * Push to your fork: `git push origin feat/your-feature-name`
   * Open a Pull Request against the `main` branch. Fill out the quick PR checklist, and you're good to go!

---

Thank you for helping make studying on Physics Wallah better for everyone! 🚀
