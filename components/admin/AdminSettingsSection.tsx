'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAdminSettings } from '@/components/admin/AdminSettingsProvider';
import WatchFlightPanel from '@/components/admin/WatchFlightPanel';
import FlightMap from '@/components/display/maps/FlightMap';
import { getTheme, getThemeSwatches, LAYOUT_LABELS, THEME_LIST } from '@/lib/themes';
import { clampDimLevel, saveSettings, type DisplayMode, type ThemeId } from '@/lib/settings';
import { buildTrackTarget } from '@/lib/callsignMatch';

export type AdminSettingsSection = 'themes' | 'settings' | 'watch';

const MODE_LABELS: Record<DisplayMode, string> = {
  nearby: 'All nearby',
  'den-arrivals': 'Arrivals',
  'den-departures': 'Departures',
  takeoffs: 'Takeoffs',
  overflights: 'Overflights',
};

const MODE_OPTIONS = (Object.keys(MODE_LABELS) as DisplayMode[]).map((value) => ({
  value,
  label: MODE_LABELS[value],
}));

const SECTION_COPY: Record<AdminSettingsSection, { panelTitle: string }> = {
  themes: { panelTitle: 'Display preset' },
  settings: { panelTitle: 'Settings' },
  watch: { panelTitle: 'Watch a flight' },
};

function buildOldIpadDisplayPath(
  keepAwake: boolean,
  nightDimEnabled: boolean,
  nightDimStart: string,
  nightDimEnd: string,
  nightDimLevel: number
): string {
  const params = new URLSearchParams({
    awake: keepAwake ? '1' : '0',
    dim: nightDimEnabled ? '1' : '0',
    dimStart: nightDimStart,
    dimEnd: nightDimEnd,
    dimLevel: String(nightDimLevel),
  });
  return `/old-ipad-display?${params.toString()}`;
}

function OldIpadDisplayUrlCopy({
  keepAwake,
  nightDimEnabled,
  nightDimStart,
  nightDimEnd,
  nightDimLevel,
}: {
  keepAwake: boolean;
  nightDimEnabled: boolean;
  nightDimStart: string;
  nightDimEnd: string;
  nightDimLevel: number;
}) {
  const path = useMemo(
    () =>
      buildOldIpadDisplayPath(
        keepAwake,
        nightDimEnabled,
        nightDimStart,
        nightDimEnd,
        nightDimLevel
      ),
    [keepAwake, nightDimEnabled, nightDimStart, nightDimEnd, nightDimLevel]
  );
  const [fullUrl, setFullUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setFullUrl(`${window.location.origin}${path}`);
  }, [path]);

  const copyUrl = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked — user can still select the URL below */
    }
  }, [fullUrl]);

  return (
    <div className="admin-url-copy">
      <code className="admin-url-copy__text admin-mono">{fullUrl || path}</code>
      <button
        type="button"
        className="admin-btn admin-btn--ghost admin-btn--compact admin-url-copy__btn"
        onClick={() => void copyUrl()}
        disabled={!fullUrl}
        aria-label="Copy iPad display URL"
      >
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  );
}

type Option<T extends string | number> = { value: T; label: string };

