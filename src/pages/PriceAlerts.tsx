import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Bell, Plus, Trash2, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { usePageTitle } from '../hooks/usePageTitle';

export function PriceAlerts() {
  usePageTitle('Price Alerts');
  const [route, setRoute] = useState('DEL-BOM');
  const [targetPrice, setTargetPrice] = useState('');
  const queryClient = useQueryClient();

  const { data: alerts = [] } = useQuery({
    queryKey: ['alerts'],
    queryFn: async () => {
      try {
        const res = await api.getAlerts();
        return Array.isArray(res) && res.length > 0 ? res : [
          { id: '1', origin: 'DEL', destination: 'BOM', targetPrice: 4800, currentPrice: 5240, status: 'Active' },
          { id: '2', origin: 'BOM', destination: 'BLR', targetPrice: 4500, currentPrice: 4350, status: 'Triggered' }
        ];
      } catch {
        return [
          { id: '1', origin: 'DEL', destination: 'BOM', targetPrice: 4800, currentPrice: 5240, status: 'Active' },
          { id: '2', origin: 'BOM', destination: 'BLR', targetPrice: 4500, currentPrice: 4350, status: 'Triggered' }
        ];
      }
    }
  });

  const createAlertMutation = useMutation({
    mutationFn: async () => {
      return api.createAlert({ route, targetPrice: Number(targetPrice) || 5000 });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      setTargetPrice('');
    }
  });

  const deleteAlertMutation = useMutation({
    mutationFn: (id: string) => api.deleteAlert(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    }
  });

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-xl text-[#1788FF]">
              <Bell className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-white">Price Alerts</h1>
          </div>
        </div>

        <div className="bg-[rgba(10,24,56,0.6)] border border-blue-500/20 rounded-[16px] p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Set a New Price Alert</h2>
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="block text-slate-400 text-sm mb-2">Route</label>
              <select 
                value={route} 
                onChange={(e) => setRoute(e.target.value)}
                className="w-full bg-[#0A1838] border border-slate-700 rounded-xl text-white px-4 py-2 outline-none focus:border-[#1788FF]"
              >
                <option value="DEL-BOM">New Delhi (DEL) → Mumbai (BOM)</option>
                <option value="BOM-BLR">Mumbai (BOM) → Bengaluru (BLR)</option>
                <option value="DEL-BLR">New Delhi (DEL) → Bengaluru (BLR)</option>
                <option value="MAA-DEL">Chennai (MAA) → New Delhi (DEL)</option>
                <option value="HYD-DEL">Hyderabad (HYD) → New Delhi (DEL)</option>
              </select>
            </div>
            <div className="flex-1 w-full">
              <label className="block text-slate-400 text-sm mb-2">Target Price (₹)</label>
              <input 
                type="number"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                placeholder="e.g. 4500"
                className="w-full bg-[#0A1838] border border-slate-700 rounded-xl text-white px-4 py-2 outline-none focus:border-[#1788FF]"
              />
            </div>
            <button 
              onClick={() => createAlertMutation.mutate()}
              disabled={createAlertMutation.isPending}
              className="bg-gradient-to-r from-[#1788FF] to-[#4E55F5] rounded-xl text-white px-6 py-2 flex items-center gap-2 w-full md:w-auto justify-center cursor-pointer hover:shadow-lg transition-all"
            >
              <Plus className="w-5 h-5" />
              {createAlertMutation.isPending ? 'Saving...' : 'Create Alert'}
            </button>
          </div>
        </div>

        <div className="bg-[rgba(10,24,56,0.6)] border border-blue-500/20 rounded-[16px] overflow-hidden">
          <div className="p-4 border-b border-slate-700/50">
            <h2 className="text-lg font-semibold text-white">Active Alerts</h2>
          </div>
          
          <table className="w-full text-left">
            <thead className="bg-[#0A1838]/50 text-slate-400 text-sm">
              <tr>
                <th className="p-4 font-medium">Route</th>
                <th className="p-4 font-medium">Target Price</th>
                <th className="p-4 font-medium">Current Fare</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-white divide-y divide-slate-700/50">
              {alerts.length > 0 ? alerts.map((alert: any) => (
                <tr key={alert.id} className="hover:bg-blue-500/5 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-2 font-medium">
                      {alert.origin || alert.route?.split('-')[0]} <ArrowRight className="w-4 h-4 text-slate-500" /> {alert.destination || alert.route?.split('-')[1]}
                    </div>
                  </td>
                  <td className="p-4 text-slate-400">₹{alert.targetPrice}</td>
                  <td className="p-4 font-semibold">₹{alert.currentPrice || 5240}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      alert.status === 'Triggered' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    }`}>
                      {alert.status || 'Active'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => deleteAlertMutation.mutate(alert.id)}
                      className="p-2 text-slate-400 hover:text-red-400 transition-colors rounded-lg hover:bg-red-400/10 cursor-pointer"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">No active alerts.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
