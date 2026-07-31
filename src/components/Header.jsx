import React from 'react';
import { Activity, ShieldAlert, Zap, TrendingUp, TrendingDown, BarChart2 } from 'lucide-react';

export default function Header({ currentPrice, priceChange, dxy, us10y, activeTab, setActiveTab }) {
  const isPositive = priceChange >= 0;

  return (
    <header className="border-b border-slate-800 bg-[#0e121b]/95 backdrop-blur sticky top-0 z-50 px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        
        {/* Left Section: Logo + Live Price Tickers */}
        <div className="flex flex-wrap items-center justify-between lg:justify-start gap-3">
          
          {/* Logo & Asset Title */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-300 p-0.5 shadow-lg shadow-amber-500/20 flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-[#0e121b] rounded-[10px] flex items-center justify-center">
                <span className="text-lg font-bold text-amber-400">👑</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-base text-white tracking-wide font-mono">XAU/USD</h1>
                <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 whitespace-nowrap">
                  Gold Spot
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">Professional Trading Suite</p>
            </div>
          </div>

          {/* Live Market Tickers */}
          <div className="flex items-center gap-3 sm:gap-4 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800 font-mono text-xs">
            {/* Gold Live Price */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 text-[11px]">XAU/USD:</span>
              <span className="text-sm font-bold text-white tracking-tight">${currentPrice.toFixed(2)}</span>
              <span className={`text-[10px] px-1 py-0.5 rounded font-semibold flex items-center gap-0.5 ${
                isPositive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
              }`}>
                {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                {isPositive ? '+' : ''}{priceChange.toFixed(2)}
              </span>
            </div>

            <div className="h-3.5 w-[1px] bg-slate-800 hidden sm:block"></div>

            {/* DXY */}
            <div className="hidden sm:flex items-center gap-1.5 text-[11px]">
              <span className="text-slate-400">DXY:</span>
              <span className="font-semibold text-slate-200">{dxy.toFixed(2)}</span>
            </div>

            <div className="h-3.5 w-[1px] bg-slate-800 hidden md:block"></div>

            {/* US10Y */}
            <div className="hidden md:flex items-center gap-1.5 text-[11px]">
              <span className="text-slate-400">US10Y:</span>
              <span className="font-semibold text-slate-200">{us10y.toFixed(2)}%</span>
            </div>

            {/* Live Indicator */}
            <div className="flex items-center gap-1 pl-1.5 border-l border-slate-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="text-[10px] text-emerald-400 font-sans font-bold">LIVE</span>
            </div>
          </div>

        </div>

        {/* Right Section: Tab Navigation Menu (Clean, no overflow, auto scroll on mobile) */}
        <nav className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs font-medium overflow-x-auto max-w-full scrollbar-none">
          <button
            onClick={() => setActiveTab('chart')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeTab === 'chart' 
                ? 'bg-amber-500 text-slate-950 font-bold shadow' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <BarChart2 size={14} />
            <span>กราฟและอินดิเคเตอร์</span>
          </button>
          
          <button
            onClick={() => setActiveTab('tools')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeTab === 'tools' 
                ? 'bg-amber-500 text-slate-950 font-bold shadow' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Zap size={14} />
            <span>เครื่องมือวิเคราะห์ & คำนวณ</span>
          </button>

          <button
            onClick={() => setActiveTab('signals')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeTab === 'signals' 
                ? 'bg-amber-500 text-slate-950 font-bold shadow' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Activity size={14} />
            <span>สแกนสัญญาณเทรด</span>
          </button>

          <button
            onClick={() => setActiveTab('simulator')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeTab === 'simulator' 
                ? 'bg-amber-500 text-slate-950 font-bold shadow' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <ShieldAlert size={14} />
            <span>จำลองการเทรด (Simulator)</span>
          </button>
        </nav>

      </div>
    </header>
  );
}
