import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Mail, Lock, Eye, EyeOff, User, 
  CheckCircle2, AlertCircle, FlaskConical, 
  BarChart3, Shield, ArrowRight, ChevronUp, ChevronDown 
} from 'lucide-react';
import { AirFareXLogo } from './AirFareXLogo';
import { authService } from '../services/authService';
import { useAppContext } from '../context/AppProvider';

export function LoginCard() {
  const navigate = useNavigate();
  const { login } = useAppContext();
  
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [showDemoAccess, setShowDemoAccess] = useState(true);
  
  // Sign In Fields
  const [email, setEmail] = useState(() => {
    return localStorage.getItem('aeronex_remembered_email') || 'shadab@aeronex.com';
  });
  const [password, setPassword] = useState('password123');
  
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
      if (rememberMe) {
        localStorage.setItem('aeronex_remembered_email', email);
      } else {
        localStorage.removeItem('aeronex_remembered_email');
      }

      login(response.user, response.token);
      setSuccess("Authentication successful! Welcome to AirFareX.");
      setTimeout(() => {
        navigate('/dashboard');
      }, 350);
    } catch (err: any) {
      setError(err.message || "Failed to sign in. Please check your email and password.");
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
      setSuccess("Account successfully created! Entering AirFareX dashboard...");
      setTimeout(() => {
        navigate('/dashboard');
      }, 350);
    } catch (err: any) {
      setError(err.message || "Could not register account. Please check your details.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (demoRole: 'Passenger' | 'Researcher' | 'Admin') => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      let demoEmail = 'shadab@aeronex.com';
      let demoPass = 'password123';

      if (demoRole === 'Researcher') {
        demoEmail = 'analyst@aeronex.com';
        demoPass = 'analystpassword';
      } else if (demoRole === 'Admin') {
        demoEmail = 'admin@aeronex.com';
        demoPass = 'adminpassword';
      }

      const response = await authService.login(demoEmail, demoPass);
      login(response.user, response.token);
      setSuccess(`Signed in as ${demoRole} Demo! Redirecting...`);
      setTimeout(() => {
        navigate('/dashboard');
      }, 250);
    } catch {
      // Direct fallback
      const fallbackUser = {
        id: `demo_${demoRole.toLowerCase()}`,
        name: demoRole === 'Admin' ? 'Operations Admin' : demoRole === 'Researcher' ? 'AeroNex Analyst' : 'Shadab Ali',
        email: `${demoRole.toLowerCase()}@aeronex.com`,
        role: demoRole,
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop'
      };
      login(fallbackUser, `demo_jwt_${Date.now()}`);
      navigate('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocial = async (provider: 'Google' | 'Microsoft') => {
    setIsLoading(true);
    try {
      const res = (await authService.socialLogin(provider)) as any;
      login({
        id: `social_${provider.toLowerCase()}`,
        name: res.user?.name || `${provider} User`,
        email: res.user?.email || `user@${provider.toLowerCase()}.com`,
        role: 'Passenger',
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop'
      }, res.token);
      setSuccess(`Authenticated via ${provider}! Redirecting...`);
      setTimeout(() => {
        navigate('/dashboard');
      }, 300);
    } catch {
      setError(`Could not connect to ${provider}.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address, then click Forgot Password.");
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
    <div className="w-full max-w-[490px] rounded-[28px] bg-[#06112A]/85 backdrop-blur-2xl border border-slate-700/60 p-7 sm:p-9 shadow-[0_25px_70px_rgba(0,0,0,0.65)] flex flex-col justify-between relative transition-all">
      
      {/* 1. Card Top Brand */}
      <div className="flex justify-center mb-6">
        <AirFareXLogo size={36} showSubtitle={true} className="justify-center" />
      </div>

      {/* 2. Welcome Title */}
      <div className="mb-5 text-left">
        <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          {isSignUpMode ? 'Create Your Account ✈️' : 'Welcome Back 👋'}
        </h2>
        <p className="text-slate-400 text-xs mt-1">
          {isSignUpMode 
            ? 'Join AirFareX for live aviation price tracking across India' 
            : 'Sign in to AirFareX'
          }
        </p>
      </div>

      {/* Error & Success alerts */}
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/40 text-red-400 text-xs flex items-center gap-2 animate-in fade-in">
          <AlertCircle size={15} className="shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 size={15} className="shrink-0 text-emerald-400" />
          <span>{success}</span>
        </div>
      )}

      {/* 3. SIGN IN FORM */}
      {!isSignUpMode ? (
        <form onSubmit={handleSignIn} className="flex flex-col gap-3.5">
          {/* Email field */}
          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-slate-300 text-xs font-semibold flex items-center gap-1.5">
              <Mail size={13} className="text-[#38BDF8]" /> Email Address
            </label>
            <div className="relative flex items-center">
              <Mail size={16} className="absolute left-3.5 text-slate-500 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full h-[46px] bg-[#0A1838]/70 border border-slate-700/80 rounded-xl pl-10 pr-4 text-white text-xs placeholder-slate-500 outline-none focus:border-[#1788FF] focus:ring-1 focus:ring-[#1788FF] transition-all"
              />
            </div>
          </div>

          {/* Password field */}
          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-slate-300 text-xs font-semibold flex items-center gap-1.5">
              <Lock size={13} className="text-[#38BDF8]" /> Password
            </label>
            <div className="relative flex items-center">
              <Lock size={16} className="absolute left-3.5 text-slate-500 pointer-events-none" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full h-[46px] bg-[#0A1838]/70 border border-slate-700/80 rounded-xl pl-10 pr-10 text-white text-xs placeholder-slate-500 outline-none focus:border-[#1788FF] focus:ring-1 focus:ring-[#1788FF] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Remember me & Forgot password */}
          <div className="flex items-center justify-between text-xs mt-0.5">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded bg-[#0A1838] border-slate-700 text-[#1788FF] focus:ring-0 cursor-pointer" 
              />
              <span className="text-slate-300 text-xs">Remember me</span>
            </label>
            <a 
              href="#" 
              onClick={handleForgotPassword}
              className="text-[#1788FF] hover:underline font-medium text-xs"
            >
              Forgot password?
            </a>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-[46px] mt-1 rounded-2xl bg-gradient-to-r from-[#1788FF] via-[#3B82F6] to-[#4E55F5] hover:shadow-[0_0_25px_rgba(23,136,255,0.4)] text-white font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <span className="flex items-center gap-1.5">Sign In <ArrowRight size={15} /></span>
            )}
          </button>
        </form>
      ) : (
        /* 4. SIGN UP FORM */
        <form onSubmit={handleSignUp} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1 text-left">
            <label className="text-slate-300 text-xs font-medium">Full Name</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              className="w-full h-[42px] bg-[#0A1838]/70 border border-slate-700/80 rounded-xl px-3.5 text-white text-xs placeholder-slate-500 outline-none focus:border-[#1788FF]"
            />
          </div>

          <div className="flex flex-col gap-1 text-left">
            <label className="text-slate-300 text-xs font-medium">Email Address</label>
            <input
              type="email"
              required
              value={signupEmail}
              onChange={(e) => setSignupEmail(e.target.value)}
              placeholder="e.g. rahul@example.com"
              className="w-full h-[42px] bg-[#0A1838]/70 border border-slate-700/80 rounded-xl px-3.5 text-white text-xs placeholder-slate-500 outline-none focus:border-[#1788FF]"
            />
          </div>

          <div className="flex flex-col gap-1 text-left">
            <label className="text-slate-300 text-xs font-medium">Account Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full h-[42px] bg-[#0A1838] border border-slate-700/80 rounded-xl px-3 text-white text-xs outline-none focus:border-[#1788FF]"
            >
              <option value="Passenger">Passenger / Traveler</option>
              <option value="Researcher">Aviation Analyst / Researcher</option>
              <option value="Admin">Operations Admin</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2 text-left">
            <div>
              <label className="text-slate-300 text-xs font-medium block mb-1">Password</label>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                placeholder="Min 6 chars"
                className="w-full h-[42px] bg-[#0A1838]/70 border border-slate-700/80 rounded-xl px-3 text-white text-xs placeholder-slate-500 outline-none focus:border-[#1788FF]"
              />
            </div>
            <div>
              <label className="text-slate-300 text-xs font-medium block mb-1">Confirm</label>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-type password"
                className="w-full h-[42px] bg-[#0A1838]/70 border border-slate-700/80 rounded-xl px-3 text-white text-xs placeholder-slate-500 outline-none focus:border-[#1788FF]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-[44px] mt-1.5 rounded-2xl bg-gradient-to-r from-[#1788FF] via-[#3B82F6] to-[#4E55F5] hover:shadow-[0_0_25px_rgba(23,136,255,0.4)] text-white font-bold text-xs tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <span>Create Account & Sign In →</span>
            )}
          </button>
        </form>
      )}

      {/* 5. OR CONTINUE WITH */}
      <div className="my-4 flex items-center gap-3">
        <div className="flex-1 h-px bg-slate-800" />
        <span className="text-slate-500 text-[10px] font-bold tracking-widest uppercase">
          OR CONTINUE WITH
        </span>
        <div className="flex-1 h-px bg-slate-800" />
      </div>

      {/* 6. Social Logins */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => handleSocial('Google')}
          className="flex-1 h-[42px] rounded-xl bg-[#081533]/80 hover:bg-[#0C1F4A] border border-slate-700 hover:border-slate-500 text-white text-xs font-semibold flex items-center justify-center gap-2.5 transition-all cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Google
        </button>

        <button
          type="button"
          onClick={() => handleSocial('Microsoft')}
          className="flex-1 h-[42px] rounded-xl bg-[#081533]/80 hover:bg-[#0C1F4A] border border-slate-700 hover:border-slate-500 text-white text-xs font-semibold flex items-center justify-center gap-2.5 transition-all cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 21 21">
            <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
            <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
            <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
            <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
          </svg>
          Microsoft
        </button>
      </div>

      {/* 7. Toggle between Sign In & Sign Up */}
      <div className="mt-3.5 text-center text-xs text-slate-400">
        {isSignUpMode ? (
          <>
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => { setIsSignUpMode(false); setError(null); setSuccess(null); }}
              className="text-[#1788FF] hover:underline font-semibold cursor-pointer"
            >
              Sign In
            </button>
          </>
        ) : (
          <>
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => { setIsSignUpMode(true); setError(null); setSuccess(null); }}
              className="text-[#1788FF] hover:underline font-semibold cursor-pointer"
            >
              Create Account
            </button>
          </>
        )}
      </div>

      {/* 8. Demo Access Accordion / Box (Matching Screenshot) */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 text-left">
        <div className="bg-[#040D24]/90 border border-blue-500/25 rounded-2xl p-3.5 shadow-inner">
          <div 
            onClick={() => setShowDemoAccess(!showDemoAccess)}
            className="flex items-center justify-between cursor-pointer select-none"
          >
            <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
              <FlaskConical size={14} className="text-cyan-400" />
              <span>Demo Access</span>
            </div>
            {showDemoAccess ? (
              <ChevronUp size={14} className="text-slate-400" />
            ) : (
              <ChevronDown size={14} className="text-slate-400" />
            )}
          </div>

          {showDemoAccess && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3 animate-in fade-in">
              {/* Passenger Demo */}
              <button
                type="button"
                onClick={() => handleDemoLogin('Passenger')}
                className="p-2.5 rounded-xl bg-[#091738]/80 hover:bg-blue-500/20 border border-slate-700/80 hover:border-blue-500/50 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <User size={13} className="text-cyan-400 group-hover:scale-110 transition-transform" />
                  <span className="text-[11px] font-bold text-white block truncate">Passenger Demo</span>
                </div>
                <span className="text-[9px] text-slate-400 block truncate">Explore as a traveler</span>
              </button>

              {/* Researcher Demo */}
              <button
                type="button"
                onClick={() => handleDemoLogin('Researcher')}
                className="p-2.5 rounded-xl bg-[#091738]/80 hover:bg-purple-500/20 border border-slate-700/80 hover:border-purple-500/50 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <BarChart3 size={13} className="text-purple-400 group-hover:scale-110 transition-transform" />
                  <span className="text-[11px] font-bold text-white block truncate">Researcher Demo</span>
                </div>
                <span className="text-[9px] text-slate-400 block truncate">View analytics dashboard</span>
              </button>

              {/* Admin Demo */}
              <button
                type="button"
                onClick={() => handleDemoLogin('Admin')}
                className="p-2.5 rounded-xl bg-[#091738]/80 hover:bg-emerald-500/20 border border-slate-700/80 hover:border-emerald-500/50 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Shield size={13} className="text-emerald-400 group-hover:scale-110 transition-transform" />
                  <span className="text-[11px] font-bold text-white block truncate">Admin Demo</span>
                </div>
                <span className="text-[9px] text-slate-400 block truncate">Manage system</span>
              </button>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
