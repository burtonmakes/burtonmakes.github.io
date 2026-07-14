# Portfolio Design System

Canonical direction: **darker lab interface + electric blue system identity + signal coral actions**.

This repo’s visual language should stay dark, technical, calm, and readable. Keep the page near-black, keep cards and panels nearly solid, and keep the background effects visible. The goal is a darker palette, not hidden motion or flatter composition.

## Canonical tokens

```css
:root {
  --bg: #000000;
  --bg-2: #010102;
  --surface-window: rgba(1, 5, 10, 0.999);
  --surface-window-strong: rgba(3, 9, 16, 0.999);
  --panel: var(--surface-window);
  --panel-strong: var(--surface-window-strong);
  --panel-soft: var(--surface-window);
  --text: #f6faff;
  --muted: #a9bcd7;
  --muted-2: #e6eef8;
  --line: rgba(255, 255, 255, 0.16);
  --line-soft: rgba(255, 255, 255, 0.10);
  --line-strong: rgba(76, 141, 255, 0.28);
  --accent: #4c8dff;
  --accent-2: #6fd3ff;
  --cta-1: #e2b869;
  --cta-2: #e86f4e;
  --blue-glow: rgba(32, 64, 120, 0.27);
  --coral-glow: rgba(92, 40, 28, 0.22);
}
```

## Background

Use the same darker background system everywhere:

```css
body {
  background:
    radial-gradient(circle at 18% 12%, rgba(32, 64, 120, 0.27), transparent 28%),
    radial-gradient(circle at 82% 24%, rgba(38, 85, 112, 0.22), transparent 30%),
    radial-gradient(circle at 76% 82%, rgba(92, 40, 28, 0.12), transparent 24%),
    linear-gradient(180deg, var(--bg), var(--bg-2) 45%, var(--bg));
}
```

Do not lower the opacity of `body::before`, `.mesh-canvas`, `.particle-canvas`, `.spotlight`, or `body::after` when darkening the site.

## Surfaces

- Use `--surface-window` for default card and panel surfaces.
- Use `--surface-window-strong` for hover or active emphasis.
- Keep grid wrappers transparent. Do not place one large background behind an entire card grid.

## Text

- Use `--text` for headings and primary labels.
- Use `--muted-2` for body copy.
- Use `--muted` for small labels, metadata, and inactive navigation.

## Buttons

Primary actions use the amber-to-signal-coral gradient:

```css
.button-primary {
  border-color: color-mix(in srgb, var(--cta-1), white 15%);
  background: linear-gradient(135deg, var(--cta-1), var(--cta-2));
  color: #031014;
}
```

Use that gradient sparingly so it stays a CTA treatment, not a general background system.

## Final checklist

Before merging a visual change, confirm:

- darker page and glow colors
- original grid, network, particle, and mouse-follower visibility
- nearly solid card and panel surfaces
- no large grid backplates behind cards
- electric blue and light cyan for technical accents
- amber and coral for primary actions and highlighted data
- bright readable body copy
- Geist typography
