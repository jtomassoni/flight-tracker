/**
 * Top freight operator ICAO callsign prefixes — board filter + cargo-only mode.
 */
const CARGO_OPERATORS = new Set<string>([
  'FDX', // FedEx
  'UPS', // UPS Airlines
  'GTI', // Atlas Air
  'GSS', // Atlas Air (Global Supply Systems)
  'DHL', // DHL Air
  'DHX', // DHL Aero Expreso
  'DAE', // DHL International Aviation ME
  'AHK', // Air Hong Kong (DHL)
  'BCS', // European Air Transport Leipzig (DHL)
]);

/** True when a callsign belongs to a top-tier freight operator. */
export function isCargoCallsign(callsign?: string): boolean {
  if (!callsign) return false;
  const prefix = callsign.trim().toUpperCase().slice(0, 3);
  return CARGO_OPERATORS.has(prefix);
}
