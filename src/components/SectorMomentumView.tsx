import React from 'react';
import { ArrowDownRight, ArrowUpRight, Filter, Layers, TrendingUp } from 'lucide-react';
import { NiftyMarketConfirmation, SectorConfirmation } from '../types.ts';

interface SectorMomentumViewProps {
  sectors: Array<{ sector: string; name: string; symbol: string; quote: any }>;
  nifty: NiftyMarketConfirmation | null;
  onFilterBySector: (sectorName: string) => void;
}

export const SectorMomentumView: React.FC<SectorMomentumViewProps> = ({
  sectors,
  nifty,
  onFilterBySector,
}) => {
  const getTrendBadge = (trend?: string) => {
    if (!trend) return 'bg-slate-800 text-slate-300';
    if (trend.includes('BULLISH')) return 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60 border';
    if (trend.includes('BEARISH')) return 'bg-rose-950/60 text-rose-400 border-rose-800/60 border';
    return 'bg-amber-950/60 text-amber-400 border-amber-800/60 border';
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
            Monitor institutional sector rotations and relative performance against the NIFTY 50 benchmark
          </p>
        </div>

        {nifty && (
          <div className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-xs">
            <span className="text-slate-400">Benchmark: </span>
            <span className="font-bold text-white">NIFTY 50 (₹{nifty.niftyPrice.toFixed(1)}) </span>
            <span className={`font-mono font-semibold ${nifty.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {nifty.change >= 0 ? '+' : ''}{nifty.changePercent.toFixed(2)}%
            </span>
          </div>
        )}
      </div>

      {/* Sector Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sectors.map((s) => {
          const q = s.quote;
          const price = q?.price ?? 0;
          const change = q?.change ?? 0;
          const changePercent = q?.changePercent ?? 0;
          const isUp = changePercent >= 0;

          // Relative strength vs Nifty 50
          const niftyChange = nifty?.changePercent ?? 0;
          const relStrength = Math.round((changePercent - niftyChange) * 100) / 100;
          const isOutperforming = relStrength >= 0;

          const trend = changePercent > 1.0 ? 'STRONG BULLISH' : changePercent > 0 ? 'BULLISH' : changePercent < -1.0 ? 'STRONG BEARISH' : 'BEARISH';

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
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getTrendBadge(trend)}`}>
                    {trend}
                  </span>
                </div>

                <div className="mt-4 flex items-baseline justify-between">
                  <div className="font-mono text-xl font-bold text-white">
                    ₹{price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </div>
                  <div className={`flex items-center text-xs font-mono font-bold ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isUp ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                    {isUp ? '+' : ''}{change.toFixed(2)} ({isUp ? '+' : ''}{changePercent.toFixed(2)}%)
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-3 border-t border-slate-800 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Relative Strength vs NIFTY</span>
                  <span className={`font-mono font-semibold ${isOutperforming ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isOutperforming ? '+' : ''}{relStrength.toFixed(2)}% ({isOutperforming ? 'Outperforming' : 'Lagging'})
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400">52W Range</span>
                  <span className="font-mono text-slate-300">
                    ₹{q?.fiftyTwoWeekLow?.toFixed(0) ?? 0} - ₹{q?.fiftyTwoWeekHigh?.toFixed(0) ?? 0}
                  </span>
                </div>
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
