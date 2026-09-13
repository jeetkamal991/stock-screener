import React from 'react';
import { ArrowDownRight, ArrowUpRight, Filter, Layers, AlertCircle, TrendingUp, Gauge } from 'lucide-react';
import { NiftyMarketConfirmation } from '../types.ts';

interface SectorItem {
  sector: string;
  name: string;
  symbol: string;
  status?: 'OK' | 'UNAVAILABLE';
  quote?: any;
  price?: number;
  changePercent?: number;
  return20D?: number;
  rsi14?: number;
  momentumScore?: number;
  error?: string;
}

interface SectorMomentumViewProps {
  sectors: SectorItem[];
  nifty: NiftyMarketConfirmation | null;
  onFilterBySector: (sectorName: string) => void;
}

export const SectorMomentumView: React.FC<SectorMomentumViewProps> = ({
  sectors,
  nifty,
  onFilterBySector,
}) => {
  const getTrendBadge = (changePercent?: number) => {
    if (changePercent === undefined) return 'bg-slate-800 text-slate-400 border border-slate-700';
    if (changePercent >= 1.5) return 'bg-emerald-950/70 text-emerald-400 border-emerald-800/60 border';
    if (changePercent > 0) return 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40 border';
    if (changePercent <= -1.5) return 'bg-rose-950/70 text-rose-400 border-rose-800/60 border';
    return 'bg-rose-950/40 text-rose-300 border-rose-800/40 border';
  };

  const getMomentumScoreColor = (score?: number) => {
    if (score === undefined) return 'text-slate-400';
    if (score >= 65) return 'text-emerald-400';
    if (score >= 45) return 'text-amber-400';
    return 'text-rose-400';
  };

  return (
    <div id="sector-momentum-view" className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Layers className="h-6 w-6 text-indigo-400" />
            NSE Sector Momentum & Relative Strength
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real institutional sector rotations, 20-day returns, and RSI momentum relative to NIFTY 50
          </p>
        </div>

        {nifty && nifty.niftyPrice > 0 && (
          <div className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-xs flex items-center gap-2">
            <span className="text-slate-400">Benchmark:</span>
            <span className="font-bold text-white">NIFTY 50 (₹{nifty.niftyPrice.toFixed(1)})</span>
            <span className={`font-mono font-semibold ${nifty.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {nifty.change >= 0 ? '+' : ''}{nifty.changePercent.toFixed(2)}%
            </span>
          </div>
        )}
      </div>

      {/* Sector Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sectors.map((s) => {
          const isUnavailable = s.status === 'UNAVAILABLE' || (!s.quote && s.price === undefined);
          const q = s.quote;
          const price = s.price ?? q?.price;
          const change = q?.change;
          const changePercent = s.changePercent ?? q?.changePercent;
          const isUp = (changePercent ?? 0) >= 0;

          if (isUnavailable || price === undefined) {
            return (
              <div
                key={s.sector}
                className="rounded-xl border border-dashed border-slate-800 bg-slate-900/50 p-5 flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-base font-bold text-white">{s.sector}</h3>
                      <p className="text-xs text-slate-400 font-mono">{s.name} ({s.symbol})</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-950/40 text-amber-400 border border-amber-800/40 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Unavailable
                    </span>
                  </div>

                  <div className="mt-6 rounded-lg bg-slate-800/40 p-3 text-center">
                    <p className="text-xs text-slate-400">
                      Live market data temporarily unavailable from upstream provider.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onFilterBySector(s.sector)}
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition"
                >
                  <Filter className="h-3.5 w-3.5" />
                  Scan {s.sector} Universe
                </button>
              </div>
            );
          }

          // Relative strength vs Nifty 50
          const niftyChange = nifty?.changePercent ?? 0;
          const relStrength = changePercent !== undefined ? Math.round((changePercent - niftyChange) * 100) / 100 : 0;
          const isOutperforming = relStrength >= 0;

          return (
            <div
              key={s.sector}
              className="rounded-xl border border-slate-800 bg-slate-900 p-5 shadow-lg hover:border-slate-700 transition flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-white">{s.sector}</h3>
                    <p className="text-xs text-slate-400 font-mono">{s.name} ({s.symbol})</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getTrendBadge(changePercent)}`}>
                    {changePercent !== undefined ? `${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%` : 'Active'}
                  </span>
                </div>

                <div className="mt-4 flex items-baseline justify-between">
                  <div className="font-mono text-xl font-bold text-white">
                    ₹{price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </div>
                  {changePercent !== undefined && (
                    <div className={`flex items-center text-xs font-mono font-bold ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isUp ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                      {change !== undefined ? `${change >= 0 ? '+' : ''}${change.toFixed(2)} ` : ''}
                      ({isUp ? '+' : ''}{changePercent.toFixed(2)}%)
                    </div>
                  )}
                </div>
              </div>

              {/* Technical indicators row */}
              <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">20D Return</span>
                  <span className={`font-mono font-semibold ${s.return20D !== undefined && s.return20D >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {s.return20D !== undefined ? `${s.return20D >= 0 ? '+' : ''}${s.return20D.toFixed(1)}%` : '—'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">RSI (14)</span>
                  <span className="font-mono font-semibold text-slate-200">
                    {s.rsi14 !== undefined ? s.rsi14.toFixed(1) : '—'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Momentum</span>
                  <span className={`font-mono font-bold ${getMomentumScoreColor(s.momentumScore)}`}>
                    {s.momentumScore !== undefined ? `${s.momentumScore}/100` : '—'}
                  </span>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Rel. Strength vs NIFTY</span>
                  <span className={`font-mono font-semibold ${isOutperforming ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isOutperforming ? '+' : ''}{relStrength.toFixed(2)}% ({isOutperforming ? 'Outperforming' : 'Lagging'})
                  </span>
                </div>

                {q?.fiftyTwoWeekHigh > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">52W High / Low</span>
                    <span className="font-mono text-slate-300">
                      ₹{q.fiftyTwoWeekHigh.toFixed(0)} / ₹{q.fiftyTwoWeekLow.toFixed(0)}
                    </span>
                  </div>
                )}
              </div>

              <button
                onClick={() => onFilterBySector(s.sector)}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-slate-800 text-xs font-semibold text-indigo-300 hover:bg-indigo-600 hover:text-white transition"
              >
                <Filter className="h-3.5 w-3.5" />
                Scan {s.sector} Stocks
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
