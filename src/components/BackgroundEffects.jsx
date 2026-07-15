import { useEffect, useRef } from "react";

export default function BackgroundEffects() {
  const canvasRef = useRef(null);
  const spotlightRef = useRef(null);

  useEffect(() => {
    const cleanup = [];
    let cancelled = false;

    const initialize = async () => {
      const [{ default: gsap }, THREE] = await Promise.all([
        import("gsap"),
        import("three"),
      ]);
      if (cancelled) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hasFinePointer = window.matchMedia("(pointer: fine)").matches;
    const pointer = { x: 0, y: 0 };
    const pointerTarget = { x: 0, y: 0 };
    const onPointerMove = (event) => {
      pointerTarget.x = (event.clientX / window.innerWidth - 0.5) * 2;
      pointerTarget.y = (event.clientY / window.innerHeight - 0.5) * 2;

      if (spotlightRef.current) {
        const diameter = 560;
        spotlightRef.current.style.setProperty("--spot-x", `${event.clientX}px`);
        spotlightRef.current.style.setProperty("--spot-y", `${event.clientY}px`);
        spotlightRef.current.style.width = `${diameter}px`;
        spotlightRef.current.style.height = `${diameter}px`;
        gsap.to(spotlightRef.current, {
          opacity: 1,
          duration: 0.12,
          overwrite: true,
        });
      }
    };

    if (hasFinePointer) {
      window.addEventListener("pointermove", onPointerMove);
      onPointerMove({ clientX: window.innerWidth * 0.52, clientY: window.innerHeight * 0.3 });
      cleanup.push(() => window.removeEventListener("pointermove", onPointerMove));
    }

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current,
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
    } catch (error) {
      console.warn("Background WebGL effects are unavailable.", error);
      return () => cleanup.forEach((item) => item());
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 8);

    const group = new THREE.Group();
    scene.add(group);

    const particleCount = window.innerWidth < 640 ? 540 : window.innerWidth < 960 ? 840 : 1240;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const particleVelocities = new Float32Array(particleCount * 3);
    const particleBounds = { x: 7.6, y: 4.2, z: 5 };
    const palette = [new THREE.Color("#3f7f9f"), new THREE.Color("#5f9fb8"), new THREE.Color("#7fbfd0")];

    for (let i = 0; i < particleCount; i += 1) {
      const i3 = i * 3;
      const radius = 2.3 + Math.random() * 5;
      const angle = Math.random() * Math.PI * 2;
      const depth = (Math.random() - 0.5) * 10;
      const color = palette[i % palette.length];

      positions[i3] = Math.cos(angle) * radius;
      positions[i3 + 1] = Math.sin(angle) * radius * 0.6 + (Math.random() - 0.5) * 1.4;
      positions[i3 + 2] = depth;
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
      particleVelocities[i3] = (Math.random() - 0.5) * 0.0016;
      particleVelocities[i3 + 1] = (Math.random() - 0.5) * 0.0012;
      particleVelocities[i3 + 2] = (Math.random() - 0.5) * 0.001;
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const particles = new THREE.Points(
      particleGeometry,
      new THREE.PointsMaterial({
        size: 0.024,
        transparent: true,
        opacity: 0.52,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    group.add(particles);

    const networkGroup = new THREE.Group();
    networkGroup.position.set(2.12, 0.14, -0.98);
    group.add(networkGroup);

    const nodeCount = window.innerWidth < 640 ? 82 : window.innerWidth < 960 ? 116 : 164;
    const networkBounds =
      window.innerWidth < 640
        ? { x: 2.28, y: 1.38, z: 0.62 }
        : window.innerWidth < 960
          ? { x: 2.86, y: 1.64, z: 0.72 }
          : { x: 3.48, y: 1.94, z: 0.84 };
    const nodePositions = new Float32Array(nodeCount * 3);
    const nodeAnchors = new Float32Array(nodeCount * 3);
    const nodeColors = new Float32Array(nodeCount * 3);
    const nodeVelocities = [];
    const nodeOrbits = [];
    const coolNetworkPalette = [
      new THREE.Color("#d7a765"),
      new THREE.Color("#c9894b"),
      new THREE.Color("#b87455"),
      new THREE.Color("#7fbfd0"),
    ];
    const warmNetworkPalette = [
      new THREE.Color("#d6a15f"),
      new THREE.Color("#c9894b"),
      new THREE.Color("#d86a52"),
      new THREE.Color("#b87455"),
      new THREE.Color("#e2b869"),
    ];

    for (let i = 0; i < nodeCount; i += 1) {
      const i3 = i * 3;
      nodeAnchors[i3] = (Math.random() - 0.5) * networkBounds.x * 2;
      nodeAnchors[i3 + 1] = (Math.random() - 0.5) * networkBounds.y * 2;
      nodeAnchors[i3 + 2] = (Math.random() - 0.5) * networkBounds.z * 2;
      const depthRatio = (nodeAnchors[i3 + 2] + networkBounds.z) / (networkBounds.z * 2);
      const isBackLayer = depthRatio < 0.72;
      const palette = isBackLayer ? warmNetworkPalette : coolNetworkPalette;
      const color = palette[i % palette.length];
      const colorBoost = isBackLayer ? 0.94 : 0.78;
      nodePositions[i3] = nodeAnchors[i3];
      nodePositions[i3 + 1] = nodeAnchors[i3 + 1];
      nodePositions[i3 + 2] = nodeAnchors[i3 + 2];
      nodeColors[i3] = Math.min(color.r * colorBoost, 1);
      nodeColors[i3 + 1] = Math.min(color.g * colorBoost, 1);
      nodeColors[i3 + 2] = Math.min(color.b * colorBoost, 1);
      nodeVelocities.push({
        x: (Math.random() - 0.5) * 0.0034,
        y: (Math.random() - 0.5) * 0.0028,
        z: (Math.random() - 0.5) * 0.0018,
      });
      nodeOrbits.push({
        radiusX: 0.06 + Math.random() * 0.14,
        radiusY: 0.04 + Math.random() * 0.11,
        radiusZ: 0.025 + Math.random() * 0.08,
        phase: Math.random() * Math.PI * 2,
        speed: 0.65 + Math.random() * 0.9,
      });
    }

    const nodeGeometry = new THREE.BufferGeometry();
    nodeGeometry.setAttribute("position", new THREE.BufferAttribute(nodePositions, 3));
    nodeGeometry.setAttribute("color", new THREE.BufferAttribute(nodeColors, 3));

    const nodeTextureCanvas = document.createElement("canvas");
    nodeTextureCanvas.width = 64;
    nodeTextureCanvas.height = 64;
    const nodeTextureContext = nodeTextureCanvas.getContext("2d");
    const nodeGradient = nodeTextureContext.createRadialGradient(32, 32, 0, 32, 32, 31);
    nodeGradient.addColorStop(0, "rgba(255,255,255,1)");
    nodeGradient.addColorStop(0.5, "rgba(255,255,255,0.95)");
    nodeGradient.addColorStop(0.76, "rgba(255,255,255,0.34)");
    nodeGradient.addColorStop(1, "rgba(255,255,255,0)");
    nodeTextureContext.fillStyle = nodeGradient;
    nodeTextureContext.beginPath();
    nodeTextureContext.arc(32, 32, 31, 0, Math.PI * 2);
    nodeTextureContext.fill();
    const nodeTexture = new THREE.CanvasTexture(nodeTextureCanvas);

    const networkNodes = new THREE.Points(
      nodeGeometry,
      new THREE.PointsMaterial({
        size: 0.072,
        map: nodeTexture,
        transparent: true,
        opacity: 0.95,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    networkGroup.add(networkNodes);

    const maxNetworkSegments = (nodeCount * (nodeCount - 1)) / 2;
    const segmentPositions = new Float32Array(maxNetworkSegments * 2 * 3);
    const segmentColors = new Float32Array(maxNetworkSegments * 2 * 3);
    const segmentStrengths = new Float32Array(maxNetworkSegments);
    const segmentGeometry = new THREE.BufferGeometry();
    segmentGeometry.setAttribute("position", new THREE.BufferAttribute(segmentPositions, 3));
    segmentGeometry.setAttribute("color", new THREE.BufferAttribute(segmentColors, 3));
    segmentGeometry.setDrawRange(0, 0);

    const networkSegments = new THREE.LineSegments(
      segmentGeometry,
      new THREE.LineBasicMaterial({
        transparent: true,
        opacity: 0.34,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    networkGroup.add(networkSegments);

    const updateNetwork = (shouldMove, elapsed = 0) => {
      if (shouldMove) {
        for (let i = 0; i < nodeCount; i += 1) {
          const i3 = i * 3;
          const velocity = nodeVelocities[i];
          const orbit = nodeOrbits[i];
          const phase = elapsed * orbit.speed + orbit.phase;

          nodeAnchors[i3] += velocity.x;
          nodeAnchors[i3 + 1] += velocity.y;
          nodeAnchors[i3 + 2] += velocity.z;

          if (Math.abs(nodeAnchors[i3]) > networkBounds.x) {
            velocity.x *= -1;
            nodeAnchors[i3] = Math.sign(nodeAnchors[i3]) * networkBounds.x;
          }

          if (Math.abs(nodeAnchors[i3 + 1]) > networkBounds.y) {
            velocity.y *= -1;
            nodeAnchors[i3 + 1] = Math.sign(nodeAnchors[i3 + 1]) * networkBounds.y;
          }

          if (Math.abs(nodeAnchors[i3 + 2]) > networkBounds.z) {
            velocity.z *= -1;
            nodeAnchors[i3 + 2] = Math.sign(nodeAnchors[i3 + 2]) * networkBounds.z;
          }

          nodePositions[i3] = nodeAnchors[i3] + Math.cos(phase) * orbit.radiusX;
          nodePositions[i3 + 1] = nodeAnchors[i3 + 1] + Math.sin(phase * 1.18) * orbit.radiusY;
          nodePositions[i3 + 2] = nodeAnchors[i3 + 2] + Math.sin(phase * 0.82) * orbit.radiusZ;
        }

        nodeGeometry.attributes.position.needsUpdate = true;
      }

      let segmentIndex = 0;
      let pairIndex = 0;
      const connectDistance = window.innerWidth < 640 ? 1.22 : window.innerWidth < 960 ? 1.14 : 1.05;
      const fadeDistance = connectDistance * 0.42;
      const pointerLocalX = pointer.x * networkBounds.x * 0.82;
      const pointerLocalY = -pointer.y * networkBounds.y * 0.82;
      const pointerReach = window.innerWidth < 640 ? 1.45 : 1.22;

      for (let a = 0; a < nodeCount - 1; a += 1) {
        const a3 = a * 3;

        for (let b = a + 1; b < nodeCount; b += 1) {
          const b3 = b * 3;
          const dx = nodePositions[a3] - nodePositions[b3];
          const dy = nodePositions[a3 + 1] - nodePositions[b3 + 1];
          const dz = nodePositions[a3 + 2] - nodePositions[b3 + 2];
          const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

          const fadeStart = connectDistance - fadeDistance;
          const fadeProgress = Math.max(0, Math.min(1, (connectDistance - distance) / fadeDistance));
          const targetStrength = distance < fadeStart ? 1 : fadeProgress * fadeProgress * (3 - 2 * fadeProgress);
          const currentStrength = segmentStrengths[pairIndex];
          const easedStrength = shouldMove
            ? currentStrength + (targetStrength - currentStrength) * (targetStrength > currentStrength ? 0.08 : 0.045)
            : targetStrength;
          segmentStrengths[pairIndex] = easedStrength;
          pairIndex += 1;

          if (easedStrength <= 0.025) {
            continue;
          }

          const midpointX = (nodePositions[a3] + nodePositions[b3]) * 0.5;
          const midpointY = (nodePositions[a3 + 1] + nodePositions[b3 + 1]) * 0.5;
          const pointerDistance = Math.hypot(midpointX - pointerLocalX, midpointY - pointerLocalY);
          const distanceWeight = Math.max(0, 1 - distance / connectDistance);
          const pointerWeight = hasFinePointer ? Math.max(0, 1 - pointerDistance / pointerReach) : 0;
          const intensity = (0.3 + distanceWeight * 0.54 + pointerWeight * 0.36) * easedStrength;
          const positionOffset = segmentIndex * 6;
          const colorOffset = segmentIndex * 6;

          segmentPositions[positionOffset] = nodePositions[a3];
          segmentPositions[positionOffset + 1] = nodePositions[a3 + 1];
          segmentPositions[positionOffset + 2] = nodePositions[a3 + 2];
          segmentPositions[positionOffset + 3] = nodePositions[b3];
          segmentPositions[positionOffset + 4] = nodePositions[b3 + 1];
          segmentPositions[positionOffset + 5] = nodePositions[b3 + 2];

          segmentColors[colorOffset] = Math.min(nodeColors[a3] * intensity, 1);
          segmentColors[colorOffset + 1] = Math.min(nodeColors[a3 + 1] * intensity, 1);
          segmentColors[colorOffset + 2] = Math.min(nodeColors[a3 + 2] * intensity, 1);
          segmentColors[colorOffset + 3] = Math.min(nodeColors[b3] * intensity, 1);
          segmentColors[colorOffset + 4] = Math.min(nodeColors[b3 + 1] * intensity, 1);
          segmentColors[colorOffset + 5] = Math.min(nodeColors[b3 + 2] * intensity, 1);

          segmentIndex += 1;
        }
      }

      segmentGeometry.setDrawRange(0, segmentIndex * 2);
      segmentGeometry.attributes.position.needsUpdate = true;
      segmentGeometry.attributes.color.needsUpdate = true;
    };

    const resize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    let frameId = 0;
    const render = (time) => {
      const elapsed = time * 5e-5;
      pointer.x += (pointerTarget.x - pointer.x) * 0.06;
      pointer.y += (pointerTarget.y - pointer.y) * 0.06;
      group.rotation.y = elapsed * 0.42 + pointer.x * 0.035;
      group.rotation.x = pointer.y * 0.035;
      particles.rotation.z = elapsed * 0.14;
      for (let i = 0; i < particleCount; i += 1) {
        const i3 = i * 3;
        positions[i3] += particleVelocities[i3];
        positions[i3 + 1] += particleVelocities[i3 + 1];
        positions[i3 + 2] += particleVelocities[i3 + 2];

        if (Math.abs(positions[i3]) > particleBounds.x) {
          particleVelocities[i3] *= -1;
        }

        if (Math.abs(positions[i3 + 1]) > particleBounds.y) {
          particleVelocities[i3 + 1] *= -1;
        }

        if (Math.abs(positions[i3 + 2]) > particleBounds.z) {
          particleVelocities[i3 + 2] *= -1;
        }
      }
      particleGeometry.attributes.position.needsUpdate = true;
      networkGroup.rotation.x = Math.sin(elapsed * 1.8) * 0.12;
      networkGroup.rotation.y = elapsed * 0.32 + pointer.x * 0.08;
      const networkScale = 1 + Math.sin(elapsed * 2.4) * 0.045 + Math.abs(pointer.x) * 0.012;
      networkGroup.scale.setScalar(networkScale);
      updateNetwork(true, elapsed);
      renderer.render(scene, camera);
      frameId = window.requestAnimationFrame(render);
    };

    resize();
    window.addEventListener("resize", resize);
    cleanup.push(() => window.removeEventListener("resize", resize));

    if (reduceMotion) {
      updateNetwork(false);
      renderer.render(scene, camera);
    } else {
      frameId = window.requestAnimationFrame(render);
    }

    cleanup.push(() => {
      window.cancelAnimationFrame(frameId);
      particleGeometry.dispose();
      particles.material.dispose();
      nodeTexture.dispose();
      nodeGeometry.dispose();
      networkNodes.material.dispose();
      segmentGeometry.dispose();
      networkSegments.material.dispose();
      renderer.dispose();
    });

    return () => cleanup.forEach((item) => item());
    };

    initialize().catch(() => {
      // Decorative effects must never block the portfolio from rendering.
    });

    return () => {
      cancelled = true;
      cleanup.forEach((item) => item());
    };
  }, []);

  return (
    <>
      <canvas className="mesh-canvas" ref={canvasRef} aria-hidden="true" />
      <div className="spotlight" ref={spotlightRef} aria-hidden="true" />
    </>
  );
}
