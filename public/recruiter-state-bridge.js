(() => {
  if (window.__burtonRecruiterStateBridgeLoaded) return;
  window.__burtonRecruiterStateBridgeLoaded = true;

  const storageKey = "burton-recruiter-onepage-session-v3";
  const nativeGetItem = Storage.prototype.getItem;
  const nativeSetItem = Storage.prototype.setItem;
  const originalFetch = window.fetch.bind(window);
  const loaderSteps = [
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

  let latestChatSources = [];
  let contextReloadScheduled = false;
  let activeLoader = null;
  let loaderStepTimers = [];
  let analysisStartedAt = 0;

  const isRecruiterRoute = () =>
    window.location.pathname === "/recruiter/" ||
    window.location.pathname === "/recruiter";

  const delay = (milliseconds) =>
    new Promise((resolve) => window.setTimeout(resolve, milliseconds));

  const resetUsageForUtcDay = () => {
    try {
      const raw = nativeGetItem.call(window.localStorage, storageKey);
      if (!raw) return;
      const state = JSON.parse(raw);
      const today = new Date().toISOString().slice(0, 10);
      if (state.usageDay === today) return;
      state.usageDay = today;
      state.analysisRemaining = 10;
      state.chatRemaining = 5;
      nativeSetItem.call(window.localStorage, storageKey, JSON.stringify(state));
    } catch {}
  };

  const ensureLoaderStyles = () => {
    if (document.querySelector("#recruiter-analysis-progress-styles")) return;

    const style = document.createElement("style");
    style.id = "recruiter-analysis-progress-styles";
    style.textContent = `
      .recruiter-analysis-progress[hidden] {
        display: none !important;
      }

      .recruiter-analysis-progress {
        position: relative;
        display: grid;
        grid-template-columns: auto minmax(0, 1fr);
        gap: 16px;
        margin-top: 14px;
        padding: 17px 18px 16px;
        overflow: hidden;
        border: 1px solid color-mix(in srgb, var(--accent, #4c8dff), transparent 58%);
        border-radius: 12px;
        background:
          radial-gradient(circle at 12% 0%, rgba(91, 214, 255, 0.12), transparent 34%),
          linear-gradient(135deg, rgba(76, 141, 255, 0.08), rgba(255, 255, 255, 0.018) 58%, rgba(241, 126, 90, 0.05));
        box-shadow:
          inset 0 1px 0 rgba(255, 255, 255, 0.04),
          0 16px 40px rgba(0, 0, 0, 0.18);
        opacity: 0;
        transform: translateY(6px);
        transition: opacity 180ms ease, transform 180ms ease, border-color 180ms ease;
      }

      .recruiter-analysis-progress.is-visible {
        opacity: 1;
        transform: translateY(0);
      }

      .recruiter-analysis-progress::after {
        content: "";
        position: absolute;
        inset: 0;
        pointer-events: none;
        background: linear-gradient(105deg, transparent 34%, rgba(91, 214, 255, 0.055) 48%, transparent 62%);
        transform: translateX(-110%);
        animation: recruiter-analysis-scan 2.8s ease-in-out infinite;
      }

      .recruiter-analysis-orb {
        position: relative;
        width: 42px;
        height: 42px;
        margin-top: 1px;
        border: 1px solid rgba(91, 214, 255, 0.3);
        border-radius: 50%;
        background: rgba(5, 18, 30, 0.82);
        box-shadow: 0 0 28px rgba(76, 141, 255, 0.16);
      }

      .recruiter-analysis-orb::before,
      .recruiter-analysis-orb::after {
        content: "";
        position: absolute;
        border-radius: 50%;
      }

      .recruiter-analysis-orb::before {
        inset: 7px;
        border: 2px solid transparent;
        border-top-color: #5bd6ff;
        border-right-color: rgba(91, 214, 255, 0.32);
        animation: recruiter-analysis-orbit 1.05s linear infinite;
      }

      .recruiter-analysis-orb::after {
        inset: 16px;
        background: #5bd6ff;
        box-shadow: 0 0 14px rgba(91, 214, 255, 0.88);
        animation: recruiter-analysis-pulse 1.35s ease-in-out infinite;
      }

      .recruiter-analysis-content {
        position: relative;
        z-index: 1;
        min-width: 0;
      }

      .recruiter-analysis-kicker {
        display: block;
        margin-bottom: 4px;
        color: var(--accent-2, #5bd6ff);
        font-size: 0.66rem;
        font-weight: 800;
        letter-spacing: 0.1em;
        text-transform: uppercase;
      }

      .recruiter-analysis-title {
        display: block;
        color: var(--text, #f6faff);
        font-size: 0.94rem;
        line-height: 1.25;
      }

      .recruiter-analysis-detail {
        display: block;
        margin-top: 4px;
        color: var(--muted, #a9bcd7);
        font-size: 0.76rem;
        line-height: 1.4;
      }

      .recruiter-analysis-rail {
        position: relative;
        grid-column: 1 / -1;
        height: 3px;
        margin-top: 1px;
        overflow: hidden;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.075);
      }

      .recruiter-analysis-rail span {
        position: absolute;
        inset-block: 0;
        width: 34%;
        border-radius: inherit;
        background: linear-gradient(90deg, transparent, #5bd6ff 42%, #f0a55f 100%);
        box-shadow: 0 0 14px rgba(91, 214, 255, 0.34);
        animation: recruiter-analysis-rail 1.55s ease-in-out infinite;
      }

      .recruiter-analysis-progress[data-state="complete"] {
        border-color: rgba(91, 214, 255, 0.48);
      }

      .recruiter-analysis-progress[data-state="complete"] .recruiter-analysis-orb::before {
        inset: 10px;
        border: 0;
        border-radius: 2px;
        background: transparent;
        box-shadow: none;
        transform: rotate(-45deg);
        animation: none;
      }

      .recruiter-analysis-progress[data-state="complete"] .recruiter-analysis-orb::after {
        inset: 12px 10px 13px 13px;
        border: solid #5bd6ff;
        border-width: 0 0 2px 2px;
        border-radius: 1px;
        background: transparent;
        box-shadow: none;
        transform: rotate(-45deg);
        animation: none;
      }

      .recruiter-analysis-progress[data-state="complete"] .recruiter-analysis-rail span {
        width: 100%;
        transform: translateX(0);
        animation: none;
      }

      .recruiter-analysis-steps {
        position: relative;
        z-index: 1;
        grid-column: 1 / -1;
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 8px;
        margin: 0;
        padding: 0;
        list-style: none;
      }

      .recruiter-analysis-step {
        display: flex;
        gap: 7px;
        align-items: center;
        min-width: 0;
        color: color-mix(in srgb, var(--muted, #a9bcd7), transparent 34%);
        font-size: 0.68rem;
        font-weight: 700;
        line-height: 1.25;
        transition: color 180ms ease, opacity 180ms ease;
      }

      .recruiter-analysis-step i {
        flex: 0 0 auto;
        width: 7px;
        height: 7px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.04);
        transition: background 180ms ease, border-color 180ms ease, box-shadow 180ms ease;
      }

      .recruiter-analysis-step[data-step-state="active"] {
        color: var(--text, #f6faff);
      }

      .recruiter-analysis-step[data-step-state="active"] i {
        border-color: #5bd6ff;
        background: #5bd6ff;
        box-shadow: 0 0 12px rgba(91, 214, 255, 0.75);
        animation: recruiter-analysis-pulse 1.2s ease-in-out infinite;
      }

      .recruiter-analysis-step[data-step-state="complete"] {
        color: var(--muted-2, #e6eef8);
      }

      .recruiter-analysis-step[data-step-state="complete"] i {
        border-color: rgba(91, 214, 255, 0.72);
        background: rgba(91, 214, 255, 0.72);
      }

      .role-entry-panel[aria-busy="true"] [data-role-text] {
        opacity: 0.72;
        cursor: progress;
      }

      [data-analyze-role].is-processing {
        position: relative;
        padding-left: 43px;
        cursor: progress;
      }

      [data-analyze-role].is-processing::before {
        content: "";
        position: absolute;
        left: 17px;
        width: 15px;
        height: 15px;
        border: 2px solid rgba(0, 0, 0, 0.22);
        border-top-color: currentColor;
        border-radius: 50%;
        animation: recruiter-analysis-orbit 0.8s linear infinite;
      }

      .portal-status[data-loader-muted="true"] {
        display: none;
      }

      @keyframes recruiter-analysis-orbit {
        to { transform: rotate(360deg); }
      }

      @keyframes recruiter-analysis-pulse {
        0%, 100% { opacity: 0.55; transform: scale(0.9); }
        50% { opacity: 1; transform: scale(1.08); }
      }

      @keyframes recruiter-analysis-rail {
        0% { transform: translateX(-115%); }
        100% { transform: translateX(395%); }
      }

      @keyframes recruiter-analysis-scan {
        0%, 16% { transform: translateX(-110%); }
        78%, 100% { transform: translateX(110%); }
      }

      @media (max-width: 640px) {
        .recruiter-analysis-progress {
          grid-template-columns: 36px minmax(0, 1fr);
          gap: 12px;
          padding: 15px;
        }

        .recruiter-analysis-orb {
          width: 36px;
          height: 36px;
        }

        .recruiter-analysis-steps {
          grid-template-columns: 1fr;
          gap: 6px;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .recruiter-analysis-progress,
        .recruiter-analysis-progress::after,
        .recruiter-analysis-orb::before,
        .recruiter-analysis-orb::after,
        .recruiter-analysis-rail span,
        .recruiter-analysis-step i,
        [data-analyze-role].is-processing::before {
          animation: none !important;
          transition: none !important;
        }

        .recruiter-analysis-rail span {
          left: 0;
          width: 55%;
          background: linear-gradient(90deg, #5bd6ff, #f0a55f);
        }
      }
    `;
    document.head.append(style);
  };

  const ensureAnalysisLoader = () => {
    if (!isRecruiterRoute()) return null;

    ensureLoaderStyles();
    const page = document.querySelector("[data-recruiter-portal]");
    const panel = page?.querySelector(".role-entry-panel");
    const status = page?.querySelector("[data-portal-status]");
    const analyzeButton = page?.querySelector("[data-analyze-role]");
    const clearButton = page?.querySelector("[data-clear-role]");
    const roleText = page?.querySelector("[data-role-text]");
    if (!page || !panel || !status || !analyzeButton || !clearButton || !roleText) {
      return null;
    }

    let loader = page.querySelector("[data-recruiter-analysis-progress]");
    if (!loader) {
      loader = document.createElement("div");
      loader.className = "recruiter-analysis-progress";
      loader.dataset.recruiterAnalysisProgress = "";
      loader.dataset.state = "loading";
      loader.hidden = true;
      loader.setAttribute("role", "status");
      loader.setAttribute("aria-live", "polite");
      loader.setAttribute("aria-atomic", "true");
      loader.innerHTML = `
        <div class="recruiter-analysis-orb" aria-hidden="true"></div>
        <div class="recruiter-analysis-content">
          <span class="recruiter-analysis-kicker">Building your review</span>
          <strong class="recruiter-analysis-title" data-analysis-loader-title>Understanding the role</strong>
          <span class="recruiter-analysis-detail" data-analysis-loader-detail>Condensing responsibilities, requirements, and recruiter context.</span>
        </div>
        <div class="recruiter-analysis-rail" aria-hidden="true"><span></span></div>
        <ol class="recruiter-analysis-steps" aria-label="Role analysis stages">
          <li class="recruiter-analysis-step" data-analysis-loader-step="0"><i aria-hidden="true"></i><span>Read role context</span></li>
          <li class="recruiter-analysis-step" data-analysis-loader-step="1"><i aria-hidden="true"></i><span>Retrieve evidence</span></li>
          <li class="recruiter-analysis-step" data-analysis-loader-step="2"><i aria-hidden="true"></i><span>Build sourced review</span></li>
        </ol>
      `;
      status.before(loader);
    }

    return {
      loader,
      panel,
      status,
      analyzeButton,
      clearButton,
      roleText,
      title: loader.querySelector("[data-analysis-loader-title]"),
      detail: loader.querySelector("[data-analysis-loader-detail]"),
      steps: [...loader.querySelectorAll("[data-analysis-loader-step]")],
    };
  };

  const clearLoaderStepTimers = () => {
    loaderStepTimers.forEach((timer) => window.clearTimeout(timer));
    loaderStepTimers = [];
  };

  const setAnalysisLoaderStep = (index) => {
    if (!activeLoader) return;
    const step = loaderSteps[Math.max(0, Math.min(index, loaderSteps.length - 1))];
    activeLoader.title.textContent = step.title;
    activeLoader.detail.textContent = step.detail;
    activeLoader.steps.forEach((element, stepIndex) => {
      element.dataset.stepState =
        stepIndex < index ? "complete" : stepIndex === index ? "active" : "upcoming";
    });
  };

  const startAnalysisLoader = () => {
    clearLoaderStepTimers();
    activeLoader = ensureAnalysisLoader();
    if (!activeLoader) return;

    analysisStartedAt = performance.now();
    activeLoader.loader.hidden = false;
    activeLoader.loader.dataset.state = "loading";
    activeLoader.panel.setAttribute("aria-busy", "true");
    activeLoader.status.dataset.loaderMuted = "true";
    activeLoader.roleText.dataset.loaderReadonly = String(activeLoader.roleText.readOnly);
    activeLoader.roleText.readOnly = true;
    activeLoader.clearButton.disabled = true;
    activeLoader.analyzeButton.dataset.loaderLabel =
      activeLoader.analyzeButton.textContent?.trim() || "Analyze role";
    activeLoader.analyzeButton.textContent = "Analyzing role";
    activeLoader.analyzeButton.classList.add("is-processing");
    setAnalysisLoaderStep(0);

    window.requestAnimationFrame(() => {
      activeLoader?.loader.classList.add("is-visible");
    });

    loaderStepTimers.push(
      window.setTimeout(() => setAnalysisLoaderStep(1), 900),
      window.setTimeout(() => setAnalysisLoaderStep(2), 2700),
    );
  };

  const restoreAnalysisControls = (loader) => {
    loader.panel.removeAttribute("aria-busy");
    loader.roleText.readOnly = loader.roleText.dataset.loaderReadonly === "true";
    delete loader.roleText.dataset.loaderReadonly;
    loader.clearButton.disabled = false;
    loader.analyzeButton.textContent =
      loader.analyzeButton.dataset.loaderLabel || "Analyze role";
    delete loader.analyzeButton.dataset.loaderLabel;
    loader.analyzeButton.classList.remove("is-processing");
    window.setTimeout(() => {
      loader.status.removeAttribute("data-loader-muted");
    }, 0);
  };

  const stopAnalysisLoader = async (successful) => {
    clearLoaderStepTimers();
    const loader = activeLoader;
    if (!loader) return;

    const elapsed = performance.now() - analysisStartedAt;
    await delay(Math.max(0, (successful ? 850 : 280) - elapsed));

    if (successful) {
      loader.loader.dataset.state = "complete";
      loader.title.textContent = "Review ready";
      loader.detail.textContent = "Opening the source-backed summary and evidence.";
      loader.steps.forEach((element) => {
        element.dataset.stepState = "complete";
      });
      await delay(360);
    }

    loader.loader.classList.remove("is-visible");
    restoreAnalysisControls(loader);
    await delay(180);
    loader.loader.hidden = true;
    loader.loader.dataset.state = "loading";
    activeLoader = null;
  };

  const recruiterActionFromFetch = (args) => {
    if (!isRecruiterRoute()) return "";
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

  const prepareRecruiterPage = () => {
    resetUsageForUtcDay();
    ensureAnalysisLoader();
  };

  resetUsageForUtcDay();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", prepareRecruiterPage, { once: true });
  } else {
    prepareRecruiterPage();
  }
  document.addEventListener("astro:page-load", prepareRecruiterPage);

  window.fetch = async (...args) => {
    const action = recruiterActionFromFetch(args);
    if (action === "analyze") startAnalysisLoader();

    let response;
    let analysisSucceeded = false;
    try {
      response = await originalFetch(...args);
      analysisSucceeded = action === "analyze" && response.ok;
      try {
        const payload = await response.clone().json();
        if (payload?.action === "chat" && Array.isArray(payload.sources)) {
          latestChatSources = payload.sources;
        }
      } catch {}
      return response;
    } finally {
      if (action === "analyze") {
        await stopAnalysisLoader(analysisSucceeded);
      }
    }
  };

  Storage.prototype.setItem = function setItem(key, value) {
    if (this === window.localStorage && key === storageKey) {
      try {
        const previous = JSON.parse(nativeGetItem.call(this, key) || "{}");
        const next = JSON.parse(String(value));
        const lastMessage = Array.isArray(next.conversation)
          ? next.conversation[next.conversation.length - 1]
          : null;

        if (
          lastMessage?.role === "assistant" &&
          Array.isArray(lastMessage.sourceIds) &&
          lastMessage.sourceIds.length > 0 &&
          !Array.isArray(lastMessage.sources) &&
          latestChatSources.length > 0
        ) {
          lastMessage.sources = latestChatSources;
        }

        const contextChanged =
          JSON.stringify(previous.recruiterContext || {}) !==
          JSON.stringify(next.recruiterContext || {});

        if (contextChanged && previous.analysis && next.analysis) {
          next.analysisStale = true;
          if (isRecruiterRoute() && !contextReloadScheduled) {
            contextReloadScheduled = true;
            window.setTimeout(() => window.location.reload(), 0);
          }
        }

        value = JSON.stringify(next);
      } catch {}
    }

    return nativeSetItem.call(this, key, value);
  };
})();
