export interface StockUniverseItem {
  symbol: string;
  name: string;
  sector: string;
  isNifty50?: boolean;
  isNifty100?: boolean;
  isNifty200?: boolean;
  isNifty500?: boolean;
}

export interface SectorIndexInfo {
  name: string;
  symbol: string;
  yahooSymbol: string;
  upstoxKey?: string;
}

export const SECTOR_INDICES: Record<string, SectorIndexInfo> = {
  'Banking & Financials': { name: 'NIFTY Bank', symbol: 'BANKNIFTY', yahooSymbol: '^NSEBANK', upstoxKey: 'NSE_INDEX|Nifty Bank' },
  'Financial Services': { name: 'NIFTY Fin Service', symbol: 'NIFTYFIN', yahooSymbol: '^CNXFIN', upstoxKey: 'NSE_INDEX|Nifty Fin Service' },
  'Information Technology': { name: 'NIFTY IT', symbol: 'NIFTYIT', yahooSymbol: '^CNXIT', upstoxKey: 'NSE_INDEX|Nifty IT' },
  'Automobiles & Auto Components': { name: 'NIFTY Auto', symbol: 'NIFTYAUTO', yahooSymbol: '^CNXAUTO', upstoxKey: 'NSE_INDEX|Nifty Auto' },
  'Pharmaceuticals & Healthcare': { name: 'NIFTY Pharma', symbol: 'NIFTYPHARMA', yahooSymbol: '^CNXPHARMA', upstoxKey: 'NSE_INDEX|Nifty Pharma' },
  'Fast Moving Consumer Goods': { name: 'NIFTY FMCG', symbol: 'NIFTYFMCG', yahooSymbol: '^CNXFMCG', upstoxKey: 'NSE_INDEX|Nifty FMCG' },
  'Metals & Mining': { name: 'NIFTY Metal', symbol: 'NIFTYMETAL', yahooSymbol: '^CNXMETAL', upstoxKey: 'NSE_INDEX|Nifty Metal' },
  'Oil, Gas & Energy': { name: 'NIFTY Energy', symbol: 'NIFTYENERGY', yahooSymbol: '^CNXENERGY', upstoxKey: 'NSE_INDEX|Nifty Energy' },
  'Power & Utilities': { name: 'NIFTY Energy', symbol: 'NIFTYENERGY', yahooSymbol: '^CNXENERGY', upstoxKey: 'NSE_INDEX|Nifty Energy' },
  'Real Estate & Construction': { name: 'NIFTY Realty', symbol: 'NIFTYREALTY', yahooSymbol: '^CNXREALTY', upstoxKey: 'NSE_INDEX|Nifty Realty' },
  'Infrastructure': { name: 'NIFTY Infra', symbol: 'NIFTYINFRA', yahooSymbol: '^CNXINFRA', upstoxKey: 'NSE_INDEX|Nifty Infra' },
  'Telecommunications': { name: 'NIFTY Infra', symbol: 'NIFTYINFRA', yahooSymbol: '^CNXINFRA', upstoxKey: 'NSE_INDEX|Nifty Infra' },
  'Consumer Discretionary': { name: 'NIFTY FMCG', symbol: 'NIFTYFMCG', yahooSymbol: '^CNXFMCG', upstoxKey: 'NSE_INDEX|Nifty FMCG' },
  'Chemicals': { name: 'NIFTY Commodities', symbol: 'NIFTYCOMM', yahooSymbol: '^CNXCOMMODITIES', upstoxKey: 'NSE_INDEX|Nifty Commodities' },
  'Public Sector Enterprises': { name: 'NIFTY PSE', symbol: 'NIFTYPSE', yahooSymbol: '^CNXPSE', upstoxKey: 'NSE_INDEX|Nifty PSE' },
};

