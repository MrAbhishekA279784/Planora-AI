import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { localDb } from '../server/config/supabase';
import { issueSessionToken, verifySessionToken } from '../server/config/sessionToken';
import { calculateBudgetTotals, calculateCompletionPercentage, calculateBayesianRating } from '../src/utils/calculations';

describe('Phase 3 End-to-End User Journey Automation & Security Verification Suite', () => {

  test('Journey 1 — New User Registration & Clean Onboarding Flow', async () => {
    const newUserUid = `usr_test_reg_${Date.now()}`;
    const token = issueSessionToken(newUserUid, 'newuser@planora.ai', 'New User');
    
    // Verify token cryptographic authenticity
    const verified = verifySessionToken(token);
    assert.equal(verified.uid, newUserUid);
    assert.equal(verified.email, 'newuser@planora.ai');

    // Register user profile
    const profile = await localDb.syncUser(newUserUid, verified.email, verified.name, '');
    assert.equal(profile.onboarding_completed, false, 'New user should start with uncompleted onboarding state');
    
    // Complete onboarding
    const updated = await localDb.updateUserProfile(newUserUid, { onboarding_completed: true, city: 'Goa' });
    assert.equal(updated?.onboarding_completed, true);
    assert.equal(updated?.city, 'Goa');

    // Verify workspace is completely clean
    const userEvents = await localDb.getEventsByOwner(newUserUid);
    assert.equal(userEvents.length, 0, 'New user workspace must start with zero events');
  });

  test('Journey 2 — Profile Management & Avatar Update Persistence', async () => {
    const userUid = `usr_test_profile_${Date.now()}`;
    await localDb.syncUser(userUid, 'profile.test@planora.ai', 'Initial Name', '');

    const customAvatarUrl = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb';
    const updated = await localDb.updateUserProfile(userUid, {
      display_name: 'Updated Name',
      bio: 'Loves planning coastal weddings',
      photo_url: customAvatarUrl,
    });

    assert.ok(updated);
    assert.equal(updated.display_name, 'Updated Name');
    assert.equal(updated.bio, 'Loves planning coastal weddings');
    assert.equal(updated.photo_url, customAvatarUrl);

    // Verify persistence on fresh read
    const fetched = await localDb.getUserProfile(userUid);
    assert.equal(fetched?.display_name, 'Updated Name');
    assert.equal(fetched?.photo_url, customAvatarUrl);
  });

  test('Journey 3 — Event Management (Create, Edit, Delete & Database Persistence)', async () => {
    const ownerUid = `usr_event_owner_${Date.now()}`;

    // 1. Create event
    const newEvent = await localDb.createEvent({
      owner_id: ownerUid,
      name: 'Sunset Beach Gala 2026',
      event_type: 'wedding',
      description: 'Exclusive beachfront wedding celebration',
      start_date: '2026-11-15',
      total_budget: 800000,
      status: 'planning',
      completion_percentage: 0,
    });
    assert.ok(newEvent.id);
    assert.equal(newEvent.name, 'Sunset Beach Gala 2026');

    // 2. Edit event
    const updatedEvent = await localDb.updateEvent(newEvent.id, ownerUid, {
      name: 'Sunset Beach Gala 2026 (Revised)',
      expected_guests: 250,
      completion_percentage: 25,
    });
    assert.equal(updatedEvent?.name, 'Sunset Beach Gala 2026 (Revised)');
    assert.equal(updatedEvent?.expected_guests, 250);
    assert.equal(updatedEvent?.completion_percentage, 25);

    // 3. Delete event
    const deleteSuccess = await localDb.deleteEvent(newEvent.id, ownerUid);
    assert.equal(deleteSuccess, true);

    // 4. Verify deletion persistence
    const fetched = await localDb.getEventById(newEvent.id, ownerUid);
    assert.equal(fetched, null);
  });

  test('Journey 4 — Budget Allocation & Expense Calculation Verification', async () => {
    const ownerUid = `usr_budget_owner_${Date.now()}`;
    const event = await localDb.createEvent({
      owner_id: ownerUid,
      name: 'Birthday Extravaganza',
      event_type: 'birthday',
      description: '5th Birthday Celebration',
      start_date: '2026-06-10',
      total_budget: 200000,
      status: 'planning',
      completion_percentage: 10,
    });

    const b1 = await localDb.createBudget({
      event_id: event.id,
      owner_id: ownerUid,
      category: 'Venue & Decor',
      planned_amount: 100000,
      actual_amount: 95000,
      payment_status: 'paid',
    });

    const b2 = await localDb.createBudget({
      event_id: event.id,
      owner_id: ownerUid,
      category: 'Catering & Beverages',
      planned_amount: 80000,
      actual_amount: 75000,
      payment_status: 'partial',
    });

    const budgets = await localDb.getBudgetsByEvent(event.id, ownerUid);
    assert.equal(budgets.length, 2);

    const totals = calculateBudgetTotals(
      [
        { id: 'b1', name: b1.category, amount: b1.planned_amount, percentage: 50, color: '#7A3D19' },
        { id: 'b2', name: b2.category, amount: b2.planned_amount, percentage: 40, color: '#B86B2A' },
      ],
      200000
    );

    assert.equal(totals.allocatedAmount, 180000);
    assert.equal(totals.remainingAmount, 20000);
    assert.equal(totals.isOverBudget, false);
  });

  test('Journey 5 — Tasks and Guests Lifecycle Management', async () => {
    const ownerUid = `usr_task_owner_${Date.now()}`;
    const event = await localDb.createEvent({
      owner_id: ownerUid,
      name: 'Corporate Summit',
      event_type: 'community',
      description: 'Annual Partner Gathering',
      start_date: '2026-08-01',
      total_budget: 500000,
      status: 'planning',
      completion_percentage: 0,
    });

    // Add tasks
    const t1 = await localDb.createTask({
      event_id: event.id,
      owner_id: ownerUid,
      task_name: 'Book Keynote Speaker',
      status: 'completed',
      priority: 'high',
    });

    const t2 = await localDb.createTask({
      event_id: event.id,
      owner_id: ownerUid,
      task_name: 'Finalize Catering Menu',
      status: 'in_progress',
      priority: 'medium',
    });

    const tasks = await localDb.getTasksByEvent(event.id, ownerUid);
    assert.equal(tasks.length, 2);

    const completionRate = calculateCompletionPercentage([
      { id: t1.id, eventId: event.id, title: t1.task_name, status: 'completed', dueDate: '2026-08-01' },
      { id: t2.id, eventId: event.id, title: t2.task_name, status: 'in-progress', dueDate: '2026-08-01' },
    ]);
    assert.equal(completionRate, 50);

    // Add guest
    const guest = await localDb.createGuest({
      event_id: event.id,
      owner_id: ownerUid,
      guest_name: 'Dr. Evelyn Reed',
      email: 'evelyn.reed@example.com',
      invitation_status: 'sent',
      rsvp_status: 'accepted',
      plus_ones: 1,
    });

    assert.equal(guest.guest_name, 'Dr. Evelyn Reed');
    assert.equal(guest.rsvp_status, 'accepted');
  });

  test('Journey 6 — Vendor Discovery & Saved Vendors Management', async () => {
    const ownerUid = `usr_vendor_saver_${Date.now()}`;
    
    // Fetch verified platform vendors
    const platformVendors = await localDb.getVendors({ category: 'venue' });
    assert.ok(platformVendors.length > 0, 'Platform should have pre-seeded verified vendors');

    // Save a custom user vendor
    const saved = await localDb.saveVendor({
      user_id: ownerUid,
      name: 'Custom Ocean Breeze Decor',
      category: 'decoration',
      address: 'Baga Beach, Goa',
      location_name: 'Baga, Goa',
      latitude: 15.555,
      longitude: 73.751,
      rating: 4.9,
      source: 'user_saved',
    });

    assert.ok(saved.id);
    assert.equal(saved.name, 'Custom Ocean Breeze Decor');

    // Retrieve user vendors
    const userVendors = await localDb.getVendors({ userId: ownerUid });
    const containsCustom = userVendors.some((v) => v.id === saved.id);
    assert.equal(containsCustom, true);
  });

  test('Journey 7 — AI Usage Logging & Quota Tracking', async () => {
    const userUid = `usr_ai_logger_${Date.now()}`;

    // Log AI usage
    const log = await localDb.logAiUsage({
      user_id: userUid,
      request_id: `req_${Date.now()}`,
      feature_name: 'copilot_chat',
      model_name: 'gemini-2.5-flash',
      prompt_tokens: 150,
      completion_tokens: 300,
      cached_tokens: 0,
      estimated_cost_usd: 0.00045,
      status_code: 200,
      latency_ms: 420,
    });

    assert.ok(log.id);

    // Fetch daily AI usage
    const usage = await localDb.getUserDailyAiUsage(userUid);
    assert.equal(usage.requestCount, 1);
    assert.equal(usage.totalTokens, 450);
  });

  test('Journey 8 — Reviews Submission & Bayesian Rating Calculation', async () => {
    const userUid = `usr_reviewer_${Date.now()}`;

    const review = await localDb.submitPlatformReview(userUid, 5, 'Planora AI made our wedding planning effortless!');
    assert.equal(review.rating, 5);
    assert.equal(review.moderation_status, 'approved');

    const reviews = await localDb.getPlatformReviews();
    assert.ok(reviews.length >= 1);

    const bayesianRating = calculateBayesianRating(4.8, 120);
    assert.ok(bayesianRating >= 4.0 && bayesianRating <= 5.0);
  });

  test('Journey 9 — User Isolation Security Boundary Verification', async () => {
    const userA = `usr_isolation_A_${Date.now()}`;
    const userB = `usr_isolation_B_${Date.now()}`;

    const eventA = await localDb.createEvent({
      owner_id: userA,
      name: "User A Vault Event",
      event_type: 'wedding',
      description: 'Private',
      start_date: '2026-12-01',
      total_budget: 1000000,
      status: 'planning',
      completion_percentage: 10,
    });

    // User B attempts access
    const directFetch = await localDb.getEventById(eventA.id, userB);
    assert.equal(directFetch, null, 'User B must not access User A records');

    // Attempt unauthorized update
    const updateResult = await localDb.updateEvent(eventA.id, userB, { name: 'Hacked Name' });
    assert.equal(updateResult, null, 'User B update attempt must fail');

    // Attempt unauthorized deletion
    const deleteResult = await localDb.deleteEvent(eventA.id, userB);
    assert.equal(deleteResult, false, 'User B delete attempt must fail');
  });

  test('Journey 10 — Failure Scenarios and Error Defense Mechanisms', async () => {
    // 1. Forged session token
    const forgedToken = 'planora_v1.eyJ1aWQiOiJ2aWN0aW0ifQ==.bogussignature123';
    await assert.rejects(
      async () => {
        const { verifyFirebaseIdToken } = await import('../server/config/firebaseAdmin');
        await verifyFirebaseIdToken(forgedToken);
      },
      (err: any) => {
        assert.match(err.message, /signature verification failed|Invalid or unverified authentication token/i);
        return true;
      }
    );

    // 2. Non-existent event lookup
    const nonExistent = await localDb.getEventById('non_existent_id', 'any_user');
    assert.equal(nonExistent, null);

    // 3. Empty input handling in calculations
    const emptyCompletion = calculateCompletionPercentage([]);
    assert.equal(emptyCompletion, 0);

    const emptyTotals = calculateBudgetTotals([], 0);
    assert.equal(emptyTotals.allocatedAmount, 0);
    assert.equal(emptyTotals.remainingAmount, 0);
  });
});
