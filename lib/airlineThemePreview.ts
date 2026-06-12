import {
  airlineLedLogoUrl,
  getAirlineByIcao,
  getAirlineLedWallStyle,
  type AirlineBrand,
} from '@/lib/airlines';
import { hasLedAirlineMark } from '@/lib/ledAirlineMarks';
import type { LedFlightContent } from '@/lib/ledMatrix';

export type AirlineLogoSource = 'native-mark' | 'cdn-raster' | 'iata-fallback';

export function airlineLogoSource(brand: AirlineBrand): AirlineLogoSource {
  if (hasLedAirlineMark(brand.icao)) return 'native-mark';
  if (airlineLedLogoUrl(brand, 128)) return 'cdn-raster';
  return 'iata-fallback';
}

export function buildAirlineLedPreview(icao: string): LedFlightContent | null {
  const brand = getAirlineByIcao(icao);
  if (!brand) return null;

  const wallStyle = getAirlineLedWallStyle(brand);
  return {
    airlineName: brand.name,
    flightId: `${brand.iata} 000`,
    routeHero: 'DEN→PHX',
    telemetry: [{ value: 'B737' }, { value: '425 mph' }],
    logoUrl: airlineLedLogoUrl(brand, 128),
    logoIcao: brand.icao,
    logoFallback: brand.iata,
    logoBackground: wallStyle.logoBackground,
    logoBorder: wallStyle.logoBorder,
    accentStripe: wallStyle.accentStripe,
    logoPalette: wallStyle.logoPalette,
    logoTileBorder: wallStyle.logoTileBorder,
  };
}
