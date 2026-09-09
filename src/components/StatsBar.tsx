import { Plane, MapPin, Building2, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAppContext } from '../context/AppProvider';

export function StatsBar() {
  const { t } = useAppContext();

  const stats = [
    {
      icon: Plane,
      value: '125K+',
      label: t.stat1
    },
    {
      icon: MapPin,
      value: '1.2K+',
      label: t.stat2
    },
    {
      icon: Building2,
      value: '50+',
      label: t.stat3
    },
    {
      icon: Clock,
      value: '24/7',
      label: t.stat4
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.6 }}
      className="flex flex-wrap items-center gap-x-12 xl:gap-x-16 gap-y-6 mt-auto pb-6 lg:pb-10 z-10 relative"
    >
      {stats.map((stat, index) => (
        <div key={index} className="flex items-center gap-4 relative">
          {index > 0 && (
            <div className="hidden lg:block absolute -left-6 xl:-left-8 top-1/2 -translate-y-1/2 w-px h-8 bg-slate-700/50" />
          )}
          <stat.icon className="w-7 h-7 xl:w-8 xl:h-8 text-[#1788FF]" />
          <div className="flex flex-col">
            <span className="text-lg xl:text-xl font-bold text-white leading-none mb-1">
              {stat.value}
            </span>
            <span className="text-[11px] xl:text-xs text-slate-400 font-medium">
              {stat.label}
            </span>
          </div>
        </div>
      ))}
    </motion.div>
  );
}
