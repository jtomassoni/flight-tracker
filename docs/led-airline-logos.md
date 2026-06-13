# LED Airline Logo Art — AI / Designer Brief

Instructions for creating **purpose-built pixel logos** for the FlightWall LED theme. Standard airline logo PNGs (Kiwi CDN, marketing assets, etc.) do **not** work at this scale — they collapse into unreadable blobs or wrong letters (e.g. Southwest’s heart-with-wings becomes a “K”).

---

## Why custom art is required

The FlightWall layout renders airline marks in a **large left-column tile** on a simulated LED matrix:

| Orientation | Grid size | Logo band |
|-------------|-----------|-----------|
| Landscape   | 128 × ~72 (dynamic) | **51 × full height** (40% width) |
| Portrait    | 64 × dynamic        | **25 × full height** (40% width) |

Formula: `width = floor(cols × 0.4)`, `height = rows` — left column; flight info + stacked telemetry fill the right 60%. Row count grows on 16:9 displays so pixels stay square (no stretch).

Pipeline:

1. A PNG is drawn into the logo region (aspect-fit, centered).
2. Each pixel is sampled. Pixels with **alpha &lt; 48** or **luminance &lt; 28** are treated as empty (no LED lights).
3. Remaining pixels become individually lit LEDs with slight bloom.

Full-color logos scaled from marketing assets still lose detail at this size — especially complex marks like Southwest’s heart-with-wings. The fix is **native pixel art** designed for the target tile (see dimensions below).

---

## Deliverable format

### Files

| Field | Value |
|-------|-------|
| **Location** | `public/led-logos/{ICAO}.png` |
| **Dimensions** | **32 × 32 px** (matches 25% area on both orientations) |
| **Format** | PNG, **no interlacing** |
| **Color mode** | RGB or RGBA |
| **Background** | **Transparent** — the app paints the tile color behind the mark |
| **Naming** | ICAO 3-letter code (see carrier table below) |

Example: `public/led-logos/SWA.png` for Southwest.

### Optional high-res source

Design at **32×32**. The runtime scales with nearest-neighbor — do not rely on smooth downscaling.

---

## Design rules (non-negotiable)

1. **Design at final size.** Open a **32×32** grid. If it is not readable there, it will not work on the wall.
2. **Icon only — no wordmarks.** No “Southwest”, “United”, tail fin text, or IATA codes in the tile.
3. **Bold, chunky shapes.** Minimum feature width: **1 LED pixel** (no sub-pixel anti-aliasing). Avoid 1-pixel gaps between same-color regions — they may disappear after sampling.
4. **Flat fills only.** No gradients, shadows, glows, or photographic texture.
5. **Limit palette.** Use **2–4 solid brand colors** per mark. Pure black (`#000000`) on dark tile backgrounds may fall below the luminance threshold and vanish — use brand darks instead.
6. **High contrast against tile.** See per-carrier tile background below. The mark must read clearly on that color.
7. **Center the glyph.** Leave at least **1 pixel margin** on one side if the icon is asymmetric.
8. **No anti-aliasing** (or only 1-step AA on outer edges if absolutely needed). Prefer crisp staircase edges.
9. **Test by squinting.** View at actual tile size from 6–10 feet — silhouette must be obvious.

---

## Tile backgrounds (app paints these — keep logo transparent)

| ICAO | Airline | Tile background | Notes |
|------|---------|-----------------|-------|
| SWA | Southwest | `#ffffff` | Full-color mark on white |
| AAL | American | `#ffffff` | Eagle / stylized AA mark |
| FFT | Frontier | `#ffffff` | Animal silhouette |
| ASA | Alaska | `#ffffff` | Eskimo / Alaska mark |
| JBU | JetBlue | `#ffffff` | dots / tail mark |
| UAL | United | `#0033A0` | Globe or tulip — **use white/light blue** |
| DAL | Delta | `#003366` | Widget / triangle — **use white/red** |
| SKW | SkyWest | `#1B365D` | Mountain or wordless mark — **use lime/white** |
| ENY | Envoy | `#e8edf2` | American Eagle lineage — red/blue |
| RPA | Republic | `#e8edf2` | Simple monogram or wing |
Brand hex values are defined in `lib/airlines.ts` if you need exact livery colors.

---

## Carrier briefs

Each entry: **recognizable mark**, **palette**, and layout intent.

### SWA — Southwest Airlines

- **Mark:** Heart with wings (classic Southwest symbol) — **not** the word “Southwest”, **not** IATA `WN`.
- **Colors:** `#304CB2` (blue body), `#FFB612` (gold accent), `#C8102E` (red heart) — simplify to 2–3 regions if needed.
- **Tile:** White.
- **32×32 hint:** Heart centered, wing nubs extending left/right on upper third. This is the highest-priority fix. At this size you have room for recognizable wings and a clear heart silhouette.

### UAL — United Airlines

- **Mark:** Globe meridians or simplified tulip — avoid fine latitude lines.
- **Colors:** `#FFFFFF`, `#0D8BD9` on `#0033A0` tile.
- **Tile:** United blue.

### DAL — Delta Air Lines

- **Mark:** Widget (triangle / winged Δ) — single bold chevron or widget silhouette.
- **Colors:** `#FFFFFF`, `#C8102E` on `#003366` tile.

### AAL — American Airlines

