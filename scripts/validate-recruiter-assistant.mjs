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
const workflowDocPath = "docs/RECRUITER_ASSISTANT_WORKFLOW.md";

const recruiterPage = read(recruiterPagePath);
const recruiterStart = read(recruiterStartPath);
const workerEntry = read(workerEntryPath);
const workerCore = read(workerCorePath);
const wrangler = read(wranglerPath);
const stateBridge = read(stateBridgePath);
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
  "@cf/google/gemma-4-26b-a4b-it",
]);

requireText(workerEntry, workerEntryPath, [
  "createGuardedAi",
  "analysisSchema",
  "chatSchema",
  "json_schema",
  "JSON_REPAIR_MODEL",
  "model_output_invalid",
  "@cf/meta/llama-3.1-8b-instruct-fast",
]);

requireText(wrangler, wranglerPath, [
  'main = "src/index.ts"',
  'binding = "AI_SEARCH"',
  'name = "RATE_LIMITER"',
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
