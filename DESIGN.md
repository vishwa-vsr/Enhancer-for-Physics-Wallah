# Enhancer for Physics Wallah — Design System & Style Guide

Welcome to the official design system for the **Enhancer for Physics Wallah** project. This document locks in brand consistency, ergonomics, and anti-slop rules across both the **Extension Popup** and the **Study Dashboard**.

---

## 1. AI Guardrail Checklist

> [!IMPORTANT]
> Any AI assistant modifying or creating UI in this repository **must** verify against these rules before completing work:

- [ ] **Always Reuse Existing Building Blocks**: Never roll a custom modal, delete button, shortcut box, toggle, or icon grid from scratch. Use the shared components in `src/shared/components/`.
- [ ] **Strict Anti-Slop Policy**:
  - No generic AI purple-to-blue gradient cards or backgrounds.
  - No nested cards (never put a card inside a card inside another card; use spacing, subtle dividers, or flat tinted backgrounds).
  - No hardcoded colors: always reference CSS variables from `src/shared/tokens.css` or preset colors from `src/shared/colors.ts`.
  - Exactly **one** primary accent button per view; all secondary actions must be ghost, outline, or neutral buttons.
- [ ] **Extension Popup Size Constraints**:
  - Width: strictly `360px`.
  - Max height: `580px` (never exceed 600px to avoid browser viewport cutoffs).
  - Zero horizontal scrollbars (`overflow-x: hidden`).
- [ ] **Typography**:
  - Only use the bundled offline `Inter` variable font (`src/fonts/InterVariable.woff2`). Never import Google Fonts via external CDN.
- [ ] **Destructive Actions**:
  - Never trigger instant deletions. Always use the 2-step `<ConfirmDeleteButton />` with the 3.5s auto-reset countdown.
- [ ] **Accessibility & Contrast**:
  - Maintain a minimum 4.5:1 contrast ratio for all text.
  - Dark mode body text must be high-contrast (`#f8fafc` or `#cbd5e1`), never dark grey on black.

---

## 2. Surfaces & Density

This project has two distinct operating environments:

| Surface | Target Dimensions | Visual Character | Key Components |
| :--- | :--- | :--- | :--- |
| **Extension Popup** (`src/popup/`) | Fixed `360px` width, max `580px` height | Compact ergonomics, high information density, instant 1-click toggles, zero clutter | `TabBar`, `FeatureRow`, `Toggle`, `ShortcutInput`, `Stepper` |
| **Study Dashboard** (`src/dashboard/`) | Full viewport / responsive browser tab | Clean study workspace, focused task list, sidebar navigation, dark/light theme support | `Sidebar`, `TaskItem`, `Modal` (md & lg), `DatePicker`, `SelectDropdown` |

---

## 3. Color Tokens & Theming

