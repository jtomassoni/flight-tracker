'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { KioskPreviewProvider } from '@/contexts/KioskPreviewContext';
import LedMatrixCanvas from '@/components/display/shared/LedMatrixCanvas';
import AirlineLedLogoTile from '@/components/admin/AirlineLedLogoTile';
import AirlineLogoGallery, { AirlineLogoSourceBadge } from '@/components/admin/AirlineLogoGallery';
import {
  AIRLINE_ICAO_LIST,
  airlineLogoCanvasUrl,
  airlineLogoUrl,
  getAirlineByIcao,
  getAirlineTileStyle,
} from '@/lib/airlines';
import { buildAirlineLedPreview } from '@/lib/airlineThemePreview';
import './airline-logo-gallery.css';
import './theme-tester.css';

function normalizeIcao(raw: string): string {
  return raw.trim().toUpperCase().slice(0, 3);
}

function GalleryLogoPreview({ icao }: { icao: string }) {
  const brand = getAirlineByIcao(icao);
  if (!brand) return null;

  const tile = getAirlineTileStyle(brand);

  return (
    <div
      className="theme-tester__gallery-card"
      style={{
        background: tile.cardBackground,
        borderColor: tile.borderColor,
        color: tile.textColor,
      }}
    >
      <div className="theme-tester__gallery-accent" style={{ background: tile.accentBarColor }} />
      <div
        className="theme-tester__gallery-header"
        style={{
          background: tile.headerBackground,
          color: tile.headerTextColor,
        }}
      >
        <div
          className="theme-tester__gallery-logo"
          style={{ background: tile.logoBackground }}
        >
          <Image
            src={airlineLogoUrl(brand, 128)}
            alt={`${brand.name} logo`}
            width={64}
            height={64}
            unoptimized
          />
        </div>
        <div className="min-w-0">
          <p className="theme-tester__gallery-name">{brand.name}</p>
          <p className="theme-tester__gallery-flight" style={{ color: tile.headerMutedColor }}>
            {brand.iata} 000 · DEN → PHX
          </p>
        </div>
      </div>
    </div>
  );
}

function AirlinePreviewPanel({ icao }: { icao: string }) {
  const brand = getAirlineByIcao(icao);
  const ledContent = useMemo(() => buildAirlineLedPreview(icao), [icao]);

  if (!brand || !ledContent) {
    return (
      <div className="theme-tester__empty">
        <p>Unknown airline ICAO: <span className="admin-mono">{icao}</span></p>
        <p className="theme-tester__hint">Use a 3-letter code from the registry (e.g. SWA, DAL).</p>
      </div>
    );
  }

  const wallStyle = ledContent;

  return (
    <div className="theme-tester__previews">
      <section className="theme-tester__panel">
        <h3 className="theme-tester__panel-title">Source assets</h3>
        <div className="theme-tester__source-grid">
          <figure className="theme-tester__figure">
            <div className="theme-tester__source-box theme-tester__source-box--light">
              <Image
                src={airlineLogoUrl(brand, 128)}
                alt={`${brand.name} Kiwi 128px`}
                width={128}
                height={128}
                unoptimized
              />
            </div>
            <figcaption>Kiwi CDN 128px</figcaption>
          </figure>
          <figure className="theme-tester__figure">
            <div className="theme-tester__source-box theme-tester__source-box--light">
              <Image
                src={airlineLogoUrl(brand, 64)}
                alt={`${brand.name} Kiwi 64px`}
                width={64}
                height={64}
                unoptimized
              />
            </div>
            <figcaption>Kiwi CDN 64px</figcaption>
          </figure>
          <figure className="theme-tester__figure">
            <div className="theme-tester__source-box theme-tester__source-box--dark">
              <Image
                src={airlineLogoCanvasUrl(brand, 128)}
                alt={`${brand.name} proxied 128px`}
                width={128}
                height={128}
                unoptimized
              />
            </div>
            <figcaption>Proxied (canvas source)</figcaption>
          </figure>
        </div>
      </section>

      <section className="theme-tester__panel">
        <h3 className="theme-tester__panel-title">FlightWall LED</h3>
        <p className="theme-tester__panel-desc">
          Logo tile at 8× scale and full matrix preview — same render path as the display.
        </p>
        <div className="theme-tester__led-row">
          <AirlineLedLogoTile content={wallStyle} label={`${brand.name} LED tile`} />
          <div className="theme-tester__matrix-wrap">
            <KioskPreviewProvider enabled orientation="landscape">
              <LedMatrixCanvas
                orientation="landscape"
                content={ledContent}
                className="theme-tester__matrix"
              />
            </KioskPreviewProvider>
          </div>
        </div>
        <dl className="theme-tester__meta">
          <div>
            <dt>Tile background</dt>
            <dd>
              <span
                className="theme-tester__swatch"
                style={{ background: wallStyle.logoBackground }}
              />
              <span className="admin-mono">{wallStyle.logoBackground}</span>
            </dd>
          </div>
          <div>
            <dt>LED palette</dt>
            <dd className="theme-tester__palette">
              {wallStyle.logoPalette?.map((color) => (
                <span
                  key={color}
                  className="theme-tester__swatch"
                  style={{ background: color }}
                  title={color}
                />
              ))}
            </dd>
          </div>
        </dl>
      </section>

      <section className="theme-tester__panel">
        <h3 className="theme-tester__panel-title">Elegant &amp; Modern gallery</h3>
        <GalleryLogoPreview icao={icao} />
      </section>
    </div>
  );
}

