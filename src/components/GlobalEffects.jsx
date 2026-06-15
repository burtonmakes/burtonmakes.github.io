import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function GlobalEffects() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hasFinePointer = window.matchMedia("(pointer: fine)").matches;
    const cleanup = [];
    gsap.set(".reveal", { autoAlpha: 0, y: 18 });
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
    const siteHeader = document.querySelector(".site-header");
    let lastScrollY = window.scrollY;
    let headerRaf = 0;
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

    const updateHeaderVisibility = () => {
      const currentY = window.scrollY;
      const navOpen = navPanel?.classList.contains("open");

      if (!siteHeader) {
        return;
      }

      if (navOpen || currentY < 24) {
        siteHeader.classList.remove("is-hidden");
      } else if (currentY > lastScrollY + 8) {
        siteHeader.classList.add("is-hidden");
      } else if (currentY < lastScrollY - 4) {
        siteHeader.classList.remove("is-hidden");
      }

      lastScrollY = currentY;
    };

    const onHeaderScroll = () => {
      if (headerRaf) return;
      headerRaf = window.requestAnimationFrame(() => {
        headerRaf = 0;
        updateHeaderVisibility();
      });
    };

    updateHeaderVisibility();
    window.addEventListener("scroll", onHeaderScroll, { passive: true });
    cleanup.push(() => window.removeEventListener("scroll", onHeaderScroll));

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

    cleanup.push(() => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    });

    return () => cleanup.forEach((item) => item());
  }, []);

  return null;
}
