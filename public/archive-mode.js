(() => {
  if (window.__burtonArchiveModeLoaded) return;
  window.__burtonArchiveModeLoaded = true;

  const unavailableMessage =
    "This archived feature is no longer available. The interface remains public as a reference.";

  const ensureArchiveNotice = () => {
    if (!document.getElementById("archive-mode-style")) {
      const style = document.createElement("style");
      style.id = "archive-mode-style";
      style.textContent = `
        .archive-banner {
          position: relative;
          z-index: 1000;
          display: flex;
          justify-content: center;
          gap: .5rem;
          flex-wrap: wrap;
          padding: .65rem 1rem;
          border-bottom: 1px solid rgba(226,184,105,.42);
          background: rgba(18,13,7,.98);
          color: #f6faff;
          font: 700 .8rem/1.35 Geist, Inter, system-ui, sans-serif;
          text-align: center;
        }
        .archive-banner strong { color: #e2b869; }
        body.cocometric-page .header { top: 38px; }
      `;
      document.head.appendChild(style);
    }

    if (!document.querySelector(".archive-banner")) {
      const notice = document.createElement("aside");
      notice.className = "archive-banner";
      notice.setAttribute("aria-label", "Archive status");
      notice.innerHTML =
        "<strong>Archived public reference.</strong><span>This site is no longer actively maintained. Interactive services remain visible for reference but are no longer available.</span>";
      document.body.prepend(notice);
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", ensureArchiveNotice, { once: true });
  } else {
    ensureArchiveNotice();
  }

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
        setText(
          "#contact-status",
          "This archived feature is no longer available. Use one of the public profile links instead.",
        );
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
    let hostname = "";
    try {
      hostname = new URL(url, window.location.href).hostname;
    } catch {
      hostname = "";
    }

    if (
      hostname === "burton-recruiter-match.burtonmakes.workers.dev" ||
      hostname === "api.web3forms.com"
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
