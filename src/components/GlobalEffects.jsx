import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as THREE from "three";

export default function GlobalEffects() {
  const canvasRef = useRef(null);
  const spotlightRef = useRef(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hasFinePointer = window.matchMedia("(pointer: fine)").matches;
    const pointer = { x: 0, y: 0 };
    const cleanup = [];

    gsap.set(".reveal", { autoAlpha: 0, y: 24 });
    gsap.utils.toArray(".reveal").forEach((element, index) => {
      const tween = gsap.to(element, {
        autoAlpha: 1,
        y: 0,
        duration: 0.78,
        delay: Math.min(index * 0.02, 0.18),
        ease: "power3.out",
        scrollTrigger: {
          trigger: element,
          start: "top 88%",
          once: true,
        },
      });
      cleanup.push(() => tween.kill());
    });

    gsap.utils.toArray("[data-count]").forEach((element) => {
      const rawValue = element.dataset.count;
      const target = Number(rawValue.replace("+", ""));
      const suffix = rawValue.includes("+") ? "+" : "";
      const state = { value: 0 };
      const tween = gsap.to(state, {
        value: target,
        duration: 1.2,
        ease: "power2.out",
        scrollTrigger: {
          trigger: element,
          start: "top 90%",
          once: true,
        },
        onUpdate: () => {
          element.textContent = `${Math.round(state.value)}${suffix}`;
        },
      });
      cleanup.push(() => tween.kill());
    });

    const navLinks = [...document.querySelectorAll("[data-site-nav] a")];
    const currentPath = window.location.pathname;
    navLinks.forEach((link) => {
      const href = link.getAttribute("href");
      const active = href === "/" ? currentPath === "/" : currentPath.startsWith(href);
      link.classList.toggle("active", active);
    });

    const navPanel = document.querySelector("[data-mobile-nav]");
    const navButton = document.querySelector("[data-nav-toggle]");
    const closeNav = () => {
      navPanel?.classList.remove("open");
      navButton?.setAttribute("aria-expanded", "false");
    };
    const toggleNav = () => {
      const isOpen = navPanel?.classList.toggle("open") ?? false;
      navButton?.setAttribute("aria-expanded", String(isOpen));
    };

    navButton?.addEventListener("click", toggleNav);
    cleanup.push(() => navButton?.removeEventListener("click", toggleNav));

    navPanel?.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeNav));
    cleanup.push(() => {
      navPanel?.querySelectorAll("a").forEach((link) => link.removeEventListener("click", closeNav));
    });

    const filterGroups = [...document.querySelectorAll("[data-filter-group]")];
    filterGroups.forEach((group) => {
      const topicButtons = [...group.querySelectorAll("[data-filter-button][data-topic]")];
      const statusButtons = [...group.querySelectorAll("[data-filter-button][data-status]")];
      const listId = group.getAttribute("data-target-list");
      const cards = listId ? [...document.querySelectorAll(`[data-filter-card="${listId}"]`)] : [];

      const applyFilter = () => {
        const activeTopic = group.querySelector("[data-filter-button][data-topic].is-active")?.getAttribute("data-topic") ?? "all";
        const activeStatus =
          group.querySelector("[data-filter-button][data-status].is-active")?.getAttribute("data-status") ?? "all";

        cards.forEach((card) => {
          const topics = (card.getAttribute("data-topics") || "").split("|");
          const status = card.getAttribute("data-status") || "";
          const topicMatch = activeTopic === "all" || topics.includes(activeTopic);
          const statusMatch = activeStatus === "all" || status === activeStatus;
          card.hidden = !(topicMatch && statusMatch);
        });
      };

      topicButtons.forEach((button) => {
        const onClick = () => {
          topicButtons.forEach((item) => item.classList.remove("is-active"));
          button.classList.add("is-active");
          applyFilter();
        };
        button.addEventListener("click", onClick);
        cleanup.push(() => button.removeEventListener("click", onClick));
      });

      statusButtons.forEach((button) => {
        const onClick = () => {
          statusButtons.forEach((item) => item.classList.remove("is-active"));
          button.classList.add("is-active");
          applyFilter();
        };
        button.addEventListener("click", onClick);
        cleanup.push(() => button.removeEventListener("click", onClick));
      });

      applyFilter();
    });

    const onPointerMove = (event) => {
      pointer.x = (event.clientX / window.innerWidth - 0.5) * 2;
      pointer.y = (event.clientY / window.innerHeight - 0.5) * 2;

      if (spotlightRef.current) {
        gsap.to(spotlightRef.current, {
          x: event.clientX - 260,
          y: event.clientY - 260,
          opacity: 1,
          duration: 0.24,
          overwrite: true,
        });
      }
    };

    if (hasFinePointer) {
      window.addEventListener("pointermove", onPointerMove);
      cleanup.push(() => window.removeEventListener("pointermove", onPointerMove));
    }

    if (!reduceMotion && hasFinePointer) {
      document.querySelectorAll(".tilt-card").forEach((card) => {
        const onMove = (event) => {
          const rect = card.getBoundingClientRect();
          const x = (event.clientX - rect.left) / rect.width - 0.5;
          const y = (event.clientY - rect.top) / rect.height - 0.5;
          gsap.to(card, {
            rotateX: y * -6,
            rotateY: x * 6,
            y: -2,
            transformPerspective: 900,
            duration: 0.16,
            overwrite: true,
          });
        };
        const onLeave = () => gsap.to(card, { rotateX: 0, rotateY: 0, y: 0, duration: 0.24 });
        card.addEventListener("pointermove", onMove);
        card.addEventListener("pointerleave", onLeave);
        cleanup.push(() => {
          card.removeEventListener("pointermove", onMove);
          card.removeEventListener("pointerleave", onLeave);
        });
      });
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

    const particleCount = window.innerWidth < 640 ? 520 : window.innerWidth < 960 ? 760 : 1100;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const palette = [new THREE.Color("#63f4ff"), new THREE.Color("#7ef7c2"), new THREE.Color("#ff936b")];

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
        size: 0.036,
        transparent: true,
        opacity: 0.78,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    group.add(particles);

    const ring = new THREE.Mesh(
      new THREE.TorusKnotGeometry(1.46, 0.008, 240, 12, 2, 5),
      new THREE.MeshBasicMaterial({ color: 0x63f4ff, transparent: true, opacity: 0.38 })
    );
    ring.position.set(2.4, 0.22, -0.9);
    group.add(ring);

    const beam = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-4.2, -1.5, -1.8),
        new THREE.Vector3(-1.6, 0.7, -1.1),
        new THREE.Vector3(0.4, -0.3, -1.0),
        new THREE.Vector3(3.7, 1.4, -1.5),
      ]),
      new THREE.LineBasicMaterial({ color: 0x7ef7c2, transparent: true, opacity: 0.18 })
    );
    group.add(beam);

    const resize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    let frameId = 0;
    const render = (time) => {
      const elapsed = time * 0.00034;
      group.rotation.y = elapsed + pointer.x * 0.08;
      group.rotation.x = pointer.y * 0.05;
      particles.rotation.z = elapsed * 0.42;
      ring.rotation.x = elapsed * 1.5;
      ring.rotation.y = elapsed * 1.1;
      beam.position.x = Math.sin(elapsed * 1.5) * 0.18;
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
      beam.geometry.dispose();
      beam.material.dispose();
      renderer.dispose();
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
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
