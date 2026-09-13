import { upstoxInstruments } from '../upstox/instruments.ts';

export interface SymbolMapping {
  canonical: string;       // e.g. "RELIANCE", "NIFTY50"
  display: string;         // e.g. "RELIANCE", "NIFTY 50"
  yahooSymbol: string;     // e.g. "RELIANCE.NS", "^NSEI"
  twelveDataSymbol: string;// e.g. "RELIANCE:NSE", "NIFTY 50:NSE"
  upstoxKey?: string;      // e.g. "NSE_EQ|INE002A01018", "NSE_INDEX|Nifty 50"
  isIndex: boolean;
}

const INDEX_MAP: Record<string, { display: string; yahooSymbol: string; twelveDataSymbol: string }> = {
  NIFTY: { display: 'NIFTY 50', yahooSymbol: '^NSEI', twelveDataSymbol: 'NIFTY 50:NSE' },
  NIFTY50: { display: 'NIFTY 50', yahooSymbol: '^NSEI', twelveDataSymbol: 'NIFTY 50:NSE' },
  '^NSEI': { display: 'NIFTY 50', yahooSymbol: '^NSEI', twelveDataSymbol: 'NIFTY 50:NSE' },
  'NIFTY 50': { display: 'NIFTY 50', yahooSymbol: '^NSEI', twelveDataSymbol: 'NIFTY 50:NSE' },

  BANKNIFTY: { display: 'NIFTY Bank', yahooSymbol: '^NSEBANK', twelveDataSymbol: 'BANKNIFTY:NSE' },
  NIFTYBANK: { display: 'NIFTY Bank', yahooSymbol: '^NSEBANK', twelveDataSymbol: 'BANKNIFTY:NSE' },
  '^NSEBANK': { display: 'NIFTY Bank', yahooSymbol: '^NSEBANK', twelveDataSymbol: 'BANKNIFTY:NSE' },

  NIFTYIT: { display: 'NIFTY IT', yahooSymbol: '^CNXIT', twelveDataSymbol: 'NIFTYIT:NSE' },
  '^CNXIT': { display: 'NIFTY IT', yahooSymbol: '^CNXIT', twelveDataSymbol: 'NIFTYIT:NSE' },

  NIFTYAUTO: { display: 'NIFTY Auto', yahooSymbol: '^CNXAUTO', twelveDataSymbol: 'NIFTYAUTO:NSE' },
  '^CNXAUTO': { display: 'NIFTY Auto', yahooSymbol: '^CNXAUTO', twelveDataSymbol: 'NIFTYAUTO:NSE' },

  NIFTYPHARMA: { display: 'NIFTY Pharma', yahooSymbol: '^CNXPHARMA', twelveDataSymbol: 'NIFTYPHARMA:NSE' },
  '^CNXPHARMA': { display: 'NIFTY Pharma', yahooSymbol: '^CNXPHARMA', twelveDataSymbol: 'NIFTYPHARMA:NSE' },

  NIFTYFMCG: { display: 'NIFTY FMCG', yahooSymbol: '^CNXFMCG', twelveDataSymbol: 'NIFTYFMCG:NSE' },
  '^CNXFMCG': { display: 'NIFTY FMCG', yahooSymbol: '^CNXFMCG', twelveDataSymbol: 'NIFTYFMCG:NSE' },

  NIFTYMETAL: { display: 'NIFTY Metal', yahooSymbol: '^CNXMETAL', twelveDataSymbol: 'NIFTYMETAL:NSE' },
  '^CNXMETAL': { display: 'NIFTY Metal', yahooSymbol: '^CNXMETAL', twelveDataSymbol: 'NIFTYMETAL:NSE' },

  NIFTYENERGY: { display: 'NIFTY Energy', yahooSymbol: '^CNXENERGY', twelveDataSymbol: 'NIFTYENERGY:NSE' },
  '^CNXENERGY': { display: 'NIFTY Energy', yahooSymbol: '^CNXENERGY', twelveDataSymbol: 'NIFTYENERGY:NSE' },

  NIFTYREALTY: { display: 'NIFTY Realty', yahooSymbol: '^CNXREALTY', twelveDataSymbol: 'NIFTYREALTY:NSE' },
  '^CNXREALTY': { display: 'NIFTY Realty', yahooSymbol: '^CNXREALTY', twelveDataSymbol: 'NIFTYREALTY:NSE' },

  NIFTYINFRA: { display: 'NIFTY Infra', yahooSymbol: '^CNXINFRA', twelveDataSymbol: 'NIFTYINFRA:NSE' },
  '^CNXINFRA': { display: 'NIFTY Infra', yahooSymbol: '^CNXINFRA', twelveDataSymbol: 'NIFTYINFRA:NSE' },

  NIFTYPSE: { display: 'NIFTY PSE', yahooSymbol: '^CNXPSE', twelveDataSymbol: 'NIFTYPSE:NSE' },
  '^CNXPSE': { display: 'NIFTY PSE', yahooSymbol: '^CNXPSE', twelveDataSymbol: 'NIFTYPSE:NSE' },

  NIFTYFIN: { display: 'NIFTY Fin Service', yahooSymbol: '^CNXFIN', twelveDataSymbol: 'NIFTYFIN:NSE' },
  '^CNXFIN': { display: 'NIFTY Fin Service', yahooSymbol: '^CNXFIN', twelveDataSymbol: 'NIFTYFIN:NSE' },

  NIFTYCOMM: { display: 'NIFTY Commodities', yahooSymbol: '^CNXCOMMODITIES', twelveDataSymbol: 'NIFTYCOMM:NSE' },
  '^CNXCOMMODITIES': { display: 'NIFTY Commodities', yahooSymbol: '^CNXCOMMODITIES', twelveDataSymbol: 'NIFTYCOMM:NSE' },
};

