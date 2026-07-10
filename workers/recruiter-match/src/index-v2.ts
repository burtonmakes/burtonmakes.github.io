type Env = {
  AI: { run: (model: string, input: unknown) => Promise<unknown> };
  ALLOWED_ORIGINS?: string;
};

type Requirement = { label: string; importance?: "high" | "medium" | "low"; sourceText?: string; reason?: string };
type Match = { requirement: string; matchedPortfolioSkill?: string; matchedCapability?: string; classification?: "direct" | "partial" | "adjacent" | "gap"; confidence?: number; evidenceIds?: string[]; reason?: string };
type Gap = { requirement: string; reason?: string };
type ModelResult = { roleTitleGuess?: string; roleCategory?: string; extractedRequirements?: Requirement[]; matches?: Match[]; gaps?: Gap[] };

const MODEL = "@cf/qwen/qwen3-30b-a3b-fp8";
const MAX_JOB_TEXT_LENGTH = 10_000;
const classificationValue: Record<string, number> = { direct: 1, partial: 0.58, adjacent: 0.28, gap: 0 };
const importanceWeight: Record<string, number> = { high: 1.25, medium: 1, low: 0.75 };

const clean = (value: unknown) => String(value ?? "").replace(/\s+/g, " ").trim();
const corsHeaders = (request: Request, env: Env) => {
  const origin = request.headers.get("origin") || "";
  const allowed = (env.ALLOWED_ORIGINS || "").split(",").map((item) => item.trim()).filter(Boolean);
  return {
    "access-control-allow-origin": allowed.includes(origin) ? origin : allowed[0] || "https://cocometric.com",
    "access-control-allow-methods": "POST, OPTIONS",
    "access-control-allow-headers": "content-type",
    vary: "Origin",
  };
};
const json = (request: Request, env: Env, body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { "content-type": "application/json; charset=utf-8", ...corsHeaders(request, env) },
});

const extractText = (response: unknown) => {
  if (typeof response === "string") return response;
  if (!response || typeof response !== "object") return "";
  const value = response as { response?: unknown; result?: unknown; choices?: Array<{ message?: { content?: unknown } }> };
  if (typeof value.response === "string") return value.response;
  if (typeof value.result === "string") return value.result;
  const content = value.choices?.[0]?.message?.content;
  return typeof content === "string" ? content : "";
};

const extractJsonObject = (value: string) => {
  const text = value.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "");
  const start = text.indexOf("{");
  if (start < 0) throw new Error("AI response did not contain JSON.");
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let index = start; index < text.length; index += 1) {
    const char = text[index];
    if (inString) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === '"') inString = false;
      continue;
    }
    if (char === '"') inString = true;
    else if (char === "{") depth += 1;
    else if (char === "}") {
      depth -= 1;
      if (depth === 0) return text.slice(start, index + 1);
    }
  }
  throw new Error("AI response JSON was incomplete.");
};

const parseModelJson = (value: string): ModelResult => {
  const objectText = extractJsonObject(value)
    .replace(/,\s*([}\]])/g, "$1")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, " ");
  try {
    return JSON.parse(objectText) as ModelResult;
  } catch {
    throw new Error("AI returned malformed JSON.");
  }
};

const normalizeClass = (value: unknown) => {
  const key = clean(value).toLowerCase();
  return key in classificationValue ? key : "gap";
};
const normalizeImportance = (value: unknown) => {
  const key = clean(value || "medium").toLowerCase();
  return key in importanceWeight ? key : "medium";
};

