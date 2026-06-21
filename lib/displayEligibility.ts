import type { NormalizedAircraft } from '@/types/aircraft';
import {
  isBizjet,
  isFamousTail,
  isMilitaryAircraft,
  isNNumberTail,
} from '@/lib/aircraftCategories';
import { getAirlineFromCallsign } from '@/lib/airlines';
import { getCargoAirlineFromCallsign } from '@/lib/cargoAirlines';

/**
 * Strict board allowlist — curated airlines, freight, military, and
 * famous / corporate tails only. Random PJs, GA, and hex-only stay off.
 */
export function isDisplayEligibleAircraft(ac: NormalizedAircraft): boolean {
  if (isFamousTail(ac)) return true;

  const cs = ac.callsign?.trim().toUpperCase() ?? '';
  if (!cs || cs.length < 3 || isNNumberTail(cs)) return false;

  if (getAirlineFromCallsign(cs)) return true;
  if (getCargoAirlineFromCallsign(cs)) return true;
  if (isMilitaryAircraft(ac)) return true;

  if (isBizjet(ac)) return false;

  return false;
}
