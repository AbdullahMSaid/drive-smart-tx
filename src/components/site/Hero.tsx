import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { scrollToId } from "@/lib/scroll";
import { cn } from "@/lib/utils";
import suburbanHero from "@/assets/suburban-hero.png";
import accordHero from "@/assets/accord-hero.png";
import lexusHero from "@/assets/lexus-hero.png";

type Slide = {
  id: string;
  chip: string;
  chipShort: string;
  image: string;
  alt: string;
  eyebrow: string;
  headline: React.ReactNode;
  copy: string;
  secondary: { label: string; targetId: string };
  desktopPosition: string;
  mobilePosition: string;
  /** Tailwind alignment for text column on desktop: place text in image negative space */
  textAlignDesktop: "left" | "right";
};

const SLIDES: Slide[] = [
  {
    id: "suburban",
    chip: "2023 Suburban",
    chipShort: "Suburban",
    image: suburbanHero,
    alt: "Black Chevrolet Suburban at a Texas overlook at sunset, tailgate open with travel gear",
    eyebrow: "Texas Vehicle Rentals",
    headline: <>Premium SUVs for<br />Every Journey.</>,
    copy: "Spacious, comfortable transportation for family trips, airport travel, group outings, and Texas road trips.",
    secondary: { label: "Browse Fleet", targetId: "fleet" },
    // Vehicle sits center-right; keep text left. Preserve sunset on the left.
    desktopPosition: "82% 60%",
    mobilePosition: "70% 62%",
    textAlignDesktop: "left",
  },
  {
    id: "accord",
    chip: "Honda Accord",
    chipShort: "Accord",
    image: accordHero,
    alt: "Black Honda Accord driving through downtown Dallas at golden hour with skyline in the background",
    eyebrow: "Reliable Everyday Rentals",
    headline: <>Comfortable.<br />Affordable.<br />Ready to Go.</>,
    copy: "Fuel-efficient transportation for commuting, business travel, weekend trips, and extended rentals.",
    secondary: { label: "View This Vehicle", targetId: "fleet" },
    // Accord sits right side; skyline on left is negative space for text.
    desktopPosition: "78% 65%",
    mobilePosition: "68% 62%",
    textAlignDesktop: "left",
  },
  {
    id: "lexus",
    chip: "Lexus ES350",
    chipShort: "Lexus ES",
    image: lexusHero,
    alt: "Silver 2015 Lexus ES350 parked along a lakeside road at sunset in North Texas",
    eyebrow: "Relaxed Premium Travel",
    headline: <>Comfort for Every<br />Weekend Escape.</>,
    copy: "A smooth, refined luxury sedan for special occasions, business travel, and relaxing trips across North Texas.",
    secondary: { label: "View This Vehicle", targetId: "fleet" },
    // Lexus is center-right with sunset/lake on the left = text negative space.
    desktopPosition: "75% 65%",
    mobilePosition: "60% 65%",
    textAlignDesktop: "left",
  },
];

const AUTO_MS = 9000;

