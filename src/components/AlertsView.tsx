import React, { useState } from 'react';
import { Bell, Check, Plus, Power, Trash2 } from 'lucide-react';
import { AlertRule } from '../types.ts';

interface AlertsViewProps {
  alerts: AlertRule[];
  onToggleAlert: (id: string) => void;
  onDeleteAlert: (id: string) => void;
  onAddAlert: (rule: Omit<AlertRule, 'id' | 'createdAt'>) => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({
  alerts,
  onToggleAlert,
  onDeleteAlert,
  onAddAlert,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('ALL');
  const [type, setType] = useState<AlertRule['type']>('SCORE_ABOVE');
  const [threshold, setThreshold] = useState('80');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    onAddAlert({
      name: name.trim() || `${symbol} ${type}`,
      symbol: symbol.toUpperCase().trim() || 'ALL',
      type,
      threshold: threshold ? parseFloat(threshold) : undefined,
      enabled: true,
    });
    setName('');
    setShowAddModal(false);
  };

  return (
    <div id="alerts-view" className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Bell className="h-6 w-6 text-indigo-400" />
            Scanner Alerts & Trigger Rules
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Receive automated real-time notices when technical criteria or breakout conditions are met
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-500 transition"
        >
          <Plus className="h-3.5 w-3.5" />
          Create Alert Rule
        </button>
      </div>

      {/* Rules Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-950/60 font-semibold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-5 py-3">Alert Name</th>
                <th className="px-4 py-3">Target Symbol</th>
                <th className="px-4 py-3">Condition Type</th>
                <th className="px-4 py-3">Threshold</th>
                <th className="px-4 py-3">Last Triggered</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {alerts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No active alert rules. Click "Create Alert Rule" to set up custom criteria.
                  </td>
                </tr>
              ) : (
                alerts.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-800/40 transition">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-white text-sm">{a.name}</div>
                      {a.triggerMessage && (
                        <div className="text-[11px] text-emerald-400 mt-0.5 font-mono">
                          Recent: {a.triggerMessage}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3.5 font-mono font-bold text-indigo-400">{a.symbol}</td>
                    <td className="px-4 py-3.5">
                      <span className="rounded bg-slate-800 px-2 py-0.5 text-[11px] font-semibold text-slate-300">
                        {a.type}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-mono">{a.threshold !== undefined ? a.threshold : 'N/A'}</td>
                    <td className="px-4 py-3.5 text-slate-400">
                      {a.lastTriggered ? new Date(a.lastTriggered).toLocaleTimeString('en-IN') : 'Never'}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <button
                        onClick={() => onToggleAlert(a.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition ${
                          a.enabled
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        <Power className="h-3 w-3" />
                        {a.enabled ? 'Active' : 'Muted'}
                      </button>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <button
                        onClick={() => onDeleteAlert(a.id)}
                        className="rounded p-1.5 text-slate-400 hover:bg-rose-950 hover:text-rose-400 transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Alert Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">Create Scanner Alert Rule</h3>
            <p className="text-xs text-slate-400 mb-4">Set automated triggers on scan results</p>

            <form onSubmit={handleAdd} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Alert Name</label>
                <input
                  type="text"
                  placeholder="e.g. NIFTY Bullish Breakout Alert"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Target Symbol</label>
                <input
                  type="text"
                  placeholder="Enter specific symbol or 'ALL'"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white font-mono uppercase focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Condition Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
                >
                  <option value="SCORE_ABOVE">AI Score Above Threshold</option>
                  <option value="BULLISH_BREAKOUT">Bullish Resistance Breakout</option>
                  <option value="BEARISH_BREAKDOWN">Bearish Support Breakdown</option>
                  <option value="VOLUME_2X">Volume Expansion &gt;= 2.0x</option>
                  <option value="EMA_CROSS_BULLISH">Bullish EMA Crossover</option>
                  <option value="52W_HIGH">52-Week High Breakout</option>
                </select>
              </div>

              {type === 'SCORE_ABOVE' && (
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Score Threshold (0 - 100)</label>
                  <input
                    type="number"
                    value={threshold}
                    onChange={(e) => setThreshold(e.target.value)}
                    min="1"
                    max="100"
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white font-mono focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              )}

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
                  Create Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
