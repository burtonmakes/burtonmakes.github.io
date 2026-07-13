import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { createHash } from "node:crypto";
import { dirname, resolve } from "node:path";
import { gunzipSync, gzipSync } from "node:zlib";

const ROOT = resolve(import.meta.dirname, "..");
const MODEL_DIR = resolve(ROOT, "src/data/cocometric-model");
const BACKUP_DIR = resolve(ROOT, "src/data/cocometric-model-backup/original-2026-07-12");
const PUBLIC_MODEL_DIR = resolve(ROOT, "public/models");
const ORIGINAL_GLB = resolve(PUBLIC_MODEL_DIR, "cocometric-original-2026-07-12.glb");
const MODERN_GLB = resolve(PUBLIC_MODEL_DIR, "cocometric-modern.glb");
const MANIFEST = resolve(MODEL_DIR, "manifest.json");
const PART_COUNT = 6;
const JSON_CHUNK = 0x4e4f534a;

const materialProfiles = {
  rack: {
    label: "Matte black powder-coated rack",
    color: [0.012, 0.018, 0.027, 1],
    metallic: 0.72,
    roughness: 0.44,
    clearcoat: 0.08,
    clearcoatRoughness: 0.36,
  },
  chassis: {
    label: "Dark anodized chassis",
    color: [0.025, 0.038, 0.052, 1],
    metallic: 0.82,
    roughness: 0.34,
    clearcoat: 0.12,
    clearcoatRoughness: 0.3,
  },
  drive: {
    label: "Graphite storage sled",
    color: [0.055, 0.07, 0.088, 1],
    metallic: 0.7,
    roughness: 0.32,
    clearcoat: 0.08,
    clearcoatRoughness: 0.3,
  },
  board: {
    label: "Deep green production PCB",
    color: [0.012, 0.115, 0.078, 1],
    metallic: 0.06,
    roughness: 0.58,
    clearcoat: 0.16,
    clearcoatRoughness: 0.42,
  },
  heatsink: {
    label: "Brushed aluminum thermal hardware",
    color: [0.42, 0.49, 0.56, 1],
    metallic: 0.96,
    roughness: 0.24,
    clearcoat: 0.08,
    clearcoatRoughness: 0.24,
  },
  memory: {
    label: "Matte memory module",
    color: [0.022, 0.03, 0.042, 1],
    metallic: 0.32,
    roughness: 0.4,
    clearcoat: 0.12,
    clearcoatRoughness: 0.34,
  },
  gpuBody: {
    label: "Modern graphite accelerator shroud",
    color: [0.014, 0.02, 0.03, 1],
    metallic: 0.66,
    roughness: 0.25,
    clearcoat: 0.34,
    clearcoatRoughness: 0.18,
  },
  gpuFan: {
    label: "Black accelerator fan",
    color: [0.004, 0.006, 0.009, 1],
    metallic: 0.18,
    roughness: 0.3,
    clearcoat: 0.2,
    clearcoatRoughness: 0.22,
  },
  fanHousing: {
    label: "Industrial fan housing",
    color: [0.018, 0.027, 0.038, 1],
    metallic: 0.52,
    roughness: 0.38,
    clearcoat: 0.1,
    clearcoatRoughness: 0.32,
  },
  psu: {
    label: "Brushed redundant power supply",
    color: [0.37, 0.43, 0.49, 1],
    metallic: 0.96,
    roughness: 0.24,
    clearcoat: 0.1,
    clearcoatRoughness: 0.22,
  },
  portMetal: {
    label: "Machined network and I/O metal",
    color: [0.38, 0.45, 0.53, 1],
    metallic: 0.94,
    roughness: 0.21,
    clearcoat: 0.1,
    clearcoatRoughness: 0.2,
  },
  accent: {
    label: "Cocometric signal coral accent",
    color: [0.82, 0.19, 0.09, 1],
    metallic: 0.46,
    roughness: 0.25,
    clearcoat: 0.28,
    clearcoatRoughness: 0.18,
  },
};

function ensureDirectory(path) {
  mkdirSync(path, { recursive: true });
}

