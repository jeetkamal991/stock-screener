import React, { useMemo, useState } from 'react';
import {
  Activity,
  ArrowDownRight,
  ArrowUpDown,
  ArrowUpRight,
  ChevronDown,
  Eye,
  Filter,
  Layers,
  LayoutGrid,
  List,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Zap,
} from 'lucide-react';
import {
  Holding,
  NiftyMarketConfirmation,
  ScannerFilterOptions,
  ScannerPresetType,
  ScannerSummary,
  StockScanResult,
} from '../types.ts';

interface ScannerViewProps {
  results: StockScanResult[];
  summary: ScannerSummary | null;
  isLoading: boolean;
  onRefreshScan: (universe: string, timeframe: 'daily' | 'weekly', refresh?: boolean) => void;
  onSelectStock: (stock: StockScanResult) => void;
  onAddToWatchlist: (stock: StockScanResult) => void;
  universe: string;
  setUniverse: (u: string) => void;
  timeframe: 'daily' | 'weekly';
  setTimeframe: (tf: 'daily' | 'weekly') => void;
  userHoldings: Holding[];
  availableUniverses: Array<{ id: string; label: string }>;
  availableSectors: string[];
}

export const ScannerView: React.FC<ScannerViewProps> = ({
  results,
  summary,
  isLoading,
  onRefreshScan,
  onSelectStock,
  onAddToWatchlist,
  universe,
  setUniverse,
  timeframe,
  setTimeframe,
  userHoldings,
  availableUniverses,
  availableSectors,
}) => {
  // Local Filter & Sorting State
  const [selectedPreset, setSelectedPreset] = useState<ScannerPresetType | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Advanced filter criteria
  const [minScore, setMinScore] = useState<number>(0);
  const [selectedSector, setSelectedSector] = useState<string>('ALL');
  const [signalFilter, setSignalFilter] = useState<string>('ALL');
  const [minVolumeRatio, setMinVolumeRatio] = useState<number>(0);
  const [onlyHoldings, setOnlyHoldings] = useState(false);
  const [onlyWatchlist, setOnlyWatchlist] = useState(false);
  const [aboveEma20, setAboveEma20] = useState(false);
  const [aboveEma50, setAboveEma50] = useState(false);
  const [aboveEma200, setAboveEma200] = useState(false);

  // Sorting
  const [sortBy, setSortBy] = useState<'score' | 'changePercent' | 'volumeRatio' | 'price' | 'rsi'>('score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filter Pipeline
  const filteredAndSortedResults = useMemo(() => {
    let list = results.filter((item) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const sym = item.symbol.toLowerCase();
        const name = item.name.toLowerCase();
        if (!sym.includes(q) && !name.includes(q)) return false;
      }

      // 2. Preset Filter
      if (selectedPreset !== 'ALL') {
        switch (selectedPreset) {
          case 'BULLISH_BREAKOUT':
            if (!item.patterns.some((p) => p.pattern.includes('Breakout') && p.direction === 'BULLISH')) return false;
            break;
          case 'BEARISH_BREAKDOWN':
            if (!item.patterns.some((p) => p.pattern.includes('Breakdown') && p.direction === 'BEARISH')) return false;
            break;
          case 'GOLDEN_CROSS':
            if (!item.patterns.some((p) => p.pattern.includes('Golden') || p.pattern.includes('Bullish Cross'))) return false;
            break;
          case 'DEATH_CROSS':
            if (!item.patterns.some((p) => p.pattern.includes('Death') || p.pattern.includes('Bearish Cross'))) return false;
            break;
          case 'HIGH_VOLUME':
            if (item.indicators.volumeRatio < 1.8) return false;
            break;
          case 'MOMENTUM_LEADERS':
            if (item.score < 75) return false;
            break;
          case 'OVERSOLD_REVERSAL':
            if (item.indicators.rsi14 > 40) return false;
            break;
          case '52W_HIGH':
            if (item.indicators.distFrom52wHigh < -3.0) return false;
            break;
          case '52W_LOW':
            if (item.indicators.distFrom52wLow > 3.0) return false;
            break;
          case 'TIGHT_CONSOLIDATION':
            if (item.indicators.bollingerBands.bandwidth > 6.0) return false;
            break;
        }
      }

      // 3. Score
      if (item.score < minScore) return false;

      // 4. Sector
      if (selectedSector !== 'ALL' && item.sector !== selectedSector) return false;

      // 5. Signal Filter
      if (signalFilter !== 'ALL') {
        if (signalFilter === 'BULLISH_ALL' && !item.signal.includes('BULLISH')) return false;
        if (signalFilter === 'BEARISH_ALL' && !item.signal.includes('BEARISH')) return false;
        if (signalFilter !== 'BULLISH_ALL' && signalFilter !== 'BEARISH_ALL' && item.signal !== signalFilter) return false;
      }

      // 6. Volume Ratio
      if (minVolumeRatio > 0 && item.indicators.volumeRatio < minVolumeRatio) return false;

      // 7. Moving Averages
      if (aboveEma20 && item.indicators.priceVsEma20 <= 0) return false;
      if (aboveEma50 && item.indicators.priceVsEma50 <= 0) return false;
      if (aboveEma200 && item.indicators.priceVsEma200 <= 0) return false;

      // 8. Holdings / Watchlist
      if (onlyHoldings && !item.isHolding) return false;
      if (onlyWatchlist && !item.isWatchlist) return false;

      return true;
    });

    // Sorting
    list.sort((a, b) => {
      let valA = 0;
      let valB = 0;
      if (sortBy === 'score') {
        valA = a.score;
        valB = b.score;
      } else if (sortBy === 'changePercent') {
        valA = a.changePercent;
        valB = b.changePercent;
      } else if (sortBy === 'volumeRatio') {
        valA = a.indicators.volumeRatio;
        valB = b.indicators.volumeRatio;
      } else if (sortBy === 'price') {
        valA = a.price;
        valB = b.price;
      } else if (sortBy === 'rsi') {
        valA = a.indicators.rsi14;
        valB = b.indicators.rsi14;
      }

      return sortOrder === 'desc' ? valB - valA : valA - valB;
    });

    return list;
  }, [
    results,
    searchQuery,
    selectedPreset,
    minScore,
    selectedSector,
    signalFilter,
    minVolumeRatio,
    aboveEma20,
    aboveEma50,
    aboveEma200,
    onlyHoldings,
    onlyWatchlist,
    sortBy,
    sortOrder,
  ]);

  const toggleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const getScoreColor = (sc: number) => {
    if (sc >= 80) return 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60';
    if (sc >= 65) return 'text-teal-400 bg-teal-950/60 border-teal-800/60';
    if (sc >= 50) return 'text-amber-400 bg-amber-950/60 border-amber-800/60';
    if (sc >= 35) return 'text-orange-400 bg-orange-950/60 border-orange-800/60';
    return 'text-rose-400 bg-rose-950/60 border-rose-800/60';
  };

  const getSignalBadge = (sig: string) => {
    if (sig === 'STRONG BULLISH') return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    if (sig === 'BULLISH') return 'bg-teal-500/20 text-teal-300 border-teal-500/40';
    if (sig === 'NEUTRAL') return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    if (sig === 'BEARISH') return 'bg-orange-500/20 text-orange-300 border-orange-500/40';
    return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
  };

  const PRESETS: Array<{ id: ScannerPresetType | 'ALL'; label: string }> = [
    { id: 'ALL', label: 'All Stocks' },
    { id: 'MOMENTUM_LEADERS', label: 'Momentum Leaders (75+)' },
    { id: 'BULLISH_BREAKOUT', label: 'Bullish Breakouts' },
    { id: 'GOLDEN_CROSS', label: 'Golden Cross (50/200)' },
    { id: 'HIGH_VOLUME', label: 'High Volume (> 1.8x)' },
    { id: '52W_HIGH', label: '52-Week High Breakout' },
    { id: 'OVERSOLD_REVERSAL', label: 'Oversold Reversals' },
    { id: 'TIGHT_CONSOLIDATION', label: 'Tight Squeeze' },
    { id: 'BEARISH_BREAKDOWN', label: 'Bearish Breakdowns' },
    { id: 'DEATH_CROSS', label: 'Death Cross' },
  ];

  return (
    <div id="ai-scanner-view" className="space-y-6">
      {/* Top Banner & Scanner Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Sparkles className="h-6 w-6 text-indigo-400" />
            AI Stock Scanner (NSE)
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Quantitative scoring (0–100) with NIFTY macro and sector confirmation
          </p>
        </div>

        {/* Primary Scanner Action Bar */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Universe Selector */}
          <div className="flex items-center rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs">
            <span className="text-slate-400 mr-2">Universe:</span>
            <select
              value={universe}
              onChange={(e) => {
                setUniverse(e.target.value);
                onRefreshScan(e.target.value, timeframe, true);
              }}
              className="bg-transparent font-semibold text-white focus:outline-none"
            >
              {availableUniverses.map((u) => (
                <option key={u.id} value={u.id} className="bg-slate-900 text-white">
                  {u.label}
                </option>
              ))}
            </select>
          </div>

          {/* Timeframe Toggle */}
          <div className="flex items-center rounded-lg bg-slate-900 border border-slate-800 p-0.5 text-xs">
            <button
              onClick={() => {
                setTimeframe('daily');
                onRefreshScan(universe, 'daily');
              }}
              className={`px-2.5 py-1 rounded font-semibold transition ${
                timeframe === 'daily' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => {
                setTimeframe('weekly');
                onRefreshScan(universe, 'weekly');
              }}
              className={`px-2.5 py-1 rounded font-semibold transition ${
                timeframe === 'weekly' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Weekly
            </button>
          </div>

          {/* Scan Now Refresh Button */}
          <button
            id="scanner-refresh-btn"
            onClick={() => onRefreshScan(universe, timeframe, true)}
            disabled={isLoading}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-500 disabled:opacity-50 transition"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Scanning NSE...' : 'Run Scan'}
          </button>
        </div>
      </div>

      {/* Market Breadth & Summary Stat Bar */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-3 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Scanned</span>
            <p className="mt-0.5 font-mono text-xl font-bold text-white">{summary.totalScanned}</p>
            <span className="text-[10px] text-slate-400">Total Equities</span>
          </div>

          <div className="rounded-xl border border-emerald-900/40 bg-emerald-950/20 p-3 shadow-sm">
            <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">Strong Bullish</span>
            <p className="mt-0.5 font-mono text-xl font-bold text-emerald-400">{summary.strongBullishCount}</p>
            <span className="text-[10px] text-emerald-500/80">Score 80-100</span>
          </div>

          <div className="rounded-xl border border-teal-900/40 bg-teal-950/20 p-3 shadow-sm">
            <span className="text-[11px] font-semibold text-teal-400 uppercase tracking-wider">Bullish Setups</span>
            <p className="mt-0.5 font-mono text-xl font-bold text-teal-400">{summary.bullishCount}</p>
            <span className="text-[10px] text-teal-500/80">Score 65-79</span>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-3 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Neutral / Watch</span>
            <p className="mt-0.5 font-mono text-xl font-bold text-slate-300">{summary.neutralCount}</p>
            <span className="text-[10px] text-slate-400">Score 50-64</span>
          </div>

          <div className="rounded-xl border border-rose-900/40 bg-rose-950/20 p-3 shadow-sm">
            <span className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider">Bearish Signals</span>
            <p className="mt-0.5 font-mono text-xl font-bold text-rose-400">
              {summary.bearishCount + summary.strongBearishCount}
            </p>
            <span className="text-[10px] text-rose-500/80">Score &lt; 50</span>
          </div>

          <div className="rounded-xl border border-indigo-900/40 bg-indigo-950/20 p-3 shadow-sm">
            <span className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider">Breakouts</span>
            <p className="mt-0.5 font-mono text-xl font-bold text-indigo-300">{summary.breakoutCount}</p>
            <span className="text-[10px] text-indigo-400">Resistance breach</span>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-3 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Market Breadth</span>
            <div className="mt-1 flex items-center gap-1.5 text-xs font-mono font-bold">
              <span className="text-emerald-400">{summary.marketBreadth.advancing}▲</span>
              <span className="text-slate-400">/</span>
              <span className="text-rose-400">{summary.marketBreadth.declining}▼</span>
            </div>
            <span className="text-[10px] text-slate-400">A/D Ratio</span>
          </div>
        </div>
      )}

      {/* Preset Strategy Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
        {PRESETS.map((p) => {
          const isSelected = selectedPreset === p.id;
          return (
            <button
              key={p.id}
              onClick={() => setSelectedPreset(p.id)}
              className={`flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white hover:bg-slate-800'
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {/* Search, View Toggles & Advanced Filter Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search stock symbol or company name (e.g. TATA, RELIANCE)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-800 bg-slate-900 pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Advanced Filters Button */}
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition ${
              showAdvancedFilters || minScore > 0 || selectedSector !== 'ALL' || onlyHoldings
                ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filters {(minScore > 0 || selectedSector !== 'ALL' || onlyHoldings) && '•'}
          </button>

          {/* View Mode Toggle */}
          <div className="flex items-center rounded-lg bg-slate-900 border border-slate-800 p-0.5">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded transition ${
                viewMode === 'table' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Table View"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded transition ${
                viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Grid Cards View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Filter Drawer */}
      {showAdvancedFilters && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/95 p-4 shadow-xl space-y-4 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            {/* Min Score */}
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Minimum AI Score:</span>
                <span className="font-mono font-bold text-indigo-400">{minScore}/100</span>
              </div>
              <input
                type="range"
                min="0"
                max="90"
                step="5"
                value={minScore}
                onChange={(e) => setMinScore(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>

            {/* Sector Filter */}
            <div>
              <label className="block text-slate-300 mb-1">Sector Filter</label>
              <select
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-white"
              >
                <option value="ALL">All Sectors</option>
                {availableSectors.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Signal Classification Filter */}
            <div>
              <label className="block text-slate-300 mb-1">Signal Type</label>
              <select
                value={signalFilter}
                onChange={(e) => setSignalFilter(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-white"
              >
                <option value="ALL">All Signals</option>
                <option value="BULLISH_ALL">All Bullish (Score 65+)</option>
                <option value="STRONG BULLISH">Strong Bullish Only</option>
                <option value="NEUTRAL">Neutral / Consolidating</option>
                <option value="BEARISH_ALL">All Bearish (Score &lt; 50)</option>
              </select>
            </div>

            {/* Min Volume Ratio */}
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Min Volume Expansion:</span>
                <span className="font-mono font-bold text-indigo-400">
                  {minVolumeRatio === 0 ? 'Any' : `${minVolumeRatio}x`}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="3.0"
                step="0.2"
                value={minVolumeRatio}
                onChange={(e) => setMinVolumeRatio(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>
          </div>

          {/* Checkbox filters */}
          <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-slate-800 text-xs text-slate-300">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={aboveEma20}
                onChange={(e) => setAboveEma20(e.target.checked)}
                className="rounded accent-indigo-500"
              />
              <span>Price &gt; EMA20</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={aboveEma50}
                onChange={(e) => setAboveEma50(e.target.checked)}
                className="rounded accent-indigo-500"
              />
              <span>Price &gt; EMA50</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={aboveEma200}
                onChange={(e) => setAboveEma200(e.target.checked)}
                className="rounded accent-indigo-500"
              />
              <span>Price &gt; EMA200 (Long-Term Uptrend)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={onlyHoldings}
                onChange={(e) => setOnlyHoldings(e.target.checked)}
                className="rounded accent-indigo-500"
              />
              <span className="text-emerald-400 font-medium">My Active Holdings Only</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={onlyWatchlist}
                onChange={(e) => setOnlyWatchlist(e.target.checked)}
                className="rounded accent-indigo-500"
              />
              <span className="text-amber-400 font-medium">My Watchlist Only</span>
            </label>

            {/* Reset */}
            <button
              onClick={() => {
                setMinScore(0);
                setSelectedSector('ALL');
                setSignalFilter('ALL');
                setMinVolumeRatio(0);
                setAboveEma20(false);
                setAboveEma50(false);
                setAboveEma200(false);
                setOnlyHoldings(false);
                setOnlyWatchlist(false);
              }}
              className="ml-auto text-xs text-slate-400 hover:text-white underline"
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}

      {/* Results Table View */}
      {viewMode === 'table' && (
        <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 bg-slate-950/80 font-semibold uppercase tracking-wider text-slate-400 select-none">
                <tr>
                  <th className="px-5 py-3.5">Stock & Sector</th>
                  <th
                    onClick={() => toggleSort('price')}
                    className="px-4 py-3.5 text-right cursor-pointer hover:text-white"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Price</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th
                    onClick={() => toggleSort('changePercent')}
                    className="px-4 py-3.5 text-right cursor-pointer hover:text-white"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Change</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th
                    onClick={() => toggleSort('volumeRatio')}
                    className="px-4 py-3.5 text-center cursor-pointer hover:text-white"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>Volume (xAvg)</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th
                    onClick={() => toggleSort('rsi')}
                    className="px-3 py-3.5 text-center cursor-pointer hover:text-white"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>RSI (14)</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th className="px-4 py-3.5">Detected Pattern</th>
                  <th className="px-3 py-3.5 text-center">NIFTY / Sector</th>
                  <th
                    onClick={() => toggleSort('score')}
                    className="px-4 py-3.5 text-center cursor-pointer hover:text-white"
                  >
                    <div className="flex items-center justify-center gap-1 text-indigo-400 font-bold">
                      <span>AI Score</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th className="px-4 py-3.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {isLoading ? (
                  <tr>
                    <td colSpan={9} className="py-16 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <RefreshCw className="h-6 w-6 animate-spin text-indigo-500" />
                        <span className="text-sm font-semibold text-slate-300">Scanning NSE Universe...</span>
                        <span className="text-xs text-slate-500">Calculating EMA, RSI, ADX, and patterns</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredAndSortedResults.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-16 text-center text-slate-400">
                      No stocks matched your active filter criteria. Try selecting "All Stocks" or adjusting filters.
                    </td>
                  </tr>
                ) : (
                  filteredAndSortedResults.map((stock) => {
                    const isUp = stock.change >= 0;
                    const pat = stock.patterns[0];
                    return (
                      <tr
                        key={stock.symbol}
                        onClick={() => onSelectStock(stock)}
                        className="hover:bg-slate-800/50 cursor-pointer transition"
                      >
                        {/* Stock & Sector */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm hover:text-indigo-400 transition">
                              {stock.symbol}
                            </span>
                            {stock.isHolding && (
                              <span className="rounded bg-emerald-500/20 px-1.5 py-0.2 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                                HOLDING
                              </span>
                            )}
                            {stock.isWatchlist && (
                              <span className="rounded bg-amber-500/20 px-1.5 py-0.2 text-[10px] font-bold text-amber-400 border border-amber-500/30">
                                WATCH
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate max-w-[190px]">{stock.name}</div>
                          <span className="inline-block mt-0.5 rounded bg-slate-800 px-1.5 py-0.2 text-[10px] text-slate-400">
                            {stock.sector}
                          </span>
                        </td>

                        {/* Price */}
                        <td className="px-4 py-3.5 text-right font-mono font-bold text-white">
                          ₹{stock.price.toFixed(2)}
                        </td>

                        {/* Change % */}
                        <td className="px-4 py-3.5 text-right font-mono">
                          <div
                            className={`flex items-center justify-end font-semibold ${
                              isUp ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {isUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                            {isUp ? '+' : ''}{stock.changePercent.toFixed(2)}%
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {isUp ? '+' : ''}{stock.change.toFixed(2)}
                          </div>
                        </td>

                        {/* Volume Ratio */}
                        <td className="px-4 py-3.5 text-center font-mono">
                          <div className="flex items-center justify-center gap-1.5">
                            <span
                              className={`font-bold ${
                                stock.indicators.volumeRatio >= 1.8
                                  ? 'text-indigo-400 font-black'
                                  : stock.indicators.volumeRatio >= 1.0
                                  ? 'text-slate-200'
                                  : 'text-slate-500'
                              }`}
                            >
                              {stock.indicators.volumeRatio.toFixed(2)}x
                            </span>
                            {stock.indicators.volumeRatio >= 1.8 && (
                              <span className="rounded bg-indigo-500/20 px-1 py-0.2 text-[9px] text-indigo-300 font-bold">
                                SURGE
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {(stock.volume / 100000).toFixed(1)}L
                          </div>
                        </td>

                        {/* RSI 14 */}
                        <td className="px-3 py-3.5 text-center font-mono">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              stock.indicators.rsi14 >= 60
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : stock.indicators.rsi14 <= 35
                                ? 'bg-rose-950 text-rose-400 border border-rose-800'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {stock.indicators.rsi14}
                          </span>
                        </td>

                        {/* Pattern */}
                        <td className="px-4 py-3.5">
                          {pat ? (
                            <div>
                              <span
                                className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                                  pat.direction === 'BULLISH'
                                    ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                                    : 'bg-rose-950/80 text-rose-300 border border-rose-800'
                                }`}
                              >
                                {pat.pattern}
                              </span>
                              <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[180px]">
                                {pat.confidence} Conf • ₹{pat.resistance || pat.support}
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-500 text-[11px]">{stock.primary_signal}</span>
                          )}
                        </td>

                        {/* Confirmation */}
                        <td className="px-3 py-3.5 text-center text-[11px]">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              stock.sector_conf.confirmation === 'STRONG'
                                ? 'text-emerald-400 bg-emerald-950/40'
                                : stock.sector_conf.confirmation === 'CONFLICTING'
                                ? 'text-rose-400 bg-rose-950/40'
                                : 'text-slate-400 bg-slate-800/40'
                            }`}
                          >
                            {stock.sector_conf.confirmation}
                          </span>
                        </td>

                        {/* AI Score */}
                        <td className="px-4 py-3.5 text-center font-mono">
                          <div className="flex flex-col items-center">
                            <span
                              className={`flex h-8 w-11 items-center justify-center rounded-lg border font-bold text-sm shadow-sm ${getScoreColor(
                                stock.score
                              )}`}
                            >
                              {stock.score}
                            </span>
                            <span
                              className={`mt-1 text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${getSignalBadge(
                                stock.signal
                              )}`}
                            >
                              {stock.signal.replace('STRONG ', '')}
                            </span>
                          </div>
                        </td>

                        {/* Action */}
                        <td
                          className="px-4 py-3.5 text-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => onSelectStock(stock)}
                            className="flex items-center gap-1 mx-auto rounded-lg bg-indigo-600/20 px-2.5 py-1 text-[11px] font-semibold text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600 hover:text-white transition"
                          >
                            <Sparkles className="h-3 w-3" />
                            Explain
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Results Grid Cards View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAndSortedResults.map((stock) => {
            const isUp = stock.change >= 0;
            const pat = stock.patterns[0];
            return (
              <div
                key={stock.symbol}
                onClick={() => onSelectStock(stock)}
                className="rounded-xl border border-slate-800 bg-slate-900 p-4 shadow-lg hover:border-slate-700 cursor-pointer transition space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-base">{stock.symbol}</span>
                        {stock.isHolding && (
                          <span className="rounded bg-emerald-500/20 px-1.5 py-0.2 text-[10px] font-bold text-emerald-400">
                            HOLDING
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 truncate max-w-[180px]">{stock.name}</p>
                    </div>

                    <div className="text-right">
                      <span
                        className={`flex h-8 w-11 items-center justify-center rounded-lg border font-bold text-sm font-mono ${getScoreColor(
                          stock.score
                        )}`}
                      >
                        {stock.score}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-baseline justify-between border-t border-slate-800/80 pt-2">
                    <span className="font-mono text-lg font-bold text-white">₹{stock.price.toFixed(2)}</span>
                    <span
                      className={`font-mono text-xs font-semibold flex items-center ${
                        isUp ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isUp ? '+' : ''}{stock.changePercent.toFixed(2)}%
                    </span>
                  </div>

                  {pat && (
                    <div className="mt-2 rounded bg-slate-950 p-2 border border-slate-800/80 text-xs">
                      <span className="font-bold text-indigo-300">{pat.pattern}</span>
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{pat.description}</p>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span>Vol: {stock.indicators.volumeRatio}x</span>
                  <span>RSI: {stock.indicators.rsi14}</span>
                  <span className="text-indigo-400 font-semibold flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    Explain
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
