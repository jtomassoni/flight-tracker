"use strict";
var LegacyLedWall = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // lib/legacyLedWallRuntime.ts
  var legacyLedWallRuntime_exports = {};
  __export(legacyLedWallRuntime_exports, {
    LegacyLedWall: () => LegacyLedWall,
    aircraftToLedContent: () => aircraftToLedContent,
    createLedWallPainter: () => createLedWallPainter,
    detectOrientation: () => detectOrientation
  });

  // lib/airlines.ts
  var AIRLINES = {
    UAL: {
      name: "United",
      icao: "UAL",
      iata: "UA",
      primaryColor: "#0033A0",
      accentColor: "#FFFFFF",
      secondaryColor: "#0D8BD9",
      logoUrl: "https://images.kiwi.com/airlines/128/UA.png"
    },
    SWA: {
      name: "Southwest",
      icao: "SWA",
      iata: "WN",
      primaryColor: "#304CB2",
      accentColor: "#FFB612",
      secondaryColor: "#C8102E",
      logoUrl: "https://images.kiwi.com/airlines/128/WN.png"
    },
    DAL: {
      name: "Delta",
      icao: "DAL",
      iata: "DL",
      primaryColor: "#003366",
      accentColor: "#C8102E",
      secondaryColor: "#FFFFFF",
      logoUrl: "https://images.kiwi.com/airlines/128/DL.png"
    },
    AAL: {
      name: "American",
      icao: "AAL",
      iata: "AA",
      primaryColor: "#0078D2",
      accentColor: "#C8102E",
      secondaryColor: "#FFFFFF",
      logoUrl: "https://images.kiwi.com/airlines/128/AA.png"
    },
    FFT: {
      name: "Frontier",
      icao: "FFT",
      iata: "F9",
      primaryColor: "#006747",
      accentColor: "#8CD600",
      secondaryColor: "#FFFFFF",
      logoUrl: "https://images.kiwi.com/airlines/128/F9.png"
    },
    JBU: {
      name: "JetBlue",
      icao: "JBU",
      iata: "B6",
      primaryColor: "#003087",
      accentColor: "#FFFFFF",
      secondaryColor: "#6699CC",
      logoUrl: "https://images.kiwi.com/airlines/128/B6.png"
    },
    ASA: {
      name: "Alaska",
      icao: "ASA",
      iata: "AS",
      primaryColor: "#01426A",
      accentColor: "#48BFE5",
      secondaryColor: "#95C93D",
      logoUrl: "https://images.kiwi.com/airlines/128/AS.png"
    },
    SKW: {
      name: "SkyWest",
      icao: "SKW",
      iata: "OO",
      primaryColor: "#1B365D",
      accentColor: "#C4D600",
      secondaryColor: "#0072CE",
      logoUrl: "https://images.kiwi.com/airlines/128/OO.png"
    },
    ENY: {
      name: "Envoy",
      icao: "ENY",
      iata: "MQ",
      primaryColor: "#003366",
      accentColor: "#C8102E",
      secondaryColor: "#FFFFFF",
      logoUrl: "https://images.kiwi.com/airlines/128/MQ.png"
    },
    RPA: {
      name: "Republic",
      icao: "RPA",
      iata: "YX",
      primaryColor: "#1F3A5F",
      accentColor: "#E8B923",
      secondaryColor: "#FFFFFF",
      logoUrl: "https://images.kiwi.com/airlines/128/YX.png"
    },
    NKS: {
      name: "Spirit",
      icao: "NKS",
      iata: "NK",
      primaryColor: "#FFD100",
      accentColor: "#000000",
      secondaryColor: "#FFFFFF",
      logoUrl: "https://images.kiwi.com/airlines/128/NK.png"
    }
  };
  var FALLBACK_BRAND = {
    name: "Unknown",
    icao: "UNK",
    iata: "XX",
    primaryColor: "#334155",
    accentColor: "#94A3B8",
    logoUrl: "https://images.kiwi.com/airlines/64/XX.png"
  };
  var AIRLINE_ICAO_LIST = Object.keys(AIRLINES).sort();
  function getAirlineFromCallsign(callsign) {
    var _a;
    if (!callsign) return null;
    const prefix = callsign.trim().slice(0, 3).toUpperCase();
    return (_a = AIRLINES[prefix]) != null ? _a : null;
  }
  function getAirlineBrand(callsign) {
    var _a;
    return (_a = getAirlineFromCallsign(callsign)) != null ? _a : FALLBACK_BRAND;
  }
  function hexToRgb(hex) {
    const normalized = hex.replace("#", "");
    return {
      r: parseInt(normalized.slice(0, 2), 16),
      g: parseInt(normalized.slice(2, 4), 16),
      b: parseInt(normalized.slice(4, 6), 16)
    };
  }
  function mixHex(hex, target, amount) {
    const a = hexToRgb(hex);
    const b = hexToRgb(target);
    const mix = (x, y) => Math.round(x + (y - x) * amount);
    const r = mix(a.r, b.r);
    const g = mix(a.g, b.g);
    const bl = mix(a.b, b.b);
    return `#${[r, g, bl].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
  }
  function luminance(hex) {
    const { r, g, b } = hexToRgb(hex);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  }
  var LED_LOGO_PALETTE = {
    FFT: ["#FFFFFF", "#006747"],
    UAL: ["#FFFFFF", "#0033A0"],
    DAL: ["#C8102E", "#003366"],
    JBU: ["#FFFFFF", "#003087"],
    ASA: ["#FFFFFF", "#01426A"],
    SKW: ["#FFFFFF", "#C4D600"],
    NKS: ["#000000", "#FFFFFF"]
  };
  var LED_LOGO_NO_TILE_BORDER = /* @__PURE__ */ new Set(["JBU", "SWA"]);
  function airlineLedLogoPalette(brand, logoBackground) {
    const override = LED_LOGO_PALETTE[brand.icao];
    if (override) return override;
    const bg = logoBackground.toLowerCase();
    const seen = /* @__PURE__ */ new Set();
    const palette = [];
    for (const hex of [brand.accentColor, brand.secondaryColor, brand.primaryColor]) {
      if (!hex) continue;
      const key = hex.toLowerCase();
      if (key === bg || seen.has(key)) continue;
      seen.add(key);
      palette.push(hex);
    }
    if (luminance(logoBackground) < 0.35 && !seen.has("#ffffff")) {
      palette.unshift("#ffffff");
    }
    return palette;
  }
  var COLOR_LOGO_TILE = /* @__PURE__ */ new Set(["AAL", "FFT", "ASA"]);
  function getAirlineLedWallStyle(brand) {
    if (COLOR_LOGO_TILE.has(brand.icao)) {
      const logoBackground2 = "#ffffff";
      return {
        logoBackground: logoBackground2,
        logoBorder: mixHex(brand.primaryColor, "#000000", 0.25),
        accentStripe: brand.accentColor,
        logoPalette: airlineLedLogoPalette(brand, logoBackground2),
        logoTileBorder: !LED_LOGO_NO_TILE_BORDER.has(brand.icao)
      };
    }
    const onDarkLogo = ["UAL", "DAL", "SKW", "JBU", "SWA"].includes(brand.icao);
    const logoBackground = onDarkLogo ? brand.primaryColor : "#e8edf2";
    return {
      logoBackground,
      logoBorder: mixHex(brand.primaryColor, "#000000", 0.25),
      accentStripe: brand.accentColor,
      logoPalette: airlineLedLogoPalette(brand, logoBackground),
      logoTileBorder: !LED_LOGO_NO_TILE_BORDER.has(brand.icao)
    };
  }
  function airlineLogoCanvasUrl(brand, size = 128) {
    return `/api/airline-logo?iata=${encodeURIComponent(brand.iata)}&size=${size}`;
  }
  var LED_NATIVE_MARK_ICAO = /* @__PURE__ */ new Set(["AAL", "SWA", "DAL", "SKW"]);
  function airlineLedLogoUrl(brand, size = 128) {
    if (LED_NATIVE_MARK_ICAO.has(brand.icao)) return void 0;
    return airlineLogoCanvasUrl(brand, size);
  }

  // lib/ledFlightWall.ts
  var ROUTE_PAIRS = [
    "ORD-LAX",
    "DEN-PHX",
    "ATL-MIA",
    "JFK-SFO",
    "SEA-LAS",
    "DFW-ORD",
    "BOS-DCA",
    "LAX-JFK",
    "DEN-LAX",
    "PHX-DEN",
    "SFO-SEA",
    "IAH-ORD",
    "MSP-ATL",
    "CLT-BOS",
    "MCO-EWR",
    "OAK-SEA"
  ];
  function ledRouteLabel(ac) {
    const hash = ac.hex.split("").reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
    return ROUTE_PAIRS[hash % ROUTE_PAIRS.length];
  }
  function formatLedRouteHero(route) {
    const [origin, dest] = route.split("-");
    return `${origin != null ? origin : "???"}\u2192${dest != null ? dest : "???"}`;
  }
  function formatLedFlightId(ac, brand) {
    var _a, _b;
    const raw = ((_a = ac.flightNumber) == null ? void 0 : _a.trim()) || ((_b = ac.callsign) == null ? void 0 : _b.trim().slice(3)) || "";
    const digits = raw.replace(/\D/g, "");
    const num = digits || raw || "----";
    return `${brand.iata} ${num}`;
  }
  function formatLedAircraftType(ac) {
    var _a, _b;
    const raw = ((_a = ac.aircraftType) == null ? void 0 : _a.trim()) || ((_b = ac.category) == null ? void 0 : _b.trim());
    if (!raw) return "Unknown";
    return raw.replace(/^Boeing\s+/i, "B").replace(/^Airbus\s+/i, "A");
  }
  function formatLedSpeedMph(groundSpeedKt) {
    if (groundSpeedKt == null) return "--- mph";
    const mph = Math.round(groundSpeedKt * 1.15078);
    return `${mph} mph`;
  }
  function ledTelemetryFields(ac) {
    return [
      { value: formatLedAircraftType(ac) },
      { value: formatLedSpeedMph(ac.groundSpeedKt) }
    ];
  }

  // lib/ledFont.ts
  var GLYPHS = {
    " ": [0, 0, 0, 0, 0, 0, 0],
    "!": [4, 4, 4, 4, 0, 4, 0],
    "+": [0, 4, 4, 31, 4, 4, 0],
    "-": [0, 0, 0, 31, 0, 0, 0],
    "\xB7": [0, 0, 4, 0, 0, 0, 0],
    "\xB0": [6, 9, 9, 6, 0, 0, 0],
    "\u2192": [8, 4, 2, 31, 2, 4, 8],
    ">": [8, 4, 2, 4, 8, 0, 0],
    ".": [0, 0, 0, 0, 0, 4, 4],
    "/": [1, 1, 2, 4, 8, 16, 16],
    "0": [14, 17, 19, 21, 25, 17, 14],
    "1": [4, 12, 4, 4, 4, 4, 14],
    "2": [14, 17, 1, 14, 16, 16, 31],
    "3": [30, 1, 14, 1, 1, 17, 14],
    "4": [2, 6, 10, 18, 31, 2, 2],
    "5": [31, 16, 30, 1, 1, 17, 14],
    "6": [14, 16, 30, 17, 17, 17, 14],
    "7": [31, 1, 2, 4, 4, 4, 4],
    "8": [14, 17, 17, 14, 17, 17, 14],
    "9": [14, 17, 17, 15, 1, 2, 12],
    ":": [0, 4, 0, 0, 4, 0, 0],
    A: [14, 17, 17, 31, 17, 17, 17],
    B: [30, 17, 17, 30, 17, 17, 30],
    C: [14, 17, 16, 16, 16, 17, 14],
    D: [30, 17, 17, 17, 17, 17, 30],
    E: [31, 16, 16, 30, 16, 16, 31],
    F: [31, 16, 16, 30, 16, 16, 16],
    G: [14, 17, 16, 23, 17, 17, 14],
    H: [17, 17, 17, 31, 17, 17, 17],
    I: [14, 4, 4, 4, 4, 4, 14],
    J: [7, 2, 2, 2, 18, 18, 12],
    K: [17, 18, 20, 24, 20, 18, 17],
    L: [16, 16, 16, 16, 16, 16, 31],
    M: [17, 27, 21, 21, 17, 17, 17],
    N: [17, 25, 21, 19, 17, 17, 17],
    O: [14, 17, 17, 17, 17, 17, 14],
    P: [30, 17, 17, 30, 16, 16, 16],
    Q: [14, 17, 17, 17, 21, 18, 13],
    R: [30, 17, 17, 30, 20, 18, 17],
    S: [14, 17, 16, 14, 1, 17, 14],
    T: [31, 4, 4, 4, 4, 4, 4],
    U: [17, 17, 17, 17, 17, 17, 14],
    V: [17, 17, 17, 17, 10, 10, 4],
    W: [17, 17, 17, 21, 21, 21, 17],
    X: [17, 17, 10, 4, 10, 17, 17],
    Y: [17, 17, 10, 4, 4, 4, 4],
    Z: [31, 1, 2, 4, 8, 16, 31]
  };
  var LED_FONT = {
    glyphW: 5,
    glyphH: 7,
    gapX: 2,
    gapY: 2
  };
  function ledCharCellW() {
    return LED_FONT.glyphW + LED_FONT.gapX;
  }
  function ledCharCellH() {
    return LED_FONT.glyphH + LED_FONT.gapY;
  }
  function glyphFor(ch) {
    var _a;
    const key = ch.toUpperCase();
    return (_a = GLYPHS[key]) != null ? _a : GLYPHS[" "];
  }
  function measureLedText(text) {
    if (!text) return 0;
    return text.length * ledCharCellW() - LED_FONT.gapX;
  }
  function truncateLedText(text, maxDots) {
    if (maxDots <= 0 || !text) return "";
    const cell = ledCharCellW();
    const maxChars = Math.max(1, Math.floor((maxDots + LED_FONT.gapX) / cell));
    if (text.length <= maxChars) return text;
    if (maxChars <= 1) return text.slice(0, 1);
    return `${text.slice(0, maxChars - 1)}.`;
  }
  function ledScaledCellW(scaleX) {
    return scaleX * LED_FONT.glyphW + LED_FONT.gapX;
  }
  function ledScaledTextMetrics(text, scaleX, scaleY) {
    if (!text) return { width: 0, height: 0 };
    return {
      width: text.length * ledScaledCellW(scaleX) - LED_FONT.gapX,
      height: scaleY * LED_FONT.glyphH
    };
  }
  function truncateLedTextScaled(text, maxDots, scaleX) {
    if (maxDots <= 0 || !text) return "";
    const cell = ledScaledCellW(scaleX);
    const maxChars = Math.max(1, Math.floor((maxDots + LED_FONT.gapX) / cell));
    if (text.length <= maxChars) return text;
    if (maxChars <= 1) return text.slice(0, 1);
    return `${text.slice(0, maxChars - 1)}.`;
  }
  function pickFlightIdScale(text, bandW, bandH) {
    for (const scale of [2, 1]) {
      const { width, height } = ledScaledTextMetrics(text, scale, scale);
      if (width <= bandW && height + 2 <= bandH) {
        return { scaleX: scale, scaleY: scale };
      }
    }
    return { scaleX: 1, scaleY: 1 };
  }
  function drawGlyphPixels(ctx, glyph, ox, y, scaleX, scaleY, bold) {
    var _a;
    const thicken = bold && scaleX === 1 && scaleY === 1;
    for (let row = 0; row < LED_FONT.glyphH; row += 1) {
      const bits = (_a = glyph[row]) != null ? _a : 0;
      for (let col = 0; col < LED_FONT.glyphW; col += 1) {
        if (bits >> LED_FONT.glyphW - 1 - col & 1) {
          ctx.fillRect(ox + col * scaleX, y + row * scaleY, scaleX, scaleY);
          if (thicken && row + 1 < LED_FONT.glyphH) {
            ctx.fillRect(ox + col * scaleX, y + (row + 1) * scaleY, scaleX, scaleY);
          }
        }
      }
    }
  }
  function drawLedTextScaled(ctx, text, x, y, color, maxDots, scaleX, scaleY, bold = false) {
    const display = maxDots != null ? truncateLedTextScaled(text, maxDots, scaleX) : text;
    if (!display) return;
    const { height } = ledScaledTextMetrics(display, scaleX, scaleY);
    ctx.save();
    if (maxDots != null && maxDots > 0) {
      ctx.beginPath();
      ctx.rect(x, y, maxDots, height);
      ctx.clip();
    }
    ctx.fillStyle = color;
    for (let i = 0; i < display.length; i += 1) {
      const glyph = glyphFor(display[i]);
      const ox = x + i * ledScaledCellW(scaleX);
      drawGlyphPixels(ctx, glyph, ox, y, scaleX, scaleY, bold);
    }
    ctx.restore();
  }
  function drawLedText(ctx, text, x, y, color, maxDots, bold = false) {
    drawLedTextScaled(ctx, text, x, y, color, maxDots, 1, 1, bold);
  }
  function drawLedTextRight(ctx, text, rightX, y, color, maxDots, bold = false) {
    const display = truncateLedText(text, maxDots);
    const width = measureLedText(display);
    const x = Math.max(0, rightX - width);
    drawLedText(ctx, display, x, y, color, rightX - x + 1, bold);
  }
  var COMPACT_GLYPHS = {
    " ": [0, 0, 0, 0, 0],
    "-": [0, 0, 15, 0, 0],
    ".": [0, 0, 0, 0, 8],
    ",": [0, 0, 0, 8, 4],
    "/": [1, 2, 4, 8, 0],
    "0": [14, 9, 9, 9, 14],
    "1": [6, 14, 6, 6, 15],
    "2": [14, 1, 6, 8, 15],
    "3": [14, 1, 6, 1, 14],
    "4": [6, 10, 15, 2, 2],
    "5": [15, 8, 14, 1, 14],
    "6": [6, 8, 14, 9, 14],
    "7": [15, 1, 2, 4, 4],
    "8": [14, 9, 6, 9, 14],
    "9": [14, 9, 7, 1, 14],
    A: [14, 9, 15, 9, 9],
    B: [14, 9, 14, 9, 14],
    C: [14, 8, 8, 8, 14],
    D: [14, 9, 9, 9, 14],
    E: [15, 8, 14, 8, 15],
    F: [15, 8, 14, 8, 8],
    G: [14, 8, 11, 9, 14],
    H: [9, 9, 15, 9, 9],
    I: [14, 4, 4, 4, 14],
    J: [7, 2, 2, 10, 4],
    K: [9, 10, 12, 10, 9],
    L: [8, 8, 8, 8, 15],
    M: [9, 15, 15, 9, 9],
    N: [9, 13, 11, 9, 9],
    O: [14, 9, 9, 9, 14],
    P: [14, 9, 14, 8, 8],
    Q: [14, 9, 9, 11, 7],
    R: [14, 9, 14, 10, 9],
    S: [7, 8, 6, 1, 14],
    T: [15, 4, 4, 4, 4],
    U: [9, 9, 9, 9, 14],
    V: [9, 9, 9, 6, 4],
    W: [9, 9, 15, 15, 9],
    X: [9, 6, 4, 6, 9],
    Y: [9, 9, 6, 4, 4],
    Z: [15, 2, 4, 8, 15],
    "\xB0": [6, 9, 6, 0, 0]
  };
  var LED_FONT_COMPACT = {
    glyphW: 4,
    glyphH: 5,
    gapX: 2,
    gapY: 1
  };
  function ledCompactCellW() {
    return LED_FONT_COMPACT.glyphW + LED_FONT_COMPACT.gapX;
  }
  function ledCompactCellH() {
    return LED_FONT_COMPACT.glyphH + LED_FONT_COMPACT.gapY;
  }
  function compactGlyphFor(ch) {
    var _a;
    const key = ch.toUpperCase();
    return (_a = COMPACT_GLYPHS[key]) != null ? _a : COMPACT_GLYPHS[" "];
  }
  function measureLedTextCompact(text) {
    if (!text) return 0;
    return text.length * ledCompactCellW() - LED_FONT_COMPACT.gapX;
  }
  function truncateLedTextCompact(text, maxDots) {
    if (maxDots <= 0 || !text) return "";
    const cell = ledCompactCellW();
    const maxChars = Math.max(1, Math.floor((maxDots + LED_FONT_COMPACT.gapX) / cell));
    if (text.length <= maxChars) return text;
    if (maxChars <= 1) return text.slice(0, 1);
    return `${text.slice(0, maxChars - 1)}.`;
  }
  function drawLedTextCompact(ctx, text, x, y, color, maxDots) {
    var _a;
    const display = maxDots != null ? truncateLedTextCompact(text, maxDots) : text;
    if (!display) return;
    ctx.save();
    if (maxDots != null && maxDots > 0) {
      ctx.beginPath();
      ctx.rect(x, y, maxDots, LED_FONT_COMPACT.glyphH);
      ctx.clip();
    }
    ctx.fillStyle = color;
    for (let i = 0; i < display.length; i += 1) {
      const glyph = compactGlyphFor(display[i]);
      const ox = x + i * ledCompactCellW();
      for (let row = 0; row < LED_FONT_COMPACT.glyphH; row += 1) {
        const bits = (_a = glyph[row]) != null ? _a : 0;
        for (let col = 0; col < LED_FONT_COMPACT.glyphW; col += 1) {
          if (bits >> LED_FONT_COMPACT.glyphW - 1 - col & 1) {
            ctx.fillRect(ox + col, y + row, 1, 1);
          }
        }
      }
    }
    ctx.restore();
  }
  function drawLedTextCompactRight(ctx, text, rightX, y, color, maxDots) {
    const display = truncateLedTextCompact(text, maxDots);
    const width = measureLedTextCompact(display);
    const x = Math.max(0, rightX - width);
    drawLedTextCompact(ctx, display, x, y, color, rightX - x + 1);
  }

  // lib/ledAirlineMarks.ts
  var LED_MARK_NATIVE_SIZE = 41;
  function buildUpTriangleMark(size, padTop, triRows, baseRows, fill) {
    const rows = Array.from({ length: size }, () => ".".repeat(size));
    for (let i = 0; i < triRows; i += 1) {
      const width = 2 * i + 1;
      const left = Math.floor((size - width) / 2);
      const y = padTop + i;
      rows[y] = ".".repeat(left) + fill.repeat(width) + ".".repeat(size - left - width);
    }
    const baseY = padTop + triRows;
    for (let b = 0; b < baseRows; b += 1) {
      rows[baseY + b] = fill.repeat(size);
    }
    return rows.join("");
  }
  var SWA_MARK = {
    w: LED_MARK_NATIVE_SIZE,
    h: LED_MARK_NATIVE_SIZE,
    palette: {
      B: "#304CB2",
      Y: "#FFB612",
      R: "#C8102E"
    },
    pixels: [
      ".........................................",
      ".........................................",
      "..........RRRR........RRRRRR.............",
      "..........RRRR........RRRRRR.............",
      "........RRRRRRRRRR..RRRRRRRR.............",
      "........RRRRRRRRRR..RRRRRRRR.............",
      "......RRRRRRRRRRRRRRRRRRRRRRRR...........",
      "......RRRRRRRRRRRRRRRRRRRRRRRR...........",
      "....RRRRRRRRRRRRRRRRBBBBBBBBBBBBBB.......",
      "....RRRRRRRRRRRRRRRRBBBBBBBBBBBBBB.......",
      "....RRRRRRRRRRRRRRBBBBBBBBBBBBBBBBBB.....",
      "....RRRRRRRRRRRRRRBBBBBBBBBBBBBBBBBB.....",
      "..RRRRRRRRRRRRRRBBBBBBBBBBBBBBBBBBBB.....",
      "..RRRRRRRRRRRRRRBBBBBBBBBBBBBBBBBBBB.....",
      "..RRRRRRRRRRRRBBBBBBBBBBBBBBBBBBBBBBYY...",
      "..RRRRRRRRRRRRBBBBBBBBBBBBBBBBBBBBBBYY...",
      "..RRRRRRRRRRRRBBBBBBBBBBBBBBBBBBBBBBYYYY.",
      "..RRRRRRRRRRRRBBBBBBBBBBBBBBBBBBBBBBYYYY.",
      "..RRRRRRRRRRBBBBBBBBBBBBBBBBBBBBBBYYYYYY.",
      "..RRRRRRRRRRBBBBBBBBBBBBBBBBBBBBBBYYYYYY.",
      "..RRRRRRRRBBBBBBBBBBBBBBBBBBBBBBYYYYYYYY.",
      "..RRRRRRRRBBBBBBBBBBBBBBBBBBBBBBYYYYYYYY.",
      "..RRRRRRBBBBBBBBBBBBBBBBBBBBBBYYYYYYYYYY.",
      "..RRRRRRBBBBBBBBBBBBBBBBBBBBBBYYYYYYYYYY.",
      "..RRRRBBBBBBBBBBBBBBBBBBBBYYYYYYYYYYYY...",
      "..RRRRBBBBBBBBBBBBBBBBBBBBYYYYYYYYYYYY...",
      "..RRBBBBBBBBBBBBBBBBBBBBYYYYYYYYYYYYYY...",
      "..RRBBBBBBBBBBBBBBBBBBBBYYYYYYYYYYYYYY...",
      "....BBBBBBBBBBBBBBBBBBYYYYYYYYYYYYYYYY...",
      "....BBBBBBBBBBBBBBBBBBYYYYYYYYYYYYYYYY...",
      "......BBBBBBBBBBBBBBYYYYYYYYYYYYYYYY.....",
      "......BBBBBBBBBBBBBBYYYYYYYYYYYYYYYY.....",
      "........BBBBBBBBBBBBYYYYYYYYYYYYYY.......",
      "........BBBBBBBBBBBBYYYYYYYYYYYYYY.......",
      "..........BBBBBBBBBBYYYYYYYYYYYY.........",
      "..........BBBBBBBBBBYYYYYYYYYYYY.........",
      "............BBBBBBBBYYYYYYYYYY...........",
      "............BBBBBBBBYYYYYYYYYY...........",
      "..............BBBBYYYYYYYYYY.............",
      "..............BBBBYYYYYYYYYY.............",
      "................YYYYYYYYYY..............."
    ].join("")
  };
  var DAL_MARK = {
    w: LED_MARK_NATIVE_SIZE,
    h: LED_MARK_NATIVE_SIZE,
    palette: {
      R: "#C8102E"
    },
    pixels: buildUpTriangleMark(LED_MARK_NATIVE_SIZE, 4, 20, 2, "R")
  };
  var AAL_MARK = {
    w: LED_MARK_NATIVE_SIZE,
    h: LED_MARK_NATIVE_SIZE,
    palette: {
      B: "#0078D2",
      R: "#C8102E"
    },
    pixels: [
      ".........................................",
      ".........................................",
      ".........................................",
      ".........................................",
      "...BBBB..................................",
      "...BBBBBBB...............................",
      "....BBBBBBB..............................",
      ".....BBBBBBB.............................",
      "......BBBBBBB............................",
      "......BBBBBBBB...........................",
      ".......BBBBBBBB..........................",
      ".......BBBBBBBBB.........................",
      "........BBBBBBBB.........................",
      ".........BBBBBBBB........................",
      ".........BBBBBBBBB.......................",
      "..........BBBBBBBBB......................",
      "...........BBBBBBBBB.....................",
      ".........................................",
      "....................BBBB.................",
      ".....................BBBBB...............",
      ".......................BBBB..............",
      ".....................RRRRR...............",
      "....................RRRRRR...............",
      "...................RRRRRRRR..............",
      "..................RRRRRRRRRR.............",
      ".................RRRRRRRRRRRR............",
      "................RRRRRRRRRRRRR............",
      "................RRRRRRRRRRRRRR...........",
      "...............RRRRRRRRRRRRRRR...........",
      "...............RRRRRRRRRRRRRRR...........",
      "..............RRRRRRRRRRRRRRRR...........",
      ".............RRRRRRRRRRRRRRRRR...........",
      ".............RRRRRRRRRRRRRRRRRR..........",
      "............RRRRRRRRRRRRRRRRRRR..........",
      "............RRRRRRRRRRRRRRRRRRRR.........",
      "...........RRRRRRRRRRRRRRRRRRRRR.........",
      "..........RRRRRRRRRRRRRRRRRRRRRR.........",
      "...........RRRRRRRRRRRRRRRRRRRR..........",
      ".........................................",
      ".........................................",
      "........................................."
    ].join("")
  };
  var SKW_MARK = {
    w: LED_MARK_NATIVE_SIZE,
    h: LED_MARK_NATIVE_SIZE,
    palette: {
      B: "#0072CE"
    },
    pixels: [
      ".........................................",
      ".........................................",
      ".........................................",
      ".........................................",
      ".........................................",
      ".........................................",
      "......BBBBBBBBBBBBBB..........BB.........",
      "......BBBBBBBBBBBBBB..........BB.........",
      "....BBBBBBBBBBBBBBBBBB....BBBBBBBB.......",
      "....BBBBBBBBBBBBBBBBBB....BBBBBBBB.......",
      "..BBBBBBBB....BBBBBBBBBBBB..BBBBBBBB.....",
      "..BBBBBBBB....BBBBBBBBBBBB..BBBBBBBB.....",
      "..BBBBBBBB......BBBBBB..BB..BBBBBBBB.....",
      "..BBBBBBBB......BBBBBB..BB..BBBBBBBB.....",
      "..BBBBBBBB......BBBBBB..BB..BBBBBBBB.....",
      "..BBBBBBBB......BBBBBB..BB..BBBBBBBB.....",
      "....BBBBBB....BBBBBB....BBBBBB..BBBBBB...",
      "....BBBBBB....BBBBBB....BBBBBB..BBBBBB...",
      "......BBBBBBBBBBBBBB........BBBBBBBB.....",
      "......BBBBBBBBBBBBBB........BBBBBBBB.....",
      "........BBBBBBBBBBBB..........BBBBBB.....",
      "........BBBBBBBBBBBB..........BBBBBB.....",
      "..........BBBBBBBB............BBBBBB.....",
      "..........BBBBBBBB............BBBBBB.....",
      "............BBBB..............BBBBBB.....",
      "............BBBB..............BBBBBB.....",
      "............BBBB................BB.......",
      "............BBBB................BB.......",
      "..........BBBBBB................BB.......",
      "..........BBBBBB................BB.......",
      "........BBBBBBBBBB................BB.....",
      "........BBBBBBBBBB................BB.....",
      "......BBBBBBBBBB.........................",
      "......BBBBBBBBBB.........................",
      ".........................................",
      ".........................................",
      ".........................................",
      ".........................................",
      ".........................................",
      ".........................................",
      "........................................."
    ].join("")
  };
  var MARKS = {
    AAL: AAL_MARK,
    SWA: SWA_MARK,
    DAL: DAL_MARK,
    SKW: SKW_MARK
  };
  function markBounds(mark) {
    let minX = mark.w;
    let minY = mark.h;
    let maxX = -1;
    let maxY = -1;
    for (let row = 0; row < mark.h; row += 1) {
      for (let col = 0; col < mark.w; col += 1) {
        const key = mark.pixels[row * mark.w + col];
        if (!key || key === ".") continue;
        minX = Math.min(minX, col);
        minY = Math.min(minY, row);
        maxX = Math.max(maxX, col);
        maxY = Math.max(maxY, row);
      }
    }
    if (maxX < 0) return null;
    return { minX, minY, maxX, maxY };
  }
  function drawLedAirlineMark(ctx, icao, x, y, w, h) {
    const mark = MARKS[icao];
    if (!mark) return false;
    const bounds = markBounds(mark);
    if (!bounds) return false;
    const contentW = bounds.maxX - bounds.minX + 1;
    const contentH = bounds.maxY - bounds.minY + 1;
    const margin = 1;
    const availW = Math.max(1, w - margin * 2);
    const availH = Math.max(1, h - margin * 2);
    const fitScale = Math.min(availW / contentW, availH / contentH);
    const scale = Math.min(1, Math.floor(fitScale)) || 1;
    const drawW = contentW * scale;
    const drawH = contentH * scale;
    const ox = x + Math.floor((w - drawW) / 2);
    const oy = y + Math.floor((h - drawH) / 2);
    for (let row = bounds.minY; row <= bounds.maxY; row += 1) {
      for (let col = bounds.minX; col <= bounds.maxX; col += 1) {
        const key = mark.pixels[row * mark.w + col];
        if (!key || key === ".") continue;
        const color = mark.palette[key];
        if (!color) continue;
        const dx = col - bounds.minX;
        const dy = row - bounds.minY;
        ctx.fillStyle = color;
        for (let sy = 0; sy < scale; sy += 1) {
          for (let sx = 0; sx < scale; sx += 1) {
            ctx.fillRect(ox + dx * scale + sx, oy + dy * scale + sy, 1, 1);
          }
        }
      }
    }
    return true;
  }

  // lib/ledMatrix.ts
  var LED_GRID = {
    landscape: { cols: 128, rows: 32 },
    portrait: { cols: 64, rows: 64 }
  };
  var LED_COLORS = {
    phosphor: "#ececec",
    hero: "#ffffff",
    telemetry: "#72dcff",
    dim: "#b0b0b0",
    muted: "#808080",
    panel: "#000000",
    unlit: "#0a0a0a"
  };
  var TEXT_THRESHOLD = 100;
  var LOGO_MARK_ALPHA = 140;
  var LOGO_QUANT_STEP = 51;
  var LOGO_SRC_INSET = 0.07;
  function ledGridForOrientation(orientation) {
    return LED_GRID[orientation];
  }
  function ledWallRowCount(cols, baseRows, viewportWidth, viewportHeight) {
    if (viewportWidth <= 0 || viewportHeight <= 0) return baseRows;
    const cellSize = viewportWidth / cols;
    return Math.max(baseRows, Math.ceil(viewportHeight / cellSize));
  }
  var COMPACT_SAFE = 5;
  var LOGO_LEFT_INSET = 2;
  var LOGO_RIGHT_INSET = 1;
  var LOGO_TOP_INSET = 1;
  var LOGO_BOTTOM_GAP = 2;
  var RIGHT_COL_GAP = 4;
  var RIGHT_COL_PAD = 3;
  var RIGHT_BAND_INSET = 3;
  var LOGO_WIDTH_FRACTION = 0.4;
  var LOGO_SIZE_SCALE = 0.92;
  var ROUTE_ZONE_RATIO = 0.58;
  function computeLogoColumnWidth(cols) {
    return Math.max(12, Math.floor(cols * LOGO_WIDTH_FRACTION));
  }
  function computeLogoColumn(cols, rows) {
    const columnW = computeLogoColumnWidth(cols);
    const maxFlightH = 2 * LED_FONT.glyphH + LED_FONT.gapY;
    const flightBandMin = maxFlightH + 2;
    const logoTopMin = flightBandMin + LOGO_TOP_INSET;
    const logoBandW = columnW - LOGO_LEFT_INSET - LOGO_RIGHT_INSET;
    const sizeScale = Math.min(1.1, LOGO_SIZE_SCALE);
    const maxSide = Math.min(
      logoBandW,
      rows - LOGO_TOP_INSET - LOGO_BOTTOM_GAP
    );
    let logoW = Math.max(12, Math.floor(maxSide * sizeScale));
    logoW = Math.min(logoW, logoBandW);
    let logoH = logoW;
    let logoY = rows - logoH - LOGO_BOTTOM_GAP;
    if (logoY < logoTopMin) {
      const fitSide = rows - logoTopMin - LOGO_BOTTOM_GAP;
      logoH = Math.max(12, Math.min(Math.floor(fitSide * sizeScale), fitSide));
      logoW = Math.min(logoH, logoBandW);
      logoH = logoW;
      logoY = rows - logoH - LOGO_BOTTOM_GAP;
    }
    return {
      columnW,
      logoW,
      logoH,
      logoX: LOGO_LEFT_INSET,
      logoY,
      flightX: LOGO_LEFT_INSET,
      flightBandH: logoY,
      flightW: logoW
    };
  }
  function centerLedTextXScaled(text, bandX, bandW, scaleX) {
    const display = truncateLedTextScaled(text, bandW, scaleX);
    const { width } = ledScaledTextMetrics(display, scaleX, 1);
    return bandX + Math.max(0, Math.floor((bandW - width) / 2));
  }
  function parseLedRouteHero(hero) {
    const arrow = hero.indexOf("\u2192");
    if (arrow >= 0) {
      return {
        origin: hero.slice(0, arrow).trim(),
        dest: hero.slice(arrow + 1).trim()
      };
    }
    return { origin: hero.trim(), dest: "" };
  }
  function buildRightContentLayout(rows, logoY, logoH) {
    const bandTop = logoY + RIGHT_BAND_INSET;
    const bandBottom = Math.min(rows - 1, logoY + logoH - RIGHT_BAND_INSET);
    const bandH = Math.max(ledCompactCellH() * 2, bandBottom - bandTop);
    const routeZoneH = Math.max(ledCharCellH(), Math.floor(bandH * ROUTE_ZONE_RATIO));
    const statsZoneH = bandH - routeZoneH;
    const routeZoneTop = bandTop;
    const statsZoneTop = bandTop + routeZoneH;
    const useStackedRoute = routeZoneH >= ledCharCellH() * 2 + 6;
    const statsUseFullFont = statsZoneH >= ledCharCellH() + 1;
    return {
      bandTop,
      bandH,
      routeZoneTop,
      routeZoneH,
      statsZoneTop,
      statsZoneH,
      useStackedRoute,
      statsUseFullFont
    };
  }
  function buildLandscapeLayout(cols, rows) {
    const pad = 1;
    const logo = computeLogoColumn(cols, rows);
    const dividerX = logo.columnW + 1;
    const mainX = logo.columnW + RIGHT_COL_GAP + RIGHT_COL_PAD;
    const mainW = cols - mainX - pad - RIGHT_COL_PAD;
    const rightLayout = buildRightContentLayout(rows, logo.logoY, logo.logoH);
    return __spreadValues({
      pad,
      logoW: logo.logoW,
      logoH: logo.logoH,
      logoX: logo.logoX,
      logoY: logo.logoY,
      mainX,
      mainW,
      telX: mainX,
      telW: mainW,
      flightX: logo.flightX,
      flightBandH: logo.flightBandH,
      flightW: logo.flightW,
      dividerX
    }, rightLayout);
  }
  function buildPortraitLayout(cols, rows) {
    return buildLandscapeLayout(cols, rows);
  }
  function drawLogoTileBackground(ctx, layout, background) {
    const { logoX, logoY, logoW, logoH } = layout;
    ctx.fillStyle = background;
    ctx.fillRect(logoX, logoY, logoW, logoH);
  }
  function parseHexColor(hex) {
    const normalized = hex.replace("#", "");
    return {
      r: parseInt(normalized.slice(0, 2), 16),
      g: parseInt(normalized.slice(2, 4), 16),
      b: parseInt(normalized.slice(4, 6), 16)
    };
  }
  function rgbToHex(r, g, b) {
    return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
  }
  function quantizeChannel(value) {
    const q = Math.round(value / LOGO_QUANT_STEP) * LOGO_QUANT_STEP;
    return Math.max(0, Math.min(255, q));
  }
  function quantizeRgb(r, g, b) {
    return {
      r: quantizeChannel(r),
      g: quantizeChannel(g),
      b: quantizeChannel(b)
    };
  }
  function colorLuminance(c) {
    return 0.299 * c.r + 0.587 * c.g + 0.114 * c.b;
  }
  function snapLogoColor(r, g, b, bg, bgHex, palette) {
    const sample = { r, g, b };
    if (rgbDistance(sample, bg) < 42) {
      return bgHex;
    }
    if (palette && palette.length === 2) {
      const a = parseHexColor(palette[0]);
      const bColor = parseHexColor(palette[1]);
      const lumA = colorLuminance(a);
      const lumB = colorLuminance(bColor);
      const lightHex = lumA >= lumB ? palette[0] : palette[1];
      const darkHex = lumA >= lumB ? palette[1] : palette[0];
      const mid = (lumA + lumB) / 2;
      return colorLuminance(sample) >= mid ? lightHex : darkHex;
    }
    if (palette && palette.length > 0) {
      let best = palette[0];
      let bestDist = Infinity;
      for (const hex of palette) {
        const c = parseHexColor(hex);
        const d = rgbDistance(sample, c);
        if (d < bestDist) {
          bestDist = d;
          best = hex;
        }
      }
      return best;
    }
    const q = quantizeRgb(r, g, b);
    return rgbDistance(q, bg) < 42 ? bgHex : rgbToHex(q.r, q.g, q.b);
  }
  function rgbDistance(a, b) {
    return Math.abs(a.r - b.r) + Math.abs(a.g - b.g) + Math.abs(a.b - b.b);
  }
  function blendOnBackground(r, g, b, a, bg) {
    const t = a / 255;
    return {
      r: Math.round(r * t + bg.r * (1 - t)),
      g: Math.round(g * t + bg.g * (1 - t)),
      b: Math.round(b * t + bg.b * (1 - t))
    };
  }
  function readLogoSource(logo) {
    const canvas = document.createElement("canvas");
    canvas.width = logo.naturalWidth;
    canvas.height = logo.naturalHeight;
    const srcCtx = canvas.getContext("2d");
    if (!srcCtx) {
      return new ImageData(1, 1);
    }
    srcCtx.drawImage(logo, 0, 0);
    return srcCtx.getImageData(0, 0, canvas.width, canvas.height);
  }
  function rasterizeLogoToTile(ctx, logo, x, y, w, h, background, palette, tileBorder = true) {
    var _a, _b, _c, _d;
    const bg = parseHexColor(background);
    const bgHex = rgbToHex(bg.r, bg.g, bg.b);
    const src = readLogoSource(logo);
    const srcW = src.width;
    const srcH = src.height;
    const scale = Math.min(w / srcW, h / srcH);
    const drawW = Math.max(1, Math.floor(srcW * scale));
    const drawH = Math.max(1, Math.floor(srcH * scale));
    const ox = x + Math.floor((w - drawW) / 2);
    const oy = y + Math.floor((h - drawH) / 2);
    for (let ly = 0; ly < h; ly += 1) {
      for (let lx = 0; lx < w; lx += 1) {
        const px = x + lx;
        const py = y + ly;
        const onTileEdge = tileBorder && (lx === 0 || lx === w - 1 || ly === 0 || ly === h - 1);
        const inMark = px >= ox && px < ox + drawW && py >= oy && py < oy + drawH;
        if (onTileEdge || !inMark) {
          ctx.fillStyle = bgHex;
          ctx.fillRect(px, py, 1, 1);
          continue;
        }
        const u = (px - ox + 0.5) / drawW;
        const v = (py - oy + 0.5) / drawH;
        const su = LOGO_SRC_INSET + u * (1 - 2 * LOGO_SRC_INSET);
        const sv = LOGO_SRC_INSET + v * (1 - 2 * LOGO_SRC_INSET);
        const sx = Math.min(srcW - 1, Math.max(0, Math.floor(su * srcW)));
        const sy = Math.min(srcH - 1, Math.max(0, Math.floor(sv * srcH)));
        const si = (sy * srcW + sx) * 4;
        const sr = (_a = src.data[si]) != null ? _a : 0;
        const sg = (_b = src.data[si + 1]) != null ? _b : 0;
        const sb = (_c = src.data[si + 2]) != null ? _c : 0;
        const sa = (_d = src.data[si + 3]) != null ? _d : 0;
        if (sa < LOGO_MARK_ALPHA) {
          ctx.fillStyle = bgHex;
          ctx.fillRect(px, py, 1, 1);
          continue;
        }
        const blended = blendOnBackground(sr, sg, sb, sa, bg);
        ctx.fillStyle = snapLogoColor(
          blended.r,
          blended.g,
          blended.b,
          bg,
          bgHex,
          palette
        );
        ctx.fillRect(px, py, 1, 1);
      }
    }
  }
  function renderLogoMark(ctx, layout, logo, content) {
    if (!logo && !content.logoFallback) return null;
    const logoRect = {
      x: layout.logoX,
      y: layout.logoY,
      w: layout.logoW,
      h: layout.logoH
    };
    drawLogoTileBackground(ctx, layout, content.logoBackground);
    const { logoX, logoY, logoW, logoH } = layout;
    if (drawLedAirlineMark(ctx, content.logoIcao, logoX, logoY, logoW, logoH)) {
    } else if (logo) {
      rasterizeLogoToTile(
        ctx,
        logo,
        logoX,
        logoY,
        logoW,
        logoH,
        content.logoBackground,
        content.logoPalette,
        content.logoTileBorder !== false
      );
    } else {
      drawLogoFallback(ctx, content.logoFallback, layout);
    }
    return logoRect;
  }
  function drawPanelChrome(ctx, layout) {
    const { dividerX, bandTop, bandH, statsZoneTop, mainX, mainW } = layout;
    ctx.fillStyle = LED_COLORS.muted;
    ctx.fillRect(dividerX, bandTop, 1, bandH);
    if (layout.statsZoneH > 2) {
      ctx.fillStyle = LED_COLORS.unlit;
      ctx.fillRect(mainX, statsZoneTop - 1, mainW, 1);
    }
  }
  function drawRouteBlock(ctx, layout, routeHero) {
    const { mainX, mainW, routeZoneTop, routeZoneH, useStackedRoute } = layout;
    const textX = mainX + 2;
    const textW = mainW - 4;
    const { origin, dest } = parseLedRouteHero(routeHero);
    if (useStackedRoute && dest) {
      const arrowH = ledCharCellH();
      const gap = 2;
      const endSlotH = Math.max(
        ledCharCellH(),
        Math.floor((routeZoneH - arrowH - gap * 2) / 2)
      );
      const endScale = pickFlightIdScale(origin, textW, endSlotH);
      const endMetrics = ledScaledTextMetrics(
        origin,
        endScale.scaleX,
        endScale.scaleY
      );
      const blockH = endMetrics.height * 2 + arrowH + gap * 2;
      let y2 = routeZoneTop + Math.round((routeZoneH - blockH) / 2);
      drawLedTextScaled(
        ctx,
        origin,
        centerLedTextXScaled(origin, textX, textW, endScale.scaleX),
        y2,
        LED_COLORS.hero,
        textW,
        endScale.scaleX,
        endScale.scaleY,
        endScale.scaleX === 1
      );
      y2 += endMetrics.height + gap;
      drawLedTextScaled(
        ctx,
        "\u2192",
        centerLedTextXScaled("\u2192", textX, textW, 1),
        y2,
        LED_COLORS.phosphor,
        textW,
        1,
        1,
        false
      );
      y2 += arrowH + gap;
      drawLedTextScaled(
        ctx,
        dest,
        centerLedTextXScaled(dest, textX, textW, endScale.scaleX),
        y2,
        LED_COLORS.hero,
        textW,
        endScale.scaleX,
        endScale.scaleY,
        endScale.scaleX === 1
      );
      return;
    }
    const scale = pickFlightIdScale(routeHero, textW, routeZoneH);
    const metrics = ledScaledTextMetrics(
      routeHero,
      scale.scaleX,
      scale.scaleY
    );
    const y = routeZoneTop + Math.round((routeZoneH - metrics.height) / 2);
    drawLedTextScaled(
      ctx,
      routeHero,
      centerLedTextXScaled(routeHero, textX, textW, scale.scaleX),
      y,
      LED_COLORS.hero,
      textW,
      scale.scaleX,
      scale.scaleY,
      scale.scaleX === 1
    );
  }
  function drawStatsRow(ctx, layout, telemetry) {
    var _a, _b, _c, _d;
    const { mainX, mainW, statsZoneTop, statsZoneH, statsUseFullFont } = layout;
    const textX = mainX + 2;
    const textW = mainW - 4;
    const aircraft = (_b = (_a = telemetry[0]) == null ? void 0 : _a.value) != null ? _b : "";
    const speed = (_d = (_c = telemetry[1]) == null ? void 0 : _c.value) != null ? _d : "";
    const rowH = statsUseFullFont ? ledCharCellH() : ledCompactCellH();
    const rowY = statsZoneTop + Math.round((statsZoneH - rowH) / 2);
    const split = Math.floor(textW * 0.52);
    if (statsUseFullFont) {
      drawLedText(ctx, aircraft, textX, rowY, LED_COLORS.telemetry, split);
      drawLedTextRight(
        ctx,
        speed,
        textX + textW,
        rowY,
        LED_COLORS.telemetry,
        textW - split - 1
      );
    } else {
      drawLedTextCompact(ctx, aircraft, textX, rowY, LED_COLORS.telemetry, textW);
      drawLedTextCompactRight(
        ctx,
        speed,
        textX + textW,
        rowY,
        LED_COLORS.telemetry,
        textW
      );
    }
  }
  function renderLandscapeLayout(ctx, cols, rows, content, logo) {
    const layout = buildLandscapeLayout(cols, rows);
    let logoRect = null;
    logoRect = renderLogoMark(ctx, layout, logo, content);
    drawLandscapeFlightPanel(ctx, layout, content, rows);
    return { logoRect };
  }
  function drawLandscapeFlightPanel(ctx, layout, content, rows) {
    const flightScale = pickFlightIdScale(
      content.flightId,
      layout.flightW,
      layout.flightBandH
    );
    const flightMetrics = ledScaledTextMetrics(
      content.flightId,
      flightScale.scaleX,
      flightScale.scaleY
    );
    const compactFlightBandH = 2 * LED_FONT.glyphH + LED_FONT.gapY + 2;
    const flightY = layout.flightBandH > compactFlightBandH + 4 ? 1 : Math.max(1, Math.floor((layout.flightBandH - flightMetrics.height) / 2));
    drawLedTextScaled(
      ctx,
      content.flightId,
      layout.flightX + 1,
      flightY,
      LED_COLORS.hero,
      layout.flightW - 2,
      flightScale.scaleX,
      flightScale.scaleY,
      true
    );
    drawPanelChrome(ctx, layout);
    drawRouteBlock(ctx, layout, content.routeHero);
    drawStatsRow(ctx, layout, content.telemetry);
  }
  function drawLogoFallback(ctx, fallback, layout) {
    const text = fallback.slice(0, layout.logoW >= 16 ? 3 : 2);
    if (layout.logoH >= ledCharCellH() + 2) {
      drawLedText(
        ctx,
        text,
        layout.logoX + 1,
        layout.logoY + Math.floor((layout.logoH - ledCharCellH()) / 2),
        LED_COLORS.phosphor,
        layout.logoW - 2
      );
      return;
    }
    drawLedTextCompact(
      ctx,
      text,
      layout.logoX + 1,
      layout.logoY + Math.floor((layout.logoH - COMPACT_SAFE) / 2),
      LED_COLORS.phosphor
    );
  }
  function renderPortraitLayout(ctx, cols, rows, content, logo) {
    const layout = buildPortraitLayout(cols, rows);
    let logoRect = null;
    logoRect = renderLogoMark(ctx, layout, logo, content);
    drawLandscapeFlightPanel(ctx, layout, content, rows);
    return { logoRect };
  }
  function renderLedBuffer(ctx, cols, rows, content, logo) {
    ctx.fillStyle = LED_COLORS.panel;
    ctx.fillRect(0, 0, cols, rows);
    ctx.imageSmoothingEnabled = false;
    if (cols >= rows * 1.6) {
      return renderLandscapeLayout(ctx, cols, rows, content, logo);
    }
    return renderPortraitLayout(ctx, cols, rows, content, logo);
  }
  function snapTextColor(r, g, b) {
    const lum = r * 0.299 + g * 0.587 + b * 0.114;
    if (lum < 40) return null;
    if (b > r + 18 && b > g + 4) return LED_COLORS.telemetry;
    if (lum >= TEXT_THRESHOLD + 40) return LED_COLORS.hero;
    if (lum >= TEXT_THRESHOLD + 10) return LED_COLORS.phosphor;
    if (lum >= 85) return LED_COLORS.dim;
    return LED_COLORS.muted;
  }
  function sampleLogoLedColor(r, g, b, logoBackground, palette) {
    if (logoBackground) {
      const bg = parseHexColor(logoBackground);
      const bgHex = rgbToHex(bg.r, bg.g, bg.b);
      return snapLogoColor(r, g, b, bg, bgHex, palette);
    }
    const q = quantizeRgb(r, g, b);
    return rgbToHex(q.r, q.g, q.b);
  }
  function parseRgbColor(color) {
    var _a, _b, _c;
    if (color.startsWith("rgb(")) {
      const parts = color.match(/\d+/g);
      return {
        r: Number((_a = parts == null ? void 0 : parts[0]) != null ? _a : 0),
        g: Number((_b = parts == null ? void 0 : parts[1]) != null ? _b : 0),
        b: Number((_c = parts == null ? void 0 : parts[2]) != null ? _c : 0)
      };
    }
    const hex = color.replace("#", "");
    return {
      r: parseInt(hex.slice(0, 2), 16),
      g: parseInt(hex.slice(2, 4), 16),
      b: parseInt(hex.slice(4, 6), 16)
    };
  }
  function dimColor(r, g, b, factor) {
    return {
      r: Math.round(r * factor),
      g: Math.round(g * factor),
      b: Math.round(b * factor)
    };
  }
  function ledCellBrightness(x, y) {
    const hash = (x * 73 + y * 137) % 97 / 97;
    return 0.9 + hash * 0.1;
  }
  function drawUnlitDot(ctx, cx, cy, radius) {
    ctx.fillStyle = "#101010";
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#050505";
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.58, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.018)";
    ctx.beginPath();
    ctx.arc(cx, cy - radius * 0.16, radius * 0.18, 0, Math.PI * 2);
    ctx.fill();
  }
  function drawLitDot(ctx, cx, cy, radius, color, strength) {
    const { r, g, b } = parseRgbColor(color);
    const body = dimColor(r, g, b, strength);
    ctx.fillStyle = `rgb(${body.r},${body.g},${body.b})`;
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.92, 0, Math.PI * 2);
    ctx.fill();
  }
  function ledViewport(width, height, cols, rows) {
    const gridAspect = cols / rows;
    const displayAspect = width / height;
    let drawW = width;
    let drawH = height;
    if (displayAspect > gridAspect) {
      drawW = height * gridAspect;
    } else {
      drawH = width / gridAspect;
    }
    const cell = drawW / cols;
    return {
      offsetX: (width - drawW) / 2,
      offsetY: (height - drawH) / 2,
      cellW: cell,
      cellH: cell,
      displayCols: cols,
      displayRows: rows
    };
  }
  function ledWallViewport(width, height, cols, rows) {
    const cell = width / cols;
    return {
      offsetX: 0,
      offsetY: 0,
      cellW: cell,
      cellH: cell,
      displayCols: cols,
      displayRows: rows
    };
  }
  function paintLedDots(ctx, buffer, width, height, logoRect, options = {}) {
    const { cols, rows } = { cols: buffer.width, rows: buffer.height };
    const viewport = options.fitFrame ? ledViewport(width, height, cols, rows) : ledWallViewport(width, height, cols, rows);
    const { offsetX, offsetY, cellW, cellH, displayCols, displayRows } = viewport;
    const radius = Math.min(cellW, cellH) * 0.44;
    const data = buffer.data;
    const logoBg = options.logoBackground;
    const logoPalette = options.logoPalette;
    const litCells = [];
    ctx.fillStyle = LED_COLORS.panel;
    ctx.fillRect(0, 0, width, height);
    for (let y = 0; y < displayRows; y += 1) {
      for (let x = 0; x < displayCols; x += 1) {
        const cx = offsetX + (x + 0.5) * cellW;
        const cy = offsetY + (y + 0.5) * cellH;
        drawUnlitDot(ctx, cx, cy, radius);
        if (y >= rows || x >= cols) continue;
        const i = (y * cols + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];
        const inLogo = logoRect && x >= logoRect.x && x < logoRect.x + logoRect.w && y >= logoRect.y && y < logoRect.y + logoRect.h;
        if (inLogo) {
          const color = sampleLogoLedColor(r, g, b, logoBg, logoPalette);
          litCells.push({ cx, cy, color, strength: 1 });
          continue;
        }
        const textColor = snapTextColor(r, g, b);
        if (textColor) {
          const evenPhosphor = textColor === LED_COLORS.hero || textColor === LED_COLORS.phosphor;
          const strength = evenPhosphor ? 1 : ledCellBrightness(x, y) * 0.98;
          litCells.push({ cx, cy, color: textColor, strength });
        }
      }
    }
    for (const cell of litCells) {
      drawLitDot(ctx, cell.cx, cell.cy, radius, cell.color, cell.strength);
    }
  }
  function loadLedLogo(url) {
    return new Promise((resolve) => {
      const img = new Image();
      if (!url.startsWith("/")) {
        img.crossOrigin = "anonymous";
      }
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = url;
    });
  }

  // lib/legacyLedWallRuntime.ts
  function aircraftToLedContent(ac) {
    const brand = getAirlineBrand(ac.callsign);
    const wallStyle = getAirlineLedWallStyle(brand);
    const routeLine = ledRouteLabel(ac);
    return {
      airlineName: brand.name,
      flightId: formatLedFlightId(ac, brand),
      routeHero: formatLedRouteHero(routeLine),
      telemetry: ledTelemetryFields(ac),
      logoUrl: airlineLedLogoUrl(brand, 128),
      logoIcao: brand.icao,
      logoFallback: brand.iata,
      logoBackground: wallStyle.logoBackground,
      logoBorder: wallStyle.logoBorder,
      accentStripe: wallStyle.accentStripe,
      logoPalette: wallStyle.logoPalette,
      logoTileBorder: wallStyle.logoTileBorder
    };
  }
  function detectOrientation() {
    return window.innerWidth >= window.innerHeight ? "landscape" : "portrait";
  }
  function createLedWallPainter(canvas) {
    const buffer = document.createElement("canvas");
    const bufferCtx = buffer.getContext("2d", { willReadFrequently: true });
    let logo = null;
    let currentContent = null;
    let logoUrl;
    let cancelled = false;
    function drawFrame() {
      if (!bufferCtx || cancelled || !currentContent) return;
      const orientation = detectOrientation();
      const { cols, rows: baseRows } = ledGridForOrientation(orientation);
      const dpr = window.devicePixelRatio || 1;
      const width = Math.max(1, Math.round(window.innerWidth * dpr));
      const height = Math.max(1, Math.round(window.innerHeight * dpr));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      const rows = ledWallRowCount(cols, baseRows, width, height);
      if (buffer.width !== cols || buffer.height !== rows) {
        buffer.width = cols;
        buffer.height = rows;
      }
      const { logoRect } = renderLedBuffer(bufferCtx, cols, rows, currentContent, logo);
      const imageData = bufferCtx.getImageData(0, 0, cols, rows);
      const displayCtx = canvas.getContext("2d");
      if (!displayCtx) return;
      paintLedDots(displayCtx, imageData, width, height, logoRect, {
        fitFrame: false,
        logoBackground: currentContent.logoBackground,
        logoPalette: currentContent.logoPalette
      });
    }
    return {
      async draw(content) {
        currentContent = content;
        const nextUrl = content.logoUrl;
        if (nextUrl !== logoUrl) {
          logoUrl = nextUrl;
          logo = nextUrl ? await loadLedLogo(nextUrl) : null;
        }
        if (!cancelled) drawFrame();
      },
      resize() {
        drawFrame();
      },
      destroy() {
        cancelled = true;
      }
    };
  }
  var LegacyLedWall = {
    aircraftToLedContent,
    createLedWallPainter,
    detectOrientation
  };
  return __toCommonJS(legacyLedWallRuntime_exports);
})();
