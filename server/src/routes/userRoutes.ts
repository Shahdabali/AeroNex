import { Router } from 'express';
import { requireAuth, supabaseAdmin } from '../middleware/auth';
import { userService } from '../services/userService';
import { alertService } from '../services/alertService';

export const userRouter = Router();
userRouter.use(requireAuth);

const identity = (req: any) => ({ id: req.user.id, email: req.user.email, name: req.user.name });

// Client-fixable problems (validation) come back as 400; everything else falls to the error handler.
const guard = (fn: (req: any, res: any) => unknown) => (req: any, res: any, next: any) => {
  try {
    fn(req, res);
  } catch (err: any) {
    if (err instanceof Error && !(err as any).status) (err as any).status = 400;
    next(err);
  }
};

// GET /api/user/profile
userRouter.get('/profile', guard((req, res) => {
  const { createdAt, ...data } = userService.getOrCreate(identity(req));
  res.json({ success: true, data: { ...data, memberSince: createdAt } });
}));

// PUT /api/user/profile
userRouter.put('/profile', guard((req, res) => {
  const profile = userService.updateProfile(identity(req), req.body);
  res.json({ success: true, message: 'Profile updated', data: profile });
}));

// POST /api/user/avatar
userRouter.post('/avatar', guard((req, res) => {
  const profile = userService.updateAvatar(identity(req), req.body?.avatarUrl);
  res.json({ success: true, message: 'Avatar updated', data: profile });
}));

// PUT /api/user/preferences
userRouter.put('/preferences', guard((req, res) => {
  const prefs = userService.updatePreferences(identity(req), req.body?.preferences ?? req.body);
  res.json({ success: true, message: 'Travel preferences updated', data: prefs });
}));

// PUT /api/user/notifications
userRouter.put('/notifications', guard((req, res) => {
  const notifications = userService.updateNotifications(identity(req), req.body?.notifications ?? req.body);
  res.json({ success: true, message: 'Notification settings updated', data: notifications });
}));

// PUT /api/user/appearance
userRouter.put('/appearance', guard((req, res) => {
  const appearance = userService.updateAppearance(identity(req), req.body?.appearance ?? req.body);
  res.json({ success: true, message: 'Appearance settings updated', data: appearance });
}));

// POST /api/user/integrations/toggle
userRouter.post('/integrations/toggle', guard((req, res) => {
  const integrations = userService.toggleIntegration(identity(req), String(req.body?.provider || ''));
  res.json({ success: true, data: integrations });
}));

// POST /api/user/api-key/regenerate
userRouter.post('/api-key/regenerate', guard((req, res) => {
  res.json({ success: true, message: 'New API key generated', apiKey: userService.regenerateApiKey(identity(req)) });
}));

// GET /api/user/export-data
userRouter.get('/export-data', guard((req, res) => {
  const id = identity(req);
  const data = userService.exportUserData(id, {
    priceAlerts: alertService.list(id.id),
    notifications: alertService.listNotifications(id.id),
  });
  res.setHeader('Content-Disposition', `attachment; filename="aeronex-data-export-${Date.now()}.json"`);
  res.json(data);
}));

// DELETE /api/user/account — removes the Supabase auth user and all locally stored data
userRouter.delete('/account', async (req, res, next) => {
  try {
    const id = req.user!.id;
    if (!supabaseAdmin) {
      return res.status(503).json({ success: false, error: 'Account deletion is unavailable right now. Please try again later.' });
    }
    const { error } = await supabaseAdmin.auth.admin.deleteUser(id);
    if (error) throw error;
    userService.deleteData(id);
    alertService.deleteAllForUser(id);
    res.json({ success: true, message: 'Your account and data have been deleted.' });
  } catch (err) {
    next(err);
  }
});
