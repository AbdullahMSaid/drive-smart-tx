import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { scrollToId } from "@/lib/scroll";
import { cn } from "@/lib/utils";
import logoAsset from "@/assets/royalty-luxury-logo.png.asset.json";

const NAV = [
  { label: "Home", id: "home" },
  { label: "Vehicles", id: "fleet" },
  { label: "Premium SUVs", id: "premium-suvs" },
  { label: "Promotions", id: "promotions" },
  { label: "FAQ", id: "faq" },
];

export function SiteNav({ hidden = false }: { hidden?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (hidden) setOpen(false);
  }, [hidden]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (id: string) => {
    setOpen(false);
    scrollToId(id);
  };

  return (
    <header
      aria-hidden={hidden}
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300 ease-out",
        scrolled
          ? "bg-background/85 backdrop-blur-md border-b border-border/70"
          : "bg-transparent",
        hidden && "-translate-y-full opacity-0 pointer-events-none",
      )}
    >
      <div className="container-x flex h-16 items-center justify-between gap-4">
        <button
          onClick={() => go("home")}
          className="flex items-center gap-3 text-left"
          aria-label="Royalty Luxury Transportation Services — Home"
        >
          <img
            src={logoAsset.url}
            alt="Royalty Luxury Transportation Services"
            className="h-11 w-auto md:h-12"
            width={160}
            height={160}
          />
          <span className="sr-only">Royalty Luxury Transportation Services</span>
        </button>

        <nav className="hidden lg:flex items-center gap-1">
          {NAV.map((n) => (
            <button
              key={n.id}
              onClick={() => go(n.id)}
              className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {n.label}
            </button>
          ))}
          <Button
            onClick={() => go("lead-form")}
            className="ml-2 bg-gold text-gold-foreground hover:bg-gold/90"
          >
            Check Availability
          </Button>
        </nav>

        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-md border border-border text-foreground"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-border bg-background/95 backdrop-blur">
          <div className="container-x flex flex-col gap-1 py-3">
            {NAV.map((n) => (
              <button
                key={n.id}
                onClick={() => go(n.id)}
                className="rounded-md px-3 py-3 text-left text-sm font-medium text-foreground hover:bg-accent"
              >
                {n.label}
              </button>
            ))}
            <Button
              onClick={() => go("lead-form")}
              className="mt-2 bg-gold text-gold-foreground hover:bg-gold/90"
            >
              Check Availability
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
