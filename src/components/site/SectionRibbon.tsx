import { useEffect, useRef, useState } from "react";
import { scrollToId } from "@/lib/scroll";
import { cn } from "@/lib/utils";

/** Mobile shows only the top-priority destinations; desktop adds the rest. */
const LINKS = [
  { label: "Fleet", id: "fleet", primary: true },
  { label: "Pricing", id: "pricing", primary: true },
  { label: "Premium SUVs", id: "premium-suvs", primary: false },
  { label: "FAQ", id: "faq", primary: true },
  { label: "Service Area", id: "service-area", primary: false },
  { label: "Contact", id: "contact", primary: false },
];

/** When a desktop-only section is active, highlight this mobile chip instead. */
const MOBILE_FALLBACK: Record<string, string> = {
  "premium-suvs": "fleet",
  "service-area": "faq",
  contact: "faq",
};

export function SectionRibbon({ visible }: { visible: boolean }) {
  const [active, setActive] = useState<string>("fleet");
  const [isMobile, setIsMobile] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);


  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const marker = window.innerHeight * 0.35;
        // Pick the section closest to (but above) the marker, independent of
        // the order links are declared in — some anchors are zero-height
        // markers whose document order differs from the link list.
        let current = LINKS[0].id;
        let bestTop = -Infinity;
        for (const l of LINKS) {
          const el = document.getElementById(l.id);
          if (!el) continue;
          const top = el.getBoundingClientRect().top;
          if (top <= marker && top > bestTop) {
            bestTop = top;
            current = l.id;
          }
        }
        // Near the bottom of the page the last section may never cross the
        // marker; force the final link active.
        if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 4) {
          const last = [...LINKS].reverse().find((l) => document.getElementById(l.id));
          if (last) current = last.id;
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

  const shownActive =
    isMobile && MOBILE_FALLBACK[active] ? MOBILE_FALLBACK[active] : active;

  return (

    <div
      aria-hidden={!visible}
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur-md transition-all duration-300 ease-out",
        visible
          ? "translate-y-0 opacity-100"
          : "-translate-y-full opacity-0 pointer-events-none",
      )}
    >
      <div className="container-x flex h-14 items-center justify-between gap-2 lg:h-auto lg:gap-3">
        <div
          ref={listRef}
          className="flex min-w-0 flex-1 items-center gap-1.5 lg:gap-1"
        >
          {LINKS.map((l) => (
            <button
              key={l.id}
              data-id={l.id}
              tabIndex={visible ? 0 : -1}
              onClick={() => scrollToId(l.id)}
              aria-current={active === l.id ? "true" : undefined}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1.5 text-[13px] font-medium transition-colors lg:rounded-none lg:border-0 lg:border-b-2 lg:px-3 lg:py-3 lg:text-sm",
                !l.primary && "hidden lg:inline-flex",
                active === l.id
                  ? "border-gold/50 bg-gold/12 text-gold lg:border-gold lg:bg-transparent"
                  : "border-border/60 text-muted-foreground hover:text-foreground lg:border-transparent",
              )}
            >
              {l.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => scrollToId("lead-form")}
          tabIndex={visible ? 0 : -1}
          className="shrink-0 rounded-full bg-gold px-4 py-1.5 text-[13px] font-semibold text-gold-foreground transition hover:bg-gold/90 lg:my-2 lg:px-5 lg:text-sm"
        >
          Book Now
        </button>
      </div>
    </div>
  );
}
