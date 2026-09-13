import React, { useState } from 'react';
import {
  BarChart2,
  CheckCircle2,
  ChevronDown,
  Clock,
  Play,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  XCircle,
} from 'lucide-react';
import { BacktestSummary } from '../types.ts';

interface BacktestViewProps {
  onRunBacktest: (minScore: number) => Promise<BacktestSummary>;
  initialData?: BacktestSummary | null;
}

export const BacktestView: React.FC<BacktestViewProps> = ({
  onRunBacktest,
  initialData,
}) => {
  const [data, setData] = useState<BacktestSummary | null>(initialData || null);
  const [isRunning, setIsRunning] = useState(false);
  const [minScore, setMinScore] = useState(75);
  const [filterSignal, setFilterSignal] = useState<'ALL' | 'WIN' | 'LOSS'>('ALL');

  const handleRun = async () => {
    setIsRunning(true);
    try {
      const res = await onRunBacktest(minScore);
      setData(res);
    } finally {
      setIsRunning(false);
    }
  };

  const filteredRecords = data?.records.filter((r) => {
    if (filterSignal === 'ALL') return true;
    return r.status === filterSignal;
  }) || [];

  return (
    <div id="backtest-view" className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <BarChart2 className="h-6 w-6 text-indigo-400" />
            Algorithmic Walk-Forward Backtester
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Empirical historical validation on real NSE historical price series (zero look-ahead bias)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Min Score:</span>
            <select
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-white font-mono"
            >
              <option value={70}>70+ (Moderate)</option>
              <option value={75}>75+ (High Conviction)</option>
              <option value={80}>80+ (Elite)</option>
            </select>
          </div>

          <button
            id="run-backtest-btn"
            onClick={handleRun}
            disabled={isRunning}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-500 disabled:opacity-50 transition"
          >
            {isRunning ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
            {isRunning ? 'Simulating Historical Trades...' : 'Run Walk-Forward Backtest'}
          </button>
        </div>
      </div>

      {data ? (
        <>
          {/* Summary Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-3.5">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Trades</span>
              <p className="mt-1 font-mono text-xl font-bold text-white">{data.totalSignals}</p>
              <span className="text-[10px] text-slate-400">
                {data.bullishSignals} Bull / {data.bearishSignals} Bear
              </span>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900 p-3.5">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">5-Day Win Rate</span>
              <p className="mt-1 font-mono text-xl font-bold text-emerald-400">{data.winRate5d}%</p>
              <span className="text-[10px] text-slate-400">Short-term momentum</span>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900 p-3.5">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">10-Day Win Rate</span>
              <p className="mt-1 font-mono text-xl font-bold text-emerald-400">{data.winRate10d}%</p>
              <span className="text-[10px] text-slate-400">Swing continuation</span>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900 p-3.5">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">20-Day Win Rate</span>
              <p className="mt-1 font-mono text-xl font-bold text-emerald-400">{data.winRate20d}%</p>
              <span className="text-[10px] text-slate-400">Positional cycle</span>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900 p-3.5">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Avg Return (20d)</span>
              <p className={`mt-1 font-mono text-xl font-bold ${data.averageReturn >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {data.averageReturn >= 0 ? '+' : ''}{data.averageReturn}%
              </p>
              <span className="text-[10px] text-slate-400">Median: {data.medianReturn}%</span>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900 p-3.5">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Max Drawdown</span>
              <p className="mt-1 font-mono text-xl font-bold text-rose-400">{data.maxDrawdown}%</p>
              <span className="text-[10px] text-slate-400">Risk benchmark</span>
            </div>
          </div>

          {/* Records Table Header & Filters */}
          <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 bg-slate-950/60 px-5 py-3 text-xs">
              <span className="font-bold text-white">Historical Trade Log ({filteredRecords.length} Signals)</span>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setFilterSignal('ALL')}
                  className={`px-2.5 py-1 rounded font-semibold transition ${
                    filterSignal === 'ALL' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All Trades
                </button>
                <button
                  onClick={() => setFilterSignal('WIN')}
                  className={`px-2.5 py-1 rounded font-semibold transition ${
                    filterSignal === 'WIN' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Winning Setups
                </button>
                <button
                  onClick={() => setFilterSignal('LOSS')}
                  className={`px-2.5 py-1 rounded font-semibold transition ${
                    filterSignal === 'LOSS' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Drawdown Trades
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-800 bg-slate-950/80 font-semibold uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-4 py-3">Date & Stock</th>
                    <th className="px-3 py-3">Signal</th>
                    <th className="px-3 py-3 text-center">Score</th>
                    <th className="px-3 py-3 text-right">Entry (₹)</th>
                    <th className="px-3 py-3 text-right">5D Return</th>
                    <th className="px-3 py-3 text-right">10D Return</th>
                    <th className="px-3 py-3 text-right">20D Return</th>
                    <th className="px-3 py-3 text-right">Max Gain</th>
                    <th className="px-3 py-3 text-right">Max Drawdown</th>
                    <th className="px-4 py-3 text-center">Outcome</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {filteredRecords.map((r) => {
                    const isWin = r.status === 'WIN';
                    return (
                      <tr key={r.id} className="hover:bg-slate-800/40 transition">
                        <td className="px-4 py-3 font-mono">
                          <div className="font-bold text-white">{r.symbol}</div>
                          <div className="text-[10px] text-slate-400">{r.signal_date}</div>
                        </td>
                        <td className="px-3 py-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              r.signal.includes('BULLISH')
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : 'bg-rose-950 text-rose-400 border border-rose-800'
                            }`}
                          >
                            {r.signal}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-center font-mono font-bold text-white">{r.score}</td>
                        <td className="px-3 py-3 text-right font-mono">₹{r.entry_price.toFixed(2)}</td>
                        <td
                          className={`px-3 py-3 text-right font-mono font-semibold ${
                            r.return_5d !== null && r.return_5d >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {r.return_5d !== null ? `${r.return_5d >= 0 ? '+' : ''}${r.return_5d}%` : '-'}
                        </td>
                        <td
                          className={`px-3 py-3 text-right font-mono font-semibold ${
                            r.return_10d !== null && r.return_10d >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {r.return_10d !== null ? `${r.return_10d >= 0 ? '+' : ''}${r.return_10d}%` : '-'}
                        </td>
                        <td
                          className={`px-3 py-3 text-right font-mono font-bold ${
                            r.return_20d !== null && r.return_20d >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {r.return_20d !== null ? `${r.return_20d >= 0 ? '+' : ''}${r.return_20d}%` : '-'}
                        </td>
                        <td className="px-3 py-3 text-right font-mono text-emerald-400 font-semibold">
                          +{r.maximum_gain}%
                        </td>
                        <td className="px-3 py-3 text-right font-mono text-rose-400 font-semibold">
                          {r.maximum_drawdown}%
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                              isWin
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            }`}
                          >
                            {isWin ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="py-20 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/40">
          <BarChart2 className="h-12 w-12 mx-auto text-indigo-400 mb-3" />
          <h3 className="text-base font-bold text-white">Historical Validation Ready</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-4">
            Click "Run Walk-Forward Backtest" to evaluate thousands of candles across the top NSE universe without look-ahead bias.
          </p>
          <button
            onClick={handleRun}
            disabled={isRunning}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-indigo-500"
          >
            {isRunning ? 'Processing...' : 'Start Backtest Simulation'}
          </button>
        </div>
      )}
    </div>
  );
};
