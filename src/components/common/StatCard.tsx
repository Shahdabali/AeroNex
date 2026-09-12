import React from 'react';
import { type LucideIcon, TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';

export interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: LucideIcon;
  tooltip?: string;
  period?: string;
  badge?: string;
  accent?: 'blue' | 'green' | 'amber' | 'red' | 'navy';
  invertTrendColor?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  tooltip,
  period = 'vs previous cycle',
  badge,
  accent = 'navy',
  invertTrendColor = false
}) => {
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;
  const isNeutral = change !== undefined && change === 0;

  const getTrendColor = () => {
    if (change === undefined || isNeutral) return 'text-slate-500 bg-slate-100 dark:bg-slate-800/60 dark:text-slate-400 border-slate-200 dark:border-slate-700';
    if (invertTrendColor) {
      return isPositive
        ? 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/40'
        : 'text-rose-700 bg-rose-50 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-800/40';
    }
    return isPositive
      ? 'text-blue-700 bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800/40'
      : 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/40';
  };

  const getAccentBorder = () => {
    switch (accent) {
      case 'blue': return 'border-t-2 border-t-blue-600';
      case 'green': return 'border-t-2 border-t-emerald-600';
      case 'amber': return 'border-t-2 border-t-amber-600';
      case 'red': return 'border-t-2 border-t-rose-600';
      default: return 'border-t-2 border-t-[#0F2A4A]';
    }
  };

  return (
    <div className={`bg-white dark:bg-[#0E1322] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs transition-all hover:shadow-md ${getAccentBorder()}`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 tracking-wide uppercase truncate">
            {title}
          </span>
          {tooltip && (
            <span className="text-slate-400 hover:text-slate-600 cursor-help" title={tooltip}>
              <Info size={13} />
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {badge && (
            <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              {badge}
            </span>
          )}
          {Icon && (
            <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[#0F2A4A] dark:text-blue-400">
              <Icon size={16} />
            </div>
          )}
        </div>
      </div>

      <div className="flex items-baseline justify-between gap-3 mt-1">
        <div className="text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums tracking-tight">
          {value}
        </div>
        {change !== undefined && (
          <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold border ${getTrendColor()}`}>
            {isPositive && <TrendingUp size={12} />}
            {isNegative && <TrendingDown size={12} />}
            {isNeutral && <Minus size={12} />}
            <span className="tabular-nums">
              {change > 0 ? `+${change}%` : `${change}%`}
            </span>
          </div>
        )}
      </div>

      <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80">
        <span>{changeLabel || period}</span>
        <span className="font-mono text-[10px] text-slate-600 dark:text-slate-400">Validated</span>
      </div>
    </div>
  );
};
