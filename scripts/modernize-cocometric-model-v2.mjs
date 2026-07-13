import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { gunzipSync, gzipSync } from "node:zlib";

const ROOT = resolve(import.meta.dirname, "..");
const MODEL_DIR = resolve(ROOT, "src/data/cocometric-model");
const BACKUP_DIR = resolve(ROOT, "src/data/cocometric-model-backup/original-2026-07-12");
const PUBLIC_DIR = resolve(ROOT, "public/models");
const ORIGINAL_GLB = resolve(PUBLIC_DIR, "cocometric-original-2026-07-12.glb");
const MODERN_GLB = resolve(PUBLIC_DIR, "cocometric-modern.glb");
const MANIFEST = resolve(MODEL_DIR, "manifest.json");
const PART_COUNT = 6;
const JSON_CHUNK = 0x4e4f534a;

const profiles = {
  rack: [[0.012, 0.018, 0.027, 1], 0.72, 0.44, 0.08, 0.36, "Matte black powder-coated rack"],
  chassis: [[0.025, 0.038, 0.052, 1], 0.82, 0.34, 0.12, 0.3, "Dark anodized chassis"],
  drive: [[0.055, 0.07, 0.088, 1], 0.7, 0.32, 0.08, 0.3, "Graphite storage sled"],
  board: [[0.012, 0.115, 0.078, 1], 0.06, 0.58, 0.16, 0.42, "Deep green production PCB"],
  heatsink: [[0.42, 0.49, 0.56, 1], 0.96, 0.24, 0.08, 0.24, "Brushed aluminum thermal hardware"],
  memory: [[0.022, 0.03, 0.042, 1], 0.32, 0.4, 0.12, 0.34, "Matte memory module"],
  gpuBody: [[0.014, 0.02, 0.03, 1], 0.66, 0.25, 0.34, 0.18, "Modern graphite accelerator shroud"],
  gpuFan: [[0.004, 0.006, 0.009, 1], 0.18, 0.3, 0.2, 0.22, "Black accelerator fan"],
  fanHousing: [[0.018, 0.027, 0.038, 1], 0.52, 0.38, 0.1, 0.32, "Industrial fan housing"],
  psu: [[0.37, 0.43, 0.49, 1], 0.96, 0.24, 0.1, 0.22, "Brushed redundant power supply"],
  portMetal: [[0.38, 0.45, 0.53, 1], 0.94, 0.21, 0.1, 0.2, "Machined network and I/O metal"],
  accent: [[0.82, 0.19, 0.09, 1], 0.46, 0.25, 0.28, 0.18, "Cocometric signal coral accent"],
};

const clone = (value) => (value === undefined ? undefined : JSON.parse(JSON.stringify(value)));
const hash = (buffer) => createHash("sha256").update(buffer).digest("hex");
const ensure = (path) => mkdirSync(path, { recursive: true });

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

function preserveOriginalFiles() {
  ensure(BACKUP_DIR);
  for (const entry of readdirSync(MODEL_DIR, { withFileTypes: true })) {
    if (entry.isFile() && entry.name.endsWith(".js")) {
      copyFileSync(resolve(MODEL_DIR, entry.name), resolve(BACKUP_DIR, entry.name));
    }
  }
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
  const json = chunks.find((chunk) => chunk.type === JSON_CHUNK);
  if (!json) throw new Error("GLB JSON chunk missing");
  const document = JSON.parse(json.data.toString("utf8").replace(/[\u0000\u0020]+$/g, ""));
  return { document, chunks };
}

function buildGlb(document, chunks) {
  const json = Buffer.from(JSON.stringify(document));
  const pad = (4 - (json.length % 4)) % 4;
  const paddedJson = pad ? Buffer.concat([json, Buffer.alloc(pad, 0x20)]) : json;
  const outputChunks = chunks.map((chunk) => chunk.type === JSON_CHUNK ? { type: JSON_CHUNK, data: paddedJson } : chunk);
  const total = 12 + outputChunks.reduce((sum, chunk) => sum + 8 + chunk.data.length, 0);
  const output = Buffer.alloc(total);
  output.write("glTF", 0, 4, "ascii");
  output.writeUInt32LE(2, 4);
  output.writeUInt32LE(total, 8);
  let offset = 12;
  for (const chunk of outputChunks) {
    output.writeUInt32LE(chunk.data.length, offset);
    output.writeUInt32LE(chunk.type, offset + 4);
    chunk.data.copy(output, offset + 8);
    offset += 8 + chunk.data.length;
  }
  return output;
}

function profileFor(name = "") {
  if (/^Cocometric_Badge$/i.test(name) || /Latch|Release|Accent/i.test(name)) return "accent";
  if (/^GPU_/i.test(name)) {
    if (/Fan|Rotor|Blade/i.test(name)) return "gpuFan";
    if (/Bracket|Port|IO|Vent|Backplate/i.test(name)) return "portMetal";
    return "gpuBody";
  }
  if (/^PSU_/i.test(name)) {
    if (/Fan|Rotor|Blade/i.test(name)) return "gpuFan";
    if (/Handle|Latch|Release/i.test(name)) return "accent";
    return "psu";
  }
  if (/^NIC_/i.test(name)) return /Port|Bracket|Shield/i.test(name) ? "portMetal" : "board";
  if (/^Fan_/i.test(name)) return /Blade|Rotor/i.test(name) ? "gpuFan" : "fanHousing";
  if (/^Drive_/i.test(name)) return "drive";
  if (/^Motherboard$/i.test(name)) return "board";
  if (/^CPU_/i.test(name)) return /Heat|Sink|Block/i.test(name) ? "heatsink" : "portMetal";
  if (/^RAM_/i.test(name)) return "memory";
  if (/^IO_/i.test(name)) return "portMetal";
  if (/^Rack_|^Installed_/i.test(name)) return "rack";
  if (/^Exploded_Chassis_|^Tray_/i.test(name)) return "chassis";
  return null;
}

