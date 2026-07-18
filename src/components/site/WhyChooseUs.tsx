import { SectionHeading } from "./SectionHeading";
import { CarFront, PhoneCall, ClipboardList, CalendarRange, Sparkles } from "lucide-react";

const items = [
  { icon: CarFront, title: "Economy and premium options", body: "One place for fuel-efficient daily drivers and full-size premium SUVs." },
  { icon: PhoneCall, title: "Responsive local service", body: "A local rental team focused on prompt, personal follow-up on every request." },
  { icon: ClipboardList, title: "Simple rental inquiry process", body: "A guided form collects what's needed — no long back-and-forth to get started." },
  { icon: CalendarRange, title: "Flexible rental durations", body: "Short-term, weekly, and extended rental inquiries welcome." },
  { icon: Sparkles, title: "Vehicles for everyday & special-event travel", body: "From commuting to weddings and anniversaries — the right vehicle for the moment." },
];

export function WhyChooseUs() {
  return (
    <section className="section-y bg-background">
      <div className="container-x">
        <SectionHeading
          eyebrow="Why choose us"
          title="A rental experience built around trust."
          subtitle="Straightforward pricing conversations, clear expectations, and a fleet suited to the trip you're actually taking."
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => {
            const Icon = it.icon;
            return (
              <div key={it.title} className="rounded-2xl border border-border bg-card p-6">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-gold/15 text-gold">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold text-card-foreground">
                  {it.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{it.body}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
