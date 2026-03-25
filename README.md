# Olde Money Printshop

> Museum-quality photo prints on canvas, metal, acrylic, and fine art paper — upload, customize, and order online.

🌐 **Live site:** [printing.oldemoney.com](https://printing.oldemoney.com)

---

## Overview

Olde Money Printshop is a premium print-commerce platform. Customers upload their images, choose a print medium and size, crop and preview the result, then check out. Orders are fulfilled automatically after Stripe payment confirmation. An admin panel tracks order status from payment through shipment.

## Tech Stack

| Layer | Tool |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS + shadcn/ui |
| Database & Auth | Supabase (Postgres + Row Level Security) |
| Payments | Stripe (webhooks for fulfillment gating) |
| Image Processing | Sharp (server-side only) |
| Email | Resend |
| Deployment | Vercel |
| Analytics | Vercel Analytics + Google Analytics |

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- A Supabase project, Stripe account, and Resend account

### 1. Clone and install

```bash
git clone https://github.com/<your-org>/olde-money-printshop.git
cd olde-money-printshop
npm install
```

### 2. Set up environment variables

Copy the example below into a new `.env.local` file in the project root. Fill in each value from the respective service dashboard. **Never commit `.env.local`.**

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Resend (email)
RESEND_API_KEY=

# App
NEXT_PUBLIC_URL=https://printing.oldemoney.com
NEXT_PUBLIC_GA_MEASUREMENT_ID=
```

### 3. Sync the database schema

```bash
npx supabase db pull
```

This updates the local TypeScript types to match the live Supabase schema.

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/                  # All pages and API routes (Next.js App Router)
│   ├── page.tsx          # Homepage
│   ├── layout.tsx        # Root layout (Navbar, Footer, Analytics)
│   ├── auth/             # Login and registration pages
│   ├── image/            # Image gallery and upload
│   ├── order-image/      # Order wizard: crop → review → finish
│   ├── order/            # Cart, checkout, success, order history
│   ├── admin/            # Admin order management panel
│   ├── calculator/       # Pricing calculator
│   ├── prices/           # Public pricing page
│   ├── api/              # API route handlers
│   │   ├── images/       # Image upload and management
│   │   ├── orders/       # Order creation and status
│   │   ├── webhooks/     # Stripe webhook handler
│   │   ├── upload/       # File upload endpoint
│   │   └── ...
│   └── ...               # Content pages (about, contact, services, etc.)
├── components/           # Shared React components
│   ├── ui/               # shadcn/ui base components
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── PricingCalculator.tsx
│   └── ...
```

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start local development server |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |
| `npm run type-check` | Run TypeScript type checker |
| `npm test` | Run tests (Vitest) |
| `npm run test:watch` | Run tests in watch mode |
| `npx supabase db pull` | Sync local types with cloud schema |

## Contributing Guidelines

### Security

- All database queries must respect Supabase Row Level Security (RLS). Never bypass it.
- Secrets live in `.env.local` only. Never commit them.

### Payments

- Order fulfillment is only triggered after a verified `checkout.session.completed` webhook from Stripe. Do not fulfill based on client-side signals.

### Image Processing

- All Sharp transformations must run in Server Actions or API Routes — never in client components.

### Code Style

- Prefer React Server Components for data fetching. Use `"use client"` only when interactivity requires it.
- File names: `kebab-case.tsx`. Component exports: `PascalCase`.
- Database tables: `snake_case`. TypeScript interfaces: `PascalCase`.
