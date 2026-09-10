import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LoginPage } from './pages/LoginPage';
import { Dashboard } from './pages/dashboard/Dashboard';
import { FlightSearch } from './pages/FlightSearch';
import { AirfareIndex } from './pages/AirfareIndex';
import { PriceTrends } from './pages/PriceTrends';
import { PriceAlerts } from './pages/PriceAlerts';
import { RoutesPage } from './pages/RoutesPage';
import { AirlinesPage } from './pages/AirlinesPage';
import { CPIAnalytics } from './pages/CPIAnalytics';
import { Settings } from './pages/Settings';
import { AppProvider } from './context/AppProvider';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5000,
      retry: 2,
    },
  },
});

import { useAppContext } from './context/AppProvider';

function HomeRedirect() {
  const { isAuthenticated } = useAppContext();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/ai-trip-suggester" element={<Navigate to="/search" replace />} />
            <Route path="/trip-suggester" element={<Navigate to="/search" replace />} />
            <Route path="/search" element={<FlightSearch />} />
            <Route path="/flights" element={<FlightSearch />} />
            <Route path="/airfare-index" element={<AirfareIndex />} />
            <Route path="/price-trends" element={<PriceTrends />} />
            <Route path="/trends" element={<PriceTrends />} />
            <Route path="/predictions" element={<Navigate to="/airfare-index" replace />} />
            <Route path="/price-alerts" element={<PriceAlerts />} />
            <Route path="/alerts" element={<PriceAlerts />} />
            <Route path="/routes" element={<RoutesPage />} />
            <Route path="/airlines" element={<AirlinesPage />} />
            <Route path="/cpi-analytics" element={<CPIAnalytics />} />
            <Route path="/cpi" element={<CPIAnalytics />} />
            <Route path="/gamification" element={<Navigate to="/dashboard" replace />} />
            <Route path="/rewards" element={<Navigate to="/dashboard" replace />} />
            <Route path="/my-flights" element={<Navigate to="/search" replace />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/" element={<HomeRedirect />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </QueryClientProvider>
  );
}

export default App;
