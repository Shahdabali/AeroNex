import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { syncUserProfile, formatAuthError } from '../services/authService';
import { useAppContext } from '../context/AppProvider';
import { AeroNexLogo } from '../components/AeroNexLogo';
import { AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { usePageTitle } from '../hooks/usePageTitle';

export function AuthCallback() {
  usePageTitle('Authenticating — AERONEX');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAppContext();

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    let isCancelled = false;

    async function handleAuthCallback() {
      // 1. Check for explicit OAuth error in search params
      const errorParam = searchParams.get('error');
      const errorDesc = searchParams.get('error_description');

      if (errorParam) {
        if (!isCancelled) {
          setStatus('error');
          setErrorMessage(formatAuthError(errorDesc || errorParam));
        }
        return;
      }

      // 2. Check for PKCE authorization code in query string
      const code = searchParams.get('code');

      try {
        if (code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
          if (data?.session?.user) {
            const mappedUser = await syncUserProfile(data.session.user);
            login(mappedUser, data.session.access_token);
            if (!isCancelled) {
              setStatus('success');
              setTimeout(() => navigate('/dashboard', { replace: true }), 400);
            }
            return;
          }
        }

        // 3. Check for implicit hash session or active session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        if (session?.user) {
          const mappedUser = await syncUserProfile(session.user);
          login(mappedUser, session.access_token);
          if (!isCancelled) {
            setStatus('success');
            setTimeout(() => navigate('/dashboard', { replace: true }), 400);
          }
          return;
        }

        // If no session found after slight delay, check onAuthStateChange
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
          if (event === 'SIGNED_IN' && currentSession?.user) {
            const mappedUser = await syncUserProfile(currentSession.user);
            login(mappedUser, currentSession.access_token);
            if (!isCancelled) {
              setStatus('success');
              subscription.unsubscribe();
              setTimeout(() => navigate('/dashboard', { replace: true }), 400);
            }
          }
        });

        // Timeout fallback if no session received within 8 seconds
        setTimeout(() => {
          if (!isCancelled && status === 'loading') {
            setStatus('error');
            setErrorMessage('Authentication session timed out. Please try signing in again.');
          }
        }, 8000);

      } catch (err: any) {
        if (!isCancelled) {
          setStatus('error');
          setErrorMessage(formatAuthError(err));
        }
      }
    }

    handleAuthCallback();

    return () => {
      isCancelled = true;
    };
  }, [searchParams, navigate, login]);

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
