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
  { eyebrow: "Cocometric system · 01", title: "One system. Every layer visible.", note: "Scroll through the server to pull each hardware layer out of the rack and inspect it.", tags: ["Rack", "Storage", "Compute", "GPU"], focus: [], context: [], camera: [9.8, 5.7, 13.2], target: [0.15, 0, 0] },
  { eyebrow: "Rack + chassis · 02", title: "A serviceable system, not a sealed appliance.", note: "The chassis slides straight out of the rack on a clear service path.", tags: ["Rack enclosure", "Chassis", "Service bays", "Replaceable hardware"], focus: ["chassis"], context: ["rack"], camera: [5.8, 3.5, 10.8], target: [0.15, 0.05, 1.5] },
  { eyebrow: "Storage · 03", title: "Storage built around recovery.", note: "The removable drive layer clears the rack face before it is presented for inspection.", tags: ["6 removable drives", "Snapshots", "Retention", "Restore tests"], focus: ["storage"], context: ["rack", "chassis"], camera: [6.8, 3.8, 10.4], target: [0.8, 1.0, 1.7] },
  { eyebrow: "Compute · 04", title: "General compute for the whole local stack.", note: "Processors, memory, motherboard, and I/O move forward as one assembly and remain outside the rack.", tags: ["Dual CPU", "12 memory modules", "Motherboard", "I/O"], focus: ["compute"], context: ["rack", "chassis"], camera: [6.4, 3.3, 9.8], target: [0.2, 0.65, 1.9] },
  { eyebrow: "AI accelerators · 05", title: "Local inference without sending data away.", note: "The GPU assemblies slide fully clear of the chassis before the camera settles on them.", tags: ["2 GPU assemblies", "Local models", "OCR", "Private retrieval"], focus: ["gpu"], context: ["rack", "chassis"], camera: [6.3, 1.3, 9.7], target: [0.35, -1.2, 2.0] },
  { eyebrow: "Cooling · 06", title: "Airflow designed as part of the system.", note: "The fan wall moves forward on the service axis instead of intersecting the rack structure.", tags: ["6 fan assemblies", "Fan wall", "Directed airflow", "Sustained load"], focus: ["cooling"], context: ["rack", "chassis"], camera: [6.8, 2.7, 10.2], target: [1.25, 0.1, 1.9] },
  { eyebrow: "Power + network · 07", title: "Redundant power and controlled access.", note: "Power and network hardware clear the rack before separating slightly for inspection.", tags: ["Dual PSU", "3-port NIC", "Segmentation", "Secure access"], focus: ["power-network"], context: ["rack", "chassis"], camera: [7.0, 1.6, 10.2], target: [1.15, -1.15, 2.0] },
];

const componentNames = ["rack", "chassis", "storage", "compute", "gpu", "cooling", "power-network"];
const body = document.body;
const canvas = document.querySelector("#server-canvas");
const loading = document.querySelector("#loading");
const loadingBar = document.querySelector("#loading-bar");
const loadingTrack = document.querySelector("#loading-track");
const loadingCopy = document.querySelector("#loading-copy");
const sceneElement = document.querySelector("#scene");
const copy = document.querySelector("#copy");
const scrollCue = document.querySelector("#scroll-cue");
const stageNav = document.querySelector(".stage-nav");
const stageStep = document.querySelector("#stage-step");
const stageTitle = document.querySelector("#stage-title");
const stageNote = document.querySelector("#stage-note");
const stageTags = document.querySelector("#stage-tags");
const stageButtons = [...document.querySelectorAll("[data-stage-button]")];
const beats = [...document.querySelectorAll(".beat")];
const finalSection = document.querySelector("#contact");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isMobile = () => window.innerWidth <= 820;

function clamp(value, min = 0, max = 1) { return Math.max(min, Math.min(max, value)); }
function smooth(value) { const x = clamp(value); return x * x * (3 - 2 * x); }
function dampFactor(speed, deltaSeconds) { return reduceMotion ? 1 : 1 - Math.exp(-speed * deltaSeconds); }

function setLoadingProgress(value, message) {
  const progress = Math.round(clamp(value, 0, 100));
  loadingBar.style.width = `${progress}%`;
  loadingTrack.setAttribute("aria-valuenow", String(progress));
  if (message) loadingCopy.textContent = message;
}

function hideLoading() {
  setLoadingProgress(100);
  window.setTimeout(() => {
    loading.classList.add("is-hidden");
    loading.setAttribute("aria-hidden", "true");
  }, 180);
}

