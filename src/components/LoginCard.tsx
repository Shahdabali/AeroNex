import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { AeroNexLogo } from './AeroNexLogo';
import { SocialLogin } from './SocialLogin';
import { DemoAccess } from './DemoAccess';
import { authService } from '../services/authService';
import { useAppContext } from '../context/AppProvider';

export function LoginCard() {
  const { t } = useAppContext();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await authService.login(email, password);
      console.log('Login success', response);
      setSuccess("Successfully logged in!");
    } catch (err: any) {
      setError(err.message || "Failed to login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address first.");
      return;
    }
    setError(null);
    try {
      await authService.resetPassword(email);
      setSuccess("Password reset link sent to your email!");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="w-full max-w-[625px] p-8 md:p-12 rounded-[24px] bg-[rgba(5,20,52,0.75)] backdrop-blur-2xl border border-blue-500/20 shadow-[0_0_50px_rgba(23,136,255,0.05),inset_0_1px_0_rgba(255,255,255,0.1)] relative overflow-hidden mt-8 lg:mt-0 xl:mr-10">
      <div className="flex justify-center mb-8">
        <AeroNexLogo size={52} showTagline={true} />
      </div>

      <div className="mb-8">
        <h2 className="text-[32px] font-bold text-white mb-2 flex items-center gap-2">
          {t.welcome} <span className="text-2xl origin-bottom-right hover:rotate-12 transition-transform cursor-default">👋</span>
        </h2>
        <p className="text-slate-400 text-[16px]">{t.signInTo}</p>
      </div>

      {error && (
        <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-400 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-3 rounded-lg bg-green-500/10 border border-green-500/50 text-green-400 text-sm">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label className="text-[#1788FF] text-[15px] font-medium flex items-center gap-2">
            <Mail size={16} /> {t.emailLabel}
          </label>
          <div className="relative flex items-center">
            <Mail size={20} className="absolute left-4 text-slate-500 pointer-events-none" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.emailPlaceholder}
              className="w-full h-[52px] bg-[rgba(11,27,66,0.5)] border border-slate-700 rounded-xl pl-12 pr-4 text-white placeholder-slate-500 outline-none focus:border-[#1788FF] focus:shadow-[0_0_10px_rgba(23,136,255,0.2)] transition-all"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[#1788FF] text-[15px] font-medium flex items-center gap-2">
            <Lock size={16} /> {t.passwordLabel}
          </label>
          <div className="relative flex items-center">
            <Lock size={20} className="absolute left-4 text-slate-500 pointer-events-none" />
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t.passwordPlaceholder}
              className="w-full h-[52px] bg-[rgba(11,27,66,0.5)] border border-slate-700 rounded-xl pl-12 pr-12 text-white placeholder-slate-500 outline-none focus:border-[#1788FF] focus:shadow-[0_0_10px_rgba(23,136,255,0.2)] transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 text-slate-500 hover:text-slate-300 transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between mt-1 mb-2">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative flex items-center justify-center">
              <input type="checkbox" className="peer sr-only" defaultChecked />
              <div className="w-5 h-5 rounded border border-slate-600 bg-transparent peer-checked:bg-[#1788FF] peer-checked:border-[#1788FF] transition-all" />
              <svg className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-slate-300 text-[15px] group-hover:text-white transition-colors">{t.rememberMe}</span>
          </label>
          <a href="#" onClick={handleForgotPassword} className="text-[#1788FF] hover:text-blue-400 text-[15px] font-medium transition-colors">
            {t.forgotPassword}
          </a>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-[55px] rounded-[28px] bg-gradient-to-r from-[#1788FF] to-[#4E55F5] text-white font-medium text-[16px] shadow-[0_4px_20px_rgba(23,136,255,0.3)] hover:shadow-[0_6px_25px_rgba(23,136,255,0.4)] hover:-translate-y-[1px] active:scale-[0.98] transition-all flex items-center justify-center gap-2 relative overflow-hidden group"
        >
          {isLoading ? (
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              {t.signInBtn} <span className="group-hover:translate-x-1 transition-transform">→</span>
            </>
          )}
        </button>
      </form>

      <div className="mt-8 flex items-center gap-4">
        <div className="flex-1 h-px bg-slate-800" />
        <span className="text-slate-500 text-xs font-semibold tracking-wider">{t.orContinueWith}</span>
        <div className="flex-1 h-px bg-slate-800" />
      </div>

      <SocialLogin />

      <p className="text-center text-slate-400 mt-8 text-[15px]">
        {t.noAccount}{' '}
        <a href="#" onClick={(e) => { e.preventDefault(); alert('Redirecting to create account page...'); }} className="text-[#1788FF] hover:text-blue-400 font-medium transition-colors">
          {t.createAccount}
        </a>
      </p>

      <DemoAccess />
    </div>
  );
}
