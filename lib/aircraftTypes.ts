/**
 * ICAO type designators (ADS-B `t` field) → readable labels for LED / display UI.
 * Prefer names that read well on departure boards (e.g. "737 MAX 8" not "B38M").
 */
const ICAO_TYPE_NAMES: Record<string, string> = {
  // Boeing 737 family
  B37M: '737 MAX 7',
  B38M: '737 MAX 8',
  B39M: '737 MAX 9',
  B3XM: '737 MAX 10',
  B737: '737',
  B738: '737-800',
  B739: '737-900',
  B734: '737-400',
  B735: '737-500',
  B736: '737-600',
  B73G: '737-700',
  B752: '757-200',
  B753: '757-300',
  B762: '767-200',
  B763: '767-300',
  B764: '767-400',
  B772: '777-200',
  B77L: '777-200LR',
  B77W: '777-300ER',
  B788: '787-8',
  B789: '787-9',
  B78X: '787-10',
  B748: '747-8',
  B744: '747-400',
  // Airbus A320 family
  A318: 'A318',
  A319: 'A319',
  A320: 'A320',
  A321: 'A321',
  A19N: 'A319 neo',
  A20N: 'A320 neo',
  A21N: 'A321 neo',
  A332: 'A330-200',
  A333: 'A330-300',
  A339: 'A330-900',
  A359: 'A350-900',
  A35K: 'A350-1000',
  A388: 'A380',
  // Embraer / regional jets
  E170: 'E170',
  E175: 'E175',
  E75L: 'E175',
  E75S: 'E175',
  E190: 'E190',
  E195: 'E195',
  E290: 'E190-E2',
  E295: 'E195-E2',
  CRJ2: 'CRJ-200',
  CRJ7: 'CRJ-700',
  CRJ9: 'CRJ-900',
  BCS1: 'A220-100',
  BCS3: 'A220-300',
  // GA / biz (common near metro areas)
  C172: 'C172',
  C182: 'C182',
  C208: 'Caravan',
  PC12: 'PC-12',
  SR22: 'SR22',
  GLF4: 'Gulfstream IV',
  GLF5: 'Gulfstream V',
  CL35: 'Challenger 350',
};

/**
 * Compact labels for the narrow LED stats column, where the full display name would
 * truncate into something unreadable (e.g. "737 MAX 8" → "737 MA."). Only overrides the
 * names that don't fit ~8 chars; everything else falls back to the full display label.
 */
const BOARD_TYPE_NAMES: Record<string, string> = {
  B37M: '737-MAX7',
  B38M: '737-MAX8',
  B39M: '737-MAX9',
  B3XM: '737MAX10',
  B77L: '777LR',
  B77W: '777ER',
  A35K: 'A350-1K',
  GLF4: 'Gulf IV',
  GLF5: 'Gulf V',
  CL35: 'CL350',
};

function normalizeTypeCode(raw: string): string {
  return raw.trim().toUpperCase();
}

/** Insert a space before "neo" on A319/A320/A321 labels (feed often sends "A320NEO"). */
function normalizeAirbusNeoLabel(label: string): string {
  const match = label.match(/^(A319|A320|A321)\s*neo$/i);
  if (match) return `${match[1]} neo`;
  return label;
}

/** Resolve an ICAO designator or raw type string to a board-friendly label. */
export function formatAircraftTypeDisplay(raw?: string): string {
  if (!raw?.trim()) return 'Unknown';

  const trimmed = raw.trim();
  const code = normalizeTypeCode(trimmed);

  const mapped = ICAO_TYPE_NAMES[code];
  if (mapped) return mapped;

  // Provider sometimes sends spelled-out manufacturer names.
  if (/^boeing\s+/i.test(trimmed)) {
    return trimmed.replace(/^boeing\s+/i, '').trim();
  }
  if (/^airbus\s+/i.test(trimmed)) {
    return normalizeAirbusNeoLabel(`A${trimmed.replace(/^airbus\s+/i, '').trim()}`);
  }

  return normalizeAirbusNeoLabel(trimmed);
}

/** Board-friendly label tuned for the narrow LED column — short, but still a clear ID. */
export function formatAircraftTypeBoard(raw?: string): string {
  if (!raw?.trim()) return 'Unknown';
  const code = normalizeTypeCode(raw.trim());
  return BOARD_TYPE_NAMES[code] ?? formatAircraftTypeDisplay(raw);
}
