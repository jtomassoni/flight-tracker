import type { AirlineBrand } from '@/lib/airlines';
import type { NormalizedAircraft } from '@/types/aircraft';

export type AircraftTrafficClass =
  | 'airline'
  | 'vip'
  | 'military'
  | 'cargo'
  | 'bizjet'
  | 'ga'
  | 'unknown';

/** ICAO codes for category brands — also used as LED mark keys. */
export const CATEGORY_ICAO = {
  MILITARY: 'MIL',
  BIZJET: 'PVT',
  GA: 'GA',
  VIP: 'VIP',
  CARGO: 'CGO',
} as const;

/**
 * Publicly reported tail numbers that enthusiasts track on ADS-B.
 * Matches registration or N-number callsign when present in the feed.
 */
const FAMOUS_TAILS: Record<string, { name: string }> = {
  N628TS: { name: 'Elon Musk' },
  N898TS: { name: 'Taylor Swift' },
  N757AF: { name: 'Trump Force One' },
};

const MILITARY_CALLSIGN_PREFIXES = [
  'RCH',
  'REACH',
  'EVAC',
  'NAVY',
  'ARMY',
  'USAF',
  'USN',
  'USMC',
  'SPAR',
  'CONDO',
  'DUKE',
  'IRON',
  'HKY',
  'MOXY',
  'TOPCAT',
  'TITAN',
  'VIPER',
  'JAKE',
];

const MILITARY_TYPE_PREFIXES = [
  'F15',
  'F16',
  'F18',
  'F22',
  'F35',
  'A10',
  'B52',
  'B1',
  'B2',
  'C5',
  'C17',
  'C130',
  'C30J',
  'KC10',
  'KC135',
  'KC46',
  'E3',
  'E6',
  'E8',
  'P8',
  'T38',
  'V22',
  'H60',
  'UH60',
  'CH47',
  'AH64',
  'L159',
  'T6',
];

const BIZJET_TYPE_PREFIXES = [
  'GLF',
  'GLEX',
  'G550',
  'G650',
  'GL7T',
  'GL5T',
  'CL30',
  'CL35',
  'CL60',
  'C25',
  'C50',
  'C51',
  'C52',
  'C55',
  'C56',
  'C68',
  'C70',
  'C72',
  'C75',
  'C82',
  'C500',
  'C510',
  'C525',
  'C526',
  'C550',
  'C560',
  'C680',
  'C68A',
  'C700',
  'C750',
  'E50P',
  'E55P',
  'E545',
  'E550',
  'FA7X',
  'FA8X',
  'FA50',
  'GALX',
  'LJ35',
  'LJ45',
  'LJ60',
  'LJ75',
  'H25B',
  'PC24',
  'HDJT',
  'E35L',
];

const GA_TYPE_PREFIXES = [
  'C150',
  'C152',
  'C172',
  'C182',
  'C206',
  'C210',
  'PA28',
  'PA32',
  'PA44',
  'SR20',
  'SR22',
  'DA40',
  'DA42',
  'BE33',
  'BE35',
  'BE36',
  'M20P',
  'RV',
  'AA5',
  'P28A',
  'C77R',
  'TBM9',
];

const GA_EMITTER_CATEGORIES = new Set(['A1', 'A2']);

/** ICAO airline designators for dedicated freight operators (callsign prefixes). */
const CARGO_CALLSIGN_PREFIXES = [
  'FDX', // FedEx
  'UPS', // UPS Airlines
  'GTI', // Atlas Air
  'GEC', // Lufthansa Cargo
  'CLX', // Cargolux
  'CKS', // Kalitta Air
  'ABX', // ABX Air
  'BOX', // AeroLogic
  'GSS', // Atlas Air / DHL (Global Supply Systems)
  'BCS', // DHL (European Air Transport)
  'NCA', // Nippon Cargo
  'PAC', // Polar Air Cargo
  'MPH', // Martinair Cargo
  'ABW', // AirBridgeCargo
  'WGN', // Western Global
  'ICL', // CAL Cargo
  'CAO', // Air China Cargo
  'CKK', // China Cargo
];

