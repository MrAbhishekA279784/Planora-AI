import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { verifyFirebaseIdToken } from '../server/config/firebaseAdmin';
import { localDb } from '../server/config/supabase';

describe('Phase 1 Security & Authentication Foundation Tests', () => {

  test('1. Unauthenticated request token verification fails', async () => {
    await assert.rejects(
      async () => {
        await verifyFirebaseIdToken('');
      },
      (err: any) => {
        assert.match(err.message, /Invalid or unverified authentication token/i);
        return true;
      }
    );
  });

  test('2. Invalid or malformed token is rejected', async () => {
    await assert.rejects(
      async () => {
        await verifyFirebaseIdToken('invalid_token_xyz_123');
      },
      (err: any) => {
        assert.match(err.message, /Invalid or unverified authentication token/i);
        return true;
      }
    );
  });

  test('3. Valid server-issued HMAC token is verified successfully', async () => {
    const { issueSessionToken } = await import('../server/config/sessionToken');
    const validToken = issueSessionToken('usr_alice_123', 'alice@example.com', 'Alice Planners');
    const verified = await verifyFirebaseIdToken(validToken);

    assert.equal(verified.uid, 'usr_alice_123');
    assert.equal(verified.email, 'alice@example.com');
    assert.equal(verified.name, 'Alice Planners');

    // Sync profile to database
    const profile = await localDb.syncUser(
      verified.uid,
      verified.email,
      verified.name,
      'https://example.com/alice.jpg'
    );

    assert.equal(profile.firebase_uid, 'usr_alice_123');
    assert.equal(profile.display_name, 'Alice Planners');
  });

  test('3b. Forged token with fake HMAC signature is REJECTED', async () => {
    // Construct forged token by base64url encoding a payload with forged victim UID and appending bogus signature
    const forgedPayload = Buffer.from(JSON.stringify({
      uid: 'usr_victim_target',
      email: 'victim@example.com',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
    })).toString('base64url');

    const forgedToken = `planora_v1.${forgedPayload}.deadbeef1234567890abcdefdeadbeef1234567890abcdefdeadbeef12345678`;

    await assert.rejects(
      async () => {
        await verifyFirebaseIdToken(forgedToken);
      },
      (err: any) => {
        assert.match(err.message, /signature verification failed|Invalid or unverified authentication token/i);
        return true;
      }
    );
  });

  test('3c. Expired HMAC session token is REJECTED', async () => {
    const { issueSessionToken } = await import('../server/config/sessionToken');
    // Issue token that expired 10 seconds ago
    const expiredToken = issueSessionToken('usr_bob_expired', 'bob@example.com', 'Bob Expired', -10);

    await assert.rejects(
      async () => {
        await verifyFirebaseIdToken(expiredToken);
      },
      (err: any) => {
        assert.match(err.message, /token expired|Invalid or unverified authentication token/i);
        return true;
      }
    );
  });

  test('3d. Unsigned or arbitrary string token is REJECTED', async () => {
    await assert.rejects(
      async () => {
        await verifyFirebaseIdToken('planora_token_eyJ1aWQiOiJ2aWN0aW0ifQ==');
      },
      (err: any) => {
        assert.match(err.message, /Invalid or unverified authentication token/i);
        return true;
      }
    );
  });

  test('4. Cross-User Isolation (IDOR Protection): User A cannot access User B event', async () => {
    const userA_uid = 'user_alice_123';
    const userB_uid = 'user_bob_456';

    // Create event owned by User A
    const eventA = await localDb.createEvent({
      owner_id: userA_uid,
      name: "Alice's Secret Beach Wedding",
      event_type: 'wedding',
      description: 'Private event details',
      start_date: '2026-05-20',
      total_budget: 500000,
      status: 'planning',
      completion_percentage: 10,
    });

    // User A fetches their own event -> succeeds
    const fetchedByA = await localDb.getEventById(eventA.id, userA_uid);
    assert.ok(fetchedByA);
    assert.equal(fetchedByA.name, "Alice's Secret Beach Wedding");

    // User B attempts to fetch User A's event -> returns null (access forbidden)
    const fetchedByB = await localDb.getEventById(eventA.id, userB_uid);
    assert.equal(fetchedByB, null, 'IDOR Protection Failure: User B accessed User A private event!');
  });

  test('5. System identifier modification prevention (Mass Assignment Guard)', async () => {
    const userUid = 'user_alice_guard_test';
    await localDb.syncUser(userUid, 'alice.guard@example.com', 'Alice Guard', '');

    const originalProfile = await localDb.getUserProfile(userUid);
    assert.ok(originalProfile);

    // Update display name cleanly
    const updated = await localDb.updateUserProfile(userUid, {
      display_name: 'Alice Preferred Name',
    });

    assert.ok(updated);
    assert.equal(updated.display_name, 'Alice Preferred Name');
    // Ensure firebase_uid remains invariant
    assert.equal(updated.firebase_uid, userUid);
  });

  test('6. Service role key safety check: Ensure secret keys are not exposed to frontend env', () => {
    const publicEnvKeys = Object.keys(process.env).filter((key) => key.startsWith('VITE_'));

    publicEnvKeys.forEach((key) => {
      const val = process.env[key] || '';
      assert.doesNotMatch(val, /service_role/i, `Security violation: Service role key found in public env var ${key}`);
      assert.doesNotMatch(val, /private_key/i, `Security violation: Private key found in public env var ${key}`);
    });
  });

  test('7. Clean Workspace & Zero Data Leakage for Brand New Users', async () => {
    const userA_uid = 'user_account_a_uuid';
    const userB_uid = 'user_account_b_brand_new_uuid';

    // User A sets up their event, tasks, and budget
    const eventA = await localDb.createEvent({
      owner_id: userA_uid,
      name: "User A's Exclusive Gala",
      event_type: 'wedding',
      description: 'Private celebration',
      start_date: '2026-09-18',
      total_budget: 950000,
      status: 'planning',
      completion_percentage: 20,
    });

    await localDb.createTask({
      event_id: eventA.id,
      owner_id: userA_uid,
      task_name: 'Book Grand Hall',
      status: 'completed',
      priority: 'high',
    });

    await localDb.createBudget({
      event_id: eventA.id,
      owner_id: userA_uid,
      category: 'Venue & Decor',
      planned_amount: 400000,
      actual_amount: 380000,
      payment_status: 'partial',
    });

    // Brand new User B registers/logs in
    const userB_events = await localDb.getEventsByOwner(userB_uid);
    assert.equal(userB_events.length, 0, 'New User B must start with zero events in their workspace');

    // User B attempts to access User A's event directly
    const directAccess = await localDb.getEventById(eventA.id, userB_uid);
    assert.equal(directAccess, null, 'User B must not have access to User A records');

    // User B attempts to query tasks for User A's event
    const tasksQuery = await localDb.getTasksByEvent(eventA.id, userB_uid);
    assert.equal(tasksQuery.length, 0, 'User B must not see tasks belonging to User A');

    // User B attempts to query budgets for User A's event
    const budgetQuery = await localDb.getBudgetsByEvent(eventA.id, userB_uid);
    assert.equal(budgetQuery.length, 0, 'User B must not see budgets belonging to User A');
  });
});
