import { Router, Response } from 'express';
import { authenticateToken, AuthenticatedRequest } from '../middleware/authMiddleware';
import {
  submitUserReview,
  getPlatformRatingSummary,
  getRecentPlatformReviews,
  getUserReview,
} from '../services/reviewService';

const router = Router();

// GET /api/reviews/summary - Get aggregate platform rating & Bayesian shrinkage score
router.get('/summary', async (req, res): Promise<void> => {
  try {
    const summary = await getPlatformRatingSummary();
    res.json({ success: true, summary });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve rating summary', details: err.message });
  }
});

// GET /api/reviews/recent - Get latest approved platform reviews for public landing page
router.get('/recent', async (req, res): Promise<void> => {
  try {
    const reviews = await getRecentPlatformReviews(6);
    res.json({ success: true, reviews });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve recent reviews', details: err.message });
  }
});

// GET /api/reviews/mine - Get currently authenticated user's submitted review (if any)
router.get('/mine', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.uid;
    const review = await getUserReview(userId);
    res.json({ success: true, review });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve your review', details: err.message });
  }
});

// POST /api/reviews/platform - Submit or update authenticated platform review
router.post('/platform', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.uid;
    const { rating, reviewText } = req.body;

    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      res.status(400).json({ error: 'Rating must be an integer between 1 and 5' });
      return;
    }

    const review = await submitUserReview(userId, rating, reviewText || '');
    const updatedSummary = await getPlatformRatingSummary();

    res.json({ success: true, review, summary: updatedSummary });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to submit review', details: err.message });
  }
});

export default router;
