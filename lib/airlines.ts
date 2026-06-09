export type AirlineBrand = {
  name: string;
  icao: string;
  iata: string;
  primaryColor: string;
  accentColor: string;
  /** Third brand color when applicable (e.g. Southwest red, Delta red) */
  secondaryColor?: string;
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
    secondaryColor: '#0D8BD9',
    logoUrl: 'https://images.kiwi.com/airlines/128/UA.png',
  },
  SWA: {
    name: 'Southwest',
    icao: 'SWA',
    iata: 'WN',
    primaryColor: '#304CB2',
    accentColor: '#FFB612',
    secondaryColor: '#C8102E',
    logoUrl: 'https://images.kiwi.com/airlines/128/WN.png',
  },
  DAL: {
    name: 'Delta',
    icao: 'DAL',
    iata: 'DL',
    primaryColor: '#003366',
    accentColor: '#C8102E',
    secondaryColor: '#FFFFFF',
    logoUrl: 'https://images.kiwi.com/airlines/128/DL.png',
  },
  AAL: {
    name: 'American',
    icao: 'AAL',
    iata: 'AA',
    primaryColor: '#0078D2',
    accentColor: '#C8102E',
    secondaryColor: '#FFFFFF',
    logoUrl: 'https://images.kiwi.com/airlines/128/AA.png',
  },
  FFT: {
    name: 'Frontier',
    icao: 'FFT',
    iata: 'F9',
    primaryColor: '#006747',
    accentColor: '#8CD600',
    secondaryColor: '#FFFFFF',
    logoUrl: 'https://images.kiwi.com/airlines/128/F9.png',
  },
  JBU: {
    name: 'JetBlue',
    icao: 'JBU',
    iata: 'B6',
    primaryColor: '#003087',
    accentColor: '#FFFFFF',
    secondaryColor: '#6699CC',
    logoUrl: 'https://images.kiwi.com/airlines/128/B6.png',
  },
  ASA: {
    name: 'Alaska',
    icao: 'ASA',
    iata: 'AS',
    primaryColor: '#01426A',
    accentColor: '#48BFE5',
    secondaryColor: '#95C93D',
    logoUrl: 'https://images.kiwi.com/airlines/128/AS.png',
  },
  SKW: {
    name: 'SkyWest',
    icao: 'SKW',
    iata: 'OO',
    primaryColor: '#1B365D',
    accentColor: '#C4D600',
    secondaryColor: '#0072CE',
    logoUrl: 'https://images.kiwi.com/airlines/128/OO.png',
  },
  ENY: {
    name: 'Envoy',
    icao: 'ENY',
    iata: 'MQ',
    primaryColor: '#003366',
    accentColor: '#C8102E',
    secondaryColor: '#FFFFFF',
    logoUrl: 'https://images.kiwi.com/airlines/128/MQ.png',
  },
  RPA: {
    name: 'Republic',
    icao: 'RPA',
    iata: 'YX',
    primaryColor: '#1F3A5F',
    accentColor: '#E8B923',
    secondaryColor: '#FFFFFF',
    logoUrl: 'https://images.kiwi.com/airlines/128/YX.png',
  },
  NKS: {
    name: 'Spirit',
    icao: 'NKS',
    iata: 'NK',
    primaryColor: '#FFD100',
    accentColor: '#000000',
    secondaryColor: '#FFFFFF',
    logoUrl: 'https://images.kiwi.com/airlines/128/NK.png',
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
  SKW: ['#FFFFFF', '#C4D600'],
  NKS: ['#000000', '#FFFFFF'],
};

const LED_LOGO_NO_TILE_BORDER = new Set(['JBU', 'SWA']);

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
const COLOR_LOGO_TILE = new Set(['AAL', 'FFT', 'ASA']);

