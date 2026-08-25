# Contributing to Enhancer for Physics Wallah

Thank you for helping improve **Enhancer for Physics Wallah**! This guide walks you through setting up your local environment, making changes, and submitting a pull request.

---

## 🛠️ Development Setup

### 1. Prerequisites
* **Python 3.x** (used to build and minify distribution packages)
* **Git**
* A Chromium-based browser (Chrome, Edge, Brave) or Mozilla Firefox

### 2. Fork and Clone
1. Fork this repository on GitHub.
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR-USERNAME/Enhancer-for-Physics-Wallah.git
   cd Enhancer-for-Physics-Wallah
   ```

---

## ✏️ Making Changes

### Project Rules
* **Edit only inside `src/`:** Never make manual edits inside `dist/` because that folder is wiped and regenerated automatically during builds.
* **Keep it dependency-free:** Do not add heavy JavaScript frameworks or runtime npm dependencies. Keep the core scripts fast and lightweight using vanilla JavaScript.

### Workflow
1. Create a dedicated branch for your work:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Make your edits inside `src/`.
3. Compile the build folders:
   ```bash
   python src/build.py -y
   ```
4. Test your changes live on `pw.live`:
   * Open `chrome://extensions` (or `about:debugging` in Firefox).
   * Click **Load unpacked** and select `dist/chrome` (or `dist/firefox/manifest.json`).
   * Test the video player, popup menu settings, and keyboard hotkeys.

---

## 🧪 Testing & Troubleshooting Checklist

Before committing your code, check the following:
* [ ] **Extension loads without errors:** Check the Extensions page for any red error flags.
* [ ] **Console check:** Open Developer Tools (<kbd>F12</kbd>) on a video lecture page and check the Console for unexpected errors or warnings.
* [ ] **Build script runs cleanly:** `python src/build.py -y` runs with zero syntax or file errors.
* [ ] **Theme check:** Check that your UI changes display properly in both Dark Mode and Light Mode inside the popup.

---

## 🚀 Submitting a Pull Request

1. **Commit your changes:**
   ```bash
   git commit -m "Add custom shortcut for instant hide button"
   ```
2. **Push to your fork:**
   ```bash
   git push origin feature/your-feature-name
   ```
3. **Open a Pull Request:**
   * Go to the original [Enhancer-for-Physics-Wallah](https://github.com/vishwa-vsr/Enhancer-for-Physics-Wallah) repository.
   * Click **Compare & pull request**.
   * Provide a clear description of what changed, why it was needed, and how you tested it.
