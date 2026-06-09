import type { NormalizedAircraft } from '@/types/aircraft';
import type { DisplaySettings } from '@/lib/settings';
import type { ThemeDefinition } from '@/lib/themes';

export type DisplayLayoutProps = {
  displayedAircraft: NormalizedAircraft[];
  filteredAircraft: NormalizedAircraft[];
  allAircraft: NormalizedAircraft[];
  featured: NormalizedAircraft | null;
  settings: DisplaySettings;
  status: 'loading' | 'ready' | 'error' | 'offline';
  lastUpdated: Date | null;
  source: 'live' | 'mock' | null;
  provider: string | null;
  errorMessage: string | null;
  onRefresh: () => void;
  theme: ThemeDefinition;
};
