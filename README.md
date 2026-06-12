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
| FlightWall | TheFlightWall-style LED panel — logo, route, aircraft type, cyan telemetry (routes are synthetic placeholders) |

Themes auto-rotate every 30 seconds on `/display` by default (toggle in admin).

## Quick start

```bash
npm install
cp .env.example .env.local   # optional
npm run dev
```

Open [http://localhost:3000/display](http://localhost:3000/display) for the board, or [http://localhost:3000/admin](http://localhost:3000/admin) to configure.

Dev uses **mock flight data** automatically — no adsb.fi calls while you iterate. Production uses live data from `lib/flightProvider.ts`.

Dev server binds to `0.0.0.0` (same pattern as other local Next apps) so you can open it from another device on your LAN.

## Environment variables

Copy `.env.example` → `.env.local` only if you use the **Sky Map** theme — that's the one key you need.

### Which keys to get

| What | Key needed? | Where to get it |
| --- | --- | --- |
| **Flight data (adsb.fi)** | **No** | Hardcoded in `lib/flightProvider.ts`. Mock data in dev; live in prod. |
| **ZIP → lat/lon (US)** | **No** | Uses Zippopotam.us server-side |
| **Sky Map theme** | **Yes** (for that theme only) | [Google Cloud Console](https://console.cloud.google.com/apis/credentials) → enable Maps JavaScript API → `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` |

### Variables

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Required for Sky Map theme (Maps JavaScript API) |

Set in `.env.local` for development and in the Vercel project dashboard for production.

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

### iPad 4 / iOS 10 — `/old-ipad-display`

The full display app (Next.js / React) **does not run** on iPad 4 (MD514LL/A, iOS 10.3.3). Opening **`/display`** on an old iPad auto-redirects to **`/old-ipad-display`** — FlightWall LED by default, same dot-matrix renderer as the full app.

Configure settings on your Mac at `/admin`, then open **`/display`** on the iPad (auto-redirects). Tap **Fullscreen** for kiosk setup — on Chrome for iPad, use the menu **(⋮) → Add to Home screen** and launch from that icon.

`/kiosk` is a short alias that redirects to `/old-ipad-display`.

## API provider notes

### adsb.fi (default)

- Free, no API key — configured in `lib/flightProvider.ts`
- Endpoint: `https://opendata.adsb.fi/api/v3/lat/{lat}/lon/{lon}/dist/{nm}`
- ADSBexchange-compatible response format
- Server-side caching to stay within rate limits
- Coverage depends on community receivers near Denver

### airplanes.live

- Alternative provider — switch by changing `PRODUCTION_FLIGHT_PROVIDER` in `lib/flightProvider.ts`
- Optional `FLIGHT_API_KEY` env var via `api-auth` header if your endpoint requires auth

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
  api/
    flights/        # Server-side data proxy
    airline-logo/   # Logo proxy for LED canvas
components/
  display/          # Theme layouts + dev theme tester (dev only)
  admin/            # Admin panel
lib/
  flightProvider.ts # adsb.fi in prod, mock in dev
  ledMatrix.ts      # FlightWall LED renderer
  ledFlightWall.ts  # Route/telemetry formatters
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
