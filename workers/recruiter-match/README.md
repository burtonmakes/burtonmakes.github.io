# Recruiter Match Worker

Cloudflare Worker API for the recruiter skill matcher. The Worker uses Workers AI model `@cf/qwen/qwen3-30b-a3b-fp8` to extract and classify role requirements, then calculates the fit score with deterministic math.

## What the model does

- Extracts important requirements from pasted job text.
- Classifies each requirement as `direct`, `partial`, `adjacent`, or `gap` against the supplied public portfolio index.
- Returns evidence IDs from the supplied index only.

## What the model does not do

- It does not decide the final percentage.
- It does not have private resume data unless that data is already in the site bundle.
- It should not invent projects, companies, or evidence.

## Anti-abuse limits

The site uses two layers of AI Compare limits:

- browser-local limit: the recruiter page tracks 10 AI submissions in `localStorage`
- Worker-side limit: Cloudflare Durable Objects track daily counts before any model call runs

Worker defaults are configured in `wrangler.toml`:

```toml
PER_CLIENT_DAILY_LIMIT = "10"
GLOBAL_DAILY_LIMIT = "75"
```

The Worker hashes the connecting IP before counting it for the daily per-client limit. It does not expose the raw IP in the response. These limits reset by UTC day.

If the Worker-side limit is reached, the API returns `429` and the site falls back to Fuzzy Compare.

## Scoring formula

The Worker applies fixed weights:

- Requirement importance: `high = 1.25`, `medium = 1`, `low = 0.75`
- Match classification: `direct = 1`, `partial = 0.58`, `adjacent = 0.28`, `gap = 0`

Final score:

```text
round(100 * sum(importanceWeight * classificationValue) / sum(importanceWeight))
```

## Deploy

1. Install or use Wrangler through `npx`.
2. Log in:

```bash
npx wrangler login
```

3. Deploy:

```bash
npx wrangler deploy --config workers/recruiter-match/wrangler.toml
```

4. Copy the deployed Worker URL and add `/match` if you want a readable path. The Worker currently accepts any path, so both of these work:

```text
https://burton-recruiter-match.<your-subdomain>.workers.dev
https://burton-recruiter-match.<your-subdomain>.workers.dev/match
```

5. In GitHub, add an Actions repository variable:

```text
PUBLIC_RECRUITER_MATCH_API=https://burton-recruiter-match.<your-subdomain>.workers.dev/match
```

6. Re-run the GitHub Pages deploy workflow.

## Local testing

Run the site:

```bash
npm run dev
```

Run the Worker:

```bash
npm run worker:dev
```

For local site builds, create a local environment variable before building:

```bash
PUBLIC_RECRUITER_MATCH_API=http://localhost:8787/match npm run build
```

## CORS

Allowed origins are configured in `wrangler.toml`:

```toml
ALLOWED_ORIGINS = "https://burtonmakes.github.io,http://localhost:4321,http://127.0.0.1:4321"
```

Add your custom domain here if the site moves off GitHub Pages.
