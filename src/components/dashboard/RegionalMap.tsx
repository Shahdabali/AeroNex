import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';

export function RegionalMap() {
  const { data, isLoading } = useQuery({
    queryKey: ['regionalIndex'],
    queryFn: api.getRegionalIndex,
  });

  return (
    <div className="bg-[rgba(10,24,56,0.6)] backdrop-blur-md rounded-[16px] border border-blue-500/20 p-6 h-[420px] flex flex-col relative overflow-hidden">
      <h3 className="text-white text-[16px] font-bold mb-6">Airfare Index by Region</h3>
      
      {isLoading || !data ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-[#1788FF] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="flex-1 relative flex items-center justify-center">
          {/* Mock glowing India map using SVG overlay */}
          <div className="absolute inset-0 opacity-40 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/India_map_en.svg')] bg-contain bg-center bg-no-repeat filter invert sepia hue-rotate-[180deg] brightness-[1.5]" />
          
          {/* Overlay markers based on regional data */}
          {data.map((region: any, i: number) => {
            const positions: Record<string, string> = {
              'North': 'top-[20%] left-[45%]',
              'West': 'top-[50%] left-[25%]',
              'East': 'top-[50%] right-[20%]',
              'South': 'bottom-[20%] left-[40%]'
            };
            const posClass = positions[region.region] || 'top-1/2 left-1/2';
            const isUp = region.change >= 0;
            
            return (
              <div key={i} className={`absolute ${posClass} flex flex-col items-center group cursor-pointer z-10`}>
                <div className="w-3 h-3 bg-[#1788FF] rounded-full shadow-[0_0_15px_#1788FF] mb-2 group-hover:scale-150 transition-transform" />
                <div className="bg-[#020A1D]/90 backdrop-blur-md border border-slate-700/50 rounded-lg p-2 text-center pointer-events-none group-hover:border-[#1788FF]/50 transition-colors">
                  <div className="text-[11px] text-slate-400 font-medium mb-0.5">{region.region}</div>
                  <div className="text-white font-bold text-[14px] leading-none mb-1">{region.value}</div>
                  <div className={`text-[10px] font-bold ${isUp ? 'text-green-400' : 'text-red-400'}`}>
                    {isUp ? '↑' : '↓'} {Math.abs(region.change)}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
