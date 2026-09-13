import zlib from 'zlib';

/**
 * Upstox Instrument Mapping Layer
 * 
 * Maps NSE symbols and indices to official Upstox instrument keys (e.g. "NSE_EQ|INE002A01018", "NSE_INDEX|Nifty 50").
 * Provides static instant-resolution for the entire NSE universe and benchmark indices,
 * plus a cached lazy downloader for the official NSE instruments file for arbitrary stocks.
 */

// Index mapping table
const INDEX_INSTRUMENT_MAP: Record<string, string> = {
  // NIFTY 50
  'NIFTY': 'NSE_INDEX|Nifty 50',
  'NIFTY50': 'NSE_INDEX|Nifty 50',
  'NIFTY 50': 'NSE_INDEX|Nifty 50',
  '^NSEI': 'NSE_INDEX|Nifty 50',
  'NSE_INDEX|NIFTY 50': 'NSE_INDEX|Nifty 50',

  // NIFTY 100, 200, 500
  'NIFTY100': 'NSE_INDEX|Nifty 100',
  'NIFTY 100': 'NSE_INDEX|Nifty 100',
  'NIFTY200': 'NSE_INDEX|Nifty 200',
  'NIFTY 200': 'NSE_INDEX|Nifty 200',
  'NIFTY500': 'NSE_INDEX|Nifty 500',
  'NIFTY 500': 'NSE_INDEX|Nifty 500',

  // Sector Indices
  'BANKNIFTY': 'NSE_INDEX|Nifty Bank',
  'NIFTYBANK': 'NSE_INDEX|Nifty Bank',
  'NIFTY BANK': 'NSE_INDEX|Nifty Bank',
  '^NSEBANK': 'NSE_INDEX|Nifty Bank',

  'NIFTYIT': 'NSE_INDEX|Nifty IT',
  'NIFTY IT': 'NSE_INDEX|Nifty IT',
  '^CNXIT': 'NSE_INDEX|Nifty IT',
  'CNXIT': 'NSE_INDEX|Nifty IT',

  'NIFTYAUTO': 'NSE_INDEX|Nifty Auto',
  'NIFTY AUTO': 'NSE_INDEX|Nifty Auto',
  '^CNXAUTO': 'NSE_INDEX|Nifty Auto',
  'CNXAUTO': 'NSE_INDEX|Nifty Auto',

  'NIFTYPHARMA': 'NSE_INDEX|Nifty Pharma',
  'NIFTY PHARMA': 'NSE_INDEX|Nifty Pharma',
  '^CNXPHARMA': 'NSE_INDEX|Nifty Pharma',
  'CNXPHARMA': 'NSE_INDEX|Nifty Pharma',

  'NIFTYFMCG': 'NSE_INDEX|Nifty FMCG',
  'NIFTY FMCG': 'NSE_INDEX|Nifty FMCG',
  '^CNXFMCG': 'NSE_INDEX|Nifty FMCG',
  'CNXFMCG': 'NSE_INDEX|Nifty FMCG',

  'NIFTYMETAL': 'NSE_INDEX|Nifty Metal',
  'NIFTY METAL': 'NSE_INDEX|Nifty Metal',
  '^CNXMETAL': 'NSE_INDEX|Nifty Metal',
  'CNXMETAL': 'NSE_INDEX|Nifty Metal',

  'NIFTYENERGY': 'NSE_INDEX|Nifty Energy',
  'NIFTY ENERGY': 'NSE_INDEX|Nifty Energy',
  '^CNXENERGY': 'NSE_INDEX|Nifty Energy',
  'CNXENERGY': 'NSE_INDEX|Nifty Energy',

  'NIFTYREALTY': 'NSE_INDEX|Nifty Realty',
  'NIFTY REALTY': 'NSE_INDEX|Nifty Realty',
  '^CNXREALTY': 'NSE_INDEX|Nifty Realty',
  'CNXREALTY': 'NSE_INDEX|Nifty Realty',

  'NIFTYINFRA': 'NSE_INDEX|Nifty Infra',
  'NIFTY INFRA': 'NSE_INDEX|Nifty Infra',
  '^CNXINFRA': 'NSE_INDEX|Nifty Infra',
  'CNXINFRA': 'NSE_INDEX|Nifty Infra',

  'NIFTYPSE': 'NSE_INDEX|Nifty PSE',
  'NIFTY PSE': 'NSE_INDEX|Nifty PSE',
  '^CNXPSE': 'NSE_INDEX|Nifty PSE',
  'CNXPSE': 'NSE_INDEX|Nifty PSE',

  'NIFTYFIN': 'NSE_INDEX|Nifty Fin Service',
  'NIFTY FIN SERVICE': 'NSE_INDEX|Nifty Fin Service',
  'FINNIFTY': 'NSE_INDEX|Nifty Fin Service',
  '^CNXFIN': 'NSE_INDEX|Nifty Fin Service',
  'CNXFIN': 'NSE_INDEX|Nifty Fin Service',

  'NIFTYCOMM': 'NSE_INDEX|Nifty Commodities',
  'NIFTY COMMODITIES': 'NSE_INDEX|Nifty Commodities',
  '^CNXCOMMODITIES': 'NSE_INDEX|Nifty Commodities',
  'CNXCOMMODITIES': 'NSE_INDEX|Nifty Commodities',
};

