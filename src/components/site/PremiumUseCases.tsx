import familyImg from "@/assets/usecase-family.jpg";
import airportImg from "@/assets/usecase-airport.jpg";
import occasionImg from "@/assets/usecase-occasion.jpg";
import { SectionHeading } from "./SectionHeading";
import { Clock } from "lucide-react";

const cases = [
  { img: familyImg, title: "Family vacations & road trips", body: "Comfortable seating and cargo room for the whole family, from weekend getaways to cross-Texas road trips." },
  { img: airportImg, title: "Airport transportation & business travel", body: "Spacious, refined transportation to and from Texas airports, meetings, and corporate travel." },
  { img: occasionImg, title: "Anniversaries, birthdays & special occasions", body: "Make the moment feel like an occasion — Valentine's Day, anniversaries, birthday weekends, and group celebrations." },
];

export function PremiumUseCases() {
  return (
    <section id="premium-suvs" className="section-y bg-surface text-surface-foreground">
      <div className="container-x">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <SectionHeading
            invert
            eyebrow="Premium SUV experiences"
            title="More space for the moments that matter."
            subtitle="Premium SUVs offer the comfort, space, and flexibility needed for group transportation, long-distance travel, and memorable occasions."
          />
          <span className="inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-gold/40 bg-gold/15 px-4 py-2 text-sm font-medium text-gold-foreground">
            <Clock className="h-4 w-4" />
            Three-day minimum on premium Suburban rentals
          </span>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {cases.map((c) => (
            <article
              key={c.title}
              className="group overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm transition hover:shadow-lg"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={c.img}
                  alt={c.title}
                  width={1000}
                  height={700}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-6">
                <h3 className="font-display text-xl font-semibold text-surface-foreground">
                  {c.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-surface-foreground/70">
                  {c.body}
                </p>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap gap-2 justify-center">
          {[
            "Family vacations","Road trips","Airport transportation","Business travel",
            "Luxury travel","Birthday weekends","Valentine's Day","Anniversaries",
            "Group transportation","Special occasions",
          ].map((t) => (
            <span key={t} className="rounded-full border border-surface-foreground/15 bg-white/60 px-3 py-1 text-xs text-surface-foreground/80">
              {t}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
