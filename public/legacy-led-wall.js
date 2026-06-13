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

  // public/airline-logos/approved.json
  var approved_default = {
    SWA: {
      file: "SWA.png",
      source: "SWA-up1781311064934.png",
      approvedAt: "2026-06-13T00:37:46.247Z"
    },
    AAL: {
      file: "AAL.png",
      source: "AAL-up1781311232260.png",
      approvedAt: "2026-06-13T00:40:41.178Z"
    },
    ACA: {
      file: "ACA.png",
      source: "ACA-up1781311169105.png",
      approvedAt: "2026-06-13T00:40:43.309Z"
    },
    ASA: {
      file: "ASA.png",
      source: "ASA-up1781311260399.png",
      approvedAt: "2026-06-13T00:41:01.321Z"
    },
    DAL: {
      file: "DAL.png",
      source: "DAL-up1781311312502.png",
      approvedAt: "2026-06-13T00:41:53.309Z"
    },
    AAY: {
      file: "AAY.png",
      source: "AAY-up1781311380611.png",
      approvedAt: "2026-06-13T00:43:01.582Z"
    },
    AFR: {
      file: "AFR.png",
      source: "AFR-up1781311408706.png",
      approvedAt: "2026-06-13T00:43:30.043Z"
    },
    AMX: {
      file: "AMX.png",
      source: "AMX-up1781311430809.png",
      approvedAt: "2026-06-13T00:43:51.990Z"
    },
    BAW: {
      file: "BAW.png",
      source: "BAW-up1781311464385.png",
      approvedAt: "2026-06-13T00:44:25.282Z"
    },
    CAY: {
      file: "CAY.png",
      source: "CAY-up1781311483325.png",
      approvedAt: "2026-06-13T00:44:44.287Z"
    },
    CMP: {
      file: "CMP.png",
      source: "CMP-up1781311499184.png",
      approvedAt: "2026-06-13T00:45:00.731Z"
    },
    DLH: {
      file: "DLH.png",
      source: "DLH-up1781311519654.png",
      approvedAt: "2026-06-13T00:45:20.663Z"
    },
    EDW: {
      file: "EDW.png",
      source: "EDW-up1781311534077.png",
      approvedAt: "2026-06-13T00:45:34.775Z"
    },
    EIN: {
      file: "EIN.png",
      source: "EIN-up1781311546211.png",
      approvedAt: "2026-06-13T00:45:47.321Z"
    },
    FFT: {
      file: "FFT.png",
      source: "FFT-up1781311556290.png",
      approvedAt: "2026-06-13T00:45:57.109Z"
    },
    ICE: {
      file: "ICE.png",
      source: "ICE-up1781311568957.png",
      approvedAt: "2026-06-13T00:46:10.020Z"
    },
    JBU: {
      file: "JBU.png",
      source: "JBU-up1781311580081.png",
      approvedAt: "2026-06-13T00:46:20.833Z"
    },
    MXY: {
      file: "MXY.png",
      source: "MXY-up1781311593428.png",
      approvedAt: "2026-06-13T00:46:34.259Z"
    },
    SCX: {
      file: "SCX.png",
      source: "SCX-up1781311604801.png",
      approvedAt: "2026-06-13T00:46:45.592Z"
    },
    THY: {
      file: "THY.png",
      source: "THY-up1781311623978.png",
      approvedAt: "2026-06-13T00:47:05.353Z"
    },
    UAL: {
      file: "UAL.png",
      source: "UAL-up1781311634268.png",
      approvedAt: "2026-06-13T00:47:15.278Z"
    },
    VIV: {
      file: "VIV.png",
      source: "VIV-up1781311645016.png",
      approvedAt: "2026-06-13T00:47:25.747Z"
    },
    VOI: {
      file: "VOI.png",
      source: "VOI-up1781311658426.png",
      approvedAt: "2026-06-13T00:47:39.441Z"
    },
    WJA: {
      file: "WJA.png",
      source: "WJA-up1781311668416.png",
      approvedAt: "2026-06-13T00:47:49.102Z"
    }
  };

  // lib/approvedLogos.ts
  var APPROVED_LOGOS = approved_default;
  function approvedLogoUrl(icao) {
    const entry = APPROVED_LOGOS[icao == null ? void 0 : icao.trim().toUpperCase()];
    if (!(entry == null ? void 0 : entry.file)) return void 0;
    const version = entry.approvedAt ? Date.parse(entry.approvedAt) : NaN;
    const suffix = Number.isFinite(version) ? `?v=${version}` : "";
    return `/airline-logos/${entry.file}${suffix}`;
  }

  // lib/aircraftCategories.ts
  var CATEGORY_ICAO = {
    MILITARY: "MIL",
    BIZJET: "PVT",
    GA: "GA",
    VIP: "VIP",
    CARGO: "CGO"
  };
  var FAMOUS_TAILS = {
    N628TS: { name: "Elon Musk" },
    N898TS: { name: "Taylor Swift" },
    N757AF: { name: "Trump Force One" }
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
    "C56",
    "C68",
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
  var GA_TYPE_PREFIXES = [
    "C150",
    "C152",
    "C172",
    "C182",
    "C206",
    "C210",
    "PA28",
    "PA32",
    "PA44",
    "SR20",
    "SR22",
    "DA40",
    "DA42",
    "BE33",
    "BE35",
    "BE36",
    "M20P",
    "RV",
    "AA5",
    "P28A",
    "C77R",
    "TBM9"
  ];
  var GA_EMITTER_CATEGORIES = /* @__PURE__ */ new Set(["A1", "A2"]);
  var CARGO_CALLSIGN_PREFIXES = [
    "FDX",
    // FedEx
    "UPS",
    // UPS Airlines
    "GTI",
    // Atlas Air
    "GEC",
    // Lufthansa Cargo
    "CLX",
    // Cargolux
    "CKS",
    // Kalitta Air
    "ABX",
    // ABX Air
    "BOX",
    // AeroLogic
    "GSS",
    // Atlas Air / DHL (Global Supply Systems)
    "BCS",
    // DHL (European Air Transport)
    "NCA",
    // Nippon Cargo
    "PAC",
    // Polar Air Cargo
    "MPH",
    // Martinair Cargo
    "ABW",
    // AirBridgeCargo
    "WGN",
    // Western Global
    "ICL",
    // CAL Cargo
    "CAO",
    // Air China Cargo
    "CKK"
    // China Cargo
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
    },
    [CATEGORY_ICAO.GA]: {
      name: "General Aviation",
      icao: CATEGORY_ICAO.GA,
      iata: "GA",
      primaryColor: "#166534",
      accentColor: "#FFFFFF",
      secondaryColor: "#DC2626"
    },
    [CATEGORY_ICAO.VIP]: {
      name: "Notable Jet",
      icao: CATEGORY_ICAO.VIP,
      iata: "VIP",
      primaryColor: "#581C87",
      accentColor: "#FBBF24",
      secondaryColor: "#FFFFFF"
    },
    [CATEGORY_ICAO.CARGO]: {
      name: "Cargo",
      icao: CATEGORY_ICAO.CARGO,
      iata: "CG",
      primaryColor: "#44403C",
      accentColor: "#F59E0B",
      secondaryColor: "#1C1917"
    }
  };
  function normalizeTail(value) {
    if (!value) return void 0;
    const normalized = value.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
    return normalized.length > 0 ? normalized : void 0;
  }
  function aircraftTail(ac) {
    var _a;
    return (_a = normalizeTail(ac.registration)) != null ? _a : normalizeTail(ac.callsign);
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
  function isNNumberCallsign(callsign) {
    if (!callsign) return false;
    return /^N[0-9][0-9A-Z]{0,4}[A-Z]$/.test(callsign.trim().toUpperCase());
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
  function isCargo(ac) {
    var _a;
    const callsign = (_a = ac.callsign) == null ? void 0 : _a.trim().toUpperCase();
    if (!callsign) return false;
    const prefix = callsign.slice(0, 3);
    return CARGO_CALLSIGN_PREFIXES.includes(prefix);
  }
  function isBizjet(ac) {
    if (matchesPrefix(ac.aircraftType, BIZJET_TYPE_PREFIXES)) return true;
    if (ac.aircraftType === "PC12") return true;
    if (isNNumberCallsign(ac.callsign) && ac.category === "A3") return true;
    return false;
  }
  function isGeneralAviation(ac) {
    if (matchesPrefix(ac.aircraftType, GA_TYPE_PREFIXES)) return true;
    if (ac.category && GA_EMITTER_CATEGORIES.has(ac.category)) return true;
    if (isNNumberCallsign(ac.callsign) && !isBizjet(ac)) return true;
    return false;
  }
  function classifyAircraft(ac, isAirline) {
    if (isAirline) return "airline";
    if (lookupFamousTail(ac)) return "vip";
    if (isMilitary(ac)) return "military";
    if (isCargo(ac)) return "cargo";
    if (isBizjet(ac)) return "bizjet";
    if (isGeneralAviation(ac)) return "ga";
    return "unknown";
  }
  function getNonAirlineDisplayBrand(ac) {
    const famous = lookupFamousTail(ac);
    if (famous) {
      return __spreadProps(__spreadValues({}, CATEGORY_BRANDS[CATEGORY_ICAO.VIP]), { name: famous.name });
    }
    switch (classifyAircraft(ac, false)) {
      case "military":
        return CATEGORY_BRANDS[CATEGORY_ICAO.MILITARY];
      case "cargo":
        return CATEGORY_BRANDS[CATEGORY_ICAO.CARGO];
      case "bizjet":
        return CATEGORY_BRANDS[CATEGORY_ICAO.BIZJET];
      case "ga":
        return CATEGORY_BRANDS[CATEGORY_ICAO.GA];
      default:
        return {
          name: "Unknown",
          icao: "UNK",
          iata: "XX",
          primaryColor: "#334155",
          accentColor: "#94A3B8"
        };
    }
  }
  function isCategoryBrand(icao) {
    return icao in CATEGORY_BRANDS;
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
  var LOGO_BRAND_ICAO_LIST = [...AIRLINE_ICAO_LIST, ...CATEGORY_ICAO_LIST];
  function getAirlineFromCallsign(callsign) {
    var _a;
    if (!callsign) return null;
    const resolved = resolveCallsignPrefix(callsign);
    return (_a = AIRLINES[resolved]) != null ? _a : null;
  }
  function getAircraftDisplayBrand(ac) {
    const airline = getAirlineFromCallsign(ac.callsign);
    if (airline) return airline;
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
    MIL: ["#C5A572", "#3D4F2F", "#2C1810"],
    PVT: ["#D4AF37", "#64748B", "#1E293B"],
    GA: ["#FFFFFF", "#166534", "#DC2626"],
    VIP: ["#FBBF24", "#581C87", "#FFFFFF"]
  };
  var LED_LOGO_NO_TILE_BORDER = /* @__PURE__ */ new Set(["JBU", "SWA", "MIL", "PVT", "GA", "VIP"]);
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
  var COLOR_LOGO_TILE = /* @__PURE__ */ new Set(["AAL", "FFT", "ASA", "EIN"]);
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
    const onDarkLogo = ["UAL", "DAL", "JBU", "SWA", "MIL", "PVT", "VIP"].includes(brand.icao);
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
  var LED_NATIVE_MARK_ICAO = /* @__PURE__ */ new Set([
    "AAL",
    "EIN",
    "SWA",
    "DAL",
    "MIL",
    "PVT",
    "GA",
    "VIP"
  ]);
  function airlineLedLogoUrl(brand) {
    if (LED_NATIVE_MARK_ICAO.has(brand.icao)) return void 0;
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
    A19N: "A319neo",
    A20N: "A320neo",
    A21N: "A321neo",
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
    CL35: "Challenger 350"
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
    CL35: "CL350"
  };
  function normalizeTypeCode(raw) {
    return raw.trim().toUpperCase();
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
      return `A${trimmed.replace(/^airbus\s+/i, "").trim()}`;
    }
    return trimmed;
  }
  function formatAircraftTypeBoard(raw) {
    var _a;
    if (!(raw == null ? void 0 : raw.trim())) return "Unknown";
    const code = normalizeTypeCode(raw.trim());
    return (_a = BOARD_TYPE_NAMES[code]) != null ? _a : formatAircraftTypeDisplay(raw);
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
    var _a, _b, _c, _d;
    if (isCategoryBrand(brand.icao)) {
      return ((_a = ac.registration) == null ? void 0 : _a.trim()) || ((_b = ac.callsign) == null ? void 0 : _b.trim()) || ac.hex.toUpperCase();
    }
    const raw = ((_c = ac.flightNumber) == null ? void 0 : _c.trim()) || ((_d = ac.callsign) == null ? void 0 : _d.trim().slice(3)) || "";
    const digits = raw.replace(/\D/g, "");
    const num = digits || raw || "----";
    return `${brand.iata} ${num}`;
  }
  function formatLedOperatorTag(ac) {
    var _a, _b;
    return (_b = (_a = getRegionalOperator(ac.callsign)) == null ? void 0 : _a.icao) != null ? _b : "";
  }
  function formatLedAircraftType(ac) {
    var _a, _b;
    const raw = ((_a = ac.aircraftType) == null ? void 0 : _a.trim()) || ((_b = ac.category) == null ? void 0 : _b.trim());
    return formatAircraftTypeBoard(raw);
  }
  function formatLedSpeedMph(groundSpeedKt) {
    if (groundSpeedKt == null) return "--- mph";
    const mph = Math.round(groundSpeedKt * 1.15078);
    return `${mph} mph`;
  }
  var LED_CARDINALS = ["NORTH", "NE", "EAST", "SE", "SOUTH", "SW", "WEST", "NW"];
  function formatLedHeading(headingDeg) {
    var _a;
    if (headingDeg == null || Number.isNaN(headingDeg)) return "";
    const normalized = (headingDeg % 360 + 360) % 360;
    return (_a = LED_CARDINALS[Math.round(normalized / 45) % 8]) != null ? _a : "";
  }
  var LED_VERTICAL_THRESHOLD = 250;
  function formatLedVerticalArrow(verticalRateFpm) {
    if (verticalRateFpm == null || Number.isNaN(verticalRateFpm)) return "";
    if (verticalRateFpm > LED_VERTICAL_THRESHOLD) return "\u2191";
    if (verticalRateFpm < -LED_VERTICAL_THRESHOLD) return "\u2193";
    return "";
  }
  function ledTelemetryFields(ac) {
    const fields = [
      { value: formatLedAircraftType(ac) },
      { value: formatLedSpeedMph(ac.groundSpeedKt) }
    ];
    const motion = [
      formatLedVerticalArrow(ac.verticalRateFpm),
      formatLedHeading(ac.headingDeg)
    ].filter(Boolean).join(" ");
    if (motion) fields.push({ value: motion });
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
    for (const scale of [1, 0.85, 0.75, 0.65]) {
      const { width, height } = ledScaledTextMetrics(text, scale, scale);
      if (width <= bandW && height + 1 <= bandH) {
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
  function buildShamrockMark(size, fill) {
    const r = size * 0.185;
    const lobes = [
      { cx: size * 0.5, cy: size * 0.27, r },
      { cx: size * 0.27, cy: size * 0.5, r },
      { cx: size * 0.73, cy: size * 0.5, r }
    ];
    const stemTop = size * 0.5;
    const stemBottom = size * 0.92;
    const rows = [];
    for (let y = 0; y < size; y += 1) {
      let row = "";
      for (let x = 0; x < size; x += 1) {
        const px = x + 0.5;
        const py = y + 0.5;
        let on = false;
        for (const lobe of lobes) {
          const dx = px - lobe.cx;
          const dy = py - lobe.cy;
          if (dx * dx + dy * dy <= lobe.r * lobe.r) {
            on = true;
            break;
          }
        }
        if (!on && py >= stemTop && py <= stemBottom) {
          const t = (py - stemTop) / (stemBottom - stemTop);
          const stemCx = size * 0.5 + size * 0.1 * t * t;
          const halfW = (1 - t) * (size * 0.045) + size * 0.022;
          if (Math.abs(px - stemCx) <= halfW) on = true;
        }
        row += on ? fill : ".";
      }
      rows.push(row);
    }
    return rows.join("");
  }
  var SWA_MARK = {
    w: LED_MARK_NATIVE_SIZE,
    h: LED_MARK_NATIVE_SIZE,
    palette: {
      B: "#304CB2",
      R: "#D5152E",
      Y: "#FFBF27",
      S: "#CCCCCC"
    },
    pixels: [
      ".........................................",
      ".........................................",
      ".........................................",
      ".........................................",
      ".........................................",
      ".........................................",
      ".........................................",
      ".............SSSS.......SSSS.............",
      "...........SSSRSSSS...SSSYYSSS...........",
      "..........SSRRRRSSSS.SSYYYYYYSS..........",
      ".........SSRRRRRRSSSSSYYYYYYYYSS.........",
      ".........SSSRRRRRRSSYYYYYYYYYYYS.........",
      "........SSBSSRRRRRRSSYYYYYYYYYYSS........",
      "........SBBBSSRRRRRRSSYYYYYYYYYYS........",
      "........SBBBBSSRRRRRRSSYYYYYYYYYS........",
      "........SBBBBBSSRRRRRRSSYYYYYYYYS........",
      "........SBBBBBBSSRRRRRRSSYYYYYYYS........",
      "........SBBBBBBBSSRRRRRRSSYYYYYYS........",
      "........SBBBBBBBBSSRRRRRRSSYYYYYS........",
      "........SSBBBBBBBBSSRRRRRRSSYYYSS........",
      ".........SBBBBBBBBBSSRRRRRRSSYYS.........",
      ".........SSBBBBBBBBBSSRRRRRRSSSS.........",
      "..........SBBBBBBBBBBSSRRRRRRSS..........",
      "..........SSBBBBBBBBBBSSRRRRRSS..........",
      "...........SBBBBBBBBBBBSSRRRRS...........",
      "...........SSBBBBBBBBBBBSSRRSS...........",
      "............SSBBBBBBBBBBBSSSS............",
      ".............SSBBBBBBBBBBBSS.............",
      "..............SSBBBBBBBBBSS..............",
      "...............SSBBBBBBBSS...............",
      "................SSBBBBBSS................",
      ".................SSSBSSS.................",
      "...................SSS...................",
      ".........................................",
      ".........................................",
      ".........................................",
      ".........................................",
      ".........................................",
      ".........................................",
      ".........................................",
      "........................................."
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
      "..BBBBBB.................................",
      "...BBBBBBB...............................",
      "...BBBBBBBB..............................",
      "....BBBBBBBB.............................",
      ".....BBBBBBBB............................",
      ".....BBBBBBBBB...........................",
      "......BBBBBBBBB..........................",
      ".......BBBBBBBB..........................",
      ".......BBBBBBBBB.........................",
      "........BBBBBBBBB........................",
      "........BBBBBBBBBB.......................",
      ".........BBBBBBBBBB......................",
      "..........BBBBBBBBB......................",
      "...........BBBBBBBBB.....................",
      ".............BBBBBBBB....................",
      ".........................................",
      ".........................................",
      ".........................................",
      ".........................................",
      ".....................RRRR................",
      "....................RRRRRR...............",
      "...................RRRRRRRR..............",
      "..................RRRRRRRRRR.............",
      "..................RRRRRRRRRR.............",
      "..................RRRRRRRRRRR............",
      "..................RRRRRRRRRRRR...........",
      "..................RRRRRRRRRRRRR..........",
      "...................RRRRRRRRRRRRR.........",
      "...................RRRRRRRRRRRRRR........",
      "....................RRRRRRRRRRRRRR.......",
      ".....................RRRRRRRRRRRRR.......",
      ".....................RRRRRRRRRRRRRR......",
      "......................RRRRRRRRRRRRRR.....",
      ".......................RRRRRRRRRRRRRR....",
      "........................RRRRRRRRRRRRRR...",
      "..........................RRRRRRRRRRRRR..",
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
  var MIL_MARK = {
    w: LED_MARK_NATIVE_SIZE,
    h: LED_MARK_NATIVE_SIZE,
    palette: { G: "#3D4F2F", D: "#2C1810", Y: "#C5A572" },
    pixels: [
      ".........................................",
      ".........................................",
      ".........................................",
      ".........................................",
      ".........................................",
      ".........................................",
      ".........................................",
      "....................D....................",
      "...............DDDDDYDDDDD...............",
      "..............DDDGGGYGGGDDD..............",
      "............DDDGGGGYGYGGGGDDD............",
      "...........DDGGGGGGYGYGGGGGGDD...........",
      "..........DDGGGGGGGYGYGGGGGGGDD..........",
      "..........DGGGGGGGYGGGYGGGGGGGD..........",
      ".........DDGGGGGGGYGGGYGGGGGGGDD.........",
      "........DDGGGGGGGGYGGGYGGGGGGGGDD........",
      "........DDGGGGGGGGGGGGGGGGGGGGGDD........",
      ".......YYYYYYYYYGGGGGGGGGYYYYYYYYY.......",
      "........YYGGGGGGGGGGGGGGGGGGGGGYY........",
      "........DGYYGGGGGGGGGGGGGGGGGYYGD........",
      ".......DDGGYYGGGGGGGGGGGGGGGYYGGDD.......",
      "........DGGGGYYGGGGGGGGGGGYYGGGGD........",
      "........DGGGGGYYGGGGGGGGGYYGGGGGD........",
      "........DGGGGGGYGGGGGGGGGYGGGGGGD........",
      "........DDGGGGYGGGGGGGGGGGYGGGGDD........",
      "........DDGGGGYGGGGGGGGGGGYGGGGDD........",
      ".........DDGGGYGGGGYYYGGGGYGGGDD.........",
      "..........DGGYGGGGYYGYYGGGGYGGD..........",
      "..........DDGYGGYYGGGGGYYGGYGDD..........",
      "...........DDYGYYGGGGGGGYYGYDD...........",
      "............YYYGGGGGGGGGGGYYY............",
      "............YYDDDGGGGGGGDDDYY............",
      "...............DDDDDDDDDDD...............",
      "....................D....................",
      ".........................................",
      ".........................................",
      ".........................................",
      ".........................................",
      ".........................................",
      ".........................................",
      "........................................."
    ].join("")
  };
  var PVT_MARK = {
    w: LED_MARK_NATIVE_SIZE,
    h: LED_MARK_NATIVE_SIZE,
    palette: { S: "#1E293B", G: "#D4AF37", D: "#64748B" },
    pixels: [
      ".........................................",
      ".........................................",
      ".........................................",
      ".........................................",
      ".........................................",
      ".........................................",
      ".........................................",
      ".........................................",
      ".........................................",
      ".........................................",
      ".........................................",
      ".........SSSSSSSSS.......................",
      ".........SSSSSSSSS.......................",
      ".........SSSSSSSSS.......................",
      ".........SSSSSSSSS.......................",
      ".........SSSSS.......S...................",
      ".........SSSSSSSSSSSSSSSSSSSS............",
      ".........SSSSSSSSSSSSSSSSSSSSSSS.........",
      ".........SSSSSSSSSSSSSSSSSSSSSSSSS.......",
      ".........SSSSSSSSSSSSSSSSSSSSSSSSSSSSS...",
      ".........SSSSSSSSSSSSSSSSSSSSSSSSSSSSS...",
      ".........SSSSSSGGGGGGGGGGGGGGSSSSSSSSS...",
      ".........SSSSSSGGGGGGGGGGGGGGSSSSSSSSS...",
      ".........SSSSSSSSSSSSSSSSSSSSSSSSS.......",
      "............SSSSSSSSSSSSSSSSSSS..........",
      "..............SSSSSDDDDDSSSS.............",
      "..............SSSSSDDDDDSSSS.............",
      "...................DDDDD.................",
      ".........................................",
      ".........................................",
      ".........................................",
      ".........................................",
      ".........................................",
      ".........................................",
      ".........................................",
      ".........................................",
      ".........................................",
      ".........................................",
      ".........................................",
      ".........................................",
      "........................................."
    ].join("")
  };
  var GA_MARK = {
    w: LED_MARK_NATIVE_SIZE,
    h: LED_MARK_NATIVE_SIZE,
    palette: { W: "#FFFFFF", B: "#166534", R: "#DC2626", D: "#64748B" },
    pixels: [
      ".........................................",
      ".........................................",
      ".........................................",
      ".........................................",
      ".........................................",
      ".........................................",
      ".........................................",
      "...................RRR...................",
      "...................RRR...................",
      "...................RRR...................",
      "...................RRR...................",
      "...................RRR...................",
      ".........................................",
      "........BBBBBBBBBBBBBBBBBBBBBBBBB........",
      "........BBBBBBBBBBBBBBBBBBBBBBBBB........",
      "..................WWWWW..................",
      "..................WWWWW..................",
      "..................WWWWW..................",
      "..................WWWWW..................",
      "..................WWWWW..................",
      "...........WWWWWWWWWWWWWWWWWWW...........",
      "...........WWWWWWWWWWWWWWWWWWWWWWW.......",
      "...........WWWWWWWWWWWWWWWWWWWWWWW.......",
      "...........WWWWWWWWWWWWWWWWWWW...........",
      "..................DDDDD..................",
      "..................DDDDD..................",
      "..................DDDDD..................",
      "..................DDDDD..................",
      ".................DDDDDDD.................",
      ".................DDDDDDD.................",
      ".........................................",
      ".........................................",
      ".........................................",
      ".........................................",
      ".........................................",
      ".........................................",
      ".........................................",
      ".........................................",
      ".........................................",
      ".........................................",
      "........................................."
    ].join("")
  };
  var VIP_MARK = {
    w: LED_MARK_NATIVE_SIZE,
    h: LED_MARK_NATIVE_SIZE,
    palette: { P: "#581C87", Y: "#FBBF24" },
    pixels: [
      ".........................................",
      ".........................................",
      ".........................................",
      ".........................................",
      ".........................................",
      ".........................................",
      "....................P....................",
      "...............PPPPPYPPPPP...............",
      ".............PPPPPPYYYPPPPPP.............",
      "............PPPPPPPYYYPPPPPPP............",
      "...........PPPPPPPPYYYPPPPPPPP...........",
      "..........PPPPPPPPYYYPYPPPPPPPP..........",
      ".........PPPPPPPPPYYYPYPPPPPPPPP.........",
      "........PPPPPPPPPYPYYYPYPPPPPPPPP........",
      "........PPPPPPPPPYPYPYYYPPPPPPPPP........",
      ".......PPPPPPPPPYYPYPPYYYPPPPPPPPP.......",
      "......YYYYYYYYYYYPYPPPPYYYYYYYYYYYY......",
      ".......YYYYYPPYYPYYPPPPYYPYYYYYYYY.......",
      ".......PYYYYYYYPPPYPPPYYYYPYYYPYYP.......",
      ".......PPPYPYYPPPPPPPPPPPPPYPPYPPP.......",
      "......PPPPPYYPYYPPPPPPPPPPYYYYPPPPP......",
      ".......PPPPPYYPPYYPPPPPYYPYYYPPPPP.......",
      ".......PPPPPPPYYYPPPPPPYYYYPPPPPPP.......",
      ".......PPPPPPPYPPPPPYPPPYPYPPPPPPP.......",
      ".......PPPPPPYYYPPPYYPPPPYYYPPPPPP.......",
      ".......PPPPPPYPYPPYPYPPPPYPYPPPPPP.......",
      "........PPPPPYPYPYPPYPPYYYYYPPPPP........",
      "........PPPPPYYYYPPPYYYYPYYYYPPPP........",
      ".........PPPYYYYYPYYPYYPPPYYYPPP.........",
      "..........PPYYYPYYPPPPPYYPPYYPP..........",
      "...........PYYYYYPPPPPPPPYYYYP...........",
      "...........YYYYPPPPPPPPPPPYYYY...........",
      "...........YYPPPPPPPPPPPPPPPYY...........",
      "...............PPPPPPPPPPP...............",
      "....................P....................",
      ".........................................",
      ".........................................",
      ".........................................",
      ".........................................",
      ".........................................",
      "........................................."
    ].join("")
  };
  var EIN_MARK = {
    w: LED_MARK_NATIVE_SIZE,
    h: LED_MARK_NATIVE_SIZE,
    palette: {
      G: "#4FB748"
    },
    pixels: buildShamrockMark(LED_MARK_NATIVE_SIZE, "G")
  };
  var MARKS = {
    AAL: AAL_MARK,
    EIN: EIN_MARK,
    SWA: SWA_MARK,
    DAL: DAL_MARK,
    SKW: SKW_MARK,
    MIL: MIL_MARK,
    PVT: PVT_MARK,
    GA: GA_MARK,
    VIP: VIP_MARK
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
  function drawLedAirlineMark(ctx, icao, x, y, w, h, options) {
    var _a;
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
    const maxScale = (_a = options == null ? void 0 : options.maxScale) != null ? _a : 1;
    const scale = Math.max(1, Math.min(maxScale, Math.floor(fitScale)) || 1);
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
  var WALL_LOGO_WIDTH_FRACTION = 0.48;
  var WALL_LOGO_SIZE_SCALE = 1;
  var WALL_FLIGHT_TOP_INSET = 4;
  var LOGO_SIZE_SCALE = 0.92;
  function isWallDisplay(rows) {
    return rows > LED_GRID.landscape.rows + 4;
  }
  var ROUTE_ZONE_RATIO = 0.58;
  var DESK_ROUTE_ZONE_RATIO = 0.4;
  function computeLogoColumnWidth(cols, widthFraction = LOGO_WIDTH_FRACTION) {
    return Math.max(12, Math.floor(cols * widthFraction));
  }
  function computeLogoColumn(cols, rows) {
    const wall = isWallDisplay(rows);
    const columnW = computeLogoColumnWidth(
      cols,
      wall ? WALL_LOGO_WIDTH_FRACTION : LOGO_WIDTH_FRACTION
    );
    const maxFlightH = 2 * LED_FONT.glyphH + LED_FONT.gapY;
    const flightBandMin = maxFlightH + 2;
    const logoBandW = columnW - LOGO_LEFT_INSET - LOGO_RIGHT_INSET;
    const sizeScale = wall ? WALL_LOGO_SIZE_SCALE : Math.min(1.1, LOGO_SIZE_SCALE);
    const flightHeaderRows = maxFlightH + 4;
    const logoTopMin = wall ? flightHeaderRows + LOGO_TOP_INSET + 2 : flightBandMin + LOGO_TOP_INSET;
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
      flightBandH: wall ? flightHeaderRows : logoY,
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
    return { origin: hero.trim(), dest: "" };
  }
  function buildRightContentLayout(rows, logoY, logoH, options) {
    var _a, _b;
    const wall = (_a = options == null ? void 0 : options.wall) != null ? _a : false;
    let bandTop;
    let bandBottom;
    if (wall) {
      bandTop = (_b = options == null ? void 0 : options.rightBandTop) != null ? _b : WALL_FLIGHT_TOP_INSET;
      bandBottom = rows - 2;
    } else {
      bandTop = logoY + RIGHT_BAND_INSET;
      bandBottom = rows - 2;
    }
    const bandH = Math.max(ledCompactCellH() * 2, bandBottom - bandTop);
    const routeRatio = wall ? ROUTE_ZONE_RATIO : DESK_ROUTE_ZONE_RATIO;
    const routeZoneH = Math.max(ledCharCellH(), Math.floor(bandH * routeRatio));
    const statsZoneH = bandH - routeZoneH;
    const routeZoneTop = bandTop;
    const statsZoneTop = bandTop + routeZoneH;
    const useStackedRoute = wall || routeZoneH >= ledCharCellH() * 2 + 6;
    const statsUseFullFont = wall || statsZoneH >= ledCharCellH() + 1;
    return {
      bandTop,
      bandH,
      routeZoneTop,
      routeZoneH,
      statsZoneTop,
      statsZoneH,
      useStackedRoute,
      statsUseFullFont,
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
    const rightLayout = buildRightContentLayout(rows, logo.logoY, logo.logoH, {
      wall,
      rightBandTop: wall ? logo.flightTopInset : void 0
    });
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
    const { statsZoneTop, mainX, mainW } = layout;
    if (layout.statsZoneH > 2) {
      ctx.fillStyle = LED_COLORS.unlit;
      ctx.fillRect(mainX, statsZoneTop - 1, mainW, 1);
    }
  }
  function drawRouteBlock(ctx, layout, routeHero) {
    const { mainX, mainW, routeZoneTop, routeZoneH, useStackedRoute, wall } = layout;
    const textX = mainX + 2;
    const textW = mainW - 4;
    const { origin, dest } = parseLedRouteHero(routeHero);
    const pickRouteScale = wall ? pickWallFlightIdScale : pickFlightIdScale;
    if (useStackedRoute && dest) {
      const arrowScale = wall ? 2 : 1;
      const arrowH = wall ? ledScaledTextMetrics("\u2192", arrowScale, arrowScale).height : ledCharCellH();
      const gap = wall ? 4 : 2;
      const endSlotH = Math.max(
        ledCharCellH(),
        Math.floor((routeZoneH - arrowH - gap * 2) / 2)
      );
      const endScale = pickRouteScale(origin, textW, endSlotH);
      const endMetrics = ledScaledTextMetrics(
        origin,
        endScale.scaleX,
        endScale.scaleY
      );
      const blockH = endMetrics.height * 2 + arrowH + gap * 2;
      let y2 = wall ? routeZoneTop : routeZoneTop + Math.round((routeZoneH - blockH) / 2);
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
        centerLedTextXScaled("\u2192", textX, textW, arrowScale),
        y2,
        LED_COLORS.phosphor,
        textW,
        arrowScale,
        arrowScale,
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
    const scale = pickRouteScale(routeHero, textW, routeZoneH);
    const metrics = ledScaledTextMetrics(
      routeHero,
      scale.scaleX,
      scale.scaleY
    );
    const y = wall ? routeZoneTop : routeZoneTop + Math.round((routeZoneH - metrics.height) / 2);
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
    var _a, _b, _c, _d, _e, _f;
    const { mainX, mainW, statsZoneTop, statsZoneH, wall } = layout;
    const textX = mainX + 1;
    const textW = mainW - 2;
    const aircraft = (_b = (_a = telemetry[0]) == null ? void 0 : _a.value) != null ? _b : "";
    const speed = (_d = (_c = telemetry[1]) == null ? void 0 : _c.value) != null ? _d : "";
    const motion = (_f = (_e = telemetry[2]) == null ? void 0 : _e.value) != null ? _f : "";
    const gap = wall ? 3 : 2;
    const maxLines = Math.max(
      1,
      Math.floor((statsZoneH + gap) / (LED_FONT.glyphH + gap))
    );
    let lines = motion ? [aircraft, motion, speed] : [aircraft, speed];
    if (lines.length > maxLines) {
      lines = [aircraft, speed].slice(0, Math.max(1, maxLines));
    }
    if (lines.length >= 2) {
      const count = lines.length;
      const slotH = Math.floor((statsZoneH - gap * (count - 1)) / count);
      const pickScale = wall ? pickWallFlightIdScale : pickTelemetryScale;
      lines.forEach((text, i) => {
        const scale = pickScale(text, textW, slotH);
        const metrics = ledScaledTextMetrics(text, scale.scaleX, scale.scaleY);
        const slotTop = statsZoneTop + i * (slotH + gap);
        const y = slotTop + Math.round((slotH - metrics.height) / 2);
        drawLedTextScaled(
          ctx,
          text,
          centerLedTextXScaled(text, textX, textW, scale.scaleX),
          y,
          LED_COLORS.telemetry,
          textW,
          scale.scaleX,
          scale.scaleY,
          scale.scaleX === 1
        );
      });
      return;
    }
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
      LED_COLORS.telemetry,
      textW,
      aircraftScale.scaleX,
      aircraftScale.scaleY,
      aircraftScale.scaleX === 1
    );
    drawLedTextCompactRight(
      ctx,
      speed,
      textX + textW,
      rowY,
      LED_COLORS.telemetry,
      textW
    );
  }
  function renderLandscapeLayout(ctx, cols, rows, content, logo) {
    const layout = buildLandscapeLayout(cols, rows);
    let logoRect = null;
    logoRect = renderLogoMark(ctx, layout, logo, content);
    drawLandscapeFlightPanel(ctx, layout, content, rows);
    return { logoRect };
  }
  function drawLandscapeFlightPanel(ctx, layout, content, rows) {
    var _a, _b;
    const wall = isWallDisplay(rows);
    const operator = (_b = (_a = content.operatorTag) == null ? void 0 : _a.trim()) != null ? _b : "";
    const showOperator = operator.length > 0 && layout.flightBandH >= LED_FONT.glyphH + ledCompactCellH() + 2;
    const idBandH = showOperator ? layout.flightBandH - ledCompactCellH() - 1 : layout.flightBandH;
    const flightScale = wall ? pickWallFlightIdScale(content.flightId, layout.flightW, idBandH) : pickFlightIdScale(content.flightId, layout.flightW, idBandH);
    const flightMetrics = ledScaledTextMetrics(
      content.flightId,
      flightScale.scaleX,
      flightScale.scaleY
    );
    const flightY = wall ? layout.flightTopInset : Math.max(1, Math.floor((idBandH - flightMetrics.height) / 2));
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
    if (showOperator) {
      drawLedTextCompact(
        ctx,
        `- ${operator}`,
        layout.flightX + 1,
        flightY + flightMetrics.height + 1,
        LED_COLORS.telemetry,
        layout.flightW - 2
      );
    }
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
    const brand = getAircraftDisplayBrand(ac);
    const wallStyle = getAirlineLedWallStyle(brand);
    const routeLine = ledRouteLabel(ac);
    return {
      airlineName: brand.name,
      flightId: formatLedFlightId(ac, brand),
      operatorTag: formatLedOperatorTag(ac),
      routeHero: formatLedRouteHero(routeLine),
      telemetry: ledTelemetryFields(ac),
      logoUrl: airlineLedLogoUrl(brand),
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
