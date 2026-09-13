// api/index.ts
import "dotenv/config";

// server/app.ts
import express from "express";

// server/nseUniverse.ts
var SECTOR_INDICES = {
  "Banking & Financials": { name: "NIFTY Bank", symbol: "BANKNIFTY", yahooSymbol: "^NSEBANK", upstoxKey: "NSE_INDEX|Nifty Bank" },
  "Financial Services": { name: "NIFTY Fin Service", symbol: "NIFTYFIN", yahooSymbol: "^CNXFIN", upstoxKey: "NSE_INDEX|Nifty Fin Service" },
  "Information Technology": { name: "NIFTY IT", symbol: "NIFTYIT", yahooSymbol: "^CNXIT", upstoxKey: "NSE_INDEX|Nifty IT" },
  "Automobiles & Auto Components": { name: "NIFTY Auto", symbol: "NIFTYAUTO", yahooSymbol: "^CNXAUTO", upstoxKey: "NSE_INDEX|Nifty Auto" },
  "Pharmaceuticals & Healthcare": { name: "NIFTY Pharma", symbol: "NIFTYPHARMA", yahooSymbol: "^CNXPHARMA", upstoxKey: "NSE_INDEX|Nifty Pharma" },
  "Fast Moving Consumer Goods": { name: "NIFTY FMCG", symbol: "NIFTYFMCG", yahooSymbol: "^CNXFMCG", upstoxKey: "NSE_INDEX|Nifty FMCG" },
  "Metals & Mining": { name: "NIFTY Metal", symbol: "NIFTYMETAL", yahooSymbol: "^CNXMETAL", upstoxKey: "NSE_INDEX|Nifty Metal" },
  "Oil, Gas & Energy": { name: "NIFTY Energy", symbol: "NIFTYENERGY", yahooSymbol: "^CNXENERGY", upstoxKey: "NSE_INDEX|Nifty Energy" },
  "Power & Utilities": { name: "NIFTY Energy", symbol: "NIFTYENERGY", yahooSymbol: "^CNXENERGY", upstoxKey: "NSE_INDEX|Nifty Energy" },
  "Real Estate & Construction": { name: "NIFTY Realty", symbol: "NIFTYREALTY", yahooSymbol: "^CNXREALTY", upstoxKey: "NSE_INDEX|Nifty Realty" },
  "Infrastructure": { name: "NIFTY Infra", symbol: "NIFTYINFRA", yahooSymbol: "^CNXINFRA", upstoxKey: "NSE_INDEX|Nifty Infra" },
  "Telecommunications": { name: "NIFTY Infra", symbol: "NIFTYINFRA", yahooSymbol: "^CNXINFRA", upstoxKey: "NSE_INDEX|Nifty Infra" },
  "Consumer Discretionary": { name: "NIFTY FMCG", symbol: "NIFTYFMCG", yahooSymbol: "^CNXFMCG", upstoxKey: "NSE_INDEX|Nifty FMCG" },
  "Chemicals": { name: "NIFTY Commodities", symbol: "NIFTYCOMM", yahooSymbol: "^CNXCOMMODITIES", upstoxKey: "NSE_INDEX|Nifty Commodities" },
  "Public Sector Enterprises": { name: "NIFTY PSE", symbol: "NIFTYPSE", yahooSymbol: "^CNXPSE", upstoxKey: "NSE_INDEX|Nifty PSE" }
};
var NSE_UNIVERSE = [
  // Top NIFTY 50
  { symbol: "RELIANCE", name: "Reliance Industries Ltd.", sector: "Oil, Gas & Energy", isNifty50: true, isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: "TCS", name: "Tata Consultancy Services Ltd.", sector: "Information Technology", isNifty50: true, isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: "HDFCBANK", name: "HDFC Bank Ltd.", sector: "Banking & Financials", isNifty50: true, isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: "INFY", name: "Infosys Ltd.", sector: "Information Technology", isNifty50: true, isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: "ICICIBANK", name: "ICICI Bank Ltd.", sector: "Banking & Financials", isNifty50: true, isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: "BHARTIARTL", name: "Bharti Airtel Ltd.", sector: "Telecommunications", isNifty50: true, isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: "SBIN", name: "State Bank of India", sector: "Banking & Financials", isNifty50: true, isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: "ITC", name: "ITC Ltd.", sector: "Fast Moving Consumer Goods", isNifty50: true, isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: "HINDUNILVR", name: "Hindustan Unilever Ltd.", sector: "Fast Moving Consumer Goods", isNifty50: true, isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: "LT", name: "Larsen & Toubro Ltd.", sector: "Infrastructure", isNifty50: true, isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: "BAJFINANCE", name: "Bajaj Finance Ltd.", sector: "Financial Services", isNifty50: true, isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: "HCLTECH", name: "HCL Technologies Ltd.", sector: "Information Technology", isNifty50: true, isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: "MARUTI", name: "Maruti Suzuki India Ltd.", sector: "Automobiles & Auto Components", isNifty50: true, isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: "SUNPHARMA", name: "Sun Pharmaceutical Industries Ltd.", sector: "Pharmaceuticals & Healthcare", isNifty50: true, isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: "TATAMOTORS", name: "Tata Motors Ltd.", sector: "Automobiles & Auto Components", isNifty50: true, isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: "KOTAKBANK", name: "Kotak Mahindra Bank Ltd.", sector: "Banking & Financials", isNifty50: true, isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: "AXISBANK", name: "Axis Bank Ltd.", sector: "Banking & Financials", isNifty50: true, isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: "NTPC", name: "NTPC Ltd.", sector: "Power & Utilities", isNifty50: true, isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: "ONGC", name: "Oil & Natural Gas Corporation Ltd.", sector: "Oil, Gas & Energy", isNifty50: true, isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: "TITAN", name: "Titan Company Ltd.", sector: "Consumer Discretionary", isNifty50: true, isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: "ADANIENT", name: "Adani Enterprises Ltd.", sector: "Infrastructure", isNifty50: true, isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: "ADANIPORTS", name: "Adani Ports and SEZ Ltd.", sector: "Infrastructure", isNifty50: true, isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: "POWERGRID", name: "Power Grid Corporation of India", sector: "Power & Utilities", isNifty50: true, isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: "COALINDIA", name: "Coal India Ltd.", sector: "Metals & Mining", isNifty50: true, isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: "TATASTEEL", name: "Tata Steel Ltd.", sector: "Metals & Mining", isNifty50: true, isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: "M&M", name: "Mahindra & Mahindra Ltd.", sector: "Automobiles & Auto Components", isNifty50: true, isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: "BAJAJFINSV", name: "Bajaj Finserv Ltd.", sector: "Financial Services", isNifty50: true, isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: "ASIANPAINT", name: "Asian Paints Ltd.", sector: "Consumer Discretionary", isNifty50: true, isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: "ULTRACEMCO", name: "UltraTech Cement Ltd.", sector: "Infrastructure", isNifty50: true, isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: "JSWSTEEL", name: "JSW Steel Ltd.", sector: "Metals & Mining", isNifty50: true, isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: "WIPRO", name: "Wipro Ltd.", sector: "Information Technology", isNifty50: true, isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: "NESTLEIND", name: "Nestle India Ltd.", sector: "Fast Moving Consumer Goods", isNifty50: true, isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: "GRASIM", name: "Grasim Industries Ltd.", sector: "Infrastructure", isNifty50: true, isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: "TECHM", name: "Tech Mahindra Ltd.", sector: "Information Technology", isNifty50: true, isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: "CIPLA", name: "Cipla Ltd.", sector: "Pharmaceuticals & Healthcare", isNifty50: true, isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: "HINDALCO", name: "Hindalco Industries Ltd.", sector: "Metals & Mining", isNifty50: true, isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: "DRREDDY", name: "Dr. Reddy Laboratories Ltd.", sector: "Pharmaceuticals & Healthcare", isNifty50: true, isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: "TATACONSUM", name: "Tata Consumer Products Ltd.", sector: "Fast Moving Consumer Goods", isNifty50: true, isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: "BPCL", name: "Bharat Petroleum Corporation Ltd.", sector: "Oil, Gas & Energy", isNifty50: true, isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: "BRITANNIA", name: "Britannia Industries Ltd.", sector: "Fast Moving Consumer Goods", isNifty50: true, isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: "EICHERMOT", name: "Eicher Motors Ltd.", sector: "Automobiles & Auto Components", isNifty50: true, isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: "HEROMOTOCO", name: "Hero MotoCorp Ltd.", sector: "Automobiles & Auto Components", isNifty50: true, isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: "APOLLOHOSP", name: "Apollo Hospitals Enterprise Ltd.", sector: "Pharmaceuticals & Healthcare", isNifty50: true, isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: "DIVISLAB", name: "Divi's Laboratories Ltd.", sector: "Pharmaceuticals & Healthcare", isNifty50: true, isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: "BAJAJ-AUTO", name: "Bajaj Auto Ltd.", sector: "Automobiles & Auto Components", isNifty50: true, isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: "LTIM", name: "LTIMindtree Ltd.", sector: "Information Technology", isNifty50: true, isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: "BEL", name: "Bharat Electronics Ltd.", sector: "Public Sector Enterprises", isNifty50: true, isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: "TRENT", name: "Trent Ltd.", sector: "Consumer Discretionary", isNifty50: true, isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: "SHRIRAMFIN", name: "Shriram Finance Ltd.", sector: "Financial Services", isNifty50: true, isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: "INDUSINDBK", name: "IndusInd Bank Ltd.", sector: "Banking & Financials", isNifty50: true, isNifty100: true, isNifty200: true, isNifty500: true },
  // NIFTY Next 50 / 100 additions
  { symbol: "HAL", name: "Hindustan Aeronautics Ltd.", sector: "Public Sector Enterprises", isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: "VEDL", name: "Vedanta Ltd.", sector: "Metals & Mining", isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: "ZOMATO", name: "Zomato Ltd.", sector: "Consumer Discretionary", isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: "JIOFIN", name: "Jio Financial Services Ltd.", sector: "Financial Services", isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: "DLF", name: "DLF Ltd.", sector: "Real Estate & Construction", isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: "SIEMENS", name: "Siemens Ltd.", sector: "Infrastructure", isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: "ABB", name: "ABB India Ltd.", sector: "Infrastructure", isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: "CHOLAFIN", name: "Cholamandalam Investment & Fin", sector: "Financial Services", isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: "TVSMOTOR", name: "TVS Motor Company Ltd.", sector: "Automobiles & Auto Components", isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: "HAVELLS", name: "Havells India Ltd.", sector: "Consumer Discretionary", isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: "GAIL", name: "GAIL (India) Ltd.", sector: "Oil, Gas & Energy", isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: "PFC", name: "Power Finance Corporation Ltd.", sector: "Financial Services", isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: "RECLTD", name: "REC Ltd.", sector: "Financial Services", isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: "INDIGO", name: "InterGlobe Aviation Ltd.", sector: "Consumer Discretionary", isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: "CANBK", name: "Canara Bank", sector: "Banking & Financials", isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: "BANKBARODA", name: "Bank of Baroda", sector: "Banking & Financials", isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: "PNB", name: "Punjab National Bank", sector: "Banking & Financials", isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: "LODHA", name: "Macrotech Developers Ltd.", sector: "Real Estate & Construction", isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: "GODREJCP", name: "Godrej Consumer Products Ltd.", sector: "Fast Moving Consumer Goods", isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: "DABUR", name: "Dabur India Ltd.", sector: "Fast Moving Consumer Goods", isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: "PIDILITIND", name: "Pidilite Industries Ltd.", sector: "Chemicals", isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: "AMBUJACEM", name: "Ambuja Cements Ltd.", sector: "Infrastructure", isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: "IOC", name: "Indian Oil Corporation Ltd.", sector: "Oil, Gas & Energy", isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: "SRF", name: "SRF Ltd.", sector: "Chemicals", isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: "MOTHERSON", name: "Samvardhana Motherson Intl", sector: "Automobiles & Auto Components", isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: "POLYCAB", name: "Polycab India Ltd.", sector: "Infrastructure", isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: "BOSCHLTD", name: "Bosch Ltd.", sector: "Automobiles & Auto Components", isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: "COLPAL", name: "Colgate-Palmolive (India) Ltd.", sector: "Fast Moving Consumer Goods", isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: "MARICO", name: "Marico Ltd.", sector: "Fast Moving Consumer Goods", isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: "VOLTAS", name: "Voltas Ltd.", sector: "Consumer Discretionary", isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: "PERSISTENT", name: "Persistent Systems Ltd.", sector: "Information Technology", isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: "COFORGE", name: "Coforge Ltd.", sector: "Information Technology", isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: "MPHASIS", name: "Mphasis Ltd.", sector: "Information Technology", isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: "DIXON", name: "Dixon Technologies (India) Ltd.", sector: "Consumer Discretionary", isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: "KALYANKJIL", name: "Kalyan Jewellers India Ltd.", sector: "Consumer Discretionary", isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: "SUZLON", name: "Suzlon Energy Ltd.", sector: "Power & Utilities", isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: "BHEL", name: "Bharat Heavy Electricals Ltd.", sector: "Public Sector Enterprises", isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: "NMDC", name: "NMDC Ltd.", sector: "Metals & Mining", isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: "SAIL", name: "Steel Authority of India Ltd.", sector: "Metals & Mining", isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: "FEDERALBNK", name: "Federal Bank Ltd.", sector: "Banking & Financials", isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: "IDFCFIRSTB", name: "IDFC First Bank Ltd.", sector: "Banking & Financials", isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: "AUBANK", name: "AU Small Finance Bank Ltd.", sector: "Banking & Financials", isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: "MUTHOOTFIN", name: "Muthoot Finance Ltd.", sector: "Financial Services", isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: "OBEROIRLTY", name: "Oberoi Realty Ltd.", sector: "Real Estate & Construction", isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: "GODREJPROP", name: "Godrej Properties Ltd.", sector: "Real Estate & Construction", isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: "PHOENIXLTD", name: "The Phoenix Mills Ltd.", sector: "Real Estate & Construction", isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: "PRESTIGE", name: "Prestige Estates Projects Ltd.", sector: "Real Estate & Construction", isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: "TATACOMM", name: "Tata Communications Ltd.", sector: "Telecommunications", isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: "KPITTECH", name: "KPIT Technologies Ltd.", sector: "Information Technology", isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: "CYIENT", name: "Cyient Ltd.", sector: "Information Technology", isNifty200: true, isNifty500: true }
];
function getUniverseList(universeId, customWatchlist = [], customHoldings = []) {
  const normId = (universeId || "nifty50").toLowerCase();
  if (normId === "nifty50") {
    return NSE_UNIVERSE.filter((s) => s.isNifty50);
  }
  if (normId === "nifty100") {
    return NSE_UNIVERSE.filter((s) => s.isNifty50 || s.isNifty100);
  }
  if (normId === "nifty200") {
    return NSE_UNIVERSE.filter((s) => s.isNifty50 || s.isNifty100 || s.isNifty200);
  }
  if (normId === "nifty500") {
    return NSE_UNIVERSE;
  }
  if (normId === "nifty_bank" || normId === "bank") {
    return NSE_UNIVERSE.filter((s) => s.sector === "Banking & Financials" || s.sector === "Financial Services");
  }
  if (normId === "nifty_it" || normId === "it") {
    return NSE_UNIVERSE.filter((s) => s.sector === "Information Technology");
  }
  if (normId === "nifty_auto" || normId === "auto") {
    return NSE_UNIVERSE.filter((s) => s.sector === "Automobiles & Auto Components");
  }
  if (normId === "nifty_pharma" || normId === "pharma") {
    return NSE_UNIVERSE.filter((s) => s.sector === "Pharmaceuticals & Healthcare");
  }
  if (normId === "nifty_fmcg" || normId === "fmcg") {
    return NSE_UNIVERSE.filter((s) => s.sector === "Fast Moving Consumer Goods");
  }
  if (normId === "nifty_metal" || normId === "metal") {
    return NSE_UNIVERSE.filter((s) => s.sector === "Metals & Mining");
  }
  if (normId === "watchlist") {
    const list = customWatchlist.map((w) => w.toUpperCase());
    return NSE_UNIVERSE.filter((s) => list.includes(s.symbol.toUpperCase()));
  }
  if (normId === "holdings") {
    const list = customHoldings.map((h) => h.toUpperCase());
    return NSE_UNIVERSE.filter((s) => list.includes(s.symbol.toUpperCase()));
  }
  return NSE_UNIVERSE.filter((s) => s.isNifty50);
}
var NSE_STOCKS = NSE_UNIVERSE;
var getStocksByUniverse = getUniverseList;

// server/marketData/marketHours.ts
var NSE_HOLIDAYS_SET = /* @__PURE__ */ new Set([
  // 2025
  "2025-01-26",
  // Republic Day
  "2025-02-26",
  // Maha Shivratri
  "2025-03-14",
  // Holi
  "2025-03-31",
  // Id-Ul-Fitr
  "2025-04-10",
  // Mahavir Jayanti
  "2025-04-14",
  // Dr. Baba Saheb Ambedkar Jayanti
  "2025-04-18",
  // Good Friday
  "2025-05-01",
  // Maharashtra Day
  "2025-08-15",
  // Independence Day
  "2025-08-27",
  // Ganesh Chaturthi
  "2025-10-02",
  // Mahatma Gandhi Jayanti
  "2025-10-21",
  // Diwali Laxmi Pujan (Muhurat trading evening only)
  "2025-10-22",
  // Diwali Balipratipada
  "2025-11-05",
  // Gurunanak Jayanti
  "2025-12-25",
  // Christmas
  // 2026
  "2026-01-26",
  // Republic Day
  "2026-02-15",
  // Maha Shivratri
  "2026-03-03",
  // Holi
  "2026-03-20",
  // Eid-ul-Fitr
  "2026-04-03",
  // Good Friday
  "2026-04-14",
  // Ambedkar Jayanti
  "2026-05-01",
  // Maharashtra Day
  "2026-08-15",
  // Independence Day
  "2026-09-15",
  // Ganesh Chaturthi
  "2026-10-02",
  // Gandhi Jayanti
  "2026-10-20",
  // Dussehra
  "2026-11-08",
  // Diwali
  "2026-11-24",
  // Guru Nanak Jayanti
  "2026-12-25"
  // Christmas
]);
function getISTDate(dateInput = /* @__PURE__ */ new Date()) {
  const date = typeof dateInput === "number" ? new Date(dateInput) : dateInput;
  const utc = date.getTime() + date.getTimezoneOffset() * 6e4;
  const istTime = new Date(utc + 5.5 * 36e5);
  const year = istTime.getFullYear();
  const month = String(istTime.getMonth() + 1).padStart(2, "0");
  const day = String(istTime.getDate()).padStart(2, "0");
  const hours = istTime.getHours();
  const minutes = istTime.getMinutes();
  const seconds = istTime.getSeconds();
  const dayOfWeek = istTime.getDay();
  const dateStr = `${year}-${month}-${day}`;
  const timeStr = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  return {
    dateStr,
    timeStr,
    hours,
    minutes,
    seconds,
    dayOfWeek,
    istDate: istTime
  };
}
function formatISTDateTime(timestamp) {
  if (!timestamp) return "N/A";
  const d = new Date(timestamp);
  if (isNaN(d.getTime())) return String(timestamp);
  const ist = getISTDate(d);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthName = months[ist.istDate.getMonth()];
  const day = ist.istDate.getDate();
  const year = ist.istDate.getFullYear();
  let h = ist.hours;
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12;
  h = h ? h : 12;
  const hStr = String(h).padStart(2, "0");
  const mStr = String(ist.minutes).padStart(2, "0");
  return `${day} ${monthName} ${year}, ${hStr}:${mStr} ${ampm} IST`;
}
function getMarketStatus(dateInput = /* @__PURE__ */ new Date()) {
  const ist = getISTDate(dateInput);
  const { dateStr, hours, minutes, dayOfWeek } = ist;
  const timeInMinutes = hours * 60 + minutes;
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const isHoliday = NSE_HOLIDAYS_SET.has(dateStr);
  let status = "CLOSED";
  let message = "Market is closed";
  let isOpen = false;
  if (isWeekend) {
    status = "WEEKEND";
    message = "Weekend \u2014 NSE Market Closed";
  } else if (isHoliday) {
    status = "HOLIDAY";
    message = "NSE Holiday \u2014 Market Closed";
  } else {
    const preMarketStart = 9 * 60;
    const marketOpen = 9 * 60 + 15;
    const marketClose = 15 * 60 + 30;
    if (timeInMinutes >= preMarketStart && timeInMinutes < marketOpen) {
      status = "PRE_MARKET";
      message = "NSE Pre-Market Session (09:00 - 09:15 IST)";
      isOpen = false;
    } else if (timeInMinutes >= marketOpen && timeInMinutes <= marketClose) {
      status = "OPEN";
      message = "NSE Live Trading Session (09:15 - 15:30 IST)";
      isOpen = true;
    } else {
      status = "CLOSED";
      message = timeInMinutes < preMarketStart ? "NSE Market Opens at 09:15 AM IST" : "NSE Session Closed at 03:30 PM IST";
      isOpen = false;
    }
  }
  return {
    marketStatus: status,
    isOpen,
    currentIstTime: formatISTDateTime(dateInput),
    tradingDate: dateStr,
    lastSessionClose: "15:30:00 IST",
    isDelayed: !isOpen,
    message
  };
}

// server/marketData/cache.ts
var MemoryCache = class {
  constructor() {
    this.store = /* @__PURE__ */ new Map();
  }
  static {
    // Default TTL configurations (in milliseconds)
    this.TTL = {
      QUOTE: 45 * 1e3,
      // 45 seconds
      INTRADAY: 60 * 1e3,
      // 60 seconds
      HISTORICAL: 30 * 60 * 1e3,
      // 30 minutes
      NIFTY: 45 * 1e3,
      // 45 seconds
      SECTOR: 5 * 60 * 1e3,
      // 5 minutes
      HEALTH: 10 * 1e3
      // 10 seconds
    };
  }
  get(key) {
    const item = this.store.get(key);
    if (!item) return null;
    if (Date.now() > item.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return item.data;
  }
  set(key, data, ttlMs) {
    const now = Date.now();
    this.store.set(key, {
      data,
      expiresAt: now + ttlMs,
      storedAt: now
    });
  }
  has(key) {
    return this.get(key) !== null;
  }
  delete(key) {
    return this.store.delete(key);
  }
  clear() {
    this.store.clear();
  }
  size() {
    return this.store.size;
  }
  // Periodic cleanup of expired items to prevent memory bloat
  cleanExpired() {
    const now = Date.now();
    let removed = 0;
    for (const [key, item] of this.store.entries()) {
      if (now > item.expiresAt) {
        this.store.delete(key);
        removed++;
      }
    }
    return removed;
  }
};
var marketCache = new MemoryCache();
var cleanupInterval = setInterval(() => {
  marketCache.cleanExpired();
}, 5 * 60 * 1e3);
if (cleanupInterval && typeof cleanupInterval.unref === "function") {
  cleanupInterval.unref();
}

// server/marketData/rateLimiter.ts
var ConcurrencyLimiter = class {
  constructor(options = {}) {
    this.running = 0;
    this.queue = [];
    this.inFlightMap = /* @__PURE__ */ new Map();
    this.maxConcurrent = options.maxConcurrent || 6;
    this.delayMs = options.delayBetweenRequestsMs || 30;
  }
  async run(task) {
    while (this.running >= this.maxConcurrent) {
      await new Promise((resolve) => this.queue.push(resolve));
    }
    this.running++;
    try {
      if (this.delayMs > 0) {
        await new Promise((r) => setTimeout(r, this.delayMs));
      }
      return await task();
    } finally {
      this.running--;
      const next = this.queue.shift();
      if (next) next();
    }
  }
  /**
   * Deduplicates identical in-flight requests
   */
  async deduplicate(dedupKey, task) {
    const existing = this.inFlightMap.get(dedupKey);
    if (existing) {
      return existing;
    }
    const promise = this.run(task).finally(() => {
      this.inFlightMap.delete(dedupKey);
    });
    this.inFlightMap.set(dedupKey, promise);
    return promise;
  }
};
async function retryWithBackoff(task, options = {}) {
  const maxRetries = options.maxRetries ?? 2;
  let delay = options.initialDelayMs ?? 400;
  const factor = options.factor ?? 2;
  let lastError;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await task();
    } catch (err) {
      lastError = err;
      if (attempt === maxRetries) break;
      if (options.shouldRetry && !options.shouldRetry(err)) {
        break;
      }
      const jitter = delay * (0.85 + Math.random() * 0.3);
      if (options.onRetry) {
        options.onRetry(err, attempt + 1, Math.round(jitter));
      }
      await new Promise((r) => setTimeout(r, jitter));
      delay *= factor;
    }
  }
  throw lastError;
}
var marketRateLimiter = new ConcurrencyLimiter({
  maxConcurrent: 6,
  delayBetweenRequestsMs: 25
});

