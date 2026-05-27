export type DemoRoute = {
  id: string;
  fromCity: string;
  toCity: string;
  distanceKm: number;
  highwayFactor: number;
  notes: string;
};

// SAMPLE/DEMO DATA ONLY: route distances are approximate placeholders for MVP calculations.
export const demoRoutes: DemoRoute[] = [
  {
    id: 'lahore-islamabad',
    fromCity: 'Lahore',
    toCity: 'Islamabad',
    distanceKm: 375,
    highwayFactor: 1.18,
    notes: 'Motorway-heavy route with higher highway energy use.',
  },
  {
    id: 'lahore-faisalabad',
    fromCity: 'Lahore',
    toCity: 'Faisalabad',
    distanceKm: 185,
    highwayFactor: 1.12,
    notes: 'Common Punjab intercity trip for weekend and business travel.',
  },
  {
    id: 'islamabad-peshawar',
    fromCity: 'Islamabad',
    toCity: 'Peshawar',
    distanceKm: 185,
    highwayFactor: 1.15,
    notes: 'Motorway route where charging buffer should be considered.',
  },
  {
    id: 'karachi-hyderabad',
    fromCity: 'Karachi',
    toCity: 'Hyderabad',
    distanceKm: 165,
    highwayFactor: 1.16,
    notes: 'Shorter highway route with heat and speed affecting range.',
  },
  {
    id: 'multan-lahore',
    fromCity: 'Multan',
    toCity: 'Lahore',
    distanceKm: 350,
    highwayFactor: 1.18,
    notes: 'Longer motorway route likely requiring careful vehicle selection.',
  },
  {
    id: 'islamabad-murree',
    fromCity: 'Islamabad',
    toCity: 'Murree',
    distanceKm: 65,
    highwayFactor: 1.25,
    notes: 'Short but hilly route where elevation can affect energy use.',
  },
];
