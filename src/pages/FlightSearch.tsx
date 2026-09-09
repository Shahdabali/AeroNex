import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, MapPin, Calendar, Users, Briefcase } from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { usePageTitle } from '../hooks/usePageTitle';

export function FlightSearch() {
  usePageTitle('Flight Search');
  const [searchParams, setSearchParams] = useState({ from: '', to: '', date: '', passengers: 1, class: 'Economy' });
  const [hasSearched, setHasSearched] = useState(false);

  const { data: flights, isLoading } = useQuery({
    queryKey: ['flights', searchParams],
    queryFn: async () => {
      const res = await fetch(`http://localhost:5000/api/flights/search?from=${searchParams.from}&to=${searchParams.to}&date=${searchParams.date}`);
      if (!res.ok) throw new Error('Failed to fetch flights');
      return res.json();
    },
    enabled: hasSearched,
  });

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold text-white">Search Flights</h1>
        
        <div className="bg-[rgba(10,24,56,0.6)] border border-blue-500/20 rounded-[16px] p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="flex flex-col">
              <label className="text-slate-400 text-sm mb-1">From</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input 
                  type="text" 
                  value={searchParams.from}
                  onChange={(e) => setSearchParams({...searchParams, from: e.target.value})}
                  className="w-full bg-[#0A1838] border border-slate-700 rounded-xl text-white pl-10 pr-4 py-2" 
                  placeholder="Departure City"
                />
              </div>
            </div>
            
            <div className="flex flex-col">
              <label className="text-slate-400 text-sm mb-1">To</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input 
                  type="text" 
                  value={searchParams.to}
                  onChange={(e) => setSearchParams({...searchParams, to: e.target.value})}
                  className="w-full bg-[#0A1838] border border-slate-700 rounded-xl text-white pl-10 pr-4 py-2" 
                  placeholder="Arrival City"
                />
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-slate-400 text-sm mb-1">Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input 
                  type="date" 
                  value={searchParams.date}
                  onChange={(e) => setSearchParams({...searchParams, date: e.target.value})}
                  className="w-full bg-[#0A1838] border border-slate-700 rounded-xl text-white pl-10 pr-4 py-2"
                />
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-slate-400 text-sm mb-1">Passengers</label>
              <div className="relative">
                <Users className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input 
                  type="number" 
                  min="1"
                  value={searchParams.passengers}
                  onChange={(e) => setSearchParams({...searchParams, passengers: parseInt(e.target.value)})}
                  className="w-full bg-[#0A1838] border border-slate-700 rounded-xl text-white pl-10 pr-4 py-2"
                />
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-slate-400 text-sm mb-1">Class</label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <select 
                  value={searchParams.class}
                  onChange={(e) => setSearchParams({...searchParams, class: e.target.value})}
                  className="w-full bg-[#0A1838] border border-slate-700 rounded-xl text-white pl-10 pr-4 py-2 appearance-none"
                >
                  <option>Economy</option>
                  <option>Premium Economy</option>
                  <option>Business</option>
                  <option>First</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-between items-center">
            <div className="flex gap-4">
              <select className="bg-[#0A1838] border border-slate-700 rounded-xl text-slate-400 px-4 py-2">
                <option>Price: Any</option>
                <option>Under ₹5,000</option>
                <option>Under ₹10,000</option>
              </select>
              <select className="bg-[#0A1838] border border-slate-700 rounded-xl text-slate-400 px-4 py-2">
                <option>Stops: Any</option>
                <option>Non-stop</option>
                <option>1 Stop</option>
              </select>
            </div>
            
            <button 
              onClick={() => setHasSearched(true)}
              className="bg-gradient-to-r from-[#1788FF] to-[#4E55F5] rounded-xl text-white px-8 py-2 font-medium flex items-center gap-2"
            >
              <Search className="w-5 h-5" />
              Search Flights
            </button>
          </div>
        </div>

        {hasSearched && (
          <div className="bg-[rgba(10,24,56,0.6)] border border-blue-500/20 rounded-[16px] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-slate-700/50">
              <h2 className="text-lg font-semibold text-white">Search Results</h2>
              <div className="flex gap-2 text-sm text-slate-400">
                <span className="cursor-pointer hover:text-white">Sort by: Cheapest</span>
                <span>|</span>
                <span className="cursor-pointer hover:text-white">Fastest</span>
              </div>
            </div>
            
            {isLoading ? (
              <div className="p-8 text-center text-slate-400">Loading flights...</div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-[#0A1838]/50 text-slate-400 text-sm">
                  <tr>
                    <th className="p-4 font-medium">Airline</th>
                    <th className="p-4 font-medium">Flight</th>
                    <th className="p-4 font-medium">Departure</th>
                    <th className="p-4 font-medium">Arrival</th>
                    <th className="p-4 font-medium">Duration</th>
                    <th className="p-4 font-medium">Seats</th>
                    <th className="p-4 font-medium">Fare</th>
                  </tr>
                </thead>
                <tbody className="text-white divide-y divide-slate-700/50">
                  {flights?.length > 0 ? flights.map((flight: any, i: number) => (
                    <tr key={i} className="hover:bg-blue-500/5 transition-colors">
                      <td className="p-4">{flight.airline}</td>
                      <td className="p-4 text-slate-400">{flight.flightNumber}</td>
                      <td className="p-4">{flight.departureTime}</td>
                      <td className="p-4">{flight.arrivalTime}</td>
                      <td className="p-4 text-slate-400">{flight.duration}</td>
                      <td className="p-4">{flight.availableSeats}</td>
                      <td className="p-4 font-semibold text-[#1788FF]">₹{flight.price}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400">No flights found for this route.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
