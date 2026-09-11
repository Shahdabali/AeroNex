import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AppProvider } from './context/AppProvider';

// Dynamic code-split route components for rapid initial bundle load
const LandingPage = lazy(() => import('./pages/LandingPage').then(m => ({ default: m.LandingPage })));
const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const AuthCallback = lazy(() => import('./pages/AuthCallback').then(m => ({ default: m.AuthCallback })));
const ResetPassword = lazy(() => import('./pages/ResetPassword').then(m => ({ default: m.ResetPassword })));
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard').then(m => ({ default: m.Dashboard })));
const FlightSearch = lazy(() => import('./pages/FlightSearch').then(m => ({ default: m.FlightSearch })));
const AirfareIndex = lazy(() => import('./pages/AirfareIndex').then(m => ({ default: m.AirfareIndex })));
const PriceTrends = lazy(() => import('./pages/PriceTrends').then(m => ({ default: m.PriceTrends })));
const PriceAlerts = lazy(() => import('./pages/PriceAlerts').then(m => ({ default: m.PriceAlerts })));
const RoutesPage = lazy(() => import('./pages/RoutesPage').then(m => ({ default: m.RoutesPage })));
const AirlinesPage = lazy(() => import('./pages/AirlinesPage').then(m => ({ default: m.AirlinesPage })));
const CPIAnalytics = lazy(() => import('./pages/CPIAnalytics').then(m => ({ default: m.CPIAnalytics })));
const MethodologyPage = lazy(() => import('./pages/MethodologyPage').then(m => ({ default: m.MethodologyPage })));
const DataScrapingPage = lazy(() => import('./pages/DataScrapingPage').then(m => ({ default: m.DataScrapingPage })));
const Settings = lazy(() => import('./pages/Settings').then(m => ({ default: m.Settings })));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 6000,
      retry: 2,
    },
  },
});

function PageFallback() {
  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-[#090A0F] text-zinc-400 gap-3">
      <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      <span className="text-[11px] font-mono tracking-widest text-cyan-300 uppercase">Loading AeroNex Intelligence...</span>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <BrowserRouter>
          <Suspense fallback={<PageFallback />}>
            <Routes>
              {/* Public Landing Page */}
              <Route path="/" element={<LandingPage />} />

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

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AppProvider>
    </QueryClientProvider>
  );
}

export default App;
