(() => {
  if (window.__burtonRecruiterResponseGuardLoaded) return;
  window.__burtonRecruiterResponseGuardLoaded = true;

  const nativeFetch = window.fetch.bind(window);
  const parserFailurePattern =
    /expected\s+['"`]?[,}\]]|array element|object property|unexpected token|unterminated|parseable json|json at position/i;
  const minimumAnalysisDurationMs = 7_500;
  const stageBoundariesMs = [0, 2_500, 5_000];
  const stageCopy = [
    {
      title: "Understanding the role",
      detail: "Condensing responsibilities, requirements, and recruiter context.",
    },
    {
      title: "Searching portfolio evidence",
      detail: "Retrieving the strongest matching work and project sources.",
    },
    {
      title: "Building the sourced review",
      detail: "Validating evidence and assembling the recruiter-ready summary.",
    },
  ];

  let stageInterval = 0;
  let stageStartedAt = 0;
  let evidenceObserver = null;

  const delay = (milliseconds) =>
    new Promise((resolve) => window.setTimeout(resolve, milliseconds));

  const requestAction = (args) => {
    const init = args[1];
    if (!init || typeof init !== "object" || typeof init.body !== "string") {
      return "";
    }

    try {
      const payload = JSON.parse(init.body);
      return payload?.action === "analyze" || payload?.action === "chat"
        ? payload.action
        : "";
    } catch {
      return "";
    }
  };

  const sanitizeRecruiterResponse = async (response) => {
    let payload;
    try {
      payload = await response.clone().json();
    } catch {
      return response;
    }

    if (!parserFailurePattern.test(String(payload?.error || ""))) {
      return response;
    }

    const cleanPayload = {
      ...payload,
      error:
        "The role review could not be completed cleanly. Please run the analysis again.",
      code: "model_output_invalid",
    };

    return new Response(JSON.stringify(cleanPayload), {
      status: response.status || 502,
      statusText: response.statusText,
      headers: response.headers,
    });
  };

  window.fetch = async (...args) => {
    const action = requestAction(args);
    const startedAt = performance.now();
    const response = await nativeFetch(...args);
    const sanitized = await sanitizeRecruiterResponse(response);

    if (action === "analyze") {
      const elapsed = performance.now() - startedAt;
      await delay(Math.max(0, minimumAnalysisDurationMs - elapsed));
    }

    return sanitized;
  };

  const setVisibleStage = (loader, index) => {
    const safeIndex = Math.max(0, Math.min(index, stageCopy.length - 1));
    const title = loader.querySelector("[data-analysis-loader-title]");
    const detail = loader.querySelector("[data-analysis-loader-detail]");
    const steps = [...loader.querySelectorAll("[data-analysis-loader-step]")];

    if (title) title.textContent = stageCopy[safeIndex].title;
    if (detail) detail.textContent = stageCopy[safeIndex].detail;

    steps.forEach((step, stepIndex) => {
      step.dataset.stepState =
        stepIndex < safeIndex
          ? "complete"
          : stepIndex === safeIndex
            ? "active"
            : "upcoming";
    });
  };

  const stopStageClock = () => {
    if (stageInterval) window.clearInterval(stageInterval);
    stageInterval = 0;
    stageStartedAt = 0;
  };

  const startStageClock = (loader) => {
    stopStageClock();
    stageStartedAt = performance.now();
    setVisibleStage(loader, 0);

    stageInterval = window.setInterval(() => {
      if (
        loader.hidden ||
        !loader.classList.contains("is-visible") ||
        loader.dataset.state === "complete"
      ) {
        stopStageClock();
        return;
      }

      const elapsed = performance.now() - stageStartedAt;
      const stageIndex =
        elapsed >= stageBoundariesMs[2]
          ? 2
          : elapsed >= stageBoundariesMs[1]
            ? 1
            : 0;
      setVisibleStage(loader, stageIndex);
    }, 120);
  };

  const watchLoader = () => {
    const loader = document.querySelector("[data-recruiter-analysis-progress]");
    if (!loader || loader.dataset.timingGuardReady === "true") return;

    loader.dataset.timingGuardReady = "true";
    const observer = new MutationObserver(() => {
      if (
        !loader.hidden &&
        loader.classList.contains("is-visible") &&
        loader.dataset.state !== "complete"
      ) {
        if (!stageInterval) startStageClock(loader);
      } else if (loader.dataset.state === "complete" || loader.hidden) {
        stopStageClock();
      }
    });

    observer.observe(loader, {
      attributes: true,
      attributeFilter: ["class", "hidden", "data-state"],
    });
  };

  const ensureEvidenceCardStyles = () => {
    if (document.querySelector("#recruiter-evidence-card-link-styles")) return;

    const style = document.createElement("style");
    style.id = "recruiter-evidence-card-link-styles";
    style.textContent = `
      .evidence-card[data-card-link-ready="true"] {
        cursor: pointer;
      }

      .evidence-card[data-card-link-ready="true"]:focus-visible {
        border-color: var(--cta-1);
        box-shadow:
          inset 0 1px rgba(255, 255, 255, 0.06),
          0 0 0 3px color-mix(in srgb, var(--cta-1), transparent 76%),
          0 14px 34px rgba(0, 0, 0, 0.22);
        outline: none;
        transform: translateY(-1px);
      }

      .evidence-card[data-card-link-ready="true"] .card-tag-row {
        order: 3;
        margin-top: 14px;
      }

      .evidence-card[data-card-link-ready="true"] .evidence-match-label {
        pointer-events: none;
        cursor: default;
      }

      .evidence-card[data-card-link-ready="true"] .evidence-match-label:hover,
      .evidence-card[data-card-link-ready="true"] .evidence-match-label:focus-visible {
        border-color: color-mix(in srgb, var(--cta-1), transparent 52%);
        background: color-mix(in srgb, var(--cta-1), transparent 91%);
        box-shadow: none;
        color: var(--text);
      }
    `;
    document.head.append(style);
  };

  const prepareEvidenceCards = () => {
    if (
      window.location.pathname !== "/recruiter/" &&
      window.location.pathname !== "/recruiter"
    ) {
      return;
    }

    ensureEvidenceCardStyles();

    document
      .querySelectorAll('.evidence-card:not([data-card-link-ready="true"])')
      .forEach((card) => {
        const tagRow = card.querySelector("[data-card-requirements]");
        const sourceButton = tagRow?.querySelector("button");
        const summary = card.querySelector("[data-card-summary]");
        const title = card.querySelector("[data-card-title]")?.textContent?.trim();

        if (!tagRow || !sourceButton) return;

        const openEvidence = () => sourceButton.click();

        [...tagRow.querySelectorAll("button")].forEach((button) => {
          const tag = document.createElement("span");
          tag.className = button.className;
          tag.textContent = button.textContent;
          tagRow.replaceChild(tag, button);
        });

        if (summary) summary.after(tagRow);

        card.dataset.cardLinkReady = "true";
        card.tabIndex = 0;
        card.setAttribute("role", "link");
        card.setAttribute(
          "aria-label",
          title ? `Open ${title}` : "Open portfolio evidence",
        );
        card.addEventListener("click", openEvidence);
        card.addEventListener("keydown", (event) => {
          if (event.key !== "Enter" && event.key !== " ") return;
          event.preventDefault();
          openEvidence();
        });
      });
  };

  const watchEvidenceCards = () => {
    if (
      window.location.pathname !== "/recruiter/" &&
      window.location.pathname !== "/recruiter"
    ) {
      evidenceObserver?.disconnect();
      evidenceObserver = null;
      return;
    }

    prepareEvidenceCards();
    if (evidenceObserver) return;

    const page = document.querySelector("[data-recruiter-portal]");
    if (!page) return;

    evidenceObserver = new MutationObserver(prepareEvidenceCards);
    evidenceObserver.observe(page, { childList: true, subtree: true });
  };

  const prepare = () => {
    watchLoader();
    watchEvidenceCards();
    window.setTimeout(watchLoader, 0);
    window.setTimeout(watchEvidenceCards, 0);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", prepare, { once: true });
  } else {
    prepare();
  }

  document.addEventListener("astro:page-load", prepare);
})();
