

export type PriceTier = {
  minPeople: number;
  maxPeople: number | null; // null for 'and up'
  pricePerAdult: number;
  pricePerChild: number;
};

export type Tour = {
  id: string;
  slug: string;
  name: string;
  destination: string;
  type: string[];
  duration: number; // in days
  description: string;
  itinerary: { day: number; activity: string }[];
  availability: boolean;
  images: string[];
  rating: number;
  priceTiers: PriceTier[];
  price?: never; // Ensure old price field is not used

  // Detailed tour information
  durationText?: string;
  tourType?: string;
  availabilityDescription?: string;
  pickupAndDropoff?: string;
  highlights?: string[];
  includes?: string[];
  excludes?: string[];
  cancellationPolicy?: string;
};

export type CartItem = {
  tour: Tour;
  quantity: number; // This might represent adults now, or be refactored
  adults?: number;
  children?: number;
};
