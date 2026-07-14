import legacyHandler, { RateLimiter } from "./index-v2";

export { RateLimiter };

type AiBinding = {
  run: (model: string, input: unknown) => Promise<unknown>;
};

type Env = Record<string, unknown> & {
  AI: AiBinding;
  GENERATION_MODEL?: string;
  JSON_REPAIR_MODEL?: string;
};

type JsonSchema = Record<string, unknown>;

type RequestDetails = {
  input: Record<string, unknown>;
  isChat: boolean;
  systemText: string;
  userText: string;
  payload: Record<string, unknown>;
};

const DEFAULT_REPAIR_MODEL = "@cf/meta/llama-3.1-8b-instruct-fast";
const JSON_MODE_MODELS = new Set([
  "@cf/meta/llama-3.1-8b-instruct-fast",
  "@cf/meta/llama-3.1-70b-instruct",
  "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
  "@cf/meta/llama-3-8b-instruct",
  "@cf/meta/llama-3.1-8b-instruct",
  "@cf/meta/llama-3.2-11b-vision-instruct",
  "@cf/deepseek-ai/deepseek-r1-distill-qwen-32b",
]);

const stringArraySchema = (maxItems: number): JsonSchema => ({
  type: "array",
  items: { type: "string" },
  maxItems,
});

const analysisSchema: JsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    roleSummary: {
      type: "object",
      additionalProperties: false,
      properties: {
        title: { type: "string" },
        summary: { type: "string" },
        themes: stringArraySchema(8),
      },
      required: ["title", "summary", "themes"],
    },
    requirements: {
      type: "array",
      maxItems: 12,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          id: { type: "string" },
          label: { type: "string" },
        },
        required: ["id", "label"],
      },
    },
    reasons: {
      type: "array",
      maxItems: 5,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          statement: { type: "string" },
          relevance: { type: "string" },
          sourceIds: stringArraySchema(3),
          requirementIds: stringArraySchema(5),
        },
        required: ["statement", "relevance", "sourceIds", "requirementIds"],
      },
    },
    evidence: {
      type: "array",
      maxItems: 8,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          sourceId: { type: "string" },
          whyRelevant: { type: "string" },
          requirementIds: stringArraySchema(8),
        },
        required: ["sourceId", "whyRelevant", "requirementIds"],
      },
    },
  },
  required: ["roleSummary", "requirements", "reasons", "evidence"],
};

const chatSchema: JsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    answer: { type: "string" },
    sourceIds: stringArraySchema(4),
  },
  required: ["answer", "sourceIds"],
};

const clean = (value: unknown, max = 1_000) =>
  String(value ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);

const extractResponseText = (response: unknown): string => {
  if (typeof response === "string") return response;
  if (!response || typeof response !== "object") return "";

  const candidate = response as {
    response?: unknown;
    result?: unknown;
    choices?: Array<{ message?: { content?: unknown } }>;
  };

  if (typeof candidate.response === "string") return candidate.response;
  if (candidate.response && typeof candidate.response === "object") {
    return JSON.stringify(candidate.response);
  }
  if (typeof candidate.result === "string") return candidate.result;
  if (candidate.result && typeof candidate.result === "object") {
    return JSON.stringify(candidate.result);
  }

  const content = candidate.choices?.[0]?.message?.content;
  if (typeof content === "string") return content;
  if (content && typeof content === "object") return JSON.stringify(content);
  return "";
};

const extractJsonObject = (value: string): string => {
  const text = value
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/i, "");
  const start = text.indexOf("{");
  if (start < 0) return "";

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
  return "";
};

const normalizedJson = (value: string): string => {
  const objectText = extractJsonObject(value)
    .replace(/,\s*([}\]])/g, "$1")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, " ");
  if (!objectText) return "";
  try {
    return JSON.stringify(JSON.parse(objectText));
  } catch {
    return "";
  }
};

