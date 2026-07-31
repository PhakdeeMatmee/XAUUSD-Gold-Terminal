import React, { useState } from 'react';
import { ShieldAlert, Play, ArrowUpRight, ArrowDownRight, CheckCircle, XCircle, RefreshCw, BarChart2, DollarSign, TrendingUp } from 'lucide-react';

export default function TradeSimulator({ currentPrice }) {
  const [balance, setBalance] = useState(10000);
  const [positions, setPositions] = useState([]);
  const [history, setHistory] = useState([
    { id: 1, type: 'BUY', lot: 0.5, entry: 4035.20, exit: 4068.50, pnl: 1665.00, result: 'WIN', date: '2026-07-30' },
    { id: 2, type: 'SELL', lot: 0.3, entry: 4080.00, exit: 4092.10, pnl: -363.00, result: 'LOSS', date: '2026-07-29' }
  ]);

  const [tradeType, setTradeType] = useState('BUY');
  const [lotSize, setLotSize] = useState(0.2);
  const [slPrice, setSlPrice] = useState((currentPrice - 8.00).toFixed(2));
  const [tpPrice, setTpPrice] = useState((currentPrice + 16.00).toFixed(2));

  // Open a new trade
  const handleOpenTrade = () => {
    const newPos = {
      id: Date.now(),
      type: tradeType,
      lot: parseFloat(lotSize),
      entry: currentPrice,
      sl: parseFloat(slPrice),
      tp: parseFloat(tpPrice),
      openTime: new Date().toLocaleTimeString()
    };
    setPositions([newPos, ...positions]);
  };

  // Close trade manually
  const handleCloseTrade = (posId) => {
    const pos = positions.find(p => p.id === posId);
    if (!pos) return;

    let pnl = 0;
    if (pos.type === 'BUY') {
      pnl = (currentPrice - pos.entry) * pos.lot * 100;
    } else {
      pnl = (pos.entry - currentPrice) * pos.lot * 100;
    }

    const closedRecord = {
      id: pos.id,
      type: pos.type,
      lot: pos.lot,
      entry: pos.entry,
      exit: currentPrice,
      pnl: parseFloat(pnl.toFixed(2)),
      result: pnl >= 0 ? 'WIN' : 'LOSS',
      date: new Date().toLocaleDateString()
    };

    setBalance(prev => prev + pnl);
    setHistory([closedRecord, ...history]);
    setPositions(positions.filter(p => p.id !== posId));
  };

  // Calculate stats
  const totalPnL = history.reduce((acc, h) => acc + h.pnl, 0);
  const wins = history.filter(h => h.result === 'WIN').length;
  const winRate = history.length > 0 ? ((wins / history.length) * 100).toFixed(1) : 0;

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-2xl flex flex-col gap-6">
      
      {/* Simulator Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 p-5 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldAlert size={20} className="text-amber-400" />
            ระบบจำลองการเทรด (Trade Strategy Simulator & Execution)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">ทดสอบแผนการเทรดแบบไร้ความเสี่ยง (Paper Trading) พร้อมติดตามสถิติ Win Rate</p>
        </div>

        {/* Balance Stats */}
        <div className="flex items-center gap-4 bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-800 font-mono text-sm">
          <div>
            <span className="text-xs text-slate-400 block font-sans">พอร์ตจำลอง (Balance):</span>
            <span className="font-bold text-white">${balance.toFixed(2)}</span>
          </div>
          <div className="h-6 w-[1px] bg-slate-800"></div>
          <div>
            <span className="text-xs text-slate-400 block font-sans">กำไรสุทธิ (Total PnL):</span>
            <span className={`font-bold ${totalPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(2)}
            </span>
          </div>
          <div className="h-6 w-[1px] bg-slate-800"></div>
          <div>
            <span className="text-xs text-slate-400 block font-sans">อัตรา Win Rate:</span>
            <span className="font-bold text-amber-400">{winRate}%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Order Execution Panel */}
        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 flex flex-col gap-4">
          <h3 className="text-sm font-bold text-amber-400">เปิดออเดอร์ใหม่ (New Order Execution)</h3>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => { setTradeType('BUY'); setSlPrice((currentPrice - 8).toFixed(2)); setTpPrice((currentPrice + 16).toFixed(2)); }}
              className={`py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                tradeType === 'BUY' ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20' : 'bg-slate-950 text-slate-400 border border-slate-800'
              }`}
            >
              <ArrowUpRight size={18} />
              BUY (ฝั่งซื้อ)
            </button>
            <button
              onClick={() => { setTradeType('SELL'); setSlPrice((currentPrice + 8).toFixed(2)); setTpPrice((currentPrice - 16).toFixed(2)); }}
              className={`py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                tradeType === 'SELL' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'bg-slate-950 text-slate-400 border border-slate-800'
              }`}
            >
              <ArrowDownRight size={18} />
              SELL (ฝั่งขาย)
            </button>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div>
              <label className="text-slate-400 block mb-1 font-sans">ราคาปัจจุบัน (Market Price):</label>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-lg font-bold text-amber-400">
                ${currentPrice.toFixed(2)}
              </div>
            </div>

            <div>
              <label className="text-slate-400 block mb-1 font-sans">ขนาด Lot Size:</label>
              <input
                type="number"
                step="0.05"
                value={lotSize}
                onChange={(e) => setLotSize(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-rose-400 block mb-1 font-sans">Stop Loss ($):</label>
                <input
                  type="number"
                  step="0.5"
                  value={slPrice}
                  onChange={(e) => setSlPrice(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-rose-400 font-bold"
                />
              </div>

              <div>
                <label className="text-emerald-400 block mb-1 font-sans">Take Profit ($):</label>
                <input
                  type="number"
                  step="0.5"
                  value={tpPrice}
                  onChange={(e) => setTpPrice(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-emerald-400 font-bold"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleOpenTrade}
            className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 mt-2"
          >
            <Play size={16} />
            ส่งคำสั่งจำลองทันที (Execute Order)
          </button>
        </div>

        {/* Active Open Positions & Trade Journal */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Active Positions */}
          <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Activity size={16} className="text-emerald-400" />
              สถานะออเดอร์ที่กำลังถืออยู่ (Active Open Positions)
            </h3>

            {positions.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500">
                ไม่มีออเดอร์ค้างอยู่ในขณะนี้
              </div>
            ) : (
              <div className="space-y-2 font-mono text-xs">
                {positions.map((pos) => {
                  const currentPnl = pos.type === 'BUY' 
                    ? (currentPrice - pos.entry) * pos.lot * 100 
                    : (pos.entry - currentPrice) * pos.lot * 100;
                  const isProfitable = currentPnl >= 0;

                  return (
                    <div key={pos.id} className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${pos.type === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                          {pos.type} {pos.lot} Lots
                        </span>
                        <span>Entry: <strong>${pos.entry.toFixed(2)}</strong></span>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className={`font-bold ${isProfitable ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isProfitable ? '+' : ''}${currentPnl.toFixed(2)}
                        </span>
                        <button
                          onClick={() => handleCloseTrade(pos.id)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-sans font-medium"
                        >
                          ปิดออเดอร์ (Close)
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Trade History & Journal */}
          <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800">
            <h3 className="text-sm font-bold text-white mb-3">บันทึกประวัติการเทรด (Trade History & Journal)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono text-left">
                <thead className="text-slate-500 border-b border-slate-800 font-sans uppercase">
                  <tr>
                    <th className="py-2">วันที่</th>
                    <th className="py-2">ประเภท</th>
                    <th className="py-2">ขนาด Lot</th>
                    <th className="py-2">ราคาเข้า (Entry)</th>
                    <th className="py-2">ราคาออก (Exit)</th>
                    <th className="py-2">ผลกำไร/ขาดทุน (PnL)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {history.map(item => (
                    <tr key={item.id}>
                      <td className="py-2.5 text-slate-400">{item.date}</td>
                      <td className="py-2.5 font-bold">
                        <span className={item.type === 'BUY' ? 'text-emerald-400' : 'text-rose-400'}>{item.type}</span>
                      </td>
                      <td className="py-2.5 text-slate-200">{item.lot}</td>
                      <td className="py-2.5 text-slate-300">${item.entry.toFixed(2)}</td>
                      <td className="py-2.5 text-slate-300">${item.exit.toFixed(2)}</td>
                      <td className={`py-2.5 font-bold ${item.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {item.pnl >= 0 ? '+' : ''}${item.pnl.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
