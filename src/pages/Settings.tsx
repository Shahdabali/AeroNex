import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { AeroNexLogo } from '../components/AeroNexLogo';
import { usePageTitle } from '../hooks/usePageTitle';
import { useAppContext } from '../context/AppProvider';
import type { Language } from '../i18n/translations';
import {
  Settings as SettingsIcon, User, Sliders, Bell, Shield, Puzzle, Palette,
  KeyRound, HelpCircle, ChevronRight, Camera, BadgeCheck,
  Globe, Calendar, Monitor, Moon, Sun,
  Download, Trash2, Lock, CreditCard, LogOut, MessageSquare,
  Code2, Mail, Check, Database, Plane, FileQuestion,
  Headphones, Package, Tag, ChevronDown, Megaphone, FileText
} from 'lucide-react';

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
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
        checked ? 'bg-[#1788FF]' : 'bg-slate-700'
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
   Main Settings Page
   ═══════════════════════════════════════════════════════════════ */
export function Settings() {
  usePageTitle('Settings');
  const navigate = useNavigate();
  const { user, logout, login, theme, setTheme, language, setLanguage, currency, setCurrency, t } = useAppContext();

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
  const [email] = useState(user?.email || 'shadabali@example.com');
  const [organization, setOrganization] = useState('Student / Researcher');
  const [phone, setPhone] = useState('98765 43210');
  const [bio, setBio] = useState('Exploring data-driven insights to make travel more accessible and affordable.');

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

  /* ─── Appearance ─── */
  const [accentColor, setAccentColor] = useState('#1788FF');
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');

  /* ─── Save / feedback ─── */
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    if (user) {
      login({ ...user, name: fullName });
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
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

  const inputClass = 'settings-input w-full bg-[#081530] border border-slate-700/70 rounded-xl text-white px-4 py-2.5 focus:outline-none focus:border-[#1788FF] transition-all text-sm shadow-inner';
  const selectClass = 'settings-select w-full bg-[#081530] border border-slate-700/70 rounded-xl text-white px-4 py-2.5 focus:outline-none focus:border-[#1788FF] transition-all appearance-none text-sm cursor-pointer shadow-inner';
  const cardClass = 'settings-card bg-[#061433]/70 backdrop-blur-xl border border-blue-500/20 rounded-[20px] p-6 shadow-[0_12px_32px_rgba(0,0,0,0.35)] flex flex-col justify-between';

  /* ═══════════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════════ */
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 max-w-[1400px] pb-12">

        {/* ── HERO BANNER ── */}
        <div className="settings-hero relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#071738] via-[#0B2352] to-[#12306C] border border-blue-500/20 p-6 md:p-8 shadow-xl">
          {/* Subtle Sunset Airplane backdrop on right */}
          <div className="absolute right-0 top-0 h-full w-1/2 overflow-hidden pointer-events-none rounded-r-2xl">
            <img 
              src="/assets/login-hero-clean.jpg" 
              alt="AeroNex Aviation" 
              className="w-full h-full object-cover object-right opacity-30 mix-blend-screen"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#071738] via-[#071738]/60 to-transparent" />
          </div>

          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-[#5D4BF7] to-[#4537D6] flex items-center justify-center shadow-lg shadow-indigo-500/30 text-white shrink-0">
                <SettingsIcon className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{t.settingsPageTitle || 'Settings'}</h1>
                <p className="text-xs md:text-sm text-slate-300 mt-1">{t.settingsPageSubtitle || 'Manage your account, preferences, notifications and data settings.'}</p>
              </div>
            </div>
            <div className="hidden lg:flex flex-col items-end text-right pr-4">
              <span className="hero-tagline text-[11px] font-bold tracking-[0.25em] text-cyan-400 uppercase">{t.settingsHeroTagline || 'CUSTOMIZE YOUR EXPERIENCE'}</span>
              <span className="text-[11px] text-slate-300 mt-1">{t.settingsHeroSubtitle || '— Settings for a smarter journey —'}</span>
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
                className={`settings-tab flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs md:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'active bg-[#1788FF] text-white shadow-[0_0_20px_rgba(23,136,255,0.4)]'
                    : 'bg-[#081530]/80 hover:bg-[#0E2452] border border-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ── SUCCESS TOAST ── */}
        {savedSuccess && (
          <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 rounded-xl text-sm font-medium animate-in fade-in w-fit shadow-lg">
            <Check size={16} className="text-emerald-400" /> {t.savedSuccess || 'Changes saved successfully!'}
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
                        src={user?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop'}
                        alt={user?.name || 'User'}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button 
                      aria-label="Upload photo"
                      className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#1788FF] text-white flex items-center justify-center border-2 border-[#0A1838] shadow-md hover:bg-blue-600 transition-colors cursor-pointer"
                    >
                      <Camera size={12} />
                    </button>
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-white font-bold text-base leading-tight truncate">{user?.name || 'Shadab Ali'}</h3>
                    <p className="text-xs text-slate-400 mt-0.5 leading-tight">{user?.role || 'Researcher'}</p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className="text-xs text-slate-400 truncate">{user?.email || email}</span>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] font-semibold flex items-center gap-1 shrink-0">
                        <BadgeCheck size={11} /> {t.verified || 'Verified'}
                      </span>
                    </div>
                  </div>
                </div>
                <button className="px-3.5 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold flex items-center gap-1.5 hover:bg-blue-500/20 transition-all cursor-pointer shrink-0">
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
              onClick={handleSave}
              className="w-fit bg-gradient-to-r from-[#1788FF] to-[#4E55F5] rounded-xl text-white px-6 py-2.5 text-sm font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition-all cursor-pointer mt-2"
            >
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
                    <select value={departureCity} onChange={e => setDepartureCity(e.target.value)} className={`${selectClass} pl-10 pr-9`}>
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
                    <select value={destinationCity} onChange={e => setDestinationCity(e.target.value)} className={`${selectClass} pl-10 pr-9`}>
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
                      <select value={travelClass} onChange={e => setTravelClass(e.target.value)} className={`${selectClass} pr-8`}>
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
                      <select value={dateFormat} onChange={e => setDateFormat(e.target.value)} className={`${selectClass} pl-8 pr-8`}>
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
                    onChange={e => setShowAltAirports(e.target.checked)}
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
                  <ToggleSwitch checked={priceDropAlerts} onChange={setPriceDropAlerts} />
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
                  <ToggleSwitch checked={routeUpdates} onChange={setRouteUpdates} />
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
                  <ToggleSwitch checked={travelDeals} onChange={setTravelDeals} />
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
                  <ToggleSwitch checked={weeklyReports} onChange={setWeeklyReports} />
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
                  <ToggleSwitch checked={productUpdates} onChange={setProductUpdates} />
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
                  <ToggleSwitch checked={marketingNotifs} onChange={setMarketingNotifs} />
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
                <button className="settings-row flex items-center justify-between py-3 px-2 border-b border-slate-800/80 hover:bg-white/5 transition-all rounded-xl cursor-pointer group text-left">
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

                <button className="settings-row flex items-center justify-between py-3 px-2 border-b border-slate-800/80 hover:bg-white/5 transition-all rounded-xl cursor-pointer group text-left">
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

                <button className="settings-row flex items-center justify-between py-3 px-2 hover:bg-red-500/10 transition-all rounded-xl cursor-pointer group text-left">
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
              <div className="mb-4">
                <label className="text-slate-400 text-xs mb-2 block font-medium">{t.themeLabel || 'Theme'}</label>
                <div className="grid grid-cols-3 gap-2.5">
                  {([
                    { key: 'light' as const, icon: Sun, label: t.light || 'Light' },
                    { key: 'dark' as const, icon: Moon, label: t.dark || 'Dark' },
                    { key: 'system' as const, icon: Monitor, label: t.systemTheme || 'System' },
                  ]).map(opt => {
                    const Icon = opt.icon;
                    const isActive = opt.key === 'system' ? false : theme === opt.key;
                    return (
                      <button
                        key={opt.key}
                        onClick={() => { if (opt.key !== 'system') setTheme(opt.key); }}
                        className={`theme-option flex flex-col items-center gap-1.5 py-3 rounded-xl border transition-all cursor-pointer ${
                          isActive
                            ? 'active bg-[#0A1F4D] border-[#1788FF] text-[#1788FF] shadow-[0_0_12px_rgba(23,136,255,0.25)]'
                            : 'bg-[#081530] border-slate-700/70 text-slate-400 hover:border-slate-500 hover:text-white'
                        }`}
                      >
                        <Icon size={18} />
                        <span className="text-xs font-semibold">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Accent Color */}
              <div className="mb-4">
                <label className="text-slate-400 text-xs mb-2 block font-medium">{t.accentColorLabel || 'Accent Color'}</label>
                <div className="flex items-center gap-3">
                  {accentColors.map(color => (
                    <button
                      key={color}
                      onClick={() => setAccentColor(color)}
                      className={`w-7 h-7 rounded-full transition-all cursor-pointer flex items-center justify-center ${
                        accentColor === color ? 'scale-110' : 'hover:scale-110'
                      }`}
                      style={{ 
                        backgroundColor: color, 
                        boxShadow: accentColor === color ? `0 0 0 2px #0A1838, 0 0 0 4px ${color}` : undefined 
                      }}
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
                    { key: 'small' as const, label: t.fontSmall || 'Small', size: 'text-xs' },
                    { key: 'medium' as const, label: t.fontMedium || 'Medium', size: 'text-sm' },
                    { key: 'large' as const, label: t.fontLarge || 'Large', size: 'text-base' },
                  ]).map(opt => (
                    <button
                      key={opt.key}
                      onClick={() => setFontSize(opt.key)}
                      className={`py-2 rounded-xl border text-center font-medium transition-all cursor-pointer ${
                        fontSize === opt.key
                          ? 'bg-[#1788FF] border-[#1788FF] text-white shadow-md'
                          : 'bg-[#081530] border-slate-700/70 text-slate-400 hover:border-slate-500 hover:text-white'
                      }`}
                    >
                      <span className={`${opt.size} font-bold`}>A</span> <span className="text-xs ml-1 font-semibold">{opt.label}</span>
                    </button>
                  ))}
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
                    icon: <Calendar size={16} className="text-blue-400" />,
                    bg: 'bg-blue-500/15 border border-blue-500/30',
                    label: t.calendarLabel || 'Calendar (Google)',
                    desc: t.calendarDesc || 'Import flight dates to your calendar',
                    action: 'connect'
                  },
                  {
                    icon: <Mail size={16} className="text-rose-400" />,
                    bg: 'bg-rose-500/15 border border-rose-500/30',
                    label: t.emailIntegrationLabel || 'Email (Gmail/Outlook)',
                    desc: t.emailIntegrationDesc || 'Receive travel updates',
                    action: 'connect'
                  },
                  {
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
                    icon: <Code2 size={16} className="text-cyan-400" />,
                    bg: 'bg-cyan-500/15 border border-cyan-500/30',
                    label: t.apiAccessLabel || 'API Access',
                    desc: t.apiAccessDesc || 'For researchers and developers',
                    action: 'manage'
                  },
                ].map((item, i) => (
                  <div key={i} className="integration-row flex items-center justify-between py-2 border-b border-slate-800/80 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className={`w-8.5 h-8.5 rounded-xl ${item.bg} flex items-center justify-center shrink-0`}>
                        {item.icon}
                      </div>
                      <div>
                        <h4 className="text-white text-xs font-semibold leading-tight">{item.label}</h4>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">{item.desc}</p>
                      </div>
                    </div>
                    <button className="settings-action-btn px-4 py-1.5 rounded-xl bg-[#081530] border border-blue-500/30 text-xs font-semibold text-blue-400 hover:bg-blue-500/15 hover:border-blue-500/60 hover:text-white transition-all cursor-pointer">
                      {item.action === 'manage' ? (t.manageBtn || 'Manage') : (t.connectBtn || 'Connect')}
                    </button>
                  </div>
                ))}
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
                <button className="settings-action-btn flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#081530] border border-slate-700/80 text-xs font-semibold text-slate-300 hover:border-blue-500 hover:text-white transition-all cursor-pointer">
                  <Lock size={14} className="text-blue-400" />
                  {t.changePasswordBtn || 'Change Password'}
                </button>
                <button className="settings-action-btn flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#081530] border border-slate-700/80 text-xs font-semibold text-slate-300 hover:border-blue-500 hover:text-white transition-all cursor-pointer">
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
                <button className="settings-action-btn flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#081530] border border-slate-700/80 text-xs font-semibold text-slate-300 hover:border-blue-500 hover:text-white transition-all cursor-pointer">
                  <FileQuestion size={14} className="text-blue-400" />
                  {t.faqsBtn || 'FAQs'}
                </button>
                <button className="settings-action-btn flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#081530] border border-slate-700/80 text-xs font-semibold text-slate-300 hover:border-blue-500 hover:text-white transition-all cursor-pointer">
                  <Headphones size={14} className="text-emerald-400" />
                  {t.contactSupportBtn || 'Contact Support'}
                </button>
                <button className="settings-action-btn flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#081530] border border-slate-700/80 text-xs font-semibold text-slate-300 hover:border-blue-500 hover:text-white transition-all cursor-pointer">
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
                <a href="#" className="hover:underline">{t.termsOfService || 'Terms of Service'}</a>
                <span className="text-slate-600">|</span>
                <a href="#" className="hover:underline">{t.privacyPolicyLink || 'Privacy Policy'}</a>
                <span className="text-slate-600">|</span>
                <a href="#" className="hover:underline">{t.aboutLink || 'About'}</a>
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
    </DashboardLayout>
  );
}