function showModelFailure(message) {
  body.dataset.modelStatus = "error";
  sceneElement.classList.add("is-unavailable");
  setLoadingProgress(100, message);
  window.setTimeout(hideLoading, 900);
}

function stageFloat() {
  const firstBeat = beats[0];
  if (!firstBeat) return 0;
  const stageHeight = Math.max(1, firstBeat.offsetHeight);
  return clamp((window.scrollY - firstBeat.offsetTop) / stageHeight, 0, stages.length - 1);
}

function inspectionWeight(value, index) {
  const distance = Math.abs(value - index);
  if (distance <= 0.24) return 1;
  if (distance >= 0.48) return 0;
  return smooth((0.48 - distance) / 0.24);
}

function componentWeight(value, component, key) {
  let weight = 0;
  stages.forEach((stage, index) => {
    if (stage[key]?.includes(component)) weight = Math.max(weight, inspectionWeight(value, index));
  });
  return weight;
}

let activeStage = -1;
function renderStageText(index) {
  const stage = stages[index];
  if (!stage) return;
  stageStep.textContent = stage.eyebrow;
  stageTitle.textContent = stage.title;
  stageNote.textContent = stage.note;
  stageTags.replaceChildren(...stage.tags.map((tag) => Object.assign(document.createElement("span"), { textContent: tag })));
  stageButtons.forEach((button, buttonIndex) => {
    const isActive = buttonIndex === index;
    button.classList.toggle("is-active", isActive);
    if (isActive) button.setAttribute("aria-current", "step");
    else button.removeAttribute("aria-current");
  });
}

function updateActiveStage() {
  const nearest = Math.round(stageFloat());
  if (nearest !== activeStage) {
    activeStage = nearest;
    renderStageText(nearest);
  }
  return nearest;
}

stageButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const target = beats[Number(button.dataset.stageButton)];
    if (target) window.scrollTo({ top: target.offsetTop, behavior: reduceMotion ? "auto" : "smooth" });
  });
});
renderStageText(0);

