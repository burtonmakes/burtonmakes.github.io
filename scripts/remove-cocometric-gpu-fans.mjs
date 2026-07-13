import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { gunzipSync, gzipSync } from "node:zlib";

const ROOT = resolve(import.meta.dirname, "..");
const MODEL_DIR = resolve(ROOT, "src/data/cocometric-model");
const PART_COUNT = 6;
const JSON_CHUNK = 0x4e4f534a;
const REMOVED_NODE_PATTERN = /^GPU_\d+_(Fan|Hub)_\d+$/;

async function readEmbeddedModel() {
  const parts = [];
  for (let index = 0; index < PART_COUNT; index += 1) {
    const url = `${pathToFileURL(resolve(MODEL_DIR, `part-${index}.js`)).href}?read=${Date.now()}-${index}`;
    const module = await import(url);
    if (typeof module.default !== "string") throw new Error(`Model part ${index} did not export a string`);
    parts.push(module.default);
  }
  return gunzipSync(Buffer.from(parts.join(""), "base64"));
}

function parseGlb(buffer) {
  if (buffer.length < 20 || buffer.toString("ascii", 0, 4) !== "glTF") throw new Error("Invalid GLB header");
  if (buffer.readUInt32LE(4) !== 2) throw new Error("Only GLB version 2 is supported");
  if (buffer.readUInt32LE(8) !== buffer.length) throw new Error("GLB length mismatch");

  const chunks = [];
  let offset = 12;
  while (offset < buffer.length) {
    const length = buffer.readUInt32LE(offset);
    const type = buffer.readUInt32LE(offset + 4);
    const start = offset + 8;
    const end = start + length;
    if (end > buffer.length) throw new Error("GLB chunk exceeds file length");
    chunks.push({ type, data: Buffer.from(buffer.subarray(start, end)) });
    offset = end;
  }

  const jsonChunk = chunks.find((chunk) => chunk.type === JSON_CHUNK);
  if (!jsonChunk) throw new Error("GLB JSON chunk missing");
  const document = JSON.parse(jsonChunk.data.toString("utf8").replace(/[\u0000\u0020]+$/g, ""));
  return { document, chunks };
}

function buildGlb(document, chunks) {
  const json = Buffer.from(JSON.stringify(document));
  const padding = (4 - (json.length % 4)) % 4;
  const paddedJson = padding ? Buffer.concat([json, Buffer.alloc(padding, 0x20)]) : json;
  const outputChunks = chunks.map((chunk) => chunk.type === JSON_CHUNK ? { type: JSON_CHUNK, data: paddedJson } : chunk);
  const totalLength = 12 + outputChunks.reduce((sum, chunk) => sum + 8 + chunk.data.length, 0);
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

function writeEmbeddedModel(glb) {
  const encoded = gzipSync(glb, { level: 9, mtime: 0 }).toString("base64");
  const partSize = Math.ceil(encoded.length / PART_COUNT / 4) * 4;

  for (let index = 0; index < PART_COUNT; index += 1) {
    const start = index * partSize;
    const end = index === PART_COUNT - 1 ? encoded.length : Math.min(encoded.length, start + partSize);
    writeFileSync(resolve(MODEL_DIR, `part-${index}.js`), `export default ${JSON.stringify(encoded.slice(start, end))};\n`);
  }
}

const original = await readEmbeddedModel();
const { document, chunks } = parseGlb(original);
const removedNodeIndices = new Set();
const removedNodeNames = [];

for (let index = 0; index < (document.nodes || []).length; index += 1) {
  const name = document.nodes[index]?.name || "";
  if (REMOVED_NODE_PATTERN.test(name)) {
    removedNodeIndices.add(index);
    removedNodeNames.push(name);
  }
}

if (removedNodeNames.length !== 8) {
  throw new Error(`Expected 8 GPU fan/hub nodes, found ${removedNodeNames.length}: ${removedNodeNames.join(", ")}`);
}

for (const node of document.nodes || []) {
  if (Array.isArray(node.children)) {
    node.children = node.children.filter((childIndex) => !removedNodeIndices.has(childIndex));
  }
}
for (const scene of document.scenes || []) {
  if (Array.isArray(scene.nodes)) {
    scene.nodes = scene.nodes.filter((nodeIndex) => !removedNodeIndices.has(nodeIndex));
  }
}

document.asset ||= { version: "2.0" };
document.asset.generator = `${document.asset.generator || "GLB"} + Cocometric GPU fan removal`;
document.asset.extras = {
  ...(document.asset.extras || {}),
  cocometricShapeRevision: "gpu-circles-removed-v1",
  removedNodes: removedNodeNames,
};

const revised = buildGlb(document, chunks);
writeEmbeddedModel(revised);
writeFileSync(resolve(ROOT, "public/models/cocometric-gpu-circles-removed.glb"), revised);

console.log(`Removed ${removedNodeNames.length} circular GPU fan/hub nodes:`);
for (const name of removedNodeNames) console.log(`- ${name}`);
console.log(`Revised Cocometric GLB: ${revised.length.toLocaleString()} bytes`);
