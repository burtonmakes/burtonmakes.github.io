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
    note: "Scroll through the server to pull each hardware layer out of the rack and inspect it.",
    tags: ["Rack", "Storage", "Compute", "GPU"],
    focus: [],
    context: [],
    camera: [9.8, 5.7, 13.2],
    target: [0.15, 0.0, 0.0],
  },
  {
    eyebrow: "Rack + chassis · 02",
    title: "A serviceable system, not a sealed appliance.",
    note: "The chassis moves forward from the rack while the installed system stays visible behind it.",
    tags: ["Rack enclosure", "Chassis", "Service bays", "Replaceable hardware"],
    focus: ["chassis"],
    context: ["rack"],
    camera: [-0.4, 3.5, 8.7],
    target: [-2.25, 0.05, 0.0],
  },
  {
    eyebrow: "Storage · 03",
    title: "Storage built around recovery.",
    note: "The removable drive layer slides out for inspection, then returns before the next subsystem opens.",
    tags: ["6 removable drives", "Snapshots", "Retention", "Restore tests"],
    focus: ["storage"],
    context: ["chassis", "rack"],
    camera: [7.0, 4.0, 8.5],
    target: [3.35, 1.12, 0.0],
  },
  {
    eyebrow: "Compute · 04",
    title: "General compute for the whole local stack.",
    note: "Processors, memory, motherboard, and I/O lift out as one compute layer while the storage layer closes.",
    tags: ["Dual CPU", "12 memory modules", "Motherboard", "I/O"],
    focus: ["compute"],
    context: ["chassis", "rack"],
    camera: [4.3, 3.0, 7.0],
    target: [0.05, 0.55, 0.05],
  },
  {
    eyebrow: "AI accelerators · 05",
    title: "Local inference without sending data away.",
    note: "The GPU assemblies move out from the installed stack for a closer look at local model capacity.",
    tags: ["2 GPU assemblies", "Local models", "OCR", "Private retrieval"],
    focus: ["gpu"],
    context: ["chassis", "rack"],
    camera: [4.1, -0.1, 6.8],
    target: [0.25, -1.45, 0.08],
  },
  {
    eyebrow: "Cooling · 06",
    title: "Airflow designed as part of the system.",
    note: "The fan wall separates from the chassis to show the cooling path, then returns into the rack.",
    tags: ["6 fan assemblies", "Fan wall", "Directed airflow", "Sustained load"],
    focus: ["cooling"],
    context: ["chassis", "rack"],
    camera: [5.8, 2.5, 7.0],
    target: [2.2, 0.12, 0.1],
  },
  {
    eyebrow: "Power + network · 07",
    title: "Redundant power and controlled access.",
    note: "Power and network hardware pull away from the rack together while the rest of the system remains assembled.",
    tags: ["Dual PSU", "3-port NIC", "Segmentation", "Secure access"],
    focus: ["power-network"],
    context: ["chassis", "rack"],
    camera: [6.7, 0.8, 7.7],
    target: [3.0, -1.15, 0.18],
  },
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

const requiredElements = [
  canvas,
  loading,
  loadingBar,
  loadingTrack,
  loadingCopy,
  sceneElement,
  copy,
  scrollCue,
  stageNav,
  stageStep,
  stageTitle,
  stageNote,
  stageTags,
  finalSection,
];

function clamp(value, min = 0, max = 1) {
  return Math.max(min, Math.min(max, value));
}

function smooth(value) {
  const x = clamp(value);
  return x * x * (3 - 2 * x);
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

function stageFloat() {
  const firstBeat = beats[0];
  if (!firstBeat) return 0;
  const stageHeight = Math.max(1, firstBeat.offsetHeight);
  return clamp((window.scrollY - firstBeat.offsetTop) / stageHeight, 0, stages.length - 1);
}

function stageWeight(value, index) {
  return smooth(clamp(1 - Math.abs(value - index)));
}

function componentWeight(value, component, key) {
  let weight = 0;
  stages.forEach((stage, index) => {
    if (stage[key]?.includes(component)) weight = Math.max(weight, stageWeight(value, index));
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
  stageTags.replaceChildren(
    ...stage.tags.map((tag) => {
      const element = document.createElement("span");
      element.textContent = tag;
      return element;
    })
  );

  stageButtons.forEach((button, buttonIndex) => {
    const isActive = buttonIndex === index;
    button.classList.toggle("is-active", isActive);
    if (isActive) button.setAttribute("aria-current", "step");
    else button.removeAttribute("aria-current");
  });
}

function updateActiveStage() {
  const nearest = Math.round(stageFloat());
  if (nearest === activeStage) return nearest;
  activeStage = nearest;
  renderStageText(nearest);
  return nearest;
}

stageButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const index = Number(button.dataset.stageButton);
    const target = beats[index];
    if (!target) return;
    window.scrollTo({ top: target.offsetTop, behavior: reduceMotion ? "auto" : "smooth" });
  });
});

let textUpdateFrame = 0;
window.addEventListener(
  "scroll",
  () => {
    if (textUpdateFrame) return;
    textUpdateFrame = window.requestAnimationFrame(() => {
      textUpdateFrame = 0;
      updateActiveStage();
    });
  },
  { passive: true }
);
renderStageText(0);

