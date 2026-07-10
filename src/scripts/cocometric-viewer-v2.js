import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import modelPart0 from "../data/cocometric-model/part-0.js";
import modelPart1 from "../data/cocometric-model/part-1.js";
import modelPart2 from "../data/cocometric-model/part-2.js";
import modelPart3 from "../data/cocometric-model/part-3.js";
import modelPart4 from "../data/cocometric-model/part-4.js";
import modelPart5 from "../data/cocometric-model/part-5.js";

const encodedModel = [modelPart0, modelPart1, modelPart2, modelPart3, modelPart4, modelPart5].join("");
const mobileQuery = window.matchMedia("(max-width: 820px)");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isMobile = () => mobileQuery.matches;

const stages = [
  { step: "Cocometric system · 01", title: "One system. Every layer visible.", note: "Inspect the rack, storage, compute, accelerators, cooling, power, and network hardware.", tags: ["Rack", "Storage", "Compute", "GPU"], focus: [], context: [], camera: [9.8, 5.7, 13.2], target: [0.15, 0, 0] },
  { step: "Rack + chassis · 02", title: "Built to be serviced and upgraded.", note: "Rails, chassis, service bays, and removable hardware keep the system accessible.", tags: ["Rack enclosure", "Rails", "Chassis", "Service bays"], focus: ["rack", "chassis"], context: [], camera: [-0.4, 3.5, 8.7], target: [-2.25, 0.05, 0] },
  { step: "Storage · 03", title: "Storage built around recovery.", note: "Six removable drives support primary data, snapshots, retention, and backup tiers.", tags: ["6 removable drives", "Snapshots", "Retention", "Restore tests"], focus: ["storage"], context: ["chassis"], camera: [7, 4, 8.5], target: [3.35, 1.12, 0] },
  { step: "Compute · 04", title: "General compute for the local stack.", note: "Processors, memory, motherboard, and I/O run databases, indexing, automation, and internal services.", tags: ["Dual CPU", "12 memory modules", "Motherboard", "I/O"], focus: ["compute"], context: ["chassis"], camera: [4.3, 3, 7], target: [0.05, 0.55, 0.05] },
  { step: "AI accelerators · 05", title: "Local inference without sending data away.", note: "Two GPU assemblies provide capacity for retrieval, OCR, image processing, and private model workloads.", tags: ["2 GPU assemblies", "Local models", "OCR", "Private retrieval"], focus: ["gpu"], context: ["chassis"], camera: [4.1, -0.1, 6.8], target: [0.25, -1.45, 0.08] },
  { step: "Cooling · 06", title: "Airflow designed into the system.", note: "Six fan assemblies and a dedicated fan wall move heat through the chassis under sustained load.", tags: ["6 fan assemblies", "Fan wall", "Directed airflow", "Sustained load"], focus: ["cooling"], context: ["chassis"], camera: [5.8, 2.5, 7], target: [2.2, 0.12, 0.1] },
  { step: "Power + network · 07", title: "Redundant power and controlled access.", note: "Dual power modules and dedicated networking support reliable operation and secure service routing.", tags: ["Dual PSU", "3-port NIC", "Segmentation", "Secure access"], focus: ["power-network"], context: ["chassis"], camera: [6.7, 0.8, 7.7], target: [3, -1.15, 0.18] },
];

const elements = {
  body: document.body,
  canvas: document.querySelector("#server-canvas"),
  loading: document.querySelector("#loading"),
  loadingBar: document.querySelector("#loading-bar"),
  loadingTrack: document.querySelector("#loading-track"),
  loadingCopy: document.querySelector("#loading-copy"),
  scene: document.querySelector("#scene"),
  copy: document.querySelector("#copy"),
  cue: document.querySelector("#scroll-cue"),
  nav: document.querySelector(".stage-nav"),
  step: document.querySelector("#stage-step"),
  title: document.querySelector("#stage-title"),
  note: document.querySelector("#stage-note"),
  tags: document.querySelector("#stage-tags"),
  beats: [...document.querySelectorAll(".beat")],
  buttons: [...document.querySelectorAll("[data-stage-button]")],
  final: document.querySelector("#contact"),
};

