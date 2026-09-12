import { useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Search, Trash2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePageTitle } from '../hooks/usePageTitle';

export function MyFlights() {
  usePageTitle('Saved Analysis & Watchlist');
  const navigate = useNavigate(); 
  
  const [savedCorridors, setSavedCorridors] = useState<any[]>([
    {
      id: 'corridor-1',
      code: 'DEL-BOM',
      title: 'Delhi ⇄ Mumbai Metro Trunk',
      category: 'High-Density Metro Corridor',
      currentFare: 5420,
      baseline: 4800,
      indexValue: 128.4,
      change: '+12.9%',
      alertThreshold: 7500,
      status: 'Active Surveillance',
      pinnedAt: '2026-09-10'
    },
    {
      id: 'corridor-2',
      code: 'BOM-BLR',
      title: 'Mumbai ⇄ Bengaluru Tech Route',
      category: 'Business Corridor',
      currentFare: 4280,
      baseline: 4100,
      indexValue: 114.2,
      change: '+4.3%',
      alertThreshold: 6000,
      status: 'Active Surveillance',
      pinnedAt: '2026-09-11'
    },
    {
      id: 'corridor-3',
      code: 'DEL-GOI',
      title: 'Delhi ⇄ Goa Leisure Corridor',
      category: 'Seasonal Leisure Route',
      currentFare: 14800,
      baseline: 7200,
      indexValue: 146.0,
      change: '+96.0%',
      alertThreshold: 10000,
      status: 'Anomaly Active',
      pinnedAt: '2026-09-12'
    }
  ]);

  const handleRemove = (id: string) => {
    setSavedCorridors(prev => prev.filter(c => c.id !== id));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto w-full">
        
        {/* Header */}
        <div className="bg-white dark:bg-[#0E1424] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 font-bold text-[10px] uppercase tracking-wider">
                  Researcher Workspace
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
                  Pinned Telemetry
                </span>
              </div>
              <h1 className="text-xl font-bold text-[#0F2A4A] dark:text-white tracking-tight">
                Saved Analysis & Monitored Corridors
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Manage pinned corridors, prioritized airline observations, and custom econometric watchlists for policy evaluation.
              </p>
            </div>

            <button
              onClick={() => navigate('/fare-monitor')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#0F2A4A] hover:bg-[#1E3A8A] text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
            >
              <Search size={13} /> Monitor New Corridor
            </button>
          </div>
        </div>

        {/* Saved Corridors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {savedCorridors.map((c) => (
            <div key={c.id} className="bg-white dark:bg-[#0E1424] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="flex items-start justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <div className="text-[10px] font-bold text-blue-600 font-mono uppercase">{c.category}</div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">{c.code}</h3>
                    <span className="text-xs text-slate-500">{c.title}</span>
                  </div>
                  <button
                    onClick={() => handleRemove(c.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-100 transition-colors"
                    title="Remove from watchlist"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 dark:bg-[#0B101D] rounded-lg border border-slate-100 dark:border-slate-800 text-xs font-mono mb-3">
                  <div>
                    <span className="text-[9.5px] text-slate-400 uppercase font-sans block">Current Fare</span>
                    <span className="font-bold text-slate-900 dark:text-white">₹{c.currentFare.toLocaleString('en-IN')}</span>
                  </div>
                  <div>
                    <span className="text-[9.5px] text-slate-400 uppercase font-sans block">Sub-Index</span>
                    <span className="font-bold text-blue-600">{c.indexValue}</span>
                  </div>
                  <div>
                    <span className="text-[9.5px] text-slate-400 uppercase font-sans block">Trend Delta</span>
                    <span className="font-bold text-rose-600">{c.change}</span>
                  </div>
                  <div>
                    <span className="text-[9.5px] text-slate-400 uppercase font-sans block">Cap Threshold</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">₹{c.alertThreshold}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    c.status.includes('Anomaly') ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}>
                    {c.status}
                  </span>
                  <span className="text-[10px] text-slate-400">Pinned: {c.pinnedAt}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => navigate(`/routes?corridor=${c.code}`)}
                  className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
                >
                  Inspect Corridor Analytics <ArrowRight size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </DashboardLayout>
  );
}

// Export alias
export const SavedAnalysis = MyFlights;
