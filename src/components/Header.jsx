import React, { useState } from 'react';
import { Activity, ShieldAlert, Zap, TrendingUp, TrendingDown, BarChart2, Settings, X, Eye, EyeOff } from 'lucide-react';

export default function Header({ 
  currentPrice, priceChange, priceChangePercent = 0, timeframe = 'H1', dxy, us10y, activeTab, setActiveTab,
  priceSource, setPriceSource, twelvedataApikey, setTwelvedataApikey, oandaConfig, setOandaConfig 
}) {
  const isPositive = priceChange >= 0;

  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [showTwelveKey, setShowTwelveKey] = useState(false);

  // Temporary form states initialized from current settings
  const [formPriceSource, setFormPriceSource] = useState(priceSource);
  const [formTwelveKey, setFormTwelveKey] = useState(twelvedataApikey);
  const [formToken, setFormToken] = useState(oandaConfig.token || '');
  const [formAccountId, setFormAccountId] = useState(oandaConfig.accountId || '');
  const [formEnv, setFormEnv] = useState(oandaConfig.env || 'practice');
  const [formProxyUrl, setFormProxyUrl] = useState(oandaConfig.proxyUrl || 'https://corsproxy.io/?');

  const handleSaveSettings = () => {
    localStorage.setItem('price_source', formPriceSource);
    localStorage.setItem('twelvedata_apikey', formTwelveKey.trim());
    const newConfig = {
      token: formToken.trim(),
      accountId: formAccountId.trim(),
      env: formEnv,
      proxyUrl: formProxyUrl.trim()
    };
    localStorage.setItem('oanda_config', JSON.stringify(newConfig));
    
    setPriceSource(formPriceSource);
    setTwelvedataApikey(formTwelveKey.trim());
    setOandaConfig(newConfig);
    setShowSettingsModal(false);
  };

  return (
    <>
      <header className="border-b border-slate-800 bg-slate-900/95 backdrop-blur sticky top-0 z-50 px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        
        {/* Left Section: Logo + Live Price Tickers */}
        <div className="flex flex-wrap items-center justify-between lg:justify-start gap-3">
          
          {/* Logo & Asset Title */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-sky-500 to-cyan-400 p-0.5 shadow-lg shadow-blue-500/20 flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                <span className="text-lg font-bold text-amber-500">👑</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-base text-slate-100 tracking-wide font-mono">PHAKDEE XAU/USD</h1>
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
              <span className="text-slate-400 text-[11px]">XAU/USD ({timeframe}):</span>
              <span className="text-sm font-bold text-slate-100 tracking-tight">${currentPrice.toFixed(2)}</span>
              <span className={`text-[10px] px-1 py-0.5 rounded font-semibold flex items-center gap-0.5 ${
                isPositive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
              }`}>
                {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                {isPositive ? '+' : ''}{priceChange.toFixed(2)} ({isPositive ? '+' : ''}{priceChangePercent.toFixed(2)}%)
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

            <div className="h-3.5 w-[1px] bg-slate-800"></div>

            {/* Source indicator & Settings Button */}
            <button
              onClick={() => {
                setFormPriceSource(priceSource);
                setFormTwelveKey(twelvedataApikey);
                setFormToken(oandaConfig.token || '');
                setFormAccountId(oandaConfig.accountId || '');
                setFormEnv(oandaConfig.env || 'practice');
                setFormProxyUrl(oandaConfig.proxyUrl || 'https://corsproxy.io/?');
                setShowSettingsModal(true);
              }}
              className="flex items-center gap-1.5 text-slate-400 hover:text-amber-500 transition-colors p-0.5 rounded cursor-pointer"
              title="ตั้งค่า API & แหล่งราคา (Price Feed Settings)"
            >
              <span className="text-[9px] font-sans font-bold uppercase px-1.5 py-0.5 bg-slate-800 rounded text-slate-300">
                {priceSource === 'twelvedata' ? '12DATA' : priceSource.toUpperCase()}
              </span>
              <Settings size={13} />
            </button>
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

    {/* Settings Modal */}
    {showSettingsModal && (
      <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl flex flex-col gap-5 text-slate-100 font-sans">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Settings size={18} className="text-amber-500" />
              ตั้งค่าแหล่งข้อมูลราคา (Price Feed Settings)
            </h3>
            <button
              onClick={() => setShowSettingsModal(false)}
              className="text-slate-400 hover:text-slate-100 p-1 rounded-lg hover:bg-slate-800"
            >
              <X size={18} />
            </button>
          </div>

          {/* Price Source Selector */}
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">เลือกแหล่งข้อมูลราคา (Price Source):</label>
            <select
              value={formPriceSource}
              onChange={(e) => setFormPriceSource(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-amber-500"
            >
              <option value="binance">Binance (PAXG / ราคาจำลอง)</option>
              <option value="twelvedata">Twelve Data (ราคาจริง XAU/USD)</option>
              <option value="oanda">Oanda (ราคาจริง XAU/USD)</option>
            </select>
          </div>

          {/* Twelve Data Settings */}
          {formPriceSource === 'twelvedata' && (
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Twelve Data API Key <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <input
                    type={showTwelveKey ? 'text' : 'password'}
                    value={formTwelveKey}
                    onChange={(e) => setFormTwelveKey(e.target.value)}
                    placeholder="กรอก Twelve Data API Key..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-3 pr-10 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowTwelveKey(!showTwelveKey)}
                    className="absolute right-3 top-2 text-slate-500 hover:text-slate-300"
                  >
                    {showTwelveKey ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[10px] text-slate-500">API Key จะบันทึกไว้ในเบราว์เซอร์เครื่องของคุณเท่านั้น</span>
                  <button
                    type="button"
                    onClick={() => setFormTwelveKey('038e09d0664d498ebd094324ec1ff766')}
                    className="text-[10px] text-amber-500 hover:underline"
                  >
                    ใช้คีย์หลักของผู้พัฒนา
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Oanda Settings */}
          {formPriceSource === 'oanda' && (
            <div className="flex flex-col gap-4">
              {/* Token */}
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Oanda API Token (Bearer Token) <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <input
                    type={showToken ? 'text' : 'password'}
                    value={formToken}
                    onChange={(e) => setFormToken(e.target.value)}
                    placeholder="กรอก Oanda API Token..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-3 pr-10 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="absolute right-3 top-2 text-slate-500 hover:text-slate-300"
                  >
                    {showToken ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {/* Account ID */}
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Account ID (ระบุสำหรับการดึงราคาแบบ Real-time)</label>
                <input
                  type="text"
                  value={formAccountId}
                  onChange={(e) => setFormAccountId(e.target.value)}
                  placeholder="เช่น 101-011-28392182-001 (ถ้ามี)..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Env & Proxy */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Environment</label>
                  <select
                    value={formEnv}
                    onChange={(e) => setFormEnv(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="practice">Practice (Demo)</option>
                    <option value="live">Live (Real)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-400 mb-1 block">CORS Proxy URL</label>
                  <input
                    type="text"
                    value={formProxyUrl}
                    onChange={(e) => setFormProxyUrl(e.target.value)}
                    placeholder="เช่น https://corsproxy.io/?..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Note */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[10px] text-slate-400 leading-relaxed">
            💡 {formPriceSource === 'twelvedata' ? 'Twelve Data เชื่อมต่อโดยตรงแบบเสถียร ไม่จำเป็นต้องรันผ่าน CORS Proxy' : 'การดึงข้อมูล Oanda จำเป็นต้องใช้ CORS Proxy เพื่อไม่ให้เบราว์เซอร์บล็อกข้อมูลความปลอดภัย'}
          </div>

          {/* Modal Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => setShowSettingsModal(false)}
              className="flex-1 py-2 rounded-xl border border-slate-800 text-slate-400 font-semibold text-xs hover:bg-slate-800"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleSaveSettings}
              className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20"
            >
              บันทึกการตั้งค่า
            </button>
          </div>
        </div>
      </div>
    )}
  </>
);
}
