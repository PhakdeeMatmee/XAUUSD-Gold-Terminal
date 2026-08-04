import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import InteractiveChart from './components/InteractiveChart';
import AnalysisTools from './components/AnalysisTools';
import SignalScanner from './components/SignalScanner';
import TradeSimulator from './components/TradeSimulator';
import MacroNews from './components/MacroNews';
import { generateGoldData, generateLiveTick, fetchRealLiveGoldPrice, fetchOandaCandles, fetchTwelveDataCandles } from './utils/goldDataGenerator';

export default function App() {
  const [timeframe, setTimeframe] = useState('H1');
  const [chartData, setChartData] = useState([]);
  const [activeTab, setActiveTab] = useState('chart'); // 'chart' | 'tools' | 'signals' | 'simulator'

  // Price Feed Source States
  const [priceSource, setPriceSource] = useState(() => {
    const saved = localStorage.getItem('price_source');
    if (saved) return saved;
    // Migration fallback for older use_oanda setting
    return localStorage.getItem('use_oanda') === 'true' ? 'oanda' : 'binance';
  });

  const [twelvedataApikey, setTwelvedataApikey] = useState(() => {
    return localStorage.getItem('twelvedata_apikey') || '038e09d0664d498ebd094324ec1ff766';
  });

  const [oandaConfig, setOandaConfig] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('oanda_config') || '{}');
    } catch {
      return {};
    }
  });

  // Macro ticker states
  const [dxy, setDxy] = useState(104.21);
  const [us10y, setUs10y] = useState(4.18);

  // Initialize historical gold data centered around real live market price
  useEffect(() => {
    async function loadRealData() {
      const keys = {
        twelvedataApikey,
        oandaConfig
      };
      const realPrice = await fetchRealLiveGoldPrice(priceSource, keys);
      
      let initialData = null;
      
      if (priceSource === 'twelvedata' && twelvedataApikey) {
        try {
          initialData = await fetchTwelveDataCandles(timeframe, 120, twelvedataApikey);
        } catch (err) {
          console.error("Failed to load Twelve Data candles, falling back to simulated data", err);
        }
      } else if (priceSource === 'oanda' && oandaConfig.token) {
        try {
          initialData = await fetchOandaCandles(timeframe, 120, oandaConfig);
        } catch (err) {
          console.error("Failed to load Oanda candles, falling back to simulated data", err);
        }
      }
      
      if (!initialData) {
        initialData = generateGoldData(timeframe, 120, realPrice);
      }
      
      setChartData(initialData);
    }
    loadRealData();
  }, [timeframe, priceSource, twelvedataApikey, oandaConfig]);

  // Sync real-time market ticks from Live Price API every 2.5 seconds
  useEffect(() => {
    if (chartData.length === 0) return;

    const interval = setInterval(async () => {
      const keys = {
        twelvedataApikey,
        oandaConfig
      };
      const realLivePrice = await fetchRealLiveGoldPrice(priceSource, keys);

      setChartData(prevData => {
        if (prevData.length === 0) return prevData;
        const lastCandle = prevData[prevData.length - 1];
        const updatedLast = generateLiveTick(lastCandle, timeframe, realLivePrice);
        return [...prevData.slice(0, -1), updatedLast];
      });

      // Fluctuate DXY slightly
      setDxy(prev => parseFloat((prev + (Math.random() - 0.5) * 0.02).toFixed(2)));
    }, 2500);

    return () => clearInterval(interval);
  }, [chartData.length, timeframe, priceSource, twelvedataApikey, oandaConfig]);

  if (chartData.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-amber-500 font-mono">
        <div className="flex flex-col items-center gap-3">
          <span className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></span>
          <span>กำลังเชื่อมต่อราคาจริง PHAKDEE XAU/USD Real-time Data...</span>
        </div>
      </div>
    );
  }

  const currentCandle = chartData[chartData.length - 1];
  const currentPrice = currentCandle.close;
  const priceChange = currentPrice - currentCandle.open;
  const priceChangePercent = currentCandle.open !== 0 ? (priceChange / currentCandle.open) * 100 : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500/20 selection:text-amber-500">
      
      {/* Top Header */}
      <Header
        currentPrice={currentPrice}
        priceChange={priceChange}
        priceChangePercent={priceChangePercent}
        timeframe={timeframe}
        dxy={dxy}
        us10y={us10y}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        priceSource={priceSource}
        setPriceSource={setPriceSource}
        twelvedataApikey={twelvedataApikey}
        setTwelvedataApikey={setTwelvedataApikey}
        oandaConfig={oandaConfig}
        setOandaConfig={setOandaConfig}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 flex flex-col gap-6">
        
        {/* Chart Tab */}
        <div className={activeTab === 'chart' ? 'flex flex-col gap-6' : 'hidden'}>
          <InteractiveChart
            data={chartData}
            timeframe={timeframe}
            setTimeframe={setTimeframe}
            liveTick={currentCandle}
          />
          <SignalScanner data={chartData} currentPrice={currentPrice} />
        </div>

        {/* Tools Tab */}
        <div className={activeTab === 'tools' ? 'block' : 'hidden'}>
          <AnalysisTools currentPrice={currentPrice} data={chartData} />
        </div>

        {/* Signals Tab */}
        <div className={activeTab === 'signals' ? 'block' : 'hidden'}>
          <SignalScanner data={chartData} currentPrice={currentPrice} />
        </div>

        {/* Simulator Tab (Mounted permanently so state & open trades never unmount on tab switch) */}
        <div className={activeTab === 'simulator' ? 'block' : 'hidden'}>
          <TradeSimulator currentPrice={currentPrice} />
        </div>

        {/* Bottom Macro Economic News Dashboard */}
        <MacroNews />

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900 py-4 px-6 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>👑 PHAKDEE XAU/USD Gold Analysis Terminal & Trading Suite</span>
          <span>เชื่อมต่อราคาจริง Real-Time Spot Gold Price</span>
        </div>
      </footer>

    </div>
  );
}
