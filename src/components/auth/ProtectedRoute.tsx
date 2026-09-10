import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../../context/AppProvider';
import { AeroNexLogo } from '../AeroNexLogo';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, authLoading } = useAppContext();
  const location = useLocation();

  if (authLoading) {
    return (
      <div className="min-h-screen w-full bg-[#020A1D] flex flex-col items-center justify-center p-6 text-white select-none">
        <div className="relative mb-6">
          <AeroNexLogo size={42} showTagline={false} />
          <div className="absolute -inset-4 bg-cyan-500/10 rounded-full blur-xl pointer-events-none animate-pulse" />
        </div>
        
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
          <span className="text-xs font-semibold text-slate-300 tracking-wider uppercase">
            Verifying AeroNex Session...
          </span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
