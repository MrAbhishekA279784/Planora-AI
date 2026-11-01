# Planora AI — Fake Data Elimination & User Isolation Audit Report

## 1. Executive Summary

In response to the audit and implementation directive to **remove all fake, hardcoded, dummy, and placeholder data** and ensure **every new user starts with a clean, isolated workspace**:
- All hardcoded demo users (`usr_demo_1` / `Abhishek Gupta`), fake events (`Riya & Karan — Goa Wedding`, `Aarav's 5th Birthday`, `Tech Community Meetup`), sample tasks, dummy budgets, and fabricated activities have been removed from the application experience.
- The root cause of cross-user data leakage was identified and eliminated: frontend `localStorage` keys were previously un-scoped (`planora_events`), allowing new users or switched accounts to inherit previously stored records or fallback to fake demo arrays. All storage keys are now strictly scoped to the authenticated user ID (`planora_events_${user.uid}`).
- When a user logs out, all in-memory events and session state are cleared immediately (`events = []`, `activeEvent = null`).
- New users signing up or logging in for the first time start with **0 events, 0 tasks, 0 budget items, and 0 fake activities**, with clear, encouraging empty states and direct "Create Your First Event" action buttons.
- Real Google Maps and Google Places API integration is preserved.
- The automated test suite has been expanded to **20 tests** (20 passing, 0 failing), including explicit two-account isolation tests proving that User B starts with 0 events and has zero access to User A's private data.
- The project compiles with zero TypeScript errors and passes all lint checks.

---

## 2. Root Cause Analysis & Rectifications

### Issue 1: Un-scoped LocalStorage & Fallback Array
- **Cause**: In `src/App.tsx`, `events` initialized from `localStorage.getItem('planora_events') || initialEvents`. When unauthenticated or on a new account, the app fell back to `initialEvents` ("Riya & Karan Wedding"), polluting the user's workspace.
- **Resolution**:
  - `initialEvents` in `src/data/mockData.ts` set to empty array `[]`.
  - In `src/App.tsx`, storage is scoped per user: `planora_events_${user.uid}`.
  - On login, events are fetched from `GET /api/events` with the user's Bearer token.
  - On logout, `events` is reset to `[]`, `activeEvent` to `null`, and un-scoped artifacts are cleared.

### Issue 2: Backend Memory Database Demo Seeding
- **Cause**: In `server/config/supabase.ts`, `LocalDatabase` constructor seeded a demo user (`usr_demo_1`), demo event (`ev_demo_1`), sample tasks, and dummy budgets.
- **Resolution**: Removed lines 265–347 in `server/config/supabase.ts`. The database now initializes with empty maps. Every authenticated user starts with 0 records.

### Issue 3: Form Prefilling with Demo Values
- **Cause**: In `src/components/views/CreateEventView.tsx`, form inputs were prefilled with `eventDate: '15 Feb 2026'`, `location: 'Goa, India'`, `guestCount: 300`, `totalBudget: 800000`, and `handleFinishCreate` created 3 hardcoded tasks.
- **Resolution**: All fields now start empty (`''`, 0), requiring authentic user input. Newly created events start with `tasks: []` and 0% completion.

### Issue 4: Hardcoded Notifications & Activities Feed
- **Cause**: `Header.tsx` and `MyEventsView.tsx` imported `recentActivities` from `mockData.ts` which had 6 fake activities mentioning Taj Resort Goa and SpiceCraft Catering.
- **Resolution**: `recentActivities` in `mockData.ts` set to `[]`. `Header.tsx` now shows "No notifications yet. You're all caught up!", and `MyEventsView.tsx` displays "No recent activity yet. Activity updates will appear here as you manage events."

### Issue 5: Hardcoded Calendar Dots & Event Days
- **Cause**: In `MyEventsView.tsx`, the calendar had `const isEventDay = day === 15;` and `const hasDot = day === 5 || day === 12...`.
- **Resolution**: Removed hardcoded numbers. The calendar now checks whether any real event in `events` has an event date matching the calendar day. If the user has 0 events, no fake dots or event highlights appear.

### Issue 6: Empty States for Zero Records
- **Dashboard (`HomeView.tsx`)**: When `primaryEvent` is null, displays an encouraging empty state card with a "Create Your First Event" CTA instead of a blank card or fake event.
- **My Events (`MyEventsView.tsx`)**: When 0 events match or exist, displays an empty state with a "Create Your First Event" button.
- **Timeline (`EventTimelineView.tsx`)**: When `event` is null or `tasks.length === 0`, displays a clean milestone setup prompt.
- **Budget Planner (`BudgetPlannerView.tsx`)**: When `event` is null or `categories.length === 0`, provides an empty state and "+ Add Category" button.

---

## 3. Verification & Test Evidence

### Test Commands Executed
```bash
$ npm test
```
**Results**:
- `src/utils/calculations.test.ts`: 6/6 tests passing (currency formatting, budget calculations, completion percentage, filters).
- `tests/auth.test.ts`: 7/7 tests passing:
  1. Unauthenticated request token verification fails.
  2. Invalid or malformed token is rejected.
  3. Valid authenticated test token retrieves user profile.
  4. Cross-User Isolation (IDOR Protection): User A cannot access User B event.
  5. System identifier modification prevention (Mass Assignment Guard).
  6. Service role key safety check: Ensure secret keys are not exposed to frontend env.
  7. **Clean Workspace & Zero Data Leakage for Brand New Users**: Verified User B starts with 0 events, cannot view User A's tasks or budgets.
- `tests/backend.test.ts`: 7/7 tests passing (CRUD, AI quota, Google Calendar encryption, vendor search, Bayesian ratings).
- **Total**: 20 tests passed, 0 failed.

### Build & Lint Verification
- `compile_applet`: Passed with code 0 ("Build succeeded - the applet is compiled").
- `lint_applet`: Passed with code 0 (`tsc --noEmit` exited cleanly).
- Dev server: Running and verified healthy on `http://localhost:3000` (HTTP 200).
