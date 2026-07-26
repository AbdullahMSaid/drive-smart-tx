import { useEffect, useRef, useState } from "react";
import { scrollToId } from "@/lib/scroll";
import { cn } from "@/lib/utils";

const LINKS = [
  { label: "Fleet", id: "fleet" },
  { label: "Pricing", id: "pricing" },
  { label: "Premium SUVs", id: "premium-suvs" },
  { label: "FAQ", id: "faq" },
  { label: "Service Area", id: "service-area" },
  { label: "Contact", id: "contact" },
];

export function SectionRibbon() {
  const [active, setActive] = useState<string>("fleet");
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const marker = window.innerHeight * 0.35;
        let current = LINKS[0].id;
        for (const l of LINKS) {
          const el = document.getElementById(l.id);
          if (!el) continue;
          if (el.getBoundingClientRect().top <= marker) current = l.id;
        }
        setActive((prev) => (prev === current ? prev : current));
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  // Keep the active chip in view on mobile.
  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-id="${active}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [active]);

  return (
    <div className="sticky top-16 z-40 border-y border-border/70 bg-background/85 backdrop-blur-md">
      <div className="container-x flex items-center gap-3">
        <div
          ref={listRef}
          className="flex-1 flex items-center gap-1 overflow-x-auto scrollbar-none py-2 lg:py-0"
        >
          {LINKS.map((l) => (
            <button
              key={l.id}
              data-id={l.id}
              onClick={() => scrollToId(l.id)}
              aria-current={active === l.id ? "true" : undefined}
              className={cn(
                "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors lg:rounded-none lg:border-0 lg:border-b-2 lg:px-3 lg:py-3",
                active === l.id
                  ? "border-gold/50 bg-gold/12 text-gold lg:bg-transparent lg:border-gold"
                  : "border-border/60 text-muted-foreground hover:text-foreground lg:border-transparent",
              )}
            >
              {l.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => scrollToId("lead-form")}
          className="my-2 shrink-0 rounded-full bg-gold px-4 py-1.5 text-sm font-semibold text-gold-foreground transition hover:bg-gold/90 lg:px-5"
        >
          Book Now
        </button>
      </div>
    </div>
  );
}
