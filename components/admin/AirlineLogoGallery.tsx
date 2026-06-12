'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  AIRLINE_ICAO_LIST,
  airlineLogoUrl,
  getAirlineByIcao,
} from '@/lib/airlines';
import {
  airlineLogoSource,
  buildAirlineLedPreview,
} from '@/lib/airlineThemePreview';
import { hasLedAirlineMark } from '@/lib/ledAirlineMarks';
import AirlineLedLogoTile from '@/components/admin/AirlineLedLogoTile';
import './airline-logo-gallery.css';

export function AirlineLogoSourceBadge({
  icao,
  compact = false,
}: {
  icao: string;
  compact?: boolean;
}) {
  const brand = getAirlineByIcao(icao);
  if (!brand) return null;

  const source = airlineLogoSource(brand);
  const labels: Record<typeof source, string> = {
    'native-mark': compact ? 'LED' : 'LED mark',
    'cdn-raster': 'CDN',
    'iata-fallback': 'Fallback',
  };

  const detail =
    !compact && hasLedAirlineMark(icao) ? ' · pixel art' : '';

  return (
    <span className={`airline-logo-badge airline-logo-badge--${source}`}>
      {labels[source]}
      {detail}
    </span>
  );
}

type AirlineLogoGalleryProps = {
  variant?: 'compact' | 'expanded';
  linkToTester?: boolean;
};

export default function AirlineLogoGallery({
  variant = 'compact',
  linkToTester = false,
}: AirlineLogoGalleryProps) {
  const isCompact = variant === 'compact';
  const tileZoom = isCompact ? 6 : 8;
  const tileDisplay = isCompact ? 56 : undefined;

  return (
    <div
      className={`airline-logo-gallery airline-logo-gallery--${variant}`}
      data-link-cards={linkToTester ? 'true' : 'false'}
    >
      {AIRLINE_ICAO_LIST.map((icao) => {
        const brand = getAirlineByIcao(icao);
        const content = buildAirlineLedPreview(icao);
        if (!brand || !content) return null;

        const card = (
          <article className="airline-logo-card">
            <header className="airline-logo-card__header">
              <div className="airline-logo-card__identity">
                <span className="admin-mono airline-logo-card__icao">{icao}</span>
                <span className="airline-logo-card__name">{brand.name}</span>
              </div>
              <AirlineLogoSourceBadge icao={icao} compact={isCompact} />
            </header>
            <div className="airline-logo-card__previews">
              <figure className="airline-logo-card__cdn" title="Kiwi CDN logo">
                <Image
                  src={airlineLogoUrl(brand, 64)}
                  alt=""
                  width={32}
                  height={32}
                  unoptimized
                />
              </figure>
              <div className="airline-logo-card__led">
                <AirlineLedLogoTile
                  content={content}
                  label={`${brand.name} LED tile`}
                  zoom={tileZoom}
                  displaySize={tileDisplay}
                />
              </div>
            </div>
          </article>
        );

        if (!linkToTester) {
          return (
            <div key={icao} className="airline-logo-gallery__item">
              {card}
            </div>
          );
        }

        return (
          <Link
            key={icao}
            href={`/admin/theme-tester?icao=${icao}`}
            className="airline-logo-card__link airline-logo-gallery__item"
          >
            {card}
          </Link>
        );
      })}
    </div>
  );
}
