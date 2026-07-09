# Portfolio Design System

Canonical direction: **darker color palette + electric blue accents + signal coral actions**.

The site should feel dark, technical, calm, and easy to read. Use a nearly black page color palette and nearly solid card surfaces, but do **not** dim the background grid, network, particles, or mouse-follow effect. The goal is darker colors, not hidden background effects.

## Canonical tokens

```css
:root {
  /* Page foundation */
  --bg: #000000;
  --bg-2: #010102;

  /* Cards, panels, windows */
  --surface-window: rgba(1, 5, 10, 0.999);
  --surface-window-strong: rgba(3, 9, 16, 0.999);
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

  /* Graph colors */
  --graph-blue: #4c8dff;
  --graph-cyan: #6fd3ff;
  --graph-cyan-soft: #9ad8ff;
  --graph-amber: #e2b869;
  --graph-coral: #e86f4e;

  /* Darker background glow colors, same effect visibility */
  --blue-glow: rgba(32, 64, 120, 0.27);
  --coral-glow: rgba(92, 40, 28, 0.22);
}
```

## Background

Use darker page and glow colors while keeping the original background-effect visibility.

```css
body {
  background:
    radial-gradient(circle at 18% 12%, rgba(32, 64, 120, 0.27), transparent 28%),
    radial-gradient(circle at 82% 24%, rgba(38, 85, 112, 0.22), transparent 30%),
    radial-gradient(circle at 76% 82%, rgba(92, 40, 28, 0.12), transparent 24%),
    linear-gradient(180deg, var(--bg), var(--bg-2) 45%, var(--bg));
}
```

Do not lower the opacity of `body::before`, `.mesh-canvas`, `.particle-canvas`, `.spotlight`, or `body::after` when changing the color palette. Those effects should stay visible behind the content.

## Cards and panels

All card-like surfaces should use the same nearly solid surface color.

```css
.card,
.panel,
.window {
  background: var(--surface-window);
  border: 1px solid var(--line);
}
```

Hover or active cards may use `--surface-window-strong`, but they should not become translucent or add a large parent backplate behind a card grid.

## Important layout rule

Do not give grid wrappers a panel background.

Good:

```css
.card-grid {
  background: transparent;
}

.card-grid > .card {
  background: var(--surface-window);
}
```

Bad:

```css
.card-grid {
  background: var(--surface-window);
}
```

The page should show individual cards, not a large dark box behind a group of cards.

## Text

Use `--text` for headings and primary labels.

Use `--muted-2` for body copy. It is brighter than the old body text and reads better on dark panels without becoming pure white.

Use `--muted` for small labels, metadata, and inactive navigation text.

## Buttons

Primary actions use the amber-to-signal-coral gradient.

```css
.button-primary {
  border-color: color-mix(in srgb, var(--cta-1), white 15%);
  background: linear-gradient(135deg, var(--cta-1), var(--cta-2));
  color: #031014;
}
```

Use this gradient sparingly. It should not become a background color system.

## Final usage summary

```text
Darker page and glow colors
Original grid/network/mouse-follower visibility
99.9% opaque darker cards
No large grid backplates behind cards
Electric blue system identity
Light-cyan technical highlights
Amber-to-signal-coral primary action
Bright readable body copy
Geist typography
```
