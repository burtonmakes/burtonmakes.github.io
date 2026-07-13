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

const requestDetails = (input: unknown) => {
  const candidate =
    input && typeof input === "object"
      ? ({ ...(input as Record<string, unknown>) } as Record<string, unknown>)
      : {};
  const messages = Array.isArray(candidate.messages) ? candidate.messages : [];
  const systemText = messages
    .filter((message) => message && typeof message === "object")
    .map((message) => String((message as Record<string, unknown>).content || ""))
    .join("\n");
  return {
    input: candidate,
    isChat: systemText.includes("portfolio assistant"),
  };
};

const createGuardedAi = (binding: AiBinding, env: Env): AiBinding => ({
  async run(model, input) {
    const details = requestDetails(input);
    if (!JSON_MODE_MODELS.has(model)) delete details.input.response_format;

    const primaryResponse = await binding.run(model, details.input);
    const validPrimary = normalizedJson(extractResponseText(primaryResponse));
    if (validPrimary) return { response: validPrimary };

    const repairModel = env.JSON_REPAIR_MODEL || DEFAULT_REPAIR_MODEL;
    const schema = details.isChat ? chatSchema : analysisSchema;
    const malformed = extractResponseText(primaryResponse).slice(0, 16_000);

    try {
      const repairResponse = await binding.run(repairModel, {
        messages: [
          {
            role: "system",
            content:
              "Repair the supplied malformed JSON. Preserve supported content, remove incomplete fragments, and return only an object matching the provided schema. Do not add facts.",
          },
          { role: "user", content: malformed },
        ],
        temperature: 0,
        top_p: 0.1,
        seed: 1701,
        max_tokens: details.isChat ? 700 : 1_400,
        response_format: {
          type: "json_schema",
          json_schema: schema,
        },
      });
      const repaired = normalizedJson(extractResponseText(repairResponse));
      if (repaired) return { response: repaired };
    } catch {
      // The legacy handler will perform its normal second attempt.
    }

    return primaryResponse;
  },
});

const isParserFailure = (message: unknown) =>
  /json|array element|object property|unexpected token|unterminated/i.test(
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
              "The AI response could not be validated. Please run the role analysis again.",
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
