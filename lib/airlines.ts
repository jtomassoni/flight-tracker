export type AirlineBrand = {
  name: string;
  icao: string;
  iata: string;
  primaryColor: string;
  accentColor: string;
  logoUrl: string;
};

/** Common carriers over Denver — used by the elegant-modern theme for livery accents */
const AIRLINES: Record<string, AirlineBrand> = {
  UAL: {
    name: 'United',
    icao: 'UAL',
    iata: 'UA',
    primaryColor: '#0033A0',
    accentColor: '#FFFFFF',
    logoUrl: 'https://images.kiwi.com/airlines/64/UA.png',
  },
  SWA: {
    name: 'Southwest',
    icao: 'SWA',
    iata: 'WN',
    primaryColor: '#304CB2',
    accentColor: '#FFB612',
    logoUrl: 'https://images.kiwi.com/airlines/64/WN.png',
  },
  DAL: {
    name: 'Delta',
    icao: 'DAL',
    iata: 'DL',
    primaryColor: '#003366',
    accentColor: '#C8102E',
    logoUrl: 'https://images.kiwi.com/airlines/64/DL.png',
  },
  AAL: {
    name: 'American',
    icao: 'AAL',
    iata: 'AA',
    primaryColor: '#0078D2',
    accentColor: '#C8102E',
    logoUrl: 'https://images.kiwi.com/airlines/64/AA.png',
  },
  FFT: {
    name: 'Frontier',
    icao: 'FFT',
    iata: 'F9',
    primaryColor: '#006747',
    accentColor: '#8CD600',
    logoUrl: 'https://images.kiwi.com/airlines/64/F9.png',
  },
  JBU: {
    name: 'JetBlue',
    icao: 'JBU',
    iata: 'B6',
    primaryColor: '#003087',
    accentColor: '#FFFFFF',
    logoUrl: 'https://images.kiwi.com/airlines/64/B6.png',
  },
  ASA: {
    name: 'Alaska',
    icao: 'ASA',
    iata: 'AS',
    primaryColor: '#01426A',
    accentColor: '#48BFE5',
    logoUrl: 'https://images.kiwi.com/airlines/64/AS.png',
  },
  SKW: {
    name: 'SkyWest',
    icao: 'SKW',
    iata: 'OO',
    primaryColor: '#1B365D',
    accentColor: '#C4D600',
    logoUrl: 'https://images.kiwi.com/airlines/64/OO.png',
  },
  ENY: {
    name: 'Envoy',
    icao: 'ENY',
    iata: 'MQ',
    primaryColor: '#003366',
    accentColor: '#C8102E',
    logoUrl: 'https://images.kiwi.com/airlines/64/MQ.png',
  },
  RPA: {
    name: 'Republic',
    icao: 'RPA',
    iata: 'YX',
    primaryColor: '#1F3A5F',
    accentColor: '#E8B923',
    logoUrl: 'https://images.kiwi.com/airlines/64/YX.png',
  },
};

const FALLBACK_BRAND: AirlineBrand = {
  name: 'Unknown',
  icao: 'UNK',
  iata: 'XX',
  primaryColor: '#334155',
  accentColor: '#94A3B8',
  logoUrl: 'https://images.kiwi.com/airlines/64/XX.png',
};

export function getAirlineFromCallsign(callsign?: string): AirlineBrand | null {
  if (!callsign) return null;
  const prefix = callsign.trim().slice(0, 3).toUpperCase();
  return AIRLINES[prefix] ?? null;
}

export function getAirlineBrand(callsign?: string): AirlineBrand {
  return getAirlineFromCallsign(callsign) ?? FALLBACK_BRAND;
}

export type AirlineTileStyle = {
  cardBackground: string;
  headerBackground: string;
  statBackground: string;
  statAltBackground: string;
  logoBackground: string;
  textColor: string;
  mutedTextColor: string;
  labelColor: string;
  badgeBackground: string;
  badgeTextColor: string;
  borderColor: string;
  accentBarColor: string;
};

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const normalized = hex.replace('#', '');
  return {
    r: parseInt(normalized.slice(0, 2), 16),
    g: parseInt(normalized.slice(2, 4), 16),
    b: parseInt(normalized.slice(4, 6), 16),
  };
}

function mixHex(hex: string, target: string, amount: number): string {
  const a = hexToRgb(hex);
  const b = hexToRgb(target);
  const mix = (x: number, y: number) => Math.round(x + (y - x) * amount);
  const r = mix(a.r, b.r);
  const g = mix(a.g, b.g);
  const bl = mix(a.b, b.b);
  return `#${[r, g, bl].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

function luminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

function contrastingText(hex: string): string {
  return luminance(hex) > 0.55 ? '#0f172a' : '#f8fafc';
}

/** Per-tile livery styling for the Elegant & Modern gallery layout */
export function getAirlineTileStyle(brand: AirlineBrand): AirlineTileStyle {
  const primary = brand.primaryColor;
  const accent = brand.accentColor;
  const darkPrimary = mixHex(primary, '#000000', 0.35);
  const deepPrimary = mixHex(primary, '#000000', 0.55);
  const textOnPrimary = contrastingText(primary);
  const textOnAccent = contrastingText(accent);
  const mutedOnPrimary =
    luminance(primary) > 0.55 ? 'rgba(15, 23, 42, 0.65)' : 'rgba(248, 250, 252, 0.7)';

  return {
    cardBackground: `linear-gradient(160deg, ${primary} 0%, ${darkPrimary} 55%, ${deepPrimary} 100%)`,
    headerBackground: `linear-gradient(90deg, ${accent} 0%, ${mixHex(accent, primary, 0.35)} 100%)`,
    statBackground: mixHex(primary, '#ffffff', luminance(primary) > 0.5 ? 0.12 : 0.08),
    statAltBackground: mixHex(primary, '#000000', 0.2),
    logoBackground: mixHex(accent, '#ffffff', 0.85),
    textColor: textOnPrimary,
    mutedTextColor: mutedOnPrimary,
    labelColor: luminance(accent) > 0.55 ? mixHex(accent, '#000000', 0.5) : accent,
    badgeBackground: accent,
    badgeTextColor: textOnAccent,
    borderColor: mixHex(accent, primary, 0.5),
    accentBarColor: accent,
  };
}
