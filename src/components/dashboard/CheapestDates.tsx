import { useNavigate } from 'react-router-dom';

export function CheapestDates() {
  const navigate = useNavigate();
  const dates = [
    { day: 'Mon', date: 13, price: 4200, level: 'low' },
    { day: 'Tue', date: 14, price: 3850, level: 'cheapest' },
    { day: 'Wed', date: 15, price: 3620, level: 'cheapest' },
    { day: 'Thu', date: 16, price: 4100, level: 'low' },
    { day: 'Fri', date: 17, price: 5200, level: 'high' },
    { day: 'Sat', date: 18, price: 4750, level: 'average' },
    { day: 'Sun', date: 19, price: 5600, level: 'high' },
    { day: 'Mon', date: 20, price: 4420, level: 'average' },
    { day: 'Tue', date: 21, price: 3980, level: 'low' },
    { day: 'Wed', date: 22, price: 3760, level: 'cheapest' },
    { day: 'Thu', date: 23, price: 4300, level: 'average' },
    { day: 'Fri', date: 24, price: 5150, level: 'high' },
    { day: 'Sat', date: 25, price: 4820, level: 'average' },
    { day: 'Sun', date: 26, price: 5480, level: 'high' },
  ];

  const getColor = (level: string) => {
    switch (level) {
      case 'cheapest': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'low': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'average': return 'bg-[#132A60] text-slate-300 border-slate-700/50';
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return '';
    }
  };

  return (
    <div className="bg-[rgba(10,24,56,0.6)] backdrop-blur-md rounded-[16px] border border-blue-500/20 p-6 h-[320px] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-white text-[16px] font-bold">Cheapest Dates Finder</h3>
          <p className="text-[12px] text-slate-400 mt-0.5">Delhi → Mumbai <span className="text-slate-500 ml-1">(Oct 2025)</span></p>
        </div>
        <button 
          onClick={() => navigate('/search')}
          className="text-[#1788FF] hover:text-blue-400 text-[13px] font-medium transition-colors flex items-center gap-1 cursor-pointer hover:underline"
        >
          View Calendar <span className="text-[16px] leading-none mb-0.5">→</span>
        </button>
      </div>

      <div className="flex-1 grid grid-cols-7 gap-2 mt-2">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
          <div key={d} className="text-center text-[11px] font-medium text-slate-400 mb-2">{d}</div>
        ))}
        {dates.map((d, i) => (
          <div 
            key={i} 
            onClick={() => navigate(`/search?from=DEL&to=BOM&date=2025-10-${d.date}`)}
            className={`flex flex-col items-center justify-center rounded-lg border ${getColor(d.level)} p-1 cursor-pointer hover:scale-105 hover:brightness-125 transition-all`}
          >
            <span className="text-[14px] font-bold text-white leading-none mb-1">{d.date}</span>
            <span className="text-[10px] font-medium">₹{d.price}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mt-4 px-2">
        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-green-500" /><span className="text-[10px] text-slate-400">Cheapest</span></div>
        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-blue-500" /><span className="text-[10px] text-slate-400">Low</span></div>
        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-blue-900" /><span className="text-[10px] text-slate-400">Average</span></div>
        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500" /><span className="text-[10px] text-slate-400">High</span></div>
      </div>
    </div>
  );
}
