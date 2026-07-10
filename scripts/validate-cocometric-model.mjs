import { gunzipSync } from "node:zlib";
import modelPart0 from "../src/data/cocometric-model/part-0.js";
import modelPart1 from "../src/data/cocometric-model/part-1.js";
import modelPart2 from "../src/data/cocometric-model/part-2.js";
import modelPart3 from "../src/data/cocometric-model/part-3.js";
import modelPart4 from "../src/data/cocometric-model/part-4.js";
import modelPart5 from "../src/data/cocometric-model/part-5.js";

const encoded = [modelPart0, modelPart1, modelPart2, modelPart3, modelPart4, modelPart5].join("");
const compressed = Buffer.from(encoded, "base64");
const model = gunzipSync(compressed);

function fail(message) {
  throw new Error(`Cocometric model validation failed: ${message}`);
}

if (model.length < 20) fail("model is too small to be a GLB file");
if (model.toString("ascii", 0, 4) !== "glTF") fail("invalid GLB magic header");
if (model.readUInt32LE(4) !== 2) fail("unsupported GLB version");
if (model.readUInt32LE(8) !== model.length) fail("GLB length header does not match the embedded model");

const jsonLength = model.readUInt32LE(12);
const jsonType = model.readUInt32LE(16);
if (jsonType !== 0x4e4f534a) fail("first GLB chunk is not JSON");

const jsonStart = 20;
const jsonEnd = jsonStart + jsonLength;
if (jsonEnd > model.length) fail("JSON chunk extends beyond the model data");

const document = JSON.parse(model.subarray(jsonStart, jsonEnd).toString("utf8").trimEnd());
const nodeNames = (document.nodes || []).map((node) => node.name || "");

const expectedCounts = [
  [/^Drive_\d+_\d+$/, 6, "removable drives"],
  [/^GPU_\d+_Body$/, 2, "GPU assemblies"],
  [/^PSU_\d+$/, 2, "power supplies"],
  [/^Fan_Housing_\d+_\d+$/, 6, "fan assemblies"],
  [/^RAM_\d+_\d+$/, 12, "memory modules"],
  [/^NIC_Port_\d+$/, 3, "network ports"],
];

for (const [pattern, expected, label] of expectedCounts) {
  const actual = nodeNames.filter((name) => pattern.test(name)).length;
  if (actual !== expected) fail(`expected ${expected} ${label}, found ${actual}`);
}

const requiredNodes = ["Rack_Left_Side", "Exploded_Chassis_Base", "Motherboard", "Fan_Wall", "Cocometric_Badge"];
for (const name of requiredNodes) {
  if (!nodeNames.includes(name)) fail(`required node is missing: ${name}`);
}

console.log(
  `Validated Cocometric GLB: ${model.length.toLocaleString()} bytes, ${nodeNames.length} nodes, ${document.meshes?.length || 0} meshes.`
);
