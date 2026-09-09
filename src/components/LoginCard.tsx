import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User, Briefcase, CheckCircle2, AlertCircle } from 'lucide-react';
import { AeroNexLogo } from './AeroNexLogo';
import { SocialLogin } from './SocialLogin';
import { authService } from '../services/authService';
import { useAppContext } from '../context/AppProvider';

export function LoginCard() {
  const navigate = useNavigate();
  const { login } = useAppContext();
  
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Sign In Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Sign Up Fields
  const [fullName, setFullName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('Passenger');
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await authService.login(email, password);
      login(response.user, response.token);
      setSuccess("Authentication successful! Loading your dashboard...");
      setTimeout(() => {
        navigate('/dashboard');
      }, 400);
    } catch (err: any) {
      setError(err.message || "Failed to sign in. Please verify your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    if (signupPassword !== confirmPassword) {
      setError("Passwords do not match. Please re-enter your password.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await authService.register(fullName, signupEmail, signupPassword, role);
      login(response.user, response.token);
      setSuccess("Account successfully created! Welcome to AeroNex.");
      setTimeout(() => {
        navigate('/dashboard');
      }, 400);
    } catch (err: any) {
      setError(err.message || "Could not register account. Please check your details.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (accEmail: string, accPass: string) => {
    setEmail(accEmail);
    setPassword(accPass);
    setError(null);
  };

  const handleForgotPassword = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address above, then click Forgot Password.");
      return;
    }
    setError(null);
    try {
      const res = await authService.resetPassword(email);
      setSuccess(res.message);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="w-full max-w-[560px] p-7 md:p-10 rounded-[24px] bg-[rgba(5,20,52,0.85)] backdrop-blur-2xl border border-blue-500/25 shadow-[0_10px_50px_rgba(23,136,255,0.08),inset_0_1px_0_rgba(255,255,255,0.1)] relative overflow-hidden mt-6 lg:mt-0 xl:mr-8 transition-all">
      {/* Brand Header */}
      <div className="flex justify-center mb-6">
        <AeroNexLogo size={46} showTagline={true} />
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex bg-[#0A1838] p-1 rounded-xl mb-6 border border-slate-700/60 shadow-inner">
        <button
          type="button"
          onClick={() => { setActiveTab('signin'); setError(null); setSuccess(null); }}
          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'signin'
              ? 'bg-[#1788FF] text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => { setActiveTab('signup'); setError(null); setSuccess(null); }}
          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'signup'
              ? 'bg-[#1788FF] text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Create Account
        </button>
      </div>

      <div className="mb-6 text-center">
        <h2 className="text-[26px] font-extrabold text-white tracking-tight flex items-center justify-center gap-2">
          {activeTab === 'signin' ? (
            <>Welcome Back <span className="text-2xl origin-bottom-right hover:rotate-12 transition-transform cursor-default">👋</span></>
          ) : (
            <>Create Your AeroNex Account ✈️</>
          )}
        </h2>
        <p className="text-slate-400 text-[14px] mt-1">
          {activeTab === 'signin' 
            ? 'Sign in to access real-time airline fares & predictive intelligence'
            : 'Join India\'s premier high-frequency aviation market index'
          }
        </p>
      </div>

      {/* Error & Success Alerts */}
      {error && (
        <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/40 text-red-400 text-xs flex items-center gap-2.5 animate-fade-in">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2.5 animate-fade-in">
          <CheckCircle2 size={16} className="shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* TAB 1: SIGN IN */}
      {activeTab === 'signin' ? (
        <form onSubmit={handleSignIn} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-slate-300 text-[13px] font-medium flex items-center gap-1.5">
              <Mail size={14} className="text-[#1788FF]" /> Email Address
            </label>
            <div className="relative flex items-center">
              <Mail size={18} className="absolute left-4 text-slate-500 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@aeronex.com"
                className="w-full h-[48px] bg-[rgba(11,27,66,0.6)] border border-slate-700 rounded-xl pl-11 pr-4 text-white text-[14px] placeholder-slate-500 outline-none focus:border-[#1788FF] focus:shadow-[0_0_10px_rgba(23,136,255,0.2)] transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-slate-300 text-[13px] font-medium flex items-center gap-1.5">
              <Lock size={14} className="text-[#1788FF]" /> Password
            </label>
            <div className="relative flex items-center">
              <Lock size={18} className="absolute left-4 text-slate-500 pointer-events-none" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-[48px] bg-[rgba(11,27,66,0.6)] border border-slate-700 rounded-xl pl-11 pr-11 text-white text-[14px] placeholder-slate-500 outline-none focus:border-[#1788FF] focus:shadow-[0_0_10px_rgba(23,136,255,0.2)] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs mt-1">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input type="checkbox" className="rounded bg-slate-800 border-slate-700 text-[#1788FF] focus:ring-0 cursor-pointer" defaultChecked />
              <span className="text-slate-300 group-hover:text-white transition-colors">Remember credentials</span>
            </label>
            <a href="#" onClick={handleForgotPassword} className="text-[#1788FF] hover:text-blue-400 font-medium transition-colors">
              Forgot password?
            </a>
          </div>

          {/* Quick Fill Testing Credentials */}
          <div className="p-2.5 rounded-xl bg-[#030E26]/80 border border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span className="text-[11px]">Demo account:</span>
            <button
              type="button"
              onClick={() => handleQuickFill('shadab@aeronex.com', 'password123')}
              className="text-[#1788FF] hover:underline font-mono text-[11px] cursor-pointer"
            >
              shadab@aeronex.com / password123
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-[48px] mt-1 rounded-xl bg-gradient-to-r from-[#1788FF] to-[#4E55F5] text-white font-semibold text-[15px] shadow-[0_4px_20px_rgba(23,136,255,0.3)] hover:shadow-[0_6px_25px_rgba(23,136,255,0.4)] hover:-translate-y-[1px] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <span>Sign In to AeroNex →</span>
            )}
          </button>
        </form>
      ) : (
        /* TAB 2: CREATE ACCOUNT (SIGN UP) */
        <form onSubmit={handleSignUp} className="flex flex-col gap-3.5">
          <div className="flex flex-col gap-1">
            <label className="text-slate-300 text-[13px] font-medium flex items-center gap-1.5">
              <User size={14} className="text-[#1788FF]" /> Full Name
            </label>
            <div className="relative flex items-center">
              <User size={18} className="absolute left-4 text-slate-500 pointer-events-none" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full h-[44px] bg-[rgba(11,27,66,0.6)] border border-slate-700 rounded-xl pl-11 pr-4 text-white text-[14px] placeholder-slate-500 outline-none focus:border-[#1788FF] transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-slate-300 text-[13px] font-medium flex items-center gap-1.5">
              <Mail size={14} className="text-[#1788FF]" /> Email Address
            </label>
            <div className="relative flex items-center">
              <Mail size={18} className="absolute left-4 text-slate-500 pointer-events-none" />
              <input
                type="email"
                required
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                placeholder="rahul@example.com"
                className="w-full h-[44px] bg-[rgba(11,27,66,0.6)] border border-slate-700 rounded-xl pl-11 pr-4 text-white text-[14px] placeholder-slate-500 outline-none focus:border-[#1788FF] transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-slate-300 text-[13px] font-medium flex items-center gap-1.5">
              <Briefcase size={14} className="text-[#1788FF]" /> Primary Usage Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full h-[44px] bg-[#0A1838] border border-slate-700 rounded-xl px-3.5 text-white text-[13px] outline-none focus:border-[#1788FF]"
            >
              <option value="Passenger">Passenger / Frequent Flyer</option>
              <option value="Researcher">Aviation Analyst / Researcher</option>
              <option value="Admin">Flight Operations / Corporate Admin</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-slate-300 text-[13px] font-medium flex items-center gap-1.5">
                <Lock size={14} className="text-[#1788FF]" /> Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                placeholder="Min 6 chars"
                className="w-full h-[44px] bg-[rgba(11,27,66,0.6)] border border-slate-700 rounded-xl px-3.5 text-white text-[14px] placeholder-slate-500 outline-none focus:border-[#1788FF]"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-slate-300 text-[13px] font-medium flex items-center gap-1.5">
                <Lock size={14} className="text-[#1788FF]" /> Confirm
              </label>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full h-[44px] bg-[rgba(11,27,66,0.6)] border border-slate-700 rounded-xl px-3.5 text-white text-[14px] placeholder-slate-500 outline-none focus:border-[#1788FF]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-[48px] mt-2 rounded-xl bg-gradient-to-r from-[#1788FF] to-[#4E55F5] text-white font-semibold text-[15px] shadow-[0_4px_20px_rgba(23,136,255,0.3)] hover:shadow-[0_6px_25px_rgba(23,136,255,0.4)] hover:-translate-y-[1px] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <span>Create Account & Enter →</span>
            )}
          </button>
        </form>
      )}

      {/* Social Single Sign-On */}
      <div className="mt-6 flex items-center gap-4">
        <div className="flex-1 h-px bg-slate-800" />
        <span className="text-slate-500 text-[11px] font-semibold tracking-wider uppercase">Or Continue With</span>
        <div className="flex-1 h-px bg-slate-800" />
      </div>

      <SocialLogin />
    </div>
  );
}
