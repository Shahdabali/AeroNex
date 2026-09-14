import { useState } from 'react';
import { usePageTitle } from '../hooks/usePageTitle';
import { FileText, Download, Calendar, Filter, BarChart3, TrendingUp, Search } from 'lucide-react';

export function ReportsPage() {
  usePageTitle('Intelligence Reports - AeroNex');
  const [activeTab, setActiveTab] = useState('cpi');

  const reports = [
    { id: 1, title: 'Q3 2026 CPI Impact Analysis', type: 'CPI Augmentation', date: 'Oct 01, 2026', size: '2.4 MB', icon: TrendingUp },
    { id: 2, title: 'Festive Season Fare Volatility (Diwali)', type: 'Market Insight', date: 'Sep 28, 2026', size: '1.8 MB', icon: BarChart3 },
    { id: 3, title: 'Weekly Route Intelligence: Tier-2 Corridors', type: 'Route Analysis', date: 'Sep 24, 2026', size: '3.1 MB', icon: Search },
    { id: 4, title: 'Monsoon Demand Slump Review', type: 'Historical Trend', date: 'Aug 30, 2026', size: '4.5 MB', icon: FileText },
  ];

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/10 text-[#1788FF] border border-blue-500/30">
              Generated Assets
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Analytical Reports</h1>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl">
            Downloadable intelligence briefs, periodic CPI impact assessments, and historical data exports.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#12141C] border border-white/[0.08] text-white hover:bg-white/[0.04] transition-colors text-sm font-semibold">
            <Filter size={16} /> Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#1788FF] to-[#4E55F5] text-white font-semibold text-sm hover:opacity-90 transition-opacity shadow-[0_0_15px_rgba(23,136,255,0.3)]">
            <Calendar size={16} /> Generate Custom
          </button>
        </div>
      </div>

      <div className="flex gap-2 border-b border-white/[0.06] pb-4">
        {['cpi', 'market', 'routes', 'exports'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${
              activeTab === tab 
                ? 'bg-white/10 text-white' 
                : 'text-zinc-500 hover:text-white hover:bg-white/5'
            }`}
          >
            {tab === 'cpi' ? 'CPI Briefs' : tab === 'market' ? 'Market Insights' : tab === 'routes' ? 'Route Analysis' : 'Data Exports'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {reports.map(report => (
          <div key={report.id} className="bg-[#12141C] border border-white/[0.08] rounded-2xl p-5 hover:border-cyan-500/30 transition-colors group flex items-start justify-between">
            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 rounded-xl bg-[#0A0C13] border border-white/[0.06] flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
                <report.icon size={20} />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm mb-1 group-hover:text-cyan-400 transition-colors">{report.title}</h3>
                <div className="flex items-center gap-3 text-xs text-zinc-500">
                  <span className="font-mono text-cyan-500/80 uppercase tracking-wider">{report.type}</span>
                  <span>•</span>
                  <span>{report.date}</span>
                </div>
              </div>
            </div>
            <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-cyan-500/20 hover:border hover:border-cyan-500/30 transition-all cursor-pointer">
              <Download size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
