[![Deploy to GitHub Pages](https://github.com/burtonmakes/burtonmakes.github.io/actions/workflows/deploy.yml/badge.svg)](https://github.com/burtonmakes/burtonmakes.github.io/actions/workflows/deploy.yml)

# Alex Burton / Burton Makes

Personal engineering portfolio for Alex Burton.

Live site:

[https://burtonmakes.github.io](https://burtonmakes.github.io)

## Site purpose

This site is a focused public portfolio, not a full archive.

It focuses on:

- professional medical-device and wearable-sensing work
- selected technical projects
- AI tools and infrastructure systems
- public contact/profile links

## Top-level navigation

The public navigation should stay small:

- `/`
- `/work/`
- `/projects/`
- `/contact/`

Avoid adding archive, private, notes, or research sections to the main nav until the base site feels clean.

## Current visual system

The current site direction is a **darker lab interface**.

Use these values as the canonical color reference:

```css
:root {
  --bg: #000000;
  --bg-2: #010102;
  --surface-window: rgba(1, 5, 10, 0.999);
  --surface-window-strong: rgba(3, 9, 16, 0.999);
  --text: #f6faff;
  --muted: #a9bcd7;
  --muted-2: #e6eef8;
  --line: rgba(255, 255, 255, 0.16);
  --line-soft: rgba(255, 255, 255, 0.10);
  --accent: #4c8dff;
  --accent-2: #6fd3ff;
  --cta-1: #e2b869;
  --cta-2: #e86f4e;
  --blue-glow: rgba(32, 64, 120, 0.27);
  --coral-glow: rgba(92, 40, 28, 0.22);
}
```

Layout rules:

- Page and hero backgrounds should use the same darker color palette.
- Do not dim the grid, network, particles, or mouse-follow effect to make the page darker.
- Cards and panels should be 99.9% opaque, not glassy.
- Grid wrappers should stay transparent; only individual cards should have card backgrounds.
- Body copy should use `--muted-2` for readability.
- Blue/cyan are the main technical accents.
- Amber/coral are for CTAs, selected states, and highlighted data only.

Design reference files:

- `DESIGN_SYSTEM.md`
- `DESIGN_SYSTEM_DETAILS.md`
- `DESIGN_SYSTEM_VISUAL.html`

## Where to edit content

Primary structured content lives in:

- `src/data/site.ts`

Shared layout and site chrome live in:

- `src/layouts/BaseLayout.astro`
- `src/components/GlobalEffects.jsx`
- `src/styles/global.css`

Routes live in:

- `src/pages/`

## How to add a project

1. Add a new project object to `projects` in `src/data/site.ts`.
2. Include:
   - `slug`
   - `title`
   - `section`
   - `type`
   - `status`
   - `timeline`
   - `summary`
   - `skills`
   - `labels`
   - `links`
   - `why`
   - `built`
   - `worked`
   - `failed`
   - `learned`
   - `stack`
   - `nextSteps`
3. The project will automatically appear on:
   - `/projects/`
   - `/projects/[slug]/`

## Content rule

Every public section should answer one of these:

1. Who is Alex?
2. What does he build?
3. What proof exists?
4. Where should the visitor click next?

If a section does not answer one of those, cut it.

## Public-safety rules

Everything in this repo should remain public-safe.

- Do not include private company details.
- Do not include confidential work details.
- Do not include private infrastructure details.
- Do not include credentials, tokens, API keys, secrets, private URLs, or internal hostnames.
- Do not add private admin materials.
- If a detail is sensitive, omit it or rewrite it into a public-safe summary.

## Local development

Install dependencies and run:

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```

## Analytics

This site uses optional [Plausible](https://plausible.io/) analytics for privacy-friendly, aggregate tracking.

How it works:

- the site loads the Plausible-hosted script only in production
- analytics stays off unless the env flags are enabled
- tracked events are aggregate interactions such as page views, nav clicks, project opens, and source-code clicks
- the site still works normally if Plausible is not configured

You do not need Plausible to run or deploy the site. The repo includes `.env.example` with the non-secret settings needed to enable it if you want analytics on your own deployment.

## Recruiter AI matcher

This site includes an optional Cloudflare Worker for the recruiter matching page at `/recruiter/`.

How it works:

- the static site stays hosted normally through GitHub Pages
- the recruiter page sends pasted role text to a Cloudflare Worker only when someone clicks `Analyze with AI`
- the Worker uses Cloudflare Workers AI model `@cf/qwen/qwen3-30b-a3b-fp8` to extract role requirements and classify portfolio evidence
- the final fit percentage is calculated with a fixed math formula in the Worker, not guessed by the model
- the recruiter page falls back to a local keyword matcher if no Worker URL is configured

Wrangler was added only as an `npx` command in `package.json` scripts. It is not required for normal site builds.

Worker commands:

```bash
npm run worker:dev
npm run worker:deploy
```

The Worker source lives in:

- `workers/recruiter-match/`

After deploying the Worker with Wrangler, set this GitHub Actions repository variable so the static site knows where to send recruiter match requests:

```text
PUBLIC_RECRUITER_MATCH_API=https://burton-recruiter-match.burtonmakes.workers.dev/match
```

You do not need the Worker to run the portfolio locally or deploy the static site. Without `PUBLIC_RECRUITER_MATCH_API`, the recruiter page shows the local fallback state.
