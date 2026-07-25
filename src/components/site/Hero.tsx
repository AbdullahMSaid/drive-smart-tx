import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { scrollToId } from "@/lib/scroll";
import { cn } from "@/lib/utils";
import suburban2023 from "@/assets/suburban-2023.png.asset.json";
import lexusEs350 from "@/assets/lexus-es350-2015.png.asset.json";
import accord2019 from "@/assets/accord-2019.png.asset.json";
import accord2015 from "@/assets/honda-accord.png.asset.json";

type Slide = {
  id: string;
  chip: string;
  image: string;
  headline: React.ReactNode;
  copy: string;
};

const SLIDES: Slide[] = [
  {
    id: "suburban-2023",
    chip: "2023 Suburban",
    image: suburban2023.url,
    headline: <>Premium SUVs for<br />Every Journey.</>,
    copy: "Perfect for family vacations, airport transportation, group travel, and road trips across Texas.",
  },
  {
    id: "lexus-es350",
    chip: "Lexus ES350",
    image: lexusEs350.url,
    headline: <>Executive Comfort.<br />Everyday Luxury.</>,
    copy: "Luxury transportation for business travel, airport pickups, and special occasions.",
  },
  {
    id: "accord-2019",
    chip: "Accord 2019",
    image: accord2019.url,
    headline: <>Reliable. Affordable.<br />Ready to Go.</>,
    copy: "Comfortable daily transportation with excellent fuel economy for business and personal travel.",
  },
  {
    id: "accord-2015",
    chip: "Accord 2015",
    image: accord2015.url,
    headline: <>Dependable<br />Transportation.</>,
    copy: "Reliable daily rentals with outstanding value for extended stays and local travel.",
  },
];

const AUTO_MS = 9000;

export function Hero() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStart = useRef<number | null>(null);

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

  const active = SLIDES[index];

  return (
    <section
      id="home"
      className="relative h-[100svh] min-h-[640px] w-full overflow-hidden bg-background"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Slides */}
      <div className="absolute inset-0">
        {SLIDES.map((s, i) => (
          <div
            key={s.id}
            className={cn(
              "absolute inset-0 transition-opacity duration-[1200ms] ease-out",
              i === index ? "opacity-100" : "opacity-0",
            )}
            aria-hidden={i !== index}
          >
            <img
              src={s.image}
              alt={s.chip}
              className={cn(
                "h-full w-full object-cover object-center will-change-transform",
                i === index ? "animate-[kenburns_10s_ease-out_forwards]" : "scale-100",
              )}
              draggable={false}
            />
          </div>
        ))}
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/30 to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/30 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col">
        <div className="container-x flex flex-1 items-center pt-28 pb-40 sm:pb-44">
          <div key={active.id} className="max-w-2xl animate-[fade-in_0.9s_ease-out_both]">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-gold">
              Texas Vehicle Rentals
            </span>
            <h1 className="mt-6 font-display text-[2.6rem] sm:text-6xl lg:text-7xl font-semibold leading-[1.02] tracking-tight text-foreground">
              {active.headline}
            </h1>
            <p className="mt-5 max-w-xl text-base sm:text-lg leading-relaxed text-foreground/80">
              {active.copy}
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Button
                size="lg"
                onClick={() => scrollToId("lead-form")}
                className="bg-gold text-gold-foreground hover:bg-gold/90 h-12 px-7 text-base transition-transform hover:-translate-y-0.5"
              >
                Check Availability
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => scrollToId("fleet")}
                className="h-12 px-7 text-base border-white/25 bg-white/5 backdrop-blur text-foreground hover:bg-white/10 transition-transform hover:-translate-y-0.5"
              >
                Browse Fleet
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom controls */}
        <div className="absolute inset-x-0 bottom-0 pb-8 sm:pb-10">
          <div className="container-x flex flex-col items-center gap-5">
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => { pauseAuto(); prev(); }}
                aria-label="Previous vehicle"
                className="hidden sm:inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 backdrop-blur text-foreground/80 hover:bg-white/10 hover:text-foreground transition"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <div className="flex flex-wrap justify-center gap-2 sm:gap-2.5">
                {SLIDES.map((s, i) => {
                  const activeChip = i === index;
                  return (
                    <button
                      key={s.id}
                      onClick={() => { pauseAuto(); go(i); }}
                      aria-label={`Show ${s.chip}`}
                      aria-current={activeChip}
                      className={cn(
                        "group relative rounded-full px-4 py-2 text-xs sm:text-sm font-medium tracking-wide transition-all duration-300 backdrop-blur",
                        activeChip
                          ? "bg-gold text-gold-foreground shadow-[0_8px_30px_-8px_oklch(0.78_0.13_78/0.6)]"
                          : "bg-white/5 text-foreground/75 border border-white/15 hover:bg-white/10 hover:text-foreground",
                      )}
                    >
                      <span className="inline-flex items-center gap-2">
                        <span
                          className={cn(
                            "h-1.5 w-1.5 rounded-full transition-colors",
                            activeChip ? "bg-gold-foreground" : "bg-gold/70",
                          )}
                        />
                        {s.chip}
                      </span>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => { pauseAuto(); next(); }}
                aria-label="Next vehicle"
                className="hidden sm:inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 backdrop-blur text-foreground/80 hover:bg-white/10 hover:text-foreground transition"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            <button
              onClick={() => scrollToId("fleet")}
              className="group inline-flex flex-col items-center text-foreground/60 hover:text-foreground transition"
              aria-label="Scroll to fleet"
            >
              <span className="text-[10px] uppercase tracking-[0.3em]">Scroll</span>
              <ChevronDown className="mt-1 h-4 w-4 animate-bounce" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
