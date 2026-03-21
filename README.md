# PayTrack 🏦💰

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)

**PayTrack** is a premium, cloud-based loan management and payment tracking system. Designed for lending businesses transitioning from manual spreadsheets, it provides a sophisticated interface for tracking borrowers, automating loan schedules, and managing profit allocations with institutional precision.

---

## 🌟 Premium Fintech Aesthetic

The application is built on a **"Luxurious Metallic Gold"** and **"Gilded Ivory"** design system, delivering a professional SaaS experience:

- **Gilded Ivory Base**: A crisp, high-contrast minimalist background for high readability.
- **Metallic Gold Accents**: Sophisticated branding and primary actions.
- **Tabular Precision**: Strictly aligned numerical data for financial accuracy.

---

## 🚀 Key Features

- **👤 Borrower Directory**: Centralized management of borrower profiles with real-time status tracking (Active/Paid). Last name is optional.
- **⚙️ The Calculation Engine**:
  - **Small Loans (≤ 5k)**: Automatic 10% flat interest with flexible weekly/monthly schedules.
  - **Big Loans (> 5k)**: Amortized principal with declining interest models.
- **💎 Profit Allocation (RC & EDITH)**: Automated 80/20 split of interest income, allowing for manual monetary overrides.
- **⚡ One-Click Payments**: Rapid logging of arbitrary payment amounts with automatic balance recalculation.
- **📊 Operational Dashboard**: At-a-glance metrics for total capital, expected interest, and profit breakdowns.
- **📅 Unified Payment Schedule**: Combined payment schedule and history view with status indicators (PAID, UPCOMING, OVERDUE).
- **🔐 Authentication**: Supabase-powered auth with session middleware protecting all dashboard routes.

---

## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| **Framework** | [Next.js 16.2](https://nextjs.org/) (App Router) |
| **UI Library** | [React 19](https://react.dev/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) (CSS-first configuration) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) |
| **Database** | [PostgreSQL via Supabase](https://supabase.com/) |
| **Auth** | [Supabase SSR Auth](https://supabase.com/docs/guides/auth/server-side) |
| **UI Primitives** | [Radix UI](https://www.radix-ui.com/), [Lucide React](https://lucide.dev/) |
| **Date Utilities** | [date-fns](https://date-fns.org/) |
| **Precision Math** | Cent-based integer arithmetic for financial calculations |

---

## 📂 Project Structure

```bash
├── app/
│   ├── (dashboard)/          # Protected route group
│   │   ├── page.tsx          # Main dashboard (metrics overview)
│   │   ├── layout.tsx        # Dashboard shell with sidebar
│   │   ├── borrowers/        # Borrower directory & detail pages
│   │   │   ├── page.tsx
│   │   │   ├── actions.ts    # createBorrower / updateBorrower / deleteBorrower
│   │   │   ├── borrowers-client.tsx
│   │   │   └── [id]/         # Individual borrower detail
│   │   └── loans/            # Loan management
│   │       ├── page.tsx
│   │       ├── actions.ts    # Loan CRUD & payment actions
│   │       ├── loan-list-client.tsx
│   │       ├── new/          # Loan creation wizard
│   │       └── [id]/         # Individual loan detail
│   ├── login/                # Auth pages
│   ├── globals.css           # Global styles & design tokens
│   └── layout.tsx            # Root layout
├── components/
│   ├── layout/               # Shell, Sidebar, TopNav
│   ├── borrowers/            # AddBorrowerModal
│   ├── loans/wizard/         # Multi-step loan creation wizard
│   ├── payment-modal.tsx     # Payment logging modal
│   └── ui/                   # Shared primitives (Button, Badge, etc.)
├── lib/
│   ├── types.ts              # Shared TypeScript interfaces (Loan, Borrower, Payment, Schedule)
│   ├── utils.ts              # cn() and shared helpers
│   ├── supabase/             # Supabase client (server, browser, middleware)
│   └── utils/                # Financial calculation utilities
├── docs/                     # Technical documentation
│   ├── PRD.md
│   ├── BUSINESS_LOGIC.md
│   ├── DATABASE-SCHEMA.md
│   ├── UI_ARCHITECTURE_DESIGN.md
│   └── development_roadmap.md
├── middleware.ts             # Session refresh & route protection
└── package.json
```

---

## 🏁 Getting Started

### Prerequisites

- Node.js 20+
- npm / pnpm / yarn
- A [Supabase](https://supabase.com/) project with the schema applied (see `docs/DATABASE-SCHEMA.md`)

### Installation

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd arzi-business-dashboard
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables — create a `.env.local` file at the root:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. You will be redirected to `/login` if not authenticated.

### Other Scripts

```bash
npm run build   # Production build
npm run start   # Start production server
npm run lint    # ESLint check
```

---

## 📄 Documentation

For deep dives into specific areas, refer to the following documents in `docs/`:

| Document | Description |
|---|---|
| [PRD](./docs/PRD.md) | Product Requirements Document |
| [Business Logic](./docs/BUSINESS_LOGIC.md) | Calculation engine & financial math |
| [Database Schema](./docs/DATABASE-SCHEMA.md) | SQL schema, tables & RLS policies |
| [UI Architecture](./docs/UI_ARCHITECTURE_DESIGN.md) | Design system & component tokens |
| [Development Roadmap](./docs/development_roadmap.md) | Phased feature roadmap & progress |

---

Built with ❤️ for the future of lending.
