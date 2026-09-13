import React, { useState } from 'react';
import {
  AlertTriangle,
  Briefcase,
  CheckCircle2,
  ChevronRight,
  Eye,
  Info,
  Layers,
  Plus,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  X,
} from 'lucide-react';
import { AIAnalysisResult, OHLCV, StockScanResult } from '../types.ts';
import { CandlestickChart } from './CandlestickChart.tsx';
import { ScoreBreakdownCard } from './ScoreBreakdownCard.tsx';

interface StockDetailModalProps {
  stock: StockScanResult;
  candles: OHLCV[];
  onClose: () => void;
  onAddToWatchlist: (stock: StockScanResult) => void;
  onAddToHoldings: (stock: StockScanResult, quantity: number, price: number) => void;
  onTimeframeChange: (tf: 'daily' | 'weekly') => void;
}

export const StockDetailModal: React.FC<StockDetailModalProps> = ({
  stock,
  candles,
  onClose,
  onAddToWatchlist,
  onAddToHoldings,
  onTimeframeChange,
}) => {
  const [activeTab, setActiveTab] = useState<'ai' | 'chart' | 'indicators' | 'score'>('ai');
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Holdings modal form
  const [showHoldingForm, setShowHoldingForm] = useState(false);
  const [quantity, setQuantity] = useState('10');
  const [purchasePrice, setPurchasePrice] = useState(stock.price.toString());

  const handleFetchAI = async () => {
    setIsLoadingAI(true);
    setAiError(null);
    try {
      const res = await fetch('/api/scanner/ai-explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stock),
      });
      if (!res.ok) throw new Error('AI analysis service error');
      const data = await res.json();
      setAiAnalysis(data);
    } catch (err: any) {
      setAiError(err.message || 'Failed to generate AI analysis');
    } finally {
      setIsLoadingAI(false);
    }
  };

  // Auto-fetch AI explanation when modal opens on 'ai' tab
  React.useEffect(() => {
    if (!aiAnalysis && !isLoadingAI) {
      handleFetchAI();
    }
  }, [stock.symbol]);

  const ind = stock.indicators;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto">
      <div
        id="stock-detail-modal"
        className="relative w-full max-w-5xl rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
      >
        {/* Modal Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 bg-slate-900/90 px-6 py-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-500 font-bold text-white shadow-md">
              {stock.symbol.slice(0, 3)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black tracking-tight text-white">{stock.symbol}</h2>
                <span className="rounded bg-slate-800 px-2 py-0.5 text-xs font-semibold text-slate-300">
                  {stock.sector}
                </span>
                {stock.isHolding && (
                  <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-xs font-bold text-emerald-400 border border-emerald-500/30">
                    YOUR HOLDING ({stock.holdingDetails?.quantity} Qty)
                  </span>
                )}
                {stock.isWatchlist && (
                  <span className="rounded bg-amber-500/20 px-2 py-0.5 text-xs font-bold text-amber-400 border border-amber-500/30">
                    WATCHLIST
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 truncate max-w-md">{stock.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="font-mono text-xl font-bold text-white">₹{stock.price.toFixed(2)}</div>
              <div
                className={`text-xs font-semibold font-mono ${
                  stock.change >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {stock.change >= 0 ? '+' : ''}
                {stock.change.toFixed(2)} ({stock.changePercent >= 0 ? '+' : ''}
                {stock.changePercent.toFixed(2)}%)
              </div>
            </div>

            <button
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-900/50 px-6 py-2 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('ai')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'ai' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            AI Explanation & Setup
          </button>
          <button
            onClick={() => setActiveTab('chart')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'chart' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <TrendingUp className="h-3.5 w-3.5" />
            Technical Chart
          </button>
          <button
            onClick={() => setActiveTab('indicators')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'indicators' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            Indicators & S/R
          </button>
          <button
            onClick={() => setActiveTab('score')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'score' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Info className="h-3.5 w-3.5" />
            Score Breakdown ({stock.score}/100)
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: AI EXPLANATION */}
          {activeTab === 'ai' && (
            <div className="space-y-5">
              {isLoadingAI ? (
                <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
                  <p className="text-sm font-semibold text-slate-300">Generating AI Technical Interpretation...</p>
                  <p className="text-xs text-slate-400">Synthesizing indicators, NIFTY regime, and volume confirmation</p>
                </div>
              ) : aiError ? (
                <div className="rounded-xl border border-rose-800/60 bg-rose-950/30 p-4 text-xs text-rose-300">
                  <p className="font-semibold">AI Analysis Error: {aiError}</p>
                  <button
                    onClick={handleFetchAI}
                    className="mt-2 text-indigo-400 underline hover:text-indigo-300"
                  >
                    Retry Analysis
                  </button>
                </div>
              ) : aiAnalysis ? (
                <div className="space-y-4">
                  {/* Summary Callout */}
                  <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/20 p-4">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-indigo-400" />
                        <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                          AI Executive Summary
                        </span>
                        {aiAnalysis.isAiGenerated && (
                          <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-500/30">
                            Gemini 3.8
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400">
                        Setup: <strong className="text-white">{aiAnalysis.setupType}</strong>
                      </span>
                    </div>
                    <p className="text-sm text-slate-200 leading-relaxed">{aiAnalysis.summary}</p>
                  </div>

                  {/* Positives & Risks Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Positives */}
                    <div className="rounded-xl border border-emerald-900/50 bg-emerald-950/20 p-4">
                      <div className="flex items-center gap-2 mb-3 text-emerald-400">
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">Key Technical Positives</span>
                      </div>
                      <ul className="space-y-2">
                        {aiAnalysis.keyPositives.map((pos, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                            <span>{pos}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Risks */}
                    <div className="rounded-xl border border-rose-900/50 bg-rose-950/20 p-4">
                      <div className="flex items-center gap-2 mb-3 text-rose-400">
                        <ShieldAlert className="h-4 w-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">Key Technical Risks</span>
                      </div>
                      <ul className="space-y-2">
                        {aiAnalysis.keyRisks.map((risk, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-rose-400 shrink-0" />
                            <span>{risk}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Confirmation & Invalidation */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 text-xs">
                      <p className="font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Sector & NIFTY Confirmation
                      </p>
                      <p className="text-slate-200">{aiAnalysis.confirmation}</p>
                    </div>

                    <div className="rounded-xl border border-amber-900/50 bg-amber-950/20 p-4 text-xs">
                      <div className="flex items-center gap-1.5 mb-1 text-amber-400 font-bold uppercase tracking-wider">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        <span>Invalidation Condition (Stop-Loss Guideline)</span>
                      </div>
                      <p className="text-slate-200">{aiAnalysis.invalidation}</p>
                    </div>
                  </div>

                  {/* Regulatory Disclaimer */}
                  <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-3 text-[11px] text-slate-400 flex items-start gap-2">
                    <Info className="h-4 w-4 shrink-0 text-slate-400 mt-0.5" />
                    <span>
                      <strong>Disclaimer:</strong> This automated scan is intended exclusively for educational and analytical purposes. It does not constitute investment advice or a solicitation to buy or sell securities. Trading Indian equities involves financial risk.
                    </span>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* TAB 2: TECHNICAL CHART */}
          {activeTab === 'chart' && (
            <div className="space-y-4">
              <CandlestickChart
                candles={candles}
                indicators={stock.indicators}
                symbol={stock.symbol}
                timeframe={stock.timeframe}
                onTimeframeChange={onTimeframeChange}
              />
            </div>
          )}

          {/* TAB 3: INDICATORS & S/R */}
          {activeTab === 'indicators' && (
            <div className="space-y-5">
              {/* Moving Averages Grid */}
              <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Moving Average Matrix
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-400">EMA 20</span>
                    <p className="font-mono font-bold text-white text-sm">₹{ind.ema20.toFixed(2)}</p>
                    <span
                      className={`text-[11px] ${
                        ind.priceVsEma20 >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {ind.priceVsEma20 >= 0 ? '+' : ''}
                      {ind.priceVsEma20}% vs Price
                    </span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-400">EMA 50</span>
                    <p className="font-mono font-bold text-white text-sm">₹{ind.ema50.toFixed(2)}</p>
                    <span
                      className={`text-[11px] ${
                        ind.priceVsEma50 >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {ind.priceVsEma50 >= 0 ? '+' : ''}
                      {ind.priceVsEma50}% vs Price
                    </span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-400">EMA 100</span>
                    <p className="font-mono font-bold text-white text-sm">₹{ind.ema100.toFixed(2)}</p>
                    <span className="text-[11px] text-slate-400">Intermediate</span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-400">EMA 200</span>
                    <p className="font-mono font-bold text-white text-sm">₹{ind.ema200.toFixed(2)}</p>
                    <span
                      className={`text-[11px] ${
                        ind.priceVsEma200 >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {ind.priceVsEma200 >= 0 ? '+' : ''}
                      {ind.priceVsEma200}% Long-term
                    </span>
                  </div>
                </div>
              </div>

              {/* Momentum & Volatility */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Momentum Indicators
                  </h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">RSI (14)</span>
                      <span className="font-mono font-bold text-white">{ind.rsi14}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">MACD Histogram</span>
                      <span
                        className={`font-mono font-bold ${
                          ind.macd.histogram >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {ind.macd.histogram}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">MACD Crossover</span>
                      <span className="font-bold text-slate-200">{ind.macd.crossover}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-400">ADX Trend Strength</span>
                      <span className="font-bold text-slate-200">
                        {ind.adx14.adx} ({ind.adx14.strength})
                      </span>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Support & Resistance Levels
                  </h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Nearest Resistance</span>
                      <span className="font-mono font-bold text-rose-400">
                        ₹{ind.nearestResistance} (Str: {ind.resistanceStrength}/10)
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Nearest Support</span>
                      <span className="font-mono font-bold text-emerald-400">
                        ₹{ind.nearestSupport} (Str: {ind.supportStrength}/10)
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">52-Week High</span>
                      <span className="font-mono text-slate-200">
                        ₹{ind.fiftyTwoWeekHigh} ({ind.distFrom52wHigh}%)
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-400">52-Week Low</span>
                      <span className="font-mono text-slate-200">
                        ₹{ind.fiftyTwoWeekLow} ({ind.distFrom52wLow}%)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SCORE BREAKDOWN */}
          {activeTab === 'score' && (
            <div className="space-y-4">
              <ScoreBreakdownCard
                score={stock.score}
                breakdown={stock.breakdown}
                signal={stock.signal}
                confidence={stock.confidence}
              />
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 bg-slate-900/90 px-6 py-3.5">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onAddToWatchlist(stock)}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
            >
              <Eye className="h-3.5 w-3.5 text-amber-400" />
              {stock.isWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
            </button>

            <button
              onClick={() => setShowHoldingForm(true)}
              className="flex items-center gap-1.5 rounded-lg border border-indigo-600/50 bg-indigo-600/20 px-3.5 py-2 text-xs font-semibold text-indigo-300 hover:bg-indigo-600/30 transition"
            >
              <Briefcase className="h-3.5 w-3.5" />
              Add to Active Holdings
            </button>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition"
          >
            Close
          </button>
        </div>

        {/* Quick Add To Holdings Modal Form Overlay */}
        {showHoldingForm && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
            <div className="w-full max-w-sm rounded-xl border border-slate-800 bg-slate-900 p-5 shadow-2xl">
              <h4 className="text-sm font-bold text-white mb-1">Add {stock.symbol} to Portfolio</h4>
              <p className="text-xs text-slate-400 mb-4">Track this holding against the scanner signals</p>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Quantity</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Average Purchase Price (₹)</label>
                  <input
                    type="number"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="mt-5 flex justify-end gap-2">
                <button
                  onClick={() => setShowHoldingForm(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const q = parseInt(quantity, 10) || 1;
                    const p = parseFloat(purchasePrice) || stock.price;
                    onAddToHoldings(stock, q, p);
                    setShowHoldingForm(false);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 text-xs font-semibold text-white hover:bg-indigo-500"
                >
                  Save Holding
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
