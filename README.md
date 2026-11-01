# Planora AI — Event Planning Platform & Backend Architecture

Planora AI is an event planning platform designed to turn complex, high-stress event organization—weddings, birthdays, corporate meetups, and community gatherings—into an intuitive visual workflow powered by artificial intelligence.

---

## Phase 1: Secure Backend & Authentication Foundation

Phase 1 establishes the production-grade authentication, database schema, server routing, and cross-user data security model for Planora AI.

### Core Features Implemented in Phase 1:
1. **Firebase Authentication Integration**: Email/Password registration, Login, Google OAuth popup support, auth persistence, and client token management (`src/lib/firebase.ts`, `src/context/AuthContext.tsx`).
2. **Server-Side Token Verification Middleware**: `server/middleware/authMiddleware.ts` extracts `Authorization: Bearer <token>` headers and validates Firebase ID Tokens using `firebase-admin/auth`.
3. **Database Architecture & Version-Controlled Migrations**: `migrations/001_initial_schema.sql` defines 10 core tables (`users`, `events`, `event_tasks`, `event_budgets`, `event_guests`, `themes`, `vendors`, `platform_reviews`, `ai_usage_logs`, `google_calendar_connections`) with indexes and Row Level Security (RLS) policies.
4. **User Profile Sync & IDOR Protection**: `/api/auth/sync` and `/api/users/profile` ensure every authenticated user's private data is strictly isolated (`owner_id = verified_uid`).
5. **Automated Security & Unit Test Suite**: `tests/auth.test.ts` validates unauthenticated token rejections, expired token handling, profile sync, IDOR protection, mass assignment guards, and secret isolation.

---

## Setup & Prerequisites

### 1. Prerequisites
- **Node.js**: v18.0+ or v20.0+
- **NPM**: v9.0+

### 2. Environment Configuration
Copy `.env.example` to `.env` and fill in your project credentials:
```bash
cp .env.example .env
```

#### Required Keys:
* `GEMINI_API_KEY`: Google AI Studio Gemini API Key.
* `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`: Firebase Web Client config.
* `FIREBASE_SERVICE_ACCOUNT_JSON`: Firebase Admin SDK service account key string.
* `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`: Supabase project connection keys.

### 3. Database Migration Execution
Apply the SQL migration script to your Supabase PostgreSQL instance:
1. Log in to your [Supabase Dashboard](https://app.supabase.com).
2. Open the **SQL Editor** tab.
3. Paste the contents of `migrations/001_initial_schema.sql` and click **Run**.

---

## Running the Application

### Start Development Server
Runs Express API gateway with Vite frontend middleware on port 3000:
```bash
npm run dev
```

### Run Tests
Executes the automated unit and security test suite:
```bash
npm test
```

### Build for Production
Compiles TypeScript and bundles Vite production assets:
```bash
npm run build
```

---

## Security Audit Verification

The security test suite (`npm test`) verifies the following assertions:
* [x] **Unauthenticated Access Denial**: Requests missing Bearer tokens return `401 Unauthorized`.
* [x] **Invalid Token Rejection**: Malformed or forged tokens return `401 Unauthorized`.
* [x] **Profile Retrieval**: Authenticated users fetch their own verified profile.
* [x] **Cross-User Data Isolation (IDOR)**: User A cannot read, modify, or delete User B's events or tasks.
* [x] **Mass Assignment Guard**: System identifiers (`firebase_uid`, `subscription_tier`) cannot be overwritten via request body.
* [x] **Secret Isolation**: Service role and private keys are never exposed in public `VITE_` variables.

---

## Roadmap & Next Phases

* **Phase 1 (COMPLETED)**: Secure Backend Foundation, Firebase Auth, Supabase DB Schema, Auth Middleware, Profile Sync, Security Tests.
* **Phase 2**: Full CRUD Event & Task Persistence (Events, Budgets, Timelines, Guests).
* **Phase 3**: Gemini AI Server Proxy, Token Usage Accounting & Quota Enforcement.
* **Phase 4**: Google Calendar OAuth 2.0 Two-Way Event Sync.
* **Phase 5**: Google Places API (New) Vendor Discovery & Location Search.
* **Phase 6**: Authenticated Ratings & Bayesian Vendor Ranking.
