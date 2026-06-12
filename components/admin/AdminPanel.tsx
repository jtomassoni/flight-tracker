'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  DEFAULT_SETTINGS,
  loadSettings,
  saveSettings,
  type DisplaySettings,
  type ThemeId,
} from '@/lib/settings';
import AirlineLogoGallery from '@/components/admin/AirlineLogoGallery';
import IpadKioskLink from '@/components/admin/IpadKioskLink';
import { AIRLINE_ICAO_LIST } from '@/lib/airlines';
import FlightMap from '@/components/display/maps/FlightMap';
import { getTheme, getThemeSwatches, THEME_LIST } from '@/lib/themes';
import { THEME_ROTATION_SEC } from '@/lib/constants';
import '@/components/admin/airline-logo-gallery.css';

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
      title={name}
      className="admin-theme-chip"
    >
      <div className="admin-theme-chip__swatches">
        {swatches.map((color, index) => (
          <span key={index} style={{ backgroundColor: color }} />
        ))}
      </div>
      <span className="admin-theme-chip__label">{name}</span>
      <span className="admin-theme-chip__desc">{theme.description}</span>
      {selected && (
        <span className="admin-theme-chip__dot" aria-hidden>
          {rotating ? '↻' : '●'}
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
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  hint?: string;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`admin-toggle flex w-full cursor-pointer items-center gap-3 rounded-lg border border-white/5 bg-black/20 text-left ${
        compact ? 'min-h-[36px] px-3 py-2' : 'min-h-[44px] px-4 py-3'
      }`}
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
  children,
  className = '',
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`admin-panel-card ${className}`}>
      <h2 className="admin-panel-card__title">{title}</h2>
      {children}
    </section>
  );
}