function SelectField<T extends string | number>({
  label,
  value,
  options,
  onChange,
  compact = false,
}: {
  label: string;
  value: T;
  options: Option<T>[];
  onChange: (v: T) => void;
  compact?: boolean;
}) {
  return (
    <label className="block min-w-0">
      <span className={`admin-label block ${compact ? 'mb-1' : 'mb-2'}`}>{label}</span>
      <select
        value={String(value)}
        onChange={(e) => {
          const raw = e.target.value;
          const match = options.find((o) => String(o.value) === raw);
          if (match) onChange(match.value);
        }}
        className={`admin-select ${compact ? 'admin-select--compact' : ''}`}
      >
        {options.map((o) => (
          <option key={String(o.value)} value={String(o.value)}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function ThemeChip({
  id,
  name,
  selected,
  onSelect,
  variant = 'grid',
}: {
  id: ThemeId;
  name: string;
  selected: boolean;
  onSelect: () => void;
  variant?: 'grid' | 'sidebar';
}) {
  const theme = getTheme(id);
  const swatches = getThemeSwatches(theme);

  return (
    <button
      type="button"
      onClick={onSelect}
      data-selected={selected}
      title={`${name} — ${theme.description}`}
      className={`admin-theme-module ${variant === 'sidebar' ? 'admin-theme-module--sidebar' : ''}`}
    >
      <div className="admin-theme-module__swatches">
        {swatches.map((color, index) => (
          <span key={index} style={{ backgroundColor: color }} />
        ))}
      </div>
      <div className="admin-theme-module__body">
        <span className="admin-theme-module__name">{name}</span>
        {variant === 'sidebar' && (
          <span className="admin-theme-module__desc">{theme.description}</span>
        )}
      </div>
      {selected && (
        <span className="admin-theme-module__mark admin-mono" aria-hidden>
          Selected
        </span>
      )}
    </button>
  );
}

function ThemePreviewPanel({
  themeId,
  watchAirline = '',
  watchFlightNumber = '',
}: {
  themeId: ThemeId;
  watchAirline?: string;
  watchFlightNumber?: string;
}) {
  const theme = getTheme(themeId);
  const trackTarget = buildTrackTarget(watchAirline, watchFlightNumber);
  const previewSrc = useMemo(() => {
    const params = new URLSearchParams({ embed: '1', theme: themeId });
    if (trackTarget) {
      params.set('airline', watchAirline.trim());
      params.set('flight', watchFlightNumber.trim());
    }
    return `/display?${params.toString()}`;
  }, [themeId, trackTarget, watchAirline, watchFlightNumber]);

  return (
    <>
      <div className="admin-theme-preview-meta">
        <p className="admin-theme-preview-meta__name">{theme.name}</p>
        {trackTarget ? (
          <p className="admin-theme-preview-meta__desc">
            Watch mode · {trackTarget.displayLabel}
          </p>
        ) : (
          <p className="admin-theme-preview-meta__desc">{theme.description}</p>
        )}
        <p className="admin-theme-preview-meta__layout admin-mono">
          {LAYOUT_LABELS[theme.layout]}
        </p>
      </div>
      <div className="admin-theme-preview">
        <iframe
          key={previewSrc}
          title={`${theme.name} preview`}
          src={previewSrc}
          className="admin-theme-preview__frame"
        />
      </div>
    </>
  );
}

function Toggle({
  checked,
  onChange,
  label,
  hint,
  compact = false,
  inline = false,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  hint?: string;
  compact?: boolean;
  inline?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`admin-toggle flex cursor-pointer items-center gap-2.5 text-left ${
        inline ? 'w-auto' : 'w-full'
      } ${compact ? 'min-h-[2rem] px-2.5 py-1.5' : 'min-h-[2.5rem] px-3 py-2'}`}
    >
      <span
        data-checked={checked ? 'true' : 'false'}
        className="admin-toggle__track relative h-5 w-9 shrink-0 rounded-full transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:transition-transform"
      />
      <div className="min-w-0">
        <span className={`block text-[var(--text)] ${compact ? 'text-xs' : 'text-sm'}`}>{label}</span>
        {hint && !compact && <p className="text-[11px] text-[var(--muted)]">{hint}</p>}
      </div>
    </button>
  );
}

function Panel({
  title,
  headerAction,
  children,
  className = '',
}: {
  title: string;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`admin-panel-card admin-page-card ${className}`}>
      <div className="admin-panel-card__title-row">
        <h2 className="admin-panel-card__title">{title}</h2>
        {headerAction}
      </div>
      {children}
    </section>
  );
}

function SettingsGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="admin-settings-group">
      <h3 className="admin-settings-group__title">{title}</h3>
      {children}
    </section>
  );
}

export default function AdminSettingsSection({ section }: { section: AdminSettingsSection }) {
  const {
    settings,
    zipInput,
    setZipInput,
    zipError,
    zipLoading,
    update,
    updateAndSave,
    handleZipLookup,
  } = useAdminSettings();

  const copy = SECTION_COPY[section];

  return (
    <div className="admin-page">
      <div className="admin-page__content">
        {section === 'themes' && (
          <div className="admin-page__split admin-page__split--themes">
            <Panel title={copy.panelTitle} className="admin-panel-card--fill">
              <div className="admin-theme-matrix admin-theme-matrix--sidebar">
                {THEME_LIST.map((t) => (
                  <ThemeChip
                    key={t.id}
                    id={t.id}
                    name={t.name}
                    selected={settings.theme === t.id}
                    onSelect={() => update('theme', t.id)}
                    variant="sidebar"
                  />
                ))}
              </div>
            </Panel>

            <Panel title="Preview" className="admin-panel-card--fill">
              <ThemePreviewPanel
                themeId={settings.theme}
                watchAirline={settings.trackAirline}
                watchFlightNumber={settings.trackFlightNumber}
              />
            </Panel>
          </div>
        )}

        {section === 'watch' && (
          <div className="admin-page__split admin-page__split--watch">
            <Panel
              title={copy.panelTitle}
              className="admin-panel-card--fill admin-panel-card--scrollable"
            >
              <WatchFlightPanel />
            </Panel>

            <Panel title="Preview" className="admin-panel-card--fill">
              <SelectField
                label="Theme"
                value={settings.theme}
                options={THEME_LIST.map((t) => ({ value: t.id, label: t.name }))}
                onChange={(v) => update('theme', v)}
                compact
              />
              <ThemePreviewPanel
                themeId={settings.theme}
                watchAirline={settings.trackAirline}
                watchFlightNumber={settings.trackFlightNumber}
              />
            </Panel>
          </div>
        )}

        {section === 'settings' && (
          <Panel title={copy.panelTitle} className="admin-panel-card--fill admin-panel-card--scrollable">
            <SettingsGroup title="Location">
            <div className="admin-zip-row">
              <label className="min-w-0 flex-1">
                <span className="admin-label mb-1 block">ZIP code</span>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={5}
                  value={zipInput}
                  onChange={(e) => {
                    setZipInput(e.target.value.replace(/\D/g, '').slice(0, 5));
                  }}
                  placeholder="80219"
                  className="admin-input admin-input--compact admin-mono tracking-widest"
                />
              </label>
              <button
                type="button"
                onClick={() => void handleZipLookup()}
                disabled={zipLoading || zipInput.length !== 5}
                className="admin-btn-ghost admin-btn--compact mt-5 rounded-lg px-3 py-1.5 text-xs font-medium disabled:opacity-40"
              >
                {zipLoading ? '…' : 'Resolve'}
              </button>
            </div>

            {zipError && <p className="admin-page__error">{zipError}</p>}

            <div className="admin-corridor-preview admin-corridor-preview--page">
              <FlightMap
                centerLat={settings.lat}
                centerLon={settings.lon}
                radiusMi={settings.radiusMi}
                aircraft={[]}
                locationLabel={settings.locationLabel}
                skyMapZoom={settings.skyMapZoom}
              />
            </div>

            <div className="admin-location-summary">
              <p className="truncate text-sm font-medium">{settings.locationLabel}</p>
              <p className="admin-mono truncate text-[11px] text-[var(--muted)]">
                {settings.lat.toFixed(4)}°N · {Math.abs(settings.lon).toFixed(4)}°W ·{' '}
                {settings.radiusMi} mi · {settings.refreshIntervalSec}s
              </p>
            </div>
            </SettingsGroup>

            <SettingsGroup title="Traffic">
            <div className="admin-field-grid admin-field-grid--page">
              <SelectField
                compact
                label="Refresh"
                value={settings.refreshIntervalSec}
                options={[
                  { value: 30, label: '30s' },
                  { value: 60, label: '60s' },
                  { value: 90, label: '90s' },
                ]}
                onChange={(v) => updateAndSave('refreshIntervalSec', v)}
              />
              <SelectField
                compact
                label="Radius"
                value={settings.radiusMi}
                options={[
                  { value: 5, label: '5 mi' },
                  { value: 10, label: '10 mi' },
                  { value: 25, label: '25 mi' },
                  { value: 50, label: '50 mi' },
                ]}
                onChange={(v) => updateAndSave('radiusMi', v)}
              />
              <SelectField
                compact
                label="Aircraft"
                value={settings.maxAircraft}
                options={[
                  { value: 8, label: '8 max' },
                  { value: 12, label: '12 max' },
                  { value: 20, label: '20 max' },
                ]}
                onChange={(v) => updateAndSave('maxAircraft', v)}
              />
              <SelectField
                compact
                label="Altitude"
                value={settings.altitudeFilter}
                options={[
                  { value: 'all', label: 'All' },
                  { value: 'below10k', label: 'Below 10k' },
                  { value: '10k-25k', label: '10k–25k' },
                  { value: 'above25k', label: 'Above 25k' },
                ]}
                onChange={(v) => updateAndSave('altitudeFilter', v)}
              />
              <SelectField
                compact
                label="Traffic"
                value={settings.mode}
                options={MODE_OPTIONS}
                onChange={(v) => updateAndSave('mode', v)}
              />
              <SelectField
                compact
                label="Map zoom"
                value={settings.skyMapZoom}
                options={[
                  { value: 'normal', label: 'Normal' },
                  { value: 'close', label: 'Close' },
                ]}
                onChange={(v) => updateAndSave('skyMapZoom', v)}
              />
            </div>

            <Toggle
              compact
              checked={settings.hideNoCallsign}
              onChange={(v) => updateAndSave('hideNoCallsign', v)}
              label="Hide unidentified aircraft"
            />

            <Toggle
              compact
              checked={settings.cargoOnly}
              onChange={(v) => updateAndSave('cargoOnly', v)}
              label="Cargo flights only"
              hint="FedEx, UPS, Atlas, DHL and other freight operators"
            />
            </SettingsGroup>

            <SettingsGroup title="Screen">
            <Toggle
              compact
              checked={settings.keepAwake}
              onChange={(v) => updateAndSave('keepAwake', v)}
              label="Keep screen awake"
              hint="Wake lock for the modern (React) display only — iOS 16.4+"
            />

            <p className="admin-surface__hint">
              Legacy iPad (iOS 10): tap the display once to start keep-awake, or set Auto-Lock to Never.
            </p>

            <Toggle
              compact
              checked={settings.nightDimEnabled}
              onChange={(v) => updateAndSave('nightDimEnabled', v)}
              label="Dim screen at night"
              hint="Darken the display during the hours below"
            />

            <div className="admin-field-grid admin-field-grid--page">
              <label className="block min-w-0">
                <span className="admin-label mb-1 block">Dim from</span>
                <input
                  type="time"
                  value={settings.nightDimStart}
                  onChange={(e) => updateAndSave('nightDimStart', e.target.value)}
                  disabled={!settings.nightDimEnabled}
                  className="admin-input admin-input--compact admin-mono"
                />
              </label>
              <label className="block min-w-0">
                <span className="admin-label mb-1 block">Dim until</span>
                <input
                  type="time"
                  value={settings.nightDimEnd}
                  onChange={(e) => updateAndSave('nightDimEnd', e.target.value)}
                  disabled={!settings.nightDimEnabled}
                  className="admin-input admin-input--compact admin-mono"
                />
              </label>
            </div>

            <label className="block min-w-0">
              <span className="admin-label mb-1 block">
                Dim level — {settings.nightDimLevel}%
              </span>
              <input
                type="range"
                min={0}
                max={95}
                step={5}
                value={settings.nightDimLevel}
                onChange={(e) => update('nightDimLevel', clampDimLevel(Number(e.target.value)))}
                onPointerUp={() => updateAndSave('nightDimLevel', settings.nightDimLevel)}
                disabled={!settings.nightDimEnabled}
                className="admin-range w-full"
              />
            </label>

            <p className="admin-surface__hint">
              Copy the URL below and open it once on the legacy iPad to apply dim settings there.
            </p>

            <OldIpadDisplayUrlCopy
              keepAwake={settings.keepAwake}
              nightDimEnabled={settings.nightDimEnabled}
              nightDimStart={settings.nightDimStart}
              nightDimEnd={settings.nightDimEnd}
              nightDimLevel={settings.nightDimLevel}
            />
            </SettingsGroup>

          </Panel>
        )}
      </div>
    </div>
  );
}
