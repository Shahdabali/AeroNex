import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export function AirfareVsCPI() {
  const data = [
    { month: 'Apr', airfare: 105, cpi: 102 },
    { month: 'May', airfare: 112, cpi: 104 },
    { month: 'Jun', airfare: 108, cpi: 106 },
    { month: 'Jul', airfare: 115, cpi: 110 },
    { month: 'Aug', airfare: 120, cpi: 114 },
    { month: 'Sep', airfare: 124.8, cpi: 118.2 },
  ];

  return (
    <div className="bg-[rgba(10,24,56,0.6)] backdrop-blur-md rounded-[16px] border border-blue-500/20 p-6 h-[320px] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white text-[16px] font-bold">Airfare Index vs CPI</h3>
        <select className="bg-[#0A1838] border border-slate-700 text-slate-300 text-[11px] rounded-md px-2 py-1 outline-none focus:border-[#1788FF]">
          <option>Last 6 Months</option>
          <option>Last Year</option>
        </select>
      </div>

      <div className="flex items-center gap-4 mb-4 px-2">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#1788FF]" />
          <span className="text-[12px] text-slate-300">Airfare Index</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#4E55F5]" />
          <span className="text-[12px] text-slate-300">CPI</span>
        </div>
      </div>

      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
            <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} dy={5} />
            <YAxis domain={[90, 140]} stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{ backgroundColor: '#0A1838', border: '1px solid rgba(23,136,255,0.3)', borderRadius: '8px' }}
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
          <div className="text-[15px] font-bold text-white flex items-center gap-2">124.8 <span className="text-green-400 text-[11px]">↑ 3.7%</span></div>
        </div>
        <div>
          <div className="text-[11px] text-slate-400 mb-0.5">CPI</div>
          <div className="text-[15px] font-bold text-white flex items-center gap-2">118.2 <span className="text-green-400 text-[11px]">↑ 2.1%</span></div>
        </div>
        <div>
          <div className="text-[11px] text-slate-400 mb-0.5">Contribution to CPI</div>
          <div className="text-[15px] font-bold text-white flex items-center gap-2">4.8% <span className="text-slate-500 text-[10px] font-normal">(airfare)</span></div>
        </div>
      </div>
    </div>
  );
}
