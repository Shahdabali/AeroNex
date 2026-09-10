export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
  organization?: string;
  phone?: string;
  bio?: string;
  verified?: boolean;
}

export interface TravelPreferences {
  departureCity: string;
  destinationCity: string;
  travelClass: string;
  currency: string;
  language: string;
  dateFormat: string;
  showAltAirports: boolean;
}

export interface NotificationSettings {
  priceDropAlerts: boolean;
  routeUpdates: boolean;
  travelDeals: boolean;
  weeklyReports: boolean;
  productUpdates: boolean;
  marketingNotifs: boolean;
}

export interface AppearanceSettings {
  theme: 'light' | 'dark' | 'system';
  accentColor: string;
  fontSize: 'small' | 'medium' | 'large';
}

export interface IntegrationStatus {
  google: boolean;
  calendar: boolean;
  email: boolean;
  discord: boolean;
  apiAccess: boolean;
  apiKey: string;
}

export interface FullUserData {
  profile: UserProfile;
  preferences: TravelPreferences;
  notifications: NotificationSettings;
  appearance: AppearanceSettings;
  integrations: IntegrationStatus;
  subscription: {
    plan: string;
    status: string;
    renewalDate: string;
    billingCycle: string;
  };
  passwordHash: string; // demo password tracking
}

export interface SupportTicket {
  id: string;
  userId?: string;
  email: string;
  subject: string;
  category: string;
  message: string;
  status: 'Open' | 'Resolved' | 'In-Review';
  createdAt: string;
}

export interface FeedbackItem {
  id: string;
  userId?: string;
  email?: string;
  rating: number;
  category: string;
  comments: string;
  createdAt: string;
}

class UserService {
  private users: Map<string, FullUserData> = new Map();
  private supportTickets: SupportTicket[] = [];
  private feedbackList: FeedbackItem[] = [];

  constructor() {
    // Pre-seed the primary user (Shadab Ali) matching frontend
    const defaultUser: FullUserData = {
      profile: {
        id: 'usr_shadab',
        name: 'Shadab Ali',
        email: 'shadab@aeronex.com',
        role: 'Researcher',
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
        organization: 'Student / Researcher',
        phone: '98765 43210',
        bio: 'Exploring data-driven insights to make travel more accessible and affordable.',
        verified: true,
      },
      preferences: {
        departureCity: 'DEL',
        destinationCity: 'BOM',
        travelClass: 'Economy',
        currency: 'INR (₹)',
        language: 'English',
        dateFormat: 'DD MMM YYYY (10 Sep 2026)',
        showAltAirports: true,
      },
      notifications: {
        priceDropAlerts: true,
        routeUpdates: true,
        travelDeals: true,
        weeklyReports: true,
        productUpdates: false,
        marketingNotifs: false,
      },
      appearance: {
        theme: 'dark',
        accentColor: '#1788FF',
        fontSize: 'medium',
      },
      integrations: {
        google: false,
        calendar: false,
        email: false,
        discord: false,
        apiAccess: true,
        apiKey: 'aeronex_live_sk_948f2c1b8e47a6d3f0',
      },
      subscription: {
        plan: 'Researcher Tier (Pro)',
        status: 'Active',
        renewalDate: '10 Oct 2026',
        billingCycle: 'Annual',
      },
      passwordHash: 'password123',
    };

    this.users.set(defaultUser.profile.email.toLowerCase(), defaultUser);
    this.users.set('shadabali@example.com', {
      ...defaultUser,
      profile: { ...defaultUser.profile, email: 'shadabali@example.com' },
    });
  }

  public getUser(idOrEmail?: string): FullUserData {
    if (!idOrEmail) {
      return this.users.get('shadab@aeronex.com')!;
    }
    const emailKey = idOrEmail.toLowerCase();
    for (const [key, user] of this.users.entries()) {
      if (key === emailKey || user.profile.id === idOrEmail || user.profile.email.toLowerCase() === emailKey) {
        return user;
      }
    }
    // If not found, return or create a realistic default
    const fallback: FullUserData = {
      profile: {
        id: `usr_${Date.now()}`,
        name: idOrEmail.includes('@') ? idOrEmail.split('@')[0] : idOrEmail,
        email: idOrEmail.includes('@') ? idOrEmail : `${idOrEmail}@aeronex.com`,
        role: 'Passenger',
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
        organization: 'AeroNex Member',
        phone: '98765 43210',
        bio: 'Passenger exploring real-time airfares.',
        verified: true,
      },
      preferences: {
        departureCity: 'DEL',
        destinationCity: 'BOM',
        travelClass: 'Economy',
        currency: 'INR (₹)',
        language: 'English',
        dateFormat: 'DD MMM YYYY (10 Sep 2026)',
        showAltAirports: true,
      },
      notifications: {
        priceDropAlerts: true,
        routeUpdates: true,
        travelDeals: true,
        weeklyReports: true,
        productUpdates: false,
        marketingNotifs: false,
      },
      appearance: {
        theme: 'dark',
        accentColor: '#1788FF',
        fontSize: 'medium',
      },
      integrations: {
        google: false,
        calendar: false,
        email: false,
        discord: false,
        apiAccess: true,
        apiKey: `aeronex_live_sk_${Math.random().toString(36).substring(2, 12)}`,
      },
      subscription: {
        plan: 'Passenger Tier (Free)',
        status: 'Active',
        renewalDate: 'Lifetime',
        billingCycle: 'Free',
      },
      passwordHash: 'password123',
    };
    this.users.set(fallback.profile.email.toLowerCase(), fallback);
    return fallback;
  }