// Universe of top NSE stocks with accurate sector classification
export const NSE_UNIVERSE: StockUniverseItem[] = [
  // Top NIFTY 50
  { symbol: 'RELIANCE', name: 'Reliance Industries Ltd.', sector: 'Oil, Gas & Energy', isNifty50: true, isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: 'TCS', name: 'Tata Consultancy Services Ltd.', sector: 'Information Technology', isNifty50: true, isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd.', sector: 'Banking & Financials', isNifty50: true, isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: 'INFY', name: 'Infosys Ltd.', sector: 'Information Technology', isNifty50: true, isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd.', sector: 'Banking & Financials', isNifty50: true, isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel Ltd.', sector: 'Telecommunications', isNifty50: true, isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: 'SBIN', name: 'State Bank of India', sector: 'Banking & Financials', isNifty50: true, isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: 'ITC', name: 'ITC Ltd.', sector: 'Fast Moving Consumer Goods', isNifty50: true, isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: 'HINDUNILVR', name: 'Hindustan Unilever Ltd.', sector: 'Fast Moving Consumer Goods', isNifty50: true, isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: 'LT', name: 'Larsen & Toubro Ltd.', sector: 'Infrastructure', isNifty50: true, isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: 'BAJFINANCE', name: 'Bajaj Finance Ltd.', sector: 'Financial Services', isNifty50: true, isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: 'HCLTECH', name: 'HCL Technologies Ltd.', sector: 'Information Technology', isNifty50: true, isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: 'MARUTI', name: 'Maruti Suzuki India Ltd.', sector: 'Automobiles & Auto Components', isNifty50: true, isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: 'SUNPHARMA', name: 'Sun Pharmaceutical Industries Ltd.', sector: 'Pharmaceuticals & Healthcare', isNifty50: true, isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: 'TATAMOTORS', name: 'Tata Motors Ltd.', sector: 'Automobiles & Auto Components', isNifty50: true, isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank Ltd.', sector: 'Banking & Financials', isNifty50: true, isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: 'AXISBANK', name: 'Axis Bank Ltd.', sector: 'Banking & Financials', isNifty50: true, isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: 'NTPC', name: 'NTPC Ltd.', sector: 'Power & Utilities', isNifty50: true, isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: 'ONGC', name: 'Oil & Natural Gas Corporation Ltd.', sector: 'Oil, Gas & Energy', isNifty50: true, isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: 'TITAN', name: 'Titan Company Ltd.', sector: 'Consumer Discretionary', isNifty50: true, isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: 'ADANIENT', name: 'Adani Enterprises Ltd.', sector: 'Infrastructure', isNifty50: true, isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: 'ADANIPORTS', name: 'Adani Ports and SEZ Ltd.', sector: 'Infrastructure', isNifty50: true, isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: 'POWERGRID', name: 'Power Grid Corporation of India', sector: 'Power & Utilities', isNifty50: true, isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: 'COALINDIA', name: 'Coal India Ltd.', sector: 'Metals & Mining', isNifty50: true, isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: 'TATASTEEL', name: 'Tata Steel Ltd.', sector: 'Metals & Mining', isNifty50: true, isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: 'M&M', name: 'Mahindra & Mahindra Ltd.', sector: 'Automobiles & Auto Components', isNifty50: true, isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: 'BAJAJFINSV', name: 'Bajaj Finserv Ltd.', sector: 'Financial Services', isNifty50: true, isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: 'ASIANPAINT', name: 'Asian Paints Ltd.', sector: 'Consumer Discretionary', isNifty50: true, isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: 'ULTRACEMCO', name: 'UltraTech Cement Ltd.', sector: 'Infrastructure', isNifty50: true, isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: 'JSWSTEEL', name: 'JSW Steel Ltd.', sector: 'Metals & Mining', isNifty50: true, isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: 'WIPRO', name: 'Wipro Ltd.', sector: 'Information Technology', isNifty50: true, isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: 'NESTLEIND', name: 'Nestle India Ltd.', sector: 'Fast Moving Consumer Goods', isNifty50: true, isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: 'GRASIM', name: 'Grasim Industries Ltd.', sector: 'Infrastructure', isNifty50: true, isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: 'TECHM', name: 'Tech Mahindra Ltd.', sector: 'Information Technology', isNifty50: true, isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: 'CIPLA', name: 'Cipla Ltd.', sector: 'Pharmaceuticals & Healthcare', isNifty50: true, isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: 'HINDALCO', name: 'Hindalco Industries Ltd.', sector: 'Metals & Mining', isNifty50: true, isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: 'DRREDDY', name: 'Dr. Reddy Laboratories Ltd.', sector: 'Pharmaceuticals & Healthcare', isNifty50: true, isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: 'TATACONSUM', name: 'Tata Consumer Products Ltd.', sector: 'Fast Moving Consumer Goods', isNifty50: true, isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: 'BPCL', name: 'Bharat Petroleum Corporation Ltd.', sector: 'Oil, Gas & Energy', isNifty50: true, isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: 'BRITANNIA', name: 'Britannia Industries Ltd.', sector: 'Fast Moving Consumer Goods', isNifty50: true, isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: 'EICHERMOT', name: 'Eicher Motors Ltd.', sector: 'Automobiles & Auto Components', isNifty50: true, isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: 'HEROMOTOCO', name: 'Hero MotoCorp Ltd.', sector: 'Automobiles & Auto Components', isNifty50: true, isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: 'APOLLOHOSP', name: 'Apollo Hospitals Enterprise Ltd.', sector: 'Pharmaceuticals & Healthcare', isNifty50: true, isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: 'DIVISLAB', name: "Divi's Laboratories Ltd.", sector: 'Pharmaceuticals & Healthcare', isNifty50: true, isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: 'BAJAJ-AUTO', name: 'Bajaj Auto Ltd.', sector: 'Automobiles & Auto Components', isNifty50: true, isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: 'LTIM', name: 'LTIMindtree Ltd.', sector: 'Information Technology', isNifty50: true, isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: 'BEL', name: 'Bharat Electronics Ltd.', sector: 'Public Sector Enterprises', isNifty50: true, isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: 'TRENT', name: 'Trent Ltd.', sector: 'Consumer Discretionary', isNifty50: true, isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: 'SHRIRAMFIN', name: 'Shriram Finance Ltd.', sector: 'Financial Services', isNifty50: true, isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: 'INDUSINDBK', name: 'IndusInd Bank Ltd.', sector: 'Banking & Financials', isNifty50: true, isNifty100: true, isNifty200: true, isNifty500: true },

  // NIFTY Next 50 / 100 additions
  { symbol: 'HAL', name: 'Hindustan Aeronautics Ltd.', sector: 'Public Sector Enterprises', isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: 'VEDL', name: 'Vedanta Ltd.', sector: 'Metals & Mining', isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: 'ZOMATO', name: 'Zomato Ltd.', sector: 'Consumer Discretionary', isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: 'JIOFIN', name: 'Jio Financial Services Ltd.', sector: 'Financial Services', isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: 'DLF', name: 'DLF Ltd.', sector: 'Real Estate & Construction', isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: 'SIEMENS', name: 'Siemens Ltd.', sector: 'Infrastructure', isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: 'ABB', name: 'ABB India Ltd.', sector: 'Infrastructure', isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: 'CHOLAFIN', name: 'Cholamandalam Investment & Fin', sector: 'Financial Services', isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: 'TVSMOTOR', name: 'TVS Motor Company Ltd.', sector: 'Automobiles & Auto Components', isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: 'HAVELLS', name: 'Havells India Ltd.', sector: 'Consumer Discretionary', isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: 'GAIL', name: 'GAIL (India) Ltd.', sector: 'Oil, Gas & Energy', isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: 'PFC', name: 'Power Finance Corporation Ltd.', sector: 'Financial Services', isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: 'RECLTD', name: 'REC Ltd.', sector: 'Financial Services', isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: 'INDIGO', name: 'InterGlobe Aviation Ltd.', sector: 'Consumer Discretionary', isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: 'CANBK', name: 'Canara Bank', sector: 'Banking & Financials', isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: 'BANKBARODA', name: 'Bank of Baroda', sector: 'Banking & Financials', isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: 'PNB', name: 'Punjab National Bank', sector: 'Banking & Financials', isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: 'LODHA', name: 'Macrotech Developers Ltd.', sector: 'Real Estate & Construction', isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: 'GODREJCP', name: 'Godrej Consumer Products Ltd.', sector: 'Fast Moving Consumer Goods', isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: 'DABUR', name: 'Dabur India Ltd.', sector: 'Fast Moving Consumer Goods', isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: 'PIDILITIND', name: 'Pidilite Industries Ltd.', sector: 'Chemicals', isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: 'AMBUJACEM', name: 'Ambuja Cements Ltd.', sector: 'Infrastructure', isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: 'IOC', name: 'Indian Oil Corporation Ltd.', sector: 'Oil, Gas & Energy', isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: 'SRF', name: 'SRF Ltd.', sector: 'Chemicals', isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: 'MOTHERSON', name: 'Samvardhana Motherson Intl', sector: 'Automobiles & Auto Components', isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: 'POLYCAB', name: 'Polycab India Ltd.', sector: 'Infrastructure', isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: 'BOSCHLTD', name: 'Bosch Ltd.', sector: 'Automobiles & Auto Components', isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: 'COLPAL', name: 'Colgate-Palmolive (India) Ltd.', sector: 'Fast Moving Consumer Goods', isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: 'MARICO', name: 'Marico Ltd.', sector: 'Fast Moving Consumer Goods', isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: 'VOLTAS', name: 'Voltas Ltd.', sector: 'Consumer Discretionary', isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: 'PERSISTENT', name: 'Persistent Systems Ltd.', sector: 'Information Technology', isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: 'COFORGE', name: 'Coforge Ltd.', sector: 'Information Technology', isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: 'MPHASIS', name: 'Mphasis Ltd.', sector: 'Information Technology', isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: 'DIXON', name: 'Dixon Technologies (India) Ltd.', sector: 'Consumer Discretionary', isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: 'KALYANKJIL', name: 'Kalyan Jewellers India Ltd.', sector: 'Consumer Discretionary', isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: 'SUZLON', name: 'Suzlon Energy Ltd.', sector: 'Power & Utilities', isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: 'BHEL', name: 'Bharat Heavy Electricals Ltd.', sector: 'Public Sector Enterprises', isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: 'NMDC', name: 'NMDC Ltd.', sector: 'Metals & Mining', isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: 'SAIL', name: 'Steel Authority of India Ltd.', sector: 'Metals & Mining', isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: 'FEDERALBNK', name: 'Federal Bank Ltd.', sector: 'Banking & Financials', isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: 'IDFCFIRSTB', name: 'IDFC First Bank Ltd.', sector: 'Banking & Financials', isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: 'AUBANK', name: 'AU Small Finance Bank Ltd.', sector: 'Banking & Financials', isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: 'MUTHOOTFIN', name: 'Muthoot Finance Ltd.', sector: 'Financial Services', isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: 'OBEROIRLTY', name: 'Oberoi Realty Ltd.', sector: 'Real Estate & Construction', isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: 'GODREJPROP', name: 'Godrej Properties Ltd.', sector: 'Real Estate & Construction', isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: 'PHOENIXLTD', name: 'The Phoenix Mills Ltd.', sector: 'Real Estate & Construction', isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: 'PRESTIGE', name: 'Prestige Estates Projects Ltd.', sector: 'Real Estate & Construction', isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: 'TATACOMM', name: 'Tata Communications Ltd.', sector: 'Telecommunications', isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: 'KPITTECH', name: 'KPIT Technologies Ltd.', sector: 'Information Technology', isNifty100: true, isNifty200: true, isNifty500: true },
  { symbol: 'CYIENT', name: 'Cyient Ltd.', sector: 'Information Technology', isNifty200: true, isNifty500: true },
];

