'use client';

import SplitFlapText from '@/components/SplitFlapText';
import type { NormalizedAircraft } from '@/types/aircraft';
import { getVerticalTrend } from '@/lib/aircraftUtils';
import {
  getRouteFieldStatus,
  routeFieldLabel,
  ROUTE_PENDING_LABEL,
  ROUTE_UNAVAILABLE_LABEL,
  type RouteDisplayStatus,
  type RouteFieldKind,
} from '@/lib/routeStatus';
import { FIDS_UNKNOWN } from '@/lib/denFids';

function flapPad(raw: string, chars: number): string {
  return raw.padEnd(chars, ' ').slice(0, chars);
}

type RouteEndpointFieldProps = {
  ac: NormalizedAircraft;
  kind?: RouteFieldKind;
  /** When kind is endpoint (default), derived from vertical rate if omitted. */
  trend?: ReturnType<typeof getVerticalTrend>;
  variant: 'fids' | 'flap';
  /** Split-flap column width */
  flapChars?: number;
  className?: string;
};

export function routeFieldStatusFor(
  ac: NormalizedAircraft,
  kind: RouteFieldKind = 'endpoint',
  trend?: ReturnType<typeof getVerticalTrend>
): RouteDisplayStatus {
  const resolvedTrend = trend ?? getVerticalTrend(ac.verticalRateFpm);
  return getRouteFieldStatus(ac, kind, resolvedTrend);
}

export default function RouteEndpointField({
  ac,
  kind = 'endpoint',
  trend: trendProp,
  variant,
  flapChars = 10,
  className = '',
}: RouteEndpointFieldProps) {
  const trend = trendProp ?? getVerticalTrend(ac.verticalRateFpm);
  const status = getRouteFieldStatus(ac, kind, trend);

  if (status === 'resolved') {
    const text = routeFieldLabel(ac, kind, trend);
    if (variant === 'flap') {
      const cleaned = text.replace(/[^A-Z0-9 ]/gi, '').toUpperCase().slice(0, flapChars);
      return (
        <SplitFlapText
          value={cleaned.padEnd(flapChars, ' ').slice(0, flapChars)}
          minChars={flapChars}
          maxChars={flapChars}
          className={className}
        />
      );
    }
    return <span className={`den-fids__dest ${className}`.trim()}>{text}</span>;
  }

  if (status === 'pending') {
    if (variant === 'flap') {
      const pending = flapPad('ROUTING', flapChars);
      return (
        <span className="solari-board__route-pending" aria-live="polite">
          <SplitFlapText
            value={pending}
            minChars={flapChars}
            maxChars={flapChars}
            className={className}
          />
        </span>
      );
    }
    return (
      <span
        className={`den-fids__dest den-fids__dest--pending ${className}`.trim()}
        aria-live="polite"
      >
        {ROUTE_PENDING_LABEL}
      </span>
    );
  }

  if (variant === 'flap') {
    const na = flapPad(FIDS_UNKNOWN, flapChars);
    return (
      <SplitFlapText
        value={na}
        minChars={flapChars}
        maxChars={flapChars}
        className={`solari-board__route-na ${className}`.trim()}
      />
    );
  }

  return (
    <span className={`den-fids__dest den-fids__dest--na ${className}`.trim()}>
      {ROUTE_UNAVAILABLE_LABEL}
    </span>
  );
}
