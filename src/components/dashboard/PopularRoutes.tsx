import { useNavigate } from 'react-router-dom';
import { Plane, TrendingUp, TrendingDown } from 'lucide-react';

export function PopularRoutes() {
  const navigate = useNavigate();
  const routes = [
    { 
      origin: 'Delhi', 
      dest: 'Mumbai', 
      code: 'DEL → BOM', 
      price: 5420, 
      change: 12.4, 
      img: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=200&h=200&fit=crop&auto=format' // Mumbai Gateway of India
    },
    { 
      origin: 'Mumbai', 
      dest: 'Bengaluru', 
      code: 'BOM → BLR', 
      price: 4860, 
      change: 8.7, 
      img: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=200&h=200&fit=crop&auto=format' // Bengaluru Vidhana Soudha
    },
    { 
      origin: 'Delhi', 
      dest: 'Bengaluru', 
      code: 'DEL → BLR', 
      price: 6230, 
      change: 6.1, 
      img: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=200&h=200&fit=crop&auto=format' // Delhi India Gate
    },
    { 
      origin: 'Chennai', 
      dest: 'Delhi', 
      code: 'MAA → DEL', 
      price: 4150, 
      change: -5.3, 
      img: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=200&h=200&fit=crop&auto=format' // Chennai Central
    },
    { 
      origin: 'Hyderabad', 
      dest: 'Delhi', 
      code: 'HYD → DEL', 
      price: 5780, 
      change: -3.9, 
      img: 'https://images.unsplash.com/photo-1605649487212-47bdab064df8?w=200&h=200&fit=crop&auto=format' // Hyderabad Charminar
    },
  ];

  return (
    <div className="bg-[rgba(10,24,56,0.6)] backdrop-blur-md rounded-[16px] border border-blue-500/20 p-6 h-[320px] flex flex-col shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-white text-[16px] font-bold">Popular Routes</h3>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>
        <button 
          onClick={() => navigate('/routes')}
          className="text-[#1788FF] hover:text-blue-400 text-[13px] font-medium transition-colors flex items-center gap-1 cursor-pointer hover:underline"
        >
          View All <span className="text-[16px] leading-none mb-0.5">→</span>
        </button>
      </div>

      <div className="flex-1 overflow-auto pr-2 custom-scrollbar flex flex-col gap-3">
        {routes.map((r, i) => {
          const isUp = r.change >= 0;
          return (
            <div 
              key={i} 
              onClick={() => navigate('/price-trends')}
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-blue-500/10 transition-colors group cursor-pointer border border-transparent hover:border-blue-500/30"
            >
              <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 relative bg-slate-100 dark:bg-slate-800 ring-1 ring-blue-500/20">
                <img 
                  src={r.img} 
                  alt={r.dest} 
                  onError={(e) => {
                    // Fallback to airport aircraft image if URL fails
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=200&h=200&fit=crop&auto=format';
                  }}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                />
                <div className="absolute inset-0 bg-blue-950/20 mix-blend-multiply" />
              </div>
              <div className="flex-1 flex flex-col">
                <span className="text-[13px] font-bold text-slate-900 dark:text-white leading-tight">{r.origin} → {r.dest}</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5 flex items-center gap-1">
                  <Plane size={11} className="text-[#1788FF]" /> {r.code}
                </span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200">₹ {r.price.toLocaleString()}</span>
                <span className={`text-[11px] font-bold flex items-center gap-0.5 ${isUp ? 'text-emerald-600 dark:text-green-400' : 'text-rose-600 dark:text-red-400'}`}>
                  {isUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                  <span>{isUp ? `+${r.change}` : r.change}%</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
