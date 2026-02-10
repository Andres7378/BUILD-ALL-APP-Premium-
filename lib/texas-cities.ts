// ─────────────────────────────────────────────
// Comprehensive list of Texas cities and towns
// within the supported Houston / Austin / DFW metros
// ─────────────────────────────────────────────

export interface CityEntry {
  name: string;
  metro: string;
  aliases?: string[];
}

export const TEXAS_CITIES: CityEntry[] = [
  // ── Houston Metro ─────────────────────────
  { name: 'Houston', metro: 'Houston Metro', aliases: ['htx', 'h-town'] },
  { name: 'Sugar Land', metro: 'Houston Metro', aliases: ['sugarland'] },
  { name: 'Katy', metro: 'Houston Metro' },
  { name: 'Pearland', metro: 'Houston Metro' },
  { name: 'The Woodlands', metro: 'Houston Metro', aliases: ['woodlands'] },
  { name: 'League City', metro: 'Houston Metro' },
  { name: 'Missouri City', metro: 'Houston Metro' },
  { name: 'Pasadena', metro: 'Houston Metro' },
  { name: 'Baytown', metro: 'Houston Metro' },
  { name: 'Conroe', metro: 'Houston Metro' },
  { name: 'Friendswood', metro: 'Houston Metro' },
  { name: 'Galveston', metro: 'Houston Metro' },
  { name: 'Texas City', metro: 'Houston Metro' },
  { name: 'Rosenberg', metro: 'Houston Metro' },
  { name: 'Richmond', metro: 'Houston Metro' },
  { name: 'Humble', metro: 'Houston Metro' },
  { name: 'Spring', metro: 'Houston Metro' },
  { name: 'Cypress', metro: 'Houston Metro' },
  { name: 'Tomball', metro: 'Houston Metro' },
  { name: 'Deer Park', metro: 'Houston Metro' },
  { name: 'La Porte', metro: 'Houston Metro' },
  { name: 'Webster', metro: 'Houston Metro' },
  { name: 'Alvin', metro: 'Houston Metro' },
  { name: 'Angleton', metro: 'Houston Metro' },
  { name: 'Bellaire', metro: 'Houston Metro' },
  { name: 'West University Place', metro: 'Houston Metro', aliases: ['west u', 'west university'] },
  { name: 'Stafford', metro: 'Houston Metro' },
  { name: 'Dickinson', metro: 'Houston Metro' },
  { name: 'Seabrook', metro: 'Houston Metro' },
  { name: 'Kemah', metro: 'Houston Metro' },
  { name: 'Clear Lake', metro: 'Houston Metro' },
  { name: 'Fulshear', metro: 'Houston Metro' },
  { name: 'Magnolia', metro: 'Houston Metro' },
  { name: 'Atascocita', metro: 'Houston Metro' },
  { name: 'Kingwood', metro: 'Houston Metro' },
  { name: 'Cinco Ranch', metro: 'Houston Metro' },
  { name: 'Sienna', metro: 'Houston Metro' },
  { name: 'Fresno', metro: 'Houston Metro' },
  { name: 'Manvel', metro: 'Houston Metro' },
  { name: 'Rosharon', metro: 'Houston Metro' },
  { name: 'Mont Belvieu', metro: 'Houston Metro' },
  { name: 'Dayton', metro: 'Houston Metro' },
  { name: 'Liberty', metro: 'Houston Metro' },
  { name: 'Waller', metro: 'Houston Metro' },
  { name: 'Hempstead', metro: 'Houston Metro' },
  { name: 'Sealy', metro: 'Houston Metro' },
  { name: 'Needville', metro: 'Houston Metro' },
  { name: 'Santa Fe', metro: 'Houston Metro' },
  { name: 'Hitchcock', metro: 'Houston Metro' },
  { name: 'La Marque', metro: 'Houston Metro' },
  { name: 'Brookshire', metro: 'Houston Metro' },
  { name: 'Meadows Place', metro: 'Houston Metro' },
  { name: 'Hunters Creek Village', metro: 'Houston Metro' },
  { name: 'Piney Point Village', metro: 'Houston Metro' },
  { name: 'Bunker Hill Village', metro: 'Houston Metro' },
  { name: 'Memorial', metro: 'Houston Metro' },
  { name: 'Champions', metro: 'Houston Metro' },
  { name: 'Copperfield', metro: 'Houston Metro' },
  { name: 'Jersey Village', metro: 'Houston Metro' },

  // ── Austin Metro ──────────────────────────
  { name: 'Austin', metro: 'Austin Metro', aliases: ['atx'] },
  { name: 'Round Rock', metro: 'Austin Metro' },
  { name: 'Cedar Park', metro: 'Austin Metro' },
  { name: 'Pflugerville', metro: 'Austin Metro' },
  { name: 'Georgetown', metro: 'Austin Metro' },
  { name: 'Leander', metro: 'Austin Metro' },
  { name: 'Kyle', metro: 'Austin Metro' },
  { name: 'Buda', metro: 'Austin Metro' },
  { name: 'San Marcos', metro: 'Austin Metro' },
  { name: 'Hutto', metro: 'Austin Metro' },
  { name: 'Lakeway', metro: 'Austin Metro' },
  { name: 'Bee Cave', metro: 'Austin Metro', aliases: ['bee caves'] },
  { name: 'Dripping Springs', metro: 'Austin Metro' },
  { name: 'Bastrop', metro: 'Austin Metro' },
  { name: 'Smithville', metro: 'Austin Metro' },
  { name: 'Taylor', metro: 'Austin Metro' },
  { name: 'Elgin', metro: 'Austin Metro' },
  { name: 'Manor', metro: 'Austin Metro' },
  { name: 'Lockhart', metro: 'Austin Metro' },
  { name: 'Liberty Hill', metro: 'Austin Metro' },
  { name: 'Wimberley', metro: 'Austin Metro' },
  { name: 'Lago Vista', metro: 'Austin Metro' },
  { name: 'Jollyville', metro: 'Austin Metro' },
  { name: 'Brushy Creek', metro: 'Austin Metro' },
  { name: 'Westlake', metro: 'Austin Metro', aliases: ['westlake hills'] },
  { name: 'Rollingwood', metro: 'Austin Metro' },
  { name: 'Barton Creek', metro: 'Austin Metro' },
  { name: 'Mueller', metro: 'Austin Metro' },
  { name: 'East Austin', metro: 'Austin Metro' },
  { name: 'South Austin', metro: 'Austin Metro' },
  { name: 'North Austin', metro: 'Austin Metro' },
  { name: 'West Austin', metro: 'Austin Metro' },

  // ── Dallas-Fort Worth Metro ───────────────
  { name: 'Dallas', metro: 'Dallas-Fort Worth Metro', aliases: ['dfw', 'big d'] },
  { name: 'Fort Worth', metro: 'Dallas-Fort Worth Metro', aliases: ['fw', 'ft worth', 'ft. worth'] },
  { name: 'Arlington', metro: 'Dallas-Fort Worth Metro' },
  { name: 'Plano', metro: 'Dallas-Fort Worth Metro' },
  { name: 'Frisco', metro: 'Dallas-Fort Worth Metro' },
  { name: 'McKinney', metro: 'Dallas-Fort Worth Metro' },
  { name: 'Irving', metro: 'Dallas-Fort Worth Metro' },
  { name: 'Garland', metro: 'Dallas-Fort Worth Metro' },
  { name: 'Grand Prairie', metro: 'Dallas-Fort Worth Metro' },
  { name: 'Denton', metro: 'Dallas-Fort Worth Metro' },
  { name: 'Mesquite', metro: 'Dallas-Fort Worth Metro' },
  { name: 'Carrollton', metro: 'Dallas-Fort Worth Metro' },
  { name: 'Richardson', metro: 'Dallas-Fort Worth Metro' },
  { name: 'Allen', metro: 'Dallas-Fort Worth Metro' },
  { name: 'Lewisville', metro: 'Dallas-Fort Worth Metro' },
  { name: 'Flower Mound', metro: 'Dallas-Fort Worth Metro' },
  { name: 'Mansfield', metro: 'Dallas-Fort Worth Metro' },
  { name: 'North Richland Hills', metro: 'Dallas-Fort Worth Metro', aliases: ['nrh'] },
  { name: 'Rowlett', metro: 'Dallas-Fort Worth Metro' },
  { name: 'Euless', metro: 'Dallas-Fort Worth Metro' },
  { name: 'Bedford', metro: 'Dallas-Fort Worth Metro' },
  { name: 'Grapevine', metro: 'Dallas-Fort Worth Metro' },
  { name: 'Keller', metro: 'Dallas-Fort Worth Metro' },
  { name: 'Southlake', metro: 'Dallas-Fort Worth Metro' },
  { name: 'Colleyville', metro: 'Dallas-Fort Worth Metro' },
  { name: 'Hurst', metro: 'Dallas-Fort Worth Metro' },
  { name: 'Coppell', metro: 'Dallas-Fort Worth Metro' },
  { name: 'The Colony', metro: 'Dallas-Fort Worth Metro' },
  { name: 'Rockwall', metro: 'Dallas-Fort Worth Metro' },
  { name: 'Wylie', metro: 'Dallas-Fort Worth Metro' },
  { name: 'Prosper', metro: 'Dallas-Fort Worth Metro' },
  { name: 'Celina', metro: 'Dallas-Fort Worth Metro' },
  { name: 'Little Elm', metro: 'Dallas-Fort Worth Metro' },
  { name: 'Sachse', metro: 'Dallas-Fort Worth Metro' },
  { name: 'Murphy', metro: 'Dallas-Fort Worth Metro' },
  { name: 'Duncanville', metro: 'Dallas-Fort Worth Metro' },
  { name: 'DeSoto', metro: 'Dallas-Fort Worth Metro', aliases: ['desoto'] },
  { name: 'Cedar Hill', metro: 'Dallas-Fort Worth Metro' },
  { name: 'Lancaster', metro: 'Dallas-Fort Worth Metro' },
  { name: 'Waxahachie', metro: 'Dallas-Fort Worth Metro' },
  { name: 'Midlothian', metro: 'Dallas-Fort Worth Metro' },
  { name: 'Burleson', metro: 'Dallas-Fort Worth Metro' },
  { name: 'Cleburne', metro: 'Dallas-Fort Worth Metro' },
  { name: 'Weatherford', metro: 'Dallas-Fort Worth Metro' },
  { name: 'Azle', metro: 'Dallas-Fort Worth Metro' },
  { name: 'Trophy Club', metro: 'Dallas-Fort Worth Metro' },
  { name: 'Corinth', metro: 'Dallas-Fort Worth Metro' },
  { name: 'Highland Village', metro: 'Dallas-Fort Worth Metro' },
  { name: 'Argyle', metro: 'Dallas-Fort Worth Metro' },
  { name: 'Justin', metro: 'Dallas-Fort Worth Metro' },
  { name: 'Saginaw', metro: 'Dallas-Fort Worth Metro' },
  { name: 'White Settlement', metro: 'Dallas-Fort Worth Metro' },
  { name: 'Benbrook', metro: 'Dallas-Fort Worth Metro' },
  { name: 'Lake Worth', metro: 'Dallas-Fort Worth Metro' },
  { name: 'Crowley', metro: 'Dallas-Fort Worth Metro' },
  { name: 'Kennedale', metro: 'Dallas-Fort Worth Metro' },
  { name: 'Farmers Branch', metro: 'Dallas-Fort Worth Metro' },
  { name: 'Addison', metro: 'Dallas-Fort Worth Metro' },
  { name: 'University Park', metro: 'Dallas-Fort Worth Metro' },
  { name: 'Highland Park', metro: 'Dallas-Fort Worth Metro' },
  { name: 'Forney', metro: 'Dallas-Fort Worth Metro' },
  { name: 'Kaufman', metro: 'Dallas-Fort Worth Metro' },
  { name: 'Terrell', metro: 'Dallas-Fort Worth Metro' },
  { name: 'Ennis', metro: 'Dallas-Fort Worth Metro' },
  { name: 'Red Oak', metro: 'Dallas-Fort Worth Metro' },
  { name: 'Anna', metro: 'Dallas-Fort Worth Metro' },
  { name: 'Melissa', metro: 'Dallas-Fort Worth Metro' },
  { name: 'Princeton', metro: 'Dallas-Fort Worth Metro' },
  { name: 'Fate', metro: 'Dallas-Fort Worth Metro' },
  { name: 'Heath', metro: 'Dallas-Fort Worth Metro' },
  { name: 'Royse City', metro: 'Dallas-Fort Worth Metro' },
  { name: 'Haslet', metro: 'Dallas-Fort Worth Metro' },
  { name: 'Roanoke', metro: 'Dallas-Fort Worth Metro' },
  { name: 'Decatur', metro: 'Dallas-Fort Worth Metro' },
  { name: 'Lake Dallas', metro: 'Dallas-Fort Worth Metro' },
  { name: 'Oak Point', metro: 'Dallas-Fort Worth Metro' },
  { name: 'Aubrey', metro: 'Dallas-Fort Worth Metro' },
  { name: 'Pilot Point', metro: 'Dallas-Fort Worth Metro' },
  { name: 'Sanger', metro: 'Dallas-Fort Worth Metro' },
];

/**
 * Try to match a user-typed location string to a known Texas city.
 * Returns the city entry if found, null otherwise.
 */
export function matchTexasCity(input: string): CityEntry | null {
  const normalized = input.toLowerCase().trim()
    .replace(/,?\s*(tx|texas)$/i, '')   // strip trailing TX / Texas
    .trim();

  for (const city of TEXAS_CITIES) {
    if (normalized === city.name.toLowerCase()) return city;

    // Check aliases
    if (city.aliases) {
      for (const alias of city.aliases) {
        if (normalized === alias.toLowerCase()) return city;
      }
    }

    // Fuzzy: if the input starts with the city name (handles "Katy TX" etc.)
    if (normalized.startsWith(city.name.toLowerCase())) return city;
  }

  return null;
}
