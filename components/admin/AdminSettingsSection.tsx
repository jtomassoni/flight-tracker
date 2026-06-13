'use client';

import { useAdminSettings } from '@/components/admin/AdminSettingsProvider';
import FlightMap from '@/components/display/maps/FlightMap';
import { THEME_ROTATION_SEC } from '@/lib/constants';
import { getTheme, getThemeSwatches, THEME_LIST } from '@/lib/themes';
import { clampDimLevel, type DisplayMode, type ThemeId } from '@/lib/settings';

export type AdminSettingsSection = 'themes' | 'location' | 'filters' | 'screen';

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
  location: { panelTitle: 'Corridor' },
  filters: { panelTitle: 'Radar & traffic' },
  screen: { panelTitle: 'Screen & power' },
};

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
  rotating,
  onSelect,
}: {
  id: ThemeId;
  name: string;
  selected: boolean;
  rotating: boolean;
  onSelect: () => void;
}) {
  const theme = getTheme(id);
  const swatches = getThemeSwatches(theme);

  return (
    <button
      type="button"
      onClick={onSelect}
      data-selected={selected}
      title={`${name} — ${theme.description}`}
      className="admin-theme-module"
    >
      <div className="admin-theme-module__swatches">
        {swatches.map((color, index) => (
          <span key={index} style={{ backgroundColor: color }} />
        ))}
      </div>
      <span className="admin-theme-module__name">{name}</span>
      {selected && (
        <span className="admin-theme-module__mark admin-mono" aria-hidden>
          {rotating ? '↻ LIVE' : '● ARM'}
        </span>
      )}
    </button>
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
      className={`admin-toggle flex cursor-pointer items-center gap-3 rounded-lg border border-white/5 bg-black/20 text-left ${
        inline ? 'w-auto' : 'w-full'
      } ${compact ? 'min-h-[36px] px-3 py-2' : 'min-h-[44px] px-4 py-3'}`}
    >
      <span
        data-checked={checked ? 'true' : 'false'}
        className="admin-toggle__track relative h-5 w-9 shrink-0 rounded-full border border-white/10 bg-slate-800 transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-slate-300 after:transition-transform"
      />
      <div className="min-w-0">
        <span className={`block text-slate-200 ${compact ? 'text-xs' : 'text-sm'}`}>{label}</span>
        {hint && !compact && <p className="text-[10px] text-slate-500">{hint}</p>}
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

const isDev = process.env.NODE_ENV === 'development';

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
          <Panel
            title={copy.panelTitle}
            headerAction={
              <Toggle
                compact
                inline
                checked={settings.rotateThemes}
                onChange={(v) => updateAndSave('rotateThemes', v)}
                label={`Auto-rotate ${THEME_ROTATION_SEC}s`}
              />
            }
          >
            <div className="admin-theme-matrix">
              {THEME_LIST.map((t) => (
                <ThemeChip
                  key={t.id}
                  id={t.id}
                  name={t.name}
                  selected={settings.theme === t.id}
                  rotating={settings.rotateThemes}
                  onSelect={() => update('theme', t.id)}
                />
              ))}
            </div>
          </Panel>
        )}

        {section === 'location' && (
          <Panel title={copy.panelTitle} className="admin-page-card--fill admin-panel-card--fill">
            <div className="admin-zip-row">
              <label className="min-w-0 flex-1">
                <span className="admin-label mb-1 block">ZIP Code</span>
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
              <p className="truncate text-sm font-medium text-slate-200">{settings.locationLabel}</p>
              <p className="admin-mono truncate text-[10px] text-slate-500">
                {settings.lat.toFixed(4)}°N · {Math.abs(settings.lon).toFixed(4)}°W ·{' '}
                {settings.radiusMi} mi · {settings.refreshIntervalSec}s
              </p>
            </div>
          </Panel>
        )}

        {section === 'filters' && (
          <Panel title={copy.panelTitle}>
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
                onChange={(v) => update('refreshIntervalSec', v)}
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
                onChange={(v) => update('radiusMi', v)}
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
                onChange={(v) => update('maxAircraft', v)}
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
                onChange={(v) => update('altitudeFilter', v)}
              />
              <SelectField
                compact
                label="Traffic"
                value={settings.mode}
                options={MODE_OPTIONS}
                onChange={(v) => update('mode', v)}
              />
              <SelectField
                compact
                label="Map zoom"
                value={settings.skyMapZoom}
                options={[
                  { value: 'normal', label: 'Normal' },
                  { value: 'close', label: 'Close' },
                ]}
                onChange={(v) => update('skyMapZoom', v)}
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

            {isDev && (
              <Toggle
                checked={settings.useMockData}
                onChange={(v) => updateAndSave('useMockData', v)}
                label="Use mock flight data"
                hint="Sample United, Southwest, Delta, etc. — turn off for live ADS-B while developing locally"
              />
            )}

            <div className="admin-config-summary">
              <span className="admin-stat-pill rounded-md px-2 py-1">{settings.refreshIntervalSec}s refresh</span>
              <span className="admin-stat-pill rounded-md px-2 py-1">{settings.radiusMi} mi radius</span>
              <span className="admin-stat-pill rounded-md px-2 py-1">{settings.maxAircraft} aircraft</span>
              <span className="admin-stat-pill rounded-md px-2 py-1">
                {settings.altitudeFilter === 'all'
                  ? 'All altitudes'
                  : settings.altitudeFilter === 'below10k'
                    ? 'Below 10k'
                    : settings.altitudeFilter === '10k-25k'
                      ? '10k–25k'
                      : 'Above 25k'}
              </span>
              <span className="admin-stat-pill rounded-md px-2 py-1">
                {MODE_LABELS[settings.mode]}
              </span>
              {settings.cargoOnly && (
                <span className="admin-stat-pill rounded-md px-2 py-1">Cargo only</span>
              )}
              <span className="admin-stat-pill rounded-md px-2 py-1">
                {settings.skyMapZoom === 'close' ? 'Close zoom' : 'Normal zoom'}
              </span>
            </div>
          </Panel>
        )}

        {section === 'screen' && (
          <Panel title={copy.panelTitle}>
            <Toggle
              compact
              checked={settings.keepAwake}
              onChange={(v) => updateAndSave('keepAwake', v)}
              label="Keep screen awake"
              hint="Wake lock for the modern (React) display only — iOS 16.4+"
            />

            <p className="text-[11px] leading-relaxed text-amber-300/80">
              The old iPad 4 (iOS 10) has no wake-lock API, so it plays a hidden muted video to stay
              awake — iOS needs <strong>one tap on the display</strong> to start it. As a guaranteed
              backup, set <strong>Settings → Display &amp; Brightness → Auto-Lock → Never</strong> on
              that iPad.
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

            <p className="text-[11px] leading-relaxed text-slate-500">
              These dim settings save to this browser. To apply them on the old iPad, open it once
              with{' '}
              <code className="admin-mono text-slate-400">
                /old-ipad-display?awake={settings.keepAwake ? '1' : '0'}&amp;dim=
                {settings.nightDimEnabled ? '1' : '0'}&amp;dimStart={settings.nightDimStart}
                &amp;dimEnd={settings.nightDimEnd}&amp;dimLevel={settings.nightDimLevel}
              </code>{' '}
              — it remembers after that.
            </p>

            <div className="admin-config-summary">
              <span className="admin-stat-pill rounded-md px-2 py-1">
                {settings.keepAwake ? 'Stays awake' : 'Auto-lock allowed'}
              </span>
              <span className="admin-stat-pill rounded-md px-2 py-1">
                {settings.nightDimEnabled
                  ? `Dim ${settings.nightDimStart}–${settings.nightDimEnd} · ${settings.nightDimLevel}%`
                  : 'No night dimming'}
              </span>
            </div>
          </Panel>
        )}
      </div>
    </div>
  );
}
