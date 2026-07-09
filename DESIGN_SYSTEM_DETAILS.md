# Portfolio Design System Details

Canonical direction: **darkest lab interface + electric blue system identity + signal coral actions**.

This file is the detailed reference for the current portfolio styling. The previous transparent/glass-card direction has been replaced with a darker, more readable system:

```text
Nearly black site background
99.9% opaque card and panel surfaces
No large grid backplates behind groups of cards
Electric blue / light cyan for the technical identity
Amber-to-signal-coral for primary actions and highlighted data only
Bright readable body text
Geist typography
```

## Final token block

```css
:root {
  /* Page foundation */
  --bg: #000000;
  --bg-2: #020304;

  /* Cards, panels, windows */
  --surface-window: rgba(3, 8, 15, 0.999);
  --surface-window-strong: rgba(5, 12, 20, 0.999);
  --panel: var(--surface-window);
  --panel-strong: var(--surface-window-strong);
  --panel-soft: var(--surface-window);

  /* Text */
  --text: #f6faff;
  --muted: #a9bcd7;
  --muted-2: #e6eef8;

  /* Borders */
  --line: rgba(255, 255, 255, 0.16);
  --line-soft: rgba(255, 255, 255, 0.10);
  --line-strong: rgba(76, 141, 255, 0.28);

  /* Core system colors */
  --accent: #4c8dff;
  --accent-2: #6fd3ff;

  /* CTA colors */
  --cta-1: #e2b869;
  --cta-2: #e86f4e;

  /* Data / graph colors */
  --data-teal: #3dd6c8;
  --data-teal-2: #6fe5dd;
  --graph-blue: #4c8dff;
  --graph-cyan: #6fd3ff;
  --graph-cyan-soft: #9ad8ff;
  --graph-amber: #e2b869;
  --graph-coral: #e86f4e;
  --graph-teal: #3dd6c8;
  --graph-teal-light: #6fe5dd;

  /* Glows */
  --blue-glow: rgba(76, 141, 255, 0.06);
  --cyan-glow: rgba(111, 211, 255, 0.04);
  --coral-glow: rgba(232, 111, 78, 0.035);
  --teal-glow: rgba(61, 214, 200, 0.08);

  /* Status */
  --danger: #ff7f8e;

  /* Layout */
  --radius: 14px;
}
```

---

## Page foundation

### `--bg: #000000`

Primary page background.

Use it for:

- full page background
- behind hero content
- outer site shell
- deepest dashboard base

Why: the new direction uses the darkest reference from the color comparison. It removes the washed-out glass look and makes the content feel clearer.

### `--bg-2: #020304`

Secondary background depth.

Use it inside background gradients to keep the site from becoming visually flat while still reading as almost black.

Recommended page background:

```css
body {
  background:
    radial-gradient(circle at 18% 12%, rgba(76, 141, 255, 0.06), transparent 28%),
    radial-gradient(circle at 82% 24%, rgba(111, 211, 255, 0.04), transparent 30%),
    linear-gradient(180deg, #000000, #020304 45%, #000000);
}
```

Do not add large orange, purple, or teal background washes.

---

## Surfaces

### `--surface-window: rgba(3, 8, 15, 0.999)`

Default card / panel / window surface.

Use it for:

- cards
- panels
- metric blocks
- project blocks
- timeline cards
- nav shell
- contact blocks
- hobby cards
- work detail panels

Why: the surface should be almost solid so text is easy to read. This replaces the older translucent panel values.

### `--surface-window-strong: rgba(5, 12, 20, 0.999)`

Hover, selected, or emphasized surface.

Use it for:

- active work timeline cards
- hover cards
- selected metric or project cards
- expanded details

Do not use transparency to show hierarchy. Use border, spacing, type weight, or the slightly stronger surface.

### `--panel`, `--panel-strong`, and `--panel-soft`

These should point back to the surface-window system:

```css
--panel: var(--surface-window);
--panel-strong: var(--surface-window-strong);
--panel-soft: var(--surface-window);
```

This keeps older classes visually consistent without requiring every page to be rewritten.

---

## Critical card/grid rule

Do **not** place an opaque background on grid wrappers.

Good:

```css
.card-grid,
.metrics-card-grid,
.project-card-grid {
  background: transparent;
  box-shadow: none;
}

.card-grid > .card,
.metrics-card-grid > .metric-card,
.project-card-grid > .project-card {
  background: var(--surface-window);
}
```

Bad:

```css
.card-grid {
  background: var(--surface-window);
}
```

Why: a grid background creates a large dark backplate behind individual cards. The site should show clean individual cards, not a giant box behind them.

---

## Text

### `--text: #f6faff`

Use for:

- hero headlines
- section headings
- card titles
- metric values
- primary labels

### `--muted-2: #e6eef8`

Use for body copy.

This is brighter than the older body text and reads better on nearly black surfaces without becoming pure white.

Use for:

- card descriptions
- hero subtitles
- explanatory copy
- project summaries
- work details

### `--muted: #a9bcd7`

Use for lower-emphasis text.

Use for:

- labels
- metadata
- captions
- inactive nav text
- small helper text

Do not use muted text for long body copy.

---

## Borders

### `--line: rgba(255, 255, 255, 0.16)`

Default card/panel border.

### `--line-soft: rgba(255, 255, 255, 0.10)`

Subtle inner separators and secondary dividers.

### `--line-strong: rgba(76, 141, 255, 0.28)`

Use for technical hover/focus states and selected card borders.

---

## Accent colors

### `--accent: #4c8dff`

Primary system blue.

Use for:

- active system states
- links
- focus outlines
- technical lines
- main data series

### `--accent-2: #6fd3ff`

Light cyan-blue highlight.

Use for:

- eyebrows
- number labels
- secondary data series
- technical highlights

### `--cta-1: #e2b869` and `--cta-2: #e86f4e`

Use for the primary CTA gradient and important highlighted data.

Do not use warm gradients for large backgrounds.

---

## Optional data teal

`--data-teal` and `--data-teal-2` are allowed only for chart/dashboard data signals, not for the whole site theme.

Use teal for:

- one dashboard series
- one integration metric
- one technical signal category

Do not use teal for:

- page backgrounds
- card backgrounds
- primary buttons
- body text

---

## Hero-page rule

Every hero page should use the same background system as the rest of the site:

```css
background:
  radial-gradient(circle at 18% 12%, rgba(76, 141, 255, 0.06), transparent 28%),
  radial-gradient(circle at 82% 24%, rgba(111, 211, 255, 0.04), transparent 30%),
  linear-gradient(180deg, #000000, #020304 45%, #000000);
```

Do not create a different hero-only background palette.

---

## Final visual checklist

Before merging a visual change, confirm:

- The page background is nearly black.
- Cards are 99.9% opaque.
- Card grids are transparent wrappers.
- There is no large backplate behind a group of cards.
- Body copy uses `#e6eef8` or `--muted-2`.
- Headings use `#f6faff` or `--text`.
- Blue/cyan remain the main technical accent colors.
- Coral/amber appear only for CTAs, highlights, or selected data.
