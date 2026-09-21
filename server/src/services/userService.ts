import crypto from 'crypto';
import { JsonStore } from '../store/jsonStore';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
  organization?: string;
  phone?: string;
  bio?: string;
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
  email: boolean;
  apiAccess: boolean;
  apiKey: string;
}

export interface FullUserData {
  profile: UserProfile;
  preferences: TravelPreferences;
  notifications: NotificationSettings;
  appearance: AppearanceSettings;
  integrations: IntegrationStatus;
  createdAt: string;
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

export interface Identity {
  id: string;
  email: string;
  name?: string;
}

const newApiKey = () => `aeronex_live_sk_${crypto.randomBytes(16).toString('hex')}`;

function defaultsFor(identity: Identity): FullUserData {
  return {
    profile: {
      id: identity.id,
      name: identity.name || identity.email.split('@')[0] || 'AeroNex Member',
      email: identity.email,
      role: 'Passenger',
    },
    preferences: {
      departureCity: 'DEL',
      destinationCity: 'BOM',
      travelClass: 'Economy',
      currency: 'INR (₹)',
      language: 'English',
      dateFormat: 'DD MMM YYYY',
      showAltAirports: true,
    },
    notifications: {
      priceDropAlerts: true,
      routeUpdates: true,
      travelDeals: false,
      weeklyReports: false,
      productUpdates: false,
      marketingNotifs: false,
    },
    appearance: { theme: 'dark', accentColor: '#1788FF', fontSize: 'medium' },
    integrations: { google: false, email: false, apiAccess: true, apiKey: newApiKey() },
    createdAt: new Date().toISOString(),
  };
}

// Whitelists guard against mass-assignment (clients can only touch known fields).
const pick = <T extends object>(source: any, keys: (keyof T)[]): Partial<T> => {
  const out: Partial<T> = {};
  if (!source || typeof source !== 'object') return out;
  for (const k of keys) if (source[k] !== undefined) (out as any)[k] = source[k];
  return out;
};

const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : undefined);

// Avatars arrive as data URLs; keep them bounded (~1.5 MB decoded).
const MAX_AVATAR_CHARS = 2_000_000;

class UserService {
  private users = new JsonStore<FullUserData>('users');
  private supportTickets = new JsonStore<SupportTicket>('support_tickets');
  private feedbackList = new JsonStore<FeedbackItem>('feedback');

  /** Returns the caller's record, creating it on first use. Keyed by verified auth user id. */
  public getOrCreate(identity: Identity): FullUserData {
    const existing = this.users.get(identity.id);
    if (existing) return existing;
    const created = defaultsFor(identity);
    this.users.set(identity.id, created);
    return created;
  }

  /** Read-only lookup that never creates a record. */
  public peek(userId: string): FullUserData | undefined {
    return this.users.get(userId);
  }

  public findByApiKey(key: string): UserProfile | null {
    for (const [, u] of this.users.entries()) {
      if (u.integrations.apiAccess && u.integrations.apiKey === key) return u.profile;
    }
    return null;
  }

  private save(user: FullUserData) {
    this.users.set(user.profile.id, user);
  }

  public updateProfile(identity: Identity, data: any): UserProfile {
    const user = this.getOrCreate(identity);
    const updates = pick<UserProfile>(data, ['name', 'organization', 'phone', 'bio']);
    const name = str(updates.name, 100);
    if (updates.name !== undefined && (!name || name.length < 2)) {
      throw new Error('Name must be at least 2 characters.');
    }
    user.profile = {
      ...user.profile,
      ...(name ? { name } : {}),
      ...(updates.organization !== undefined ? { organization: str(updates.organization, 120) } : {}),
      ...(updates.phone !== undefined ? { phone: str(updates.phone, 30) } : {}),
      ...(updates.bio !== undefined ? { bio: str(updates.bio, 500) } : {}),
    };
    this.save(user);
    return user.profile;
  }

  public updateAvatar(identity: Identity, avatarUrl: string): UserProfile {
    if (typeof avatarUrl !== 'string' || avatarUrl.length > MAX_AVATAR_CHARS) {
      throw new Error('Avatar image is too large. Please choose an image under 1.5 MB.');
    }
    if (!/^data:image\/(png|jpe?g|webp|gif);base64,/.test(avatarUrl) && !/^https:\/\//.test(avatarUrl)) {
      throw new Error('Avatar must be a PNG, JPEG, WebP or GIF image.');
    }
    const user = this.getOrCreate(identity);
    user.profile.avatarUrl = avatarUrl;
    this.save(user);
    return user.profile;
  }

