import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as THREE from "three";

const brandName = "Burton Makes";

const projects = [
  ["01", "Project Alpha", "Modular hardware platform concept for rapid experimental build cycles."],
  ["02", "Nova System", "Ambient control layer for future-facing lab workflows and toolchains."],
  ["03", "Prototype X", "Exploratory interface language for physical products and AI systems."],
  ["04", "Signal Lab", "Visual diagnostics, sensor studies, and interaction experiments."],
  ["05", "Wearable One", "Compact wearable concept with a refined enclosure and systems language."],
  ["06", "Interface Zero", "High-contrast software surface for controlling prototype environments."],
];

const capabilities = ["Hardware", "Wearables", "3D Printing", "Bioengineering", "AI Systems", "Prototypes"];

const metrics = [
  ["12", "concepts"],
  ["48", "iterations"],
  ["6", "active systems"],
  ["100+", "design hours"],
];

function Brand() {
  return (
    <a className="brand" href="#top" aria-label={`${brandName} home`}>
      <span className="brand-mark" />
      <span className="brand-name">{brandName}</span>
    </a>
  );
}

export default function LandingPage() {
  const canvasRef = useRef(null);
  const spotlightRef = useRef(null);
  const navRef = useRef(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hasFinePointer = window.matchMedia("(pointer: fine)").matches;
    const pointer = { x: 0, y: 0 };
    const cleanup = [];

    gsap.set(".reveal", { autoAlpha: 0, y: 26 });
    gsap.utils.toArray(".reveal").forEach((element) => {
      const tween = gsap.to(element, {
        autoAlpha: 1,
        y: 0,
        duration: 0.95,
        ease: "power3.out",
        scrollTrigger: {
          trigger: element,
          start: "top 86%",
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
        duration: 1.45,
        ease: "power2.out",
        scrollTrigger: {
          trigger: element,
          start: "top 88%",
          once: true,
        },
        onUpdate: () => {
          element.textContent = `${Math.round(state.value)}${suffix}`;
        },
      });
      cleanup.push(() => tween.kill());
    });

    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          document.querySelectorAll(".nav-links a").forEach((link) => {
            link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
          });
        });
      },
      { rootMargin: "-42% 0px -48% 0px", threshold: 0.01 }
    );

    document.querySelectorAll("main section[id]").forEach((section) => navObserver.observe(section));
    cleanup.push(() => navObserver.disconnect());

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
            rotateX: y * -7,
            rotateY: x * 7,
            y: -3,
            transformPerspective: 900,
            duration: 0.18,
            overwrite: true,
          });
        };
        const onLeave = () => gsap.to(card, { rotateX: 0, rotateY: 0, y: 0, duration: 0.28 });

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
    const palette = [new THREE.Color("#58f5ff"), new THREE.Color("#99ffbf"), new THREE.Color("#ff6fa8")];

    for (let i = 0; i < particleCount; i += 1) {
      const i3 = i * 3;
      const radius = 2.2 + Math.random() * 5.1;
      const angle = Math.random() * Math.PI * 2;
      const depth = (Math.random() - 0.5) * 6.2;
      const color = palette[i % palette.length];

      positions[i3] = Math.cos(angle) * radius;
      positions[i3 + 1] = Math.sin(angle) * radius * 0.58 + (Math.random() - 0.5) * 1.5;
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
        size: 0.034,
        transparent: true,
        opacity: 0.78,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    group.add(particles);

    const ring = new THREE.Mesh(
      new THREE.TorusKnotGeometry(1.48, 0.006, 240, 12, 2, 5),
      new THREE.MeshBasicMaterial({ color: 0x58f5ff, transparent: true, opacity: 0.42 })
    );
    ring.position.set(2.5, 0.16, -0.8);
    group.add(ring);

    const line = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-4.6, -1.6, -1.8),
        new THREE.Vector3(-1.8, 0.8, -1.1),
        new THREE.Vector3(0.4, -0.35, -0.9),
        new THREE.Vector3(3.8, 1.5, -1.5),
      ]),
      new THREE.LineBasicMaterial({ color: 0x99ffbf, transparent: true, opacity: 0.2 })
    );
    group.add(line);

    const resize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    let frameId = 0;
    const render = (time) => {
      const elapsed = time * 0.00035;
      group.rotation.y = elapsed + pointer.x * 0.08;
      group.rotation.x = pointer.y * 0.05;
      particles.rotation.z = elapsed * 0.42;
      ring.rotation.x = elapsed * 1.6;
      ring.rotation.y = elapsed * 1.1;
      line.position.x = Math.sin(elapsed * 1.6) * 0.2;
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
      line.geometry.dispose();
      line.material.dispose();
      renderer.dispose();
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    });

    return () => cleanup.forEach((item) => item());
  }, []);

  const toggleNav = () => {
    const nextState = navRef.current?.classList.toggle("open") ?? false;
    document.querySelector(".nav-toggle")?.setAttribute("aria-expanded", String(nextState));
  };

  const closeNav = () => {
    navRef.current?.classList.remove("open");
    document.querySelector(".nav-toggle")?.setAttribute("aria-expanded", "false");
  };

  return (
    <>
      <canvas className="mesh-canvas" ref={canvasRef} aria-hidden="true" />
      <div className="spotlight" ref={spotlightRef} aria-hidden="true" />

      <header className="site-header" id="top">
        <nav className="nav" aria-label="Primary navigation">
          <Brand />
          <button className="nav-toggle" type="button" aria-label="Toggle navigation" aria-expanded="false" onClick={toggleNav}>
            <span />
            <span />
          </button>
          <div className="nav-links" ref={navRef}>
            {["projects", "capabilities", "metrics", "gallery"].map((item) => (
              <a href={`#${item}`} onClick={closeNav} key={item}>
                {item[0].toUpperCase() + item.slice(1)}
              </a>
            ))}
          </div>
        </nav>
      </header>

      <main>
        <section className="hero section" aria-labelledby="hero-title">
          <div className="hero-copy reveal">
            <p className="eyebrow">Future-facing project studio</p>
            <h1 id="hero-title">{brandName} experimental systems for what comes next.</h1>
            <p className="hero-text">
              Building hardware, wearables, 3D printing concepts, bioengineering explorations, and AI-powered
              interfaces with a cinematic systems-first approach.
            </p>
            <div className="hero-actions" aria-label="Primary actions">
              <a className="button button-primary" href="#projects">Explore concepts</a>
              <a className="button button-secondary" href="#gallery">View previews</a>
            </div>
          </div>

          <div className="hero-visual reveal" aria-label="Animated concept interface">
            <div className="interface-shell tilt-card">
              <div className="interface-topbar"><span /><span /><span /></div>
              <div className="interface-grid">
                <div className="scan-panel">
                  <span className="scan-line" />
                  <strong>Prototype X</strong>
                  <small>Signal integrity: 98%</small>
                </div>
                <div className="module-stack"><span /><span /><span /></div>
                <div className="radar"><span /></div>
                <div className="status-board">
                  <p>Active systems</p>
                  <strong>06</strong>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="projects" aria-labelledby="projects-title">
          <div className="section-heading reveal">
            <p className="eyebrow">Featured projects</p>
            <h2 id="projects-title">Placeholder concepts with premium product-site energy.</h2>
          </div>
          <div className="project-grid">
            {projects.map(([index, title, text]) => (
              <article className="project-card tilt-card reveal" key={title}>
                <span className="project-index">{index}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section split-section" id="capabilities" aria-labelledby="capabilities-title">
          <div className="section-heading reveal">
            <p className="eyebrow">Capabilities</p>
            <h2 id="capabilities-title">A flexible placeholder taxonomy for future build categories.</h2>
          </div>
          <div className="chip-panel reveal">
            {capabilities.map((capability) => <span key={capability}>{capability}</span>)}
          </div>
        </section>

        <section className="section metrics-section" id="metrics" aria-labelledby="metrics-title">
          <div className="section-heading reveal">
            <p className="eyebrow">Metrics</p>
            <h2 id="metrics-title">Fictional numbers for a sharper first impression.</h2>
          </div>
          <div className="metrics-grid">
            {metrics.map(([value, label]) => (
              <article className="metric reveal" key={label}>
                <strong data-count={value}>0</strong>
                <span>{label}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="section" id="gallery" aria-labelledby="gallery-title">
          <div className="section-heading reveal">
            <p className="eyebrow">Concept preview</p>
            <h2 id="gallery-title">Cinematic panels for future project imagery.</h2>
          </div>
          <div className="gallery-grid">
            <article className="gallery-card gallery-large reveal"><span>01</span><h3>Hardware Study</h3></article>
            <article className="gallery-card reveal"><span>02</span><h3>Interface Map</h3></article>
            <article className="gallery-card reveal"><span>03</span><h3>Lab Signal</h3></article>
          </div>
        </section>
      </main>

      <footer className="footer">
        <Brand />
        <p>Futuristic builds, prototypes, and experimental systems.</p>
      </footer>
    </>
  );
}
