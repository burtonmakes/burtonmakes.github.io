import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const repoRoot = resolve(process.cwd());
const sourceRoot = resolve(
  process.env.JOB_SEARCH_ROOT || join(repoRoot, "..", "job-search"),
);
const sourcePath = join(sourceRoot, "profile", "public-portfolio.json");
const outputPath = join(repoRoot, "src", "data", "generated", "profile-source.json");

if (!existsSync(sourcePath)) {
  throw new Error(`Missing approved profile export: ${sourcePath}`);
}

const source = JSON.parse(readFileSync(sourcePath, "utf8"));
if (source.schemaVersion !== 1 || source.visibility !== "public-approved") {
  throw new Error("Profile export must use schemaVersion 1 and public-approved visibility.");
}
if (!Array.isArray(source.workHistory) || source.workHistory.length === 0) {
  throw new Error("Profile export must contain at least one work-history entry.");
}

for (const [index, role] of source.workHistory.entries()) {
  for (const field of ["title", "company", "dates", "context", "summary"]) {
    if (typeof role[field] !== "string" || !role[field].trim()) {
      throw new Error(`Work entry ${index + 1} is missing ${field}.`);
    }
  }
  for (const field of ["responsibilities", "accomplishments", "skills"]) {
    if (!Array.isArray(role[field]) || role[field].length === 0) {
      throw new Error(`Work entry ${index + 1} is missing ${field}.`);
    }
  }
}

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(source, null, 2)}\n`);
console.log(`Synced approved profile export from ${sourcePath}`);
