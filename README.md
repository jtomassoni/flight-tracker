# Flight Tracker

A personal FlightWall-style dashboard showing aircraft near Denver (ZIP 80219). Built for a cheap HDMI monitor in browser kiosk mode.

## Features

- **`/display`** — fullscreen flight board with preset themes
- **`/admin`** — configure ZIP code, theme, refresh interval, radius, filters, and display mode
- **Server-side flight API** — keys never exposed to the browser
- **Mock fallback** — UI works when the external ADS-B API is down

### Themes

| Theme | Style |
| --- | --- |
| DEN FIDS Board | DEN terminal departures board — dark blue, cyan data, airline logos |
| British Bus Terminal | Black Solari split-flap board — ID / destination / time |
| Elegant & Modern | Magazine card grid with airline logos |
| Midnight First Class | Cinematic hero + horizontal filmstrip |
| Radar Operations | Live radar scope with blips + target sidebar |
| Sky Map | Google Maps hybrid overlay with live aircraft markers |
| Flight Wall Mini | Physical LED matrix — pixel airline logo, callsign, aircraft type |

Themes auto-rotate every 30 seconds on `/display` by default (toggle in admin).

## Quick start

```bash
npm install
cp .env.example .env.local   # optional
npm run dev
```

Open [http://localhost:3000/display](http://localhost:3000/display) for the board, or [http://localhost:3000/admin](http://localhost:3000/admin) to configure.

Dev server binds to `0.0.0.0` (same pattern as other local Next apps) so you can open it from another device on your LAN.

## Environment variables

Copy `.env.example` → `.env.local` (already created for you). **For V1 you likely need zero API keys.**

### Which keys to get

| What | Key needed? | Where to get it |
| --- | --- | --- |
| **Flight data (adsb.fi)** | **No** — default, free | Just works. Community ADS-B feed. |
| **Flight data (airplanes.live)** | Maybe | [airplanes.live](https://airplanes.live) — request API access if your endpoint requires `api-auth` |
| **ZIP → lat/lon (US)** | **No** — default, free | Uses Zippopotam.us server-side |
| **ZIP → lat/lon (Google)** | Optional | [Google Cloud Console](https://console.cloud.google.com/apis/credentials) → enable Geocoding API → `GOOGLE_GEOCODING_API_KEY` |
| **ADS-B Exchange (paid)** | Only if you upgrade later | [adsbexchange.com](https://www.adsbexchange.com/products/enterprise-excel/) — not needed for V1 |
| **Sky Map theme** | **Yes** (for that theme only) | [Google Cloud Console](https://console.cloud.google.com/apis/credentials) → enable Maps JavaScript API → `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` |

### Variables

| Variable | Default | Description |
| --- | --- | --- |
| `FLIGHT_PROVIDER` | `adsb.fi` | `adsb.fi`, `airplanes.live`, or `mock` |
| `USE_MOCK_FLIGHTS` | `false` | Force mock data (`true` / `false`) |
| `FLIGHT_API_KEY` | — | Only for `airplanes.live` if auth is required |
| `GEOCODING_PROVIDER` | `zippopotam` | Set to `google` to use Google Geocoding |
| `GOOGLE_GEOCODING_API_KEY` | — | Optional, for non-US or higher geocoding limits |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | — | Required for Sky Map theme (Maps JavaScript API) |

Set these in `.env.local` for development and in the Vercel project dashboard for production.

## Deploy to Vercel

```bash
npx vercel
```

Or connect the GitHub repo in the Vercel dashboard. Framework is auto-detected (Next.js). Add env vars under **Settings → Environment Variables**.

## Kiosk mode

On a machine connected to your HDMI display:

```bash
# macOS (Chrome)
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --kiosk --app=https://your-app.vercel.app/display

# Raspberry Pi / Linux (Chromium)
chromium-browser --kiosk --app=https://your-app.vercel.app/display
```

Configure theme and filters at `/admin` first — settings persist in localStorage on that browser.

## API provider notes

### adsb.fi (default)

- Free, no API key
- Endpoint: `https://opendata.adsb.fi/api/v3/lat/{lat}/lon/{lon}/dist/{nm}`
- ADSBexchange-compatible response format
- Rate-limit friendly: client polling is capped at 30s minimum
- Coverage depends on community receivers near Denver

### airplanes.live

- Set `FLIGHT_PROVIDER=airplanes.live`
- Similar lat/lon/dist endpoint; optional `FLIGHT_API_KEY` via `api-auth` header

### Limitations

- Position data is live only (no history)
- Callsigns may be missing on GA / military traffic
- Arrival/departure modes use heading + vertical-rate heuristics, not official flight plans
- Airline logos use Kiwi CDN by IATA code — unknown carriers get a generic placeholder

## Project structure

```
app/
  display/          # Kiosk dashboard
  admin/            # Settings UI
  api/flights/      # Server-side data proxy
components/
  display/          # Theme-aware display components
  admin/            # Admin panel
lib/
  flightProvider.ts # Swappable ADS-B providers
  themes.ts         # Preset theme definitions
  settings.ts       # localStorage settings schema
```

## Scripts

```bash
npm run dev        # Dev server on 0.0.0.0:3000
npm run build      # Production build
npm run start      # Start production server
npm run typecheck  # TypeScript check
npm run lint       # ESLint
```
