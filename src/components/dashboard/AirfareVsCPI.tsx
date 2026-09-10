import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export function AirfareVsCPI() {
  const data = [
    { month: 'Apr', airfare: 124.8, cpi: 118.2 },
    { month: 'May', airfare: 129.5, cpi: 119.1 },
    { month: 'Jun', airfare: 137.2, cpi: 120.4 },
    { month: 'Jul', airfare: 142.8, cpi: 121.2 },
    { month: 'Aug', airfare: 139.1, cpi: 121.9 },
    { month: 'Sep', airfare: 138.4, cpi: 122.7 },
  ];

  return (
    <div className="bg-[#12141C]/80 backdrop-blur-md rounded-[16px] border border-white/[0.08] hover:border-white/[0.14] p-6 h-[320px] flex flex-col transition-all shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white text-[16px] font-bold">Airfare Index vs CPI</h3>
        <select className="bg-[#161824] border border-white/[0.08] text-zinc-300 text-[11px] rounded-md px-2 py-1 outline-none focus:border-cyan-400/40">
          <option>Last 6 Months (2026)</option>
          <option>Last Year</option>
        </select>
      </div>

      <div className="flex items-center gap-4 mb-4 px-2">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
          <span className="text-[12px] text-zinc-300">Airfare Index (2026)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
          <span className="text-[12px] text-zinc-300">Retail CPI</span>
        </div>
      </div>

      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
            <XAxis dataKey="month" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} dy={5} />
            <YAxis domain={[110, 150]} stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{ backgroundColor: '#12141C', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px' }}
              itemStyle={{ color: '#fff', fontSize: '12px' }}
              labelStyle={{ display: 'none' }}
            />
            <Line type="monotone" dataKey="airfare" stroke="#1788FF" strokeWidth={2} dot={{ r: 3, fill: '#1788FF' }} />
            <Line type="monotone" dataKey="cpi" stroke="#4E55F5" strokeWidth={2} dot={{ r: 3, fill: '#4E55F5' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-800">
        <div>
          <div className="text-[11px] text-slate-400 mb-0.5">Airfare Index</div>
          <div className="text-[15px] font-bold text-white flex items-center gap-2">138.4 <span className="text-green-400 text-[11px]">↑ 4.2%</span></div>
        </div>
        <div>
          <div className="text-[11px] text-slate-400 mb-0.5">CPI</div>
          <div className="text-[15px] font-bold text-white flex items-center gap-2">122.7 <span className="text-green-400 text-[11px]">↑ 2.4%</span></div>
        </div>
        <div>
          <div className="text-[11px] text-slate-400 mb-0.5">Contribution to CPI</div>
          <div className="text-[15px] font-bold text-white flex items-center gap-2">5.2% <span className="text-slate-500 text-[10px] font-normal">(airfare)</span></div>
        </div>
      </div>
    </div>
  );
}