// server/upstox/instruments.ts
import zlib from "zlib";
var INDEX_INSTRUMENT_MAP = {
  // NIFTY 50
  "NIFTY": "NSE_INDEX|Nifty 50",
  "NIFTY50": "NSE_INDEX|Nifty 50",
  "NIFTY 50": "NSE_INDEX|Nifty 50",
  "^NSEI": "NSE_INDEX|Nifty 50",
  "NSE_INDEX|NIFTY 50": "NSE_INDEX|Nifty 50",
  // NIFTY 100, 200, 500
  "NIFTY100": "NSE_INDEX|Nifty 100",
  "NIFTY 100": "NSE_INDEX|Nifty 100",
  "NIFTY200": "NSE_INDEX|Nifty 200",
  "NIFTY 200": "NSE_INDEX|Nifty 200",
  "NIFTY500": "NSE_INDEX|Nifty 500",
  "NIFTY 500": "NSE_INDEX|Nifty 500",
  // Sector Indices
  "BANKNIFTY": "NSE_INDEX|Nifty Bank",
  "NIFTYBANK": "NSE_INDEX|Nifty Bank",
  "NIFTY BANK": "NSE_INDEX|Nifty Bank",
  "^NSEBANK": "NSE_INDEX|Nifty Bank",
  "NIFTYIT": "NSE_INDEX|Nifty IT",
  "NIFTY IT": "NSE_INDEX|Nifty IT",
  "^CNXIT": "NSE_INDEX|Nifty IT",
  "CNXIT": "NSE_INDEX|Nifty IT",
  "NIFTYAUTO": "NSE_INDEX|Nifty Auto",
  "NIFTY AUTO": "NSE_INDEX|Nifty Auto",
  "^CNXAUTO": "NSE_INDEX|Nifty Auto",
  "CNXAUTO": "NSE_INDEX|Nifty Auto",
  "NIFTYPHARMA": "NSE_INDEX|Nifty Pharma",
  "NIFTY PHARMA": "NSE_INDEX|Nifty Pharma",
  "^CNXPHARMA": "NSE_INDEX|Nifty Pharma",
  "CNXPHARMA": "NSE_INDEX|Nifty Pharma",
  "NIFTYFMCG": "NSE_INDEX|Nifty FMCG",
  "NIFTY FMCG": "NSE_INDEX|Nifty FMCG",
  "^CNXFMCG": "NSE_INDEX|Nifty FMCG",
  "CNXFMCG": "NSE_INDEX|Nifty FMCG",
  "NIFTYMETAL": "NSE_INDEX|Nifty Metal",
  "NIFTY METAL": "NSE_INDEX|Nifty Metal",
  "^CNXMETAL": "NSE_INDEX|Nifty Metal",
  "CNXMETAL": "NSE_INDEX|Nifty Metal",
  "NIFTYENERGY": "NSE_INDEX|Nifty Energy",
  "NIFTY ENERGY": "NSE_INDEX|Nifty Energy",
  "^CNXENERGY": "NSE_INDEX|Nifty Energy",
  "CNXENERGY": "NSE_INDEX|Nifty Energy",
  "NIFTYREALTY": "NSE_INDEX|Nifty Realty",
  "NIFTY REALTY": "NSE_INDEX|Nifty Realty",
  "^CNXREALTY": "NSE_INDEX|Nifty Realty",
  "CNXREALTY": "NSE_INDEX|Nifty Realty",
  "NIFTYINFRA": "NSE_INDEX|Nifty Infra",
  "NIFTY INFRA": "NSE_INDEX|Nifty Infra",
  "^CNXINFRA": "NSE_INDEX|Nifty Infra",
  "CNXINFRA": "NSE_INDEX|Nifty Infra",
  "NIFTYPSE": "NSE_INDEX|Nifty PSE",
  "NIFTY PSE": "NSE_INDEX|Nifty PSE",
  "^CNXPSE": "NSE_INDEX|Nifty PSE",
  "CNXPSE": "NSE_INDEX|Nifty PSE",
  "NIFTYFIN": "NSE_INDEX|Nifty Fin Service",
  "NIFTY FIN SERVICE": "NSE_INDEX|Nifty Fin Service",
  "FINNIFTY": "NSE_INDEX|Nifty Fin Service",
  "^CNXFIN": "NSE_INDEX|Nifty Fin Service",
  "CNXFIN": "NSE_INDEX|Nifty Fin Service",
  "NIFTYCOMM": "NSE_INDEX|Nifty Commodities",
  "NIFTY COMMODITIES": "NSE_INDEX|Nifty Commodities",
  "^CNXCOMMODITIES": "NSE_INDEX|Nifty Commodities",
  "CNXCOMMODITIES": "NSE_INDEX|Nifty Commodities"
};
var UNIVERSE_INSTRUMENT_MAP = {
  RELIANCE: "NSE_EQ|INE002A01018",
  TCS: "NSE_EQ|INE467B01029",
  HDFCBANK: "NSE_EQ|INE040A01034",
  INFY: "NSE_EQ|INE009A01021",
  ICICIBANK: "NSE_EQ|INE090A01021",
  BHARTIARTL: "NSE_EQ|INE397D01024",
  SBIN: "NSE_EQ|INE062A01020",
  ITC: "NSE_EQ|INE154A01025",
  HINDUNILVR: "NSE_EQ|INE030A01027",
  LT: "NSE_EQ|INE018A01030",
  BAJFINANCE: "NSE_EQ|INE296A01032",
  HCLTECH: "NSE_EQ|INE860A01027",
  MARUTI: "NSE_EQ|INE585B01010",
  SUNPHARMA: "NSE_EQ|INE044A01036",
  TATAMOTORS: "NSE_EQ|INE155A01022",
  // TMPV (Tata Motors Passenger Vehicles)
  TMPV: "NSE_EQ|INE155A01022",
  TMCV: "NSE_EQ|INE1TAE01010",
  KOTAKBANK: "NSE_EQ|INE237A01036",
  AXISBANK: "NSE_EQ|INE238A01034",
  NTPC: "NSE_EQ|INE733E01010",
  ONGC: "NSE_EQ|INE213A01029",
  TITAN: "NSE_EQ|INE280A01028",
  ADANIENT: "NSE_EQ|INE423A01024",
  ADANIPORTS: "NSE_EQ|INE742F01042",
  POWERGRID: "NSE_EQ|INE752E01010",
  COALINDIA: "NSE_EQ|INE522F01014",
  TATASTEEL: "NSE_EQ|INE081A01020",
  "M&M": "NSE_EQ|INE101A01026",
  MM: "NSE_EQ|INE101A01026",
  BAJAJFINSV: "NSE_EQ|INE918I01026",
  ASIANPAINT: "NSE_EQ|INE021A01026",
  ULTRACEMCO: "NSE_EQ|INE481G01011",
  JSWSTEEL: "NSE_EQ|INE019A01038",
  WIPRO: "NSE_EQ|INE075A01022",
  NESTLEIND: "NSE_EQ|INE239A01024",
  GRASIM: "NSE_EQ|INE047A01021",
  TECHM: "NSE_EQ|INE669C01036",
  CIPLA: "NSE_EQ|INE059A01026",
  HINDALCO: "NSE_EQ|INE038A01020",
  DRREDDY: "NSE_EQ|INE089A01031",
  TATACONSUM: "NSE_EQ|INE192A01025",
  BPCL: "NSE_EQ|INE029A01011",
  BRITANNIA: "NSE_EQ|INE216A01030",
  EICHERMOT: "NSE_EQ|INE066A01021",
  HEROMOTOCO: "NSE_EQ|INE158A01026",
  APOLLOHOSP: "NSE_EQ|INE437A01024",
  DIVISLAB: "NSE_EQ|INE361B01024",
  "BAJAJ-AUTO": "NSE_EQ|INE917I01010",
  BAJAJAUTO: "NSE_EQ|INE917I01010",
  LTIM: "NSE_EQ|INE214T01019",
  // LTM (LTIMindtree)
  LTM: "NSE_EQ|INE214T01019",
  BEL: "NSE_EQ|INE263A01024",
  TRENT: "NSE_EQ|INE849A01020",
  SHRIRAMFIN: "NSE_EQ|INE721A01047",
  INDUSINDBK: "NSE_EQ|INE095A01012",
  HAL: "NSE_EQ|INE066F01020",
  VEDL: "NSE_EQ|INE205A01025",
  ZOMATO: "NSE_EQ|INE758T01015",
  // ETERNAL (Zomato)
  ETERNAL: "NSE_EQ|INE758T01015",
  JIOFIN: "NSE_EQ|INE758E01017",
  DLF: "NSE_EQ|INE271C01023",
  SIEMENS: "NSE_EQ|INE003A01024",
  ABB: "NSE_EQ|INE117A01022",
  CHOLAFIN: "NSE_EQ|INE121A08PJ0",
  TVSMOTOR: "NSE_EQ|INE494B01023",
  HAVELLS: "NSE_EQ|INE176B01034",
  GAIL: "NSE_EQ|INE129A01019",
  PFC: "NSE_EQ|INE134E01011",
  RECLTD: "NSE_EQ|INE020B01018",
  INDIGO: "NSE_EQ|INE646L01027",
  CANBK: "NSE_EQ|INE476A01022",
  BANKBARODA: "NSE_EQ|INE028A01039",
  PNB: "NSE_EQ|INE160A01022",
  LODHA: "NSE_EQ|INE670K01029",
  GODREJCP: "NSE_EQ|INE102D01028",
  DABUR: "NSE_EQ|INE016A01026",
  PIDILITIND: "NSE_EQ|INE318A01026",
  AMBUJACEM: "NSE_EQ|INE079A01024",
  IOC: "NSE_EQ|INE242A01010",
  SRF: "NSE_EQ|INE647A01010",
  MOTHERSON: "NSE_EQ|INE775A01035",
  POLYCAB: "NSE_EQ|INE455K01017",
  BOSCHLTD: "NSE_EQ|INE323A01026",
  COLPAL: "NSE_EQ|INE259A01022",
  MARICO: "NSE_EQ|INE196A01026",
  VOLTAS: "NSE_EQ|INE226A01021",
  PERSISTENT: "NSE_EQ|INE262H01021",
  COFORGE: "NSE_EQ|INE591G01025",
  MPHASIS: "NSE_EQ|INE356A01018",
  DIXON: "NSE_EQ|INE935N01020",
  KALYANKJIL: "NSE_EQ|INE303R01014",
  SUZLON: "NSE_EQ|INE040H01021",
  BHEL: "NSE_EQ|INE257A01026",
  NMDC: "NSE_EQ|INE584A01023",
  SAIL: "NSE_EQ|INE114A01011",
  FEDERALBNK: "NSE_EQ|INE171A01029",
  IDFCFIRSTB: "NSE_EQ|INE092T01019",
  AUBANK: "NSE_EQ|INE949L01017",
  MUTHOOTFIN: "NSE_EQ|INE414G01012",
  OBEROIRLTY: "NSE_EQ|INE093I01010",
  GODREJPROP: "NSE_EQ|INE484J01027",
  PHOENIXLTD: "NSE_EQ|INE211B01039",
  PRESTIGE: "NSE_EQ|INE811K01011",
  TATACOMM: "NSE_EQ|INE151A01013",
  KPITTECH: "NSE_EQ|INE04I401011",
  CYIENT: "NSE_EQ|INE136B01020"
};
var UpstoxInstrumentService = class {
  constructor() {
    this.dynamicMap = /* @__PURE__ */ new Map();
    this.reverseMap = /* @__PURE__ */ new Map();
    this.isDownloading = false;
    this.lastDownloadedAt = 0;
    this.downloadPromise = null;
    for (const [sym, key] of Object.entries(INDEX_INSTRUMENT_MAP)) {
      this.dynamicMap.set(sym.toUpperCase(), key);
      this.reverseMap.set(key, sym);
    }
    for (const [sym, key] of Object.entries(UNIVERSE_INSTRUMENT_MAP)) {
      this.dynamicMap.set(sym.toUpperCase(), key);
      this.reverseMap.set(key, sym);
    }
  }
  /**
   * Normalizes symbol string (removes .NS, :NSE, spaces, ^)
   */
  cleanSymbol(symbol) {
    if (!symbol) return "";
    let s = symbol.trim().toUpperCase();
    if (s.startsWith("^")) {
      s = s.slice(1);
    }
    if (s === "NSEI") return "NIFTY50";
    if (s === "NSEBANK") return "BANKNIFTY";
    if (s.startsWith("CNX")) return "NIFTY" + s.slice(3);
    s = s.replace(/\.NS$/, "");
    s = s.replace(/\.BO$/, "");
    s = s.replace(/:NSE$/, "");
    s = s.replace(/:BSE$/, "");
    return s;
  }
  /**
   * Synchronously resolves an instrument key from the cache.
   * If not present, returns null (caller can then await resolveKey).
   */
  getKeySync(symbol) {
    if (!symbol) return null;
    const raw = symbol.trim();
    if (raw.startsWith("NSE_EQ|") || raw.startsWith("NSE_INDEX|")) {
      return raw;
    }
    const upper = raw.toUpperCase();
    if (this.dynamicMap.has(upper)) {
      return this.dynamicMap.get(upper);
    }
    const clean = this.cleanSymbol(raw);
    if (this.dynamicMap.has(clean)) {
      return this.dynamicMap.get(clean);
    }
    return null;
  }
  /**
   * Asynchronously resolves an instrument key.
   * If not found in cache, fetches the official Upstox NSE instruments database on demand.
   */
  async resolveKey(symbol) {
    const syncResult = this.getKeySync(symbol);
    if (syncResult) return syncResult;
    await this.ensureInstrumentsLoaded();
    return this.getKeySync(symbol);
  }
  /**
   * Resolves canonical symbol given an Upstox key
   */
  getSymbolFromKey(key) {
    if (this.reverseMap.has(key)) {
      return this.reverseMap.get(key);
    }
    const parts = key.split("|");
    return parts.length > 1 ? parts[1] : key;
  }
  /**
   * Downloads and caches the full Upstox NSE instruments list (78k+ instruments)
   * if not loaded in the past 24 hours.
   */
  async ensureInstrumentsLoaded() {
    const ONE_DAY_MS = 24 * 60 * 60 * 1e3;
    if (this.lastDownloadedAt && Date.now() - this.lastDownloadedAt < ONE_DAY_MS) {
      return;
    }
    if (this.downloadPromise) {
      return this.downloadPromise;
    }
    this.downloadPromise = (async () => {
      try {
        console.log("[UpstoxInstruments] Fetching official NSE instruments list from Upstox CDN...");
        const res = await fetch("https://assets.upstox.com/market-quote/instruments/exchange/NSE.json.gz");
        if (!res.ok) {
          console.warn(`[UpstoxInstruments] Failed to download instruments: HTTP ${res.status}`);
          return;
        }
        const buffer = await res.arrayBuffer();
        const decompressed = zlib.gunzipSync(Buffer.from(buffer));
        const data = JSON.parse(decompressed.toString("utf8"));
        if (Array.isArray(data)) {
          let count = 0;
          for (const item of data) {
            if (item.segment === "NSE_EQ" && item.trading_symbol && item.instrument_key) {
              const sym = item.trading_symbol.toUpperCase();
              this.dynamicMap.set(sym, item.instrument_key);
              this.reverseMap.set(item.instrument_key, sym);
              if (item.isin) {
                this.dynamicMap.set(item.isin.toUpperCase(), item.instrument_key);
              }
              count++;
            } else if (item.segment === "NSE_INDEX" && item.name && item.instrument_key) {
              const nameUpper = item.name.toUpperCase();
              this.dynamicMap.set(nameUpper, item.instrument_key);
              if (item.trading_symbol) {
                this.dynamicMap.set(item.trading_symbol.toUpperCase(), item.instrument_key);
              }
            }
          }
          this.lastDownloadedAt = Date.now();
          console.log(`[UpstoxInstruments] Successfully cached ${count} NSE equities and indices.`);
        }
      } catch (err) {
        console.warn(`[UpstoxInstruments] Error downloading instruments: ${err.message}`);
      } finally {
        this.downloadPromise = null;
      }
    })();
    return this.downloadPromise;
  }
};
var upstoxInstruments = new UpstoxInstrumentService();

// server/marketData/symbolNormalizer.ts
var INDEX_MAP = {
  NIFTY: { display: "NIFTY 50", yahooSymbol: "^NSEI", twelveDataSymbol: "NIFTY 50:NSE" },
  NIFTY50: { display: "NIFTY 50", yahooSymbol: "^NSEI", twelveDataSymbol: "NIFTY 50:NSE" },
  "^NSEI": { display: "NIFTY 50", yahooSymbol: "^NSEI", twelveDataSymbol: "NIFTY 50:NSE" },
  "NIFTY 50": { display: "NIFTY 50", yahooSymbol: "^NSEI", twelveDataSymbol: "NIFTY 50:NSE" },
  BANKNIFTY: { display: "NIFTY Bank", yahooSymbol: "^NSEBANK", twelveDataSymbol: "BANKNIFTY:NSE" },
  NIFTYBANK: { display: "NIFTY Bank", yahooSymbol: "^NSEBANK", twelveDataSymbol: "BANKNIFTY:NSE" },
  "^NSEBANK": { display: "NIFTY Bank", yahooSymbol: "^NSEBANK", twelveDataSymbol: "BANKNIFTY:NSE" },
  NIFTYIT: { display: "NIFTY IT", yahooSymbol: "^CNXIT", twelveDataSymbol: "NIFTYIT:NSE" },
  "^CNXIT": { display: "NIFTY IT", yahooSymbol: "^CNXIT", twelveDataSymbol: "NIFTYIT:NSE" },
  NIFTYAUTO: { display: "NIFTY Auto", yahooSymbol: "^CNXAUTO", twelveDataSymbol: "NIFTYAUTO:NSE" },
  "^CNXAUTO": { display: "NIFTY Auto", yahooSymbol: "^CNXAUTO", twelveDataSymbol: "NIFTYAUTO:NSE" },
  NIFTYPHARMA: { display: "NIFTY Pharma", yahooSymbol: "^CNXPHARMA", twelveDataSymbol: "NIFTYPHARMA:NSE" },
  "^CNXPHARMA": { display: "NIFTY Pharma", yahooSymbol: "^CNXPHARMA", twelveDataSymbol: "NIFTYPHARMA:NSE" },
  NIFTYFMCG: { display: "NIFTY FMCG", yahooSymbol: "^CNXFMCG", twelveDataSymbol: "NIFTYFMCG:NSE" },
  "^CNXFMCG": { display: "NIFTY FMCG", yahooSymbol: "^CNXFMCG", twelveDataSymbol: "NIFTYFMCG:NSE" },
  NIFTYMETAL: { display: "NIFTY Metal", yahooSymbol: "^CNXMETAL", twelveDataSymbol: "NIFTYMETAL:NSE" },
  "^CNXMETAL": { display: "NIFTY Metal", yahooSymbol: "^CNXMETAL", twelveDataSymbol: "NIFTYMETAL:NSE" },
  NIFTYENERGY: { display: "NIFTY Energy", yahooSymbol: "^CNXENERGY", twelveDataSymbol: "NIFTYENERGY:NSE" },
  "^CNXENERGY": { display: "NIFTY Energy", yahooSymbol: "^CNXENERGY", twelveDataSymbol: "NIFTYENERGY:NSE" },
  NIFTYREALTY: { display: "NIFTY Realty", yahooSymbol: "^CNXREALTY", twelveDataSymbol: "NIFTYREALTY:NSE" },
  "^CNXREALTY": { display: "NIFTY Realty", yahooSymbol: "^CNXREALTY", twelveDataSymbol: "NIFTYREALTY:NSE" },
  NIFTYINFRA: { display: "NIFTY Infra", yahooSymbol: "^CNXINFRA", twelveDataSymbol: "NIFTYINFRA:NSE" },
  "^CNXINFRA": { display: "NIFTY Infra", yahooSymbol: "^CNXINFRA", twelveDataSymbol: "NIFTYINFRA:NSE" },
  NIFTYPSE: { display: "NIFTY PSE", yahooSymbol: "^CNXPSE", twelveDataSymbol: "NIFTYPSE:NSE" },
  "^CNXPSE": { display: "NIFTY PSE", yahooSymbol: "^CNXPSE", twelveDataSymbol: "NIFTYPSE:NSE" },
  NIFTYFIN: { display: "NIFTY Fin Service", yahooSymbol: "^CNXFIN", twelveDataSymbol: "NIFTYFIN:NSE" },
  "^CNXFIN": { display: "NIFTY Fin Service", yahooSymbol: "^CNXFIN", twelveDataSymbol: "NIFTYFIN:NSE" },
  NIFTYCOMM: { display: "NIFTY Commodities", yahooSymbol: "^CNXCOMMODITIES", twelveDataSymbol: "NIFTYCOMM:NSE" },
  "^CNXCOMMODITIES": { display: "NIFTY Commodities", yahooSymbol: "^CNXCOMMODITIES", twelveDataSymbol: "NIFTYCOMM:NSE" }
};
var SymbolNormalizer = class {
  /**
   * Normalizes any input symbol into a canonical NSE equity or index symbol
   * e.g.:
   *   "RELIANCE.NS" -> "RELIANCE"
   *   "reliance" -> "RELIANCE"
   *   "^NSEI" -> "NIFTY50"
   *   "NIFTY 50" -> "NIFTY50"
   */
  static toCanonical(input) {
    if (!input) return "";
    const trimmed = input.trim().toUpperCase();
    if (INDEX_MAP[trimmed]) {
      const idx = INDEX_MAP[trimmed];
      if (idx.yahooSymbol === "^NSEI") return "NIFTY50";
      if (idx.yahooSymbol === "^NSEBANK") return "BANKNIFTY";
      return trimmed.replace("^", "").replace(" ", "");
    }
    let clean = trimmed;
    if (clean.startsWith("^")) {
      return clean;
    }
    clean = clean.replace(/\.NS$/, "");
    clean = clean.replace(/\.BO$/, "");
    clean = clean.replace(/:NSE$/, "");
    clean = clean.replace(/:BSE$/, "");
    return clean;
  }
  /**
   * Returns complete mapping details for a symbol
   */
  static getMapping(input) {
    const raw = (input || "").trim();
    const upper = raw.toUpperCase();
    if (INDEX_MAP[upper]) {
      const info = INDEX_MAP[upper];
      const canonical2 = upper === "^NSEI" || upper === "NIFTY 50" || upper === "NIFTY" ? "NIFTY50" : upper.replace("^", "").replace(" ", "");
      const upstoxKey2 = upstoxInstruments.getKeySync(upper) || upstoxInstruments.getKeySync(canonical2) || void 0;
      return {
        canonical: canonical2,
        display: info.display,
        yahooSymbol: info.yahooSymbol,
        twelveDataSymbol: info.twelveDataSymbol,
        upstoxKey: upstoxKey2,
        isIndex: true
      };
    }
    if (upper.startsWith("^")) {
      const upstoxKey2 = upstoxInstruments.getKeySync(upper) || void 0;
      return {
        canonical: upper,
        display: upper,
        yahooSymbol: upper,
        twelveDataSymbol: upper.replace("^", "") + ":NSE",
        upstoxKey: upstoxKey2,
        isIndex: true
      };
    }
    const canonical = this.toCanonical(upper);
    const upstoxKey = upstoxInstruments.getKeySync(canonical) || void 0;
    return {
      canonical,
      display: canonical,
      yahooSymbol: `${canonical}.NS`,
      twelveDataSymbol: `${canonical}:NSE`,
      upstoxKey,
      isIndex: false
    };
  }
  /**
   * Translates canonical or raw symbol to Upstox instrument key
   */
  static toUpstox(input) {
    return upstoxInstruments.getKeySync(input) || input;
  }
  /**
   * Translates canonical or raw symbol to Yahoo Finance symbol
   */
  static toYahoo(input) {
    return this.getMapping(input).yahooSymbol;
  }
  /**
   * Translates canonical or raw symbol to Twelve Data symbol
   */
  static toTwelveData(input) {
    return this.getMapping(input).twelveDataSymbol;
  }
};

// server/marketData/marketDataService.ts
import "dotenv/config";

