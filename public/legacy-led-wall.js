"use strict";
var LegacyLedWall = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __pow = Math.pow;
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
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
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

  // lib/approvedLogos.ts
  var approvedManifest = {};
  function setApprovedManifest(manifest) {
    approvedManifest = manifest != null ? manifest : {};
  }
  function logoCacheSuffix(entry) {
    var _a, _b;
    const fromSource = (_b = (_a = entry.source) == null ? void 0 : _a.match(/(\d{10,})/)) == null ? void 0 : _b[1];
    if (fromSource) return `?v=${fromSource}`;
    const version = entry.approvedAt ? Date.parse(entry.approvedAt) : NaN;
    return Number.isFinite(version) ? `?v=${version}` : "";
  }
  function approvedLogoUrl(icao) {
    const entry = approvedManifest[icao == null ? void 0 : icao.trim().toUpperCase()];
    if (!entry) return void 0;
    if (entry.file) {
      return `/api/airline-logos/asset/${entry.file}${logoCacheSuffix(entry)}`;
    }
    if (entry.url) return entry.url;
    return void 0;
  }

  // lib/cargoAirlines.ts
  var CARGO_AIRLINES = {
    FDX: {
      name: "FedEx Express",
      icao: "FDX",
      iata: "FX",
      primaryColor: "#4D148C",
      accentColor: "#FF6600",
      secondaryColor: "#FFFFFF"
    },
    UPS: {
      name: "UPS Airlines",
      icao: "UPS",
      iata: "5X",
      primaryColor: "#351C15",
      accentColor: "#FFB500",
      secondaryColor: "#FFFFFF"
    },
    GTI: {
      name: "Atlas Air",
      icao: "GTI",
      iata: "5Y",
      primaryColor: "#003366",
      accentColor: "#FFFFFF",
      secondaryColor: "#C8102E"
    },
    ABX: {
      name: "Amazon Air",
      icao: "ABX",
      iata: "GB",
      primaryColor: "#232F3E",
      accentColor: "#FF9900",
      secondaryColor: "#FFFFFF"
    },
    DHK: {
      name: "DHL Aviation",
      icao: "DHK",
      iata: "D0",
      primaryColor: "#FFCC00",
      accentColor: "#D40511",
      secondaryColor: "#FFFFFF"
    }
  };
  var CARGO_CALLSIGN_TO_ICAO = {
    FDX: "FDX",
    UPS: "UPS",
    GTI: "GTI",
    GSS: "GTI",
    ABX: "ABX",
    ATN: "ABX",
    DHL: "DHK",
    DHX: "DHK",
    DAE: "DHK",
    AHK: "DHK",
    BCS: "DHK"
  };
  var CARGO_AIRLINE_ICAO_LIST = Object.keys(CARGO_AIRLINES).sort();
  function getCargoAirlineFromCallsign(callsign) {
    var _a;
    if (!callsign) return null;
    const prefix = callsign.trim().toUpperCase().slice(0, 3);
    const icao = CARGO_CALLSIGN_TO_ICAO[prefix];
    if (!icao) return null;
    return (_a = CARGO_AIRLINES[icao]) != null ? _a : null;
  }

  // lib/aircraftCategories.ts
  var CATEGORY_ICAO = {
    MILITARY: "MIL",
    BIZJET: "PVT"
  };
  var FAMOUS_TAILS = {
    // —— Notable individuals ——
    N628TS: { name: "Elon Musk" },
    N757AF: { name: "Trump Force One" },
    N194WM: { name: "Bill Gates" },
    N271DV: { name: "Jeff Bezos" },
    N3200X: { name: "Taylor Swift" },
    N621MM: { name: "Taylor Swift" },
    // prior reg (Falcon 7X, re-registered 2026)
    // —— Fortune 500 / major corporate flight departments ——
    N2N: { name: "Apple" },
    N68885: { name: "Meta" },
    N232G: { name: "Google" },
    N383PA: { name: "Walmart" },
    N100A: { name: "Exxon Mobil" },
    N959RW: { name: "Coca-Cola" },
    N486RW: { name: "Coca-Cola" },
    N586RW: { name: "Coca-Cola" },
    N280WS: { name: "Goldman Sachs" },
    N601CH: { name: "JPMorgan Chase" },
    N602CH: { name: "JPMorgan Chase" },
    N661CH: { name: "JPMorgan Chase" },
    N662CH: { name: "JPMorgan Chase" }
  };
  var MILITARY_CALLSIGN_PREFIXES = [
    "RCH",
    "REACH",
    "EVAC",
    "NAVY",
    "ARMY",
    "USAF",
    "USN",
    "USMC",
    "SPAR",
    "CONDO",
    "DUKE",
    "IRON",
    "HKY",
    "MOXY",
    "TOPCAT",
    "TITAN",
    "VIPER",
    "JAKE"
  ];
  var MILITARY_TYPE_PREFIXES = [
    "F15",
    "F16",
    "F18",
    "F22",
    "F35",
    "A10",
    "B52",
    "B1",
    "B2",
    "C5",
    "C17",
    "C130",
    "C30J",
    "KC10",
    "KC135",
    "KC46",
    "E3",
    "E6",
    "E8",
    "P8",
    "T38",
    "V22",
    "H60",
    "UH60",
    "CH47",
    "AH64",
    "L159",
    "T6"
  ];
  var BIZJET_TYPE_PREFIXES = [
    "GLF",
    "GLEX",
    "G550",
    "G650",
    "GL7T",
    "GL5T",
    "CL30",
    "CL35",
    "CL60",
    "C25",
    "C50",
    "C51",
    "C52",
    "C55",
    "C56",
    "C68",
    "C70",
    "C72",
    "C75",
    "C82",
    "C500",
    "C510",
    "C525",
    "C526",
    "C550",
    "C560",
    "C680",
    "C68A",
    "C700",
    "C750",
    "E50P",
    "E55P",
    "E545",
    "E550",
    "FA7X",
    "FA8X",
    "FA50",
    "GALX",
    "LJ35",
    "LJ45",
    "LJ60",
    "LJ75",
    "H25B",
    "PC24",
    "HDJT",
    "E35L"
  ];
  var CATEGORY_BRANDS = {
    [CATEGORY_ICAO.MILITARY]: {
      name: "Military",
      icao: CATEGORY_ICAO.MILITARY,
      iata: "MI",
      primaryColor: "#3D4F2F",
      accentColor: "#C5A572",
      secondaryColor: "#2C1810"
    },
    [CATEGORY_ICAO.BIZJET]: {
      name: "Private Jet",
      icao: CATEGORY_ICAO.BIZJET,
      iata: "PJ",
      primaryColor: "#1E293B",
      accentColor: "#D4AF37",
      secondaryColor: "#64748B"
    }
  };
  function normalizeTail(value) {
    if (!value) return void 0;
    const normalized = value.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
    return normalized.length > 0 ? normalized : void 0;
  }
  function isNNumberTail(value) {
    var _a;
    if (!value) return false;
    return /^N[1-9][0-9]{0,4}[A-Z]{0,2}$/.test((_a = normalizeTail(value)) != null ? _a : "");
  }
  function aircraftTail(ac) {
    var _a;
    return (_a = normalizeTail(ac.registration)) != null ? _a : normalizeTail(ac.callsign);
  }
  function isNNumberAircraft(ac) {
    return isNNumberTail(ac.registration) || isNNumberTail(ac.callsign);
  }
  function isFamousTail(ac) {
    return lookupFamousTail(ac) != null;
  }
  function lookupFamousTail(ac) {
    var _a;
    const tail = aircraftTail(ac);
    if (!tail) return null;
    return (_a = FAMOUS_TAILS[tail]) != null ? _a : null;
  }
  function matchesPrefix(value, prefixes) {
    if (!value) return false;
    const upper = value.trim().toUpperCase();
    return prefixes.some((prefix) => upper.startsWith(prefix));
  }
  function isMilitary(ac) {
    var _a;
    const callsign = (_a = ac.callsign) == null ? void 0 : _a.trim().toUpperCase();
    if (callsign) {
      const prefix = callsign.slice(0, 3);
      if (MILITARY_CALLSIGN_PREFIXES.includes(prefix)) return true;
      if (MILITARY_CALLSIGN_PREFIXES.some((mil) => callsign.startsWith(mil))) return true;
    }
    return matchesPrefix(ac.aircraftType, MILITARY_TYPE_PREFIXES);
  }
  function isBizjet(ac) {
    if (matchesPrefix(ac.aircraftType, BIZJET_TYPE_PREFIXES)) return true;
    if (ac.aircraftType === "PC12") return true;
    if (isNNumberAircraft(ac) && ac.category === "A3") return true;
    return false;
  }
  var UNKNOWN_NON_AIRLINE_BRAND = {
    name: "Unknown",
    icao: "UNK",
    iata: "XX",
    primaryColor: "#334155",
    accentColor: "#94A3B8"
  };
  function getNonAirlineDisplayBrand(ac) {
    const famous = lookupFamousTail(ac);
    if (famous) {
      return __spreadProps(__spreadValues({}, CATEGORY_BRANDS[CATEGORY_ICAO.BIZJET]), { name: famous.name });
    }
    if (isMilitary(ac)) {
      return CATEGORY_BRANDS[CATEGORY_ICAO.MILITARY];
    }
    const cargo = getCargoAirlineFromCallsign(ac.callsign);
    if (cargo) return cargo;
    if (isBizjet(ac)) {
      return CATEGORY_BRANDS[CATEGORY_ICAO.BIZJET];
    }
    return UNKNOWN_NON_AIRLINE_BRAND;
  }
  function isCategoryBrand(icao) {
    return icao in CATEGORY_BRANDS;
  }

  // lib/ledAirlineMarks.ts
  var MARKS = {};
  function hasLedAirlineMark(icao) {
    return icao in MARKS;
  }
  function drawLedAirlineMark(_ctx, icao, _x, _y, _w, _h, _options) {
    return icao in MARKS;
  }

  // lib/regionalCarriers.ts
  var REGIONAL_OPERATORS = {
    SKW: { name: "SkyWest", icao: "SKW", iata: "OO" },
    RPA: { name: "Republic", icao: "RPA", iata: "YX" },
    ENY: { name: "Envoy", icao: "ENY", iata: "MQ" },
    PDT: { name: "Piedmont", icao: "PDT", iata: "PT" },
    JIA: { name: "PSA", icao: "JIA", iata: "OH" },
    EDV: { name: "Endeavor", icao: "EDV", iata: "9E" },
    QXE: { name: "Horizon", icao: "QXE", iata: "QX" },
    AWI: { name: "Air Wisconsin", icao: "AWI", iata: "ZW" },
    ASH: { name: "Mesa", icao: "ASH", iata: "YV" },
    GJS: { name: "GoJet", icao: "GJS", iata: "G7" },
    LOF: { name: "Trans States", icao: "LOF", iata: "AX" }
  };
  var EXCLUSIVE_MAINLINE = {
    ENY: "AAL",
    PDT: "AAL",
    JIA: "AAL",
    EDV: "DAL",
    QXE: "ASA",
    AWI: "UAL",
    LOF: "UAL"
  };
  var MAINLINE_FLIGHT_RANGES = [
    { min: 3420, max: 3499, mainline: "ASA" },
    { min: 2920, max: 3109, mainline: "AAL" },
    { min: 3520, max: 3569, mainline: "DAL" },
    { min: 4439, max: 4858, mainline: "DAL" },
    { min: 9783, max: 9784, mainline: "DAL" },
    { min: 3805, max: 3854, mainline: "UAL" },
    { min: 4085, max: 4714, mainline: "UAL" },
    { min: 4860, max: 4868, mainline: "UAL" },
    { min: 5176, max: 6060, mainline: "UAL" },
    { min: 5660, max: 6189, mainline: "UAL" },
    { min: 3100, max: 3399, mainline: "AAL" },
    { min: 4e3, max: 4420, mainline: "DAL" },
    { min: 6070, max: 6999, mainline: "UAL" }
  ];
  var MULTI_PARTNER_REGIONALS = /* @__PURE__ */ new Set(["SKW", "RPA", "ASH", "GJS"]);
  var DEFAULT_MAINLINE = "UAL";
  function parseCallsignParts(callsign) {
    const trimmed = callsign.trim().toUpperCase();
    const prefix = trimmed.slice(0, 3);
    const numPart = trimmed.slice(3).replace(/\D/g, "");
    const flightNumber = numPart ? parseInt(numPart, 10) : null;
    return { prefix, flightNumber: flightNumber != null && !Number.isNaN(flightNumber) ? flightNumber : null };
  }
  function mainlineFromFlightNumber(flightNumber) {
    for (const range of MAINLINE_FLIGHT_RANGES) {
      if (flightNumber >= range.min && flightNumber <= range.max) {
        return range.mainline;
      }
    }
    return null;
  }
  function getRegionalOperator(callsign) {
    var _a;
    if (!callsign) return null;
    const { prefix } = parseCallsignParts(callsign);
    return (_a = REGIONAL_OPERATORS[prefix]) != null ? _a : null;
  }
  function resolveMainlineIcao(callsign) {
    var _a;
    const { prefix, flightNumber } = parseCallsignParts(callsign);
    const exclusive = EXCLUSIVE_MAINLINE[prefix];
    if (exclusive) return exclusive;
    if (MULTI_PARTNER_REGIONALS.has(prefix) && flightNumber != null) {
      return (_a = mainlineFromFlightNumber(flightNumber)) != null ? _a : DEFAULT_MAINLINE;
    }
    if (prefix in REGIONAL_OPERATORS) {
      return DEFAULT_MAINLINE;
    }
    return prefix;
  }
  function resolveCallsignPrefix(callsign) {
    return resolveMainlineIcao(callsign);
  }
  var CALLSIGN_BRAND_ALIAS = __spreadProps(__spreadValues({}, EXCLUSIVE_MAINLINE), {
    SKW: DEFAULT_MAINLINE,
    RPA: DEFAULT_MAINLINE,
    ASH: DEFAULT_MAINLINE,
    GJS: DEFAULT_MAINLINE
  });

  // lib/airlines.ts
  var AIRLINES = {
    UAL: {
      name: "United",
      icao: "UAL",
      iata: "UA",
      primaryColor: "#0033A0",
      accentColor: "#FFFFFF",
      secondaryColor: "#0D8BD9"
    },
    SWA: {
      name: "Southwest",
      icao: "SWA",
      iata: "WN",
      primaryColor: "#304CB2",
      accentColor: "#FFBF27",
      secondaryColor: "#D5152E"
    },
    DAL: {
      name: "Delta",
      icao: "DAL",
      iata: "DL",
      primaryColor: "#003366",
      accentColor: "#C8102E",
      secondaryColor: "#FFFFFF"
    },
    AAL: {
      name: "American",
      icao: "AAL",
      iata: "AA",
      primaryColor: "#0078D2",
      accentColor: "#C8102E",
      secondaryColor: "#FFFFFF"
    },
    FFT: {
      name: "Frontier",
      icao: "FFT",
      iata: "F9",
      primaryColor: "#006747",
      accentColor: "#8CD600",
      secondaryColor: "#FFFFFF"
    },
    JBU: {
      name: "JetBlue",
      icao: "JBU",
      iata: "B6",
      primaryColor: "#003087",
      accentColor: "#FFFFFF",
      secondaryColor: "#6699CC"
    },
    ASA: {
      name: "Alaska",
      icao: "ASA",
      iata: "AS",
      primaryColor: "#01426A",
      accentColor: "#48BFE5",
      secondaryColor: "#95C93D"
    },
    ACA: {
      name: "Air Canada",
      icao: "ACA",
      iata: "AC",
      primaryColor: "#D22630",
      accentColor: "#FFFFFF",
      secondaryColor: "#1A1A1A"
    },
    AFR: {
      name: "Air France",
      icao: "AFR",
      iata: "AF",
      primaryColor: "#002157",
      accentColor: "#FFFFFF",
      secondaryColor: "#ED1C24"
    },
    BAW: {
      name: "British Airways",
      icao: "BAW",
      iata: "BA",
      primaryColor: "#075AAA",
      accentColor: "#FFFFFF",
      secondaryColor: "#EB2226"
    },
    DLH: {
      name: "Lufthansa",
      icao: "DLH",
      iata: "LH",
      primaryColor: "#05164D",
      accentColor: "#FFB81C",
      secondaryColor: "#FFFFFF"
    },
    EIN: {
      name: "Aer Lingus",
      icao: "EIN",
      iata: "EI",
      primaryColor: "#00857D",
      accentColor: "#FFFFFF",
      secondaryColor: "#4FB748"
    },
    AMX: {
      name: "Aerom\xE9xico",
      icao: "AMX",
      iata: "AM",
      primaryColor: "#003263",
      accentColor: "#FFFFFF",
      secondaryColor: "#E4002B"
    },
    AAY: {
      name: "Allegiant",
      icao: "AAY",
      iata: "G4",
      primaryColor: "#00549F",
      accentColor: "#F58025",
      secondaryColor: "#FFFFFF"
    },
    MXY: {
      name: "Breeze Airways",
      icao: "MXY",
      iata: "MX",
      primaryColor: "#14264C",
      accentColor: "#00A9E0",
      secondaryColor: "#FFFFFF"
    },
    CAY: {
      name: "Cayman Airways",
      icao: "CAY",
      iata: "KX",
      primaryColor: "#002F6C",
      accentColor: "#C8102E",
      secondaryColor: "#FFFFFF"
    },
    CMP: {
      name: "Copa Airlines",
      icao: "CMP",
      iata: "CM",
      primaryColor: "#003DA5",
      accentColor: "#FFFFFF",
      secondaryColor: "#0C2340"
    },
    EDW: {
      name: "Edelweiss",
      icao: "EDW",
      iata: "WK",
      primaryColor: "#C8102E",
      accentColor: "#FFFFFF",
      secondaryColor: "#1A1A1A"
    },
    ICE: {
      name: "Icelandair",
      icao: "ICE",
      iata: "FI",
      primaryColor: "#00205B",
      accentColor: "#FFFFFF",
      secondaryColor: "#FFC72C"
    },
    THY: {
      name: "Turkish Airlines",
      icao: "THY",
      iata: "TK",
      primaryColor: "#C70A0C",
      accentColor: "#FFFFFF",
      secondaryColor: "#1A1A1A"
    },
    VIV: {
      name: "VivaAerobus",
      icao: "VIV",
      iata: "VB",
      primaryColor: "#00A650",
      accentColor: "#FFFFFF",
      secondaryColor: "#ED1C24"
    },
    VOI: {
      name: "Volaris",
      icao: "VOI",
      iata: "Y4",
      primaryColor: "#A6228E",
      accentColor: "#FFFFFF",
      secondaryColor: "#ED1C24"
    },
    WJA: {
      name: "WestJet",
      icao: "WJA",
      iata: "WS",
      primaryColor: "#0F1E60",
      accentColor: "#00A0DF",
      secondaryColor: "#FFFFFF"
    },
    SCX: {
      name: "Sun Country",
      icao: "SCX",
      iata: "SY",
      primaryColor: "#003594",
      accentColor: "#C8102E",
      secondaryColor: "#FFFFFF"
    }
  };
  var AIRLINE_ICAO_LIST = Object.keys(AIRLINES).sort();
  var CATEGORY_ICAO_LIST = Object.keys(CATEGORY_BRANDS).sort();
  var LOGO_BRAND_ICAO_LIST = [
    ...AIRLINE_ICAO_LIST,
    ...CARGO_AIRLINE_ICAO_LIST,
    ...CATEGORY_ICAO_LIST
  ];
  function getAirlineFromCallsign(callsign) {
    var _a;
    if (!callsign || isNNumberTail(callsign)) return null;
    const resolved = resolveCallsignPrefix(callsign);
    return (_a = AIRLINES[resolved]) != null ? _a : null;
  }
  function getAircraftDisplayBrand(ac) {
    if (isFamousTail(ac)) {
      return getNonAirlineDisplayBrand(ac);
    }
    const cargo = getCargoAirlineFromCallsign(ac.callsign);
    if (cargo) return cargo;
    if (!isNNumberAircraft(ac)) {
      const airline = getAirlineFromCallsign(ac.callsign);
      if (airline) return airline;
    }
    return getNonAirlineDisplayBrand(ac);
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
    ACA: ["#FFFFFF", "#D22630"],
    AFR: ["#FFFFFF", "#002157", "#ED1C24"],
    BAW: ["#FFFFFF", "#075AAA", "#EB2226"],
    DLH: ["#FFB81C", "#05164D"],
    EIN: ["#4FB748"],
    AMX: ["#FFFFFF", "#003263"],
    AAY: ["#F58025", "#00549F"],
    MXY: ["#00A9E0", "#14264C"],
    CAY: ["#FFFFFF", "#002F6C", "#C8102E"],
    CMP: ["#FFFFFF", "#003DA5"],
    EDW: ["#FFFFFF", "#C8102E"],
    ICE: ["#FFFFFF", "#00205B"],
    THY: ["#FFFFFF", "#C70A0C"],
    VIV: ["#FFFFFF", "#00A650", "#ED1C24"],
    VOI: ["#FFFFFF", "#A83090", "#78A8D8", "#78C048", "#303030"],
    WJA: ["#FFFFFF", "#0F1E60", "#00A0DF"],
    SCX: ["#FFFFFF", "#003594"],
    SKW: ["#FFFFFF", "#C4D600"],
    SWA: ["#D5152E", "#FFBF27", "#304CB2", "#CCCCCC"],
    FDX: ["#FF6600", "#4D148C", "#FFFFFF"],
    UPS: ["#FFB500", "#351C15", "#FFFFFF"],
    GTI: ["#FFFFFF", "#003366", "#C8102E"],
    DHK: ["#FFCC00", "#D40511", "#FFFFFF"],
    ABX: ["#FF9900", "#232F3E", "#FFFFFF"],
    MIL: ["#FFFFFF", "#C5A572", "#3D4F2F", "#2C1810"],
    PVT: ["#FFFFFF", "#D4AF37", "#64748B", "#1E293B"]
  };
  var LED_LOGO_NO_TILE_BORDER = /* @__PURE__ */ new Set(["JBU", "SWA", "MIL", "PVT", "GA", "FDX", "UPS", "GTI", "ABX", "DHK"]);
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
  var COLOR_LOGO_TILE = /* @__PURE__ */ new Set([
    "AAL",
    "FFT",
    "ASA",
    "EIN",
    "MIL",
    "FDX",
    "UPS",
    "GTI",
    "ABX",
    "DHK"
  ]);
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
    const onBlackLogo = ["VOI"].includes(brand.icao);
    const onDarkLogo = ["UAL", "DAL", "JBU", "SWA", "PVT"].includes(brand.icao);
    const logoBackground = onBlackLogo ? "#070707" : onDarkLogo ? brand.primaryColor : "#e8edf2";
    return {
      logoBackground,
      logoBorder: mixHex(brand.primaryColor, "#000000", 0.25),
      accentStripe: brand.accentColor,
      logoPalette: airlineLedLogoPalette(brand, logoBackground),
      logoTileBorder: !LED_LOGO_NO_TILE_BORDER.has(brand.icao)
    };
  }
  function airlineLogoCanvasUrl(brand) {
    return approvedLogoUrl(brand.icao);
  }
  function airlineLedLogoUrl(brand) {
    if (hasLedAirlineMark(brand.icao)) return void 0;
    return airlineLogoCanvasUrl(brand);
  }

  // lib/aircraftTypes.ts
  var ICAO_TYPE_NAMES = {
    // Boeing 737 family
    B37M: "737 MAX 7",
    B38M: "737 MAX 8",
    B39M: "737 MAX 9",
    B3XM: "737 MAX 10",
    B737: "737",
    B738: "737-800",
    B739: "737-900",
    B734: "737-400",
    B735: "737-500",
    B736: "737-600",
    B73G: "737-700",
    B752: "757-200",
    B753: "757-300",
    B762: "767-200",
    B763: "767-300",
    B764: "767-400",
    B772: "777-200",
    B77L: "777-200LR",
    B77W: "777-300ER",
    B788: "787-8",
    B789: "787-9",
    B78X: "787-10",
    B748: "747-8",
    B744: "747-400",
    // Airbus A320 family
    A318: "A318",
    A319: "A319",
    A320: "A320",
    A321: "A321",
    A19N: "A319 neo",
    A20N: "A320 neo",
    A21N: "A321 neo",
    A332: "A330-200",
    A333: "A330-300",
    A339: "A330-900",
    A359: "A350-900",
    A35K: "A350-1000",
    A388: "A380",
    // Embraer / regional jets
    E170: "E170",
    E175: "E175",
    E75L: "E175",
    E75S: "E175",
    E190: "E190",
    E195: "E195",
    E290: "E190-E2",
    E295: "E195-E2",
    CRJ2: "CRJ-200",
    CRJ7: "CRJ-700",
    CRJ9: "CRJ-900",
    BCS1: "A220-100",
    BCS3: "A220-300",
    // GA / biz (common near metro areas)
    C172: "C172",
    C182: "C182",
    C208: "Caravan",
    PC12: "PC-12",
    SR22: "SR22",
    GLF4: "Gulfstream IV",
    GLF5: "Gulfstream V",
    CL35: "Challenger 350",
    LJ35: "Learjet 35",
    LJ45: "Learjet 45",
    LJ60: "Learjet 60",
    LJ75: "Learjet 75"
  };
  var BOARD_TYPE_NAMES = {
    B37M: "737-MAX7",
    B38M: "737-MAX8",
    B39M: "737-MAX9",
    B3XM: "737MAX10",
    B77L: "777LR",
    B77W: "777ER",
    A35K: "A350-1K",
    GLF4: "Gulf IV",
    GLF5: "Gulf V",
    CL35: "CL350",
    LJ35: "LJ35",
    LJ45: "LJ45",
    LJ60: "LJ60",
    LJ75: "LJ75"
  };
  function normalizeTypeCode(raw) {
    return raw.trim().toUpperCase();
  }
  function normalizeAirbusNeoLabel(label) {
    const match = label.match(/^(A319|A320|A321)\s*neo$/i);
    if (match) return `${match[1]} neo`;
    return label;
  }
  function formatAircraftTypeDisplay(raw) {
    if (!(raw == null ? void 0 : raw.trim())) return "Unknown";
    const trimmed = raw.trim();
    const code = normalizeTypeCode(trimmed);
    const mapped = ICAO_TYPE_NAMES[code];
    if (mapped) return mapped;
    if (/^boeing\s+/i.test(trimmed)) {
      return trimmed.replace(/^boeing\s+/i, "").trim();
    }
    if (/^airbus\s+/i.test(trimmed)) {
      return normalizeAirbusNeoLabel(`A${trimmed.replace(/^airbus\s+/i, "").trim()}`);
    }
    return normalizeAirbusNeoLabel(trimmed);
  }
  function formatAircraftTypeBoard(raw) {
    var _a;
    if (!(raw == null ? void 0 : raw.trim())) return "Unknown";
    const code = normalizeTypeCode(raw.trim());
    return (_a = BOARD_TYPE_NAMES[code]) != null ? _a : formatAircraftTypeDisplay(raw);
  }

  // lib/geo.ts
  var EARTH_RADIUS_MI = 3958.8;
  function distanceMi(lat1, lon1, lat2, lon2) {
    const toRad = (deg) => deg * Math.PI / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = __pow(Math.sin(dLat / 2), 2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * __pow(Math.sin(dLon / 2), 2);
    return EARTH_RADIUS_MI * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  // lib/routePlausibility.ts
  function hasAirportCodes(route) {
    var _a, _b, _c, _d;
    return Boolean(
      ((_a = route.originIata) == null ? void 0 : _a.trim()) || ((_b = route.originIcao) == null ? void 0 : _b.trim()) || ((_c = route.destIata) == null ? void 0 : _c.trim()) || ((_d = route.destIcao) == null ? void 0 : _d.trim())
    );
  }
  function getFiledRoute(ac) {
    const route = ac.route;
    if (!route || !hasAirportCodes(route)) return void 0;
    return route;
  }

  // lib/ledFlightWall.ts
  function airportCode(iata, icao) {
    return ((iata == null ? void 0 : iata.trim()) || (icao == null ? void 0 : icao.trim()) || "").toUpperCase();
  }
  function ledRouteLabel(ac) {
    const route = getFiledRoute(ac);
    if (!route) return "";
    const origin = airportCode(route.originIata, route.originIcao);
    const dest = airportCode(route.destIata, route.destIcao);
    if (!origin && !dest) return "";
    return `${origin}-${dest}`;
  }
  function formatLedRouteHero(route) {
    var _a, _b;
    if (!route) return "";
    const [origin, dest] = route.split("-");
    const left = (_a = origin == null ? void 0 : origin.trim()) != null ? _a : "";
    const right = (_b = dest == null ? void 0 : dest.trim()) != null ? _b : "";
    if (!left && !right) return "";
    return `${left}\u2192${right}`;
  }
  function computeFlightProgress(ac) {
    const route = getFiledRoute(ac);
    if (!route || route.originLat == null || route.originLon == null || route.destLat == null || route.destLon == null) {
      return null;
    }
    const legMi = distanceMi(route.originLat, route.originLon, route.destLat, route.destLon);
    if (!(legMi > 0)) return null;
    const flownMi = distanceMi(route.originLat, route.originLon, ac.lat, ac.lon);
    return Math.max(0, Math.min(1, flownMi / legMi));
  }
  function formatLedFlightId(ac, brand) {
    var _a, _b;
    const tail = aircraftTail(ac);
    if (isCategoryBrand(brand.icao) || isNNumberTail(tail) || isNNumberTail(ac.callsign)) {
      return tail || ac.hex.toUpperCase();
    }
    const raw = ((_a = ac.flightNumber) == null ? void 0 : _a.trim()) || ((_b = ac.callsign) == null ? void 0 : _b.trim().slice(3)) || "";
    const digits = raw.replace(/\D/g, "");
    const num = digits || raw || "----";
    return `${brand.iata} ${num}`;
  }
  function formatLedOperatorTag(ac) {
    var _a, _b;
    return (_b = (_a = getRegionalOperator(ac.callsign)) == null ? void 0 : _a.icao) != null ? _b : "";
  }
  function resolveLedLogoMarkIcao(brand, operatorTag) {
    if (operatorTag && hasLedAirlineMark(operatorTag)) return operatorTag;
    return brand.icao;
  }
  function formatLedAircraftType(ac) {
    var _a, _b;
    const raw = ((_a = ac.aircraftType) == null ? void 0 : _a.trim()) || ((_b = ac.category) == null ? void 0 : _b.trim());
    return formatAircraftTypeBoard(raw);
  }
  function formatLedSpeedMph(groundSpeedKt) {
    if (groundSpeedKt == null) return "--- MPH";
    const mph = Math.round(groundSpeedKt * 1.15078);
    return `${mph} MPH`;
  }
  var TAXI_MAX_ALT_FT = 500;
  function formatLedAltitude(altitudeFt) {
    if (altitudeFt == null) return "--- FT";
    if (altitudeFt <= TAXI_MAX_ALT_FT) return "ON GROUND";
    if (altitudeFt >= 1e4) {
      return `${Math.round(altitudeFt / 1e3)}K FT`;
    }
    return `${Math.round(altitudeFt)} FT`;
  }
  var TAXI_MAX_SPEED_KT = 35;
  function isAircraftTaxiing(ac) {
    const alt = ac.altitudeFt;
    const speed = ac.groundSpeedKt;
    if (alt == null || speed == null || speed < 1) return false;
    return alt <= TAXI_MAX_ALT_FT && speed <= TAXI_MAX_SPEED_KT;
  }
  var LED_CARDINALS = [
    "NORTH",
    "NORTHEAST",
    "EAST",
    "SOUTHEAST",
    "SOUTH",
    "SOUTHWEST",
    "WEST",
    "NORTHWEST"
  ];
  function formatLedHeading(headingDeg) {
    var _a;
    if (headingDeg == null || Number.isNaN(headingDeg)) return "";
    const normalized = (headingDeg % 360 + 360) % 360;
    return (_a = LED_CARDINALS[Math.round(normalized / 45) % 8]) != null ? _a : "";
  }
  var LED_VERTICAL_THRESHOLD = 250;
  var LED_TAKEOFF_MAX_ALT_FT = 12e3;
  var LED_LANDING_MAX_ALT_FT = 1e4;
  function formatLedFlightPhase(ac) {
    const vRate = ac.verticalRateFpm;
    const alt = ac.altitudeFt;
    const speed = ac.groundSpeedKt;
    if (alt != null && alt <= TAXI_MAX_ALT_FT) {
      if (speed == null || speed < 1) return "ON GROUND";
      if (speed <= TAXI_MAX_SPEED_KT) return "TAXIING";
    }
    if (vRate != null && !Number.isNaN(vRate)) {
      if (vRate > LED_VERTICAL_THRESHOLD) {
        if (alt != null && alt < LED_TAKEOFF_MAX_ALT_FT) return "TAKEOFF";
        return "DEPARTING";
      }
      if (vRate < -LED_VERTICAL_THRESHOLD) {
        if (alt != null && alt < LED_LANDING_MAX_ALT_FT) return "LANDING";
        return "ARRIVING";
      }
    }
    return formatLedHeading(ac.headingDeg) || "EN ROUTE";
  }
  function ledTelemetryFields(ac) {
    const taxiing = isAircraftTaxiing(ac);
    const parked = ac.altitudeFt != null && ac.altitudeFt <= TAXI_MAX_ALT_FT && (ac.groundSpeedKt == null || ac.groundSpeedKt < 1);
    const fields = [
      {
        value: formatLedAircraftType(ac),
        emphasis: "secondary"
      }
    ];
    if (!taxiing && !parked) {
      fields.push({ value: formatLedFlightPhase(ac), emphasis: "status" });
    }
    fields.push({ value: formatLedAltitude(ac.altitudeFt), emphasis: "measure" });
    fields.push({
      value: parked ? "PARKED" : taxiing ? "TAXIING" : formatLedSpeedMph(ac.groundSpeedKt),
      emphasis: "primary"
    });
    return fields;
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
    "\u2191": [4, 14, 21, 4, 4, 4, 4],
    "\u2193": [4, 4, 4, 4, 21, 14, 4],
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
  function ledCharCellH() {
    return LED_FONT.glyphH + LED_FONT.gapY;
  }
  function glyphFor(ch) {
    var _a;
    const key = ch.toUpperCase();
    return (_a = GLYPHS[key]) != null ? _a : GLYPHS[" "];
  }
  var LED_CARDINAL_WORDS = [
    "NORTHEAST",
    "NORTHWEST",
    "SOUTHEAST",
    "SOUTHWEST",
    "NORTH",
    "SOUTH",
    "EAST",
    "WEST"
  ];
  function trailingCardinal(text) {
    const upper = text.toUpperCase();
    for (const cardinal of LED_CARDINAL_WORDS) {
      if (upper === cardinal) return { prefix: "", cardinal };
      const suffix = ` ${cardinal}`;
      if (upper.endsWith(suffix)) {
        return { prefix: text.slice(0, text.length - suffix.length), cardinal };
      }
    }
    return null;
  }
  function truncateLedChars(text, maxChars) {
    if (maxChars <= 0 || !text) return "";
    if (text.length <= maxChars) return text;
    if (maxChars <= 1) return text.slice(0, 1);
    const card = trailingCardinal(text);
    if (card) {
      const { prefix, cardinal } = card;
      if (cardinal.length <= maxChars) {
        if (!prefix) return cardinal;
        const combined = `${prefix} ${cardinal}`;
        if (combined.length <= maxChars) return combined;
        const prefixRoom = maxChars - cardinal.length - 1;
        if (prefixRoom <= 0 || prefix.length > prefixRoom) return cardinal;
        return `${prefix.slice(0, prefixRoom)} ${cardinal}`;
      }
      return cardinal;
    }
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
    return truncateLedChars(text, maxChars);
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
  function pickWallFlightIdScale(text, bandW, bandH) {
    for (const scale of [2, 1.5, 1]) {
      const { width, height } = ledScaledTextMetrics(text, scale, scale);
      if (width <= bandW && height + 2 <= bandH) {
        return { scaleX: scale, scaleY: scale };
      }
    }
    return { scaleX: 1, scaleY: 1 };
  }
  function pickTelemetryScale(text, bandW, bandH) {
    const cellH = ledCharCellH();
    const scales = bandH >= cellH * 4 ? [2, 1.5, 1, 0.85, 0.75, 0.65] : bandH >= cellH * 2.5 ? [1.5, 1, 0.85, 0.75, 0.65] : [1, 0.85, 0.75, 0.65];
    for (const scale of scales) {
      const { width, height } = ledScaledTextMetrics(text, scale, scale);
      if (width <= bandW && height + 1 <= bandH) {
        return { scaleX: scale, scaleY: scale };
      }
    }
    return { scaleX: 0.65, scaleY: 0.65 };
  }
  function pickStatsPairScale(leftText, rightText, leftW, rightW, bandH) {
    const cellH = ledCharCellH();
    const scales = bandH >= cellH * 2.5 ? [1.5, 1.25, 1, 0.85, 0.75, 0.65] : [1.25, 1, 0.85, 0.75, 0.65];
    for (const scale of scales) {
      const left = truncateLedTextScaled(leftText, leftW, scale);
      const right = truncateLedTextScaled(rightText, rightW, scale);
      const leftMetrics = ledScaledTextMetrics(left, scale, scale);
      const rightMetrics = ledScaledTextMetrics(right, scale, scale);
      const rowH = Math.max(leftMetrics.height, rightMetrics.height);
      if (leftMetrics.width <= leftW && rightMetrics.width <= rightW && rowH + 1 <= bandH) {
        return { scaleX: scale, scaleY: scale };
      }
    }
    return { scaleX: 0.65, scaleY: 0.65 };
  }
  function drawGlyphPixels(ctx, glyph, ox, y, scaleX, scaleY, bold) {
    var _a;
    const thicken = bold && scaleX === 1 && scaleY === 1;
    for (let row = 0; row < LED_FONT.glyphH; row += 1) {
      const bits = (_a = glyph[row]) != null ? _a : 0;
      for (let col = 0; col < LED_FONT.glyphW; col += 1) {
        if (bits >> LED_FONT.glyphW - 1 - col & 1) {
          const x0 = Math.round(ox + col * scaleX);
          const x1 = Math.round(ox + (col + 1) * scaleX);
          const y0 = Math.round(y + row * scaleY);
          const y1 = Math.round(y + (row + 1) * scaleY);
          ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
          if (thicken && row + 1 < LED_FONT.glyphH) {
            ctx.fillRect(x0, Math.round(y + (row + 1) * scaleY), x1 - x0, y1 - y0);
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
    return truncateLedChars(text, maxChars);
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

  // lib/ledAircraftIcons.ts
  var ICONS = {
    // Widebody — full-height swept wings read as the biggest airframe.
    heavy: {
      w: 11,
      h: 7,
      rows: [
        "  XX       ",
        "  XXX      ",
        " XXXXX     ",
        "XXXXXXXXXXX",
        " XXXXX     ",
        "  XXX      ",
        "  XX       "
      ]
    },
    // Mainline narrowbody — medium swept wings + tail stabilizers.
    jet: {
      w: 11,
      h: 7,
      rows: [
        "   XX      ",
        "   XXX     ",
        " X  XXX    ",
        "XXXXXXXXXXX",
        " X  XXX    ",
        "   XXX     ",
        "   XX      "
      ]
    },
    // Regional jet — compact wing block, shorter fuselage.
    regional: {
      w: 11,
      h: 7,
      rows: [
        "    X      ",
        "   XXX     ",
        "   XXX     ",
        "XXXXXXXXX  ",
        "   XXX     ",
        "   XXX     ",
        "    X      "
      ]
    },
    // Turboprop / GA — straight (unswept) wing crossing the fuselage, nose prop.
    prop: {
      w: 11,
      h: 7,
      rows: [
        "    X      ",
        "    X      ",
        "   XXX    X",
        "XXXXXXXXXXX",
        "   XXX    X",
        "    X      ",
        "    X      "
      ]
    }
  };
  var LED_PROGRESS_PLANE_KIND = "jet";
  var LED_PROGRESS_PLANE_H = ICONS.jet.h;
  var LED_PROGRESS_PLANE_W = ICONS.jet.w;
  function drawLedAircraftIcon(ctx, kind, x, yTop, targetH, color) {
    var _a, _b;
    const art = ICONS[kind];
    if (targetH <= 0) return 0;
    const scale = targetH / art.h;
    ctx.fillStyle = color;
    for (let row = 0; row < art.h; row += 1) {
      const line = (_a = art.rows[row]) != null ? _a : "";
      for (let col = 0; col < art.w; col += 1) {
        if (((_b = line[col]) != null ? _b : " ") === " ") continue;
        ctx.fillRect(x + col * scale, yTop + row * scale, scale, scale);
      }
    }
    return art.w * scale;
  }

  // lib/ledMatrix.ts
  var LED_GRID = {
    landscape: { cols: 147, rows: 37 },
    portrait: { cols: 74, rows: 74 }
  };
  var LED_COLORS = {
    /** Bright white — primary kinetic readouts (speed) and flight ID. */
    hero: "#ffffff",
    /** Cool off-white — altitude and origin labels. */
    phosphor: "#d4e2ec",
    /** Sky cyan — live phase (LANDING) and route accent (destination, progress). */
    telemetry: "#58b8e8",
    /** Steel blue-gray — static metadata (aircraft type) and unflown route track. */
    dim: "#7d96a8",
    muted: "#4a5c68",
    track: "#243848",
    panel: "#000000",
    unlit: "#0a0a0a"
  };
  function ledEmphasisColor(emphasis) {
    switch (emphasis) {
      case "primary":
        return LED_COLORS.hero;
      case "status":
        return LED_COLORS.telemetry;
      case "measure":
        return LED_COLORS.phosphor;
      case "secondary":
      default:
        return LED_COLORS.dim;
    }
  }
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
  var LOGO_LEFT_INSET = 2;
  var LOGO_RIGHT_INSET = 1;
  var LOGO_TOP_INSET = 1;
  var LOGO_BOTTOM_GAP = 2;
  var RIGHT_COL_GAP = 4;
  var RIGHT_COL_PAD = 3;
  var LOGO_WIDTH_FRACTION = 0.4;
  var PORTRAIT_LOGO_WIDTH_FRACTION = 0.52;
  var WALL_LOGO_WIDTH_FRACTION = 0.48;
  var WALL_LOGO_SIZE_SCALE = 1;
  var WALL_FLIGHT_TOP_INSET = 1;
  var LOGO_SIZE_SCALE = 1;
  function isWallDisplay(rows) {
    return rows > LED_GRID.landscape.rows + 4;
  }
  function isPortraitPanel(cols, rows) {
    return cols < rows * 1.6;
  }
  var HEADER_ROW_H = ledCharCellH() + LED_PROGRESS_PLANE_H + 3;
  function computeLogoColumnWidth(cols, widthFraction = LOGO_WIDTH_FRACTION) {
    return Math.max(12, Math.floor(cols * widthFraction));
  }
  function computeLogoColumn(cols, rows) {
    const wall = isWallDisplay(rows);
    const portrait = isPortraitPanel(cols, rows);
    const widthFraction = wall ? WALL_LOGO_WIDTH_FRACTION : portrait ? PORTRAIT_LOGO_WIDTH_FRACTION : LOGO_WIDTH_FRACTION;
    const columnW = computeLogoColumnWidth(cols, widthFraction);
    const headerH = HEADER_ROW_H;
    const logoBandW = columnW - LOGO_LEFT_INSET - LOGO_RIGHT_INSET;
    const logoBandH = rows - headerH - LOGO_TOP_INSET - LOGO_BOTTOM_GAP;
    const sizeScale = wall ? WALL_LOGO_SIZE_SCALE : LOGO_SIZE_SCALE;
    const maxSide = Math.min(logoBandW, logoBandH);
    let logoW = Math.max(12, Math.floor(maxSide * sizeScale));
    logoW = Math.min(logoW, logoBandW);
    const logoH = logoW;
    const logoY = headerH + LOGO_TOP_INSET + Math.max(0, Math.floor((logoBandH - logoH) / 2));
    return {
      columnW,
      logoW,
      logoH,
      logoX: LOGO_LEFT_INSET,
      logoY,
      flightX: LOGO_LEFT_INSET,
      flightBandH: headerH,
      flightW: wall ? logoBandW : logoW,
      flightTopInset: wall ? WALL_FLIGHT_TOP_INSET : 1
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
    const asciiArrow = hero.indexOf("->");
    if (asciiArrow >= 0) {
      return {
        origin: hero.slice(0, asciiArrow).trim(),
        dest: hero.slice(asciiArrow + 2).trim()
      };
    }
    const hyphen = hero.indexOf("-");
    if (hyphen >= 0) {
      return {
        origin: hero.slice(0, hyphen).trim(),
        dest: hero.slice(hyphen + 1).trim()
      };
    }
    return { origin: hero.trim(), dest: "" };
  }
  function buildRightContentLayout(rows, headerBottom, options) {
    var _a;
    const wall = (_a = options == null ? void 0 : options.wall) != null ? _a : false;
    const bandTop = headerBottom + 1;
    const bandBottom = rows - 1;
    const bandH = Math.max(ledCompactCellH() * 2, bandBottom - bandTop);
    return {
      bandTop,
      bandH,
      routeZoneTop: bandTop,
      routeZoneH: 0,
      statsZoneTop: bandTop,
      statsZoneH: bandH,
      useStackedRoute: false,
      statsUseFullFont: wall || bandH >= ledCharCellH() + 1,
      wall
    };
  }
  function buildLandscapeLayout(cols, rows) {
    const pad = 1;
    const logo = computeLogoColumn(cols, rows);
    const wall = isWallDisplay(rows);
    const dividerX = logo.columnW + 1;
    const mainX = logo.columnW + RIGHT_COL_GAP + RIGHT_COL_PAD;
    const mainW = cols - mainX - pad - RIGHT_COL_PAD;
    const headerY = wall ? WALL_FLIGHT_TOP_INSET : 1;
    const headerH = logo.flightBandH;
    const headerBottom = headerY + headerH;
    const rightLayout = buildRightContentLayout(rows, headerBottom, { wall });
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
      flightTopInset: logo.flightTopInset,
      dividerX,
      headerX: pad,
      headerY,
      headerW: cols - 2 * pad,
      headerH
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
      drawLogoFallback(ctx, content.logoFallback, layout, content.logoBackground);
    }
    return logoRect;
  }
  function drawPanelChrome(ctx, layout) {
    const { statsZoneTop, mainX, mainW } = layout;
    if (layout.statsZoneH > 2) {
      ctx.fillStyle = LED_COLORS.unlit;
      ctx.fillRect(mainX, statsZoneTop - 1, mainW, 1);
    }
  }
  function drawRouteProgressBar(ctx, x, y, w, h, progress) {
    if (w <= 0 || h <= 0) return;
    const planeH = LED_PROGRESS_PLANE_H;
    const planeW = LED_PROGRESS_PLANE_W;
    const planeY = y;
    const trackY = y + Math.floor(planeH / 2);
    const trackStart = x + 1;
    const trackEnd = x + w - 1;
    const frac = progress == null ? null : Math.max(0, Math.min(1, progress));
    ctx.fillStyle = LED_COLORS.phosphor;
    ctx.fillRect(x, trackY, 1, 1);
    if (trackStart > trackEnd) return;
    const drawTrackLine = (from, to, color) => {
      if (from > to) return;
      ctx.fillStyle = color;
      for (let col = from; col <= to; col += 1) {
        ctx.fillRect(col, trackY, 1, 1);
      }
    };
    drawTrackLine(trackStart, trackEnd, LED_COLORS.dim);
    const planeFrac = frac != null ? frac : 0.08;
    const trackSpan = trackEnd - trackStart;
    const noseCol = trackStart + Math.round(trackSpan * planeFrac);
    const planeX = Math.max(
      x,
      Math.min(noseCol - Math.floor(planeW / 2), x + w - planeW)
    );
    const flownEnd = Math.min(trackEnd, Math.max(trackStart, planeX + Math.floor(planeW / 3)));
    if (frac != null && flownEnd >= trackStart) {
      drawTrackLine(trackStart, flownEnd, LED_COLORS.telemetry);
    }
    drawLedAircraftIcon(ctx, LED_PROGRESS_PLANE_KIND, planeX, planeY, planeH, LED_COLORS.hero);
  }
  function drawRouteHeaderRow(ctx, layout, routeHero, progress, flightId) {
    const { headerX, headerY, headerW, headerH, wall } = layout;
    const { origin, dest } = parseLedRouteHero(routeHero);
    const hasRoute = Boolean(origin || dest);
    if (!hasRoute && !flightId) return;
    const barH = LED_PROGRESS_PLANE_H;
    const textX = headerX + 1;
    const textW = headerW - 2;
    const pickRouteScale = wall ? pickWallFlightIdScale : pickFlightIdScale;
    if (!hasRoute && flightId) {
      const slotH = headerH - 2;
      const idScale = pickRouteScale(flightId, textW, slotH);
      const idMetrics = ledScaledTextMetrics(flightId, idScale.scaleX, idScale.scaleY);
      const idY = headerY + Math.max(0, Math.floor((slotH - idMetrics.height) / 2));
      drawLedTextScaled(
        ctx,
        flightId,
        centerLedTextXScaled(flightId, textX, textW, idScale.scaleX),
        idY,
        LED_COLORS.hero,
        textW,
        idScale.scaleX,
        idScale.scaleY,
        idScale.scaleX === 1
      );
      return;
    }
    const textSlotH = Math.max(ledCharCellH(), headerH - barH - 1);
    const sideW = Math.floor(textW * 0.22);
    const centerW = Math.max(ledCharCellH() * 3, textW - 2 * sideW);
    const centerX = textX + Math.floor((textW - centerW) / 2);
    const codeMaxW = sideW;
    const routeLabel = origin || dest || "";
    const scale = pickRouteScale(routeLabel || flightId || "DEN", codeMaxW, textSlotH);
    const destW = dest ? ledScaledTextMetrics(dest, scale.scaleX, scale.scaleY).width : 0;
    const rowH = ledScaledTextMetrics(routeLabel || flightId || "X", scale.scaleX, scale.scaleY).height;
    const textY = headerY + Math.max(0, Math.floor((textSlotH - rowH) / 2));
    const snap = scale.scaleX === 1;
    if (origin) {
      drawLedTextScaled(
        ctx,
        origin,
        textX,
        textY,
        LED_COLORS.phosphor,
        codeMaxW,
        scale.scaleX,
        scale.scaleY,
        snap
      );
    }
    if (dest) {
      drawLedTextScaled(
        ctx,
        dest,
        textX + textW - destW,
        textY,
        LED_COLORS.telemetry,
        codeMaxW,
        scale.scaleX,
        scale.scaleY,
        snap
      );
    }
    if (flightId) {
      const idScale = pickRouteScale(flightId, centerW, textSlotH);
      const idMetrics = ledScaledTextMetrics(flightId, idScale.scaleX, idScale.scaleY);
      const idY = headerY + Math.max(0, Math.floor((textSlotH - idMetrics.height) / 2));
      drawLedTextScaled(
        ctx,
        flightId,
        centerLedTextXScaled(flightId, centerX, centerW, idScale.scaleX),
        idY,
        LED_COLORS.hero,
        centerW,
        idScale.scaleX,
        idScale.scaleY,
        idScale.scaleX === 1
      );
    }
    if (hasRoute) {
      const barY = headerY + textSlotH;
      drawRouteProgressBar(ctx, textX, barY, textW, barH, progress);
    }
  }
  function orderedTelemetryFields(telemetry) {
    const typeField = telemetry.find((f) => f.emphasis === "secondary");
    const speedField = telemetry.find((f) => f.emphasis === "primary");
    const statusFields = telemetry.filter((f) => f.emphasis === "status");
    const measureFields = telemetry.filter((f) => f.emphasis === "measure");
    if (!typeField || !speedField) return telemetry.filter(Boolean);
    return [typeField, ...statusFields, ...measureFields, speedField];
  }
  function rightLedTextXScaled(text, bandX, bandW, scaleX) {
    const display = truncateLedTextScaled(text, bandW, scaleX);
    const { width } = ledScaledTextMetrics(display, scaleX, scaleX);
    return bandX + Math.max(0, bandW - width);
  }
  function allocateStatsSlotHeights(lineCount, zoneH, gap, weights) {
    const totalGap = gap * Math.max(0, lineCount - 1);
    const usable = Math.max(lineCount, zoneH - totalGap);
    const weightSum = weights.reduce((sum, w) => sum + w, 0) || lineCount;
    const heights = weights.map((w) => Math.max(1, Math.floor(usable * w / weightSum)));
    const used = heights.reduce((sum, h) => sum + h, 0);
    heights[lineCount - 1] = Math.max(1, heights[lineCount - 1] + (usable - used));
    return heights;
  }
  function drawStatsTextInBand(ctx, text, bandX, bandY, bandW, bandH, color, align, scalePicker) {
    const scale = scalePicker(text, bandW, bandH);
    const metrics = ledScaledTextMetrics(text, scale.scaleX, scale.scaleY);
    const y = bandY + Math.round((bandH - metrics.height) / 2);
    let x = bandX;
    if (align === "center") {
      x = centerLedTextXScaled(text, bandX, bandW, scale.scaleX);
    } else if (align === "right") {
      x = rightLedTextXScaled(text, bandX, bandW, scale.scaleX);
    }
    ctx.save();
    ctx.beginPath();
    ctx.rect(bandX, bandY, bandW, bandH);
    ctx.clip();
    drawLedTextScaled(
      ctx,
      text,
      x,
      y,
      color,
      bandW,
      scale.scaleX,
      scale.scaleY,
      scale.scaleX === 1
    );
    ctx.restore();
  }
  function allocateStatsDashboardHeights(statsZoneH, gap) {
    const dataH = Math.max(ledCharCellH() + 1, Math.floor(statsZoneH * 0.38));
    const heroH = Math.max(ledCharCellH() * 2, statsZoneH - dataH - gap);
    const used = heroH + gap + dataH;
    const inset = Math.max(0, Math.floor((statsZoneH - used) / 2));
    return { heroH, dataH, inset };
  }
  function drawStatsTypeBadge(ctx, text, textX, textW, bandY, color) {
    drawLedTextCompact(ctx, text, textX, bandY, color, textW);
  }
  function drawStatsHeroRow(ctx, typeField, heroField, textX, textW, bandY, bandH) {
    drawStatsTextInBand(
      ctx,
      heroField.value,
      textX,
      bandY,
      textW,
      bandH,
      ledEmphasisColor(heroField.emphasis),
      "center",
      pickFlightIdScale
    );
    drawStatsTypeBadge(
      ctx,
      typeField.value,
      textX,
      textW,
      bandY,
      ledEmphasisColor(typeField.emphasis)
    );
  }
  function drawStatsPairRow(ctx, leftText, rightText, leftColor, rightColor, textX, textW, bandY, bandH) {
    const gutter = 3;
    const halfW = Math.floor((textW - gutter) / 2);
    const rightX = textX + halfW + gutter;
    const rightW = textW - halfW - gutter;
    const scale = pickStatsPairScale(leftText, rightText, halfW, rightW, bandH);
    const leftDisplay = truncateLedTextScaled(leftText, halfW, scale.scaleX);
    const rightDisplay = truncateLedTextScaled(rightText, rightW, scale.scaleX);
    const leftMetrics = ledScaledTextMetrics(leftDisplay, scale.scaleX, scale.scaleY);
    const rightMetrics = ledScaledTextMetrics(rightDisplay, scale.scaleX, scale.scaleY);
    const rowH = Math.max(leftMetrics.height, rightMetrics.height);
    const y = bandY + Math.round((bandH - rowH) / 2);
    const dotX = textX + halfW + Math.floor(gutter / 2);
    ctx.save();
    ctx.beginPath();
    ctx.rect(textX, bandY, textW, bandH);
    ctx.clip();
    drawLedTextScaled(
      ctx,
      leftDisplay,
      textX,
      y,
      leftColor,
      halfW,
      scale.scaleX,
      scale.scaleY,
      scale.scaleX === 1
    );
    drawLedTextScaled(
      ctx,
      rightDisplay,
      rightLedTextXScaled(rightDisplay, rightX, rightW, scale.scaleX),
      y,
      rightColor,
      rightW,
      scale.scaleX,
      scale.scaleY,
      scale.scaleX === 1
    );
    if (bandH >= ledCharCellH()) {
      ctx.fillStyle = LED_COLORS.dim;
      ctx.fillRect(dotX, bandY + Math.floor(bandH / 2), 1, 1);
    }
    ctx.restore();
  }
  function drawStatsDashboard(ctx, textX, textW, statsZoneTop, statsZoneH, gap, typeField, heroField, measureField, primaryField) {
    const { heroH, dataH, inset } = allocateStatsDashboardHeights(statsZoneH, gap);
    let top = statsZoneTop + inset;
    drawStatsHeroRow(ctx, typeField, heroField, textX, textW, top, heroH);
    top += heroH + gap;
    drawStatsPairRow(
      ctx,
      measureField.value,
      primaryField.value,
      LED_COLORS.phosphor,
      LED_COLORS.hero,
      textX,
      textW,
      top,
      dataH
    );
  }
  function drawStatsGroundLayout(ctx, textX, textW, statsZoneTop, statsZoneH, gap, typeField, heroField, measureField) {
    const { heroH, dataH, inset } = allocateStatsDashboardHeights(statsZoneH, gap);
    let top = statsZoneTop + inset;
    drawStatsHeroRow(ctx, typeField, heroField, textX, textW, top, heroH);
    top += heroH + gap;
    drawStatsTextInBand(
      ctx,
      measureField.value,
      textX,
      top,
      textW,
      dataH,
      LED_COLORS.phosphor,
      "left",
      pickTelemetryScale
    );
  }
  function drawStatsRow(ctx, layout, telemetry) {
    var _a;
    const { mainX, mainW, statsZoneTop, statsZoneH, wall } = layout;
    const textX = mainX + 1;
    const textW = mainW - 2;
    const entries = orderedTelemetryFields(telemetry);
    const gap = wall ? 2 : 1;
    const lines = entries.length > 0 ? entries : [];
    const typeField = entries.find((f) => f.emphasis === "secondary");
    const statusField = entries.find((f) => f.emphasis === "status");
    const measureField = entries.find((f) => f.emphasis === "measure");
    const primaryField = entries.find((f) => f.emphasis === "primary");
    if (typeField && statusField && measureField && primaryField) {
      drawStatsDashboard(
        ctx,
        textX,
        textW,
        statsZoneTop,
        statsZoneH,
        gap,
        typeField,
        statusField,
        measureField,
        primaryField
      );
      return;
    }
    if (typeField && !statusField && measureField && primaryField) {
      drawStatsGroundLayout(
        ctx,
        textX,
        textW,
        statsZoneTop,
        statsZoneH,
        gap,
        typeField,
        primaryField,
        measureField
      );
      return;
    }
    if (lines.length >= 2) {
      const weights = lines.map(() => 1 / lines.length);
      const slotHeights = allocateStatsSlotHeights(lines.length, statsZoneH, gap, weights);
      let slotTop = statsZoneTop;
      lines.forEach((field2, i) => {
        var _a2;
        const slotH = (_a2 = slotHeights[i]) != null ? _a2 : 1;
        const text = field2.value;
        const color = ledEmphasisColor(field2.emphasis);
        const scale = pickTelemetryScale(text, textW, slotH);
        const metrics = ledScaledTextMetrics(text, scale.scaleX, scale.scaleY);
        const y = slotTop + Math.round((slotH - metrics.height) / 2);
        ctx.save();
        ctx.beginPath();
        ctx.rect(textX, slotTop, textW, slotH);
        ctx.clip();
        drawLedTextScaled(
          ctx,
          text,
          centerLedTextXScaled(text, textX, textW, scale.scaleX),
          y,
          color,
          textW,
          scale.scaleX,
          scale.scaleY,
          scale.scaleX === 1
        );
        ctx.restore();
        slotTop += slotH + (i < lines.length - 1 ? gap : 0);
      });
      return;
    }
    const field = lines[0];
    const aircraft = (_a = field == null ? void 0 : field.value) != null ? _a : "";
    const typeColor = ledEmphasisColor(field == null ? void 0 : field.emphasis);
    const rowH = ledCompactCellH();
    const rowY = statsZoneTop + Math.round((statsZoneH - rowH) / 2);
    const aircraftScale = pickTelemetryScale(aircraft, textW, statsZoneH);
    const aircraftMetrics = ledScaledTextMetrics(
      aircraft,
      aircraftScale.scaleX,
      aircraftScale.scaleY
    );
    const aircraftY = rowY + Math.round((rowH - aircraftMetrics.height) / 2);
    drawLedTextScaled(
      ctx,
      aircraft,
      textX,
      aircraftY,
      typeColor,
      textW,
      aircraftScale.scaleX,
      aircraftScale.scaleY,
      aircraftScale.scaleX === 1
    );
    const speedField = telemetry.find((f) => f.emphasis === "primary");
    if (speedField) {
      drawLedTextCompactRight(
        ctx,
        speedField.value,
        textX + textW,
        rowY,
        ledEmphasisColor(speedField.emphasis),
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
  function drawLandscapeFlightPanel(ctx, layout, content, _rows) {
    drawRouteHeaderRow(
      ctx,
      layout,
      content.routeHero,
      content.routeProgress,
      content.flightId
    );
    drawPanelChrome(ctx, layout);
    drawStatsRow(ctx, layout, content.telemetry);
  }
  function logoFallbackColor(background) {
    const bg = parseHexColor(background);
    return colorLuminance(bg) > 140 ? LED_COLORS.muted : LED_COLORS.hero;
  }
  function wrapLogoNameLines(name, maxCharsPerLine, maxLines) {
    const words = name.toUpperCase().split(/\s+/).filter(Boolean);
    if (!words.length) return [];
    const lines = [];
    let current = "";
    for (const word of words) {
      const next = current ? `${current} ${word}` : word;
      if (next.length <= maxCharsPerLine) {
        current = next;
        continue;
      }
      if (current) {
        lines.push(current);
        if (lines.length >= maxLines) return lines;
        current = "";
      }
      if (word.length <= maxCharsPerLine) {
        current = word;
        continue;
      }
      let offset = 0;
      while (offset < word.length && lines.length < maxLines) {
        lines.push(word.slice(offset, offset + maxCharsPerLine));
        offset += maxCharsPerLine;
      }
    }
    if (current && lines.length < maxLines) lines.push(current);
    return lines;
  }
  function pickLogoNameScale(text, bandW, bandH) {
    for (const scale of [1, 0.85, 0.75, 0.65, 0.55, 0.45]) {
      const display = truncateLedTextScaled(text, bandW, scale);
      const { width, height } = ledScaledTextMetrics(display, scale, scale);
      if (width <= bandW && height + 1 <= bandH) {
        return { scaleX: scale, scaleY: scale };
      }
    }
    return { scaleX: 0.45, scaleY: 0.45 };
  }
  function drawLogoFallback(ctx, fallback, layout, background) {
    const name = fallback.trim().toUpperCase();
    if (!name) return;
    const color = logoFallbackColor(background);
    const pad = 1;
    const innerW = Math.max(1, layout.logoW - pad * 2);
    const innerH = Math.max(1, layout.logoH - pad * 2);
    const baseX = layout.logoX + pad;
    const baseY = layout.logoY + pad;
    const drawSingleLine = () => {
      const { scaleX, scaleY } = pickLogoNameScale(name, innerW, innerH);
      const display = truncateLedTextScaled(name, innerW, scaleX);
      const metrics = ledScaledTextMetrics(display, scaleX, scaleY);
      const x = baseX + Math.floor((innerW - metrics.width) / 2);
      const y2 = baseY + Math.floor((innerH - metrics.height) / 2);
      drawLedTextScaled(ctx, display, x, y2, color, innerW, scaleX, scaleY);
    };
    if (!name.includes(" ")) {
      drawSingleLine();
      return;
    }
    const maxCharsPerLine = Math.max(1, Math.floor((innerW + 2) / ledCompactCellW()));
    const maxLines = Math.max(1, Math.floor(innerH / ledCompactCellH()));
    const lines = wrapLogoNameLines(name, maxCharsPerLine, maxLines);
    if (lines.length <= 1) {
      drawSingleLine();
      return;
    }
    const blockH = lines.length * ledCompactCellH() - 1;
    let y = baseY + Math.floor((innerH - blockH) / 2);
    for (const line of lines) {
      const display = truncateLedTextCompact(line, innerW);
      const width = measureLedTextCompact(display);
      const x = baseX + Math.floor((innerW - width) / 2);
      drawLedTextCompact(ctx, display, x, y, color, innerW);
      y += ledCompactCellH();
    }
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
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
    ctx.imageSmoothingEnabled = false;
    if (cols >= rows * 1.6) {
      return renderLandscapeLayout(ctx, cols, rows, content, logo);
    }
    return renderPortraitLayout(ctx, cols, rows, content, logo);
  }
  var SNAP_PALETTE = [
    LED_COLORS.hero,
    LED_COLORS.phosphor,
    LED_COLORS.telemetry,
    LED_COLORS.dim,
    LED_COLORS.muted
  ];
  function snapTextColor(r, g, b, a = 255) {
    const lum = r * 0.299 + g * 0.587 + b * 0.114;
    if (a < 128 || lum < 40) return null;
    let best = null;
    let bestDist = Infinity;
    for (const hex of SNAP_PALETTE) {
      const c = parseHexColor(hex);
      const dist = __pow(r - c.r, 2) + __pow(g - c.g, 2) + __pow(b - c.b, 2);
      if (dist < bestDist) {
        bestDist = dist;
        best = hex;
      }
    }
    return bestDist <= 4900 ? best : null;
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
        const textColor = snapTextColor(r, g, b, a);
        if (textColor) {
          const evenPhosphor = textColor === LED_COLORS.hero || textColor === LED_COLORS.phosphor || textColor === LED_COLORS.telemetry;
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
    const brand = getAircraftDisplayBrand(ac);
    const wallStyle = getAirlineLedWallStyle(brand);
    const routeLine = ledRouteLabel(ac);
    const operatorTag = formatLedOperatorTag(ac);
    return {
      airlineName: brand.name,
      flightId: formatLedFlightId(ac, brand),
      operatorTag,
      routeHero: formatLedRouteHero(routeLine),
      routeProgress: computeFlightProgress(ac),
      telemetry: ledTelemetryFields(ac),
      logoUrl: airlineLedLogoUrl(brand),
      logoIcao: resolveLedLogoMarkIcao(brand, operatorTag),
      logoFallback: brand.name,
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
      draw(content) {
        currentContent = content;
        const nextUrl = content.logoUrl;
        if (!cancelled) drawFrame();
        if (nextUrl === logoUrl) return Promise.resolve();
        logoUrl = nextUrl;
        const url = nextUrl;
        return loadLedLogo(url != null ? url : "").then((img) => {
          if (cancelled || logoUrl !== url) return;
          logo = img;
          drawFrame();
        });
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
    detectOrientation,
    setApprovedManifest
  };
  return __toCommonJS(legacyLedWallRuntime_exports);
})();
