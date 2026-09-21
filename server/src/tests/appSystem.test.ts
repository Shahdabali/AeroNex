/* eslint-disable @typescript-eslint/no-var-requires */
import os from 'os';
import path from 'path';
import fs from 'fs';

// Point the persisted store at a throwaway directory BEFORE the services are loaded.
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'aeronex-test-'));
process.env.AERONEX_DATA_DIR = dir;

const { userService } = require('../services/userService') as typeof import('../services/userService');
const { alertService } = require('../services/alertService') as typeof import('../services/alertService');
const { liveDataStore } = require('../liveDataStore') as typeof import('../liveDataStore');
const { requireAuth } = require('../middleware/auth') as typeof import('../middleware/auth');
const { createRateLimiter } = require('../middleware/security') as typeof import('../middleware/security');

let passed = 0;
let failed = 0;
function assert(condition: boolean, name: string) {
  if (condition) {
    console.log(`  ✓ ${name}`);
    passed++;
  } else {
    console.error(`  ✗ ${name}`);
    failed++;
  }
}
function throws(fn: () => unknown): string | null {
  try {
    fn();
    return null;
  } catch (e: any) {
    return e.message as string;
  }
}

async function run() {
  const me = { id: 'user-a', email: 'a@example.com', name: 'Ada' };
  const other = { id: 'user-b', email: 'b@example.com' };

  console.log('[1] User service');
  const u = userService.getOrCreate(me);
  assert(u.profile.email === 'a@example.com' && u.profile.role === 'Passenger', 'creates a default record from the verified identity');
  assert(userService.getOrCreate(other).profile.id === 'user-b', 'records are isolated per user id');
  userService.updateProfile(me, { name: 'Ada L', role: 'Admin', id: 'hijack', email: 'evil@example.com' });
  const after = userService.getOrCreate(me).profile;
  assert(after.name === 'Ada L', 'allowed profile fields update');
  assert(after.role === 'Passenger' && after.id === 'user-a' && after.email === 'a@example.com', 'role, id and email cannot be changed by the client');
  assert(throws(() => userService.updateProfile(me, { name: 'x' })) !== null, 'too-short name is rejected');
  assert(throws(() => userService.updateAvatar(me, 'javascript:alert(1)')) !== null, 'non-image avatar is rejected');
  assert(throws(() => userService.updateAppearance(me, { theme: 'neon' })) !== null, 'invalid theme is rejected');
  assert(throws(() => userService.toggleIntegration(me, 'discord')) !== null, 'unknown integration is rejected');
  const key = userService.regenerateApiKey(me);
  assert(userService.findByApiKey(key)?.id === 'user-a', 'API key resolves to its owner');
  const key2 = userService.regenerateApiKey(me);
  assert(userService.findByApiKey(key) === null && userService.findByApiKey(key2)?.id === 'user-a', 'regenerating a key revokes the old one');
  assert(!JSON.stringify(userService.exportUserData(me)).includes(key2), 'data export never includes the API key');

  console.log('\n[2] Price alerts');
  liveDataStore.updateFare('DEL-BOM', 6000);
  liveDataStore.updateFare('DEL-BOM', 5900);
  const alert = alertService.create(me.id, { origin: 'del', destination: 'bom', targetPrice: 5500, date: '2026-12-01' });
  assert(alert.route === 'DEL-BOM' && alert.status === 'Active', 'alert is created with normalised codes');
  assert(alert.currentFare === 5900, 'alert records the observed fare (not an invented one)');
  assert(throws(() => alertService.create(me.id, { origin: 'DEL', destination: 'BOM', targetPrice: 5500, date: '2026-12-01' })) !== null, 'duplicate alert is rejected');
  assert(throws(() => alertService.create(me.id, { origin: 'DEL', destination: 'DEL', targetPrice: 5500 })) !== null, 'same origin and destination is rejected');
  assert(throws(() => alertService.create(me.id, { origin: 'DEL', destination: 'BOM', targetPrice: 10 })) !== null, 'absurd target price is rejected');
  assert(alertService.list(other.id).length === 0, "another user cannot see this user's alerts");
  assert(alertService.remove(other.id, alert.id) === false, "another user cannot delete this user's alert");
  assert(alertService.evaluateAll() === 0, 'alert does not trigger while the fare is above target');
  liveDataStore.updateFare('DEL-BOM', 5400);
  assert(alertService.evaluateAll() === 1, 'alert triggers when the observed fare reaches the target');
  const notifications = alertService.listNotifications(me.id);
  assert(notifications.length === 1 && /5,400/.test(notifications[0].message), 'a notification with the real fare is created');
  assert(alertService.listNotifications(other.id).length === 0, 'notifications are private to their owner');
  assert(alertService.evaluateAll() === 0, 'a triggered alert does not fire twice');

  console.log('\n[3] Auth middleware');
  const res: any = { statusCode: 0, body: null, status(c: number) { this.statusCode = c; return this; }, json(b: unknown) { this.body = b; return this; } };
  let nextCalled = false;
  await requireAuth({ headers: {} } as any, res, () => (nextCalled = true));
  assert(res.statusCode === 401 && !nextCalled, 'request without credentials is rejected with 401');
  const res2: any = { ...res, statusCode: 0 };
  await requireAuth({ method: 'GET', originalUrl: '/api/alerts', headers: { 'x-api-key': 'aeronex_live_sk_doesnotexist' } } as any, res2, () => (nextCalled = true));
  assert(res2.statusCode === 401 && !nextCalled, 'unknown API key is rejected with 401');
  const req3: any = { method: 'GET', originalUrl: '/api/alerts', headers: { 'x-api-key': key2 } };
  await requireAuth(req3, { status() { return this; }, json() { return this; } } as any, () => (nextCalled = true));
  assert(nextCalled && req3.user?.id === 'user-a', 'valid API key authenticates as its owner');

  const status = () => ({ statusCode: 0, status(c: number) { this.statusCode = c; return this; }, json() { return this; } });
  const denied1: any = status();
  let reached = false;
  await requireAuth({ method: 'DELETE', originalUrl: '/api/user/account', headers: { 'x-api-key': key2 } } as any, denied1, () => (reached = true));
  assert(denied1.statusCode === 403 && !reached, 'API keys cannot perform account-management actions');
  const denied2: any = status();
  await requireAuth({ method: 'GET', originalUrl: '/api/user/profile', headers: { 'x-api-key': key2 } } as any, denied2, () => (reached = true));
  assert(denied2.statusCode === 403 && !reached, 'API keys cannot read the profile endpoint');

  console.log('\n[4] Rate limiter');
  const limiter = createRateLimiter({ windowMs: 60_000, max: 2 });
  const hit = () => {
    const r: any = { statusCode: 200, headers: {}, set() { return this; }, status(c: number) { this.statusCode = c; return this; }, json() { return this; } };
    let ok = false;
    limiter({ ip: '1.2.3.4', socket: {} } as any, r, () => (ok = true));
    return ok;
  };
  assert(hit() && hit() && !hit(), 'third request inside the window is blocked');

  fs.rmSync(dir, { recursive: true, force: true });
  console.log(`\nAeroNex app tests: ${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

run().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
