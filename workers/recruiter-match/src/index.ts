type Env = {
  AI: Ai;
  ALLOWED_ORIGINS?: string;
};

type Ai = {
  run: (model: string, input: unknown) => Promise<unknown>;
};

type PortfolioItem = {
  id: string;
  title: string;
  kind: string;
  href: string;
  summary: string;
  tags?: string[];
  highlights?: string[];
  capabilities?: string[];
};

type ExtractedRequirement = {
  label: string;
  importance?: "high" | "medium" | "low";
  sourceText?: string;
  reason?: string;
};

type MatchResult = {
  requirement: string;
  matchedPortfolioSkill?: string;
  matchedCapability?: string;
  classification?: "direct" | "partial" | "adjacent" | "gap";
  confidence?: number;
  evidenceIds?: string[];
  reason?: string;
};

type GapResult = {
  requirement: string;
  reason?: string;
};

type ModelResult = {
  roleTitleGuess?: string;
  roleCategory?: string;
  extractedRequirements?: ExtractedRequirement[];
  matches?: MatchResult[];
  gaps?: GapResult[];
};

const MODEL = "@cf/qwen/qwen3-30b-a3b-fp8";
const MAX_JOB_TEXT_LENGTH = 20_000;
const MAX_PORTFOLIO_ITEMS = 60;

const classificationValue: Record<string, number> = {
  direct: 1,
  partial: 0.58,
  adjacent: 0.28,
  gap: 0,
};

const importanceWeight: Record<string, number> = {
  high: 1.25,
  medium: 1,
  low: 0.75,
};

const jsonHeaders = (request: Request, env: Env) => ({
  "content-type": "application/json; charset=utf-8",
  ...corsHeaders(request, env),
});

const corsHeaders = (request: Request, env: Env) => {
  const origin = request.headers.get("origin") || "";
  const allowed = (env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const allowOrigin = allowed.includes(origin) ? origin : allowed[0] || "https://burtonmakes.github.io";

  return {
    "access-control-allow-origin": allowOrigin,
    "access-control-allow-methods": "POST, OPTIONS",
    "access-control-allow-headers": "content-type",
    "access-control-max-age": "86400",
    vary: "Origin",
  };
};

const jsonResponse = (request: Request, env: Env, body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: jsonHeaders(request, env),
  });

const cleanText = (value: unknown, fallback = "") =>
  String(value ?? fallback)
    .replace(/\s+/g, " ")
    .trim();

const compactPortfolio = (items: unknown): PortfolioItem[] => {
  if (!Array.isArray(items)) return [];

  return items
    .slice(0, MAX_PORTFOLIO_ITEMS)
    .map((item) => {
      const candidate = item as Partial<PortfolioItem>;
      return {
        id: cleanText(candidate.id),
        title: cleanText(candidate.title),
        kind: cleanText(candidate.kind),
        href: cleanText(candidate.href),
        summary: cleanText(candidate.summary).slice(0, 420),
        tags: Array.isArray(candidate.tags) ? candidate.tags.map((tag) => cleanText(tag)).filter(Boolean).slice(0, 16) : [],
        highlights: Array.isArray(candidate.highlights)
          ? candidate.highlights.map((highlight) => cleanText(highlight)).filter(Boolean).slice(0, 3)
          : [],
        capabilities: Array.isArray(candidate.capabilities)
          ? candidate.capabilities.map((capability) => cleanText(capability)).filter(Boolean).slice(0, 10)
          : [],
      };
    })
    .filter((item) => item.id && item.title);
};

const extractModelText = (response: unknown) => {
  if (typeof response === "string") return response;
  if (!response || typeof response !== "object") return "";
  const candidate = response as { response?: unknown; result?: unknown; choices?: Array<{ message?: { content?: string } }> };
  if (typeof candidate.response === "string") return candidate.response;
  if (typeof candidate.result === "string") return candidate.result;
  if (typeof candidate.choices?.[0]?.message?.content === "string") return candidate.choices[0].message.content;
  return "";
};

