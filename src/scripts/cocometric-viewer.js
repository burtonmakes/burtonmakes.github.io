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
  { eyebrow: "Cocometric system · 01", title: "One system. Every layer visible.", note: "Scroll through the server to focus on each hardware layer without pulling the system apart.", tags: ["Rack", "Storage", "Compute", "GPU"], focus: [], subject: "rack", view: [1.18, 0.7, 1.65] },
  { eyebrow: "Rack + chassis · 02", title: "A serviceable system, not a sealed appliance.", note: "The camera locks directly onto the chassis and rack structure while the complete system stays assembled.", tags: ["Rack enclosure", "Chassis", "Service bays", "Replaceable hardware"], focus: ["rack", "chassis"], subject: "chassis", view: [1.0, 0.58, 1.38] },
  { eyebrow: "Storage · 03", title: "Storage built around recovery.", note: "The camera centers the drive layer in place so its location and relationship to the chassis remain clear.", tags: ["6 removable drives", "Snapshots", "Retention", "Restore tests"], focus: ["storage"], subject: "storage", view: [1.05, 0.48, 1.32] },
  { eyebrow: "Compute · 04", title: "General compute for the whole local stack.", note: "Processors, memory, motherboard, and I/O remain seated while the camera centers on the compute assembly.", tags: ["Dual CPU", "12 memory modules", "Motherboard", "I/O"], focus: ["compute"], subject: "compute", view: [0.96, 0.5, 1.22] },
  { eyebrow: "AI accelerators · 05", title: "Local inference without sending data away.", note: "The accelerator assemblies are centered and isolated through lighting instead of exaggerated movement.", tags: ["2 GPU assemblies", "Local models", "OCR", "Private retrieval"], focus: ["gpu"], subject: "gpu", view: [0.98, 0.4, 1.22] },
  { eyebrow: "Cooling · 06", title: "Airflow designed as part of the system.", note: "The camera locks onto the fan wall and cooling assemblies while the surrounding hardware recedes visually.", tags: ["6 fan assemblies", "Fan wall", "Directed airflow", "Sustained load"], focus: ["cooling"], subject: "cooling", view: [1.02, 0.45, 1.28] },
  { eyebrow: "Power + network · 07", title: "Redundant power and controlled access.", note: "Power and network hardware are centered in their installed positions for a clear system view.", tags: ["Dual PSU", "3-port NIC", "Segmentation", "Secure access"], focus: ["power-network"], subject: "power-network", view: [1.06, 0.38, 1.3] },
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

function clamp(value, min = 0, max = 1) {
  return Math.max(min, Math.min(max, value));
}

function smooth(value) {
  const x = clamp(value);
  return x * x * (3 - 2 * x);
}

function dampFactor(speed, deltaSeconds) {
  return reduceMotion ? 1 : 1 - Math.exp(-speed * deltaSeconds);
}

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

function rawStageValue() {
  const firstBeat = beats[0];
  if (!firstBeat) return 0;
  const stageHeight = Math.max(1, firstBeat.offsetHeight);
  return clamp((window.scrollY - firstBeat.offsetTop) / stageHeight, 0, stages.length - 1);
}

function stageWeight(value, index) {
  const distance = Math.abs(value - index);
  if (distance <= 0.18) return 1;
  if (distance >= 0.72) return 0;
  return smooth((0.72 - distance) / 0.54);
}

