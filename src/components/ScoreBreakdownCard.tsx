import React from 'react';
import { ScoreBreakdown } from '../types.ts';

interface ScoreBreakdownCardProps {
  score: number;
  breakdown: ScoreBreakdown;
  signal: string;
  confidence: string;
}

export const ScoreBreakdownCard: React.FC<ScoreBreakdownCardProps> = ({
  score,
  breakdown,
  signal,
  confidence,
}) => {
  const getScoreColor = (sc: number) => {
    if (sc >= 80) return 'text-emerald-400 border-emerald-500/50 bg-emerald-950/40';
    if (sc >= 65) return 'text-teal-400 border-teal-500/50 bg-teal-950/40';
    if (sc >= 50) return 'text-amber-400 border-amber-500/50 bg-amber-950/40';
    if (sc >= 35) return 'text-orange-400 border-orange-500/50 bg-orange-950/40';
    return 'text-rose-400 border-rose-500/50 bg-rose-950/40';
  };

  const getSignalBadge = (sig: string) => {
    if (sig.includes('BULLISH')) return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    if (sig.includes('BEARISH')) return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
    return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
  };

  const items = [
    { label: 'Trend Alignment', val: breakdown.trend, max: breakdown.maxTrend, desc: 'EMA 20/50/200 & structural slope' },
    { label: 'Momentum Velocity', val: breakdown.momentum, max: breakdown.maxMomentum, desc: 'RSI, MACD expansion & ADX' },
    { label: 'Volume Conviction', val: breakdown.volume, max: breakdown.maxVolume, desc: 'Volume ratio & OBV accumulation' },
    { label: 'Pattern Setup', val: breakdown.pattern, max: breakdown.maxPattern, desc: 'Breakout & formation geometry' },
    { label: 'NIFTY Macro Wind', val: breakdown.market, max: breakdown.maxMarket, desc: 'NIFTY 50 regime agreement' },
    { label: 'Sector Tailwinds', val: breakdown.sector, max: breakdown.maxSector, desc: 'Relative strength vs sector index' },
    { label: 'Risk / Volatility', val: breakdown.risk, max: breakdown.maxRisk, desc: 'Bollinger bandwidth & extension penalty' },
  ];

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Quantitative Score Engine</span>
          <div className="flex items-center gap-3 mt-1">
            <span className={`flex h-12 w-12 items-center justify-center rounded-xl border text-xl font-black font-mono shadow-inner ${getScoreColor(score)}`}>
              {score}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold uppercase border ${getSignalBadge(signal)}`}>
                  {signal}
                </span>
                <span className="text-xs text-slate-400">
                  Confidence: <strong className="text-slate-200">{confidence}</strong>
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Deterministic mathematical scoring out of 100 points</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {items.map((item, idx) => {
          const pct = Math.min(100, Math.round((item.val / item.max) * 100));
          return (
            <div key={idx} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-300">{item.label}</span>
                <span className="font-mono text-slate-400">
                  <strong className="text-white">{item.val}</strong> / {item.max} pts
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    pct >= 75
                      ? 'bg-emerald-500'
                      : pct >= 50
                      ? 'bg-indigo-500'
                      : pct >= 30
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400">{item.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
