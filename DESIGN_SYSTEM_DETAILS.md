# Final Portfolio Color System

Final direction: **V4 — A1 Dark Lab Interface + Signal Coral + Data Teal Integration**

V4 is the canonical portfolio design system.

Latest refinement:

- soften hero description text to `#94a3b8`
- keep hero description text at 1.125rem with 1.6 line-height
- turn the top nav items into padded pills with softer active fills
- keep action spacing a bit looser so the hero breathes
- keep section wrappers aligned as the shared structural container

It keeps the strongest parts of **V2 / A1 Dark Lab Interface**:

- dark navy-black technical background
- electric blue system identity
- light-cyan dashboard accents
- translucent technical panels
- amber-to-signal-coral primary CTA
- high-contrast white text
- Geist typography
- blue-led dashboard visuals

Then it adds one useful detail from **V3**:

- a restrained **data teal** used only for Integration and dashboard/chart signals

The goal is not to make the whole site teal. The goal is to preserve the stronger V2 identity while giving the dashboard one additional technical data color for clarity.

## Final V4 Identity

```text
Dark lab background
Electric blue system UI
Light-cyan technical dashboard
Amber-to-signal-coral primary CTA
Data teal for Integration and chart signals only
Geist typography
Translucent technical panels
High contrast recruiter-facing readability
```

## Why V4 Is the Final Choice

### V1 Problem

V1 used a cyan/mint system. It looked energetic, but it leaned too far into a dated SaaS / cyber look.

The main issue with V1:

```text
Too much cyan
Too much mint
Less mature for medical-device / regulated engineering work
Primary button does not guide attention strongly enough
```

### V2 Strength

V2 / A1 Dark Lab is the strongest base.

It feels:

```text
technical
premium
medical-device appropriate
high contrast
memorable
recruiter-readable
hardware/system focused
```

The dark navy-black background and electric blue system color feel much more serious than the old cyan/mint system.

### V3 Useful Addition

V3 introduced a good idea: **data teal** works well inside graphs and validation dashboards.

But V3 as a full site palette is a little too restrained and less visually branded than V2.

### V4 Final Decision

V4 is the best combination:

```text
V2 base + V3 data-teal discipline
```

This means:

- V2 controls the brand and layout feel
- Signal Coral controls action
- Data teal appears only in technical dashboard/data contexts
- Blue remains the dominant system color

---

# Final V4 Tokens

```css
:root {
  /* Page foundation */
  --bg: #010409;
  --bg-2: #06101C;

  /* Panels and surfaces */
  --panel: rgba(6, 16, 28, 0.34);
  --panel-strong: rgba(9, 22, 38, 0.46);
  --panel-soft: rgba(255, 255, 255, 0.025);

  /* Text */
  --text: #F6FAFF;
  --muted: #A9BCD7;
  --muted-2: #D3E0EE;
  --hero-copy: #94A3B8;

  /* Borders and grid */
  --line: rgba(255, 255, 255, 0.10);
  --line-soft: rgba(255, 255, 255, 0.05);
  --line-blue: rgba(76, 141, 255, 0.28);

  /* Core system colors */
  --accent: #4C8DFF;
  --accent-2: #6FD3FF;

  /* CTA colors */
  --cta-1: #E2B869;
  --cta-2: #E86F4E;

  /* Data teal */
  --data-teal: #3DD6C8;
  --data-teal-2: #6FE5DD;

  /* Graph colors */
  --graph-blue: #4C8DFF;
  --graph-cyan: #6FD3FF;
  --graph-cyan-soft: #9AD8FF;
  --graph-amber: #E2B869;
  --graph-coral: #E86F4E;
  --graph-teal: #3DD6C8;
  --graph-teal-light: #6FE5DD;

  /* Glows */
  --blue-glow: rgba(76, 141, 255, 0.27);
  --cyan-glow: rgba(111, 211, 255, 0.20);
  --coral-glow: rgba(232, 111, 78, 0.22);
  --teal-glow: rgba(61, 214, 200, 0.24);

  /* Status */
  --danger: #FF7F8E;

  /* Layout */
  --radius: 14px;
}
```

---

# Token-by-Token Color Rationale

## `--bg: #010409`

### Role

Primary page background.

### Why this color

This is the deepest navy-black in the system. It is almost black, but not pure black. Pure black can feel flat and harsh, while `#010409` keeps a subtle blue undertone.

### Use it for

- full page background
- darkest section backgrounds
- behind hero content
- deep dashboard base
- outer page shell

