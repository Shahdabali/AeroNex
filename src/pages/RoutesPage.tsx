import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Search, ArrowRight, TrendingUp, TrendingDown, Minus, Sparkles } from 'lucide-react';
import { usePageTitle } from '../hooks/usePageTitle';
import { INDIAN_AIRPORTS } from '../data/indianAviation';
import { useRoutes, fmtINR } from '../hooks/useMarket';
import { DataSourceBadge } from '../components/DataSourceBadge';
import { LoadingBlock, ErrorBlock, EmptyBlock } from '../components/StateViews';
import { RouteDetailModal } from '../components/RouteDetailModal';

type SortKey = 'route' | 'fare-asc' | 'fare-desc' | 'change-desc' | 'change-asc';

const cityOf = (code: string) => INDIAN_AIRPORTS.find(a => a.code === code)?.city ?? code;

export function RoutesPage() {
  usePageTitle('Routes');
  const [params, setParams] = useSearchParams();
  const searchTerm = params.get('q') ?? '';
  const sort = (params.get('sort') as SortKey) || 'route';
  const [selected, setSelected] = useState<string | null>(null);
  const { data, isPending, isError, error, refetch } = useRoutes();

  // Search and sort live in the URL so the view survives refresh and back/forward.
  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  const rows = useMemo(() => {
    const list = ((data as any[]) || []).map(r => {
      const [origin, destination] = String(r.route).split('-');
      const change = r.previousFare ? ((r.currentFare - r.previousFare) / r.previousFare) * 100 : 0;
      return { key: r.route as string, origin, destination, price: r.currentFare as number, change };
    });
    const q = searchTerm.trim().toLowerCase();
    const filtered = q
      ? list.filter(r => `${r.origin} ${r.destination} ${cityOf(r.origin)} ${cityOf(r.destination)}`.toLowerCase().includes(q))
      : list;
    const sorters: Record<SortKey, (a: any, b: any) => number> = {
      route: (a, b) => a.key.localeCompare(b.key),
      'fare-asc': (a, b) => a.price - b.price,
      'fare-desc': (a, b) => b.price - a.price,
      'change-desc': (a, b) => b.change - a.change,
      'change-asc': (a, b) => a.change - b.change,
    };
    return filtered.sort(sorters[sort] ?? sorters.route);
  }, [data, searchTerm, sort]);

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-2xl font-bold text-white">Tracked Aviation Routes</h1>
              <DataSourceBadge />
            </div>
            <p className="text-slate-400 text-sm">Corridors AeroNex observes, with the latest fare and movement. Open any route for its history and analysis.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
              <input
                type="search"
                value={searchTerm}
                onChange={e => setParam('q', e.target.value)}
                aria-label="Search routes or cities"
                placeholder="Search routes or cities..."
                className="bg-[#0A1838] border border-slate-700 rounded-xl text-white pl-10 pr-4 py-2 w-full sm:w-64 outline-none focus:border-[#1788FF]"
              />
            </div>
            <select
              value={sort}
              onChange={e => setParam('sort', e.target.value === 'route' ? '' : e.target.value)}
              aria-label="Sort routes"
              className="bg-[#0A1838] border border-slate-700 rounded-xl text-white px-3 py-2 outline-none focus:border-[#1788FF] cursor-pointer"
            >
              <option value="route">Sort: Route</option>
              <option value="fare-asc">Fare: low to high</option>
              <option value="fare-desc">Fare: high to low</option>
              <option value="change-desc">Biggest increase</option>
              <option value="change-asc">Biggest decrease</option>
            </select>
          </div>
        </div>

        <div className="bg-[rgba(10,24,56,0.6)] border border-blue-500/20 rounded-[16px] overflow-hidden">
          {isPending ? (
            <LoadingBlock label="Loading routes…" />
          ) : isError ? (
            <ErrorBlock error={error} onRetry={() => refetch()} title="Couldn't load routes" />
          ) : rows.length === 0 ? (
            <EmptyBlock
              title={searchTerm ? `No routes match "${searchTerm}"` : 'No routes observed yet'}
              description={searchTerm ? 'Try a city name or airport code such as DEL or Mumbai.' : 'Routes appear once the data feed records fares.'}
              action={
                searchTerm ? (
                  <button type="button" onClick={() => setParam('q', '')} className="px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/[0.1] text-xs font-semibold text-white cursor-pointer">
                    Clear search
                  </button>
                ) : undefined
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[520px]">
                <thead className="bg-[#0A1838]/50 text-slate-400 text-sm">
                  <tr>
                    <th className="p-4 font-medium">Route</th>
                    <th className="p-4 font-medium">Current Fare</th>
                    <th className="p-4 font-medium">Last change</th>
                    <th className="p-4 font-medium text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="text-white divide-y divide-slate-700/50">
                  {rows.map(route => (
                    <tr key={route.key} onClick={() => setSelected(route.key)} className="hover:bg-blue-500/5 transition-colors cursor-pointer group">
                      <td className="p-4">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2 font-bold text-lg">
                            {route.origin} <ArrowRight className="w-4 h-4 text-slate-500" /> {route.destination}
                          </div>
                          <div className="text-slate-400 text-sm">
                            {cityOf(route.origin)} to {cityOf(route.destination)}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-semibold text-cyan-400 text-base">{fmtINR(route.price)}</td>
                      <td className="p-4">
                        <div className={`flex items-center gap-1 font-medium ${route.change === 0 ? 'text-slate-400' : route.change > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                          {route.change === 0 ? <Minus className="w-4 h-4" /> : route.change > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                          {Math.abs(route.change).toFixed(1)}%
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            setSelected(route.key);
                          }}
                          aria-label={`Open details for ${route.key}`}
                          className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500/20 to-[#1788FF]/20 border border-cyan-500/40 text-cyan-400 hover:text-white hover:bg-[#1788FF] text-xs font-semibold inline-flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          Details &amp; AI
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      {selected && <RouteDetailModal route={selected} onClose={() => setSelected(null)} />}
    </DashboardLayout>
  );
}
