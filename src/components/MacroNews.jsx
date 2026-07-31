import React from 'react';
import { Globe, Calendar, Flame, AlertCircle, ExternalLink, Zap } from 'lucide-react';

export default function MacroNews() {
  const events = [
    { title: 'US FOMC Interest Rate Decision', time: 'Tonight 01:00 AM', impact: 'HIGH', forecast: '5.25%', previous: '5.25%' },
    { title: 'US Core PCE Price Index (MoM)', time: 'Tomorrow 19:30', impact: 'HIGH', forecast: '0.3%', previous: '0.2%' },
    { title: 'Non-Farm Employment Change (NFP)', time: 'Fri 19:30', impact: 'HIGH', forecast: '185K', previous: '206K' },
    { title: 'US ISM Manufacturing PMI', time: 'Thu 21:00', impact: 'MEDIUM', forecast: '49.0', previous: '48.5' }
  ];

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-2xl flex flex-col gap-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Globe size={20} className="text-amber-400" />
            ข่าวสาร & ปัจจัยเศรษฐกิจมหภาค (Macroeconomic Dashboard)
          </h2>
          <p className="text-xs text-slate-400">ปัจจัยสำคัญที่มีผลต่อราคาทองคำ XAU/USD และดัชนีดอลลาร์สหรัฐ</p>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Market Fear & Greed Index:</span>
          <span className="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-mono font-bold rounded-lg">
            68 (Greed / ซื้อสะสม)
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Economic Calendar */}
        <div className="lg:col-span-2 bg-slate-900/80 p-5 rounded-2xl border border-slate-800">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Calendar size={16} className="text-amber-400" />
            ปฏิทินข่าวสำคัญที่มีผลกระทบสูง (High Impact Economic Calendar)
          </h3>

          <div className="space-y-2 font-mono text-xs">
            {events.map((ev, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800 gap-2">
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    ev.impact === 'HIGH' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {ev.impact}
                  </span>
                  <div>
                    <span className="font-sans font-semibold text-slate-200 block text-xs">{ev.title}</span>
                    <span className="text-[11px] text-slate-500">{ev.time}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-[11px]">
                  <div>
                    <span className="text-slate-500 font-sans block">คาดการณ์:</span>
                    <span className="text-slate-200 font-bold">{ev.forecast}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-sans block">ครั้งก่อน:</span>
                    <span className="text-slate-400">{ev.previous}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Central Bank Demand & Geopolitics */}
        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Flame size={16} className="text-amber-400" />
              สรุปปัจจัยหนุนทองคำ (Core Drivers)
            </h3>

            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <strong className="text-amber-400 block mb-0.5">🏛️ แรงซื้อจากธนาคารกลาง (Central Banks)</strong>
                ธนาคารกลางจีน (PBOC) และธนาคารกลางทั่วโลกยังคงเดินหน้าสะสมทองคำสำรองต่อเนื่อง เพื่อลดความเสี่ยงจากการถือครองดอลลาร์
              </li>
              <li className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <strong className="text-sky-400 block mb-0.5">📉 ความคาดหวังเรื่องดอกเบี้ย Fed</strong>
                ตลาดให้น้ำหนักกว่า 85% ที่ Fed จะปรับลดอัตราดอกเบี้ยในเร็วๆ นี้ ซึ่งเป็นผลบวกตรงต่อทองคำ
              </li>
            </ul>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500">
            อัปเดตข้อมูลปัจจัยมหภาคเรียลไทม์
          </div>
        </div>

      </div>
    </div>
  );
}