### Do not use it for

- text
- active buttons
- graph lines
- visible borders

### Design effect

Creates the “dark lab” feel. It makes the brighter blues and warm CTA colors look intentional and high contrast.

---

## `--bg-2: #06101C`

### Role

Secondary background depth.

### Why this color

This is a slightly lifted navy. It gives the page depth without drifting into teal, purple, or gray.

### Use it for

- background gradients
- elevated areas behind cards
- soft hero sections
- subtle dashboard depth
- nav glass backplates

### Do not use it for

- primary CTA
- graph lines
- foreground labels

### Design effect

Separates surfaces from the page without needing heavy borders.

---

## `--panel: rgba(6, 16, 28, 0.34)`

### Role

Default translucent panel.

### Why this color

The panel needs to feel like glass over a dark technical interface, not like a fully opaque card. The 0.34 alpha keeps the site open and atmospheric.

### Use it for

- dashboard container
- project cards
- stat cards
- feature cards
- nav shell
- callout panels
- chart backgrounds

### Do not use it for

- body background
- primary buttons
- graph lines

### Design effect

Keeps the site transparent and premium. This is a major part of the V2/A1 look.

---

## `--panel-strong: rgba(9, 22, 38, 0.46)`

### Role

Slightly stronger elevated panel.

### Why this color

Some UI elements need more separation than default panels. This gives emphasis without becoming fully opaque.

### Use it for

- selected dashboard modules
- metric cards
- highlighted project cards
- sticky nav after scroll
- modal-like panels
- cards that need stronger readability

### Do not use it everywhere

If every card uses `--panel-strong`, the design becomes too heavy and loses the transparent lab feel.

### Design effect

Adds hierarchy while preserving the translucent system.

---

## `--panel-soft: rgba(255, 255, 255, 0.025)`

### Role

Very soft white lift.

### Why this color

This is for the faintest surface separation. It prevents the design from feeling flat without visibly “coloring” the surface.

### Use it for

- subtle nested panels
- code blocks
- hover states
- very light card overlays
- background wash inside dashboards

### Do not use it for

- primary cards needing readability
- buttons
- graph elements

---

## `--text: #F6FAFF`

### Role

Primary text.

### Why this color

It is close to white but slightly cool. This makes it feel integrated with the blue/navy palette.

### Use it for

- hero headline
- section headings
- metric numbers
- primary nav text
- card titles
- strong labels

### Do not use it for

- secondary captions
- muted metadata
- disabled states

### Design effect

High readability for recruiters and hiring managers. Important because the dark background needs strong contrast.

---

## `--muted: #A9BCD7`

### Role

Secondary label text.

### Why this color

This blue-gray still reads clearly on dark navy but does not compete with headings.

### Use it for

- dashboard labels
- nav links
- captions
- metadata
- card subtitles
- metric labels
- tags when not active

### Do not use it for

- long body copy if it appears too faint
- hero headline
- key metrics

---

## `--muted-2: #D3E0EE`

### Role

Readable body copy.

### Why this color

This is brighter than `--muted`, so it works better for paragraph text. It keeps body copy readable without becoming pure white.

### Use it for

- hero subtitle
- body paragraphs
- project descriptions
- explanatory copy
- longer sections

### Do not use it for

- small labels
- inactive nav items
- disabled text

## `--hero-copy: #94A3B8`

### Role

Primary hero description color.

### Why this color

This sits below the headline in contrast without looking washed out. It is cool, readable, and closer to the browser-based reference you pointed to.

### Use it for

- hero description paragraphs
- introductory lead copy
- dense summary text that needs a softer tone

### Do not use it for

- labels
- navigation pills
- calls to action

### Design effect

The copy stops competing with the heading while staying visibly crisp.

---

## `--line: rgba(255, 255, 255, 0.10)`

### Role

Default border.

### Why this color

The border needs to define cards and panels without creating a harsh wireframe. 10% white gives separation while staying quiet.

### Use it for

- card borders
- dashboard border
- nav shell border
- chart border
- button outlines
- dividers

### Do not use it for

- highlighted states
- active graph lines
- CTA borders

---

## `--line-soft: rgba(255, 255, 255, 0.05)`

### Role

Very subtle internal line.

### Why this color

Used when separation is needed but should barely register.

### Use it for

- internal grid lines
- chart grid
- nested card borders
- dashboard module borders
- separators inside a card

---

