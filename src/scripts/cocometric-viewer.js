import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
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
    note: "The complete system is already exploded into a clear service view. Scroll to highlight each layer.",
    tags: ["Rack", "Storage", "Compute", "GPU"],
    focus: [],
    context: [],
    camera: [8.0, 4.5, 12.0],
    target: [0.2, 0.0, 0.0],
  },
  {
    eyebrow: "Rack + chassis · 02",
    title: "A serviceable system, not a sealed appliance.",
    note: "Inspect the chassis shell and service envelope while the full exploded system remains visible.",
    tags: ["Rack enclosure", "Chassis", "Service bays", "Replaceable hardware"],
    focus: ["chassis"],
    context: ["rack"],
    camera: [4.0, 3.5, 8.0],
    target: [0.0, 1.65, 0.2],
  },
  {
    eyebrow: "Storage · 03",
    title: "Storage built around recovery.",
    note: "Highlight the removable drive layer, labels, connectors, and recovery tiers.",
    tags: ["6 removable drives", "Snapshots", "Retention", "Restore tests"],
    focus: ["storage"],
    context: ["chassis", "rack"],
    camera: [7.0, 3.5, 8.0],
    target: [3.5, 1.15, 0.0],
  },
  {
    eyebrow: "Compute · 04",
    title: "General compute for the whole local stack.",
    note: "Focus on the motherboard, processors, memory, and I/O as one compute layer.",
    tags: ["Dual CPU", "12 memory modules", "Motherboard", "I/O"],
    focus: ["compute"],
    context: ["chassis", "rack"],
    camera: [4.0, 3.0, 8.0],
    target: [0.0, 0.55, 0.15],
  },
  {
    eyebrow: "AI accelerators · 05",
    title: "Local inference without sending data away.",
    note: "Highlight both GPU assemblies and their role in private local inference.",
    tags: ["2 GPU assemblies", "Local models", "OCR", "Private retrieval"],
    focus: ["gpu"],
    context: ["chassis", "rack"],
    camera: [4.0, -0.3, 7.0],
    target: [0.3, -1.6, 0.2],
  },
  {
    eyebrow: "Cooling · 06",
    title: "Airflow designed as part of the system.",
    note: "Follow the fan wall and cooling assemblies through the exploded airflow path.",
    tags: ["6 fan assemblies", "Fan wall", "Directed airflow", "Sustained load"],
    focus: ["cooling"],
    context: ["chassis", "rack"],
    camera: [6.0, 2.8, 8.0],
    target: [2.25, 0.15, 0.2],
  },
  {
    eyebrow: "Power + network · 07",
    title: "Redundant power and controlled access.",
    note: "Highlight redundant power and the network interface at the edge of the system.",
    tags: ["Dual PSU", "3-port NIC", "Segmentation", "Secure access"],
    focus: ["power-network"],
    context: ["chassis", "rack"],
    camera: [7.0, 0.5, 8.0],
    target: [3.0, -1.2, 0.4],
  },
];

