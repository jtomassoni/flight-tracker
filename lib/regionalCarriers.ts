/** Regional operator metadata — shown as a subtitle; branding uses the mainline partner. */
export type RegionalOperator = {
  name: string;
  icao: string;
  iata: string;
};

const REGIONAL_OPERATORS: Record<string, RegionalOperator> = {
  SKW: { name: 'SkyWest', icao: 'SKW', iata: 'OO' },
  RPA: { name: 'Republic', icao: 'RPA', iata: 'YX' },
  ENY: { name: 'Envoy', icao: 'ENY', iata: 'MQ' },
  PDT: { name: 'Piedmont', icao: 'PDT', iata: 'PT' },
  JIA: { name: 'PSA', icao: 'JIA', iata: 'OH' },
  EDV: { name: 'Endeavor', icao: 'EDV', iata: '9E' },
  QXE: { name: 'Horizon', icao: 'QXE', iata: 'QX' },
  AWI: { name: 'Air Wisconsin', icao: 'AWI', iata: 'ZW' },
  ASH: { name: 'Mesa', icao: 'ASH', iata: 'YV' },
  GJS: { name: 'GoJet', icao: 'GJS', iata: 'G7' },
  LOF: { name: 'Trans States', icao: 'LOF', iata: 'AX' },
};

/** Regionals with a single mainline partner — no flight-number lookup needed. */
const EXCLUSIVE_MAINLINE: Record<string, string> = {
  ENY: 'AAL',
  PDT: 'AAL',
  JIA: 'AAL',
  EDV: 'DAL',
  QXE: 'ASA',
  AWI: 'UAL',
  LOF: 'UAL',
};

type FlightRange = { min: number; max: number; mainline: string };

/**
 * Marketing-carrier flight number blocks (SkyWest wiki + common US regional allocations).
 * Checked in order — specific blocks before broad fallbacks.
 */
const MAINLINE_FLIGHT_RANGES: FlightRange[] = [
  { min: 3420, max: 3499, mainline: 'ASA' },
  { min: 2920, max: 3109, mainline: 'AAL' },
  { min: 3520, max: 3569, mainline: 'DAL' },
  { min: 4439, max: 4858, mainline: 'DAL' },
  { min: 9783, max: 9784, mainline: 'DAL' },
  { min: 3805, max: 3854, mainline: 'UAL' },
  { min: 4085, max: 4714, mainline: 'UAL' },
  { min: 4860, max: 4868, mainline: 'UAL' },
  { min: 5176, max: 6060, mainline: 'UAL' },
  { min: 5660, max: 6189, mainline: 'UAL' },
  { min: 3100, max: 3399, mainline: 'AAL' },
  { min: 4000, max: 4420, mainline: 'DAL' },
  { min: 6070, max: 6999, mainline: 'UAL' },
];

const MULTI_PARTNER_REGIONALS = new Set(['SKW', 'RPA', 'ASH', 'GJS']);

const DEFAULT_MAINLINE = 'UAL';

function parseCallsignParts(callsign: string): { prefix: string; flightNumber: number | null } {
  const trimmed = callsign.trim().toUpperCase();
  const prefix = trimmed.slice(0, 3);
  const numPart = trimmed.slice(3).replace(/\D/g, '');
  const flightNumber = numPart ? parseInt(numPart, 10) : null;
  return { prefix, flightNumber: flightNumber != null && !Number.isNaN(flightNumber) ? flightNumber : null };
}

function mainlineFromFlightNumber(flightNumber: number): string | null {
  for (const range of MAINLINE_FLIGHT_RANGES) {
    if (flightNumber >= range.min && flightNumber <= range.max) {
      return range.mainline;
    }
  }
  return null;
}

export function isRegionalCallsignPrefix(prefix: string): boolean {
  return prefix in REGIONAL_OPERATORS;
}

export function getRegionalOperator(callsign?: string): RegionalOperator | null {
  if (!callsign) return null;
  const { prefix } = parseCallsignParts(callsign);
  return REGIONAL_OPERATORS[prefix] ?? null;
}

/** Mainline ICAO with regional operator suffix, e.g. SKW5340 → UAL(SKW)5340 */
export function formatBrandedCallsign(callsign?: string): string {
  if (!callsign) return '';
  const raw = callsign.trim().toUpperCase();
  if (raw.length <= 3) return raw;
  const { prefix } = parseCallsignParts(raw);
  const regional = REGIONAL_OPERATORS[prefix];
  const mainline = resolveMainlineIcao(raw);
  const suffix = raw.slice(3);
  if (regional) return `${mainline}(${regional.icao}) ${suffix}`;
  return `${mainline} ${suffix}`;
}

/** Carrier label for flight IDs — UAL(SKW) or UA */
export function formatBrandedCarrierLabel(
  callsign: string | undefined,
  mainlineIcao: string,
  mainlineIata: string
): string {
  const regional = getRegionalOperator(callsign);
  if (regional) return `${mainlineIcao}(${regional.icao})`;
  return mainlineIata;
}

/** Map a regional (or any) callsign prefix to its nationwide marketing carrier ICAO code. */
export function resolveMainlineIcao(callsign: string): string {
  const { prefix, flightNumber } = parseCallsignParts(callsign);

  const exclusive = EXCLUSIVE_MAINLINE[prefix];
  if (exclusive) return exclusive;

  if (MULTI_PARTNER_REGIONALS.has(prefix) && flightNumber != null) {
    return mainlineFromFlightNumber(flightNumber) ?? DEFAULT_MAINLINE;
  }

  if (prefix in REGIONAL_OPERATORS) {
    return DEFAULT_MAINLINE;
  }

  return prefix;
}

export function resolveCallsignPrefix(callsign: string): string {
  return resolveMainlineIcao(callsign);
}

/** Export alias map for legacy JS bundles that cannot import this module directly. */
export const CALLSIGN_BRAND_ALIAS: Record<string, string> = {
  ...EXCLUSIVE_MAINLINE,
  SKW: DEFAULT_MAINLINE,
  RPA: DEFAULT_MAINLINE,
  ASH: DEFAULT_MAINLINE,
  GJS: DEFAULT_MAINLINE,
};
