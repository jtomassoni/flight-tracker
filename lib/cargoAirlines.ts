import type { AirlineBrand } from '@/lib/airlines';

/** Top freight carriers — each has its own logo slot in the admin gallery. */
export const CARGO_AIRLINES: Record<string, AirlineBrand> = {
  FDX: {
    name: 'FedEx Express',
    icao: 'FDX',
    iata: 'FX',
    primaryColor: '#4D148C',
    accentColor: '#FF6600',
    secondaryColor: '#FFFFFF',
  },
  UPS: {
    name: 'UPS Airlines',
    icao: 'UPS',
    iata: '5X',
    primaryColor: '#351C15',
    accentColor: '#FFB500',
    secondaryColor: '#FFFFFF',
  },
  GTI: {
    name: 'Atlas Air',
    icao: 'GTI',
    iata: '5Y',
    primaryColor: '#003366',
    accentColor: '#FFFFFF',
    secondaryColor: '#C8102E',
  },
  ABX: {
    name: 'Amazon Air',
    icao: 'ABX',
    iata: 'GB',
    primaryColor: '#232F3E',
    accentColor: '#FF9900',
    secondaryColor: '#FFFFFF',
  },
  DHK: {
    name: 'DHL Aviation',
    icao: 'DHK',
    iata: 'D0',
    primaryColor: '#FFCC00',
    accentColor: '#D40511',
    secondaryColor: '#FFFFFF',
  },
};

/** ADS-B callsign prefix → cargo brand ICAO (Atlas/DHL aliases share a logo). */
const CARGO_CALLSIGN_TO_ICAO: Record<string, string> = {
  FDX: 'FDX',
  UPS: 'UPS',
  GTI: 'GTI',
  GSS: 'GTI',
  ABX: 'ABX',
  ATN: 'ABX',
  DHL: 'DHK',
  DHX: 'DHK',
  DAE: 'DHK',
  AHK: 'DHK',
  BCS: 'DHK',
};

export const CARGO_AIRLINE_ICAO_LIST = Object.keys(CARGO_AIRLINES).sort();

export function getCargoAirlineFromCallsign(callsign?: string): AirlineBrand | null {
  if (!callsign) return null;
  const prefix = callsign.trim().toUpperCase().slice(0, 3);
  const icao = CARGO_CALLSIGN_TO_ICAO[prefix];
  if (!icao) return null;
  return CARGO_AIRLINES[icao] ?? null;
}

export function getCargoAirlineByIcao(icao: string): AirlineBrand | null {
  return CARGO_AIRLINES[icao.trim().toUpperCase()] ?? null;
}
