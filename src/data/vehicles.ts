import hondaAccordAsset from "@/assets/honda-accord.png.asset.json";
import accord2019Asset from "@/assets/accord-2019.png.asset.json";
import lexusEs350Asset from "@/assets/lexus-es350-2015.png.asset.json";
import suburban2021Asset from "@/assets/suburban-2021.png.asset.json";
import suburban2023Asset from "@/assets/suburban-2023.png.asset.json";
import compactCrossover from "@/assets/compact-crossover.jpg";

export type VehicleGroup = "economy" | "premium" | "coming-soon";
export type VehicleStatus = "available" | "limited" | "coming-soon" | "reserved";

export interface Vehicle {
  id: string;
  name: string;
  subtitle: string;
  category: VehicleGroup;
  categoryLabel: string;
  image: string;
  description: string;
  highlights: string[];
  idealFor: string[];
  minRentalDays: number;
  status: VehicleStatus;
  /** Optional emphasis badge shown on the card (e.g. "3-Day Minimum"). */
  promoLabel?: string;
  /** Primary price line displayed on card. Defaults to "Call for Pricing". */
  priceLine?: string;
  /** Secondary price line. Defaults to "Daily & Weekly Rates Available". */
  priceSubline?: string;
  /** Waitlist mode replaces the request button ("Join Waitlist"). */
  waitlist?: boolean;
}

export const STATUS_LABELS: Record<VehicleStatus, string> = {
  available: "Available",
  limited: "Limited Availability",
  "coming-soon": "Coming Soon",
  reserved: "Currently Reserved",
};

export const vehicles: Vehicle[] = [
  // ---------- Economy ----------
  {
    id: "honda-accord-2019",
    name: "Honda Accord",
    subtitle: "2019 Model",
    category: "economy",
    categoryLabel: "Economy",
    image: accord2019Asset.url,
    description:
      "A newer, fuel-efficient sedan that's perfect for commuting, business travel, and everyday transportation.",
    highlights: ["5 Passengers", "Automatic", "Excellent Fuel Economy", "Comfortable Ride"],
    idealFor: ["Daily Driving", "Business Travel", "Weekend Trips"],
    minRentalDays: 1,
    status: "available",
  },
  {
    id: "honda-accord-2015",
    name: "Honda Accord",
    subtitle: "2013 Model",
    category: "economy",
    categoryLabel: "Economy",
    image: hondaAccordAsset.url,
    description:
      "A dependable and affordable sedan that's comfortable, reliable, and ideal for extended rentals.",
    highlights: ["5 Passengers", "Automatic", "Fuel Efficient", "Comfortable Seating"],
    idealFor: ["Commuting", "Daily Transportation", "Long-Term Rentals"],
    minRentalDays: 1,
    status: "available",
  },
  {
    id: "lexus-es350-2015",
    name: "Lexus ES350",
    subtitle: "2015 Model",
    category: "economy",
    categoryLabel: "Economy",
    image: lexusEs350Asset.url,
    description:
      "A refined and comfortable sedan offering a smooth, quiet ride — a step up in polish for everyday driving.",
    highlights: ["5 Passengers", "Automatic", "Smooth & Quiet Ride", "Premium Comfort"],
    idealFor: ["Daily Driving", "Business Travel", "Weekend Trips"],
    minRentalDays: 1,
    status: "available",
  },

  // ---------- Premium ----------
  {
    id: "suburban-2021",
    name: "Chevrolet Suburban",
    subtitle: "2021 Model",
    category: "premium",
    categoryLabel: "Premium SUV",
    image: suburban2021Asset.url,
    description:
      "A spacious full-size SUV designed for family vacations, airport transportation, road trips, and group travel.",
    highlights: ["7–8 Passengers", "Automatic", "Large Cargo Capacity", "Premium Interior"],
    idealFor: ["Family Vacations", "Airport Runs", "Road Trips", "Group Travel"],
    minRentalDays: 3,
    status: "available",
    promoLabel: "3-Day Minimum",
  },
  {
    id: "suburban-2023",
    name: "Chevrolet Suburban",
    subtitle: "2023 Model",
    category: "premium",
    categoryLabel: "Premium SUV",
    image: suburban2023Asset.url,
    description:
      "Our newest premium SUV with spacious seating, modern comfort, and plenty of cargo room.",
    highlights: ["7–8 Passengers", "Automatic", "Premium Comfort", "Large Luggage Capacity"],
    idealFor: ["Family Trips", "Luxury Travel", "Group Transportation", "Special Occasions"],
    minRentalDays: 3,
    status: "available",
    promoLabel: "3-Day Minimum",
  },

  // ---------- Coming Soon ----------
  {
    id: "compact-crossover-soon",
    name: "Compact Crossover",
    subtitle: "Joining the fleet soon",
    category: "coming-soon",
    categoryLabel: "Coming Soon",
    image: compactCrossover,
    description:
      "A compact crossover will be joining our fleet soon. Join the waitlist to be notified when it becomes available.",
    highlights: [],
    idealFor: [],
    minRentalDays: 1,
    status: "coming-soon",
    priceLine: "Coming Soon",
    priceSubline: "Waitlist open",
    waitlist: true,
  },
];

export const PREMIUM_SUV_MIN_DAYS = 3;
export const MIN_RENTAL_AGE_PLACEHOLDER = 21;
