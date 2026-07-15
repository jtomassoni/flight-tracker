import type { NormalizedAircraft } from '@/types/aircraft';
import { isNNumberTail } from '@/lib/aircraftCategories';
import { getAirlineFromCallsign } from '@/lib/airlines';

/**
 * Passenger airline board only — curated national / mainline carriers
 * (regionals that fly as UAL/DAL/AAL/ASA still qualify via callsign mapping).
 * Cargo, military, famous tails, PJs, and GA stay off until we opt them back in.
 */
export function isDisplayEligibleAircraft(ac: NormalizedAircraft): boolean {
  const cs = ac.callsign?.trim().toUpperCase() ?? '';
  if (!cs || cs.length < 3 || isNNumberTail(cs)) return false;
  return Boolean(getAirlineFromCallsign(cs));
}
