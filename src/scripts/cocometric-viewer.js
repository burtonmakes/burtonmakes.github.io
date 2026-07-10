import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import modelPart0 from "../data/cocometric-model/part-0.js";
import modelPart1 from "../data/cocometric-model/part-1.js";
import modelPart2 from "../data/cocometric-model/part-2.js";
import modelPart3 from "../data/cocometric-model/part-3.js";
import modelPart4 from "../data/cocometric-model/part-4.js";
import modelPart5 from "../data/cocometric-model/part-5.js";

const modelGzipBase64 = [modelPart0, modelPart1, modelPart2, modelPart3, modelPart4, modelPart5].join("");

const stages = [
  {
    eyebrow: "Cocometric system · 01",
    title: "One system. Every layer visible.",
    note: "Scroll through the actual server model to inspect the rack, storage, compute, accelerators, cooling, power, and network hardware.",
    tags: ["Rack", "Storage", "Compute", "GPU"],
    focus: [],
    context: [],
    camera: [9.8, 5.7, 13.2],
    target: [0.15, 0.0, 0.0],
  },
  {
    eyebrow: "Rack + chassis · 02",
    title: "A serviceable system, not a sealed appliance.",
    note: "The enclosure, rails, chassis, and installed bays keep the system accessible for upgrades, maintenance, and replacement.",
    tags: ["Rack enclosure", "Rails", "Chassis", "Service bays"],
    focus: ["rack", "chassis"],
    context: [],
    camera: [-0.4, 3.5, 8.7],
    target: [-2.25, 0.05, 0.0],
  },
  {
    eyebrow: "Storage · 03",
    title: "Storage built around recovery.",
    note: "Removable drive capacity supports primary data, snapshots, retention windows, and restore-tested backup tiers.",
    tags: ["6 removable drives", "Snapshots", "Retention", "Restore tests"],
    focus: ["storage"],
    context: ["chassis"],
    camera: [7.0, 4.0, 8.5],
    target: [3.35, 1.12, 0.0],
  },
  {
    eyebrow: "Compute · 04",
    title: "General compute for the whole local stack.",
    note: "The motherboard, dual processors, heat sinks, memory, and I/O run databases, indexing, automation, and internal services.",
    tags: ["Dual CPU", "12 memory modules", "Motherboard", "I/O"],
    focus: ["compute"],
    context: ["chassis"],
    camera: [4.3, 3.0, 7.0],
    target: [0.05, 0.55, 0.05],
  },
  {
    eyebrow: "AI accelerators · 05",
    title: "Local inference without sending data away.",
    note: "Two GPU assemblies provide accelerated capacity for retrieval, OCR, image processing, and private model workloads.",
    tags: ["2 GPU assemblies", "Local models", "OCR", "Private retrieval"],
    focus: ["gpu"],
    context: ["chassis"],
    camera: [4.1, -0.1, 6.8],
    target: [0.25, -1.45, 0.08],
  },
  {
    eyebrow: "Cooling · 06",
    title: "Airflow designed as part of the system.",
    note: "Six fan assemblies and a dedicated fan wall move heat through the chassis so storage and compute remain stable under sustained load.",
    tags: ["6 fan assemblies", "Fan wall", "Directed airflow", "Sustained load"],
    focus: ["cooling"],
    context: ["chassis"],
    camera: [5.8, 2.5, 7.0],
    target: [2.2, 0.12, 0.1],
  },
  {
    eyebrow: "Power + network · 07",
    title: "Redundant power and controlled access.",
    note: "Dual power modules and a dedicated network interface support reliable operation, segmentation, secure remote access, and clean service routing.",
    tags: ["Dual PSU", "Dedicated NIC", "Segmentation", "Secure access"],
    focus: ["power-network"],
    context: ["chassis"],
    camera: [6.7, 0.8, 7.7],
    target: [3.0, -1.15, 0.18],
  },
];

const componentOffsets = {
  rack: new THREE.Vector3(-0.08, 0.02, 0.18),
  chassis: new THREE.Vector3(0.0, 0.08, 0.24),
  storage: new THREE.Vector3(0.16, 0.08, 0.34),
  compute: new THREE.Vector3(0.0, 0.12, 0.36),
  gpu: new THREE.Vector3(0.0, -0.04, 0.40),
  cooling: new THREE.Vector3(0.14, 0.0, 0.38),
  "power-network": new THREE.Vector3(0.16, -0.04, 0.36),
};

const canvas = document.querySelector("#server-canvas");
const loading = document.querySelector("#loading");
const loadingBar = document.querySelector("#loading-bar");
const loadingCopy = document.querySelector("#loading-copy");
const sceneElement = document.querySelector("#scene");
const copy = document.querySelector("#copy");
const scrollCue = document.querySelector("#scroll-cue");
const stageStep = document.querySelector("#stage-step");
const stageTitle = document.querySelector("#stage-title");
const stageNote = document.querySelector("#stage-note");
const stageTags = document.querySelector("#stage-tags");
const stageButtons = [...document.querySelectorAll("[data-stage-button]")];
const finalSection = document.querySelector("#contact");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
  powerPreference: "high-performance",
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x01050a, 0.027);

