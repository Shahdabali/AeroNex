import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { alertService } from '../services/alertService';

export const alertRouter = Router();

const badRequest = (fn: (req: any, res: any) => unknown) => (req: any, res: any, next: any) => {
  try {
    fn(req, res);
  } catch (err: any) {
    (err as any).status = (err as any).status || 400;
    next(err);
  }
};

alertRouter.get('/alerts', requireAuth, (req, res) => {
  res.json({ success: true, data: alertService.list(req.user!.id) });
});

alertRouter.post('/alerts', requireAuth, badRequest((req, res) => {
  res.status(201).json({ success: true, data: alertService.create(req.user!.id, req.body) });
}));

alertRouter.post('/alerts/:id/toggle', requireAuth, (req, res) => {
  const alert = alertService.toggle(req.user!.id, req.params.id);
  if (!alert) return res.status(404).json({ success: false, error: 'Alert not found.' });
  res.json({ success: true, data: alert });
});

alertRouter.delete('/alerts/:id', requireAuth, (req, res) => {
  if (!alertService.remove(req.user!.id, req.params.id)) return res.status(404).json({ success: false, error: 'Alert not found.' });
  res.json({ success: true });
});

alertRouter.get('/notifications', requireAuth, (req, res) => {
  res.json({ success: true, data: alertService.listNotifications(req.user!.id) });
});

alertRouter.post('/notifications/read', requireAuth, (req, res) => {
  const id = req.body?.id;
  if (typeof id === 'string') alertService.markRead(req.user!.id, id);
  else alertService.markAllRead(req.user!.id);
  res.json({ success: true });
});
