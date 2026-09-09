import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Trophy, Star, Target, CheckCircle, Zap, Activity } from 'lucide-react';
import { usePageTitle } from '../hooks/usePageTitle';

export function Gamification() {
  usePageTitle('Gamification');
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Rewards & Quests</h1>
          <div className="flex items-center gap-2 bg-gradient-to-r from-orange-500/20 to-yellow-500/20 border border-orange-500/30 px-4 py-2 rounded-xl">
            <Zap className="w-5 h-5 text-orange-400" />
            <span className="font-bold text-white">2,450 XP</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
          <div className="bg-[rgba(10,24,56,0.6)] border border-blue-500/20 rounded-[16px] p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#1788FF] to-[#4E55F5]"></div>
            <Trophy className="w-12 h-12 text-yellow-400 mb-4" />
            <h3 className="text-lg font-bold text-white mb-1">Aviation Analyst</h3>
            <p className="text-sm text-slate-400 mb-4">Current Rank</p>
            <div className="w-full bg-[#0A1838] rounded-full h-2 mb-2">
              <div className="bg-gradient-to-r from-[#1788FF] to-[#4E55F5] h-2 rounded-full" style={{ width: '65%' }}></div>
            </div>
            <p className="text-xs text-slate-500">1,550 XP to next rank</p>
          </div>

          <div className="md:col-span-2 bg-[rgba(10,24,56,0.6)] border border-blue-500/20 rounded-[16px] p-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-[#1788FF]" /> Active Quests
            </h2>
            <div className="flex flex-col gap-4">
              <div className="bg-[#0A1838] border border-slate-700 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-white mb-1">Track 5 new routes</h4>
                  <p className="text-sm text-slate-400">Add 5 distinct routes to your watchlist.</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm font-bold text-orange-400 mb-1">+500 XP</div>
                    <div className="text-xs text-slate-500">3/5 Completed</div>
                  </div>
                  <div className="w-16 h-16 rounded-full border-4 border-slate-700 flex items-center justify-center relative">
                    <svg className="absolute top-0 left-0 w-full h-full transform -rotate-90">
                      <circle cx="28" cy="28" r="26" stroke="#1788FF" strokeWidth="4" fill="none" strokeDasharray="163" strokeDashoffset="65" />
                    </svg>
                    <span className="text-white text-sm font-bold relative">60%</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-[#0A1838] border border-slate-700 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-white mb-1">Use AI Predictions</h4>
                  <p className="text-sm text-slate-400">Generate 10 AI fare predictions.</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm font-bold text-orange-400 mb-1">+250 XP</div>
                    <div className="text-xs text-slate-500">10/10 Completed</div>
                  </div>
                  <div className="w-16 h-16 bg-emerald-500/20 rounded-full border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <h2 className="text-lg font-bold text-white mt-4">Earned Badges</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[
            { name: 'Early Bird', icon: <Star className="w-6 h-6" />, desc: 'Created account in beta' },
            { name: 'Trend Setter', icon: <Activity className="w-6 h-6" />, desc: 'Checked CPI analytics' },
            { name: 'Predictor', icon: <Zap className="w-6 h-6" />, desc: 'Used AI 5 times' },
            { name: 'Locked', icon: <Star className="w-6 h-6 opacity-30" />, desc: 'Track 10 flights', locked: true },
            { name: 'Locked', icon: <Trophy className="w-6 h-6 opacity-30" />, desc: 'Save ₹5000 via alerts', locked: true },
          ].map((badge, i) => (
            <div key={i} className={`bg-[rgba(10,24,56,0.6)] border ${badge.locked ? 'border-slate-800' : 'border-blue-500/30'} rounded-[16px] p-4 flex flex-col items-center text-center`}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${badge.locked ? 'bg-slate-800 text-slate-600' : 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white'}`}>
                {badge.icon}
              </div>
              <h4 className={`text-sm font-bold ${badge.locked ? 'text-slate-500' : 'text-white'} mb-1`}>{badge.name}</h4>
              <p className="text-xs text-slate-500">{badge.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
