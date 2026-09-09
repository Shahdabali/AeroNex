import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';

export function RouteChangesTable() {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ['routeChanges'],
    queryFn: api.getRouteChanges,
    refetchInterval: 10000,
  });

  return (
    <div className="bg-[rgba(10,24,56,0.6)] backdrop-blur-md rounded-[16px] border border-blue-500/20 p-6 h-[320px] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white text-[16px] font-bold">Top Routes by Price Change</h3>
        <button 
          onClick={() => navigate('/routes')}
          className="text-[#1788FF] hover:text-blue-400 text-[13px] font-medium transition-colors flex items-center gap-1 cursor-pointer hover:underline"
        >
          View All <span className="text-[16px] leading-none mb-0.5">→</span>
        </button>
      </div>

      <div className="flex-1 overflow-auto pr-2 custom-scrollbar">
        {isLoading || !data ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-[#1788FF] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="pb-3 text-[12px] text-slate-400 font-medium">Route</th>
                <th className="pb-3 text-[12px] text-slate-400 font-medium text-right">Current Fare</th>
                <th className="pb-3 text-[12px] text-slate-400 font-medium text-right">Change</th>
              </tr>
            </thead>
            <tbody>
              {data.map((route: any, i: number) => {
                const isUp = route.change >= 0;
                return (
                  <tr 
                    key={i} 
                    onClick={() => navigate('/price-trends')}
                    className="border-b border-slate-800/50 hover:bg-blue-500/10 transition-colors cursor-pointer"
                  >
                    <td className="py-3 text-[14px] text-white font-medium flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      {route.route}
                    </td>
                    <td className="py-3 text-[14px] text-slate-300 text-right">₹ {route.currentFare.toLocaleString()}</td>
                    <td className={`py-3 text-[13px] font-bold text-right ${isUp ? 'text-green-400' : 'text-red-400'}`}>
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
