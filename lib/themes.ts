import type { ThemeId } from './settings';

export type LayoutId =
  | 'departure-table'
  | 'split-flap-board'
  | 'radar-scope'
  | 'google-map'
  | 'led-matrix';

export type ThemeDefinition = {
  id: ThemeId;
  name: string;
  description: string;
  layout: LayoutId;
  cssVars: Record<string, string>;
  /** Static masthead shown above the split-flap departure rows */
  boardHeader?: {
    title: string;
    subtitle?: string;
  };
};

export const THEMES: Record<ThemeId, ThemeDefinition> = {
  'airport-led': {
    id: 'airport-led',
    name: 'DEN FIDS Board',
    description: 'DEN terminal FIDS — navy boards, full-color airline logos, white flight data.',
    layout: 'departure-table',
    cssVars: {
      '--background': '#08111f',
      '--foreground': '#ffffff',
      '--accent': '#5ec8e8',
      '--muted': '#7eb8d4',
      '--panel': '#0f2847',
      '--border': '#16365a',
      '--font-display': 'var(--font-barlow-condensed), Arial, Helvetica, sans-serif',
      '--font-mono': 'var(--font-barlow-condensed), Arial, Helvetica, sans-serif',
      '--font-serif': 'var(--font-barlow-condensed), Arial, Helvetica, sans-serif',
      '--glow': 'none',
      '--den-bg': '#0c2340',
      '--den-header': '#071525',
      '--den-yellow': '#f5e842',
    },
  },
  'british-bus': {
    id: 'british-bus',
    name: 'Train Station',
    description: 'Black Solari split-flap board — airline, flight, city, status, and est. time.',
    layout: 'split-flap-board',
    boardHeader: {
      title: 'King Street Station',
      subtitle: 'Est 1952',
    },
    cssVars: {
      '--background': '#0a0a0a',
      '--foreground': '#f0f0f0',
      '--accent': '#f0f0f0',
      '--muted': '#888888',
      '--panel': '#141414',
      '--border': '#000000',
      '--font-display': 'var(--font-barlow-condensed), "Arial Narrow", Arial, sans-serif',
      '--font-mono': 'var(--font-barlow-condensed), "Arial Narrow", Arial, sans-serif',
      '--font-serif': 'var(--font-barlow-condensed), Arial, sans-serif',
      '--glow': 'none',
    },
  },
  'radar-ops': {
    id: 'radar-ops',
    name: 'Radar Operations',
    description: 'ATC scope with blips on a sweep + vertical target list.',
    layout: 'radar-scope',
    cssVars: {
      '--background': '#020a04',
      '--foreground': '#b8ffc8',
      '--accent': '#39ff6a',
      '--muted': '#3d6b4a',
      '--panel': '#041408',
      '--border': '#0d3d1a',
      '--font-display': 'var(--font-share-tech), ui-monospace, monospace',
      '--font-mono': 'var(--font-share-tech), ui-monospace, monospace',
      '--font-serif': 'var(--font-share-tech), ui-monospace, monospace',
      '--glow': '0 0 14px rgba(57, 255, 106, 0.4)',
    },
  },
  'sky-map': {
    id: 'sky-map',
    name: 'Sky Map',
    description: 'Live Google Maps overlay with aircraft markers and search radius.',
    layout: 'google-map',
    cssVars: {
      '--background': '#020617',
      '--foreground': '#f8fafc',
      '--accent': '#38bdf8',
      '--muted': '#94a3b8',
      '--panel': '#0f172a',
      '--border': '#334155',
      '--font-display': 'var(--font-dm-sans), system-ui, sans-serif',
      '--font-mono': 'var(--font-jetbrains), ui-monospace, monospace',
      '--font-serif': 'var(--font-dm-sans), system-ui, sans-serif',
      '--glow': 'none',
    },
  },
  flightwall: {
    id: 'flightwall',
    name: 'FlightWall',
    description:
      'TheFlightWall-style LED panel — airline logo, route, aircraft type, and cyan telemetry.',
    layout: 'led-matrix',
    cssVars: {
      '--background': '#000000',
      '--foreground': '#f2f2f2',
      '--accent': '#5ec8e8',
      '--muted': '#8a8a8a',
      '--panel': '#0a0a0a',
      '--border': '#1a1a1a',
      '--font-display': 'var(--font-barlow-condensed), Arial, Helvetica, sans-serif',
      '--font-mono': 'var(--font-barlow-condensed), Arial, Helvetica, sans-serif',
      '--font-serif': 'var(--font-barlow-condensed), Arial, Helvetica, sans-serif',
      '--glow': '0 0 6px rgba(94, 200, 232, 0.45)',
    },
  },
};

export const THEME_LIST = Object.values(THEMES);
export const THEME_IDS = THEME_LIST.map((t) => t.id);

export function getTheme(id: ThemeId): ThemeDefinition {
  return THEMES[id] ?? THEMES['airport-led'];
}

export function getThemeSwatches(theme: ThemeDefinition): string[] {
  return [
    theme.cssVars['--background'],
    theme.cssVars['--accent'],
    theme.cssVars['--foreground'],
  ];
}

export const LAYOUT_LABELS: Record<LayoutId, string> = {
  'departure-table': 'Departure board',
  'split-flap-board': 'Split-flap board',
  'radar-scope': 'Radar scope',
  'google-map': 'Live map',
  'led-matrix': 'LED matrix',
};
