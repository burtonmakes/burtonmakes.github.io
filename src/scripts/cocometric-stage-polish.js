const beats = [...document.querySelectorAll(".beat")];
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (beats.length && !reduceMotion) {
  let settleTimer = 0;
  let isSettling = false;
  let lastSettledIndex = -1;

  function nearestStage() {
    const viewportCenter = window.scrollY + window.innerHeight * 0.5;
    let nearestIndex = 0;
    let nearestDistance = Number.POSITIVE_INFINITY;

    beats.forEach((beat, index) => {
      const center = beat.offsetTop + beat.offsetHeight * 0.5;
      const distance = Math.abs(center - viewportCenter);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    });

    return { index: nearestIndex, distance: nearestDistance };
  }

  function settleStage() {
    const trackEnd = beats.at(-1).offsetTop + beats.at(-1).offsetHeight;
    if (window.scrollY < 4 || window.scrollY > trackEnd - window.innerHeight * 0.15) return;

    const { index, distance } = nearestStage();
    const tolerance = window.innerHeight * 0.045;
    if (distance <= tolerance || index === lastSettledIndex) return;

    const target = beats[index].offsetTop + beats[index].offsetHeight * 0.5 - window.innerHeight * 0.5;
    lastSettledIndex = index;
    isSettling = true;
    window.scrollTo({ top: target, behavior: "smooth" });
    window.setTimeout(() => { isSettling = false; }, 520);
  }

  window.addEventListener("scroll", () => {
    if (isSettling) return;
    window.clearTimeout(settleTimer);
    settleTimer = window.setTimeout(settleStage, 150);
  }, { passive: true });

  window.addEventListener("resize", () => {
    lastSettledIndex = -1;
  }, { passive: true });
}
