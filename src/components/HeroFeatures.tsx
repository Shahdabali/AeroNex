import { BarChart3, TrendingUp, Bell } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAppContext } from '../context/AppProvider';

export function HeroFeatures() {
  const { t } = useAppContext();

  const features = [
    {
      icon: BarChart3,
      title: t.feature1Title,
      description: t.feature1Desc
    },
    {
      icon: TrendingUp,
      title: t.feature2Title,
      description: t.feature2Desc
    },
    {
      icon: Bell,
      title: t.feature3Title,
      description: t.feature3Desc
    }
  ];

  return (
    <div className="flex flex-col gap-8 mt-12 relative z-10">
      {features.map((feature, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: index * 0.15 + 0.3 }}
          className="flex items-center gap-5"
        >
          <div className="flex items-center justify-center w-[66px] h-[66px] rounded-full bg-[#0B1B42]/80 border border-blue-500/20 shadow-[0_0_20px_rgba(23,136,255,0.15)] shrink-0">
            <feature.icon className="text-[#4E55F5] w-7 h-7" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-[16px] font-semibold text-cyan-100 mb-1">
              {feature.title}
            </h3>
            <p className="text-[15px] text-slate-400 leading-snug whitespace-pre-line">
              {feature.description}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