const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
pmrem.dispose();

const camera = new THREE.PerspectiveCamera(32, window.innerWidth / window.innerHeight, 0.1, 100);
const cameraTarget = new THREE.Vector3();

scene.add(new THREE.HemisphereLight(0xc9d9e5, 0x071018, 1.5));
const key = new THREE.DirectionalLight(0xffffff, 4.5);
key.position.set(5, 8, 9);
key.castShadow = true;
key.shadow.mapSize.set(1024, 1024);
scene.add(key);
const fill = new THREE.DirectionalLight(0x6fd3ff, 1.6);
fill.position.set(-5, 2, 6);
scene.add(fill);
const rim = new THREE.PointLight(0xe86f4e, 22, 18, 2);
rim.position.set(2.5, 3.5, -4.5);
scene.add(rim);

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(34, 24),
  new THREE.MeshStandardMaterial({ color: 0x03080d, metalness: 0.1, roughness: 0.88 })
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -2.24;
floor.receiveShadow = true;
scene.add(floor);

const modelRoot = new THREE.Group();
modelRoot.rotation.y = -0.08;
scene.add(modelRoot);

const componentGroups = new Map();
const materialStates = [];
const highlight = new THREE.Color(0x123244);

function componentFromName(name = "") {
  if (name.startsWith("Rack_") || name.startsWith("Installed_")) return "rack";
  if (name.startsWith("Exploded_Chassis_") || name.startsWith("Tray_") || name.startsWith("Cocometric_")) return "chassis";
  if (name.startsWith("Drive_")) return "storage";
  if (name === "Motherboard" || name.startsWith("CPU_") || name.startsWith("RAM_") || name.startsWith("IO_")) return "compute";
  if (name.startsWith("GPU_")) return "gpu";
  if (name.startsWith("Fan_")) return "cooling";
  if (name.startsWith("PSU_") || name.startsWith("NIC_")) return "power-network";
  return "chassis";
}

function ensureComponentGroup(component) {
  if (!componentGroups.has(component)) {
    const group = new THREE.Group();
    group.name = `component-${component}`;
    modelRoot.add(group);
    componentGroups.set(component, group);
  }
  return componentGroups.get(component);
}

function cloneMaterials(mesh, component) {
  const source = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
  const cloned = source.map((material) => {
    const next = material.clone();
    next.transparent = true;
    next.opacity = material.opacity ?? 1;
    next.depthWrite = true;
    materialStates.push({
      material: next,
      component,
      originalOpacity: material.opacity ?? 1,
      originalEmissive: next.emissive ? next.emissive.clone() : null,
      originalEmissiveIntensity: next.emissiveIntensity ?? 0,
    });
    return next;
  });
  mesh.material = Array.isArray(mesh.material) ? cloned : cloned[0];
}

async function embeddedModelUrl(encoded) {
  if (!("DecompressionStream" in window)) throw new Error("This browser cannot decompress the embedded model.");
  const binary = window.atob(encoded);
  const compressed = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) compressed[i] = binary.charCodeAt(i);
  const stream = new Blob([compressed]).stream().pipeThrough(new DecompressionStream("gzip"));
  const modelBlob = await new Response(stream).blob();
  return URL.createObjectURL(new Blob([modelBlob], { type: "model/gltf-binary" }));
}

async function loadModel() {
  const modelUrl = await embeddedModelUrl(modelGzipBase64);
  const loader = new GLTFLoader();
  loader.load(
    modelUrl,
    (gltf) => {
      modelRoot.add(gltf.scene);
      modelRoot.updateMatrixWorld(true);
      const meshes = [];
      gltf.scene.traverse((object) => {
        if (object.isMesh) meshes.push(object);
      });
      meshes.forEach((mesh) => {
        const component = componentFromName(mesh.name);
        cloneMaterials(mesh, component);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        ensureComponentGroup(component).attach(mesh);
      });
      gltf.scene.removeFromParent();
      modelRoot.scale.setScalar(window.innerWidth <= 820 ? 0.84 : 1);
      URL.revokeObjectURL(modelUrl);
      loading.classList.add("is-hidden");
    },
    (event) => {
      if (!event.total) return;
      const progress = Math.max(8, Math.min(100, (event.loaded / event.total) * 100));
      loadingBar.style.width = `${progress}%`;
    },
    (error) => {
      console.error("Unable to load Cocometric server model", error);
      URL.revokeObjectURL(modelUrl);
      loadingCopy.textContent = "3D model unavailable — service details remain below";
      loadingBar.style.width = "100%";
      window.setTimeout(() => loading.classList.add("is-hidden"), 1400);
    }
  );
}

