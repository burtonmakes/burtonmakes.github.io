import { existsSync, readFileSync } from "node:fs";

const fail = (message) => {
  console.error(`Recruiter assistant validation failed: ${message}`);
  process.exitCode = 1;
};

const read = (path) => {
  if (!existsSync(path)) {
    fail(`missing ${path}`);
    return "";
  }
  return readFileSync(path, "utf8");
};

const requireText = (content, path, values) => {
  values.forEach((value) => {
    if (!content.includes(value)) fail(`${path} is missing ${JSON.stringify(value)}`);
  });
};

const forbidText = (content, path, values) => {
  values.forEach((value) => {
    if (content.includes(value)) fail(`${path} still contains obsolete ${JSON.stringify(value)}`);
  });
};

const recruiterPagePath = "src/pages/recruiter/index.astro";
const recruiterStartPath = "src/pages/recruiter/start.astro";
const workerEntryPath = "workers/recruiter-match/src/index.ts";
const workerCorePath = "workers/recruiter-match/src/index-v2.ts";
const wranglerPath = "workers/recruiter-match/wrangler.toml";
const stateBridgePath = "public/recruiter-state-bridge.js";
const responseGuardPath = "public/recruiter-response-guard.js";
const baseLayoutPath = "src/layouts/BaseLayout.astro";
const workflowDocPath = "docs/RECRUITER_ASSISTANT_WORKFLOW.md";

const recruiterPage = read(recruiterPagePath);
const recruiterStart = read(recruiterStartPath);
const workerEntry = read(workerEntryPath);
const workerCore = read(workerCorePath);
const wrangler = read(wranglerPath);
const stateBridge = read(stateBridgePath);
const responseGuard = read(responseGuardPath);
const baseLayout = read(baseLayoutPath);
const workflowDoc = read(workflowDocPath);

requireText(recruiterStart, recruiterStartPath, [
  "data-entry-name",
  "data-entry-company",
  "data-entry-role",
  "Continue to role review",
]);

requireText(recruiterPage, recruiterPagePath, [
  "data-role-text",
  "data-analyze-role",
  "data-chat-form",
  "data-source-dialog",
  "Supported by work",
  "Supported by projects",
]);

forbidText(recruiterPage, recruiterPagePath, [
  "Fuzzy Compare",
  "data-fuzzy-run",
  "recruiter-normalizer",
  "Common match score",
]);

requireText(workerCore, workerCorePath, [
  "handleAnalyze",
  "handleChat",
  "searchAiIndex",
  "fallbackPortfolioSearch",
  "validateSourceIds",
  "class RateLimiter",
  "@cf/qwen/qwen3-30b-a3b-fp8",
]);

requireText(workerEntry, workerEntryPath, [
  "createGuardedAi",
  "analysisSchema",
  "chatSchema",
  "json_object",
  "JSON_REPAIR_MODEL",
  "deterministicAnalysisFallback",
  "deterministicChatFallback",
  "deterministicFallback(details)",
  "model_output_invalid",
  "@cf/meta/llama-3.1-8b-instruct-fast",
]);

forbidText(workerEntry, workerEntryPath, [
  "return primaryResponse;",
  "Model did not return parseable JSON",
]);

requireText(wrangler, wranglerPath, [
  'main = "src/index.ts"',
  'binding = "AI_SEARCH"',
  'name = "RATE_LIMITER"',
  'GENERATION_MODEL = "@cf/qwen/qwen3-30b-a3b-fp8"',
  'JSON_REPAIR_MODEL = "@cf/meta/llama-3.1-8b-instruct-fast"',
  'PER_CLIENT_ANALYSIS_LIMIT = "10"',
  'PER_CLIENT_CHAT_LIMIT = "5"',
]);

requireText(stateBridge, stateBridgePath, [
  "resetUsageForUtcDay",
  "analysisStale",
  "latestChatSources",
  "data-recruiter-analysis-progress",
  "startAnalysisLoader",
  "Searching portfolio evidence",
  "Building the sourced review",
  "Review ready",
]);

requireText(responseGuard, responseGuardPath, [
  "parserFailurePattern",
  "minimumAnalysisDurationMs = 7_500",
  "stageBoundariesMs = [0, 2_500, 5_000]",
  "model_output_invalid",
  "sanitizeRecruiterResponse",
  "startStageClock",
]);

requireText(baseLayout, baseLayoutPath, [
  '<script is:inline src="/recruiter-response-guard.js"></script>',
  '<script is:inline src="/recruiter-state-bridge.js"></script>',
]);

requireText(workflowDoc, workflowDocPath, [
  "```mermaid",
  "Analyze role",
  "Portfolio chat",
  "workers/recruiter-match/src/index.ts",
]);

[
  "src/data/recruiter-normalizer.ts",
  "src/styles/recruiter-compact.css",
].forEach((path) => {
  if (existsSync(path)) fail(`obsolete file still exists: ${path}`);
});

if (!process.exitCode) {
  console.log("Recruiter assistant validation passed.");
}