Theme variables are defined in [`src/shared/tokens.css`](file:///d:/Anti%20Gravity/pw%20control/src/shared/tokens.css). The extension defaults to a rich dark theme and supports a clean light theme in the dashboard.

### Core Theme Tokens

| Token Variable | Dark Theme (Default) | Light Theme (`body.light-theme`) | Role & Purpose |
| :--- | :--- | :--- | :--- |
| `--bg-main` | `#000000` | `#f0f1f4` | Main app window background |
| `--bg-card` | `#141416` | `#ffffff` | Primary container cards, modals, and sheets (Neutral Dark Charcoal) |
| `--bg-card-hover` | `#1b1b1e` | `#fafafa` | Card hover state |
| `--bg-control` | `#222226` | `#e4e5eb` | Neutral buttons, inputs, category chips |
| `--bg-control-hover` | `#2a2a2f` | `#dbdce2` | Neutral button hover state |
| `--card-sub-bg` | `#202024` | `#e5e6ec` | Nested sub-boxes and shortcut containers |
| `--card-sub-control-bg` | `#101012` | `#ffffff` | High-contrast inner inputs inside sub-boxes |
| `--border-subtle` | `rgba(255, 255, 255, 0.08)` | `rgba(0, 0, 0, 0.08)` | Subtle card borders and dividers |
| `--divider-color` | `rgba(255, 255, 255, 0.08)` | `rgba(0, 0, 0, 0.08)` | Separator lines between sections |
| `--tab-nav-bg` | `#141416` | `#e5e6ec` | Tab navigation background bar |
| `--tab-indicator-bg` | `#25252a` | `#ffffff` | Active tab indicator pill (100% purple-free) |

### Text & Accent Tokens

| Token Variable | Dark Theme | Light Theme | Role & Purpose |
| :--- | :--- | :--- | :--- |
| `--text-primary` | `#f8fafc` | `#18181b` | Main headings, active titles, high-contrast labels |
| `--text-secondary` | `#cbd5e1` | `#52525b` | Body text, feature descriptions, inactive buttons |
| `--text-muted` | `#8e9bb0` | `#64748b` | Subtitles, input placeholders, category tags |
| `--text-subtle` | `#64748b` | `#94a3b8` | Timestamps, secondary hints |
| `--accent-primary` | `#6c63ff` | `#5a55ea` | Brand primary color, active switches, submit buttons |
| `--accent-hover` | `#7e77ff` | `#4e48d6` | Primary button hover state |
| `--accent-dim` | `rgba(108, 99, 255, 0.15)` | `rgba(90, 85, 234, 0.12)` | Active icon tint backgrounds |
| `--input-fg` | `#9b95ff` | `#5a55ea` | Shortcut letter font color, input highlight |
| `--warning-text` | `#fbbf24` | `#d97706` | Shortcut conflict notices, alerts |
| Danger Color | `#ef4444` | `#dc2626` | Delete buttons, confirm states, errors |

---

## 4. The 24-Color Study Palette

Defined in [`src/shared/colors.ts`](file:///d:/Anti%20Gravity/pw%20control/src/shared/colors.ts), this curated palette provides vibrant, accessible color options for Subjects, Chapters, and Study Labels.

| Color Name | Hex Code | Swatch | Recommended Study Use |
| :--- | :--- | :--- | :--- |
| **Indigo** | `#6366f1` | `■` | Core Mathematics / Physics |
| **Blue** | `#3b82f6` | `■` | Chemistry / Theory Lectures |
| **Sky Blue** | `#0ea5e9` | `■` | Practice Problem Sets / DPPs |
| **Cyan** | `#06b6d4` | `■` | Inorganic Chemistry |
| **Teal** | `#14b8a6` | `■` | Biology / Zoology |
| **Emerald** | `#10b981` | `■` | Botany / Environmental Science |
| **Green** | `#22c55e` | `■` | Completed / High Confidence Chapters |
| **Lime** | `#84cc16` | `■` | Quick Revision Topics |
| **Yellow** | `#eab308` | `■` | Formula Sheets / Memorization |
| **Amber** | `#f59e0b` | `■` | Important Warnings / High-Weightage Chapters |
| **Orange** | `#f97316` | `■` | Upcoming Mock Tests |
| **Deep Orange**| `#ea580c` | `■` | Weak Topics Needing Review |
| **Red** | `#ef4444` | `■` | Overdue Tasks / Urgent Backlog |
| **Rose** | `#f43f5e` | `■` | PYQs (Previous Year Questions) |
| **Pink** | `#ec4899` | `■` | Self Notes & Flashcards |
| **Fuchsia** | `#d946ef` | `■` | Special Lectures / One-Shots |
| **Purple** | `#a855f7` | `■` | Organic Chemistry |
| **Violet** | `#8b5cf6` | `■` | General Study & Routine |
| **Electric Violet** | `#7c3aed` | `■` | Marathon Sessions |
| **Cobalt Blue** | `#2563eb` | `■` | Mechanics & Electrodynamics |
| **Berry Pink** | `#be185d` | `■` | Short Notes & Mindmaps |
| **Bronze** | `#a16207` | `■` | History & General Knowledge |
| **Slate Gray** | `#64748b` | `■` | General / Miscellaneous Tasks |
| **Deep Navy** | `#334155` | `■` | Archive / Backburner Items |

> [!TIP]
> **Dynamic Tinting**: When highlighting an active icon or badge with a subject color, always use the helper function `getAlphaColor(hex, 0.16)` from `@shared/theme` to produce a transparent background tint that looks balanced on both dark and light cards.

---

## 5. Typography Scale

The project uses a clean, single-font system powered by **Inter Variable** (`--font-sans`).

| Token | Size | Line Height | Weight | Typical Usage |
| :--- | :--- | :--- | :--- | :--- |
| `--font-size-xs` | `11.5px` | `1.3` | `500` / `600` | Subtitle chips, badge labels, shortcut notices |
| `--font-size-sm` | `12.5px` | `1.4` | `500` / `600` | Feature row labels, action buttons, table rows |
| `--font-size-base` | `13.5px` | `1.5` | `400` / `500` | Input fields, standard task descriptions |
| `--font-size-md` | `15px` | `1.4` | `600` | Section card headers, modal sub-headers |
| `--font-size-lg` | `17px` | `1.3` | `600` / `700` | Modal titles, key metric numbers |
| `--font-size-xl` | `20px` | `1.2` | `700` | Main dashboard header, empty state titles |

---

## 6. Spacing & Border Radii

### Spatial Rhythm (4px / 8px Scale)
- `--space-1` (`4px`): Micro gaps, icon-to-label separation, inner chip padding.
- `--space-2` (`8px`): Standard gap between form items, row controls, and grid cells.
- `--space-3` (`12px`): Inner padding for cards, inputs, and button sides.
- `--space-4` (`14px`): Card horizontal padding, tab bar separation.
- `--space-5` (`18px`): Form group bottom margins, major section dividers.

### Corner Radii
- `--radius-sm` (`6px`): Shortcut boxes, cancel buttons, category chips, small inputs.
- `--radius-md` (`10px`): Main inputs, textareas, icon grid frames, settings group cards.
- `--radius-lg` (`14px`): Large cards, dashboard widgets.
- `--radius-xl` (`16px`): Floating dialogs, modals (`Modal.tsx`).
- `--radius-full` (`9999px`): Pill badges, switch toggles, circular color swatches.

---

## 7. Reusable Component Catalog

All shared building blocks reside in [`src/shared/components/`](file:///d:/Anti%20Gravity/pw%20control/src/shared/components/):

```
src/shared/components/
├── Modal.tsx & Modal.module.css
├── ShortcutInput.tsx & ShortcutInput.module.css
├── ConfirmDeleteButton.tsx & ConfirmDeleteButton.module.css
├── IconPicker.tsx & IconPicker.module.css
├── Toggle.tsx & Toggle.module.css
├── SelectDropdown.tsx & SelectDropdown.module.css
├── Stepper.tsx & Stepper.module.css
├── ColorPicker.tsx & ColorPicker.module.css
├── FeatureRow.tsx & FeatureRow.module.css
├── TabBar.tsx & TabBar.module.css
├── CollapsibleSubOption.tsx & CollapsibleSubOption.module.css
└── StudyIcons.tsx
```

### 1. `Modal`
- **Purpose:** Universal window shell for popup dialogs.
- **Sizes:**
  - `sm` (`380px` max): Alerts, confirm prompts.
  - `md` (`440px`): Add/Edit Subject, Add/Edit Chapter.
  - `lg` (`900px`): Add/Edit Task creation form.
- **Built-in Features:** Automatic Escape key handling, backdrop blur, scale-up entrance animation, and drag-out text selection protection.

### 2. `ShortcutInput`
- **Purpose:** Accessible keyboard hotkey recorder.
- **Appearance:** Dark pill with centered purple letter, glowing purple outline on focus (`box-shadow: 0 0 0 2px var(--accent-primary)`), and `"Press key..."` state.
- **Built-in Features:** Spacebar reservation guard, modifier key ignoring, conflict check warning, Backspace to clear (`—`), Escape to cancel.

### 3. `ConfirmDeleteButton`
- **Purpose:** Safe 2-step destructive action button.
- **Behavior:** First click turns the button red and changes label to `"Confirm?"`. If not clicked within 3.5 seconds, it automatically cancels itself. Second click triggers the actual deletion.

### 4. `IconPicker`
- **Purpose:** 5-category study icon selector (`All`, `Math`, `Physics`, `Chem & Bio`, `General`).
- **Behavior:** 7-column grid with custom color highlighting matching the active subject.

### 5. `Toggle`
- **Purpose:** Accessible switch for binary settings (`--switch-bg-off: #2e323e`, `--switch-bg-on: var(--accent-primary)`).

### 6. `SelectDropdown`
- **Purpose:** Custom themed dropdown with auto-placement (top/bottom) and icon rendering.

### 7. `Stepper`
- **Purpose:** `+` / `-` numeric adjustment box (e.g. video speed steps, silence duration in seconds).

---

## 8. Do's and Don'ts Checklist

| Do | Don't |
| :--- | :--- |
| **Do** use `var(--bg-card)` for primary cards and `var(--card-sub-bg)` for inner sub-panels. | **Don't** nest 3 colored cards inside one another. Use spacing or flat dividers instead. |
| **Do** use `ConfirmDeleteButton` for any action that removes user data. | **Don't** trigger instant deletes or rely on ugly native `window.confirm()` popups. |
| **Do** use `ShortcutInput` whenever capturing keyboard keys. | **Don't** write raw `<input onKeyDown=...>` listeners for hotkeys. |
| **Do** preserve the 360px width constraint in extension popups. | **Don't** introduce wide horizontal tables that trigger horizontal scrollbars in the popup. |
| **Do** pair subject colors with `getAlphaColor(color, 0.16)` for soft badges and icon rings. | **Don't** put bright, neon saturated text directly on light backgrounds. |
