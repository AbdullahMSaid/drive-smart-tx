import heroImg from "@/assets/hero.jpg";
import { Button } from "@/components/ui/button";
import { scrollToId } from "@/lib/scroll";
import { ShieldCheck } from "lucide-react";

export function Hero() {
  return (
    <section id="home" className="relative min-h-[92vh] flex items-center overflow-hidden pt-24 pb-16">
      <div className="absolute inset-0 -z-10">
        <img
          src={heroImg}
          alt="Premium SUV and economy vehicle at Texas sunset"
          width={1600}
          height={1000}
          className="h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/60" />
      </div>

      <div className="container-x">
        <div className="max-w-3xl rise-in">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs font-medium text-gold">
            Texas Vehicle Rentals
          </span>
          <h1 className="mt-5 font-display text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.05] text-foreground">
            Reliable Rentals for <span className="gold-gradient-text">Everyday Drives</span> and Premium Travel
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            Choose from affordable economy vehicles and spacious premium SUVs for work, family trips,
            airport transportation, business travel, and special occasions.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Button
              size="lg"
              onClick={() => scrollToId("lead-form")}
              className="bg-gold text-gold-foreground hover:bg-gold/90 h-12 px-6 text-base"
            >
              Check Availability
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => scrollToId("fleet")}
              className="h-12 px-6 text-base border-border bg-background/40 backdrop-blur text-foreground hover:bg-accent"
            >
              Browse Vehicles
            </Button>
          </div>

          <p className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-gold" />
            Simple rental requests. Responsive service. Vehicles for short-term and extended travel.
          </p>
        </div>
      </div>
    </section>
  );
}