function styledMaterial(source, profileName, sourceIndex) {
  const material = clone(source || {});
  const [color, metallic, roughness, clearcoat, clearcoatRoughness, label] = profiles[profileName];
  material.name = `Cocometric_${profileName}_${sourceIndex ?? "default"}`;
  material.alphaMode = "OPAQUE";
  material.doubleSided = false;
  delete material.alphaCutoff;
  material.pbrMetallicRoughness = {
    ...(material.pbrMetallicRoughness || {}),
    baseColorFactor: color,
    metallicFactor: metallic,
    roughnessFactor: roughness,
  };
  material.extensions = {
    ...(material.extensions || {}),
    KHR_materials_clearcoat: {
      clearcoatFactor: clearcoat,
      clearcoatRoughnessFactor: clearcoatRoughness,
    },
  };
  material.extras = {
    ...(material.extras || {}),
    cocometricProfile: profileName,
    cocometricFinish: label,
  };
  return material;
}

function modernize(document) {
  document.asset ||= { version: "2.0" };
  document.asset.generator = `${document.asset.generator || "GLB"} + Cocometric modern-material pipeline`;
  document.asset.extras = {
    ...(document.asset.extras || {}),
    cocometricMaterialProfile: "modern-v1",
    sourceBackup: "public/models/cocometric-original-2026-07-12.glb",
  };
  document.extensionsUsed = [...new Set([...(document.extensionsUsed || []), "KHR_materials_clearcoat"])];
  document.materials ||= [];
  document.meshes ||= [];
  document.nodes ||= [];

  const originalMaterials = document.materials.map(clone);
  const materialCache = new Map();
  const getMaterial = (sourceIndex, profileName) => {
    const key = `${sourceIndex ?? "default"}:${profileName}`;
    if (materialCache.has(key)) return materialCache.get(key);
    const index = document.materials.length;
    document.materials.push(styledMaterial(originalMaterials[sourceIndex] || {}, profileName, sourceIndex));
    materialCache.set(key, index);
    return index;
  };

  const visited = new Set();
  const visit = (nodeIndex, inherited = null) => {
    if (visited.has(nodeIndex)) return;
    visited.add(nodeIndex);
    const node = document.nodes[nodeIndex];
    if (!node) return;
    const profileName = profileFor(node.name) || inherited;
    if (profileName && Number.isInteger(node.mesh) && document.meshes[node.mesh]) {
      const sourceMesh = document.meshes[node.mesh];
      const mesh = clone(sourceMesh);
      mesh.name = `${sourceMesh.name || node.name || `Mesh_${node.mesh}`}_Modern`;
      mesh.primitives = (sourceMesh.primitives || []).map((primitive) => ({
        ...clone(primitive),
        material: getMaterial(primitive.material, profileName),
      }));
      node.mesh = document.meshes.length;
      document.meshes.push(mesh);
    }
    for (const child of node.children || []) visit(child, profileName);
  };

  for (const scene of document.scenes || []) for (const node of scene.nodes || []) visit(node);
  for (let index = 0; index < document.nodes.length; index += 1) if (!visited.has(index)) visit(index);
  return document;
}

function writeParts(glb) {
  const encoded = gzipSync(glb, { level: 9, mtime: 0 }).toString("base64");
  const size = Math.ceil(encoded.length / PART_COUNT / 4) * 4;
  for (let index = 0; index < PART_COUNT; index += 1) {
    const start = index * size;
    const end = index === PART_COUNT - 1 ? encoded.length : Math.min(encoded.length, start + size);
    writeFileSync(resolve(MODEL_DIR, `part-${index}.js`), `export default ${JSON.stringify(encoded.slice(start, end))};\n`);
  }
}

ensure(PUBLIC_DIR);
const embedded = await readEmbeddedModel();
let original;
if (existsSync(ORIGINAL_GLB)) {
  original = readFileSync(ORIGINAL_GLB);
} else {
  preserveOriginalFiles();
  original = embedded;
  writeFileSync(ORIGINAL_GLB, original);
}

const { document, chunks } = parseGlb(original);
const modern = buildGlb(modernize(document), chunks);
writeFileSync(MODERN_GLB, modern);
writeParts(modern);

const manifest = {
  profile: "modern-v1",
  generatedAt: new Date().toISOString(),
  geometryChanged: false,
  nodeNamesPreserved: true,
  backupBranch: "backup/cocometric-glb-original-2026-07-12",
  original: { path: "public/models/cocometric-original-2026-07-12.glb", bytes: original.length, sha256: hash(original) },
  modern: { path: "public/models/cocometric-modern.glb", bytes: modern.length, sha256: hash(modern) },
  materials: Object.fromEntries(Object.entries(profiles).map(([name, profile]) => [name, profile[5]])),
};
writeFileSync(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);

console.log(`Original Cocometric GLB: ${original.length.toLocaleString()} bytes (${manifest.original.sha256})`);
console.log(`Modern Cocometric GLB: ${modern.length.toLocaleString()} bytes (${manifest.modern.sha256})`);
console.log("Geometry, node names, and component counts preserved; PBR materials modernized.");
