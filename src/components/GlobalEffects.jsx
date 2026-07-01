import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { trackEvent } from "../lib/analytics";

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
      if (isOpen) {
        siteHeader?.classList.remove("is-hidden");
      }
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

      if (navOpen || currentY < 80) {
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

    const getLinkLabel = (anchor) => {
      const label =
        anchor.getAttribute("aria-label") ||
        anchor.getAttribute("title") ||
        anchor.textContent ||
        anchor.getAttribute("href") ||
        "";
      return label.replace(/\s+/g, " ").trim();
    };

    const getProjectMeta = (anchor, url) => {
      const slugFromData = anchor.dataset.projectSlug;
      const typeFromData = anchor.dataset.projectType;
      const slugFromPath = url.pathname.split("/").filter(Boolean)[1] || "";

      return {
        project_slug: slugFromData || slugFromPath,
        project_type: typeFromData || undefined,
      };
    };

    const trackPageView = () => {
      trackEvent("pageview", {
        page_path: window.location.pathname,
        component: "GlobalEffects",
      });
    };

    const trackAnchorClick = (anchor) => {
      const rawHref = anchor.getAttribute("href");
      if (!rawHref) {
        return;
      }

      let url;
      try {
        url = new URL(rawHref, window.location.href);
      } catch {
        return;
      }

      const linkLabel = getLinkLabel(anchor);
      const isInternal = url.origin === window.location.origin;
      const pagePath = window.location.pathname;
      const isNavLink = Boolean(anchor.closest("[data-site-nav]"));
      const isFooterLink = Boolean(anchor.closest(".footer-links"));
      const isProjectCard = Boolean(anchor.closest(".story-card"));
      const isPublicationCard = Boolean(anchor.closest(".publication-card"));
      const isCapabilityNode = Boolean(anchor.closest(".capability-node"));
      const isWorkMapReset = Boolean(anchor.closest("[data-work-map-reset]"));
      const isWorkMapEdge = Boolean(anchor.closest("[data-edge-id]"));

      if (isNavLink) {
        trackEvent("nav_link_click", {
          link_label: linkLabel,
          link_type: "nav",
          page_path: pagePath,
          target_path: url.pathname,
          component: "GlobalEffects",
        });
      }

      if (url.pathname === "/contact/") {
        trackEvent("contact_link_click", {
          link_label: linkLabel,
          link_type: "internal",
          page_path: pagePath,
          target_path: url.pathname,
          component: "GlobalEffects",
        });
      }

      if (!isInternal) {
        const destinationDomain = url.hostname;
        const sourceCodeUrl = "https://github.com/burtonmakes/burtonmakes.github.io";
        const githubUrl = "https://github.com/CocoHusky";
        const linkedinUrl = "https://www.linkedin.com/in/draburton/";
        const scholarUrl = "https://scholar.google.com/citations?user=RAq9IoQAAAAJ&hl=en";
        const isSourceCode = url.href === sourceCodeUrl;
        const isSocialLink = url.href === githubUrl || url.href === linkedinUrl || url.href === scholarUrl;

        if (isFooterLink) {
          trackEvent("footer_link_click", {
            link_label: linkLabel,
            link_type: isSourceCode ? "source" : isSocialLink ? "social" : "external",
            destination_domain: destinationDomain,
            page_path: pagePath,
            component: "GlobalEffects",
          });
        }

        if (isSourceCode) {
          trackEvent("source_code_click", {
            link_label: linkLabel,
            link_type: "source",
            destination_domain: destinationDomain,
            page_path: pagePath,
            component: "GlobalEffects",
          });
        }

        trackEvent("external_link_click", {
          link_label: linkLabel,
          link_type: isSocialLink ? "social" : isSourceCode ? "source" : "external",
          destination_domain: destinationDomain,
          page_path: pagePath,
          component: "GlobalEffects",
        });
        return;
      }

      if (isFooterLink) {
        trackEvent("footer_link_click", {
          link_label: linkLabel,
          link_type: "internal",
          page_path: pagePath,
          target_path: url.pathname,
          component: "GlobalEffects",
        });
      }

      if (isProjectCard || url.pathname.startsWith("/projects/")) {
        const projectMeta = getProjectMeta(anchor, url);

        if (isProjectCard) {
          trackEvent("project_card_open", {
            link_label: linkLabel,
            page_path: pagePath,
            target_path: url.pathname,
            component: "GlobalEffects",
            ...projectMeta,
          });
        }

        trackEvent("project_link_click", {
          link_label: linkLabel,
          page_path: pagePath,
          target_path: url.pathname,
          component: "GlobalEffects",
          ...projectMeta,
        });
      }

      if (isPublicationCard && !url.pathname.startsWith("/projects/")) {
        trackEvent("project_link_click", {
          link_label: linkLabel,
          page_path: pagePath,
          target_path: url.pathname,
          component: "GlobalEffects",
        });
      }

      if (isCapabilityNode) {
        trackEvent("work_map_node_click", {
          node_id: anchor.closest(".capability-node")?.getAttribute("data-node-id") || "",
          capability: anchor.closest(".capability-node")?.getAttribute("data-capability") || "",
          page_path: pagePath,
          component: "WorkMap",
        });
      }

      if (isWorkMapEdge) {
        trackEvent("work_map_edge_click", {
          edge_id: anchor.closest("[data-edge-id]")?.getAttribute("data-edge-id") || "",
          page_path: pagePath,
          component: "WorkMap",
        });
      }

      if (isWorkMapReset) {
        trackEvent("work_map_reset", {
          page_path: pagePath,
          component: "WorkMap",
        });
      }
    };

    const onPageLoad = () => trackPageView();
    const onDocumentClick = (event) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      const anchor = target.closest("a");
      if (anchor) {
        trackAnchorClick(anchor);
        return;
      }

      const capabilityNode = target.closest(".capability-node");
      if (capabilityNode) {
        trackEvent("work_map_node_click", {
          node_id: capabilityNode.getAttribute("data-node-id") || "",
          capability: capabilityNode.getAttribute("data-capability") || "",
          page_path: window.location.pathname,
          component: "WorkMap",
        });
      }
    };

    const trackedImpressions = new WeakSet();
    const impressionTargets = [...document.querySelectorAll("[data-analytics-impression]")];
    if (typeof IntersectionObserver !== "undefined" && impressionTargets.length > 0) {
      const impressionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting || entry.intersectionRatio < 0.55) {
              return;
            }

            const element = entry.target;
            if (trackedImpressions.has(element)) {
              return;
            }

            trackedImpressions.add(element);
            trackEvent("content_impression", {
              content_type: element.getAttribute("data-analytics-impression") || "",
              content_id: element.getAttribute("data-analytics-id") || "",
              content_label: element.getAttribute("data-analytics-label") || "",
              page_path: window.location.pathname,
              component: "GlobalEffects",
            });
            impressionObserver.unobserve(element);
          });
        },
        { threshold: [0.55] }
      );

      impressionTargets.forEach((element) => impressionObserver.observe(element));
      cleanup.push(() => impressionObserver.disconnect());
    }

    trackPageView();
    document.addEventListener("astro:page-load", onPageLoad);
    document.addEventListener("click", onDocumentClick, true);
    cleanup.push(() => document.removeEventListener("astro:page-load", onPageLoad));
    cleanup.push(() => document.removeEventListener("click", onDocumentClick, true));

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
          trackEvent("search_or_filter_used", {
            filter_name: "topic",
            filter_value: button.getAttribute("data-topic") || "all",
            page_path: window.location.pathname,
            component: "GlobalEffects",
          });
          trackEvent("capability_filter_select", {
            capability: button.getAttribute("data-topic") || "all",
            page_path: window.location.pathname,
            component: "GlobalEffects",
          });
          applyFilter();
        };
        button.addEventListener("click", onClick);
        cleanup.push(() => button.removeEventListener("click", onClick));
      });

      statusButtons.forEach((button) => {
        const onClick = () => {
          statusButtons.forEach((item) => item.classList.remove("is-active"));
          button.classList.add("is-active");
          trackEvent("search_or_filter_used", {
            filter_name: "status",
            filter_value: button.getAttribute("data-status") || "all",
            page_path: window.location.pathname,
            component: "GlobalEffects",
          });
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
