import { spawnSync } from "node:child_process";

const quotaNamespace = `deploy-${Date.now()}`;
const result = spawnSync(
  "npx",
  [
    "wrangler",
    "deploy",
    "--config",
    "workers/recruiter-match/wrangler.toml",
    "--var",
    `QUOTA_NAMESPACE:${quotaNamespace}`,
  ],
  { stdio: "inherit" },
);

if (result.error) throw result.error;
process.exit(result.status ?? 1);
