import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { WelcomeBanner } from '../../components/dashboard/WelcomeBanner';
import { KPIGrid } from '../../components/dashboard/KPIGrid';
import { MarketSignals } from '../../components/dashboard/MarketSignals';
import { AirfareIndexChart } from '../../components/dashboard/AirfareIndexChart';
import { IndiaAirfareMarketPulse } from '../../components/dashboard/IndiaAirfareMarketPulse';
import { DataIngestionMonitor } from '../../components/dashboard/DataIngestionMonitor';
import { QuickInsights } from '../../components/dashboard/QuickInsights';
import { AirfareVsCPI } from '../../components/dashboard/AirfareVsCPI';
import { AnomalyMonitor } from '../../components/dashboard/AnomalyMonitor';
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

        <ScrollReveal delay={0.3}>
          <MarketSignals />
        </ScrollReveal>
        
        <ScrollReveal className="grid grid-cols-1 gap-6">
          <AirfareIndexChart />
        </ScrollReveal>

        <ScrollReveal className="grid grid-cols-1 gap-6">
          <IndiaAirfareMarketPulse />
        </ScrollReveal>

        <ScrollReveal className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <DataIngestionMonitor />
          </div>
          <div className="lg:col-span-1">
            <QuickInsights />
          </div>
          <div className="lg:col-span-1">
            <AnomalyMonitor />
          </div>
          <div className="lg:col-span-1">
            <AirfareVsCPI />
          </div>
        </ScrollReveal>
      </div>
    </DashboardLayout>
  );
}
