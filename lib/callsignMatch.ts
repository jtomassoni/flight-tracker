import type { NormalizedAircraft } from '@/types/aircraft';
import { getAirlineByIcao, getAirlineByIata } from './airlines';
import { resolveMainlineIcao } from './regionalCarriers';

export type TrackTarget = {
  airlineIcao: string;
  flightNumber: number;
  /** Canonical ICAO callsign, e.g. UAL1234 */
  icaoCallsign: string;
  /** Human label, e.g. UA 1234 */
  displayLabel: string;
};

function extractFlightNumber(callsign: string): number | null {
  const trimmed = callsign.trim().toUpperCase();
  const numPart = trimmed.slice(3).replace(/\D/g, '');
  if (!numPart) return null;
  const flightNumber = parseInt(numPart, 10);
  return Number.isNaN(flightNumber) ? null : flightNumber;
}

function normalizeFlightNumberInput(raw: string): number | null {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return null;
  const flightNumber = parseInt(digits, 10);
  return Number.isNaN(flightNumber) ? null : flightNumber;
}

function resolveAirlineIcao(raw: string): string | null {
  const token = raw.trim().toUpperCase();
  if (!token) return null;
  if (token.length === 3 && getAirlineByIcao(token)) return token;
  const byIata = getAirlineByIata(token);
  if (byIata) return byIata.icao;
  return null;
}

/** Build a track target from admin/display input. Returns null when input is incomplete or invalid. */
export function buildTrackTarget(airline: string, flightNumber: string): TrackTarget | null {
  const airlineIcao = resolveAirlineIcao(airline);
  const flightNum = normalizeFlightNumberInput(flightNumber);
  if (!airlineIcao || flightNum == null) return null;

  const brand = getAirlineByIcao(airlineIcao);
  const icaoCallsign = `${airlineIcao}${flightNum}`;
  const displayLabel = brand ? `${brand.iata} ${flightNum}` : icaoCallsign;

  return { airlineIcao, flightNumber: flightNum, icaoCallsign, displayLabel };
}

export function isTrackModeActive(airline?: string, flightNumber?: string): boolean {
  return buildTrackTarget(airline ?? '', flightNumber ?? '') != null;
}

function callsignNumbersMatch(a: number, b: number): boolean {
  return a === b;
}

/** True when a live track matches the configured airline + flight number (including regionals). */
export function aircraftMatchesTrack(ac: NormalizedAircraft, target: TrackTarget): boolean {
  if (!ac.callsign?.trim()) return false;

  const acCallsign = ac.callsign.trim().toUpperCase();
  if (acCallsign === target.icaoCallsign) return true;

  const acNum = extractFlightNumber(acCallsign);
  if (acNum == null || !callsignNumbersMatch(acNum, target.flightNumber)) return false;

  const acMainline = resolveMainlineIcao(acCallsign);
  return acMainline === target.airlineIcao;
}

export function findTrackedAircraft(
  aircraft: NormalizedAircraft[],
  target: TrackTarget
): NormalizedAircraft | null {
  return aircraft.find((ac) => aircraftMatchesTrack(ac, target)) ?? null;
}

/** Parse a shorthand track query like "UA1234" or "UAL 1234". */
export function parseTrackQuery(query: string): { airline: string; flightNumber: string } | null {
  const trimmed = query.trim();
  if (!trimmed) return null;

  const compact = trimmed.replace(/\s+/g, '').toUpperCase();
  const match = compact.match(/^([A-Z0-9]{2,3})(\d+)$/);
  if (!match) return null;

  return { airline: match[1]!, flightNumber: match[2]! };
}