loadModel().catch((error) => {
  console.error("Unable to prepare Cocometric server model", error);
  loadingCopy.textContent = "3D model unavailable — service details remain below";
  loadingBar.style.width = "100%";
  window.setTimeout(() => loading.classList.add("is-hidden"), 1400);
});

function clamp(value, min = 0, max = 1) {
  return Math.max(min, Math.min(max, value));
}

function smooth(value) {
  const x = clamp(value);
  return x * x * (3 - 2 * x);
}

function stageFloat() {
  return clamp(window.scrollY / Math.max(1, window.innerHeight), 0, stages.length - 1);
}

function renderStageText(index) {
  const stage = stages[index];
  stageStep.textContent = stage.eyebrow;
  stageTitle.textContent = stage.title;
  stageNote.textContent = stage.note;
  stageTags.replaceChildren(...stage.tags.map((tag) => {
    const element = document.createElement("span");
    element.textContent = tag;
    return element;
  }));
  stageButtons.forEach((button, buttonIndex) => button.classList.toggle("is-active", buttonIndex === index));
}

stageButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const index = Number(button.dataset.stageButton);
    window.scrollTo({ top: index * window.innerHeight, behavior: reduceMotion ? "auto" : "smooth" });
  });
});

let activeStage = -1;
function resize() {
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.fov = window.innerWidth <= 820 ? 42 : 32;
  camera.updateProjectionMatrix();
  modelRoot.scale.setScalar(window.innerWidth <= 820 ? 0.84 : 1);
}
window.addEventListener("resize", resize);
resize();

const camA = new THREE.Vector3();
const camB = new THREE.Vector3();
const targetA = new THREE.Vector3();
const targetB = new THREE.Vector3();

function animate(time) {
  window.requestAnimationFrame(animate);

  const value = stageFloat();
  const fromIndex = Math.floor(value);
  const toIndex = Math.min(stages.length - 1, fromIndex + 1);
  const blend = smooth(value - fromIndex);
  const from = stages[fromIndex];
  const to = stages[toIndex];
  const nearest = Math.round(value);

  if (nearest !== activeStage) {
    activeStage = nearest;
    renderStageText(nearest);
  }

  camA.fromArray(from.camera);
  camB.fromArray(to.camera);
  targetA.fromArray(from.target);
  targetB.fromArray(to.target);
  camera.position.lerpVectors(camA, camB, blend);
  cameraTarget.lerpVectors(targetA, targetB, blend);

  if (window.innerWidth <= 820) {
    camera.position.multiplyScalar(1.24);
    cameraTarget.y += 0.42;
  }
  camera.lookAt(cameraTarget);

  const focusSet = new Set(nearest === 0 ? [...componentGroups.keys()] : stages[nearest].focus);
  const contextSet = new Set(stages[nearest].context);

  componentGroups.forEach((group, component) => {
    const selected = focusSet.has(component);
    const targetOffset = selected && nearest !== 0 ? componentOffsets[component] : new THREE.Vector3();
    group.position.lerp(targetOffset, reduceMotion ? 1 : 0.085);
    const targetScale = selected && nearest !== 0 ? 1.035 : 1;
    const scale = THREE.MathUtils.lerp(group.scale.x, targetScale, reduceMotion ? 1 : 0.085);
    group.scale.setScalar(scale);
  });

  materialStates.forEach((state) => {
    const overview = nearest === 0;
    const selected = focusSet.has(state.component);
    const context = contextSet.has(state.component);
    const targetOpacity = overview
      ? state.originalOpacity
      : selected
        ? state.originalOpacity
        : context
          ? Math.min(state.originalOpacity, 0.26)
          : Math.min(state.originalOpacity, 0.09);
    state.material.opacity = THREE.MathUtils.lerp(state.material.opacity, targetOpacity, reduceMotion ? 1 : 0.1);
    if (state.material.emissive && state.originalEmissive) {
      const targetEmissive = selected && !overview ? highlight : state.originalEmissive;
      state.material.emissive.lerp(targetEmissive, reduceMotion ? 1 : 0.08);
      const intensity = selected && !overview ? Math.max(state.originalEmissiveIntensity, 0.24) : state.originalEmissiveIntensity;
      state.material.emissiveIntensity = THREE.MathUtils.lerp(state.material.emissiveIntensity, intensity, reduceMotion ? 1 : 0.08);
    }
  });

  if (!reduceMotion) modelRoot.rotation.y = -0.08 + Math.sin(time * 0.00018) * 0.025;

  const finalRect = finalSection.getBoundingClientRect();
  const finalFade = clamp(1 - finalRect.top / window.innerHeight);
  sceneElement.style.opacity = String(clamp(1 - finalFade * 0.82));
  copy.style.opacity = String(clamp(1 - finalFade * 1.25));
  scrollCue.style.opacity = window.scrollY < window.innerHeight * 0.35 ? "1" : "0";

  renderer.render(scene, camera);
}

renderStageText(0);
window.requestAnimationFrame(animate);
