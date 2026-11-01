import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatINR,
  formatINRShort,
  calculateBudgetTotals,
  calculateCompletionPercentage,
  filterEvents,
  filterVendors,
  sortVendors,
} from './calculations';
import { BudgetCategory, EventItem, TaskItem, VendorItem } from '../types';

test('formatINR formats currency correctly', () => {
  assert.equal(formatINR(0), '₹0');
  assert.equal(formatINR(800000), '₹8,00,000');
  assert.equal(formatINR(250000), '₹2,50,000');
  assert.equal(formatINR(-50000), '-₹50,000');
});

test('formatINRShort formats amounts to compact readable form', () => {
  assert.equal(formatINRShort(800000), '₹8L');
  assert.equal(formatINRShort(250000), '₹2.5L');
  assert.equal(formatINRShort(50000), '₹50k');
});

test('calculateBudgetTotals computes accurate percentage, allocation and overbudget flag', () => {
  const categories: BudgetCategory[] = [
    { id: '1', name: 'Venue', amount: 300000, percentage: 0, color: '#4A2C1B' },
    { id: '2', name: 'Catering', amount: 150000, percentage: 0, color: '#B86B2A' },
    { id: '3', name: 'Decoration', amount: 120000, percentage: 0, color: '#D7A34B' },
  ];
  const summary = calculateBudgetTotals(categories, 800000);
  assert.equal(summary.totalBudget, 800000);
  assert.equal(summary.allocatedAmount, 570000);
  assert.equal(summary.allocatedPercent, 71);
  assert.equal(summary.remainingAmount, 230000);
  assert.equal(summary.isOverBudget, false);
});

test('calculateBudgetTotals detects over budget state', () => {
  const categories: BudgetCategory[] = [
    { id: '1', name: 'Venue', amount: 500000, percentage: 0, color: '#4A2C1B' },
    { id: '2', name: 'Catering', amount: 400000, percentage: 0, color: '#B86B2A' },
  ];
  const summary = calculateBudgetTotals(categories, 800000);
  assert.equal(summary.isOverBudget, true);
  assert.equal(summary.remainingAmount, -100000);
});

test('calculateCompletionPercentage calculates completed tasks proportion', () => {
  const tasks: TaskItem[] = [
    { id: '1', eventId: 'e1', title: 'Task 1', status: 'completed', dueDate: '2026-02-10' },
    { id: '2', eventId: 'e1', title: 'Task 2', status: 'in-progress', dueDate: '2026-02-12' },
    { id: '3', eventId: 'e1', title: 'Task 3', status: 'completed', dueDate: '2026-02-14' },
    { id: '4', eventId: 'e1', title: 'Task 4', status: 'pending', dueDate: '2026-02-15' },
  ];
  assert.equal(calculateCompletionPercentage(tasks), 50);
});

test('filterEvents filters by search keyword and status', () => {
  const events: EventItem[] = [
    {
      id: '1',
      name: 'Riya & Karan — Goa Wedding',
      subtitle: 'Beach wedding',
      eventType: 'wedding',
      date: '15 Feb 2026',
      rawDate: '2026-02-15',
      location: 'Goa, India',
      guestCount: 300,
      status: 'upcoming',
      completionPercent: 68,
      totalBudget: 800000,
      image: '',
      budgetCategories: [],
      tasks: [],
    },
    {
      id: '2',
      name: 'Aarav’s 5th Birthday',
      subtitle: 'Fun day',
      eventType: 'birthday',
      date: '12 May 2026',
      rawDate: '2026-05-12',
      location: 'Pune, India',
      guestCount: 50,
      status: 'planning',
      completionPercent: 26,
      totalBudget: 150000,
      image: '',
      budgetCategories: [],
      tasks: [],
    },
  ];

  const searchResults = filterEvents(events, 'Goa', 'All Events');
  assert.equal(searchResults.length, 1);
  assert.equal(searchResults[0].id, '1');

  const upcomingResults = filterEvents(events, '', 'Upcoming');
  assert.equal(upcomingResults.length, 1);
  assert.equal(upcomingResults[0].id, '1');

  const planningResults = filterEvents(events, '', 'In Planning');
  assert.equal(planningResults.length, 1);
  assert.equal(planningResults[0].id, '2');
});