const componentNames = ["rack", "chassis", "storage", "compute", "gpu", "cooling", "power-network"];
const authoredClearance = {
  chassis: [0, 0, 0.035],
  storage: [0, 0, 0.028],
  compute: [0, 0, 0.024],
  gpu: [0, 0, 0.03],
  cooling: [0, 0, 0.032],
  "power-network": [0, 0, 0.036],
};
const meshClearance = {
  // These panels overlap in the source GLB: the base extends into the
  // vertical walls by roughly 0.075 model units. Separate the mating faces
  // at the geometry level so the corner cannot z-fight.
  Exploded_Chassis_Base: [0, -0.075, 0],
  Exploded_Chassis_Left: [-0.075, 0, 0],
  Exploded_Chassis_Right: [0.075, 0, 0],
  Exploded_Chassis_Back: [0, 0, -0.075],
};
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
  renderer.toneMappingExposure = 1.16;
  renderer.shadowMap.enabled = enableShadows;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x01050a, mobile ? 0.014 : 0.015);

  const camera = new THREE.PerspectiveCamera(32, window.innerWidth / window.innerHeight, 0.1, 100);
  const cameraTarget = new THREE.Vector3();

  scene.add(new THREE.HemisphereLight(0xe6f2fa, 0x182735, 2.2));
  scene.add(new THREE.AmbientLight(0xb8d2e2, 1.05));

  const key = new THREE.DirectionalLight(0xffffff, 4.4);
  key.position.set(5, 8, 9);
  key.castShadow = enableShadows;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.near = 0.1;
  key.shadow.camera.far = 24;
  key.shadow.bias = -0.00035;
  key.shadow.normalBias = 0.032;
  scene.add(key);

  const fill = new THREE.DirectionalLight(0x74cfff, 2.15);
  fill.position.set(-5, 2, 6);
  scene.add(fill);

  const frontFill = new THREE.DirectionalLight(0xd9f2ff, 1.15);
  frontFill.position.set(0, 3, 10);
  scene.add(frontFill);

  const rim = new THREE.PointLight(0xe86f4e, 16, 18, 2);
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
    const requiresTransparency = material.transparent || (material.opacity ?? 1) < 1;
    cloned.transparent = requiresTransparency;
    const state = {
      material: cloned,
      component,
      originalOpacity: material.opacity ?? 1,
      requiresTransparency,
      depthBias: component === "rack" ? -1 : component === "chassis" ? 1 : 0,
      originalEmissive: cloned.emissive ? cloned.emissive.clone() : null,
      originalEmissiveIntensity: cloned.emissiveIntensity ?? 0,
    };
    materialStates.push(state);
    componentMap.set(component, cloned);
    return cloned;
  }

  const modelBuffer = await decompressModel(modelGzipBase64);
  setLoadingProgress(72, "Building exploded server view");
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
    const clearance = meshClearance[mesh.name];
    if (clearance) mesh.position.add(new THREE.Vector3(...clearance));
    mesh.castShadow = enableShadows && radius > 0.08;
    // Thin chassis panels are close to one another by design. Letting them
    // receive the main shadow map creates speckled self-shadowing at their
    // seams even after the geometry has been given a small physical gap.
    mesh.receiveShadow = enableShadows && component !== "chassis";
    mesh.renderOrder = component === "rack" ? 0 : component === "chassis" ? 1 : 2;
    componentGroups.get(component).attach(mesh);
  });

  gltf.scene.removeFromParent();
  modelRoot.updateMatrixWorld(true);

  // The supplied GLB is authored as a coherent exploded layout. Keep those
  // authored positions intact; the scroll story changes emphasis and camera
  // focus instead of repeatedly re-solving component placement at runtime.
  componentGroups.forEach((group, component) => {
    const [x, y, z] = authoredClearance[component] || [0, 0, 0];
    group.position.set(x, y, z);
  });

  body.dataset.modelStatus = "ready";
  setLoadingProgress(100, "Cocometric hardware ready");
  hideLoading();

  
  function resize() {
    const phone = isMobile();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, phone ? 1.2 : 1.5));
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.fov = phone ? 38 : 32;
    camera.updateProjectionMatrix();
    modelRoot.scale.setScalar(phone ? 0.94 : 1);
    modelRoot.position.x = 0;
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
  let previousTime = 0;
  const stageCamera = new THREE.Vector3();
  const stageTarget = new THREE.Vector3();

  function render(time) {
    if (!running) return;

    const delta = previousTime ? Math.min(50, time - previousTime) : 16.67;
    previousTime = time;
    const motionBlend = reduceMotion ? 1 : 1 - Math.pow(0.001, delta / 1000);

    const value = stageFloat();
    const lockedStage = Math.max(0, Math.min(stages.length - 1, Math.round(value)));
    const stage = stages[lockedStage];
    updateActiveStage();

    stageCamera.fromArray(stage.camera);
    stageTarget.fromArray(stage.target);
    camera.position.lerp(stageCamera, motionBlend);
    cameraTarget.lerp(stageTarget, motionBlend);

    if (isMobile()) {
      camera.position.multiplyScalar(1.24);
      cameraTarget.y += 0.42;
    }
    camera.lookAt(cameraTarget);

    const overviewWeight = lockedStage === 0 ? 1 : 0;
    componentGroups.forEach((group, component) => {
      if (component === "rack") return;
      const selectedWeight = stage.focus.includes(component) ? 1 : 0;
      const targetScale = 1 + selectedWeight * 0.025;
      const scale = THREE.MathUtils.lerp(group.scale.x, targetScale, motionBlend);
      group.scale.setScalar(scale);
    });

    materialStates.forEach((state) => {
      const selectedWeight = stage.focus.includes(state.component) ? 1 : 0;
      const contextWeight = stage.context.includes(state.component) ? 1 : 0;
      const rackOpacity = state.component === "rack" ? 1 : 0;
      const visibility = state.component === "rack"
        ? 1
        : Math.max(overviewWeight, selectedWeight, contextWeight * 0.48, 0.16);
      const targetOpacity = state.originalOpacity * visibility;

      // Keep solid hardware on the opaque render path. Marking every GLB
      // material transparent creates unstable sorting where adjacent metal
      // panels meet at shallow angles; only dimmed stages need blending.
      const useTransparency = state.requiresTransparency || targetOpacity < 0.998;
      if (state.material.transparent !== useTransparency) {
        state.material.transparent = useTransparency;
        state.material.needsUpdate = true;
      }
      if (state.depthBias) {
        state.material.polygonOffset = true;
        state.material.polygonOffsetFactor = state.depthBias;
        state.material.polygonOffsetUnits = state.depthBias;
      }

      state.material.opacity = THREE.MathUtils.lerp(
        state.material.opacity,
        targetOpacity,
        motionBlend
      );
      state.material.depthWrite = targetOpacity > 0.92;

      if (state.material.emissive && state.originalEmissive) {
        const targetEmissive = selectedWeight > 0.08 ? highlight : state.originalEmissive;
        state.material.emissive.lerp(targetEmissive, motionBlend);
        const targetIntensity = selectedWeight > 0.08
          ? Math.max(state.originalEmissiveIntensity, 0.24 * selectedWeight)
          : state.originalEmissiveIntensity;
        state.material.emissiveIntensity = THREE.MathUtils.lerp(
          state.material.emissiveIntensity,
          targetIntensity,
          motionBlend
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
  }, { once: true });

  startRendering();
}

initializeViewer().catch((error) => {
  console.error("Unable to initialize the Cocometric server viewer", error);
  const reason = error instanceof Error ? error.message : String(error);
  showModelFailure(`3D model unavailable — ${reason}`);
});
