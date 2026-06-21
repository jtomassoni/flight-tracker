import type { NormalizedAircraft } from '@/types/aircraft';
import type { DisplaySettings } from '@/lib/settings';
import type { ThemeDefinition } from '@/lib/themes';

export type TrackStatus = 'off' | 'searching' | 'found' | 'not-found';

export type DisplayLayoutProps = {
  displayedAircraft: NormalizedAircraft[];
  filteredAircraft: NormalizedAircraft[];
  allAircraft: NormalizedAircraft[];
  featured: NormalizedAircraft | null;
  settings: DisplaySettings;
  status: 'loading' | 'ready' | 'error' | 'offline';
  lastUpdated: Date | null;
  source: 'live' | 'cached' | null;
  provider: string | null;
  errorMessage: string | null;
  onRefresh: () => void;
  theme: ThemeDefinition;
  /** Human label for the watched flight, e.g. "UA 1234". */
  trackLabel: string | null;
  trackStatus: TrackStatus;
};
