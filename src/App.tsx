import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LoginPage } from './pages/LoginPage';
import { AuthCallback } from './pages/AuthCallback';
import { ResetPassword } from './pages/ResetPassword';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Dashboard } from './pages/dashboard/Dashboard';
import { FlightSearch } from './pages/FlightSearch';
import { AirfareIndex } from './pages/AirfareIndex';
import { PriceTrends } from './pages/PriceTrends';
import { PriceAlerts } from './pages/PriceAlerts';
import { RoutesPage } from './pages/RoutesPage';
import { AirlinesPage } from './pages/AirlinesPage';
import { CPIAnalytics } from './pages/CPIAnalytics';
import { MethodologyPage } from './pages/MethodologyPage';
import { DataScrapingPage } from './pages/DataScrapingPage';
import { Settings } from './pages/Settings';
import { AppProvider, useAppContext } from './context/AppProvider';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5000,
      retry: 2,
    },
  },
});

function HomeRedirect() {
  const { isAuthenticated, authLoading } = useAppContext();
  if (authLoading) {
    return (
      <div className="min-h-screen w-full bg-[#020A1D] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
      </div>
    );
  }
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Authentication Routes */}
            <Route path="/login" element={<LoginPage initialMode="signin" />} />
            <Route path="/signup" element={<LoginPage initialMode="signup" />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Protected Application Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/ai-trip-suggester" element={<Navigate to="/search" replace />} />
            <Route path="/trip-suggester" element={<Navigate to="/search" replace />} />
            <Route path="/search" element={<ProtectedRoute><FlightSearch /></ProtectedRoute>} />
            <Route path="/flights" element={<ProtectedRoute><FlightSearch /></ProtectedRoute>} />
            <Route path="/airfare-index" element={<ProtectedRoute><AirfareIndex /></ProtectedRoute>} />
            <Route path="/price-trends" element={<ProtectedRoute><PriceTrends /></ProtectedRoute>} />
            <Route path="/trends" element={<ProtectedRoute><PriceTrends /></ProtectedRoute>} />
            <Route path="/predictions" element={<Navigate to="/airfare-index" replace />} />
            <Route path="/price-alerts" element={<ProtectedRoute><PriceAlerts /></ProtectedRoute>} />
            <Route path="/alerts" element={<ProtectedRoute><PriceAlerts /></ProtectedRoute>} />
            <Route path="/routes" element={<ProtectedRoute><RoutesPage /></ProtectedRoute>} />
            <Route path="/airlines" element={<ProtectedRoute><AirlinesPage /></ProtectedRoute>} />
            <Route path="/cpi-analytics" element={<ProtectedRoute><CPIAnalytics /></ProtectedRoute>} />
            <Route path="/cpi" element={<ProtectedRoute><CPIAnalytics /></ProtectedRoute>} />
            <Route path="/methodology" element={<ProtectedRoute><MethodologyPage /></ProtectedRoute>} />
            <Route path="/data-scraping" element={<ProtectedRoute><DataScrapingPage /></ProtectedRoute>} />
            <Route path="/scraping" element={<Navigate to="/data-scraping" replace />} />
            <Route path="/gamification" element={<Navigate to="/dashboard" replace />} />
            <Route path="/rewards" element={<Navigate to="/dashboard" replace />} />
            <Route path="/my-flights" element={<Navigate to="/search" replace />} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

            {/* Root & Catch-all */}
            <Route path="/" element={<HomeRedirect />} />
            <Route path="*" element={<HomeRedirect />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </QueryClientProvider>
  );
}

export default App;
