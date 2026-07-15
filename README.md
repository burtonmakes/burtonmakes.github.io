[![Deploy to GitHub Pages](https://github.com/burtonmakes/burtonmakes.github.io/actions/workflows/deploy.yml/badge.svg)](https://github.com/burtonmakes/burtonmakes.github.io/actions/workflows/deploy.yml)
[![Validate site and AI checks](https://github.com/burtonmakes/burtonmakes.github.io/actions/workflows/validate.yml/badge.svg)](https://github.com/burtonmakes/burtonmakes.github.io/actions/workflows/validate.yml)

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

## Where to edit content

Canonical profile and project content lives in the private source repository:

- `CocoHusky/job-search/profile/public-portfolio.json`

The public site consumes the approved export during the build. Do not edit the
generated snapshot directly.

Public site data consumers live in:

- `src/data/site.ts`

Shared layout and site chrome live in:

- `src/layouts/BaseLayout.astro`
- `src/components/GlobalEffects.jsx`
- `src/styles/global.css`

Routes live in:

- `src/pages/`

## How to add a project

1. Add or correct the verified project record in the private `job-search` repository.
2. Approve the record for public display in `profile/public-portfolio.json`.
3. Include:
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
4. Run `npm run profile:sync` locally, then build. The project will automatically appear on:
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

The build validates both the Cocometric model and the recruiter assistant contract before Astro compiles the site.

## Analytics

This site uses optional [Plausible](https://plausible.io/) analytics for privacy-friendly, aggregate tracking.

How it works:

- the site loads the Plausible-hosted script only in production
- analytics stays off unless the env flags are enabled
- tracked events are aggregate interactions such as page views, nav clicks, project opens, and source-code clicks
- the site still works normally if Plausible is not configured

You do not need Plausible to run or deploy the site. The repo includes `.env.example` with the non-secret settings needed to enable it if you want analytics on your own deployment.

## Recruiter portfolio assistant

The recruiter-facing workflow lives at `/recruiter/start/` and `/recruiter/`.

## Profile source synchronization

Approved public and recruiter-facing work-history facts are authored in the
`CocoHusky/job-search` repository at `profile/public-portfolio.json`. The site
build runs `npm run profile:sync` before validation and copies only that
approved export into `src/data/generated/profile-source.json`. Raw job-search
evidence is never sent to the browser.

Local builds expect `../job-search` next to this repository. CI checks out the
private source repository into an isolated workspace path using the required
`JOB_SEARCH_READ_TOKEN` secret. There is intentionally no public-token
fallback.

Before changing the sync contract, preserve the current state with:

```sh
git branch backup/pre-profile-sync-20260714
```

The generated snapshot can be reverted independently if the source checkout
or profile schema needs to be rolled back.

The complete architecture, exact button actions, Mermaid diagrams, source files, retrieval flow, quota behavior, and deployment dependencies are documented here:

- [`docs/RECRUITER_ASSISTANT_WORKFLOW.md`](docs/RECRUITER_ASSISTANT_WORKFLOW.md)

High-level behavior:

- the recruiter enters a name, company or team, and target role
- the recruiter pastes or edits the complete job description
- clicking `Analyze role` sends the role text to the Cloudflare Worker
- Cloudflare AI Search retrieves public work and project evidence
- Qwen creates a concise role summary and source-backed reasons to interview
- the Worker validates every returned source ID before the page displays it
- evidence coverage is shown as requirements supported by work and requirements supported by projects
- the right-side Portfolio chat runs a new retrieval for every follow-up question
- the page does not show a fuzzy score or hiring percentage

Worker commands:

```bash
npm run worker:dev
npm run worker:deploy
```

Primary implementation files:

- `src/pages/recruiter/start.astro`
- `src/pages/recruiter/index.astro`
- `public/recruiter-state-bridge.js`
- `workers/recruiter-match/src/index-v2.ts`
- `workers/recruiter-match/wrangler.toml`

Repository validation:

```bash
npm run validate:recruiter
```

GitHub Actions also runs `.github/workflows/validate.yml`, which validates the UI contract, compiles the Worker with a Wrangler dry run, builds the production site, and verifies the generated recruiter pages.

After deploying the Worker, set this GitHub Actions repository variable so the static site knows where to send recruiter requests:

```text
PUBLIC_RECRUITER_MATCH_API=https://burton-recruiter-match.burtonmakes.workers.dev
```

Without `PUBLIC_RECRUITER_MATCH_API`, the recruiter pages still render but analysis and chat report that the endpoint is not configured.