## `--line-blue: rgba(76, 141, 255, 0.28)`

### Role

Blue-accented border.

### Why this color

This ties active or technical states back to the electric blue system identity.

### Use it for

- active dashboard cards
- hover borders
- selected project cards
- focused technical modules
- blue chart containers

### Do not use it for

- every card
- CTA button
- warm validation highlights

---

# Core Accent Colors

## `--accent: #4C8DFF`

### Role

Primary system blue.

### Why this color

This is the brand’s main technical color. It is a medium electric blue: professional, trustworthy, technical, and readable. It avoids the dated full-cyan feeling from V1.

### Use it for

- logo glow
- active system states
- primary dashboard rings
- main blue graph line
- important technical lines
- links
- icon accents
- selected filters
- focus outlines
- high-value system states

### Do not use it for

- primary CTA background
- warning states
- every decorative glow
- body text

### Design effect

This is the portfolio’s “engineering system” color. It should appear often, but mostly in technical and informational roles.

---

## `--accent-2: #6FD3FF`

### Role

Light cyan-blue highlight.

### Why this color

This keeps the dashboard and interface lively without returning to the old mint/cyan-heavy identity. It is a light blue, not green.

### Use it for

- eyebrow text
- “Live Systems” label
- secondary graph line
- hover glow
- chart gradient endpoints
- dashboard status labels
- subtle technical highlights
- active microcopy

### Do not use it for

- primary CTA
- large backgrounds
- body paragraphs
- every label

### Design effect

Adds brightness and technical precision. It pairs with `--accent` to create a blue-led interface.

---

# CTA Colors

## `--cta-1: #E2B869`

### Role

Warm amber CTA start.

### Why this color

Amber provides warmth against the cold navy/blue system. It makes the main button feel more human and inviting.

### Use it for

- start of primary CTA gradient
- secondary button outline
- warm hover states
- subtle highlighted module background
- warm graph comparison start

### Do not use it for

- default dashboard bars
- nav links
- large backgrounds
- body copy

### Design effect

Creates warmth without making the site orange.

---

## `--cta-2: #E86F4E`

### Role

Signal Coral CTA endpoint.

### Why this color

Signal Coral is sharper and more memorable than the original coral. It gives the CTA a clear endpoint and makes the button pop against the dark lab background.

### Use it for

- primary CTA gradient endpoint
- selected validation metric
- strongest callout dot
- important chart comparison point
- small active state where warm emphasis is needed

### Do not use it for

- general UI chrome
- background glow fields
- all bars
- all charts
- body text
- nav

### Design effect

This is the attention-directing color. It should be rare. When it appears, it should mean “look here.”

---

# Data Teal Colors

## `--data-teal: #3DD6C8`

### Role

Integration / data-only teal.

### Why this color

This color comes from V3’s useful technical-data idea. It gives the dashboard a third data series without weakening the V2 brand. It feels precise, medical, and measurement-oriented.

### Use it for

- Integration bar
- Integration line in graph
- Integration dot in chart
- data-only technical states
- signal-processing marks
- dashboard-only secondary data series

### Do not use it for

- main brand identity
- primary CTA
- nav
- headings
- project cards
- large background glow
- all dashboard text

### Design effect

Adds technical clarity without making the whole site teal.

---

## `--data-teal-2: #6FE5DD`

### Role

Light teal endpoint / highlight.

### Why this color

This is the brighter endpoint for teal gradients. It makes the Integration bar and chart dot visible on the dark background.

### Use it for

- endpoint of Integration bar gradient
- Integration chart dot
- teal hover glow
- subtle active dashboard indicator

### Do not use it for

- large UI areas
- CTA
- primary brand elements

---

# Graph Color System

## Graph Role Mapping

```css
--graph-blue: #4C8DFF;        /* primary series */
--graph-cyan: #6FD3FF;        /* secondary blue endpoint */
--graph-cyan-soft: #9AD8FF;   /* soft fills / hover / ghost lines */
--graph-amber: #E2B869;       /* warm comparison start */
--graph-coral: #E86F4E;       /* warm comparison endpoint */
--graph-teal: #3DD6C8;        /* Integration / data teal */
--graph-teal-light: #6FE5DD;  /* Integration highlight endpoint */
```

## Dashboard Ratio

```text
70–75% blue/cyan
15–20% amber/coral
10–15% data teal
```

This ratio matters. The dashboard should still feel blue-led. Teal should not take over.

## What Each Graph Color Means

### Blue / Cyan