const parseJsonFromModel = (value: string): ModelResult => {
  const text = value.trim().replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
  try {
    return JSON.parse(text);
  } catch {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(text.slice(start, end + 1));
    }
    throw new Error("Model did not return parseable JSON");
  }
};

const normalizeClassification = (value: unknown) => {
  const key = cleanText(value).toLowerCase();
  return key in classificationValue ? key : "gap";
};

const normalizeImportance = (value: unknown) => {
  const key = cleanText(value || "medium").toLowerCase();
  return key in importanceWeight ? key : "medium";
};

const clamp01 = (value: unknown) => Math.max(0, Math.min(1, Number(value) || 0));

const scoreMath = (requirements: ExtractedRequirement[], matches: MatchResult[], gaps: GapResult[]) => {
  const matchByRequirement = new Map(matches.map((match) => [cleanText(match.requirement).toLowerCase(), match]));
  const gapSet = new Set(gaps.map((gap) => cleanText(gap.requirement).toLowerCase()));
  const scoredRequirements = requirements.length
    ? requirements
    : [
        ...matches.map((match) => ({ label: match.requirement, importance: "medium" as const })),
        ...gaps.map((gap) => ({ label: gap.requirement, importance: "medium" as const })),
      ];

  let totalWeight = 0;
  let earned = 0;

  scoredRequirements.forEach((requirement) => {
    const key = cleanText(requirement.label).toLowerCase();
    if (!key) return;
    const weight = importanceWeight[normalizeImportance(requirement.importance)];
    const match = matchByRequirement.get(key);
    const classification = gapSet.has(key) && !match ? "gap" : normalizeClassification(match?.classification);
    totalWeight += weight;
    earned += weight * classificationValue[classification];
  });

  return totalWeight > 0 ? Math.round((earned / totalWeight) * 100) : 0;
};

const normalizeResult = (result: ModelResult, portfolioIds: Set<string>) => {
  const extractedRequirements = (Array.isArray(result.extractedRequirements) ? result.extractedRequirements : [])
    .map((item) => ({
      label: cleanText(item.label),
      importance: normalizeImportance(item.importance) as "high" | "medium" | "low",
      sourceText: cleanText(item.sourceText),
      reason: cleanText(item.reason),
    }))
    .filter((item) => item.label)
    .slice(0, 24);

  const matches = (Array.isArray(result.matches) ? result.matches : [])
    .map((item) => {
      const classification = normalizeClassification(item.classification);
      const value = classificationValue[classification];
      return {
        requirement: cleanText(item.requirement),
        matchedPortfolioSkill: cleanText(item.matchedPortfolioSkill || item.matchedCapability),
        matchedCapability: cleanText(item.matchedCapability || item.matchedPortfolioSkill),
        classification,
        confidence: Math.min(value, clamp01(item.confidence || value)),
        evidenceIds: (Array.isArray(item.evidenceIds) ? item.evidenceIds : [])
          .map((id) => cleanText(id))
          .filter((id) => portfolioIds.has(id))
          .slice(0, 4),
        reason: cleanText(item.reason),
      };
    })
    .filter((item) => item.requirement && item.classification !== "gap")
    .slice(0, 24);

  const matchedRequirements = new Set(matches.map((item) => item.requirement.toLowerCase()));
  const gaps = (Array.isArray(result.gaps) ? result.gaps : [])
    .map((item) => ({
      requirement: cleanText(item.requirement),
      reason: cleanText(item.reason),
    }))
    .filter((item) => item.requirement && !matchedRequirements.has(item.requirement.toLowerCase()))
    .slice(0, 24);

  const fitScore = scoreMath(extractedRequirements, matches, gaps);
  const directCount = matches.filter((item) => item.classification === "direct").length;
  const partialCount = matches.filter((item) => item.classification === "partial").length;
  const adjacentCount = matches.filter((item) => item.classification === "adjacent").length;

  return {
    model: MODEL,
    roleTitleGuess: cleanText(result.roleTitleGuess || "Recruiter role"),
    roleCategory: cleanText(result.roleCategory || ""),
    fitScore,
    fitSummary: `${directCount} direct, ${partialCount} partial, ${adjacentCount} adjacent, and ${gaps.length} gap${gaps.length === 1 ? "" : "s"} from ${extractedRequirements.length || matches.length + gaps.length} extracted requirement${(extractedRequirements.length || matches.length + gaps.length) === 1 ? "" : "s"}.`,
    extractedRequirements,
    matches,
    gaps,
  };
};

