# Burton Makes

Recruiter-first portfolio and public project archive for Alex Burton.

Live site:

[https://burtonmakes.github.io](https://burtonmakes.github.io)

## Site purpose

This site serves three audiences:

- Recruiters and hiring managers who need a fast, high-signal overview.
- Friends and visitors who want to browse projects and interests.
- Alex as a public archive of professional work, personal projects, research directions, and older experiments.

The top of the site is intentionally recruiter-first. Personal notes, archive items, and placeholders exist, but they do not lead the information hierarchy.

## Top-level navigation

- `/`
- `/recruiter-overview/`
- `/professional-work/`
- `/personal-projects/`
- `/research-notes/`
- `/personal-notes/`
- `/archive/`
- `/private/`
- `/projects/[slug]/`

## Where to edit content

Primary site content lives in [src/data/site.ts](/Users/alexburton/Documents/GitHub/burtonmakes.github.io/src/data/site.ts).

That file contains:

- brand metadata
- external links
- navigation
- recruiter overview content
- professional work placeholders
- research areas
- personal note sections
- archive items
- project metadata for cards and detail pages

Shared layout and site chrome live in:

- [src/layouts/BaseLayout.astro](/Users/alexburton/Documents/GitHub/burtonmakes.github.io/src/layouts/BaseLayout.astro)
- [src/components/GlobalEffects.jsx](/Users/alexburton/Documents/GitHub/burtonmakes.github.io/src/components/GlobalEffects.jsx)
- [src/styles/global.css](/Users/alexburton/Documents/GitHub/burtonmakes.github.io/src/styles/global.css)

Routes live in `src/pages/`.

## How to add a project

1. Add a new project object to `projects` in [src/data/site.ts](/Users/alexburton/Documents/GitHub/burtonmakes.github.io/src/data/site.ts).
2. Include:
   `slug`, `title`, `section`, `type`, `status`, `timeline`, `summary`, `skills`, `labels`, `links`, `why`, `built`, `worked`, `failed`, `learned`, `stack`, and `nextSteps`.
3. The project will automatically appear on:
   - `/personal-projects/`
   - `/projects/[slug]/`
4. Add it to homepage or recruiter-feature selections if it should be surfaced earlier.

## How labels and tags work

The site uses several label types conceptually:

- status labels such as `active`, `planning`, `building`, `completed`, `archived`
- section labels such as `personal-projects` or `research-notes`
- type labels such as `personal-project`, `collection`, `research-note`
- skill labels such as `hardware`, `AI-systems`, `documentation`, `networking`

Project filters on `/personal-projects/` are driven by the `labels` and `status` fields in each project object.

## Public-safety rules

Everything in this repo should remain public-safe.

- Do not include private company details.
- Do not include confidential work details.
- Do not include private infrastructure details.
- Do not include credentials, tokens, API keys, secrets, private URLs, or internal hostnames.
- Do not add private admin materials.
- If a detail is sensitive, omit it or rewrite it into a public-safe summary.
- Do not expose a public visibility field for content.

## External links

External public links are stored in `siteMeta.links` in [src/data/site.ts](/Users/alexburton/Documents/GitHub/burtonmakes.github.io/src/data/site.ts).

Current configured links:

- GitHub
- LinkedIn
- Google Scholar
- Resume placeholder
- Contact placeholder

## Renaming Burton Makes later

Brand metadata is centralized in `siteMeta`.

To rename the site later from `Burton Makes` to `Burton Projects`, update:

- `siteMeta.siteTitle`
- `siteMeta.brandName`
- `siteMeta.siteDescription` if needed

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
