import React, { useState } from 'react';
import { Eye, Plus, Sparkles, Trash2 } from 'lucide-react';
import { WatchlistItem } from '../types.ts';

interface WatchlistViewProps {
  watchlist: WatchlistItem[];
  onRemoveItem: (symbol: string) => void;
  onAddItem: (item: { symbol: string; name: string; sector: string; notes?: string }) => void;
  onScanWatchlist: () => void;
  onSelectStock?: (symbol: string) => void;
}

export const WatchlistView: React.FC<WatchlistViewProps> = ({
  watchlist,
  onRemoveItem,
  onAddItem,
  onScanWatchlist,
  onSelectStock,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [symbol, setSymbol] = useState('');
  const [name, setName] = useState('');
  const [sector, setSector] = useState('Banking & Financials');
  const [notes, setNotes] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbol.trim()) return;
    onAddItem({
      symbol: symbol.toUpperCase().trim(),
      name: name.trim() || `${symbol.toUpperCase().trim()} Ltd.`,
      sector,
      notes: notes.trim() || undefined,
    });
    setSymbol('');
    setName('');
    setNotes('');
    setShowAddModal(false);
  };

  return (
    <div id="watchlist-view" className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Eye className="h-6 w-6 text-indigo-400" />
            Stock Watchlist
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitor potential candidates and trigger quantitative scans on watchlist stocks
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            id="scan-watchlist-btn"
            onClick={onScanWatchlist}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-500 transition"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Scan Watchlist
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
          >
            <Plus className="h-3.5 w-3.5 text-indigo-400" />
            Add to Watchlist
          </button>
        </div>
      </div>

      {/* Watchlist Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {watchlist.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400 border border-dashed border-slate-800 rounded-2xl">
            <Eye className="h-10 w-10 mx-auto text-slate-600 mb-2" />
            <p className="text-sm font-semibold text-slate-300">Your watchlist is currently empty</p>
            <p className="text-xs text-slate-400 mt-1">
              Add stocks from the AI Scanner or click "Add to Watchlist" above
            </p>
          </div>
        ) : (
          watchlist.map((item) => (
            <div
              key={item.symbol}
              className="rounded-xl border border-slate-800 bg-slate-900 p-4 shadow-md hover:border-slate-700 transition space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div
                    onClick={() => onSelectStock?.(item.symbol)}
                    className="font-bold text-white text-base hover:text-indigo-400 cursor-pointer transition"
                  >
                    {item.symbol}
                  </div>
                  <p className="text-xs text-slate-400 truncate max-w-[200px]">{item.name}</p>
                </div>
                <button
                  onClick={() => onRemoveItem(item.symbol)}
                  className="rounded p-1.5 text-slate-500 hover:bg-rose-950 hover:text-rose-400 transition"
                  title="Remove"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/80">
                <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300">
                  {item.sector}
                </span>
                <span className="text-[11px] text-slate-400">
                  Added {new Date(item.addedAt).toLocaleDateString('en-IN')}
                </span>
              </div>

              {item.notes && (
                <p className="text-xs text-slate-400 bg-slate-950 p-2 rounded-lg border border-slate-800/80 italic">
                  "{item.notes}"
                </p>
              )}

              <button
                onClick={() => onSelectStock?.(item.symbol)}
                className="w-full py-1.5 rounded-lg bg-slate-800 text-xs font-semibold text-indigo-300 hover:bg-slate-700 transition"
              >
                Analyze Setup
              </button>
            </div>
          ))
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">Add to Watchlist</h3>
            <p className="text-xs text-slate-400 mb-4">Track a stock symbol for price and volume breakout</p>

            <form onSubmit={handleAdd} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">NSE Symbol</label>
                <input
                  type="text"
                  placeholder="e.g. SBIN, BAJFINANCE, ITC"
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
                  placeholder="e.g. State Bank of India"
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

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Trade Notes / Strategy (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Watching for bounce off 50 EMA"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
                />
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
                  Save to Watchlist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
