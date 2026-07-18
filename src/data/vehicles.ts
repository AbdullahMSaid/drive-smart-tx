import economySedan from "@/assets/economy-sedan.jpg";
import compactCrossover from "@/assets/compact-crossover.jpg";
import suburban from "@/assets/suburban.jpg";
import premiumSuv from "@/assets/premium-suv.jpg";

export type VehicleCategory = "economy" | "premium-suv";

export interface Vehicle {
  id: string;
  name: string;
  category: VehicleCategory;
  categoryLabel: string;
  image: string;
  dailyPrice: string;
  weeklyPrice: string;
  minRentalDays: number;
  passengers: number;
  luggage: string;
  transmission: string;
  fuel: string;
  features: string[];
  availabilityLabel: string;
  featured: boolean;
  promoLabel?: string;
  description: string;
}

export const vehicles: Vehicle[] = [
  {
    id: "economy-sedan",
    name: "Economy Sedan",
    category: "economy",
    categoryLabel: "Economy",
    image: economySedan,
    dailyPrice: "$ —— / day",
    weeklyPrice: "$ —— / week",
    minRentalDays: 1,
    passengers: 5,
    luggage: "2 large bags",
    transmission: "Automatic",
    fuel: "Fuel-efficient gasoline",
    features: ["Bluetooth audio", "Backup camera", "Cruise control"],
    availabilityLabel: "Request availability",
    featured: true,
    description:
      "A practical, comfortable sedan for everyday driving, commuting, and extended rentals.",
  },
  {
    id: "compact-crossover",
    name: "Compact Crossover",
    category: "economy",
    categoryLabel: "Economy",
    image: compactCrossover,
    dailyPrice: "$ —— / day",
    weeklyPrice: "$ —— / week",
    minRentalDays: 1,
    passengers: 5,
    luggage: "3 large bags",
    transmission: "Automatic",
    fuel: "Fuel-efficient gasoline",
    features: ["Extra cargo space", "Elevated seating", "Apple CarPlay / Android Auto"],
    availabilityLabel: "Request availability",
    featured: true,
    description:
      "A versatile crossover with extra cargo room — comfortable for daily driving and weekend trips.",
  },
  {
    id: "suburban",
    name: "Chevrolet Suburban or Similar",
    category: "premium-suv",
    categoryLabel: "Premium SUV",
    image: suburban,
    dailyPrice: "$ —— / day",
    weeklyPrice: "$ —— / week",
    minRentalDays: 3,
    passengers: 8,
    luggage: "6+ large bags",
    transmission: "Automatic",
    fuel: "Gasoline",
    features: ["7–8 passenger seating", "Premium interior", "Large luggage capacity"],
    availabilityLabel: "Request availability",
    featured: true,
    promoLabel: "3-day minimum",
    description:
      "Spacious full-size SUV built for group travel, family trips, and airport transportation.",
  },
  {
    id: "premium-full-size-suv",
    name: "Premium Full-Size SUV",
    category: "premium-suv",
    categoryLabel: "Premium SUV",
    image: premiumSuv,
    dailyPrice: "$ —— / day",
    weeklyPrice: "$ —— / week",
    minRentalDays: 3,
    passengers: 7,
    luggage: "5+ large bags",
    transmission: "Automatic",
    fuel: "Gasoline",
    features: ["Premium comfort", "Advanced tech", "Ideal for special occasions"],
    availabilityLabel: "Request availability",
    featured: true,
    promoLabel: "3-day minimum",
    description:
      "A refined full-size SUV for road trips, business travel, and memorable special occasions.",
  },
];

export const PREMIUM_SUV_MIN_DAYS = 3;
export const MIN_RENTAL_AGE_PLACEHOLDER = 21;
