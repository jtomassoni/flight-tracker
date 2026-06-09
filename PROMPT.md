# Flight Tracker — V1 Product Prompt

Build a V1 “FlightWall-style” personal flight display web app.

## Goal

A fullscreen web dashboard that shows aircraft currently near ZIP 80219 / Denver, CO, intended to run on a cheap HDMI monitor in browser kiosk mode. Hosted on Vercel with server-side API calls so flight API keys stay in environment variables.

## Tech stack

- Next.js App Router (match local apps: `app/` directory, `@/*` alias, Node 22.x)
- TypeScript
- Tailwind CSS
- No database for V1
- Server-side API route for flight data
- Client-side polling (min 30s)
- Mobile/desktop responsive, optimized for 16:9 fullscreen monitor

## Core pages

### `/display`

- Fullscreen flight dashboard
- **Preset themes** (selectable in admin, stored in localStorage):
  - **Airport LED Board** — dark amber-on-black airport departure board
  - **British Bus Terminal** — cream Solari split-flap boards, serif typography
  - **Elegant & Modern** — clean cards with airline logos and livery accent colors
- Auto-refresh: 30s / 60s / 90s (configurable, min 30s)
- Last successful update timestamp
- Offline / error / loading states

### `/admin`

- Simple management UI (no auth — personal use only)
- Controls:
  - **Theme preset** (airport-led / british-bus / elegant-modern)
  - Refresh interval: 30 / 60 / 90 seconds
  - Radius: 5 / 10 / 25 / 50 miles
  - Max aircraft: 8 / 12 / 20
  - Altitude filter: all / below 10k / 10k–25k / above 25k
  - Hide aircraft with no callsign
  - Mode: nearby / DEN arrivals-ish / DEN departures-ish / overflights
- Settings in localStorage; `/display` reads them

## Data

- Abstraction in `lib/flightProvider.ts` (swappable providers)
- `GET /api/flights?lat=39.7392&lon=-105.0333&radiusMi=10`
- V1 providers: adsb.fi (default, no key), airplanes.live (optional key)
- Mock fallback when API unavailable
- Normalized aircraft shape (see `types/aircraft.ts`)

## Filtering & sorting

- Server: fetch aircraft near point/radius
- Client: admin filters + interestingness sort (distance, altitude, vertical rate, callsign)
- Limit to `maxAircraft`

## UI elements

- Header with mode and radius
- Aircraft list (theme-specific rendering)
- Spotlight side panel (most interesting aircraft)
- Bottom ticker: count, closest, highest, lowest

## Out of scope for V1

- Auth, database, paid APIs, map, Docker, custom domain

## Deployment

- Vercel
- Env vars server-side only
- README with local run, deploy, kiosk URL, provider limitations
