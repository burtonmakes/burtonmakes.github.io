import { useEffect, useRef } from "react";
import gsap from "gsap";
import * as THREE from "three";

export default function BackgroundEffects() {
  const canvasRef = useRef(null);
  const spotlightRef = useRef(null);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hasFinePointer = window.matchMedia("(pointer: fine)").matches;
    const pointer = { x: 0, y: 0 };
    const pointerTarget = { x: 0, y: 0 };
    const cleanup = [];

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

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 8);

    const group = new THREE.Group();
    scene.add(group);

    const particleCount = window.innerWidth < 640 ? 360 : window.innerWidth < 960 ? 560 : 820;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const palette = [new THREE.Color("#4c8dff"), new THREE.Color("#6fd3ff"), new THREE.Color("#e86f4e")];

    for (let i = 0; i < particleCount; i += 1) {
      const i3 = i * 3;
      const radius = 2.3 + Math.random() * 5;
      const angle = Math.random() * Math.PI * 2;
      const depth = (Math.random() - 0.5) * 6;
      const color = palette[i % palette.length];

      positions[i3] = Math.cos(angle) * radius;
      positions[i3 + 1] = Math.sin(angle) * radius * 0.6 + (Math.random() - 0.5) * 1.4;
      positions[i3 + 2] = depth;
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const particles = new THREE.Points(
      particleGeometry,
      new THREE.PointsMaterial({
        size: 0.026,
        transparent: true,
        opacity: 0.38,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    group.add(particles);

    const ring = new THREE.Mesh(
      new THREE.TorusKnotGeometry(1.46, 0.008, 240, 12, 2, 5),
      new THREE.MeshBasicMaterial({ color: 0x4c8dff, transparent: true, opacity: 0.2 })
    );
    ring.position.set(2.4, 0.22, -0.9);
    group.add(ring);

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
      ring.rotation.x = elapsed * 0.38;
      ring.rotation.y = elapsed * 0.28;
      renderer.render(scene, camera);
      frameId = window.requestAnimationFrame(render);
    };

    resize();
    window.addEventListener("resize", resize);
    cleanup.push(() => window.removeEventListener("resize", resize));

    if (reduceMotion) {
      renderer.render(scene, camera);
    } else {
      frameId = window.requestAnimationFrame(render);
    }

    cleanup.push(() => {
      window.cancelAnimationFrame(frameId);
      particleGeometry.dispose();
      particles.material.dispose();
      ring.geometry.dispose();
      ring.material.dispose();
      renderer.dispose();
    });

    return () => cleanup.forEach((item) => item());
  }, []);

  return (
    <>
      <canvas className="mesh-canvas" ref={canvasRef} aria-hidden="true" />
      <div className="spotlight" ref={spotlightRef} aria-hidden="true" />
    </>
  );
}
