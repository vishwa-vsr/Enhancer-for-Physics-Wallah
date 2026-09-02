# Contributing to Enhancer for Physics Wallah

Thank you for helping improve **Enhancer for Physics Wallah**! This guide walks you through setting up your local environment, making changes, and submitting a pull request.

---

## 🛠️ Development Setup

### 1. Prerequisites
* **Node.js (v18 or higher)** and **npm**
* **Git**
* A Chromium-based browser (Chrome, Edge, Brave) or Mozilla Firefox

### 2. Fork and Clone
1. Fork this repository on GitHub.
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR-USERNAME/Enhancer-for-Physics-Wallah.git
   cd Enhancer-for-Physics-Wallah
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

---

## ✏️ Making Changes

### Project Guidelines
* **Edit only inside `src/`:** Never make manual edits inside `dist/` because that folder is regenerated automatically during builds.
* **Modern Stack:** The popup UI is built with **Preact**, **TypeScript**, and **CSS Modules**. Use standard Preact components and shared design tokens (`src/shared/tokens.css`).
* **Keep bundles lightweight:** Avoid heavy runtime dependencies to keep the extension fast, lightweight, and responsive.

### Development Workflow
1. Create a dedicated branch for your work:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Start the development server (optional for live feedback) or build:
   ```bash
   npm run dev      # Hot-reload development server
   npm run build    # Compile production bundles into dist/
   ```
3. Test your changes live on `pw.live`:
   * Open `chrome://extensions` (or `about:debugging` in Firefox).
   * Click **Load unpacked** and select `dist/chrome` (or `dist/firefox/manifest.json`).
   * Test video controls, popup menu settings, themes, and keyboard hotkeys.

---

## 🧪 Testing & Code Quality Checklist

Before committing your code, please verify:
* [ ] **Type check passes:** `npm run build` runs with zero TypeScript or build errors.
* [ ] **Linter check:** `npm run lint` passes with 0 errors and 0 warnings.
* [ ] **Console check:** Open Developer Tools (<kbd>F12</kbd>) on a video lecture page and check the Console for unexpected errors.
* [ ] **Theme check:** Check that your UI changes display properly in both Dark Mode and Light Mode.

---

## 🚀 Submitting a Pull Request

1. **Format and lint your code:**
   ```bash
   npm run format
   npm run lint
   ```
2. **Commit your changes:**
   ```bash
   git commit -m "Add custom shortcut for instant hide button"
   ```
3. **Push to your fork:**
   ```bash
   git push origin feature/your-feature-name
   ```
4. **Open a Pull Request:**
   * Go to the original [Enhancer-for-Physics-Wallah](https://github.com/vishwa-vsr/Enhancer-for-Physics-Wallah) repository.
   * Click **Compare & pull request**.
   * Provide a clear description of what changed, why it was needed, and how you tested it.