- **Mark:** Stylized eagle head profile or AA monogram (two letters touching) — must differ from generic “A”.
- **Colors:** `#0078D2`, `#C8102E`, `#FFFFFF` on white tile.

### FFT — Frontier Airlines

- **Mark:** Animal mascot silhouette (bear / fox / etc.) — pick **one** iconic animal, bold profile.
- **Colors:** `#006747`, `#8CD600` on white tile.

### JBU — JetBlue

- **Mark:** Tail fin dots pattern or simplified “J” tail — chunky, not six tiny dots.
- **Colors:** `#003087`, `#6699CC` on white tile.

### ASA — Alaska Airlines

- **Mark:** Eskimo face profile or Alaska “A” tail — bold profile, 1-color face + dark hair.
- **Colors:** `#01426A`, `#48BFE5`, `#95C93D` on white tile.

### SKW — SkyWest

- **Mark:** Mountain peak + wing, or stylized “S” — no tiny text.
- **Colors:** `#C4D600`, `#FFFFFF` on `#1B365D` tile.

### ENY — Envoy Air

- **Mark:** Simplified eagle feather or “E” chevron (American Eagle connection).
- **Colors:** `#003366`, `#C8102E` on light gray tile.

### RPA — Republic Airways

- **Mark:** Bold “R” or wing stripe — geometric, not script.
- **Colors:** `#1F3A5F`, `#E8B923` on light gray tile.

---

## AI image generation prompts

Use these with an image model that supports **exact pixel dimensions** (or generate large, then manually downscale with nearest-neighbor to 32×32).

### Master prompt template

```
Create a 32×32 pixel airline logo icon for {AIRLINE_NAME}.

Requirements:
- Exactly 32 pixels wide and 32 pixels tall
- Flat solid colors only, no gradients, no text, no wordmark
- Transparent background
- Icon: {MARK_DESCRIPTION}
- Colors: {HEX_LIST} — use only these
- Bold chunky shapes readable on a {TILE_COLOR} LED tile
- Style: retro LED matrix / airport departure board pixel art
- No anti-aliasing, crisp pixel edges
```

### Southwest example (copy-paste)

```
Create a 32×32 pixel airline logo icon for Southwest Airlines.

Requirements:
- Exactly 32 pixels wide and 32 pixels tall
- Flat solid colors only, no gradients, no text, no letters
- Transparent background
- Icon: heart with small wings (classic Southwest heart-with-wings symbol)
- Colors: #304CB2 blue, #FFB612 gold, #C8102E red
- Bold chunky shapes readable on a white LED tile
- Style: retro LED matrix pixel art, like a split-flap airport board
- No anti-aliasing, crisp pixel edges
- The heart must be recognizable, not an abstract blob or letter K
```

### Batch prompt (all carriers)

After SWA is approved, repeat the template for each ICAO in the table above. **Do not** reuse one generic “airline logo” style — each mark must be **distinct at tile size**.

---

## QA checklist

Before committing a file:

- [ ] Opens correctly at **32×32**.
- [ ] Transparent background (checkerboard visible).
- [ ] Silhouette identifiable without reading text.
- [ ] Tested on correct tile color (white, navy, or yellow).
- [ ] No pixel darker than luminance 28 unless intentional empty space (use transparency instead of near-black).
- [ ] Filename matches ICAO: `{ICAO}.png`.
- [ ] Placed in `public/led-logos/`.

### Quick browser test (after integration)

Once wired in `lib/airlines.ts`, open the FlightWall theme with a flight from that carrier (e.g. callsign `SWA####`) and confirm the tile shows the icon, not a letter or smear.

---

## Integration (for developers)

Logos come only from images approved through the in-app tool (Admin → Approve
logos). There is **no CDN fallback** — the approval workflow writes the
source-of-truth asset to `public/airline-logos/{ICAO}.png` and records it in
`approved.json`.

Resolution order (`lib/airlines.ts`):

1. In-app native pixel mark (`lib/ledAirlineMarks.ts`) when one exists for the ICAO — best legibility at LED matrix scale.
2. Approved local logo via `approvedLogoUrl(icao)` (`lib/approvedLogos.ts`) → `/airline-logos/{ICAO}.png`.
3. Otherwise an IATA text monogram (no remote image is ever fetched).

```ts
// Approved local asset only; undefined falls through to the text monogram / LED text fallback.
export function airlineLedLogoUrl(brand: AirlineBrand): string | undefined {
  if (LED_NATIVE_MARK_ICAO.has(brand.icao)) return undefined; // native pixel mark
  return approvedLogoUrl(brand.icao);
}
```

---

## Priority order

1. **SWA** — heart with wings (current pain point: reads as “K” or `WN`)
2. **UAL, DAL, AAL** — high traffic over Denver
3. **FFT, JBU, ASA**
4. **SKW, ENY, RPA** — regional operators

---

## Tools that work well

- **Aseprite** — native 32×32 grid, export PNG
- **Piskel** (free, browser) — pixel grid
- **Figma** — frame 32×32, pixel grid, export 1×
- **ImageMagick** (nearest-neighbor downscale for QA only):

```bash
magick input.png -resize 32x32! -filter point public/led-logos/SWA.png
```

Use `-filter point` (nearest neighbor). **Do not** use smooth scaling for production art.

---

## Legal note

These are **stylized pixel interpretations** for a personal flight display, not official airline assets. Keep designs **simplified and iconic** — suggestive of livery colors and marks, not traced trademark PDFs. For personal / hobby use only.
