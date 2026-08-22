# Changelog

All notable changes to the **Enhancer for Physics Wallah** extension project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.7.5] - 2026-08-22

### Added & Improved
- **Feedback Link in Popup**: Added a quick Feedback button with a matching message icon in the bottom footer of the popup menu.
- **Automatic Uninstall Feedback Survey**: Added a background service worker that automatically opens an exit feedback survey whenever the extension is uninstalled.

---

## [1.0.7] - 2026-08-20

### Added & Redesigned
- **Modern Dashboard Popup UI**: Redesigned the entire extension popup interface into a clean, modern dashboard aesthetic.
- **Borderless Pure White Cards**: Setting sections now sit on crisp, pure white cards with zero harsh outlines or borders.
- **Cool Ice-Gray Canvas (Light Mode)**: Soft, cool ice-gray background canvas that creates clear, distinct contrast with the white cards.
- **Smooth Pill Tab Navigation**: Redesigned the top Speed, Focus, and Silence tabs into a seamless pill container where the active tab floats as a white pill with soft elevation.
- **Grouped Settings Layout**: Neatly organized related toggles and sliders into unified section cards with subtle dividers.
- **Constant 500px Window Height**: Fixed the popup height across all three tabs to prevent window jumping or resizing when switching tabs.
- **Right-Edge Auto-Hiding Scrollbar**: Moved the scrollbar flush to the far right window edge, auto-hiding when idle and smoothly fading in on scroll or hover.
- **Modern Indigo Accent**: Updated active switches, slider bars, and highlights to a modern Indigo accent (`#5A55EA`).
- **Inter Typography & Rounded Corners**: Switched to the Inter font and smooth 14px rounded card corners for crisp readability.
- **Updated Dark Mode**: Refreshed the Dark Theme with borderless slate cards on a deep dark canvas.
- **New Modern Logo**: Redesigned the extension icon to a sleek, high-contrast monochrome design (Supersonic Dual Chevrons) with full Dark & Light mode support.
- **Skip Silence (Beta)**: Automatically fast-forwards through teacher pauses, whiteboard writing, and silent thinking time during lectures.
- **Auto Noise Calibration**: Automatically adjusts to your lecture's background noise (fan hum, AC, quiet speech) so you don't need to tweak settings.
- **Silence Threshold Slider**: Simple slider in decibels (`-60 dB` to `-20 dB`) with **Strict** and **Aggressive** settings for fine-tuning.
- **Smooth Speed Acceleration**: Glides smoothly from normal speech speed to silence speed with crystal-clear, pop-free audio.
- **Configurable Minimum Pause**: Choose how long silence must last before fast-forwarding begins (default: `0.5s`).
- **Player Toolbar Button & Visualizer**: Convenient toggle button and animated sound visualizer right inside the video controls.
- **Time Saved Counter**: Real-time tracker showing how much study time you've saved.
- **Credits**: Special thanks to [vantezzen/skip-silence](https://github.com/vantezzen/skip-silence) for inspiring the audio processing design.

---

## [1.0.6] - 2026-08-05

### Added & Improved
- **Always Expand Speed Bar**: Added a new toggle switch in the extension popup menu allowing users to keep the video speed slider permanently expanded on the player control bar.
- **Hover Buffer & Gap Fix**: Fixed widget hover collapsing by replacing margin gaps with hoverable padding and adding a 250ms safety buffer.
- **Removed Custom Speed Toast**: Removed custom video screen speed toast popups to declutter the video frame and prevent overlay conflicts.

---

## [1.0.5] - 2026-08-01

### Rebranded
- **Official Rebranding**: Renamed the extension from `PW Control` to **Enhancer for Physics Wallah** across all manifests, code assets, documentation, and promotional packages.

---

## [1.0.4] - 2026-08-01

### Added & Redesigned
- **Picture-in-Picture (PiP) Mode**: Added a dedicated Picture-in-Picture button on the player control bar next to the fullscreen button. Clicking it lets users watch lectures in a floating, always-on-top window.
- **Redesigned Pure White 28px Sharp Edge PiP Icon**: Redesigned Picture-in-Picture icon with pure `#ffffff` color, `28px` x `28px` bounds matching native PW toolbar icons (Chat, Q&A, Notes, Gear, Fullscreen), and 100% sharp 90-degree rectangular line geometry (`rx="0"`, `stroke-linejoin="miter"`).
- **shadcn/ui Switch Redesign**: Redesigned all popup toggle switches to match shadcn / Radix UI switch specifications (`44px` x `24px` pill, `18px` white thumb, Electric Cyan active state with subtle glow).
- **shadcn/ui Tab Navigation Redesign**: Redesigned top navigation tabs with `3px` padding, rounded pill triggers, and active icon accents. Removed drop shadow from active tab indicator for a flat, modern aesthetic.
- **Combined Hold-Space & Stepper Pill Control**: Merged "Hold Space to Speed Up" and "Speed Up Rate" into a single unified card featuring tactile `[ − ]  2.0x  [ + ]` stepper controls with hidden spin arrows.
- **Electric Cyan Snap Points Badges**: Redesigned custom snap point inputs into speed badges with integrated `x` unit badges.
- **Integrated Hide Speed Widget Footer Row**: Moved "Hide Speed Widget" toggle directly into the `VIDEO SPEED` card footer, eliminating all unused vertical empty space.
- **Unmounted Collapsed Settings Panel**: Unmounted collapsed **Edit Snap Points** panel with `display: none !important`, completely erasing lingering empty space under the card.
- **Silky 60 FPS Keyframe Dropdown Animation**: Implemented 2-way `@keyframes slideDownExpand` and `slideUpCollapse` transitions (`220ms`) for buttery smooth gear settings expand/collapse.
- **100% Solid Bright White Speed Slider Track Line**: Forced the on-player speed slider track line to a solid bright white (`#ffffff`) across the entire bar.
- **Dead-Center Timeline Tick Dots**: Placed 5px node dots dead-center right on top of the white speed slider line for `1x`, `2x`, `3x`, `4x`.
- **Unified Enable Keyboard Hotkeys Card**: Combined "Enable Keyboard Hotkeys" toggle switch and keycap binder controls (`H`, `J`, `L`) into a single unified card container (`.feature-card-combined`).
- **Dead & Useless Code Cleanup**: Removed obsolete `.preset-btn` DOM queries and iteration loops from `popup.js`, and eliminated 30 lines of duplicate static CSS rules from `content.css`, shrinking production bundle sizes.

### Fixed
- **PiP Button Center Click Fix**: Applied `pointer-events: none` to inner SVG child shapes and set `z-index: 999999` so center clicks hit the PiP button container directly on the first click.
- **On-Player Slider Tick Alignment**: Mathematically aligned `.pwc-slider-ticks` with thumb radius offsets (`left: 5.5px`, `width: calc(100% - 11px)`), positioning `1x`, `2x`, `3x`, and `4x` dead-center under the slider thumb.
- **Settings Gear Dark Hover Box**: Replaced dark background overlay with subtle theme-adaptive hover and smooth 90° gear icon rotation.
- **Shadow DOM Icon Styling**: Applied inline styles directly to the Picture-in-Picture button and its SVG elements, resolving an issue where the icon failed to render or appeared blank when inserted inside the video player's Shadow DOM.

## [1.0.3] - 2026-07-13

### Added
- **Instant Hide Button (Focus Mode)**: Added a sleek arrow button in the bottom-left area of the player controls (next to the play/pause button). Clicking it instantly hides all webpage icons, whiteboard drawing tools, page headers, player control bars, and the mouse cursor, leaving only the video playing on a solid black screen.
- **Popup Settings Toggle**: Added an option in the Focus tab of the settings popup to enable or disable the arrow button.
- **Instant Reveal**: Moving the mouse or touching the screen over the video player instantly restores the mouse cursor and all hidden page elements.
- **Microsoft Edge Store Link**: Added direct download links to the official Microsoft Edge Add-ons store in the README.
- **Repository Restructuring**: Reorganized folder architecture to meet professional developer standards:
  - Moved extension code to a clean `/src` folder.
  - Consolidated all auto-generated platform builds and ZIP files into a single `/dist` folder.
- **CONTRIBUTING.md File**: Created a setup and contribution guide for developers looking to build new features.

### Changed
- **Edge "Rate Us" Link**: Updated the feedback link to open the official Edge store listing page directly instead of the generic home page.
- **Git Configurations**: Cleaned up `.gitignore` to prevent tracking built binaries and store packaging ZIP archives.
- **Popup Settings Organization**: Moved "Hide Speed Widget" and "Instant Hide Button" configuration toggles from the Focus tab to the Speed tab under the "Shortcut & Mouse Wheel Settings" section.
- **Collapsible Configuration Panels**: Changed the Keyboard Hotkey configuration grid and Hold-Space speed input row to be completely hidden when their parent features are disabled, making the dashboard panel much cleaner.
- **Updated Default Keyboard Shortcuts**: Set the default keys to 'h' (Speed Up), 'j' (Slow Down), and 'l' (Reset Speed) to provide a more intuitive and comfortable keyboard layout. Displayed keys are now automatically shown in uppercase (e.g., 'L' instead of 'l') to prevent visual confusion with the number '1'.

### Fixed
- **6-7 Second Page Freeze (Lag Fix)**: Optimized DOM elements lookup by implementing a caching mechanism with connectivity checks and throttling DOM mutation observer scans. Page settings toggles are now completely instant.
- **Hold-Space Permanent Speed Boost Bug**: Fixed a race condition where holding Spacebar to boost speed and then clicking into a text field (like a search bar) would permanently lock the playback speed at the boosted rate with no way to undo it except reloading the page. Now the original speed is always restored when the Spacebar is released, regardless of where focus has moved. Also added a safety check that resets the speed if you switch tabs while holding Spacebar.
- **Extension Enable/Disable Toggle Ignored**: Fixed a bug where the popup settings always treated the extension as enabled, ignoring the stored enable/disable state. The popup now correctly respects the saved state.
- **Hotkey Keycaps Blank on First Install**: Fixed a bug where the three keyboard shortcut keycap boxes appeared empty on first install instead of showing the default keys (`>`, `<`, `r`).
- **Google Fonts Loaded Twice in Popup**: Removed a duplicate font request that was slowing down popup load. The same fonts were being fetched both by the HTML and the CSS file — now they load only once.
- **Dead Code Cleanup**: Removed unused functions, CSS rules, HTML elements, and variables across all source files. This includes an unused `isInteractiveControl()` function, 13 hidden description labels, 4 orphaned CSS class rules, and redundant CSS selectors. Reduces overall file size and keeps the codebase clean.
- **Wasted Background CPU / Battery Fix**: Optimized the extension background checks to only run the safety-net monitor interval when a video is actually playing or loaded on the page. The interval is automatically stopped on non-video pages to prevent CPU drain.
- **Slow Page Querying Optimization**: Streamlined the `findVideos()` helper to only query direct video elements instead of scanning every single element in the DOM tree, removing expensive shadow DOM traversals.
- **Duplicate DOM Render Cycles Removed**: Fixed a bug where `applyDistractorsState()` was executed twice on every monitor cycle, cutting redundant page checks and styling operations in half.
- **Multi-Frame Memory Overhead Fix**: Disabled frame-level script injection (`all_frames: false` in manifest.json) so the extension only runs in the main parent window and not inside hidden ads or tracking frames.

---

## [1.0.2] - 2026-07-09

### Added
- **Light & Dark Mode**: Added a sun/moon button in the top corner of the control panel to switch between a bright style and a dark slate style. Your selection is automatically saved.
- **Smart "Rate Us" Link**: Added a feedback button in the footer that automatically detects your web browser (Chrome, Firefox, or Edge) and opens the correct store page so you can rate the extension.
- **Direct Changelog Link**: Turned the version number in the footer into a link that opens the list of updates on GitHub.

### Changed
- **Dynamic Screen Refreshing**: Improved the extension to automatically trigger a page resize event when settings change. This forces the browser to refresh the video controls layout, preventing visual glitches or misaligned buttons.
- **Keyboard Shortcut Defaults**: Removed the default keyboard keys (`>` to speed up, `<` to slow down, `r` to reset) so shortcuts are empty by default, preventing unexpected button presses.
- **Enable Shortcuts Toggle**: Inverted the keyboard hotkey setting logic. Keyboard shortcuts are now "Enabled" rather than "Disabled" by default, so they will only work if you check the box to turn them on.
- **Hide Note Markers Option**: The distraction option that previously turned off subtitles now hides the note markers timeline on the video player instead.
- **Removed Static Speed Buttons**: Cleaned up the settings view by removing the quick-click speed preset buttons (1.0x, 1.5x, 1.8x, 2.0x), making the controls panel less cluttered.
- **Cleaner Dashboard Styles**: Refreshed the control panel styling with a clean slate gray design (with a "no glow" variation), smoother switching when toggling light/dark themes, and better spacing and text size for easier reading.
- **Chrome Build Folder Rename**: Updated the extension builder script to place Chrome files in a folder named `pw-chrome` instead of the generic name `pw-dist`.

### Fixed
- **Space Hold Focus Fix**: Fixed a bug where holding the Spacebar to speed up wouldn't work if you had just adjusted the video speed slider (because the slider kept focus and the extension thought you were typing in a text field). The key holds now work immediately even if the slider is focused.

---

## [1.0.1] - 2026-07-08

### Added
- **Hold Space to Speed Up**: Press and hold Spacebar to temporarily play at a custom speed (default `2.0x`). Releasing restores original speed. Custom rate is configurable in the popup Speed tab.
- **Hide Settings Gear Icon**: Option to hide the player settings/quality gear icon.
- **Hide Timeline Line**: Option to hide the horizontal seek/progress bar.
- **Hide Time Text**: Option to hide the duration, elapsed time, and remaining time display.
- **GitHub Repository Link**: Added a direct GitHub link in the footer.

### Changed
- **UI/UX Rebrand**: Updated design language to match the new Physics Wallah study portal (`study-v2/study`) using its signature Royal Blue (`#5A4BDA`) and obsidian slate-dark card layouts.
- **Minimalist Header**: Removed header subtitle and stripped the stroke/shadow frame around the logo, centering it at `32px`.
- **Footer Realignment**: Removed the "Focus Command Panel" text and aligned the GitHub link to the far-left and version display (`v1.0.1`) to the far-right.

### Fixed
- **Slash Separator Bug**: Resolved the layout bug where raw text slashes (`/`) remained visible when time text was disabled.
- **Space Double-Toggle Bug**: Resolved a race condition where tapping Space caused the video to play/pause for a microsecond by using capture-phase event listeners to isolate Spacebar interactions from page scripts.

---

## [1.0.0] - 2026-07-02

### Added
- **Speed Control Panel:** Adjustable speed from `0.5x` up to `4.0x` in steps of `0.1x`.
- **Keyboard Shortcuts:** Configurable shortcuts to speed up (`>`), slow down (`<`), and reset (`r`).
- **Scroll Wheel Support:** Scroll up/down over the speed badge to quickly tune playback rate.
- **Dynamic Snap Presets:** Custom presets (defaults `1.0x`, `2.0x`, `3.0x`, `4.0x`) for instant snapping.
- **Study Focus Toggles:** Independent options to disable individual distracting widgets:
  - **Disable 'Ask AI'**: Floating AI pill helper.
  - **Disable Doubt Q&A**: Doubt bubble icon (`💬` with Q).
  - **Disable Live Chat**: Live chat bubble icon (`💬`).
  - **Disable Study Notes**: Notes and PDF attachments.
  - **Disable CC Subtitles**: Captions display overlay and subtitle settings button.
  - **Disable Speed Widget**: Hide the custom speedometer panel itself.
  - **Multitarget Build System:** Build script `build.py` compiles source to minified Chrome (`pw-dist`) and Firefox (`pw-firefox`) builds.
