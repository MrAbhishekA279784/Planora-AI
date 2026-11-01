<div align="center">

```text
██████╗ ██╗      █████╗ ███╗   ██╗ ██████╗ ██████╗  █████╗
██╔══██╗██║     ██╔══██╗████╗  ██║██╔═══██╗██╔══██╗██╔══██╗
██████╔╝██║     ███████║██╔██╗ ██║██║   ██║██████╔╝███████║
██╔═══╝ ██║     ██╔══██║██║╚██╗██║██║   ██║██╔══██╗██╔══██║
██║     ███████╗██║  ██║██║ ╚████║╚██████╔╝██║  ██║██║  ██║
╚═╝     ╚══════╝╚═╝  ╚═╝╚═╝  ╚═══╝ ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝

             A I - P O W E R E D   E V E N T   P L A N N E R
```

# Planora AI

### Plan Smarter. Celebrate Better.

An AI-powered event planning platform designed to bring event management, budgeting, task organization, and vendor discovery into one place.

[Live Demo](https://planora-ai-beta.vercel.app/) · [Report a Bug](../../issues) · [Request a Feature](../../issues)

</div>

---

## About the Project

Planning an event often means juggling budgets, guest lists, vendors, schedules, and countless small tasks.

**Planora AI** aims to make this process simpler by combining event management tools with generative AI in one workspace.

Whether you're organizing a wedding, birthday, or community gathering, Planora provides tools to organize your plans and get AI-assisted recommendations.

The project combines modern web technologies with AI integration to explore how intelligent assistants can make everyday planning easier.

## Features

### AI Event Copilot

Get AI-assisted ideas, event planning suggestions, budget guidance, and recommendations based on your requirements using Google Gemini.

### Event Management

Create and organize events, manage event details, and keep your planning information in one place.

### Budget Planner

Organize your event budget, record expenses, and track spending against your planned budget.

### Task & Timeline Management

Break event preparation into manageable tasks and organize important deadlines.

### Vendor Discovery

Explore vendor options using Google Places integration where configured, and manage your own saved vendor information.

### Personalized User Profiles

Support individual user profiles and personalized workspaces with Firebase Authentication.

### Database Integration

Use Supabase PostgreSQL for persistent application data, with user ownership controls implemented through the application's backend and database configuration.

### Responsive Interface

A carefully designed interface featuring a warm cream-and-brown palette, modern typography, and a responsive layout.

---

## Tech Stack

| Technology              | Purpose                               |
| ----------------------- | ------------------------------------- |
| React                   | User interface                        |
| TypeScript              | Type-safe development                 |
| Vite                    | Development server and build tooling  |
| Tailwind CSS            | Styling                               |
| Lucide React            | Icons                                 |
| Node.js                 | Backend runtime                       |
| Express.js              | REST API                              |
| Firebase Authentication | User authentication                   |
| Firebase Admin SDK      | Server-side identity verification     |
| Supabase PostgreSQL     | Relational database                   |
| Google Gemini           | Generative AI                         |
| Google Maps / Places    | Map and vendor discovery integrations |
| Vercel                  | Frontend deployment                   |

*Integrations require the appropriate credentials and deployment configuration. Refer to the current source code for the exact implementation.*

---

## Architecture

```text
                    ┌─────────────────────────┐
                    │        USER             │
                    │   Web Browser / Mobile   │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │      PLANORA AI         │
                    │   React + TypeScript    │
                    │       Vite + UI         │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │      BACKEND API        │
                    │    Node.js + Express    │
                    │ Authentication & Logic │
                    └────────┬────────┬───────┘
                             │        │
                  ┌──────────┘        └───────────┐
                  ▼                               ▼
       ┌────────────────────┐          ┌────────────────────┐
       │ Firebase Auth      │          │ Supabase           │
       │ Identity & Tokens  │          │ PostgreSQL         │
       └────────────────────┘          └────────────────────┘
                             │
                             ▼
                    ┌────────────────────┐
                    │ Google Gemini API  │
                    │ AI Planning Help   │
                    └────────────────────┘
```

The production backend must be deployed and connected to the frontend for API-dependent functionality to work. Verify the current deployment configuration before relying on the live demo.

---

## Getting Started

Follow these steps to run the project locally.

### Prerequisites

Install the following:

* Node.js (an LTS release)
* npm
* Git
* A Firebase project for authentication
* A Supabase project for database functionality
* A Google Gemini API key for AI features

Google Maps, Places, and Calendar credentials are required only if you use the corresponding integrations.

### 1. Clone the Repository

```bash
git clone YOUR_REPOSITORY_URL
cd YOUR_PROJECT_DIRECTORY
```

Replace the placeholders with your actual Git repository URL and project directory.

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file using the project's `.env.example` as a reference.

For example, your configuration may contain:

```env
# Firebase client configuration
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_APP_ID=

# Backend API URL
VITE_API_BASE_URL=

# Server-side configuration
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
GEMINI_API_KEY=
```

**Important:**

* Use the exact variable names expected by your current source code.
* Do not commit `.env` files containing secrets.
* Never expose the Supabase service-role key, Firebase Admin credentials, Gemini API key, or OAuth client secrets in frontend code.
* Variables prefixed with `VITE_` can be exposed to the browser. Store only appropriate public configuration in them.
* Configure server-side variables in the backend hosting environment.

### 4. Configure Supabase

1. Create or open your Supabase project.
2. Inspect the database migrations provided in the repository.
3. Apply the required migrations in the correct order.
4. Verify table relationships, access permissions, and Row Level Security policies.
5. Configure the backend with the appropriate database credentials.

Do not create duplicate tables if the existing schema already provides the required functionality.

### 5. Run the Development Server

```bash
npm run dev
```

If the backend runs as a separate service, open another terminal and use the backend's configured development command.

Check `package.json` for the actual available scripts.

### 6. Build for Production

```bash
npm run build
```

Run the project's configured tests and type checks before deploying.

---

## Security & Data Privacy

Security is an important part of an application that handles personal event information.

Planora AI should follow these principles:

* Authenticate users before allowing access to private resources.
* Verify identity tokens on the server.
* Associate private records with their authenticated owner.
* Validate incoming requests.
* Prevent unauthorized access to other users' events, expenses, tasks, and profile information.
* Keep server-side credentials out of frontend bundles.
* Configure Supabase permissions and Row Level Security appropriately.
* Avoid sending unnecessary personal information to external AI services.

Security depends on the actual backend implementation and deployment configuration. Review and test these controls before using real user data in production.

---

## Project Goals

Planora AI is being developed around a few core ideas:

* Make event planning more organized.
* Use AI to assist with repetitive planning decisions.
* Keep important event information in one workspace.
* Provide a clean and accessible user experience.
* Explore an open-source approach to AI-powered event management.

---

## Roadmap

Potential improvements include:

* [ ] Improve AI conversation quality and contextual memory.
* [ ] Expand event-specific recommendations.
* [ ] Complete and verify production authentication and database flows.
* [ ] Improve budget analytics and expense reporting.
* [ ] Verify live Google Maps and Places functionality.
* [ ] Complete profile editing and onboarding.
* [ ] Improve automated tests and security verification.
* [ ] Publish contribution guidelines and open-source licensing.

Roadmap items should be updated as features are implemented and verified.

---

## Contributing

Contributions, bug reports, and feature suggestions are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Make your changes.
4. Run the available tests and build checks.
5. Submit a pull request describing your changes.

Please avoid committing secrets, personal user data, or production credentials.

Before contributing, check the repository's license and contribution guidelines.

---

## Open Source

Planora AI is intended to be developed as an open-source project.

**Before publishing the repository as officially open source, add a `LICENSE` file** containing the license you have selected. A public GitHub repository without a license does not automatically grant everyone permission to reuse, modify, or distribute its code.

---

## Project Links

* **Live Demo:** https://planora-ai-beta.vercel.app/
* **Repository:** Add your GitHub repository URL here.
* **Issues:** Use your repository's Issues tab to report bugs and suggest improvements.

---

<div align="center">

### Plan Smarter. Celebrate Better.

Built with curiosity, code, and a little help from AI.

**Planora AI**

</div>
