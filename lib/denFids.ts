import type { NormalizedAircraft } from '@/types/aircraft';
import { displayIdentifier } from './aircraftUtils';
import { getAirlineFromCallsign } from './airlines';
import { formatBrandedCarrierLabel } from './regionalCarriers';
import type { VerticalTrend } from '@/types/aircraft';

/** Common DEN departure destinations for FIDS-style display */
const DESTINATIONS = [
  'Los Angeles',
  'Montrose',
  'Nashville',
  'New York-LGA',
  'Newark',
  'Orlando',
  'Phoenix',
  'Las Vegas',
  'Seattle',
  'Dallas',
  'Chicago',
  'Salt Lake City',
  'San Francisco',
  'Atlanta',
  'Houston',
  'Minneapolis',
  'Portland',
  'San Diego',
  'Boston',
  'Washington-Dulles',
  'Orange County',
  'Tampa',
  'Charlotte',
  'Miami',
];

const GATES = ['A', 'B', 'C'] as const;

export function fidsDestination(index: number): string {
  return DESTINATIONS[index % DESTINATIONS.length];
}

export function fidsGate(index: number, hex: string): string {
  const concourse = GATES[parseInt(hex.slice(-1), 16) % GATES.length];
  const num = 10 + (index * 7 + parseInt(hex.slice(0, 2), 16)) % 35;
  return `${concourse}${num}`;
}

/** 12h departure time like real DEN boards: 3:55P */
export function fidsDepartureTime(index: number, lastUpdated: Date | null): string {
  const base = lastUpdated ?? new Date();
  const totalMin = base.getHours() * 60 + base.getMinutes() + index * 6;
  const h24 = Math.floor(totalMin / 60) % 24;
  const m = totalMin % 60;
  const suffix = h24 >= 12 ? 'P' : 'A';
  const h12 = h24 % 12 || 12;
  return `${h12}:${String(m).padStart(2, '0')}${suffix}`;
}

export function fidsFlightNumber(ac: NormalizedAircraft): string {
  const brand = getAirlineFromCallsign(ac.callsign);
  const callsign = ac.callsign?.trim().toUpperCase();
  if (brand && callsign && callsign.length > 3) {
    const num = callsign.slice(3).replace(/^0+/, '') || callsign.slice(3);
    const carrier = formatBrandedCarrierLabel(callsign, brand.icao, brand.iata);
    return `${carrier} ${num}`.trim();
  }
  return displayIdentifier(ac);
}

export function fidsStatus(
  trend: VerticalTrend,
  index: number,
  lastUpdated: Date | null
): { label: string; tone: 'ontime' | 'delayed' | 'updated' } {
  if (trend === 'descending') {
    return { label: 'Delayed', tone: 'delayed' };
  }
  if (trend === 'climbing' && index % 5 === 0) {
    const t = fidsDepartureTime(index, lastUpdated).replace(/([AP])$/, ' $1M');
    return { label: `Now ${t}`, tone: 'updated' };
  }
  return { label: 'On Time', tone: 'ontime' };
}
