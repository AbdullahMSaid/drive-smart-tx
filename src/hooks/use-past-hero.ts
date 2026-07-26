import { useEffect, useState } from "react";

/**
 * True once the user has scrolled past the hero area, so the section ribbon
 * can replace the standard header (never both at once).
 */
export function usePastHero(heroId = "home") {
  const [past, setPast] = useState(false);

  useEffect(() => {
    let frame = 0;
    const check = () => {
      frame = 0;
      const hero = document.getElementById(heroId);
      // Swap near the end of the hero so the ribbon is already in place by the
      // time the first content section reaches the top of the viewport.
      const threshold = hero
        ? hero.offsetTop + hero.offsetHeight * 0.7
        : window.innerHeight * 0.7;
      // Hysteresis prevents flicker when both bars would swap at the boundary.
      setPast((prev) => {
        const y = window.scrollY;
        if (prev) return y > threshold - 24;
        return y > threshold;
      });
    };
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(check);
    };
    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [heroId, headerHeight]);

  return past;
}
