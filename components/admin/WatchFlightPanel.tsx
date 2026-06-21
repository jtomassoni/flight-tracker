'use client';

import { useAdminSettings } from '@/components/admin/AdminSettingsProvider';
import { useNearbyFlights } from '@/hooks/useNearbyFlights';
import {
  displayIdentifier,
  formatAltitude,
  formatDistance,
  formatHeading,
  formatSpeed,
} from '@/lib/aircraftUtils';
import {
  aircraftMatchesTrack,
  buildTrackTarget,
  trackFieldsFromCallsign,
} from '@/lib/callsignMatch';
import { saveSettings } from '@/lib/settings';

export default function WatchFlightPanel() {
  const { settings, update } = useAdminSettings();
  const { flights, status, lastUpdated, errorMessage } = useNearbyFlights(settings);
  const trackTarget = buildTrackTarget(
    settings.trackAirline ?? '',
    settings.trackFlightNumber ?? ''
  );

  const selectFlight = (callsign: string) => {
    const fields = trackFieldsFromCallsign(callsign);
    if (!fields) return;
    const next = {
      ...settings,
      trackAirline: fields.airline,
      trackFlightNumber: fields.flightNumber,
    };
    saveSettings(next);
    update('trackAirline', fields.airline);
    update('trackFlightNumber', fields.flightNumber);
  };

  return (
    <>
      <p className="admin-surface__hint">
        Track one flight by airline and number. The display shows only that aircraft when airborne.
      </p>
      <div className="admin-field-grid admin-field-grid--page">
        <label className="block min-w-0">
          <span className="admin-label mb-1 block">Airline</span>
          <input
            type="text"
            value={settings.trackAirline ?? ''}
            onChange={(e) =>
              update('trackAirline', e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 3))
            }
            placeholder="UA"
            className="admin-input admin-input--compact admin-mono uppercase"
          />
        </label>
        <label className="block min-w-0">
          <span className="admin-label mb-1 block">Flight #</span>
          <input
            type="text"
            inputMode="numeric"
            value={settings.trackFlightNumber ?? ''}
            onChange={(e) =>
              update('trackFlightNumber', e.target.value.replace(/\D/g, '').slice(0, 5))
            }
            placeholder="1234"
            className="admin-input admin-input--compact admin-mono"
          />
        </label>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          className="admin-btn admin-btn--ghost admin-btn--compact"
          onClick={() => {
            const next = {
              ...settings,
              trackAirline: settings.trackAirline ?? '',
              trackFlightNumber: settings.trackFlightNumber ?? '',
            };
            saveSettings(next);
            update('trackAirline', next.trackAirline);
            update('trackFlightNumber', next.trackFlightNumber);
          }}
          disabled={!trackTarget}
        >
          Save watch
        </button>
        <button
          type="button"
          className="admin-btn admin-btn--ghost admin-btn--compact"
          onClick={() => {
            const next = { ...settings, trackAirline: '', trackFlightNumber: '' };
            saveSettings(next);
            update('trackAirline', '');
            update('trackFlightNumber', '');
          }}
          disabled={!settings.trackAirline && !settings.trackFlightNumber}
        >
          Clear
        </button>
      </div>
      {trackTarget && (
        <p className="admin-surface__hint">
          Watching{' '}
          <span className="admin-mono text-[var(--text)]">{trackTarget.displayLabel}</span> ·{' '}
          <span className="admin-mono">
            /display?airline={settings.trackAirline}&amp;flight={settings.trackFlightNumber}
          </span>
        </p>
      )}

      <section className="admin-watch-nearby">
        <div className="admin-watch-nearby__header">
          <h3 className="admin-settings-group__title">Nearby flights</h3>
          <span className="admin-watch-nearby__meta">
            {status === 'loading' && !lastUpdated
              ? 'Loading…'
              : status === 'error'
                ? errorMessage ?? 'Feed error'
                : `${flights.length} within ${settings.radiusMi} mi`}
          </span>
        </div>
        <p className="admin-surface__hint">Tap a flight to start watching it.</p>

        {flights.length === 0 && status !== 'loading' && (
          <p className="admin-surface__hint">No identified flights nearby right now.</p>
        )}

        <ul className="admin-watch-nearby__list">
          {flights.map((ac) => {
            const active = trackTarget != null && aircraftMatchesTrack(ac, trackTarget);
            return (
              <li key={ac.hex}>
                <button
                  type="button"
                  className={`admin-watch-flight-row${active ? ' admin-watch-flight-row--active' : ''}`}
                  onClick={() => ac.callsign && selectFlight(ac.callsign)}
                  disabled={!ac.callsign?.trim()}
                >
                  <span className="admin-watch-flight-row__id admin-mono">
                    {displayIdentifier(ac)}
                  </span>
                  <span className="admin-watch-flight-row__meta">
                    {formatDistance(ac.distanceMi)} · {formatAltitude(ac.altitudeFt)} ·{' '}
                    {formatSpeed(ac.groundSpeedKt)} · {formatHeading(ac.headingDeg)}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    </>
  );
}
