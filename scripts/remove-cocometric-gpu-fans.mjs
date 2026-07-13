import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
import { gzipSync } from "node:zlib";

const ROOT = resolve(import.meta.dirname, "..");
const MODEL_DIR = resolve(ROOT, "src/data/cocometric-model");
const BACKUP_DIR = resolve(
  ROOT,
  "src/data/cocometric-model-backup/modern-pre-step5-wheel-removal"
);
const PUBLIC_DIR = resolve(ROOT, "public/models");
const MODEL_PATH = resolve(PUBLIC_DIR, "cocometric-modern.glb");
const BACKUP_MODEL_PATH = resolve(
  PUBLIC_DIR,
  "cocometric-modern-pre-step5-wheel-removal.glb"
);
const MANIFEST_PATH = resolve(MODEL_DIR, "manifest.json");
const SHAPE_REPORT_PATH = resolve(MODEL_DIR, "shape-revision-step5.json");
const PART_COUNT = 6;
const JSON_CHUNK = 0x4e4f534a;

const sha256 = (buffer) =>
  createHash("sha256").update(buffer).digest("hex");

function ensureDirectory(path) {
  mkdirSync(path, { recursive: true });
}

function parseGlb(buffer) {
  if (buffer.length < 20 || buffer.toString("ascii", 0, 4) !== "glTF") {
    throw new Error("The Cocometric model is not a valid GLB file.");
  }
  if (buffer.readUInt32LE(4) !== 2) {
    throw new Error("Only GLB version 2 is supported.");
  }
  if (buffer.readUInt32LE(8) !== buffer.length) {
    throw new Error("The GLB length header does not match the file size.");
  }

  const chunks = [];
  let offset = 12;
  while (offset < buffer.length) {
    const length = buffer.readUInt32LE(offset);
    const type = buffer.readUInt32LE(offset + 4);
    const start = offset + 8;
    const end = start + length;
    if (end > buffer.length) {
      throw new Error("A GLB chunk extends past the end of the file.");
    }
    chunks.push({ type, data: Buffer.from(buffer.subarray(start, end)) });
    offset = end;
  }

  const jsonChunk = chunks.find((chunk) => chunk.type === JSON_CHUNK);
  if (!jsonChunk) throw new Error("The GLB JSON chunk is missing.");

  const document = JSON.parse(
    jsonChunk.data.toString("utf8").replace(/[\u0000\u0020]+$/g, "")
  );
  return { document, chunks };
}

function buildGlb(document, chunks) {
  const json = Buffer.from(JSON.stringify(document), "utf8");
  const padding = (4 - (json.length % 4)) % 4;
  const paddedJson = padding
    ? Buffer.concat([json, Buffer.alloc(padding, 0x20)])
    : json;

  const outputChunks = chunks.map((chunk) =>
    chunk.type === JSON_CHUNK
      ? { type: JSON_CHUNK, data: paddedJson }
      : chunk
  );

  const totalLength =
    12 + outputChunks.reduce((sum, chunk) => sum + 8 + chunk.data.length, 0);
  const output = Buffer.alloc(totalLength);
  output.write("glTF", 0, 4, "ascii");
  output.writeUInt32LE(2, 4);
  output.writeUInt32LE(totalLength, 8);

  let offset = 12;
  for (const chunk of outputChunks) {
    output.writeUInt32LE(chunk.data.length, offset);
    output.writeUInt32LE(chunk.type, offset + 4);
    chunk.data.copy(output, offset + 8);
    offset += 8 + chunk.data.length;
  }

  return output;
}

function preserveCurrentModel() {
  ensureDirectory(BACKUP_DIR);
  if (!existsSync(BACKUP_MODEL_PATH)) {
    copyFileSync(MODEL_PATH, BACKUP_MODEL_PATH);
  }

  for (let index = 0; index < PART_COUNT; index += 1) {
    const source = resolve(MODEL_DIR, `part-${index}.js`);
    const destination = resolve(BACKUP_DIR, `part-${index}.js`);
    if (!existsSync(destination)) copyFileSync(source, destination);
  }
}

