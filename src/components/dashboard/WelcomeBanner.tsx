import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useAppContext } from '../../context/AppProvider';

export function WelcomeBanner() {
  const { user, t } = useAppContext();
  const { data: freshness } = useQuery({
    queryKey: ['dataFreshness'],
    queryFn: api.getFreshness,
    refetchInterval: 5000,
  });

  const now = new Date();
  const hour = now.getHours();
  const timeGreeting = hour < 12 ? t.goodMorning : hour < 18 ? t.goodAfternoon : t.goodEvening;
  const firstName = user?.name ? user.name.split(' ')[0] : 'Shadab';

  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <div className="w-full h-[220px] rounded-2xl relative overflow-hidden flex flex-col justify-end p-8 border border-blue-500/20 shadow-xl">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542296332-2e4473faf563?q=80&w=1600&auto=format&fit=crop')] bg-cover bg-center opacity-30 mix-blend-luminosity" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#020A1D] via-[#020A1D]/80 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#020A1D] via-[#020A1D]/50 to-transparent" />
      
      <div className="relative z-10 flex items-end justify-between w-full">
        <div className="flex flex-col gap-1.5">
          <div className="inline-flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-0.5 rounded-full">
              AeroNex Intelligence — FLY BEYOND LIMITS
            </span>
          </div>
          <h2 className="text-[30px] font-extrabold text-white flex items-center gap-2 tracking-tight">
            {timeGreeting}, {firstName}! <span className="origin-bottom-right hover:rotate-12 transition-transform cursor-default text-2xl">👋</span>
          </h2>
          <p className="text-slate-300 text-[14px]">
            Here's what's happening with real-time airfare prices & predictive indexes across India.
          </p>
        </div>
        
        <div className="flex flex-col items-end gap-2 text-right">
          <div className="text-slate-300 text-[14px] font-medium flex items-center gap-2">
            {dateStr} <span className="text-slate-600">|</span> {timeStr}
          </div>
          <div className="flex items-center gap-2 bg-[#061A42]/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-green-500/30">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-green-400 text-[12px] font-semibold">
              {freshness?.status === 'live' ? 'Live data streaming' : 'Data updated recently'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