  public updatePreferences(identity: Identity, prefs: any): TravelPreferences {
    const user = this.getOrCreate(identity);
    const clean = pick<TravelPreferences>(prefs, [
      'departureCity', 'destinationCity', 'travelClass', 'currency', 'language', 'dateFormat', 'showAltAirports',
    ]);
    for (const k of ['departureCity', 'destinationCity'] as const) {
      const v = clean[k];
      if (v !== undefined && !/^[A-Za-z]{3}$/.test(String(v))) throw new Error('Airport codes must be 3 letters.');
      if (v !== undefined) clean[k] = String(v).toUpperCase();
    }
    user.preferences = { ...user.preferences, ...clean };
    this.save(user);
    return user.preferences;
  }

  public updateNotifications(identity: Identity, notifs: any): NotificationSettings {
    const user = this.getOrCreate(identity);
    const clean = pick<NotificationSettings>(notifs, [
      'priceDropAlerts', 'routeUpdates', 'travelDeals', 'weeklyReports', 'productUpdates', 'marketingNotifs',
    ]);
    for (const k of Object.keys(clean) as (keyof NotificationSettings)[]) clean[k] = !!clean[k];
    user.notifications = { ...user.notifications, ...clean };
    this.save(user);
    return user.notifications;
  }

  public updateAppearance(identity: Identity, app: any): AppearanceSettings {
    const user = this.getOrCreate(identity);
    const clean = pick<AppearanceSettings>(app, ['theme', 'accentColor', 'fontSize']);
    if (clean.theme !== undefined && !['light', 'dark', 'system'].includes(clean.theme)) throw new Error('Invalid theme.');
    if (clean.fontSize !== undefined && !['small', 'medium', 'large'].includes(clean.fontSize)) throw new Error('Invalid font size.');
    if (clean.accentColor !== undefined && !/^#[0-9a-fA-F]{6}$/.test(clean.accentColor)) throw new Error('Invalid accent color.');
    user.appearance = { ...user.appearance, ...clean };
    this.save(user);
    return user.appearance;
  }

  public toggleIntegration(identity: Identity, provider: string): IntegrationStatus {
    if (!['google', 'email', 'apiAccess'].includes(provider)) throw new Error('Unknown integration.');
    const user = this.getOrCreate(identity);
    const key = provider as 'google' | 'email' | 'apiAccess';
    user.integrations[key] = !user.integrations[key];
    this.save(user);
    return user.integrations;
  }

  public regenerateApiKey(identity: Identity): string {
    const user = this.getOrCreate(identity);
    user.integrations.apiKey = newApiKey();
    this.save(user);
    return user.integrations.apiKey;
  }

  public deleteData(userId: string): void {
    this.users.delete(userId);
  }

  public exportUserData(identity: Identity, extra: Record<string, unknown> = {}) {
    const user = this.getOrCreate(identity);
    const { apiKey, ...integrations } = user.integrations;
    return {
      metadata: {
        exportedAt: new Date().toISOString(),
        service: 'AeroNex Airfare Intelligence Platform',
      },
      account: user.profile,
      preferences: user.preferences,
      notificationSettings: user.notifications,
      appearance: user.appearance,
      integrations: { ...integrations, apiKeyActive: !!apiKey },
      ...extra,
    };
  }

  // Support & Feedback
  public addSupportTicket(ticket: Omit<SupportTicket, 'id' | 'createdAt' | 'status'>): SupportTicket {
    const id = `tkt_${crypto.randomUUID()}`;
    const newTicket: SupportTicket = { id, status: 'Open', createdAt: new Date().toISOString(), ...ticket };
    this.supportTickets.set(id, newTicket);
    return newTicket;
  }

  public addFeedback(feedback: Omit<FeedbackItem, 'id' | 'createdAt'>): FeedbackItem {
    const id = `fb_${crypto.randomUUID()}`;
    const item: FeedbackItem = { id, createdAt: new Date().toISOString(), ...feedback };
    this.feedbackList.set(id, item);
    return item;
  }
}

export const userService = new UserService();
