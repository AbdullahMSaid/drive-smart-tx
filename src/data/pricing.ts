// Centralized rental pricing configuration.
// This module is the single source of truth for rate display, rate-details modal,
// and the availability estimator. It is UI-agnostic so it can later be moved to
// Lovable Cloud (Supabase) without rewriting components.

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sun ... 6 = Sat

export interface DayRates {
  sun: number;
  mon: number;
  tue: number;
  wed: number;
  thu: number;
  fri: number;
  sat: number;
}

export interface VehiclePricing {
  vehicleId: string;
  displayName: string;
  minimumDays: number;
  fromPrice: number;
  standardRates: DayRates;
  pricingNotes?: string[];
}

export interface PricingOverride {
  vehicleId: string;
  /** Inclusive ISO date YYYY-MM-DD */
  startDate: string;
  /** Inclusive ISO date YYYY-MM-DD */
  endDate: string;
  reason?: string;
  /** Only the day-of-week rates that should be overridden inside the range. */
  rates: Partial<DayRates>;
}

const DOW_KEYS: (keyof DayRates)[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

export const DOW_LABELS: Record<keyof DayRates, string> = {
  sun: "Sunday",
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
};

export const VEHICLE_PRICING: VehiclePricing[] = [
  {
    vehicleId: "honda-accord-2019",
    displayName: "Honda Accord (2019)",
    minimumDays: 1,
    fromPrice: 69,
    standardRates: { sun: 79, mon: 69, tue: 69, wed: 69, thu: 69, fri: 80, sat: 90 },
  },
  {
    vehicleId: "honda-accord-2015",
    displayName: "Honda Accord (2013)",
    minimumDays: 1,
    fromPrice: 69,
    standardRates: { sun: 79, mon: 69, tue: 69, wed: 69, thu: 69, fri: 80, sat: 90 },
  },
  {
    vehicleId: "lexus-es350-2015",
    displayName: "Lexus ES 350 (2015)",
    minimumDays: 1,
    fromPrice: 89,
    standardRates: { sun: 99, mon: 89, tue: 89, wed: 89, thu: 89, fri: 109, sat: 119 },
  },
  {
    vehicleId: "suburban-2021",
    displayName: "Chevrolet Suburban (2021)",
    minimumDays: 3,
    fromPrice: 150,
    standardRates: { sun: 150, mon: 150, tue: 150, wed: 150, thu: 150, fri: 189, sat: 219 },
    pricingNotes: ["3-day minimum rental"],
  },
  {
    vehicleId: "suburban-2023",
    displayName: "Chevrolet Suburban (2023)",
    minimumDays: 3,
    fromPrice: 150,
    standardRates: { sun: 199, mon: 150, tue: 150, wed: 150, thu: 169, fri: 199, sat: 229 },
    pricingNotes: ["3-day minimum rental"],
  },
];

// Manually configured special-event pricing overrides. Leave empty for no
// active overrides. Example (commented out) for the 2023 Suburban during a
// specific weekend:
//
// { vehicleId: "suburban-2023", startDate: "2026-09-11", endDate: "2026-09-13",
//   reason: "Special event weekend",
//   rates: { fri: 249, sat: 279 } },
export const PRICING_OVERRIDES: PricingOverride[] = [];

export function getVehiclePricing(vehicleId: string): VehiclePricing | null {
  return VEHICLE_PRICING.find((v) => v.vehicleId === vehicleId) ?? null;
}

function dowKey(date: Date): keyof DayRates {
  return DOW_KEYS[date.getDay()];
}

/** Parse a YYYY-MM-DD string as a local date (avoids UTC drift). */
function parseLocalDate(iso: string): Date | null {
  if (!iso) return null;
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return null;
  const dt = new Date(y, m - 1, d);
  return isNaN(dt.getTime()) ? null : dt;
}

function isoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function findOverride(
  vehicleId: string,
  iso: string,
  dow: keyof DayRates,
): { rate: number; reason?: string } | null {
  for (const o of PRICING_OVERRIDES) {
    if (o.vehicleId !== vehicleId) continue;
    if (iso < o.startDate || iso > o.endDate) continue;
    const r = o.rates[dow];
    if (typeof r === "number") return { rate: r, reason: o.reason };
  }
  return null;
}

export interface RentalDayLine {
  date: string; // ISO
  dayOfWeek: keyof DayRates;
  dayLabel: string; // e.g. "Thu"
  rate: number;
  isOverride: boolean;
  overrideReason?: string;
}

export interface RentalEstimate {
  vehicleId: string;
  pickupDate: string;
  returnDate: string;
  days: RentalDayLine[];
  totalDays: number;
  baseTotal: number;
  minimumDays: number;
  meetsMinimum: boolean;
}

const SHORT_LABEL: Record<keyof DayRates, string> = {
  sun: "Sun", mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat",
};

/**
 * Build a rental estimate for the given vehicle and inclusive date range.
 * Each calendar day from pickupDate to returnDate (inclusive) is charged at
 * its own day-of-week rate, honoring any active special-event override.
 */
export function estimateRental(
  vehicleId: string,
  pickupDate: string,
  returnDate: string,
): RentalEstimate | null {
  const pricing = getVehiclePricing(vehicleId);
  if (!pricing) return null;
  const start = parseLocalDate(pickupDate);
  const end = parseLocalDate(returnDate);
  if (!start || !end) return null;
  if (end.getTime() < start.getTime()) return null;

  const days: RentalDayLine[] = [];
  const cursor = new Date(start);
  while (cursor.getTime() <= end.getTime()) {
    const iso = isoDate(cursor);
    const dow = dowKey(cursor);
    const override = findOverride(vehicleId, iso, dow);
    const rate = override?.rate ?? pricing.standardRates[dow];
    days.push({
      date: iso,
      dayOfWeek: dow,
      dayLabel: SHORT_LABEL[dow],
      rate,
      isOverride: !!override,
      overrideReason: override?.reason,
    });
    cursor.setDate(cursor.getDate() + 1);
  }

  const baseTotal = days.reduce((sum, d) => sum + d.rate, 0);
  return {
    vehicleId,
    pickupDate,
    returnDate,
    days,
    totalDays: days.length,
    baseTotal,
    minimumDays: pricing.minimumDays,
    meetsMinimum: days.length >= pricing.minimumDays,
  };
}

export function formatCurrency(n: number): string {
  return `$${n.toLocaleString("en-US")}`;
}
