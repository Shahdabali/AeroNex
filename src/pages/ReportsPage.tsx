import { useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { usePageTitle } from '../hooks/usePageTitle';
import { 
  FileText, Download, Filter, 
  BarChart3, TrendingUp, Search, CheckCircle2, 
  Database, FileSpreadsheet, ShieldCheck, Sparkles
} from 'lucide-react';

interface ReportItem {
  id: number;
  title: string;
  type: string;
  category: 'cpi' | 'market' | 'routes' | 'exports';
  date: string;
  size: string;
  filename: string;
  icon: any;
  description: string;
  content: string;
}

export function ReportsPage() {
  usePageTitle('Intelligence Reports - AeroNex');
  const [activeTab, setActiveTab] = useState<'all' | 'cpi' | 'market' | 'routes' | 'exports'>('all');
  const [downloadToast, setDownloadToast] = useState<string | null>(null);

  const reports: ReportItem[] = [
    { 
      id: 1, 
      title: 'Q3 2026 CPI Impact Analysis', 
      type: 'CPI Augmentation', 
      category: 'cpi',
      date: 'Oct 01, 2026', 
      size: '2.4 MB', 
      filename: 'AeroNex_Q3_2026_CPI_Impact_Analysis.csv',
      icon: TrendingUp,
      description: 'Quantification of domestic airfare inflation influence on the MoSPI CPI Transport sub-index, with Laspeyres-Fisher deviation estimates.',
      content: `AeroNex Intelligence Report: Q3 2026 CPI Impact Analysis
Generated Date: 2026-10-01
Authority: AeroNex Airfare Intelligence Platform (SIH26056)
Benchmark Base Period: FY 2023-24 = 100.0

CORRIDOR,BASE_FARE_INR,OBSERVED_FARE_INR,CHANGE_PCT,CORRIDOR_WEIGHT,WEIGHTED_CONTRIBUTION_PTS,CPI_TRANSPORT_WEIGHT
DEL-BOM,5000,5680,+13.6%,0.224,3.047,0.048
BOM-BLR,4500,4450,-1.1%,0.148,-0.163,0.032
DEL-BLR,6000,7120,+18.7%,0.121,2.263,0.026
CCU-DEL,4800,5490,+14.4%,0.096,1.382,0.021
DEL-GOI,6500,6750,+3.8%,0.072,0.274,0.015
HYD-DEL,5500,4680,-14.9%,0.068,-1.013,0.014
BLR-HYD,3000,3450,+15.0%,0.055,0.825,0.012

METRIC,VALUE,UNIT
National Airfare Price Index (NAI),138.64,Index Points (Base 100)
Laspeyres Quarterly Inflation Rate,+4.82,%
MoSPI General CPI Estimated Spillover,+0.38,%
Headline Transport Inflation Share,14.21,%
`
    },
    { 
      id: 2, 
      title: 'Festive Season Fare Volatility (Diwali / Q4)', 
      type: 'Market Insight', 
      category: 'market',
      date: 'Sep 28, 2026', 
      size: '1.8 MB', 
      filename: 'AeroNex_Festive_Season_Volatility_2026.csv',
      icon: BarChart3,
      description: 'Historical surge velocity analysis across trunk routes 15-day pre and post major holiday travel spikes.',
      content: `AeroNex Market Brief: Festive Season Fare Volatility
Date of Release: September 28, 2026
Sampling Window: T-30 to T-0 Booking Horizons

CORRIDOR,CARRIER,ADVANCE_BOOKING_WINDOW,AVERAGE_FARE_INR,PEAK_SURGE_FARE_INR,VOLATILITY_SIGMA,ANOMALY_STATUS
DEL-BOM,IndiGo (6E),30-Day,4850,7890,2.41,Normal
DEL-BOM,Air India (AI),30-Day,5420,9450,2.88,Surge Flagged
DEL-BOM,Akasa Air (QP),14-Day,4620,7200,2.15,Normal
DEL-BLR,IndiGo (6E),7-Day,6800,12400,3.42,High Surge
DEL-BLR,Vistara (UK),3-Day,8200,16500,4.12,Winsorized
BOM-GOI,IndiGo (6E),7-Day,5100,11200,3.85,High Surge
CCU-DEL,Air India (AI),3-Day,5800,10500,2.90,Normal
`
    },
    { 
      id: 3, 
      title: 'Weekly Route Intelligence: Tier-2 Corridors', 
      type: 'Route Analysis', 
      category: 'routes',
      date: 'Sep 24, 2026', 
      size: '3.1 MB', 
      filename: 'AeroNex_Tier2_Corridor_Intelligence.csv',
      icon: Search,
      description: 'Capacity vs price elasticity for high-growth non-metro airports including Pune, Jaipur, Goa, and Guwahati.',
      content: `AeroNex Route Intelligence: Tier-2 Aviation Corridor Survey
Coverage: 38 Regional Routes
Week Ending: September 24, 2026

CORRIDOR,REGION,FLIGHTS_PER_DAY,AVG_BASE_FARE,YIELD_PER_ASK_INR,LOAD_FACTOR_EST,TREND_30D
PNQ-DEL,West-North,18,5200,4.65,88.4%,+3.2%
JAI-BOM,North-West,12,4950,4.42,84.1%,+2.2%
COK-DEL,South-North,10,7200,3.95,91.2%,+5.8%
IXC-BOM,North-West,8,5800,4.18,82.5%,-1.4%
GAU-DEL,East-North,14,6400,3.82,86.7%,+4.1%
LKO-BLR,North-South,9,5900,4.10,87.3%,+1.8%
`
    },
    { 
      id: 4, 
      title: 'Monsoon Demand Slump & Capacity Review', 
      type: 'Historical Trend', 
      category: 'cpi',
      date: 'Aug 30, 2026', 
      size: '4.5 MB', 
      filename: 'AeroNex_Monsoon_Demand_Historical_Slump.csv',
      icon: FileText,
      description: 'Off-peak seasonal correction parameters used in year-over-year deflationary adjustment models.',
      content: `AeroNex Macro Series: Off-Peak Seasonal Correction Factors
Quarter: Q2 Monsoon Trough (July - August 2026)

MONTH,OBSERVED_NATIONAL_INDEX,DESEASONALIZED_INDEX,SEASONAL_FACTOR,ATF_CRUDE_DELTA_PCT
June 2026,136.4,138.1,0.988,-1.2%
July 2026,131.2,137.9,0.951,-3.4%
August 2026,128.8,137.5,0.937,-0.8%
September 2026,134.5,138.2,0.973,+2.1%
`
    },
    { 
      id: 5, 
      title: 'National Airfare Index Master Timeseries', 
      type: 'Data Export', 
      category: 'exports',
      date: 'Live Automated', 
      size: '5.2 MB', 
      filename: 'AeroNex_National_Airfare_Index_TimeSeries.csv',
      icon: Database,
      description: 'Daily high-frequency national Laspeyres and Fisher ideal index readings from base epoch FY 2024 to present.',
      content: `DATE,NATIONAL_AIRFARE_INDEX,NORTH_SUBINDEX,WEST_SUBINDEX,SOUTH_SUBINDEX,EAST_SUBINDEX,SAMPLE_COUNT,STATUS
2026-09-01,134.12,136.50,131.20,133.40,135.10,1420,FINAL
2026-09-05,135.40,137.80,132.00,134.60,136.20,1435,FINAL
2026-09-10,136.85,139.10,133.40,135.90,137.40,1450,FINAL
2026-09-15,138.64,141.20,134.80,137.20,139.00,1462,FINAL
2026-09-20,139.10,141.80,135.20,137.60,139.40,1470,FINAL
2026-09-25,139.80,142.50,135.90,138.10,140.20,1485,FINAL
`
    },
    { 
      id: 6, 
      title: 'Live Scraped Corridor Observations Dump', 
      type: 'Data Export', 
      category: 'exports',
      date: 'Live Automated', 
      size: '8.7 MB', 
      filename: 'AeroNex_Live_Corridor_Observations.csv',
      icon: FileSpreadsheet,
      description: 'Raw normalized flight observation payloads captured by autonomous scrapers and verified against DGCA tariff ceilings.',
      content: `FLIGHT_NUMBER,CARRIER,ORIGIN,DESTINATION,BASE_FARE_INR,TAXES_INR,TOTAL_FARE_INR,DYNAMIC_MULTIPLIER,INGESTION_TIMESTAMP
6E-5012,IndiGo,DEL,BOM,5640,677,6317,1.05,2026-09-28T10:14:22Z
AI-887,Air India,BOM,DEL,5580,670,6250,1.02,2026-09-28T10:14:05Z
QP-1324,Akasa Air,BOM,BLR,4320,518,4838,0.98,2026-09-28T10:13:48Z
6E-2041,IndiGo,DEL,BLR,6850,822,7672,1.08,2026-09-28T10:13:30Z
SG-8169,SpiceJet,BLR,DEL,5900,708,6608,1.04,2026-09-28T10:13:12Z
UK-992,Vistara,MAA,DEL,5400,648,6048,1.01,2026-09-28T10:12:55Z
`
    },
  ];

  const handleDownload = (report: ReportItem) => {
    const blob = new Blob([report.content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', report.filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadToast(`Downloaded: ${report.filename} (${report.size})`);
    setTimeout(() => setDownloadToast(null), 4000);
  };

  const handleGenerateCustom = () => {
    const customTimestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const customContent = `AeroNex Custom Intelligence Briefing
Generated: ${new Date().toLocaleString()}
Filter: National Domestic Aviation Network
Base Period: FY 2023-24 = 100.0

CORRIDOR,AIRLINE,RECORDED_BASE_INR,WINSORIZED_FARE_INR,DELTA_YOY_PCT,CPI_WEIGHT
DEL-BOM,IndiGo,5640,5640,+12.8%,0.224
BOM-BLR,Akasa Air,4320,4320,-1.4%,0.148
DEL-BLR,Air India,7120,7120,+18.2%,0.121
CCU-DEL,IndiGo,5490,5490,+14.1%,0.096
DEL-GOI,SpiceJet,6750,6750,+3.5%,0.072
HYD-DEL,IndiGo,4680,4680,-14.2%,0.068
BLR-HYD,Air India,3450,3450,+15.0%,0.055

SUMMARY_STATISTICS:
Total Corridors Monitored: 104
Average Economy Passenger Yield: ₹5,840
Aggregate Laspeyres Index: 138.6
MoSPI Augmentation Ready: TRUE
`;

    const blob = new Blob([customContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `AeroNex_Custom_Executive_Brief_${customTimestamp}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadToast(`Generated & Downloaded Custom Intelligence Brief (${customTimestamp})`);
    setTimeout(() => setDownloadToast(null), 4500);
  };

  const filteredReports = activeTab === 'all' 
    ? reports 
    : reports.filter(r => r.category === activeTab);

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1200px] mx-auto pb-12">
        
        {/* Toast Notification */}
        {downloadToast && (
          <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-[#090A0F] border border-emerald-500/40 text-emerald-300 text-xs sm:text-sm font-semibold flex items-center gap-3 shadow-2xl shadow-emerald-900/40 animate-fadeIn">
            <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
            <span>{downloadToast}</span>
          </div>
        )}

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/10 text-[#1788FF] border border-blue-500/30 flex items-center gap-1.5">
                <FileText size={12} /> Official Intelligence Assets
              </span>
              <span className="text-xs text-slate-400">Downloadable Data & Briefings</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">Analytical Reports & Data Exports</h1>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Official MoSPI CPI augmentation briefs, corridor-level elasticity models, and machine-readable airfare time-series exports.
            </p>
          </div>
          
          <div className="flex items-center gap-3 shrink-0">
            <button 
              onClick={() => setActiveTab('all')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#12141C] border border-white/[0.08] text-white hover:bg-white/[0.04] transition-colors text-xs font-semibold cursor-pointer"
            >
              <Filter size={15} /> All Reports ({reports.length})
            </button>
            <button 
              onClick={handleGenerateCustom}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#1788FF] to-[#4E55F5] text-white font-bold text-xs hover:opacity-90 transition-all shadow-[0_0_20px_rgba(23,136,255,0.3)] cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <Sparkles size={15} /> 
              <span>Generate Custom CSV</span>
            </button>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="flex flex-wrap gap-2 border-b border-white/[0.06] pb-4">
          {[
            { id: 'all', label: 'All Documents' },
            { id: 'cpi', label: 'CPI Briefs' },
            { id: 'market', label: 'Market Insights' },
            { id: 'routes', label: 'Route Analysis' },
            { id: 'exports', label: 'Data Exports (CSV)' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeTab === tab.id 
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm' 
                  : 'bg-[#12141C] text-zinc-400 border border-white/[0.06] hover:text-white hover:border-white/[0.12]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Reports Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredReports.map(report => (
            <div 
              key={report.id} 
              className="bg-[#12141C] border border-white/[0.08] rounded-2xl p-5 hover:border-cyan-500/40 transition-all group flex flex-col justify-between shadow-xl obsidian-card relative"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex gap-3.5 items-start">
                    <div className="w-11 h-11 rounded-xl bg-[#0A0C13] border border-white/[0.08] flex items-center justify-center text-cyan-400 group-hover:scale-105 group-hover:text-cyan-300 transition-all shrink-0">
                      <report.icon size={20} />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-sm leading-snug group-hover:text-cyan-300 transition-colors">
                        {report.title}
                      </h3>
                      <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-1">
                        <span className="font-mono text-cyan-400 uppercase tracking-wider font-semibold">{report.type}</span>
                        <span>•</span>
                        <span>{report.date}</span>
                        <span>•</span>
                        <span className="font-mono text-zinc-500">{report.size}</span>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleDownload(report)}
                    title={`Download ${report.filename}`}
                    className="w-9 h-9 rounded-xl bg-white/[0.04] hover:bg-cyan-500/20 border border-white/[0.08] hover:border-cyan-500/40 flex items-center justify-center text-zinc-300 hover:text-cyan-300 transition-all cursor-pointer shrink-0 shadow-sm hover:scale-105 active:scale-95"
                  >
                    <Download size={15} />
                  </button>
                </div>

                <p className="text-zinc-400 text-xs leading-relaxed mb-4">
                  {report.description}
                </p>
              </div>

              <div className="pt-3 border-t border-white/[0.04] flex items-center justify-between">
                <span className="text-[11px] font-mono text-zinc-500 truncate max-w-[240px]">
                  {report.filename}
                </span>
                <button
                  onClick={() => handleDownload(report)}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
                >
                  <Download size={12} />
                  <span>Download File</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Callout Banner */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-900/20 via-[#12141C] to-purple-900/20 border border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-white font-bold text-sm flex items-center gap-2 justify-center sm:justify-start">
              <ShieldCheck size={16} className="text-emerald-400" />
              <span>MoSPI National Statistics Bureau Compliance</span>
            </h4>
            <p className="text-xs text-zinc-400">
              All datasets are generated in standard RFC 4180 CSV formats formatted for ingestion into Python, R, and automated government econometric pipelines.
            </p>
          </div>
          <button
            onClick={handleGenerateCustom}
            className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-zinc-200 hover:text-white text-xs font-mono font-bold transition-all cursor-pointer shrink-0"
          >
            Export All Data (.csv)
          </button>
        </div>

      </div>
    </DashboardLayout>
  );
}
