import crypto from 'crypto';
import { JsonStore } from '../store/jsonStore';
import { liveDataStore } from '../liveDataStore';
import { userService } from './userService';

export type AlertStatus = 'Active' | 'Paused' | 'Triggered';

export interface PriceAlert {
  id: string;
  origin: string;
  destination: string;
  route: string;
  targetPrice: number;
  currentFare: number | null;
  previousFare: number | null;
  airline: string;
  date: string;
  cabinClass: string;
  channels: string[];
  status: AlertStatus;
  createdAt: string;
  lastCheckedAt: string | null;
  triggeredAt: string | null;
}

export interface AppNotification {
  id: string;
  message: string;
  read: boolean;
  timestamp: string;
  alertId?: string;
}

const IATA = /^[A-Z]{3}$/;
const MAX_ALERTS_PER_USER = 50;
const MAX_NOTIFICATIONS = 50;

class AlertService {
  private alerts = new JsonStore<PriceAlert[]>('alerts');
  private notifications = new JsonStore<AppNotification[]>('notifications');

  list(userId: string): PriceAlert[] {
    return this.alerts.get(userId) || [];
  }

  create(userId: string, input: any): PriceAlert {
    const origin = String(input?.origin || '').toUpperCase();
    const destination = String(input?.destination || '').toUpperCase();
    if (!IATA.test(origin) || !IATA.test(destination)) throw new Error('Origin and destination must be valid 3-letter airport codes.');
    if (origin === destination) throw new Error('Origin and destination must be different airports.');
    const targetPrice = Number(input?.targetPrice);
    if (!Number.isFinite(targetPrice) || targetPrice < 500 || targetPrice > 500000) {
      throw new Error('Target price must be between ₹500 and ₹5,00,000.');
    }

    const existing = this.list(userId);
    if (existing.length >= MAX_ALERTS_PER_USER) throw new Error(`You can track up to ${MAX_ALERTS_PER_USER} alerts. Delete one to add another.`);
    const route = `${origin}-${destination}`;
    const date = typeof input?.date === 'string' ? input.date.slice(0, 10) : '';
    // Prevent duplicate alerts for the same route, date and target.
    if (existing.some(a => a.route === route && a.date === date && a.targetPrice === targetPrice && a.status !== 'Triggered')) {
      throw new Error('You already have an alert for this route, date and target price.');
    }

    const tracked = liveDataStore.getAllRoutes().find(r => r.route === route);
    const alert: PriceAlert = {
      id: `alert_${crypto.randomUUID()}`,
      origin,
      destination,
      route,
      targetPrice: Math.round(targetPrice),
      currentFare: tracked ? tracked.currentFare : null,
      previousFare: tracked ? tracked.previousFare : null,
      airline: String(input?.airline || 'Any Airline').slice(0, 60),
      date,
      cabinClass: String(input?.cabinClass || 'Economy').slice(0, 30),
      channels: Array.isArray(input?.channels) ? input.channels.map((c: unknown) => String(c).slice(0, 30)).slice(0, 5) : ['Push Notification'],
      status: 'Active',
      createdAt: new Date().toISOString(),
      lastCheckedAt: tracked ? new Date().toISOString() : null,
      triggeredAt: null,
    };
    this.alerts.set(userId, [alert, ...existing]);
    return alert;
  }

  toggle(userId: string, id: string): PriceAlert | null {
    const all = this.list(userId);
    const target = all.find(a => a.id === id);
    if (!target) return null;
    target.status = target.status === 'Active' ? 'Paused' : 'Active';
    if (target.status === 'Active') target.triggeredAt = null;
    this.alerts.set(userId, all);
    return target;
  }

  remove(userId: string, id: string): boolean {
    const all = this.list(userId);
    const next = all.filter(a => a.id !== id);
    if (next.length === all.length) return false;
    this.alerts.set(userId, next);
    return true;
  }

  listNotifications(userId: string): AppNotification[] {
    return this.notifications.get(userId) || [];
  }

  markAllRead(userId: string) {
    this.notifications.set(userId, this.listNotifications(userId).map(n => ({ ...n, read: true })));
  }

  markRead(userId: string, id: string) {
    this.notifications.set(userId, this.listNotifications(userId).map(n => (n.id === id ? { ...n, read: true } : n)));
  }

  private notify(userId: string, message: string, alertId?: string) {
    const list = this.listNotifications(userId);
    list.unshift({ id: crypto.randomUUID(), message, read: false, timestamp: new Date().toISOString(), alertId });
    this.notifications.set(userId, list.slice(0, MAX_NOTIFICATIONS));
  }

  /** Runs after every ingestion cycle: compares observed fares to each user's targets. */
  evaluateAll(): number {
    const fares = new Map(liveDataStore.getAllRoutes().map(r => [r.route, r]));
    let triggered = 0;
    for (const [userId, list] of this.alerts.entries()) {
      let changed = false;
      for (const alert of list) {
        const fare = fares.get(alert.route);
        if (!fare) continue;
        alert.previousFare = alert.currentFare;
        alert.currentFare = fare.currentFare;
        alert.lastCheckedAt = new Date().toISOString();
        changed = true;
        if (alert.status === 'Active' && fare.currentFare <= alert.targetPrice) {
          alert.status = 'Triggered';
          alert.triggeredAt = new Date().toISOString();
          triggered++;
          const pref = this.userWantsPriceAlerts(userId);
          if (pref) {
            this.notify(
              userId,
              `Target reached for ${alert.origin} → ${alert.destination}: ₹${fare.currentFare.toLocaleString('en-IN')} (your target ₹${alert.targetPrice.toLocaleString('en-IN')}).`,
              alert.id,
            );
          }
        }
      }
      if (changed) this.alerts.set(userId, list);
    }
    return triggered;
  }

  private userWantsPriceAlerts(userId: string): boolean {
    const record = userService.peek(userId);
    return record ? record.notifications.priceDropAlerts : true;
  }

  deleteAllForUser(userId: string) {
    this.alerts.delete(userId);
    this.notifications.delete(userId);
  }
}

export const alertService = new AlertService();
