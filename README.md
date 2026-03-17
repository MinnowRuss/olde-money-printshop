# Olde Money Printshop

> Museum-quality photo prints on canvas, metal, acrylic, and fine art paper.
> Upload, customize, and order online with volume discounts.

**Live site:** https://printing.oldemoney.com
**Vercel project:** https://vercel.com/minnowruss-projects/olde-money-printshop

---

## What This Is

Olde Money Printshop is a premium print-commerce platform. Customers upload their images, choose a print medium and size, crop and preview the result, then check out. Orders are fulfilled automatically after Stripe payment confirmation. The admin panel tracks order status from payment through shipment.

---

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

---

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/<your-org>/olde-money-printshop.git
cd olde-money-printshop
npm install
```

### 2. Set up environment variables

Create a `.env.local` file in the project root. **Never commit this file.**

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

Find the values in:
- **Supabase:** https://supabase.com/dashboard/project/jfsshvumndymnekydnef → Settings → API
- **Stripe:** https://dashboard.stripe.com/acct_15mwZzHTT2xQVKD6/dashboard → Developers → API keys
- **Resend:** https://resend.com → API Keys

### 3. Sync the database schema

```bash
npx supabase db pull
```

This updates the local TypeScript types to match the live Supabase schema.

### 4. Run the dev server

```bash
npm run dev
```

Open http://localhost:3000.

---

## Common Commands

| Command | What it does |
|---|---|
| `npm run dev` | Start local development server |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |
| `npm run type-check` | Run TypeScript type checker |
| `npm test` | Run tests (Vitest) |
| `npm run test:watch` | Run tests in watch mode |
| `npx supabase db pull` | Sync local types with cloud schema |

---

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

---

## Key Rules

**Security**
- All database queries respect Supabase Row Level Security (RLS). Never bypass it.
- Secrets live in `.env.local` only. Never commit them.

**Payments**
- Order fulfillment is only triggered after a verified `checkout.session.completed` webhook from Stripe. Do not fulfill based on client-side signals.

**Image Processing**
- All Sharp transformations must run in Server Actions or API Routes — never in client components.

**Code Style**
- Prefer React Server Components for data fetching. Use `"use client"` only when interactivity requires it.
- File names: `kebab-case.tsx`. Component exports: `PascalCase`.
- Database tables: `snake_case`. TypeScript interfaces: `PascalCase`.

---

## Dashboards & External Services

| Service | Link |
|---|---|
| Supabase (DB + Auth) | https://supabase.com/dashboard/project/jfsshvumndymnekydnef |
| Stripe (Payments) | https://dashboard.stripe.com/acct_15mwZzHTT2xQVKD6/dashboard |
| Resend (Email) | https://resend.com/emails |
| Vercel (Deployment) | https://vercel.com/minnowruss-projects/olde-money-printshop |

---

## After Deploying

After every push that goes live, update the task status on the [Notion Sprint Board](https://www.notion.so/20b510d28a894160b14cf8b03920b097?v=e9ddce1bcd954746ad2ab9aa185cbee2).

---

<!-- ============================================================
  README TEMPLATE GUIDE — for Russ

  A good README answers four questions for anyone new to the repo:

  1. WHAT is this?
     → A short description + live URL at the top.
        Keep it to 2–3 sentences. Think elevator pitch.

  2. HOW do I run it?
     → Installation steps, environment variables, and the
        "start the dev server" command. Be literal — assume
        the reader is starting from nothing.

  3. WHAT'S IN HERE?
     → A project structure section showing the folder layout.
        You don't need every file — just the important ones
        with a one-line comment explaining each.

  4. WHAT DO I NEED TO KNOW?
     → Rules, gotchas, and important links. This is where you
        put the "don't forget to do X" things that aren't
        obvious from the code itself.

  OPTIONAL sections worth adding as the project grows:
  - "How to contribute" (branching strategy, PR process)
  - "How to run tests" (if not obvious from the commands table)
  - "Architecture decisions" (link to an /docs folder or ADR log)
  - "Changelog" (or link to GitHub releases)

  FORMATTING tips:
  - Use tables for commands and tech stack — they scan faster than lists.
  - Use code blocks (```) for anything someone needs to copy-paste.
  - Keep the tone direct. README readers are usually in a hurry.
  - Update it whenever something important changes.

============================================================ -->
