import { useEffect, useState } from "react";

/**
 * True once the user has scrolled past the hero area, so the section ribbon
 * can replace the standard header (never both at once).
 */
export function usePastHero(heroId = "home", headerHeight = 64) {
  const [past, setPast] = useState(false);

  useEffect(() => {
    let frame = 0;
    const check = () => {
      frame = 0;
      const hero = document.getElementById(heroId);
      const threshold = hero
        ? hero.offsetTop + hero.offsetHeight - headerHeight
        : window.innerHeight;
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
