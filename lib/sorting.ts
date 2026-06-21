import type { NormalizedAircraft } from '@/types/aircraft';
import { getValidatedRoute } from '@/lib/routePlausibility';

/**
 * Score aircraft by "interestingness" for kiosk display:
 * closer, lower, moving vertically, and identified by callsign score higher.
 */
export function interestingnessScore(ac: NormalizedAircraft): number {
  let score = 0;

  // Closer is better (inverse distance, capped)
  score += Math.max(0, 50 - ac.distanceMi * 2);

  // Lower altitude slightly preferred (below FL350)
  if (ac.altitudeFt != null) {
    score += Math.max(0, 25 - ac.altitudeFt / 2000);
  }

  // Vertical movement is interesting
  const vRate = Math.abs(ac.verticalRateFpm ?? 0);
  if (vRate > 200) score += Math.min(15, vRate / 100);

  // Callsign preferred
  if (ac.callsign?.trim()) score += 10;

  // Validated origin→destination that matches live position
  if (getValidatedRoute(ac)) score += 40;
  else if (ac.route) score += 3;

  // Fresher data preferred
  if (ac.seenSecondsAgo != null) {
    score += Math.max(0, 5 - ac.seenSecondsAgo);
  }

  return score;
}

export function sortByInterestingness(aircraft: NormalizedAircraft[]): NormalizedAircraft[] {
  return [...aircraft].sort((a, b) => interestingnessScore(b) - interestingnessScore(a));
}

export function limitAircraft(
  aircraft: NormalizedAircraft[],
  max: number
): NormalizedAircraft[] {
  return aircraft.slice(0, max);
}
