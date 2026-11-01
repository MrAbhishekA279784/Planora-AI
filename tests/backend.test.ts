import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { verifyFirebaseIdToken } from '../server/config/firebaseAdmin';
import { localDb } from '../server/config/supabase';
import { checkUserAiQuota, recordAiUsage } from '../server/services/aiUsageService';
import { encryptToken, decryptToken } from '../server/services/calendarService';
import { searchVendors } from '../server/services/vendorService';
import { submitUserReview, getPlatformRatingSummary, calculateBayesianRating } from '../server/services/reviewService';

describe('Planora AI Full-Stack Master Test Suite', () => {

  // PHASE 1 & 2 TESTS
  test('1. Event & Task CRUD operations and IDOR isolation', async () => {
    const userA = 'user_test_alice';
    const userB = 'user_test_bob';

    // Create event owned by User A
    const event = await localDb.createEvent({
      owner_id: userA,
      name: 'Alice Sunset Celebration',
      event_type: 'birthday',
      description: 'Private birthday event',
      start_date: '2026-06-15',
      total_budget: 150000,
      status: 'planning',
      completion_percentage: 0,
    });

    assert.ok(event.id);

    // User A creates task
    const task = await localDb.createTask({
      event_id: event.id,
      owner_id: userA,
      task_name: 'Reserve Lounge',
      status: 'pending',
      priority: 'high',
    });

    assert.equal(task.task_name, 'Reserve Lounge');

    // User B attempts to access User A event or task -> rejected (null)
    const accessByB = await localDb.getEventById(event.id, userB);
    assert.equal(accessByB, null, 'IDOR Failure: User B accessed User A event');

    const tasksByB = await localDb.getTasksByEvent(event.id, userB);
    assert.equal(tasksByB.length, 0, 'IDOR Failure: User B listed User A tasks');
  });

  test('2. Budget & Guest CRUD operations and calculation integrity', async () => {
    const userA = 'user_test_alice';

    const event = await localDb.createEvent({
      owner_id: userA,
      name: 'Alice Corporate Gala',
      event_type: 'corporate',
      description: 'Annual dinner',
      start_date: '2026-11-10',
      total_budget: 500000,
      status: 'planning',
      completion_percentage: 0,
    });

    // Create Budget item
    const budget = await localDb.createBudget({
      event_id: event.id,
      owner_id: userA,
      category: 'catering',
      planned_amount: 200000,
      actual_amount: 190000,
      payment_status: 'paid',
    });

    assert.equal(budget.planned_amount, 200000);

    // Create Guest item
    const guest = await localDb.createGuest({
      event_id: event.id,
      owner_id: userA,
      guest_name: 'David Miller',
      invitation_status: 'sent',
      rsvp_status: 'accepted',
      plus_ones: 1,
    });

    assert.equal(guest.guest_name, 'David Miller');
  });

  // PHASE 3 TESTS
  test('3. AI Token Accounting and Quota Limits', async () => {
    const userId = 'user_test_quota';

    // Verify initial quota allowed
    const initialQuota = await checkUserAiQuota(userId);
    assert.ok(initialQuota.allowed);

    // Record AI request
    await recordAiUsage({
      userId,
      requestId: `req_${Date.now()}`,
      featureName: 'copilot_chat',
      modelName: 'gemini-2.5-flash',
      promptTokens: 150,
      completionTokens: 250,
      latencyMs: 320,
    });

    const updatedUsage = await localDb.getUserDailyAiUsage(userId);
    assert.equal(updatedUsage.requestCount, 1);
    assert.equal(updatedUsage.totalTokens, 400);
  });

  // PHASE 4 TESTS
  test('4. Google Calendar Token Encryption and Decryption Safety', () => {
    const secretRefreshToken = '1//0gDemoRefreshToken1234567890SecretGCal';
    const encrypted = encryptToken(secretRefreshToken);

    assert.notEqual(encrypted, secretRefreshToken);
    assert.doesNotMatch(encrypted, /1\/\/0gDemoRefreshToken/);

    const decrypted = decryptToken(encrypted);
    assert.equal(decrypted, secretRefreshToken);
  });

  // PHASE 5 TESTS
  test('5. Real Nearby Vendor Search and Category Filtering', async () => {
    const venueResults = await searchVendors({ category: 'venue' });
    assert.ok(venueResults.length > 0);
    venueResults.forEach((v) => {
      assert.ok(v.latitude >= -90 && v.latitude <= 90, 'Valid latitude range');
      assert.ok(v.longitude >= -180 && v.longitude <= 180, 'Valid longitude range');
      assert.ok(v.rawRating >= 0 && v.rawRating <= 5, 'Valid rating range');
    });

    const locationResults = await searchVendors({ location: 'Goa' });
    assert.ok(locationResults.length > 0);
  });

  test('5b. Vendor Database CRUD and User Ownership Isolation', async () => {
    const userA = 'user_test_alice';
    const userB = 'user_test_bob';

    // User A saves custom vendor
    const saved = await localDb.saveVendor({
      user_id: userA,
      name: 'Alice Coastal Florals',
      category: 'decoration',
      address: 'Anjuna Beach, Goa 403509',
      latitude: 15.5802,
      longitude: 73.7432,
      phone: '+91 982 000 1111',
      website: 'https://aliceflorals.example.com',
      rating: 4.9,
      review_count: 45,
      source: 'user_saved',
    });

    assert.ok(saved.id);
    assert.equal(saved.user_id, userA);

    // User A can update their vendor
    const updated = await localDb.updateVendor(saved.id, userA, {
      name: 'Alice Premier Coastal Florals',
    });
    assert.ok(updated);
    assert.equal(updated.name, 'Alice Premier Coastal Florals');

    // User B cannot update User A's vendor (returns null)
    const unauthorizedUpdate = await localDb.updateVendor(saved.id, userB, {
      name: 'Bob Hacked Name',
    });
    assert.equal(unauthorizedUpdate, null, 'Security violation: User B updated User A vendor');

    // User B cannot delete User A's vendor
    const unauthorizedDelete = await localDb.deleteVendor(saved.id, userB);
    assert.equal(unauthorizedDelete, false, 'Security violation: User B deleted User A vendor');

    // User A can delete their vendor
    const authorizedDelete = await localDb.deleteVendor(saved.id, userA);
    assert.equal(authorizedDelete, true);
  });

  // PHASE 6 TESTS
  test('6. Platform Review Submission and Bayesian Shrinkage Calculation', async () => {
    const userUid = 'user_test_reviewer';
    await submitUserReview(userUid, 5, 'Exceptional event planning experience with Planora AI!');

    const summary = await getPlatformRatingSummary();
    assert.ok(summary.reviewCount >= 1);
    assert.ok(summary.bayesianRating >= 1 && summary.bayesianRating <= 5);

    // Test Bayesian formula directly
    const weighted = calculateBayesianRating(5.0, 1);
    assert.ok(weighted > 4.0 && weighted < 5.0, 'Bayesian shrinkage smoothed single review score towards platform prior');
  });
});
