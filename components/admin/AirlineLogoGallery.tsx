'use client';

import Link from 'next/link';
import {
  AIRLINE_ICAO_LIST,
  CATEGORY_ICAO_LIST,
  LOGO_BRAND_ICAO_LIST,
  getLogoBrandByIcao,
} from '@/lib/airlines';
import {
  airlineLogoSource,
  buildAirlineLedPreview,
} from '@/lib/airlineThemePreview';
import { hasLedAirlineMark } from '@/lib/ledAirlineMarks';
import AirlineLedLogoTile from '@/components/admin/AirlineLedLogoTile';
import { useLogoCatalog } from '@/components/admin/LogoCatalogContext';
import AirlineLogoImage from '@/components/display/shared/AirlineLogoImage';
import './airline-logo-gallery.css';

export function AirlineLogoSourceBadge({
  icao,
  compact = false,
}: {
  icao: string;
  compact?: boolean;
}) {
  const brand = getLogoBrandByIcao(icao);
  if (!brand) return null;

  const source = airlineLogoSource(brand);
  const labels: Record<typeof source, string> = {
    'native-mark': compact ? 'LED' : 'LED mark',
    approved: compact ? 'OK' : 'Approved',
    'iata-fallback': compact ? '—' : 'No logo',
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
  filter?: 'all' | 'needs-logo';
};

function ExpandedAirlineCard({
  icao,
  brand,
  content,
  logoUrl,
}: {
  icao: string;
  brand: NonNullable<ReturnType<typeof getLogoBrandByIcao>>;
  content: NonNullable<ReturnType<typeof buildAirlineLedPreview>>;
  logoUrl?: string;
}) {
  return (
    <article className="airline-logo-card">
      <div
        className="airline-logo-card__accent"
        style={{ background: brand.primaryColor }}
        aria-hidden
      />
      <header className="airline-logo-card__header">
        <div className="airline-logo-card__identity">
          <span className="admin-mono airline-logo-card__icao">{icao}</span>
          <span className="airline-logo-card__name">{brand.name}</span>
        </div>
        <AirlineLogoSourceBadge icao={icao} />
      </header>
      <div className="airline-logo-card__compare">
        <figure className="airline-logo-card__preview">
          <figcaption className="airline-logo-card__preview-label">Approved</figcaption>
          <div className="airline-logo-card__preview-box airline-logo-card__preview-box--light">
            <AirlineLogoImage
              brand={brand}
              size={128}
              alt={`${brand.name} approved logo`}
              width={48}
              height={48}
              logoUrl={logoUrl}
            />
          </div>
        </figure>
        <figure className="airline-logo-card__preview">
          <figcaption className="airline-logo-card__preview-label">LED tile</figcaption>
          <div
            className="airline-logo-card__preview-box airline-logo-card__preview-box--led"
            style={{ background: content.logoBackground }}
          >
            <AirlineLedLogoTile
              content={content}
              label={`${brand.name} LED tile`}
              zoom={8}
              displaySize={64}
            />
          </div>
        </figure>
      </div>
    </article>
  );
}

function CompactAirlineCard({
  icao,
  brand,
  content,
  logoUrl,
}: {
  icao: string;
  brand: NonNullable<ReturnType<typeof getLogoBrandByIcao>>;
  content: NonNullable<ReturnType<typeof buildAirlineLedPreview>>;
  logoUrl?: string;
}) {
  return (
    <article className="airline-logo-card">
      <header className="airline-logo-card__header">
        <div className="airline-logo-card__identity">
          <span className="admin-mono airline-logo-card__icao">{icao}</span>
          <span className="airline-logo-card__name">{brand.name}</span>
        </div>
        <AirlineLogoSourceBadge icao={icao} compact />
      </header>
      <div className="airline-logo-card__previews">
        <figure className="airline-logo-card__cdn" title="Approved logo">
          <AirlineLogoImage brand={brand} size={64} alt="" width={32} height={32} logoUrl={logoUrl} />
        </figure>
        <div className="airline-logo-card__led">
          <AirlineLedLogoTile
            content={content}
            label={`${brand.name} LED tile`}
            zoom={6}
            displaySize={56}
          />
        </div>
      </div>
    </article>
  );
}

export default function AirlineLogoGallery({
  variant = 'compact',
  linkToTester = false,
  filter = 'all',
}: AirlineLogoGalleryProps) {
  const { catalog, getApprovedUrl } = useLogoCatalog();
  const isCompact = variant === 'compact';
  const brandList = isCompact ? AIRLINE_ICAO_LIST : LOGO_BRAND_ICAO_LIST;
  const carrierCount = AIRLINE_ICAO_LIST.length;
  const categoryCount = CATEGORY_ICAO_LIST.length;
  const approvedSet = new Set(
    catalog.filter((entry) => entry.approved).map((entry) => entry.icao)
  );
  const visibleList =
    filter === 'needs-logo'
      ? brandList.filter((icao) => !approvedSet.has(icao))
      : brandList;

  return (
    <div
      className={`airline-logo-gallery airline-logo-gallery--${variant}`}
      data-link-cards={linkToTester ? 'true' : 'false'}
    >
      {!isCompact && (
        <header className="airline-logo-gallery__summary">
          <p className="airline-logo-gallery__summary-text">
            Side-by-side CDN source and FlightWall LED render for every carrier and
            traffic category.
          </p>
          <span className="airline-logo-gallery__summary-count admin-mono">
            {approvedSet.size}/{brandList.length} approved · {carrierCount} carriers ·{' '}
            {categoryCount} categories
          </span>
        </header>
      )}
      <div className="airline-logo-gallery__grid">
      {visibleList.length === 0 ? (
        <p className="logo-approve__hint">
          {filter === 'needs-logo'
            ? 'All carriers have approved logos. Switch to “All” to review them.'
            : 'No carriers in the catalog.'}
        </p>
      ) : (
      visibleList.map((icao) => {
        const brand = getLogoBrandByIcao(icao);
        const logoUrl = getApprovedUrl(icao);
        const content = buildAirlineLedPreview(icao, { logoUrl });
        if (!brand || !content) return null;

        const card = isCompact ? (
          <CompactAirlineCard icao={icao} brand={brand} content={content} logoUrl={logoUrl} />
        ) : (
          <ExpandedAirlineCard icao={icao} brand={brand} content={content} logoUrl={logoUrl} />
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
      })
      )}
      </div>
    </div>
  );
}
