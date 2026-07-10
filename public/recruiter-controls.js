const MAX_JOB_TEXT_CHARACTERS = 10000;

const setupRecruiterMatcherControls = () => {
  const page = document.querySelector("[data-recruiter-onepage]");
  if (!page) return;

  const input = page.querySelector("[data-match-input]");
  const characterLimit = page.querySelector("[data-character-limit]");
  const clearAllButton = page.querySelector("[data-clear]");
  const detectedHeading = page.querySelector(".detected-heading");
  const detectedSkills = page.querySelector("[data-detected-skills]");

  if (input) {
    input.maxLength = MAX_JOB_TEXT_CHARACTERS;
    input.style.fontFamily = 'Geist, Inter, "Avenir Next", "Segoe UI", system-ui, sans-serif';
    input.style.fontSize = "1rem";
    input.style.fontWeight = "500";
    input.style.lineHeight = "1.5";
    input.style.letterSpacing = "0";
    input.style.textTransform = "none";
  }

  if (input && characterLimit) {
    characterLimit.textContent = `${input.value.length.toLocaleString()} / 10,000 CHARACTERS`;
  }

  if (clearAllButton) clearAllButton.textContent = "Clear all";

  if (detectedHeading && detectedSkills && !detectedHeading.querySelector("[data-clear-tags]")) {
    const clearTagsButton = document.createElement("button");
    clearTagsButton.type = "button";
    clearTagsButton.className = "clear-tags-button";
    clearTagsButton.dataset.clearTags = "true";
    clearTagsButton.textContent = "Clear all tags";
    clearTagsButton.addEventListener("click", () => {
      [...detectedSkills.querySelectorAll(".skill-chip button")].forEach((button) => button.click());
    });
    detectedHeading.append(clearTagsButton);
  }
};

const startRecruiterMatcherControls = () => {
  setupRecruiterMatcherControls();

  if (!window.__recruiterControlsObserver) {
    window.__recruiterControlsObserver = new MutationObserver(setupRecruiterMatcherControls);
    window.__recruiterControlsObserver.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    document.addEventListener("input", (event) => {
      if (event.target instanceof Element && event.target.matches("[data-match-input]")) {
        queueMicrotask(setupRecruiterMatcherControls);
      }
    });
  }
};

document.addEventListener("astro:page-load", startRecruiterMatcherControls);
startRecruiterMatcherControls();
