(() => {
  const storageKey = "burton-recruiter-onepage-session-v3";
  const nativeGetItem = Storage.prototype.getItem;
  const nativeSetItem = Storage.prototype.setItem;
  const originalFetch = window.fetch.bind(window);
  let latestChatSources = [];
  let contextReloadScheduled = false;

  const isRecruiterRoute = () =>
    window.location.pathname === "/recruiter/" ||
    window.location.pathname === "/recruiter";

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

  resetUsageForUtcDay();
  document.addEventListener("astro:page-load", resetUsageForUtcDay);

  window.fetch = async (...args) => {
    const response = await originalFetch(...args);
    try {
      const payload = await response.clone().json();
      if (payload?.action === "chat" && Array.isArray(payload.sources)) {
        latestChatSources = payload.sources;
      }
    } catch {}
    return response;
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

        if (
          isRecruiterRoute() &&
          contextChanged &&
          previous.analysis &&
          next.analysis
        ) {
          next.analysisStale = true;
          if (!contextReloadScheduled) {
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
