
# CLAUDE.md — Olde Money Printing

## Project Overview
A premium print commerce platform focusing on high-fidelity image processing, secure transactions, and automated fulfillment.

--

## Tech Stack & Dashboards
* **Framework:** Next.js 14 (App Router)
* **Language:** TypeScript (Strict)
* **Styling:** Tailwind CSS + [shadcn/ui](https://ui.shadcn.com/)
* **Database/Auth:** [Supabase Dashboard](https://supabase.com/dashboard/project/jfsshvumndymnekydnef)
* **Payments:** [Stripe Dashboard](https://dashboard.stripe.com/acct_15mwZzHTT2xQVKD6/dashboard)
* **Email:** [Resend Emails](https://resend.com/emails)
* **Deployment:** [Vercel Project](https://vercel.com/minnowruss-projects/olde-money-printshop)
* **Image Lib:** Sharp (Server-side processing)

## Coding Standards
### React & Next.js
* **Components:** Favor Server Components (RSC) for data fetching. Use `"use client"` sparingly for interactivity.
* **File Naming:** Use kebab-case for files (e.g., `image-uploader.tsx`) and PascalCase for component exports.
* **Data Fetching:** Use `async/await` in Server Components. Use `useOptimistic` for high-latency UI updates.

### Image Processing (Sharp)
* Perform all `sharp` transformations within **Server Actions** or **API Routes** to keep the client bundle light.
* Always define explicit fallback dimensions to prevent Layout Shift (CLS).

---

## Commands & Workflows
* **Dev:** `npm run dev`
* **Build:** `npm run build`
* **Lint:** `npm run lint`
* **Type Check:** `npm run type-check`
* **Database:** `npx supabase db pull` (to sync local types with cloud schema)

## Critical Rules
* **Security:** All database interactions must respect **Row Level Security (RLS)** in Supabase.
* **Payments:** Never process order fulfillment until a `checkout.session.completed` webhook is verified from Stripe.
* **Environment:** Use `.env.local` for secrets; never commit them.
* **Naming:** Database tables should be snake_case; TypeScript interfaces should be PascalCase.
* **Project Management:** After each push live to GitHub, update the Status in the [Notion Sprint Board](https://www.notion.so/20b510d28a894160b14cf8b03920b097?v=e9ddce1bcd954746ad2ab9aa185cbee2)