function decodeBase64(encoded) {
  const binary = window.atob(encoded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

async function decompressModel(encoded) {
  if (!("DecompressionStream" in window)) throw new Error("This browser cannot load the interactive model.");
  setLoadingProgress(26, "Preparing Cocometric hardware");
  const compressed = decodeBase64(encoded);
  setLoadingProgress(48, "Decompressing server model");
  const stream = new Blob([compressed]).stream().pipeThrough(new DecompressionStream("gzip"));
  const arrayBuffer = await new Response(stream).arrayBuffer();
  if (arrayBuffer.byteLength < 12) throw new Error("The embedded GLB model is incomplete.");
  const header = new DataView(arrayBuffer, 0, 12);
  if (header.getUint32(0, true) !== 0x46546c67 || header.getUint32(4, true) !== 2 || header.getUint32(8, true) !== arrayBuffer.byteLength) {
    throw new Error("The embedded GLB model failed validation.");
  }
  return arrayBuffer;
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

function extractionOffset(component, componentBounds, rackBounds, rackSize) {
  const rearToFrontClearance = Math.max(0, rackBounds.max.z - componentBounds.min.z);
  const marginByComponent = {
    chassis: rackSize.z * 0.34,
    storage: rackSize.z * 0.52,
    compute: rackSize.z * 0.58,
    gpu: rackSize.z * 0.62,
    cooling: rackSize.z * 0.54,
    "power-network": rackSize.z * 0.6,
  };
  const presentationOffset = {
    chassis: [0, 0, 0],
    storage: [rackSize.x * 0.18, rackSize.y * 0.06, 0],
    compute: [-rackSize.x * 0.08, rackSize.y * 0.16, 0],
    gpu: [rackSize.x * 0.08, -rackSize.y * 0.1, 0],
    cooling: [rackSize.x * 0.22, 0, 0],
    "power-network": [rackSize.x * 0.22, -rackSize.y * 0.08, 0],
  };
  const [x, y] = presentationOffset[component] || [0, 0];
  return new THREE.Vector3(x, y, rearToFrontClearance + (marginByComponent[component] || rackSize.z * 0.5));
}

async function initializeViewer() {
  const required = [canvas, loading, loadingBar, loadingTrack, loadingCopy, sceneElement, copy, scrollCue, stageNav, stageStep, stageTitle, stageNote, stageTags, finalSection];
  if (required.some((element) => !element)) throw new Error("The Cocometric page is missing a required viewer element.");

  const mobile = isMobile();
  const lowPowerDevice = (navigator.hardwareConcurrency || 8) <= 4;
  const enableShadows = !mobile && !lowPowerDevice;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !mobile && !lowPowerDevice, alpha: true, powerPreference: mobile ? "low-power" : "high-performance" });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = mobile ? 1.08 : 1.04;
  renderer.shadowMap.enabled = enableShadows;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x01050a, mobile ? 0.018 : 0.024);
  let environmentTarget = null;
  if (!mobile && !lowPowerDevice) {
    const pmrem = new THREE.PMREMGenerator(renderer);
    environmentTarget = pmrem.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = environmentTarget.texture;
    pmrem.dispose();
  }

  const camera = new THREE.PerspectiveCamera(32, window.innerWidth / window.innerHeight, 0.1, 100);
  const cameraTarget = new THREE.Vector3();
  scene.add(new THREE.HemisphereLight(0xc9d9e5, 0x071018, mobile ? 1.7 : 1.45));
  const key = new THREE.DirectionalLight(0xffffff, mobile ? 3.4 : 4.2);
  key.position.set(5, 8, 9);
  key.castShadow = enableShadows;
  key.shadow.mapSize.set(1024, 1024);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0x6fd3ff, mobile ? 1.15 : 1.55);
  fill.position.set(-5, 2, 6);
  scene.add(fill);
  const rim = new THREE.PointLight(0xe86f4e, mobile ? 9 : 20, 18, 2);
  rim.position.set(2.5, 3.5, -4.5);
  scene.add(rim);

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(34, 24), new THREE.MeshStandardMaterial({ color: 0x02070c, metalness: 0.08, roughness: 0.9 }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -2.24;
  floor.receiveShadow = enableShadows;
  scene.add(floor);

  const modelRoot = new THREE.Group();
  modelRoot.rotation.y = -0.08;
  scene.add(modelRoot);

  const componentGroups = new Map();
  componentNames.forEach((component) => {
    const group = new THREE.Group();
    group.name = `component-${component}`;
    modelRoot.add(group);
    componentGroups.set(component, group);
  });

  const materialStates = [];
  const materialCache = new WeakMap();
  const highlight = new THREE.Color(0x123244);
  function materialForComponent(material, component) {
    let componentMap = materialCache.get(material);
    if (!componentMap) { componentMap = new Map(); materialCache.set(material, componentMap); }
    if (componentMap.has(component)) return componentMap.get(component);
    const cloned = material.clone();
    cloned.transparent = true;
    materialStates.push({ material: cloned, component, originalOpacity: material.opacity ?? 1, originalEmissive: cloned.emissive ? cloned.emissive.clone() : null, originalEmissiveIntensity: cloned.emissiveIntensity ?? 0 });
    componentMap.set(component, cloned);
    return cloned;
  }

  const modelBuffer = await decompressModel(modelGzipBase64);
  setLoadingProgress(72, "Building assembled server view");
  const gltf = await new Promise((resolve, reject) => new GLTFLoader().parse(modelBuffer, "", resolve, reject));
  modelRoot.add(gltf.scene);
  modelRoot.updateMatrixWorld(true);

  const meshes = [];
  gltf.scene.traverse((object) => { if (object.isMesh) meshes.push(object); });
  meshes.forEach((mesh) => {
    const component = componentFromName(mesh.name);
    const sourceMaterials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    const materials = sourceMaterials.map((material) => materialForComponent(material, component));
    mesh.material = Array.isArray(mesh.material) ? materials : materials[0];
    if (!mesh.geometry.boundingSphere) mesh.geometry.computeBoundingSphere();
    const radius = mesh.geometry.boundingSphere?.radius || 0;
    mesh.castShadow = enableShadows && radius > 0.08;
    mesh.receiveShadow = enableShadows;
    componentGroups.get(component).attach(mesh);
  });
  gltf.scene.removeFromParent();
  modelRoot.updateMatrixWorld(true);

  const rackGroup = componentGroups.get("rack");
  const rackBounds = new THREE.Box3().setFromObject(rackGroup);
  const rackSize = rackBounds.getSize(new THREE.Vector3());
  const assembledPositions = new Map();
  const extractedPositions = new Map();

  componentGroups.forEach((group, component) => {
    const assembled = new THREE.Vector3(0, 0, 0);
    assembledPositions.set(component, assembled);
    if (component === "rack") {
      extractedPositions.set(component, assembled.clone());
      return;
    }
    const componentBounds = new THREE.Box3().setFromObject(group);
    extractedPositions.set(component, extractionOffset(component, componentBounds, rackBounds, rackSize));
    group.position.copy(assembled);
  });

  body.dataset.modelStatus = "ready";
  setLoadingProgress(100, "Cocometric hardware ready");
  hideLoading();

  const camA = new THREE.Vector3();
  const camB = new THREE.Vector3();
  const targetA = new THREE.Vector3();
  const targetB = new THREE.Vector3();
  const targetPosition = new THREE.Vector3();
  const clock = new THREE.Clock();

  function resize() {
    const phone = isMobile();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, phone ? 1.2 : 1.75));
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.fov = phone ? 44 : 32;
    camera.updateProjectionMatrix();
    modelRoot.scale.setScalar(phone ? 0.8 : 1);
  }
  window.addEventListener("resize", resize, { passive: true });
  resize();

  let animationFrame = 0;
  let running = false;
  function render(time) {
    if (!running) return;
    const delta = Math.min(clock.getDelta(), 0.05);
    const value = stageFloat();
    const fromIndex = Math.floor(value);
    const toIndex = Math.min(stages.length - 1, fromIndex + 1);
    const blend = smooth(value - fromIndex);
    const from = stages[fromIndex];
    const to = stages[toIndex];
    updateActiveStage();

    camA.fromArray(from.camera);
    camB.fromArray(to.camera);
    targetA.fromArray(from.target);
    targetB.fromArray(to.target);
    camera.position.lerpVectors(camA, camB, blend);
    cameraTarget.lerpVectors(targetA, targetB, blend);
    if (isMobile()) { camera.position.multiplyScalar(1.25); cameraTarget.y += 0.38; }
    camera.lookAt(cameraTarget);

    const overviewWeight = smooth(clamp(1 - value));
    componentGroups.forEach((group, component) => {
      if (component === "rack") return;
      const focusWeight = componentWeight(value, component, "focus");
      targetPosition.lerpVectors(assembledPositions.get(component), extractedPositions.get(component), focusWeight);
      group.position.lerp(targetPosition, dampFactor(9.5, delta));
      const targetScale = 1 + focusWeight * 0.018;
      group.scale.setScalar(THREE.MathUtils.lerp(group.scale.x, targetScale, dampFactor(8, delta)));
    });

    materialStates.forEach((state) => {
      const focusWeight = componentWeight(value, state.component, "focus");
      const contextWeight = componentWeight(value, state.component, "context");
      const rackOpacity = state.component === "rack" ? 1 : 0;
      const visibility = Math.max(rackOpacity, overviewWeight, focusWeight, contextWeight * 0.5, 0.08);
      const targetOpacity = state.originalOpacity * visibility;
      state.material.opacity = THREE.MathUtils.lerp(state.material.opacity, targetOpacity, dampFactor(10, delta));
      state.material.depthWrite = targetOpacity > 0.9;
      if (state.material.emissive && state.originalEmissive) {
        state.material.emissive.lerp(focusWeight > 0.08 ? highlight : state.originalEmissive, dampFactor(8, delta));
        const targetIntensity = focusWeight > 0.08 ? Math.max(state.originalEmissiveIntensity, 0.2 * focusWeight) : state.originalEmissiveIntensity;
        state.material.emissiveIntensity = THREE.MathUtils.lerp(state.material.emissiveIntensity, targetIntensity, dampFactor(8, delta));
      }
    });

    if (!reduceMotion) modelRoot.rotation.y = -0.08 + Math.sin(time * 0.00018) * 0.012;
    const finalRect = finalSection.getBoundingClientRect();
    const finalFade = clamp(1 - finalRect.top / window.innerHeight);
    sceneElement.style.opacity = String(clamp(1 - finalFade));
    copy.style.opacity = String(clamp(1 - finalFade * 1.3));
    stageNav.style.opacity = String(clamp(1 - finalFade * 1.4));
    scrollCue.style.opacity = window.scrollY < window.innerHeight * 0.35 ? "1" : "0";
    renderer.render(scene, camera);
    animationFrame = window.requestAnimationFrame(render);
  }

  function startRendering() { if (!running) { running = true; clock.start(); animationFrame = window.requestAnimationFrame(render); } }
  function stopRendering() { running = false; if (animationFrame) window.cancelAnimationFrame(animationFrame); animationFrame = 0; clock.stop(); }
  document.addEventListener("visibilitychange", () => { if (document.hidden) stopRendering(); else startRendering(); });
  window.addEventListener("pagehide", () => { stopRendering(); renderer.dispose(); environmentTarget?.dispose(); }, { once: true });
  startRendering();
}

initializeViewer().catch((error) => {
  console.error("Unable to initialize the Cocometric server viewer", error);
  showModelFailure(`3D model unavailable — ${error instanceof Error ? error.message : String(error)}`);
});
