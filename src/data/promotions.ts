export interface Promotion {
  id: string;
  title: string;
  description: string;
  tag: string;
}

export const promotions: Promotion[] = [
  {
    id: "extended",
    tag: "Extended rentals",
    title: "Extended Rental Offer",
    description:
      "Ask about available weekly and extended-rental pricing for economy and premium vehicles.",
  },
  {
    id: "suv-getaway",
    tag: "Premium SUV",
    title: "Premium SUV Getaway",
    description:
      "Plan a family trip, road trip, airport transfer, or special weekend with a spacious premium SUV.",
  },
  {
    id: "seasonal",
    tag: "Seasonal",
    title: "Seasonal Travel Package",
    description:
      "Contact us to learn about current seasonal rental offers and premium SUV availability.",
  },
];