export function Hero() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const touchStart = useRef<number | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      setIsMobile(mq.matches);
      setReducedMotion(rm.matches);
    };
    sync();
    mq.addEventListener("change", sync);
    rm.addEventListener("change", sync);
    return () => {
      mq.removeEventListener("change", sync);
      rm.removeEventListener("change", sync);
    };
  }, []);

  const go = useCallback((next: number) => {
    setIndex((prev) => (next + SLIDES.length) % SLIDES.length);
  }, []);

  const next = useCallback(() => go(index + 1), [go, index]);
  const prev = useCallback(() => go(index - 1), [go, index]);

  useEffect(() => {
    if (paused) return;
    const t = setTimeout(() => setIndex((i) => (i + 1) % SLIDES.length), AUTO_MS);
    return () => clearTimeout(t);
  }, [index, paused]);

  // Pause when tab hidden
  useEffect(() => {
    const onVis = () => setPaused(document.hidden ? true : paused);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [paused]);

  const pauseAuto = () => setPaused(true);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStart.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStart.current;
    if (Math.abs(dx) > 50) {
      pauseAuto();
      dx < 0 ? next() : prev();
    }
    touchStart.current = null;
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") { pauseAuto(); prev(); }
    if (e.key === "ArrowRight") { pauseAuto(); next(); }
  };

  const active = SLIDES[index];

  return (
    <section
      id="home"
      className="relative h-[100svh] min-h-[640px] md:min-h-[720px] w-full overflow-hidden bg-background"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onKeyDown={onKeyDown}
      tabIndex={-1}
      aria-roledescription="carousel"
      aria-label="Featured vehicles"
    >
      {/* Slides */}
      <div className="absolute inset-0">
        {SLIDES.map((s, i) => {
          const isActive = i === index;
          const position = isMobile ? s.mobilePosition : s.desktopPosition;
          return (
            <div
              key={s.id}
              className={cn(
                "absolute inset-0 transition-opacity duration-[1200ms] ease-out",
                isActive ? "opacity-100" : "opacity-0",
              )}
              aria-hidden={!isActive}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${SLIDES.length}: ${s.chip}`}
            >
              <img
                src={s.image}
                alt={s.alt}
                loading={i === 0 ? "eager" : "lazy"}
                fetchPriority={i === 0 ? "high" : "low"}
                decoding="async"
                style={{ objectPosition: position }}
                className={cn(
                  "h-full w-full object-cover will-change-transform",
                  isActive && !reducedMotion && "animate-[heroZoom_12s_ease-out_forwards]",
                )}
                draggable={false}
              />
            </div>
          );
        })}

        {/* Adaptive overlays — light, tuned for readability without killing color */}
        {/* Desktop: soft horizontal gradient behind left text column */}
        <div className="pointer-events-none absolute inset-0 hidden md:block bg-gradient-to-r from-background/75 via-background/25 to-transparent" />
        {/* Mobile: subtle top + bottom gradients */}
        <div className="pointer-events-none absolute inset-0 md:hidden bg-gradient-to-b from-background/60 via-transparent to-background/80" />
        {/* Very light global darkening for contrast floor */}
        <div className="pointer-events-none absolute inset-0 bg-black/10" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col">
        <div className="container-x flex flex-1 items-center pt-24 pb-32 sm:pb-36 md:pt-28">
          <div
            key={active.id}
            className={cn(
              "max-w-xl md:max-w-2xl animate-[fade-in_0.9s_ease-out_both]",
              active.textAlignDesktop === "right" && "md:ml-auto md:text-right",
            )}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-gold backdrop-blur-sm">
              {active.eyebrow}
            </span>
            <h1
              className="mt-5 font-display font-semibold leading-[1.02] tracking-tight text-foreground text-[2.6rem] sm:text-5xl md:text-6xl lg:text-7xl xl:text-[5.25rem]"
              style={{ textShadow: "0 2px 24px rgba(0,0,0,0.35)" }}
            >
              {active.headline}
            </h1>
            <p
              className="mt-5 max-w-lg text-base sm:text-lg leading-relaxed text-foreground/85"
              style={{ textShadow: "0 1px 12px rgba(0,0,0,0.4)" }}
            >
              {active.copy}
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Button
                size="lg"
                onClick={() => scrollToId("lead-form")}
                className="bg-gold text-gold-foreground hover:bg-gold/90 h-12 px-7 text-base transition-transform hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                Check Availability
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => scrollToId(active.secondary.targetId)}
                className="h-12 px-7 text-base border-white/30 bg-white/10 backdrop-blur text-foreground hover:bg-white/20 transition-transform hover:-translate-y-0.5"
              >
                {active.secondary.label}
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom controls */}
        <div className="absolute inset-x-0 bottom-0 pb-6 sm:pb-8">
          <div className="container-x">
            {/* Desktop: compact tabs */}
            <div className="hidden md:flex items-center justify-center gap-3">
              <button
                onClick={() => { pauseAuto(); prev(); }}
                aria-label="Previous vehicle"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur text-foreground/80 hover:bg-white/20 hover:text-foreground transition focus-visible:ring-2 focus-visible:ring-gold"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-2" role="tablist" aria-label="Choose vehicle">
                {SLIDES.map((s, i) => {
                  const activeChip = i === index;
                  return (
                    <button
                      key={s.id}
                      role="tab"
                      aria-selected={activeChip}
                      onClick={() => { pauseAuto(); go(i); }}
                      className={cn(
                        "relative rounded-full px-4 py-2 text-sm font-medium tracking-wide transition-all duration-300 backdrop-blur focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold",
                        activeChip
                          ? "bg-gold text-gold-foreground shadow-[0_8px_30px_-8px_oklch(0.78_0.13_78/0.6)]"
                          : "bg-white/10 text-foreground/85 border border-white/20 hover:bg-white/20 hover:text-foreground",
                      )}
                    >
                      {s.chip}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => { pauseAuto(); next(); }}
                aria-label="Next vehicle"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur text-foreground/80 hover:bg-white/20 hover:text-foreground transition focus-visible:ring-2 focus-visible:ring-gold"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            {/* Mobile: compact prev/label/next + dots */}
            <div className="md:hidden flex flex-col items-center gap-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { pauseAuto(); prev(); }}
                  aria-label="Previous vehicle"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-white/10 backdrop-blur text-foreground/85 hover:bg-white/20 transition"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <div
                  className="min-w-[9rem] text-center rounded-full border border-white/20 bg-white/10 backdrop-blur px-4 py-1.5 text-sm font-medium text-foreground"
                  aria-live="polite"
                >
                  {active.chip}
                </div>
                <button
                  onClick={() => { pauseAuto(); next(); }}
                  aria-label="Next vehicle"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-white/10 backdrop-blur text-foreground/85 hover:bg-white/20 transition"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <div className="flex items-center gap-1.5" aria-hidden="true">
                {SLIDES.map((s, i) => (
                  <span
                    key={s.id}
                    className={cn(
                      "h-1.5 rounded-full transition-all",
                      i === index ? "w-6 bg-gold" : "w-1.5 bg-white/40",
                    )}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
