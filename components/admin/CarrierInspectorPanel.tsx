'use client';

import { useCallback, useEffect, useMemo, useState, Fragment, type CSSProperties } from 'react';
import { useSearchParams } from 'next/navigation';
import AirlineLedLogoTile from '@/components/admin/AirlineLedLogoTile';
import AirlineLogoImage from '@/components/display/shared/AirlineLogoImage';
import { AirlineLogoSourceBadge } from '@/components/admin/AirlineLogoGallery';
import {
  AIRLINE_ICAO_LIST,
  CATEGORY_ICAO_LIST,
  LOGO_BRAND_ICAO_LIST,
  getLogoBrandByIcao,
  getAirlineTileStyle,
  type AirlineBrand,
} from '@/lib/airlines';
import { buildAirlineLedPreview } from '@/lib/airlineThemePreview';
import {
  analyzeLedLogoPalette,
  clearStoredLedLogoPalette,
  storeLedLogoPalette,
} from '@/lib/ledLogoPalette';
import { hasLedAirlineMark } from '@/lib/ledAirlineMarks';
import { useLogoCatalog, type LogoCatalogEntry } from '@/components/admin/LogoCatalogContext';
import LogoPasteZone from '@/components/admin/LogoPasteZone';
import { useWorkbenchPreviewScale } from '@/hooks/useMediaQuery';
import '@/components/display/layouts/airline-gallery.css';

function normalizeIcao(raw: string): string {
  return raw.trim().toUpperCase().slice(0, 3);
}

function palettesEqual(a: readonly string[], b: readonly string[]): boolean {
  return (
    a.length === b.length &&
    a.every((color, index) => color.toLowerCase() === b[index]?.toLowerCase())
  );
}

const SAMPLE_STATS = [
  ['Distance', '12.4', 'mi'],
  ['Altitude', '28,500', 'ft'],
] as const;

const LED_PREVIEW_BASE = 152;
const SOURCE_LOGO_BASE = 80;

function brandHeroStyle(brand: AirlineBrand): CSSProperties {
  return {
    ['--brand-primary' as string]: brand.primaryColor,
    ['--brand-accent' as string]: brand.accentColor,
    ['--brand-secondary' as string]: brand.secondaryColor ?? brand.accentColor,
  };
}

