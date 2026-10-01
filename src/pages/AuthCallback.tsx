import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppContext } from '../context/AppProvider';
import { AeroNexLogo } from '../components/AeroNexLogo';
import { AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { usePageTitle } from '../hooks/usePageTitle';

export function AuthCallback() {
  usePageTitle('Authenticating - AERONEX');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, authLoading } = useAppContext();

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const errorParam = searchParams.get('error');
    const errorDesc = searchParams.get('error_description');
    
    if (errorParam) {
      setStatus('error');
      // Format the error nicely (e.g. replace + with space)
      const cleanError = (errorDesc || errorParam).replace(/\+/g, ' ');
      setErrorMessage(cleanError);
      return;
    }

    if (!authLoading) {
      if (isAuthenticated) {
        setStatus('success');
        window.location.replace('/dashboard');
        return;
      } else {
        setStatus('error');
        setErrorMessage('Authentication session expired or failed. Please try signing in again.');
      }
    }
  }, [authLoading, isAuthenticated, navigate, searchParams]);

  return (
    <div className="min-h-screen w-full bg-[#020A1D] flex flex-col items-center justify-center p-6 text-white select-none">
      <div className="w-full max-w-md p-8 rounded-3xl bg-[#061126]/90 border border-blue-500/25 shadow-[0_25px_80px_rgba(0,0,0,0.7)] text-center flex flex-col items-center">

        <div className="mb-6">
          <AeroNexLogo size={42} showTagline={true} />
        </div>

        {status === 'loading' && (
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="w-10 h-10 border-3 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin" />
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">Establishing Flight Deck Session</h3>
              <p className="text-xs text-slate-400 mt-1">Verifying credentials and syncing profile...</p>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Authentication Successful!</h3>
              <p className="text-xs text-slate-400 mt-1">Redirecting to your dashboard...</p>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center gap-4 py-2 w-full">
            <div className="w-12 h-12 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.3)]">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Authentication Failed</h3>
              <p className="text-xs text-red-300/90 mt-1.5 leading-relaxed max-w-xs mx-auto">
                {errorMessage || 'Google authentication could not be completed. Please try again.'}
              </p>
            </div>

            <button
              onClick={() => navigate('/login', { replace: true })}
              className="mt-4 w-full h-11 rounded-xl bg-gradient-to-r from-[#1788FF] to-[#00A3FF] hover:shadow-[0_0_20px_rgba(23,136,255,0.4)] text-white font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <span>Return to Sign In</span>
              <ArrowRight size={15} />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