function sha256(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

function readPart(path) {
  const source = readFileSync(path, "utf8");
  const match = source.match(/^\s*export\s+default\s+("(?:[^"\\]|\\.)*")\s*;?\s*$/s);
  if (!match) throw new Error(`Unable to parse embedded model part: ${path}`);
  return JSON.parse(match[1]);
}

function readEmbeddedModel() {
  const encoded = Array.from({ length: PART_COUNT }, (_, index) =>
    readPart(resolve(MODEL_DIR, `part-${index}.js`))
  ).join("");
  return gunzipSync(Buffer.from(encoded, "base64"));
}

function parseGlb(buffer) {
  if (buffer.length < 20 || buffer.toString("ascii", 0, 4) !== "glTF") {
    throw new Error("Input is not a valid GLB file");
  }
  if (buffer.readUInt32LE(4) !== 2) throw new Error("Only GLB version 2 is supported");
  if (buffer.readUInt32LE(8) !== buffer.length) throw new Error("GLB length header mismatch");

  const chunks = [];
  let offset = 12;
  while (offset < buffer.length) {
    const length = buffer.readUInt32LE(offset);
    const type = buffer.readUInt32LE(offset + 4);
    const start = offset + 8;
    const end = start + length;
    if (end > buffer.length) throw new Error("GLB chunk extends past the file boundary");
    chunks.push({ type, data: Buffer.from(buffer.subarray(start, end)) });
    offset = end;
  }

  const jsonChunk = chunks.find((chunk) => chunk.type === JSON_CHUNK);
  if (!jsonChunk) throw new Error("GLB JSON chunk is missing");
  const document = JSON.parse(jsonChunk.data.toString("utf8").replace(/[\u0000\u0020]+$/g, ""));
  return { document, chunks };
}

function buildGlb(document, chunks) {
  const json = Buffer.from(JSON.stringify(document), "utf8");
  const padding = (4 - (json.length % 4)) % 4;
  const paddedJson = padding ? Buffer.concat([json, Buffer.alloc(padding, 0x20)]) : json;

  const outputChunks = chunks.map((chunk) =>
    chunk.type === JSON_CHUNK ? { type: JSON_CHUNK, data: paddedJson } : chunk
  );
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

function clone(value) {
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

function profileForName(name = "") {
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

function applyProfile(sourceMaterial, profileName, sourceIndex) {
  const profile = materialProfiles[profileName];
  const material = clone(sourceMaterial || {});
  material.name = `Cocometric_${profileName}_${sourceIndex ?? "default"}`;
  material.alphaMode = "OPAQUE";
  material.doubleSided = false;
  delete material.alphaCutoff;

  const pbr = material.pbrMetallicRoughness || {};
  pbr.baseColorFactor = profile.color;
  pbr.metallicFactor = profile.metallic;
  pbr.roughnessFactor = profile.roughness;
  material.pbrMetallicRoughness = pbr;

  material.extensions = material.extensions || {};
  material.extensions.KHR_materials_clearcoat = {
    clearcoatFactor: profile.clearcoat,
    clearcoatRoughnessFactor: profile.clearcoatRoughness,
  };
  material.extras = {
    ...(material.extras || {}),
    cocometricProfile: profileName,
    cocometricFinish: profile.label,
  };
  return material;
}

function modernizeDocument(document) {
  document.asset = document.asset || { version: "2.0" };
  document.asset.generator = `${document.asset.generator || "GLB"} + Cocometric modern-material pipeline`;
  document.asset.extras = {
    ...(document.asset.extras || {}),
    cocometricMaterialProfile: "modern-v1",
    sourceBackup: "public/models/cocometric-original-2026-07-12.glb",
  };
  document.extensionsUsed = [...new Set([...(document.extensionsUsed || []), "KHR_materials_clearcoat"])];
  document.materials = document.materials || [];
  document.meshes = document.meshes || [];
  document.nodes = document.nodes || [];

  const materialCache = new Map();
  const originalMaterials = document.materials.map((material) => clone(material));

  function profileMaterial(sourceIndex, profileName) {
    const key = `${sourceIndex ?? "default"}:${profileName}`;
    if (materialCache.has(key)) return materialCache.get(key);
    const source = sourceIndex === undefined ? {} : originalMaterials[sourceIndex] || {};
    const index = document.materials.length;
    document.materials.push(applyProfile(source, profileName, sourceIndex));
    materialCache.set(key, index);
    return index;
  }

  const visited = new Set();
  function visitNode(nodeIndex, inheritedProfile = null) {
    if (visited.has(nodeIndex)) return;
    visited.add(nodeIndex);
    const node = document.nodes[nodeIndex];
    if (!node) return;
    const profileName = profileForName(node.name) || inheritedProfile;

    if (profileName && Number.isInteger(node.mesh) && document.meshes[node.mesh]) {
      const sourceMesh = document.meshes[node.mesh];
      const modernMesh = clone(sourceMesh);
      modernMesh.name = `${sourceMesh.name || node.name || `Mesh_${node.mesh}`}_Modern`;
      modernMesh.primitives = (sourceMesh.primitives || []).map((primitive) => ({
        ...clone(primitive),
        material: profileMaterial(primitive.material, profileName),
      }));
      node.mesh = document.meshes.length;
      document.meshes.push(modernMesh);
    }

    for (const child of node.children || []) visitNode(child, profileName);
  }

  for (const scene of document.scenes || []) {
    for (const nodeIndex of scene.nodes || []) visitNode(nodeIndex, null);
  }
  for (let index = 0; index < document.nodes.length; index += 1) {
    if (!visited.has(index)) visitNode(index, null);
  }

  return document;
}

function writeEmbeddedModel(glb) {
  const compressed = gzipSync(glb, { level: 9, mtime: 0 });
  const encoded = compressed.toString("base64");
  const approximate = Math.ceil(encoded.length / PART_COUNT / 4) * 4;

  for (let index = 0; index < PART_COUNT; index += 1) {
    const start = index * approximate;
    const end = index === PART_COUNT - 1 ? encoded.length : Math.min(encoded.length, start + approximate);
    const part = encoded.slice(start, end);
    writeFileSync(resolve(MODEL_DIR, `part-${index}.js`), `export default ${JSON.stringify(part)};\n`);
  }
}

function preserveOriginalParts() {
  ensureDirectory(BACKUP_DIR);
  for (let index = 0; index < PART_COUNT; index += 1) {
    const source = resolve(MODEL_DIR, `part-${index}.js`);
    const destination = resolve(BACKUP_DIR, `part-${index}.js`);
    if (!existsSync(destination)) copyFileSync(source, destination);
  }
}

ensureDirectory(PUBLIC_MODEL_DIR);
ensureDirectory(dirname(MANIFEST));

const embeddedModel = readEmbeddedModel();
let originalModel;
if (existsSync(ORIGINAL_GLB)) {
  originalModel = readFileSync(ORIGINAL_GLB);
} else {
  preserveOriginalParts();
  originalModel = embeddedModel;
  writeFileSync(ORIGINAL_GLB, originalModel);
}

const { document, chunks } = parseGlb(originalModel);
const modernDocument = modernizeDocument(document);
const modernModel = buildGlb(modernDocument, chunks);
writeFileSync(MODERN_GLB, modernModel);
writeEmbeddedModel(modernModel);

const manifest = {
  profile: "modern-v1",
  generatedAt: new Date().toISOString(),
  original: {
    path: "public/models/cocometric-original-2026-07-12.glb",
    bytes: originalModel.length,
    sha256: sha256(originalModel),
  },
  modern: {
    path: "public/models/cocometric-modern.glb",
    bytes: modernModel.length,
    sha256: sha256(modernModel),
  },
  backupBranch: "backup/cocometric-glb-original-2026-07-12",
  geometryChanged: false,
  materials: Object.fromEntries(
    Object.entries(materialProfiles).map(([name, profile]) => [name, profile.label])
  ),
};
writeFileSync(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);

console.log(`Original Cocometric GLB: ${originalModel.length.toLocaleString()} bytes (${manifest.original.sha256})`);
console.log(`Modern Cocometric GLB: ${modernModel.length.toLocaleString()} bytes (${manifest.modern.sha256})`);
console.log("Geometry and node names preserved; PBR material finishes modernized.");
