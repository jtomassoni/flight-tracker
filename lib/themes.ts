import type { ThemeId } from './settings';

export type LayoutId =
  | 'departure-table'
  | 'split-flap-board'
  | 'airline-gallery'
  | 'first-class-hero'
  | 'radar-scope'
  | 'google-map'
  | 'led-matrix';

export type ThemeDefinition = {
  id: ThemeId;
  name: string;
  description: string;
  layout: LayoutId;
  cssVars: Record<string, string>;
};

export const THEMES: Record<ThemeId, ThemeDefinition> = {
  'airport-led': {
    id: 'airport-led',
    name: 'DEN FIDS Board',
    description: 'DEN terminal FIDS — dark blue panels, cyan flight data, airline logos.',
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
      '--den-bg': '#08111f',
      '--den-header': '#0a1628',
      '--den-row-a': '#0f2847',
      '--den-row-b': '#16365a',
      '--den-cyan': '#5ec8e8',
      '--den-lime': '#b8e986',
      '--den-amber': '#f5c842',
    },
  },
  'british-bus': {
    id: 'british-bus',
    name: 'British Bus Terminal',
    description: 'Black Solari split-flap board — ID, destination, and time columns.',
    layout: 'split-flap-board',
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
  'elegant-modern': {
    id: 'elegant-modern',
    name: 'Elegant & Modern',
    description: 'Magazine-style card grid with airline logos and livery accents.',
    layout: 'airline-gallery',
    cssVars: {
      '--background': '#0f172a',
      '--foreground': '#f8fafc',
      '--accent': '#38bdf8',
      '--muted': '#94a3b8',
      '--panel': '#1e293b',
      '--border': '#334155',
      '--font-display': 'var(--font-dm-sans), system-ui, sans-serif',
      '--font-mono': 'var(--font-jetbrains), ui-monospace, monospace',
      '--font-serif': 'var(--font-dm-sans), system-ui, sans-serif',
      '--glow': 'none',
    },
  },
  'midnight-luxe': {
    id: 'midnight-luxe',
    name: 'Midnight First Class',
    description: 'Cinematic hero spotlight with a gold filmstrip of traffic below.',
    layout: 'first-class-hero',
    cssVars: {
      '--background': '#0a0908',
      '--foreground': '#f5f0e6',
      '--accent': '#c9a962',
      '--muted': '#8a8175',
      '--panel': '#141210',
      '--border': '#2a2620',
      '--font-display': 'var(--font-playfair), Georgia, serif',
      '--font-mono': 'var(--font-jetbrains), ui-monospace, monospace',
      '--font-serif': 'var(--font-playfair), Georgia, serif',
      '--glow': '0 0 20px rgba(201, 169, 98, 0.25)',
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
  'flight-wall-mini': {
    id: 'flight-wall-mini',
    name: 'Flight Wall Mini',
    description: 'Physical LED matrix display — pixel logo, airline, route, and airport lines.',
    layout: 'led-matrix',
    cssVars: {
      '--background': '#000000',
      '--foreground': '#f2f2f2',
      '--accent': '#ffffff',
      '--muted': '#8a8a8a',
      '--panel': '#0a0a0a',
      '--border': '#1a1a1a',
      '--font-display': 'var(--font-pixel), ui-monospace, monospace',
      '--font-mono': 'var(--font-pixel), ui-monospace, monospace',
      '--font-serif': 'var(--font-pixel), ui-monospace, monospace',
      '--glow': '0 0 6px rgba(255, 255, 255, 0.55)',
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
