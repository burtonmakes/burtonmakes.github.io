# Burton Makes design system

Burton Makes uses a dark, laboratory-inspired interface to frame technical work without competing with it. The near-black background creates depth, teal and mint identify system information, and a restrained amber-to-coral treatment makes primary actions easy to find.

`DESIGN_SYSTEM_VISUAL.html` is a standalone preview of the core palette, cards, panels, tags, and primary action.

## Visual principles

| Principle | How it appears in the site | Reason |
| --- | --- | --- |
| Technical, not sterile | Fine grid, particles, network points, and precise labels | Suggests systems thinking while preserving a human portfolio voice. |
| Dark with readable contrast | Near-black page, nearly opaque panels, bright body copy | Keeps long case studies comfortable to scan. |
| Evidence has hierarchy | Large outcomes, compact metadata, grouped proof cards | Lets visitors move from a claim to supporting detail. |
| Warm actions are rare | Amber and coral appear on the main call to action or selected state | Makes an action visible without turning the whole interface orange. |
| Cool state is consistent | Teal and mint identify system status, focus, and technical relationships | Creates a recognizable interface language across the router and evidence pages. |
| Motion explains structure | Reveals, transitions, and 3D component highlights | Adds context to relationships rather than decorating every element. |
| Entry pages stay minimal | The homepage exposes one CLI and one hidden direct-navigation control | Lets visitors choose their path without reading a conventional landing page. |

## Core color tokens

The shared values are reinforced by `src/layouts/BaseLayout.astro`. Feature pages may define the same values locally when they do not use the shared layout.

```css
:root {
  --bg: #000000;
  --bg-2: #010203;
  --surface-window: rgba(1, 7, 11, 0.999);
  --surface-window-strong: rgba(3, 13, 19, 0.999);
  --text: #f6faff;
  --muted: #9fb5c4;
  --muted-2: #e8f0f5;
  --line: rgba(255, 255, 255, 0.16);
  --line-soft: rgba(255, 255, 255, 0.10);
  --accent: #54d3bd;
  --accent-2: #85ead8;
  --cta-1: #f0b35b;
  --cta-2: #f06b43;
  --blue-glow: rgba(28, 105, 92, 0.25);
  --coral-glow: rgba(112, 47, 30, 0.22);
}
```

### Color roles

- `--text` carries headings and high-priority labels.
- `--muted-2` carries normal body copy.
- `--muted` carries metadata, inactive navigation, and supporting labels.
- `--accent` and `--accent-2` mark technical relationships, online state, and interactive focus.
- `--cta-1` and `--cta-2` identify the primary action or emphasized state.
- `--line` and `--line-soft` separate surfaces without creating bright boxes.

## Background and depth

The page background combines three restrained radial glows with a black vertical gradient:

```css
body {
  background:
    radial-gradient(circle at 18% 12%, rgba(28, 105, 92, 0.25), transparent 28%),
    radial-gradient(circle at 82% 24%, rgba(51, 112, 105, 0.18), transparent 30%),
    radial-gradient(circle at 76% 82%, rgba(112, 47, 30, 0.12), transparent 24%),
    linear-gradient(180deg, var(--bg), var(--bg-2) 45%, var(--bg));
}
```

Four layers create the sense of depth:

1. the base gradient;
2. the fixed grid and vignette in global CSS;
3. the Three.js particle and network canvas from `BackgroundEffects.jsx`;
4. the pointer-following spotlight on fine-pointer devices.

Cards remain almost opaque so these background layers are visible around content rather than through paragraphs.

## Surfaces

Default cards and panels use `--surface-window`. Hovered or selected surfaces use `--surface-window-strong`. Grid containers stay transparent, which allows each card to read as an individual piece of evidence instead of one large dashboard slab.

The main surface families include:

- navigation and interface shells;
- capability, work, and project cards;
- metric and evidence tiles;
- dialogs and recruiter panels;
- contact and hobby cards.

Feature pages can introduce new layouts while retaining the same contrast, border, spacing, and action hierarchy.

## Typography

The portfolio uses Geist with a system-font fallback. Large headings use tight line height and tracking, while body text keeps a wider line height for technical descriptions. Eyebrows and metadata use smaller type, stronger weight, and increased letter spacing to distinguish structure from narrative content. CLI and system-state text use the native monospace stack rather than loading another font.

The visual hierarchy is:

1. page or case-study title;
2. section heading;
3. card title or outcome;
4. body explanation;
5. metadata, tags, and evidence labels.

## Buttons and links

The primary action uses the warm gradient:

```css
.button-primary {
  border-color: color-mix(in srgb, var(--cta-1), white 15%);
  background: linear-gradient(135deg, var(--cta-1), var(--cta-2));
  color: #031014;
}
```

Secondary, tertiary, and text links rely on borders, cool accents, or plain text. This keeps the warm treatment meaningful. Entire work and project cards are links when the full card represents one destination; tags describe the item and are not separate navigation targets.

The homepage Direct path menu is an exception built for fast routing: the active destination uses coral on the left, while its concise explanation uses a dark teal surface on the right.

## Homepage router

The production homepage is a single-purpose routing surface:

- the logo and current location sit in the upper-left;
- only `Direct path` is visible in the upper-right;
- the center contains one short heading and one CLI;
- known commands route locally without an AI request;
- ambiguous natural language is limited to 320 characters and sent to a small classifier;
- classifier output is limited to one route and one short sentence;
- the previous long-form homepage remains available at `/deprecated-home/`.

The router should not become a general chatbot. Its purpose is to identify the closest site destination and move the visitor there with minimal copy and minimal token use.

## Motion and interaction

`GlobalEffects.jsx` supplies short reveal motion, counters, navigation behavior, and page-transition support. `BackgroundEffects.jsx` supplies ambient motion and pointer response. The Cocometric route uses scroll position to explain the spatial relationship between hardware layers. The homepage boot sequence can be skipped immediately and is removed for reduced-motion preferences.

Motion follows three rules:

- it communicates entry, focus, or spatial relationship;
- it does not block access when a visitor chooses to skip it;
- reduced-motion preferences receive a quieter experience.

## Responsive behavior

The main layout moves from multi-column grids to one-column reading order as space narrows. Navigation changes to a menu button, controls remain large enough for touch, and the background scene reduces its particle and node counts on smaller screens.

The homepage Direct path panel moves from a split menu-and-summary layout to a stacked touch layout. The CLI remains the primary interaction and its input grows vertically on phone screens.

The Cocometric page has separate desktop and mobile styles because its camera framing, fixed copy, stage controls, and final service section depend on viewport geometry.

## Accessibility considerations

- A skip link reaches the main content.
- Navigation and interactive controls use visible text or accessible labels.
- Active and expanded states are reflected through ARIA attributes where appropriate.
- Body text uses the brighter muted token rather than low-contrast gray.
- Content remains in the document even when animation or WebGL is unavailable.
- Motion code checks `prefers-reduced-motion`.
- The homepage routes remain normal links even when the classifier is unavailable.

## Applying the system to a new component

A new component normally begins with an existing layout primitive from `global.css`, an opaque surface, a single-pixel line, and the established text hierarchy. Cool accents describe technical state; the warm gradient is reserved for the most important action.

Before merging a visual change, review:

- text contrast at normal and hover states;
- keyboard focus and control labels;
- mobile reading order and touch targets;
- reduced-motion behavior;
- consistency with existing card radius, border, and spacing;
- whether the background remains visible around, rather than through, content;
- whether the primary action is still visually unique;
- whether visible text is necessary for the visitor's current decision.
