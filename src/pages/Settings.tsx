// @ts-nocheck
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { AeroNexLogo } from '../components/AeroNexLogo';
import { usePageTitle } from '../hooks/usePageTitle';
import { useAppContext } from '../context/AppProvider';
import { api, API_BASE_URL } from '../services/api';
import { FAQS } from '../data/faqs';
import type { Language } from '../i18n/translations';
import {
  Settings as SettingsIcon, User, Sliders, Bell, Shield, Puzzle, Palette,
  KeyRound, HelpCircle, Info, ChevronRight, Camera, BadgeCheck,
  Globe, Calendar, Monitor, Moon, Sun,
  Download, Trash2, Lock, CreditCard, LogOut, MessageSquare,
  Code2, Mail, Check, Database, Plane, FileQuestion,
  Headphones, Package, Tag, ChevronDown, Megaphone, FileText,
  X, Copy, RefreshCw, Star, AlertTriangle, Eye, EyeOff, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/* ═══════════════════════════════════════════════════════════════
   Reusable: Toggle Switch
   ═══════════════════════════════════════════════════════════════ */
function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-all duration-200 ease-in-out focus:outline-none ${
        checked ? 'bg-cyan-500 shadow-[0_0_12px_rgba(0,229,255,0.4)]' : 'bg-[#1C1F2E]'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Reusable Modal Wrapper with Framer Motion Spring Physics
   ═══════════════════════════════════════════════════════════════ */
function ModalWrapper({ isOpen, onClose, title, subtitle, children, maxWidth = 'max-w-lg' }: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: string;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/85 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 15 }}
            transition={{ type: 'spring', damping: 26, stiffness: 360 }}
            className={`relative w-full ${maxWidth} bg-[#0E1017] border border-white/[0.12] rounded-2xl shadow-[0_25px_70px_rgba(0,0,0,0.95)] overflow-hidden z-10`}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-[#12141C]/90">
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">{title}</h3>
                {subtitle && <p className="text-xs text-zinc-400 mt-0.5">{subtitle}</p>}
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6 max-h-[80vh] overflow-y-auto">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Main Settings Page
   ═══════════════════════════════════════════════════════════════ */
export function Settings() {
  usePageTitle('Settings');
  const navigate = useNavigate();
  const {
    user,
    logout,
    updateUser,
    theme,
    setTheme,
    accentColor,
    setAccentColor,
    fontSize,
    setFontSize,
    language,
    setLanguage,
    currency,
    setCurrency,
    t
  } = useAppContext();

  const isLight = theme === 'light';
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ─── Tab state ─── */
  type Tab = 'profile' | 'integrations' | 'data-privacy' | 'account' | 'help' | 'app-info';
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  /* ─── Section refs for smooth scrolling ─── */
  const sectionRefs: Record<Tab, React.RefObject<HTMLDivElement | null>> = {
    profile: useRef<HTMLDivElement>(null),
    integrations: useRef<HTMLDivElement>(null),
    'data-privacy': useRef<HTMLDivElement>(null),
    account: useRef<HTMLDivElement>(null),
    help: useRef<HTMLDivElement>(null),
    'app-info': useRef<HTMLDivElement>(null),
  };

  const scrollToSection = (tab: Tab) => {
    setActiveTab(tab);
    sectionRefs[tab]?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  /* ─── Profile state ─── */
  const [fullName, setFullName] = useState(user?.name || '');
  const [email] = useState(user?.email || '');
  const [organization, setOrganization] = useState(user?.organization || 'AeroNex Platform User');
  const [phone, setPhone] = useState(user?.phone || '98765 43210');
  const [bio, setBio] = useState(user?.bio || 'Exploring data-driven insights to make travel more accessible and affordable.');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  /* ─── Travel Preferences ─── */
  const [departureCity, setDepartureCity] = useState('DEL');
  const [destinationCity, setDestinationCity] = useState('BOM');
  const [travelClass, setTravelClass] = useState('Economy');
  const [dateFormat, setDateFormat] = useState('DD MMM YYYY (10 Sep 2026)');
  const [showAltAirports, setShowAltAirports] = useState(true);

  /* ─── Notifications ─── */
  const [priceDropAlerts, setPriceDropAlerts] = useState(true);
  const [routeUpdates, setRouteUpdates] = useState(true);
  const [travelDeals, setTravelDeals] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(true);
  const [productUpdates, setProductUpdates] = useState(false);
  const [marketingNotifs, setMarketingNotifs] = useState(false);

  /* ─── Integrations state ─── */
  const [integrations, setIntegrations] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('aeronex_integrations');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      google: false,
      email: false,
      apiAccess: true,
    };
  });
  const [apiKey, setApiKey] = useState(() => {
    return localStorage.getItem('aeronex_api_key') || 'aeronex_live_sk_948f2c1b8e47a6d3f0';
  });
  const [copiedKey, setCopiedKey] = useState(false);

  /* ─── Modals State ─── */
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassText, setShowPassText] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const [showDataUsageModal, setShowDataUsageModal] = useState(false);
  const [telemetryEnabled, setTelemetryEnabled] = useState(true);
  const [fareAlertCookies, setFareAlertCookies] = useState(true);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showFaqsModal, setShowFaqsModal] = useState(false);
  const [faqSearch, setFaqSearch] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(1);

  const [showSupportModal, setShowSupportModal] = useState(false);
  const [supportSubject, setSupportSubject] = useState('');
  const [supportCategory, setSupportCategory] = useState('Data Inquiry');
  const [supportMessage, setSupportMessage] = useState('');
  const [supportSubmitted, setSupportSubmitted] = useState(false);
  const [isSubmittingSupport, setIsSubmittingSupport] = useState(false);
  const [supportReceipt, setSupportReceipt] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackCategory, setFeedbackCategory] = useState('Platform UX');
  const [feedbackComments, setFeedbackComments] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  /* ─── Legal & App Info Modals ─── */
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);

  /* ─── Feedback Toast ─── */
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  /* ─── Load initial server profile ─── */
  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await api.getUserProfile();
        if (data?.profile) {
          if (data.profile.name) setFullName(data.profile.name);
          if (data.profile.organization) setOrganization(data.profile.organization);
          if (data.profile.phone) setPhone(data.profile.phone);
          if (data.profile.bio) setBio(data.profile.bio);
          if (data.profile.avatarUrl) setAvatarUrl(data.profile.avatarUrl);
        }
        if (data?.preferences) {
          if (data.preferences.departureCity) setDepartureCity(data.preferences.departureCity);
          if (data.preferences.destinationCity) setDestinationCity(data.preferences.destinationCity);
          if (data.preferences.travelClass) setTravelClass(data.preferences.travelClass);
          if (data.preferences.dateFormat) setDateFormat(data.preferences.dateFormat);
          if (typeof data.preferences.showAltAirports === 'boolean') setShowAltAirports(data.preferences.showAltAirports);
        }
        if (data?.notifications) {
          setPriceDropAlerts(!!data.notifications.priceDropAlerts);
          setRouteUpdates(!!data.notifications.routeUpdates);
          setTravelDeals(!!data.notifications.travelDeals);
          setWeeklyReports(!!data.notifications.weeklyReports);
          setProductUpdates(!!data.notifications.productUpdates);
          setMarketingNotifs(!!data.notifications.marketingNotifs);
        }
        if (data?.integrations) {
          setIntegrations(prev => {
            const merged = {
              google: typeof data.integrations.google === 'boolean' ? data.integrations.google : prev.google,
              email: typeof data.integrations.email === 'boolean' ? data.integrations.email : prev.email,
              apiAccess: typeof data.integrations.apiAccess === 'boolean' ? data.integrations.apiAccess : prev.apiAccess,
            };
            localStorage.setItem('aeronex_integrations', JSON.stringify(merged));
            return merged;
          });
          if (data.integrations.apiKey) setApiKey(data.integrations.apiKey);
        }
      } catch {}
    }
    loadProfile();
  }, []);

  /* ─── Handlers ─── */

  // 1. Avatar Upload
  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1_500_000) {
      triggerToast('Image must be smaller than 1.5 MB.');
      return;
    }
    if (!/^image\/(png|jpe?g|webp|gif)$/.test(file.type)) {
      triggerToast('Please choose a PNG, JPEG, WebP or GIF image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setAvatarUrl(dataUrl);
        updateUser({ avatarUrl: dataUrl });
        try {
          await api.uploadAvatar(dataUrl, email);
          triggerToast(user?.isGuest ? 'Avatar updated on this device.' : 'Avatar photo updated!');
        } catch (err: any) {
          triggerToast(err?.message ? `Avatar could not be saved: ${err.message}` : 'Avatar could not be saved. Please try again.');
        }
      }
    };
    reader.readAsDataURL(file);
  };

  // 2. Profile Save
  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    try {
      const payload = {
        email,
        name: fullName,
        organization,
        phone,
        bio,
        avatarUrl,
      };
      await api.updateUserProfile(payload);
      updateUser(payload);
      triggerToast(t.savedSuccess || 'Profile information saved successfully!');
    } catch (err: any) {
      triggerToast(err.message || 'Error saving profile.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // 3. Travel Preferences Update
  const handlePreferenceChange = async (key: string, value: any) => {
    const updated = {
      departureCity: key === 'departureCity' ? value : departureCity,
      destinationCity: key === 'destinationCity' ? value : destinationCity,
      travelClass: key === 'travelClass' ? value : travelClass,
      currency,
      language,
      dateFormat: key === 'dateFormat' ? value : dateFormat,
      showAltAirports: key === 'showAltAirports' ? value : showAltAirports,
    };
    if (key === 'departureCity') setDepartureCity(value);
    if (key === 'destinationCity') setDestinationCity(value);
    if (key === 'travelClass') setTravelClass(value);
    if (key === 'dateFormat') setDateFormat(value);
    if (key === 'showAltAirports') setShowAltAirports(value);

    try {
      await api.updateUserPreferences(updated);
      triggerToast('Travel preferences saved');
    } catch (err: any) {
      triggerToast(err?.message || 'Could not save travel preferences.');
    }
  };

  // 4. Notifications Update
  const handleNotificationToggle = async (key: string, val: boolean) => {
    if (key === 'priceDropAlerts') setPriceDropAlerts(val);
    if (key === 'routeUpdates') setRouteUpdates(val);
    if (key === 'travelDeals') setTravelDeals(val);
    if (key === 'weeklyReports') setWeeklyReports(val);
    if (key === 'productUpdates') setProductUpdates(val);
    if (key === 'marketingNotifs') setMarketingNotifs(val);

    const updated = {
      priceDropAlerts: key === 'priceDropAlerts' ? val : priceDropAlerts,
      routeUpdates: key === 'routeUpdates' ? val : routeUpdates,
      travelDeals: key === 'travelDeals' ? val : travelDeals,
      weeklyReports: key === 'weeklyReports' ? val : weeklyReports,
      productUpdates: key === 'productUpdates' ? val : productUpdates,
      marketingNotifs: key === 'marketingNotifs' ? val : marketingNotifs,
    };

    try {
      await api.updateUserNotifications(updated);
    } catch (err: any) {
      // Roll the toggle back so the UI never shows a setting that was not saved.
      if (key === 'priceDropAlerts') setPriceDropAlerts(!val);
      if (key === 'routeUpdates') setRouteUpdates(!val);
      if (key === 'travelDeals') setTravelDeals(!val);
      if (key === 'weeklyReports') setWeeklyReports(!val);
      if (key === 'productUpdates') setProductUpdates(!val);
      if (key === 'marketingNotifs') setMarketingNotifs(!val);
      triggerToast(err?.message || 'Could not save notification settings.');
    }
  };

  // 5. Language Change
  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang);
    triggerToast(newLang === 'Hindi' ? 'भाषा हिन्दी में बदली गई' : 'Language changed to English');
  };

  // 6. Integrations Toggle
  const handleToggleIntegration = async (provider: string) => {
    const isCurrentlyConnected = !!integrations[provider];
    const willConnect = !isCurrentlyConnected;

    const nextState = { ...integrations, [provider]: willConnect };
    setIntegrations(nextState);
    try {
      localStorage.setItem('aeronex_integrations', JSON.stringify(nextState));
    } catch {}

    const providerNames: Record<string, string> = {
      google: 'Google Account',
      email: 'Email Integration',
      apiAccess: 'API Access',
    };
    const displayName = providerNames[provider] || provider.toUpperCase();

    try {
      await api.toggleIntegration(provider);
      triggerToast(`${displayName} ${willConnect ? 'enabled.' : 'disabled.'}`);
    } catch (err: any) {
      setIntegrations(integrations);
      try {
        localStorage.setItem('aeronex_integrations', JSON.stringify(integrations));
      } catch {}
      triggerToast(err?.message || `Could not update ${displayName}.`);
    }
  };

  // 7. Regenerate API Key
  const handleRegenerateKey = async () => {
    try {
      const newKey = await api.regenerateApiKey();
      setApiKey(newKey);
      triggerToast('New API key generated. The previous key no longer works.');
    } catch (err: any) {
      triggerToast(err?.message || 'Failed to regenerate the key.');
    }
  };

  const handleCopyApiKey = async () => {
    try {
      await navigator.clipboard.writeText(apiKey);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
      triggerToast('API key copied to clipboard.');
    } catch {
      triggerToast('Could not copy automatically. Select the key and copy it manually.');
    }
  };

  // 8. Download My Data
  const handleDownloadMyData = async () => {
    try {
      const data = await api.exportUserData();
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', jsonString);
      downloadAnchor.setAttribute('download', `aeronex-profile-data-${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      triggerToast('Account data exported & downloaded as JSON!');
    } catch (err: any) {
      triggerToast('Export failed: ' + err.message);
    }
  };

  // 9. Change Password
  const handleSubmitPasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    if (!currentPassword) {
      setPasswordError('Please enter your current password.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    try {
      await api.changePassword(currentPassword, newPassword, email);
      setPasswordSuccess(true);
      setTimeout(() => {
        setPasswordSuccess(false);
        setShowPasswordModal(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        triggerToast('Password changed successfully!');
      }, 1500);
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to change password. Please check your current password.');
    }
  };

  // 10. Delete Account
  const handleConfirmDeleteAccount = async () => {
    if (deleteConfirmationText.trim().toUpperCase() !== 'DELETE') {
      triggerToast('Please type DELETE to confirm.');
      return;
    }
    setIsDeleting(true);
    try {
      await api.deleteAccount();
      logout();
      navigate('/login', { replace: true });
    } catch (err: any) {
      triggerToast(err.message || 'Failed to delete account');
      setIsDeleting(false);
    }
  };

  // 11. Support Ticket
  const handleSubmitSupport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportSubject || !supportMessage) {
      triggerToast('Please fill out both subject and message.');
      return;
    }
    if (supportSubject.trim().length < 3 || supportMessage.trim().length < 10) {
      triggerToast('Add a subject (3+ characters) and describe the issue (10+ characters).');
      return;
    }
    if (isSubmittingSupport) return;
    setIsSubmittingSupport(true);
    try {
      const receipt: any = await api.submitSupportTicket({
        email,
        subject: supportSubject,
        category: supportCategory,
        message: supportMessage,
        userId: user?.id,
      });
      setSupportReceipt(receipt?.data?.id ? `Reference: ${receipt.data.id}. We'll reply to ${email}.` : 'Your request was received.');
      setSupportSubmitted(true);
      setTimeout(() => {
        setSupportSubmitted(false);
        setShowSupportModal(false);
        setSupportSubject('');
        setSupportMessage('');
        triggerToast('Support request sent.');
      }, 1800);
    } catch (err: any) {
      triggerToast(err?.message || 'Failed to submit the request. Please try again.');
    } finally {
      setIsSubmittingSupport(false);
    }
  };

  // 12. Feedback
  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackComments) {
      triggerToast('Please provide your feedback comments.');
      return;
    }
    if (isSubmittingFeedback) return;
    setIsSubmittingFeedback(true);
    try {
      await api.submitFeedback({
        email,
        rating: feedbackRating,
        category: feedbackCategory,
        comments: feedbackComments,
        userId: user?.id,
      });
      setFeedbackSubmitted(true);
      setTimeout(() => {
        setFeedbackSubmitted(false);
        setShowFeedbackModal(false);
        setFeedbackComments('');
        triggerToast('Thank you for your feedback!');
      }, 1800);
    } catch (err: any) {
      triggerToast(err?.message || 'Failed to record feedback.');
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  /* ─── Tab configuration ─── */
  const tabs: { key: Tab; label: string; icon: any }[] = [
    { key: 'profile', label: t.tabProfile || 'Profile', icon: User },
    { key: 'integrations', label: t.tabIntegrations || 'Integrations', icon: Puzzle },
    { key: 'data-privacy', label: t.tabDataPrivacy || 'Data & Privacy', icon: Shield },
    { key: 'account', label: t.tabAccount || 'Account', icon: KeyRound },
    { key: 'help', label: t.tabHelp || 'Help & Support', icon: HelpCircle },
    { key: 'app-info', label: 'App Information', icon: Info },
  ];

  const accentColors = [
    '#1788FF', '#4E55F5', '#10B981', '#EAB308', '#F97316', '#EF4444', '#EC4899', '#8B5CF6',
  ];

  const inputClass = 'settings-input w-full bg-[#12141C] border border-white/[0.08] rounded-xl text-white px-4 py-2.5 focus:outline-none focus:border-cyan-400/50 transition-all text-sm shadow-inner';
  const selectClass = 'settings-select w-full bg-[#12141C] border border-white/[0.08] rounded-xl text-white px-4 py-2.5 focus:outline-none focus:border-cyan-400/50 transition-all appearance-none text-sm cursor-pointer shadow-inner';
  const cardClass = 'settings-card obsidian-card bg-[#12141C]/80 backdrop-blur-xl border border-white/[0.08] rounded-[20px] p-6 shadow-sm hover:border-white/[0.16] flex flex-col justify-between transition-all';

  const faqs = FAQS;

  const filteredFaqs = faqs.filter(f => f.q.toLowerCase().includes(faqSearch.toLowerCase()) || f.a.toLowerCase().includes(faqSearch.toLowerCase()));

  /* ═══════════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════════ */
  return (
    <DashboardLayout>
      {/* Hidden File Input for Avatar Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleAvatarFileChange}
        className="hidden"
      />

      <div className="flex flex-col gap-6 max-w-[1400px] pb-12">

        {/* ── HERO BANNER ── */}
        <div className={`settings-hero relative overflow-hidden rounded-2xl bg-gradient-to-r ${isLight ? "from-blue-50 via-slate-50 to-white border-slate-200" : "from-[#090A0F] via-[#12141C] to-[#161924] border-white/[0.08]"} border p-6 md:p-8 shadow-xl`}>
          {/* Subtle Sunset Airplane backdrop on right */}
          <div className="absolute right-0 top-0 h-full w-1/2 overflow-hidden pointer-events-none rounded-r-2xl">
            <img
              src="/assets/login-hero-clean.jpg"
              alt="AeroNex Aviation"
              className={`w-full h-full object-cover object-right ${isLight ? "opacity-30 mix-blend-multiply grayscale" : "opacity-20 mix-blend-screen"}`}
            />
            {!isLight && <div className="absolute inset-0 bg-gradient-to-r from-[#090A0F] via-[#090A0F]/70 to-transparent" />}
            {isLight && <div className="absolute inset-0 bg-gradient-to-r from-blue-50/90 via-slate-50/70 to-transparent" />}
          </div>

          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-13 h-13 rounded-2xl flex items-center justify-center shadow-lg shrink-0 ${isLight ? "bg-white border border-slate-200 text-blue-600" : "bg-[#161824] border border-white/[0.1] text-cyan-400"}`}>
                <SettingsIcon className="w-7 h-7" />
              </div>
              <div>
                <h1 className={`text-2xl md:text-3xl font-bold tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>{t.settingsPageTitle || 'Settings'}</h1>
                <p className={`text-xs md:text-sm mt-1 ${isLight ? "text-slate-500" : "text-zinc-400"}`}>{t.settingsPageSubtitle || 'Manage your account, preferences, notifications and data settings.'}</p>
              </div>
            </div>
            <div className="hidden lg:flex flex-col items-end text-right pr-4">
              <span className={`hero-tagline text-[11px] font-bold tracking-[0.25em] uppercase ${isLight ? "text-blue-600" : "text-cyan-400"}`}>{t.settingsHeroTagline || 'CUSTOMIZE YOUR EXPERIENCE'}</span>
              <span className={`text-[11px] mt-1 ${isLight ? "text-slate-500" : "text-zinc-400"}`}>{t.settingsHeroSubtitle || '— Settings for a smarter journey —'}</span>
            </div>
          </div>
        </div>

        {/* ── TAB NAVIGATION ── */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => scrollToSection(tab.key)}
                className={`relative settings-tab flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs md:text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer select-none ${
                  isActive
                    ? 'text-white'
                    : 'bg-[#12141C] hover:bg-[#161824] border border-white/[0.08] text-zinc-400 hover:text-white'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="settingsActiveTabIndicator"
                    className="absolute inset-0 bg-[#161824] border border-white/[0.14] rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.06)]"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <Icon size={16} className={isActive ? 'text-cyan-400' : 'text-zinc-500'} />
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── LIVE TOAST ── */}
        {toastMessage && (
          <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 rounded-xl text-sm font-medium animate-in fade-in slide-in-from-top-2 w-fit shadow-lg backdrop-blur-md">
            <Check size={16} className="text-emerald-400" /> {toastMessage}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
           ROW 1: Profile | Travel Preferences | Notifications
           ══════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── PROFILE INFORMATION ── */}
          <div ref={sectionRefs.profile} className={cardClass}>
            <div>
              <h2 className="text-base md:text-lg font-bold text-white mb-0.5">{t.profileInfoTitle || 'Profile Information'}</h2>
              <p className="text-xs text-slate-400 mb-5">{t.profileInfoDesc || 'Update your personal details and profile information.'}</p>

              {/* Avatar + Info + Change Photo */}
              <div className="flex items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-800/80">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="relative shrink-0">
                    <div className="w-18 h-18 rounded-full overflow-hidden bg-gradient-to-tr from-[#1788FF] to-[#00A3FF] ring-2 ring-blue-500/30 shadow-md flex items-center justify-center text-white text-xl font-bold">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={fullName || 'User'}
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
                        />
                      ) : (
                        <span>{fullName ? fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : (user?.isGuest ? 'G' : 'AN')}</span>
                      )}
                    </div>
                    <button
                      aria-label="Upload photo"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#1788FF] text-white flex items-center justify-center border-2 border-[#0A1838] shadow-md hover:bg-blue-600 transition-colors cursor-pointer"
                    >
                      <Camera size={12} />
                    </button>
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-white font-bold text-base leading-tight truncate">{fullName || (user?.isGuest ? 'Guest Traveler' : 'AeroNex Member')}</h3>
                    <p className="text-xs text-slate-400 mt-0.5 leading-tight">{user?.isGuest ? 'Guest Passenger' : (user?.role || 'Passenger')}</p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className="text-xs text-slate-400 truncate">{email || 'Active Session'}</span>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] font-semibold flex items-center gap-1 shrink-0">
                        <BadgeCheck size={11} /> {user?.isGuest ? 'Guest Session' : (t.verified || 'Verified')}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold flex items-center gap-1.5 hover:bg-blue-500/20 transition-all cursor-pointer shrink-0"
                >
                  <Camera size={13} /> {t.changePhoto || 'Change Photo'}
                </button>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-slate-400 text-xs mb-1.5 block font-medium">{t.fullName || 'Full Name'}</label>
                  <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="text-slate-400 text-xs mb-1.5 block font-medium">{t.emailAddress || 'Email Address'}</label>
                  <input type="email" value={email} readOnly className={`${inputClass} opacity-70 cursor-not-allowed`} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-slate-400 text-xs mb-1.5 block font-medium">{t.organizationLabel || 'Organization (Optional)'}</label>
                  <input type="text" value={organization} onChange={e => setOrganization(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="text-slate-400 text-xs mb-1.5 block font-medium">{t.phoneLabel || 'Phone Number'}</label>
                  <div className="flex gap-2">
                    <div className="settings-input flex items-center gap-1.5 bg-[#081530] border border-slate-700/70 rounded-xl px-2.5 py-2 text-xs text-white shrink-0">
                      <span>🇮🇳</span> <span className="text-slate-400">+91</span>
                    </div>
                    <input type="text" value={phone} onChange={e => setPhone(e.target.value)} className={inputClass} />
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label className="text-slate-400 text-xs mb-1.5 block font-medium">{t.bioLabel || 'Bio (Optional)'}</label>
                <textarea
                  value={bio}
                  onChange={e => { if (e.target.value.length <= 200) setBio(e.target.value); }}
                  rows={3}
                  className={`${inputClass} resize-none`}
                />
                <p className="text-[10px] text-slate-500 text-right mt-1">{bio.length}/200</p>
              </div>
            </div>

            <button
              onClick={handleSaveProfile}
              disabled={isSavingProfile}
              className="w-fit bg-gradient-to-r from-[#1788FF] to-[#4E55F5] rounded-xl text-white px-6 py-2.5 text-sm font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition-all cursor-pointer mt-2 flex items-center gap-2"
            >
              {isSavingProfile ? <Loader2 size={16} className="animate-spin" /> : null}
              {t.saveChangesBtn || 'Save Changes'}
            </button>
          </div>

          {/* ── TRAVEL PREFERENCES ── */}
          
          {/* —— INTEGRATIONS —— */}
          <div ref={sectionRefs.integrations} className={cardClass}>
            <div>
              <h2 className="text-base md:text-lg font-bold text-white mb-0.5">Integrations</h2>
              <p className="text-xs text-slate-400 mb-5">Connect AeroNex with third-party tools.</p>
              
              <div className="space-y-3">
                <div className="p-4 rounded-xl border border-white/[0.08] bg-white/[0.02] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#5865F2]/20 flex items-center justify-center text-[#5865F2]">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/></svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">Discord Webhooks</p>
                      <p className="text-xs text-slate-400">Receive price alerts in your Discord server</p>
                    </div>
                  </div>
                  <button className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors">Connect</button>
                </div>
              </div>
            </div>
          </div>

<div ref={sectionRefs['data-privacy']} className={cardClass}>
            <div>
              <h2 className="text-base md:text-lg font-bold text-white mb-0.5">{t.dataPrivacyTitle || 'Data & Privacy'}</h2>
              <p className="text-xs text-slate-400 mb-4">{t.dataPrivacyDesc || 'Manage your data, privacy and personalization settings.'}</p>

              <div className="flex flex-col gap-1">
                {/* Data Usage Modal Trigger */}
                <button
                  onClick={() => setShowDataUsageModal(true)}
                  className="settings-row flex items-center justify-between py-3 px-2 border-b border-slate-800/80 hover:bg-white/5 transition-all rounded-xl cursor-pointer group text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#0B254E] border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                      <Database size={16} />
                    </div>
                    <div>
                      <h4 className="text-white text-xs font-semibold">{t.dataUsageLabel || 'Data Usage'}</h4>
                      <p className="text-[11px] text-slate-400">{t.dataUsageDesc || 'Control how your data is used'}</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-slate-500 group-hover:text-white transition-colors" />
                </button>

                {/* Download My Data Trigger */}
                <button
                  onClick={handleDownloadMyData}
                  className="settings-row flex items-center justify-between py-3 px-2 border-b border-slate-800/80 hover:bg-white/5 transition-all rounded-xl cursor-pointer group text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#0B2E3D] border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                      <Download size={16} />
                    </div>
                    <div>
                      <h4 className="text-white text-xs font-semibold">{t.downloadDataLabel || 'Download My Data'}</h4>
                      <p className="text-[11px] text-slate-400">{t.downloadDataDesc || 'Export your data (CSV, JSON)'}</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-slate-500 group-hover:text-white transition-colors" />
                </button>

                {/* Delete Account Trigger */}
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="settings-row flex items-center justify-between py-3 px-2 hover:bg-red-500/10 transition-all rounded-xl cursor-pointer group text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#38141F] border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
                      <Trash2 size={16} />
                    </div>
                    <div>
                      <h4 className="text-red-400 text-xs font-semibold">{t.deleteAccountLabel || 'Delete Account'}</h4>
                      <p className="text-[11px] text-slate-400">{t.deleteAccountDesc || 'Permanently delete your account'}</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-slate-500 group-hover:text-red-400 transition-colors" />
                </button>
              </div>
            </div>
          </div>

          {/* ── APPEARANCE ── */}
          <div ref={sectionRefs.account} className={cardClass}>
            <div>
              <h2 className="text-base md:text-lg font-bold text-white mb-0.5">{t.accountSectionTitle || 'Account'}</h2>
              <p className="text-xs text-slate-400 mb-4">{t.accountSectionDesc || 'Manage your account settings.'}</p>

              <div className="flex flex-wrap gap-2.5">
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="settings-action-btn flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#081530] border border-slate-700/80 text-xs font-semibold text-slate-300 hover:border-blue-500 hover:text-white transition-all cursor-pointer"
                >
                  <Lock size={14} className="text-blue-400" />
                  {t.changePasswordBtn || 'Change Password'}
                </button>
                <button
                  onClick={() => setShowSubscriptionModal(true)}
                  className="settings-action-btn flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#081530] border border-slate-700/80 text-xs font-semibold text-slate-300 hover:border-blue-500 hover:text-white transition-all cursor-pointer"
                >
                  <CreditCard size={14} className="text-emerald-400" />
                  View plan
                </button>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs font-semibold text-red-400 hover:bg-red-500/20 transition-all cursor-pointer"
                >
                  <LogOut size={14} />
                  {t.signOutBtn || 'Log Out'}
                </button>
              </div>
            </div>
          </div>

          {/* ── HELP & SUPPORT ── */}
          <div ref={sectionRefs.help} className={cardClass}>
            <div>
              <h2 className="text-base md:text-lg font-bold text-white mb-0.5">{t.helpSupportTitle || 'Help & Support'}</h2>
              <p className="text-xs text-slate-400 mb-4">{t.helpSupportDesc || 'Get help or contact our support team.'}</p>

              <div className="flex flex-wrap gap-2.5">
                <button
                  onClick={() => setShowFaqsModal(true)}
                  className="settings-action-btn flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#081530] border border-slate-700/80 text-xs font-semibold text-slate-300 hover:border-blue-500 hover:text-white transition-all cursor-pointer"
                >
                  <FileQuestion size={14} className="text-blue-400" />
                  {t.faqsBtn || 'FAQs'}
                </button>
                <button
                  onClick={() => setShowSupportModal(true)}
                  className="settings-action-btn flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#081530] border border-slate-700/80 text-xs font-semibold text-slate-300 hover:border-blue-500 hover:text-white transition-all cursor-pointer"
                >
                  <Headphones size={14} className="text-emerald-400" />
                  {t.contactSupportBtn || 'Contact Support'}
                </button>
                <button
                  onClick={() => setShowFeedbackModal(true)}
                  className="settings-action-btn flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#081530] border border-slate-700/80 text-xs font-semibold text-slate-300 hover:border-blue-500 hover:text-white transition-all cursor-pointer"
                >
                  <MessageSquare size={14} className="text-purple-400" />
                  {t.giveFeedbackBtn || 'Give Feedback'}
                </button>
              </div>
            </div>
          </div>

        {/* App Information Section */}
        <div ref={sectionRefs['app-info']} className="pt-8 mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <Info size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">App Information</h2>
              <p className="text-xs text-slate-400">Platform version and details.</p>
            </div>
          </div>
          <div className="bg-[#12141C] border border-white/[0.06] rounded-2xl p-6">
            <div className="space-y-4 text-sm text-slate-300">
              <p><strong>App Name:</strong> AeroNex</p>
              <p><strong>Version:</strong> 1.0.0</p>
              <p><strong>Environment:</strong> Production</p>
              <button onClick={() => setShowAboutModal(true)} className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700">View About Details</button>
            </div>
          </div>
        </div>


          {/* ── APP INFORMATION ── */}
          <div className={cardClass}>
            <div>
              <h2 className="text-base md:text-lg font-bold text-white mb-0.5">{t.appInfoTitle || 'App Information'}</h2>
              <p className="text-xs text-slate-400 mb-3">{t.appInfoDesc || 'Version, legal and other details.'}</p>

              <p className="text-white font-bold text-xs mb-2 tracking-wide">{t.appVersion || 'AERONEX v1.0.0'}</p>

              <div className="flex items-center gap-3 text-xs text-blue-400 mb-4 font-medium flex-wrap">
                <button
                  onClick={() => setShowTermsModal(true)}
                  className="hover:underline text-blue-400 hover:text-cyan-300 transition-colors cursor-pointer"
                >
                  {t.termsOfService || 'Terms of Service'}
                </button>
                <span className="text-slate-600">|</span>
                <button
                  onClick={() => setShowPrivacyModal(true)}
                  className="hover:underline text-blue-400 hover:text-cyan-300 transition-colors cursor-pointer"
                >
                  {t.privacyPolicyLink || 'Privacy Policy'}
                </button>
                <span className="text-slate-600">|</span>
                <button
                  onClick={() => setShowAboutModal(true)}
                  className="hover:underline text-blue-400 hover:text-cyan-300 transition-colors cursor-pointer"
                >
                  {t.aboutLink || 'About AeroNex'}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
              <AeroNexLogo size={28} showTagline={true} variant="full" />
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                {t.systemsOperational || 'All systems operational'}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ══════════════════════════════════════════════════════════
         INTERACTIVE MODALS
         ══════════════════════════════════════════════════════════ */}

      {/* 1. Change Password Modal */}
      <ModalWrapper
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title="Change Password"
        subtitle="Update your credentials for secure platform access"
      >
        <form onSubmit={handleSubmitPasswordChange} className="space-y-4">
          {passwordError && (
            <div className="p-3 bg-red-500/15 border border-red-500/40 rounded-xl text-red-300 text-xs flex items-center gap-2">
              <AlertTriangle size={14} className="shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}
          {passwordSuccess && (
            <div className="p-3 bg-emerald-500/15 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
              <Check size={14} className="shrink-0" />
              <span>Password successfully updated!</span>
            </div>
          )}

          <div>
            <label className="text-xs text-slate-400 font-medium block mb-1">Current Password</label>
            <div className="relative">
              <input
                type={showPassText ? 'text' : 'password'}
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className={inputClass}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassText(!showPassText)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showPassText ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Default demo password: <span className="font-mono text-slate-300">password123</span></p>
          </div>

          <div>
            <label className="text-xs text-slate-400 font-medium block mb-1">New Password</label>
            <input
              type={showPassText ? 'text' : 'password'}
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              className={inputClass}
              required
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 font-medium block mb-1">Confirm New Password</label>
            <input
              type={showPassText ? 'text' : 'password'}
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Re-type new password"
              className={inputClass}
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setShowPasswordModal(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#1788FF] to-[#4E55F5] text-white text-xs font-semibold hover:shadow-lg hover:shadow-blue-500/30 cursor-pointer"
            >
              Update Password
            </button>
          </div>
        </form>
      </ModalWrapper>

      {/* 2. Data Usage & Governance Modal */}
      <ModalWrapper
        isOpen={showDataUsageModal}
        onClose={() => setShowDataUsageModal(false)}
        title="Data Usage & Privacy Governance"
        subtitle="Manage how AeroNex handles flight query telemetry and local storage"
      >
        <div className="space-y-4 text-xs text-slate-300">
          <p>AeroNex complies with domestic aviation privacy principles. We do not sell your flight searches, route preferences, or personal contact numbers to external travel agencies.</p>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#091A3E] border border-slate-800">
              <div>
                <h5 className="font-semibold text-white">Anonymous Flight Route Telemetry</h5>
                <p className="text-[11px] text-slate-400">Aggregates search volume to calibrate national airfare inflation weights.</p>
              </div>
              <ToggleSwitch checked={telemetryEnabled} onChange={setTelemetryEnabled} />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[#091A3E] border border-slate-800">
              <div>
                <h5 className="font-semibold text-white">Local Index Caching</h5>
                <p className="text-[11px] text-slate-400">Stores live 5-second airport benchmarks in your browser for instant load speeds.</p>
              </div>
              <ToggleSwitch checked={fareAlertCookies} onChange={setFareAlertCookies} />
            </div>
          </div>

          <div className="flex justify-end pt-3">
            <button
              onClick={() => {
                setShowDataUsageModal(false);
                triggerToast('Privacy preferences recorded!');
              }}
              className="px-5 py-2 rounded-xl bg-[#1788FF] text-white text-xs font-semibold hover:bg-blue-600 cursor-pointer"
            >
              Save Privacy Settings
            </button>
          </div>
        </div>
      </ModalWrapper>

      {/* 3. Delete Account Security Modal */}
      <ModalWrapper
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Permanently Delete Account"
        subtitle="Irreversible security action"
      >
        <div className="space-y-4">
          <div className="p-3.5 bg-red-500/15 border border-red-500/40 rounded-xl text-red-300 text-xs flex items-start gap-2.5">
            <AlertTriangle size={18} className="text-red-400 shrink-0 mt-0.5" />
            <div>
              <h5 className="font-bold text-red-200">Warning: All data will be permanently wiped</h5>
              <p className="mt-1 leading-relaxed">
                Deleting your account will erase your profile information, price drop alerts, search history, and developer API credentials. This operation cannot be rolled back.
              </p>
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-300 font-medium block mb-1.5">
              Type <span className="font-mono text-red-400 font-bold">DELETE</span> to confirm:
            </label>
            <input
              type="text"
              value={deleteConfirmationText}
              onChange={e => setDeleteConfirmationText(e.target.value)}
              placeholder="Type DELETE"
              className={inputClass}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDeleteAccount}
              disabled={isDeleting || deleteConfirmationText.trim().toUpperCase() !== 'DELETE'}
              className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold flex items-center gap-2 cursor-pointer"
            >
              {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
              Permanently Delete
            </button>
          </div>
        </div>
      </ModalWrapper>

      {/* 4. API Key Access Modal */}
      <ModalWrapper
        isOpen={showApiKeyModal}
        onClose={() => setShowApiKeyModal(false)}
        title="Developer API Access"
        subtitle="Authenticate programmatic access to AeroNex Airfare Index"
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs text-slate-400 font-medium block mb-1">Your Personal Secret Key</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={apiKey}
                readOnly
                className="w-full bg-[#081530] border border-blue-500/40 rounded-xl text-cyan-300 font-mono text-xs px-3.5 py-2.5 select-all"
              />
              <button
                onClick={handleCopyApiKey}
                className="p-2.5 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 hover:bg-blue-500/25 hover:text-white transition-colors cursor-pointer shrink-0"
                title="Copy API key"
              >
                {copiedKey ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
              </button>
              <button
                onClick={handleRegenerateKey}
                className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer shrink-0"
                title="Regenerate key"
              >
                <RefreshCw size={16} />
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Keep this key confidential. Do not expose it in client-side bundles.</p>
          </div>

          <div>
            <label className="text-xs text-slate-400 font-medium block mb-1">Example Request</label>
            <div className="p-3 bg-[#030A1D] border border-slate-800 rounded-xl font-mono text-[11px] text-slate-300 overflow-x-auto">
              <code>{`curl -X GET "${API_BASE_URL || 'https://YOUR-AERONEX-SERVER'}/api/alerts" \\
  -H "X-API-Key: ${apiKey}"`}</code>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => setShowApiKeyModal(false)}
              className="px-5 py-2 rounded-xl bg-[#1788FF] text-white text-xs font-semibold hover:bg-blue-600 cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </ModalWrapper>

      {/* 5. Plan Modal */}
      <ModalWrapper
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        title="Plan"
        subtitle="Your AeroNex access"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0B254E] to-[#081736] border border-blue-500/30">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 text-[10px] font-bold uppercase tracking-wider border border-cyan-500/40">Current plan</span>
            <h4 className="text-lg font-bold text-white mt-2">AeroNex Free</h4>
            <p className="text-xs text-slate-400 mt-1">AeroNex does not charge or bill accounts at the moment, so there are no invoices or renewals to manage.</p>
            <ul className="mt-3 space-y-1.5 text-xs text-slate-300 border-t border-slate-700/60 pt-3">
              <li className="flex items-center gap-2"><Check size={14} className="text-emerald-400" /> Airfare index, route trends and price alerts</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-emerald-400" /> AI analysis grounded in observed data</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-emerald-400" /> Personal API key for read access to market data</li>
            </ul>
          </div>
          <div className="flex justify-end pt-2">
            <button onClick={() => setShowSubscriptionModal(false)} className="px-5 py-2 rounded-xl bg-[#1788FF] text-white text-xs font-semibold hover:bg-blue-600 cursor-pointer">Close</button>
          </div>
        </div>
      </ModalWrapper>

      {/* 6. FAQs Modal */}
      <ModalWrapper
        isOpen={showFaqsModal}
        onClose={() => setShowFaqsModal(false)}
        title="Frequently Asked Questions"
        subtitle="Everything you need to know about the AeroNex platform"
        maxWidth="max-w-2xl"
      >
        <div className="space-y-4">
          <input
            type="text"
            value={faqSearch}
            onChange={e => setFaqSearch(e.target.value)}
            placeholder="Search FAQs (e.g. index, prediction, api)..."
            className={inputClass}
          />

          <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
            {filteredFaqs.map(f => (
              <div key={f.id} className="rounded-xl border border-slate-800 bg-[#081530] overflow-hidden">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === f.id ? null : f.id)}
                  className="w-full text-left p-3.5 flex items-center justify-between font-semibold text-xs text-white hover:bg-white/5 cursor-pointer"
                >
                  <span>{f.q}</span>
                  <ChevronDown size={14} className={`text-slate-400 transition-transform ${expandedFaq === f.id ? 'rotate-180 text-[#1788FF]' : ''}`} />
                </button>
                {expandedFaq === f.id && (
                  <div className="px-3.5 pb-3.5 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60 pt-2.5">
                    {f.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </ModalWrapper>

      {/* 7. Contact Support Modal */}
      <ModalWrapper
        isOpen={showSupportModal}
        onClose={() => setShowSupportModal(false)}
        title="Contact Aviation Support"
        subtitle="Our flight operations team responds within 24 hours"
      >
        <form onSubmit={handleSubmitSupport} className="space-y-4">
          {supportSubmitted ? (
            <div className="p-4 bg-emerald-500/15 border border-emerald-500/40 rounded-xl text-center space-y-2">
              <Check size={24} className="text-emerald-400 mx-auto" />
              <h5 className="font-bold text-white text-sm">Request received</h5>
              <p className="text-xs text-slate-300">{supportReceipt || 'Your request was received.'}</p>
            </div>
          ) : (
            <>
              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">Inquiry Category</label>
                <select
                  value={supportCategory}
                  onChange={e => setSupportCategory(e.target.value)}
                  className={selectClass}
                >
                  <option value="Data Inquiry">Real-Time Airfare Data Inquiry</option>
                  <option value="AI Accuracy">AI Prediction / Methodology</option>
                  <option value="API Integration">API Access & Rate Limits</option>
                                    <option value="Bug Report">Platform Bug Report</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">Subject</label>
                <input
                  type="text"
                  value={supportSubject}
                  onChange={e => setSupportSubject(e.target.value)}
                  placeholder="Summary of issue"
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">Message</label>
                <textarea
                  value={supportMessage}
                  onChange={e => setSupportMessage(e.target.value)}
                  rows={4}
                  placeholder="Describe your inquiry with relevant route codes..."
                  className={`${inputClass} resize-none`}
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowSupportModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#1788FF] to-[#4E55F5] text-white text-xs font-semibold hover:shadow-lg hover:shadow-blue-500/30 cursor-pointer"
                >
                  Send Message
                </button>
              </div>
            </>
          )}
        </form>
      </ModalWrapper>

      {/* 8. Give Feedback Modal */}
      <ModalWrapper
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        title="Share Your Feedback"
        subtitle="Help us build the smartest aviation intelligence engine in India"
      >
        <form onSubmit={handleSubmitFeedback} className="space-y-4">
          {feedbackSubmitted ? (
            <div className="p-4 bg-emerald-500/15 border border-emerald-500/40 rounded-xl text-center space-y-2">
              <Star size={24} className="text-amber-400 mx-auto fill-amber-400" />
              <h5 className="font-bold text-white text-sm">Thank You for Your Feedback!</h5>
              <p className="text-xs text-slate-300">Your insights directly shape our upcoming release roadmap.</p>
            </div>
          ) : (
            <>
              <div>
                <label className="text-xs text-slate-400 font-medium block mb-2 text-center">How would you rate AeroNex?</label>
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedbackRating(star)}
                      className="p-1.5 transition-transform hover:scale-125 cursor-pointer"
                    >
                      <Star
                        size={24}
                        className={star <= feedbackRating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">Focus Area</label>
                <div className="flex flex-wrap gap-2">
                  {['Platform UX', 'Airfare Accuracy', 'Gemini Predictions', 'Speed / Polling', 'New Features'].map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setFeedbackCategory(cat)}
                      className={`px-3 py-1 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                        feedbackCategory === cat
                          ? 'bg-[#1788FF] text-white border border-[#1788FF]'
                          : 'bg-[#081530] text-slate-400 border border-slate-700 hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">Your Comments</label>
                <textarea
                  value={feedbackComments}
                  onChange={e => setFeedbackComments(e.target.value)}
                  rows={3}
                  placeholder="What would make AeroNex even more powerful for you?"
                  className={`${inputClass} resize-none`}
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowFeedbackModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#1788FF] to-[#4E55F5] text-white text-xs font-semibold hover:shadow-lg hover:shadow-blue-500/30 cursor-pointer"
                >
                  Submit Feedback
                </button>
              </div>
            </>
          )}
        </form>
      </ModalWrapper>

      {/* 8. Terms and Conditions Modal */}
      <ModalWrapper
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        title="Terms and Conditions"
        subtitle="Last Updated: October 2026 • AeroNex National Airfare Intelligence Platform"
        maxWidth="max-w-2xl"
      >
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1 text-xs text-slate-300 leading-relaxed">
          <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300">
            <span className="font-bold block mb-1">SIH26056 Specification Notice</span>
            AeroNex is developed as an econometric research and decision-support tool for Real-Time Airfare Price Index tracking and Consumer Price Index (CPI) augmentation under Ministry guidelines.
          </div>

          <div>
            <h4 className="font-bold text-white text-sm mb-1">1. Acceptance of Terms</h4>
            <p className="text-slate-400">
              By accessing, browsing, or utilizing the AeroNex platform, APIs, predictive indices, or report exports, you agree to be bound by these Terms and Conditions. If you do not agree to all provisions, you may not access or use this service.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white text-sm mb-1">2. Permitted Use and Analytical Data</h4>
            <p className="text-slate-400">
              AeroNex aggregates published domestic civil aviation pricing data for index formulation, academic research, macroeconomic modeling, and personal travel research. Users shall not use automated scripts to overload platform endpoints or breach underlying airline portal security per DGCA guidelines.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white text-sm mb-1">3. Index Accuracy and Price Volatility</h4>
            <p className="text-slate-400">
              Airfare yields fluctuate dynamically based on airline revenue management engines. While the National Airfare Index (NAI) employs Laspeyres-Fisher capacity weighting and 95th-percentile winsorization to minimize sample bias, AeroNex provides pricing intelligence on an "as-observed" basis without warranties for commercial third-party bookings.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white text-sm mb-1">4. Intellectual Property & Algorithmic Models</h4>
            <p className="text-slate-400">
              All proprietary algorithms, synthetic inflation tracking methodologies, UI interfaces, and real-time corridor aggregators are the intellectual property of AeroNex.
            </p>
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-800">
            <button
              onClick={() => setShowTermsModal(false)}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#1788FF] to-[#4E55F5] text-white text-xs font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition-all cursor-pointer"
            >
              Close Terms
            </button>
          </div>
        </div>
      </ModalWrapper>

      {/* 9. Privacy Policy Modal */}
      <ModalWrapper
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
        title="Privacy Policy"
        subtitle="Our commitment to your privacy • Zero Personal Data Selling"
        maxWidth="max-w-2xl"
      >
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1 text-xs text-slate-300 leading-relaxed">
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
            <span className="font-bold block mb-1">Zero Monetization of User Data</span>
            AeroNex does not sell, lease, or broker your personal travel searches, email addresses, or corridor tracking preferences to advertising networks or airline brokers.
          </div>

          <div>
            <h4 className="font-bold text-white text-sm mb-1">1. Information We Collect</h4>
            <p className="text-slate-400">
              We only collect information necessary to deliver real-time airfare analytics: your registered email for alert delivery, account credentials for profile preferences, and anonymous session telemetry for platform performance optimization.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white text-sm mb-1">2. How We Use Collected Data</h4>
            <ul className="list-disc pl-5 space-y-1 text-slate-400 mt-1">
              <li>Dispatching route price drop alerts and target fare triggers.</li>
              <li>Maintaining your authenticated session and corridor watchlists.</li>
              <li>Calibrating custom report downloads and econometric export formatting.</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white text-sm mb-1">3. Data Retention and Deletion Rights</h4>
            <p className="text-slate-400">
              You retain full ownership of your data. You may download a full copy of your recorded account data via the "Download My Data" option or permanently delete your account at any time via Settings &gt; Data & Privacy.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white text-sm mb-1">4. Security Standards</h4>
            <p className="text-slate-400">
              All communications are encrypted using Transport Layer Security (TLS 1.3). API tokens and credential records are hashed utilizing enterprise cryptographic standards.
            </p>
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-800">
            <button
              onClick={() => setShowPrivacyModal(false)}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-semibold hover:shadow-lg hover:shadow-emerald-500/30 transition-all cursor-pointer"
            >
              Acknowledge & Close
            </button>
          </div>
        </div>
      </ModalWrapper>

      {/* 10. About AeroNex Modal */}
      <ModalWrapper
        isOpen={showAboutModal}
        onClose={() => setShowAboutModal(false)}
        title="About AeroNex"
        subtitle="Real-Time Airfare Intelligence Platform (SIH26056)"
        maxWidth="max-w-2xl"
      >
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1 text-xs text-slate-300 leading-relaxed">
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-500/30 flex items-center gap-4">
            <AeroNexLogo size={36} showTagline={false} />
            <div>
              <h3 className="text-white font-bold text-sm">AeroNex National Airfare Index Platform</h3>
              <p className="text-slate-400 text-xs mt-0.5">Version 1.0.0 (Production Release)</p>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-white text-sm mb-1">Problem Statement SIH26056</h4>
            <p className="text-slate-400">
              Development of a Real-time Airfare Price Index for India through automated scraping and API ingestion of airline and OTA portals to augment the official Consumer Price Index (CPI) transport basket.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white text-sm mb-1">Core Architecture & Technologies</h4>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="p-2.5 rounded-xl bg-[#090A0F] border border-white/[0.06]">
                <span className="text-cyan-400 font-bold block text-[11px]">Frontend</span>
                <span className="text-slate-400 text-[11px]">React 18, Vite, TypeScript, Tailwind CSS, Lucide React</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#090A0F] border border-white/[0.06]">
                <span className="text-blue-400 font-bold block text-[11px]">Backend & Ingestion</span>
                <span className="text-slate-400 text-[11px]">Node.js, Express, LiveDataStore, Ingestion Workers</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#090A0F] border border-white/[0.06]">
                <span className="text-purple-400 font-bold block text-[11px]">AI Analytics</span>
                <span className="text-slate-400 text-[11px]">Google Gemini LLM, Elasticity Detection, Trend Forecasting</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#090A0F] border border-white/[0.06]">
                <span className="text-emerald-400 font-bold block text-[11px]">Econometrics</span>
                <span className="text-slate-400 text-[11px]">Modified Laspeyres Aggregation & Fisher Ideal Index</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-white text-sm mb-1">Coverage Scope</h4>
            <p className="text-slate-400">
              Continuously monitoring 104 high-density Indian domestic aviation corridors across 7 major scheduled carriers (IndiGo, Air India, Vistara, Akasa Air, SpiceJet, AirAsia India, and regional operators).
            </p>
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-800">
            <button
              onClick={() => setShowAboutModal(false)}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#1788FF] to-[#4E55F5] text-white text-xs font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition-all cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </ModalWrapper>

    </DashboardLayout>
  );
}
