import { useNavigate } from 'react-router-dom';

export function PopularRoutes() {
  const navigate = useNavigate();
  const routes = [
    { origin: 'Delhi', dest: 'Mumbai', code: 'DEL → BOM', price: 5420, change: 12.4, img: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=100&h=100&fit=crop' },
    { origin: 'Mumbai', dest: 'Bengaluru', code: 'BOM → BLR', price: 4860, change: 8.7, img: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=100&h=100&fit=crop' },
    { origin: 'Delhi', dest: 'Bengaluru', code: 'DEL → BLR', price: 6230, change: 6.1, img: 'https://images.unsplash.com/photo-1585642393356-06109968417c?w=100&h=100&fit=crop' },
    { origin: 'Chennai', dest: 'Delhi', code: 'MAA → DEL', price: 4150, change: -5.3, img: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=100&h=100&fit=crop' },
    { origin: 'Hyderabad', dest: 'Delhi', code: 'HYD → DEL', price: 5780, change: -3.9, img: 'https://images.unsplash.com/photo-1598440026966-512c192d192f?w=100&h=100&fit=crop' },
  ];

  return (
    <div className="bg-[rgba(10,24,56,0.6)] backdrop-blur-md rounded-[16px] border border-blue-500/20 p-6 h-[320px] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white text-[16px] font-bold">Popular Routes</h3>
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
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-blue-500/10 transition-colors group cursor-pointer border border-transparent hover:border-slate-800"
            >
              <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 relative">
                <img src={r.img} alt={r.dest} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-blue-900/20 mix-blend-multiply" />
              </div>
              <div className="flex-1 flex flex-col">
                <span className="text-[13px] font-bold text-white leading-tight">{r.origin} → {r.dest}</span>
                <span className="text-[11px] text-slate-400 leading-tight mt-0.5">{r.code}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[13px] font-bold text-slate-200">₹ {r.price.toLocaleString()}</span>
                <span className={`text-[11px] font-bold ${isUp ? 'text-green-400' : 'text-red-400'}`}>
                  {isUp ? '↑' : '↓'} {Math.abs(r.change)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
