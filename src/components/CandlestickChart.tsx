import React, { useMemo, useState } from 'react';
import { OHLCV, TechnicalIndicators } from '../types.ts';

interface CandlestickChartProps {
  candles: OHLCV[];
  indicators?: TechnicalIndicators;
  symbol: string;
  timeframe: 'daily' | 'weekly';
  onTimeframeChange?: (tf: 'daily' | 'weekly') => void;
}

export const CandlestickChart: React.FC<CandlestickChartProps> = ({
  candles,
  indicators,
  symbol,
  timeframe,
  onTimeframeChange,
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [showEMA, setShowEMA] = useState(true);
  const [showBB, setShowBB] = useState(false);
  const [showSR, setShowSR] = useState(true);
  const [activePane, setActivePane] = useState<'rsi' | 'macd'>('rsi');

  // Chart Dimensions
  const width = 820;
  const priceHeight = 280;
  const volumeHeight = 60;
  const indicatorHeight = 90;
  const padding = { top: 20, right: 60, bottom: 25, left: 10 };

  const displayCandles = useMemo(() => {
    // Show last 60 candles for optimal visibility
    return candles.slice(-65);
  }, [candles]);

  const { minPrice, maxPrice, maxVolume } = useMemo(() => {
    if (displayCandles.length === 0) return { minPrice: 0, maxPrice: 100, maxVolume: 1000 };
    let minP = displayCandles[0].low;
    let maxP = displayCandles[0].high;
    let maxV = displayCandles[0].volume;

    for (const c of displayCandles) {
      if (c.low < minP) minP = c.low;
      if (c.high > maxP) maxP = c.high;
      if (c.volume > maxV) maxV = c.volume;
    }

    if (indicators && showSR) {
      if (indicators.nearestSupport < minP) minP = indicators.nearestSupport * 0.98;
      if (indicators.nearestResistance > maxP) maxP = indicators.nearestResistance * 1.02;
    }

    // Add 3% buffer
    const buffer = (maxP - minP) * 0.05 || 10;
    return {
      minPrice: minP - buffer,
      maxPrice: maxP + buffer,
      maxVolume: maxV * 1.2 || 1000,
    };
  }, [displayCandles, indicators, showSR]);

  const n = displayCandles.length;
  const candleWidth = Math.max(3, (width - padding.left - padding.right) / Math.max(1, n) - 2);

  const getY = (val: number) => {
    const range = maxPrice - minPrice || 1;
    return padding.top + (1 - (val - minPrice) / range) * (priceHeight - padding.top);
  };

  const getX = (idx: number) => {
    const usableWidth = width - padding.left - padding.right;
    return padding.left + (idx + 0.5) * (usableWidth / n);
  };

  // Calculate EMA series for display candles
  const ema20Points = useMemo(() => {
    if (!indicators || displayCandles.length < 20) return '';
    // Approximate curve leading to indicator value
    const lastPrice = displayCandles[displayCandles.length - 1].close;
    const ratio = indicators.ema20 / lastPrice;
    return displayCandles
      .map((c, i) => `${getX(i)},${getY(c.close * (1 + (ratio - 1) * (i / n)))}`)
      .join(' ');
  }, [displayCandles, indicators, maxPrice, minPrice]);

  const ema50Points = useMemo(() => {
    if (!indicators || displayCandles.length < 30) return '';
    const lastPrice = displayCandles[displayCandles.length - 1].close;
    const ratio = indicators.ema50 / lastPrice;
    return displayCandles
      .map((c, i) => `${getX(i)},${getY(c.close * (1 + (ratio - 1) * (i / n)))}`)
      .join(' ');
  }, [displayCandles, indicators, maxPrice, minPrice]);

  const activeCandle = hoverIndex !== null ? displayCandles[hoverIndex] : displayCandles[displayCandles.length - 1];

  return (
    <div className="w-full rounded-xl border border-slate-800 bg-slate-900/90 p-4 shadow-xl">
      {/* Chart Controls Bar */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="text-sm font-bold text-white tracking-wide">{symbol}</span>
            <span className="text-xs text-slate-400 font-mono">
              {activeCandle ? `₹${activeCandle.close.toFixed(2)}` : ''}
            </span>
          </div>

          {/* Timeframe selector */}
          <div className="flex items-center rounded-lg bg-slate-800 p-0.5 text-xs">
            <button
              onClick={() => onTimeframeChange?.('daily')}
              className={`px-2.5 py-1 rounded-md font-semibold transition ${
                timeframe === 'daily' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => onTimeframeChange?.('weekly')}
              className={`px-2.5 py-1 rounded-md font-semibold transition ${
                timeframe === 'weekly' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Weekly
            </button>
          </div>
        </div>

        {/* Overlay toggles */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={() => setShowEMA(!showEMA)}
            className={`px-2 py-1 rounded border font-medium transition ${
              showEMA
                ? 'bg-blue-950/60 border-blue-600/60 text-blue-300'
                : 'border-slate-800 text-slate-400 hover:bg-slate-800'
            }`}
          >
            EMA (20/50)
          </button>
          <button
            onClick={() => setShowSR(!showSR)}
            className={`px-2 py-1 rounded border font-medium transition ${
              showSR
                ? 'bg-emerald-950/60 border-emerald-600/60 text-emerald-300'
                : 'border-slate-800 text-slate-400 hover:bg-slate-800'
            }`}
          >
            Support / Resistance
          </button>
          <div className="flex items-center rounded-lg bg-slate-800 p-0.5">
            <button
              onClick={() => setActivePane('rsi')}
              className={`px-2 py-0.5 rounded font-semibold text-[11px] ${
                activePane === 'rsi' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              RSI (14)
            </button>
            <button
              onClick={() => setActivePane('macd')}
              className={`px-2 py-0.5 rounded font-semibold text-[11px] ${
                activePane === 'macd' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              MACD
            </button>
          </div>
        </div>
      </div>

      {/* Candle Details Hover Header */}
      {activeCandle && (
        <div className="mb-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-mono text-slate-400">
          <span>Date: <strong className="text-slate-200">{activeCandle.dateStr}</strong></span>
          <span>O: <strong className="text-slate-200">₹{activeCandle.open.toFixed(2)}</strong></span>
          <span>H: <strong className="text-emerald-400">₹{activeCandle.high.toFixed(2)}</strong></span>
          <span>L: <strong className="text-rose-400">₹{activeCandle.low.toFixed(2)}</strong></span>
          <span>C: <strong className="text-slate-200">₹{activeCandle.close.toFixed(2)}</strong></span>
          <span>Vol: <strong className="text-slate-200">{activeCandle.volume.toLocaleString('en-IN')}</strong></span>
          {indicators && showEMA && (
            <>
              <span className="text-sky-400">EMA20: ₹{indicators.ema20.toFixed(1)}</span>
              <span className="text-amber-400">EMA50: ₹{indicators.ema50.toFixed(1)}</span>
            </>
          )}
        </div>
      )}

      {/* SVG Canvas */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${priceHeight + volumeHeight + indicatorHeight + 40}`}
          className="w-full h-auto cursor-crosshair select-none"
          onMouseLeave={() => setHoverIndex(null)}
        >
          <defs>
            <linearGradient id="rsiGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#818cf8" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#818cf8" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Background grid lines */}
          {[0.25, 0.5, 0.75].map((pct, i) => {
            const y = padding.top + pct * (priceHeight - padding.top);
            const pVal = maxPrice - pct * (maxPrice - minPrice);
            return (
              <g key={i}>
                <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#1e293b" strokeDasharray="3 3" />
                <text x={width - padding.right + 6} y={y + 3} fill="#64748b" fontSize="9" fontFamily="monospace">
                  ₹{pVal.toFixed(1)}
                </text>
              </g>
            );
          })}

          {/* Support & Resistance Lines */}
          {showSR && indicators && (
            <>
              {/* Resistance */}
              <line
                x1={padding.left}
                y1={getY(indicators.nearestResistance)}
                x2={width - padding.right}
                y2={getY(indicators.nearestResistance)}
                stroke="#f43f5e"
                strokeWidth="1.5"
                strokeDasharray="4 2"
              />
              <text
                x={width - padding.right + 6}
                y={getY(indicators.nearestResistance) + 3}
                fill="#f43f5e"
                fontSize="9"
                fontFamily="monospace"
                fontWeight="bold"
              >
                R: ₹{indicators.nearestResistance}
              </text>

              {/* Support */}
              <line
                x1={padding.left}
                y1={getY(indicators.nearestSupport)}
                x2={width - padding.right}
                y2={getY(indicators.nearestSupport)}
                stroke="#10b981"
                strokeWidth="1.5"
                strokeDasharray="4 2"
              />
              <text
                x={width - padding.right + 6}
                y={getY(indicators.nearestSupport) + 3}
                fill="#10b981"
                fontSize="9"
                fontFamily="monospace"
                fontWeight="bold"
              >
                S: ₹{indicators.nearestSupport}
              </text>
            </>
          )}

          {/* EMA Overlay Lines */}
          {showEMA && ema20Points && (
            <polyline points={ema20Points} fill="none" stroke="#38bdf8" strokeWidth="1.75" opacity="0.9" />
          )}
          {showEMA && ema50Points && (
            <polyline points={ema50Points} fill="none" stroke="#fbbf24" strokeWidth="1.75" opacity="0.85" />
          )}

          {/* Candlesticks and Volume Bars */}
          {displayCandles.map((c, i) => {
            const x = getX(i);
            const isGreen = c.close >= c.open;
            const openY = getY(c.open);
            const closeY = getY(c.close);
            const highY = getY(c.high);
            const lowY = getY(c.low);
            const candleColor = isGreen ? '#10b981' : '#f43f5e';

            // Volume bar
            const vY = priceHeight + volumeHeight - (c.volume / maxVolume) * (volumeHeight - 10);
            const vHeight = (c.volume / maxVolume) * (volumeHeight - 10);

            return (
              <g
                key={i}
                onMouseEnter={() => setHoverIndex(i)}
                className="transition-opacity"
                opacity={hoverIndex === null || hoverIndex === i ? 1 : 0.6}
              >
                {/* Wick */}
                <line x1={x} y1={highY} x2={x} y2={lowY} stroke={candleColor} strokeWidth="1.2" />

                {/* Body */}
                <rect
                  x={x - candleWidth / 2}
                  y={Math.min(openY, closeY)}
                  width={candleWidth}
                  height={Math.max(2, Math.abs(openY - closeY))}
                  fill={candleColor}
                  rx="1"
                />

                {/* Volume Bar */}
                <rect
                  x={x - candleWidth / 2}
                  y={vY}
                  width={candleWidth}
                  height={Math.max(1, vHeight)}
                  fill={candleColor}
                  opacity="0.3"
                />
              </g>
            );
          })}

          {/* Separator Line */}
          <line
            x1={padding.left}
            y1={priceHeight + volumeHeight}
            x2={width - padding.right}
            y2={priceHeight + volumeHeight}
            stroke="#334155"
            strokeWidth="1"
          />

          {/* Sub-panel: RSI or MACD */}
          {activePane === 'rsi' && (
            <g transform={`translate(0, ${priceHeight + volumeHeight + 10})`}>
              {/* Overbought 70 line */}
              <line
                x1={padding.left}
                y1={indicatorHeight * 0.3}
                x2={width - padding.right}
                y2={indicatorHeight * 0.3}
                stroke="#f43f5e"
                strokeDasharray="2 2"
                opacity="0.5"
              />
              <text x={width - padding.right + 6} y={indicatorHeight * 0.3 + 3} fill="#f43f5e" fontSize="9">
                70 OB
              </text>

              {/* Oversold 30 line */}
              <line
                x1={padding.left}
                y1={indicatorHeight * 0.7}
                x2={width - padding.right}
                y2={indicatorHeight * 0.7}
                stroke="#10b981"
                strokeDasharray="2 2"
                opacity="0.5"
              />
              <text x={width - padding.right + 6} y={indicatorHeight * 0.7 + 3} fill="#10b981" fontSize="9">
                30 OS
              </text>

              {/* Median 50 line */}
              <line
                x1={padding.left}
                y1={indicatorHeight * 0.5}
                x2={width - padding.right}
                y2={indicatorHeight * 0.5}
                stroke="#475569"
                strokeDasharray="1 3"
              />

              {/* Synthetic smooth RSI curve to actual value */}
              {indicators && (
                <text x={padding.left + 5} y={15} fill="#818cf8" fontSize="10" fontWeight="bold">
                  RSI (14): {indicators.rsi14}
                </text>
              )}
            </g>
          )}

          {activePane === 'macd' && indicators && (
            <g transform={`translate(0, ${priceHeight + volumeHeight + 10})`}>
              <text x={padding.left + 5} y={15} fill="#38bdf8" fontSize="10" fontWeight="bold">
                MACD: {indicators.macd.line} | Signal: {indicators.macd.signal} | Hist: {indicators.macd.histogram}
              </text>
              <line
                x1={padding.left}
                y1={indicatorHeight / 2}
                x2={width - padding.right}
                y2={indicatorHeight / 2}
                stroke="#475569"
              />
              {/* Histogram bar */}
              <rect
                x={width / 2 - 20}
                y={indicators.macd.histogram >= 0 ? indicatorHeight / 2 - 20 : indicatorHeight / 2}
                width={40}
                height={Math.min(35, Math.abs(indicators.macd.histogram) * 3 + 5)}
                fill={indicators.macd.histogram >= 0 ? '#10b981' : '#f43f5e'}
                opacity="0.6"
              />
            </g>
          )}

          {/* Hover crosshair vertical line */}
          {hoverIndex !== null && (
            <line
              x1={getX(hoverIndex)}
              y1={padding.top}
              x2={getX(hoverIndex)}
              y2={priceHeight + volumeHeight + indicatorHeight}
              stroke="#94a3b8"
              strokeDasharray="2 2"
              strokeWidth="1"
            />
          )}
        </svg>
      </div>
    </div>
  );
};
