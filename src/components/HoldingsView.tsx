import React, { useState } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  Briefcase,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import { Holding } from '../types.ts';

interface HoldingsViewProps {
  holdings: Holding[];
  onAddHolding: (holding: { symbol: string; name: string; sector: string; quantity: number; avgPrice: number; currentPrice: number }) => void;
  onDeleteHolding: (id: string) => void;
  onScanHoldings: () => void;
}

export const HoldingsView: React.FC<HoldingsViewProps> = ({
  holdings,
  onAddHolding,
  onDeleteHolding,
  onScanHoldings,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [symbol, setSymbol] = useState('');
  const [name, setName] = useState('');
  const [sector, setSector] = useState('Banking & Financials');
  const [quantity, setQuantity] = useState('20');
  const [avgPrice, setAvgPrice] = useState('1000');

  // Portfolio Totals
  const totalInvested = holdings.reduce((sum, h) => sum + h.invested, 0);
  const totalCurrent = holdings.reduce((sum, h) => sum + h.currentValue, 0);
  const totalPnL = totalCurrent - totalInvested;
  const totalPnLPercent = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;
  const totalDayGain = holdings.reduce((sum, h) => sum + (h.dayGain || 0), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbol.trim()) return;
    const q = parseInt(quantity, 10) || 1;
    const p = parseFloat(avgPrice) || 100;
    onAddHolding({
      symbol: symbol.toUpperCase().trim(),
      name: name.trim() || `${symbol.toUpperCase().trim()} Ltd.`,
      sector,
      quantity: q,
      avgPrice: p,
      currentPrice: p,
    });
    setSymbol('');
    setName('');
    setShowAddModal(false);
  };

  return (
    <div id="holdings-view" className="space-y-6">
      {/* Portfolio Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Briefcase className="h-6 w-6 text-indigo-400" />
            Active Portfolio Holdings
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Track your investments and cross-reference against algorithmic scanner setups
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            id="scan-my-holdings-btn"
            onClick={onScanHoldings}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-500 transition"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Scan My Holdings
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
          >
            <Plus className="h-3.5 w-3.5 text-indigo-400" />
            Add Holding
          </button>
        </div>
      </div>

      {/* Portfolio Summary Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 shadow-sm">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Invested</span>
          <p className="mt-1 font-mono text-xl font-bold text-white">
            ₹{totalInvested.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </p>
          <span className="text-[11px] text-slate-400">{holdings.length} active positions</span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 shadow-sm">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Current Portfolio Value</span>
          <p className="mt-1 font-mono text-xl font-bold text-white">
            ₹{totalCurrent.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </p>
          <span className="text-[11px] text-slate-400">Live exchange pricing</span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 shadow-sm">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Profit / Loss</span>
          <div className="flex items-center gap-2 mt-1">
            <p
              className={`font-mono text-xl font-bold ${
                totalPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {totalPnL >= 0 ? '+' : ''}₹{totalPnL.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </p>
            <span
              className={`flex items-center text-xs font-bold font-mono px-2 py-0.5 rounded ${
                totalPnL >= 0 ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'
              }`}
            >
              {totalPnL >= 0 ? '+' : ''}{totalPnLPercent.toFixed(2)}%
            </span>
          </div>
          <span className="text-[11px] text-slate-400">Overall return</span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 shadow-sm">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Today's P&L</span>
          <p
            className={`mt-1 font-mono text-xl font-bold ${
              totalDayGain >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {totalDayGain >= 0 ? '+' : ''}₹{totalDayGain.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </p>
          <span className="text-[11px] text-slate-400">1-day movement</span>
        </div>
      </div>

      {/* Holdings Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-950/60 font-semibold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-5 py-3">Stock & Sector</th>
                <th className="px-4 py-3 text-right">Qty</th>
                <th className="px-4 py-3 text-right">Avg Price</th>
                <th className="px-4 py-3 text-right">Current Price</th>
                <th className="px-4 py-3 text-right">Invested</th>
                <th className="px-4 py-3 text-right">Current Value</th>
                <th className="px-4 py-3 text-right">Total P&L</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {holdings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No holdings in this account. Click "Add Holding" or import from scanner setups.
                  </td>
                </tr>
              ) : (
                holdings.map((h) => {
                  const isProfit = h.pnl >= 0;
                  return (
                    <tr key={h.id} className="hover:bg-slate-800/40 transition">
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-white text-sm">{h.symbol}</div>
                        <div className="text-[11px] text-slate-400 truncate max-w-xs">{h.name}</div>
                        <span className="inline-block mt-0.5 rounded bg-slate-800 px-1.5 py-0.2 text-[10px] text-slate-400">
                          {h.sector}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono font-semibold">{h.quantity}</td>
                      <td className="px-4 py-3.5 text-right font-mono">₹{h.avgPrice.toFixed(2)}</td>
                      <td className="px-4 py-3.5 text-right font-mono font-bold text-white">
                        ₹{h.currentPrice.toFixed(2)}
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono">₹{h.invested.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3.5 text-right font-mono font-bold text-white">
                        ₹{h.currentValue.toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono">
                        <div className={`font-bold ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isProfit ? '+' : ''}₹{h.pnl.toLocaleString('en-IN')}
                        </div>
                        <div className={`text-[11px] ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isProfit ? '+' : ''}{h.pnlPercent.toFixed(2)}%
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <button
                          onClick={() => onDeleteHolding(h.id)}
                          className="rounded p-1.5 text-slate-400 hover:bg-rose-950 hover:text-rose-400 transition"
                          title="Delete Holding"
                        >
                          <Trash2 className="h-4 w-4" />
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

      {/* Add Holding Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">Add Stock Holding</h3>
            <p className="text-xs text-slate-400 mb-4">Record an existing position in your portfolio</p>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">NSE Symbol</label>
                <input
                  type="text"
                  placeholder="e.g. RELIANCE, TCS, INFY"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white font-mono uppercase focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Company Name</label>
                <input
                  type="text"
                  placeholder="e.g. Reliance Industries Ltd."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Sector</label>
                <select
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
                >
                  <option>Banking & Financials</option>
                  <option>Information Technology</option>
                  <option>Automobiles & Auto Components</option>
                  <option>Pharmaceuticals & Healthcare</option>
                  <option>Oil, Gas & Energy</option>
                  <option>Metals & Mining</option>
                  <option>Consumer Goods & FMCG</option>
                  <option>Infrastructure</option>
                  <option>Telecommunications</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Quantity</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    min="1"
                    required
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white font-mono focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Avg Buy Price (₹)</label>
                  <input
                    type="number"
                    step="0.05"
                    value={avgPrice}
                    onChange={(e) => setAvgPrice(e.target.value)}
                    min="0.1"
                    required
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white font-mono focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-xs font-semibold text-white hover:bg-indigo-500"
                >
                  Add to Portfolio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