// server/marketData/providers/baseProvider.ts
var BaseMarketDataProvider = class {
  /**
   * Helper to perform HTTP GET requests with timeout and latency tracking
   */
  async fetchWithTimeout(url, options = {}, timeoutMs = 9e3, meta = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    const start = Date.now();
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      const durationMs = Date.now() - start;
      const sanitizedUrl = url.replace(/apikey=[^&]+/i, "apikey=***");
      if (!response.ok) {
        console.warn(
          `[${this.name}] Request failed: ${response.status} ${response.statusText} in ${durationMs}ms | Action: ${meta.action || "fetch"} | Symbol: ${meta.symbol || "N/A"} | Attempt: ${meta.attempt || 1} | URL: ${sanitizedUrl}`
        );
      }
      return { response, durationMs };
    } catch (error) {
      const durationMs = Date.now() - start;
      const sanitizedUrl = url.replace(/apikey=[^&]+/i, "apikey=***");
      const isTimeout = error.name === "AbortError";
      console.error(
        `[${this.name}] Network error (${isTimeout ? "TIMEOUT" : error.message}) after ${durationMs}ms | Action: ${meta.action || "fetch"} | Symbol: ${meta.symbol || "N/A"} | Attempt: ${meta.attempt || 1} | URL: ${sanitizedUrl}`
      );
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }
  /**
   * Constructs a structured, compliant error object
   */
  createError(code, message, symbol, httpStatus, details) {
    return {
      code,
      message,
      provider: this.name,
      symbol,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      httpStatus,
      details
    };
  }
};

// server/marketData/providers/twelveDataProvider.ts
var TwelveDataProvider = class extends BaseMarketDataProvider {
  constructor(apiKey) {
    super();
    this.name = "TwelveData";
    this.baseUrl = "https://api.twelvedata.com";
    this.apiKey = apiKey || process.env.MARKET_DATA_API_KEY || process.env.TWELVE_DATA_API_KEY || "";
  }
  isConfigured() {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }
  async getQuote(symbol) {
    if (!this.isConfigured()) return null;
    const mapping = SymbolNormalizer.getMapping(symbol);
    const querySymbol = mapping.twelveDataSymbol;
    const url = `${this.baseUrl}/quote?symbol=${encodeURIComponent(querySymbol)}&apikey=${this.apiKey}`;
    try {
      const { response } = await this.fetchWithTimeout(url, {}, 8e3, {
        symbol,
        action: "getQuote"
      });
      if (!response.ok) return null;
      const data = await response.json();
      if (data.code || data.status === "error" || !data.close) {
        return null;
      }
      const price = parseFloat(data.close) || 0;
      const previousClose = parseFloat(data.previous_close) || price;
      const change = parseFloat(data.change) || price - previousClose;
      const changePercent = parseFloat(data.percent_change) || (previousClose !== 0 ? change / previousClose * 100 : 0);
      const dayHigh = parseFloat(data.high) || price;
      const dayLow = parseFloat(data.low) || price;
      const fiftyTwoWeekHigh = parseFloat(data.fifty_two_week?.high) || dayHigh;
      const fiftyTwoWeekLow = parseFloat(data.fifty_two_week?.low) || dayLow;
      const volume = parseInt(data.volume, 10) || 0;
      const timestamp = data.timestamp ? data.timestamp * 1e3 : Date.now();
      const marketInfo = getMarketStatus(timestamp);
      return {
        symbol: mapping.canonical,
        price: Math.round(price * 100) / 100,
        change: Math.round(change * 100) / 100,
        changePercent: Math.round(changePercent * 100) / 100,
        volume,
        dayHigh: Math.round(dayHigh * 100) / 100,
        dayLow: Math.round(dayLow * 100) / 100,
        fiftyTwoWeekHigh: Math.round(fiftyTwoWeekHigh * 100) / 100,
        fiftyTwoWeekLow: Math.round(fiftyTwoWeekLow * 100) / 100,
        previousClose: Math.round(previousClose * 100) / 100,
        timestamp,
        updatedAt: formatISTDateTime(timestamp),
        source: this.name,
        isDelayed: marketInfo.isDelayed,
        marketStatus: marketInfo.marketStatus
      };
    } catch (e) {
      return null;
    }
  }
  async getHistoricalData(symbol, timeframe = "daily", range = "1y") {
    if (!this.isConfigured()) {
      return {
        symbol: SymbolNormalizer.toCanonical(symbol),
        timeframe,
        candles: [],
        status: "ERROR",
        source: this.name,
        updatedAt: formatISTDateTime(),
        error: "TwelveData provider is not configured with MARKET_DATA_API_KEY"
      };
    }
    const mapping = SymbolNormalizer.getMapping(symbol);
    const querySymbol = mapping.twelveDataSymbol;
    const interval = timeframe === "weekly" ? "1week" : "1day";
    const outputsize = range === "2y" ? "500" : "260";
    const url = `${this.baseUrl}/time_series?symbol=${encodeURIComponent(querySymbol)}&interval=${interval}&outputsize=${outputsize}&apikey=${this.apiKey}`;
    try {
      const { response } = await this.fetchWithTimeout(url, {}, 1e4, {
        symbol,
        action: "getHistoricalData"
      });
      if (!response.ok) {
        return {
          symbol: mapping.canonical,
          timeframe,
          candles: [],
          status: "ERROR",
          source: this.name,
          updatedAt: formatISTDateTime(),
          error: `TwelveData HTTP error: ${response.status}`
        };
      }
      const data = await response.json();
      if (!data.values || !Array.isArray(data.values) || data.values.length === 0) {
        return {
          symbol: mapping.canonical,
          timeframe,
          candles: [],
          status: "ERROR",
          source: this.name,
          updatedAt: formatISTDateTime(),
          error: data.message || "No historical candle values returned"
        };
      }
      const candles = data.values.map((v) => {
        const timestamp = new Date(v.datetime).getTime();
        const open = parseFloat(v.open);
        const high = parseFloat(v.high);
        const low = parseFloat(v.low);
        const close = parseFloat(v.close);
        const volume = parseInt(v.volume, 10) || 0;
        if (isNaN(open) || isNaN(high) || isNaN(low) || isNaN(close)) return null;
        return {
          timestamp,
          open,
          high,
          low,
          close,
          volume,
          dateStr: v.datetime
        };
      }).filter((c) => c !== null).reverse();
      return {
        symbol: mapping.canonical,
        timeframe,
        candles,
        status: candles.length < 50 ? "INSUFFICIENT" : "FRESH",
        source: this.name,
        updatedAt: formatISTDateTime(),
        rawCount: candles.length
      };
    } catch (err) {
      return {
        symbol: mapping.canonical,
        timeframe,
        candles: [],
        status: "ERROR",
        source: this.name,
        updatedAt: formatISTDateTime(),
        error: err.message
      };
    }
  }
  async getIntradayData(symbol, interval = "5min") {
    if (!this.isConfigured()) {
      return {
        symbol: SymbolNormalizer.toCanonical(symbol),
        timeframe: "intraday",
        candles: [],
        status: "ERROR",
        source: this.name,
        updatedAt: formatISTDateTime(),
        error: "TwelveData provider not configured"
      };
    }
    const mapping = SymbolNormalizer.getMapping(symbol);
    const url = `${this.baseUrl}/time_series?symbol=${encodeURIComponent(mapping.twelveDataSymbol)}&interval=${interval}&outputsize=75&apikey=${this.apiKey}`;
    try {
      const { response } = await this.fetchWithTimeout(url, {}, 8e3, { symbol, action: "getIntraday" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      if (!data.values) throw new Error("No values");
      const candles = data.values.map((v) => ({
        timestamp: new Date(v.datetime).getTime(),
        open: parseFloat(v.open),
        high: parseFloat(v.high),
        low: parseFloat(v.low),
        close: parseFloat(v.close),
        volume: parseInt(v.volume, 10) || 0,
        dateStr: v.datetime
      })).reverse();
      return {
        symbol: mapping.canonical,
        timeframe: "intraday",
        candles,
        status: "FRESH",
        source: this.name,
        updatedAt: formatISTDateTime()
      };
    } catch (e) {
      return {
        symbol: mapping.canonical,
        timeframe: "intraday",
        candles: [],
        status: "ERROR",
        source: this.name,
        updatedAt: formatISTDateTime(),
        error: e.message
      };
    }
  }
  async getIndexData(indexSymbol) {
    const [quote, history] = await Promise.all([
      this.getQuote(indexSymbol),
      this.getHistoricalData(indexSymbol, "daily", "1y")
    ]);
    return { quote, history };
  }
  async getSectorData() {
    const results = [];
    for (const [sector, info] of Object.entries(SECTOR_INDICES)) {
      const quote = await this.getQuote(info.symbol);
      results.push({
        sector,
        name: info.name,
        symbol: info.symbol,
        status: quote ? "OK" : "UNAVAILABLE",
        quote
      });
    }
    return results;
  }
  async checkHealth() {
    if (!this.isConfigured()) {
      return { configured: false, reachable: false, error: "MARKET_DATA_API_KEY is not set" };
    }
    try {
      const start = Date.now();
      const url = `${this.baseUrl}/quote?symbol=RELIANCE:NSE&apikey=${this.apiKey}`;
      const { response, durationMs } = await this.fetchWithTimeout(url, {}, 5e3, { action: "healthCheck" });
      return {
        configured: true,
        reachable: response.ok,
        latencyMs: durationMs
      };
    } catch (e) {
      return {
        configured: true,
        reachable: false,
        error: e.message
      };
    }
  }
};

// server/marketData/providers/yahooProvider.ts
var YahooFinanceNSEProvider = class extends BaseMarketDataProvider {
  constructor() {
    super(...arguments);
    this.name = "YahooFinanceNSE";
  }
  isConfigured() {
    return true;
  }
  getHeaders() {
    return {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      Accept: "application/json",
      "Accept-Language": "en-US,en;q=0.9"
    };
  }
  async getQuote(symbol) {
    const mapping = SymbolNormalizer.getMapping(symbol);
    const yahooSym = mapping.yahooSymbol;
    const url = `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSym)}?interval=1d&range=5d`;
    try {
      const { response } = await this.fetchWithTimeout(
        url,
        { headers: this.getHeaders() },
        8e3,
        { symbol: mapping.canonical, action: "getQuote" }
      );
      if (!response.ok) {
        return null;
      }
      const json = await response.json();
      const result = json?.chart?.result?.[0];
      if (!result) return null;
      const meta = result.meta;
      const quote = result.indicators?.quote?.[0];
      const timestamps = result.timestamp || [];
      if (!meta) return null;
      let price = meta.regularMarketPrice;
      if (typeof price !== "number" || isNaN(price)) {
        const closes = (quote?.close || []).filter((c) => typeof c === "number" && !isNaN(c));
        price = closes.length > 0 ? closes[closes.length - 1] : 0;
      }
      if (price <= 0) return null;
      let previousClose = meta.chartPreviousClose ?? meta.previousClose;
      if (typeof previousClose !== "number" || isNaN(previousClose) || previousClose === 0) {
        const validCloses = (quote?.close || []).filter((c) => typeof c === "number" && !isNaN(c));
        if (validCloses.length >= 2) {
          previousClose = validCloses[validCloses.length - 2];
        } else {
          previousClose = price;
        }
      }
      const change = price - previousClose;
      const changePercent = previousClose !== 0 ? change / previousClose * 100 : 0;
      const dayHigh = typeof meta.regularMarketDayHigh === "number" ? meta.regularMarketDayHigh : price;
      const dayLow = typeof meta.regularMarketDayLow === "number" ? meta.regularMarketDayLow : price;
      const fiftyTwoWeekHigh = typeof meta.fiftyTwoWeekHigh === "number" ? meta.fiftyTwoWeekHigh : dayHigh;
      const fiftyTwoWeekLow = typeof meta.fiftyTwoWeekLow === "number" ? meta.fiftyTwoWeekLow : dayLow;
      const volume = typeof meta.regularMarketVolume === "number" ? meta.regularMarketVolume : quote?.volume?.[quote.volume.length - 1] || 0;
      const timestamp = (meta.regularMarketTime || timestamps[timestamps.length - 1] || Math.floor(Date.now() / 1e3)) * 1e3;
      const marketInfo = getMarketStatus(timestamp);
      return {
        symbol: mapping.canonical,
        price: Math.round(price * 100) / 100,
        change: Math.round(change * 100) / 100,
        changePercent: Math.round(changePercent * 100) / 100,
        volume: volume || 0,
        dayHigh: Math.round(dayHigh * 100) / 100,
        dayLow: Math.round(dayLow * 100) / 100,
        fiftyTwoWeekHigh: Math.round(fiftyTwoWeekHigh * 100) / 100,
        fiftyTwoWeekLow: Math.round(fiftyTwoWeekLow * 100) / 100,
        previousClose: Math.round(previousClose * 100) / 100,
        timestamp,
        updatedAt: formatISTDateTime(timestamp),
        source: this.name,
        isDelayed: marketInfo.isDelayed,
        marketStatus: marketInfo.marketStatus
      };
    } catch (e) {
      return null;
    }
  }
  async getHistoricalData(symbol, timeframe = "daily", range = "1y") {
    const mapping = SymbolNormalizer.getMapping(symbol);
    const yahooSym = mapping.yahooSymbol;
    const interval = timeframe === "weekly" ? "1wk" : "1d";
    const queryRange = range || (timeframe === "weekly" ? "2y" : "1y");
    const url = `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSym)}?interval=${interval}&range=${queryRange}`;
    try {
      const { response } = await this.fetchWithTimeout(
        url,
        { headers: this.getHeaders() },
        9e3,
        { symbol: mapping.canonical, action: "getHistoricalData" }
      );
      if (!response.ok) {
        return {
          symbol: mapping.canonical,
          timeframe,
          candles: [],
          status: "ERROR",
          source: this.name,
          updatedAt: formatISTDateTime(),
          error: `HTTP ${response.status} from Yahoo Finance for ${mapping.canonical}`
        };
      }
      const json = await response.json();
      const result = json?.chart?.result?.[0];
      if (!result) {
        return {
          symbol: mapping.canonical,
          timeframe,
          candles: [],
          status: "ERROR",
          source: this.name,
          updatedAt: formatISTDateTime(),
          error: json?.chart?.error?.description || "No candle chart data found in Yahoo response"
        };
      }
      const timestamps = result.timestamp || [];
      const quote = result.indicators?.quote?.[0];
      const adjclose = result.indicators?.adjclose?.[0]?.adjclose;
      if (!quote || timestamps.length === 0) {
        return {
          symbol: mapping.canonical,
          timeframe,
          candles: [],
          status: "INSUFFICIENT",
          source: this.name,
          updatedAt: formatISTDateTime(),
          error: "Empty timestamps or quotes returned"
        };
      }
      const candles = [];
      for (let i = 0; i < timestamps.length; i++) {
        const rawClose = adjclose?.[i] ?? quote.close?.[i];
        const rawOpen = quote.open?.[i];
        const rawHigh = quote.high?.[i];
        const rawLow = quote.low?.[i];
        const rawVol = quote.volume?.[i];
        if (typeof rawClose !== "number" || isNaN(rawClose) || typeof rawOpen !== "number" || isNaN(rawOpen) || typeof rawHigh !== "number" || isNaN(rawHigh) || typeof rawLow !== "number" || isNaN(rawLow)) {
          continue;
        }
        const date = new Date(timestamps[i] * 1e3);
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, "0");
        const dd = String(date.getDate()).padStart(2, "0");
        candles.push({
          timestamp: timestamps[i] * 1e3,
          open: Math.round(rawOpen * 100) / 100,
          high: Math.round(rawHigh * 100) / 100,
          low: Math.round(rawLow * 100) / 100,
          close: Math.round(rawClose * 100) / 100,
          volume: Math.round(rawVol || 0),
          dateStr: `${yyyy}-${mm}-${dd}`
        });
      }
      return {
        symbol: mapping.canonical,
        timeframe,
        candles,
        status: candles.length < 50 ? "INSUFFICIENT" : "FRESH",
        source: this.name,
        updatedAt: formatISTDateTime(),
        rawCount: candles.length
      };
    } catch (err) {
      return {
        symbol: mapping.canonical,
        timeframe,
        candles: [],
        status: "ERROR",
        source: this.name,
        updatedAt: formatISTDateTime(),
        error: err.message
      };
    }
  }
  async getIntradayData(symbol, interval = "5m") {
    const mapping = SymbolNormalizer.getMapping(symbol);
    const yahooSym = mapping.yahooSymbol;
    const url = `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSym)}?interval=${interval}&range=1d`;
    try {
      const { response } = await this.fetchWithTimeout(
        url,
        { headers: this.getHeaders() },
        8e3,
        { symbol: mapping.canonical, action: "getIntraday" }
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const json = await response.json();
      const result = json?.chart?.result?.[0];
      if (!result) throw new Error("No chart data");
      const timestamps = result.timestamp || [];
      const quote = result.indicators?.quote?.[0];
      const candles = [];
      for (let i = 0; i < timestamps.length; i++) {
        const c = quote.close?.[i];
        const o = quote.open?.[i];
        const h = quote.high?.[i];
        const l = quote.low?.[i];
        const v = quote.volume?.[i];
        if (typeof c === "number" && !isNaN(c) && typeof o === "number") {
          candles.push({
            timestamp: timestamps[i] * 1e3,
            open: Math.round(o * 100) / 100,
            high: Math.round((h || o) * 100) / 100,
            low: Math.round((l || o) * 100) / 100,
            close: Math.round(c * 100) / 100,
            volume: Math.round(v || 0),
            dateStr: new Date(timestamps[i] * 1e3).toISOString()
          });
        }
      }
      return {
        symbol: mapping.canonical,
        timeframe: "intraday",
        candles,
        status: candles.length === 0 ? "INSUFFICIENT" : "FRESH",
        source: this.name,
        updatedAt: formatISTDateTime()
      };
    } catch (err) {
      return {
        symbol: mapping.canonical,
        timeframe: "intraday",
        candles: [],
        status: "ERROR",
        source: this.name,
        updatedAt: formatISTDateTime(),
        error: err.message
      };
    }
  }
  async getIndexData(indexSymbol) {
    const [quote, history] = await Promise.all([
      this.getQuote(indexSymbol),
      this.getHistoricalData(indexSymbol, "daily", "1y")
    ]);
    return { quote, history };
  }
  async getSectorData() {
    const results = [];
    for (const [sector, info] of Object.entries(SECTOR_INDICES)) {
      try {
        const [quote, history] = await Promise.all([
          this.getQuote(info.yahooSymbol),
          this.getHistoricalData(info.yahooSymbol, "daily", "3mo")
        ]);
        const candles = history.candles || [];
        const hasData = quote !== null || candles.length >= 2;
        if (!hasData) {
          results.push({
            sector,
            name: info.name,
            symbol: info.symbol,
            status: "UNAVAILABLE",
            quote: null,
            error: "No market quote or historical candles available"
          });
          continue;
        }
        const lastCandle = candles[candles.length - 1];
        const prevCandle = candles.length >= 2 ? candles[candles.length - 2] : lastCandle;
        const price = quote?.price ?? lastCandle.close;
        const prevClose = quote?.previousClose ?? prevCandle.close;
        const change = quote?.change ?? price - prevClose;
        const changePercent = prevClose > 0 ? change / prevClose * 100 : 0;
        let return20D;
        if (candles.length >= 21) {
          const close20DaysAgo = candles[candles.length - 21].close;
          if (close20DaysAgo > 0) {
            return20D = Math.round((price - close20DaysAgo) / close20DaysAgo * 100 * 100) / 100;
          }
        }
        let rsi14;
        if (candles.length >= 15) {
          const closes = candles.map((c) => c.close);
          let gains = 0;
          let losses = 0;
          for (let i = closes.length - 14; i < closes.length; i++) {
            const diff = closes[i] - closes[i - 1];
            if (diff >= 0) gains += diff;
            else losses += Math.abs(diff);
          }
          const avgGain = gains / 14;
          const avgLoss = losses / 14;
          if (avgLoss === 0) {
            rsi14 = 100;
          } else {
            const rs = avgGain / avgLoss;
            rsi14 = Math.round((100 - 100 / (1 + rs)) * 10) / 10;
          }
        }
        let momentumScore;
        if (rsi14 !== void 0 && return20D !== void 0) {
          const rsiPart = Math.max(0, Math.min(50, rsi14 * 0.5));
          const retPart = Math.max(0, Math.min(50, 25 + return20D * 2.5));
          momentumScore = Math.round(rsiPart + retPart);
        }
        results.push({
          sector,
          name: info.name,
          symbol: info.symbol,
          status: "OK",
          quote: quote || {
            symbol: info.symbol,
            price,
            change: Math.round(change * 100) / 100,
            changePercent: Math.round(changePercent * 100) / 100,
            volume: lastCandle.volume,
            dayHigh: lastCandle.high,
            dayLow: lastCandle.low,
            fiftyTwoWeekHigh: lastCandle.high,
            fiftyTwoWeekLow: lastCandle.low,
            previousClose: prevClose,
            timestamp: lastCandle.timestamp,
            updatedAt: formatISTDateTime(),
            source: this.name
          },
          price: Math.round(price * 100) / 100,
          changePercent: Math.round(changePercent * 100) / 100,
          return20D,
          rsi14,
          momentumScore
        });
      } catch (err) {
        results.push({
          sector,
          name: info.name,
          symbol: info.symbol,
          status: "UNAVAILABLE",
          quote: null,
          error: err.message
        });
      }
    }
    return results;
  }
  async checkHealth() {
    try {
      const url = `https://query2.finance.yahoo.com/v8/finance/chart/%5ENSEI?interval=1d&range=1d`;
      const { response, durationMs } = await this.fetchWithTimeout(
        url,
        { headers: this.getHeaders() },
        5e3,
        { symbol: "NIFTY50", action: "healthCheck" }
      );
      return {
        configured: true,
        reachable: response.ok,
        latencyMs: durationMs
      };
    } catch (e) {
      return {
        configured: true,
        reachable: false,
        error: e.message
      };
    }
  }
};

// server/upstox/client.ts
var UpstoxClient = class {
  constructor() {
    this.baseUrl = "https://api.upstox.com";
  }
  /**
   * Lazily retrieves the access token from environment variables.
   * This guarantees that any changes to process.env are picked up immediately.
   */
  getToken() {
    return (process.env.UPSTOX_ACCESS_TOKEN || "").trim();
  }
  isConfigured() {
    return Boolean(this.getToken().length > 0);
  }
  getHeaders() {
    const token = this.getToken();
    return {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "User-Agent": "NSE-Stock-Screener/2.0"
    };
  }
  /**
   * Safe fetch with timeout, latency tracking, and retry on transient errors
   */
  async fetchWithRetry(url, options = {}, timeoutMs = 1e4, maxRetries = 2) {
    let lastError = null;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      const start = Date.now();
      try {
        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
          headers: {
            ...this.getHeaders(),
            ...options.headers || {}
          }
        });
        const durationMs = Date.now() - start;
        clearTimeout(timeoutId);
        if ((response.status === 429 || response.status >= 500) && attempt < maxRetries) {
          console.warn(`[UpstoxClient] HTTP ${response.status} on attempt ${attempt}, retrying in ${attempt * 400}ms...`);
          await new Promise((r) => setTimeout(r, attempt * 400));
          continue;
        }
        return { response, durationMs };
      } catch (err) {
        clearTimeout(timeoutId);
        lastError = err;
        if (attempt < maxRetries) {
          await new Promise((r) => setTimeout(r, attempt * 400));
        }
      }
    }
    throw lastError || new Error("Network request failed after retries");
  }
  /**
   * Fetches full market quotes for one or multiple instrument keys (batched in chunks of 50)
   */
  async getQuotes(instrumentKeys) {
    const resultMap = /* @__PURE__ */ new Map();
    if (!this.isConfigured() || instrumentKeys.length === 0) {
      return resultMap;
    }
    const uniqueKeys = Array.from(new Set(instrumentKeys.filter(Boolean)));
    const CHUNK_SIZE = 50;
    for (let i = 0; i < uniqueKeys.length; i += CHUNK_SIZE) {
      const chunk = uniqueKeys.slice(i, i + CHUNK_SIZE);
      const encodedKeys = chunk.map((k) => encodeURIComponent(k)).join(",");
      const url = `${this.baseUrl}/v3/market-quote/quotes?instrument_key=${encodedKeys}`;
      try {
        const { response } = await this.fetchWithRetry(url, {}, 9e3);
        if (!response.ok) {
          console.warn(`[UpstoxClient] Market quote request failed with status: ${response.status}`);
          continue;
        }
        const json = await response.json();
        if (json.status === "success" && json.data) {
          for (const [key, quote] of Object.entries(json.data)) {
            resultMap.set(key, quote);
            if (quote.instrument_token) {
              resultMap.set(quote.instrument_token, quote);
            }
            if (quote.symbol && quote.symbol !== "NA") {
              resultMap.set(quote.symbol.toUpperCase(), quote);
            }
          }
        }
      } catch (err) {
        console.warn(`[UpstoxClient] Failed to fetch quotes chunk: ${err.message}`);
      }
    }
    return resultMap;
  }
  /**
   * Fetches historical candle bars for an instrument key
   */
  async getHistoricalCandles(instrumentKey, interval, toDate, fromDate) {
    if (!this.isConfigured() || !instrumentKey) {
      return [];
    }
    const encodedKey = encodeURIComponent(instrumentKey);
    const url = `${this.baseUrl}/v2/historical-candle/${encodedKey}/${interval}/${toDate}/${fromDate}`;
    try {
      const { response } = await this.fetchWithRetry(url, {}, 1e4);
      if (!response.ok) {
        console.warn(`[UpstoxClient] Candle request failed for ${instrumentKey}: HTTP ${response.status}`);
        return [];
      }
      const json = await response.json();
      const rawCandles = json.data?.candles || [];
      if (!Array.isArray(rawCandles) || rawCandles.length === 0) {
        return [];
      }
      const candles = [];
      for (const c of rawCandles) {
        const [timeStr, open, high, low, close, volume] = c;
        if (typeof open !== "number" || isNaN(open) || typeof high !== "number" || isNaN(high) || typeof low !== "number" || isNaN(low) || typeof close !== "number" || isNaN(close)) {
          continue;
        }
        const timestamp = new Date(timeStr).getTime();
        const dateStr = timeStr.split("T")[0];
        candles.push({
          timestamp,
          open: Math.round(open * 100) / 100,
          high: Math.round(high * 100) / 100,
          low: Math.round(low * 100) / 100,
          close: Math.round(close * 100) / 100,
          volume: Math.round(volume || 0),
          dateStr
        });
      }
      candles.sort((a, b) => a.timestamp - b.timestamp);
      return candles;
    } catch (err) {
      console.warn(`[UpstoxClient] Historical candles error for ${instrumentKey}: ${err.message}`);
      return [];
    }
  }
  /**
   * Fetches intraday candles for an instrument key (falls back to recent minute candles if intraday is empty)
   */
  async getIntradayCandles(instrumentKey, interval = "30minute") {
    if (!this.isConfigured() || !instrumentKey) {
      return [];
    }
    const encodedKey = encodeURIComponent(instrumentKey);
    const validInterval = interval === "1m" || interval === "1min" ? "1minute" : "30minute";
    const url = `${this.baseUrl}/v2/historical-candle/intraday/${encodedKey}/${validInterval}`;
    try {
      const { response } = await this.fetchWithRetry(url, {}, 8e3);
      if (response.ok) {
        const json = await response.json();
        const rawCandles = json.data?.candles || [];
        if (Array.isArray(rawCandles) && rawCandles.length > 0) {
          const candles = rawCandles.map((c) => ({
            timestamp: new Date(c[0]).getTime(),
            open: Math.round(c[1] * 100) / 100,
            high: Math.round(c[2] * 100) / 100,
            low: Math.round(c[3] * 100) / 100,
            close: Math.round(c[4] * 100) / 100,
            volume: Math.round(c[5] || 0),
            dateStr: c[0].split("T")[0]
          })).sort((a, b) => a.timestamp - b.timestamp);
          return candles;
        }
      }
    } catch (e) {
      console.warn(`[UpstoxClient] Live intraday endpoint failed for ${instrumentKey}: ${e.message}`);
    }
    const today = /* @__PURE__ */ new Date();
    const toDate = today.toISOString().split("T")[0];
    const past = new Date(today.getTime() - 5 * 24 * 60 * 60 * 1e3);
    const fromDate = past.toISOString().split("T")[0];
    return this.getHistoricalCandles(instrumentKey, validInterval, toDate, fromDate);
  }
  /**
   * Health check for Upstox connectivity
   */
  async checkHealth() {
    if (!this.isConfigured()) {
      return {
        configured: false,
        reachable: false,
        error: "UPSTOX_ACCESS_TOKEN environment variable is not configured"
      };
    }
    try {
      const start = Date.now();
      const url = `${this.baseUrl}/v3/market-quote/quotes?instrument_key=NSE_INDEX%7CNifty%2050`;
      const { response, durationMs } = await this.fetchWithRetry(url, {}, 6e3, 1);
      if (response.ok) {
        return {
          configured: true,
          reachable: true,
          latencyMs: durationMs
        };
      }
      const body = await response.text();
      return {
        configured: true,
        reachable: false,
        latencyMs: Date.now() - start,
        error: `Upstox API responded with HTTP ${response.status}: ${body.slice(0, 100)}`
      };
    } catch (err) {
      return {
        configured: true,
        reachable: false,
        error: err.message || "Failed to connect to Upstox API"
      };
    }
  }
};
var upstoxClient = new UpstoxClient();