const systemPrompt = `You are a strict recruiter matching assistant for Alex Burton's public engineering portfolio.
Extract role requirements from the pasted job description, then compare each requirement to the supplied portfolio index.
Return JSON only. Do not include markdown.

Schema:
{
  "roleTitleGuess": "short likely role title",
  "roleCategory": "hardware|sensors|validation|manufacturing|software-data|leadership|domain|mixed",
  "extractedRequirements": [
    { "label": "skill or responsibility", "importance": "high|medium|low", "sourceText": "short phrase from job text", "reason": "why it matters" }
  ],
  "matches": [
    {
      "requirement": "must exactly match an extractedRequirements label",
      "matchedPortfolioSkill": "portfolio capability or skill",
      "classification": "direct|partial|adjacent",
      "confidence": 0.0,
      "evidenceIds": ["portfolio id from the supplied index only"],
      "reason": "short evidence reason"
    }
  ],
  "gaps": [
    { "requirement": "must exactly match an extractedRequirements label", "reason": "what is missing or not clearly shown" }
  ]
}

Classification rules:
- direct: the portfolio explicitly shows the same skill, responsibility, or domain.
- partial: portfolio evidence shows meaningful overlap, but not the full requested responsibility.
- adjacent: related engineering experience only; useful context but not a recruiter-level match.
- gap: no credible supplied evidence. Put these in gaps, not matches.
Never invent projects, companies, skills, or evidence IDs. Use only evidenceIds present in the portfolio index.`;

export default {
  async fetch(request: Request, env: Env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(request, env) });
    }

    if (request.method !== "POST") {
      return jsonResponse(request, env, { error: "Use POST with a jobText payload." }, 405);
    }

    let body: { jobText?: unknown; manualSkills?: unknown; portfolioIndex?: unknown };
    try {
      body = await request.json();
    } catch {
      return jsonResponse(request, env, { error: "Request body must be JSON." }, 400);
    }

    const jobText = cleanText(body.jobText).slice(0, MAX_JOB_TEXT_LENGTH);
    const manualSkills = Array.isArray(body.manualSkills)
      ? body.manualSkills.map((skill) => cleanText(skill)).filter(Boolean).slice(0, 24)
      : [];
    const portfolio = compactPortfolio(body.portfolioIndex);

    if (jobText.length < 20 && manualSkills.length === 0) {
      return jsonResponse(request, env, { error: "Paste at least 20 characters of role text or add manual skills." }, 400);
    }

    if (portfolio.length === 0) {
      return jsonResponse(request, env, { error: "Portfolio index is empty." }, 400);
    }

    try {
      const aiResponse = await env.AI.run(MODEL, {
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: JSON.stringify({
              jobText,
              manualSkills,
              portfolioIndex: portfolio,
            }),
          },
        ],
        temperature: 0.1,
        max_tokens: 3000,
      });

      const parsed = parseJsonFromModel(extractModelText(aiResponse));
      const portfolioIds = new Set(portfolio.map((item) => item.id));
      return jsonResponse(request, env, normalizeResult(parsed, portfolioIds));
    } catch (error) {
      return jsonResponse(
        request,
        env,
        { error: error instanceof Error ? error.message : "AI matching failed." },
        502,
      );
    }
  },
};
