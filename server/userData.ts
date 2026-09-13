import type { AlertRule, Holding, StockScanResult, UserProfile, WatchlistItem } from '../shared/types.ts';

export interface UserDatabase {
  profile: UserProfile;
  holdings: Holding[];
  watchlist: WatchlistItem[];
  alerts: AlertRule[];
}

// In-memory multi-user store
const USER_DATA: Record<string, UserDatabase> = {
  'user-1': {
    profile: {
      id: 'user-1',
      name: 'Jeet Kamal',
      email: 'jeetkamal991@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    },
    holdings: [
      {
        id: 'h-1',
        symbol: 'RELIANCE',
        name: 'Reliance Industries Ltd.',
        sector: 'Oil, Gas & Energy',
        quantity: 35,
        avgPrice: 1210.5,
        currentPrice: 1257.5,
        invested: 42367.5,
        currentValue: 44012.5,
        pnl: 1645.0,
        pnlPercent: 3.88,
        dayGain: -576.25,
        dayGainPercent: -1.29,
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'h-2',
        symbol: 'TCS',
        name: 'Tata Consultancy Services Ltd.',
        sector: 'Information Technology',
        quantity: 20,
        avgPrice: 2150.0,
        currentPrice: 2200.8,
        invested: 43000.0,
        currentValue: 44016.0,
        pnl: 1016.0,
        pnlPercent: 2.36,
        dayGain: -66.0,
        dayGainPercent: -0.15,
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'h-3',
        symbol: 'HDFCBANK',
        name: 'HDFC Bank Ltd.',
        sector: 'Banking & Financials',
        quantity: 50,
        avgPrice: 1620.0,
        currentPrice: 1690.4,
        invested: 81000.0,
        currentValue: 84520.0,
        pnl: 3520.0,
        pnlPercent: 4.35,
        dayGain: 420.0,
        dayGainPercent: 0.5,
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'h-4',
        symbol: 'TATAMOTORS',
        name: 'Tata Motors Ltd.',
        sector: 'Automobiles & Auto Components',
        quantity: 60,
        avgPrice: 880.0,
        currentPrice: 945.2,
        invested: 52800.0,
        currentValue: 56712.0,
        pnl: 3912.0,
        pnlPercent: 7.41,
        dayGain: 680.0,
        dayGainPercent: 1.21,
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'h-5',
        symbol: 'LT',
        name: 'Larsen & Toubro Ltd.',
        sector: 'Infrastructure',
        quantity: 15,
        avgPrice: 3450.0,
        currentPrice: 3580.0,
        invested: 51750.0,
        currentValue: 53700.0,
        pnl: 1950.0,
        pnlPercent: 3.77,
        dayGain: 315.0,
        dayGainPercent: 0.59,
        updatedAt: new Date().toISOString(),
      },
    ],
    watchlist: [
      {
        symbol: 'INFY',
        name: 'Infosys Ltd.',
        sector: 'Information Technology',
        price: 1840.0,
        change: 12.5,
        changePercent: 0.68,
        addedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
        notes: 'Watching for breakout above 1880 resistance',
      },
      {
        symbol: 'BHARTIARTL',
        name: 'Bharti Airtel Ltd.',
        sector: 'Telecommunications',
        price: 1620.0,
        change: 18.0,
        changePercent: 1.12,
        addedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        notes: 'Strong ARPU growth and 5G expansion',
      },
      {
        symbol: 'SUNPHARMA',
        name: 'Sun Pharmaceutical Industries Ltd.',
        sector: 'Pharmaceuticals & Healthcare',
        price: 1810.0,
        change: -5.0,
        changePercent: -0.28,
        addedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        notes: 'Defensive play near 52-week highs',
      },
      {
        symbol: 'BAJFINANCE',
        name: 'Bajaj Finance Ltd.',
        sector: 'Financial Services',
        price: 6980.0,
        change: 45.0,
        changePercent: 0.65,
        addedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
      },
    ],
    alerts: [
      {
        id: 'alt-1',
        symbol: 'RELIANCE',
        name: 'Reliance AI Score > 80',
        type: 'SCORE_ABOVE',
        threshold: 80,
        enabled: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'alt-2',
        symbol: 'ALL',
        name: 'Bullish Breakout Alert',
        type: 'BULLISH_BREAKOUT',
        enabled: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'alt-3',
        symbol: 'TCS',
        name: 'Volume Expansion 2x',
        type: 'VOLUME_2X',
        threshold: 2.0,
        enabled: true,
        createdAt: new Date().toISOString(),
      },
    ],
  },
  'user-2': {
    profile: {
      id: 'user-2',
      name: 'Pooja Sharma',
      email: 'pooja.sharma@invest.in',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
    },
    holdings: [
      {
        id: 'h-201',
        symbol: 'INFY',
        name: 'Infosys Ltd.',
        sector: 'Information Technology',
        quantity: 40,
        avgPrice: 1780.0,
        currentPrice: 1840.0,
        invested: 71200.0,
        currentValue: 73600.0,
        pnl: 2400.0,
        pnlPercent: 3.37,
        dayGain: 500.0,
        dayGainPercent: 0.68,
        updatedAt: new Date().toISOString(),
      },
    ],
    watchlist: [
      {
        symbol: 'ICICIBANK',
        name: 'ICICI Bank Ltd.',
        sector: 'Banking & Financials',
        price: 1280.0,
        change: 15.0,
        changePercent: 1.18,
        addedAt: new Date().toISOString(),
      },
    ],
    alerts: [],
  },
};

export function getUserData(userId: string = 'user-1'): UserDatabase {
  const normId = (userId || 'user-1').replace('_', '-');
  if (!USER_DATA[normId]) {
    USER_DATA[normId] = {
      profile: {
        id: normId,
        name: 'New Trader',
        email: `${normId}@nse-tracker.in`,
        avatar: '',
      },
      holdings: [],
      watchlist: [],
      alerts: [],
    };
  }
  return USER_DATA[normId];
}


export function getAllUsers(): UserProfile[] {
  return Object.values(USER_DATA).map((u) => u.profile);
}

export function addHolding(userId: string, holding: Omit<Holding, 'id' | 'updatedAt' | 'currentValue' | 'pnl' | 'pnlPercent' | 'dayGain' | 'dayGainPercent'>): Holding {
  const user = getUserData(userId);
  const invested = holding.quantity * holding.avgPrice;
  const currentValue = holding.quantity * holding.currentPrice;
  const pnl = currentValue - invested;
  const pnlPercent = invested > 0 ? (pnl / invested) * 100 : 0;

  const newHolding: Holding = {
    ...holding,
    id: `h-${Date.now()}`,
    invested: Math.round(invested * 100) / 100,
    currentValue: Math.round(currentValue * 100) / 100,
    pnl: Math.round(pnl * 100) / 100,
    pnlPercent: Math.round(pnlPercent * 100) / 100,
    dayGain: 0,
    dayGainPercent: 0,
    updatedAt: new Date().toISOString(),
  };

  user.holdings.push(newHolding);
  return newHolding;
}

export function updateHoldingPrices(userId: string, priceMap: Record<string, { price: number; changePercent: number }>): void {
  const user = getUserData(userId);
  for (const h of user.holdings) {
    const q = priceMap[h.symbol];
    if (q) {
      h.currentPrice = q.price;
      h.currentValue = Math.round(h.quantity * q.price * 100) / 100;
      h.pnl = Math.round((h.currentValue - h.invested) * 100) / 100;
      h.pnlPercent = h.invested > 0 ? Math.round((h.pnl / h.invested) * 10000) / 100 : 0;
      h.dayGain = Math.round(h.currentValue * (q.changePercent / 100) * 100) / 100;
      h.dayGainPercent = q.changePercent;
      h.updatedAt = new Date().toISOString();
    }
  }
}

export function deleteHolding(userId: string, holdingId: string): boolean {
  const user = getUserData(userId);
  const idx = user.holdings.findIndex((h) => h.id === holdingId);
  if (idx !== -1) {
    user.holdings.splice(idx, 1);
    return true;
  }
  return false;
}

export function addToWatchlist(userId: string, item: Omit<WatchlistItem, 'addedAt'>): WatchlistItem {
  const user = getUserData(userId);
  const existing = user.watchlist.find((w) => w.symbol.toUpperCase() === item.symbol.toUpperCase());
  if (existing) {
    return existing;
  }
  const newItem: WatchlistItem = {
    ...item,
    addedAt: new Date().toISOString(),
  };
  user.watchlist.push(newItem);
  return newItem;
}

export function removeFromWatchlist(userId: string, symbol: string): boolean {
  const user = getUserData(userId);
  const idx = user.watchlist.findIndex((w) => w.symbol.toUpperCase() === symbol.toUpperCase());
  if (idx !== -1) {
    user.watchlist.splice(idx, 1);
    return true;
  }
  return false;
}

export function addAlert(userId: string, alert: Omit<AlertRule, 'id' | 'createdAt'>): AlertRule {
  const user = getUserData(userId);
  const newAlert: AlertRule = {
    ...alert,
    id: `alt-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  user.alerts.push(newAlert);
  return newAlert;
}

export function toggleAlert(userId: string, alertId: string): AlertRule | null {
  const user = getUserData(userId);
  const alt = user.alerts.find((a) => a.id === alertId);
  if (alt) {
    alt.enabled = !alt.enabled;
    return alt;
  }
  return null;
}

export function deleteAlert(userId: string, alertId: string): boolean {
  const user = getUserData(userId);
  const idx = user.alerts.findIndex((a) => a.id === alertId);
  if (idx !== -1) {
    user.alerts.splice(idx, 1);
    return true;
  }
  return false;
}

export function evaluateAlerts(userId: string, scanResults: StockScanResult[]): AlertRule[] {
  const user = getUserData(userId);
  const triggered: AlertRule[] = [];

  for (const alt of user.alerts) {
    if (!alt.enabled) continue;

    const matchingScans = alt.symbol === 'ALL'
      ? scanResults
      : scanResults.filter((s) => s.symbol.toUpperCase() === alt.symbol.toUpperCase());

    for (const scan of matchingScans) {
      let isTriggered = false;
      let msg = '';

      if (alt.type === 'SCORE_ABOVE' && scan.score >= (alt.threshold ?? 80)) {
        isTriggered = true;
        msg = `${scan.symbol} reached AI Score ${scan.score}/100 (${scan.signal})`;
      } else if (alt.type === 'BULLISH_BREAKOUT' && scan.patterns.some((p) => p.pattern.includes('Breakout'))) {
        isTriggered = true;
        msg = `${scan.symbol} triggered Resistance Breakout above ₹${scan.indicators.nearestResistance}`;
      } else if (alt.type === 'BEARISH_BREAKDOWN' && scan.patterns.some((p) => p.pattern.includes('Breakdown'))) {
        isTriggered = true;
        msg = `${scan.symbol} triggered Breakdown below ₹${scan.indicators.nearestSupport}`;
      } else if (alt.type === 'VOLUME_2X' && scan.indicators.volumeRatio >= (alt.threshold ?? 2.0)) {
        isTriggered = true;
        msg = `${scan.symbol} volume expanded to ${scan.indicators.volumeRatio}x average`;
      } else if (alt.type === 'EMA_CROSS_BULLISH' && scan.patterns.some((p) => p.pattern.includes('Golden') || p.pattern.includes('Bullish Cross'))) {
        isTriggered = true;
        msg = `${scan.symbol} formed Bullish EMA Crossover`;
      } else if (alt.type === '52W_HIGH' && scan.patterns.some((p) => p.pattern.includes('52-Week High'))) {
        isTriggered = true;
        msg = `${scan.symbol} broke into new 52-week high territory ₹${scan.indicators.fiftyTwoWeekHigh}`;
      }

      if (isTriggered) {
        alt.lastTriggered = new Date().toISOString();
        alt.triggerMessage = msg;
        triggered.push(alt);
        break;
      }
    }
  }

  return triggered;
}