export function getUniverseList(universeId: string, customWatchlist: string[] = [], customHoldings: string[] = []): StockUniverseItem[] {
  const normId = (universeId || 'nifty50').toLowerCase();
  if (normId === 'nifty50') {
    return NSE_UNIVERSE.filter((s) => s.isNifty50);
  }
  if (normId === 'nifty100') {
    return NSE_UNIVERSE.filter((s) => s.isNifty50 || s.isNifty100);
  }
  if (normId === 'nifty200') {
    return NSE_UNIVERSE.filter((s) => s.isNifty50 || s.isNifty100 || s.isNifty200);
  }
  if (normId === 'nifty500') {
    return NSE_UNIVERSE;
  }
  if (normId === 'nifty_bank' || normId === 'bank') {
    return NSE_UNIVERSE.filter((s) => s.sector === 'Banking & Financials' || s.sector === 'Financial Services');
  }
  if (normId === 'nifty_it' || normId === 'it') {
    return NSE_UNIVERSE.filter((s) => s.sector === 'Information Technology');
  }
  if (normId === 'nifty_auto' || normId === 'auto') {
    return NSE_UNIVERSE.filter((s) => s.sector === 'Automobiles & Auto Components');
  }
  if (normId === 'nifty_pharma' || normId === 'pharma') {
    return NSE_UNIVERSE.filter((s) => s.sector === 'Pharmaceuticals & Healthcare');
  }
  if (normId === 'nifty_fmcg' || normId === 'fmcg') {
    return NSE_UNIVERSE.filter((s) => s.sector === 'Fast Moving Consumer Goods');
  }
  if (normId === 'nifty_metal' || normId === 'metal') {
    return NSE_UNIVERSE.filter((s) => s.sector === 'Metals & Mining');
  }
  if (normId === 'watchlist') {
    const list = customWatchlist.map((w) => w.toUpperCase());
    return NSE_UNIVERSE.filter((s) => list.includes(s.symbol.toUpperCase()));
  }
  if (normId === 'holdings') {
    const list = customHoldings.map((h) => h.toUpperCase());
    return NSE_UNIVERSE.filter((s) => list.includes(s.symbol.toUpperCase()));
  }
  return NSE_UNIVERSE.filter((s) => s.isNifty50);
}

export function findStockInfo(symbol: string): StockUniverseItem {
  const found = NSE_UNIVERSE.find((s) => s.symbol.toUpperCase() === symbol.toUpperCase());
  if (found) return found;
  return {
    symbol: symbol.toUpperCase(),
    name: `${symbol.toUpperCase()} Ltd.`,
    sector: 'Banking & Financials',
  };
}

// Aliases for compatibility
export type NSEStock = StockUniverseItem;
export const NSE_STOCKS = NSE_UNIVERSE;
export const getStocksByUniverse = getUniverseList;

