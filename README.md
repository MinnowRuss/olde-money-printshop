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

## Contributing Guidelines

### Code Style

- Prefer React Server Components for data fetching. Use `"use client"` only when interactivity requires it.
- File names: `kebab-case.tsx`. Component exports: `PascalCase`.
- Database tables: `snake_case`. TypeScript interfaces: `PascalCase`.
