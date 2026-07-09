# Portfolio Design System

Canonical direction: **darkest lab interface + electric blue accents + signal coral actions**.

The site should feel dark, technical, calm, and easy to read. Use a nearly black page background, nearly solid card surfaces, electric blue / light cyan for system identity, and amber-to-signal-coral only for primary actions or highlighted data.

## Canonical tokens

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

  /* Graph colors */
  --graph-blue: #4c8dff;
  --graph-cyan: #6fd3ff;
  --graph-cyan-soft: #9ad8ff;
  --graph-amber: #e2b869;
  --graph-coral: #e86f4e;

  /* Glows */
  --blue-glow: rgba(76, 141, 255, 0.06);
  --coral-glow: rgba(232, 111, 78, 0.035);
}
```

## Background

Use the darkest reference for the site background.

```css
body {
  background:
    radial-gradient(circle at 18% 12%, rgba(76, 141, 255, 0.06), transparent 28%),
    radial-gradient(circle at 82% 24%, rgba(111, 211, 255, 0.04), transparent 30%),
    linear-gradient(180deg, #000000, #020304 45%, #000000);
}
```

The background should stay quiet. Do not use large teal, purple, or orange washes behind cards.

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

```css
.card:hover,
.panel:hover,
.card.is-active {
  background: var(--surface-window-strong);
}
```

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

```css
h1,
h2,
h3 {
  color: var(--text);
}

p {
  color: var(--muted-2);
}

small,
.label,
.meta {
  color: var(--muted);
}
```

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

## Graph and dashboard colors

Use blue/cyan for most technical and data visuals. Use coral/amber only for emphasis.

```text
80–85% blue/cyan
15–20% amber/coral
```

## Final usage summary

```text
Nearly black site background
99.9% opaque dark-navy cards
No large grid backplates behind cards
Electric blue system identity
Light-cyan technical highlights
Amber-to-signal-coral primary action
Bright readable body copy
Geist typography
```