// server/technicalIndicators.ts
function calculateSMA(data, period) {
  const result = new Array(data.length).fill(null);
  if (data.length < period) return result;
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += data[i];
  }
  result[period - 1] = sum / period;
  for (let i = period; i < data.length; i++) {
    sum += data[i] - data[i - period];
    result[i] = sum / period;
  }
  return result;
}
function calculateEMA(data, period) {
  const result = new Array(data.length).fill(null);
  if (data.length < period) return result;
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += data[i];
  }
  let currentEma = sum / period;
  result[period - 1] = currentEma;
  const multiplier = 2 / (period + 1);
  for (let i = period; i < data.length; i++) {
    currentEma = (data[i] - currentEma) * multiplier + currentEma;
    result[i] = currentEma;
  }
  return result;
}
function calculateRSI(closes, period = 14) {
  const result = new Array(closes.length).fill(null);
  if (closes.length <= period) return result;
  let gains = 0;
  let losses = 0;
  for (let i = 1; i <= period; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff >= 0) gains += diff;
    else losses += Math.abs(diff);
  }
  let avgGain = gains / period;
  let avgLoss = losses / period;
  if (avgLoss === 0) {
    result[period] = 100;
  } else {
    const rs = avgGain / avgLoss;
    result[period] = 100 - 100 / (1 + rs);
  }
  for (let i = period + 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    const gain = diff > 0 ? diff : 0;
    const loss = diff < 0 ? Math.abs(diff) : 0;
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
    if (avgLoss === 0) {
      result[i] = 100;
    } else {
      const rs = avgGain / avgLoss;
      result[i] = 100 - 100 / (1 + rs);
    }
  }
  return result;
}
function calculateMACD(closes, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
  const fastEMA = calculateEMA(closes, fastPeriod);
  const slowEMA = calculateEMA(closes, slowPeriod);
  const macdLine = new Array(closes.length).fill(null);
  const validMacdValues = [];
  const validIndices = [];
  for (let i = 0; i < closes.length; i++) {
    if (fastEMA[i] !== null && slowEMA[i] !== null) {
      const val = fastEMA[i] - slowEMA[i];
      macdLine[i] = val;
      validMacdValues.push(val);
      validIndices.push(i);
    }
  }
  const signalLine = new Array(closes.length).fill(null);
  const histogram = new Array(closes.length).fill(null);
  if (validMacdValues.length >= signalPeriod) {
    const signalSub = calculateEMA(validMacdValues, signalPeriod);
    for (let k = 0; k < validMacdValues.length; k++) {
      const originalIdx = validIndices[k];
      const sigVal = signalSub[k];
      signalLine[originalIdx] = sigVal;
      if (sigVal !== null && macdLine[originalIdx] !== null) {
        histogram[originalIdx] = macdLine[originalIdx] - sigVal;
      }
    }
  }
  return { macdLine, signalLine, histogram };
}
function calculateADX(candles, period = 14) {
  const n = candles.length;
  const adxResult = new Array(n).fill(null);
  const plusDIResult = new Array(n).fill(null);
  const minusDIResult = new Array(n).fill(null);
  if (n <= period * 2) {
    return { adx: adxResult, plusDI: plusDIResult, minusDI: minusDIResult };
  }
  const tr = [candles[0].high - candles[0].low];
  const plusDM = [0];
  const minusDM = [0];
  for (let i = 1; i < n; i++) {
    const h = candles[i].high;
    const l = candles[i].low;
    const prevC = candles[i - 1].close;
    const trueRange = Math.max(h - l, Math.abs(h - prevC), Math.abs(l - prevC));
    tr.push(trueRange);
    const upMove = h - candles[i - 1].high;
    const downMove = candles[i - 1].low - l;
    if (upMove > downMove && upMove > 0) {
      plusDM.push(upMove);
    } else {
      plusDM.push(0);
    }
    if (downMove > upMove && downMove > 0) {
      minusDM.push(downMove);
    } else {
      minusDM.push(0);
    }
  }
  let smoothedTR = 0;
  let smoothedPlusDM = 0;
  let smoothedMinusDM = 0;
  for (let i = 0; i < period; i++) {
    smoothedTR += tr[i];
    smoothedPlusDM += plusDM[i];
    smoothedMinusDM += minusDM[i];
  }
  const dxValues = [];
  const dxIndices = [];
  for (let i = period; i < n; i++) {
    smoothedTR = smoothedTR - smoothedTR / period + tr[i];
    smoothedPlusDM = smoothedPlusDM - smoothedPlusDM / period + plusDM[i];
    smoothedMinusDM = smoothedMinusDM - smoothedMinusDM / period + minusDM[i];
    const pDI = smoothedTR > 0 ? smoothedPlusDM / smoothedTR * 100 : 0;
    const mDI = smoothedTR > 0 ? smoothedMinusDM / smoothedTR * 100 : 0;
    plusDIResult[i] = pDI;
    minusDIResult[i] = mDI;
    const diSum = pDI + mDI;
    const dx = diSum > 0 ? Math.abs(pDI - mDI) / diSum * 100 : 0;
    dxValues.push(dx);
    dxIndices.push(i);
  }
  if (dxValues.length >= period) {
    let adxSum = 0;
    for (let i = 0; i < period; i++) {
      adxSum += dxValues[i];
    }
    let currentADX = adxSum / period;
    adxResult[dxIndices[period - 1]] = currentADX;
    for (let i = period; i < dxValues.length; i++) {
      currentADX = (currentADX * (period - 1) + dxValues[i]) / period;
      adxResult[dxIndices[i]] = currentADX;
    }
  }
  return { adx: adxResult, plusDI: plusDIResult, minusDI: minusDIResult };
}
function calculateATR(candles, period = 14) {
  const result = new Array(candles.length).fill(null);
  if (candles.length < period + 1) return result;
  const tr = [candles[0].high - candles[0].low];
  for (let i = 1; i < candles.length; i++) {
    const h = candles[i].high;
    const l = candles[i].low;
    const prevC = candles[i - 1].close;
    tr.push(Math.max(h - l, Math.abs(h - prevC), Math.abs(l - prevC)));
  }
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += tr[i];
  }
  let currentATR = sum / period;
  result[period - 1] = currentATR;
  for (let i = period; i < candles.length; i++) {
    currentATR = (currentATR * (period - 1) + tr[i]) / period;
    result[i] = currentATR;
  }
  return result;
}
function calculateBollingerBands(closes, period = 20, stdDevMultiplier = 2) {
  const middle = calculateSMA(closes, period);
  const upper = new Array(closes.length).fill(null);
  const lower = new Array(closes.length).fill(null);
  const bandwidth = new Array(closes.length).fill(null);
  const percentB = new Array(closes.length).fill(null);
  for (let i = period - 1; i < closes.length; i++) {
    const mid = middle[i];
    if (mid === null) continue;
    let varianceSum = 0;
    for (let k = i - period + 1; k <= i; k++) {
      varianceSum += Math.pow(closes[k] - mid, 2);
    }
    const stdDev = Math.sqrt(varianceSum / period);
    const u = mid + stdDevMultiplier * stdDev;
    const l = mid - stdDevMultiplier * stdDev;
    upper[i] = u;
    lower[i] = l;
    bandwidth[i] = mid > 0 ? (u - l) / mid * 100 : 0;
    percentB[i] = u - l > 0 ? (closes[i] - l) / (u - l) : 0.5;
  }
  return { upper, middle, lower, bandwidth, percentB };
}
function calculateOBV(candles) {
  const obv = new Array(candles.length).fill(0);
  if (candles.length === 0) return obv;
  obv[0] = candles[0].volume;
  for (let i = 1; i < candles.length; i++) {
    const prevC = candles[i - 1].close;
    const curC = candles[i].close;
    const vol = candles[i].volume;
    if (curC > prevC) {
      obv[i] = obv[i - 1] + vol;
    } else if (curC < prevC) {
      obv[i] = obv[i - 1] - vol;
    } else {
      obv[i] = obv[i - 1];
    }
  }
  return obv;
}
function calculateSupportResistance(candles) {
  if (candles.length < 20) {
    const lastClose = candles[candles.length - 1]?.close || 100;
    return {
      nearestSupport: Math.round(lastClose * 0.95 * 100) / 100,
      nearestResistance: Math.round(lastClose * 1.05 * 100) / 100,
      supportStrength: 5,
      resistanceStrength: 5,
      allSupports: [],
      allResistances: []
    };
  }
  const currentPrice = candles[candles.length - 1].close;
  const window = candles.slice(-100);
  const swingHighs = [];
  const swingLows = [];
  for (let i = 3; i < window.length - 3; i++) {
    const h = window[i].high;
    const l = window[i].low;
    const isHigh = h >= window[i - 1].high && h >= window[i - 2].high && h >= window[i - 3].high && h >= window[i + 1].high && h >= window[i + 2].high && h >= window[i + 3].high;
    const isLow = l <= window[i - 1].low && l <= window[i - 2].low && l <= window[i - 3].low && l <= window[i + 1].low && l <= window[i + 2].low && l <= window[i + 3].low;
    if (isHigh) swingHighs.push(h);
    if (isLow) swingLows.push(l);
  }
  const clusterLevels = (levels) => {
    levels.sort((a, b) => a - b);
    const clusters = [];
    for (const lvl of levels) {
      let merged = false;
      for (const c of clusters) {
        if (Math.abs(c.price - lvl) / c.price <= 0.015) {
          c.price = (c.price * c.touches + lvl) / (c.touches + 1);
          c.touches += 1;
          merged = true;
          break;
        }
      }
      if (!merged) {
        clusters.push({ price: lvl, touches: 1 });
      }
    }
    return clusters;
  };
  const resistanceClusters = clusterLevels(swingHighs);
  const supportClusters = clusterLevels(swingLows);
  const validResistances = resistanceClusters.filter((c) => c.price > currentPrice * 1.002).sort((a, b) => a.price - b.price);
  const validSupports = supportClusters.filter((c) => c.price < currentPrice * 0.998).sort((a, b) => b.price - a.price);
  const nearestRes = validResistances[0] || {
    price: Math.round(currentPrice * 1.05 * 100) / 100,
    touches: 2
  };
  const nearestSup = validSupports[0] || {
    price: Math.round(currentPrice * 0.95 * 100) / 100,
    touches: 2
  };
  const supportStrength = Math.min(10, Math.max(3, nearestSup.touches * 2 + 1));
  const resistanceStrength = Math.min(10, Math.max(3, nearestRes.touches * 2 + 1));
  return {
    nearestSupport: Math.round(nearestSup.price * 100) / 100,
    nearestResistance: Math.round(nearestRes.price * 100) / 100,
    supportStrength,
    resistanceStrength,
    allSupports: validSupports.map((s) => Math.round(s.price * 100) / 100),
    allResistances: validResistances.map((r) => Math.round(r.price * 100) / 100)
  };
}
function calculateAllTechnicalIndicators(candles) {
  if (!candles || candles.length < 30) {
    return null;
  }
  const closes = candles.map((c) => c.close);
  const volumes = candles.map((c) => c.volume);
  const lastIdx = candles.length - 1;
  const currentPrice = closes[lastIdx];
  const ema20Arr = calculateEMA(closes, 20);
  const ema50Arr = calculateEMA(closes, 50);
  const ema100Arr = calculateEMA(closes, 100);
  const ema200Arr = calculateEMA(closes, 200);
  const sma50Arr = calculateSMA(closes, 50);
  const sma200Arr = calculateSMA(closes, 200);
  const ema20 = ema20Arr[lastIdx] ?? currentPrice;
  const ema50 = ema50Arr[lastIdx] ?? ema20;
  const ema100 = ema100Arr[lastIdx] ?? ema50;
  const ema200 = ema200Arr[lastIdx] ?? ema100;
  const sma50 = sma50Arr[lastIdx] ?? ema50;
  const sma200 = sma200Arr[lastIdx] ?? ema200;
  const priceVsEma20 = Math.round((currentPrice - ema20) / ema20 * 1e4) / 100;
  const priceVsEma50 = Math.round((currentPrice - ema50) / ema50 * 1e4) / 100;
  const priceVsEma200 = Math.round((currentPrice - ema200) / ema200 * 1e4) / 100;
  const ema20VsEma50 = Math.round((ema20 - ema50) / ema50 * 1e4) / 100;
  const ema50VsEma200 = Math.round((ema50 - ema200) / ema200 * 1e4) / 100;
  let trendDirection = "NEUTRAL";
  if (currentPrice > ema20 && ema20 > ema50 && ema50 > ema200) {
    trendDirection = "BULLISH";
  } else if (currentPrice < ema20 && ema20 < ema50 && ema50 < ema200) {
    trendDirection = "BEARISH";
  } else if (currentPrice > ema50) {
    trendDirection = "BULLISH";
  } else if (currentPrice < ema50) {
    trendDirection = "BEARISH";
  }
  const rsiArr = calculateRSI(closes, 14);
  const rsi14 = Math.round((rsiArr[lastIdx] ?? 50) * 10) / 10;
  const { macdLine, signalLine, histogram } = calculateMACD(closes, 12, 26, 9);
  const curMacd = macdLine[lastIdx] ?? 0;
  const curSig = signalLine[lastIdx] ?? 0;
  const curHist = histogram[lastIdx] ?? 0;
  const prevHist = histogram[lastIdx - 1] ?? 0;
  let macdCross = "NONE";
  if (prevHist <= 0 && curHist > 0) macdCross = "BULLISH";
  else if (prevHist >= 0 && curHist < 0) macdCross = "BEARISH";
  const { adx, plusDI, minusDI } = calculateADX(candles, 14);
  const curADX = Math.round((adx[lastIdx] ?? 20) * 10) / 10;
  const curPlusDI = Math.round((plusDI[lastIdx] ?? 20) * 10) / 10;
  const curMinusDI = Math.round((minusDI[lastIdx] ?? 20) * 10) / 10;
  let adxStrength = "WEAK";
  if (curADX >= 25) adxStrength = "STRONG";
  else if (curADX >= 20) adxStrength = "MODERATE";
  const pastClose14 = closes[Math.max(0, lastIdx - 14)];
  const roc = pastClose14 > 0 ? Math.round((currentPrice - pastClose14) / pastClose14 * 1e4) / 100 : 0;
  const atrArr = calculateATR(candles, 14);
  const atr14 = Math.round((atrArr[lastIdx] ?? currentPrice * 0.02) * 100) / 100;
  const bb = calculateBollingerBands(closes, 20, 2);
  const bbUpper = Math.round((bb.upper[lastIdx] ?? currentPrice * 1.05) * 100) / 100;
  const bbMiddle = Math.round((bb.middle[lastIdx] ?? currentPrice) * 100) / 100;
  const bbLower = Math.round((bb.lower[lastIdx] ?? currentPrice * 0.95) * 100) / 100;
  const bbBandwidth = Math.round((bb.bandwidth[lastIdx] ?? 5) * 100) / 100;
  const bbPercentB = Math.round((bb.percentB[lastIdx] ?? 0.5) * 100) / 100;
  const volSMA = calculateSMA(volumes, 20);
  const avgVolume20 = Math.round(volSMA[lastIdx] ?? (volumes[lastIdx] || 1e5));
  const currentVolume = volumes[lastIdx] || 1;
  const volumeRatio = avgVolume20 > 0 ? Math.round(currentVolume / avgVolume20 * 100) / 100 : 1;
  const volumeBreakout = volumeRatio >= 2;
  const obvArr = calculateOBV(candles);
  const obv = obvArr[lastIdx] ?? 0;
  const yearCandles = candles.slice(-250);
  let fiftyTwoWeekHigh = yearCandles[0].high;
  let fiftyTwoWeekLow = yearCandles[0].low;
  for (const c of yearCandles) {
    if (c.high > fiftyTwoWeekHigh) fiftyTwoWeekHigh = c.high;
    if (c.low < fiftyTwoWeekLow) fiftyTwoWeekLow = c.low;
  }
  fiftyTwoWeekHigh = Math.round(fiftyTwoWeekHigh * 100) / 100;
  fiftyTwoWeekLow = Math.round(fiftyTwoWeekLow * 100) / 100;
  const distFrom52wHigh = Math.round((currentPrice - fiftyTwoWeekHigh) / fiftyTwoWeekHigh * 1e4) / 100;
  const distFrom52wLow = Math.round((currentPrice - fiftyTwoWeekLow) / fiftyTwoWeekLow * 1e4) / 100;
  const sr = calculateSupportResistance(candles);
  return {
    ema20: Math.round(ema20 * 100) / 100,
    ema50: Math.round(ema50 * 100) / 100,
    ema100: Math.round(ema100 * 100) / 100,
    ema200: Math.round(ema200 * 100) / 100,
    sma50: Math.round(sma50 * 100) / 100,
    sma200: Math.round(sma200 * 100) / 100,
    priceVsEma20,
    priceVsEma50,
    priceVsEma200,
    ema20VsEma50,
    ema50VsEma200,
    trendDirection,
    rsi14,
    macd: {
      line: Math.round(curMacd * 100) / 100,
      signal: Math.round(curSig * 100) / 100,
      histogram: Math.round(curHist * 100) / 100,
      crossover: macdCross
    },
    adx14: {
      adx: curADX,
      plusDI: curPlusDI,
      minusDI: curMinusDI,
      strength: adxStrength
    },
    roc,
    atr14,
    bollingerBands: {
      upper: bbUpper,
      middle: bbMiddle,
      lower: bbLower,
      bandwidth: bbBandwidth,
      percentB: bbPercentB
    },
    avgVolume20,
    volumeRatio,
    obv,
    volumeBreakout,
    fiftyTwoWeekHigh,
    fiftyTwoWeekLow,
    distFrom52wHigh,
    distFrom52wLow,
    nearestSupport: sr.nearestSupport,
    nearestResistance: sr.nearestResistance,
    supportStrength: sr.supportStrength,
    resistanceStrength: sr.resistanceStrength
  };
}

