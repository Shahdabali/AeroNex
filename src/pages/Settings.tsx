import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { AeroNexLogo } from '../components/AeroNexLogo';
import { usePageTitle } from '../hooks/usePageTitle';
import { useAppContext } from '../context/AppProvider';
import { api } from '../services/api';
import type { Language } from '../i18n/translations';
import {
  Settings as SettingsIcon, User, Sliders, Bell, Shield, Puzzle, Palette,
  KeyRound, HelpCircle, ChevronRight, Camera, BadgeCheck,
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

  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ─── Tab state ─── */
  type Tab = 'profile' | 'preferences' | 'notifications' | 'data-privacy' | 'integrations' | 'appearance' | 'account' | 'help';
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  /* ─── Section refs for smooth scrolling ─── */
  const sectionRefs: Record<Tab, React.RefObject<HTMLDivElement | null>> = {
    profile: useRef<HTMLDivElement>(null),
    preferences: useRef<HTMLDivElement>(null),
    notifications: useRef<HTMLDivElement>(null),
    'data-privacy': useRef<HTMLDivElement>(null),
    integrations: useRef<HTMLDivElement>(null),
    appearance: useRef<HTMLDivElement>(null),
    account: useRef<HTMLDivElement>(null),
    help: useRef<HTMLDivElement>(null),
  };

  const scrollToSection = (tab: Tab) => {
    setActiveTab(tab);
    sectionRefs[tab]?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  /* ─── Profile state ─── */
  const [fullName, setFullName] = useState(user?.name || 'Shadab Ali');
  const [email] = useState(user?.email || 'shadab@aeronex.com');
  const [organization, setOrganization] = useState(user?.organization || 'Student / Researcher');
  const [phone, setPhone] = useState(user?.phone || '98765 43210');
  const [bio, setBio] = useState(user?.bio || 'Exploring data-driven insights to make travel more accessible and affordable.');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop');
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
  const [integrations, setIntegrations] = useState<Record<string, boolean>>({
    google: false,
    calendar: false,
    email: false,
    discord: false,
    apiAccess: true,
  });
  const [apiKey, setApiKey] = useState('aeronex_live_sk_948f2c1b8e47a6d3f0');
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

  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackCategory, setFeedbackCategory] = useState('Platform UX');
  const [feedbackComments, setFeedbackComments] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

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
        const data = await api.getUserProfile(user?.email || 'shadab@aeronex.com');
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
          setIntegrations({
            google: !!data.integrations.google,
            calendar: !!data.integrations.calendar,
            email: !!data.integrations.email,
            discord: !!data.integrations.discord,
            apiAccess: !!data.integrations.apiAccess,
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

    if (file.size > 8 * 1024 * 1024) {
      triggerToast('Image file size must be less than 8MB.');
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
          triggerToast('Avatar photo updated and synchronized!');
        } catch {
          triggerToast('Avatar updated locally.');
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
      await api.updateUserPreferences(updated, email);
      triggerToast('Travel preferences saved');
    } catch {}
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
      await api.updateUserNotifications(updated, email);
    } catch {}
  };

  // 5. Language Change
  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang);
    triggerToast(newLang === 'Hindi' ? 'भाषा हिन्दी में बदली गई' : 'Language changed to English');
  };

  // 6. Integrations Toggle
  const handleToggleIntegration = async (provider: string) => {
    try {
      setIntegrations(prev => ({ ...prev, [provider]: !prev[provider] }));
      await api.toggleIntegration(provider, email);
      const isNowConnected = !integrations[provider];
      triggerToast(`${provider.toUpperCase()} ${isNowConnected ? 'connected successfully' : 'disconnected'}`);
    } catch (err: any) {
      triggerToast(err.message || 'Failed to update integration');
    }
  };

  // 7. Regenerate API Key
  const handleRegenerateKey = async () => {
    try {
      const newKey = await api.regenerateApiKey(email);
      setApiKey(newKey);
      triggerToast('New API access key generated!');
    } catch {
      triggerToast('Failed to regenerate key');
    }
  };

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
    triggerToast('API Key copied to clipboard!');
  };

  // 8. Download My Data
  const handleDownloadMyData = async () => {
    try {
      const data = await api.exportUserData(email);
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
      await api.deleteAccount(email);
      logout();
      navigate('/login');
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
    try {
      await api.submitSupportTicket({
        email,
        subject: supportSubject,
        category: supportCategory,
        message: supportMessage,
        userId: user?.id,
      });
      setSupportSubmitted(true);
      setTimeout(() => {
        setSupportSubmitted(false);
        setShowSupportModal(false);
        setSupportSubject('');
        setSupportMessage('');
        triggerToast('Support ticket dispatched to AeroNex Aviation Ops!');
      }, 1800);
    } catch {
      triggerToast('Failed to submit ticket. Please try again.');
    }
  };

  // 12. Feedback
  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackComments) {
      triggerToast('Please provide your feedback comments.');
      return;
    }
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
        triggerToast('Thank you for shaping AeroNex!');
      }, 1800);
    } catch {
      triggerToast('Failed to record feedback.');
    }
  };

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  /* ─── Tab configuration ─── */
  const tabs: { key: Tab; label: string; icon: typeof User }[] = [
    { key: 'profile', label: t.tabProfile || 'Profile', icon: User },
    { key: 'preferences', label: t.tabPreferences || 'Preferences', icon: Sliders },
    { key: 'notifications', label: t.tabNotifications || 'Notifications', icon: Bell },
    { key: 'data-privacy', label: t.tabDataPrivacy || 'Data & Privacy', icon: Shield },
    { key: 'integrations', label: t.tabIntegrations || 'Integrations', icon: Puzzle },
    { key: 'appearance', label: t.tabAppearance || 'Appearance', icon: Palette },
    { key: 'account', label: t.tabAccount || 'Account', icon: KeyRound },
    { key: 'help', label: t.tabHelp || 'Help & Support', icon: HelpCircle },
  ];

  const accentColors = [
    '#1788FF', '#4E55F5', '#10B981', '#EAB308', '#F97316', '#EF4444', '#EC4899', '#8B5CF6',
  ];

  const inputClass = 'settings-input w-full bg-[#12141C] border border-white/[0.08] rounded-xl text-white px-4 py-2.5 focus:outline-none focus:border-cyan-400/50 transition-all text-sm shadow-inner';
  const selectClass = 'settings-select w-full bg-[#12141C] border border-white/[0.08] rounded-xl text-white px-4 py-2.5 focus:outline-none focus:border-cyan-400/50 transition-all appearance-none text-sm cursor-pointer shadow-inner';
  const cardClass = 'settings-card obsidian-card bg-[#12141C]/80 backdrop-blur-xl border border-white/[0.08] rounded-[20px] p-6 shadow-sm hover:border-white/[0.16] flex flex-col justify-between transition-all';

  const faqs = [
    {
      id: 1,
      q: 'How is the AeroNex National Airfare Index calculated?',
      a: 'The index is a weighted benchmark modeled after the Consumer Price Index (CPI) basket, factoring high-density metro corridors (DEL-BOM, BOM-BLR) and regional routes with real-time weights.',
    },
    {
      id: 2,
      q: 'How frequently is live route pricing updated?',
      a: 'Our ingestion workers poll domestic airline networks and DGCA fare filings every 5 seconds for live tickers and every 30 seconds for deep fare matrix updates.',
    },
    {
      id: 3,
      q: 'How accurate are the AI price predictions?',
      a: 'Our Gemini AI model combines historical booking curves, seasonal demand spikes, ATF fuel index, and real-time inventory to deliver 85-92% confidence recommendations.',
    },
    {
      id: 4,
      q: 'How do price drop alerts reach me?',
      a: 'Alerts are dispatched via real-time WebSocket push notifications, email summaries, and optional webhook integrations for connected Discord servers.',
    },
    {
      id: 5,
      q: 'Can I export my flight search history and saved data?',
      a: 'Yes! In Settings > Data & Privacy, click "Download My Data" to immediately download a verified JSON or CSV export of all your records.',
    },
  ];

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
        <div className="settings-hero relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#090A0F] via-[#12141C] to-[#161924] border border-white/[0.08] p-6 md:p-8 shadow-xl">
          {/* Subtle Sunset Airplane backdrop on right */}
          <div className="absolute right-0 top-0 h-full w-1/2 overflow-hidden pointer-events-none rounded-r-2xl">
            <img 
              src="/assets/login-hero-clean.jpg" 
              alt="AeroNex Aviation" 
              className="w-full h-full object-cover object-right opacity-20 mix-blend-screen"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#090A0F] via-[#090A0F]/70 to-transparent" />
          </div>

          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-13 h-13 rounded-2xl bg-[#161824] border border-white/[0.1] flex items-center justify-center shadow-lg text-cyan-400 shrink-0">
                <SettingsIcon className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{t.settingsPageTitle || 'Settings'}</h1>
                <p className="text-xs md:text-sm text-zinc-400 mt-1">{t.settingsPageSubtitle || 'Manage your account, preferences, notifications and data settings.'}</p>
              </div>
            </div>
            <div className="hidden lg:flex flex-col items-end text-right pr-4">
              <span className="hero-tagline text-[11px] font-bold tracking-[0.25em] text-cyan-400 uppercase">{t.settingsHeroTagline || 'CUSTOMIZE YOUR EXPERIENCE'}</span>
              <span className="text-[11px] text-zinc-400 mt-1">{t.settingsHeroSubtitle || '— Settings for a smarter journey —'}</span>
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
                    <div className="w-18 h-18 rounded-full overflow-hidden bg-slate-800 ring-2 ring-blue-500/30 shadow-md">
                      <img
                        src={avatarUrl}
                        alt={fullName}
                        className="w-full h-full object-cover"
                      />
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
                    <h3 className="text-white font-bold text-base leading-tight truncate">{fullName}</h3>
                    <p className="text-xs text-slate-400 mt-0.5 leading-tight">{user?.role || 'Researcher'}</p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className="text-xs text-slate-400 truncate">{email}</span>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] font-semibold flex items-center gap-1 shrink-0">
                        <BadgeCheck size={11} /> {t.verified || 'Verified'}
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
          <div ref={sectionRefs.preferences} className={cardClass}>
            <div>
              <h2 className="text-base md:text-lg font-bold text-white mb-0.5">{t.travelPreferencesTitle || 'Travel Preferences'}</h2>
              <p className="text-xs text-slate-400 mb-5">{t.travelPreferencesDesc || 'Set your default travel and display preferences.'}</p>

              <div className="flex flex-col gap-4">
                {/* Departure City */}
                <div>
                  <label className="text-slate-400 text-xs mb-1.5 block font-medium">{t.defaultDepartureCity || 'Default Departure City'}</label>
                  <div className="relative">
                    <Plane size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-400 pointer-events-none" />
                    <select 
                      value={departureCity} 
                      onChange={e => handlePreferenceChange('departureCity', e.target.value)} 
                      className={`${selectClass} pl-10 pr-9`}
                    >
                      <option value="DEL">DEL  Delhi (Indira Gandhi)</option>
                      <option value="BOM">BOM  Mumbai (Chhatrapati Shivaji)</option>
                      <option value="BLR">BLR  Bengaluru (Kempegowda)</option>
                      <option value="HYD">HYD  Hyderabad (Rajiv Gandhi)</option>
                      <option value="MAA">MAA  Chennai (Anna International)</option>
                      <option value="CCU">CCU  Kolkata (Netaji Subhash)</option>
                      <option value="GOI">GOI  Goa (Manohar Parrikar)</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                {/* Destination City */}
                <div>
                  <label className="text-slate-400 text-xs mb-1.5 block font-medium">{t.defaultDestinationCity || 'Default Destination City'}</label>
                  <div className="relative">
                    <Plane size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-400 pointer-events-none" />
                    <select 
                      value={destinationCity} 
                      onChange={e => handlePreferenceChange('destinationCity', e.target.value)} 
                      className={`${selectClass} pl-10 pr-9`}
                    >
                      <option value="BOM">BOM  Mumbai (Chhatrapati Shivaji)</option>
                      <option value="DEL">DEL  Delhi (Indira Gandhi)</option>
                      <option value="BLR">BLR  Bengaluru (Kempegowda)</option>
                      <option value="HYD">HYD  Hyderabad (Rajiv Gandhi)</option>
                      <option value="MAA">MAA  Chennai (Anna International)</option>
                      <option value="CCU">CCU  Kolkata (Netaji Subhash)</option>
                      <option value="GOI">GOI  Goa (Manohar Parrikar)</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                {/* Class & Currency in 2 Cols */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-400 text-xs mb-1.5 block font-medium">{t.preferredTravelClass || 'Preferred Travel Class'}</label>
                    <div className="relative">
                      <select 
                        value={travelClass} 
                        onChange={e => handlePreferenceChange('travelClass', e.target.value)} 
                        className={`${selectClass} pr-8`}
                      >
                        <option value="Economy">Economy</option>
                        <option value="Premium Economy">Premium Economy</option>
                        <option value="Business">Business</option>
                        <option value="First">First</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-400 text-xs mb-1.5 block font-medium">{t.preferredCurrency || 'Preferred Currency'}</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-blue-400">₹</span>
                      <select value={currency} onChange={e => setCurrency(e.target.value)} disabled className={`${selectClass} pl-7 pr-8 cursor-not-allowed opacity-90`}>
                        <option value="INR (₹)">INR  Indian Rupee (₹)</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Language & Date Format in 2 Cols */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-400 text-xs mb-1.5 block font-medium">{t.language || 'Language'}</label>
                    <div className="relative">
                      <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 pointer-events-none" />
                      <select
                        value={language}
                        onChange={e => handleLanguageChange(e.target.value as Language)}
                        className={`${selectClass} pl-8 pr-8`}
                      >
                        <option value="English">English</option>
                        <option value="Hindi">हिन्दी (Hindi)</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-400 text-xs mb-1.5 block font-medium">{t.dateFormatLabel || 'Date Format'}</label>
                    <div className="relative">
                      <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 pointer-events-none" />
                      <select 
                        value={dateFormat} 
                        onChange={e => handlePreferenceChange('dateFormat', e.target.value)} 
                        className={`${selectClass} pl-8 pr-8`}
                      >
                        <option value="DD MMM YYYY (10 Sep 2026)">DD MMM YYYY (10 Sep 2026)</option>
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Alternative Airports Checkbox */}
                <label className="flex items-center gap-3 cursor-pointer pt-1 select-none">
                  <input
                    type="checkbox"
                    checked={showAltAirports}
                    onChange={e => handlePreferenceChange('showAltAirports', e.target.checked)}
                    className="w-4 h-4 rounded border-slate-600 bg-[#081530] text-[#1788FF] focus:ring-[#1788FF] accent-[#1788FF] cursor-pointer"
                  />
                  <span className="text-xs text-slate-300">{t.showAltAirports || 'Show alternative airports (e.g., BLR + MLR)'}</span>
                </label>
              </div>
            </div>
          </div>

          {/* ── NOTIFICATION SETTINGS ── */}
          <div ref={sectionRefs.notifications} className={cardClass}>
            <div>
              <h2 className="text-base md:text-lg font-bold text-white mb-0.5">{t.notifSettingsTitle || 'Notification Settings'}</h2>
              <p className="text-xs text-slate-400 mb-4">{t.notifSettingsDesc || 'Choose what you want to be notified about.'}</p>

              <div className="flex flex-col gap-0.5">
                {/* 1. Price Drop Alerts */}
                <div className="flex items-center justify-between py-2.5 border-b border-slate-800/80">
                  <div className="flex items-center gap-3">
                    <div className="w-8.5 h-8.5 rounded-xl bg-[#0E352B] border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                      <Bell size={15} />
                    </div>
                    <div>
                      <h4 className="text-white text-xs font-semibold leading-tight">{t.priceDropAlerts || 'Price Drop Alerts'}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">{t.priceDropAlertsDesc || 'Get notified when fares drop'}</p>
                    </div>
                  </div>
                  <ToggleSwitch checked={priceDropAlerts} onChange={v => handleNotificationToggle('priceDropAlerts', v)} />
                </div>

                {/* 2. Route Updates */}
                <div className="flex items-center justify-between py-2.5 border-b border-slate-800/80">
                  <div className="flex items-center gap-3">
                    <div className="w-8.5 h-8.5 rounded-xl bg-[#0B254E] border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                      <Plane size={15} />
                    </div>
                    <div>
                      <h4 className="text-white text-xs font-semibold leading-tight">{t.routeUpdatesLabel || 'Route Updates'}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">{t.routeUpdatesDesc || 'New routes and schedule changes'}</p>
                    </div>
                  </div>
                  <ToggleSwitch checked={routeUpdates} onChange={v => handleNotificationToggle('routeUpdates', v)} />
                </div>

                {/* 3. Travel Deals & Offers */}
                <div className="flex items-center justify-between py-2.5 border-b border-slate-800/80">
                  <div className="flex items-center gap-3">
                    <div className="w-8.5 h-8.5 rounded-xl bg-[#231A4E] border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                      <Tag size={15} />
                    </div>
                    <div>
                      <h4 className="text-white text-xs font-semibold leading-tight">{t.travelDealsOffers || 'Travel Deals & Offers'}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">{t.travelDealsDesc || 'Exclusive deals and discounts'}</p>
                    </div>
                  </div>
                  <ToggleSwitch checked={travelDeals} onChange={v => handleNotificationToggle('travelDeals', v)} />
                </div>

                {/* 4. Weekly Reports */}
                <div className="flex items-center justify-between py-2.5 border-b border-slate-800/80">
                  <div className="flex items-center gap-3">
                    <div className="w-8.5 h-8.5 rounded-xl bg-[#36260E] border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                      <FileText size={15} />
                    </div>
                    <div>
                      <h4 className="text-white text-xs font-semibold leading-tight">{t.weeklyReportsLabel || 'Weekly Reports'}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">{t.weeklyReportsDesc || 'Summary of price trends'}</p>
                    </div>
                  </div>
                  <ToggleSwitch checked={weeklyReports} onChange={v => handleNotificationToggle('weeklyReports', v)} />
                </div>

                {/* 5. Product Updates */}
                <div className="flex items-center justify-between py-2.5 border-b border-slate-800/80">
                  <div className="flex items-center gap-3">
                    <div className="w-8.5 h-8.5 rounded-xl bg-[#351520] border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                      <Package size={15} />
                    </div>
                    <div>
                      <h4 className="text-white text-xs font-semibold leading-tight">{t.productUpdatesLabel || 'Product Updates'}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">{t.productUpdatesDesc || 'New features and improvements'}</p>
                    </div>
                  </div>
                  <ToggleSwitch checked={productUpdates} onChange={v => handleNotificationToggle('productUpdates', v)} />
                </div>

                {/* 6. Marketing Notifications */}
                <div className="flex items-center justify-between py-2.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8.5 h-8.5 rounded-xl bg-[#0C2A38] border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                      <Megaphone size={15} />
                    </div>
                    <div>
                      <h4 className="text-white text-xs font-semibold leading-tight">{t.marketingNotifsLabel || 'Marketing Notifications'}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">{t.marketingNotifsDesc || 'Tips, news and promotional content'}</p>
                    </div>
                  </div>
                  <ToggleSwitch checked={marketingNotifs} onChange={v => handleNotificationToggle('marketingNotifs', v)} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════
           ROW 2: Data & Privacy | Appearance | Integrations
           ══════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── DATA & PRIVACY ── */}
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
          <div ref={sectionRefs.appearance} className={cardClass}>
            <div>
              <h2 className="text-base md:text-lg font-bold text-white mb-0.5">{t.appearanceSectionTitle || 'Appearance'}</h2>
              <p className="text-xs text-slate-400 mb-4">{t.appearanceSectionDesc || 'Customize how Aeronex looks for you.'}</p>

              {/* Theme Selector */}
              <div className="mb-5">
                <label className="text-slate-400 text-xs mb-2 block font-medium">{t.themeLabel || 'Theme'}</label>
                <div className="grid grid-cols-3 gap-3">
                  {([
                    { key: 'light' as const, icon: Sun, label: t.light || 'Light', desc: 'Day Mode' },
                    { key: 'dark' as const, icon: Moon, label: t.dark || 'Dark', desc: 'Night Flight' },
                    { key: 'system' as const, icon: Monitor, label: t.systemTheme || 'System', desc: 'Auto Match' },
                  ]).map(opt => {
                    const Icon = opt.icon;
                    const isActive = theme === opt.key;
                    return (
                      <button
                        key={opt.key}
                        onClick={() => {
                          setTheme(opt.key);
                          api.updateUserAppearance({ theme: opt.key }, email);
                          triggerToast(
                            opt.key === 'light' 
                              ? 'Light / Day mode activated' 
                              : opt.key === 'dark' 
                                ? 'Dark / Cockpit mode activated' 
                                : 'System auto theme synchronized'
                          );
                        }}
                        className={`theme-option relative flex flex-col items-center justify-center p-3 rounded-xl border transition-all cursor-pointer ${
                          isActive
                            ? 'active bg-[#0A1F4D] border-[#1788FF] text-[#1788FF] shadow-[0_0_12px_rgba(23,136,255,0.25)]'
                            : 'bg-[#081530] border-slate-700/70 text-slate-400 hover:border-slate-500 hover:text-white'
                        }`}
                      >
                        {isActive && (
                          <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#1788FF] text-white flex items-center justify-center text-[10px]">
                            <Check size={10} strokeWidth={3} />
                          </span>
                        )}
                        <Icon size={18} className={isActive ? 'text-[#1788FF]' : 'text-slate-400'} />
                        <span className="text-xs font-semibold mt-1">{opt.label}</span>
                        <span className="text-[10px] opacity-70 mt-0.5">{opt.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Language Selector (Quick Cards) */}
              <div className="mb-5">
                <label className="text-slate-400 text-xs mb-2 block font-medium">
                  {t.language || 'Language'} / भाषा
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {([
                    { key: 'English' as const, flag: '🇬🇧', label: 'English', sub: 'International' },
                    { key: 'Hindi' as const, flag: '🇮🇳', label: 'हिन्दी', sub: 'Hindi Interface' },
                  ]).map(opt => {
                    const isActive = language === opt.key;
                    return (
                      <button
                        key={opt.key}
                        onClick={() => handleLanguageChange(opt.key)}
                        className={`language-option relative flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer text-left ${
                          isActive
                            ? 'active bg-[#0A1F4D] border-[#1788FF] text-[#1788FF] shadow-[0_0_12px_rgba(23,136,255,0.25)]'
                            : 'bg-[#081530] border-slate-700/70 text-slate-300 hover:border-slate-500 hover:text-white'
                        }`}
                      >
                        <span className="text-2xl">{opt.flag}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold leading-tight">{opt.label}</div>
                          <div className="text-[10px] text-slate-400 truncate mt-0.5">{opt.sub}</div>
                        </div>
                        {isActive && (
                          <span className="w-4 h-4 rounded-full bg-[#1788FF] text-white flex items-center justify-center text-[10px] shrink-0">
                            <Check size={10} strokeWidth={3} />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Accent Color */}
              <div className="mb-5">
                <label className="text-slate-400 text-xs mb-2 block font-medium">{t.accentColorLabel || 'Accent Color'}</label>
                <div className="flex items-center gap-3">
                  {accentColors.map(color => (
                    <button
                      key={color}
                      onClick={() => {
                        setAccentColor(color);
                        api.updateUserAppearance({ accentColor: color }, email);
                        triggerToast('Accent color updated');
                      }}
                      className={`w-7 h-7 rounded-full transition-all cursor-pointer flex items-center justify-center ${
                        accentColor === color ? 'scale-110' : 'hover:scale-110'
                      }`}
                      style={{ 
                        backgroundColor: color, 
                        boxShadow: accentColor === color ? `0 0 0 2px #0A1838, 0 0 0 4px ${color}` : undefined 
                      }}
                      title={color}
                    >
                      {accentColor === color && <Check size={12} className="text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Size */}
              <div>
                <label className="text-slate-400 text-xs mb-2 block font-medium">{t.fontSizeLabel || 'Font Size'}</label>
                <div className="grid grid-cols-3 gap-2.5">
                  {([
                    { key: 'small' as const, label: t.fontSmall || 'Small', size: 'text-xs', spec: '14.5px' },
                    { key: 'medium' as const, label: t.fontMedium || 'Medium', size: 'text-sm', spec: '16px' },
                    { key: 'large' as const, label: t.fontLarge || 'Large', size: 'text-base', spec: '17.5px' },
                  ]).map(opt => {
                    const isActive = fontSize === opt.key;
                    return (
                      <button
                        key={opt.key}
                        onClick={() => {
                          setFontSize(opt.key);
                          api.updateUserAppearance({ fontSize: opt.key }, email);
                          triggerToast(t.fontSizeUpdated || 'Font size updated');
                        }}
                        className={`py-2 px-2 rounded-xl border text-center font-medium transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                          isActive
                            ? 'bg-[#1788FF] border-[#1788FF] text-white shadow-md'
                            : 'bg-[#081530] border-slate-700/70 text-slate-400 hover:border-slate-500 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-1">
                          <span className={`${opt.size} font-bold`}>A</span>
                          <span className="text-xs font-semibold">{opt.label}</span>
                        </div>
                        <span className={`text-[10px] ${isActive ? 'text-blue-100' : 'text-slate-500'}`}>{opt.spec}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* ── INTEGRATIONS ── */}
          <div ref={sectionRefs.integrations} className={cardClass}>
            <div>
              <h2 className="text-base md:text-lg font-bold text-white mb-0.5">{t.integrationsSectionTitle || 'Integrations'}</h2>
              <p className="text-xs text-slate-400 mb-3">{t.integrationsSectionDesc || 'Connect with third-party services.'}</p>

              <div className="flex flex-col gap-1">
                {[
                  {
                    id: 'google',
                    icon: (
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z" />
                        <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z" />
                        <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15Z" />
                        <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z" />
                      </svg>
                    ),
                    bg: 'bg-white/10',
                    label: t.googleAccountLabel || 'Google Account',
                    desc: t.googleAccountDesc || 'Sync and sign in with Google',
                    action: 'connect'
                  },
                  {
                    id: 'calendar',
                    icon: <Calendar size={16} className="text-blue-400" />,
                    bg: 'bg-blue-500/15 border border-blue-500/30',
                    label: t.calendarLabel || 'Calendar (Google)',
                    desc: t.calendarDesc || 'Import flight dates to your calendar',
                    action: 'connect'
                  },
                  {
                    id: 'email',
                    icon: <Mail size={16} className="text-rose-400" />,
                    bg: 'bg-rose-500/15 border border-rose-500/30',
                    label: t.emailIntegrationLabel || 'Email (Gmail/Outlook)',
                    desc: t.emailIntegrationDesc || 'Receive travel updates',
                    action: 'connect'
                  },
                  {
                    id: 'discord',
                    icon: (
                      <svg className="w-4 h-4 fill-[#5865F2]" viewBox="0 0 24 24">
                        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                      </svg>
                    ),
                    bg: 'bg-[#5865F2]/15 border border-[#5865F2]/30',
                    label: t.discordLabel || 'Discord',
                    desc: t.discordDesc || 'Get updates in your server',
                    action: 'connect'
                  },
                  {
                    id: 'apiAccess',
                    icon: <Code2 size={16} className="text-cyan-400" />,
                    bg: 'bg-cyan-500/15 border border-cyan-500/30',
                    label: t.apiAccessLabel || 'API Access',
                    desc: t.apiAccessDesc || 'For researchers and developers',
                    action: 'manage'
                  },
                ].map((item) => {
                  const isConnected = !!integrations[item.id];
                  return (
                    <div key={item.id} className="integration-row flex items-center justify-between py-2 border-b border-slate-800/80 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className={`w-8.5 h-8.5 rounded-xl ${item.bg} flex items-center justify-center shrink-0`}>
                          {item.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-white text-xs font-semibold leading-tight">{item.label}</h4>
                            {isConnected && item.action === 'connect' && (
                              <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-bold">Connected</span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">{item.desc}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          if (item.action === 'manage') {
                            setShowApiKeyModal(true);
                          } else {
                            handleToggleIntegration(item.id);
                          }
                        }}
                        className={`settings-action-btn px-4 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                          item.action === 'manage'
                            ? 'bg-[#081530] border-blue-500/30 text-blue-400 hover:bg-blue-500/15 hover:border-blue-500/60 hover:text-white'
                            : isConnected 
                              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 hover:bg-red-500/15 hover:border-red-500/40 hover:text-red-400' 
                              : 'bg-[#081530] border-blue-500/30 text-blue-400 hover:bg-blue-500/15 hover:border-blue-500/60 hover:text-white'
                        }`}
                      >
                        {item.action === 'manage' ? (t.manageBtn || 'Manage') : isConnected ? 'Disconnect' : (t.connectBtn || 'Connect')}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════
           ROW 3: Account | Help & Support | App Information
           ══════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── ACCOUNT ── */}
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
                  {t.manageSubscriptionBtn || 'Manage Subscription'}
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

          {/* ── APP INFORMATION ── */}
          <div className={cardClass}>
            <div>
              <h2 className="text-base md:text-lg font-bold text-white mb-0.5">{t.appInfoTitle || 'App Information'}</h2>
              <p className="text-xs text-slate-400 mb-3">{t.appInfoDesc || 'Version, legal and other details.'}</p>

              <p className="text-white font-bold text-xs mb-2 tracking-wide">{t.appVersion || 'AERONEX v1.0.0'}</p>

              <div className="flex items-center gap-3 text-xs text-blue-400 mb-4 font-medium">
                <a href="#" onClick={(e) => { e.preventDefault(); triggerToast('AeroNex Terms of Service v1.0 (India DGCA Compliance)'); }} className="hover:underline">{t.termsOfService || 'Terms of Service'}</a>
                <span className="text-slate-600">|</span>
                <a href="#" onClick={(e) => { e.preventDefault(); triggerToast('AeroNex Privacy Policy — Zero Personal Flight Data Selling'); }} className="hover:underline">{t.privacyPolicyLink || 'Privacy Policy'}</a>
                <span className="text-slate-600">|</span>
                <a href="#" onClick={(e) => { e.preventDefault(); triggerToast('AeroNex Aviation Intelligence Platform — Built with React, Vite, Node & Gemini'); }} className="hover:underline">{t.aboutLink || 'About'}</a>
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
              <code>{`curl -X GET "https://api.aeronex.com/v1/routes" \\
  -H "Authorization: Bearer ${apiKey}"`}</code>
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

      {/* 5. Manage Subscription Modal */}
      <ModalWrapper
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        title="Subscription & Billing"
        subtitle="Manage your AeroNex access tier and privileges"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0B254E] to-[#081736] border border-blue-500/30">
            <div className="flex items-center justify-between mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 text-[10px] font-bold uppercase tracking-wider border border-cyan-500/40">
                Active Tier
              </span>
              <span className="text-xs font-mono text-emerald-400">₹4,999 / Year</span>
            </div>
            <h4 className="text-lg font-bold text-white">Researcher / Pro Member</h4>
            <p className="text-xs text-slate-400 mt-1">Renewal Date: 10 Oct 2026 • Auto-renews annually</p>

            <ul className="mt-3 space-y-1.5 text-xs text-slate-300 border-t border-slate-700/60 pt-3">
              <li className="flex items-center gap-2"><Check size={14} className="text-emerald-400" /> Live 5-second polling on all Indian airfare corridors</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-emerald-400" /> Full CPI inflation analytics & historical regression models</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-emerald-400" /> Gemini ML predictive confidence breakdown</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-emerald-400" /> 10,000 requests/month Developer API Access</li>
            </ul>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => {
                setShowSubscriptionModal(false);
                triggerToast('Invoice history dispatched to your email.');
              }}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 cursor-pointer"
            >
              Download Invoices
            </button>
            <button
              onClick={() => {
                setShowSubscriptionModal(false);
                triggerToast('Subscription is active and in good standing.');
              }}
              className="px-5 py-2 rounded-xl bg-[#1788FF] text-white text-xs font-semibold hover:bg-blue-600 cursor-pointer"
            >
              Manage Plan
            </button>
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
              <h5 className="font-bold text-white text-sm">Ticket Registered Successfully</h5>
              <p className="text-xs text-slate-300">Reference: #TKT-{Date.now().toString().slice(-6)}. Check your email for confirmation.</p>
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
                  <option value="Billing">Billing & Subscription</option>
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

    </DashboardLayout>
  );
}
