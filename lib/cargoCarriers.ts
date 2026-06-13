/**
 * Freight operator ICAO callsign prefixes — used to filter the board to cargo traffic.
 * Covers the major integrators and ACMI/freight carriers commonly seen over US metros.
 */
const CARGO_OPERATORS = new Set<string>([
  'FDX', // FedEx
  'UPS', // UPS Airlines
  'GTI', // Atlas Air
  'GSS', // Atlas Air (Global Supply Systems / DHL)
  'PAC', // Polar Air Cargo
  'ATN', // Air Transport International
  'ABX', // ABX Air
  'CKS', // Kalitta Air
  'CJT', // Cargojet
  'WGN', // Western Global Airlines
  'BOX', // AeroLogic
  'CLX', // Cargolux
  'ICV', // Cargolux Italia
  'GEC', // Lufthansa Cargo
  'NCA', // Nippon Cargo Airlines
  'CAO', // Air China Cargo
  'CYZ', // China Postal Airlines
  'CKK', // China Cargo Airlines
  'ABW', // AirBridgeCargo
  'LCO', // LATAM Cargo
  'TPA', // Avianca Cargo (Tampa)
  'MPH', // Martinair Cargo
  'DHL', // DHL Air
  'DHX', // DHL Aero Expreso
  'DAE', // DHL International Aviation ME
  'AHK', // Air Hong Kong (DHL)
  'BCS', // European Air Transport Leipzig (DHL)
  'SQC', // Singapore Airlines Cargo
]);

/** True when a callsign belongs to a known freight operator. */
export function isCargoCallsign(callsign?: string): boolean {
  if (!callsign) return false;
  const prefix = callsign.trim().toUpperCase().slice(0, 3);
  return CARGO_OPERATORS.has(prefix);
}
