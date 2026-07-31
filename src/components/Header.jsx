import React from 'react';
import { Activity, ShieldAlert, Zap, TrendingUp, TrendingDown, BarChart2 } from 'lucide-react';

export default function Header({ currentPrice, priceChange, dxy, us10y, activeTab, setActiveTab }) {
  const isPositive = priceChange >= 0;

  return (
    <header className="border-b border-slate-800 bg-[#0e121b]/95 backdrop-blur sticky top-0 z-50 px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Logo & Asset Title */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-300 p-0.5 shadow-lg shadow-amber-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-[#0e121b] rounded-[10px] flex items-center justify-center">
                <span className="text-xl font-bold text-amber-400">👑</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-lg text-white tracking-wide font-mono">XAU/USD</h1>
                <span className="px-2 py-0.5 text-xs font-semibold rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 whitespace-nowrap">
                  Gold Spot / US Dollar
                </span>
              </div>
              <p className="text-xs text-slate-400 whitespace-nowrap">Professional Trading & Analysis Suite</p>
            </div>
          </div>

          {/* Mobile Live Price Badge */}
          <div className="md:hidden flex items-center gap-1 font-mono text-sm">
            <span className="text-base font-bold text-white">${currentPrice.toFixed(2)}</span>
          </div>
        </div>

        {/* Live Market Tickers */}
        <div className="hidden md:flex items-center gap-5 bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-800 font-mono text-sm">
          {/* Gold Live Price */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">XAU/USD:</span>
            <span className="text-lg font-bold text-white tracking-tight">${currentPrice.toFixed(2)}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded font-semibold flex items-center gap-0.5 ${
              isPositive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
            }`}>
              {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {isPositive ? '+' : ''}{priceChange.toFixed(2)} ({isPositive ? '+' : ''}{((priceChange / currentPrice) * 100).toFixed(2)}%)
            </span>
          </div>

          <div className="h-4 w-[1px] bg-slate-800"></div>

          {/* DXY Dollar Index */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">DXY:</span>
            <span className="font-semibold text-slate-200">{dxy.toFixed(2)}</span>
            <span className="text-xs text-rose-400">-0.18%</span>
          </div>

          <div className="h-4 w-[1px] bg-slate-800"></div>

          {/* US10Y Yield */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">US10Y:</span>
            <span className="font-semibold text-slate-200">{us10y.toFixed(2)}%</span>
          </div>

          {/* Live Status Indicator */}
          <div className="flex items-center gap-1.5 pl-2 border-l border-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="text-xs text-emerald-400 font-sans font-medium">LIVE</span>
          </div>
        </div>

        {/* Tab Navigation with whitespace-nowrap and horizontal scroll for clean mobile view */}
        <nav className="w-full md:w-auto flex items-center gap-1.5 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800 text-xs font-medium overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('chart')}
            className={`px-3 py-2 rounded-lg transition-all flex items-center gap-2 whitespace-nowrap shrink-0 ${
              activeTab === 'chart' 
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <BarChart2 size={15} />
            <span>กราฟและอินดิเคเตอร์</span>
          </button>
          
          <button
            onClick={() => setActiveTab('tools')}
            className={`px-3 py-2 rounded-lg transition-all flex items-center gap-2 whitespace-nowrap shrink-0 ${
              activeTab === 'tools' 
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Zap size={15} />
            <span>เครื่องมือวิเคราะห์ & คำนวณ</span>
          </button>

          <button
            onClick={() => setActiveTab('signals')}
            className={`px-3 py-2 rounded-lg transition-all flex items-center gap-2 whitespace-nowrap shrink-0 ${
              activeTab === 'signals' 
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Activity size={15} />
            <span>สแกนสัญญาณเทรด</span>
          </button>

          <button
            onClick={() => setActiveTab('simulator')}
            className={`px-3 py-2 rounded-lg transition-all flex items-center gap-2 whitespace-nowrap shrink-0 ${
              activeTab === 'simulator' 
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <ShieldAlert size={15} />
            <span>จำลองการเทรด (Simulator)</span>
          </button>
        </nav>

      </div>
    </header>
  );
}
