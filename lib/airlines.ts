import type { NormalizedAircraft } from '@/types/aircraft';
import { resolveLedLogoPalette } from '@/lib/ledLogoPalette';
import { approvedLogoUrl } from './approvedLogos';
import { CATEGORY_BRANDS, getNonAirlineDisplayBrand, isFamousTail, isNNumberAircraft, isNNumberTail } from './aircraftCategories';
import { CARGO_AIRLINE_ICAO_LIST, getCargoAirlineByIcao, getCargoAirlineFromCallsign } from './cargoAirlines';
import { hasLedAirlineMark } from './ledAirlineMarks';
import {
  formatBrandedCallsign,
  getRegionalOperator,
  resolveCallsignPrefix,
  type RegionalOperator,
} from './regionalCarriers';

export type { RegionalOperator };
export { formatBrandedCallsign, getRegionalOperator, resolveCallsignPrefix };

export type AirlineBrand = {
  name: string;
  icao: string;
  iata: string;
  primaryColor: string;
  accentColor: string;
  /** Third brand color when applicable (e.g. Southwest red, Delta red) */
  secondaryColor?: string;
};

/** Common carriers over Denver — used for airline brand colors and admin previews */
const AIRLINES: Record<string, AirlineBrand> = {
  UAL: {
    name: 'United',
    icao: 'UAL',
    iata: 'UA',
    primaryColor: '#0033A0',
    accentColor: '#FFFFFF',
    secondaryColor: '#0D8BD9',
  },
  SWA: {
    name: 'Southwest',
    icao: 'SWA',
    iata: 'WN',
    primaryColor: '#304CB2',
    accentColor: '#FFBF27',
    secondaryColor: '#D5152E',
  },
  DAL: {
    name: 'Delta',
    icao: 'DAL',
    iata: 'DL',
    primaryColor: '#003366',
    accentColor: '#C8102E',
    secondaryColor: '#FFFFFF',
  },
  AAL: {
    name: 'American',
    icao: 'AAL',
    iata: 'AA',
    primaryColor: '#0078D2',
    accentColor: '#C8102E',
    secondaryColor: '#FFFFFF',
  },
  FFT: {
    name: 'Frontier',
    icao: 'FFT',
    iata: 'F9',
    primaryColor: '#006747',
    accentColor: '#8CD600',
    secondaryColor: '#FFFFFF',
  },
  JBU: {
    name: 'JetBlue',
    icao: 'JBU',
    iata: 'B6',
    primaryColor: '#003087',
    accentColor: '#FFFFFF',
    secondaryColor: '#6699CC',
  },
  ASA: {
    name: 'Alaska',
    icao: 'ASA',
    iata: 'AS',
    primaryColor: '#01426A',
    accentColor: '#48BFE5',
    secondaryColor: '#95C93D',
  },
  ACA: {
    name: 'Air Canada',
    icao: 'ACA',
    iata: 'AC',
    primaryColor: '#D22630',
    accentColor: '#FFFFFF',
    secondaryColor: '#1A1A1A',
  },
  AFR: {
    name: 'Air France',
    icao: 'AFR',
    iata: 'AF',
    primaryColor: '#002157',
    accentColor: '#FFFFFF',
    secondaryColor: '#ED1C24',
  },
  BAW: {
    name: 'British Airways',
    icao: 'BAW',
    iata: 'BA',
    primaryColor: '#075AAA',
    accentColor: '#FFFFFF',
    secondaryColor: '#EB2226',
  },
  DLH: {
    name: 'Lufthansa',
    icao: 'DLH',
    iata: 'LH',
    primaryColor: '#05164D',
    accentColor: '#FFB81C',
    secondaryColor: '#FFFFFF',
  },
  EIN: {
    name: 'Aer Lingus',
    icao: 'EIN',
    iata: 'EI',
    primaryColor: '#00857D',
    accentColor: '#FFFFFF',
    secondaryColor: '#4FB748',
  },
  AMX: {
    name: 'Aeroméxico',
    icao: 'AMX',
    iata: 'AM',
    primaryColor: '#003263',
    accentColor: '#FFFFFF',
    secondaryColor: '#E4002B',
  },
  AAY: {
    name: 'Allegiant',
    icao: 'AAY',
    iata: 'G4',
    primaryColor: '#00549F',
    accentColor: '#F58025',
    secondaryColor: '#FFFFFF',
  },
  MXY: {
    name: 'Breeze Airways',
    icao: 'MXY',
    iata: 'MX',
    primaryColor: '#14264C',
    accentColor: '#00A9E0',
    secondaryColor: '#FFFFFF',
  },
  CAY: {
    name: 'Cayman Airways',
    icao: 'CAY',
    iata: 'KX',
    primaryColor: '#002F6C',
    accentColor: '#C8102E',
    secondaryColor: '#FFFFFF',
  },
  CMP: {
    name: 'Copa Airlines',
    icao: 'CMP',
    iata: 'CM',
    primaryColor: '#003DA5',
    accentColor: '#FFFFFF',
    secondaryColor: '#0C2340',
  },
  EDW: {
    name: 'Edelweiss',
    icao: 'EDW',
    iata: 'WK',
    primaryColor: '#C8102E',
    accentColor: '#FFFFFF',
    secondaryColor: '#1A1A1A',
  },
  ICE: {
    name: 'Icelandair',
    icao: 'ICE',
    iata: 'FI',
    primaryColor: '#00205B',
    accentColor: '#FFFFFF',
    secondaryColor: '#FFC72C',
  },
  THY: {
    name: 'Turkish Airlines',
    icao: 'THY',
    iata: 'TK',
    primaryColor: '#C70A0C',
    accentColor: '#FFFFFF',
    secondaryColor: '#1A1A1A',
  },
  VIV: {
    name: 'VivaAerobus',
    icao: 'VIV',
    iata: 'VB',
    primaryColor: '#00A650',
    accentColor: '#FFFFFF',
    secondaryColor: '#ED1C24',
  },
  VOI: {
    name: 'Volaris',
    icao: 'VOI',
    iata: 'Y4',
    primaryColor: '#A6228E',
    accentColor: '#FFFFFF',
    secondaryColor: '#ED1C24',
  },
  WJA: {
    name: 'WestJet',
    icao: 'WJA',
    iata: 'WS',
    primaryColor: '#0F1E60',
    accentColor: '#00A0DF',
    secondaryColor: '#FFFFFF',
  },
  SCX: {
    name: 'Sun Country',
    icao: 'SCX',
    iata: 'SY',
    primaryColor: '#003594',
    accentColor: '#C8102E',
    secondaryColor: '#FFFFFF',
  },
};

