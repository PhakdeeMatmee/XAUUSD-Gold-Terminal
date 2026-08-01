import React, { useState, useEffect } from 'react';
import { ShieldAlert, Play, ArrowUpRight, ArrowDownRight, CheckCircle2, AlertCircle, RefreshCw, Activity, DollarSign, Target, Settings, Sliders, X } from 'lucide-react';

export default function TradeSimulator({ currentPrice }) {
  // Load initial balance from localStorage or default to 10000
  const [balance, setBalance] = useState(() => {
    const saved = localStorage.getItem('xau_sim_balance');
    return saved !== null ? parseFloat(saved) : 10000;
  });

  // Load positions from localStorage
  const [positions, setPositions] = useState(() => {
    const saved = localStorage.getItem('xau_sim_positions');
    return saved !== null ? JSON.parse(saved) : [];
  });

  // Load history from localStorage
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('xau_sim_history');
    return saved !== null ? JSON.parse(saved) : [
      { id: 1, type: 'BUY', lot: 0.5, entry: 4035.20, exit: 4068.50, pnl: 1665.00, result: 'WIN', date: '2026-07-30' },
      { id: 2, type: 'SELL', lot: 0.3, entry: 4080.00, exit: 4092.10, pnl: -363.00, result: 'LOSS', date: '2026-07-29' }
    ];
  });

  const [tradeType, setTradeType] = useState('BUY');
  const [lotSize, setLotSize] = useState(0.2);
  const [slPrice, setSlPrice] = useState((currentPrice - 8.00).toFixed(2));
  const [tpPrice, setTpPrice] = useState((currentPrice + 16.00).toFixed(2));
  const [toast, setToast] = useState(null);

  // Custom Balance Modal/Panel state
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [customBalanceInput, setCustomBalanceInput] = useState('10000');
  const [resetHistoryWithBalance, setResetHistoryWithBalance] = useState(false);

  // Auto save balance, positions, and history to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('xau_sim_balance', balance.toString());
  }, [balance]);

  useEffect(() => {
    localStorage.setItem('xau_sim_positions', JSON.stringify(positions));
  }, [positions]);

  useEffect(() => {
    localStorage.setItem('xau_sim_history', JSON.stringify(history));
  }, [history]);

  // Auto update SL/TP default values when currentPrice changes if user hasn't edited
  useEffect(() => {
    if (tradeType === 'BUY') {
      setSlPrice((currentPrice - 8.00).toFixed(2));
      setTpPrice((currentPrice + 16.00).toFixed(2));
    } else {
      setSlPrice((currentPrice + 8.00).toFixed(2));
      setTpPrice((currentPrice - 16.00).toFixed(2));
    }
  }, [tradeType]);

  // Toast Notification Helper
  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Monitor live price against open positions to trigger SL or TP
  useEffect(() => {
    if (positions.length === 0) return;

    positions.forEach(pos => {
      let triggered = null; // 'TP' | 'SL'

      if (pos.type === 'BUY') {
        if (currentPrice >= pos.tp) triggered = 'TP';
        else if (currentPrice <= pos.sl) triggered = 'SL';
      } else { // SELL
        if (currentPrice <= pos.tp) triggered = 'TP';
        else if (currentPrice >= pos.sl) triggered = 'SL';
      }

      if (triggered) {
        closePosition(pos, currentPrice, triggered);
      }
    });
  }, [currentPrice, positions]);

  // Execute new order
  const handleOpenTrade = () => {
    const lot = parseFloat(lotSize);
    const sl = parseFloat(slPrice);
    const tp = parseFloat(tpPrice);

    if (isNaN(lot) || lot <= 0) {
      showToast('กรุณาระบุขนาด Lot Size ให้ถูกต้อง', 'error');
      return;
    }

    const newPos = {
      id: Date.now(),
      type: tradeType,
      lot: lot,
      entry: currentPrice,
      sl: sl,
      tp: tp,
      openTime: new Date().toLocaleTimeString()
    };

    setPositions([newPos, ...positions]);
    showToast(`ส่งคำสั่ง ${tradeType} ${lot} Lot สำเร็จที่ราคา $${currentPrice.toFixed(2)}`, 'success');
  };

  // Close Position Logic
  const closePosition = (pos, exitPrice, triggerReason = 'MANUAL') => {
    let pnl = 0;
    if (pos.type === 'BUY') {
      pnl = (exitPrice - pos.entry) * pos.lot * 100;
    } else {
      pnl = (pos.entry - exitPrice) * pos.lot * 100;
    }

    const isWin = pnl >= 0;
    const closedRecord = {
      id: pos.id,
      type: pos.type,
      lot: pos.lot,
      entry: pos.entry,
      exit: exitPrice,
      pnl: parseFloat(pnl.toFixed(2)),
      result: isWin ? 'WIN' : 'LOSS',
      date: new Date().toLocaleDateString()
    };

    setBalance(prev => prev + pnl);
    setHistory(prev => [closedRecord, ...prev]);
    setPositions(prev => prev.filter(p => p.id !== pos.id));

    if (triggerReason === 'TP') {
      showToast(`🎯 ชนเป้ากำไร Take Profit! ชนะ +$${pnl.toFixed(2)}`, 'success');
    } else if (triggerReason === 'SL') {
      showToast(`🛑 ชนจุดตัดขาดทุน Stop Loss! ขาดทุน -${Math.abs(pnl).toFixed(2)}`, 'error');
    } else {
      showToast(`ปิดออเดอร์ ${pos.type} สำเร็จ ผลกำไร: ${isWin ? '+' : ''}$${pnl.toFixed(2)}`, isWin ? 'success' : 'error');
    }
  };

  // Apply Custom Balance Setting permanently
  const handleApplyCustomBalance = () => {
    const val = parseFloat(customBalanceInput);
    if (isNaN(val) || val <= 0) {
      showToast('กรุณาระบุจำนวนเงินพอร์ตจำลองให้ถูกต้อง (มากกว่า $0)', 'error');
      return;
    }

    setBalance(val);
    localStorage.setItem('xau_sim_balance', val.toString());

    if (resetHistoryWithBalance) {
      setPositions([]);
      setHistory([]);
      localStorage.setItem('xau_sim_positions', JSON.stringify([]));
      localStorage.setItem('xau_sim_history', JSON.stringify([]));
    }
    setShowBalanceModal(false);
    showToast(`บันทึกเงินพอร์ตจำลองใหม่เป็น $${val.toLocaleString()} เรียบร้อยแล้ว (บันทึกถาวร)`, 'success');
  };

  // Calculate statistics
  const totalPnL = history.reduce((acc, h) => acc + h.pnl, 0);
  const wins = history.filter(h => h.result === 'WIN').length;
  const winRate = history.length > 0 ? ((wins / history.length) * 100).toFixed(1) : 0;

  // Estimated PnL preview for current order setup
  const estSlLoss = Math.abs((parseFloat(slPrice || currentPrice) - currentPrice) * parseFloat(lotSize || 0) * 100);
  const estTpGain = Math.abs((parseFloat(tpPrice || currentPrice) - currentPrice) * parseFloat(lotSize || 0) * 100);

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-2xl flex flex-col gap-6 relative">
      
      {/* Toast Notification Banner */}
      {toast && (
        <div className={`fixed top-20 right-6 z-50 px-4 py-3 rounded-xl border shadow-2xl font-semibold text-xs flex items-center gap-2 animate-bounce ${
          toast.type === 'success' ? 'bg-emerald-950 border-emerald-500 text-emerald-300' :
          toast.type === 'error' ? 'bg-rose-950 border-rose-500 text-rose-300' : 'bg-slate-900 border-amber-500 text-amber-300'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Custom Balance Setup Modal */}
      {showBalanceModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e121b] border border-amber-500/40 rounded-2xl p-6 max-w-md w-full shadow-2xl flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sliders size={18} className="text-amber-400" />
                ตั้งค่ายอดเงินพอร์ตจำลอง (Set Account Balance)
              </h3>
              <button
                onClick={() => setShowBalanceModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            {/* Presets */}
            <div>
              <label className="text-xs text-slate-400 mb-2 block">เลือกยอดเงินทุนสำเร็จรูป (Presets):</label>
              <div className="grid grid-cols-3 gap-2 font-mono text-xs">
                {[500, 1000, 3000, 5000, 10000, 50000].map(amt => (
                  <button
                    key={amt}
                    onClick={() => setCustomBalanceInput(amt.toString())}
                    className={`py-2 px-3 rounded-xl border text-center font-bold transition-all ${
                      customBalanceInput === amt.toString()
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                        : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-amber-500/50'
                    }`}
                  >
                    ${amt.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Input */}
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">หรือระบุจำนวนเงินที่ต้องการ ($ USD):</label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-slate-500 font-mono font-bold">$</span>
                <input
                  type="number"
                  step="100"
                  min="1"
                  value={customBalanceInput}
                  onChange={(e) => setCustomBalanceInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-4 py-2 text-base font-mono text-amber-400 font-bold focus:outline-none focus:border-amber-500"
                  placeholder="เช่น 10000"
                />
              </div>
            </div>

            {/* Reset checkbox option */}
            <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <input
                type="checkbox"
                checked={resetHistoryWithBalance}
                onChange={(e) => setResetHistoryWithBalance(e.target.checked)}
                className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
              />
              <span>ล้างประวัติการเทรดและออเดอร์ทั้งหมดเพื่อเริ่มนับใหม่</span>
            </label>

            {/* Modal Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowBalanceModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-800 text-slate-400 font-semibold text-xs hover:bg-slate-800"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleApplyCustomBalance}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20"
              >
                บันทึกยอดเงินพอร์ต (ถาวร)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Simulator Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 p-5 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldAlert size={20} className="text-amber-400" />
            ระบบจำลองการเทรดทองคำ (Gold Strategy Simulator)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">ทดสอบเปิด-ปิดออเดอร์ตามราคาจริง พร้อมระบบชน TP/SL อัตโนมัติและติดตาม Win Rate</p>
        </div>

        {/* Balance Stats Bar with Custom Balance Button */}
        <div className="flex flex-wrap items-center gap-3 bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-800 font-mono text-sm">
          <div>
            <span className="text-xs text-slate-400 block font-sans">พอร์ตจำลอง (Balance):</span>
            <span className="font-extrabold text-amber-400 text-base">${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>

          <button
            onClick={() => { setCustomBalanceInput(balance.toString()); setShowBalanceModal(true); }}
            className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg text-xs font-sans font-bold flex items-center gap-1.5 transition-all shadow-sm"
            title="ตั้งค่ายอดเงินทุนจำลองแบบถาวร"
          >
            <Sliders size={13} />
            <span>ตั้งค่ายอดพอร์ต</span>
          </button>

          <div className="h-6 w-[1px] bg-slate-800 hidden sm:block"></div>
          <div>
            <span className="text-xs text-slate-400 block font-sans">กำไรสุทธิ (Total PnL):</span>
            <span className={`font-bold ${totalPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(2)}
            </span>
          </div>
          <div className="h-6 w-[1px] bg-slate-800 hidden sm:block"></div>
          <div>
            <span className="text-xs text-slate-400 block font-sans">อัตรา Win Rate:</span>
            <span className="font-bold text-amber-400">{winRate}% ({wins}/{history.length})</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Order Execution Panel */}
        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
              <Play size={16} />
              ส่งคำสั่งเทรด (Order Execution)
            </h3>
            <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Live Tick: ${currentPrice.toFixed(2)}
            </span>
          </div>

          {/* Buy / Sell Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setTradeType('BUY')}
              className={`py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                tradeType === 'BUY' 
                  ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20 ring-2 ring-emerald-400' 
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              <ArrowUpRight size={18} />
              BUY (ฝั่งซื้อ)
            </button>
            <button
              onClick={() => setTradeType('SELL')}
              className={`py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                tradeType === 'SELL' 
                  ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20 ring-2 ring-rose-400' 
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              <ArrowDownRight size={18} />
              SELL (ฝั่งขาย)
            </button>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div>
              <label className="text-slate-400 block mb-1 font-sans">ขนาด Lot Size (1 Lot = 100 oz):</label>
              <input
                type="number"
                step="0.05"
                min="0.01"
                max="100"
                value={lotSize}
                onChange={(e) => setLotSize(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold text-sm focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-rose-400 block mb-1 font-sans">Stop Loss ($):</label>
                <input
                  type="number"
                  step="0.5"
                  value={slPrice}
                  onChange={(e) => setSlPrice(e.target.value)}
                  className="w-full bg-slate-950 border border-rose-500/40 rounded-xl px-3 py-2 text-rose-400 font-bold focus:outline-none"
                />
                <span className="text-[10px] text-rose-400/80 mt-1 block">
                  ประเมินขาดทุน: -${estSlLoss.toFixed(2)}
                </span>
              </div>

              <div>
                <label className="text-emerald-400 block mb-1 font-sans">Take Profit ($):</label>
                <input
                  type="number"
                  step="0.5"
                  value={tpPrice}
                  onChange={(e) => setTpPrice(e.target.value)}
                  className="w-full bg-slate-950 border border-emerald-500/40 rounded-xl px-3 py-2 text-emerald-400 font-bold focus:outline-none"
                />
                <span className="text-[10px] text-emerald-400/80 mt-1 block">
                  ประเมินกำไร: +${estTpGain.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="text-slate-500">Quick SL/TP:</span>
            <button
              onClick={() => {
                if (tradeType === 'BUY') { setSlPrice((currentPrice - 5).toFixed(2)); setTpPrice((currentPrice + 10).toFixed(2)); }
                else { setSlPrice((currentPrice + 5).toFixed(2)); setTpPrice((currentPrice - 10).toFixed(2)); }
              }}
              className="px-2 py-0.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-slate-300"
            >
              1:2 Ratio
            </button>
            <button
              onClick={() => {
                if (tradeType === 'BUY') { setSlPrice((currentPrice - 10).toFixed(2)); setTpPrice((currentPrice + 25).toFixed(2)); }
                else { setSlPrice((currentPrice + 10).toFixed(2)); setTpPrice((currentPrice - 25).toFixed(2)); }
              }}
              className="px-2 py-0.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-slate-300"
            >
              1:2.5 Ratio
            </button>
          </div>

          <button
            onClick={handleOpenTrade}
            className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 mt-2"
          >
            <Play size={16} />
            ส่งคำสั่งจำลองทันที (Execute {tradeType} Order)
          </button>
        </div>

        {/* Active Open Positions & Trade Journal */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Active Positions */}
          <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity size={16} className="text-emerald-400" />
                สถานะออเดอร์ที่กำลังถืออยู่ (Active Open Positions)
              </h3>
              <span className="text-xs font-mono text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                {positions.length} Positions Active
              </span>
            </div>

            {positions.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl bg-slate-950/40">
                ยังไม่มีออเดอร์ค้างอยู่ในขณะนี้ (กดปุ่มเปิดออเดอร์ฝั่ง BUY หรือ SELL ด้านซ้ายเพื่อเริ่มทดสอบ)
              </div>
            ) : (
              <div className="space-y-2.5 font-mono text-xs">
                {positions.map((pos) => {
                  const currentPnl = pos.type === 'BUY' 
                    ? (currentPrice - pos.entry) * pos.lot * 100 
                    : (pos.entry - currentPrice) * pos.lot * 100;
                  const isProfitable = currentPnl >= 0;

                  return (
                    <div key={pos.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-slate-950 rounded-xl border border-slate-800 gap-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className={`px-2.5 py-1 rounded text-xs font-extrabold ${
                          pos.type === 'BUY' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}>
                          {pos.type} {pos.lot} Lot
                        </span>
                        <span>เข้าที่: <strong className="text-white">${pos.entry.toFixed(2)}</strong></span>
                        <span className="text-rose-400">SL: ${pos.sl.toFixed(2)}</span>
                        <span className="text-emerald-400">TP: ${pos.tp.toFixed(2)}</span>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 border-slate-800 pt-2 sm:pt-0">
                        <span className={`text-sm font-extrabold ${isProfitable ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isProfitable ? '+' : ''}${currentPnl.toFixed(2)}
                        </span>
                        <button
                          onClick={() => closePosition(pos, currentPrice, 'MANUAL')}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-sans font-semibold transition-all"
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
            
            {history.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500">ไม่มีประวัติการเทรดที่ปิดแล้ว</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs font-mono text-left">
                  <thead className="text-slate-500 border-b border-slate-800 font-sans uppercase">
                    <tr>
                      <th className="py-2 px-2">วันที่</th>
                      <th className="py-2 px-2">ประเภท</th>
                      <th className="py-2 px-2">ขนาด Lot</th>
                      <th className="py-2 px-2">ราคาเข้า (Entry)</th>
                      <th className="py-2 px-2">ราคาออก (Exit)</th>
                      <th className="py-2 px-2 text-right">ผลกำไร/ขาดทุน (PnL)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {history.map(item => (
                      <tr key={item.id} className="hover:bg-slate-950/40">
                        <td className="py-2.5 px-2 text-slate-400">{item.date}</td>
                        <td className="py-2.5 px-2 font-bold">
                          <span className={item.type === 'BUY' ? 'text-emerald-400' : 'text-rose-400'}>{item.type}</span>
                        </td>
                        <td className="py-2.5 px-2 text-slate-200">{item.lot}</td>
                        <td className="py-2.5 px-2 text-slate-300">${item.entry.toFixed(2)}</td>
                        <td className="py-2.5 px-2 text-slate-300">${item.exit.toFixed(2)}</td>
                        <td className={`py-2.5 px-2 font-bold text-right ${item.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {item.pnl >= 0 ? '+' : ''}${item.pnl.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
