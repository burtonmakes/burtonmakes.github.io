# Final Portfolio Color System

Final direction: **A1 Dark Lab Interface + Signal Coral + blue/orange graph accents**

This is the final visual direction for the portfolio. Keep the original A1 Dark Lab Interface structure: dark black-blue base, electric blue system accents, light-cyan technical highlights, translucent dashboard panels, and warm CTA emphasis. The only final adjustment is replacing the original coral/orange endpoint with **Signal Coral** for a sharper and more memorable action color.

## Final Palette

```css
:root {
  /* Page foundation */
  --bg: #010409;
  --bg-2: #06101C;

  /* Panels and surfaces */
  --panel: rgba(6, 16, 28, 0.34);
  --panel-strong: rgba(9, 22, 38, 0.46);

  /* Text */
  --text: #F6FAFF;
  --muted: #A9BCD7;
  --muted-2: #D3E0EE;

  /* Borders and grid */
  --line: rgba(255, 255, 255, 0.10);
  --line-soft: rgba(255, 255, 255, 0.05);

  /* Core system colors */
  --accent: #4C8DFF;
  --accent-2: #6FD3FF;

  /* CTA colors */
  --cta-1: #E2B869;
  --cta-2: #E86F4E;

  /* Graph colors */
  --graph-blue: #4C8DFF;
  --graph-cyan: #6FD3FF;
  --graph-cyan-soft: #9AD8FF;
  --graph-amber: #E2B869;
  --graph-coral: #E86F4E;

  /* Glow */
  --blue-glow: rgba(76, 141, 255, 0.27);
  --coral-glow: rgba(232, 111, 78, 0.22);
}
```

## Color Roles

### Background

Use `--bg` and `--bg-2` for the full page background.

```css
background:
  radial-gradient(circle at 18% 12%, var(--blue-glow), transparent 28%),
  radial-gradient(circle at 82% 24%, color-mix(in srgb, var(--accent-2), transparent 78%), transparent 30%),
  linear-gradient(180deg, var(--bg), var(--bg-2) 45%, var(--bg));
```

The background should stay dark, blue-led, and technical. Do not add purple, teal, or heavy orange background glows.

### Panels

Use translucent dark-blue panels.

```css
background: var(--panel);
border: 1px solid var(--line);
box-shadow: inset 0 1px rgba(255, 255, 255, 0.05);
```

Use `--panel-strong` only for slightly emphasized dashboard modules or selected cards.

### Text

Use:

```css
color: var(--text);
```

for headings and primary text.

Use:

```css
color: var(--muted-2);
```

for body copy.

Use:

```css
color: var(--muted);
```

for labels, metadata, dashboard captions, and navigation links.

### Blue System Accent

Use `--accent` for the main technical identity color.

Use it for:

* logo glow
* primary dashboard rings
* active system accents
* technical lines
* important blue data series

```css
color: var(--accent);
box-shadow: 0 0 24px color-mix(in srgb, var(--accent), transparent 70%);
```

Use `--accent-2` for light-blue highlights.

Use it for:

* eyebrow text
* live system labels
* secondary graph lines
* hover glows
* chart gradients

```css
color: var(--accent-2);
```

## Buttons

### Primary Button

Use the amber-to-signal-coral gradient only for the main action.

```css
.btn.primary {
  border: 1px solid color-mix(in srgb, var(--cta-1), white 15%);
  background: linear-gradient(135deg, var(--cta-1), var(--cta-2));
  color: #031014;
  box-shadow: 0 18px 48px color-mix(in srgb, var(--cta-1), transparent 78%);
}
```

Use for:

* `View work`
* main recruiter-facing CTA
* one primary action per section

Do not use this gradient everywhere.

### Secondary Button

Use the same warm family, but very transparent.

```css
.btn.secondary {
  border: 1px solid color-mix(in srgb, var(--cta-1), transparent 55%);
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--cta-1), transparent 87%),
    color-mix(in srgb, var(--cta-2), transparent 90%)
  );
  color: var(--text);
}
```

Use for:

* `View projects`
* supporting links
* secondary navigation actions

## Graph and Dashboard Color Rules

The dashboard should remain mostly blue, with orange/coral used only for emphasis.

Use this ratio:

```text
80–85% blue/cyan
15–20% amber/coral
```

### Bar Graphs

Default bars should be blue/cyan.

```css
.bar i.blue-bar {
  background: linear-gradient(90deg, var(--graph-blue), var(--graph-cyan));
  box-shadow: 0 0 18px rgba(111, 211, 255, 0.20);
}
```

Highlighted bars should use amber/coral.

```css
.bar i.orange-bar {
  background: linear-gradient(90deg, var(--graph-amber), var(--graph-coral));
  box-shadow: 0 0 18px rgba(232, 111, 78, 0.22);
}
```

Use orange/coral only for:

* selected metric
* important comparison
* standout result
* warning or threshold
* best-performing category

### Line Charts

Use blue for the primary line, cyan for the secondary line, and coral/amber for the highlighted comparison.

```css
.blue-line {
  background: linear-gradient(90deg, transparent, var(--graph-blue), var(--graph-cyan));
  box-shadow: 0 0 14px rgba(76, 141, 255, 0.26);
}

.cyan-line {
  background: linear-gradient(90deg, transparent, rgba(111, 211, 255, 0.72), rgba(111, 211, 255, 0.2));
}

.coral-line {
  background: linear-gradient(90deg, transparent 20%, var(--graph-amber), var(--graph-coral));
  box-shadow: 0 0 14px rgba(232, 111, 78, 0.18);
}
```

### Chart Dots

Use blue/cyan for normal points and signal coral for the most important point.

```css
.dot-blue {
  background: var(--graph-blue);
  box-shadow: 0 0 18px rgba(76, 141, 255, 0.35);
}

.dot-cyan {
  background: var(--graph-cyan);
  box-shadow: 0 0 18px rgba(111, 211, 255, 0.35);
}

.dot-coral {
  background: var(--graph-coral);
  box-shadow: 0 0 18px rgba(232, 111, 78, 0.35);
}
```

### Dashboard Modules

Default modules stay dark and blue-neutral.

```css
.module {
  border: 1px solid var(--line-soft);
  background: color-mix(in srgb, var(--panel), transparent 12%);
}
```

Highlighted modules use a subtle amber/coral wash.

```css
.module.highlight {
  border-color: color-mix(in srgb, var(--graph-coral), transparent 45%);
  background:
    linear-gradient(135deg, rgba(226, 184, 105, 0.10), rgba(232, 111, 78, 0.08)),
    color-mix(in srgb, var(--panel), transparent 10%);
}
```

## Final Usage Summary

Use **A1 Dark Lab Interface** as the base.

Use:

```css
--accent: #4C8DFF;
--accent-2: #6FD3FF;
```

for the technical system, dashboard, glows, and data visuals.

Use:

```css
--cta-1: #E2B869;
--cta-2: #E86F4E;
```

for the primary button and warm action states.

Use **Signal Coral** sparingly. It should not become a dominant background color. It should appear mainly in:

* primary CTA endpoint
* highlighted graph series
* selected metric
* active state
* key data point

Final design identity:

```text
Dark lab background
Electric blue system UI
Light-cyan technical dashboard
Amber-to-signal-coral primary action
Blue graphs with selective orange/coral emphasis
Geist typography
Translucent technical panels
```