const FALLBACK_BRAND: AirlineBrand = {
  name: 'Unknown',
  icao: 'UNK',
  iata: 'XX',
  primaryColor: '#334155',
  accentColor: '#94A3B8',
};

export const AIRLINE_ICAO_LIST = Object.keys(AIRLINES).sort();

/** Non-airline category brands (military, private jet, etc.) that also support logos. */
export const CATEGORY_ICAO_LIST = Object.keys(CATEGORY_BRANDS).sort();

/** Every brand that can have an approved logo — commercial, cargo, and categories. */
export const LOGO_BRAND_ICAO_LIST = [
  ...AIRLINE_ICAO_LIST,
  ...CARGO_AIRLINE_ICAO_LIST,
  ...CATEGORY_ICAO_LIST,
];

export function getAirlineByIcao(icao: string): AirlineBrand | null {
  const key = icao.trim().toUpperCase();
  return AIRLINES[key] ?? null;
}

export function getAirlineByIata(iata: string): AirlineBrand | null {
  const key = iata.trim().toUpperCase();
  for (const brand of Object.values(AIRLINES)) {
    if (brand.iata === key) return brand;
  }
  return null;
}

/** Resolve an airline OR category brand by ICAO — used by the logo approval tool. */
export function getLogoBrandByIcao(icao: string): AirlineBrand | null {
  const key = icao.trim().toUpperCase();
  return AIRLINES[key] ?? getCargoAirlineByIcao(key) ?? CATEGORY_BRANDS[key] ?? null;
}

export function getAirlineFromCallsign(callsign?: string): AirlineBrand | null {
  if (!callsign || isNNumberTail(callsign)) return null;
  const resolved = resolveCallsignPrefix(callsign);
  return AIRLINES[resolved] ?? null;
}

export function getAirlineBrand(callsign?: string): AirlineBrand {
  return getAirlineFromCallsign(callsign) ?? FALLBACK_BRAND;
}

