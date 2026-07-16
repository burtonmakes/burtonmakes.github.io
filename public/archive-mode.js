(() => {
  if (window.__burtonArchiveModeLoaded) return;
  window.__burtonArchiveModeLoaded = true;

  const unavailableMessage =
    "This archived feature is no longer available. The interface remains public as a reference.";

  const setText = (selector, message = unavailableMessage) => {
    const element = document.querySelector(selector);
    if (!element) return;
    element.textContent = message;
    element.dataset.state = "archived";
    element.hidden = false;
  };

  document.addEventListener(
    "click",
    (event) => {
      const target = event.target instanceof Element ? event.target : null;
      if (!target) return;

      if (target.closest("[data-analyze-role]")) {
        event.preventDefault();
        event.stopImmediatePropagation();
        setText("[data-portal-status]");
        return;
      }

      if (target.closest("[data-chat-submit]")) {
        event.preventDefault();
        event.stopImmediatePropagation();
        setText("[data-chat-status]");
      }
    },
    true,
  );

  document.addEventListener(
    "submit",
    (event) => {
      const form = event.target instanceof HTMLFormElement ? event.target : null;
      if (!form) return;

      if (form.matches("#contact-form")) {
        event.preventDefault();
        event.stopImmediatePropagation();
        setText("#contact-status");
        return;
      }

      if (form.matches("[data-chat-form]")) {
        event.preventDefault();
        event.stopImmediatePropagation();
        setText("[data-chat-status]");
      }
    },
    true,
  );

  const nativeFetch = window.fetch.bind(window);
  window.fetch = (input, init) => {
    const url = typeof input === "string" ? input : input?.url || "";
    if (
      url.includes("burton-recruiter-match.burtonmakes.workers.dev") ||
      url.includes("api.web3forms.com")
    ) {
      return Promise.resolve(
        new Response(JSON.stringify({ error: unavailableMessage }), {
          status: 410,
          headers: { "Content-Type": "application/json" },
        }),
      );
    }
    return nativeFetch(input, init);
  };
})();
