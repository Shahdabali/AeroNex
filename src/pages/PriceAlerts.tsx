import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import { usePageTitle } from '../hooks/usePageTitle';

export function PriceAlerts() {
  usePageTitle('Price Movement Alerts');
  const queryClient = useQueryClient();

  const [route, setRoute] = useState('DEL-BOM');
  const [thresholdPrice, setThresholdPrice] = useState('8500');
  const [alertType, setAlertType] = useState<'surge_cap' | 'downward_drop'>('surge_cap');

  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => api.getAlerts(),
  });

  const createMutation = useMutation({
    mutationFn: (newAlert: any) => api.createAlert(newAlert),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      alert('Price movement threshold alert registered.');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteAlert(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    }
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!thresholdPrice) return;
    createMutation.mutate({
      route,
      targetPrice: Number(thresholdPrice),
      alertType
    });
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
                  Tariff Surveillance
                </span>
                <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 text-[10px] font-bold uppercase tracking-wider">
                  DGCA Threshold Monitoring
                </span>
              </div>
              <h1 className="text-xl font-bold text-[#0F2A4A] dark:text-white tracking-tight">
                Price Movement Alerts & Regulatory Thresholds
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Configure automated telemetry triggers when observed fares exceed statutory caps or deviate from seasonal statistical boundaries.
              </p>
            </div>

            <span className="px-3 py-1 rounded bg-slate-100 dark:bg-slate-800 text-xs font-mono font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
              Active Triggers: {alerts.length}
            </span>
          </div>
        </div>

        {/* Create Alert Form */}
        <div className="bg-white dark:bg-[#0E1424] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#0F2A4A] dark:text-white mb-3 flex items-center gap-1.5">
            <Plus size={15} className="text-blue-600" />
            Register Regulatory Threshold Alert
          </h2>

          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                Corridor
              </label>
              <select
                value={route}
                onChange={(e) => setRoute(e.target.value)}
                className="w-full h-10 px-3 bg-slate-50 dark:bg-[#0B101D] border border-slate-200 dark:border-slate-700 rounded-lg font-mono font-semibold"
              >
                <option value="DEL-BOM">DEL-BOM (Delhi ⇄ Mumbai)</option>
                <option value="BOM-BLR">BOM-BLR (Mumbai ⇄ Bengaluru)</option>
                <option value="DEL-BLR">DEL-BLR (Delhi ⇄ Bengaluru)</option>
                <option value="DEL-GOI">DEL-GOI (Delhi ⇄ Goa)</option>
                <option value="CCU-DEL">CCU-DEL (Kolkata ⇄ Delhi)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                Threshold Tariff (INR)
              </label>
              <input
                type="number"
                value={thresholdPrice}
                onChange={(e) => setThresholdPrice(e.target.value)}
                placeholder="e.g. 8500"
                className="w-full h-10 px-3 bg-slate-50 dark:bg-[#0B101D] border border-slate-200 dark:border-slate-700 rounded-lg font-mono font-semibold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                Trigger Condition
              </label>
              <select
                value={alertType}
                onChange={(e) => setAlertType(e.target.value as any)}
                className="w-full h-10 px-3 bg-slate-50 dark:bg-[#0B101D] border border-slate-200 dark:border-slate-700 rounded-lg font-semibold"
              >
                <option value="surge_cap">Upper Cap Surge (Fare Exceeds Ceiling)</option>
                <option value="downward_drop">Deep Drop (Fare Falls Below Floor)</option>
              </select>
            </div>

            <div>
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="w-full h-10 bg-[#0F2A4A] hover:bg-[#1E3A8A] text-white font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                {createMutation.isPending ? 'Registering...' : 'Add Threshold Trigger'}
              </button>
            </div>
          </form>
        </div>

        {/* Active Alerts Table */}
        <div className="bg-white dark:bg-[#0E1424] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-[#0B101D] flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#0F2A4A] dark:text-white">
              Active Monitored Price Thresholds
            </h3>
            <span className="text-xs font-mono text-slate-400">Continuous 30s Audit</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 dark:bg-[#080D1A] text-slate-600 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-6">Corridor</th>
                  <th className="py-3 px-4">Threshold Price</th>
                  <th className="py-3 px-4">Current Observed Fare</th>
                  <th className="py-3 px-4">Trigger Condition</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-800 dark:text-slate-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-400">Loading active triggers...</td>
                  </tr>
                ) : alerts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-400">No active price movement alerts configured.</td>
                  </tr>
                ) : (
                  alerts.map((a: any) => (
                    <tr key={a.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-6 font-bold font-mono text-slate-900 dark:text-white">{a.route}</td>
                      <td className="py-3 px-4 font-mono font-bold text-blue-600">₹{a.targetPrice?.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-4 font-mono">₹{a.currentFare?.toLocaleString('en-IN') || '5,420'}</td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-[11px]">Surge Alert (Cap Breach)</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                          <CheckCircle2 size={11} /> Armed & Monitoring
                        </span>
                      </td>
                      <td className="py-3 px-6 text-right">
                        <button
                          onClick={() => deleteMutation.mutate(a.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                          title="Delete trigger"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
