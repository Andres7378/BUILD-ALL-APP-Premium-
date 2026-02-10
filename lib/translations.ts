// ─────────────────────────────────────────────
// Full EN / ES translation dictionary
// ─────────────────────────────────────────────

export type Lang = 'en' | 'es';

export const translations: Record<Lang, Record<string, string>> = {
  en: {
    // Hero
    heroTitle: 'Find Trusted Home Service Pros in Texas',
    heroSubtitle:
      'Compare ratings, read reviews, and connect with top-rated contractors across Houston, Austin, and Dallas-Fort Worth.',

    // Search form
    serviceQuestion: 'What service do you need?',
    searchBtn: 'Search',
    locationPlaceholder: 'e.g., Dallas, Katy, Harris County, or 79356',
    selectCategory: 'Please select a service category.',
    enterLocation: 'Please enter a location.',

    // Categories
    concrete: 'Concrete',
    concreteDesc: 'Driveways, patios, foundations, and concrete repairs',
    electrical: 'Electrical',
    electricalDesc: 'Wiring, outlets, panels, and electrical installations',
    plumbing: 'Plumbing',
    plumbingDesc: 'Pipes, fixtures, water heaters, and drain cleaning',
    roofing: 'Roofing',
    roofingDesc: 'Roof repairs, replacements, and inspections',
    hvac: 'HVAC/A/C',
    hvacDesc: 'Air conditioning, heating, and ventilation systems',
    painting: 'Painting',
    paintingDesc: 'Interior and exterior painting services',
    'general-contractor': 'General Contractor',
    'general-contractorDesc': 'Complete renovation and construction projects',
    'pool-services': 'Pool Services',
    'pool-servicesDesc': 'Pool maintenance, repairs, and installations',

    // Results page
    backToSearch: 'Back to Search',
    searching: 'Searching for',
    contractors: 'contractors',
    contractorSingular: 'contractor',
    contractorPlural: 'contractors',
    inLocation: 'in',
    cachedFrom: 'Cached results from',
    noResults: 'No {category} services found in {location}',
    noResultsHint: 'Try searching in a different area or category.',
    tryDifferent: 'Try a different search',
    missingParams: 'Missing search parameters. Please select a category and location.',
    fetchError: 'Failed to fetch results. Please check your connection and try again.',
    openNow: 'Open',
    closedNow: 'Closed',
    reviews: 'reviews',

    // AI Assistant
    aiTitle: 'BuildAll Assistant',
    aiPlaceholder: 'Ask me anything...',
    aiWelcome:
      "Hi! 👋 I'm your BuildAll assistant. Tell me what home service you need and your location, and I'll help you find the best contractors. For example: \"I need a plumber in Katy\"",
    aiThinking: 'Finding the best match...',

    // Language
    langSwitch: 'Español',
  },
  es: {
    heroTitle: 'Encuentra Profesionales de Confianza en Texas',
    heroSubtitle:
      'Compara calificaciones, lee reseñas y conecta con contratistas de primera en Houston, Austin y Dallas-Fort Worth.',

    serviceQuestion: '¿Qué servicio necesitas?',
    searchBtn: 'Buscar',
    locationPlaceholder: 'Ej: Dallas, Katy, Harris County, o 79356',
    selectCategory: 'Por favor selecciona una categoría de servicio.',
    enterLocation: 'Por favor ingresa una ubicación.',

    concrete: 'Concreto',
    concreteDesc: 'Entradas, patios, cimentaciones y reparaciones de concreto',
    electrical: 'Electricidad',
    electricalDesc: 'Cableado, tomacorrientes, paneles e instalaciones eléctricas',
    plumbing: 'Plomería',
    plumbingDesc: 'Tuberías, accesorios, calentadores de agua y drenaje',
    roofing: 'Techos',
    roofingDesc: 'Reparación, reemplazo e inspección de techos',
    hvac: 'HVAC/A/C',
    hvacDesc: 'Aire acondicionado, calefacción y ventilación',
    painting: 'Pintura',
    paintingDesc: 'Servicios de pintura interior y exterior',
    'general-contractor': 'Contratista General',
    'general-contractorDesc': 'Proyectos completos de renovación y construcción',
    'pool-services': 'Servicios de Piscina',
    'pool-servicesDesc': 'Mantenimiento, reparaciones e instalación de piscinas',

    backToSearch: 'Volver a Buscar',
    searching: 'Buscando',
    contractors: 'contratistas',
    contractorSingular: 'contratista',
    contractorPlural: 'contratistas',
    inLocation: 'en',
    cachedFrom: 'Resultados en caché del',
    noResults: 'No se encontraron servicios de {category} en {location}',
    noResultsHint: 'Intenta buscar en un área o categoría diferente.',
    tryDifferent: 'Intentar otra búsqueda',
    missingParams: 'Faltan parámetros. Selecciona una categoría y ubicación.',
    fetchError: 'Error al buscar. Verifica tu conexión e intenta de nuevo.',
    openNow: 'Abierto',
    closedNow: 'Cerrado',
    reviews: 'reseñas',

    aiTitle: 'Asistente BuildAll',
    aiPlaceholder: 'Pregúntame lo que quieras...',
    aiWelcome:
      '¡Hola! 👋 Soy tu asistente de BuildAll. Dime qué servicio necesitas y tu ubicación, y te ayudaré a encontrar los mejores contratistas. Por ejemplo: "Necesito un plomero en Katy"',
    aiThinking: 'Buscando la mejor opción...',

    langSwitch: 'English',
  },
};