export default function AdminPanel() {
  const [settings, setSettings] = useState<DisplaySettings>(DEFAULT_SETTINGS);
  const [zipInput, setZipInput] = useState(DEFAULT_SETTINGS.zipCode);
  const [saved, setSaved] = useState(false);
  const [zipError, setZipError] = useState<string | null>(null);
  const [zipLoading, setZipLoading] = useState(false);

  useEffect(() => {
    const loaded = loadSettings();
    setSettings(loaded);
    setZipInput(loaded.zipCode);
  }, []);

  const update = <K extends keyof DisplaySettings>(key: K, value: DisplaySettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const updateAndSave = <K extends keyof DisplaySettings>(key: K, value: DisplaySettings[K]) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      saveSettings(next);
      return next;
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const lookupZip = async (zip: string) => {
    const normalized = zip.replace(/\D/g, '').slice(0, 5);
    if (normalized.length !== 5) {
      throw new Error('Enter a valid 5-digit US ZIP code');
    }

    const res = await fetch(`/api/geocode?zip=${normalized}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? 'ZIP lookup failed');
    return data as {
      zipCode: string;
      lat: number;
      lon: number;
      locationLabel: string;
    };
  };

  const handleZipLookup = async () => {
    setZipLoading(true);
    setZipError(null);
    try {
      const result = await lookupZip(zipInput);
      setSettings((prev) => ({
        ...prev,
        zipCode: result.zipCode,
        lat: result.lat,
        lon: result.lon,
        locationLabel: result.locationLabel,
      }));
      setZipInput(result.zipCode);
    } catch (err) {
      setZipError(err instanceof Error ? err.message : 'ZIP lookup failed');
    } finally {
      setZipLoading(false);
    }
  };

  const handleSave = async () => {
    setZipError(null);
    try {
      let toSave = settings;

      const normalizedInput = zipInput.replace(/\D/g, '').slice(0, 5);
      if (normalizedInput !== settings.zipCode) {
        setZipLoading(true);
        const result = await lookupZip(normalizedInput);
        toSave = {
          ...settings,
          zipCode: result.zipCode,
          lat: result.lat,
          lon: result.lon,
          locationLabel: result.locationLabel,
        };
        setSettings(toSave);
        setZipInput(result.zipCode);
        setZipLoading(false);
      }

      saveSettings(toSave);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setZipError(err instanceof Error ? err.message : 'Save failed');
      setZipLoading(false);
    }
  };

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
    setZipInput(DEFAULT_SETTINGS.zipCode);
    saveSettings(DEFAULT_SETTINGS);
    setSaved(true);
  };

  return (
    <div className="admin-panel">
      <header className="admin-panel__header">
        <div className="min-w-0">
          <p className="admin-label mb-1">Flight Command</p>
          <h1 className="admin-heading text-xl font-bold tracking-tight text-white sm:text-2xl">
            Control Center
          </h1>
        </div>

        <div className="admin-panel__header-actions">
          {saved && (
            <span className="admin-panel__saved">
              <span className="admin-panel__saved-dot" aria-hidden />
              Saved
            </span>
          )}
          <button
            type="button"
            onClick={handleReset}
            className="admin-btn-ghost admin-btn--compact rounded-lg px-3 py-1.5 text-xs font-medium"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={zipLoading}
            className="admin-btn-primary admin-btn--compact rounded-lg px-4 py-1.5 text-xs disabled:opacity-50"
          >
            Save
          </button>
          <Link
            href="/display"
            className="admin-btn-primary admin-btn--compact inline-flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs"
          >
            Launch Display
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M5 12h14M13 6l6 6-6 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>
      </header>

      <IpadKioskLink settings={settings} />

      <div className="admin-panel__grid">
        <Panel title="Visual Identity">
          <Toggle
            compact
            checked={settings.rotateThemes}
            onChange={(v) => updateAndSave('rotateThemes', v)}
            label={`Auto-rotate (${THEME_ROTATION_SEC}s)`}
          />
          <div className="admin-theme-grid">
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

        <Panel title="Flight Corridor">
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
                  setSaved(false);
                  setZipError(null);
                }}
                placeholder="80219"
                className="admin-input admin-input--compact admin-mono tracking-widest"
              />
            </label>
            <button
              type="button"
              onClick={handleZipLookup}
              disabled={zipLoading || zipInput.length !== 5}
              className="admin-btn-ghost admin-btn--compact mt-5 rounded-lg px-3 py-1.5 text-xs font-medium disabled:opacity-40"
            >
              {zipLoading ? '…' : 'Resolve'}
            </button>
          </div>

          {zipError && <p className="admin-panel__error">{zipError}</p>}

          <div className="admin-corridor-preview">
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

        <Panel title="Radar & Map">
          <div className="admin-field-grid">
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
              options={[
                { value: 'nearby', label: 'All nearby' },
                { value: 'den-arrivals', label: 'Arrivals' },
                { value: 'den-departures', label: 'Departures' },
                { value: 'overflights', label: 'Overflights' },
              ]}
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
              {settings.mode === 'nearby'
                ? 'All nearby'
                : settings.mode === 'den-arrivals'
                  ? 'Arrivals'
                  : settings.mode === 'den-departures'
                    ? 'Departures'
                    : 'Overflights'}
            </span>
            <span className="admin-stat-pill rounded-md px-2 py-1">
              {settings.skyMapZoom === 'close' ? 'Close zoom' : 'Normal zoom'}
            </span>
          </div>
        </Panel>

        <Panel title="Airline Logos" className="admin-panel__logos">
          <p className="admin-logos-hint">
            CDN source vs FlightWall LED render for each carrier. Click a card to inspect in the
            theme tester.
          </p>
          <div className="admin-logos-scroll">
            <AirlineLogoGallery linkToTester />
          </div>
          <div className="admin-logos-footer">
            <span className="admin-logos-count admin-mono">
              {AIRLINE_ICAO_LIST.length} carriers
            </span>
            <Link
              href="/admin/theme-tester"
              className="admin-logos-tester-link admin-mono text-[10px] uppercase tracking-widest"
            >
              Open theme tester →
            </Link>
          </div>
        </Panel>
      </div>
    </div>
  );
}
