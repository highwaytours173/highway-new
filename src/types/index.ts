export type Tour = {
  id: string;
  name: string;
  destination: string;
  type: 'Adventure' | 'Relaxation' | 'Cultural' | 'Culinary';
  duration: number; // in days
  price: number;
  description: string;
  itinerary: { day: number; activity: string }[];
  availability: boolean;
  image: string;
  rating: number;
};

export type CartItem = {
  tour: Tour;
  quantity: number;
};
