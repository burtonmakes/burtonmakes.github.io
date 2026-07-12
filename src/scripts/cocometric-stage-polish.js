// The original Cocometric viewer handles its own scroll-linked animation.
// Keep its stage snapping inside the animation story, but do not let the final
// services section be pulled back to the last component after the user reaches it.

const scrollToBeforeFinalGuard = window.scrollTo.bind(window);
const storyExit = document.querySelector("#story-exit");
const finalSection = document.querySelector("#contact");

function requestedScrollTop(first) {
  if (typeof first === "number") return first;
  if (typeof first === "object" && first && Number.isFinite(Number(first.top))) {
    return Number(first.top);
  }
  return null;
}

window.scrollTo = (first, second) => {
  const targetTop = requestedScrollTop(first);
  const transitionTop = storyExit?.offsetTop ?? finalSection?.offsetTop ?? null;
  const smoothRequest = typeof first === "object" && first?.behavior === "smooth";
  const finalIsEntering = Boolean(
    finalSection && finalSection.getBoundingClientRect().top <= window.innerHeight * 0.92
  );
  const pastAnimationStory = Boolean(
    transitionTop !== null && window.scrollY >= transitionTop - window.innerHeight * 0.25
  );
  const wouldReturnToAnimation = Boolean(
    targetTop !== null && transitionTop !== null && targetTop < transitionTop - 8
  );

  if (smoothRequest && wouldReturnToAnimation && (pastAnimationStory || finalIsEntering)) {
    return;
  }

  return scrollToBeforeFinalGuard(first, second);
};