  public updateProfile(idOrEmail: string, data: Partial<UserProfile>): UserProfile {
    const user = this.getUser(idOrEmail);
    user.profile = { ...user.profile, ...data };
    return user.profile;
  }

  public updateAvatar(idOrEmail: string, avatarUrl: string): UserProfile {
    const user = this.getUser(idOrEmail);
    user.profile.avatarUrl = avatarUrl;
    return user.profile;
  }

  public updatePreferences(idOrEmail: string, prefs: Partial<TravelPreferences>): TravelPreferences {
    const user = this.getUser(idOrEmail);
    user.preferences = { ...user.preferences, ...prefs };
    return user.preferences;
  }

  public updateNotifications(idOrEmail: string, notifs: Partial<NotificationSettings>): NotificationSettings {
    const user = this.getUser(idOrEmail);
    user.notifications = { ...user.notifications, ...notifs };
    return user.notifications;
  }

  public updateAppearance(idOrEmail: string, app: Partial<AppearanceSettings>): AppearanceSettings {
    const user = this.getUser(idOrEmail);
    user.appearance = { ...user.appearance, ...app };
    return user.appearance;
  }

  public toggleIntegration(idOrEmail: string, provider: keyof Omit<IntegrationStatus, 'apiKey'>): IntegrationStatus {
    const user = this.getUser(idOrEmail);
    user.integrations[provider] = !user.integrations[provider];
    return user.integrations;
  }

  public regenerateApiKey(idOrEmail: string): string {
    const user = this.getUser(idOrEmail);
    const newKey = `aeronex_live_sk_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`;
    user.integrations.apiKey = newKey;
    return newKey;
  }

  public changePassword(idOrEmail: string, oldPass: string, newPass: string): boolean {
    const user = this.getUser(idOrEmail);
    if (user.passwordHash && user.passwordHash !== oldPass) {
      throw new Error('Current password does not match.');
    }
    if (!newPass || newPass.length < 6) {
      throw new Error('New password must be at least 6 characters long.');
    }
    user.passwordHash = newPass;
    return true;
  }

  public deleteAccount(idOrEmail: string): boolean {
    const user = this.getUser(idOrEmail);
    this.users.delete(user.profile.email.toLowerCase());
    if (user.profile.id) this.users.delete(user.profile.id);
    return true;
  }

  public exportUserData(idOrEmail: string): any {
    const user = this.getUser(idOrEmail);
    return {
      metadata: {
        exportedAt: new Date().toISOString(),
        service: 'AeroNex Airfare Intelligence Platform',
        version: '1.0.0',
        environment: 'Production',
      },
      account: {
        ...user.profile,
      },
      preferences: user.preferences,
      notificationSettings: user.notifications,
      appearance: user.appearance,
      activeIntegrations: {
        googleConnected: user.integrations.google,
        calendarConnected: user.integrations.calendar,
        emailConnected: user.integrations.email,
        discordConnected: user.integrations.discord,
        apiKeyActive: !!user.integrations.apiKey,
      },
      subscription: user.subscription,
      activity: {
        recentSearches: [
          { from: 'DEL', to: 'BOM', date: '2026-09-12', timestamp: '2026-09-10T14:30:00Z' },
          { from: 'BOM', to: 'BLR', date: '2026-09-15', timestamp: '2026-09-09T18:22:00Z' },
          { from: 'DEL', to: 'GOI', date: '2026-09-20', timestamp: '2026-09-08T11:05:00Z' },
        ],
        trackedAlerts: [
          { route: 'DEL-BOM', targetFare: 5200, status: 'Active' },
          { route: 'BOM-BLR', targetFare: 4100, status: 'Active' },
        ],
      },
    };
  }

  // Support & Feedback
  public addSupportTicket(ticket: Omit<SupportTicket, 'id' | 'createdAt' | 'status'>): SupportTicket {
    const newTicket: SupportTicket = {
      id: `tkt_${Date.now()}`,
      status: 'Open',
      createdAt: new Date().toISOString(),
      ...ticket,
    };
    this.supportTickets.push(newTicket);
    return newTicket;
  }

  public addFeedback(feedback: Omit<FeedbackItem, 'id' | 'createdAt'>): FeedbackItem {
    const newFeedback: FeedbackItem = {
      id: `fb_${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...feedback,
    };
    this.feedbackList.push(newFeedback);
    return newFeedback;
  }
}

export const userService = new UserService();
