import { ServiceCategory } from './types';

// Service categories for home services
export const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    id: 'concrete',
    name: 'Concrete',
    icon: 'Blocks',
    description: 'Driveways, patios, foundations, and concrete repairs',
  },
  {
    id: 'electrical',
    name: 'Electrical',
    icon: 'Zap',
    description: 'Wiring, outlets, panels, and electrical installations',
  },
  {
    id: 'plumbing',
    name: 'Plumbing',
    icon: 'Droplet',
    description: 'Pipes, fixtures, water heaters, and drain cleaning',
  },
  {
    id: 'roofing',
    name: 'Roofing',
    icon: 'Home',
    description: 'Roof repairs, replacements, and inspections',
  },
  {
    id: 'hvac',
    name: 'HVAC/A/C',
    icon: 'Wind',
    description: 'Air conditioning, heating, and ventilation systems',
  },
  {
    id: 'painting',
    name: 'Painting',
    icon: 'Paintbrush',
    description: 'Interior and exterior painting services',
  },
  {
    id: 'general-contractor',
    name: 'General Contractor',
    icon: 'Hammer',
    description: 'Complete renovation and construction projects',
  },
  {
    id: 'pool-services',
    name: 'Pool Services',
    icon: 'Waves',
    description: 'Pool maintenance, repairs, and installations',
  },
];

// Texas metro areas with their counties
export const TEXAS_METROS = {
  houston: {
    name: 'Houston Metro',
    counties: [
      'Harris County',
      'Fort Bend County',
      'Montgomery County',
      'Brazoria County',
      'Galveston County',
      'Liberty County',
      'Waller County',
      'Chambers County',
      'Austin County',
    ],
  },
  austin: {
    name: 'Austin Metro',
    counties: [
      'Travis County',
      'Williamson County',
      'Hays County',
      'Bastrop County',
      'Caldwell County',
    ],
  },
  dfw: {
    name: 'Dallas-Fort Worth Metro',
    counties: [
      'Dallas County',
      'Tarrant County',
      'Collin County',
      'Denton County',
      'Rockwall County',
      'Ellis County',
      'Johnson County',
      'Kaufman County',
      'Parker County',
      'Wise County',
    ],
  },
};

// Default search radius in meters
export const DEFAULT_SEARCH_RADIUS = 16093.4; // 10 miles in meters

// Maximum number of results to fetch
export const MAX_RESULTS = 20;

// Google Places API fields to request
export const PLACE_FIELDS = [
  'place_id',
  'name',
  'formatted_address',
  'rating',
  'user_ratings_total',
  'geometry',
  'business_status',
  'opening_hours',
  'photos',
  'types',
];

export const PLACE_DETAILS_FIELDS = [
  'place_id',
  'name',
  'formatted_address',
  'formatted_phone_number',
  'international_phone_number',
  'website',
  'rating',
  'user_ratings_total',
  'reviews',
  'opening_hours',
  'photos',
  'geometry',
  'business_status',
  'types',
  'url',
  'price_level',
];
