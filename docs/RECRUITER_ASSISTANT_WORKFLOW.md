# Recruiter Portfolio Assistant Workflow

This document shows exactly how the recruiter-facing workflow operates, which files provide the portfolio evidence, which buttons trigger requests, and how Cloudflare usage is limited.

## Recruiter experience

```mermaid
flowchart TD
    A[Open /recruiter/start/] --> B[Enter recruiter name]
    B --> C[Enter company or team]
    C --> D[Enter role being filled]
    D --> E[Click Continue to role review]
    E --> F[Open /recruiter/]
    F --> G[Paste or edit full job description]
    G --> H[Click Analyze role]
    H --> I[Review condensed role summary]
    I --> J[Review work-supported requirements]
    I --> K[Review project-supported requirements]
    J --> L[Open source chips or evidence cards]
    K --> L
    I --> M[Use Portfolio chat]
    M --> N[Ask a follow-up question]
    N --> O[Receive a source-backed answer]
```

### Exact buttons

| Page | Button | Result |
| --- | --- | --- |
| `/recruiter/start/` | `Continue to role review` | Saves recruiter name, company, and role in local browser storage, then opens `/recruiter/`. |
| `/recruiter/` | `Edit recruiter information` | Opens the recruiter context dialog. Changing context marks an existing analysis stale. |
| `/recruiter/` | `Analyze role` | Sends the recruiter context, editable role text, and compact public portfolio index to the Cloudflare Worker. |
| `/recruiter/` | `Clear role` | Clears the role text, previous analysis, and chat conversation in the browser. |
| `/recruiter/` | `Send` | Sends one portfolio-chat question after a role has been analyzed. |
| `/recruiter/` | Source chip | Opens the exact evidence excerpt and a link to the complete public portfolio page. |

## Initial analysis workflow

```mermaid
flowchart TD
    A[Analyze role click] --> B[src/pages/recruiter/index.astro]
    B --> C[POST action analyze]
    C --> D[workers/recruiter-match/src/index-v2.ts]
    D --> E[Validate role text and portfolio index]
    E --> F[Check Durable Object quota]
    F -->|Allowed| G[Cloudflare AI Search]
    F -->|Limit reached| Z[Return HTTP 429 and remaining quota]
    G --> H[Hybrid semantic and keyword retrieval]
    H --> I[BGE reranking]
    I --> J[Consolidate work and project sources]
    J --> K[Gemma 4 26B A4B at temperature 0.05]
    K --> L[Validate returned source IDs]
    L --> M[Calculate supported-by-work count in code]
    L --> N[Calculate supported-by-project count in code]
    M --> O[Render role summary, reasons, and evidence]
    N --> O
```

The model does not create the displayed evidence counts directly. The Worker counts unique requirement IDs linked to validated work sources and validated project sources.

## Portfolio chat workflow

```mermaid
flowchart TD
    A[Recruiter enters question] --> B[Click Send]
    B --> C[src/pages/recruiter/index.astro]
    C --> D[POST action chat]
    D --> E[Check chat quota]
    E -->|Allowed| F[Combine question with condensed role context]
    F --> G[Run a new AI Search retrieval]
    G --> H[Rerank and keep strongest sources]
    H --> I[Generate answer with Gemma]
    I --> J[Reject unknown source IDs]
    J --> K[Return answer and cited source objects]
    K --> L[Render answer in Portfolio chat]
    L --> M[Source chips open exact evidence]
```

Each chat question runs a fresh retrieval. The chat does not rely only on the evidence cards from the initial analysis.

## Where the information comes from

### Browser and page files

| File | Responsibility |
| --- | --- |
| `src/pages/recruiter/start.astro` | Initial recruiter name, company, and target-role form. |
| `src/pages/recruiter/index.astro` | Editable job-description field, analysis request, evidence rendering, source drawer, and Portfolio chat. |
| `public/recruiter-state-bridge.js` | UTC quota-display reset, stale-analysis handling, and persisted chat-source objects. |
| `src/data/site.ts` | Canonical public work-history and project content used to build the compact portfolio index. |
| `src/data/capability-map.ts` | Connects public work and project sources to capability labels and supporting evidence. |

The static page builds `portfolioIndex` from `src/data/site.ts` and `src/data/capability-map.ts`. Each item includes a stable evidence ID, title, source type, public URL, summary, highlights, tags, and capabilities.

### Worker and Cloudflare files

| File | Responsibility |
| --- | --- |
| `workers/recruiter-match/src/index-v2.ts` | Analyze and chat API, retrieval, model calls, source validation, and quota handling. |
| `workers/recruiter-match/wrangler.toml` | Workers AI binding, AI Search binding, Durable Object binding, model selection, origins, and quotas. |
| `workers/recruiter-match/README.md` | Deployment and Cloudflare configuration instructions. |

### Indexed public pages

The AI Search instance is intended to index:

- `/work/`
- `/projects/**`

It should exclude recruiter pages, contact pages, navigation, footer text, and repeated page chrome.

If AI Search is unavailable or empty, the Worker falls back to ranking the compact public portfolio index supplied by the page. This is a retrieval fallback only; the recruiter does not see a separate fuzzy-analysis product or percentage.

## Model configuration

| Setting | Value |
| --- | --- |
| Generation model | `@cf/google/gemma-4-26b-a4b-it` |
| Temperature | `0.05` |
| Top-p | `0.9` |
| Seed | `1701` |
| AI Search mode | Hybrid semantic and keyword retrieval |
| Reranker | `@cf/baai/bge-reranker-base` |
| Analysis sources | Up to 8 consolidated sources |
| Chat sources | Up to 6 consolidated sources |

The Worker retries once with a shorter corrective instruction if the model output is not valid JSON.

## Source-safety rules

1. The model receives only retrieved public evidence.
2. The model must return source IDs from that supplied list.
3. `validateSourceIds` removes IDs that were not retrieved.
4. Reasons without a valid source are removed.
5. Evidence entries without a valid source and requirement ID are removed.
6. Chat answers may state that the public portfolio does not clearly document an answer.

## Daily limits

Limits reset at 00:00 UTC.

| Action | Per connection | Site-wide |
| --- | ---: | ---: |
| Role analysis | 10/day | 100/day |
| Portfolio chat | 5/day | 50/day |

The Durable Object stores hashed connection identifiers and counters. It does not store recruiter names, job descriptions, or chat text.

## GitHub validation

The dedicated workflow is `.github/workflows/validate-recruiter-assistant.yml`.

It runs these checks on recruiter-related pull requests and manual dispatches:

1. Install repository dependencies.
2. Run `npm run validate:recruiter`.
3. Compile the Cloudflare Worker with a Wrangler dry run.
4. Build the complete Astro site.
5. Confirm the Cocometric model output still validates through the normal build command.

The repository validation script is `scripts/validate-recruiter-assistant.mjs`. It checks required UI controls, Worker functions, Cloudflare bindings, documentation, and removal of the obsolete fuzzy-matcher files.

## Deployment dependencies

The page can render without the Worker, but analysis and chat require:

1. A Cloudflare AI Search instance named `burton-portfolio`.
2. The deployed Worker from `workers/recruiter-match/wrangler.toml`.
3. GitHub Actions variable `PUBLIC_RECRUITER_MATCH_API` set to the deployed Worker endpoint.
4. A GitHub Pages rebuild after the variable is set.
