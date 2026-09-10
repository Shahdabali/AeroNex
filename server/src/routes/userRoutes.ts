import { Router } from 'express';
import { userService } from '../services/userService';

export const userRouter = Router();

// GET /api/user/profile
userRouter.get('/profile', (req, res) => {
  try {
    const email = (req.query.email as string) || (req.headers['x-user-email'] as string) || undefined;
    const userData = userService.getUser(email);
    res.json({
      success: true,
      data: userData,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/user/profile
userRouter.put('/profile', (req, res) => {
  try {
    const { email, ...updates } = req.body;
    const userEmail = email || (req.headers['x-user-email'] as string) || 'shadab@aeronex.com';
    const updatedProfile = userService.updateProfile(userEmail, updates);
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedProfile,
    });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// POST /api/user/avatar
userRouter.post('/avatar', (req, res) => {
  try {
    const { email, avatarUrl } = req.body;
    if (!avatarUrl) {
      return res.status(400).json({ success: false, error: 'avatarUrl is required' });
    }
    const userEmail = email || (req.headers['x-user-email'] as string) || 'shadab@aeronex.com';
    const updatedProfile = userService.updateAvatar(userEmail, avatarUrl);
    res.json({
      success: true,
      message: 'Avatar updated successfully',
      data: updatedProfile,
    });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// PUT /api/user/preferences
userRouter.put('/preferences', (req, res) => {
  try {
    const { email, preferences } = req.body;
    const userEmail = email || (req.headers['x-user-email'] as string) || 'shadab@aeronex.com';
    const updated = userService.updatePreferences(userEmail, preferences || req.body);
    res.json({
      success: true,
      message: 'Travel preferences updated',
      data: updated,
    });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// PUT /api/user/notifications
userRouter.put('/notifications', (req, res) => {
  try {
    const { email, notifications } = req.body;
    const userEmail = email || (req.headers['x-user-email'] as string) || 'shadab@aeronex.com';
    const updated = userService.updateNotifications(userEmail, notifications || req.body);
    res.json({
      success: true,
      message: 'Notification settings updated',
      data: updated,
    });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// PUT /api/user/appearance
userRouter.put('/appearance', (req, res) => {
  try {
    const { email, appearance } = req.body;
    const userEmail = email || (req.headers['x-user-email'] as string) || 'shadab@aeronex.com';
    const updated = userService.updateAppearance(userEmail, appearance || req.body);
    res.json({
      success: true,
      message: 'Appearance settings updated',
      data: updated,
    });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// POST /api/user/integrations/toggle
userRouter.post('/integrations/toggle', (req, res) => {
  try {
    const { email, provider } = req.body;
    if (!provider) {
      return res.status(400).json({ success: false, error: 'Provider is required' });
    }
    const userEmail = email || (req.headers['x-user-email'] as string) || 'shadab@aeronex.com';
    const integrations = userService.toggleIntegration(userEmail, provider);
    res.json({
      success: true,
      message: `${provider} integration updated`,
      data: integrations,
    });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// POST /api/user/api-key/regenerate
userRouter.post('/api-key/regenerate', (req, res) => {
  try {
    const { email } = req.body;
    const userEmail = email || (req.headers['x-user-email'] as string) || 'shadab@aeronex.com';
    const newKey = userService.regenerateApiKey(userEmail);
    res.json({
      success: true,
      message: 'New API Key generated',
      apiKey: newKey,
    });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// POST /api/user/change-password
userRouter.post('/change-password', (req, res) => {
  try {
    const { email, currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, error: 'Both current and new password are required' });
    }
    const userEmail = email || (req.headers['x-user-email'] as string) || 'shadab@aeronex.com';
    userService.changePassword(userEmail, currentPassword, newPassword);
    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// GET /api/user/export-data
userRouter.get('/export-data', (req, res) => {
  try {
    const email = (req.query.email as string) || (req.headers['x-user-email'] as string) || 'shadab@aeronex.com';
    const data = userService.exportUserData(email);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="aeronex-data-export-${Date.now()}.json"`);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/user/account
userRouter.delete('/account', (req, res) => {
  try {
    const { email } = req.body;
    const userEmail = email || (req.headers['x-user-email'] as string) || 'shadab@aeronex.com';
    userService.deleteAccount(userEmail);
    res.json({
      success: true,
      message: 'Account deleted successfully',
    });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});
