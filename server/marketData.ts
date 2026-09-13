export * from './marketData/index.ts';
import { marketDataService } from './marketData/index.ts';

// Singleton market data provider instance for server operations
export const marketDataProvider = marketDataService;
