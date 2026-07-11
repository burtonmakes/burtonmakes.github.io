const beats = [...document.querySelectorAll(".beat")];
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (beats.length && !reduceMotion) {
  let settleTimer = 0;
  let releaseTimer = 0;
  let isSettling = false;
  let pointerActive = false;

  function nearestStage() {
    const stageHeight = Math.max(1, beats[0].offsetHeight);
    const raw = (window.scrollY - beats[0].offsetTop) / stageHeight;
    return Math.max(0, Math.min(beats.length - 1, Math.round(raw)));
  }

  function lockToStage() {
    if (pointerActive || isSettling) return;

    const finalStart = beats.at(-1).offsetTop + beats.at(-1).offsetHeight * 0.72;
    if (window.scrollY < 4 || window.scrollY >= finalStart) return;

    const index = nearestStage();
    const target = beats[index].offsetTop;
    if (Math.abs(window.scrollY - target) < 2) return;

    isSettling = true;
    window.scrollTo({ top: target, behavior: "smooth" });
    window.clearTimeout(releaseTimer);
    releaseTimer = window.setTimeout(() => {
      isSettling = false;
    }, 460);
  }

  function scheduleLock() {
    if (isSettling || pointerActive) return;
    window.clearTimeout(settleTimer);
    settleTimer = window.setTimeout(lockToStage, 115);
  }

  window.addEventListener("scroll", scheduleLock, { passive: true });
  window.addEventListener("wheel", scheduleLock, { passive: true });

  window.addEventListener("pointerdown", () => {
    pointerActive = true;
    window.clearTimeout(settleTimer);
  }, { passive: true });

  window.addEventListener("pointerup", () => {
    pointerActive = false;
    scheduleLock();
  }, { passive: true });

  window.addEventListener("touchend", () => {
    pointerActive = false;
    scheduleLock();
  }, { passive: true });

  window.addEventListener("resize", () => {
    window.clearTimeout(settleTimer);
    window.clearTimeout(releaseTimer);
    isSettling = false;
  }, { passive: true });
}
