import { Router } from 'express';
import { userService } from '../services/userService';

export const supportRouter = Router();

// GET /api/support/faqs
supportRouter.get('/faqs', (req, res) => {
  const faqs = [
    {
      id: 1,
      category: 'Airfare Index',
      question: 'How is the AeroNex National Airfare Index calculated?',
      answer: 'The index is a weighted benchmark modeled after the Consumer Price Index (CPI) basket, factoring high-density metro corridors (DEL-BOM, BOM-BLR) and regional routes with real-time weights.',
    },
    {
      id: 2,
      category: 'Data Freshness',
      question: 'How frequently is live route pricing updated?',
      answer: 'Our ingestion workers poll domestic airline networks and DGCA fare filings every 5 seconds for live tickers and every 30 seconds for deep fare matrix updates.',
    },
    {
      id: 3,
      category: 'Predictions',
      question: 'How accurate are the AI price predictions?',
      answer: 'Our Gemini AI model combines historical booking curves, seasonal demand spikes, ATF fuel index, and real-time inventory to deliver 85-92% confidence recommendations.',
    },
    {
      id: 4,
      category: 'Price Alerts',
      question: 'How do price drop alerts reach me?',
      answer: 'Alerts are dispatched via real-time WebSocket push notifications, email summaries, and optional webhook integrations for connected Discord servers.',
    },
    {
      id: 5,
      category: 'Account & Security',
      question: 'Can I export my flight search history and saved data?',
      answer: 'Yes! In Settings > Data & Privacy, click "Download My Data" to immediately download a verified JSON or CSV export of all your records.',
    },
  ];

  res.json({
    success: true,
    data: faqs,
  });
});

// POST /api/support/ticket
supportRouter.post('/ticket', (req, res) => {
  try {
    const { email, subject, category, message, userId } = req.body;
    if (!email || !subject || !message) {
      return res.status(400).json({ success: false, error: 'Email, subject, and message are required.' });
    }

    const ticket = userService.addSupportTicket({
      userId,
      email,
      subject,
      category: category || 'General Inquiry',
      message,
    });

    res.json({
      success: true,
      message: 'Support ticket submitted successfully. Our team will contact you within 24 hours.',
      data: ticket,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/support/feedback
supportRouter.post('/feedback', (req, res) => {
  try {
    const { email, rating, category, comments, userId } = req.body;
    if (!rating || !comments) {
      return res.status(400).json({ success: false, error: 'Rating and comments are required.' });
    }

    const feedback = userService.addFeedback({
      userId,
      email,
      rating: Number(rating),
      category: category || 'Platform Experience',
      comments,
    });

    res.json({
      success: true,
      message: 'Thank you for your valuable feedback! It helps shape future AeroNex releases.',
      data: feedback,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
