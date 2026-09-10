import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAppContext } from '../../context/AppProvider';

export function RouteChangesTable() {
  const navigate = useNavigate();
  const { t } = useAppContext();
  const { data, isLoading } = useQuery({
    queryKey: ['routeChanges'],
    queryFn: api.getRouteChanges,
    refetchInterval: 5000,
  });

  return (
    <div className="bg-[#12141C]/80 backdrop-blur-md rounded-[16px] border border-white/[0.08] hover:border-white/[0.14] p-6 h-[320px] flex flex-col transition-all shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-white text-[16px] font-bold">{t.topRoutesTitle}</h3>
          <span className="text-[10px] text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded-full font-mono flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            5s LIVE
          </span>
        </div>
        <button 
          onClick={() => navigate('/routes')}
          className="text-cyan-400 hover:text-cyan-300 text-[13px] font-medium transition-colors flex items-center gap-1 cursor-pointer hover:underline"
        >
          {t.viewAllBtn} <span className="text-[16px] leading-none mb-0.5">→</span>
        </button>
      </div>

      <div className="flex-1 overflow-auto pr-2 custom-scrollbar">
        {isLoading || !data ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/[0.08]">
                <th className="pb-3 text-[12px] text-zinc-400 font-medium">Route</th>
                <th className="pb-3 text-[12px] text-zinc-400 font-medium text-right">Current Fare</th>
                <th className="pb-3 text-[12px] text-zinc-400 font-medium text-right">Change</th>
              </tr>
            </thead>
            <tbody>
              {data.map((route: any, i: number) => {
                const isUp = route.change >= 0;
                return (
                  <tr 
                    key={i} 
                    onClick={() => navigate('/price-trends')}
                    className="border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors cursor-pointer"
                  >
                    <td className="py-3 text-[14px] text-slate-900 dark:text-white font-medium flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      {route.route}
                    </td>
                    <td className="py-3 text-[14px] text-slate-700 dark:text-slate-300 text-right">₹ {route.currentFare.toLocaleString()}</td>
                    <td className={`py-3 text-[13px] font-bold text-right ${isUp ? 'text-emerald-600 dark:text-green-400' : 'text-rose-600 dark:text-red-400'}`}>
                      {isUp ? '↑' : '↓'} {Math.abs(route.change)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
