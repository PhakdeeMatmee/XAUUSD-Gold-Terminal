import React from 'react';
import { Activity, ShieldCheck, ArrowUpRight, ArrowDownRight, Target, CheckCircle2, AlertTriangle, Cpu } from 'lucide-react';
import { generateMarketSignals } from '../utils/technicalAnalysis';

export default function SignalScanner({ data, currentPrice }) {
  const signalData = generateMarketSignals(data);

  if (!signalData) {
    return (
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 text-center text-slate-400">
        กำลังประมวลผลสัญญาณเทรด...
      </div>
    );
  }

  const { bias, bullRatio, reasons, setup, supports, resistances } = signalData;
  const isBullish = bias.includes('BULLISH');

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-2xl flex flex-col gap-6">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/20 p-5 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Cpu size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-100">ระบบสแกนสัญญาณเทรดทองคำ (Automated Technical Scanner)</h2>
              <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs rounded font-mono font-semibold">AI Confluence Model</span>
            </div>
            <p className="text-xs text-slate-400">วิเคราะห์อัลกอริทึมจาก EMA Multi-Layer, RSI Divergence, MACD Momentum & Key Zones</p>
          </div>
        </div>

        {/* Overall Sentiment Badge */}
        <div className="flex items-center gap-4 bg-slate-950/80 px-5 py-3 rounded-xl border border-slate-800">
          <div>
            <span className="text-xs text-slate-400 block">แนวโน้มภาพรวมตลาด (Overall Bias):</span>
            <span className={`text-lg font-extrabold font-mono ${isBullish ? 'text-emerald-400' : 'text-rose-400'}`}>
              {bias}
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 block">คะแนนฝั่งกระทิง (Bull Power):</span>
            <span className="text-lg font-bold text-amber-400 font-mono">{bullRatio}%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Trading Plan Card */}
        <div className="lg:col-span-2 bg-slate-900/80 p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-lg text-xs font-extrabold font-mono flex items-center gap-1 ${
                  setup.type === 'BUY' ? 'bg-emerald-500 text-slate-950' : 'bg-rose-500 text-white'
                }`}>
                  {setup.type === 'BUY' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                  {setup.type} SETUP
                </span>
                <span className="text-xs text-slate-400">Timeframe: {setup.timeframe}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">ระดับความมั่นใจ:</span>
                <span className="text-xs font-bold text-amber-400 font-mono bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  {setup.confidence}% High Confluence
                </span>
              </div>
            </div>

            {/* Price Targets Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 font-mono text-xs mb-6">
              
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-500 block mb-1 font-sans">จุดเข้าซื้อ (Entry)</span>
                <span className="text-sm font-bold text-slate-100">${setup.entry.toFixed(2)}</span>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-rose-500/30">
                <span className="text-rose-400 block mb-1 font-sans">จุดตัดขาดทุน (SL)</span>
                <span className="text-sm font-bold text-rose-400">${setup.sl.toFixed(2)}</span>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-emerald-500/30">
                <span className="text-emerald-400 block mb-1 font-sans">เป้าหมาย 1 (TP1)</span>
                <span className="text-sm font-bold text-emerald-400">${setup.tp1.toFixed(2)}</span>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-emerald-500/30">
                <span className="text-emerald-400 block mb-1 font-sans">เป้าหมาย 2 (TP2)</span>
                <span className="text-sm font-bold text-emerald-400">${setup.tp2.toFixed(2)}</span>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-amber-500/30 col-span-2 sm:col-span-1">
                <span className="text-amber-400 block mb-1 font-sans">R:R Ratio</span>
                <span className="text-sm font-bold text-amber-400">1 : {setup.rrRatio}</span>
              </div>

            </div>

            {/* Technical Confluence Reasons */}
            <h4 className="text-xs font-semibold text-slate-300 mb-2">เหตุผลซัพพอร์ตสัญญาณทางเทคนิค (Technical Rationale):</h4>
            <div className="space-y-2 text-xs text-slate-300">
              {reasons.map((reason, idx) => (
                <div key={idx} className="flex items-start gap-2 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                  <CheckCircle2 size={14} className="text-amber-400 shrink-0 mt-0.5" />
                  <span>{reason}</span>
                </div>
              ))}
            </div>

          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>คำแนะนำ: ควรใช้ระบบนี้ประกอบกับการจัดการ Money Management 1-2% ต่อการเทรด</span>
            <span className="font-mono text-amber-400 font-bold">XAUUSD Live Scanner</span>
          </div>
        </div>

        {/* Key Levels Overview Side Card */}
        <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-100 mb-4 flex items-center gap-2">
              <Target size={16} className="text-amber-400" />
              ระดับราคาสำคัญในตลาด (Key Levels)
            </h3>

            {/* Resistances */}
            <div className="mb-4">
              <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider block mb-2">แนวต้านสำคัญ (Resistances)</span>
              <div className="space-y-1.5 font-mono text-xs">
                {resistances.map((res, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-rose-500/10 rounded-lg border border-rose-500/20 text-rose-300">
                    <span>Resistance {idx + 1}</span>
                    <span className="font-bold">${res}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pivot Line */}
            <div className="p-2.5 bg-amber-500/10 rounded-xl border border-amber-500/30 text-xs font-mono flex items-center justify-between text-amber-400 font-bold my-3">
              <span>ราคาปัจจุบัน (Current):</span>
              <span>${currentPrice.toFixed(2)}</span>
            </div>

            {/* Supports */}
            <div>
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block mb-2">แนวรับสำคัญ (Supports)</span>
              <div className="space-y-1.5 font-mono text-xs">
                {supports.map((sup, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20 text-emerald-300">
                    <span>Support {idx + 1}</span>
                    <span className="font-bold">${sup}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500 flex items-center gap-1.5">
            <AlertTriangle size={12} className="text-amber-400" />
            <span>ระดับราคาจะคำนวณและอัปเดตแบบเรียลไทม์ตามแท่งเทียนล่าสุด</span>
          </div>

        </div>

      </div>

    </div>
  );
}