function writeEmbeddedParts(glb) {
  const encoded = gzipSync(glb, { level: 9, mtime: 0 }).toString("base64");
  const partSize = Math.ceil(encoded.length / PART_COUNT / 4) * 4;

  for (let index = 0; index < PART_COUNT; index += 1) {
    const start = index * partSize;
    const end =
      index === PART_COUNT - 1
        ? encoded.length
        : Math.min(encoded.length, start + partSize);
    writeFileSync(
      resolve(MODEL_DIR, `part-${index}.js`),
      `export default ${JSON.stringify(encoded.slice(start, end))};\n`
    );
  }
}

function ancestryContainsGpu(nodes, parents, index) {
  let current = index;
  const visited = new Set();

  while (Number.isInteger(current) && !visited.has(current)) {
    visited.add(current);
    const node = nodes[current];
    if (/^GPU(?:_|\b)/i.test(node?.name || "")) return true;
    current = parents.get(current);
  }

  return false;
}

function removeStepFiveWheelGeometry(document) {
  const nodes = document.nodes || [];
  const meshes = document.meshes || [];
  const parents = new Map();

  nodes.forEach((node, parentIndex) => {
    for (const childIndex of node.children || []) {
      if (!parents.has(childIndex)) parents.set(childIndex, parentIndex);
    }
  });

  const wheelLike = /(fan|rotor|blade|impeller|wheel|tire|hub|ring)/i;
  const removed = [];

  nodes.forEach((node, nodeIndex) => {
    if (!Number.isInteger(node.mesh)) return;
    const mesh = meshes[node.mesh];
    const combinedName = `${node.name || ""} ${mesh?.name || ""}`;
    const gpuContext =
      /^GPU(?:_|\b)/i.test(combinedName) ||
      ancestryContainsGpu(nodes, parents, nodeIndex);

    if (!gpuContext || !wheelLike.test(combinedName)) return;

    removed.push({
      nodeIndex,
      nodeName: node.name || null,
      meshIndex: node.mesh,
      meshName: mesh?.name || null,
    });
    delete node.mesh;
    node.extras = {
      ...(node.extras || {}),
      cocometricRemovedFromRender: true,
      cocometricRemovalReason: "Step 05 circular accelerator fan geometry",
    };
  });

  if (!removed.length) {
    throw new Error(
      "No wheel-like GPU meshes were found. The GLB was left unchanged."
    );
  }

  document.asset ||= { version: "2.0" };
  document.asset.extras = {
    ...(document.asset.extras || {}),
    cocometricShapeRevision: "step5-remove-wheel-like-gpu-fans-v1",
    cocometricShapeBackup:
      "public/models/cocometric-modern-pre-step5-wheel-removal.glb",
  };

  return removed;
}

if (!existsSync(MODEL_PATH)) {
  throw new Error(`Missing model: ${MODEL_PATH}`);
}

preserveCurrentModel();
const before = readFileSync(MODEL_PATH);
const { document, chunks } = parseGlb(before);
const removed = removeStepFiveWheelGeometry(document);
const after = buildGlb(document, chunks);

writeFileSync(MODEL_PATH, after);
writeEmbeddedParts(after);

let manifest = {};
if (existsSync(MANIFEST_PATH)) {
  manifest = JSON.parse(readFileSync(MANIFEST_PATH, "utf8"));
}
manifest.shapeRevision = {
  id: "step5-remove-wheel-like-gpu-fans-v1",
  geometryChanged: true,
  backup: "public/models/cocometric-modern-pre-step5-wheel-removal.glb",
  beforeBytes: before.length,
  beforeSha256: sha256(before),
  afterBytes: after.length,
  afterSha256: sha256(after),
  removedMeshCount: removed.length,
};
writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`);

writeFileSync(
  SHAPE_REPORT_PATH,
  `${JSON.stringify(
    {
      revision: "step5-remove-wheel-like-gpu-fans-v1",
      generatedAt: new Date().toISOString(),
      backupModel: "public/models/cocometric-modern-pre-step5-wheel-removal.glb",
      removedMeshCount: removed.length,
      removed,
    },
    null,
    2
  )}\n`
);

console.log(`Removed ${removed.length} wheel-like GPU mesh references from step 05.`);
for (const entry of removed) {
  console.log(`- ${entry.nodeName || "unnamed node"} / ${entry.meshName || "unnamed mesh"}`);
}
console.log(`Updated GLB: ${after.length.toLocaleString()} bytes (${sha256(after)})`);
