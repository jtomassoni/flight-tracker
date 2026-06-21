import type { KioskViewport } from '@/hooks/useKioskViewport';

const FONT_BY_VIEWPORT: Record<KioskViewport, number> = {
  compact: 11,
  desk: 12,
  wall: 14,
};

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export type AircraftMarkerIcon = {
  url: string;
  width: number;
  height: number;
  anchorX: number;
  anchorY: number;
};

/** Arrow + high-contrast label pill — label trails opposite heading to reduce overlap */
export function buildAircraftMarkerIcon(
  label: string,
  headingDeg: number,
  arrowColor: string,
  viewport: KioskViewport
): AircraftMarkerIcon {
  const text = escapeXml(label.slice(0, 10));
  const fontSize = FONT_BY_VIEWPORT[viewport];
  const pillPadX = 10;
  const pillH = fontSize + 12;
  const pillW = Math.max(56, text.length * (fontSize * 0.62) + pillPadX * 2);
  const arrowLen = viewport === 'wall' ? 14 : 12;

  const trailRad = ((headingDeg + 180) * Math.PI) / 180;
  const labelDist = viewport === 'wall' ? 34 : 30;
  const labelOffsetX = Math.sin(trailRad) * labelDist;
  const labelOffsetY = -Math.cos(trailRad) * labelDist;

  const pad = 8;
  const cx = pad + Math.max(pillW / 2, Math.abs(labelOffsetX) + pillW / 2);
  const cy = pad + Math.max(pillH / 2, Math.abs(labelOffsetY) + pillH / 2);
  const svgW = cx * 2;
  const svgH = cy * 2;

  const pillX = cx + labelOffsetX - pillW / 2;
  const pillY = cy + labelOffsetY - pillH / 2;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgW}" height="${svgH}" viewBox="0 0 ${svgW} ${svgH}">
  <defs>
    <filter id="d" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="1" stdDeviation="2.5" flood-color="#000000" flood-opacity="0.85"/>
    </filter>
  </defs>
  <g filter="url(#d)">
    <rect x="${pillX}" y="${pillY}" width="${pillW}" height="${pillH}" rx="6"
      fill="#0f172a" fill-opacity="0.94" stroke="${arrowColor}" stroke-width="2.5"/>
    <text x="${pillX + pillW / 2}" y="${pillY + pillH / 2 + fontSize * 0.35}"
      text-anchor="middle" fill="#ffffff" font-size="${fontSize}" font-weight="700"
      font-family="Arial,Helvetica,sans-serif">${text}</text>
  </g>
  <g transform="translate(${cx},${cy}) rotate(${headingDeg})">
    <path d="M0,-${arrowLen} L${arrowLen * 0.58},${arrowLen * 0.75} L0,${arrowLen * 0.38} L-${arrowLen * 0.58},${arrowLen * 0.75}Z"
      fill="${arrowColor}" stroke="#020617" stroke-width="1.5"/>
  </g>
</svg>`;

  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    width: svgW,
    height: svgH,
    anchorX: cx,
    anchorY: cy,
  };
}

export function buildCenterMarkerIcon(): AircraftMarkerIcon {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
  <defs>
    <filter id="d" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="1" stdDeviation="2" flood-color="#000" flood-opacity="0.8"/>
    </filter>
  </defs>
  <g filter="url(#d)">
    <rect x="4" y="4" width="40" height="22" rx="6" fill="#0f172a" fill-opacity="0.94" stroke="#ffffff" stroke-width="2"/>
    <text x="24" y="19" text-anchor="middle" fill="#ffffff" font-size="11" font-weight="700" font-family="Arial,sans-serif">Home</text>
    <circle cx="24" cy="36" r="7" fill="#ffffff" stroke="#0f172a" stroke-width="2"/>
  </g>
</svg>`;

  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    width: 48,
    height: 48,
    anchorX: 24,
    anchorY: 36,
  };
}

/** Tone down base-map labels/POIs — kiosk map is display-only (no hover targets). */
export const SKY_MAP_STYLES: google.maps.MapTypeStyle[] = [
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.business', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'road',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }],
  },
];
