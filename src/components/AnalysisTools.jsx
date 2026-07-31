import React, { useState } from 'react';
import { Calculator, Table, Activity, DollarSign, ShieldAlert, Percent, ArrowUpRight, ArrowDownRight, Compass, HelpCircle } from 'lucide-react';
import { calculatePivotPoints } from '../utils/technicalAnalysis';

export default function AnalysisTools({ currentPrice, data }) {
  const [activeTool, setActiveTool] = useState('lotCalc'); // 'lotCalc' | 'pivots' | 'correlation'

  // --- Lot Size Calculator State ---
  const [balance, setBalance] = useState(10000);
  const [riskPercent, setRiskPercent] = useState(2);
  const [slType, setSlType] = useState('pips'); // 'pips' | 'price'
  const [slPips, setSlPips] = useState(50); // 50 pips = $5.00 gold movement
  const [slPrice, setSlPrice] = useState((currentPrice - 5.00).toFixed(2));
  const [leverage, setLeverage] = useState(100);

  // Calculations
  const maxRiskAmount = (balance * (riskPercent / 100));
  
  let pipsToRisk = slPips;
  if (slType === 'price') {
    const diff = Math.abs(currentPrice - parseFloat(slPrice || currentPrice));
    pipsToRisk = Math.max(1, Math.round(diff * 10)); // $1 gold = 10 pips
  }

  // 1 Standard Lot of XAU/USD = 100 oz. 1 pip ($0.10) move = $10 per Lot.
  const lotSize = Math.max(0.01, (maxRiskAmount / (pipsToRisk * 10))).toFixed(2);
  const requiredMargin = ((currentPrice * 100 * parseFloat(lotSize)) / leverage).toFixed(2);

  const tp15Price = (currentPrice + (pipsToRisk * 0.1 * 1.5)).toFixed(2);
  const tp20Price = (currentPrice + (pipsToRisk * 0.1 * 2.0)).toFixed(2);
  const tp30Price = (currentPrice + (pipsToRisk * 0.1 * 3.0)).toFixed(2);

  // --- Pivot Points State ---
  const lastCandle = data && data.length > 0 ? data[data.length - 1] : { high: currentPrice + 15, low: currentPrice - 15, close: currentPrice };
  const [pivHigh, setPivHigh] = useState(lastCandle.high.toFixed(2));
  const [pivLow, setPivLow] = useState(lastCandle.low.toFixed(2));
  const [pivClose, setPivClose] = useState(lastCandle.close.toFixed(2));

  const pivotResults = calculatePivotPoints(
    parseFloat(pivHigh) || currentPrice + 10,
    parseFloat(pivLow) || currentPrice - 10,
    parseFloat(pivClose) || currentPrice
  );

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-2xl flex flex-col gap-6">
      
      {/* Sub Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-4">
        <button
          onClick={() => setActiveTool('lotCalc')}
          className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 ${
            activeTool === 'lotCalc'
              ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Calculator size={16} />
          เครื่องมือคำนวณ Lot Size & ความเสี่ยง
        </button>

        <button
          onClick={() => setActiveTool('pivots')}
          className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 ${
            activeTool === 'pivots'
              ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Table size={16} />
          ตาราง Pivot Points (แนวรับ-แนวต้าน)
        </button>

        <button
          onClick={() => setActiveTool('correlation')}
          className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 ${
            activeTool === 'correlation'
              ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Activity size={16} />
          เมทริกซ์ความสัมพันธ์ (Correlation)
        </button>
      </div>

      {/* --- TOOL 1: LOT SIZE CALCULATOR --- */}
      {activeTool === 'lotCalc' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Input Panel */}
          <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 flex flex-col gap-4">
            <h3 className="text-base font-bold text-amber-400 flex items-center gap-2">
              <Calculator size={18} />
              การตั้งค่าบัญชี & คำนวณความเสี่ยง (Position Sizing)
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">ยอดเงินในพอร์ต (Account Balance $)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-500">$</span>
                  <input
                    type="number"
                    value={balance}
                    onChange={(e) => setBalance(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-7 pr-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 mb-1 block">ความเสี่ยงที่ยอมรับได้ (% Risk)</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    value={riskPercent}
                    onChange={(e) => setRiskPercent(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm font-mono text-amber-400 font-bold focus:outline-none focus:border-amber-500"
                  />
                  <span className="absolute right-3 top-2.5 text-slate-500">%</span>
                </div>
              </div>
            </div>

            {/* SL Input mode */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-slate-400">การตั้งค่าระยะ Stop Loss</label>
                <div className="flex items-center gap-2 text-xs">
                  <button
                    onClick={() => setSlType('pips')}
                    className={`px-2 py-0.5 rounded ${slType === 'pips' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-500'}`}
                  >
                    ระบุเป็น Pips
                  </button>
                  <button
                    onClick={() => setSlType('price')}
                    className={`px-2 py-0.5 rounded ${slType === 'price' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-500'}`}
                  >
                    ระบุเป็น ราคา (Price)
                  </button>
                </div>
              </div>

              {slType === 'pips' ? (
                <div>
                  <input
                    type="number"
                    value={slPips}
                    onChange={(e) => setSlPips(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-amber-500"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    (หมายเหตุ: ทองคำ 50 Pips = การเคลื่อนที่ $5.00 / oz)
                  </span>
                </div>
              ) : (
                <div>
                  <input
                    type="number"
                    step="0.1"
                    value={slPrice}
                    onChange={(e) => setSlPrice(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm font-mono text-rose-400 font-bold focus:outline-none focus:border-amber-500"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    ระยะจากราคาปัจจุบัน (${currentPrice.toFixed(2)}): Math.abs = ${(Math.abs(currentPrice - parseFloat(slPrice || currentPrice))).toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            {/* Leverage */}
            <div>
              <label className="text-xs text-slate-400 mb-1 block">เลเวอเรจ (Leverage)</label>
              <select
                value={leverage}
                onChange={(e) => setLeverage(parseInt(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-amber-500"
              >
                <option value={50}>1:50</option>
                <option value={100}>1:100</option>
                <option value={200}>1:200</option>
                <option value={500}>1:500</option>
                <option value={1000}>1:1000</option>
              </select>
            </div>

          </div>

          {/* Output Card */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/30 p-6 rounded-2xl border border-amber-500/30 flex flex-col justify-between shadow-xl">
            <div>
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-widest block mb-1">ผลการคำนวณขนาดออเดอร์ (Calculated Outputs)</span>
              
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-white font-mono">{lotSize}</span>
                <span className="text-lg font-bold text-amber-400">Lots</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">ขนาด Lot ที่เหมาะสมเพื่อควบคุมความเสี่ยงไม่ให้เกิน ${maxRiskAmount.toFixed(2)}</p>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">ความเสียหายสูงสุด (Max Loss)</span>
                  <span className="text-lg font-bold text-rose-400 font-mono">-${maxRiskAmount.toFixed(2)}</span>
                </div>

                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">หลักประกันที่ต้องใช้ (Margin)</span>
                  <span className="text-lg font-bold text-sky-400 font-mono">${requiredMargin}</span>
                </div>
              </div>

              {/* Recommended Take Profits */}
              <div className="mt-6">
                <span className="text-xs font-semibold text-slate-300 block mb-2">เป้าหมายกำไรที่แนะนำ (Risk:Reward Ratio):</span>
                <div className="space-y-2 font-mono text-xs">
                  <div className="flex items-center justify-between p-2 bg-slate-950/40 rounded-lg border border-slate-800/80">
                    <span className="text-slate-400">TP 1 (R:R 1 : 1.5):</span>
                    <span className="font-bold text-emerald-400">${tp15Price} (+${(maxRiskAmount * 1.5).toFixed(2)})</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-slate-950/40 rounded-lg border border-slate-800/80">
                    <span className="text-slate-400">TP 2 (R:R 1 : 2.0):</span>
                    <span className="font-bold text-emerald-400">${tp20Price} (+${(maxRiskAmount * 2.0).toFixed(2)})</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-slate-950/40 rounded-lg border border-slate-800/80">
                    <span className="text-slate-400">TP 3 (R:R 1 : 3.0):</span>
                    <span className="font-bold text-emerald-300">${tp30Price} (+${(maxRiskAmount * 3.0).toFixed(2)})</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center gap-2 text-xs text-slate-400">
              <ShieldAlert size={14} className="text-amber-400" />
              <span>การบริหารจัดการ Lot Size เป็นหัวใจสำคัญของการป้องกันพอร์ตระเบิดในการเทรด XAU/USD</span>
            </div>

          </div>

        </div>
      )}

      {/* --- TOOL 2: PIVOT POINTS CALCULATOR --- */}
      {activeTool === 'pivots' && (
        <div className="flex flex-col gap-6">
          
          <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center gap-4 text-xs">
              <div>
                <span className="text-slate-400 block mb-1">ราคาสูงสุด (High)</span>
                <input
                  type="number"
                  value={pivHigh}
                  onChange={(e) => setPivHigh(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 font-mono text-emerald-400 font-bold focus:outline-none"
                />
              </div>
              <div>
                <span className="text-slate-400 block mb-1">ราคาต่ำสุด (Low)</span>
                <input
                  type="number"
                  value={pivLow}
                  onChange={(e) => setPivLow(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 font-mono text-rose-400 font-bold focus:outline-none"
                />
              </div>
              <div>
                <span className="text-slate-400 block mb-1">ราคาปิด (Close)</span>
                <input
                  type="number"
                  value={pivClose}
                  onChange={(e) => setPivClose(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 font-mono text-amber-400 font-bold focus:outline-none"
                />
              </div>
            </div>

            <button
              onClick={() => {
                if (data && data.length > 0) {
                  const last = data[data.length - 1];
                  setPivHigh(last.high.toFixed(2));
                  setPivLow(last.low.toFixed(2));
                  setPivClose(last.close.toFixed(2));
                }
              }}
              className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-lg text-xs font-semibold hover:bg-amber-500/20"
            >
              🔄 ดึงค่าจากกราฟล่าสุด
            </button>
          </div>

          {/* Pivot Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-sm text-left font-mono">
              <thead className="bg-slate-900 text-slate-400 text-xs uppercase font-sans">
                <tr>
                  <th className="px-4 py-3">ประเภท Pivot Algorithm</th>
                  <th className="px-4 py-3 text-rose-400">R3 (ต้าน 3)</th>
                  <th className="px-4 py-3 text-rose-400">R2 (ต้าน 2)</th>
                  <th className="px-4 py-3 text-rose-300">R1 (ต้าน 1)</th>
                  <th className="px-4 py-3 text-amber-400">P (Pivot Point)</th>
                  <th className="px-4 py-3 text-emerald-300">S1 (รับ 1)</th>
                  <th className="px-4 py-3 text-emerald-400">S2 (รับ 2)</th>
                  <th className="px-4 py-3 text-emerald-400">S3 (รับ 3)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-950/60">
                <tr>
                  <td className="px-4 py-3 font-semibold font-sans text-slate-200">Standard Pivot</td>
                  <td className="px-4 py-3 text-rose-400">${pivotResults.standard.r3}</td>
                  <td className="px-4 py-3 text-rose-400">${pivotResults.standard.r2}</td>
                  <td className="px-4 py-3 text-rose-300">${pivotResults.standard.r1}</td>
                  <td className="px-4 py-3 font-bold text-amber-400 bg-amber-500/10">${pivotResults.standard.p}</td>
                  <td className="px-4 py-3 text-emerald-300">${pivotResults.standard.s1}</td>
                  <td className="px-4 py-3 text-emerald-400">${pivotResults.standard.s2}</td>
                  <td className="px-4 py-3 text-emerald-400">${pivotResults.standard.s3}</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-semibold font-sans text-slate-200">Fibonacci Pivot</td>
                  <td className="px-4 py-3 text-rose-400">${pivotResults.fibonacci.r3}</td>
                  <td className="px-4 py-3 text-rose-400">${pivotResults.fibonacci.r2}</td>
                  <td className="px-4 py-3 text-rose-300">${pivotResults.fibonacci.r1}</td>
                  <td className="px-4 py-3 font-bold text-amber-400 bg-amber-500/10">${pivotResults.fibonacci.p}</td>
                  <td className="px-4 py-3 text-emerald-300">${pivotResults.fibonacci.s1}</td>
                  <td className="px-4 py-3 text-emerald-400">${pivotResults.fibonacci.s2}</td>
                  <td className="px-4 py-3 text-emerald-400">${pivotResults.fibonacci.s3}</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-semibold font-sans text-slate-200">Camarilla Pivot</td>
                  <td className="px-4 py-3 text-rose-400">${pivotResults.camarilla.r3}</td>
                  <td className="px-4 py-3 text-rose-400">${pivotResults.camarilla.r2}</td>
                  <td className="px-4 py-3 text-rose-300">${pivotResults.camarilla.r1}</td>
                  <td className="px-4 py-3 font-bold text-amber-400 bg-amber-500/10">${pivotResults.camarilla.p}</td>
                  <td className="px-4 py-3 text-emerald-300">${pivotResults.camarilla.s1}</td>
                  <td className="px-4 py-3 text-emerald-400">${pivotResults.camarilla.s2}</td>
                  <td className="px-4 py-3 text-emerald-400">${pivotResults.camarilla.s3}</td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* --- TOOL 3: CORRELATION MATRIX --- */}
      {activeTool === 'correlation' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* DXY */}
          <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-white">US Dollar Index (DXY)</span>
                <span className="px-2 py-0.5 bg-rose-500/20 text-rose-400 font-mono text-xs rounded font-bold">-0.88</span>
              </div>
              <p className="text-xs text-slate-400">Inverse Correlation (ความสัมพันธ์ทิศทางตรงข้ามสูง)</p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-300">
              💡 เมื่อดอลลาร์แข็งค่า ทองคำมักปรับตัวลง ในทางกลับกันหาก DXY ร่วงหนัก ราคาทองมักพุ่งขึ้น
            </div>
          </div>

          {/* US10Y */}
          <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-white">US 10-Yr Yield (US10Y)</span>
                <span className="px-2 py-0.5 bg-rose-500/20 text-rose-400 font-mono text-xs rounded font-bold">-0.76</span>
              </div>
              <p className="text-xs text-slate-400">Inverse Correlation (ต้นทุนค่าเสียโอกาส)</p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-300">
              💡 Bond Yield พุ่งสูง ทำให้คนย้ายเงินไปถือพันธบัตรที่ให้ดอกเบี้ยมากกว่าทองคำ
            </div>
          </div>

          {/* Brent Crude */}
          <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-white">Brent Crude Oil</span>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 font-mono text-xs rounded font-bold">+0.62</span>
              </div>
              <p className="text-xs text-slate-400">Positive Correlation (ตัวชี้วัดเงินเฟ้อสะท้อนตลาด)</p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-300">
              💡 น้ำมันแพงหนุนเงินเฟ้อสูง ซึ่งผลักดันให้คนเข้าซื้อทองคำเพื่อ Hedge เงินเฟ้อ
            </div>
          </div>

          {/* EUR/USD */}
          <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-white">EUR / USD</span>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 font-mono text-xs rounded font-bold">+0.82</span>
              </div>
              <p className="text-xs text-slate-400">Positive Correlation (ทิศทางตามกัน)</p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-300">
              💡 ยูโรและทองคำมักปรับตัวขึ้นพร้อมกันเมื่อดอลลาร์สหรัฐฯ เกิดการอ่อนค่า
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
