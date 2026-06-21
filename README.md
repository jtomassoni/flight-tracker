# Flight Tracker

A personal FlightWall-style dashboard showing aircraft near Denver (ZIP 80219). Built for a cheap HDMI monitor in browser kiosk mode.

## Features

- **`/display`** — fullscreen flight board with preset themes
- **`/admin`** — configure ZIP code, theme, refresh interval, radius, filters, and display mode
- **Server-side flight API** — keys never exposed to the browser
- **Live data only** — real ADS-B aircraft plus real origin→destination routes (adsbdb); never any synthetic/fake flights

### Themes

| Theme | Style |
| --- | --- |
| DEN FIDS Board | DEN terminal departures board — dark blue, cyan data, airline logos |
| Train Station | Black Solari split-flap board — ID / destination / time |
| Radar Operations | Live radar scope with blips + target sidebar |
| Sky Map | Google Maps hybrid overlay with live aircraft markers |
| FlightWall | TheFlightWall-style LED panel — logo, real route, aircraft type, cyan telemetry (route shown only when known) |

Pick the active theme in `/admin`; it stays fixed until you change it.

## Quick start

```bash
npm install
cp .env.example .env.local   # optional
npm run dev
```

Open [http://localhost:3000/display](http://localhost:3000/display) for the board, or [http://localhost:3000/admin](http://localhost:3000/admin) to configure.

Both dev and production pull **live ADS-B data** from `lib/flightProvider.ts` (adsb.fi — free, no key) and resolve real routes via `lib/routeProvider.ts` (adsbdb — free, no key). There is no synthetic/mock fleet: if the upstream feed is unreachable and no recent live data is cached, the API returns an error rather than fabricating aircraft.

Dev server binds to `0.0.0.0` (same pattern as other local Next apps) so you can open it from another device on your LAN.

## Why this works for free

You do **not** need paid flight-data API keys to run this. Live positions come from [adsb.fi](https://adsb.fi) and route lookups from [adsbdb.com](https://adsbdb.com) — both are free public services with no signup.

The catch is that those upstream APIs **rate-limit** how often you can call them. This app is built around that constraint instead of fighting it:

- **Server-side caching** — your browser polls `/api/flights`, but the server reuses cached live data for ~45s (or longer, depending on your refresh setting) instead of hitting adsb.fi on every request.
- **Stale fallback** — if upstream is briefly unavailable or returns 429, the server serves the last known real positions rather than inventing flights.
- **Route cache** — origin/destination lookups are cached for hours because a callsign’s route does not change minute to minute.

So one kiosk display costs almost nothing in upstream traffic, and a shared demo deployment stays lightweight as long as refresh intervals are sane.

**Deploy your own copy.** The intended model is that you run this on your own machine or Vercel project for your own monitor. Your traffic stays on your instance; you are not routing every poll through someone else’s server forever. As more people self-host, no single deployment has to carry everyone’s load — each install talks to the free upstream APIs on its own schedule, with its own cache.

The only other key is **Google Maps**, and only if you use the Sky Map theme. You generate that yourself — see [Environment variables](#environment-variables) below.

## Environment variables

Copy `.env.example` → `.env.local` only if you use the **Sky Map** theme — that's the one key you need.

### Which keys to get

| What | Key needed? | Where to get it |
| --- | --- | --- |
| **Flight data (adsb.fi)** | **No** | Hardcoded in `lib/flightProvider.ts`. Live in every environment. |
| **ZIP → lat/lon (US)** | **No** | Uses Zippopotam.us server-side |
| **Sky Map theme** | **Yes** (for that theme only) | Your own key — [Google Cloud Console](https://console.cloud.google.com/apis/credentials) (steps below) |

### Google Maps key (Sky Map only)

Everyone runs their **own** key — there is no shared project key in the repo. If you want Sky Map:

1. Open [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials) (free Google account).
2. Create a project (or pick an existing one).
3. Enable **Maps JavaScript API** for that project ([API Library](https://console.cloud.google.com/apis/library/maps-javascript-api.googleapis.com)).
4. **Create credentials** → **API key**.
5. Copy the key into `.env.local` as `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` (and into Vercel env vars if you deploy).

Google gives personal use a generous free monthly credit; a single kiosk display stays well within that. Restrict the key to your domain in the console if you deploy publicly.

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

- Alternative provider — switch by changing `FLIGHT_PROVIDER` in `lib/flightProvider.ts`
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
    airline-logos/  # Approved-logo catalog + approval workflow
components/
  display/          # Theme layouts + dev theme tester (dev only)
  admin/            # Admin panel
lib/
  flightProvider.ts # live adsb.fi only (errors out if unreachable, no mock)
  routeProvider.ts  # real origin/destination lookup (adsbdb, cached)
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
