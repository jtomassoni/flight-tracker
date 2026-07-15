import type { AirlineBrand } from '@/lib/airlines';
import { getCargoAirlineFromCallsign } from '@/lib/cargoAirlines';
import type { NormalizedAircraft } from '@/types/aircraft';

export type AircraftTrafficClass =
  | 'airline'
  | 'military'
  | 'cargo'
  | 'bizjet'
  | 'unknown';

/** ICAO codes for category brands — also used as LED mark keys. */
export const CATEGORY_ICAO = {
  MILITARY: 'MIL',
  BIZJET: 'PVT',
} as const;

/**
 * Publicly reported tail numbers tracked on ADS-B — celebrities and Fortune 500
 * corporate flight departments. Matches registration or N-number callsign.
 */
const FAMOUS_TAILS: Record<string, { name: string }> = {
  // —— Notable individuals ——
  N628TS: { name: 'Elon Musk' },
  N757AF: { name: 'Trump Force One' },
  N194WM: { name: 'Bill Gates' },
  N271DV: { name: 'Jeff Bezos' },
  N3200X: { name: 'Taylor Swift' },
  N621MM: { name: 'Taylor Swift' }, // prior reg (Falcon 7X, re-registered 2026)

  // —— Fortune 500 / major corporate flight departments ——
  N2N: { name: 'Apple' },
  N68885: { name: 'Meta' },
  N232G: { name: 'Google' },
  N383PA: { name: 'Walmart' },
  N100A: { name: 'Exxon Mobil' },
  N959RW: { name: 'Coca-Cola' },
  N486RW: { name: 'Coca-Cola' },
  N586RW: { name: 'Coca-Cola' },
  N280WS: { name: 'Goldman Sachs' },
  N601CH: { name: 'JPMorgan Chase' },
  N602CH: { name: 'JPMorgan Chase' },
  N661CH: { name: 'JPMorgan Chase' },
  N662CH: { name: 'JPMorgan Chase' },
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

/** Top freight operators — matches lib/cargoAirlines.ts. */
const CARGO_CALLSIGN_PREFIXES = [
  'FDX', // FedEx
  'UPS', // UPS Airlines
  'GTI', // Atlas Air
  'GSS', // Atlas Air (Global Supply Systems)
  'DHL', // DHL Air
  'DHX', // DHL Aero Expreso
  'DAE', // DHL International Aviation ME
  'AHK', // Air Hong Kong (DHL)
  'BCS', // European Air Transport Leipzig (DHL)
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
};

function normalizeTail(value?: string): string | undefined {
  if (!value) return undefined;
  const normalized = value.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  return normalized.length > 0 ? normalized : undefined;
}

/** US N-number — matches registration or callsign (e.g. N64CF, N12345, N1234A). */
export function isNNumberTail(value?: string): boolean {
  if (!value) return false;
  return /^N[1-9][0-9]{0,4}[A-Z]{0,2}$/.test(normalizeTail(value) ?? '');
}

export function aircraftTail(ac: NormalizedAircraft): string | undefined {
  return normalizeTail(ac.registration) ?? normalizeTail(ac.callsign);
}

export function isNNumberAircraft(ac: NormalizedAircraft): boolean {
  return isNNumberTail(ac.registration) || isNNumberTail(ac.callsign);
}

export function isFamousTail(ac: NormalizedAircraft): boolean {
  return lookupFamousTail(ac) != null;
}

export function isMilitaryAircraft(ac: NormalizedAircraft): boolean {
  return isMilitary(ac);
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

export function isBizjet(ac: NormalizedAircraft): boolean {
  if (matchesPrefix(ac.aircraftType, BIZJET_TYPE_PREFIXES)) return true;
  if (ac.aircraftType === 'PC12') return true;
  return false;
}

export function classifyAircraft(ac: NormalizedAircraft, isAirline: boolean): AircraftTrafficClass {
  if (isAirline) return 'airline';
  if (lookupFamousTail(ac)) return 'bizjet';
  if (isMilitary(ac)) return 'military';
  if (isCargo(ac)) return 'cargo';
  if (isBizjet(ac)) return 'bizjet';
  return 'unknown';
}

const UNKNOWN_NON_AIRLINE_BRAND: AirlineBrand = {
  name: 'Unknown',
  icao: 'UNK',
  iata: 'XX',
  primaryColor: '#334155',
  accentColor: '#94A3B8',
};

export function getNonAirlineDisplayBrand(ac: NormalizedAircraft): AirlineBrand {
  const famous = lookupFamousTail(ac);
  if (famous) {
    return { ...CATEGORY_BRANDS[CATEGORY_ICAO.BIZJET]!, name: famous.name };
  }

  if (isMilitary(ac)) {
    return CATEGORY_BRANDS[CATEGORY_ICAO.MILITARY]!;
  }
  const cargo = getCargoAirlineFromCallsign(ac.callsign);
  if (cargo) return cargo;
  if (isBizjet(ac)) {
    return CATEGORY_BRANDS[CATEGORY_ICAO.BIZJET]!;
  }

  return UNKNOWN_NON_AIRLINE_BRAND;
}

export function isCategoryBrand(icao: string): boolean {
  return icao in CATEGORY_BRANDS;
}

export { CATEGORY_BRANDS };
