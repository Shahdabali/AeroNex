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
import { ScrollReveal } from '../../components/ui/ScrollReveal';

export function Dashboard() {
  usePageTitle('Dashboard');
  useAirfareRealtime();

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 pb-10">
        <ScrollReveal delay={0.1}>
          <WelcomeBanner />
        </ScrollReveal>
        
        <ScrollReveal delay={0.2}>
          <KPIGrid />
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <SecondaryMetrics />
        </ScrollReveal>
        
        <ScrollReveal className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <AirfareIndexChart />
          </div>
          <div>
            <RegionalMap />
          </div>
        </ScrollReveal>

        <ScrollReveal className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RouteChangesTable />
          </div>
          <div>
            <QuickInsights />
          </div>
        </ScrollReveal>

        <ScrollReveal className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <CheapestDates />
          </div>
          <div className="lg:col-span-1">
            <AirfareVsCPI />
          </div>
          <div className="lg:col-span-1">
            <PopularRoutes />
          </div>
        </ScrollReveal>
      </div>
    </DashboardLayout>
  );
}