function LogoManagementSection({
  entry,
  busy,
  onApprove,
  onDelete,
}: {
  entry: LogoCatalogEntry | undefined;
  busy: boolean;
  onApprove: (file: string) => void;
  onDelete: (file: string) => void;
}) {
  if (!entry || entry.candidates.length === 0) return null;

  const approvedSource = entry.approved?.source;

  return (
    <div className="theme-tester__logo-manage">
      <div className="theme-tester__logo-candidates">
        <p className="logo-approve__sublabel">Candidates ({entry.candidates.length})</p>
        <ul className="logo-approve__thumbs">
          {entry.candidates.map((cand) => {
            const isApprovedSource = cand.file === approvedSource;
            return (
              <li key={cand.file} className="logo-approve__thumb">
                <div
                  className="logo-approve__thumb-box"
                  data-current={isApprovedSource ? 'true' : 'false'}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img key={cand.url} src={cand.url} alt={cand.file} />
                  <button
                    type="button"
                    className="logo-approve__thumb-del"
                    title="Delete candidate"
                    aria-label={`Delete ${cand.file}`}
                    onClick={() => onDelete(cand.file)}
                    disabled={busy}
                  >
                    ×
                  </button>
                </div>
                <button
                  type="button"
                  className="admin-btn logo-approve__btn-sm"
                  onClick={() => onApprove(cand.file)}
                  disabled={busy || isApprovedSource}
                >
                  {isApprovedSource ? 'Current' : 'Approve'}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function SourceAssetsPanel({
  brand,
  logoUrl,
  catalogEntry,
  approvalBusy,
  onPaste,
  onApprove,
  onDelete,
  onRemove,
  pasteBusy,
  sourceLogoPx,
}: {
  brand: AirlineBrand;
  logoUrl?: string;
  catalogEntry?: LogoCatalogEntry;
  approvalBusy: boolean;
  onPaste: (dataUrl: string) => Promise<void>;
  onApprove: (file: string) => void;
  onDelete: (file: string) => void;
  onRemove: () => void;
  pasteBusy: boolean;
  sourceLogoPx: number;
}) {
  const useNative = hasLedAirlineMark(brand.icao);
  const hasApproved = Boolean(catalogEntry?.approved);
  const hasSource = useNative || hasApproved || Boolean(logoUrl);
  const sourceLabel = sourceLabelFor(brand);
  const busy = pasteBusy || approvalBusy;

  return (
    <div className="theme-tester__source-panel">
      <div className="theme-tester__source-stack">
        {hasSource ? (
          <figure className="theme-tester__figure theme-tester__figure--solo">
            <div className="theme-tester__source-box theme-tester__source-box--light">
              <AirlineLogoImage
                brand={brand}
                size={128}
                background="#ffffff"
                alt={`${brand.name} approved logo`}
                width={sourceLogoPx}
                height={sourceLogoPx}
                fillMark={useNative}
                logoUrl={logoUrl}
              />
            </div>
            <figcaption>
              <span className="theme-tester__figure-label">{sourceLabel}</span>
            </figcaption>
          </figure>
        ) : (
          <div className="theme-tester__source-empty-state">
            <span className="theme-tester__source-empty-icon" aria-hidden>
              ⌘V
            </span>
            <p className="theme-tester__hint theme-tester__source-empty">No logo yet</p>
          </div>
        )}

        <LogoPasteZone
          busy={busy}
          onImage={onPaste}
          title={hasApproved ? 'Paste to replace logo' : 'Paste logo screenshot'}
          className="logo-approve__paste theme-tester__paste theme-tester__source-drop"
        />

        {hasApproved && (
          <button
            type="button"
            className="admin-btn admin-btn--ghost logo-approve__btn-sm theme-tester__remove-logo"
            onClick={onRemove}
            disabled={busy}
          >
            Remove logo
          </button>
        )}
      </div>

      {useNative && (
        <p className="theme-tester__hint theme-tester__source-native-note">
          LED tile uses built-in pixel art for this carrier; paste updates the approved gallery asset.
        </p>
      )}

      <LogoManagementSection
        entry={catalogEntry}
        busy={busy}
        onApprove={onApprove}
        onDelete={onDelete}
      />
    </div>
  );
}

function sourceLabelFor(brand: AirlineBrand): string {
  return hasLedAirlineMark(brand.icao) ? 'Native mark' : 'Approved PNG';
}

function PaletteRow({
  colors,
  horizontal = false,
}: {
  colors: readonly string[];
  horizontal?: boolean;
}) {
  return (
    <ul
      className={`theme-tester__palette-list${horizontal ? ' theme-tester__palette-list--horizontal' : ''}`}
    >
      {colors.map((color) => (
        <li key={color} className="theme-tester__palette-item">
          <span className="theme-tester__palette-chip" style={{ background: color }} title={color} />
          {!horizontal && (
            <span className="theme-tester__palette-hex admin-mono">{color}</span>
          )}
        </li>
      ))}
    </ul>
  );
}

function GalleryCardPreview({
  brand,
  logoUrl,
  compact = false,
}: {
  brand: AirlineBrand;
  logoUrl?: string;
  compact?: boolean;
}) {
  const tile = getAirlineTileStyle(brand);
  const flightId = `${brand.iata} 142`;

  return (
    <div className={`theme-tester__gallery-stage${compact ? ' theme-tester__gallery-stage--compact' : ''}`}>
      <article
        className={`gallery-card theme-tester__gallery-card-full${compact ? ' theme-tester__gallery-card--compact' : ''}`}
        style={{ ['--tile-accent' as string]: tile.borderColor }}
      >
        <div className="gallery-card__stripe" aria-hidden />
        <div className="gallery-card__body">
          <div className={`gallery-card__top ${compact ? 'px-3 py-2' : ''}`}>
            <div className="gallery-card__logo relative">
              <AirlineLogoImage
                brand={brand}
                size={128}
                background="transparent"
                alt={brand.name}
                fill
                className="object-contain p-1.5"
                logoUrl={logoUrl}
              />
            </div>
            <div className="gallery-card__identity">
              <p className={`gallery-card__callsign truncate ${compact ? 'text-base' : ''}`}>{flightId}</p>
              <p className="gallery-card__airline truncate">{brand.name}</p>
              {!compact && (
                <p className="gallery-card__codes font-mono">
                  {brand.icao} · {brand.iata}
                </p>
              )}
            </div>
          </div>

          <div className={`gallery-card__metrics ${compact ? 'mx-3' : ''}`}>
            {SAMPLE_STATS.map(([label, main, unit], i) => (
              <Fragment key={label}>
                {i > 0 && <div className="gallery-metric-divider" aria-hidden />}
                <div className={`gallery-metric ${compact ? 'py-2 px-1' : ''}`}>
                  <span className="gallery-metric__label">{label}</span>
                  <span className={`gallery-metric__value ${compact ? 'text-base' : ''}`}>
                    {main}
                    <span className="gallery-metric__unit">{unit}</span>
                  </span>
                </div>
              </Fragment>
            ))}
          </div>

          <div className={`gallery-card__footer ${compact ? 'px-3 py-2' : ''}`}>
            <span className="gallery-badge">Climbing</span>
            <span className="gallery-card__source">Sample flight</span>
          </div>
        </div>
      </article>
    </div>
  );
}

function AirlinePreviewPanel({
  icao,
  logoUrl,
  catalogEntry,
  approvalBusy,
  onPaste,
  onApprove,
  onDelete,
  onRemove,
  pasteBusy,
  pasteError,
}: {
  icao: string;
  logoUrl?: string;
  catalogEntry?: LogoCatalogEntry;
  approvalBusy: boolean;
  onPaste: (dataUrl: string) => Promise<void>;
  onApprove: (file: string) => void;
  onDelete: (file: string) => void;
  onRemove: () => void;
  pasteBusy: boolean;
  pasteError: string | null;
}) {
  const previewScale = useWorkbenchPreviewScale();
  const ledPreviewPx = Math.round(LED_PREVIEW_BASE * previewScale);
  const sourceLogoPx = Math.round(SOURCE_LOGO_BASE * previewScale);
  const brand = getLogoBrandByIcao(icao);
  const [paletteRevision, setPaletteRevision] = useState(0);
  const [draftPalette, setDraftPalette] = useState<string[] | null>(null);
  const [analyzingPalette, setAnalyzingPalette] = useState(false);

  useEffect(() => {
    setDraftPalette(null);
  }, [icao, logoUrl]);

  const ledContent = useMemo(() => {
    return buildAirlineLedPreview(icao, { logoUrl });
  }, [icao, logoUrl, paletteRevision]);

  const appliedPalette = ledContent?.logoPalette ?? [];

  const reanalyzePalette = useCallback(async () => {
    if (!logoUrl || !ledContent) return;
    setAnalyzingPalette(true);
    try {
      const detected = await analyzeLedLogoPalette(logoUrl, ledContent.logoBackground);
      setDraftPalette(detected.length > 0 ? detected : null);
    } finally {
      setAnalyzingPalette(false);
    }
  }, [logoUrl, ledContent]);

  const rescanLedWall = useCallback(async () => {
    if (!logoUrl || !ledContent) return;
    setAnalyzingPalette(true);
    try {
      const detected = await analyzeLedLogoPalette(logoUrl, ledContent.logoBackground);
      if (detected.length > 0) {
        storeLedLogoPalette(icao, detected);
      }
      setDraftPalette(null);
      setPaletteRevision((n) => n + 1);
    } finally {
      setAnalyzingPalette(false);
    }
  }, [icao, logoUrl, ledContent]);

  const applyDraftPalette = useCallback(() => {
    if (!draftPalette?.length) return;
    storeLedLogoPalette(icao, draftPalette);
    setDraftPalette(null);
    setPaletteRevision((n) => n + 1);
  }, [draftPalette, icao]);

  if (!brand || !ledContent) {
    return (
      <div className="theme-tester__empty">
        <p>Unknown brand code: <span className="admin-mono">{icao}</span></p>
        <p className="theme-tester__hint">
          Use a code from the registry — an airline (e.g. SWA, DAL) or a category
          (MIL, PVT).
        </p>
      </div>
    );
  }

  const wallStyle = ledContent;

  const hasApprovedLogo = Boolean(logoUrl);
  const hasDraft = draftPalette != null && draftPalette.length > 0;
  const draftDiffersFromApplied =
    hasDraft && !palettesEqual(draftPalette, appliedPalette);

  return (
    <div className="theme-tester__workbench">
      <div className="theme-tester__workbench-col theme-tester__workbench-col--source">
        <header className="theme-tester__workbench-head">
          <h3 className="theme-tester__workbench-title">Source</h3>
          <AirlineLogoSourceBadge icao={brand.icao} compact />
        </header>
        <SourceAssetsPanel
          brand={brand}
          logoUrl={logoUrl}
          catalogEntry={catalogEntry}
          approvalBusy={approvalBusy}
          onPaste={onPaste}
          onApprove={onApprove}
          onDelete={onDelete}
          onRemove={onRemove}
          pasteBusy={pasteBusy}
          sourceLogoPx={sourceLogoPx}
        />
        {pasteError && <p className="theme-tester__paste-error">{pasteError}</p>}
      </div>

      <div className="theme-tester__workbench-col theme-tester__workbench-col--led">
        <header className="theme-tester__workbench-head">
          <h3 className="theme-tester__workbench-title">FlightWall LED</h3>
          <div className="theme-tester__workbench-head-actions">
            {hasApprovedLogo && (
              <>
                <button
                  type="button"
                  className="admin-btn admin-btn--ghost admin-btn--compact"
                  disabled={analyzingPalette}
                  onClick={() => void reanalyzePalette()}
                >
                  {analyzingPalette ? 'Analyzing…' : 'Preview colors'}
                </button>
                <button
                  type="button"
                  className="admin-btn admin-btn--primary admin-btn--compact"
                  disabled={analyzingPalette}
                  onClick={() => void rescanLedWall()}
                >
                  {analyzingPalette ? 'Analyzing…' : 'Rescan LED wall'}
                </button>
                {draftDiffersFromApplied && (
                  <button
                    type="button"
                    className="admin-btn admin-btn--ghost admin-btn--compact"
                    onClick={applyDraftPalette}
                  >
                    Apply preview
                  </button>
                )}
              </>
            )}
            <span className="theme-tester__workbench-meta admin-mono">48×48 @ 8×</span>
          </div>
        </header>
        <div className="theme-tester__led-stage theme-tester__led-stage--compact">
          <div className="theme-tester__led-bezel">
            <AirlineLedLogoTile
              content={wallStyle}
              displaySize={ledPreviewPx}
              label={`${brand.name} LED tile`}
              className="theme-tester__led-canvas"
            />
          </div>
          <div className="theme-tester__led-meta theme-tester__led-meta--compact">
            <div className="theme-tester__meta-chip">
              <span className="theme-tester__meta-label">Tile</span>
              <span
                className="theme-tester__swatch"
                style={{ background: wallStyle.logoBackground }}
                title={wallStyle.logoBackground}
              />
              <span className="admin-mono theme-tester__meta-hex">{wallStyle.logoBackground}</span>
            </div>
            {appliedPalette.length > 0 && (
              <div className="theme-tester__meta-chip">
                <span className="theme-tester__meta-label">On LED</span>
                <PaletteRow colors={appliedPalette} horizontal />
              </div>
            )}
            {draftDiffersFromApplied && (
              <div className="theme-tester__meta-chip theme-tester__meta-chip--draft">
                <span className="theme-tester__meta-label">Detected</span>
                <PaletteRow colors={draftPalette!} horizontal />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="theme-tester__workbench-col theme-tester__workbench-col--gallery">
        <header className="theme-tester__workbench-head">
          <h3 className="theme-tester__workbench-title">Gallery</h3>
        </header>
        <GalleryCardPreview brand={brand} logoUrl={logoUrl} compact />
      </div>
    </div>
  );
}

export default function CarrierInspectorPanel() {
  const { catalog, getApprovedUrl, refresh, uploadPaste, removeLogo } = useLogoCatalog();
  const searchParams = useSearchParams();
  const initialIcao = normalizeIcao(searchParams.get('icao') ?? 'SWA');
  const [icaoInput, setIcaoInput] = useState(initialIcao);
  const [activeIcao, setActiveIcao] = useState(
    getLogoBrandByIcao(initialIcao) ? initialIcao : 'SWA'
  );
  const [pasteBusy, setPasteBusy] = useState(false);
  const [approvalBusy, setApprovalBusy] = useState(false);
  const [pasteError, setPasteError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const approvedCount = catalog.filter((entry) => entry.approved).length;
  const activeEntry = catalog.find((entry) => entry.icao === activeIcao);

  useEffect(() => {
    setPasteError(null);
  }, [activeIcao]);

  useEffect(() => {
    const param = searchParams.get('icao');
    if (!param) return;
    const next = normalizeIcao(param);
    if (!getLogoBrandByIcao(next)) return;
    setActiveIcao(next);
    setIcaoInput(next);
  }, [searchParams]);

  const approvedLogoUrl = getApprovedUrl(activeIcao);

  const refreshCatalog = useCallback(async () => {
    try {
      await refresh();
      setActionError(null);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to refresh catalog');
    }
  }, [refresh]);

  const runAction = useCallback(
    async (icao: string, body: Record<string, unknown>) => {
      setApprovalBusy(true);
      setActionError(null);
      try {
        const res = await fetch('/api/airline-logos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ icao, ...body }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error ?? `Request failed (${res.status})`);
        await refreshCatalog();
      } catch (err) {
        setActionError(err instanceof Error ? err.message : 'Action failed');
      } finally {
        setApprovalBusy(false);
      }
    },
    [refreshCatalog]
  );

  const handlePaste = useCallback(
    async (dataUrl: string) => {
      setPasteBusy(true);
      setPasteError(null);
      try {
        clearStoredLedLogoPalette(activeIcao);
        await uploadPaste(activeIcao, dataUrl);
      } catch (err) {
        setPasteError(err instanceof Error ? err.message : 'Paste failed');
      } finally {
        setPasteBusy(false);
      }
    },
    [activeIcao, uploadPaste]
  );

  const handleRemoveLogo = useCallback(async () => {
    setApprovalBusy(true);
    setActionError(null);
    setPasteError(null);
    try {
      clearStoredLedLogoPalette(activeIcao);
      await removeLogo(activeIcao);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Remove failed');
    } finally {
      setApprovalBusy(false);
    }
  }, [activeIcao, removeLogo]);

  const applyIcao = useCallback((raw: string) => {
    const next = normalizeIcao(raw);
    setIcaoInput(next);
    // Apply once we have a full 3-letter code or an exact match (e.g. 2-letter CG).
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
    const onKey = (e: KeyboardEvent) => {
      if (!e.shiftKey) return;
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = (document.activeElement?.tagName ?? '').toUpperCase();
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      e.preventDefault();
      stepAirline(e.key === 'ArrowLeft' ? -1 : 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [stepAirline]);

  const brand = getLogoBrandByIcao(activeIcao);
  const brandStyle = brand ? brandHeroStyle(brand) : undefined;

  return (
    <div className="theme-tester__inspector">
      <div className="theme-tester__inspector-body">
        <div className="theme-tester__stage" style={brandStyle}>
          <header className="theme-tester__stage-nav">
            <div className="theme-tester__toolbar-nav">
              <button
                type="button"
                className="theme-tester__step"
                aria-label="Previous brand"
                title="Previous brand (Shift+←)"
                onClick={() => stepAirline(-1)}
              >
                ‹
              </button>
              <button
                type="button"
                className="theme-tester__step"
                aria-label="Next brand"
                title="Next brand (Shift+→)"
                onClick={() => stepAirline(1)}
              >
                ›
              </button>
            </div>

            <select
              value={activeIcao}
              onChange={(e) => applyIcao(e.target.value)}
              className="admin-select theme-tester__select theme-tester__select--toolbar"
              aria-label="Brand ICAO"
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

            {brand && (
              <div className="theme-tester__brand-chip">
                <span
                  className="theme-tester__brand-chip-swatch"
                  style={{ background: brand.primaryColor }}
                  aria-hidden
                />
                <span className="theme-tester__brand-chip-name">{brand.name}</span>
                <span className="theme-tester__brand-chip-code admin-mono">{brand.icao}</span>
              </div>
            )}

            <span className="logo-approve__progress admin-mono theme-tester__progress">
              {approvedCount}/{catalog.length || '—'}
            </span>
          </header>

          {actionError && <div className="logo-approve__error theme-tester__stage-error">{actionError}</div>}

          <AirlinePreviewPanel
            icao={activeIcao}
            logoUrl={approvedLogoUrl}
            catalogEntry={activeEntry}
            approvalBusy={approvalBusy}
            onPaste={handlePaste}
            onApprove={(file) => runAction(activeIcao, { action: 'approve', file })}
            onDelete={(file) => runAction(activeIcao, { action: 'delete', file })}
            onRemove={() => void handleRemoveLogo()}
            pasteBusy={pasteBusy}
            pasteError={pasteError}
          />
        </div>
      </div>
    </div>
  );
}