const parsePayload = (value: string): Record<string, unknown> => {
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object"
      ? (parsed as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
};

const requestDetails = (input: unknown): RequestDetails => {
  const candidate =
    input && typeof input === "object"
      ? ({ ...(input as Record<string, unknown>) } as Record<string, unknown>)
      : {};
  const messages = Array.isArray(candidate.messages) ? candidate.messages : [];
  const normalizedMessages = messages
    .filter((message) => message && typeof message === "object")
    .map((message) => message as Record<string, unknown>);
  const systemText = normalizedMessages
    .filter((message) => message.role === "system")
    .map((message) => String(message.content || ""))
    .join("\n");
  const userText = normalizedMessages
    .filter((message) => message.role === "user")
    .map((message) => String(message.content || ""))
    .at(-1) || "";

  return {
    input: candidate,
    isChat: systemText.includes("portfolio assistant"),
    systemText,
    userText,
    payload: parsePayload(userText),
  };
};

const evidenceSourcesFromPayload = (payload: Record<string, unknown>) =>
  Array.isArray(payload.evidenceSources)
    ? payload.evidenceSources
        .filter((source) => source && typeof source === "object")
        .map((source) => source as Record<string, unknown>)
        .filter((source) => clean(source.id, 160))
        .slice(0, 8)
    : [];

const requirementLabels = (jobText: string) => {
  const lines = jobText
    .split(/\n|[•·]|(?<=[.!?])\s+/)
    .map((line) => clean(line, 180))
    .filter((line) => line.length >= 12)
    .filter((line, index, all) => all.indexOf(line) === index)
    .slice(0, 8);

  return lines.length
    ? lines
    : ["Review the submitted role against documented portfolio evidence"];
};

const deterministicAnalysisFallback = (payload: Record<string, unknown>) => {
  const recruiterContext =
    payload.recruiterContext && typeof payload.recruiterContext === "object"
      ? (payload.recruiterContext as Record<string, unknown>)
      : {};
  const title = clean(recruiterContext.hiringFor, 180) || "Recruiter role review";
  const jobText = String(payload.jobText || "");
  const labels = requirementLabels(jobText);
  const requirements = labels.map((label, index) => ({ id: `R${index + 1}`, label }));
  const sources = evidenceSourcesFromPayload(payload);
  const requirementIds = requirements.map((requirement) => requirement.id);

  const evidence = sources.slice(0, 6).map((source, index) => ({
    sourceId: clean(source.id, 160),
    whyRelevant:
      clean(source.excerpt, 300) ||
      `${clean(source.title, 160) || "Portfolio evidence"} contains documented experience relevant to the submitted role.`,
    requirementIds: requirementIds.slice(index % Math.max(1, requirementIds.length), index % Math.max(1, requirementIds.length) + 2),
  }));

  const reasons = sources.slice(0, 4).map((source, index) => ({
    statement: `Relevant documented evidence: ${clean(source.title, 180) || "portfolio source"}`,
    relevance:
      clean(source.excerpt, 320) ||
      "This source provides documented work or project evidence related to the submitted role.",
    sourceIds: [clean(source.id, 160)],
    requirementIds: requirementIds.slice(index, index + 2),
  }));

  return {
    roleSummary: {
      title,
      summary:
        "The submitted role was condensed into its main responsibilities and compared with Alex Burton's documented work and project evidence. The evidence below is limited to validated public portfolio sources.",
      themes: requirements.slice(0, 6).map((requirement) => requirement.label.slice(0, 80)),
    },
    requirements,
    reasons,
    evidence,
  };
};

const deterministicChatFallback = (payload: Record<string, unknown>) => {
  const sources = evidenceSourcesFromPayload(payload).slice(0, 4);
  const question = clean(payload.question, 300);

  if (!sources.length) {
    return {
      answer:
        "I could not retrieve public portfolio evidence for that question. Please try again, or ask about a specific documented work example or project.",
      sourceIds: [],
    };
  }

  const summaries = sources
    .slice(0, 3)
    .map((source) => {
      const title = clean(source.title, 160) || "Portfolio evidence";
      const excerpt = clean(source.excerpt, 420);
      return excerpt ? `${title}: ${excerpt}` : title;
    })
    .join("\n\n");

  return {
    answer: `${question ? `I don't see direct documentation for “${question}.” ` : ""}The closest relevant documented evidence is:\n\n${summaries}`,
    sourceIds: sources.map((source) => clean(source.id, 160)),
  };
};

const deterministicFallback = (details: RequestDetails) =>
  details.isChat
    ? deterministicChatFallback(details.payload)
    : deterministicAnalysisFallback(details.payload);

const repairPrompt = (details: RequestDetails, malformed: string) => {
  const schema = details.isChat ? chatSchema : analysisSchema;
  return [
    "Return one valid JSON object only.",
    "Do not include markdown, commentary, or code fences.",
    "Use only facts and source IDs present in the supplied request.",
    "Do not invent facts.",
    `Required JSON schema: ${JSON.stringify(schema)}`,
    `Original system instruction: ${details.systemText.slice(0, 8_000)}`,
    `Original request payload: ${details.userText.slice(0, 16_000)}`,
    `Malformed draft to repair when useful: ${malformed.slice(0, 12_000)}`,
  ].join("\n\n");
};

const createGuardedAi = (binding: AiBinding, env: Env): AiBinding => ({
  async run(model, input) {
    const details = requestDetails(input);
    if (!JSON_MODE_MODELS.has(model)) delete details.input.response_format;

    let primaryResponse: unknown;
    try {
      primaryResponse = await binding.run(model, details.input);
    } catch {
      return { response: JSON.stringify(deterministicFallback(details)) };
    }

    const validPrimary = normalizedJson(extractResponseText(primaryResponse));
    if (validPrimary) return { response: validPrimary };

    const repairModel = env.JSON_REPAIR_MODEL || DEFAULT_REPAIR_MODEL;
    const malformed = extractResponseText(primaryResponse);

    try {
      const repairResponse = await binding.run(repairModel, {
        messages: [
          {
            role: "system",
            content:
              "You are a strict JSON formatter. Return exactly one complete JSON object and nothing else.",
          },
          { role: "user", content: repairPrompt(details, malformed) },
        ],
        temperature: 0,
        top_p: 0.1,
        seed: 1701,
        max_tokens: details.isChat ? 900 : 1_800,
        response_format: { type: "json_object" },
      });
      const repaired = normalizedJson(extractResponseText(repairResponse));
      if (repaired) return { response: repaired };
    } catch {
      // Continue to the deterministic source-backed fallback below.
    }

    return { response: JSON.stringify(deterministicFallback(details)) };
  },
});

const isParserFailure = (message: unknown) =>
  /json|array element|object property|unexpected token|unterminated|parseable/i.test(
    String(message || ""),
  );

export default {
  async fetch(request: Request, env: Env) {
    const guardedEnv = {
      ...env,
      AI: createGuardedAi(env.AI, env),
    } as Parameters<typeof legacyHandler.fetch>[1];

    const response = await legacyHandler.fetch(request, guardedEnv);
    if (response.status !== 502) return response;

    try {
      const payload = (await response.clone().json()) as {
        code?: unknown;
        error?: unknown;
      };
      if (payload.code === "assistant_error" && isParserFailure(payload.error)) {
        return new Response(
          JSON.stringify({
            error:
              "The role review could not be completed. Please retry the analysis.",
            code: "model_output_invalid",
          }),
          {
            status: 502,
            headers: response.headers,
          },
        );
      }
    } catch {
      // Preserve non-JSON errors from the underlying handler.
    }

    return response;
  },
};
