import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Plane, ExternalLink } from 'lucide-react';
import { usePageTitle } from '../hooks/usePageTitle';

export function AirlinesPage() {
  usePageTitle('Airlines');
  const { data: airlines = [] } = useQuery({
    queryKey: ['airlines'],
    queryFn: async () => {
      return [
        { id: 1, name: 'IndiGo', code: '6E', routesCount: 104, type: 'LCC' },
        { id: 2, name: 'Air India', code: 'AI', routesCount: 85, type: 'FSC' },
        { id: 3, name: 'Vistara', code: 'UK', routesCount: 42, type: 'FSC' },
        { id: 4, name: 'SpiceJet', code: 'SG', routesCount: 56, type: 'LCC' },
        { id: 5, name: 'Akasa Air', code: 'QP', routesCount: 24, type: 'LCC' },
        { id: 6, name: 'AirAsia India', code: 'I5', routesCount: 38, type: 'LCC' },
      ];
    }
  });

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-end mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Airlines Directory</h1>
            <p className="text-slate-400 text-sm">View all airlines monitored by the AeroNex platform.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {airlines.map((airline: any) => (
            <div key={airline.id} className="bg-[rgba(10,24,56,0.6)] border border-blue-500/20 rounded-[16px] p-6 flex flex-col justify-between hover:border-[#1788FF] transition-colors cursor-pointer group">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-[#0A1838] border border-slate-700 rounded-xl flex items-center justify-center text-[#1788FF]">
                  <Plane className="w-6 h-6" />
                </div>
                <div className="bg-[#0A1838] px-3 py-1 rounded-full border border-slate-700">
                  <span className="text-xs font-medium text-slate-300">{airline.type}</span>
                </div>
              </div>
              
              <div>
                <h2 className="text-xl font-bold text-white mb-1 group-hover:text-[#1788FF] transition-colors flex items-center gap-2">
                  {airline.name} <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h2>
                <p className="text-slate-400 text-sm font-mono">{airline.code}</p>
              </div>
              
              <div className="mt-6 pt-4 border-t border-slate-700/50 flex justify-between items-center">
                <span className="text-slate-400 text-sm">Monitored Routes</span>
                <span className="font-bold text-white">{airline.routesCount}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
