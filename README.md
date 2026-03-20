# Arzi Business Dashboard 🏦💰

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

**Arzi Business Dashboard** is a premium, cloud-based loan management and payment tracking system. Designed for lending businesses transitioning from manual spreadsheets, it provides a sophisticated interface for tracking borrowers, automating loan schedules, and managing profit allocations with institutional precision.

---

## 🌟 Premium Fintech Aesthetic

The application is built on a **"Luxurious Metallic Gold"** and **"Gilded Ivory"** design system, delivering a professional SaaS experience:

- **Gilded Ivory Base**: A crisp, high-contrast minimalist background for high readability.
- **Metallic Gold Accents**: Sophisticated branding and primary actions.
- **Tabular Precision**: Strictly aligned numerical data for financial accuracy.

![Arzi Dashboard Preview](C:\Users\alec\.gemini\antigravity\brain\fd8bc3cf-1969-480b-8963-2ee793671cbd\arzi_dashboard_preview_1774024242010.png)

---

## 🚀 Key Features

- **👤 Borrower Directory**: Centralized management of borrower profiles with real-time status tracking (Active/Paid).
- **⚙️ The Calculation Engine**: 
  - **Small Loans (≤ 5k)**: Automatic 10% flat interest with flexible weekly/monthly schedules.
  - **Big Loans (> 5k)**: Amortized principal with declining interest models.
- **💎 Profit Allocation (RC & EDITH)**: Automated 80/20 split of interest income, allowing for manual monetary overrides.
- **⚡ One-Click Payments**: Rapid logging of arbitrary payment amounts with automatic balance recalculation.
- **📊 Operational Dashboard**: At-a-glance metrics for total capital, expected interest, and profit breakdowns.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **UI Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) (CSS-first configuration)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [PostgreSQL (via Supabase)](https://supabase.com/)
- **State Management**: Cent-based integer math for financial precision.

---

## 📂 Project Structure

```bash
├── app/                  # Next.js App Router (Pages, Layouts, CSS)
├── docs/                 # Detailed Technical Documentation
│   ├── BUSINESS_LOGIC.md     # Calculation Engine & Math
│   ├── DATABASE-SCHEMA.md    # SQL Schema & RLS Policies
│   ├── PRD.md                # Product Requirements
│   └── UI_ARCHITECTURE.md    # Design System & Tokens
├── public/               # Static Assets
└── package.json          # Project Dependencies
```

---

## 🏁 Getting Started

### Prerequisites
- Node.js 20+
- npm/pnpm/yarn

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Development
Run the development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## 📄 Documentation

For deep dives into specific areas, refer to the following documents:
- [Product Requirements](./docs/PRD.md)
- [Business Logic & Calculations](./docs/BUSINESS_LOGIC.md)
- [Database Schema](./docs/DATABASE-SCHEMA.md)
- [UI Architecture & Design System](./docs/UI_ARCHITECTURE_DESIGN.md)

---

Built with ❤️ for the future of lending.