function clamp(value, min = 0, max = 1) { return Math.max(min, Math.min(max, value)); }
function decodeBase64(value) {
  const binary = window.atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function decompressModel() {
  if (!("DecompressionStream" in window)) throw new Error("This browser cannot load the interactive model.");
  const compressed = decodeBase64(encodedModel);
  const stream = new Blob([compressed]).stream().pipeThrough(new DecompressionStream("gzip"));
  const buffer = await new Response(stream).arrayBuffer();
  if (buffer.byteLength < 12) throw new Error("The model is incomplete.");
  const header = new DataView(buffer, 0, 12);
  if (header.getUint32(0, true) !== 0x46546c67 || header.getUint32(4, true) !== 2 || header.getUint32(8, true) !== buffer.byteLength) throw new Error("The model failed validation.");
  return buffer;
}

function setProgress(value, message) {
  const progress = Math.round(clamp(value, 0, 100));
  elements.loadingBar.style.width = `${progress}%`;
  elements.loadingTrack.setAttribute("aria-valuenow", String(progress));
  if (message) elements.loadingCopy.textContent = message;
}

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

function addRealisticDetails(root, bounds) {
  const size = bounds.getSize(new THREE.Vector3());
  const center = bounds.getCenter(new THREE.Vector3());
  const frontZ = bounds.max.z + 0.035;
  const metal = new THREE.MeshStandardMaterial({ color: 0x18222b, metalness: 0.82, roughness: 0.3 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x06090c, metalness: 0.55, roughness: 0.42 });
  const led = new THREE.MeshStandardMaterial({ color: 0x5bd6ff, emissive: 0x1b91ba, emissiveIntensity: 2.2, metalness: 0.1, roughness: 0.25 });

  const railGeometry = new THREE.BoxGeometry(size.x * 0.9, 0.035, 0.045);
  for (const y of [bounds.min.y + 0.08, bounds.max.y - 0.08]) {
    const rail = new THREE.Mesh(railGeometry, metal);
    rail.position.set(center.x, y, frontZ);
    root.add(rail);
  }

  const handleGeometry = new THREE.BoxGeometry(0.08, Math.min(0.56, size.y * 0.28), 0.07);
  for (const x of [bounds.min.x + 0.16, bounds.max.x - 0.16]) {
    const handle = new THREE.Mesh(handleGeometry, metal);
    handle.position.set(x, center.y, frontZ + 0.02);
    root.add(handle);
  }

  const ventGeometry = new THREE.BoxGeometry(Math.max(0.12, size.x * 0.035), 0.018, 0.025);
  const ventCount = isMobile() ? 12 : 22;
  const ventMesh = new THREE.InstancedMesh(ventGeometry, dark, ventCount);
  const matrix = new THREE.Matrix4();
  for (let i = 0; i < ventCount; i += 1) {
    const x = bounds.min.x + size.x * (0.2 + (i % Math.ceil(ventCount / 2)) * 0.055);
    const y = center.y + (i < Math.ceil(ventCount / 2) ? -0.16 : 0.16);
    matrix.makeTranslation(x, y, frontZ + 0.025);
    ventMesh.setMatrixAt(i, matrix);
  }
  root.add(ventMesh);

  const screwGeometry = new THREE.CylinderGeometry(0.025, 0.025, 0.018, isMobile() ? 8 : 16);
  screwGeometry.rotateX(Math.PI / 2);
  const screwMesh = new THREE.InstancedMesh(screwGeometry, metal, 8);
  const screwPoints = [
    [bounds.min.x + 0.09, bounds.min.y + 0.09], [bounds.max.x - 0.09, bounds.min.y + 0.09],
    [bounds.min.x + 0.09, bounds.max.y - 0.09], [bounds.max.x - 0.09, bounds.max.y - 0.09],
    [center.x - size.x * 0.22, bounds.min.y + 0.09], [center.x + size.x * 0.22, bounds.min.y + 0.09],
    [center.x - size.x * 0.22, bounds.max.y - 0.09], [center.x + size.x * 0.22, bounds.max.y - 0.09],
  ];
  screwPoints.forEach(([x, y], i) => { matrix.makeTranslation(x, y, frontZ + 0.045); screwMesh.setMatrixAt(i, matrix); });
  root.add(screwMesh);

  const ledGeometry = new THREE.BoxGeometry(0.045, 0.045, 0.02);
  const ledMesh = new THREE.InstancedMesh(ledGeometry, led, 3);
  for (let i = 0; i < 3; i += 1) { matrix.makeTranslation(bounds.max.x - 0.34 + i * 0.075, bounds.max.y - 0.16, frontZ + 0.05); ledMesh.setMatrixAt(i, matrix); }
  root.add(ledMesh);
}

function renderStage(index) {
  const stage = stages[index];
  elements.step.textContent = stage.step;
  elements.title.textContent = stage.title;
  elements.note.textContent = stage.note;
  elements.tags.replaceChildren(...stage.tags.map((tag) => Object.assign(document.createElement("span"), { textContent: tag })));
  elements.buttons.forEach((button, i) => {
    button.classList.toggle("is-active", i === index);
    if (i === index) button.setAttribute("aria-current", "step"); else button.removeAttribute("aria-current");
  });
}

async function initialize() {
  if (Object.values(elements).some((value) => value == null)) throw new Error("The page is missing a required model element.");
  const mobile = isMobile();
  const lowPower = (navigator.hardwareConcurrency || 8) <= 4;
  const renderer = new THREE.WebGLRenderer({ canvas: elements.canvas, antialias: !mobile && !lowPower, alpha: true, powerPreference: mobile ? "low-power" : "high-performance" });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = mobile ? 1.12 : 1.05;
  renderer.shadowMap.enabled = !mobile && !lowPower;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x01050a, mobile ? 0.018 : 0.026);
  if (!mobile) {
    const pmrem = new THREE.PMREMGenerator(renderer);
    const environment = pmrem.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = environment.texture;
    pmrem.dispose();
  }

  scene.add(new THREE.HemisphereLight(0xc9d9e5, 0x071018, mobile ? 1.8 : 1.45));
  const key = new THREE.DirectionalLight(0xffffff, mobile ? 3.1 : 4.2);
  key.position.set(5, 8, 9);
  key.castShadow = renderer.shadowMap.enabled;
  key.shadow.mapSize.set(1024, 1024);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0x6fd3ff, mobile ? 1.1 : 1.55);
  fill.position.set(-5, 2, 6);
  scene.add(fill);
  const rim = new THREE.PointLight(0xe86f4e, mobile ? 8 : 20, 18, 2);
  rim.position.set(2.5, 3.5, -4.5);
  scene.add(rim);

  const camera = new THREE.PerspectiveCamera(mobile ? 44 : 32, innerWidth / innerHeight, 0.1, 100);
  const cameraTarget = new THREE.Vector3();
  const modelRoot = new THREE.Group();
  modelRoot.rotation.y = -0.08;
  scene.add(modelRoot);

  setProgress(30, "Preparing server model");
  const buffer = await decompressModel();
  setProgress(66, "Building hardware view");
  const gltf = await new Promise((resolve, reject) => new GLTFLoader().parse(buffer, "", resolve, reject));
  modelRoot.add(gltf.scene);
  modelRoot.updateMatrixWorld(true);

  const componentGroups = new Map();
  ["rack", "chassis", "storage", "compute", "gpu", "cooling", "power-network"].forEach((name) => {
    const group = new THREE.Group();
    group.name = `component-${name}`;
    modelRoot.add(group);
    componentGroups.set(name, group);
  });

  const materials = [];
  const meshes = [];
  gltf.scene.traverse((object) => { if (object.isMesh) meshes.push(object); });
  meshes.forEach((mesh) => {
    const component = componentFromName(mesh.name);
    const source = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
    const material = source.clone();
    material.transparent = !mobile;
    materials.push({ material, component, opacity: source.opacity ?? 1, emissive: material.emissive?.clone(), emissiveIntensity: material.emissiveIntensity || 0 });
    mesh.material = material;
    mesh.castShadow = renderer.shadowMap.enabled;
    mesh.receiveShadow = renderer.shadowMap.enabled;
    componentGroups.get(component).attach(mesh);
  });
  gltf.scene.removeFromParent();

  const bounds = new THREE.Box3().setFromObject(modelRoot);
  addRealisticDetails(componentGroups.get("chassis"), bounds);

  const stageCamera = new THREE.Vector3();
  const stageTarget = new THREE.Vector3();
  let activeStage = 0;
  let dirty = true;
  let raf = 0;

  function resize() {
    const phone = isMobile();
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, phone ? 1.25 : 1.75));
    renderer.setSize(innerWidth, innerHeight, false);
    camera.aspect = innerWidth / innerHeight;
    camera.fov = phone ? 44 : 32;
    camera.updateProjectionMatrix();
    modelRoot.scale.setScalar(phone ? 0.82 : 1);
    dirty = true;
    requestFrame();
  }

  function stageIndex() {
    const beat = elements.beats[0];
    if (!beat) return 0;
    const value = clamp((scrollY - beat.offsetTop) / Math.max(1, beat.offsetHeight), 0, stages.length - 1);
    return Math.round(value);
  }

  function applyStage(index) {
    activeStage = index;
    renderStage(index);
    stageCamera.fromArray(stages[index].camera);
    stageTarget.fromArray(stages[index].target);
    if (isMobile()) {
      stageCamera.multiplyScalar(1.22);
      stageTarget.y += 0.35;
    }
    const focus = new Set(stages[index].focus);
    const context = new Set(stages[index].context);
    componentGroups.forEach((group, component) => {
      if (isMobile()) {
        group.visible = index === 0 || focus.has(component) || context.has(component);
        group.position.set(0, 0, 0);
        group.scale.setScalar(1);
      } else {
        group.visible = true;
      }
    });
    materials.forEach((state) => {
      if (isMobile()) return;
      const overview = index === 0;
      const selected = focus.has(state.component);
      const contextual = context.has(state.component);
      const opacity = overview || selected ? state.opacity : contextual ? Math.min(state.opacity, 0.28) : Math.min(state.opacity, 0.08);
      state.material.opacity = opacity;
      state.material.depthWrite = opacity > 0.9;
      if (state.material.emissive && state.emissive) {
        state.material.emissive.copy(selected && !overview ? new THREE.Color(0x123244) : state.emissive);
        state.material.emissiveIntensity = selected && !overview ? Math.max(state.emissiveIntensity, 0.22) : state.emissiveIntensity;
      }
    });
    dirty = true;
    requestFrame();
  }

  function draw() {
    raf = 0;
    const smoothing = reducedMotion ? 1 : isMobile() ? 0.22 : 0.14;
    camera.position.lerp(stageCamera, smoothing);
    cameraTarget.lerp(stageTarget, smoothing);
    camera.lookAt(cameraTarget);
    const settled = camera.position.distanceToSquared(stageCamera) < 0.0005 && cameraTarget.distanceToSquared(stageTarget) < 0.0005;
    const finalRect = elements.final.getBoundingClientRect();
    const finalFade = clamp(1 - finalRect.top / innerHeight);
    elements.scene.style.opacity = String(clamp(1 - finalFade));
    elements.copy.style.opacity = String(clamp(1 - finalFade * 1.3));
    elements.nav.style.opacity = String(clamp(1 - finalFade * 1.4));
    elements.cue.style.opacity = scrollY < innerHeight * 0.35 ? "1" : "0";
    renderer.render(scene, camera);
    dirty = false;
    if (!settled) requestFrame();
  }

  function requestFrame() {
    if (!raf) raf = requestAnimationFrame(draw);
  }

  let scrollFrame = 0;
  addEventListener("scroll", () => {
    if (scrollFrame) return;
    scrollFrame = requestAnimationFrame(() => {
      scrollFrame = 0;
      const next = stageIndex();
      if (next !== activeStage) applyStage(next); else requestFrame();
    });
  }, { passive: true });

  let resizeFrame = 0;
  addEventListener("resize", () => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(resize);
  });

  elements.buttons.forEach((button) => button.addEventListener("click", () => {
    const index = Number(button.dataset.stageButton);
    const target = elements.beats[index];
    if (target) scrollTo({ top: target.offsetTop, behavior: reducedMotion ? "auto" : "smooth" });
  }));

  resize();
  applyStage(0);
  elements.body.dataset.modelStatus = "ready";
  setProgress(100, "Cocometric hardware ready");
  setTimeout(() => { elements.loading.classList.add("is-hidden"); elements.loading.setAttribute("aria-hidden", "true"); }, 160);
}

renderStage(0);
initialize().catch((error) => {
  console.error(error);
  elements.body.dataset.modelStatus = "error";
  elements.scene?.classList.add("is-unavailable");
  setProgress(100, "Interactive model unavailable");
  setTimeout(() => { elements.loading?.classList.add("is-hidden"); }, 900);
});
