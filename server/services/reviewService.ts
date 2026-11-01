import { supabase, localDb, DbPlatformReview } from '../config/supabase';

export interface PlatformRatingSummary {
  rawAverage: number;
  reviewCount: number;
  bayesianRating: number;
  distribution: { 1: number; 2: number; 3: number; 4: number; 5: number };
}

export interface PublicPlatformReview {
  id: string;
  authorName: string;
  rating: number;
  reviewText: string;
  createdAt: string;
}

// Bayesian Shrinkage Constants
const PRIOR_SAMPLE_SIZE_M = 5; // Minimum confidence review threshold
const PRIOR_MEAN_RATING_C = 4.6; // Baseline platform prior mean

export function calculateBayesianRating(rawAverage: number, reviewCount: number): number {
  if (reviewCount === 0) return 0;
  const weighted =
    (reviewCount / (reviewCount + PRIOR_SAMPLE_SIZE_M)) * rawAverage +
    (PRIOR_SAMPLE_SIZE_M / (reviewCount + PRIOR_SAMPLE_SIZE_M)) * PRIOR_MEAN_RATING_C;
  return parseFloat(weighted.toFixed(1));
}

export async function submitUserReview(userId: string, rating: number, reviewText: string): Promise<DbPlatformReview> {
  if (rating < 1 || rating > 5) {
    throw new Error('Rating must be an integer between 1 and 5');
  }

  if (supabase) {
    const { data, error } = await supabase
      .from('platform_reviews')
      .upsert({
        user_id: userId,
        rating,
        review_text: reviewText,
        moderation_status: 'approved',
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (!error && data) {
      return data;
    }
  }

  return await localDb.submitPlatformReview(userId, rating, reviewText);
}

export async function getUserReview(userId: string): Promise<DbPlatformReview | null> {
  if (supabase) {
    const { data } = await supabase
      .from('platform_reviews')
      .select('*')
      .eq('user_id', userId)
      .single();
    if (data) return data;
  }
  const all = await localDb.getPlatformReviews();
  return all.find((r) => r.user_id === userId) || null;
}

export async function getRecentPlatformReviews(limit = 6): Promise<PublicPlatformReview[]> {
  let reviews: DbPlatformReview[] = [];

  if (supabase) {
    const { data } = await supabase
      .from('platform_reviews')
      .select('*')
      .eq('moderation_status', 'approved')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (data) reviews = data;
  }

  if (reviews.length === 0) {
    reviews = await localDb.getPlatformReviews();
  }

  const results: PublicPlatformReview[] = [];
  for (const r of reviews.slice(0, limit)) {
    const user = await localDb.getUserProfile(r.user_id);
    const authorName = user?.display_name ? `${user.display_name.split(' ')[0]} (Verified)` : 'Verified Planner';
    results.push({
      id: r.id,
      authorName,
      rating: r.rating,
      reviewText: r.review_text,
      createdAt: r.created_at,
    });
  }

  return results;
}

export async function getPlatformRatingSummary(): Promise<PlatformRatingSummary> {
  let reviews: DbPlatformReview[] = [];

  if (supabase) {
    const { data } = await supabase.from('platform_reviews').select('*').eq('moderation_status', 'approved');
    if (data) reviews = data;
  }

  if (reviews.length === 0) {
    reviews = await localDb.getPlatformReviews();
  }

  const reviewCount = reviews.length;
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  if (reviewCount === 0) {
    return {
      rawAverage: 0,
      reviewCount: 0,
      bayesianRating: 0,
      distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    };
  }

  let totalSum = 0;
  reviews.forEach((r) => {
    totalSum += r.rating;
    const rKey = Math.min(5, Math.max(1, Math.round(r.rating))) as 1 | 2 | 3 | 4 | 5;
    distribution[rKey] = (distribution[rKey] || 0) + 1;
  });

  const rawAverage = parseFloat((totalSum / reviewCount).toFixed(2));
  const bayesianRating = calculateBayesianRating(rawAverage, reviewCount);

  return {
    rawAverage,
    reviewCount,
    bayesianRating,
    distribution,
  };
}
