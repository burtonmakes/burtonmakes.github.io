var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/index-v2.ts
var DEFAULT_MODEL = "@cf/google/gemma-4-26b-a4b-it";
var MAX_JOB_TEXT_LENGTH = 1e4;
var MAX_CHAT_QUESTION_LENGTH = 1200;
var MAX_PORTFOLIO_ITEMS = 60;
var ANALYSIS_SOURCE_LIMIT = 8;
var CHAT_SOURCE_LIMIT = 6;
var clean = /* @__PURE__ */ __name((value, max = 1e4) => String(value ?? "").replace(/\s+/g, " ").trim().slice(0, max), "clean");
var cleanMultiline = /* @__PURE__ */ __name((value, max = 1e4) => String(value ?? "").replace(/\r\n?/g, "\n").trim().slice(0, max), "cleanMultiline");
var clamp01 = /* @__PURE__ */ __name((value) => Math.max(0, Math.min(1, Number(value) || 0)), "clamp01");
var getLimit = /* @__PURE__ */ __name((value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}, "getLimit");
var getDay = /* @__PURE__ */ __name(() => (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), "getDay");
var corsHeaders = /* @__PURE__ */ __name((request, env) => {
  const origin = request.headers.get("origin") || "";
  const allowed = (env.ALLOWED_ORIGINS || "").split(",").map((item) => item.trim()).filter(Boolean);
  const allowOrigin = allowed.includes(origin) ? origin : allowed[0] || "https://burtonmakes.github.io";
  return {
    "access-control-allow-origin": allowOrigin,
    "access-control-allow-methods": "POST, OPTIONS",
    "access-control-allow-headers": "content-type",
    "access-control-max-age": "86400",
    vary: "Origin"
  };
}, "corsHeaders");
var json = /* @__PURE__ */ __name((request, env, body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: {
    "content-type": "application/json; charset=utf-8",
    ...corsHeaders(request, env)
  }
}), "json");
var hashValue = /* @__PURE__ */ __name(async (value) => {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value)
  );
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}, "hashValue");
var getClientId = /* @__PURE__ */ __name(async (request) => {
  const forwarded = request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown-client";
  return hashValue(forwarded);
}, "getClientId");
var quotaConfig = /* @__PURE__ */ __name((env, action) => action === "analyze" ? {
  perClient: getLimit(env.PER_CLIENT_ANALYSIS_LIMIT, 10),
  global: getLimit(env.GLOBAL_ANALYSIS_LIMIT, 100)
} : {
  perClient: getLimit(env.PER_CLIENT_CHAT_LIMIT, 5),
  global: getLimit(env.GLOBAL_CHAT_LIMIT, 50)
}, "quotaConfig");
var checkQuota = /* @__PURE__ */ __name(async (request, env, action) => {
  const limits = quotaConfig(env, action);
  if (!env.RATE_LIMITER) {
    return {
      allowed: true,
      perClientRemaining: limits.perClient,
      globalRemaining: limits.global,
      retryAfterSeconds: 0
    };
  }
  const day = getDay();
  const durableObject = env.RATE_LIMITER.get(
    env.RATE_LIMITER.idFromName(day)
  );
  const response = await durableObject.fetch(
    new Request("https://quota.internal/check", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        day,
        action,
        clientId: await getClientId(request),
        perClientLimit: limits.perClient,
        globalLimit: limits.global
      })
    })
  );
  return response.json();
}, "checkQuota");
var readRecruiterContext = /* @__PURE__ */ __name((value) => {
  const context = value && typeof value === "object" ? value : {};
  return {
    name: clean(context.name, 120),
    company: clean(context.company, 160),
    hiringFor: clean(context.hiringFor, 180),
    skipped: Boolean(context.skipped)
  };
}, "readRecruiterContext");
var compactPortfolio = /* @__PURE__ */ __name((value) => {
  if (!Array.isArray(value)) return [];
  return value.slice(0, MAX_PORTFOLIO_ITEMS).map((raw) => {
    const item = raw && typeof raw === "object" ? raw : {};
    return {
      id: clean(item.id, 180),
      title: clean(item.title, 180),
      kind: clean(item.kind, 30) || "project",
      href: clean(item.href, 300),
      summary: clean(item.summary, 420),
      tags: Array.isArray(item.tags) ? item.tags.map((tag) => clean(tag, 100)).filter(Boolean).slice(0, 16) : [],
      highlights: Array.isArray(item.highlights) ? item.highlights.map((highlight) => clean(highlight, 240)).filter(Boolean).slice(0, 3) : [],
      capabilities: Array.isArray(item.capabilities) ? item.capabilities.map((capability) => clean(capability, 100)).filter(Boolean).slice(0, 10) : []
    };
  }).filter((item) => item.id && item.title && item.href);
}, "compactPortfolio");
var normalizePath = /* @__PURE__ */ __name((value) => {
  try {
    const url = new URL(value, "https://burtonmakes.github.io");
    return url.pathname;
  } catch {
    return value.startsWith("/") ? value : `/${value}`;
  }
}, "normalizePath");
var sourceTypeFromPath = /* @__PURE__ */ __name((path) => normalizePath(path).startsWith("/work") ? "work" : "project", "sourceTypeFromPath");
var titleFromPath = /* @__PURE__ */ __name((path) => {
  const normalized = normalizePath(path).replace(/^\/|\/$/g, "").split("/").filter(Boolean).pop();
  if (!normalized) return "Portfolio evidence";
  return normalized.replace(/[-_]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}, "titleFromPath");
var stableSourceId = /* @__PURE__ */ __name((type, title, href) => {
  const slug = `${title}-${normalizePath(href)}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 72);
  return `${type === "work" ? "W" : "P"}-${slug || "evidence"}`;
}, "stableSourceId");
var searchAiIndex = /* @__PURE__ */ __name(async (env, query, limit) => {
  if (!env.AI_SEARCH || !env.AI_SEARCH_INSTANCE) return [];
  try {
    const instance = env.AI_SEARCH.get(env.AI_SEARCH_INSTANCE);
    const result = await instance.search({
      query: query.slice(0, 6e3),
      ai_search_options: {
        retrieval: {
          retrieval_type: "hybrid",
          max_num_results: Math.min(30, Math.max(limit * 3, 15)),
          match_threshold: 0.3,
          fusion_method: "rrf",
          keyword_match_mode: "or",
          return_on_failure: true
        },
        reranking: {
          enabled: true,
          model: "@cf/baai/bge-reranker-base",
          match_threshold: 0.25
        },
        cache: {
          enabled: true,
          cache_threshold: "close_enough"
        }
      }
    });
    const chunks = Array.isArray(result?.chunks) ? result.chunks : [];
    const grouped = /* @__PURE__ */ new Map();
    chunks.forEach((chunk) => {
      const key = clean(chunk.item?.key, 500);
      const metadata = chunk.item?.metadata || {};
      const metadataUrl = clean(
        metadata.url || metadata.href || metadata.path,
        500
      );
      const href = normalizePath(metadataUrl || key);
      if (!href.startsWith("/work") && !href.startsWith("/projects")) {
        return;
      }
      const current = grouped.get(href);
      const excerpt = clean(chunk.text, 900);
      const title = clean(metadata.title, 180) || current?.title || titleFromPath(href);
      const score = Math.max(
        clamp01(chunk.scoring_details?.reranking_score),
        clamp01(chunk.score),
        current?.score || 0
      );
      grouped.set(href, {
        title,
        href,
        type: sourceTypeFromPath(href),
        excerpts: [
          ...current?.excerpts || [],
          ...excerpt ? [excerpt] : []
        ].slice(0, 2),
        score
      });
    });
    return [...grouped.values()].sort((a, b) => b.score - a.score).slice(0, limit).map((source) => ({
      id: stableSourceId(source.type, source.title, source.href),
      title: source.title,
      type: source.type,
      href: source.href,
      excerpt: source.excerpts.join(" ").slice(0, 1e3),
      score: source.score
    }));
  } catch {
    return [];
  }
}, "searchAiIndex");
var tokenize = /* @__PURE__ */ __name((value) => clean(value).toLowerCase().replace(/[^a-z0-9+#.]+/g, " ").split(" ").filter((token) => token.length > 2), "tokenize");
var fallbackPortfolioSearch = /* @__PURE__ */ __name((query, portfolio, limit) => {
  const queryTokens = [...new Set(tokenize(query))];
  return portfolio.map((item) => {
    const searchable = [
      item.title,
      item.summary,
      ...item.tags || [],
      ...item.highlights || [],
      ...item.capabilities || []
    ].join(" ");
    const sourceTokens = new Set(tokenize(searchable));
    const overlap = queryTokens.filter((token) => sourceTokens.has(token));
    const score = queryTokens.length > 0 ? overlap.length / Math.max(1, queryTokens.length) : 0;
    return { item, score };
  }).sort((a, b) => b.score - a.score).slice(0, limit).map(({ item, score }) => {
    const type = item.kind === "work" || normalizePath(item.href).startsWith("/work") ? "work" : "project";
    const href = normalizePath(item.href);
    return {
      id: stableSourceId(type, item.title, href),
      title: item.title,
      type,
      href,
      excerpt: [item.summary, ...(item.highlights || []).slice(0, 2)].filter(Boolean).join(" ").slice(0, 1e3),
      score
    };
  });
}, "fallbackPortfolioSearch");
var retrieveSources = /* @__PURE__ */ __name(async (env, query, portfolio, limit) => {
  const fromAiSearch = await searchAiIndex(env, query, limit);
  return fromAiSearch.length ? { sources: fromAiSearch, retrieval: "ai-search" } : {
    sources: fallbackPortfolioSearch(query, portfolio, limit),
    retrieval: "portfolio-fallback"
  };
}, "retrieveSources");
var extractModelText = /* @__PURE__ */ __name((response) => {
  if (typeof response === "string") return response;
  if (!response || typeof response !== "object") return "";
  const candidate = response;
  if (typeof candidate.response === "string") return candidate.response;
  if (typeof candidate.result === "string") return candidate.result;
  const content = candidate.choices?.[0]?.message?.content;
  return typeof content === "string" ? content : "";
}, "extractModelText");
var extractJsonObject = /* @__PURE__ */ __name((value) => {
  const text = value.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "");
  const start = text.indexOf("{");
  if (start < 0) throw new Error("AI response did not contain JSON.");
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let index = start; index < text.length; index += 1) {
    const character = text[index];
    if (inString) {
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === '"') inString = false;
      continue;
    }
    if (character === '"') inString = true;
    else if (character === "{") depth += 1;
    else if (character === "}") {
      depth -= 1;
      if (depth === 0) return text.slice(start, index + 1);
    }
  }
  throw new Error("AI response JSON was incomplete.");
}, "extractJsonObject");
var parseModelJson = /* @__PURE__ */ __name((value) => {
  const objectText = extractJsonObject(value).replace(/,\s*([}\]])/g, "$1").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, " ");
  return JSON.parse(objectText);
}, "parseModelJson");
var runJsonModel = /* @__PURE__ */ __name(async (env, systemPrompt, payload, maxTokens) => {
  const model = env.GENERATION_MODEL || DEFAULT_MODEL;
  let lastError = null;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const response = await env.AI.run(model, {
      messages: [
        {
          role: "system",
          content: attempt === 0 ? systemPrompt : `${systemPrompt}
The previous output was invalid. Return a shorter valid JSON object only.`
        },
        {
          role: "user",
          content: JSON.stringify(payload)
        }
      ],
      temperature: 0.05,
      top_p: 0.9,
      seed: 1701,
      max_completion_tokens: attempt === 0 ? maxTokens : Math.max(300, Math.floor(maxTokens * 0.72)),
      response_format: { type: "json_object" }
    });
    try {
      return parseModelJson(extractModelText(response));
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("AI returned malformed JSON.");
    }
  }
  throw lastError || new Error("AI returned malformed JSON.");
}, "runJsonModel");
var analyzePrompt = `You are building a recruiter-facing review of Alex Burton's public engineering portfolio.
Return one valid JSON object only. Do not include markdown or text outside JSON.

Use only the supplied evidence sources. Every sourceId must exactly match a supplied source ID.
Do not invent experience, metrics, ownership, employers, projects, or source IDs.
Focus on what is useful to a recruiter. Do not produce interview questions and do not produce a match percentage.

Schema:
{
  "roleSummary": {
    "title": "concise interpreted role title",
    "summary": "2 concise sentences explaining what the role requires",
    "themes": ["5 to 8 concise role themes"]
  },
  "requirements": [
    {"id": "R1", "label": "concise requirement"}
  ],
  "reasons": [
    {
      "statement": "specific source-backed reason to interview",
      "relevance": "why this evidence matters for this role",
      "sourceIds": ["supplied-source-id"],
      "requirementIds": ["R1"]
    }
  ],
  "evidence": [
    {
      "sourceId": "supplied-source-id",
      "whyRelevant": "concise explanation",
      "requirementIds": ["R1"]
    }
  ]
}

Requirements:
- Return 5 to 12 requirements.
- Return 3 to 5 reasons.
- Return 3 to 8 evidence entries.
- Prefer quantitative, specific evidence.
- A reason must have at least one sourceId.
- Keep descriptions concise and recruiter-readable.`;
var chatPrompt = `You are Alex Burton's recruiter-facing portfolio assistant.
Answer the recruiter's question using only the supplied public portfolio evidence.
Return one valid JSON object only. Do not include markdown or text outside JSON.
Do not invent experience, metrics, ownership, projects, employers, or source IDs.
If the evidence does not answer the question, say that the available public portfolio does not clearly document it.
Every sourceId must exactly match a supplied source ID.

Schema:
{
  "answer": "concise answer in plain text, normally 2 to 5 short paragraphs",
  "sourceIds": ["supplied-source-id"]
}`;
var validateSourceIds = /* @__PURE__ */ __name((value, validSourceIds, limit = 4) => Array.isArray(value) ? [...new Set(value.map((id) => clean(id, 120)))].filter((id) => validSourceIds.has(id)).slice(0, limit) : [], "validateSourceIds");
var normalizeRequirements = /* @__PURE__ */ __name((value) => {
  if (!Array.isArray(value)) return [];
  return value.map((item, index) => {
    const candidate = item && typeof item === "object" ? item : {};
    return {
      id: clean(candidate.id, 24) || `R${index + 1}`,
      label: clean(candidate.label, 180)
    };
  }).filter((requirement) => requirement.label).slice(0, 12).map((requirement, index) => ({
    ...requirement,
    id: `R${index + 1}`
  }));
}, "normalizeRequirements");
var normalizeAnalysis = /* @__PURE__ */ __name((result, sources, recruiterContext) => {
  const sourceMap = new Map(sources.map((source) => [source.id, source]));
  const validSourceIds = new Set(sourceMap.keys());
  const requirements = normalizeRequirements(result.requirements);
  const requirementIds = new Set(requirements.map((item) => item.id));
  const reasons = (Array.isArray(result.reasons) ? result.reasons : []).map((reason) => {
    const sourceIds = validateSourceIds(
      reason?.sourceIds,
      validSourceIds,
      3
    );
    return {
      statement: clean(reason?.statement, 280),
      relevance: clean(reason?.relevance, 360),
      sourceIds,
      requirementIds: Array.isArray(reason?.requirementIds) ? [
        ...new Set(
          reason.requirementIds.map((id) => clean(id, 24)).filter((id) => requirementIds.has(id))
        )
      ].slice(0, 5) : []
    };
  }).filter((reason) => reason.statement && reason.sourceIds.length).slice(0, 5);
  const evidence = (Array.isArray(result.evidence) ? result.evidence : []).map((item) => {
    const sourceId = clean(item?.sourceId, 120);
    return {
      sourceId,
      whyRelevant: clean(item?.whyRelevant, 420),
      requirementIds: Array.isArray(item?.requirementIds) ? [
        ...new Set(
          item.requirementIds.map((id) => clean(id, 24)).filter((id) => requirementIds.has(id))
        )
      ].slice(0, 8) : []
    };
  }).filter(
    (item) => validSourceIds.has(item.sourceId) && item.whyRelevant && item.requirementIds.length
  ).slice(0, 8);
  const workRequirementIds = /* @__PURE__ */ new Set();
  const projectRequirementIds = /* @__PURE__ */ new Set();
  evidence.forEach((item) => {
    const source = sourceMap.get(item.sourceId);
    item.requirementIds.forEach((requirementId) => {
      if (source?.type === "work") workRequirementIds.add(requirementId);
      if (source?.type === "project")
        projectRequirementIds.add(requirementId);
    });
  });
  const roleSummary = result.roleSummary || {};
  const fallbackTitle = recruiterContext.hiringFor || "Recruiter role review";
  return {
    roleSummary: {
      title: clean(roleSummary.title, 180) || fallbackTitle,
      summary: clean(roleSummary.summary, 700) || "The submitted role was compared with Alex Burton's public work and project evidence.",
      themes: Array.isArray(roleSummary.themes) ? [
        ...new Set(
          roleSummary.themes.map((theme) => clean(theme, 100)).filter(Boolean)
        )
      ].slice(0, 8) : []
    },
    requirements,
    coverage: {
      work: workRequirementIds.size,
      projects: projectRequirementIds.size
    },
    reasons,
    evidence
  };
}, "normalizeAnalysis");
var handleAnalyze = /* @__PURE__ */ __name(async (request, env, body) => {
  const recruiterContext = readRecruiterContext(body.recruiterContext);
  const jobText = cleanMultiline(body.jobText, MAX_JOB_TEXT_LENGTH);
  const portfolio = compactPortfolio(body.portfolioIndex);
  if (jobText.length < 40) {
    return json(
      request,
      env,
      {
        error: "Paste at least 40 characters of job-description or role information.",
        code: "role_text_required"
      },
      400
    );
  }
  if (!portfolio.length) {
    return json(
      request,
      env,
      { error: "Portfolio evidence is unavailable.", code: "portfolio_empty" },
      500
    );
  }
  const quota = await checkQuota(request, env, "analyze");
  if (!quota.allowed) {
    return json(
      request,
      env,
      {
        error: quota.reason === "global" ? "The site's daily role-analysis allowance has been reached." : "This connection has used its 10 role analyses for today.",
        code: quota.reason === "global" ? "global_analysis_limit" : "client_analysis_limit",
        retryAfterSeconds: quota.retryAfterSeconds,
        usage: {
          analysisRemaining: quota.perClientRemaining,
          globalAnalysisRemaining: quota.globalRemaining
        }
      },
      429
    );
  }
  const searchQuery = [
    recruiterContext.hiringFor,
    recruiterContext.company,
    jobText
  ].filter(Boolean).join("\n").slice(0, 6e3);
  const retrieval = await retrieveSources(
    env,
    searchQuery,
    portfolio,
    ANALYSIS_SOURCE_LIMIT
  );
  if (!retrieval.sources.length) {
    return json(
      request,
      env,
      {
        error: "No portfolio evidence could be retrieved.",
        code: "retrieval_empty"
      },
      502
    );
  }
  const modelResult = await runJsonModel(
    env,
    analyzePrompt,
    {
      recruiterContext,
      jobText,
      evidenceSources: retrieval.sources
    },
    900
  );
  const analysis = normalizeAnalysis(
    modelResult,
    retrieval.sources,
    recruiterContext
  );
  return json(request, env, {
    action: "analyze",
    ...analysis,
    sources: retrieval.sources,
    retrieval: retrieval.retrieval,
    usage: {
      analysisRemaining: quota.perClientRemaining,
      globalAnalysisRemaining: quota.globalRemaining,
      chatLimit: quotaConfig(env, "chat").perClient
    }
  });
}, "handleAnalyze");
var handleChat = /* @__PURE__ */ __name(async (request, env, body) => {
  const recruiterContext = readRecruiterContext(body.recruiterContext);
  const question = cleanMultiline(
    body.question,
    MAX_CHAT_QUESTION_LENGTH
  );
  const jobText = cleanMultiline(body.jobText, MAX_JOB_TEXT_LENGTH);
  const portfolio = compactPortfolio(body.portfolioIndex);
  if (question.length < 3) {
    return json(
      request,
      env,
      { error: "Enter a question before sending.", code: "question_required" },
      400
    );
  }
  if (!portfolio.length) {
    return json(
      request,
      env,
      { error: "Portfolio evidence is unavailable.", code: "portfolio_empty" },
      500
    );
  }
  const analysisContext = body.analysisContext && typeof body.analysisContext === "object" ? body.analysisContext : {};
  const roleSummary = analysisContext.roleSummary && typeof analysisContext.roleSummary === "object" ? analysisContext.roleSummary : {};
  const requirements = Array.isArray(analysisContext.requirements) ? analysisContext.requirements.map(
    (item) => item && typeof item === "object" ? clean(item.label, 180) : ""
  ).filter(Boolean).slice(0, 12) : [];
  if (!clean(roleSummary.summary) && !jobText) {
    return json(
      request,
      env,
      {
        error: "Analyze the role before using the portfolio chat.",
        code: "analysis_required"
      },
      400
    );
  }
  const quota = await checkQuota(request, env, "chat");
  if (!quota.allowed) {
    return json(
      request,
      env,
      {
        error: quota.reason === "global" ? "The site's daily portfolio-chat allowance has been reached." : "This connection has used its 5 portfolio-chat questions for today.",
        code: quota.reason === "global" ? "global_chat_limit" : "client_chat_limit",
        retryAfterSeconds: quota.retryAfterSeconds,
        usage: {
          chatRemaining: quota.perClientRemaining,
          globalChatRemaining: quota.globalRemaining
        }
      },
      429
    );
  }
  const query = [
    clean(roleSummary.title, 180),
    clean(roleSummary.summary, 600),
    requirements.join(", "),
    question
  ].filter(Boolean).join("\n").slice(0, 4e3);
  const retrieval = await retrieveSources(
    env,
    query,
    portfolio,
    CHAT_SOURCE_LIMIT
  );
  const conversation = Array.isArray(body.conversation) ? body.conversation.slice(-6).map((message) => {
    const candidate = message && typeof message === "object" ? message : {};
    return {
      role: candidate.role === "assistant" ? "assistant" : "user",
      content: clean(candidate.content, 700)
    };
  }).filter((message) => message.content) : [];
  const modelResult = await runJsonModel(
    env,
    chatPrompt,
    {
      recruiterContext,
      roleContext: {
        title: clean(roleSummary.title, 180),
        summary: clean(roleSummary.summary, 700),
        requirements
      },
      conversation,
      question,
      evidenceSources: retrieval.sources
    },
    450
  );
  const validSourceIds = new Set(
    retrieval.sources.map((source) => source.id)
  );
  const sourceIds = validateSourceIds(
    modelResult.sourceIds,
    validSourceIds,
    4
  );
  const answer = cleanMultiline(modelResult.answer, 2400) || "The available public portfolio does not clearly document an answer to that question.";
  return json(request, env, {
    action: "chat",
    answer,
    sourceIds,
    sources: retrieval.sources.filter(
      (source) => sourceIds.includes(source.id)
    ),
    retrieval: retrieval.retrieval,
    usage: {
      chatRemaining: quota.perClientRemaining,
      globalChatRemaining: quota.globalRemaining
    }
  });
}, "handleChat");
var RateLimiter = class {
  static {
    __name(this, "RateLimiter");
  }
  state;
  constructor(state) {
    this.state = state;
  }
  async fetch(request) {
    if (request.method !== "POST") {
      return new Response(
        JSON.stringify({ allowed: false, reason: "method" }),
        {
          status: 405,
          headers: { "content-type": "application/json" }
        }
      );
    }
    const body = await request.json();
    const day = clean(body.day, 20) || getDay();
    const action = body.action === "chat" ? "chat" : "analyze";
    const clientId = clean(body.clientId, 100) || "unknown-client";
    const perClientLimit = getLimit(
      String(body.perClientLimit || ""),
      action === "analyze" ? 10 : 5
    );
    const globalLimit = getLimit(
      String(body.globalLimit || ""),
      action === "analyze" ? 100 : 50
    );
    const prefix = `${day}:${action}`;
    const clientKey = `${prefix}:client:${clientId}`;
    const globalKey = `${prefix}:global`;
    const clientCount = await this.state.storage.get(clientKey) || 0;
    const globalCount = await this.state.storage.get(globalKey) || 0;
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil(
        (Date.UTC(
          (/* @__PURE__ */ new Date()).getUTCFullYear(),
          (/* @__PURE__ */ new Date()).getUTCMonth(),
          (/* @__PURE__ */ new Date()).getUTCDate() + 1
        ) - Date.now()) / 1e3
      )
    );
    if (globalCount >= globalLimit) {
      return new Response(
        JSON.stringify({
          allowed: false,
          reason: "global",
          perClientRemaining: Math.max(
            0,
            perClientLimit - clientCount
          ),
          globalRemaining: 0,
          retryAfterSeconds
        }),
        { headers: { "content-type": "application/json" } }
      );
    }
    if (clientCount >= perClientLimit) {
      return new Response(
        JSON.stringify({
          allowed: false,
          reason: "client",
          perClientRemaining: 0,
          globalRemaining: Math.max(0, globalLimit - globalCount),
          retryAfterSeconds
        }),
        { headers: { "content-type": "application/json" } }
      );
    }
    await this.state.storage.put(clientKey, clientCount + 1);
    await this.state.storage.put(globalKey, globalCount + 1);
    return new Response(
      JSON.stringify({
        allowed: true,
        perClientRemaining: Math.max(
          0,
          perClientLimit - clientCount - 1
        ),
        globalRemaining: Math.max(
          0,
          globalLimit - globalCount - 1
        ),
        retryAfterSeconds
      }),
      { headers: { "content-type": "application/json" } }
    );
  }
};
var index_v2_default = {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(request, env)
      });
    }
    if (request.method !== "POST") {
      return json(
        request,
        env,
        { error: "Use POST with action analyze or chat." },
        405
      );
    }
    let body;
    try {
      body = await request.json();
    } catch {
      return json(
        request,
        env,
        { error: "Request body must be valid JSON." },
        400
      );
    }
    try {
      if (body.action === "chat") {
        return await handleChat(request, env, body);
      }
      return await handleAnalyze(request, env, body);
    } catch (error) {
      return json(
        request,
        env,
        {
          error: error instanceof Error ? error.message : "Recruiter assistant failed.",
          code: "assistant_error"
        },
        502
      );
    }
  }
};
export {
  RateLimiter,
  index_v2_default as default
};
//# sourceMappingURL=index-v2.js.map
