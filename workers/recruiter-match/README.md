# Recruiter Portfolio Assistant

Cloudflare Worker used by the recruiter-facing portfolio review.

The complete end-to-end workflow, Mermaid diagrams, exact button actions, source files, and GitHub validation process are documented in [`docs/RECRUITER_ASSISTANT_WORKFLOW.md`](../../docs/RECRUITER_ASSISTANT_WORKFLOW.md).

## Production workflow

The site sends one of two actions to the same Worker endpoint:

- `analyze`: retrieve public portfolio evidence, summarize the submitted role, and return source-backed work/project evidence.
- `chat`: retrieve fresh evidence for a follow-up recruiter question and return a cited answer.

The recruiter page does not expose a fuzzy score or hiring percentage.

## Models and retrieval

- Primary generation: `@cf/google/gemma-4-26b-a4b-it`
- Structured-response repair: `@cf/meta/llama-3.1-8b-instruct-fast`
- Temperature: `0.05`
- Seed: `1701`
- Retrieval: Cloudflare AI Search hybrid retrieval
- Reranker: `@cf/baai/bge-reranker-base`
- AI Search instance: `burton-portfolio`

Gemma performs the evidence reasoning and writing. The production entrypoint validates every generated JSON object. When Gemma returns malformed JSON, the smaller repair model receives only that malformed response and an explicit JSON Schema. It repairs structure without receiving new portfolio facts. All source IDs are still validated by the core Worker before anything is shown to the recruiter. Raw parser errors are replaced with a concise retry message if both generation attempts fail.

The Worker uses the AI Search instance when available. During local setup or before the instance is populated, it falls back to ranking the compact public portfolio index supplied by the static site. This fallback only retrieves evidence; the recruiter does not see a separate fuzzy-analysis mode.

## Daily limits

Limits reset at 00:00 UTC.

| Limit | Per connection | Site-wide |
| --- | ---: | ---: |
| Role analyses | 10/day | 100/day |
| Portfolio chat questions | 5/day | 50/day |

A Durable Object hashes the connecting IP and stores only daily counters. It does not store recruiter names, job descriptions, or chat text.

The limits are intentionally conservative so approximately ten recruiters can each use the full role-analysis and chat allowance while remaining below the Workers AI free-neuron allocation under expected prompt/output sizes.

## Request shape

### Analyze

```json
{
  "action": "analyze",
  "recruiterContext": {
    "name": "Jordan Lee",
    "company": "Example",
    "hiringFor": "Senior Sensor Hardware Engineer",
    "skipped": false
  },
  "jobText": "Full role text...",
  "portfolioIndex": []
}
```

### Chat

```json
{
  "action": "chat",
  "recruiterContext": {},
  "jobText": "Full role text...",
  "analysisContext": {
    "roleSummary": {},
    "requirements": []
  },
  "conversation": [],
  "question": "What evidence supports hardware debugging?",
  "portfolioIndex": []
}
```

## Deploy

1. Create and sync an AI Search website instance named `burton-portfolio`.
2. Ensure the instance indexes public portfolio paths:
   - `/work/`
   - `/projects/**`
3. Exclude recruiter, contact, navigation, and footer content from indexing.
4. Deploy:

```bash
npx wrangler deploy --config workers/recruiter-match/wrangler.toml
```

5. Add the deployed endpoint as the GitHub Actions repository variable:

```text
PUBLIC_RECRUITER_MATCH_API=https://<worker>.workers.dev
```

6. Re-run the GitHub Pages deployment.

## Local development

```bash
npm run worker:dev
```

The static site can be built without a Worker endpoint. In that case, the recruiter page renders but clearly reports that the endpoint is not configured.
