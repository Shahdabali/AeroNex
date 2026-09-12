import React from 'react';
import { BookOpen, Calculator, Database, ShieldAlert } from 'lucide-react';

interface MethodologyCardProps {
  title?: string;
  type?: 'laspeyres' | 'cpi' | 'anomaly' | 'data';
}

export const MethodologyCard: React.FC<MethodologyCardProps> = ({
  title = 'Statistical Methodology & Transparency',
  type = 'laspeyres'
}) => {
  return (
    <div className="bg-slate-50 dark:bg-[#0B101D] border border-slate-200 dark:border-slate-800 rounded-xl p-5 my-6 text-slate-800 dark:text-slate-200">
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 rounded-md bg-[#0F2A4A] text-blue-300">
          {type === 'laspeyres' && <Calculator size={16} />}
          {type === 'cpi' && <BookOpen size={16} />}
          {type === 'anomaly' && <ShieldAlert size={16} />}
          {type === 'data' && <Database size={16} />}
        </div>
        <h3 className="text-sm font-bold text-[#0F2A4A] dark:text-white uppercase tracking-wide">
          {title}
        </h3>
      </div>

      {type === 'laspeyres' && (
        <div className="space-y-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
          <p>
            The <strong>AeroNex Airfare Price Index</strong> is computed deterministically using the standard <strong>Laspeyres Price Index formulation</strong> calibrated against reference base period <strong>2024 = 100</strong>:
          </p>
          <div className="p-3 bg-white dark:bg-[#0E1424] border border-slate-200 dark:border-slate-800 rounded-lg font-mono text-center text-xs text-[#0F2A4A] dark:text-blue-300">
            {"I_t = [ Σ (P_i,t · W_i,0) / Σ (P_i,0 · W_i,0) ] × 100"}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {"Where P_{i,t} represents the current observed median airfare on route i, P_{i,0} is the baseline price, and W_{i,0} represents passenger density weights derived from DGCA monthly traffic distribution."}
          </p>
        </div>
      )}

      {type === 'cpi' && (
        <div className="space-y-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
          <p>
            <strong>CPI Transport Group Augmentation Context:</strong> In India's Consumer Price Index framework, transport services account for approximately 3.02% of the national commodity basket. Traditional price collection relies on static periodic survey sampling.
          </p>
          <p>
            AeroNex provides high-frequency daily airfare quote observations that bridge the 30–45 day survey lag. <em>Note: AeroNex is an independent analytical prototype for research and does not replace official CSO/MoSPI index publications.</em>
          </p>
        </div>
      )}

      {type === 'anomaly' && (
        <div className="space-y-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
          <p>
            <strong>Anomaly Detection Mechanism:</strong> Airfare surge flags are evaluated using rolling 30-day medians and standard deviation boundaries ($Z \ge 2.5$). Spikes are categorized into Normal, Elevated, and Critical Surge.
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Provisional contributing factors (booking horizons, festival demand, capacity constraints) are presented as analytical hypotheses requiring officer verification.
          </p>
        </div>
      )}

      {type === 'data' && (
        <div className="space-y-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
          <p>
            <strong>Data Ingestion & Validation Pipeline:</strong> Raw fares are ingested every 30 seconds across 180+ domestic routes. Inbound payloads undergo Zod schema validation, deduplication, and outlier trimming before passing into the index calculation engine.
          </p>
        </div>
      )}
    </div>
  );
};
