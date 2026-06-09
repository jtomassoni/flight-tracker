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
import { getTheme, getThemeSwatches, THEME_LIST } from '@/lib/themes';
import { THEME_ROTATION_SEC } from '@/lib/constants';

type Option<T extends string | number> = { value: T; label: string };

function SelectField<T extends string | number>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: Option<T>[];
  onChange: (v: T) => void;
}) {
  return (
    <label className="block">
      <span className="admin-label mb-2 block">{label}</span>
      <select
        value={String(value)}
        onChange={(e) => {
          const raw = e.target.value;
          const match = options.find((o) => String(o.value) === raw);
          if (match) onChange(match.value);
        }}
        className="admin-select"
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

function ThemeCard({
  id,
  name,
  description,
  selected,
  rotating,
  onSelect,
}: {
  id: ThemeId;
  name: string;
  description: string;
  selected: boolean;
  rotating: boolean;
  onSelect: () => void;
}) {
  const swatches = getThemeSwatches(getTheme(id));

  return (
    <button
      type="button"
      onClick={onSelect}
      data-selected={selected}
      className="admin-theme-card group rounded-2xl p-4 text-left"
    >
      <div className="mb-3 flex gap-1.5">
        {swatches.map((color) => (
          <span
            key={color}
            className="h-8 flex-1 rounded-md border border-white/10 shadow-inner"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
      <p className="admin-heading text-base font-semibold tracking-tight text-slate-100">
        {name}
      </p>
      <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{description}</p>
      {selected && (
        <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-sky-300">
          <span className="h-1.5 w-1.5 rounded-full bg-sky-400 shadow-[0_0_8px_#38bdf8]" />
          {rotating ? 'Rotation start' : 'Active'}
        </span>
      )}
    </button>
  );
}

function Section({
  title,
  subtitle,
  children,
  className = '',
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`admin-card rounded-2xl p-6 md:p-7 ${className}`}>
      <div className="mb-5">
        <h2 className="admin-heading text-lg font-semibold tracking-tight text-white">
          {title}
        </h2>
        {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
      </div>
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
    <div
      className="relative z-10 mx-auto max-w-5xl px-4 py-8 md:px-8 md:py-14"
      style={{
        paddingBottom: 'max(2rem, env(safe-area-inset-bottom))',
        paddingTop: 'max(2rem, env(safe-area-inset-top))',
      }}
    >
      {/* Header */}
      <header className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="admin-label mb-3 flex items-center gap-2">
            <span className="inline-block h-px w-8 bg-gradient-to-r from-sky-400/80 to-transparent" />
            Flight Command
          </p>
          <h1 className="admin-heading text-3xl font-bold tracking-tight text-white md:text-4xl">
            Control Center
          </h1>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-400">
            Configure your personal flight wall. Settings sync to the display via localStorage.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="admin-stat-pill rounded-full px-3 py-1">
              ZIP {settings.zipCode}
            </span>
            <span className="admin-stat-pill rounded-full px-3 py-1">
              {settings.locationLabel}
            </span>
            <span className="admin-stat-pill rounded-full px-3 py-1">
              {settings.refreshIntervalSec}s refresh
            </span>
          </div>
        </div>

        <Link
          href="/display"
          className="admin-btn-primary inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M5 12h14M13 6l6 6-6 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Launch Display
        </Link>
      </header>

      {/* Themes */}
      <Section
        title="Visual Identity"
        subtitle={`Choose a theme — or auto-rotate all ${THEME_LIST.length} every ${THEME_ROTATION_SEC} seconds`}
        className="mb-6"
      >
        <label className="admin-toggle mb-5 flex min-h-[44px] cursor-pointer items-center gap-4 rounded-xl border border-white/5 bg-black/20 px-4 py-3">
          <input
            type="checkbox"
            checked={settings.rotateThemes}
            onChange={(e) => update('rotateThemes', e.target.checked)}
            className="peer sr-only"
          />
          <span className="relative h-6 w-11 shrink-0 rounded-full border border-white/10 bg-slate-800 transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-slate-300 after:transition-transform" />
          <div>
            <span className="text-sm font-medium text-slate-200">Auto-rotate themes</span>
            <p className="text-xs text-slate-500">
              Cycles through every theme on the display every {THEME_ROTATION_SEC}s
            </p>
          </div>
        </label>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {THEME_LIST.map((t) => (
            <ThemeCard
              key={t.id}
              id={t.id}
              name={t.name}
              description={t.description}
              selected={settings.theme === t.id}
              rotating={settings.rotateThemes}
              onSelect={() => update('theme', t.id)}
            />
          ))}
        </div>
      </Section>

      {/* Location */}
      <Section
        title="Flight Corridor"
        subtitle="Set the geographic center for aircraft tracking"
        className="mb-6"
      >
        <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
          <label className="block">
            <span className="admin-label mb-2 block">ZIP Code</span>
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
              className="admin-input admin-mono text-lg tracking-widest"
            />
          </label>
          <button
            type="button"
            onClick={handleZipLookup}
            disabled={zipLoading || zipInput.length !== 5}
            className="admin-btn-ghost self-end rounded-xl px-5 py-2.5 text-sm font-medium disabled:opacity-40"
          >
            {zipLoading ? 'Resolving…' : 'Resolve'}
          </button>
        </div>

        {zipError && (
          <p className="mt-3 text-sm text-rose-400">{zipError}</p>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-3 rounded-xl border border-white/5 bg-black/20 px-4 py-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-sky-500/30 bg-sky-500/10">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-sky-400">
              <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="1.5" />
              <path
                d="M12 13v8M8 21h8"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-200">{settings.locationLabel}</p>
            <p className="admin-mono text-xs text-slate-500">
              {settings.lat.toFixed(4)}° N · {Math.abs(settings.lon).toFixed(4)}° W
            </p>
          </div>
        </div>
      </Section>

      {/* Flight params */}
      <Section
        title="Radar Parameters"
        subtitle="Fine-tune what appears on your display"
      >
        <div className="grid gap-6 sm:grid-cols-2">
          <SelectField
            label="Refresh Interval"
            value={settings.refreshIntervalSec}
            options={[
              { value: 30, label: '30 seconds' },
              { value: 60, label: '60 seconds' },
              { value: 90, label: '90 seconds' },
            ]}
            onChange={(v) => update('refreshIntervalSec', v)}
          />

          <SelectField
            label="Search Radius"
            value={settings.radiusMi}
            options={[
              { value: 5, label: '5 miles' },
              { value: 10, label: '10 miles' },
              { value: 25, label: '25 miles' },
              { value: 50, label: '50 miles' },
            ]}
            onChange={(v) => update('radiusMi', v)}
          />

          <SelectField
            label="Aircraft Limit"
            value={settings.maxAircraft}
            options={[
              { value: 8, label: '8 aircraft' },
              { value: 12, label: '12 aircraft' },
              { value: 20, label: '20 aircraft' },
            ]}
            onChange={(v) => update('maxAircraft', v)}
          />

          <SelectField
            label="Altitude Band"
            value={settings.altitudeFilter}
            options={[
              { value: 'all', label: 'All altitudes' },
              { value: 'below10k', label: 'Below 10,000 ft' },
              { value: '10k-25k', label: '10,000 – 25,000 ft' },
              { value: 'above25k', label: 'Above 25,000 ft' },
            ]}
            onChange={(v) => update('altitudeFilter', v)}
          />

          <SelectField
            label="Traffic Mode"
            value={settings.mode}
            options={[
              { value: 'nearby', label: 'All traffic in radius' },
              { value: 'den-arrivals', label: 'Arrivals-ish (toward center)' },
              { value: 'den-departures', label: 'Departures-ish (away from center)' },
              { value: 'overflights', label: 'High-altitude overflights' },
            ]}
            onChange={(v) => update('mode', v)}
          />

          <label className="admin-toggle flex min-h-[44px] cursor-pointer items-center gap-4 self-end rounded-xl border border-white/5 bg-black/20 px-4 py-3">
            <input
              type="checkbox"
              checked={settings.hideNoCallsign}
              onChange={(e) => update('hideNoCallsign', e.target.checked)}
              className="peer sr-only"
            />
            <span className="relative h-6 w-11 shrink-0 rounded-full border border-white/10 bg-slate-800 transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-slate-300 after:transition-transform" />
            <span className="text-sm text-slate-300">Hide unidentified aircraft</span>
          </label>
        </div>
      </Section>

      {/* Actions */}
      <div className="mt-8 flex flex-wrap items-center gap-4">
        <button
          onClick={handleSave}
          disabled={zipLoading}
          className="admin-btn-primary rounded-xl px-7 py-3 text-sm disabled:opacity-50"
        >
          Commit Configuration
        </button>
        <button
          onClick={handleReset}
          className="admin-btn-ghost rounded-xl px-6 py-3 text-sm font-medium"
        >
          Restore Defaults
        </button>
        {saved && (
          <span className="flex items-center gap-2 text-sm text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
            Configuration saved
          </span>
        )}
      </div>

      <footer className="mt-12 border-t border-white/5 pt-6">
        <p className="text-xs leading-relaxed text-slate-500">
          Kiosk mode: open{' '}
          <code className="admin-mono rounded bg-white/5 px-1.5 py-0.5 text-sky-300/80">
            /display
          </code>{' '}
          in fullscreen. Minimum poll interval is 30 seconds.
        </p>
      </footer>
    </div>
  );
}
