import { useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { usePageTitle } from '../hooks/usePageTitle';
import { Download, Printer, ExternalLink } from 'lucide-react';

export function ResearchReports() {
  usePageTitle('Research Reports & Briefings');
  const [reportingPeriod, setReportingPeriod] = useState<'Current Cycle' | 'Monthly Bulletin' | 'Quarterly Dossier'>('Current Cycle');

  const printReport = () => {
    window.print();
  };

  const exportReportCSV = () => {
    const rows = [
      ['AeroNex National Airfare Intelligence — Statistical Briefing'],
      ['Reporting Period', reportingPeriod],
      ['Generated On', new Date().toISOString()],
      ['Reference Base', '2024 = 100'],
      [''],
      ['Metric', 'Observed Value', 'Change vs Base'],
      ['National Airfare Price Index', '124.8', '+24.8%'],
      ['Average Observed Fare', '₹5,840', '+1.8%'],
      ['Routes Monitored', '184', '+2.1%'],
      ['Airlines Covered', '7', '0%'],
      ['Data Quality Score', '99.4%', 'Audit Grade'],
      [''],
      ['Corridor', 'Observed Median Fare (INR)', 'Divergence Flag'],
      ['DEL-BOM', '5420', 'Nominal'],
      ['DEL-GOI', '14800', 'Critical Spike (+96%)'],
      ['BOM-BLR', '4280', 'Nominal'],
      ['BLR-DEL', '6850', 'Elevated (+34%)'],
      ['CCU-DEL', '5120', 'Nominal']
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(r => r.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AeroNex_Research_Report_${reportingPeriod.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto w-full">
        
        {/* Header */}
        <div className="bg-white dark:bg-[#0E1424] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 font-bold text-[10px] uppercase tracking-wider">
                  Policy Documentation
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
                  Official Audit Dossier
                </span>
              </div>
              <h1 className="text-xl font-bold text-[#0F2A4A] dark:text-white tracking-tight">
                Statistical Research Reports & Briefings
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Generate formal econometric bulletins synthesizing airfare index movements, anomaly flags, and CPI augmentation indicators for MoSPI researchers.
              </p>
              <div className="flex items-center gap-2 mt-3">
                <span className="text-[11px] font-semibold text-slate-500">Dossier Scope:</span>
                {(['Current Cycle', 'Monthly Bulletin', 'Quarterly Dossier'] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => setReportingPeriod(p)}
                    className={`px-2.5 py-1 text-[11px] rounded-md font-semibold transition-colors cursor-pointer ${
                      reportingPeriod === p
                        ? 'bg-[#0F2A4A] text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={printReport}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B101D] text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <Printer size={13} /> Print / Save PDF
              </button>
              <button
                onClick={exportReportCSV}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#0F2A4A] hover:bg-[#1E3A8A] text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
              >
                <Download size={13} /> Export Report CSV
              </button>
              <a
                href="/AeroNex_SIH26056_Presentation.pdf"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-semibold hover:bg-blue-100 transition-colors cursor-pointer"
              >
                <ExternalLink size={13} /> View Presentation PDF
              </a>
            </div>
          </div>
        </div>

        {/* Report Content Card (Print Ready) */}
        <div className="bg-white dark:bg-[#0E1424] border border-slate-300 dark:border-slate-800 rounded-xl p-8 shadow-xs text-slate-900 dark:text-slate-100 space-y-6">
          
          {/* Report Header */}
          <div className="border-b-2 border-[#0F2A4A] pb-4 flex items-start justify-between">
            <div>
              <div className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-widest font-mono">
                AERONEX STATISTICAL WORKING PAPER • SERIES 2026-Q1
              </div>
              <h2 className="text-xl font-black text-[#0F2A4A] dark:text-white mt-1">
                National Airfare Price Index & CPI Augmentation Bulletin
              </h2>
              <div className="text-xs text-slate-500 mt-0.5">
                Evaluation under MoSPI Smart India Hackathon Framework (Problem Statement SIH26056)
              </div>
            </div>
            <div className="text-right text-xs font-mono text-slate-500">
              <div>Date: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
              <div>Base Period: <strong>2024 = 100</strong></div>
              <div>Status: <strong>PROVISIONAL AUDIT</strong></div>
            </div>
          </div>

          {/* Section 1: Executive Summary */}
          <div className="space-y-2 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
            <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] border-b border-slate-100 dark:border-slate-800 pb-1">
              1. Executive Statistical Summary
            </h3>
            <p>
              During the current surveillance cycle, the <strong>AeroNex National Airfare Price Index</strong> settled at <strong>124.8</strong>, representing a <strong>+3.7% increase</strong> over the preceding 30-day baseline and a <strong>+24.8% cumulative change</strong> against the reference base period ($2024=100$).
            </p>
            <p>
              The average observed non-stop economy airfare across 184 monitored Indian domestic corridors was <strong>₹5,840</strong>. Analysis of price dispersion indicates moderate inter-regional divergence, with Southern routes leading at an index of 128.2, while Eastern and UDAN subsidized corridors remain stable at 119.5 and 114.2 respectively.
            </p>
          </div>

          {/* Section 2: Key Macroeconomic Metrics Table */}
          <div className="space-y-2 text-xs">
            <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] border-b border-slate-100 dark:border-slate-800 pb-1">
              2. Primary Index Telemetry
            </h3>
            <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-[#0B101D] text-[10px] uppercase font-bold text-slate-500">
                  <tr>
                    <th className="py-2.5 px-4">Statistical Indicator</th>
                    <th className="py-2.5 px-4">Observed Metric</th>
                    <th className="py-2.5 px-4">Delta vs Base (2024=100)</th>
                    <th className="py-2.5 px-4">Methodology</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-xs">
                  <tr>
                    <td className="py-2.5 px-4 font-sans font-bold">National Airfare Price Index</td>
                    <td className="py-2.5 px-4 font-bold text-blue-600">124.8</td>
                    <td className="py-2.5 px-4">+24.8%</td>
                    <td className="py-2.5 px-4 font-sans text-[11px] text-slate-500">Weighted Laspeyres Formula</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-sans font-bold">Average Observed Economy Fare</td>
                    <td className="py-2.5 px-4 font-bold">₹5,840</td>
                    <td className="py-2.5 px-4">+1.8% vs 30d</td>
                    <td className="py-2.5 px-4 font-sans text-[11px] text-slate-500">Median Corridor Price</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-sans font-bold">Official CPI Transport Sub-Group</td>
                    <td className="py-2.5 px-4 font-bold text-emerald-600">113.9</td>
                    <td className="py-2.5 px-4">+13.9%</td>
                    <td className="py-2.5 px-4 font-sans text-[11px] text-slate-500">MoSPI Published Series</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-sans font-bold">Index Spread / Divergence</td>
                    <td className="py-2.5 px-4 font-bold text-amber-600">+10.9 pts</td>
                    <td className="py-2.5 px-4">—</td>
                    <td className="py-2.5 px-4 font-sans text-[11px] text-slate-500">Airfare Lead over General CPI</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Anomaly & Tariff Surveillance */}
          <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
            <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] border-b border-slate-100 dark:border-slate-800 pb-1">
              3. Tariff Anomaly Register (DGCA Rule 135)
            </h3>
            <p className="text-[11.5px]">
              During this cycle, 2 critical price surge anomalies were recorded exceeding $2.5\sigma$ from the rolling 30-day baseline:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-[11.5px]">
              <li><strong>DEL → GOI (SpiceJet):</strong> Observed at ₹14,800 (+96.0% deviation, $Z=4.1$). Driven by weekend holiday demand.</li>
              <li><strong>DEL → BOM (IndiGo):</strong> Observed at ₹9,850 (+58.4% deviation, $Z=3.2$). Tight 0-2 day booking horizon inventory.</li>
            </ul>
          </div>

          {/* Section 4: Data Quality Certification */}
          <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
            <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] border-b border-slate-100 dark:border-slate-800 pb-1">
              4. Data Quality & Ingestion Provenance
            </h3>
            <p className="text-[11.5px]">
              Total unique quotes ingested in this cycle: <strong>1,420 observations</strong> across 7 scheduled airlines. Composite quality score: <strong>99.4%</strong>. Missing field rate: <strong>0.04%</strong>. All observations validated via Zod schemas and checked for deduplication.
            </p>
          </div>

          {/* Report Footer / Signature */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <div>
              <span>Generated by: AeroNex Statistical Intelligence Engine</span>
              <div className="text-[10px]">Audit Hash: SHA256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1f</div>
            </div>
            <div className="text-right">
              <span className="font-bold text-slate-600 dark:text-slate-400">RESEARCH WORKING COPY</span>
              <div className="text-[10px]">Independent Academic/Hackathon Prototype</div>
            </div>
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}