const CATEGORY_BRANDS: Record<string, AirlineBrand> = {
  [CATEGORY_ICAO.MILITARY]: {
    name: 'Military',
    icao: CATEGORY_ICAO.MILITARY,
    iata: 'MI',
    primaryColor: '#3D4F2F',
    accentColor: '#C5A572',
    secondaryColor: '#2C1810',
  },
  [CATEGORY_ICAO.BIZJET]: {
    name: 'Private Jet',
    icao: CATEGORY_ICAO.BIZJET,
    iata: 'PJ',
    primaryColor: '#1E293B',
    accentColor: '#D4AF37',
    secondaryColor: '#64748B',
  },
  [CATEGORY_ICAO.GA]: {
    name: 'General Aviation',
    icao: CATEGORY_ICAO.GA,
    iata: 'GA',
    primaryColor: '#166534',
    accentColor: '#FFFFFF',
    secondaryColor: '#DC2626',
  },
  [CATEGORY_ICAO.VIP]: {
    name: 'Notable Jet',
    icao: CATEGORY_ICAO.VIP,
    iata: 'VIP',
    primaryColor: '#581C87',
    accentColor: '#FBBF24',
    secondaryColor: '#FFFFFF',
  },
  [CATEGORY_ICAO.CARGO]: {
    name: 'Cargo',
    icao: CATEGORY_ICAO.CARGO,
    iata: 'CG',
    primaryColor: '#44403C',
    accentColor: '#F59E0B',
    secondaryColor: '#1C1917',
  },
};

function normalizeTail(value?: string): string | undefined {
  if (!value) return undefined;
  const normalized = value.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  return normalized.length > 0 ? normalized : undefined;
}

function aircraftTail(ac: NormalizedAircraft): string | undefined {
  return normalizeTail(ac.registration) ?? normalizeTail(ac.callsign);
}

function lookupFamousTail(ac: NormalizedAircraft): { name: string } | null {
  const tail = aircraftTail(ac);
  if (!tail) return null;
  return FAMOUS_TAILS[tail] ?? null;
}

function matchesPrefix(value: string | undefined, prefixes: readonly string[]): boolean {
  if (!value) return false;
  const upper = value.trim().toUpperCase();
  return prefixes.some((prefix) => upper.startsWith(prefix));
}

function isNNumberCallsign(callsign?: string): boolean {
  if (!callsign) return false;
  return /^N[0-9][0-9A-Z]{0,4}[A-Z]$/.test(callsign.trim().toUpperCase());
}

function isMilitary(ac: NormalizedAircraft): boolean {
  const callsign = ac.callsign?.trim().toUpperCase();
  if (callsign) {
    const prefix = callsign.slice(0, 3);
    if (MILITARY_CALLSIGN_PREFIXES.includes(prefix)) return true;
    if (MILITARY_CALLSIGN_PREFIXES.some((mil) => callsign.startsWith(mil))) return true;
  }
  return matchesPrefix(ac.aircraftType, MILITARY_TYPE_PREFIXES);
}

function isCargo(ac: NormalizedAircraft): boolean {
  const callsign = ac.callsign?.trim().toUpperCase();
  if (!callsign) return false;
  const prefix = callsign.slice(0, 3);
  return CARGO_CALLSIGN_PREFIXES.includes(prefix);
}

function isBizjet(ac: NormalizedAircraft): boolean {
  if (matchesPrefix(ac.aircraftType, BIZJET_TYPE_PREFIXES)) return true;
  if (ac.aircraftType === 'PC12') return true;
  if (isNNumberCallsign(ac.callsign) && ac.category === 'A3') return true;
  return false;
}

function isGeneralAviation(ac: NormalizedAircraft): boolean {
  if (matchesPrefix(ac.aircraftType, GA_TYPE_PREFIXES)) return true;
  if (ac.category && GA_EMITTER_CATEGORIES.has(ac.category)) return true;
  if (isNNumberCallsign(ac.callsign) && !isBizjet(ac)) return true;
  return false;
}

export function classifyAircraft(ac: NormalizedAircraft, isAirline: boolean): AircraftTrafficClass {
  if (isAirline) return 'airline';
  if (lookupFamousTail(ac)) return 'vip';
  if (isMilitary(ac)) return 'military';
  if (isCargo(ac)) return 'cargo';
  if (isBizjet(ac)) return 'bizjet';
  if (isGeneralAviation(ac)) return 'ga';
  return 'unknown';
}

export function getNonAirlineDisplayBrand(ac: NormalizedAircraft): AirlineBrand {
  const famous = lookupFamousTail(ac);
  if (famous) {
    return { ...CATEGORY_BRANDS[CATEGORY_ICAO.VIP], name: famous.name };
  }

  switch (classifyAircraft(ac, false)) {
    case 'military':
      return CATEGORY_BRANDS[CATEGORY_ICAO.MILITARY];
    case 'cargo':
      return CATEGORY_BRANDS[CATEGORY_ICAO.CARGO];
    case 'bizjet':
      return CATEGORY_BRANDS[CATEGORY_ICAO.BIZJET];
    case 'ga':
      return CATEGORY_BRANDS[CATEGORY_ICAO.GA];
    default:
      return {
        name: 'Unknown',
        icao: 'UNK',
        iata: 'XX',
        primaryColor: '#334155',
        accentColor: '#94A3B8',
      };
  }
}

export function isCategoryBrand(icao: string): boolean {
  return icao in CATEGORY_BRANDS;
}

export { CATEGORY_BRANDS };
