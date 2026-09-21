import { Router } from 'express';
import { optionalAuth } from '../middleware/auth';
import { createRateLimiter } from '../middleware/security';
import { userService } from '../services/userService';

export const supportRouter = Router();
supportRouter.use(optionalAuth);

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const clean = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

const FAQS = [
  {
    id: 1,
    category: 'Airfare Index',
    question: 'How is the AeroNex National Airfare Index calculated?',
    answer:
      'The index compares the fares currently observed on tracked domestic corridors against a fixed baseline basket (baseline = 100), similar in spirit to a CPI basket. See the Methodology page for the full formula.',
  },
  {
    id: 2,
    category: 'Data Freshness',
    question: 'How frequently is route pricing updated?',
    answer:
      'The ingestion worker refreshes on a fixed interval (30 seconds by default). The Data Pipeline page shows the active data source, the time of the last successful refresh, and whether the feed is live or simulated.',
  },
  {
    id: 3,
    category: 'Predictions',
    question: 'How accurate are the AI price predictions?',
    answer:
      'Predictions are estimates derived from the fares AeroNex has observed and are not guarantees. Each recommendation lists the data it was based on and its caveats; treat them as decision support, not a forecast you can rely on.',
  },
  {
    id: 4,
    category: 'Price Alerts',
    question: 'How do price alerts reach me?',
    answer:
      'After each data refresh AeroNex compares observed fares with your targets. When a target is reached the alert is marked Triggered and a notification appears in the bell menu inside the app.',
  },
  {
    id: 5,
    category: 'Account & Security',
    question: 'Can I export my saved data?',
    answer: 'Yes. In Settings, open Data & Privacy and choose "Download My Data" to get a JSON export of your profile, preferences and alerts.',
  },
];

supportRouter.get('/faqs', (_req, res) => {
  res.json({ success: true, data: FAQS });
});

// Ticket/feedback submissions are throttled per client to stop spam.
const submissionLimiter = createRateLimiter({
  windowMs: 10 * 60_000,
  max: 5,
  message: 'Too many submissions. Please try again in a few minutes.',
});

supportRouter.post('/ticket', submissionLimiter, (req, res, next) => {
  try {
    const email = (req.user?.email || clean(req.body?.email, 254)).toLowerCase();
    const subject = clean(req.body?.subject, 150);
    const message = clean(req.body?.message, 4000);
    if (!EMAIL.test(email)) return res.status(400).json({ success: false, error: 'A valid email address is required.' });
    if (subject.length < 3) return res.status(400).json({ success: false, error: 'Please enter a subject (at least 3 characters).' });
    if (message.length < 10) return res.status(400).json({ success: false, error: 'Please describe your issue (at least 10 characters).' });

    const ticket = userService.addSupportTicket({
      userId: req.user?.id,
      email,
      subject,
      category: clean(req.body?.category, 60) || 'General Inquiry',
      message,
    });
    res.status(201).json({
      success: true,
      message: `Your request was received (reference ${ticket.id}). A reply will be sent to ${email}.`,
      data: { id: ticket.id, status: ticket.status },
    });
  } catch (err) {
    next(err);
  }
});

supportRouter.post('/feedback', submissionLimiter, (req, res, next) => {
  try {
    const rating = Number(req.body?.rating);
    const comments = clean(req.body?.comments, 4000);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, error: 'Please choose a rating from 1 to 5.' });
    }
    if (comments.length < 3) return res.status(400).json({ success: false, error: 'Please add a short comment.' });

    const feedback = userService.addFeedback({
      userId: req.user?.id,
      email: req.user?.email,
      rating,
      category: clean(req.body?.category, 60) || 'Platform Experience',
      comments,
    });
    res.status(201).json({ success: true, message: 'Thank you. Your feedback was recorded.', data: { id: feedback.id } });
  } catch (err) {
    next(err);
  }
});
