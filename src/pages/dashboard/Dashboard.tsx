import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { WelcomeBanner } from '../../components/dashboard/WelcomeBanner';
import { KPIGrid } from '../../components/dashboard/KPIGrid';
import { SecondaryMetrics } from '../../components/dashboard/SecondaryMetrics';
import { AirfareIndexChart } from '../../components/dashboard/AirfareIndexChart';
import { RegionalMap } from '../../components/dashboard/RegionalMap';
import { RouteChangesTable } from '../../components/dashboard/RouteChangesTable';
import { QuickInsights } from '../../components/dashboard/QuickInsights';
import { CheapestDates } from '../../components/dashboard/CheapestDates';
import { AirfareVsCPI } from '../../components/dashboard/AirfareVsCPI';
import { PopularRoutes } from '../../components/dashboard/PopularRoutes';
import { useAirfareRealtime } from '../../hooks/useAirfareRealtime';
import { usePageTitle } from '../../hooks/usePageTitle';

import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.09, delayChildren: 0.04 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] as const }
  }
};

export function Dashboard() {
  usePageTitle('Dashboard');
  useAirfareRealtime();

  return (
    <DashboardLayout>
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-6 pb-10"
      >
        <motion.div variants={itemVariants}>
          <WelcomeBanner />
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <KPIGrid />
        </motion.div>

        <motion.div variants={itemVariants}>
          <SecondaryMetrics />
        </motion.div>
        
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <AirfareIndexChart />
          </div>
          <div>
            <RegionalMap />
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RouteChangesTable />
          </div>
          <div>
            <QuickInsights />
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <CheapestDates />
          </div>
          <div className="lg:col-span-1">
            <AirfareVsCPI />
          </div>
          <div className="lg:col-span-1">
            <PopularRoutes />
          </div>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
