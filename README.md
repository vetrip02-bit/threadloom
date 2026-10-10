# Threadloom — Wholesale Uniform Storefront

A production-ready Next.js storefront for a B2B wholesale uniform and corporate
workwear business. The conversion path is **Request a Quote**, not a consumer
checkout: there is no cart, no payment gateway and no pricing commitment
anywhere in the application.

- **Framework:** Next.js 15 (App Router) + TypeScript
- **Styling:** Tailwind CSS 3, Poppins via `next/font/google`
- **Icons:** lucide-react
- **Validation:** Zod (server-side on every endpoint, and client-side for fast feedback)
- **Hosting:** GitHub Pages — fully static export, no server runtime
- **Enquiry delivery:** Web3Forms, posted straight from the browser — **required**
- **Accounts:** Supabase Auth with an RLS-protected `profiles` table — *optional*

---

## Table of contents

1. [Quick start](#1-quick-start)
2. [Image assets](#2-image-assets)
3. [Environment variables](#3-environment-variables)
4. [Enquiry delivery setup (required)](#4-enquiry-delivery-setup-required)
5. [Customer accounts (optional)](#5-customer-accounts-optional)
6. [Deploying to GitHub Pages](#6-deploying-to-github-pages)
7. [Scripts](#7-scripts)
8. [Security notes](#8-security-notes)
9. [Project structure](#9-project-structure)
10. [What the business owner must replace](#10-what-the-business-owner-must-replace)

---

## 1. Quick start

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev                  # http://localhost:3000
```

The site builds and browses with no credentials, but **enquiry delivery is not
optional**:

| Not configured | What happens |
| --- | --- |
| Resend (`RESEND_API_KEY` + `ENQUIRY_TO_EMAIL`) | The quote API returns **503** and the form tells the visitor to email or call instead. It never reports success for an enquiry nobody will receive. |
| Zoho | Enquiries still arrive by email; the CRM copy is simply skipped. |
| Contact details | The site shows obvious `[bracketed]` placeholders. |

| Supabase | The account system is **hidden entirely** — no Log in / Sign up buttons, and `/signin`, `/signup`, `/account` return 404. Guest quoting is unaffected. |

### Two ways to enquire

1. **As a guest** — build a quote bag, fill in the contact fields, submit.
   No account needed, and this path never asks anyone to register.
2. **With an account** — **Log in** / **Sign up** in the header. After signing
   up or logging in the customer lands back on the page they came from, and
   their contact details are filled in automatically on every future quote.
   They confirm rather than retype, with an **Edit** link if anything changed.

A signed-in customer is never shown the registration page again.

---

## 2. Image assets

Six images belong in `public/images/`, already included in this repository:

| File | Used for | Native size | Loading |
| --- | --- | --- | --- |
| `hero-uniforms.png` | Homepage hero | 1672 × 941 (16:9) | `priority`, `fetchPriority="high"` |
| `school-college-uniforms.png` | School & College category | 1122 × 1402 (4:5) | lazy |
| `custom-tshirts.png` | Custom T-Shirts category | 1122 × 1402 (4:5) | lazy |
| `event-merchandise.png` | Event Merchandise category | 1122 × 1402 (4:5) | lazy |
| `hospitality-uniforms.png` | Restaurant & Hotel category | 1122 × 1402 (4:5) | lazy |
| `sports-jerseys.png` | Sports Jerseys category | 1122 × 1402 (4:5) | lazy |

**If you replace them, keep the aspect ratios** (16:9 for the hero, 4:5 for
categories) and the exact filenames — every reference lives in
`src/data/catalog.ts` and `src/components/home/Hero.tsx`.

Cropping is tuned to protect faces and garments:

- The hero uses `object-[78%_center]` so the people stay in frame on the right
  while the headline sits on plain white to its left. There is **no dark
  overlay** anywhere — copy and image never share the same space.
- Category images use `object-top` so heads are never cropped when a 4:5
  source is shown in a shorter box.

Every image also carries descriptive `alt` text (edit it in
`src/data/catalog.ts` alongside the image path).

---

## 3. Environment variables

Copy `.env.example` to `.env.local`.

### Required

| Variable | Purpose |
| --- | --- |
| `RESEND_API_KEY` | Resend API key. **Without it the quote form refuses enquiries.** |
| `ENQUIRY_TO_EMAIL` | Inbox that receives enquiries. |

### Public — exposed in the browser bundle

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical origin for metadata, Open Graph, sitemap and canonicals. |
| `NEXT_PUBLIC_ALLOW_INDEXING` | Must be exactly `"true"` to allow search engines. Anything else serves site-wide `noindex`. |
| `NEXT_PUBLIC_CONTACT_EMAIL` / `_PHONE` / `_ADDRESS` / `_HOURS` / `NEXT_PUBLIC_GSTIN` | Public contact details. Address lines are pipe-separated. |

These are safe to expose — they are the same details already printed in the
site footer.

### Server only — never prefix with `NEXT_PUBLIC_`

| Variable | Purpose |
| --- | --- |
| `ENQUIRY_FROM_EMAIL` | Sender address. Defaults to Resend's sandbox sender. |
| `ZOHO_CLIENT_ID` / `_SECRET` / `_REFRESH_TOKEN` | Optional Zoho OAuth credentials. |
| `ZOHO_ACCOUNTS_URL` / `ZOHO_API_DOMAIN` | Your Zoho data centre (table below). |
| `ZOHO_QUOTE_MODULE` | Module receiving enquiries. Default `Leads`. |
| `ZOHO_DEBUG` | `1` logs redacted Zoho response codes. Unset in production. |

### Zoho data centre URLs

Zoho is regional. Use the pair matching where your CRM account lives.

| Region | `ZOHO_ACCOUNTS_URL` | `ZOHO_API_DOMAIN` |
| --- | --- | --- |
| India | `https://accounts.zoho.in` | `https://www.zohoapis.in` |
| United States | `https://accounts.zoho.com` | `https://www.zohoapis.com` |
| Europe | `https://accounts.zoho.eu` | `https://www.zohoapis.eu` |
| Australia | `https://accounts.zoho.com.au` | `https://www.zohoapis.com.au` |
| Japan | `https://accounts.zoho.jp` | `https://www.zohoapis.jp` |
| Canada | `https://accounts.zohocloud.ca` | `https://www.zohoapis.ca` |
| Saudi Arabia | `https://accounts.zoho.sa` | `https://www.zohoapis.sa` |

> A mismatched data centre is the most common cause of `INVALID_TOKEN`. The
> server prefers the `api_domain` Zoho returns, so it is never hard-coded.

## 4. Enquiry delivery setup (required)

This site is a **static export** served by GitHub Pages. There is no server, so
there is nowhere to keep a secret API key. Enquiries are posted from the
visitor's browser to [Web3Forms](https://web3forms.com), which exists for
exactly this case.

1. Go to [web3forms.com](https://web3forms.com), enter the inbox that should
   receive enquiries, and they email you an **access key**. No account, no
   password.
2. Add it as a repository variable (below) or to `.env.local` as
   `NEXT_PUBLIC_WEB3FORMS_KEY`.

### Why that key is public, and why that is fine

It ships in the JavaScript bundle. That is by design: the key only names the
destination inbox, it cannot read submissions or your account, and Web3Forms
applies its own spam filtering. The worst a copied key allows is unsolicited
mail to you — which the honeypot field and Web3Forms' filtering already blunt.
It is not a credential in the sense that a Resend or Zoho key is.

**Without the key the quote form refuses enquiries** — HTTP never happens, the
customer sees your email and phone instead. It never pretends to have sent
something.

### Contact details

Set these so the site stops showing `[bracketed]` placeholders, and so the
delivery fallback gives customers something real:

```
NEXT_PUBLIC_CONTACT_EMAIL, NEXT_PUBLIC_CONTACT_PHONE,
NEXT_PUBLIC_CONTACT_ADDRESS (pipe-separated lines),
NEXT_PUBLIC_CONTACT_HOURS, NEXT_PUBLIC_GSTIN
```

---

## 5. Customer accounts (optional)

Leave the two Supabase variables unset and the account system **disappears
entirely** — no Log in / Sign up buttons, and `/signin` and `/signup` are not
even built. Guest quoting is unaffected.

To enable it:

1. Create a free project at [supabase.com](https://supabase.com).
2. **Project Settings → API** — copy the Project URL and the anon public key.
3. **SQL Editor → New query** — paste all of
   [`supabase/schema.sql`](supabase/schema.sql) and run it. It creates the
   `profiles` table, Row Level Security policies restricting every row to its
   owner, and a trigger seeding the profile from the sign-up form.
4. **Authentication → URL Configuration** — set the Site URL to your Pages URL
   and add `http://localhost:3000` for local development.
5. **Authentication → Providers → Email** — turning **Confirm email off** makes
   sign-up log the customer straight in and return them to the page they came
   from. Both paths are implemented.

### Security on a static host

There is no middleware and no server session, so the `/account` guard runs in
the browser. **The data behind it is still protected**: Supabase Row Level
Security means a profile row can only ever be read by its owner, whatever the
browser does. The client-side guard is a navigation convenience, not the
security boundary.

---

## 6. Deploying to GitHub Pages

Already wired up. `.github/workflows/deploy.yml` runs on every push to `main`:
lint → typecheck → test → build → publish. **A failing gate blocks the
deploy**, so a broken build cannot reach the live site.

One-time setup:

1. **Settings → Pages → Build and deployment → Source** → **GitHub Actions**.
2. **Settings → Secrets and variables → Actions → Variables** → add the
   `NEXT_PUBLIC_*` values you want baked into the build. They are *variables*,
   not secrets, because every one of them ends up in the client bundle anyway —
   storing them as secrets would imply a confidentiality the build cannot
   provide.

| Variable | Effect if unset |
| --- | --- |
| `NEXT_PUBLIC_WEB3FORMS_KEY` | Quote form refuses enquiries |
| `NEXT_PUBLIC_SUPABASE_URL` / `_ANON_KEY` | Account system hidden |
| `NEXT_PUBLIC_CONTACT_*` | `[placeholders]` shown |
| `NEXT_PUBLIC_ALLOW_INDEXING` | Whole site serves `noindex` |

`NEXT_PUBLIC_BASE_PATH` and `NEXT_PUBLIC_SITE_URL` are set automatically from
the Pages configuration — don't set them by hand.

### What a static host costs you

| Gone | Why, and what replaced it |
| --- | --- |
| `/api/quote` | No server. The browser posts to Web3Forms instead. |
| `middleware.ts` | No server. `/account` guards client-side; RLS still protects the data. |
| Zoho CRM sync | Needs a server to hold OAuth secrets. Removed — recoverable from git history if you move to a Node host. |
| Security headers | Pages cannot set them. `next.config.mjs` documents how to restore the `headers()` block. |
| Server-side rate limiting | Web3Forms applies its own; the honeypot is still in place. |

### Moving back to a Node host later

Remove `output`, `basePath`, `assetPrefix` and `images.unoptimized` from
`next.config.mjs`, restore the `headers()` block, and deploy to Vercel or any
Node host. Everything else works unchanged.

### The `?next=` redirect

Each header button carries the current path, e.g.
`/signup?next=%2Funiforms%2Fcustom-tshirts`, so the customer returns to where
they were. That value runs through `safeRedirect()`
(`src/lib/safe-redirect.ts`), which rejects absolute URLs, protocol-relative
URLs, backslash and scheme tricks, and auth pages. Without it,
`?next=https://evil.example` would make your login page an open redirect.
On a static host this check runs client-side, on exactly the value that will be
used. Seven tests cover it.

### Passwords

Handled entirely by Supabase Auth and stored hashed by them. This application
never reads, stores, logs or forwards a password, and never includes one in a
validation error — there is a test for that.

---

## 7. Scripts

| Command | Does |
| --- | --- |
| `npm run dev` | Dev server on :3000 |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint (next/core-web-vitals + TypeScript) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest — validation schemas and Zoho payload mapping, with all network and secrets mocked |
| `npm run test:watch` | Vitest in watch mode |

The test suite covers Zod validation (including the honeypot and consent gates)
the email path (configuration gaps, rendering, HTML escaping, and that a
provider failure throws rather than returning success) and the Zoho payload
builders. All network calls and secrets are mocked.

---

## 8. Security notes

- **Provider credentials are server-only.** `src/lib/email/send.ts` and
  `src/lib/zoho/client.ts` both import `server-only`, so importing either from
  a client component is a build error, not a runtime leak.
- **No passwords exist.** There are no accounts, no sessions and no
  credentials of any kind belonging to visitors.
- **An enquiry is never reported as delivered unless it was.** If the mail
  provider is unconfigured or fails, the API returns 503/502 and the form shows
  the customer how to reach a human. This is covered by tests.
- **Enquiry content is HTML-escaped** before it enters the email body, so a
  hostile submission cannot inject markup into your inbox.
- **CRM failure never blocks a customer** — the email has already been sent by
  the time Zoho is attempted, so a CRM error is logged and swallowed.
- **Upstream errors are not forwarded.** Zoho response bodies stay server-side;
  the browser gets a generic message. `redactForLog` strips `1000.*` Zoho tokens and
  `client_secret` / `refresh_token` / `access_token` values, and
  `redactEmailError` strips `re_*` Resend keys, before anything is logged.
- **Every endpoint validates with Zod** and is rate-limited (5 enquiries per IP
  per 10 minutes), with a request-size cap
  and a honeypot field. A filled honeypot receives a **normal success
  response** so bots learn nothing.
- **Security headers** (`X-Content-Type-Options`, `Referrer-Policy`,
  `X-Frame-Options`) are set in `next.config.mjs`.
- `/api/` is disallowed in `robots.txt`, and the whole site serves `noindex`
  until `NEXT_PUBLIC_ALLOW_INDEXING=true`.

---

## 9. Project structure

```text
src/
├── app/
│   ├── layout.tsx                  Poppins, header/footer, Organization JSON-LD
│   ├── page.tsx                    Homepage
│   ├── uniforms/                   Listing + [slug] category pages (SSG)
│   ├── industries/  customization/  about/  contact/
│   ├── quote/                      Quote builder page
│   ├── privacy/  terms/
│   ├── api/quote/route.ts          The only endpoint. Delivers or refuses.
│   ├── not-found.tsx  error.tsx  sitemap.ts  robots.ts
├── components/
│   ├── layout/    AnnouncementBar, Header, MobileMenu, SearchPanel, Footer
│   ├── home/      Hero, TrustStrip, CategoryGrid, ProductGrid, ProcessSteps, …
│   ├── catalog/   ProductCard, Breadcrumbs
│   ├── quote/     QuoteProvider, QuoteDrawer, QuoteForm, EnquiryForm,
│   │              DeliveryFallback
│   └── ui/        Button, Section, Field, Overlay, PageHeader, LegalPage
├── data/catalog.ts                 ← all editable product/category seed data
├── lib/
│   ├── site.ts                     ← brand + env-driven contact details
│   ├── email/                      config.ts, render.ts, send.ts  (required)
│   ├── zoho/                       client.ts + mapping.ts        (optional)
│   ├── validation/schemas.ts       Zod schemas, shared by client and server
│   ├── rate-limit.ts  utils.ts
└── types/index.ts
```

**Product markup is not duplicated.** One `ProductCard` renders every product
everywhere; the homepage, the listing page and each category page all map over
the same typed data in `src/data/catalog.ts`. Both enquiry forms share one
`DeliveryFallback`, so a failure looks the same everywhere.

### Design system

| Token | Value | Used for |
| --- | --- | --- |
| Page background | `#FFFFFF` | Every page |
| Supporting surface | `#F7F4EF` ivory | Alternating sections only |
| Primary ink | `#132238` navy | Headings, nav |
| Accent / CTA | `#7A1F33` burgundy, `#611728` hover | Primary buttons, links |
| Secondary text | `#3E4147` charcoal | Body copy |
| Fine accent | `#B99052` gold | Rules and bullet dots **only** |
| Borders | `#E8E8E8` | Hairlines |

All text combinations meet **WCAG AA**: navy 15.99:1, burgundy 10.14:1 and
charcoal 10.23:1 on white; the lightest muted text is charcoal at 80% (5.66:1
on white, 5.32:1 on ivory). Gold measures 2.93:1 against white and is therefore
**never used for text** — only for decorative rules and dots.

Accessibility also covers: a skip link, semantic landmarks, one `h1` per page
with an unbroken heading outline, labelled form controls with
`aria-invalid` / `aria-describedby` wiring, a visible focus ring on every
interactive element, focus trapping and focus restore on all modal surfaces,
`aria-live` regions for search results and form status, and a global
`prefers-reduced-motion` override.

### Structured data

`Organization` site-wide, `BreadcrumbList` on every inner page, and `FAQPage` on
`/customization`. **Product JSON-LD is deliberately omitted** — the catalogue
ships with indicative price bands rather than firm offers, and marking those up
as `Offer` data would misrepresent them. Add it once you publish real prices.

---

## 10. What the business owner must replace

### Must change before launch

| Where | What |
| --- | --- |
| Environment | Contact details now come from `NEXT_PUBLIC_CONTACT_*`; unset values render as `[bracketed]` placeholders |
| `src/lib/site.ts` → `SOCIAL` | Four `#` placeholders → your real profile URLs |
| `src/components/layout/Header.tsx` | Text wordmark → your logo (marked `TODO(owner)`) |
| `src/components/layout/Footer.tsx` | Same wordmark placeholder |
| `src/data/catalog.ts` | The whole sample catalogue: products, colours, fabrics, MOQs and the **indicative INR price bands** |
| `src/components/catalog/ProductCard.tsx` | The typographic colour-swatch placeholder → your product photography (marked `TODO(owner)`) |
| `src/app/about/page.tsx` | Placeholder company story — there is an on-page notice flagging it |
| `src/app/privacy/page.tsx` | Retention period, plus a legal review |
| `.env.local` / Vercel env | `RESEND_API_KEY` + `ENQUIRY_TO_EMAIL` — **without these the quote form refuses every enquiry** |
| `.env.local` / Vercel env | `NEXT_PUBLIC_CONTACT_EMAIL` and `_PHONE` — shown to customers when delivery fails |
| `src/app/terms/page.tsx` | Governing-law jurisdiction, plus a legal review |
| `.env.local` | Every credential |

### Deliberately absent

Nothing in this project claims a certification, award, client name, client
logo, rating, review, testimonial, years in business, order volume, delivery
time or firm price. Product cards show **no discount and no review count**.
Those are business claims only you can make — and evidence.

Price bands in `src/data/catalog.ts` are clearly sample data, labelled on every
card as *"Sample band, excluding GST and branding"*. Set a product's
`indicativePriceInr` to `null` and the card shows **"Price on enquiry"**
instead.

### Easy to change

| Where | What |
| --- | --- |
| `src/lib/site.ts` → `ANNOUNCEMENT` | Announcement-bar text |
| `src/lib/site.ts` → `NAV_LINKS` | Navigation |
| `src/lib/site.ts` → `BRAND` | Name, tagline, meta description |
| `src/data/catalog.ts` | Categories, image alt text, process steps, customization options, industries, trust points |
| `tailwind.config.ts` | Design tokens |
