/**
 * JSON-LD structured data for search engines.
 *
 * Two hard rules here, both because violations are penalised rather than
 * ignored:
 *  1. Every claim must be true and match what a visitor sees on the page.
 *     Google's structured-data policy treats invisible or contradictory markup
 *     as spam.
 *  2. No `aggregateRating` or `review` until real, verifiable reviews exist.
 *     Self-serving invented ratings are an explicit manual-action trigger.
 *
 * Deliberately omitted for lack of a real value: street address (the site only
 * ever states city + ZIP), opening hours, and social profiles (`sameAs`).
 */
import { faqs } from "@/data/faqs";
import { vehicles } from "@/data/vehicles";
import { getVehiclePricing } from "@/data/pricing";
import { absoluteUrl, BUSINESS, OG_IMAGE, SERVICE_AREA, SITE_URL } from "./site";

/** Lowest advertised daily rate across the fleet, for `priceRange`. */
function lowestDailyRate(): number | null {
  const rates = vehicles
    .map((v) => getVehiclePricing(v.id)?.fromPrice)
    .filter((n): n is number => typeof n === "number");
  return rates.length > 0 ? Math.min(...rates) : null;
}

/**
 * AutoRental is the Schema.org type for a vehicle-rental business — more
 * specific, and therefore more useful to search engines, than LocalBusiness.
 */
export function autoRentalSchema() {
  const from = lowestDailyRate();
  return {
    "@context": "https://schema.org",
    "@type": "AutoRental",
    "@id": `${SITE_URL}/#business`,
    name: BUSINESS.name,
    url: SITE_URL,
    logo: absoluteUrl("/favicon-512.png"),
    image: absoluteUrl(OG_IMAGE.path),
    telephone: BUSINESS.phone,
    email: BUSINESS.email,
    description: `Economy car and premium SUV rentals in ${BUSINESS.city}, ${BUSINESS.regionName}. Daily and weekly rates, serving the Dallas–Fort Worth metroplex. Renters must be at least ${BUSINESS.minAge}.`,
    address: {
      "@type": "PostalAddress",
      // No street address is published anywhere on the site, so none is claimed
      // here. Add `streetAddress` once there is a real pickup address.
      addressLocality: BUSINESS.city,
      addressRegion: BUSINESS.region,
      postalCode: BUSINESS.postalCode,
      addressCountry: BUSINESS.country,
    },
    areaServed: SERVICE_AREA.map((city) => ({
      "@type": "City",
      name: `${city}, ${BUSINESS.region}`,
    })),
    ...(from ? { priceRange: `From $${from}/day` } : {}),
    currenciesAccepted: "USD",
    makesOffer: vehicles
      .filter((v) => v.category !== "coming-soon")
      .map((v) => {
        const pricing = getVehiclePricing(v.id);
        return {
          "@type": "Offer",
          itemOffered: {
            "@type": "Car",
            name: `${v.name} ${v.subtitle}`.trim(),
            vehicleConfiguration: v.categoryLabel,
          },
          ...(pricing
            ? {
                priceSpecification: {
                  "@type": "UnitPriceSpecification",
                  price: pricing.fromPrice,
                  priceCurrency: "USD",
                  unitCode: "DAY",
                },
              }
            : {}),
          availability: "https://schema.org/InStock",
        };
      }),
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: BUSINESS.name,
    publisher: { "@id": `${SITE_URL}/#business` },
    inLanguage: "en-US",
  };
}

/**
 * Built from the same `faqs` array the page renders, so the markup can never
 * drift from the visible answers — which is exactly what Google checks for.
 */
export function faqSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export function breadcrumbSchema(trail: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

/** Render helper: TanStack's `head.scripts` takes inline JSON-LD as children. */
export function jsonLdScript(schema: object) {
  return { type: "application/ld+json", children: JSON.stringify(schema) };
}