function decodeBase64(encoded) {
  const binary = window.atob(encoded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

async function decompressModel(encoded) {
  if (!("DecompressionStream" in window)) {
    throw new Error("This browser does not support the model decompression required by this page.");
  }

  setLoadingProgress(26, "Preparing Cocometric hardware");
  const compressed = decodeBase64(encoded);
  setLoadingProgress(48, "Decompressing server model");
  const stream = new Blob([compressed]).stream().pipeThrough(new DecompressionStream("gzip"));
  const arrayBuffer = await new Response(stream).arrayBuffer();

  if (arrayBuffer.byteLength < 12) throw new Error("The embedded GLB model is incomplete.");
  const header = new DataView(arrayBuffer, 0, 12);
  if (
    header.getUint32(0, true) !== 0x46546c67 ||
    header.getUint32(4, true) !== 2 ||
    header.getUint32(8, true) !== arrayBuffer.byteLength
  ) {
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

function desiredCenter(component, rackCenter, rackSize) {
  const centers = {
    chassis: new THREE.Vector3(rackCenter.x, rackCenter.y, rackCenter.z),
    storage: new THREE.Vector3(rackCenter.x + rackSize.x * 0.12, rackCenter.y + rackSize.y * 0.18, rackCenter.z),
    compute: new THREE.Vector3(rackCenter.x, rackCenter.y + rackSize.y * 0.02, rackCenter.z),
    gpu: new THREE.Vector3(rackCenter.x, rackCenter.y - rackSize.y * 0.18, rackCenter.z + rackSize.z * 0.03),
    cooling: new THREE.Vector3(rackCenter.x + rackSize.x * 0.18, rackCenter.y, rackCenter.z - rackSize.z * 0.08),
    "power-network": new THREE.Vector3(rackCenter.x + rackSize.x * 0.2, rackCenter.y - rackSize.y * 0.25, rackCenter.z),
  };
  return centers[component] || rackCenter.clone();
}

function explodeVector(component, rackSize) {
  const vectors = {
    chassis: new THREE.Vector3(-rackSize.x * 0.28, rackSize.y * 0.04, rackSize.z * 0.22),
    storage: new THREE.Vector3(rackSize.x * 0.48, rackSize.y * 0.08, rackSize.z * 0.28),
    compute: new THREE.Vector3(rackSize.x * 0.04, rackSize.y * 0.34, rackSize.z * 0.34),
    gpu: new THREE.Vector3(rackSize.x * 0.02, -rackSize.y * 0.26, rackSize.z * 0.42),
    cooling: new THREE.Vector3(rackSize.x * 0.42, rackSize.y * 0.02, rackSize.z * 0.28),
    "power-network": new THREE.Vector3(rackSize.x * 0.5, -rackSize.y * 0.16, rackSize.z * 0.24),
  };
  return vectors[component] || new THREE.Vector3();
}

async function initializeViewer() {
  if (requiredElements.some((element) => !element)) {
    throw new Error("The Cocometric page is missing a required viewer element.");
  }

  const mobile = isMobile();
  const lowPowerDevice = (navigator.hardwareConcurrency || 8) <= 4;
  const enableShadows = !mobile && !lowPowerDevice;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: !mobile && !lowPowerDevice,
    alpha: true,
    powerPreference: mobile ? "low-power" : "high-performance",
    preserveDrawingBuffer: false,
  });

  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = mobile ? 1.08 : 1.04;
  renderer.shadowMap.enabled = enableShadows;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x01050a, mobile ? 0.021 : 0.027);

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
  key.shadow.camera.near = 0.1;
  key.shadow.camera.far = 24;
  scene.add(key);

  const fill = new THREE.DirectionalLight(0x6fd3ff, mobile ? 1.15 : 1.55);
  fill.position.set(-5, 2, 6);
  scene.add(fill);

  const rim = new THREE.PointLight(0xe86f4e, mobile ? 9 : 20, 18, 2);
  rim.position.set(2.5, 3.5, -4.5);
  scene.add(rim);

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
  const highlight = new THREE.Color(0x123244);

  function materialForComponent(material, component) {
    let componentMap = materialCache.get(material);
    if (!componentMap) {
      componentMap = new Map();
      materialCache.set(material, componentMap);
    }
    if (componentMap.has(component)) return componentMap.get(component);

    const cloned = material.clone();
    cloned.transparent = true;
    const state = {
      material: cloned,
      component,
      originalOpacity: material.opacity ?? 1,
      originalEmissive: cloned.emissive ? cloned.emissive.clone() : null,
      originalEmissiveIntensity: cloned.emissiveIntensity ?? 0,
    };
    materialStates.push(state);
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

  const rackGroup = componentGroups.get("rack");
  const rackBounds = new THREE.Box3().setFromObject(rackGroup);
  const rackCenter = rackBounds.getCenter(new THREE.Vector3());
  const rackSize = rackBounds.getSize(new THREE.Vector3());
  const assembledPositions = new Map();
  const explodedPositions = new Map();

  componentGroups.forEach((group, component) => {
    if (component === "rack") {
      assembledPositions.set(component, new THREE.Vector3());
      explodedPositions.set(component, new THREE.Vector3());
      return;
    }

    const bounds = new THREE.Box3().setFromObject(group);
    const currentCenter = bounds.getCenter(new THREE.Vector3());
    const assembled = desiredCenter(component, rackCenter, rackSize).sub(currentCenter);
    const exploded = assembled.clone().add(explodeVector(component, rackSize));
    assembledPositions.set(component, assembled);
    explodedPositions.set(component, exploded);
    group.position.copy(assembled);
  });

  body.dataset.modelStatus = "ready";
  setLoadingProgress(100, "Cocometric hardware ready");
  hideLoading();

  const camA = new THREE.Vector3();
  const camB = new THREE.Vector3();
  const targetA = new THREE.Vector3();
  const targetB = new THREE.Vector3();
  const animatedPosition = new THREE.Vector3();

  function resize() {
    const phone = isMobile();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, phone ? 1.2 : 1.75));
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.fov = phone ? 42 : 32;
    camera.updateProjectionMatrix();
    modelRoot.scale.setScalar(phone ? 0.84 : 1);
  }

  let resizeFrame = 0;
  window.addEventListener("resize", () => {
    if (resizeFrame) window.cancelAnimationFrame(resizeFrame);
    resizeFrame = window.requestAnimationFrame(() => {
      resizeFrame = 0;
      resize();
    });
  });
  resize();

  let animationFrame = 0;
  let running = false;

  function render(time) {
    if (!running) return;

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

    if (isMobile()) {
      camera.position.multiplyScalar(1.24);
      cameraTarget.y += 0.42;
    }
    camera.lookAt(cameraTarget);

    const overviewWeight = smooth(clamp(1 - value));

    componentGroups.forEach((group, component) => {
      if (component === "rack") return;
      const focusWeight = componentWeight(value, component, "focus");
      animatedPosition.lerpVectors(
        assembledPositions.get(component),
        explodedPositions.get(component),
        focusWeight
      );
      group.position.lerp(animatedPosition, reduceMotion ? 1 : 0.16);
      const targetScale = 1 + focusWeight * 0.025;
      const scale = THREE.MathUtils.lerp(group.scale.x, targetScale, reduceMotion ? 1 : 0.14);
      group.scale.setScalar(scale);
    });

    materialStates.forEach((state) => {
      const focusWeight = componentWeight(value, state.component, "focus");
      const contextWeight = componentWeight(value, state.component, "context");
      const rackOpacity = state.component === "rack" ? 1 : 0;
      const visibility = Math.max(rackOpacity, overviewWeight, focusWeight, contextWeight * 0.34, 0.025);
      const targetOpacity = state.originalOpacity * visibility;

      state.material.opacity = THREE.MathUtils.lerp(
        state.material.opacity,
        targetOpacity,
        reduceMotion ? 1 : 0.16
      );
      state.material.depthWrite = targetOpacity > 0.92;

      if (state.material.emissive && state.originalEmissive) {
        const targetEmissive = focusWeight > 0.08 ? highlight : state.originalEmissive;
        state.material.emissive.lerp(targetEmissive, reduceMotion ? 1 : 0.12);
        const targetIntensity = focusWeight > 0.08
          ? Math.max(state.originalEmissiveIntensity, 0.24 * focusWeight)
          : state.originalEmissiveIntensity;
        state.material.emissiveIntensity = THREE.MathUtils.lerp(
          state.material.emissiveIntensity,
          targetIntensity,
          reduceMotion ? 1 : 0.12
        );
      }
    });

    if (!reduceMotion) modelRoot.rotation.y = -0.08 + Math.sin(time * 0.00018) * 0.018;

    const finalRect = finalSection.getBoundingClientRect();
    const finalFade = clamp(1 - finalRect.top / window.innerHeight);
    sceneElement.style.opacity = String(clamp(1 - finalFade));
    copy.style.opacity = String(clamp(1 - finalFade * 1.3));
    stageNav.style.opacity = String(clamp(1 - finalFade * 1.4));
    scrollCue.style.opacity = window.scrollY < window.innerHeight * 0.35 ? "1" : "0";

    renderer.render(scene, camera);
    animationFrame = window.requestAnimationFrame(render);
  }

  function startRendering() {
    if (running) return;
    running = true;
    animationFrame = window.requestAnimationFrame(render);
  }

  function stopRendering() {
    running = false;
    if (animationFrame) window.cancelAnimationFrame(animationFrame);
    animationFrame = 0;
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopRendering();
    else startRendering();
  });

  window.addEventListener("pagehide", () => {
    stopRendering();
    renderer.dispose();
    environmentTarget?.dispose();
  }, { once: true });

  startRendering();
}

initializeViewer().catch((error) => {
  console.error("Unable to initialize the Cocometric server viewer", error);
  const reason = error instanceof Error ? error.message : String(error);
  showModelFailure(`3D model unavailable — ${reason}`);
});