import React from 'react';

export type StatusType = 'normal' | 'stable' | 'warning' | 'elevated' | 'anomaly' | 'critical' | 'info' | 'validated' | 'demo';

interface StatusBadgeProps {
  status: StatusType | string;
  label?: string;
  size?: 'sm' | 'md';
  dot?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  size = 'md',
  dot = true
}) => {
  const normalized = status.toLowerCase();

  let styles = 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
  let dotColor = 'bg-slate-500';
  let defaultLabel = status;

  if (normalized === 'normal' || normalized === 'stable') {
    styles = 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/50';
    dotColor = 'bg-emerald-600';
    defaultLabel = 'Normal / Stable';
  } else if (normalized === 'warning' || normalized === 'elevated') {
    styles = 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/50';
    dotColor = 'bg-amber-600';
    defaultLabel = 'Elevated Movement';
  } else if (normalized === 'anomaly' || normalized === 'critical' || normalized === 'spike') {
    styles = 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/50';
    dotColor = 'bg-rose-600 animate-pulse';
    defaultLabel = 'Surge Anomaly';
  } else if (normalized === 'info' || normalized === 'ingested') {
    styles = 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/50';
    dotColor = 'bg-blue-600';
    defaultLabel = 'Ingested Feed';
  } else if (normalized === 'validated') {
    styles = 'bg-teal-50 text-teal-800 border-teal-200 dark:bg-teal-950/40 dark:text-teal-400 dark:border-teal-800/50';
    dotColor = 'bg-teal-600';
    defaultLabel = 'Zod Validated';
  } else if (normalized === 'demo') {
    styles = 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800/90 dark:text-slate-200 dark:border-slate-700';
    dotColor = 'bg-indigo-500';
    defaultLabel = 'Simulated / Demo';
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center gap-1.5 font-semibold rounded-md border ${sizeClasses} ${styles}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />}
      <span>{label || defaultLabel}</span>
    </span>
  );
};
