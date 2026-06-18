'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import AirlineLedLogoTile from '@/components/admin/AirlineLedLogoTile';
import AirlineLogoImage from '@/components/display/shared/AirlineLogoImage';
import AirlineLogoGallery, { AirlineLogoSourceBadge } from '@/components/admin/AirlineLogoGallery';
import {
  AIRLINE_ICAO_LIST,
  CATEGORY_ICAO_LIST,
  LOGO_BRAND_ICAO_LIST,
  getLogoBrandByIcao,
  getAirlineTileStyle,
} from '@/lib/airlines';
import { buildAirlineLedPreview } from '@/lib/airlineThemePreview';
import { hasLedAirlineMark } from '@/lib/ledAirlineMarks';
import { hasApprovedLogo } from '@/lib/approvedLogos';

function normalizeIcao(raw: string): string {
  return raw.trim().toUpperCase().slice(0, 3);
}

function SourceAssetsPanel({
  brand,
  tileBackground,
}: {
  brand: NonNullable<ReturnType<typeof getLogoBrandByIcao>>;
  tileBackground: string;
}) {
  const useNative = hasLedAirlineMark(brand.icao);

  if (useNative) {
    return (
      <div className="theme-tester__source-grid">
        <figure className="theme-tester__figure">
          <div className="theme-tester__source-box theme-tester__source-box--light">
            <AirlineLogoImage
              brand={brand}
              size={128}
              background="#ffffff"
              alt={`${brand.name} native mark 128px`}
              width={128}
              height={128}
              fillMark
            />
          </div>
          <figcaption>Native mark 128px</figcaption>
        </figure>
        <figure className="theme-tester__figure">
          <div className="theme-tester__source-box theme-tester__source-box--light">
            <AirlineLogoImage
              brand={brand}
              size={128}
              background="#ffffff"
              alt={`${brand.name} native mark 64px`}
              width={64}
              height={64}
              fillMark
            />
          </div>
          <figcaption>Native mark 64px</figcaption>
        </figure>
        <figure className="theme-tester__figure">
          <div
            className="theme-tester__source-box theme-tester__source-box--dark"
            style={{ background: tileBackground }}
          >
            <AirlineLogoImage
              brand={brand}
              size={128}
              background={tileBackground}
              alt={`${brand.name} on tile background`}
              width={128}
              height={128}
              fillMark
            />
          </div>
          <figcaption>On tile background</figcaption>
        </figure>
      </div>
    );
  }

  const approved = hasApprovedLogo(brand.icao);

  if (!approved) {
    return (
      <div className="theme-tester__empty">
        <p>
          No approved logo for <span className="admin-mono">{brand.icao}</span>.
        </p>
        <p className="theme-tester__hint">
          Approve one under <strong>Approve logos</strong> — the display only uses
          images promoted through the app.
        </p>
      </div>
    );
  }

  return (
    <div className="theme-tester__source-grid">
      <figure className="theme-tester__figure">
        <div className="theme-tester__source-box theme-tester__source-box--light">
          <AirlineLogoImage
            brand={brand}
            size={128}
            alt={`${brand.name} approved 128px`}
            width={128}
            height={128}
          />
        </div>
        <figcaption>Approved 128px</figcaption>
      </figure>
      <figure className="theme-tester__figure">
        <div className="theme-tester__source-box theme-tester__source-box--light">
          <AirlineLogoImage
            brand={brand}
            size={64}
            alt={`${brand.name} approved 64px`}
            width={64}
            height={64}
          />
        </div>
        <figcaption>Approved 64px</figcaption>
      </figure>
      <figure className="theme-tester__figure">
        <div
          className="theme-tester__source-box theme-tester__source-box--dark"
          style={{ background: tileBackground }}
        >
          <AirlineLogoImage
            brand={brand}
            size={128}
            background={tileBackground}
            alt={`${brand.name} on tile background`}
            width={128}
            height={128}
          />
        </div>
        <figcaption>On tile background</figcaption>
      </figure>
    </div>
  );
}

function GalleryLogoPreview({ icao }: { icao: string }) {
  const brand = getLogoBrandByIcao(icao);
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
          <AirlineLogoImage
            brand={brand}
            size={128}
            background={tile.logoBackground}
            alt={`${brand.name} logo`}
            width={64}
            height={64}
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
  const brand = getLogoBrandByIcao(icao);
  const ledContent = useMemo(() => buildAirlineLedPreview(icao), [icao]);

  if (!brand || !ledContent) {
    return (
      <div className="theme-tester__empty">
        <p>Unknown brand code: <span className="admin-mono">{icao}</span></p>
        <p className="theme-tester__hint">
          Use a code from the registry — an airline (e.g. SWA, DAL) or a category
          (MIL, PVT, GA, VIP, CGO).
        </p>
      </div>
    );
  }

  const wallStyle = ledContent;

  return (
    <div className="theme-tester__previews">
      <section className="theme-tester__panel theme-tester__panel--source">
        <h3 className="theme-tester__panel-title">Source assets</h3>
        <SourceAssetsPanel brand={brand} tileBackground={wallStyle.logoBackground} />
      </section>

      <section className="theme-tester__panel theme-tester__panel--led">
        <h3 className="theme-tester__panel-title">FlightWall LED</h3>
        <p className="theme-tester__panel-desc">
          Logo tile at 8× scale — same render path as the display.
        </p>
        <div className="theme-tester__led-row">
          <AirlineLedLogoTile
            content={wallStyle}
            displaySize={184}
            label={`${brand.name} LED tile`}
          />
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
        </div>
      </section>

      <section className="theme-tester__panel theme-tester__panel--gallery">
        <h3 className="theme-tester__panel-title">Elegant &amp; Modern gallery</h3>
        <GalleryLogoPreview icao={icao} />
      </section>
    </div>
  );
}

