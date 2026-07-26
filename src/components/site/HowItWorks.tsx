import { SectionHeading } from "./SectionHeading";
import { Search, CalendarCheck, BadgeCheck, MessageCircle } from "lucide-react";

const steps = [
  { icon: Search, title: "Browse Vehicles", body: "Explore economy cars and premium SUVs." },
  { icon: CalendarCheck, title: "Check Availability", body: "Tell us which vehicle you need and your preferred rental dates." },
  { icon: BadgeCheck, title: "Get Pre-Qualified", body: "A short guided form collects the basic information needed to review your request." },
  { icon: MessageCircle, title: "Receive a Response", body: "The rental team reviews your information and contacts you with availability, pricing, and next steps." },
];

export function HowItWorks() {
  return (
    <section className="section-y">
      <div className="container-x">
        <SectionHeading
          align="center"
          eyebrow="How it works"
          title="Four simple steps to your next rental."
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <div
                key={s.title}
                className="relative rounded-2xl border border-border bg-card p-6"
              >
                <div className="flex items-center justify-between">
                  <div className="grid h-11 w-11 place-items-center rounded-lg bg-gold/15 text-gold">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="font-display text-3xl font-semibold text-gold/30">
                    0{i + 1}
                  </span>
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold text-card-foreground">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
