import { FlaskConical, User, BarChart3, Shield, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { useAppContext } from '../context/AppProvider';

export function DemoAccess() {
  const navigate = useNavigate();
  const { t, login } = useAppContext();
  const [isExpanded, setIsExpanded] = useState(true);

  const demos = [
    {
      icon: User,
      title: t.demoPassenger,
      desc: t.demoPassengerDesc,
      role: 'Passenger' as const
    },
    {
      icon: BarChart3,
      title: t.demoResearcher,
      desc: t.demoResearcherDesc,
      role: 'Researcher' as const
    },
    {
      icon: Shield,
      title: t.demoAdmin,
      desc: t.demoAdminDesc,
      role: 'Admin' as const
    }
  ];

  const handleDemoLogin = async (role: 'Passenger' | 'Researcher' | 'Admin') => {
    try {
      const res = (await authService.demoLogin(role)) as any;
      login({
        id: `demo_${role.toLowerCase()}`,
        name: res.user?.name || `${role} Demo`,
        email: `${role.toLowerCase()}@aeronex.com`,
        role: role,
      }, res.token);
      navigate('/dashboard');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="w-full mt-6 rounded-[16px] bg-[rgba(5,15,40,0.5)] border border-slate-700/60 overflow-hidden">
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <FlaskConical className="text-[#1788FF] w-[18px] h-[18px]" />
          <span className="text-slate-200 font-medium text-[14px]">{t.demoAccess}</span>
        </div>
        <ChevronUp 
          className={`text-slate-500 transition-transform ${isExpanded ? '' : 'rotate-180'}`} 
          size={16} 
        />
      </div>

      {isExpanded && (
        <div className="p-4 pt-0 grid grid-cols-1 md:grid-cols-3 gap-3">
          {demos.map((demo, index) => (
            <button 
              key={index}
              onClick={() => handleDemoLogin(demo.role)}
              className="flex items-start gap-3 p-3 rounded-xl bg-[rgba(10,20,50,0.4)] border border-slate-700/50 hover:border-blue-500/50 hover:shadow-[0_0_15px_rgba(23,136,255,0.1)] hover:bg-[rgba(15,30,70,0.4)] transition-all text-left"
            >
              <demo.icon className="text-[#1788FF] w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex flex-col">
                <span className="text-slate-200 text-[12px] font-medium leading-tight">{demo.title}</span>
                <span className="text-slate-500 text-[10px] mt-0.5 leading-tight">{demo.desc}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
