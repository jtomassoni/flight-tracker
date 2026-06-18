import {
  airlineLedLogoUrl,
  getLogoBrandByIcao,
  getAirlineLedWallStyle,
  type AirlineBrand,
} from '@/lib/airlines';
import { formatAircraftTypeDisplay } from '@/lib/aircraftTypes';
import { hasLedAirlineMark } from '@/lib/ledAirlineMarks';
import { hasApprovedLogo } from '@/lib/approvedLogos';
import type { LedFlightContent } from '@/lib/ledMatrix';

export type AirlineLogoSource = 'native-mark' | 'approved' | 'iata-fallback';

export function airlineLogoSource(brand: AirlineBrand): AirlineLogoSource {
  if (hasLedAirlineMark(brand.icao)) return 'native-mark';
  if (hasApprovedLogo(brand.icao)) return 'approved';
  return 'iata-fallback';
}

export function buildAirlineLedPreview(icao: string): LedFlightContent | null {
  const brand = getLogoBrandByIcao(icao);
  if (!brand) return null;

  const wallStyle = getAirlineLedWallStyle(brand);
  return {
    airlineName: brand.name,
    flightId: `${brand.iata} 000`,
    routeHero: 'DEN→PHX',
    telemetry: [{ value: formatAircraftTypeDisplay('B738') }, { value: '425 mph' }],
    logoUrl: airlineLedLogoUrl(brand),
    logoIcao: brand.icao,
    logoFallback: brand.iata,
    logoBackground: wallStyle.logoBackground,
    logoBorder: wallStyle.logoBorder,
    accentStripe: wallStyle.accentStripe,
    logoPalette: wallStyle.logoPalette,
    logoTileBorder: wallStyle.logoTileBorder,
  };
}