export class SymbolNormalizer {
  /**
   * Normalizes any input symbol into a canonical NSE equity or index symbol
   * e.g.:
   *   "RELIANCE.NS" -> "RELIANCE"
   *   "reliance" -> "RELIANCE"
   *   "^NSEI" -> "NIFTY50"
   *   "NIFTY 50" -> "NIFTY50"
   */
  public static toCanonical(input: string): string {
    if (!input) return '';
    const trimmed = input.trim().toUpperCase();

    // Check index table
    if (INDEX_MAP[trimmed]) {
      const idx = INDEX_MAP[trimmed];
      if (idx.yahooSymbol === '^NSEI') return 'NIFTY50';
      if (idx.yahooSymbol === '^NSEBANK') return 'BANKNIFTY';
      return trimmed.replace('^', '').replace(' ', '');
    }

    // Strip Yahoo or exchange suffixes
    let clean = trimmed;
    if (clean.startsWith('^')) {
      return clean;
    }
    clean = clean.replace(/\.NS$/, '');
    clean = clean.replace(/\.BO$/, '');
    clean = clean.replace(/:NSE$/, '');
    clean = clean.replace(/:BSE$/, '');
    return clean;
  }

  /**
   * Returns complete mapping details for a symbol
   */
  public static getMapping(input: string): SymbolMapping {
    const raw = (input || '').trim();
    const upper = raw.toUpperCase();

    // Check if it matches an index
    if (INDEX_MAP[upper]) {
      const info = INDEX_MAP[upper];
      const canonical = upper === '^NSEI' || upper === 'NIFTY 50' || upper === 'NIFTY' ? 'NIFTY50' : upper.replace('^', '').replace(' ', '');
      const upstoxKey = upstoxInstruments.getKeySync(upper) || upstoxInstruments.getKeySync(canonical) || undefined;
      return {
        canonical,
        display: info.display,
        yahooSymbol: info.yahooSymbol,
        twelveDataSymbol: info.twelveDataSymbol,
        upstoxKey,
        isIndex: true,
      };
    }

    // If starts with ^, treated as Yahoo Index
    if (upper.startsWith('^')) {
      const upstoxKey = upstoxInstruments.getKeySync(upper) || undefined;
      return {
        canonical: upper,
        display: upper,
        yahooSymbol: upper,
        twelveDataSymbol: upper.replace('^', '') + ':NSE',
        upstoxKey,
        isIndex: true,
      };
    }

    const canonical = this.toCanonical(upper);
    const upstoxKey = upstoxInstruments.getKeySync(canonical) || undefined;
    return {
      canonical,
      display: canonical,
      yahooSymbol: `${canonical}.NS`,
      twelveDataSymbol: `${canonical}:NSE`,
      upstoxKey,
      isIndex: false,
    };
  }

  /**
   * Translates canonical or raw symbol to Upstox instrument key
   */
  public static toUpstox(input: string): string {
    return upstoxInstruments.getKeySync(input) || input;
  }

  /**
   * Translates canonical or raw symbol to Yahoo Finance symbol
   */
  public static toYahoo(input: string): string {
    return this.getMapping(input).yahooSymbol;
  }

  /**
   * Translates canonical or raw symbol to Twelve Data symbol
   */
  public static toTwelveData(input: string): string {
    return this.getMapping(input).twelveDataSymbol;
  }
}