Means:

```text
system
baseline
primary technical data
normal measurement
trusted signal
```

Use for:

- Sensing bar
- signal quality ring
- primary line chart series
- default chart dots
- main dashboard glow

### Amber / Coral

Means:

```text
highlight
comparison
selected metric
CTA relationship
important result
```

Use for:

- Validation bar
- highlighted sensitivity module
- key comparison line
- important callout dot
- CTA gradient

### Teal

Means:

```text
integration
data-specific signal
technical measurement
secondary system stream
```

Use for:

- Integration bar
- Integration graph line
- Integration chart dot
- small dashboard data mark

---

# Dashboard Implementation

## Bar Graphs

### Sensing Bar

Use blue/cyan.

```css
.bar-blue,
.bar-sensing {
  background: linear-gradient(90deg, var(--graph-blue), var(--graph-cyan));
  box-shadow: 0 0 18px rgba(111, 211, 255, 0.20);
}
```

### Validation Bar

Use amber/coral.

```css
.bar-orange,
.bar-validation {
  background: linear-gradient(90deg, var(--graph-amber), var(--graph-coral));
  box-shadow: 0 0 18px rgba(232, 111, 78, 0.22);
}
```

### Integration Bar

Use teal.

```css
.bar-teal,
.bar-integration {
  background: linear-gradient(90deg, var(--graph-teal), var(--graph-teal-light));
  box-shadow: 0 0 18px var(--teal-glow);
}
```

## Line Chart

### Primary Blue Line

```css
.line-blue {
  background: linear-gradient(90deg, transparent, var(--graph-blue), var(--graph-cyan));
  box-shadow: 0 0 14px rgba(76, 141, 255, 0.26);
}
```

### Warm Comparison Line

```css
.line-orange {
  background: linear-gradient(90deg, transparent 20%, var(--graph-amber), var(--graph-coral));
  box-shadow: 0 0 14px rgba(232, 111, 78, 0.18);
}
```

### Integration Teal Line

```css
.line-teal {
  background: linear-gradient(90deg, transparent, var(--graph-teal), var(--graph-teal-light));
  box-shadow: 0 0 14px var(--teal-glow);
}
```

## Chart Dots

### Blue Dot

```css
.dot-blue {
  background: var(--graph-blue);
  box-shadow: 0 0 18px rgba(76, 141, 255, 0.35);
}
```

### Coral Dot

```css
.dot-orange,
.dot-coral {
  background: var(--graph-coral);
  box-shadow: 0 0 18px rgba(232, 111, 78, 0.35);
}
```

### Teal Dot

```css
.dot-teal {
  background: var(--graph-teal-light);
  box-shadow: 0 0 18px var(--teal-glow);
}
```

## Dashboard Rings

Rings should remain blue/cyan. Do not make the main rings teal or orange.

```css
.ring {
  background:
    radial-gradient(circle at center, transparent 29%, rgba(76, 141, 255, 0.28) 30%, transparent 33%),
    radial-gradient(circle at center, transparent 43%, rgba(111, 211, 255, 0.25) 44%, transparent 47%),
    radial-gradient(circle at center, rgba(76, 141, 255, 0.12), transparent 64%);
}
```

Reason:

```text
Rings represent the main system health.
System health should stay blue-led.
Teal is only for Integration/data series.
Coral is only for highlighted results.
```

## Dashboard Modules

Default modules stay dark and blue-neutral.

```css
.module {
  border: 1px solid var(--line-soft);
  background: color-mix(in srgb, var(--panel), transparent 12%);
}
```

Highlighted module uses subtle amber/coral.

```css
.module.highlight {
  border-color: color-mix(in srgb, var(--graph-coral), transparent 45%);
  background:
    linear-gradient(135deg, rgba(226, 184, 105, 0.10), rgba(232, 111, 78, 0.08)),
    color-mix(in srgb, var(--panel), transparent 10%);
}
```

Use this for:

- 92% sensitivity
- selected metric
- primary validation outcome

Do not use teal for the selected module unless the selected metric is specifically Integration.

---

# Button System

## Primary Button

The primary button should be warm, not blue.

```css
.button-primary,
.btn.primary {
  border: 1px solid color-mix(in srgb, var(--cta-1), white 15%);
  background: linear-gradient(135deg, var(--cta-1), var(--cta-2));
  color: #031014;
  box-shadow: 0 18px 48px color-mix(in srgb, var(--cta-1), transparent 78%);
}
```