// Verified Upstox Instrument Keys for Top NSE Stocks
const UNIVERSE_INSTRUMENT_MAP: Record<string, string> = {
  RELIANCE: 'NSE_EQ|INE002A01018',
  TCS: 'NSE_EQ|INE467B01029',
  HDFCBANK: 'NSE_EQ|INE040A01034',
  INFY: 'NSE_EQ|INE009A01021',
  ICICIBANK: 'NSE_EQ|INE090A01021',
  BHARTIARTL: 'NSE_EQ|INE397D01024',
  SBIN: 'NSE_EQ|INE062A01020',
  ITC: 'NSE_EQ|INE154A01025',
  HINDUNILVR: 'NSE_EQ|INE030A01027',
  LT: 'NSE_EQ|INE018A01030',
  BAJFINANCE: 'NSE_EQ|INE296A01032',
  HCLTECH: 'NSE_EQ|INE860A01027',
  MARUTI: 'NSE_EQ|INE585B01010',
  SUNPHARMA: 'NSE_EQ|INE044A01036',
  TATAMOTORS: 'NSE_EQ|INE155A01022', // TMPV (Tata Motors Passenger Vehicles)
  TMPV: 'NSE_EQ|INE155A01022',
  TMCV: 'NSE_EQ|INE1TAE01010',
  KOTAKBANK: 'NSE_EQ|INE237A01036',
  AXISBANK: 'NSE_EQ|INE238A01034',
  NTPC: 'NSE_EQ|INE733E01010',
  ONGC: 'NSE_EQ|INE213A01029',
  TITAN: 'NSE_EQ|INE280A01028',
  ADANIENT: 'NSE_EQ|INE423A01024',
  ADANIPORTS: 'NSE_EQ|INE742F01042',
  POWERGRID: 'NSE_EQ|INE752E01010',
  COALINDIA: 'NSE_EQ|INE522F01014',
  TATASTEEL: 'NSE_EQ|INE081A01020',
  'M&M': 'NSE_EQ|INE101A01026',
  MM: 'NSE_EQ|INE101A01026',
  BAJAJFINSV: 'NSE_EQ|INE918I01026',
  ASIANPAINT: 'NSE_EQ|INE021A01026',
  ULTRACEMCO: 'NSE_EQ|INE481G01011',
  JSWSTEEL: 'NSE_EQ|INE019A01038',
  WIPRO: 'NSE_EQ|INE075A01022',
  NESTLEIND: 'NSE_EQ|INE239A01024',
  GRASIM: 'NSE_EQ|INE047A01021',
  TECHM: 'NSE_EQ|INE669C01036',
  CIPLA: 'NSE_EQ|INE059A01026',
  HINDALCO: 'NSE_EQ|INE038A01020',
  DRREDDY: 'NSE_EQ|INE089A01031',
  TATACONSUM: 'NSE_EQ|INE192A01025',
  BPCL: 'NSE_EQ|INE029A01011',
  BRITANNIA: 'NSE_EQ|INE216A01030',
  EICHERMOT: 'NSE_EQ|INE066A01021',
  HEROMOTOCO: 'NSE_EQ|INE158A01026',
  APOLLOHOSP: 'NSE_EQ|INE437A01024',
  DIVISLAB: 'NSE_EQ|INE361B01024',
  'BAJAJ-AUTO': 'NSE_EQ|INE917I01010',
  BAJAJAUTO: 'NSE_EQ|INE917I01010',
  LTIM: 'NSE_EQ|INE214T01019', // LTM (LTIMindtree)
  LTM: 'NSE_EQ|INE214T01019',
  BEL: 'NSE_EQ|INE263A01024',
  TRENT: 'NSE_EQ|INE849A01020',
  SHRIRAMFIN: 'NSE_EQ|INE721A01047',
  INDUSINDBK: 'NSE_EQ|INE095A01012',
  HAL: 'NSE_EQ|INE066F01020',
  VEDL: 'NSE_EQ|INE205A01025',
  ZOMATO: 'NSE_EQ|INE758T01015', // ETERNAL (Zomato)
  ETERNAL: 'NSE_EQ|INE758T01015',
  JIOFIN: 'NSE_EQ|INE758E01017',
  DLF: 'NSE_EQ|INE271C01023',
  SIEMENS: 'NSE_EQ|INE003A01024',
  ABB: 'NSE_EQ|INE117A01022',
  CHOLAFIN: 'NSE_EQ|INE121A08PJ0',
  TVSMOTOR: 'NSE_EQ|INE494B01023',
  HAVELLS: 'NSE_EQ|INE176B01034',
  GAIL: 'NSE_EQ|INE129A01019',
  PFC: 'NSE_EQ|INE134E01011',
  RECLTD: 'NSE_EQ|INE020B01018',
  INDIGO: 'NSE_EQ|INE646L01027',
  CANBK: 'NSE_EQ|INE476A01022',
  BANKBARODA: 'NSE_EQ|INE028A01039',
  PNB: 'NSE_EQ|INE160A01022',
  LODHA: 'NSE_EQ|INE670K01029',
  GODREJCP: 'NSE_EQ|INE102D01028',
  DABUR: 'NSE_EQ|INE016A01026',
  PIDILITIND: 'NSE_EQ|INE318A01026',
  AMBUJACEM: 'NSE_EQ|INE079A01024',
  IOC: 'NSE_EQ|INE242A01010',
  SRF: 'NSE_EQ|INE647A01010',
  MOTHERSON: 'NSE_EQ|INE775A01035',
  POLYCAB: 'NSE_EQ|INE455K01017',
  BOSCHLTD: 'NSE_EQ|INE323A01026',
  COLPAL: 'NSE_EQ|INE259A01022',
  MARICO: 'NSE_EQ|INE196A01026',
  VOLTAS: 'NSE_EQ|INE226A01021',
  PERSISTENT: 'NSE_EQ|INE262H01021',
  COFORGE: 'NSE_EQ|INE591G01025',
  MPHASIS: 'NSE_EQ|INE356A01018',
  DIXON: 'NSE_EQ|INE935N01020',
  KALYANKJIL: 'NSE_EQ|INE303R01014',
  SUZLON: 'NSE_EQ|INE040H01021',
  BHEL: 'NSE_EQ|INE257A01026',
  NMDC: 'NSE_EQ|INE584A01023',
  SAIL: 'NSE_EQ|INE114A01011',
  FEDERALBNK: 'NSE_EQ|INE171A01029',
  IDFCFIRSTB: 'NSE_EQ|INE092T01019',
  AUBANK: 'NSE_EQ|INE949L01017',
  MUTHOOTFIN: 'NSE_EQ|INE414G01012',
  OBEROIRLTY: 'NSE_EQ|INE093I01010',
  GODREJPROP: 'NSE_EQ|INE484J01027',
  PHOENIXLTD: 'NSE_EQ|INE211B01039',
  PRESTIGE: 'NSE_EQ|INE811K01011',
  TATACOMM: 'NSE_EQ|INE151A01013',
  KPITTECH: 'NSE_EQ|INE04I401011',
  CYIENT: 'NSE_EQ|INE136B01020',
};