const normalizeResult = (result: ModelResult, portfolioIds: Set<string>) => {
  const extractedRequirements = (Array.isArray(result.extractedRequirements) ? result.extractedRequirements : [])
    .map((item) => ({ label: clean(item.label), importance: normalizeImportance(item.importance), sourceText: clean(item.sourceText), reason: clean(item.reason) }))
    .filter((item) => item.label).slice(0, 24);
  const matches = (Array.isArray(result.matches) ? result.matches : [])
    .map((item) => {
      const classification = normalizeClass(item.classification);
      return {
        requirement: clean(item.requirement),
        matchedPortfolioSkill: clean(item.matchedPortfolioSkill || item.matchedCapability),
        matchedCapability: clean(item.matchedCapability || item.matchedPortfolioSkill),
        classification,
        confidence: Math.max(0, Math.min(classificationValue[classification], Number(item.confidence) || classificationValue[classification])),
        evidenceIds: (Array.isArray(item.evidenceIds) ? item.evidenceIds : []).map(clean).filter((id) => portfolioIds.has(id)).slice(0, 4),
        reason: clean(item.reason),
      };
    }).filter((item) => item.requirement && item.classification !== "gap").slice(0, 24);
  const matched = new Set(matches.map((item) => item.requirement.toLowerCase()));
  const gaps = (Array.isArray(result.gaps) ? result.gaps : []).map((item) => ({ requirement: clean(item.requirement), reason: clean(item.reason) }))
    .filter((item) => item.requirement && !matched.has(item.requirement.toLowerCase())).slice(0, 24);
  const matchByRequirement = new Map(matches.map((item) => [item.requirement.toLowerCase(), item]));
  const scored = extractedRequirements.length ? extractedRequirements : [...matches.map((item) => ({ label: item.requirement, importance: "medium" })), ...gaps.map((item) => ({ label: item.requirement, importance: "medium" }))];
  let total = 0;
  let earned = 0;
  scored.forEach((item) => {
    const weight = importanceWeight[normalizeImportance(item.importance)];
    const match = matchByRequirement.get(clean(item.label).toLowerCase());
    total += weight;
    earned += weight * classificationValue[normalizeClass(match?.classification)];
  });
  const fitScore = total ? Math.round((earned / total) * 100) : 0;
  const direct = matches.filter((item) => item.classification === "direct").length;
  const partial = matches.filter((item) => item.classification === "partial").length;
  const adjacent = matches.filter((item) => item.classification === "adjacent").length;
  return {
    model: MODEL,
    roleTitleGuess: clean(result.roleTitleGuess || "Recruiter role"),
    roleCategory: clean(result.roleCategory || ""),
    fitScore,
    fitSummary: `${direct} direct, ${partial} partial, ${adjacent} adjacent, and ${gaps.length} gaps from ${scored.length} extracted requirements.`,
    extractedRequirements,
    matches,
    gaps,
  };
};

const prompt = `Return one valid JSON object only. No markdown, comments, trailing commas, or text outside JSON.
Schema: {"roleTitleGuess":"string","roleCategory":"hardware|sensors|validation|manufacturing|software-data|leadership|domain|mixed","extractedRequirements":[{"label":"string","importance":"high|medium|low","sourceText":"string","reason":"string"}],"matches":[{"requirement":"exact extracted label","matchedPortfolioSkill":"string","classification":"direct|partial|adjacent","confidence":0.0,"evidenceIds":["supplied portfolio id"],"reason":"string"}],"gaps":[{"requirement":"exact extracted label","reason":"string"}]}
Use only supplied portfolio evidence. Never invent evidence IDs.`;

const runModel = async (env: Env, payload: unknown) => {
  let lastError: Error | null = null;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const response = await env.AI.run(MODEL, {
      messages: [
        { role: "system", content: attempt === 0 ? prompt : `${prompt}\nYour previous response was invalid JSON. Return shorter valid JSON now.` },
        { role: "user", content: JSON.stringify(payload) },
      ],
      temperature: 0,
      max_tokens: attempt === 0 ? 2400 : 1800,
    });
    try {
      return parseModelJson(extractText(response));
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("AI returned malformed JSON.");
    }
  }
  throw lastError || new Error("AI returned malformed JSON.");
};

export default {
  async fetch(request: Request, env: Env) {
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders(request, env) });
    if (request.method !== "POST") return json(request, env, { error: "Use POST." }, 405);
    try {
      const body = await request.json() as { jobText?: unknown; recruiterContext?: unknown; manualSkills?: unknown; portfolioIndex?: unknown };
      const jobText = clean(body.jobText).slice(0, MAX_JOB_TEXT_LENGTH);
      const manualSkills = Array.isArray(body.manualSkills) ? body.manualSkills.map(clean).filter(Boolean).slice(0, 24) : [];
      const portfolio = (Array.isArray(body.portfolioIndex) ? body.portfolioIndex : []).slice(0, 60).map((item: any) => ({ id: clean(item.id), title: clean(item.title), kind: clean(item.kind), href: clean(item.href), summary: clean(item.summary).slice(0, 320), tags: Array.isArray(item.tags) ? item.tags.map(clean).slice(0, 12) : [], highlights: Array.isArray(item.highlights) ? item.highlights.map(clean).slice(0, 2) : [], capabilities: Array.isArray(item.capabilities) ? item.capabilities.map(clean).slice(0, 8) : [] })).filter((item: any) => item.id && item.title);
      if (jobText.length < 20 && !manualSkills.length) return json(request, env, { error: "Paste at least 20 characters of role text or add manual skills." }, 400);
      const parsed = await runModel(env, { jobText, recruiterContext: body.recruiterContext, manualSkills, portfolioIndex: portfolio });
      return json(request, env, normalizeResult(parsed, new Set(portfolio.map((item: any) => item.id))));
    } catch (error) {
      return json(request, env, { error: error instanceof Error ? error.message : "AI matching failed.", code: "ai_response_error" }, 502);
    }
  },
};