/** Logo tile styling for the FlightWall LED theme */
export function getAirlineLedWallStyle(brand: AirlineBrand): AirlineLedWallStyle {
  if (COLOR_LOGO_TILE.has(brand.icao)) {
    const logoBackground = '#ffffff';
    return {
      logoBackground,
      logoBorder: mixHex(brand.primaryColor, '#000000', 0.25),
      accentStripe: brand.accentColor,
      logoPalette: airlineLedLogoPalette(brand, logoBackground),
      logoTileBorder: !LED_LOGO_NO_TILE_BORDER.has(brand.icao),
    };
  }

  /** Navy tile — logo PNGs are marks on transparent (not a white CDN matte). */
  const onDarkLogo = ['UAL', 'DAL', 'SKW', 'JBU', 'SWA'].includes(brand.icao);
  const logoBackground = onDarkLogo ? brand.primaryColor : '#e8edf2';
  return {
    logoBackground,
    logoBorder: mixHex(brand.primaryColor, '#000000', 0.25),
    accentStripe: brand.accentColor,
    logoPalette: airlineLedLogoPalette(brand, logoBackground),
    logoTileBorder: !LED_LOGO_NO_TILE_BORDER.has(brand.icao),
  };
}

export function airlineLogoUrl(brand: AirlineBrand, size: 64 | 128 | 256 = 128): string {
  return `https://images.kiwi.com/airlines/${size}/${brand.iata}.png`;
}

/** Same-origin logo URL for canvas sampling (Kiwi CDN blocks CORS). */
export function airlineLogoCanvasUrl(brand: AirlineBrand, size: 64 | 128 | 256 = 128): string {
  return `/api/airline-logo?iata=${encodeURIComponent(brand.iata)}&size=${size}`;
}

/** FlightWall LED — prefer local pixel art; skip CDN marks that collapse at matrix scale. */
const LED_NATIVE_MARK_ICAO = new Set(['AAL', 'SWA', 'DAL', 'SKW']);

export function airlineLedLogoUrl(brand: AirlineBrand, size: 64 | 128 | 256 = 128): string | undefined {
  if (LED_NATIVE_MARK_ICAO.has(brand.icao)) return undefined;
  return airlineLogoCanvasUrl(brand, size);
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
  SKW: {
    cardBackground: 'linear-gradient(165deg, #1B365D 0%, #0f2038 55%, #060f1c 100%)',
    headerBackground: '#C4D600',
    headerTextColor: '#1B365D',
    headerMutedColor: 'rgba(27, 54, 93, 0.75)',
    accentBarColor: 'linear-gradient(90deg, #0072CE 0%, #C4D600 100%)',
    logoBackground: '#ffffff',
    borderColor: '#C4D600',
    textColor: '#f8fafc',
    mutedTextColor: 'rgba(248, 250, 252, 0.72)',
    labelColor: '#C4D600',
    statBackground:
      'linear-gradient(145deg, rgba(196, 214, 0, 0.18) 0%, rgba(255, 255, 255, 0.06) 100%)',
    statAltBackground:
      'linear-gradient(145deg, rgba(0, 0, 0, 0.34) 0%, rgba(27, 54, 93, 0.2) 100%)',
    badgeBackground: '#C4D600',
    badgeTextColor: '#1B365D',
  },
  NKS: {
    cardBackground: 'linear-gradient(165deg, #111111 0%, #000000 100%)',
    headerBackground: '#FFD100',
    headerTextColor: '#000000',
    headerMutedColor: 'rgba(0, 0, 0, 0.65)',
    accentBarColor: '#FFD100',
    logoBackground: '#FFD100',
    borderColor: '#FFD100',
    textColor: '#FFD100',
    mutedTextColor: 'rgba(255, 209, 0, 0.72)',
    labelColor: '#FFD100',
    statBackground:
      'linear-gradient(145deg, rgba(255, 209, 0, 0.18) 0%, rgba(255, 255, 255, 0.04) 100%)',
    statAltBackground:
      'linear-gradient(145deg, rgba(255, 255, 255, 0.08) 0%, rgba(0, 0, 0, 0.28) 100%)',
    badgeBackground: '#FFD100',
    badgeTextColor: '#000000',
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
