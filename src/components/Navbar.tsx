import React, { useState } from 'react';
import {
  Activity,
  BarChart2,
  Bell,
  Briefcase,
  ChevronDown,
  Eye,
  Layers,
  Sparkles,
  TrendingUp,
  User,
} from 'lucide-react';
import { NiftyMarketConfirmation, UserProfile } from '../types.ts';

interface NavbarProps {
  activeTab: 'scanner' | 'holdings' | 'watchlist' | 'sectors' | 'backtest' | 'alerts';
  setActiveTab: (tab: 'scanner' | 'holdings' | 'watchlist' | 'sectors' | 'backtest' | 'alerts') => void;
  currentUser: UserProfile;
  allUsers: UserProfile[];
  onSwitchUser: (userId: string) => void;
  nifty: NiftyMarketConfirmation | null;
  unreadAlertsCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  allUsers,
  onSwitchUser,
  nifty,
  unreadAlertsCount = 0,
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const getNiftyColor = (trend?: string) => {
    if (!trend) return 'text-emerald-400';
    if (trend.includes('BULLISH')) return 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60';
    if (trend.includes('BEARISH')) return 'text-rose-400 bg-rose-950/60 border-rose-800/60';
    return 'text-amber-400 bg-amber-950/60 border-amber-800/60';
  };

  return (
    <header id="main-header" className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Brand & Market Ticker */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab('scanner')}>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 shadow-md shadow-indigo-500/20">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-tight text-white">NSE QUANT</span>
                <span className="rounded bg-indigo-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-300 border border-indigo-500/30">
                  AI SCANNER
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Quantitative Stock Screener & Portfolio Tracker</p>
            </div>
          </div>

          {/* Live NIFTY 50 Ticker */}
          {nifty && nifty.niftyPrice > 0 && (
            <div className="hidden lg:flex items-center gap-2 pl-4 border-l border-slate-800">
              <div className="flex items-center gap-1.5 text-xs">
                <span className="font-semibold text-slate-300">NIFTY 50:</span>
                <span className="font-mono font-bold text-white">
                  ₹{nifty.niftyPrice.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </span>
                <span
                  className={`font-mono text-xs font-semibold ${
                    nifty.change >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {nifty.change >= 0 ? '+' : ''}
                  {nifty.change.toFixed(2)} ({nifty.changePercent >= 0 ? '+' : ''}
                  {nifty.changePercent.toFixed(2)}%)
                </span>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getNiftyColor(nifty.trend)}`}>
                {nifty.trend}
              </span>
              {(nifty as any).marketStatus && (
                <span className={`px-2 py-0.5 rounded text-[10px] font-medium border flex items-center gap-1 ${
                  (nifty as any).marketStatus === 'OPEN' 
                    ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60' 
                    : (nifty as any).marketStatus === 'PRE_MARKET'
                    ? 'bg-blue-950/60 text-blue-400 border-blue-800/60'
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${
                    (nifty as any).marketStatus === 'OPEN' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                  }`} />
                  {(nifty as any).marketStatus === 'OPEN' ? 'Live NSE' : (nifty as any).marketStatus === 'WEEKEND' ? 'Weekend' : 'NSE Closed'}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1">
          <button
            id="nav-scanner-btn"
            onClick={() => setActiveTab('scanner')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'scanner'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            AI Scanner
          </button>

          <button
            id="nav-holdings-btn"
            onClick={() => setActiveTab('holdings')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'holdings'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Briefcase className="h-3.5 w-3.5" />
            Active Holdings
          </button>

          <button
            id="nav-watchlist-btn"
            onClick={() => setActiveTab('watchlist')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'watchlist'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            Watchlist
          </button>

          <button
            id="nav-sectors-btn"
            onClick={() => setActiveTab('sectors')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'sectors'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            Sector Momentum
          </button>

          <button
            id="nav-backtest-btn"
            onClick={() => setActiveTab('backtest')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'backtest'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
          >
            <BarChart2 className="h-3.5 w-3.5" />
            Backtest
          </button>

          <button
            id="nav-alerts-btn"
            onClick={() => setActiveTab('alerts')}
            className={`relative flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'alerts'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Bell className="h-3.5 w-3.5" />
            Alerts
            {unreadAlertsCount > 0 && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                {unreadAlertsCount}
              </span>
            )}
          </button>
        </nav>

        {/* User Account & Switcher */}
        <div className="relative flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-900/50 px-2.5 py-1 rounded-full">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-medium text-[11px]">NSE Live Feed</span>
          </div>

          <div className="relative">
            <button
              id="user-profile-menu-btn"
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-slate-700 hover:bg-slate-800 transition"
            >
              {currentUser.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="h-6 w-6 rounded-full object-cover border border-indigo-500/40"
                />
              ) : (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-[10px] text-white">
                  <User className="h-3.5 w-3.5" />
                </div>
              )}
              <span className="hidden sm:inline font-semibold">{currentUser.name}</span>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>

            {showUserDropdown && (
              <div
                id="user-dropdown-menu"
                className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-800 bg-slate-900 p-2 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-100"
              >
                <div className="px-3 py-2 border-b border-slate-800 text-xs">
                  <p className="font-semibold text-white">{currentUser.name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{currentUser.email}</p>
                </div>

                <div className="pt-2">
                  <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Switch Portfolio Account
                  </p>
                  {allUsers.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => {
                        onSwitchUser(user.id);
                        setShowUserDropdown(false);
                      }}
                      className={`flex w-full items-center justify-between px-3 py-2 text-xs rounded-lg transition ${
                        user.id === currentUser.id
                          ? 'bg-indigo-600/20 text-indigo-400 font-semibold'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span>{user.name}</span>
                      {user.id === currentUser.id && <span className="text-[10px] text-indigo-400">Active</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Nav strip */}
      <div className="flex md:hidden overflow-x-auto border-t border-slate-800/80 px-2 py-1.5 gap-1 bg-slate-950">
        {[
          { id: 'scanner', label: 'AI Scanner', icon: Sparkles },
          { id: 'holdings', label: 'Holdings', icon: Briefcase },
          { id: 'watchlist', label: 'Watchlist', icon: Eye },
          { id: 'sectors', label: 'Sectors', icon: Layers },
          { id: 'backtest', label: 'Backtest', icon: BarChart2 },
          { id: 'alerts', label: 'Alerts', icon: Bell },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                isActive ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-900'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {item.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
