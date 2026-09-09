import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, Lock, Eye, EyeOff, User, 
  CheckCircle2, AlertCircle, FlaskConical, 
  BarChart3, Shield, ChevronUp, ChevronDown, Sparkles,
  Plane
} from 'lucide-react';
import { AeroNexLogo } from './AeroNexLogo';
import { authService } from '../services/authService';
import { useAppContext } from '../context/AppProvider';

export function LoginCard() {
  const navigate = useNavigate();
  const { login, t } = useAppContext();
  
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
      setSuccess("Authentication successful! Welcome to AeroNex.");
      setTimeout(() => {
        navigate('/dashboard');
      }, 350);
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
    <div className="relative w-full max-w-[480px]">
      {/* Glowing Outer Gradient Accent Border */}
      <div className="absolute -inset-[1.5px] rounded-[30px] bg-gradient-to-br from-cyan-500/40 via-[#1788FF]/30 to-purple-600/40 blur-[2px] opacity-75 pointer-events-none" />

      {/* Main Glassmorphic Card */}
      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="login-card-container w-full rounded-[28px] bg-[#06112A]/85 backdrop-blur-2xl border border-slate-700/60 p-6 sm:p-8 shadow-[0_25px_70px_rgba(0,0,0,0.65)] flex flex-col justify-between relative transition-all"
      >
        
        {/* 1. Official AERONEX Logo Header */}
        <div className="flex justify-center mb-5">
          <AeroNexLogo size={44} showTagline={true} className="justify-center" />
        </div>

        {/* 2. Interactive Animated Mode Switcher Pill */}
        <div className="flex bg-[#030C22]/80 p-1 rounded-2xl border border-slate-700/60 mb-5 relative login-tab-container">
          <button
            type="button"
            onClick={() => { setIsSignUpMode(false); setError(null); setSuccess(null); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl relative z-10 transition-colors cursor-pointer text-center ${
              !isSignUpMode ? 'text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {!isSignUpMode && (
              <motion.div
                layoutId="activeLoginTab"
                className="absolute inset-0 bg-gradient-to-r from-[#1788FF] to-[#4E55F5] rounded-xl shadow-md -z-10"
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              />
            )}
            {t.signInTab}
          </button>

          <button
            type="button"
            onClick={() => { setIsSignUpMode(true); setError(null); setSuccess(null); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl relative z-10 transition-colors cursor-pointer text-center ${
              isSignUpMode ? 'text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {isSignUpMode && (
              <motion.div
                layoutId="activeLoginTab"
                className="absolute inset-0 bg-gradient-to-r from-[#1788FF] to-[#4E55F5] rounded-xl shadow-md -z-10"
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              />
            )}
            {t.createAccountTab}
          </button>
        </div>

        {/* 3. Welcome Headline */}
        <div className="mb-4 text-left">
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            {isSignUpMode ? `${t.createYourAccount} ✈️` : `${t.welcomeBack} 👋`}
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            {isSignUpMode 
              ? t.signUpSubtitle
              : t.signInSubtitle
            }
          </p>
        </div>

        {/* Error & Success alerts */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -6 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -6 }}
              className="mb-3.5 p-3 rounded-xl bg-red-500/10 border border-red-500/40 text-red-400 text-xs flex items-center gap-2"
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
              className="mb-3.5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2"
            >
              <CheckCircle2 size={15} className="shrink-0 text-emerald-400" />
              <span>{success}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 4. SIGN IN FORM */}
        {!isSignUpMode ? (
          <form onSubmit={handleSignIn} className="flex flex-col gap-3">
            {/* Email field */}
            <div className="flex flex-col gap-1 text-left">
              <label className="text-slate-300 text-xs font-semibold flex items-center gap-1.5">
                <Mail size={13} className="text-[#38BDF8]" /> {t.emailLabel}
              </label>
              <div className="relative flex items-center">
                <Mail size={15} className="absolute left-3.5 text-slate-500 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.emailPlaceholder}
                  className="w-full h-[44px] bg-[#0A1838]/70 border border-slate-700/80 rounded-xl pl-10 pr-4 text-white text-xs placeholder-slate-500 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all"
                />
              </div>
            </div>

            {/* Password field */}
            <div className="flex flex-col gap-1 text-left">
              <label className="text-slate-300 text-xs font-semibold flex items-center gap-1.5">
                <Lock size={13} className="text-[#38BDF8]" /> {t.passwordLabel}
              </label>
              <div className="relative flex items-center">
                <Lock size={15} className="absolute left-3.5 text-slate-500 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.passwordPlaceholder}
                  className="w-full h-[44px] bg-[#0A1838]/70 border border-slate-700/80 rounded-xl pl-10 pr-10 text-white text-xs placeholder-slate-500 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
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
                  className="w-3.5 h-3.5 rounded bg-[#0A1838] border-slate-700 text-[#1788FF] focus:ring-0 cursor-pointer" 
                />
                <span className="text-slate-300 text-xs">{t.rememberMe}</span>
              </label>
              <a 
                href="#" 
                onClick={handleForgotPassword}
                className="text-[#1788FF] hover:underline font-medium text-xs"
              >
                {t.forgotPassword}
              </a>
            </div>

            {/* Submit button */}
            <motion.button
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full h-[44px] mt-1 rounded-xl bg-gradient-to-r from-[#1788FF] via-[#3B82F6] to-[#4E55F5] hover:shadow-[0_0_25px_rgba(23,136,255,0.45)] text-white font-bold text-xs tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg group"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <span className="flex items-center gap-2">
                  {t.signInBtn}
                  <Plane size={14} className="transform rotate-45 group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform" />
                </span>
              )}
            </motion.button>
          </form>
        ) : (
          /* 5. SIGN UP FORM */
          <form onSubmit={handleSignUp} className="flex flex-col gap-2.5">
            <div className="flex flex-col gap-1 text-left">
              <label className="text-slate-300 text-xs font-semibold flex items-center gap-1.5">
                <User size={13} className="text-[#38BDF8]" /> {t.fullName}
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full h-[40px] bg-[#0A1838]/70 border border-slate-700/80 rounded-xl px-3.5 text-white text-xs placeholder-slate-500 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
              />
            </div>

            <div className="flex flex-col gap-1 text-left">
              <label className="text-slate-300 text-xs font-semibold flex items-center gap-1.5">
                <Mail size={13} className="text-[#38BDF8]" /> {t.emailLabel}
              </label>
              <input
                type="email"
                required
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                placeholder="e.g. rahul@example.com"
                className="w-full h-[40px] bg-[#0A1838]/70 border border-slate-700/80 rounded-xl px-3.5 text-white text-xs placeholder-slate-500 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
              />
            </div>

            <div className="flex flex-col gap-1 text-left">
              <label className="text-slate-300 text-xs font-semibold">{t.accountRoleLabel}</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full h-[40px] bg-[#0A1838] border border-slate-700/80 rounded-xl px-3 text-white text-xs outline-none focus:border-cyan-400"
              >
                <option value="Passenger">{t.rolePassenger}</option>
                <option value="Researcher">{t.roleResearcher}</option>
                <option value="Admin">{t.roleAdmin}</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2 text-left">
              <div>
                <label className="text-slate-300 text-xs font-semibold block mb-1">{t.passwordLabel}</label>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  placeholder="Min 6 chars"
                  className="w-full h-[40px] bg-[#0A1838]/70 border border-slate-700/80 rounded-xl px-3 text-white text-xs placeholder-slate-500 outline-none focus:border-cyan-400"
                />
              </div>
              <div>
                <label className="text-slate-300 text-xs font-semibold block mb-1">{t.confirmPasswordLabel}</label>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t.confirmPasswordPlaceholder}
                  className="w-full h-[40px] bg-[#0A1838]/70 border border-slate-700/80 rounded-xl px-3 text-white text-xs placeholder-slate-500 outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full h-[42px] mt-1 rounded-xl bg-gradient-to-r from-[#1788FF] via-[#3B82F6] to-[#4E55F5] hover:shadow-[0_0_25px_rgba(23,136,255,0.4)] text-white font-bold text-xs tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <span>{t.signUpBtn} →</span>
              )}
            </motion.button>
          </form>
        )}

        {/* 6. OR CONTINUE WITH */}
        <div className="my-3.5 flex items-center gap-3">
          <div className="flex-1 h-px bg-slate-800" />
          <span className="text-slate-500 text-[9px] font-extrabold tracking-widest uppercase">
            {t.orContinueWith}
          </span>
          <div className="flex-1 h-px bg-slate-800" />
        </div>

        {/* 7. Social Logins */}
        <div className="flex gap-2.5">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => handleSocial('Google')}
            className="flex-1 h-[40px] rounded-xl bg-[#081533]/80 hover:bg-[#0C1F4A] border border-slate-700 hover:border-slate-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => handleSocial('Microsoft')}
            className="flex-1 h-[40px] rounded-xl bg-[#081533]/80 hover:bg-[#0C1F4A] border border-slate-700 hover:border-slate-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 21 21">
              <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
              <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
              <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
              <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
            </svg>
            Microsoft
          </motion.button>
        </div>

        {/* 8. Demo Access Accordion / Box */}
        <div className="mt-3.5 pt-3 border-t border-slate-800/80 text-left">
          <div className="login-demo-box bg-[#040D24]/90 border border-blue-500/25 rounded-2xl p-3 shadow-inner">
            <div 
              onClick={() => setShowDemoAccess(!showDemoAccess)}
              className="flex items-center justify-between cursor-pointer select-none"
            >
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                <FlaskConical size={14} className="text-cyan-400" />
                <span>{t.demoAccessTitle}</span>
                <Sparkles size={11} className="text-amber-400 animate-pulse" />
              </div>
              {showDemoAccess ? (
                <ChevronUp size={14} className="text-slate-400" />
              ) : (
                <ChevronDown size={14} className="text-slate-400" />
              )}
            </div>

            <AnimatePresence>
              {showDemoAccess && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2.5 overflow-hidden"
                >
                  {/* Passenger Demo */}
                  <motion.button
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    type="button"
                    onClick={() => handleDemoLogin('Passenger')}
                    className="login-demo-btn p-2 rounded-xl bg-[#091738]/80 hover:bg-blue-500/20 border border-slate-700/80 hover:border-blue-500/50 text-left transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <User size={12} className="text-cyan-400 group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] font-bold text-white block truncate">{t.demoPassenger}</span>
                    </div>
                    <span className="text-[9px] text-slate-400 block truncate">{t.demoPassengerDesc}</span>
                  </motion.button>

                  {/* Researcher Demo */}
                  <motion.button
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    type="button"
                    onClick={() => handleDemoLogin('Researcher')}
                    className="login-demo-btn p-2 rounded-xl bg-[#091738]/80 hover:bg-purple-500/20 border border-slate-700/80 hover:border-purple-500/50 text-left transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <BarChart3 size={12} className="text-purple-400 group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] font-bold text-white block truncate">{t.demoResearcher}</span>
                    </div>
                    <span className="text-[9px] text-slate-400 block truncate">{t.demoResearcherDesc}</span>
                  </motion.button>

                  {/* Admin Demo */}
                  <motion.button
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    type="button"
                    onClick={() => handleDemoLogin('Admin')}
                    className="login-demo-btn p-2 rounded-xl bg-[#091738]/80 hover:bg-emerald-500/20 border border-slate-700/80 hover:border-emerald-500/50 text-left transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <Shield size={12} className="text-emerald-400 group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] font-bold text-white block truncate">{t.demoAdmin}</span>
                    </div>
                    <span className="text-[9px] text-slate-400 block truncate">{t.demoAdminDesc}</span>
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </motion.div>
    </div>
  );
}