/** Resolve airline livery or non-commercial category brand for a track. */
export function getAircraftDisplayBrand(ac: NormalizedAircraft): AirlineBrand {
  if (isFamousTail(ac)) {
    return getNonAirlineDisplayBrand(ac);
  }

  const cargo = getCargoAirlineFromCallsign(ac.callsign);
  if (cargo) return cargo;

  if (!isNNumberAircraft(ac)) {
    const airline = getAirlineFromCallsign(ac.callsign);
    if (airline) return airline;
  }

  return getNonAirlineDisplayBrand(ac);
}

export type AirlineTileStyle = {
  cardBackground: string;
  headerBackground: string;
  headerTextColor: string;
  headerMutedColor: string;
  statBackground: string;
  statAltBackground: string;
  logoBackground: string;
  textColor: string;
  mutedTextColor: string;
  labelColor: string;
  badgeBackground: string;
  badgeTextColor: string;
  borderColor: string;
  /** Top stripe — often tricolor or dual brand bands */
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

export type AirlineLedWallStyle = {
  logoBackground: string;
  logoBorder: string;
  accentStripe: string;
  /** Mark colors only — tile background excluded; 2–3 flat fills per logo. */
  logoPalette: readonly string[];
  /** 1px tile-edge ring around rasterized logos — off for edge-to-edge marks. */
  logoTileBorder: boolean;
};

/** Flat two-color LED marks — accent livery colors cause CDN fringe to read as gradients. */
const LED_LOGO_PALETTE: Partial<Record<string, readonly string[]>> = {
  FFT: ['#FFFFFF', '#006747'],
  UAL: ['#FFFFFF', '#0033A0'],
  DAL: ['#C8102E', '#003366'],
  JBU: ['#FFFFFF', '#003087'],
  ASA: ['#FFFFFF', '#01426A'],
  ACA: ['#FFFFFF', '#D22630'],
  AFR: ['#FFFFFF', '#002157', '#ED1C24'],
  BAW: ['#FFFFFF', '#075AAA', '#EB2226'],
  DLH: ['#FFB81C', '#05164D'],
  EIN: ['#4FB748'],
  AMX: ['#FFFFFF', '#003263'],
  AAY: ['#F58025', '#00549F'],
  MXY: ['#00A9E0', '#14264C'],
  CAY: ['#FFFFFF', '#002F6C', '#C8102E'],
  CMP: ['#FFFFFF', '#003DA5'],
  EDW: ['#FFFFFF', '#C8102E'],
  ICE: ['#FFFFFF', '#00205B'],
  THY: ['#FFFFFF', '#C70A0C'],
  VIV: ['#FFFFFF', '#00A650', '#ED1C24'],
  VOI: ['#FFFFFF', '#A83090', '#78A8D8', '#78C048', '#303030'],
  WJA: ['#FFFFFF', '#0F1E60', '#00A0DF'],
  SCX: ['#FF6600', '#003594', '#FFFFFF'],
  SKW: ['#FFFFFF', '#C4D600'],
  SWA: ['#D5152E', '#FFBF27', '#304CB2', '#CCCCCC'],
  FDX: ['#FF6600', '#4D148C', '#FFFFFF'],
  UPS: ['#FFB500', '#351C15', '#FFFFFF'],
  GTI: ['#FFFFFF', '#003366', '#C8102E'],
  DHK: ['#FFCC00', '#D40511', '#FFFFFF'],
  ABX: ['#FF9900', '#232F3E', '#FFFFFF'],
  MIL: ['#FFFFFF', '#C5A572', '#3D4F2F', '#2C1810'],
  PVT: ['#FFFFFF', '#D4AF37', '#64748B', '#1E293B'],
};

const LED_LOGO_NO_TILE_BORDER = new Set(['JBU', 'SWA', 'MIL', 'PVT', 'GA', 'FDX', 'UPS', 'GTI', 'ABX', 'DHK']);

function airlineLedLogoPalette(
  brand: AirlineBrand,
  logoBackground: string
): readonly string[] {
  const override = LED_LOGO_PALETTE[brand.icao];
  if (override) return override;

  const bg = logoBackground.toLowerCase();
  const seen = new Set<string>();
  const palette: string[] = [];
  for (const hex of [brand.accentColor, brand.secondaryColor, brand.primaryColor]) {
    if (!hex) continue;
    const key = hex.toLowerCase();
    if (key === bg || seen.has(key)) continue;
    seen.add(key);
    palette.push(hex);
  }
  if (luminance(logoBackground) < 0.35 && !seen.has('#ffffff')) {
    palette.unshift('#ffffff');
  }
  return palette;
}

/** Carriers whose Kiwi logos are full-color marks on a white tile. */
const COLOR_LOGO_TILE = new Set([
  'AAL',
  'AAY',
  'FFT',
  'ASA',
  'EIN',
  'MIL',
  'FDX',
  'UPS',
  'GTI',
  'ABX',
  'DHK',
  'SCX',
]);

/** Logo tile styling for the FlightWall LED theme */
export function getAirlineLedWallStyle(brand: AirlineBrand): AirlineLedWallStyle {
  if (COLOR_LOGO_TILE.has(brand.icao)) {
    const logoBackground = '#ffffff';
    const basePalette = airlineLedLogoPalette(brand, logoBackground);
    return {
      logoBackground,
      logoBorder: mixHex(brand.primaryColor, '#000000', 0.25),
      accentStripe: brand.accentColor,
      logoPalette: resolveLedLogoPalette(brand.icao, basePalette),
      logoTileBorder: !LED_LOGO_NO_TILE_BORDER.has(brand.icao),
    };
  }

  /** Black tile — multicolor marks rendered on a near-black CDN background. */
  const onBlackLogo = ['VOI'].includes(brand.icao);
  /** Navy tile — logo PNGs are marks on transparent (not a white CDN matte). */
  const onDarkLogo = ['UAL', 'DAL', 'JBU', 'SWA', 'PVT'].includes(brand.icao);
  const logoBackground = onBlackLogo
    ? '#070707'
    : onDarkLogo
      ? brand.primaryColor
      : '#e8edf2';
  const basePalette = airlineLedLogoPalette(brand, logoBackground);
  const logoPalette = resolveLedLogoPalette(brand.icao, basePalette);
  return {
    logoBackground,
    logoBorder: mixHex(brand.primaryColor, '#000000', 0.25),
    accentStripe: brand.accentColor,
    logoPalette,
    logoTileBorder: !LED_LOGO_NO_TILE_BORDER.has(brand.icao),
  };
}

/**
 * Approved local logo for a carrier, or undefined when none has been approved.
 * No CDN fallback — only images promoted through the in-app approval tool are used.
 */
export function airlineLogoUrl(brand: AirlineBrand): string | undefined {
  return approvedLogoUrl(brand.icao);
}

/** Same-origin approved logo for canvas sampling (no CORS, no CDN). */
export function airlineLogoCanvasUrl(brand: AirlineBrand): string | undefined {
  return approvedLogoUrl(brand.icao);
}

/** FlightWall LED — prefer in-app pixel art; these marks render better than a raster at matrix scale. */
export function airlineLedLogoUrl(brand: AirlineBrand): string | undefined {
  if (hasLedAirlineMark(brand.icao)) return undefined;
  return airlineLogoCanvasUrl(brand);
}

/** Authentic per-carrier gallery tiles for Elegant & Modern */
const GALLERY_LIVERY: Record<string, AirlineTileStyle> = {
  UAL: {
    cardBackground: 'linear-gradient(165deg, #0033A0 0%, #001f5c 55%, #000d2e 100%)',
    headerBackground: 'linear-gradient(180deg, #ffffff 0%, #f0f4fa 100%)',
    headerTextColor: '#0033A0',
    headerMutedColor: 'rgba(0, 51, 160, 0.72)',
    accentBarColor: 'linear-gradient(90deg, #0033A0 0%, #0D8BD9 100%)',
    logoBackground: '#ffffff',
    borderColor: '#0D8BD9',
    textColor: '#f8fafc',
    mutedTextColor: 'rgba(248, 250, 252, 0.72)',
    labelColor: '#7eb8ff',
    statBackground:
      'linear-gradient(145deg, rgba(255, 255, 255, 0.16) 0%, rgba(13, 139, 217, 0.12) 100%)',
    statAltBackground:
      'linear-gradient(145deg, rgba(0, 0, 0, 0.35) 0%, rgba(0, 51, 160, 0.18) 100%)',
    badgeBackground: '#0D8BD9',
    badgeTextColor: '#ffffff',
  },
  SWA: {
    cardBackground: 'linear-gradient(165deg, #304CB2 0%, #1e3078 55%, #121f4a 100%)',
    headerBackground: 'linear-gradient(90deg, #FFB612 0%, #ffc94d 100%)',
    headerTextColor: '#1e3078',
    headerMutedColor: 'rgba(30, 48, 120, 0.75)',
    accentBarColor: 'linear-gradient(90deg, #304CB2 0%, #FFB612 50%, #C8102E 100%)',
    logoBackground: '#ffffff',
    borderColor: '#FFB612',
    textColor: '#f8fafc',
    mutedTextColor: 'rgba(248, 250, 252, 0.75)',
    labelColor: '#FFB612',
    statBackground:
      'linear-gradient(145deg, rgba(255, 182, 18, 0.2) 0%, rgba(255, 255, 255, 0.08) 100%)',
    statAltBackground:
      'linear-gradient(145deg, rgba(0, 0, 0, 0.32) 0%, rgba(48, 76, 178, 0.2) 100%)',
    badgeBackground: '#FFB612',
    badgeTextColor: '#1e3078',
  },
  DAL: {
    cardBackground: 'linear-gradient(165deg, #003366 0%, #001f3d 55%, #000f1f 100%)',
    headerBackground: 'linear-gradient(180deg, #ffffff 0%, #f0f4fa 100%)',
    headerTextColor: '#003366',
    headerMutedColor: 'rgba(0, 51, 102, 0.72)',
    accentBarColor: '#C8102E',
    logoBackground: '#ffffff',
    borderColor: '#C8102E',
    textColor: '#f8fafc',
    mutedTextColor: 'rgba(248, 250, 252, 0.72)',
    labelColor: '#C8102E',
    statBackground:
      'linear-gradient(145deg, rgba(200, 16, 46, 0.22) 0%, rgba(255, 255, 255, 0.08) 100%)',
    statAltBackground:
      'linear-gradient(145deg, rgba(0, 0, 0, 0.35) 0%, rgba(200, 16, 46, 0.15) 100%)',
    badgeBackground: '#C8102E',
    badgeTextColor: '#ffffff',
  },
  AAL: {
    cardBackground: 'linear-gradient(165deg, #0078D2 0%, #004a82 50%, #002849 100%)',
    headerBackground: 'linear-gradient(180deg, #ffffff 0%, #f0f4fa 100%)',
    headerTextColor: '#0078D2',
    headerMutedColor: 'rgba(0, 120, 210, 0.72)',
    accentBarColor: 'linear-gradient(90deg, #0078D2 0%, #ffffff 42%, #C8102E 100%)',
    logoBackground: '#ffffff',
    borderColor: '#C8102E',
    textColor: '#f8fafc',
    mutedTextColor: 'rgba(248, 250, 252, 0.75)',
    labelColor: '#7ec8f8',
    statBackground:
      'linear-gradient(145deg, rgba(255, 255, 255, 0.14) 0%, rgba(0, 120, 210, 0.12) 100%)',
    statAltBackground:
      'linear-gradient(145deg, rgba(0, 0, 0, 0.32) 0%, rgba(200, 16, 46, 0.12) 100%)',
    badgeBackground: '#C8102E',
    badgeTextColor: '#ffffff',
  },
  FFT: {
    cardBackground: 'linear-gradient(165deg, #006747 0%, #004530 55%, #002818 100%)',
    headerBackground: 'linear-gradient(90deg, #8CD600 0%, #a8e838 100%)',
    headerTextColor: '#004530',
    headerMutedColor: 'rgba(0, 69, 48, 0.75)',
    accentBarColor: '#8CD600',
    logoBackground: '#ffffff',
    borderColor: '#8CD600',
    textColor: '#f0fff4',
    mutedTextColor: 'rgba(240, 255, 244, 0.75)',
    labelColor: '#8CD600',
    statBackground:
      'linear-gradient(145deg, rgba(140, 214, 0, 0.2) 0%, rgba(255, 255, 255, 0.06) 100%)',
    statAltBackground:
      'linear-gradient(145deg, rgba(0, 0, 0, 0.34) 0%, rgba(0, 103, 71, 0.18) 100%)',
    badgeBackground: '#8CD600',
    badgeTextColor: '#004530',
  },
  JBU: {
    cardBackground: 'linear-gradient(165deg, #003087 0%, #001d52 55%, #000c22 100%)',
    headerBackground: 'linear-gradient(180deg, #ffffff 0%, #f0f4fa 100%)',
    headerTextColor: '#003087',
    headerMutedColor: 'rgba(0, 48, 135, 0.72)',
    accentBarColor: '#6699CC',
    logoBackground: '#ffffff',
    borderColor: '#6699CC',
    textColor: '#f8fafc',
    mutedTextColor: 'rgba(248, 250, 252, 0.72)',
    labelColor: '#6699CC',
    statBackground:
      'linear-gradient(145deg, rgba(102, 153, 204, 0.22) 0%, rgba(255, 255, 255, 0.08) 100%)',
    statAltBackground:
      'linear-gradient(145deg, rgba(0, 0, 0, 0.34) 0%, rgba(0, 48, 135, 0.18) 100%)',
    badgeBackground: '#6699CC',
    badgeTextColor: '#003087',
  },
  ASA: {
    cardBackground: 'linear-gradient(165deg, #01426A 0%, #002a45 55%, #001525 100%)',
    headerBackground: 'linear-gradient(90deg, #48BFE5 0%, #7ed4f7 100%)',
    headerTextColor: '#01426A',
    headerMutedColor: 'rgba(1, 66, 106, 0.75)',
    accentBarColor: 'linear-gradient(90deg, #48BFE5 0%, #95C93D 100%)',
    logoBackground: '#ffffff',
    borderColor: '#48BFE5',
    textColor: '#f8fafc',
    mutedTextColor: 'rgba(248, 250, 252, 0.75)',
    labelColor: '#48BFE5',
    statBackground:
      'linear-gradient(145deg, rgba(72, 191, 229, 0.2) 0%, rgba(255, 255, 255, 0.08) 100%)',
    statAltBackground:
      'linear-gradient(145deg, rgba(0, 0, 0, 0.32) 0%, rgba(1, 66, 106, 0.18) 100%)',
    badgeBackground: '#95C93D',
    badgeTextColor: '#01426A',
  },
  ACA: {
    cardBackground: 'linear-gradient(165deg, #D22630 0%, #8f1820 55%, #4d0c10 100%)',
    headerBackground: 'linear-gradient(180deg, #ffffff 0%, #f0f4fa 100%)',
    headerTextColor: '#D22630',
    headerMutedColor: 'rgba(210, 38, 48, 0.72)',
    accentBarColor: 'linear-gradient(90deg, #D22630 0%, #1A1A1A 100%)',
    logoBackground: '#ffffff',
    borderColor: '#D22630',
    textColor: '#f8fafc',
    mutedTextColor: 'rgba(248, 250, 252, 0.75)',
    labelColor: '#ffb3b8',
    statBackground:
      'linear-gradient(145deg, rgba(255, 255, 255, 0.16) 0%, rgba(210, 38, 48, 0.12) 100%)',
    statAltBackground:
      'linear-gradient(145deg, rgba(0, 0, 0, 0.35) 0%, rgba(210, 38, 48, 0.18) 100%)',
    badgeBackground: '#D22630',
    badgeTextColor: '#ffffff',
  },
  MIL: {
    cardBackground: 'linear-gradient(165deg, #3D4F2F 0%, #2a3620 55%, #141a0f 100%)',
    headerBackground: 'linear-gradient(180deg, #C5A572 0%, #e8d4b0 100%)',
    headerTextColor: '#2C1810',
    headerMutedColor: 'rgba(44, 24, 16, 0.72)',
    accentBarColor: 'linear-gradient(90deg, #3D4F2F 0%, #C5A572 50%, #2C1810 100%)',
    logoBackground: '#ffffff',
    borderColor: '#C5A572',
    textColor: '#f8fafc',
    mutedTextColor: 'rgba(248, 250, 252, 0.72)',
    labelColor: '#C5A572',
    statBackground:
      'linear-gradient(145deg, rgba(197, 165, 114, 0.2) 0%, rgba(255, 255, 255, 0.08) 100%)',
    statAltBackground:
      'linear-gradient(145deg, rgba(0, 0, 0, 0.35) 0%, rgba(61, 79, 47, 0.2) 100%)',
    badgeBackground: '#C5A572',
    badgeTextColor: '#2C1810',
  },
  PVT: {
    cardBackground: 'linear-gradient(165deg, #1E293B 0%, #0f172a 55%, #020617 100%)',
    headerBackground: 'linear-gradient(180deg, #D4AF37 0%, #f0d875 100%)',
    headerTextColor: '#1E293B',
    headerMutedColor: 'rgba(30, 41, 59, 0.72)',
    accentBarColor: 'linear-gradient(90deg, #64748B 0%, #D4AF37 100%)',
    logoBackground: '#ffffff',
    borderColor: '#D4AF37',
    textColor: '#f8fafc',
    mutedTextColor: 'rgba(248, 250, 252, 0.72)',
    labelColor: '#D4AF37',
    statBackground:
      'linear-gradient(145deg, rgba(212, 175, 55, 0.18) 0%, rgba(255, 255, 255, 0.06) 100%)',
    statAltBackground:
      'linear-gradient(145deg, rgba(0, 0, 0, 0.34) 0%, rgba(30, 41, 59, 0.22) 100%)',
    badgeBackground: '#D4AF37',
    badgeTextColor: '#1E293B',
  },
  FDX: {
    cardBackground: 'linear-gradient(165deg, #4D148C 0%, #3a0f6a 55%, #1a0630 100%)',
    headerBackground: 'linear-gradient(180deg, #FF6600 0%, #ff8533 100%)',
    headerTextColor: '#4D148C',
    headerMutedColor: 'rgba(77, 20, 140, 0.72)',
    accentBarColor: 'linear-gradient(90deg, #4D148C 0%, #FF6600 100%)',
    logoBackground: '#ffffff',
    borderColor: '#FF6600',
    textColor: '#f8fafc',
    mutedTextColor: 'rgba(248, 250, 252, 0.72)',
    labelColor: '#FF6600',
    statBackground:
      'linear-gradient(145deg, rgba(255, 102, 0, 0.18) 0%, rgba(255, 255, 255, 0.06) 100%)',
    statAltBackground:
      'linear-gradient(145deg, rgba(0, 0, 0, 0.34) 0%, rgba(77, 20, 140, 0.22) 100%)',
    badgeBackground: '#FF6600',
    badgeTextColor: '#4D148C',
  },
  UPS: {
    cardBackground: 'linear-gradient(165deg, #351C15 0%, #241209 55%, #120904 100%)',
    headerBackground: 'linear-gradient(180deg, #FFB500 0%, #ffc933 100%)',
    headerTextColor: '#351C15',
    headerMutedColor: 'rgba(53, 28, 21, 0.72)',
    accentBarColor: 'linear-gradient(90deg, #351C15 0%, #FFB500 100%)',
    logoBackground: '#ffffff',
    borderColor: '#FFB500',
    textColor: '#f8fafc',
    mutedTextColor: 'rgba(248, 250, 252, 0.72)',
    labelColor: '#FFB500',
    statBackground:
      'linear-gradient(145deg, rgba(255, 181, 0, 0.18) 0%, rgba(255, 255, 255, 0.06) 100%)',
    statAltBackground:
      'linear-gradient(145deg, rgba(0, 0, 0, 0.34) 0%, rgba(53, 28, 21, 0.22) 100%)',
    badgeBackground: '#FFB500',
    badgeTextColor: '#351C15',
  },
  GTI: {
    cardBackground: 'linear-gradient(165deg, #003366 0%, #002244 55%, #001122 100%)',
    headerBackground: 'linear-gradient(180deg, #ffffff 0%, #f0f4fa 100%)',
    headerTextColor: '#003366',
    headerMutedColor: 'rgba(0, 51, 102, 0.72)',
    accentBarColor: 'linear-gradient(90deg, #003366 0%, #C8102E 100%)',
    logoBackground: '#ffffff',
    borderColor: '#C8102E',
    textColor: '#f8fafc',
    mutedTextColor: 'rgba(248, 250, 252, 0.72)',
    labelColor: '#C8102E',
    statBackground:
      'linear-gradient(145deg, rgba(255, 255, 255, 0.14) 0%, rgba(200, 16, 46, 0.1) 100%)',
    statAltBackground:
      'linear-gradient(145deg, rgba(0, 0, 0, 0.32) 0%, rgba(0, 51, 102, 0.18) 100%)',
    badgeBackground: '#C8102E',
    badgeTextColor: '#ffffff',
  },
  ABX: {
    cardBackground: 'linear-gradient(165deg, #232F3E 0%, #161f29 55%, #0a0e12 100%)',
    headerBackground: 'linear-gradient(180deg, #FF9900 0%, #ffb033 100%)',
    headerTextColor: '#232F3E',
    headerMutedColor: 'rgba(35, 47, 62, 0.72)',
    accentBarColor: 'linear-gradient(90deg, #232F3E 0%, #FF9900 100%)',
    logoBackground: '#ffffff',
    borderColor: '#FF9900',
    textColor: '#f8fafc',
    mutedTextColor: 'rgba(248, 250, 252, 0.72)',
    labelColor: '#FF9900',
    statBackground:
      'linear-gradient(145deg, rgba(255, 153, 0, 0.18) 0%, rgba(255, 255, 255, 0.06) 100%)',
    statAltBackground:
      'linear-gradient(145deg, rgba(0, 0, 0, 0.34) 0%, rgba(35, 47, 62, 0.22) 100%)',
    badgeBackground: '#FF9900',
    badgeTextColor: '#232F3E',
  },
  DHK: {
    cardBackground: 'linear-gradient(165deg, #D40511 0%, #a0040d 55%, #600208 100%)',
    headerBackground: 'linear-gradient(180deg, #FFCC00 0%, #ffe066 100%)',
    headerTextColor: '#D40511',
    headerMutedColor: 'rgba(212, 5, 17, 0.72)',
    accentBarColor: 'linear-gradient(90deg, #D40511 0%, #FFCC00 100%)',
    logoBackground: '#ffffff',
    borderColor: '#FFCC00',
    textColor: '#f8fafc',
    mutedTextColor: 'rgba(248, 250, 252, 0.72)',
    labelColor: '#FFCC00',
    statBackground:
      'linear-gradient(145deg, rgba(255, 204, 0, 0.18) 0%, rgba(255, 255, 255, 0.06) 100%)',
    statAltBackground:
      'linear-gradient(145deg, rgba(0, 0, 0, 0.34) 0%, rgba(212, 5, 17, 0.22) 100%)',
    badgeBackground: '#FFCC00',
    badgeTextColor: '#D40511',
  },
};

function genericGalleryLivery(brand: AirlineBrand): AirlineTileStyle {
  const primary = brand.primaryColor;
  const accent = brand.accentColor;
  const darkPrimary = mixHex(primary, '#000000', 0.35);
  const deepPrimary = mixHex(primary, '#000000', 0.55);
  const textOnPrimary = contrastingText(primary);
  const textOnAccent = contrastingText(accent);
  const headerIsLight = luminance(accent) > 0.55;

  return {
    cardBackground: `linear-gradient(165deg, ${primary} 0%, ${darkPrimary} 55%, ${deepPrimary} 100%)`,
    headerBackground: headerIsLight
      ? `linear-gradient(180deg, ${accent} 0%, ${mixHex(accent, '#ffffff', 0.35)} 100%)`
      : 'linear-gradient(180deg, #ffffff 0%, #f0f4fa 100%)',
    headerTextColor: headerIsLight ? primary : primary,
    headerMutedColor: headerIsLight ? 'rgba(15, 23, 42, 0.65)' : 'rgba(0, 0, 0, 0.55)',
    accentBarColor: brand.secondaryColor
      ? `linear-gradient(90deg, ${accent} 0%, ${brand.secondaryColor} 100%)`
      : accent,
    statBackground: `linear-gradient(145deg, ${mixHex(primary, '#ffffff', 0.14)} 0%, ${mixHex(primary, '#ffffff', 0.06)} 100%)`,
    statAltBackground: `linear-gradient(145deg, ${mixHex(primary, '#000000', 0.35)} 0%, ${mixHex(primary, '#000000', 0.18)} 100%)`,
    logoBackground: headerIsLight ? '#ffffff' : mixHex(accent, '#ffffff', 0.9),
    textColor: textOnPrimary,
    mutedTextColor:
      luminance(primary) > 0.55 ? 'rgba(15, 23, 42, 0.65)' : 'rgba(248, 250, 252, 0.72)',
    labelColor: luminance(accent) > 0.55 ? mixHex(accent, '#000000', 0.45) : accent,
    badgeBackground: accent,
    badgeTextColor: textOnAccent,
    borderColor: mixHex(accent, primary, 0.45),
  };
}

/** Per-tile livery styling for the Elegant & Modern gallery layout */
export function getAirlineTileStyle(brand: AirlineBrand): AirlineTileStyle {
  return GALLERY_LIVERY[brand.icao] ?? genericGalleryLivery(brand);
}