export class UpstoxInstrumentService {
  private dynamicMap = new Map<string, string>();
  private reverseMap = new Map<string, string>();
  private isDownloading = false;
  private lastDownloadedAt = 0;
  private downloadPromise: Promise<void> | null = null;

  constructor() {
    // Populate with pre-mapped universe and indices
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
  public cleanSymbol(symbol: string): string {
    if (!symbol) return '';
    let s = symbol.trim().toUpperCase();
    if (s.startsWith('^')) {
      s = s.slice(1);
    }
    if (s === 'NSEI') return 'NIFTY50';
    if (s === 'NSEBANK') return 'BANKNIFTY';
    if (s.startsWith('CNX')) return 'NIFTY' + s.slice(3);
    s = s.replace(/\.NS$/, '');
    s = s.replace(/\.BO$/, '');
    s = s.replace(/:NSE$/, '');
    s = s.replace(/:BSE$/, '');
    return s;
  }

  /**
   * Synchronously resolves an instrument key from the cache.
   * If not present, returns null (caller can then await resolveKey).
   */
  public getKeySync(symbol: string): string | null {
    if (!symbol) return null;
    const raw = symbol.trim();

    // Already an Upstox key?
    if (raw.startsWith('NSE_EQ|') || raw.startsWith('NSE_INDEX|')) {
      return raw;
    }

    const upper = raw.toUpperCase();
    if (this.dynamicMap.has(upper)) {
      return this.dynamicMap.get(upper)!;
    }

    const clean = this.cleanSymbol(raw);
    if (this.dynamicMap.has(clean)) {
      return this.dynamicMap.get(clean)!;
    }

    return null;
  }

  /**
   * Asynchronously resolves an instrument key.
   * If not found in cache, fetches the official Upstox NSE instruments database on demand.
   */
  public async resolveKey(symbol: string): Promise<string | null> {
    const syncResult = this.getKeySync(symbol);
    if (syncResult) return syncResult;

    // Trigger dynamic instruments sync if not done in last 24h
    await this.ensureInstrumentsLoaded();

    return this.getKeySync(symbol);
  }

  /**
   * Resolves canonical symbol given an Upstox key
   */
  public getSymbolFromKey(key: string): string {
    if (this.reverseMap.has(key)) {
      return this.reverseMap.get(key)!;
    }
    // Fallback: extract from token or return key
    const parts = key.split('|');
    return parts.length > 1 ? parts[1] : key;
  }

  /**
   * Downloads and caches the full Upstox NSE instruments list (78k+ instruments)
   * if not loaded in the past 24 hours.
   */
  public async ensureInstrumentsLoaded(): Promise<void> {
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;
    if (this.lastDownloadedAt && Date.now() - this.lastDownloadedAt < ONE_DAY_MS) {
      return;
    }

    if (this.downloadPromise) {
      return this.downloadPromise;
    }

    this.downloadPromise = (async () => {
      try {
        console.log('[UpstoxInstruments] Fetching official NSE instruments list from Upstox CDN...');
        const res = await fetch('https://assets.upstox.com/market-quote/instruments/exchange/NSE.json.gz');
        if (!res.ok) {
          console.warn(`[UpstoxInstruments] Failed to download instruments: HTTP ${res.status}`);
          return;
        }

        const buffer = await res.arrayBuffer();
        const decompressed = zlib.gunzipSync(Buffer.from(buffer));
        const data = JSON.parse(decompressed.toString('utf8'));

        if (Array.isArray(data)) {
          let count = 0;
          for (const item of data) {
            if (item.segment === 'NSE_EQ' && item.trading_symbol && item.instrument_key) {
              const sym = item.trading_symbol.toUpperCase();
              this.dynamicMap.set(sym, item.instrument_key);
              this.reverseMap.set(item.instrument_key, sym);
              if (item.isin) {
                this.dynamicMap.set(item.isin.toUpperCase(), item.instrument_key);
              }
              count++;
            } else if (item.segment === 'NSE_INDEX' && item.name && item.instrument_key) {
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
      } catch (err: any) {
        console.warn(`[UpstoxInstruments] Error downloading instruments: ${err.message}`);
      } finally {
        this.downloadPromise = null;
      }
    })();

    return this.downloadPromise;
  }
}

export const upstoxInstruments = new UpstoxInstrumentService();
