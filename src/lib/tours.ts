
import type { Tour } from '@/types';

const tours: Tour[] = [
  {
    id: '1',
    name: 'Pyramids & Sphinx Expedition',
    destination: 'Cairo',
    type: 'Cultural',
    duration: 3,
    priceTiers: [
        { minPeople: 1, maxPeople: 1, pricePerAdult: 150, pricePerChild: 80 },
        { minPeople: 2, maxPeople: 5, pricePerAdult: 90, pricePerChild: 50 },
        { minPeople: 6, maxPeople: null, pricePerAdult: 75, pricePerChild: 40 },
    ],
    description: 'Explore the iconic Pyramids of Giza and the majestic Sphinx. A journey back in time to the land of Pharaohs, this tour offers an unforgettable glimpse into ancient Egypt\'s most famous landmarks.',
    itinerary: [
      { day: 1, activity: 'Arrival in Cairo, transfer to hotel, evening visit to Khan el-Khalili bazaar.' },
      { day: 2, activity: 'Full day tour of the Giza Plateau: Great Pyramids, Sphinx, and Solar Boat Museum.' },
      { day: 3, activity: 'Visit the Egyptian Museum to see the treasures of Tutankhamun, then departure.' },
    ],
    availability: true,
    image: 'https://images.unsplash.com/photo-1572252433829-d6a3c659d832?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxFeWdpdCUyMHRyYXZlbHxlbnwwfHx8MTc1Mjg4MTM3Mnww&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 4.9,
    durationText: "3 Days / 2 Nights",
    tourType: "Private Guided Tour",
    availabilityDescription: "Available daily. Book at least 48 hours in advance.",
    pickupAndDropoff: "Included from any hotel in Cairo or Giza.",
    highlights: [
      "Marvel at the Great Pyramids of Giza.",
      "Come face-to-face with the enigmatic Sphinx.",
      "Discover priceless artifacts at the Egyptian Museum.",
      "Shop for souvenirs in the historic Khan el-Khalili bazaar."
    ],
    includes: [
      "2 nights hotel accommodation in Cairo",
      "All transfers in a private, air-conditioned vehicle",
      "Private English-speaking Egyptologist guide",
      "Entrance fees to all mentioned sites",
      "Bottled water during your tours",
      "All service charges & taxes"
    ],
    excludes: [
      "International airfare",
      "Entry visa to Egypt",
      "Personal spending",
      "Tipping"
    ],
    cancellationPolicy: "Cancel up to 7 days in advance for a full refund. No refunds for cancellations made within 7 days of the tour."
  },
  {
    id: '2',
    name: 'Luxor: Valley of the Kings',
    destination: 'Luxor',
    type: 'Cultural',
    duration: 4,
    priceTiers: [
        { minPeople: 1, maxPeople: 1, pricePerAdult: 200, pricePerChild: 100 },
        { minPeople: 2, maxPeople: 5, pricePerAdult: 120, pricePerChild: 70 },
        { minPeople: 6, maxPeople: null, pricePerAdult: 100, pricePerChild: 60 },
    ],
    description: 'Discover the treasures of ancient Thebes. Visit the Valley of the Kings, Karnak Temple, and Luxor Temple in this comprehensive tour of the world\'s greatest open-air museum.',
    itinerary: [
      { day: 1, activity: 'Arrival in Luxor, visit the grand Luxor Temple illuminated at night.' },
      { day: 2, activity: 'Explore the West Bank: Valley of the Kings, Temple of Hatshepsut, and the Colossi of Memnon.' },
      { day: 3, activity: 'Visit the vast Karnak Temple Complex and the Luxor Museum.' },
      { day: 4, activity: 'Optional hot air balloon ride over the West Bank at sunrise, followed by departure.' },
    ],
    availability: true,
    image: 'https://images.unsplash.com/photo-1576487248805-cf4d8e504829?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHxMdXhvciUyMFryb3NzfGVufDB8fHx8MTc1Mjg4MTM3Mnww&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 4.8,
    durationText: "4 Days / 3 Nights",
    tourType: "Historical & Cultural Tour",
    availabilityDescription: "Runs daily. Advance booking recommended.",
    pickupAndDropoff: "Pickup from Luxor International Airport or any Luxor hotel.",
    highlights: [
      "Explore the royal tombs in the Valley of the Kings.",
      "Walk through the massive Karnak Temple Complex.",
      "See the beautiful Luxor Temple by night.",
      "Visit the stunning terraced Temple of Queen Hatshepsut."
    ],
    includes: [
      "3 nights hotel accommodation in Luxor",
      "Airport transfers",
      "All tours with a private guide",
      "Entrance fees to all historical sites",
      "Breakfast at the hotel"
    ],
    excludes: [
      "Hot air balloon ride (optional extra)",
      "Lunches and dinners",
      "Tipping",
      "Drinks and personal expenses"
    ],
    cancellationPolicy: "Full refund for cancellations made at least 14 days before the start date of the experience."
  },
  {
    id: '3',
    name: 'Nile Cruise from Aswan',
    destination: 'Aswan',
    type: 'Relaxation',
    duration: 5,
    priceTiers: [
        { minPeople: 1, maxPeople: 1, pricePerAdult: 300, pricePerChild: 150 },
        { minPeople: 2, maxPeople: 5, pricePerAdult: 250, pricePerChild: 125 },
        { minPeople: 6, maxPeople: null, pricePerAdult: 220, pricePerChild: 110 },
    ],
    description: 'Sail the majestic Nile River from Aswan to Luxor. Enjoy stunning scenery, visit ancient temples, and relax on a luxury 5-star cruise ship. This is the classic Egyptian travel experience.',
    itinerary: [
      { day: 1, activity: 'Embark in Aswan, visit the High Dam and the beautiful Philae Temple on Agilkia Island.' },
      { day: 2, activity: 'Sail to Kom Ombo and visit the unique temple dedicated to two gods, Sobek and Haroeris.' },
      { day: 3, activity: 'Sail to Edfu, visit the best-preserved cult temple in Egypt, the Temple of Horus.' },
      { day: 4, activity: 'Sail to Luxor, visit the East Bank (Karnak & Luxor Temples).' },
      { day: 5, activity: 'Disembark after breakfast. Optional tour to the West Bank.' },
    ],
    availability: true,
    image: 'https://images.unsplash.com/photo-1601639773191-23d537ddc1e7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxBc3dhbiUyMEVneXB0fGVufDB8fHx8MTc1Mjg4MTM3Mnww&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 4.9,
    durationText: "5 Days / 4 Nights",
    tourType: "Luxury Nile Cruise",
    availabilityDescription: "Cruises depart every Monday and Wednesday.",
    pickupAndDropoff: "Pickup from Aswan airport or hotels. Drop-off at Luxor airport or hotels.",
    highlights: [
      "Relax on the sun deck of a 5-star Nile cruise boat.",
      "Visit the majestic temples of Philae, Kom Ombo, and Edfu.",
      "Enjoy full board accommodation with daily meals.",
      "Experience the timeless scenery of the Nile Valley."
    ],
    includes: [
      "4 nights on a 5-star Nile cruise ship",
      "Full board (breakfast, lunch, dinner)",
      "All sightseeing tours as mentioned in the itinerary",
      "Professional Egyptologist guide",
      "Entrance fees to all sites between Aswan and Luxor"
    ],
    excludes: [
      "Beverages on board",
      "Optional tours (e.g., Abu Simbel)",
      "Tipping for the crew and guide"
    ],
    cancellationPolicy: "A 50% charge for cancellations within 15 days of departure. No refund for cancellations within 7 days."
  },
  {
    id: '4',
    name: 'Red Sea Diving Adventure',
    destination: 'Sharm El Sheikh',
    type: 'Adventure',
    duration: 7,
     priceTiers: [
        { minPeople: 1, maxPeople: 1, pricePerAdult: 350, pricePerChild: 180 },
        { minPeople: 2, maxPeople: 5, pricePerAdult: 280, pricePerChild: 150 },
        { minPeople: 6, maxPeople: null, pricePerAdult: 250, pricePerChild: 130 },
    ],
    description: 'Dive into the vibrant coral reefs of the Red Sea. A world-class diving experience for beginners and experts alike in the famous waters of Sharm El Sheikh.',
    itinerary: [
        { day: 1, activity: 'Arrival in Sharm El Sheikh, check into your beach resort.' },
        { day: 2, activity: 'Dive briefing and first two dives in the stunning Ras Mohammed National Park.' },
        { day: 3, activity: 'Full day trip to dive the legendary SS Thistlegorm wreck.' },
        { day: 4, activity: 'Day of relaxation or optional desert quad biking adventure.' },
        { day: 5, activity: 'Two incredible dives at the reefs of Tiran Island.' },
        { day: 6, activity: 'Free day for beach activities, shopping in Naama Bay, or relaxing by the pool.' },
        { day: 7, activity: 'Departure from Sharm El Sheikh.' },
    ],
    availability: true,
    image: 'https://images.unsplash.com/photo-1607595304128-2d5b6a7e6c0c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxTaGFybSUyMEVsJTIwU2hlaWtoJTIwRGl2aW5nfGVufDB8fHx8MTc1Mjg4MTM3Mnww&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 5.0,
    durationText: "7 Days / 6 Nights",
    tourType: "Diving & Watersports",
    availabilityDescription: "Available year-round. PADI certification required for wreck dive.",
    pickupAndDropoff: "Included from Sharm El Sheikh International Airport.",
    highlights: [
      "Explore the world-famous reefs of Ras Mohammed National Park.",
      "Dive the historic SS Thistlegorm shipwreck.",
      "See incredible marine biodiversity at Tiran Island.",
      "Relax at a comfortable all-inclusive beach resort."
    ],
    includes: [
      "6 nights resort accommodation",
      "Breakfast and dinner at the resort",
      "A total of 6 guided dives",
      "Dive equipment rental (tanks, weights)",
      "All transfers to dive sites"
    ],
    excludes: [
      "PADI certification course (can be arranged)",
      "Wetsuit and computer rental",
      "Lunches on non-diving days",
      "National park fees"
    ],
    cancellationPolicy: "Requires a 30-day cancellation notice for a full refund due to boat booking requirements."
  },
  {
    id: '5',
    name: 'Hurghada Beach Getaway',
    destination: 'Hurghada',
    type: 'Relaxation',
    duration: 6,
    priceTiers: [
        { minPeople: 1, maxPeople: 1, pricePerAdult: 250, pricePerChild: 120 },
        { minPeople: 2, maxPeople: 5, pricePerAdult: 180, pricePerChild: 90 },
        { minPeople: 6, maxPeople: null, pricePerAdult: 160, pricePerChild: 80 },
    ],
    description: "Relax on the sunny beaches of Hurghada. Enjoy watersports, fresh seafood, and the vibrant resort atmosphere of this Red Sea paradise.",
    itinerary: [
      { day: 1, activity: 'Arrival in Hurghada and transfer to your all-inclusive resort.' },
      { day: 2, activity: 'Full day at leisure to enjoy the beach and hotel pools.' },
      { day: 3, activity: 'Boat and snorkeling trip to the beautiful Giftun Island.' },
      { day: 4, activity: 'Explore the modern Hurghada Marina and enjoy local cuisine.' },
      { day: 5, activity: 'Free day for optional activities like glass-bottom boat or submarine tour.' },
      { day: 6, activity: 'Departure from Hurghada.' },
    ],
    availability: true,
    image: 'https://images.unsplash.com/photo-1616262495333-33633842c65a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxIdXJnaGFkYSUyMEJlYWNofGVufDB8fHx8MTc1Mjg4MTM3Mnww&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 4.7,
    durationText: "6 Days / 5 Nights",
    tourType: "Beach & Leisure",
    availabilityDescription: "Perfect for a sunny escape any time of year.",
    pickupAndDropoff: "Included from Hurghada International Airport.",
    highlights: [
      "Relax on the pristine beaches of the Red Sea.",
      "Snorkel among colorful fish at Giftun Island.",
      "Enjoy the amenities of an all-inclusive resort.",
      "Stroll through the modern Hurghada Marina."
    ],
    includes: [
      "5 nights in an all-inclusive resort",
      "All meals and local drinks at the resort",
      "Snorkeling trip to Giftun Island",
      "Airport transfers"
    ],
    excludes: [
      "Optional tours and watersports",
      "Premium imported beverages",
      "Personal expenses"
    ],
    cancellationPolicy: "Full refund for cancellations up to 3 days before arrival."
  },
  {
    id: '6',
    name: 'Alexandria: Pearl of the Mediterranean',
    destination: 'Alexandria',
    type: 'Cultural',
    duration: 1,
    priceTiers: [
        { minPeople: 1, maxPeople: 1, pricePerAdult: 180, pricePerChild: 90 },
        { minPeople: 2, maxPeople: 5, pricePerAdult: 110, pricePerChild: 60 },
        { minPeople: 6, maxPeople: null, pricePerAdult: 95, pricePerChild: 50 },
    ],
    description: 'Day tour to Alexandria 10 hours starts every day from 7 am to 18:00 pm. Explore the historic city of Alexandria. Visit the modern library, Roman amphitheater, and enjoy the Mediterranean sea breeze.',
    itinerary: [
        { day: 1, activity: 'Pick up from your hotel in Cairo or Giza. Drive to Alexandria. Visit Pompey\'s Pillar, the Catacombs, the Library of Alexandria, and Qaitbay Citadel from the outside. Lunch at a local fish market restaurant. Return to Cairo in the evening.' }
    ],
    availability: false,
    image: 'https://images.unsplash.com/photo-1623674620242-613d6a7e6c0c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxBcHJpbCUyMDIwMjQlMjBBbGV4YW5kcmlhJTIwRWd5cHR8ZW58MHx8fHwxNzUyODgxMzcyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 4.6,
    durationText: "10 Hours",
    tourType: "Private Day Tour",
    availabilityDescription: "Runs Every day From 06:00 am to 18:00 pm",
    pickupAndDropoff: "Customers' Location in either Cairo or Giza",
    highlights: [
      "Visit the Library of Alexandria, a modern architectural marvel.",
      "Descend into the Catacombs of Kom El Shoqafa.",
      "See the granite pillar of Pompey.",
      "View the Citadel of Qaitbay from the outside.",
      "Enjoy lunch at a local restaurant."
    ],
    includes: [
      "All pick up & drop off from customer location in Cairo",
      "Entry Fees",
      "Private Transfere from & to Cairo",
      "Sharing Tour guide In Alexandria",
      "Lunch at Local restaurant",
      "All Taxes Services",
      "Bottle of Water",
      "All Transfers by Private A/C Vehicles Newest Model",
    ],
    excludes: [
      "Personal items",
      "Tipping",
    ],
    cancellationPolicy: "For a full refund, you must cancel at least 24 hours before the experience’s start time. If you cancel less than 24 hours before the experience’s start time, the amount you paid will not be refunded. Any changes made less than 24 hours before the experience’s start time will not be accepted. Cut-off times are based on the experience’s local time."
  }
];

// @ts-ignore
export const getTours = (): Tour[] => tours.filter(tour => tour.priceTiers);

export const getTourById = (id: string): Tour | undefined => getTours().find(tour => tour.id === id);
