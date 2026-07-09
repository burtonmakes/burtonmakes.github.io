# Alex Burton / Burton Makes

Personal engineering portfolio for Alex Burton.

Live site:
[![Deploy to GitHub Pages](https://github.com/burtonmakes/burtonmakes.github.io/actions/workflows/deploy.yml/badge.svg)](https://github.com/burtonmakes/burtonmakes.github.io/actions/workflows/deploy.yml)
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