export default function AirlineThemeTester() {
  const searchParams = useSearchParams();
  const initialIcao = normalizeIcao(searchParams.get('icao') ?? 'SWA');
  const [icaoInput, setIcaoInput] = useState(initialIcao);
  const [activeIcao, setActiveIcao] = useState(
    getAirlineByIcao(initialIcao) ? initialIcao : 'SWA'
  );
  const [viewAll, setViewAll] = useState(false);

  const applyIcao = useCallback((raw: string) => {
    const next = normalizeIcao(raw);
    setIcaoInput(next);
    if (next.length === 3) {
      setActiveIcao(next);
      const url = new URL(window.location.href);
      url.searchParams.set('icao', next);
      window.history.replaceState(null, '', url);
    }
  }, []);

  const brand = getAirlineByIcao(activeIcao);

  return (
    <div className="theme-tester">
      <header className="theme-tester__header">
        <div className="min-w-0">
          <p className="admin-label mb-1">Dev tooling</p>
          <h1 className="admin-heading text-xl font-bold tracking-tight text-white sm:text-2xl">
            Airline Theme Tester
          </h1>
          <p className="theme-tester__subtitle">
            Validate CDN logos, LED marks, and gallery tiles for any carrier.
          </p>
        </div>
        <div className="theme-tester__header-actions">
          <Link href="/admin" className="admin-btn-ghost admin-btn--compact rounded-lg px-3 py-1.5 text-xs">
            ← Admin
          </Link>
          <Link href="/display" className="admin-btn-primary admin-btn--compact rounded-lg px-4 py-1.5 text-xs">
            Display
          </Link>
        </div>
      </header>

      <div className="theme-tester__controls admin-card rounded-2xl p-4 sm:p-5">
        <div className="theme-tester__control-row">
          <label className="block min-w-0 flex-1">
            <span className="admin-label mb-2 block">Airline (ICAO)</span>
            <div className="theme-tester__icao-row">
              <select
                value={activeIcao}
                onChange={(e) => applyIcao(e.target.value)}
                className="admin-select theme-tester__select"
              >
                {AIRLINE_ICAO_LIST.map((code) => {
                  const item = getAirlineByIcao(code);
                  return (
                    <option key={code} value={code}>
                      {code} — {item?.name ?? 'Unknown'}
                    </option>
                  );
                })}
              </select>
              <input
                type="text"
                value={icaoInput}
                onChange={(e) => applyIcao(e.target.value)}
                maxLength={3}
                placeholder="ICAO"
                className="admin-input theme-tester__icao-input admin-mono"
                aria-label="ICAO code"
              />
            </div>
          </label>

          <button
            type="button"
            role="switch"
            aria-checked={viewAll}
            onClick={() => setViewAll((on) => !on)}
            className="theme-tester__view-toggle"
          >
            <span className="admin-label">View all airlines</span>
            <span
              data-checked={viewAll ? 'true' : 'false'}
              className="admin-toggle__track relative h-5 w-9 shrink-0 rounded-full border border-white/10 bg-slate-800 transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-slate-300 after:transition-transform"
            />
          </button>
        </div>

        {brand && !viewAll && (
          <div className="theme-tester__brand-bar">
            <div>
              <p className="theme-tester__brand-name">{brand.name}</p>
              <p className="theme-tester__brand-codes admin-mono">
                ICAO {brand.icao} · IATA {brand.iata}
              </p>
            </div>
            <AirlineLogoSourceBadge icao={activeIcao} />
          </div>
        )}
      </div>

      <div className="theme-tester__body">
        {viewAll ? (
          <AirlineLogoGallery variant="expanded" />
        ) : (
          <AirlinePreviewPanel icao={activeIcao} />
        )}
      </div>
    </div>
  );
}
