import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Bookmark, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePageTitle } from '../hooks/usePageTitle';

export function MyFlights() {
  usePageTitle('My Flights');
  const navigate = useNavigate(); 
  const savedFlights: any[] = []; // Empty state demo

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 h-full">
        <h1 className="text-2xl font-bold text-white mb-2">My Saved Flights</h1>

        {savedFlights.length > 0 ? (
          <div className="bg-[rgba(10,24,56,0.6)] border border-blue-500/20 rounded-[16px] overflow-hidden">
            {/* List would go here */}
          </div>
        ) : (
          <div className="bg-[rgba(10,24,56,0.6)] border border-blue-500/20 rounded-[16px] p-12 flex flex-col items-center justify-center text-center flex-1 min-h-[400px]">
            <div className="w-20 h-20 bg-[#0A1838] rounded-full border border-slate-700 flex items-center justify-center text-slate-500 mb-6">
              <Bookmark className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">No saved flights yet</h2>
            <p className="text-slate-400 max-w-md mx-auto mb-8">
              Keep track of specific flights and their prices by saving them from the search results page. We'll monitor them for you.
            </p>
            <button 
              onClick={() => navigate('/search')}
              className="bg-gradient-to-r from-[#1788FF] to-[#4E55F5] rounded-xl text-white px-8 py-3 font-medium flex items-center gap-2 hover:shadow-lg hover:shadow-blue-500/25 transition-all cursor-pointer"
            >
              <Search className="w-5 h-5" />
              Find Flights to Save
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
