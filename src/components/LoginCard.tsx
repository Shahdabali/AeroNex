import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, Lock, Eye, EyeOff, User, 
  CheckCircle2, AlertCircle, ArrowRight, Sparkles,
  ChevronDown, ChevronUp, FlaskConical, BarChart3, Shield
} from 'lucide-react';
import { AeroNexLogo } from './AeroNexLogo';
import { authService } from '../services/authService';
import { useAppContext } from '../context/AppProvider';

export function LoginCard() {
  const navigate = useNavigate();
  const { login } = useAppContext();
  
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [showDemoAccess, setShowDemoAccess] = useState(false);
  
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
      setSuccess("Authentication successful! Welcome to AeroNex.");
      setTimeout(() => {
        navigate('/dashboard');
      }, 300);
    } catch (err: any) {
      setError(err.message || "Failed to sign in. Please check your credentials.");
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
      }, 300);
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

  const handleSocial = async (provider: 'Google' | 'Apple') => {
    setIsLoading(true);
    try {
      const res = (await authService.socialLogin(provider as any)) as any;
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
    <motion.div 
      initial={{ opacity: 0, y: 25, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="login-card-container w-full max-w-[460px] rounded-[32px] bg-[#061126]/90 backdrop-blur-2xl border border-blue-500/25 p-7 sm:p-9 shadow-[0_25px_80px_rgba(0,0,0,0.75)] flex flex-col justify-between relative transition-all"
    >
      
      {/* 1. Official AERONEX Logo (Centered Header) */}
      <div className="flex justify-center mb-4">
        <AeroNexLogo size={38} showTagline={true} className="justify-center" />
      </div>

      {/* 2. Welcome Headline & Subtitle matching reference image */}
      <div className="text-center mb-5">
        <h2 className="text-[26px] font-bold text-white tracking-tight">
          {isSignUpMode ? 'Create Account' : 'Welcome Back'}
        </h2>
        <p className="text-slate-400 text-xs mt-1.5 max-w-xs mx-auto leading-relaxed">
          {isSignUpMode 
            ? 'Join AeroNex and explore real-time airfare intelligence.' 
            : 'Sign in to your account and continue your journey with us.'
          }
        </p>
      </div>

      {/* 3. Segmented Tab Switcher (Rounded Pill Track matching screenshot) */}
      <div className="w-full bg-[#03091B]/90 border border-slate-700/80 rounded-full p-1 flex items-center mb-5 login-tab-container">
        <button
          type="button"
          onClick={() => { setIsSignUpMode(false); setError(null); setSuccess(null); }}
          className={`flex-1 py-2 text-xs font-semibold rounded-full transition-all cursor-pointer text-center ${
            !isSignUpMode 
              ? 'bg-[#00A3FF] text-white shadow-[0_0_15px_rgba(0,163,255,0.4)] font-bold' 
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Sign In
        </button>

        <button
          type="button"
          onClick={() => { setIsSignUpMode(true); setError(null); setSuccess(null); }}
          className={`flex-1 py-2 text-xs font-semibold rounded-full transition-all cursor-pointer text-center ${
            isSignUpMode 
              ? 'bg-[#00A3FF] text-white shadow-[0_0_15px_rgba(0,163,255,0.4)] font-bold' 
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Create Account
        </button>
      </div>

      {/* Error & Success alerts */}
      <AnimatePresence mode="wait">
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -6 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -6 }}
            className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/40 text-red-400 text-xs flex items-center gap-2"
          >
            <AlertCircle size={15} className="shrink-0 text-red-400" />
            <span>{error}</span>
          </motion.div>
        )}

        {success && (
          <motion.div 
            initial={{ opacity: 0, y: -6 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -6 }}
            className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2"
          >
            <CheckCircle2 size={15} className="shrink-0 text-emerald-400" />
            <span>{success}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. SIGN IN FORM */}
      {!isSignUpMode ? (
        <form onSubmit={handleSignIn} className="flex flex-col gap-3.5">
          {/* Email field */}
          <div className="h-[46px] rounded-xl bg-[#040C20]/90 border border-slate-700/80 flex items-center px-4 gap-3 focus-within:border-[#00A3FF] focus-within:ring-1 focus-within:ring-[#00A3FF] transition-all">
            <Mail size={17} className="text-slate-400 shrink-0" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="text-xs sm:text-sm text-white placeholder-slate-500 bg-transparent outline-none w-full"
            />
          </div>

          {/* Password field */}
          <div className="h-[46px] rounded-xl bg-[#040C20]/90 border border-slate-700/80 flex items-center px-4 gap-3 focus-within:border-[#00A3FF] focus-within:ring-1 focus-within:ring-[#00A3FF] transition-all">
            <Lock size={17} className="text-slate-400 shrink-0" />
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="text-xs sm:text-sm text-white placeholder-slate-500 bg-transparent outline-none w-full"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-slate-400 hover:text-slate-200 transition-colors cursor-pointer shrink-0"
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>

          {/* Remember me & Forgot password */}
          <div className="flex items-center justify-between text-xs mt-0.5">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded bg-[#03091B] border-slate-700 text-[#00A3FF] focus:ring-0 cursor-pointer accent-[#00A3FF]" 
              />
              <span className="text-slate-300 text-xs">Remember me</span>
            </label>
            <a 
              href="#" 
              onClick={handleForgotPassword}
              className="text-[#00A3FF] hover:underline font-medium text-xs"
            >
              Forgot password?
            </a>
          </div>

          {/* Main Sign In Button matching reference image */}
          <motion.button
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.985 }}
            type="submit"
            disabled={isLoading}
            className="w-full h-[48px] mt-1 rounded-full bg-gradient-to-r from-[#00A3FF] via-[#0088FF] to-[#0070F3] hover:shadow-[0_0_25px_rgba(0,163,255,0.45)] text-white font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <span className="flex items-center gap-2">
                Sign In
                <ArrowRight size={17} />
              </span>
            )}
          </motion.button>
        </form>
      ) : (
        /* 5. SIGN UP FORM */
        <form onSubmit={handleSignUp} className="flex flex-col gap-3">
          <div className="h-[44px] rounded-xl bg-[#040C20]/90 border border-slate-700/80 flex items-center px-4 gap-3 focus-within:border-[#00A3FF] focus-within:ring-1 focus-within:ring-[#00A3FF]">
            <User size={16} className="text-slate-400 shrink-0" />
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Full name"
              className="text-xs text-white placeholder-slate-500 bg-transparent outline-none w-full"
            />
          </div>

          <div className="h-[44px] rounded-xl bg-[#040C20]/90 border border-slate-700/80 flex items-center px-4 gap-3 focus-within:border-[#00A3FF] focus-within:ring-1 focus-within:ring-[#00A3FF]">
            <Mail size={16} className="text-slate-400 shrink-0" />
            <input
              type="email"
              required
              value={signupEmail}
              onChange={(e) => setSignupEmail(e.target.value)}
              placeholder="Email address"
              className="text-xs text-white placeholder-slate-500 bg-transparent outline-none w-full"
            />
          </div>

          <div className="h-[44px] rounded-xl bg-[#040C20]/90 border border-slate-700/80 flex items-center px-3 focus-within:border-[#00A3FF]">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="text-xs text-white bg-transparent outline-none w-full"
            >
              <option value="Passenger" className="bg-[#061126] text-white">Passenger / Traveler</option>
              <option value="Researcher" className="bg-[#061126] text-white">Aviation Analyst / Researcher</option>
              <option value="Admin" className="bg-[#061126] text-white">Operations Admin</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="h-[44px] rounded-xl bg-[#040C20]/90 border border-slate-700/80 flex items-center px-3.5 focus-within:border-[#00A3FF]">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                placeholder="Password (6+)"
                className="text-xs text-white placeholder-slate-500 bg-transparent outline-none w-full"
              />
            </div>
            <div className="h-[44px] rounded-xl bg-[#040C20]/90 border border-slate-700/80 flex items-center px-3.5 focus-within:border-[#00A3FF]">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm"
                className="text-xs text-white placeholder-slate-500 bg-transparent outline-none w-full"
              />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.985 }}
            type="submit"
            disabled={isLoading}
            className="w-full h-[46px] mt-1 rounded-full bg-gradient-to-r from-[#00A3FF] via-[#0088FF] to-[#0070F3] hover:shadow-[0_0_25px_rgba(0,163,255,0.4)] text-white font-bold text-xs tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <span>Create Account & Continue →</span>
            )}
          </motion.button>
        </form>
      )}

      {/* 6. OR Divider matching screenshot */}
      <div className="my-4 flex items-center gap-4">
        <div className="flex-1 h-px bg-slate-800" />
        <span className="text-slate-500 text-[10px] font-bold tracking-widest uppercase">
          OR
        </span>
        <div className="flex-1 h-px bg-slate-800" />
      </div>

      {/* 7. Social Buttons: Continue with Google & Continue with Apple */}
      <div className="grid grid-cols-2 gap-3">
        {/* Google */}
        <button
          type="button"
          onClick={() => handleSocial('Google')}
          className="h-[42px] rounded-xl bg-[#040C20]/90 hover:bg-[#08173A] border border-slate-700/80 hover:border-slate-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          <span className="truncate">Continue with Google</span>
        </button>

        {/* Apple */}
        <button
          type="button"
          onClick={() => handleSocial('Apple')}
          className="h-[42px] rounded-xl bg-[#040C20]/90 hover:bg-[#08173A] border border-slate-700/80 hover:border-slate-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
        >
          <svg className="w-4 h-4 fill-white shrink-0" viewBox="0 0 24 24">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.84c.62-.75 1.04-1.8 0.92-2.84-.9.04-1.99.6-2.64 1.35-.57.65-1.06 1.72-.92 2.74 1 .08 2.02-.5 2.64-1.25z"/>
          </svg>
          <span className="truncate">Continue with Apple</span>
        </button>
      </div>

      {/* 8. Legal terms note matching reference image */}
      <p className="text-center text-[10px] text-slate-400 mt-4 leading-normal">
        By continuing, you agree to our{' '}
        <a href="#" className="text-[#00A3FF] hover:underline">Terms of Service</a> and{' '}
        <a href="#" className="text-[#00A3FF] hover:underline">Privacy Policy</a>.
      </p>

      {/* 9. One-Click Instant Demo Credentials (Compact Accordion) */}
      <div className="mt-3 pt-2.5 border-t border-slate-800/80 text-left">
        <div 
          onClick={() => setShowDemoAccess(!showDemoAccess)}
          className="flex items-center justify-between cursor-pointer select-none py-1 text-slate-400 hover:text-slate-200"
        >
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-300">
            <FlaskConical size={13} className="text-cyan-400" />
            <span>One-Click Instant Demo</span>
            <Sparkles size={11} className="text-amber-400" />
          </div>
          {showDemoAccess ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </div>

        <AnimatePresence>
          {showDemoAccess && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-3 gap-2 mt-2 overflow-hidden"
            >
              <button
                type="button"
                onClick={() => handleDemoLogin('Passenger')}
                className="p-2 rounded-xl bg-[#040C20] hover:bg-blue-500/20 border border-slate-700/80 hover:border-blue-500/50 text-left transition-all cursor-pointer"
              >
                <div className="flex items-center gap-1 mb-0.5">
                  <User size={12} className="text-cyan-400" />
                  <span className="text-[10px] font-bold text-white block truncate">Passenger</span>
                </div>
                <span className="text-[9px] text-slate-400 block truncate">Traveler</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('Researcher')}
                className="p-2 rounded-xl bg-[#040C20] hover:bg-purple-500/20 border border-slate-700/80 hover:border-purple-500/50 text-left transition-all cursor-pointer"
              >
                <div className="flex items-center gap-1 mb-0.5">
                  <BarChart3 size={12} className="text-purple-400" />
                  <span className="text-[10px] font-bold text-white block truncate">Researcher</span>
                </div>
                <span className="text-[9px] text-slate-400 block truncate">Analyst</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('Admin')}
                className="p-2 rounded-xl bg-[#040C20] hover:bg-emerald-500/20 border border-slate-700/80 hover:border-emerald-500/50 text-left transition-all cursor-pointer"
              >
                <div className="flex items-center gap-1 mb-0.5">
                  <Shield size={12} className="text-emerald-400" />
                  <span className="text-[10px] font-bold text-white block truncate">Admin</span>
                </div>
                <span className="text-[9px] text-slate-400 block truncate">Operations</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </motion.div>
  );
}