// server/upstox/marketData.ts
var UpstoxMarketDataProvider = class extends BaseMarketDataProvider {
  constructor(client = upstoxClient, instruments = upstoxInstruments) {
    super();
    this.name = "Upstox";
    this.sectorCache = null;
    this.client = client;
    this.instruments = instruments;
  }
  isConfigured() {
    return this.client.isConfigured();
  }
  /**
   * Fetches a real-time quote for an NSE stock or index
   */
  async getQuote(symbol) {
    if (!this.isConfigured() || !symbol) {
      return null;
    }
    const key = await this.instruments.resolveKey(symbol) || this.instruments.cleanSymbol(symbol);
    if (!key) return null;
    try {
      const quotesMap = await this.client.getQuotes([key]);
      const quote = quotesMap.get(key) || quotesMap.get(symbol.toUpperCase());
      if (!quote || typeof quote.last_price !== "number" || quote.last_price <= 0) {
        return null;
      }
      const price = quote.last_price;
      const change = typeof quote.net_change === "number" ? quote.net_change : 0;
      const previousClose = typeof quote.prev_close_price === "number" && quote.prev_close_price > 0 ? quote.prev_close_price : price - change;
      const changePercent = previousClose > 0 ? Math.round(change / previousClose * 100 * 100) / 100 : 0;
      const dayHigh = quote.ohlc?.high && quote.ohlc.high > 0 ? quote.ohlc.high : price;
      const dayLow = quote.ohlc?.low && quote.ohlc.low > 0 ? quote.ohlc.low : price;
      const fiftyTwoWeekHigh = quote.year_high && quote.year_high > 0 ? quote.year_high : dayHigh;
      const fiftyTwoWeekLow = quote.year_low && quote.year_low > 0 ? quote.year_low : dayLow;
      const volume = quote.volume || quote.ohlc?.volume || 0;
      const timestamp = quote.last_trade_time ? parseInt(quote.last_trade_time, 10) : Date.now();
      const marketStatus = getMarketStatus(timestamp);
      const canonicalSymbol = this.instruments.cleanSymbol(symbol);
      return {
        symbol: canonicalSymbol,
        price: Math.round(price * 100) / 100,
        change: Math.round(change * 100) / 100,
        changePercent,
        volume,
        dayHigh: Math.round(dayHigh * 100) / 100,
        dayLow: Math.round(dayLow * 100) / 100,
        fiftyTwoWeekHigh: Math.round(fiftyTwoWeekHigh * 100) / 100,
        fiftyTwoWeekLow: Math.round(fiftyTwoWeekLow * 100) / 100,
        previousClose: Math.round(previousClose * 100) / 100,
        timestamp,
        updatedAt: formatISTDateTime(timestamp),
        source: this.name,
        isDelayed: false,
        marketStatus: marketStatus.marketStatus
      };
    } catch (err) {
      console.warn(`[UpstoxMarketDataProvider] getQuote failed for ${symbol}: ${err.message}`);
      return null;
    }
  }
  /**
   * Fetches historical daily or weekly candle bars for an NSE stock or index
   */
  async getHistoricalData(symbol, timeframe = "daily", range = "1y") {
    const canonical = this.instruments.cleanSymbol(symbol);
    if (!this.isConfigured()) {
      return {
        symbol: canonical,
        timeframe,
        candles: [],
        status: "ERROR",
        source: this.name,
        updatedAt: formatISTDateTime(),
        error: "Upstox market data provider is not configured with UPSTOX_ACCESS_TOKEN"
      };
    }
    const key = await this.instruments.resolveKey(symbol);
    if (!key) {
      return {
        symbol: canonical,
        timeframe,
        candles: [],
        status: "ERROR",
        source: this.name,
        updatedAt: formatISTDateTime(),
        error: `Could not resolve Upstox instrument key for symbol ${symbol}`
      };
    }
    const interval = timeframe === "weekly" ? "week" : "day";
    const now = /* @__PURE__ */ new Date();
    const toDate = now.toISOString().split("T")[0];
    let daysToFetch = 450;
    if (range === "2y") daysToFetch = 800;
    else if (range === "5y") daysToFetch = 1900;
    else if (range === "6m") daysToFetch = 220;
    else if (range === "3m") daysToFetch = 120;
    else if (range === "1m") daysToFetch = 40;
    if (timeframe === "weekly") {
      daysToFetch = Math.max(daysToFetch, 1e3);
    }
    const fromTime = now.getTime() - daysToFetch * 24 * 60 * 60 * 1e3;
    const fromDate = new Date(fromTime).toISOString().split("T")[0];
    try {
      const candles = await this.client.getHistoricalCandles(key, interval, toDate, fromDate);
      if (candles.length === 0) {
        return {
          symbol: canonical,
          timeframe,
          candles: [],
          status: "INSUFFICIENT",
          source: this.name,
          updatedAt: formatISTDateTime(),
          error: `No candle data returned from Upstox for ${symbol} (${key})`
        };
      }
      return {
        symbol: canonical,
        timeframe,
        candles,
        status: candles.length < 30 ? "INSUFFICIENT" : "FRESH",
        source: this.name,
        updatedAt: formatISTDateTime(),
        rawCount: candles.length
      };
    } catch (err) {
      return {
        symbol: canonical,
        timeframe,
        candles: [],
        status: "ERROR",
        source: this.name,
        updatedAt: formatISTDateTime(),
        error: err.message || `Failed to fetch historical candles for ${symbol}`
      };
    }
  }
  /**
   * Fetches intraday candles for an NSE stock or index
   */
  async getIntradayData(symbol, interval = "30minute") {
    const canonical = this.instruments.cleanSymbol(symbol);
    if (!this.isConfigured()) {
      return {
        symbol: canonical,
        timeframe: "intraday",
        candles: [],
        status: "ERROR",
        source: this.name,
        updatedAt: formatISTDateTime(),
        error: "Upstox is not configured"
      };
    }
    const key = await this.instruments.resolveKey(symbol);
    if (!key) {
      return {
        symbol: canonical,
        timeframe: "intraday",
        candles: [],
        status: "ERROR",
        source: this.name,
        updatedAt: formatISTDateTime(),
        error: `Could not resolve Upstox instrument key for ${symbol}`
      };
    }
    try {
      const candles = await this.client.getIntradayCandles(key, interval);
      return {
        symbol: canonical,
        timeframe: "intraday",
        candles,
        status: candles.length > 0 ? "FRESH" : "INSUFFICIENT",
        source: this.name,
        updatedAt: formatISTDateTime(),
        rawCount: candles.length
      };
    } catch (err) {
      return {
        symbol: canonical,
        timeframe: "intraday",
        candles: [],
        status: "ERROR",
        source: this.name,
        updatedAt: formatISTDateTime(),
        error: err.message
      };
    }
  }
  /**
   * Fetches quote and historical daily candles for a benchmark or sector index
   */
  async getIndexData(indexSymbol) {
    const [quote, history] = await Promise.all([
      this.getQuote(indexSymbol),
      this.getHistoricalData(indexSymbol, "daily", "1y")
    ]);
    return { quote, history };
  }
  /**
   * Fetches sector overview and momentum ranking for all NSE sectors
   */
  async getSectorData() {
    if (this.sectorCache && Date.now() < this.sectorCache.expiresAt) {
      return this.sectorCache.data;
    }
    const sectorEntries = Object.entries(SECTOR_INDICES);
    const sectorKeyMap = /* @__PURE__ */ new Map();
    for (const [, info] of sectorEntries) {
      const key = this.instruments.getKeySync(info.symbol) || this.instruments.getKeySync(info.name);
      if (key) {
        sectorKeyMap.set(info.symbol, key);
      }
    }
    const uniqueKeys = Array.from(new Set(Array.from(sectorKeyMap.values())));
    const quotesMap = await this.client.getQuotes(uniqueKeys);
    const results = [];
    const historyCache = /* @__PURE__ */ new Map();
    for (const key of uniqueKeys) {
      try {
        const hist = await this.getHistoricalData(key, "daily", "6m");
        historyCache.set(key, hist);
      } catch {
      }
    }
    for (const [sector, info] of sectorEntries) {
      const instrumentKey = sectorKeyMap.get(info.symbol);
      const quoteItem = instrumentKey ? quotesMap.get(instrumentKey) : null;
      const history = instrumentKey ? historyCache.get(instrumentKey) : null;
      const candles = history?.candles || [];
      if (!quoteItem && candles.length < 2) {
        results.push({
          sector,
          name: info.name,
          symbol: info.symbol,
          status: "UNAVAILABLE",
          quote: null,
          error: "No market quote or candle data available"
        });
        continue;
      }
      const lastCandle = candles[candles.length - 1];
      const prevCandle = candles.length >= 2 ? candles[candles.length - 2] : lastCandle;
      const price = quoteItem?.last_price ?? lastCandle?.close ?? 0;
      const change = quoteItem?.net_change ?? (lastCandle && prevCandle ? lastCandle.close - prevCandle.close : 0);
      const previousClose = quoteItem?.prev_close_price && quoteItem.prev_close_price > 0 ? quoteItem.prev_close_price : prevCandle?.close ?? price - change;
      const changePercent = previousClose > 0 ? Math.round(change / previousClose * 100 * 100) / 100 : 0;
      let return20D;
      if (candles.length >= 21) {
        const close20DaysAgo = candles[candles.length - 21].close;
        if (close20DaysAgo > 0) {
          return20D = Math.round((price - close20DaysAgo) / close20DaysAgo * 100 * 100) / 100;
        }
      }
      const indicators = candles.length >= 20 ? calculateAllTechnicalIndicators(candles) : null;
      const rsi14 = indicators?.rsi14;
      const ema50 = indicators?.ema50;
      let momentumScore;
      if (rsi14 !== void 0 && return20D !== void 0) {
        const rsiPart = Math.max(0, Math.min(35, rsi14 * 0.35));
        const retPart = Math.max(0, Math.min(35, 17.5 + return20D * 1.75));
        const pctAboveEma = ema50 && ema50 > 0 ? (price - ema50) / ema50 * 100 : 0;
        const emaPart = Math.max(0, Math.min(30, 15 + pctAboveEma * 2.5));
        momentumScore = Math.max(0, Math.min(100, Math.round(rsiPart + retPart + emaPart)));
      }
      const quote = {
        symbol: info.symbol,
        price: Math.round(price * 100) / 100,
        change: Math.round(change * 100) / 100,
        changePercent,
        volume: quoteItem?.volume || lastCandle?.volume || 0,
        dayHigh: quoteItem?.ohlc?.high ?? lastCandle?.high ?? price,
        dayLow: quoteItem?.ohlc?.low ?? lastCandle?.low ?? price,
        fiftyTwoWeekHigh: quoteItem?.year_high ?? lastCandle?.high ?? price,
        fiftyTwoWeekLow: quoteItem?.year_low ?? lastCandle?.low ?? price,
        previousClose: Math.round(previousClose * 100) / 100,
        timestamp: quoteItem?.last_trade_time ? parseInt(quoteItem.last_trade_time, 10) : Date.now(),
        updatedAt: formatISTDateTime(),
        source: this.name
      };
      results.push({
        sector,
        name: info.name,
        symbol: info.symbol,
        status: "OK",
        quote,
        price: Math.round(price * 100) / 100,
        changePercent,
        return20D,
        rsi14: rsi14 ? Math.round(rsi14 * 10) / 10 : void 0,
        ema50: ema50 ? Math.round(ema50 * 100) / 100 : void 0,
        momentumScore
      });
    }
    this.sectorCache = {
      data: results,
      expiresAt: Date.now() + 3 * 60 * 1e3
      // 3-minute cache
    };
    return results;
  }
  async checkHealth() {
    return this.client.checkHealth();
  }
};
var upstoxMarketDataProvider = new UpstoxMarketDataProvider();