function focusWeight(value, component) {
  let weight = 0;
  stages.forEach((stage, index) => {
    if (stage.focus.includes(component)) weight = Math.max(weight, stageWeight(value, index));
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

function updateActiveStage(value) {
  const nearest = Math.round(value);
  if (nearest !== activeStage) {
    activeStage = nearest;
    renderStageText(nearest);
  }
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

async function initializeViewer() {
  const required = [canvas, loading, loadingBar, loadingTrack, loadingCopy, sceneElement, copy, scrollCue, stageNav, stageStep, stageTitle, stageNote, stageTags, finalSection];
  if (required.some((element) => !element)) throw new Error("The Cocometric page is missing a required viewer element.");

  const mobile = isMobile();
  const lowPowerDevice = (navigator.hardwareConcurrency || 8) <= 4;
  const enableShadows = !mobile && !lowPowerDevice;
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: !mobile && !lowPowerDevice,
    alpha: true,
    powerPreference: "high-performance",
    preserveDrawingBuffer: false,
  });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = mobile ? 1.08 : 1.03;
  renderer.shadowMap.enabled = enableShadows;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x01050a, mobile ? 0.018 : 0.023);

  let environmentTarget = null;
  if (!mobile && !lowPowerDevice) {
    const pmrem = new THREE.PMREMGenerator(renderer);
    environmentTarget = pmrem.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = environmentTarget.texture;
    pmrem.dispose();
  }

  const camera = new THREE.PerspectiveCamera(32, window.innerWidth / window.innerHeight, 0.1, 100);
  const cameraTarget = new THREE.Vector3();
  const desiredCamera = new THREE.Vector3();
  const desiredTarget = new THREE.Vector3();
  const fromCamera = new THREE.Vector3();
  const toCamera = new THREE.Vector3();
  const fromTarget = new THREE.Vector3();
  const toTarget = new THREE.Vector3();

  scene.add(new THREE.HemisphereLight(0xc9d9e5, 0x071018, mobile ? 1.65 : 1.4));
  const key = new THREE.DirectionalLight(0xffffff, mobile ? 3.0 : 3.8);
  key.position.set(5, 8, 9);
  key.castShadow = enableShadows;
  key.shadow.mapSize.set(1024, 1024);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0x6fd3ff, mobile ? 0.95 : 1.3);
  fill.position.set(-5, 2, 6);
  scene.add(fill);
  const accent = new THREE.PointLight(0xe86f4e, mobile ? 5 : 10, 10, 2);
  scene.add(accent);

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(34, 24),
    new THREE.MeshStandardMaterial({ color: 0x02070c, metalness: 0.08, roughness: 0.9 })
  );
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
  const focusColor = new THREE.Color(0x19445a);
  function materialForComponent(material, component) {
    let componentMap = materialCache.get(material);
    if (!componentMap) {
      componentMap = new Map();
      materialCache.set(material, componentMap);
    }
    if (componentMap.has(component)) return componentMap.get(component);
    const cloned = material.clone();
    cloned.transparent = true;
    materialStates.push({
      material: cloned,
      component,
      originalOpacity: material.opacity ?? 1,
      originalEmissive: cloned.emissive ? cloned.emissive.clone() : null,
      originalEmissiveIntensity: cloned.emissiveIntensity ?? 0,
    });
    componentMap.set(component, cloned);
    return cloned;
  }

  const modelBuffer = await decompressModel(modelGzipBase64);
  setLoadingProgress(72, "Building assembled server view");
  const gltf = await new Promise((resolve, reject) => new GLTFLoader().parse(modelBuffer, "", resolve, reject));
  modelRoot.add(gltf.scene);
  modelRoot.updateMatrixWorld(true);

  const meshes = [];
  gltf.scene.traverse((object) => {
    if (object.isMesh) meshes.push(object);
  });

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

  const componentCenters = new Map();
  const componentSizes = new Map();
  componentGroups.forEach((group, component) => {
    const bounds = new THREE.Box3().setFromObject(group);
    componentCenters.set(component, bounds.getCenter(new THREE.Vector3()));
    componentSizes.set(component, bounds.getSize(new THREE.Vector3()));
  });

  const rackCenter = componentCenters.get("rack").clone();
  const rackSize = componentSizes.get("rack").clone();
  const chassisCenter = componentCenters.get("chassis").clone();
  componentCenters.set("chassis", rackCenter.clone().lerp(chassisCenter, 0.72));

  const stageTargets = stages.map((stage) => {
    const center = componentCenters.get(stage.subject)?.clone() || rackCenter.clone();
    if (stage.subject === "rack") center.lerp(chassisCenter, 0.18);
    return center;
  });
  const stageCameras = stages.map((stage, index) => {
    const target = stageTargets[index];
    const [x, y, z] = stage.view;
    return target.clone().add(new THREE.Vector3(rackSize.x * x, rackSize.y * y, rackSize.z * z));
  });

  const microOffsets = new Map([
    ["rack", new THREE.Vector3()],
    ["chassis", new THREE.Vector3(0, 0, rackSize.z * 0.012)],
    ["storage", new THREE.Vector3(0, 0, rackSize.z * 0.018)],
    ["compute", new THREE.Vector3(0, rackSize.y * 0.004, rackSize.z * 0.016)],
    ["gpu", new THREE.Vector3(0, 0, rackSize.z * 0.018)],
    ["cooling", new THREE.Vector3(0, 0, rackSize.z * 0.016)],
    ["power-network", new THREE.Vector3(0, 0, rackSize.z * 0.017)],
  ]);

  body.dataset.modelStatus = "ready";
  setLoadingProgress(100, "Cocometric hardware ready");
  hideLoading();

  function resize() {
    const phone = isMobile();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, phone ? 1.1 : 1.45));
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.fov = phone ? 44 : 31;
    camera.updateProjectionMatrix();
    modelRoot.scale.setScalar(phone ? 0.8 : 1);
    requestRender();
  }

  let targetStageValue = rawStageValue();
  let currentStageValue = targetStageValue;
  let lastTime = performance.now();
  let animationFrame = 0;
  let rendering = false;

  function requestRender() {
    if (rendering || document.hidden) return;
    rendering = true;
    lastTime = performance.now();
    animationFrame = window.requestAnimationFrame(render);
  }

  function render(time) {
    const delta = Math.min((time - lastTime) / 1000, 0.05);
    lastTime = time;
    currentStageValue = THREE.MathUtils.lerp(currentStageValue, targetStageValue, dampFactor(6.2, delta));
    updateActiveStage(currentStageValue);

    const fromIndex = Math.floor(currentStageValue);
    const toIndex = Math.min(stages.length - 1, fromIndex + 1);
    const blend = smooth(currentStageValue - fromIndex);

    fromCamera.copy(stageCameras[fromIndex]);
    toCamera.copy(stageCameras[toIndex]);
    fromTarget.copy(stageTargets[fromIndex]);
    toTarget.copy(stageTargets[toIndex]);
    desiredCamera.lerpVectors(fromCamera, toCamera, blend);
    desiredTarget.lerpVectors(fromTarget, toTarget, blend);

    if (isMobile()) {
      const outward = desiredCamera.clone().sub(desiredTarget).multiplyScalar(0.2);
      desiredCamera.add(outward);
      desiredTarget.y += rackSize.y * 0.04;
    }

    camera.position.lerp(desiredCamera, dampFactor(5.3, delta));
    cameraTarget.lerp(desiredTarget, dampFactor(6.2, delta));
    camera.lookAt(cameraTarget);

    accent.position.lerp(
      desiredTarget.clone().add(new THREE.Vector3(rackSize.x * 0.15, rackSize.y * 0.18, rackSize.z * 0.35)),
      dampFactor(5, delta)
    );

    const overviewWeight = stageWeight(currentStageValue, 0);
    let largestMotion = Math.abs(targetStageValue - currentStageValue);

    componentGroups.forEach((group, component) => {
      const weight = focusWeight(currentStageValue, component);
      const offset = microOffsets.get(component) || new THREE.Vector3();
      const movementEase = dampFactor(6, delta);
      group.position.x = THREE.MathUtils.lerp(group.position.x, offset.x * weight, movementEase);
      group.position.y = THREE.MathUtils.lerp(group.position.y, offset.y * weight, movementEase);
      group.position.z = THREE.MathUtils.lerp(group.position.z, offset.z * weight, movementEase);
      const targetScale = 1 + weight * 0.006;
      const scale = THREE.MathUtils.lerp(group.scale.x, targetScale, movementEase);
      group.scale.setScalar(scale);
      largestMotion = Math.max(largestMotion, Math.abs(group.position.z - offset.z * weight), Math.abs(scale - targetScale));
    });

    materialStates.forEach((state) => {
      const weight = focusWeight(currentStageValue, state.component);
      const isStructural = state.component === "rack" || state.component === "chassis";
      const contextOpacity = overviewWeight > 0.35 ? 1 : (isStructural ? 0.58 : 0.24);
      const targetOpacity = state.originalOpacity * Math.max(contextOpacity, weight);
      state.material.opacity = THREE.MathUtils.lerp(state.material.opacity, targetOpacity, dampFactor(8, delta));
      state.material.depthWrite = targetOpacity > 0.86;
      if (state.material.emissive && state.originalEmissive) {
        state.material.emissive.lerp(weight > 0.05 ? focusColor : state.originalEmissive, dampFactor(7, delta));
        const targetIntensity = weight > 0.05 ? Math.max(state.originalEmissiveIntensity, 0.34 * weight) : state.originalEmissiveIntensity;
        state.material.emissiveIntensity = THREE.MathUtils.lerp(state.material.emissiveIntensity, targetIntensity, dampFactor(7, delta));
      }
    });

    const finalRect = finalSection.getBoundingClientRect();
    const finalFade = clamp(1 - finalRect.top / window.innerHeight);
    sceneElement.style.opacity = String(clamp(1 - finalFade));
    copy.style.opacity = String(clamp(1 - finalFade * 1.3));
    stageNav.style.opacity = String(clamp(1 - finalFade * 1.4));
    scrollCue.style.opacity = window.scrollY < window.innerHeight * 0.35 ? "1" : "0";

    renderer.render(scene, camera);

    const cameraDistance = camera.position.distanceTo(desiredCamera) + cameraTarget.distanceTo(desiredTarget);
    const shouldContinue = !reduceMotion && (largestMotion > 0.0006 || cameraDistance > 0.0015);
    if (shouldContinue) {
      animationFrame = window.requestAnimationFrame(render);
    } else {
      rendering = false;
      animationFrame = 0;
    }
  }

  window.addEventListener("scroll", () => {
    targetStageValue = rawStageValue();
    requestRender();
  }, { passive: true });
  window.addEventListener("resize", resize, { passive: true });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
      animationFrame = 0;
      rendering = false;
    } else {
      targetStageValue = rawStageValue();
      requestRender();
    }
  });
  window.addEventListener("pagehide", () => {
    if (animationFrame) window.cancelAnimationFrame(animationFrame);
    renderer.dispose();
    environmentTarget?.dispose();
  }, { once: true });

  resize();
  requestRender();
}

initializeViewer().catch((error) => {
  console.error("Unable to initialize the Cocometric server viewer", error);
  showModelFailure(`3D model unavailable — ${error instanceof Error ? error.message : String(error)}`);
});
