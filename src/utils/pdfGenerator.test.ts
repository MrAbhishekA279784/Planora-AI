import test from 'node:test';
import assert from 'node:assert/strict';
import { generateEventSchedulePdf } from './pdfGenerator';
import { initialEvents } from '../data/mockData';

test('generateEventSchedulePdf creates valid PDF instance with pages and metadata', async () => {
  const mockEvent = {
    id: 'ev_test_pdf',
    name: 'Sunset Beach Wedding',
    eventType: 'wedding' as const,
    date: '15 Nov 2026',
    rawDate: '2026-11-15',
    location: 'Candolim Beach, Goa',
    guestCount: 300,
    totalBudget: 800000,
    status: 'planning' as const,
    completionPercent: 50,
    subtitle: 'Coastal Master Schedule',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552',
    budgetCategories: [],
    tasks: [
      { id: 't1', eventId: 'ev_test_pdf', title: 'Book Beach Resort', status: 'completed' as const, dueDate: '10 Feb 2026', vendorName: 'Taj Resort' },
      { id: 't2', eventId: 'ev_test_pdf', title: 'Finalize Artisanal Catering', status: 'in-progress' as const, dueDate: '20 Mar 2026', vendorName: 'SpiceCraft' }
    ]
  };
  const doc = await generateEventSchedulePdf(mockEvent);

  assert.ok(doc, 'PDF doc should be defined');
  assert.ok(doc.internal.pages.length >= 2, 'Doc should contain at least 1 content page');

  // Verify doc output can be generated
  const output = doc.output('arraybuffer');
  assert.ok(output.byteLength > 1000, 'PDF byte length should be substantial (> 1KB)');
});