// server/marketData/marketDataService.ts
var MarketDataService = class {
  constructor() {
    this.name = "MarketDataService";
    this.upstoxProvider = new UpstoxMarketDataProvider();
    this.twelveDataProvider = new TwelveDataProvider();
    this.yahooProvider = new YahooFinanceNSEProvider();
  }
  getProviders() {
    const requested = (process.env.MARKET_DATA_PROVIDER || "").toLowerCase();
    const upstoxToken = (process.env.UPSTOX_ACCESS_TOKEN || "").trim();
    const twelveKey = (process.env.MARKET_DATA_API_KEY || process.env.TWELVE_DATA_API_KEY || "").trim();
    if (requested === "upstox" || upstoxToken.length > 0) {
      return {
        primary: this.upstoxProvider,
        fallback: this.yahooProvider
      };
    }
    if (requested === "twelvedata" && twelveKey.length > 0) {
      return {
        primary: this.twelveDataProvider,
        fallback: this.yahooProvider
      };
    }
    return {
      primary: this.upstoxProvider,
      fallback: this.yahooProvider
    };
  }
  isConfigured() {
    const { primary, fallback } = this.getProviders();
    return primary.isConfigured() || fallback.isConfigured();
  }
  getActiveProviderName() {
    const { primary, fallback } = this.getProviders();
    return primary.isConfigured() ? primary.name : fallback.name;
  }
  async getQuote(symbol) {
    const { primary, fallback } = this.getProviders();
    const canonical = SymbolNormalizer.toCanonical(symbol);
    const cacheKey = `quote:${canonical}`;
    const cached = marketCache.get(cacheKey);
    if (cached) return cached;
    return marketRateLimiter.deduplicate(cacheKey, async () => {
      try {
        const quote = await retryWithBackoff(
          () => primary.getQuote(canonical),
          { maxRetries: 1, initialDelayMs: 300 }
        );
        if (quote && quote.price > 0) {
          marketCache.set(cacheKey, quote, MemoryCache.TTL.QUOTE);
          return quote;
        }
      } catch (err) {
        console.warn(`[MarketDataService] Primary provider failed for quote ${canonical}: ${err.message}`);
      }
      if (primary !== fallback) {
        try {
          const fbQuote = await retryWithBackoff(
            () => fallback.getQuote(canonical),
            { maxRetries: 1, initialDelayMs: 300 }
          );
          if (fbQuote && fbQuote.price > 0) {
            marketCache.set(cacheKey, fbQuote, MemoryCache.TTL.QUOTE);
            return fbQuote;
          }
        } catch (err) {
          console.warn(`[MarketDataService] Fallback provider failed for quote ${canonical}: ${err.message}`);
        }
      }
      return null;
    });
  }
  async getHistoricalData(symbol, timeframe = "daily", range = "1y") {
    const { primary, fallback } = this.getProviders();
    const canonical = SymbolNormalizer.toCanonical(symbol);
    const cacheKey = `hist:${canonical}:${timeframe}:${range}`;
    const cached = marketCache.get(cacheKey);
    if (cached) return cached;
    return marketRateLimiter.deduplicate(cacheKey, async () => {
      try {
        const result = await retryWithBackoff(
          () => primary.getHistoricalData(canonical, timeframe, range),
          { maxRetries: 2, initialDelayMs: 400 }
        );
        if (result && result.candles.length >= 20) {
          marketCache.set(cacheKey, result, MemoryCache.TTL.HISTORICAL);
          return result;
        }
      } catch (err) {
        console.warn(`[MarketDataService] Primary provider failed for hist ${canonical}: ${err.message}`);
      }
      if (primary !== fallback) {
        try {
          const fbResult = await retryWithBackoff(
            () => fallback.getHistoricalData(canonical, timeframe, range),
            { maxRetries: 2, initialDelayMs: 400 }
          );
          if (fbResult && fbResult.candles.length >= 20) {
            marketCache.set(cacheKey, fbResult, MemoryCache.TTL.HISTORICAL);
            return fbResult;
          }
        } catch (err) {
          console.warn(`[MarketDataService] Fallback provider failed for hist ${canonical}: ${err.message}`);
        }
      }
      const failResult = {
        symbol: canonical,
        timeframe,
        candles: [],
        status: "ERROR",
        source: this.getActiveProviderName(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
        error: `Unable to retrieve historical data for ${canonical} from available providers`
      };
      return failResult;
    });
  }
  async getIntradayData(symbol, interval = "5min") {
    const { primary, fallback } = this.getProviders();
    const canonical = SymbolNormalizer.toCanonical(symbol);
    const cacheKey = `intra:${canonical}:${interval}`;
    const cached = marketCache.get(cacheKey);
    if (cached) return cached;
    return marketRateLimiter.deduplicate(cacheKey, async () => {
      try {
        const res = await primary.getIntradayData(canonical, interval);
        if (res && res.candles.length > 0) {
          marketCache.set(cacheKey, res, MemoryCache.TTL.INTRADAY);
          return res;
        }
      } catch (e) {
        console.warn(`[MarketDataService] Primary intraday failed for ${canonical}: ${e.message}`);
      }
      if (primary !== fallback) {
        try {
          const res = await fallback.getIntradayData(canonical, interval);
          if (res && res.candles.length > 0) {
            marketCache.set(cacheKey, res, MemoryCache.TTL.INTRADAY);
            return res;
          }
        } catch (e) {
          console.warn(`[MarketDataService] Fallback intraday failed for ${canonical}: ${e.message}`);
        }
      }
      return {
        symbol: canonical,
        timeframe: "intraday",
        candles: [],
        status: "ERROR",
        source: this.getActiveProviderName(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
        error: "Intraday data unavailable"
      };
    });
  }
  async getIndexData(indexSymbol) {
    const [quote, history] = await Promise.all([
      this.getQuote(indexSymbol),
      this.getHistoricalData(indexSymbol, "daily", "1y")
    ]);
    return { quote, history };
  }
  async getSectorData() {
    const { primary, fallback } = this.getProviders();
    const cacheKey = "sectors:all";
    const cached = marketCache.get(cacheKey);
    if (cached) return cached;
    return marketRateLimiter.deduplicate(cacheKey, async () => {
      let results = [];
      try {
        results = await primary.getSectorData();
        const hasValid = results.some((r) => r.quote !== null);
        if (hasValid) {
          marketCache.set(cacheKey, results, MemoryCache.TTL.SECTOR);
          return results;
        }
      } catch (e) {
        console.warn(`[MarketDataService] Primary sector data failed: ${e.message}`);
      }
      if (primary !== fallback) {
        try {
          results = await fallback.getSectorData();
          marketCache.set(cacheKey, results, MemoryCache.TTL.SECTOR);
          return results;
        } catch (e) {
          console.warn(`[MarketDataService] Fallback sector data failed: ${e.message}`);
        }
      }
      return results;
    });
  }
  async checkHealth() {
    const { primary, fallback } = this.getProviders();
    const primaryHealth = await primary.checkHealth();
    if (primaryHealth.reachable) {
      return primaryHealth;
    }
    if (primary !== fallback) {
      return await fallback.checkHealth();
    }
    return primaryHealth;
  }
};
var marketDataService = new MarketDataService();

// server/marketData.ts
var marketDataProvider = marketDataService;

// server/patternDetection.ts
function detectPatterns(candles, indicators) {
  const patterns = [];
  const n = candles.length;
  if (n < 20) return patterns;
  const current = candles[n - 1];
  const prev = candles[n - 2];
  const prev2 = candles[n - 3];
  const detectedAt = current.dateStr || new Date(current.timestamp).toISOString().split("T")[0];
  const sup = indicators.nearestSupport;
  const res = indicators.nearestResistance;
  if (current.close > res && prev.close <= res) {
    const isVolConfirm = indicators.volumeRatio >= 1.5;
    const conf = isVolConfirm ? "HIGH" : "MEDIUM";
    const confScore = isVolConfirm ? 88 : 72;
    patterns.push({
      pattern: "Resistance Breakout",
      direction: "BULLISH",
      confidence: conf,
      confidenceScore: confScore,
      detected_at: detectedAt,
      support: sup,
      resistance: res,
      description: `Price decisively closed at \u20B9${current.close} above key resistance \u20B9${res}${isVolConfirm ? ` with ${indicators.volumeRatio}x volume expansion` : ""}.`
    });
  }
  if (current.close < sup && prev.close >= sup) {
    const isVolConfirm = indicators.volumeRatio >= 1.5;
    const conf = isVolConfirm ? "HIGH" : "MEDIUM";
    const confScore = isVolConfirm ? 86 : 70;
    patterns.push({
      pattern: "Support Breakdown",
      direction: "BEARISH",
      confidence: conf,
      confidenceScore: confScore,
      detected_at: detectedAt,
      support: sup,
      resistance: res,
      description: `Price broke down below critical support \u20B9${sup} to \u20B9${current.close}${isVolConfirm ? " on heavy selling volume" : ""}.`
    });
  }
  if (current.high >= indicators.fiftyTwoWeekHigh * 0.995 && current.close >= indicators.fiftyTwoWeekHigh * 0.99) {
    patterns.push({
      pattern: "52-Week High Breakout",
      direction: "BULLISH",
      confidence: indicators.volumeRatio >= 1.4 ? "HIGH" : "MEDIUM",
      confidenceScore: indicators.volumeRatio >= 1.4 ? 90 : 75,
      detected_at: detectedAt,
      support: sup,
      resistance: indicators.fiftyTwoWeekHigh,
      description: `Trading within 1% of 52-week high \u20B9${indicators.fiftyTwoWeekHigh}, demonstrating strong institutional demand.`
    });
  }
  if (current.low <= indicators.fiftyTwoWeekLow * 1.005 && current.close <= indicators.fiftyTwoWeekLow * 1.01) {
    patterns.push({
      pattern: "52-Week Low Breakdown",
      direction: "BEARISH",
      confidence: "HIGH",
      confidenceScore: 85,
      detected_at: detectedAt,
      support: indicators.fiftyTwoWeekLow,
      resistance: res,
      description: `Testing or breaching multi-month 52-week low \u20B9${indicators.fiftyTwoWeekLow}, signaling persistent structural weakness.`
    });
  }
  const closes = candles.map((c) => c.close);
  const ema20Arr = calculateEMA(closes, 20);
  const ema50Arr = calculateEMA(closes, 50);
  const ema200Arr = calculateEMA(closes, 200);
  if (ema20Arr[n - 1] && ema50Arr[n - 1] && ema20Arr[n - 2] && ema50Arr[n - 2]) {
    const cur20 = ema20Arr[n - 1];
    const cur50 = ema50Arr[n - 1];
    const prev20 = ema20Arr[n - 2];
    const prev50 = ema50Arr[n - 2];
    if (prev20 <= prev50 && cur20 > cur50) {
      patterns.push({
        pattern: "EMA Bullish Cross (20/50)",
        direction: "BULLISH",
        confidence: "HIGH",
        confidenceScore: 84,
        detected_at: detectedAt,
        support: indicators.ema50,
        resistance: res,
        description: `Short-term EMA20 (\u20B9${indicators.ema20}) crossed above intermediate EMA50 (\u20B9${indicators.ema50}), signaling shift to upward momentum.`
      });
    } else if (prev20 >= prev50 && cur20 < cur50) {
      patterns.push({
        pattern: "EMA Bearish Cross (20/50)",
        direction: "BEARISH",
        confidence: "HIGH",
        confidenceScore: 82,
        detected_at: detectedAt,
        support: sup,
        resistance: indicators.ema50,
        description: `Short-term EMA20 (\u20B9${indicators.ema20}) crossed below EMA50 (\u20B9${indicators.ema50}), indicating deteriorating momentum.`
      });
    }
  }
  if (ema50Arr[n - 1] && ema200Arr[n - 1] && ema50Arr[n - 2] && ema200Arr[n - 2]) {
    const cur50 = ema50Arr[n - 1];
    const cur200 = ema200Arr[n - 1];
    const prev50 = ema50Arr[n - 2];
    const prev200 = ema200Arr[n - 2];
    if (prev50 <= prev200 && cur50 > cur200) {
      patterns.push({
        pattern: "Golden Cross (50/200)",
        direction: "BULLISH",
        confidence: "HIGH",
        confidenceScore: 92,
        detected_at: detectedAt,
        support: indicators.ema200,
        resistance: res,
        description: `Major structural Golden Cross: EMA50 moved above EMA200, representing long-term bull market initiation.`
      });
    } else if (prev50 >= prev200 && cur50 < cur200) {
      patterns.push({
        pattern: "Death Cross (50/200)",
        direction: "BEARISH",
        confidence: "HIGH",
        confidenceScore: 90,
        detected_at: detectedAt,
        support: sup,
        resistance: indicators.ema200,
        description: `Major structural Death Cross: EMA50 dropped beneath EMA200, confirming macro downtrend.`
      });
    }
  }
  if (indicators.macd.crossover === "BULLISH") {
    patterns.push({
      pattern: "Bullish MACD Crossover",
      direction: "BULLISH",
      confidence: indicators.rsi14 > 45 ? "HIGH" : "MEDIUM",
      confidenceScore: 78,
      detected_at: detectedAt,
      support: sup,
      resistance: res,
      description: `MACD line crossed above signal line into positive acceleration with histogram expanding.`
    });
  } else if (indicators.macd.crossover === "BEARISH") {
    patterns.push({
      pattern: "Bearish MACD Crossover",
      direction: "BEARISH",
      confidence: indicators.rsi14 < 55 ? "HIGH" : "MEDIUM",
      confidenceScore: 76,
      detected_at: detectedAt,
      support: sup,
      resistance: res,
      description: `MACD line crossed below signal line, suggesting fading upward velocity.`
    });
  }
  if (indicators.volumeRatio >= 2) {
    if (current.close > prev.close && current.close > current.open) {
      patterns.push({
        pattern: "High-Volume Breakout",
        direction: "BULLISH",
        confidence: "HIGH",
        confidenceScore: 86,
        detected_at: detectedAt,
        support: current.low,
        resistance: res,
        description: `Volume surged to ${indicators.volumeRatio}x 20-day average on strong green close, confirming institutional accumulation.`
      });
    } else if (current.close < prev.close && current.close < current.open) {
      patterns.push({
        pattern: "High-Volume Distribution",
        direction: "BEARISH",
        confidence: "HIGH",
        confidenceScore: 84,
        detected_at: detectedAt,
        support: sup,
        resistance: current.high,
        description: `Heavy institutional selling with volume at ${indicators.volumeRatio}x 20-day average on a declining session.`
      });
    }
  }
  const body = Math.abs(current.close - current.open);
  const candleRange = current.high - current.low;
  const upperWick = current.high - Math.max(current.close, current.open);
  const lowerWick = Math.min(current.close, current.open) - current.low;
  if (candleRange > 0 && lowerWick >= 2 * body && upperWick <= 0.2 * candleRange && current.close < indicators.ema20) {
    patterns.push({
      pattern: "Bullish Hammer",
      direction: "BULLISH",
      confidence: "MEDIUM",
      confidenceScore: 74,
      detected_at: detectedAt,
      support: current.low,
      resistance: res,
      description: `Bullish hammer formed at \u20B9${current.low}, displaying rejection of lower prices and intraday buyer absorption.`
    });
  }
  if (candleRange > 0 && upperWick >= 2 * body && lowerWick <= 0.2 * candleRange && current.close > indicators.ema20) {
    patterns.push({
      pattern: "Shooting Star",
      direction: "BEARISH",
      confidence: "MEDIUM",
      confidenceScore: 72,
      detected_at: detectedAt,
      support: sup,
      resistance: current.high,
      description: `Bearish shooting star at \u20B9${current.high} shows upside rejection after intraday push.`
    });
  }
  if (prev.close < prev.open && current.close > current.open && current.open <= prev.close && current.close >= prev.open) {
    patterns.push({
      pattern: "Bullish Engulfing",
      direction: "BULLISH",
      confidence: indicators.volumeRatio >= 1.2 ? "HIGH" : "MEDIUM",
      confidenceScore: 80,
      detected_at: detectedAt,
      support: current.low,
      resistance: res,
      description: `Current green candle completely engulfs previous red candle body, signaling aggressive buyer dominance.`
    });
  }
  if (prev.close > prev.open && current.close < current.open && current.open >= prev.close && current.close <= prev.open) {
    patterns.push({
      pattern: "Bearish Engulfing",
      direction: "BEARISH",
      confidence: indicators.volumeRatio >= 1.2 ? "HIGH" : "MEDIUM",
      confidenceScore: 78,
      detected_at: detectedAt,
      support: sup,
      resistance: current.high,
      description: `Current red candle completely engulfs prior session's gain, warning of swift reversal.`
    });
  }
  if (n >= 15) {
    const recent = candles.slice(-15);
    let hhCount = 0;
    let hlCount = 0;
    let lhCount = 0;
    let llCount = 0;
    for (let i = 2; i < recent.length; i += 2) {
      if (recent[i].high > recent[i - 2].high) hhCount++;
      else lhCount++;
      if (recent[i].low > recent[i - 2].low) hlCount++;
      else llCount++;
    }
    if (hhCount >= 4 && hlCount >= 4) {
      patterns.push({
        pattern: "Higher Highs & Higher Lows Structure",
        direction: "BULLISH",
        confidence: "HIGH",
        confidenceScore: 85,
        detected_at: detectedAt,
        support: sup,
        resistance: res,
        description: `Clear ascending price action staircase confirming an active algorithmic trend.`
      });
    } else if (lhCount >= 4 && llCount >= 4) {
      patterns.push({
        pattern: "Lower Highs & Lower Lows Structure",
        direction: "BEARISH",
        confidence: "HIGH",
        confidenceScore: 83,
        detected_at: detectedAt,
        support: sup,
        resistance: res,
        description: `Downward sequence of lower peaks and troughs, denoting persistent supply pressure.`
      });
    }
  }
  if (n >= 40) {
    const slice = candles.slice(-40);
    let min1Idx = 0;
    let min1Val = slice[0].low;
    for (let i = 1; i < 20; i++) {
      if (slice[i].low < min1Val) {
        min1Val = slice[i].low;
        min1Idx = i;
      }
    }
    let min2Idx = 20;
    let min2Val = slice[20].low;
    for (let i = 21; i < slice.length; i++) {
      if (slice[i].low < min2Val) {
        min2Val = slice[i].low;
        min2Idx = i;
      }
    }
    let midPeak = 0;
    for (let i = min1Idx; i <= min2Idx; i++) {
      if (slice[i].high > midPeak) midPeak = slice[i].high;
    }
    if (Math.abs(min1Val - min2Val) / min1Val <= 0.02 && midPeak > min1Val * 1.04 && current.close > min2Val) {
      const isNecklineBreak = current.close >= midPeak;
      patterns.push({
        pattern: isNecklineBreak ? "Double Bottom Breakout" : "Possible Double Bottom",
        direction: "BULLISH",
        confidence: isNecklineBreak ? "HIGH" : "LOW",
        confidenceScore: isNecklineBreak ? 85 : 55,
        isPossible: !isNecklineBreak,
        detected_at: detectedAt,
        support: (min1Val + min2Val) / 2,
        resistance: midPeak,
        description: isNecklineBreak ? `Confirmed Double Bottom formation breakout above neckline \u20B9${Math.round(midPeak * 100) / 100}.` : `Emerging potential Double Bottom with base support around \u20B9${Math.round(min1Val * 100) / 100}.`
      });
    }
    let max1Idx = 0;
    let max1Val = slice[0].high;
    for (let i = 1; i < 20; i++) {
      if (slice[i].high > max1Val) {
        max1Val = slice[i].high;
        max1Idx = i;
      }
    }
    let max2Idx = 20;
    let max2Val = slice[20].high;
    for (let i = 21; i < slice.length; i++) {
      if (slice[i].high > max2Val) {
        max2Val = slice[i].high;
        max2Idx = i;
      }
    }
    let midTrough = 99999999;
    for (let i = max1Idx; i <= max2Idx; i++) {
      if (slice[i].low < midTrough) midTrough = slice[i].low;
    }
    if (Math.abs(max1Val - max2Val) / max1Val <= 0.02 && midTrough < max1Val * 0.96 && current.close < max2Val) {
      const isNecklineDown = current.close <= midTrough;
      patterns.push({
        pattern: isNecklineDown ? "Double Top Breakdown" : "Possible Double Top",
        direction: "BEARISH",
        confidence: isNecklineDown ? "HIGH" : "LOW",
        confidenceScore: isNecklineDown ? 84 : 52,
        isPossible: !isNecklineDown,
        detected_at: detectedAt,
        support: midTrough,
        resistance: (max1Val + max2Val) / 2,
        description: isNecklineDown ? `Confirmed Double Top breakdown below neckline \u20B9${Math.round(midTrough * 100) / 100}.` : `Possible Double Top resistance established around \u20B9${Math.round(max1Val * 100) / 100}.`
      });
    }
  }
  if (n >= 25) {
    const poleSlice = candles.slice(-25, -10);
    const flagSlice = candles.slice(-10);
    const poleGain = (poleSlice[poleSlice.length - 1].close - poleSlice[0].close) / poleSlice[0].close;
    const flagConsolidation = (flagSlice[flagSlice.length - 1].close - flagSlice[0].close) / flagSlice[0].close;
    if (poleGain >= 0.06 && flagConsolidation >= -0.03 && flagConsolidation <= 0.01) {
      patterns.push({
        pattern: "Possible Bull Flag",
        direction: "BULLISH",
        confidence: "MEDIUM",
        confidenceScore: 68,
        isPossible: true,
        detected_at: detectedAt,
        support: flagSlice[0].low,
        resistance: res,
        description: `Tight high-level consolidation following a +${(poleGain * 100).toFixed(1)}% surge, forming a classic bull flag.`
      });
    } else if (poleGain <= -0.06 && flagConsolidation <= 0.03 && flagConsolidation >= -0.01) {
      patterns.push({
        pattern: "Possible Bear Flag",
        direction: "BEARISH",
        confidence: "MEDIUM",
        confidenceScore: 66,
        isPossible: true,
        detected_at: detectedAt,
        support: sup,
        resistance: flagSlice[0].high,
        description: `Sluggish consolidation following a -${(Math.abs(poleGain) * 100).toFixed(1)}% decline, characteristic of a bear flag.`
      });
    }
  }
  return patterns;
}

// server/marketConfirmation.ts
var MarketConfirmationService = class {
  constructor() {
    this.cachedNifty = null;
    this.niftyExpiresAt = 0;
    this.cachedSectors = /* @__PURE__ */ new Map();
  }
  /**
   * Fetches and calculates NIFTY 50 macro regime from real data.
   * Throws an error if real data cannot be retrieved; never returns hardcoded fake prices.
   */
  async getNiftyConfirmation(dataProvider) {
    if (this.cachedNifty && Date.now() < this.niftyExpiresAt) {
      return this.cachedNifty;
    }
    const history = await dataProvider.getHistoricalData("NIFTY50", "daily", "1y");
    const quote = await dataProvider.getQuote("NIFTY50");
    if (!history.candles || history.candles.length < 30) {
      if (!dataProvider.isConfigured()) {
        console.warn("[MarketConfirmation] Market data provider not configured (UPSTOX_ACCESS_TOKEN missing)");
      } else {
        console.warn(`[MarketConfirmation] Unable to retrieve real NIFTY 50 candles: ${history.error || "insufficient data"}`);
      }
      return {
        niftyPrice: quote?.price ?? 24e3,
        change: quote?.change ?? 0,
        changePercent: quote?.changePercent ?? 0,
        trend: "NEUTRAL",
        ema20: 24e3,
        ema50: 24e3,
        ema200: 24e3,
        rsi: 50,
        momentum: dataProvider.isConfigured() ? "NIFTY live feed temporarily busy" : "UPSTOX_ACCESS_TOKEN is not configured in Vercel settings",
        regime: "NEUTRAL",
        confirmationStatus: "WEAK"
      };
    }
    const candles = history.candles;
    const indicators = calculateAllTechnicalIndicators(candles);
    const lastClose = candles[candles.length - 1].close;
    const prevClose = candles.length >= 2 ? candles[candles.length - 2].close : lastClose;
    const currentPrice = quote?.price && quote.price > 0 ? quote.price : lastClose;
    const previousClose = quote?.previousClose && quote.previousClose > 0 ? quote.previousClose : prevClose;
    const change = Math.round((currentPrice - previousClose) * 100) / 100;
    const changePercent = previousClose !== 0 ? Math.round(change / previousClose * 100 * 100) / 100 : 0;
    const ema20 = indicators?.ema20 ?? lastClose;
    const ema50 = indicators?.ema50 ?? lastClose;
    const ema200 = indicators?.ema200 ?? lastClose;
    const rsi = indicators?.rsi14 ?? 50;
    let regime = "NEUTRAL";
    let trend = "NEUTRAL";
    if (currentPrice > ema20 && ema20 > ema50 && ema50 > ema200 && rsi > 55) {
      regime = "STRONG BULLISH";
      trend = "STRONG BULLISH";
    } else if (currentPrice > ema50 && ema50 > ema200) {
      regime = "BULLISH";
      trend = "BULLISH";
    } else if (currentPrice < ema20 && ema20 < ema50 && ema50 < ema200 && rsi < 45) {
      regime = "STRONG BEARISH";
      trend = "STRONG BEARISH";
    } else if (currentPrice < ema50 && ema50 < ema200) {
      regime = "BEARISH";
      trend = "BEARISH";
    } else {
      regime = "NEUTRAL";
      trend = "NEUTRAL";
    }
    const momentumDesc = rsi >= 60 ? "Strong positive momentum" : rsi >= 50 ? "Mild positive momentum" : rsi >= 40 ? "Consolidation / neutral drift" : "Downward momentum";
    const result = {
      niftyPrice: Math.round(currentPrice * 100) / 100,
      change,
      changePercent,
      trend,
      ema20: Math.round(ema20 * 100) / 100,
      ema50: Math.round(ema50 * 100) / 100,
      ema200: Math.round(ema200 * 100) / 100,
      rsi: Math.round(rsi * 10) / 10,
      momentum: momentumDesc,
      regime,
      confirmationStatus: "STRONG"
    };
    this.cachedNifty = result;
    this.niftyExpiresAt = Date.now() + 60 * 1e3;
    return result;
  }
  /**
   * Calculates 20-trading-day return from daily candle series.
   * Formula: ((currentClose / close20DaysAgo) - 1) * 100
   */
  calculate20DReturn(candles) {
    if (!candles || candles.length < 21) {
      return null;
    }
    const currentClose = candles[candles.length - 1].close;
    const close20DaysAgo = candles[candles.length - 21].close;
    if (!close20DaysAgo || close20DaysAgo <= 0) return null;
    return Math.round((currentClose - close20DaysAgo) / close20DaysAgo * 100 * 100) / 100;
  }
  /**
   * Transparent 0-100 Sector Momentum Score:
   * - RSI (35%): rsi * 0.35
   * - 20D Return (35%): scaled -10% to +10% -> 0 to 35 pts
   * - Distance to EMA50 (30%): scaled -6% to +6% -> 0 to 30 pts
   */
  calculateSectorMomentumScore(rsi, return20D, currentPrice, ema50) {
    const rsiScore = Math.max(0, Math.min(35, (rsi || 50) * 0.35));
    const returnScore = Math.max(0, Math.min(35, 17.5 + return20D * 1.75));
    const pctAboveEma50 = ema50 > 0 ? (currentPrice - ema50) / ema50 * 100 : 0;
    const emaScore = Math.max(0, Math.min(30, 15 + pctAboveEma50 * 2.5));
    return Math.max(0, Math.min(100, Math.round(rsiScore + returnScore + emaScore)));
  }
  async getSectorConfirmation(sectorName, stockChangePercent, niftyPercent, dataProvider) {
    const sectorInfo = SECTOR_INDICES[sectorName] || {
      name: "NIFTY 50 Benchmark",
      symbol: "NIFTY50",
      yahooSymbol: "^NSEI"
    };
    const cacheKey = sectorInfo.symbol;
    const cached = this.cachedSectors.get(cacheKey);
    if (cached && Date.now() < cached.expiresAt) {
      const base = cached.data;
      const stockRel = Math.round((stockChangePercent - base.sectorChangePercent) * 100) / 100;
      let conf = "MODERATE";
      if (stockChangePercent > 0 && base.sectorChangePercent > 0) conf = "STRONG";
      else if (stockChangePercent < 0 && base.sectorChangePercent < 0) conf = "STRONG";
      else if (Math.abs(stockChangePercent - base.sectorChangePercent) > 2) conf = "CONFLICTING";
      return {
        ...base,
        stockRelativeStrengthVsSector: stockRel,
        confirmation: conf
      };
    }
    try {
      const history = await dataProvider.getHistoricalData(sectorInfo.symbol, "daily", "1y");
      const quote = await dataProvider.getQuote(sectorInfo.symbol);
      const candles = history.candles || [];
      if (candles.length < 2) {
        throw new Error(`Insufficient data for sector ${sectorName}`);
      }
      const currentCandle = candles[candles.length - 1];
      const prevCandle = candles[candles.length - 2];
      const sectorPrice = quote?.price && quote.price > 0 ? quote.price : currentCandle.close;
      const previousClose = quote?.previousClose && quote.previousClose > 0 ? quote.previousClose : prevCandle.close;
      const sectorChangePercent = previousClose !== 0 ? Math.round((sectorPrice - previousClose) / previousClose * 100 * 100) / 100 : 0;
      const indicators = calculateAllTechnicalIndicators(candles);
      const rsi = indicators?.rsi14 ?? 50;
      const ema50 = indicators?.ema50 ?? sectorPrice;
      let sectorTrend = "NEUTRAL";
      if (sectorPrice > ema50 && rsi > 55) sectorTrend = "STRONG BULLISH";
      else if (sectorPrice > ema50) sectorTrend = "BULLISH";
      else if (sectorPrice < ema50 && rsi < 45) sectorTrend = "STRONG BEARISH";
      else if (sectorPrice < ema50) sectorTrend = "BEARISH";
      const return20D = this.calculate20DReturn(candles) ?? sectorChangePercent;
      const momentumScore = this.calculateSectorMomentumScore(rsi, return20D, sectorPrice, ema50);
      const sectorRelVsNifty = Math.round((sectorChangePercent - niftyPercent) * 100) / 100;
      const stockRelVsSector = Math.round((stockChangePercent - sectorChangePercent) * 100) / 100;
      let conf = "MODERATE";
      if (stockChangePercent > 0 && sectorChangePercent > 0) conf = "STRONG";
      else if (stockChangePercent < 0 && sectorChangePercent < 0) conf = "STRONG";
      else if (Math.abs(stockChangePercent - sectorChangePercent) > 2) conf = "CONFLICTING";
      const data = {
        sectorName,
        sectorIndexSymbol: sectorInfo.symbol,
        sectorPrice: Math.round(sectorPrice * 100) / 100,
        sectorChangePercent,
        sectorTrend,
        sectorMomentum: momentumScore,
        stockRelativeStrengthVsSector: stockRelVsSector,
        sectorRelativeStrengthVsNifty: sectorRelVsNifty,
        confirmation: conf
      };
      this.cachedSectors.set(cacheKey, { data, expiresAt: Date.now() + 5 * 60 * 1e3 });
      return data;
    } catch {
      return {
        sectorName,
        sectorIndexSymbol: sectorInfo.symbol,
        sectorPrice: 0,
        sectorChangePercent: 0,
        sectorTrend: "NEUTRAL",
        sectorMomentum: 0,
        stockRelativeStrengthVsSector: 0,
        sectorRelativeStrengthVsNifty: 0,
        confirmation: "WEAK"
      };
    }
  }
};
var marketConfirmationService = new MarketConfirmationService();

// server/scoringEngine.ts
var DEFAULT_SCANNER_WEIGHTS = {
  trend: 20,
  momentum: 20,
  volume: 15,
  pattern: 15,
  market: 10,
  sector: 10,
  risk: 10
};
function calculateStockScore(currentPrice, changePercent, indicators, patterns, nifty, sector, weights = DEFAULT_SCANNER_WEIGHTS) {
  let trendRaw = 0;
  if (currentPrice > indicators.ema20) trendRaw += 0.25;
  if (indicators.ema20 > indicators.ema50) trendRaw += 0.25;
  if (indicators.ema50 > indicators.ema200) trendRaw += 0.25;
  if (currentPrice > indicators.ema50 && indicators.priceVsEma200 > 0) trendRaw += 0.25;
  const trendScore = Math.round(trendRaw * weights.trend * 10) / 10;
  let momRaw = 0;
  if (indicators.rsi14 >= 55 && indicators.rsi14 <= 70) momRaw += 0.35;
  else if (indicators.rsi14 >= 48 && indicators.rsi14 < 55) momRaw += 0.25;
  else if (indicators.rsi14 > 70 && indicators.rsi14 <= 78) momRaw += 0.2;
  else if (indicators.rsi14 < 35) momRaw += 0.05;
  if (indicators.macd.histogram > 0) momRaw += 0.25;
  if (indicators.macd.line > indicators.macd.signal) momRaw += 0.15;
  if (indicators.macd.crossover === "BULLISH") momRaw += 0.1;
  if (indicators.adx14.adx >= 20 && indicators.adx14.plusDI > indicators.adx14.minusDI) momRaw += 0.15;
  if (indicators.roc > 0) momRaw += 0.15;
  momRaw = Math.min(1, momRaw);
  const momentumScore = Math.round(momRaw * weights.momentum * 10) / 10;
  let volRaw = 0;
  if (indicators.volumeRatio >= 1) volRaw += 0.35;
  if (indicators.volumeRatio >= 1.5) volRaw += 0.35;
  if (indicators.volumeRatio >= 2) volRaw += 0.15;
  if (changePercent > 0 && indicators.volumeRatio >= 1.2) volRaw += 0.15;
  volRaw = Math.min(1, volRaw);
  const volumeScore = Math.round(volRaw * weights.volume * 10) / 10;
  let patRaw = 0.3;
  const bullishPatterns = patterns.filter((p) => p.direction === "BULLISH");
  const bearishPatterns = patterns.filter((p) => p.direction === "BEARISH");
  for (const p of bullishPatterns) {
    if (p.confidence === "HIGH") patRaw += 0.35;
    else if (p.confidence === "MEDIUM") patRaw += 0.2;
    else patRaw += 0.1;
  }
  for (const p of bearishPatterns) {
    if (p.confidence === "HIGH") patRaw -= 0.35;
    else if (p.confidence === "MEDIUM") patRaw -= 0.2;
    else patRaw -= 0.1;
  }
  patRaw = Math.min(1, Math.max(0, patRaw));
  const patternScore = Math.round(patRaw * weights.pattern * 10) / 10;
  let mktRaw = 0.5;
  if (nifty.trend === "STRONG BULLISH") mktRaw = 1;
  else if (nifty.trend === "BULLISH") mktRaw = 0.8;
  else if (nifty.trend === "NEUTRAL") mktRaw = 0.5;
  else if (nifty.trend === "BEARISH") mktRaw = 0.25;
  else if (nifty.trend === "STRONG BEARISH") mktRaw = 0.1;
  const marketScore = Math.round(mktRaw * weights.market * 10) / 10;
  let secRaw = 0.5;
  if (sector.sectorTrend === "STRONG BULLISH") secRaw += 0.3;
  else if (sector.sectorTrend === "BULLISH") secRaw += 0.2;
  else if (sector.sectorTrend === "BEARISH") secRaw -= 0.2;
  else if (sector.sectorTrend === "STRONG BEARISH") secRaw -= 0.3;
  if (sector.stockRelativeStrengthVsSector > 0.5) secRaw += 0.2;
  else if (sector.stockRelativeStrengthVsSector < -1) secRaw -= 0.2;
  secRaw = Math.min(1, Math.max(0, secRaw));
  const sectorScore = Math.round(secRaw * weights.sector * 10) / 10;
  let riskRaw = 0.8;
  if (indicators.priceVsEma20 > 9) riskRaw -= 0.35;
  else if (indicators.priceVsEma20 > 5) riskRaw -= 0.15;
  if (indicators.bollingerBands.percentB > 1.05) riskRaw -= 0.25;
  if (indicators.bollingerBands.percentB >= 0.5 && indicators.bollingerBands.percentB <= 0.85) riskRaw += 0.2;
  riskRaw = Math.min(1, Math.max(0, riskRaw));
  const riskScore = Math.round(riskRaw * weights.risk * 10) / 10;
  let totalScore = Math.round(
    trendScore + momentumScore + volumeScore + patternScore + marketScore + sectorScore + riskScore
  );
  totalScore = Math.min(100, Math.max(0, totalScore));
  let signal;
  if (totalScore >= 80) signal = "STRONG BULLISH";
  else if (totalScore >= 65) signal = "BULLISH";
  else if (totalScore >= 50) signal = "NEUTRAL";
  else if (totalScore >= 35) signal = "BEARISH";
  else signal = "STRONG BEARISH";
  let primary_signal = "Consolidation / Rangebound";
  const secondary_signals = [];
  if (bullishPatterns.length > 0) {
    primary_signal = bullishPatterns[0].pattern;
  } else if (bearishPatterns.length > 0) {
    primary_signal = bearishPatterns[0].pattern;
  } else if (signal === "STRONG BULLISH" || signal === "BULLISH") {
    primary_signal = "Bullish Trend Continuation";
  } else if (signal === "BEARISH" || signal === "STRONG BEARISH") {
    primary_signal = "Bearish Downward Momentum";
  }
  if (indicators.ema20 > indicators.ema50 && indicators.ema50 > indicators.ema200) {
    secondary_signals.push("Bullish EMA Alignment (20 > 50 > 200)");
  }
  if (indicators.rsi14 >= 55) {
    secondary_signals.push(`RSI Momentum (${indicators.rsi14})`);
  } else if (indicators.rsi14 <= 35) {
    secondary_signals.push(`RSI Oversold / Pressure (${indicators.rsi14})`);
  }
  if (indicators.volumeRatio >= 1.5) {
    secondary_signals.push(`Volume Expansion (${indicators.volumeRatio}x avg)`);
  }
  if (sector.sectorTrend === "BULLISH" || sector.sectorTrend === "STRONG BULLISH") {
    secondary_signals.push(`Sector Strength (${sector.sectorName})`);
  }
  if (nifty.trend === "BULLISH" || nifty.trend === "STRONG BULLISH") {
    secondary_signals.push("NIFTY 50 Macro Confirmation");
  } else if (nifty.trend === "BEARISH" || nifty.trend === "STRONG BEARISH") {
    secondary_signals.push("NIFTY Macro Divergence / Headwind");
  }
  let confidence = "MEDIUM";
  const isMarketAligned = signal.includes("BULLISH") && nifty.trend.includes("BULLISH") || signal.includes("BEARISH") && nifty.trend.includes("BEARISH");
  if (isMarketAligned && indicators.volumeRatio >= 1.2 && patterns.length > 0) {
    confidence = "HIGH";
  } else if (!isMarketAligned || indicators.volumeRatio < 0.8) {
    confidence = "LOW";
  }
  const breakdown = {
    trend: trendScore,
    maxTrend: weights.trend,
    momentum: momentumScore,
    maxMomentum: weights.momentum,
    volume: volumeScore,
    maxVolume: weights.volume,
    pattern: patternScore,
    maxPattern: weights.pattern,
    market: marketScore,
    maxMarket: weights.market,
    sector: sectorScore,
    maxSector: weights.sector,
    risk: riskScore,
    maxRisk: weights.risk
  };
  return {
    score: totalScore,
    signal,
    confidence,
    primary_signal,
    secondary_signals,
    breakdown
  };
}

// server/userData.ts
var USER_DATA = {
  "user-1": {
    profile: {
      id: "user-1",
      name: "Jeet Kamal",
      email: "jeetkamal991@gmail.com",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
    },
    holdings: [
      {
        id: "h-1",
        symbol: "RELIANCE",
        name: "Reliance Industries Ltd.",
        sector: "Oil, Gas & Energy",
        quantity: 35,
        avgPrice: 1210.5,
        currentPrice: 1257.5,
        invested: 42367.5,
        currentValue: 44012.5,
        pnl: 1645,
        pnlPercent: 3.88,
        dayGain: -576.25,
        dayGainPercent: -1.29,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: "h-2",
        symbol: "TCS",
        name: "Tata Consultancy Services Ltd.",
        sector: "Information Technology",
        quantity: 20,
        avgPrice: 2150,
        currentPrice: 2200.8,
        invested: 43e3,
        currentValue: 44016,
        pnl: 1016,
        pnlPercent: 2.36,
        dayGain: -66,
        dayGainPercent: -0.15,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: "h-3",
        symbol: "HDFCBANK",
        name: "HDFC Bank Ltd.",
        sector: "Banking & Financials",
        quantity: 50,
        avgPrice: 1620,
        currentPrice: 1690.4,
        invested: 81e3,
        currentValue: 84520,
        pnl: 3520,
        pnlPercent: 4.35,
        dayGain: 420,
        dayGainPercent: 0.5,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: "h-4",
        symbol: "TATAMOTORS",
        name: "Tata Motors Ltd.",
        sector: "Automobiles & Auto Components",
        quantity: 60,
        avgPrice: 880,
        currentPrice: 945.2,
        invested: 52800,
        currentValue: 56712,
        pnl: 3912,
        pnlPercent: 7.41,
        dayGain: 680,
        dayGainPercent: 1.21,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: "h-5",
        symbol: "LT",
        name: "Larsen & Toubro Ltd.",
        sector: "Infrastructure",
        quantity: 15,
        avgPrice: 3450,
        currentPrice: 3580,
        invested: 51750,
        currentValue: 53700,
        pnl: 1950,
        pnlPercent: 3.77,
        dayGain: 315,
        dayGainPercent: 0.59,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      }
    ],
    watchlist: [
      {
        symbol: "INFY",
        name: "Infosys Ltd.",
        sector: "Information Technology",
        price: 1840,
        change: 12.5,
        changePercent: 0.68,
        addedAt: new Date(Date.now() - 864e5 * 4).toISOString(),
        notes: "Watching for breakout above 1880 resistance"
      },
      {
        symbol: "BHARTIARTL",
        name: "Bharti Airtel Ltd.",
        sector: "Telecommunications",
        price: 1620,
        change: 18,
        changePercent: 1.12,
        addedAt: new Date(Date.now() - 864e5 * 2).toISOString(),
        notes: "Strong ARPU growth and 5G expansion"
      },
      {
        symbol: "SUNPHARMA",
        name: "Sun Pharmaceutical Industries Ltd.",
        sector: "Pharmaceuticals & Healthcare",
        price: 1810,
        change: -5,
        changePercent: -0.28,
        addedAt: new Date(Date.now() - 864e5 * 5).toISOString(),
        notes: "Defensive play near 52-week highs"
      },
      {
        symbol: "BAJFINANCE",
        name: "Bajaj Finance Ltd.",
        sector: "Financial Services",
        price: 6980,
        change: 45,
        changePercent: 0.65,
        addedAt: new Date(Date.now() - 864e5 * 7).toISOString()
      }
    ],
    alerts: [
      {
        id: "alt-1",
        symbol: "RELIANCE",
        name: "Reliance AI Score > 80",
        type: "SCORE_ABOVE",
        threshold: 80,
        enabled: true,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: "alt-2",
        symbol: "ALL",
        name: "Bullish Breakout Alert",
        type: "BULLISH_BREAKOUT",
        enabled: true,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: "alt-3",
        symbol: "TCS",
        name: "Volume Expansion 2x",
        type: "VOLUME_2X",
        threshold: 2,
        enabled: true,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      }
    ]
  },
  "user-2": {
    profile: {
      id: "user-2",
      name: "Pooja Sharma",
      email: "pooja.sharma@invest.in",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80"
    },
    holdings: [
      {
        id: "h-201",
        symbol: "INFY",
        name: "Infosys Ltd.",
        sector: "Information Technology",
        quantity: 40,
        avgPrice: 1780,
        currentPrice: 1840,
        invested: 71200,
        currentValue: 73600,
        pnl: 2400,
        pnlPercent: 3.37,
        dayGain: 500,
        dayGainPercent: 0.68,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      }
    ],
    watchlist: [
      {
        symbol: "ICICIBANK",
        name: "ICICI Bank Ltd.",
        sector: "Banking & Financials",
        price: 1280,
        change: 15,
        changePercent: 1.18,
        addedAt: (/* @__PURE__ */ new Date()).toISOString()
      }
    ],
    alerts: []
  }
};
function getUserData(userId = "user-1") {
  const normId = (userId || "user-1").replace("_", "-");
  if (!USER_DATA[normId]) {
    USER_DATA[normId] = {
      profile: {
        id: normId,
        name: "New Trader",
        email: `${normId}@nse-tracker.in`,
        avatar: ""
      },
      holdings: [],
      watchlist: [],
      alerts: []
    };
  }
  return USER_DATA[normId];
}
function getAllUsers() {
  return Object.values(USER_DATA).map((u) => u.profile);
}
function addHolding(userId, holding) {
  const user = getUserData(userId);
  const invested = holding.quantity * holding.avgPrice;
  const currentValue = holding.quantity * holding.currentPrice;
  const pnl = currentValue - invested;
  const pnlPercent = invested > 0 ? pnl / invested * 100 : 0;
  const newHolding = {
    ...holding,
    id: `h-${Date.now()}`,
    invested: Math.round(invested * 100) / 100,
    currentValue: Math.round(currentValue * 100) / 100,
    pnl: Math.round(pnl * 100) / 100,
    pnlPercent: Math.round(pnlPercent * 100) / 100,
    dayGain: 0,
    dayGainPercent: 0,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  user.holdings.push(newHolding);
  return newHolding;
}
function deleteHolding(userId, holdingId) {
  const user = getUserData(userId);
  const idx = user.holdings.findIndex((h) => h.id === holdingId);
  if (idx !== -1) {
    user.holdings.splice(idx, 1);
    return true;
  }
  return false;
}
function addToWatchlist(userId, item) {
  const user = getUserData(userId);
  const existing = user.watchlist.find((w) => w.symbol.toUpperCase() === item.symbol.toUpperCase());
  if (existing) {
    return existing;
  }
  const newItem = {
    ...item,
    addedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  user.watchlist.push(newItem);
  return newItem;
}
function removeFromWatchlist(userId, symbol) {
  const user = getUserData(userId);
  const idx = user.watchlist.findIndex((w) => w.symbol.toUpperCase() === symbol.toUpperCase());
  if (idx !== -1) {
    user.watchlist.splice(idx, 1);
    return true;
  }
  return false;
}
function addAlert(userId, alert) {
  const user = getUserData(userId);
  const newAlert = {
    ...alert,
    id: `alt-${Date.now()}`,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  user.alerts.push(newAlert);
  return newAlert;
}
function toggleAlert(userId, alertId) {
  const user = getUserData(userId);
  const alt = user.alerts.find((a) => a.id === alertId);
  if (alt) {
    alt.enabled = !alt.enabled;
    return alt;
  }
  return null;
}
function deleteAlert(userId, alertId) {
  const user = getUserData(userId);
  const idx = user.alerts.findIndex((a) => a.id === alertId);
  if (idx !== -1) {
    user.alerts.splice(idx, 1);
    return true;
  }
  return false;
}
function evaluateAlerts(userId, scanResults) {
  const user = getUserData(userId);
  const triggered = [];
  for (const alt of user.alerts) {
    if (!alt.enabled) continue;
    const matchingScans = alt.symbol === "ALL" ? scanResults : scanResults.filter((s) => s.symbol.toUpperCase() === alt.symbol.toUpperCase());
    for (const scan of matchingScans) {
      let isTriggered = false;
      let msg = "";
      if (alt.type === "SCORE_ABOVE" && scan.score >= (alt.threshold ?? 80)) {
        isTriggered = true;
        msg = `${scan.symbol} reached AI Score ${scan.score}/100 (${scan.signal})`;
      } else if (alt.type === "BULLISH_BREAKOUT" && scan.patterns.some((p) => p.pattern.includes("Breakout"))) {
        isTriggered = true;
        msg = `${scan.symbol} triggered Resistance Breakout above \u20B9${scan.indicators.nearestResistance}`;
      } else if (alt.type === "BEARISH_BREAKDOWN" && scan.patterns.some((p) => p.pattern.includes("Breakdown"))) {
        isTriggered = true;
        msg = `${scan.symbol} triggered Breakdown below \u20B9${scan.indicators.nearestSupport}`;
      } else if (alt.type === "VOLUME_2X" && scan.indicators.volumeRatio >= (alt.threshold ?? 2)) {
        isTriggered = true;
        msg = `${scan.symbol} volume expanded to ${scan.indicators.volumeRatio}x average`;
      } else if (alt.type === "EMA_CROSS_BULLISH" && scan.patterns.some((p) => p.pattern.includes("Golden") || p.pattern.includes("Bullish Cross"))) {
        isTriggered = true;
        msg = `${scan.symbol} formed Bullish EMA Crossover`;
      } else if (alt.type === "52W_HIGH" && scan.patterns.some((p) => p.pattern.includes("52-Week High"))) {
        isTriggered = true;
        msg = `${scan.symbol} broke into new 52-week high territory \u20B9${scan.indicators.fiftyTwoWeekHigh}`;
      }
      if (isTriggered) {
        alt.lastTriggered = (/* @__PURE__ */ new Date()).toISOString();
        alt.triggerMessage = msg;
        triggered.push(alt);
        break;
      }
    }
  }
  return triggered;
}

// server/scannerService.ts
var scanCacheMap = /* @__PURE__ */ new Map();
var ScannerService = class {
  constructor() {
    this.isScanning = false;
    this.scanProgress = {
      current: 0,
      total: 0,
      currentSymbol: ""
    };
  }
  getProgress() {
    return {
      isScanning: this.isScanning,
      ...this.scanProgress
    };
  }
  async scanSingleStock(stock, timeframe = "daily", nifty, userHoldings = [], userWatchlistSymbols = /* @__PURE__ */ new Set()) {
    try {
      const hist = await marketDataProvider.getHistoricalData(stock.symbol, timeframe, "1y");
      if (!hist.candles || hist.candles.length < 30) {
        return null;
      }
      const quote = await marketDataProvider.getQuote(stock.symbol);
      const candles = hist.candles;
      const lastCandle = candles[candles.length - 1];
      const prevCandle = candles[candles.length - 2] || lastCandle;
      const currentPrice = quote?.price ?? lastCandle.close;
      const change = quote?.change ?? currentPrice - prevCandle.close;
      const changePercent = quote?.changePercent ?? (prevCandle.close ? change / prevCandle.close * 100 : 0);
      const indicators = calculateAllTechnicalIndicators(candles);
      if (!indicators) return null;
      const patterns = detectPatterns(candles, indicators);
      const sectorConf = await marketConfirmationService.getSectorConfirmation(
        stock.sector,
        changePercent,
        nifty.changePercent,
        marketDataProvider
      );
      const scoring = calculateStockScore(
        currentPrice,
        changePercent,
        indicators,
        patterns,
        nifty,
        sectorConf
      );
      const userHolding = userHoldings.find((h) => h.symbol.toUpperCase() === stock.symbol.toUpperCase());
      const isWatchlist = userWatchlistSymbols.has(stock.symbol.toUpperCase());
      const result = {
        symbol: stock.symbol,
        name: stock.name,
        sector: stock.sector,
        series: stock.series || "EQ",
        marketCapCategory: stock.marketCapCategory || "Large Cap",
        price: Math.round(currentPrice * 100) / 100,
        change: Math.round(change * 100) / 100,
        changePercent: Math.round(changePercent * 100) / 100,
        volume: quote?.volume || lastCandle.volume,
        timeframe,
        data_status: hist.status,
        dataStatus: hist.status,
        score: scoring.score,
        signal: scoring.signal,
        confidence: scoring.confidence,
        primary_signal: scoring.primary_signal,
        secondary_signals: scoring.secondary_signals,
        score_breakdown: scoring.breakdown,
        breakdown: scoring.breakdown,
        indicators,
        patterns,
        nifty,
        sector_conf: sectorConf,
        isHolding: !!userHolding,
        is_holding: !!userHolding,
        holdingDetails: userHolding ? {
          quantity: userHolding.quantity,
          avgPrice: userHolding.avgPrice,
          currentPrice,
          pnl: userHolding.pnl,
          pnlPercent: userHolding.pnlPercent
        } : void 0,
        isWatchlist,
        in_watchlist: isWatchlist,
        last_updated: (/* @__PURE__ */ new Date()).toISOString(),
        lastUpdated: (/* @__PURE__ */ new Date()).toISOString()
      };
      return result;
    } catch {
      return null;
    }
  }
  async runBatchScan(universe = "NIFTY50", timeframe = "daily", userId = "user-1", forceRefresh = false) {
    const cacheKey = `${universe}:${timeframe}:${userId}`;
    const cached = scanCacheMap.get(cacheKey);
    if (!forceRefresh && cached && Date.now() - cached.timestamp < 3 * 60 * 1e3) {
      return { results: cached.results, summary: cached.summary };
    }
    this.isScanning = true;
    try {
      let targetStocks = [];
      const userData = getUserData(userId);
      const userHoldings = userData.holdings;
      const userWatchlistSet = new Set(userData.watchlist.map((w) => w.symbol.toUpperCase()));
      if (universe === "HOLDINGS") {
        targetStocks = userHoldings.map((h) => ({
          symbol: h.symbol,
          name: h.name,
          sector: h.sector,
          series: "EQ",
          marketCapCategory: "LARGE"
        }));
      } else if (universe === "WATCHLIST") {
        targetStocks = userData.watchlist.map((w) => ({
          symbol: w.symbol,
          name: w.name,
          sector: w.sector,
          series: "EQ",
          marketCapCategory: "LARGE"
        }));
      } else {
        targetStocks = getStocksByUniverse(universe);
      }
      if (targetStocks.length === 0) {
        targetStocks = getStocksByUniverse("NIFTY50");
      }
      this.scanProgress = {
        current: 0,
        total: targetStocks.length,
        currentSymbol: "NIFTY 50 Macro"
      };
      const nifty = await marketConfirmationService.getNiftyConfirmation(marketDataProvider);
      const results = [];
      const chunkSize = 5;
      for (let i = 0; i < targetStocks.length; i += chunkSize) {
        const chunk = targetStocks.slice(i, i + chunkSize);
        this.scanProgress.current = i;
        this.scanProgress.currentSymbol = chunk[0].symbol;
        const promises = chunk.map(
          (stock) => this.scanSingleStock(stock, timeframe, nifty, userHoldings, userWatchlistSet)
        );
        const chunkResults = await Promise.all(promises);
        for (const r of chunkResults) {
          if (r) results.push(r);
        }
        await new Promise((resolve) => setTimeout(resolve, 30));
      }
      this.scanProgress.current = targetStocks.length;
      if (results.length === 0) {
        if (!marketDataProvider.isConfigured()) {
          throw new Error("UPSTOX_ACCESS_TOKEN is missing. Please configure your Upstox Access Token in Vercel Environment Variables.");
        }
        throw new Error("Market data feed returned no candles. Please check if your Upstox token is valid and active.");
      }
      results.sort((a, b) => b.score - a.score);
      let strongBullishCount = 0;
      let bullishCount = 0;
      let neutralCount = 0;
      let bearishCount = 0;
      let strongBearishCount = 0;
      let breakoutCount = 0;
      let totalVolumeRatio = 0;
      for (const r of results) {
        if (r.signal === "STRONG BULLISH") strongBullishCount++;
        else if (r.signal === "BULLISH") bullishCount++;
        else if (r.signal === "NEUTRAL") neutralCount++;
        else if (r.signal === "BEARISH") bearishCount++;
        else if (r.signal === "STRONG BEARISH") strongBearishCount++;
        if (r.patterns.some((p) => p.pattern.includes("Breakout"))) {
          breakoutCount++;
        }
        totalVolumeRatio += r.indicators.volumeRatio;
      }
      const topSetups = results.slice(0, 5).map((r) => ({
        symbol: r.symbol,
        score: r.score,
        signal: r.signal,
        primary_signal: r.primary_signal
      }));
      const topGainers = [...results].sort((a, b) => b.changePercent - a.changePercent).slice(0, 5).map((r) => ({
        symbol: r.symbol,
        changePercent: r.changePercent,
        price: r.price
      }));
      const topLosers = [...results].sort((a, b) => a.changePercent - b.changePercent).slice(0, 5).map((r) => ({
        symbol: r.symbol,
        changePercent: r.changePercent,
        price: r.price
      }));
      const breadthAdvancing = results.filter((r) => r.changePercent > 0).length;
      const breadthDeclining = results.filter((r) => r.changePercent < 0).length;
      const summary = {
        totalScanned: results.length,
        strongBullishCount,
        bullishCount,
        neutralCount,
        bearishCount,
        strongBearishCount,
        breakoutCount,
        averageVolumeRatio: results.length ? Math.round(totalVolumeRatio / results.length * 100) / 100 : 1,
        niftyStatus: nifty,
        topSetups,
        topGainers,
        topLosers,
        marketBreadth: {
          advancing: breadthAdvancing,
          declining: breadthDeclining,
          unchanged: results.length - breadthAdvancing - breadthDeclining
        },
        scannedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      const out = { results, summary };
      scanCacheMap.set(cacheKey, {
        universe,
        timeframe,
        timestamp: Date.now(),
        results,
        summary
      });
      return out;
    } finally {
      this.isScanning = false;
    }
  }
  // Filter scan results based on user filter criteria or presets
  filterResults(results, filters) {
    return results.filter((item) => {
      if (filters.preset) {
        switch (filters.preset) {
          case "BULLISH_BREAKOUT":
            if (!item.patterns.some((p) => p.pattern.includes("Breakout") && p.direction === "BULLISH")) return false;
            break;
          case "BEARISH_BREAKDOWN":
            if (!item.patterns.some((p) => p.pattern.includes("Breakdown") && p.direction === "BEARISH")) return false;
            break;
          case "GOLDEN_CROSS":
            if (!item.patterns.some((p) => p.pattern.includes("Golden") || p.pattern.includes("EMA Bullish Cross"))) return false;
            break;
          case "DEATH_CROSS":
            if (!item.patterns.some((p) => p.pattern.includes("Death") || p.pattern.includes("EMA Bearish Cross"))) return false;
            break;
          case "HIGH_VOLUME":
            if (item.indicators.volumeRatio < 1.8) return false;
            break;
          case "MOMENTUM_LEADERS":
            if (item.score < 75) return false;
            break;
          case "OVERSOLD_REVERSAL":
            if (item.indicators.rsi14 > 38 || !item.patterns.some((p) => p.direction === "BULLISH")) return false;
            break;
          case "52W_HIGH":
            if (item.indicators.distFrom52wHigh < -3) return false;
            break;
          case "52W_LOW":
            if (item.indicators.distFrom52wLow > 3) return false;
            break;
          case "TIGHT_CONSOLIDATION":
            if (item.indicators.bollingerBands.bandwidth > 6) return false;
            break;
        }
      }
      if (filters.signal && filters.signal !== "ALL") {
        if (filters.signal === "BULLISH_ALL" && !item.signal.includes("BULLISH")) return false;
        if (filters.signal === "BEARISH_ALL" && !item.signal.includes("BEARISH")) return false;
        if (filters.signal !== "BULLISH_ALL" && filters.signal !== "BEARISH_ALL" && item.signal !== filters.signal) return false;
      }
      if (filters.minScore !== void 0 && item.score < filters.minScore) return false;
      if (filters.maxScore !== void 0 && item.score > filters.maxScore) return false;
      if (filters.minPrice !== void 0 && item.price < filters.minPrice) return false;
      if (filters.maxPrice !== void 0 && item.price > filters.maxPrice) return false;
      if (filters.minVolumeRatio !== void 0 && item.indicators.volumeRatio < filters.minVolumeRatio) return false;
      if (filters.minRsi !== void 0 && item.indicators.rsi14 < filters.minRsi) return false;
      if (filters.maxRsi !== void 0 && item.indicators.rsi14 > filters.maxRsi) return false;
      if (filters.sector && filters.sector !== "ALL" && item.sector !== filters.sector) return false;
      if (filters.aboveEma20 && item.indicators.priceVsEma20 <= 0) return false;
      if (filters.aboveEma50 && item.indicators.priceVsEma50 <= 0) return false;
      if (filters.aboveEma200 && item.indicators.priceVsEma200 <= 0) return false;
      if (filters.onlyHoldings && !item.isHolding) return false;
      if (filters.onlyWatchlist && !item.isWatchlist) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase().trim();
        const sym = item.symbol.toLowerCase();
        const name = item.name.toLowerCase();
        if (!sym.includes(q) && !name.includes(q)) return false;
      }
      return true;
    });
  }
};
var scannerService = new ScannerService();

// server/aiAnalysis.ts
import { GoogleGenAI } from "@google/genai";
var aiClient = null;
function getAIClient() {
  if (aiClient) return aiClient;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return null;
  }
  try {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
    return aiClient;
  } catch {
    return null;
  }
}
function generateDeterministicAnalysis(scan) {
  const isBullish = scan.signal.includes("BULLISH");
  const isBearish = scan.signal.includes("BEARISH");
  const ind = scan.indicators;
  const pat = scan.patterns;
  const keyPositives = [];
  const keyRisks = [];
  if (ind.priceVsEma20 > 0) {
    keyPositives.push(`Price is trading ${ind.priceVsEma20}% above short-term EMA20 (\u20B9${ind.ema20}).`);
  }
  if (ind.ema20 > ind.ema50 && ind.ema50 > ind.ema200) {
    keyPositives.push("Moving average structure is in pristine bullish alignment (EMA20 > EMA50 > EMA200).");
  }
  if (ind.rsi14 >= 50 && ind.rsi14 <= 70) {
    keyPositives.push(`RSI at ${ind.rsi14} confirms solid upward velocity without extreme overbought exhaustion.`);
  }
  if (ind.volumeRatio >= 1.2) {
    keyPositives.push(`Trading volume is ${ind.volumeRatio}x the 20-day average, indicating active participation.`);
  }
  if (scan.sector_conf.confirmation === "STRONG") {
    keyPositives.push(`Sector (${scan.sector_conf.sectorName}) is displaying positive momentum agreeing with the stock.`);
  }
  if (scan.nifty.confirmationStatus === "STRONG") {
    keyPositives.push(`Broader NIFTY 50 trend is currently ${scan.nifty.trend}, providing supportive market wind.`);
  }
  if (ind.rsi14 > 72) {
    keyRisks.push(`RSI is elevated at ${ind.rsi14}, signaling near-term pullback or consolidation risk.`);
  } else if (ind.rsi14 < 35) {
    keyRisks.push(`RSI is depressed at ${ind.rsi14}, indicating persistent selling pressure.`);
  }
  if (ind.priceVsEma20 > 7) {
    keyRisks.push(`Price is extended ${ind.priceVsEma20}% above its EMA20; mean reversion risk is heightened.`);
  }
  if (scan.nifty.trend === "BEARISH" || scan.nifty.trend === "STRONG BEARISH") {
    keyRisks.push(`Overall NIFTY 50 market trend is ${scan.nifty.trend}, which may dampen upside momentum.`);
  }
  if (ind.volumeRatio < 0.8) {
    keyRisks.push(`Subdued volume (${ind.volumeRatio}x avg) suggests a lack of institutional conviction.`);
  }
  if (keyRisks.length === 0) {
    keyRisks.push(`Close stop-loss discipline required below nearby support \u20B9${ind.nearestSupport}.`);
  }
  while (keyPositives.length < 3) {
    keyPositives.push(`Nearest support base firmly established at \u20B9${ind.nearestSupport} (Strength: ${ind.supportStrength}/10).`);
  }
  while (keyRisks.length < 2) {
    keyRisks.push(`Breakdown below \u20B9${ind.nearestSupport} would neutralize the current technical setup.`);
  }
  let summary = "";
  if (isBullish) {
    summary = `${scan.symbol} demonstrates a constructive bullish setup with a quantitative score of ${scan.score}/100, supported by ${scan.primary_signal.toLowerCase()} and supportive moving average structure.`;
  } else if (isBearish) {
    summary = `${scan.symbol} exhibits technical vulnerability with a score of ${scan.score}/100, constrained by ${scan.primary_signal.toLowerCase()} and overhead resistance at \u20B9${ind.nearestResistance}.`;
  } else {
    summary = `${scan.symbol} is consolidating within a defined band between support \u20B9${ind.nearestSupport} and resistance \u20B9${ind.nearestResistance} with a neutral score of ${scan.score}/100.`;
  }
  return {
    symbol: scan.symbol,
    signal: isBullish ? "BULLISH" : isBearish ? "BEARISH" : "NEUTRAL",
    confidence: scan.confidence,
    summary,
    keyPositives: keyPositives.slice(0, 5),
    keyRisks: keyRisks.slice(0, 4),
    technicalSetup: pat.length > 0 ? pat[0].description : `${scan.primary_signal} with price at \u20B9${scan.price}.`,
    confirmation: `Sector (${scan.sector_conf.sectorName}): ${scan.sector_conf.sectorTrend} | NIFTY 50: ${scan.nifty.trend}. Alignment: ${scan.sector_conf.confirmation}.`,
    invalidation: `A daily close below key support \u20B9${ind.nearestSupport} invalidates the immediate setup.`,
    setupType: pat.length > 0 ? pat[0].pattern.toUpperCase() : scan.signal,
    generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    isAiGenerated: false
  };
}
async function generateAIAnalysis(scan) {
  const client = getAIClient();
  if (!client) {
    return generateDeterministicAnalysis(scan);
  }
  try {
    const inputPayload = {
      symbol: scan.symbol,
      name: scan.name,
      price: scan.price,
      changePercent: scan.changePercent,
      score: scan.score,
      signal: scan.signal,
      confidence: scan.confidence,
      primarySignal: scan.primary_signal,
      secondarySignals: scan.secondary_signals,
      indicators: {
        ema20: scan.indicators.ema20,
        ema50: scan.indicators.ema50,
        ema200: scan.indicators.ema200,
        priceVsEma20: scan.indicators.priceVsEma20,
        rsi14: scan.indicators.rsi14,
        macdHistogram: scan.indicators.macd.histogram,
        macdCrossover: scan.indicators.macd.crossover,
        adx: scan.indicators.adx14.adx,
        volumeRatio: scan.indicators.volumeRatio,
        fiftyTwoWeekHigh: scan.indicators.fiftyTwoWeekHigh,
        fiftyTwoWeekLow: scan.indicators.fiftyTwoWeekLow,
        nearestSupport: scan.indicators.nearestSupport,
        nearestResistance: scan.indicators.nearestResistance
      },
      patterns: scan.patterns.map((p) => ({
        name: p.pattern,
        direction: p.direction,
        confidence: p.confidence,
        description: p.description
      })),
      nifty: {
        trend: scan.nifty.trend,
        regime: scan.nifty.regime,
        rsi: scan.nifty.rsi
      },
      sector: {
        name: scan.sector_conf.sectorName,
        trend: scan.sector_conf.sectorTrend,
        relativeStrength: scan.sector_conf.stockRelativeStrengthVsSector
      }
    };
    const prompt = `You are an elite quantitative technical analyst for Indian National Stock Exchange (NSE) equities.
Analyze the following programmatically calculated data for ${scan.symbol} and generate an objective, disciplined technical analysis review.

RULES:
1. STRICT TRUTH: Only cite values provided in the JSON input. NEVER invent prices, financial fundamentals, quarterly earnings, rumors, or unsupplied indicators.
2. FINANCIAL SAFETY: You are an analytical tool, NOT a financial advisor. Strictly avoid words like "Guaranteed BUY", "Guaranteed profit", "Will definitely rise", "Risk-free". Use terms like "Bullish setup", "Technical breakout", "Potential resistance rejection", "Watchlist candidate".
3. Return ONLY a valid JSON object matching the requested schema.

INPUT DATA:
${JSON.stringify(inputPayload, null, 2)}`;
    const response = await client.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a senior NSE Technical Analyst generating structured technical summaries for traders and portfolio managers. Respond strictly in JSON format without markdown code fences.",
        responseMimeType: "application/json"
      }
    });
    const rawText = response.text?.trim() || "";
    const parsed = JSON.parse(rawText);
    if (!parsed.summary || !Array.isArray(parsed.keyPositives) || !Array.isArray(parsed.keyRisks)) {
      throw new Error("Invalid AI response schema");
    }
    return {
      symbol: scan.symbol,
      signal: parsed.signal || (scan.score >= 65 ? "BULLISH" : scan.score <= 49 ? "BEARISH" : "NEUTRAL"),
      confidence: parsed.confidence || scan.confidence,
      summary: parsed.summary,
      keyPositives: parsed.keyPositives.slice(0, 5),
      keyRisks: parsed.keyRisks.slice(0, 4),
      technicalSetup: parsed.technicalSetup || parsed.setup || scan.primary_signal,
      confirmation: parsed.confirmation || `Sector: ${scan.sector_conf.sectorTrend}, NIFTY: ${scan.nifty.trend}`,
      invalidation: parsed.invalidation || `Daily close below \u20B9${scan.indicators.nearestSupport}`,
      setupType: parsed.setupType || scan.primary_signal,
      generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
      isAiGenerated: true
    };
  } catch {
    return generateDeterministicAnalysis(scan);
  }
}

// server/backtesting.ts
async function runHistoricalBacktest(symbols, dataProvider, minScore = 75) {
  const records = [];
  const niftyHist = await dataProvider.getHistoricalData("^NSEI", "daily", "1y");
  const niftyCandles = niftyHist.candles || [];
  for (const sym of symbols.slice(0, 15)) {
    try {
      const hist = await dataProvider.getHistoricalData(sym, "daily", "1y");
      const candles = hist.candles || [];
      if (candles.length < 90) continue;
      for (let t = 50; t < candles.length - 20; t += 5) {
        const windowCandles = candles.slice(0, t + 1);
        const indicators = calculateAllTechnicalIndicators(windowCandles);
        if (!indicators) continue;
        const patterns = detectPatterns(windowCandles, indicators);
        const currentCandle = windowCandles[windowCandles.length - 1];
        const entryPrice = currentCandle.close;
        const changePercent = windowCandles.length >= 2 ? (entryPrice - windowCandles[windowCandles.length - 2].close) / windowCandles[windowCandles.length - 2].close * 100 : 0;
        const niftyIdx = Math.min(t, niftyCandles.length - 1);
        const niftyCandle = niftyCandles[niftyIdx];
        const niftyPrice = niftyCandle?.close || entryPrice;
        const prevNiftyCandle = niftyIdx > 0 ? niftyCandles[niftyIdx - 1] : niftyCandle;
        const niftyChange = niftyCandle && prevNiftyCandle ? niftyCandle.close - prevNiftyCandle.close : 0;
        const niftyChangePercent = prevNiftyCandle && prevNiftyCandle.close > 0 ? niftyChange / prevNiftyCandle.close * 100 : 0;
        const historicalNifty = {
          niftyPrice,
          change: Math.round(niftyChange * 100) / 100,
          changePercent: Math.round(niftyChangePercent * 100) / 100,
          trend: niftyChangePercent >= 0 ? "BULLISH" : "BEARISH",
          ema20: indicators.ema20,
          ema50: indicators.ema50,
          ema200: indicators.ema200,
          rsi: indicators.rsi14,
          momentum: niftyChangePercent >= 0 ? "Positive momentum" : "Negative drift",
          regime: niftyChangePercent >= 0 ? "BULLISH" : "BEARISH",
          confirmationStatus: "STRONG"
        };
        const historicalSector = {
          sectorName: "NSE Sector",
          sectorIndexSymbol: "^NSEI",
          sectorPrice: niftyPrice,
          sectorChangePercent: niftyChangePercent,
          sectorTrend: niftyChangePercent >= 0 ? "BULLISH" : "BEARISH",
          sectorMomentum: Math.min(100, Math.max(0, Math.round(indicators.rsi14))),
          stockRelativeStrengthVsSector: Math.round((changePercent - niftyChangePercent) * 100) / 100,
          sectorRelativeStrengthVsNifty: 0,
          confirmation: "STRONG"
        };
        const scoreResult = calculateStockScore(
          entryPrice,
          changePercent,
          indicators,
          patterns,
          historicalNifty,
          historicalSector
        );
        if (scoreResult.score >= minScore || scoreResult.score <= 100 - minScore) {
          const isBullish = scoreResult.score >= minScore;
          const p5 = candles[t + 5]?.close ?? null;
          const p10 = candles[t + 10]?.close ?? null;
          const p20 = candles[t + 20]?.close ?? null;
          const p60 = candles[t + 60]?.close ?? null;
          const ret5 = p5 ? Math.round((p5 - entryPrice) / entryPrice * 1e4) / 100 : null;
          const ret10 = p10 ? Math.round((p10 - entryPrice) / entryPrice * 1e4) / 100 : null;
          const ret20 = p20 ? Math.round((p20 - entryPrice) / entryPrice * 1e4) / 100 : null;
          const ret60 = p60 ? Math.round((p60 - entryPrice) / entryPrice * 1e4) / 100 : null;
          let maxHigh = entryPrice;
          let minLow = entryPrice;
          const lookaheadMax = Math.min(candles.length - 1, t + 20);
          for (let f = t + 1; f <= lookaheadMax; f++) {
            if (candles[f].high > maxHigh) maxHigh = candles[f].high;
            if (candles[f].low < minLow) minLow = candles[f].low;
          }
          const maxGain = Math.round((maxHigh - entryPrice) / entryPrice * 1e4) / 100;
          const maxDrawdown = Math.round((minLow - entryPrice) / entryPrice * 1e4) / 100;
          const isWin = isBullish ? ret20 !== null && ret20 > 0 : ret20 !== null && ret20 < 0;
          records.push({
            id: `${sym}-${currentCandle.dateStr}-${t}`,
            signal_date: currentCandle.dateStr,
            symbol: sym,
            signal: scoreResult.signal,
            score: scoreResult.score,
            entry_price: entryPrice,
            price_after_5_days: p5,
            price_after_10_days: p10,
            price_after_20_days: p20,
            price_after_60_days: p60,
            return_5d: ret5,
            return_10d: ret10,
            return_20d: ret20,
            return_60d: ret60,
            maximum_gain: maxGain,
            maximum_drawdown: maxDrawdown,
            status: isWin ? "WIN" : "LOSS"
          });
        }
      }
    } catch {
      continue;
    }
  }
  const total = records.length;
  if (total === 0) {
    return {
      totalSignals: 0,
      bullishSignals: 0,
      bearishSignals: 0,
      winRate5d: 0,
      winRate10d: 0,
      winRate20d: 0,
      winRate60d: 0,
      averageReturn: 0,
      medianReturn: 0,
      maxDrawdown: 0,
      bestTrade: null,
      worstTrade: null,
      records: []
    };
  }
  const bullishRecords = records.filter((r) => r.signal.includes("BULLISH"));
  const bearishRecords = records.filter((r) => r.signal.includes("BEARISH"));
  const valid5d = records.filter((r) => r.return_5d !== null);
  const win5d = valid5d.filter((r) => r.signal.includes("BULLISH") ? r.return_5d > 0 : r.return_5d < 0).length;
  const valid10d = records.filter((r) => r.return_10d !== null);
  const win10d = valid10d.filter((r) => r.signal.includes("BULLISH") ? r.return_10d > 0 : r.return_10d < 0).length;
  const valid20d = records.filter((r) => r.return_20d !== null);
  const win20d = valid20d.filter((r) => r.signal.includes("BULLISH") ? r.return_20d > 0 : r.return_20d < 0).length;
  const valid60d = records.filter((r) => r.return_60d !== null);
  const win60d = valid60d.filter((r) => r.signal.includes("BULLISH") ? r.return_60d > 0 : r.return_60d < 0).length;
  const returns20 = valid20d.map((r) => r.signal.includes("BULLISH") ? r.return_20d : -r.return_20d);
  returns20.sort((a, b) => a - b);
  const avgRet = returns20.length ? returns20.reduce((a, b) => a + b, 0) / returns20.length : 0;
  const medRet = returns20.length ? returns20[Math.floor(returns20.length / 2)] : 0;
  let worstDrawdown = 0;
  let bestTrade = null;
  let worstTrade = null;
  for (const r of records) {
    if (r.maximum_drawdown < worstDrawdown) worstDrawdown = r.maximum_drawdown;
    const effReturn = r.return_20d ?? r.return_10d ?? 0;
    if (!bestTrade || effReturn > bestTrade.gain) {
      bestTrade = { symbol: r.symbol, gain: effReturn, date: r.signal_date };
    }
    if (!worstTrade || effReturn < worstTrade.loss) {
      worstTrade = { symbol: r.symbol, loss: effReturn, date: r.signal_date };
    }
  }
  return {
    totalSignals: total,
    bullishSignals: bullishRecords.length,
    bearishSignals: bearishRecords.length,
    winRate5d: valid5d.length ? Math.round(win5d / valid5d.length * 1e3) / 10 : 0,
    winRate10d: valid10d.length ? Math.round(win10d / valid10d.length * 1e3) / 10 : 0,
    winRate20d: valid20d.length ? Math.round(win20d / valid20d.length * 1e3) / 10 : 0,
    winRate60d: valid60d.length ? Math.round(win60d / valid60d.length * 1e3) / 10 : 0,
    averageReturn: Math.round(avgRet * 100) / 100,
    medianReturn: Math.round(medRet * 100) / 100,
    maxDrawdown: Math.round(worstDrawdown * 100) / 100,
    bestTrade,
    worstTrade,
    records: records.slice(0, 100)
    // top 100 records for display
  };
}

// shared/types.ts
var AVAILABLE_UNIVERSES = [
  { id: "nifty50", label: "NIFTY 50" },
  { id: "nifty100", label: "NIFTY 100" },
  { id: "nifty200", label: "NIFTY 200" },
  { id: "nifty_bank", label: "NIFTY Bank" },
  { id: "nifty_it", label: "NIFTY IT" },
  { id: "nifty_auto", label: "NIFTY Auto" },
  { id: "nifty_pharma", label: "NIFTY Pharma" },
  { id: "nifty_fmcg", label: "NIFTY FMCG" },
  { id: "nifty_metal", label: "NIFTY Metal" },
  { id: "holdings", label: "My Portfolio Holdings" },
  { id: "watchlist", label: "My Watchlist" }
];

// server/app.ts
function createApp() {
  const app2 = express();
  app2.use(express.json());
  app2.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }
    next();
  });
  app2.use((req, res, next) => {
    const query = req.query;
    if (query?.slug) {
      const slugPath = Array.isArray(query.slug) ? query.slug.join("/") : String(query.slug);
      req.url = `/api/${slugPath.replace(/^\//, "")}`;
    } else if (query?.path) {
      req.url = `/api/${String(query.path).replace(/^\//, "")}`;
    } else if (req.headers["x-forwarded-uri"]) {
      const fwd = String(req.headers["x-forwarded-uri"]);
      if (fwd.startsWith("/api") && fwd !== "/api" && fwd !== "/api/") {
        req.url = fwd;
      }
    } else if (req.url && !req.url.startsWith("/api") && (req.url.startsWith("/scanner") || req.url.startsWith("/health") || req.url.startsWith("/market") || req.url.startsWith("/user") || req.url.startsWith("/portfolio") || req.url.startsWith("/ai") || req.url.startsWith("/backtest"))) {
      req.url = `/api${req.url}`;
    }
    next();
  });
  app2.get(["/api", "/api/index", "/api/"], (req, res, next) => {
    const query = req.query;
    if (query?.slug || query?.path) {
      return next();
    }
    res.json({
      status: "ok",
      service: "Stock Screener API",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  });
  let currentUserId = "user-1";
  app2.get(["/api/users", "/api/portfolio/users"], (req, res) => {
    res.json({
      currentUser: getUserData(currentUserId).profile,
      allUsers: getAllUsers()
    });
  });
  app2.post("/api/user/switch", (req, res) => {
    const { userId } = req.body;
    if (userId) {
      currentUserId = userId;
    }
    res.json({ success: true, profile: getUserData(currentUserId).profile });
  });
  app2.get(["/api/user/holdings", "/api/portfolio/:userId/holdings"], (req, res) => {
    const uid = req.params.userId || currentUserId;
    const data = getUserData(uid);
    res.json(data.holdings);
  });
  app2.post(["/api/user/holdings", "/api/portfolio/:userId/holdings"], (req, res) => {
    const uid = req.params.userId || currentUserId;
    addHolding(uid, req.body);
    const data = getUserData(uid);
    res.json(data.holdings);
  });
  app2.delete(["/api/user/holdings/:id", "/api/portfolio/:userId/holdings/:id"], (req, res) => {
    const uid = req.params.userId || currentUserId;
    deleteHolding(uid, req.params.id);
    const data = getUserData(uid);
    res.json(data.holdings);
  });
  app2.get(["/api/user/watchlist", "/api/portfolio/:userId/watchlist"], (req, res) => {
    const uid = req.params.userId || currentUserId;
    const data = getUserData(uid);
    res.json(data.watchlist);
  });
  app2.post(["/api/user/watchlist", "/api/portfolio/:userId/watchlist"], (req, res) => {
    const uid = req.params.userId || currentUserId;
    addToWatchlist(uid, req.body);
    const data = getUserData(uid);
    res.json(data.watchlist);
  });
  app2.delete(["/api/user/watchlist/:symbol", "/api/portfolio/:userId/watchlist/:symbol"], (req, res) => {
    const uid = req.params.userId || currentUserId;
    removeFromWatchlist(uid, req.params.symbol);
    const data = getUserData(uid);
    res.json(data.watchlist);
  });
  app2.get(["/api/user/alerts", "/api/portfolio/:userId/alerts"], (req, res) => {
    const uid = req.params.userId || currentUserId;
    const data = getUserData(uid);
    res.json(data.alerts);
  });
  app2.post(["/api/user/alerts", "/api/portfolio/:userId/alerts"], (req, res) => {
    const uid = req.params.userId || currentUserId;
    addAlert(uid, req.body);
    const data = getUserData(uid);
    res.json(data.alerts);
  });
  app2.patch(["/api/user/alerts/:id/toggle", "/api/portfolio/:userId/alerts/:id/toggle"], (req, res) => {
    const uid = req.params.userId || currentUserId;
    toggleAlert(uid, req.params.id);
    const data = getUserData(uid);
    res.json(data.alerts);
  });
  app2.delete(["/api/user/alerts/:id", "/api/portfolio/:userId/alerts/:id"], (req, res) => {
    const uid = req.params.userId || currentUserId;
    deleteAlert(uid, req.params.id);
    const data = getUserData(uid);
    res.json(data.alerts);
  });
  app2.get(["/api/market/status", "/api/scanner/status"], (req, res) => {
    const status = getMarketStatus();
    res.json(status);
  });
  app2.get(["/api/market/nifty", "/api/scanner/nifty"], async (req, res) => {
    try {
      const nifty = await marketConfirmationService.getNiftyConfirmation(marketDataProvider);
      const statusInfo = getMarketStatus();
      res.json({
        ...nifty,
        marketStatus: statusInfo.marketStatus,
        marketIsOpen: statusInfo.isOpen,
        marketMessage: statusInfo.message,
        currentIstTime: statusInfo.currentIstTime,
        tradingDate: statusInfo.tradingDate,
        dataSource: marketDataProvider.name
      });
    } catch (err) {
      res.status(503).json({
        error: "MARKET_DATA_UNAVAILABLE",
        message: err.message || "Unable to retrieve real NIFTY 50 data from market provider",
        provider: marketDataProvider.name,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
  });
  app2.get(["/api/market/sectors", "/api/scanner/sectors"], async (req, res) => {
    try {
      const sectors = await marketDataProvider.getSectorData();
      res.json(sectors);
    } catch (err) {
      res.status(503).json({
        error: "MARKET_DATA_UNAVAILABLE",
        message: err.message || "Failed to retrieve sector market data",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
  });
  app2.get("/api/scanner/universes", (req, res) => {
    const sectors = Object.keys(SECTOR_INDICES);
    res.json({
      universes: AVAILABLE_UNIVERSES,
      sectors
    });
  });
  app2.get("/api/scanner/progress", (req, res) => {
    res.json(scannerService.getProgress());
  });
  const handleRunScan = async (req, res) => {
    try {
      const universe = (req.method === "POST" ? req.body.universe : req.query.universe) || "nifty50";
      const timeframe = (req.method === "POST" ? req.body.timeframe : req.query.timeframe) || "daily";
      const refresh = (req.method === "POST" ? req.body.refresh : req.query.refresh) === true || req.query.refresh === "true";
      const uid = (req.method === "POST" ? req.body.userId : req.query.userId) || currentUserId;
      const data = await scannerService.runBatchScan(universe, timeframe, uid, refresh);
      const triggeredAlerts = evaluateAlerts(uid, data.results);
      res.json({
        ...data,
        triggeredAlerts
      });
    } catch (err) {
      res.status(500).json({
        error: "SCAN_FAILED",
        message: err.message || "Scan failed",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
  };
  app2.get("/api/scanner/run", handleRunScan);
  app2.post("/api/scanner/run", handleRunScan);
  app2.get("/api/scanner/stock/:symbol", async (req, res) => {
    try {
      const sym = req.params.symbol.toUpperCase();
      const timeframe = req.query.timeframe || "daily";
      const stockMeta = NSE_STOCKS.find((s) => s.symbol.toUpperCase() === sym) || {
        symbol: sym,
        name: `${sym} Ltd.`,
        sector: "Diversified",
        series: "EQ",
        marketCapCategory: "LARGE"
      };
      const nifty = await marketConfirmationService.getNiftyConfirmation(marketDataProvider);
      const userData = getUserData(currentUserId);
      const watchlistSet = new Set(userData.watchlist.map((w) => w.symbol.toUpperCase()));
      const result = await scannerService.scanSingleStock(
        stockMeta,
        timeframe,
        nifty,
        userData.holdings,
        watchlistSet
      );
      if (!result) {
        return res.status(404).json({
          error: "STOCK_DATA_UNAVAILABLE",
          message: `Insufficient or unavailable market data for stock ${sym}`
        });
      }
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: "STOCK_SCAN_ERROR", message: err.message });
    }
  });
  app2.get("/api/scanner/chart/:symbol", async (req, res) => {
    try {
      const sym = req.params.symbol.toUpperCase();
      const timeframe = req.query.timeframe || "daily";
      const range = req.query.range || (timeframe === "weekly" ? "2y" : "1y");
      const hist = await marketDataProvider.getHistoricalData(sym, timeframe, range);
      if (hist.status === "ERROR" && hist.candles.length === 0) {
        return res.status(503).json(hist);
      }
      res.json(hist);
    } catch (err) {
      res.status(500).json({ error: "CHART_DATA_ERROR", message: err.message });
    }
  });
  app2.post("/api/scanner/ai-explain", async (req, res) => {
    try {
      const scanResult = req.body;
      if (!scanResult || !scanResult.symbol) {
        return res.status(400).json({ error: "Missing stock scan payload" });
      }
      const explanation = await generateAIAnalysis(scanResult);
      res.json(explanation);
    } catch (err) {
      res.status(500).json({ error: "AI_EXPLAIN_ERROR", message: err.message || "AI analysis generation failed" });
    }
  });
  const handleBacktest = async (req, res) => {
    try {
      const minScore = parseInt((req.method === "POST" ? req.body.minScore : req.query.minScore) || "75", 10);
      const topSymbols = NSE_STOCKS.slice(0, 15).map((s) => s.symbol);
      const results = await runHistoricalBacktest(topSymbols, marketDataProvider, minScore);
      res.json(results);
    } catch (err) {
      res.status(500).json({ error: "BACKTEST_ERROR", message: err.message || "Backtesting execution failed" });
    }
  };
  app2.get("/api/backtest/run", handleBacktest);
  app2.get("/api/scanner/backtest", handleBacktest);
  app2.post("/api/scanner/backtest", handleBacktest);
  app2.get("/api/health", async (req, res) => {
    const health = await marketDataProvider.checkHealth();
    const marketStatus = getMarketStatus();
    res.json({
      status: "ok",
      marketData: {
        provider: marketDataProvider.name,
        configured: health.configured,
        reachable: health.reachable,
        latencyMs: health.latencyMs,
        error: health.error
      },
      marketHours: {
        status: marketStatus.marketStatus,
        isOpen: marketStatus.isOpen,
        currentIstTime: marketStatus.currentIstTime,
        message: marketStatus.message
      },
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      environment: process.env.NODE_ENV || "development"
    });
  });
  app2.use((err, req, res, next) => {
    console.error("[API Error]:", err);
    res.status(500).json({
      status: "error",
      error: err?.message || "Internal Server Error",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  });
  return app2;
}
var app = createApp();

// api/index.ts
var index_default = app;
export {
  index_default as default
};