### Use for

- `View work`
- main recruiter-facing action
- one major CTA per section

### Why it works

The site is mostly cold and blue. A warm CTA gives recruiters a clear visual path.

### Do not use for

- every button
- nav links
- chart elements
- tags
- filters

## Secondary Button

```css
.button-secondary,
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

### Use for

- `View projects`
- secondary links
- supporting actions

### Why it works

It connects to the warm CTA system without competing with the primary button.

---

# Background System

## Main Background

```css
body {
  background:
    radial-gradient(circle at 18% 12%, var(--blue-glow), transparent 28%),
    radial-gradient(circle at 82% 24%, color-mix(in srgb, var(--accent-2), transparent 78%), transparent 30%),
    linear-gradient(180deg, var(--bg), var(--bg-2) 45%, var(--bg));
}
```

## Grid Overlay

```css
.grid-overlay {
  background-image:
    linear-gradient(var(--line-soft) 1px, transparent 1px),
    linear-gradient(90deg, var(--line-soft) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: radial-gradient(circle at center, black, transparent 88%);
}
```

## Background Rules

Do:

- keep background blue/navy
- keep glows subtle
- use grid lines lightly
- use blue glow as the main atmosphere

Do not:

- add purple background glows
- add heavy orange background glows
- add large teal background fields
- make background too bright
- make panels fully opaque

---

# Navigation

## Nav Shell

```css
.nav-shell {
  background: color-mix(in srgb, var(--bg), transparent 32%);
  border: 1px solid var(--line);
  backdrop-filter: blur(18px);
}
```

## Brand Mark

Use blue/cyan.

```css
.brand-mark {
  background:
    radial-gradient(circle at 32% 25%, color-mix(in srgb, white, var(--accent) 42%), var(--accent) 40%, var(--bg-2) 72%);
  box-shadow: 0 0 28px color-mix(in srgb, var(--accent), transparent 70%);
}
```

## Nav Links

```css
.nav-links a {
  color: var(--muted);
}

.nav-links a:hover,
.nav-links a.active {
  color: var(--text);
  background: rgba(255, 255, 255, 0.08);
}
```

Do not use teal for nav.

---

# Text Hierarchy

## Hero Eyebrow

```css
.eyebrow {
  color: var(--accent-2);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-weight: 900;
}
```

## Hero Headline

```css
.hero h1 {
  color: var(--text);
  letter-spacing: -0.025em;
}
```

## Body Copy

```css
.hero p,
.body-copy {
  color: var(--muted-2);
}
```

## Captions and Labels

```css
.label,
.caption,
.metric-label {
  color: var(--muted);
}
```

---

# Component Usage Rules

## Hero

Use:

- `--bg`
- `--bg-2`
- `--accent-2` for eyebrow
- `--text` for headline
- `--muted-2` for subtitle
- `--cta-1` to `--cta-2` for primary CTA
- `--panel` for stat cards

Do not use teal in the hero copy area. Teal belongs in the dashboard.

## Stat Cards

Default stat cards use dark panels.

```css
.stat {
  border: 1px solid var(--line-soft);
  background: var(--panel);
}
```

Use warm highlighting only for the one metric that needs emphasis.

## Project Cards

Project cards should be blue-neutral.

Use:

- `--panel`
- `--line`
- `--text`
- `--muted`
- `--accent` for small technical tags

Avoid:

- coral-heavy backgrounds
- teal project-card borders
- too many accent colors in one card

## Tags / Pills

Default:

```css
.tag {
  border: 1px solid var(--line);
  background: rgba(255, 255, 255, 0.06);
  color: var(--muted-2);
}
```

Active technical tag:

```css
.tag.active {
  border-color: var(--line-blue);
  color: var(--text);
  background: rgba(76, 141, 255, 0.10);
}
```

Do not use coral tags unless it is a specific CTA or high-priority alert.

---

# Color Discipline

## Maximum Accent Rule

In one visible section, use no more than:

```text
1 primary blue family
1 warm CTA family
1 data teal family
```

That means:

```text
Blue/cyan = system
Amber/coral = action/highlight
Teal = integration/data
```

If a section has all three, one of them must be clearly dominant and the other two must be supporting.

## Color Frequency

Recommended overall page usage:

```text
70% dark navy / panel / neutral text
20% blue and cyan system color
7% amber and coral CTA/highlight
3% teal data-specific detail
```

## Teal Discipline

Teal is the most dangerous color in V4 because it can easily pull the design back toward the old mint/cyan style.

Use teal only when it means **data integration**.

If teal appears outside the dashboard or chart system, ask:

```text
Is this actually data/integration?
```

If not, use blue/cyan or neutral.

---

# Accessibility and Contrast

## Primary Text

`#F6FAFF` on `#010409` has very high contrast and should be used for important readable content.

## Body Copy

`#D3E0EE` on the dark background is readable for paragraphs and should be preferred over `--muted` for longer copy.

## Muted Labels

`#A9BCD7` is acceptable for labels, but avoid using it for long body copy at small sizes.

## Buttons

The primary CTA uses dark text `#031014` over the amber/coral gradient. This keeps the button readable and strong.

Do not put white text on the lightest part of the amber CTA unless contrast is checked.

## Navigation and spacing

Navigation items should read as roomy capsules rather than tight text chips:

```css
padding: 0.5rem 1.2rem;
border-radius: 9999px;
background: rgba(255, 255, 255, 0.1);
```

Hero action groups should keep a consistent gap and leave extra air before the next content band:

```css
gap: 16px;
margin-bottom: 2.5rem;
```

## Quick access block

The first hero should read as a guided entry point:

- left-side brand and recruiter-facing copy:
  `Alex Burton`, `Burton Makes`, the medical-device systems subtitle, and one short capability paragraph
- hero actions:
  `Start with work`, `View projects`, `LinkedIn`, and `GitHub`
- a right-side `Quick access. Where to look first.` dashboard card with the `Recruiter path` badge
- quick-access internals based on `v4_quick_access_block_final_clean.html`:
  `Featured focus` and `Skill depth`
- visible labels on each internal module so the visitor knows what each block means
- clickable tiles wherever the tile represents navigation
- no resume-download action in the primary public interface; use LinkedIn, GitHub, Google Scholar, Work, Projects, and Contact as the public surfaces

The goal is to make the first screen feel like an organized landing point, not a generic hero.

---

# Migration From Current GitHub Palette

If replacing the current repo palette, map old tokens like this:

```css
/* Old GitHub-style tokens mapped into V4 */
--bg: #010409;
--bg-soft: #06101C;
--bg-elevated: rgba(6, 16, 28, 0.34);

--panel: rgba(6, 16, 28, 0.34);
--panel-strong: rgba(9, 22, 38, 0.46);
--panel-highlight: rgba(76, 141, 255, 0.08);

--text: #F6FAFF;
--muted: #A9BCD7;

--line: rgba(255, 255, 255, 0.10);
--line-strong: rgba(76, 141, 255, 0.28);

/* Keep old variable names if the repo already uses them */
--cyan: #4C8DFF;
--mint: #6FD3FF;
--amber: #E2B869;
--coral: #E86F4E;

/* Add V4 data tokens */
--data-teal: #3DD6C8;
--data-teal-2: #6FE5DD;
```

## Important Migration Note

If the codebase currently uses `--cyan` and `--mint`, do not immediately rename every variable. First remap the values:

```css
--cyan: #4C8DFF;
--mint: #6FD3FF;
```

Then add semantic aliases later:

```css
--accent: var(--cyan);
--accent-2: var(--mint);
```

This reduces breakage.

---

# Final Do / Don't

## Do

- Use V2/A1 as the base
- Use electric blue for system identity
- Use light cyan-blue for dashboard labels and glows
- Use amber-to-signal-coral for primary CTA
- Use coral sparingly for selected/highlighted states
- Use teal only for Integration and chart/data signals
- Keep panels translucent
- Keep the background dark and blue-led
- Keep typography clean and readable

## Do Not

- Do not return to mint green as a brand color
- Do not use cyan as the entire identity
- Do not use teal in navigation
- Do not use teal for primary CTA
- Do not use teal for general project-card chrome
- Do not use coral everywhere
- Do not make panels fully opaque
- Do not add purple glows
- Do not add heavy orange background glows
- Do not use more than three accent families in the same section
- Do not let dashboard colors overpower the content

---

# Final V4 Summary

V4 is:

```text
A1 Dark Lab Interface as the foundation
Signal Coral as the CTA endpoint
Electric blue as the system identity
Light cyan-blue as the technical highlight
Data teal as an Integration-only dashboard color
```

The final system should feel:

```text
serious
technical
premium
recruiter-readable
medical-device appropriate
system-engineering focused
slightly futuristic but not cyber
```

Final call:

```text
Use V4.
```
