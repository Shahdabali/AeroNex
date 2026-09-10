import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { AeroNexLogo } from '../components/AeroNexLogo';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { usePageTitle } from '../hooks/usePageTitle';

export function ResetPassword() {
  usePageTitle('Reset Password — AERONEX');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify your new password.');
      return;
    }

    setIsLoading(true);

    try {
      await authService.updatePassword(password);
      setSuccess('Your password has been successfully updated! Redirecting to sign in...');
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to update password. Your reset link may have expired.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#020A1D] flex flex-col items-center justify-center p-6 text-white select-none">
      <div className="w-full max-w-md p-8 rounded-3xl bg-[#061126]/90 border border-blue-500/25 shadow-[0_25px_80px_rgba(0,0,0,0.7)] flex flex-col">
        
        <div className="flex justify-center mb-6">
          <AeroNexLogo size={40} showTagline={true} />
        </div>

        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-white tracking-tight">Set New Password</h2>
          <p className="text-xs text-slate-400 mt-1">Please enter your new password below.</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/40 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1.5">New Password</label>
            <div className="h-[44px] rounded-xl bg-[#040C20]/90 border border-slate-700/80 flex items-center px-4 gap-3 focus-within:border-[#00A3FF]">
              <Lock size={16} className="text-slate-400 shrink-0" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password (6+ chars)"
                className="text-xs sm:text-sm text-white placeholder-slate-500 bg-transparent outline-none w-full"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-slate-200 transition-colors cursor-pointer shrink-0"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1.5">Confirm New Password</label>
            <div className="h-[44px] rounded-xl bg-[#040C20]/90 border border-slate-700/80 flex items-center px-4 gap-3 focus-within:border-[#00A3FF]">
              <Lock size={16} className="text-slate-400 shrink-0" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="text-xs sm:text-sm text-white placeholder-slate-500 bg-transparent outline-none w-full"
                autoComplete="new-password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 mt-2 rounded-full bg-gradient-to-r from-[#00A3FF] via-[#0088FF] to-[#0070F3] hover:shadow-[0_0_25px_rgba(0,163,255,0.45)] text-white font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-60"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <span className="flex items-center gap-2">
                <span>Update Password</span>
                <ArrowRight size={16} />
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => navigate('/login')}
            className="mt-2 text-center text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            Cancel and return to Sign In
          </button>
        </form>

      </div>
    </div>
  );
}