export default function CarrierInspectorPanel() {
  const searchParams = useSearchParams();
  const initialIcao = normalizeIcao(searchParams.get('icao') ?? 'SWA');
  const [icaoInput, setIcaoInput] = useState(initialIcao);
  const [activeIcao, setActiveIcao] = useState(
    getLogoBrandByIcao(initialIcao) ? initialIcao : 'SWA'
  );
  const [viewAll, setViewAll] = useState(false);

  const applyIcao = useCallback((raw: string) => {
    const next = normalizeIcao(raw);
    setIcaoInput(next);
    // Apply once we have a full 3-letter code or an exact match (e.g. 2-letter GA).
    if (next.length === 3 || getLogoBrandByIcao(next)) {
      setActiveIcao(next);
      const url = new URL(window.location.href);
      url.searchParams.set('icao', next);
      window.history.replaceState(null, '', url);
    }
  }, []);

  const stepAirline = useCallback(
    (delta: number) => {
      const list = LOGO_BRAND_ICAO_LIST;
      if (list.length === 0) return;
      const current = list.indexOf(activeIcao);
      const start = current === -1 ? 0 : current;
      const next = (start + delta + list.length) % list.length;
      applyIcao(list[next]);
    },
    [activeIcao, applyIcao]
  );

  useEffect(() => {
    if (viewAll) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = (document.activeElement?.tagName ?? '').toUpperCase();
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      e.preventDefault();
      stepAirline(e.key === 'ArrowLeft' ? -1 : 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [viewAll, stepAirline]);

  const brand = getLogoBrandByIcao(activeIcao);

  return (
    <div className="theme-tester__inspector">
      <section className="admin-surface theme-tester__controls">
        <div className="theme-tester__control-row">
          <label className="block min-w-0 flex-1">
            <span className="admin-label mb-2 block">Brand (ICAO)</span>
            <div className="theme-tester__icao-row">
              <select
                value={activeIcao}
                onChange={(e) => applyIcao(e.target.value)}
                className="admin-select theme-tester__select"
              >
                <optgroup label="Airlines">
                  {AIRLINE_ICAO_LIST.map((code) => {
                    const item = getLogoBrandByIcao(code);
                    return (
                      <option key={code} value={code}>
                        {code} — {item?.name ?? 'Unknown'}
                      </option>
                    );
                  })}
                </optgroup>
                <optgroup label="Other traffic">
                  {CATEGORY_ICAO_LIST.map((code) => {
                    const item = getLogoBrandByIcao(code);
                    return (
                      <option key={code} value={code}>
                        {code} — {item?.name ?? 'Unknown'}
                      </option>
                    );
                  })}
                </optgroup>
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
            <span className="admin-label">View all brands</span>
            <span
              data-checked={viewAll ? 'true' : 'false'}
              className="admin-toggle__track relative h-5 w-9 shrink-0 rounded-full border border-white/10 bg-slate-800 transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-slate-300 after:transition-transform"
            />
          </button>
        </div>

        {brand && !viewAll && (
          <div className="theme-tester__brand-bar">
            <div className="theme-tester__brand-id">
              <button
                type="button"
                className="theme-tester__step"
                aria-label="Previous brand"
                title="Previous brand (←)"
                onClick={() => stepAirline(-1)}
              >
                ‹
              </button>
              <div>
                <p className="theme-tester__brand-name">{brand.name}</p>
                <p className="theme-tester__brand-codes admin-mono">
                  ICAO {brand.icao} · IATA {brand.iata}
                </p>
              </div>
              <button
                type="button"
                className="theme-tester__step"
                aria-label="Next brand"
                title="Next brand (→)"
                onClick={() => stepAirline(1)}
              >
                ›
              </button>
            </div>
            <div className="theme-tester__brand-meta">
              <span className="theme-tester__kbd-hint">
                <kbd>←</kbd> <kbd>→</kbd> to switch
              </span>
              <AirlineLogoSourceBadge icao={activeIcao} />
            </div>
          </div>
        )}
      </section>

      <div className="theme-tester__inspector-body">
        {viewAll ? (
          <AirlineLogoGallery variant="expanded" linkToTester />
        ) : (
          <AirlinePreviewPanel icao={activeIcao} />
        )}
      </div>
    </div>
  );
}
