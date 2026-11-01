import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

describe('Phase 4 Component & Accessibility Integration Tests', () => {

  test('1. Currency calculations and INR formatting rules', async () => {
    const { formatINR, formatINRShort } = await import('../src/utils/calculations');

    assert.equal(formatINR(500000), '₹5,00,000');
    assert.equal(formatINR(0), '₹0');
    assert.equal(formatINRShort(800000), '₹8L');
    assert.equal(formatINRShort(45000), '₹45k');
  });

  test('2. Budget allocation percentages and overbudget boundary detection', async () => {
    const { calculateBudgetTotals } = await import('../src/utils/calculations');

    const categories = [
      { id: '1', name: 'Venue', amount: 300000, percentage: 60, color: '#7A3D19' },
      { id: '2', name: 'Catering', amount: 200000, percentage: 40, color: '#B86B2A' },
    ];

    const totals = calculateBudgetTotals(categories, 500000);
    assert.equal(totals.allocatedAmount, 500000);
    assert.equal(totals.allocatedPercent, 100);
    assert.equal(totals.isOverBudget, false);

    const overTotals = calculateBudgetTotals(categories, 400000);
    assert.equal(overTotals.isOverBudget, true);
  });

  test('3. Accessible SVG avatar and silhouette default properties', async () => {
    const { DEFAULT_NEUTRAL_AVATAR } = await import('../server/config/supabase');

    assert.ok(DEFAULT_NEUTRAL_AVATAR.startsWith('data:image/svg+xml'));
    assert.ok(DEFAULT_NEUTRAL_AVATAR.includes('viewBox'));
    assert.ok(!DEFAULT_NEUTRAL_AVATAR.includes('unsplash'), 'Avatar default must not use a random third-party human photo');
  });

  test('4. Task completion percentage computation edge cases', async () => {
    const { calculateCompletionPercentage } = await import('../src/utils/calculations');

    assert.equal(calculateCompletionPercentage([]), 0);

    const tasks: any = [
      { id: 't1', status: 'completed' },
      { id: 't2', status: 'completed' },
      { id: 't3', status: 'pending' },
      { id: 't4', status: 'in-progress' },
    ];

    assert.equal(calculateCompletionPercentage(tasks), 50);
  });

  test('5. Event status filtering and keyword matching', async () => {
    const { filterEvents } = await import('../src/utils/calculations');

    const events: any = [
      { id: 'e1', name: 'Goa Sunset Beach Wedding', location: 'Goa', subtitle: 'Beachside mandap', status: 'planning' },
      { id: 'e2', name: 'Mumbai Corporate Gala', location: 'Mumbai', subtitle: 'Grand Ballroom', status: 'completed' },
    ];

    const planningFiltered = filterEvents(events, '', 'planning');
    assert.equal(planningFiltered.length, 1);
    assert.equal(planningFiltered[0].name, 'Goa Sunset Beach Wedding');

    const searchFiltered = filterEvents(events, 'Mumbai', 'All Events');
    assert.equal(searchFiltered.length, 1);
    assert.equal(searchFiltered[0].id, 'e2');
  });

  test('6. Production SESSION_SECRET security constraint validation', async () => {
    const prevEnv = process.env.NODE_ENV;
    const prevSecret = process.env.SESSION_SECRET;

    process.env.NODE_ENV = 'production';
    delete process.env.SESSION_SECRET;

    // Must reject in production when SESSION_SECRET is unset
    const { issueSessionToken } = await import('../server/config/sessionToken');
    assert.throws(
      () => {
        issueSessionToken('usr_test', 'test@example.com', 'Test User');
      },
      (err: any) => {
        assert.match(err.message, /SECURITY CRITICAL ERROR/i);
        return true;
      }
    );

    // Restore environment
    process.env.NODE_ENV = prevEnv;
    if (prevSecret) process.env.SESSION_SECRET = prevSecret;
  });
});
