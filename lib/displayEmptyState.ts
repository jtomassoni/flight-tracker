import type { TrackStatus } from '@/types/display';

export type DisplayEmptyState = {
  kicker?: string;
  title: string;
  subtitle: string;
};

export function getDisplayEmptyState(input: {
  status: 'loading' | 'ready' | 'error' | 'offline';
  trackLabel: string | null;
  trackStatus: TrackStatus;
  feedDown: boolean;
  errorMessage: string | null;
  locationLabel: string;
  radiusMi: number;
}): DisplayEmptyState {
  const {
    status,
    trackLabel,
    trackStatus,
    feedDown,
    errorMessage,
    locationLabel,
    radiusMi,
  } = input;

  if (feedDown) {
    return {
      kicker: trackLabel ? `Tracking ${trackLabel}` : undefined,
      title: 'Signal lost',
      subtitle: errorMessage?.trim() || 'Can’t reach the live air-traffic feed right now.',
    };
  }

  if (trackLabel && trackStatus === 'searching') {
    return {
      kicker: 'Flight watch',
      title: `Looking for ${trackLabel}`,
      subtitle: 'Scanning live ADS-B for your flight…',
    };
  }

  if (trackLabel && trackStatus === 'not-found') {
    return {
      kicker: 'Flight watch',
      title: `${trackLabel} not airborne`,
      subtitle:
        'The flight isn’t broadcasting position right now — it may not have departed yet, already landed, or be between coverage areas.',
    };
  }

  if (status === 'loading') {
    return {
      title: trackLabel ? `Finding ${trackLabel}…` : 'Scanning the skies',
      subtitle: trackLabel
        ? 'Checking live position and route data.'
        : 'Pulling live traffic over your location…',
    };
  }

  return {
    title: 'No flights in range',
    subtitle: `Nothing is flying within ${radiusMi} miles of ${locationLabel} right now.`,
  };
}
