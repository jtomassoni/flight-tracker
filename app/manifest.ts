import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Flight Tracker — Denver',
    short_name: 'Flight Tracker',
    description: 'Personal flight display dashboard for aircraft near Denver, CO.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'landscape',
    background_color: '#0a0f0a',
    theme_color: '#0a0f0a',
  };
}
