# Threadloom — Wholesale Uniform Storefront

A production-ready Next.js storefront for a B2B wholesale uniform and corporate
workwear business. The conversion path is **Request a Quote**, not a consumer
checkout: there is no cart, no payment gateway and no pricing commitment
anywhere in the application.

- **Framework:** Next.js 15 (App Router) + TypeScript
- **Styling:** Tailwind CSS 3, Poppins via `next/font/google`
- **Icons:** lucide-react
- **Validation:** Zod (server-side on every endpoint, and client-side for fast feedback)
- **Auth:** Supabase Auth (email + password) with a protected `profiles` table
- **CRM:** Zoho CRM REST API v8 over OAuth 2.0, server-side only

---

## Table of contents

1. [Quick start](#1-quick-start)
2. [Image assets](#2-image-assets)
3. [Environment variables](#3-environment-variables)
4. [Supabase setup](#4-supabase-setup)
5. [Zoho CRM setup](#5-zoho-crm-setup)
6. [Finding Zoho Field API Names](#6-finding-zoho-field-api-names)
7. [Testing the CRM sync safely](#7-testing-the-crm-sync-safely)
8. [Scripts](#8-scripts)
9. [Deployment](#9-deployment)
10. [Security notes](#10-security-notes)
11. [Project structure](#11-project-structure)
12. [What the business owner must replace](#12-what-the-business-owner-must-replace)

---

## 1. Quick start

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev                  # http://localhost:3000
```

The site **builds and runs with no credentials at all**. Supabase and Zoho are
both optional at build time:

| Not configured | What happens |
| --- | --- |
| Supabase | Sign-in / sign-up render a neutral "accounts are not connected yet" notice. Everything else works. |
| Zoho | Quote enquiries still return success to the visitor; the server logs a warning so nothing is silently lost. |

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

Copy `.env.example` to `.env.local`. Only the two `NEXT_PUBLIC_` Supabase keys
are ever exposed to the browser.

### Public

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical origin, used for metadata, Open Graph, sitemap and canonicals. |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/publishable key. Safe to expose — RLS is what protects the data. |

### Server only — never prefix with `NEXT_PUBLIC_`

| Variable | Purpose |
| --- | --- |
| `ZOHO_CLIENT_ID` | OAuth client id. |
| `ZOHO_CLIENT_SECRET` | OAuth client secret. |
| `ZOHO_REFRESH_TOKEN` | Long-lived refresh token. |
| `ZOHO_ACCOUNTS_URL` | Accounts host for **your** data centre (see the table below). |
| `ZOHO_API_DOMAIN` | Fallback API domain. Only used when Zoho's token response omits `api_domain`. |
| `ZOHO_CRM_MODULE` | Module that receives registered customers. Default `Contacts`. |
| `ZOHO_QUOTE_MODULE` | Module that receives quote enquiries. Default `Leads`. |
| `ZOHO_DEBUG` | Set to `1` to log redacted Zoho response codes while wiring up. Leave unset in production. |

### Data centre URLs

Zoho is regional. Use the pair that matches where your CRM account lives — the
account you signed up with, not where you happen to be.

| Region | `ZOHO_ACCOUNTS_URL` | `ZOHO_API_DOMAIN` |
| --- | --- | --- |
| India | `https://accounts.zoho.in` | `https://www.zohoapis.in` |
| United States | `https://accounts.zoho.com` | `https://www.zohoapis.com` |
| Europe | `https://accounts.zoho.eu` | `https://www.zohoapis.eu` |
| Australia | `https://accounts.zoho.com.au` | `https://www.zohoapis.com.au` |
| Japan | `https://accounts.zoho.jp` | `https://www.zohoapis.jp` |
| Canada | `https://accounts.zohocloud.ca` | `https://www.zohoapis.ca` |
| Saudi Arabia | `https://accounts.zoho.sa` | `https://www.zohoapis.sa` |

> A mismatched data centre is the single most common cause of
> `INVALID_TOKEN` / `invalid_client`. The server prefers the `api_domain` Zoho
> returns with each access token, so the data centre is never hard-coded.

---

## 4. Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. **Project Settings → API** — copy the **Project URL** and the **anon public**
   key into `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. **SQL Editor → New query** — paste the whole of
   [`supabase/schema.sql`](supabase/schema.sql) and run it. It creates:
   - a `customer_type` enum,
   - the `public.profiles` table keyed to `auth.users(id)`,
   - **Row Level Security** policies so a user can only read and write their
     own row,
   - an `on_auth_user_created` trigger that seeds the profile from the sign-up
     metadata,
   - a trigger that keeps `profiles.email` in step with a verified email change,
   - an `updated_at` touch trigger.
4. **Authentication → Providers → Email** — enable it. Keep **Confirm email**
   on for production; the sign-up form already handles the
   "check your inbox" state.
5. **Authentication → URL Configuration** — set the Site URL to your real
   origin and add `http://localhost:3000` as an additional redirect URL for
   local development.

### Why profile data travels as auth metadata

The sign-up form passes the non-secret profile fields through
`supabase.auth.signUp({ options: { data } })`. The database trigger reads them
from `raw_user_meta_data` and writes the profile row in the same transaction as
the user row, so a confirmed sign-up can never leave an account without a
profile.

**The password is never part of that metadata.** It goes straight to Supabase
Auth, is hashed there, and is never read, logged, stored by this application or
forwarded to Zoho.

---

## 5. Zoho CRM setup

### Create a server-based OAuth client

1. Go to the [Zoho API Console](https://api-console.zoho.com/) **for your data
   centre** (`api-console.zoho.in` for India, and so on).
2. **Add Client → Self Client** (simplest for a server-to-server integration).
3. Note the **Client ID** and **Client Secret**.

### Generate a refresh token

1. In the Self Client, open the **Generate Code** tab.
2. Scope:

   ```text
   ZohoCRM.modules.ALL,ZohoCRM.settings.fields.READ
   ```

   `settings.fields.READ` is not required at runtime, but it lets you list
   Field API Names through the API (see the next section).
3. Set a duration (10 minutes is plenty), enter any description, and generate.
   Copy the **grant code** — it expires quickly.
4. Exchange it for a refresh token. Replace the host with your data centre:

   ```bash
   curl -X POST https://accounts.zoho.in/oauth/v2/token \
     -d "grant_type=authorization_code" \
     -d "client_id=YOUR_CLIENT_ID" \
     -d "client_secret=YOUR_CLIENT_SECRET" \
     -d "code=THE_GRANT_CODE"
   ```

5. Copy `refresh_token` from the response into `ZOHO_REFRESH_TOKEN`.
   **The refresh token does not expire** unless revoked — treat it exactly like
   a password.

### How the integration behaves

| Function | Lives in | Behaviour |
| --- | --- | --- |
| `refreshAccessToken` | `src/lib/zoho/client.ts` | Exchanges the refresh token for an access token, caches it in memory until 60s before expiry, and prefers the `api_domain` Zoho returns. |
| `upsertContact` | `src/lib/zoho/client.ts` | Upserts into `ZOHO_CRM_MODULE` with `Email` as the duplicate key, so repeat sign-ins update one record instead of creating duplicates. Retries once on a 401 with a forced token refresh. |
| `createQuoteEnquiry` | `src/lib/zoho/client.ts` | Creates a record in `ZOHO_QUOTE_MODULE`. Enquiries are deliberately **not** de-duplicated — each is a distinct event. |

All three take an explicit config argument with an env-backed default, so they
are unit-testable with no network and no secrets.

### Default field mapping

Edit `src/lib/zoho/mapping.ts`. The keys on the left are internal; **the values
on the right are Zoho Field API Names and are the only thing you should change.**

**Contacts** (standard fields, work out of the box):

| Internal | Zoho API Name |
| --- | --- |
| `firstName` | `First_Name` |
| `lastName` | `Last_Name` *(required by Zoho)* |
| `email` | `Email` — taken from the authenticated session, never the request body |
| `phone` | `Phone` |
| `city` | `Mailing_City` |
| `leadSource` | `Lead_Source` → `"Website Registration"` |

> `Lead_Source` is a standard field, but **"Website Registration" is not a stock
> picklist value.** Add it under *Setup → Customization → Modules and Fields →
> Contacts → Lead Source*, or set `leadSource` to `null`. Writing an unknown
> picklist value makes Zoho reject the whole record.

**Optional custom fields — all `null` until you create them in Zoho:**

| Internal | Suggested Zoho field | Suggested API Name |
| --- | --- | --- |
| `organization` | Single Line | `Organization_Name` |
| `customerType` | Pick List | `Customer_Type` |
| `supabaseUserId` | Single Line | `Supabase_User_ID` |
| `consentTimestamp` | Date/Time | `Consent_Timestamp` |
| `lastWebsiteSignIn` | Date/Time | `Last_Website_Sign_In` |

**Quote enquiries** default to the stock **Leads** layout, with the full enquiry
(including a structured item summary) written to `Description`. Optional custom
fields — `estimatedQuantity`, `expectedDate`, `requirements`, `itemsSummary`,
`consentTimestamp` — are `null` until you map them.

Quote items are sent as a concise text block, one numbered line per item, until
you configure a dedicated CRM subform. Swap `formatQuoteItems` for a subform
payload when you do.

**Unmapped values are omitted, not blanked.** Empty strings and nulls are
dropped from the payload so a sync can never wipe data a colleague typed into
the CRM by hand.

---

## 6. Finding Zoho Field API Names

Zoho is case-sensitive and **silently ignores unknown keys** — a wrong name
looks like "the sync succeeded but the field is empty". Three ways to get it
right:

**A. Through the UI**
*Setup → Customization → Modules and Fields → `<module>` → edit the field.*
The **API Name** is shown in the field properties panel.

**B. The API-names screen**
*Setup → Developer Space → APIs → API Names* lists every module and field.

**C. Through the API** (needs `ZohoCRM.settings.fields.READ`):

```bash
curl -s "https://www.zohoapis.in/crm/v8/settings/fields?module=Contacts" \
  -H "Authorization: Zoho-oauthtoken YOUR_ACCESS_TOKEN" \
  | python3 -c "import json,sys; [print(f\"{f['api_name']:<34} {f['field_label']}\") for f in json.load(sys.stdin)['fields']]"
```

Custom fields you create carry a suffix, e.g. `Customer_Type` may actually be
`Customer_Type1` if the label collided. **Copy the API Name exactly.**

Also confirm the field is on the **layout** assigned to the integration user —
a field that exists but is not on the layout will be rejected.

---

## 7. Testing the CRM sync safely

**Do this in a sandbox or a free developer org before you point it at
production CRM data.**

1. Create a [free Zoho CRM developer edition](https://www.zoho.com/crm/developer/)
   account, or use *Setup → Developer Space → Sandbox* on a paid plan.
2. Generate a separate client id / secret / refresh token **against that org**
   and put them in `.env.local`. Never reuse production credentials locally.
3. Set `ZOHO_DEBUG=1` to log redacted response codes.
4. Run through the flows:

   ```bash
   npm run dev
   ```

   - **Quote:** add items to the quote bag, submit `/quote`, and confirm a Lead
     appears with the enquiry in `Description`.
   - **Sign-up:** create an account, confirm the email, sign in, and confirm one
     Contact appears.
   - **Idempotency:** sign out and sign in again. The **same** Contact must be
     updated — if a second one appears, `Email` is not acting as the duplicate
     key on your module, so check `CONTACT_FIELD_MAP.email`.
5. Verify the endpoint cannot be driven from the browser:

   ```bash
   curl -X POST http://localhost:3000/api/crm/sync-contact \
     -H 'Content-Type: application/json' \
     -d '{"email":"attacker@example.com"}'
   # -> 401 {"ok":false,"status":"unauthenticated"}
   ```

   Identity comes only from the Supabase session cookie; the body is ignored
   entirely.
6. Simulate an outage — set `ZOHO_REFRESH_TOKEN` to rubbish and sign in again.
   **Sign-in must still succeed**, the response is a neutral
   `{"ok":false,"status":"deferred"}`, and the server log shows a redacted
   error. Restore the token and sign in again to confirm the retry lands.
7. Clear `ZOHO_DEBUG` before deploying.

---

## 8. Scripts

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
and the Zoho payload builders (field mapping, empty-value omission,
determinism across retries, and assertions that no credential or password ever
enters a payload).

---

## 9. Deployment

Works on any Node host. The middleware runs on the **Node.js runtime**
(`src/middleware.ts`) — the Edge runtime is deprecated and is rejected outright
by anonymous Vercel deployments.

### Permanent deployment (Vercel)

```bash
npx vercel login      # one-time, opens your browser
npx vercel --prod
```

Then, in the Vercel dashboard:

1. **Settings → Environment Variables** — add every variable from
   `.env.example`. Put the Zoho values in **all** environments you deploy, and
   double-check none of them start with `NEXT_PUBLIC_`.
2. Set **`NEXT_PUBLIC_SITE_URL`** to the production origin. The sitemap,
   canonical tags and Open Graph URLs are derived from it.
   *(Without it the app falls back to Vercel's injected `VERCEL_URL`, and
   finally to `http://localhost:3000`.)*
3. Set **`NEXT_PUBLIC_ALLOW_INDEXING=true`** only once the placeholder content
   is replaced — see §12. Until then the whole site serves `noindex`.
4. Add the production origin to **Supabase → Authentication → URL
   Configuration**.

### Temporary / anonymous deployment

```bash
npx vercel deploy --temporary --prod
```

Produces a public URL with no login, and prints a claim link to keep it.
**It expires about an hour after creation unless claimed.**

Two caveats specific to anonymous deployments:

- Vercel injects no project environment variables into the build, and `-b` /
  `--build-env` is ignored. `NEXT_PUBLIC_SITE_URL` therefore cannot be set, so
  canonical tags and the sitemap fall back to `http://localhost:3000`. This is
  cosmetic while the site is `noindex`, and resolves itself on a claimed or
  logged-in deployment.
- Supabase and Zoho stay unconfigured, so sign-in shows the
  "accounts are not connected" notice and quote enquiries are accepted but not
  pushed to the CRM.

> **Rate limiting is per-instance.** `src/lib/rate-limit.ts` holds counters in
> process memory, which protects a single server but not a fleet of serverless
> functions. For production traffic, swap its `hits` map for a shared store
> (Upstash Redis, Vercel KV or a Supabase table). Only that one file changes.

---

## 10. Security notes

- **Zoho credentials are server-only.** `src/lib/zoho/client.ts` imports
  `server-only`, so importing it from a client component is a build error, not
  a runtime leak. No Zoho value is ever prefixed `NEXT_PUBLIC_`.
- **Passwords never leave Supabase Auth.** They are not stored, logged,
  included in CRM payloads or echoed in validation errors (there is a test for
  the last one).
- **Identity is server-derived.** `/api/crm/sync-contact` calls
  `supabase.auth.getUser()` — which revalidates with Supabase — and reads the
  profile server-side under RLS. Nothing in the request body is trusted.
- **CRM failure never blocks a user.** Sync errors return a neutral body and
  log a redacted message. The upsert is idempotent and safe to retry.
- **Upstream errors are not forwarded.** Zoho response bodies stay server-side;
  the browser gets a generic message. `redactForLog` strips `1000.*` tokens and
  `client_secret` / `refresh_token` / `access_token` values before anything is
  logged.
- **Every endpoint validates with Zod** and is rate-limited (5 enquiries per IP
  per 10 minutes; 10 CRM syncs per IP per 5 minutes), with a request-size cap
  and a honeypot field. A filled honeypot receives a **normal success
  response** so bots learn nothing.
- **Security headers** (`X-Content-Type-Options`, `Referrer-Policy`,
  `X-Frame-Options`) are set in `next.config.mjs`.
- `/account`, `/signin`, `/signup` and `/api/` are excluded from the sitemap and
  disallowed in `robots.txt`.

---

## 11. Project structure

```text
src/
├── app/
│   ├── layout.tsx                  Poppins, header/footer, Organization JSON-LD
│   ├── page.tsx                    Homepage
│   ├── uniforms/                   Listing + [slug] category pages (SSG)
│   ├── industries/  customization/  about/  contact/
│   ├── quote/                      Quote builder page
│   ├── signin/  signup/  account/  privacy/  terms/
│   ├── api/quote/route.ts          Public enquiry endpoint
│   ├── api/crm/sync-contact/       Authenticated CRM sync
│   ├── not-found.tsx  error.tsx  sitemap.ts  robots.ts
├── components/
│   ├── layout/    AnnouncementBar, Header, MobileMenu, SearchPanel, Footer
│   ├── home/      Hero, TrustStrip, CategoryGrid, ProductGrid, ProcessSteps, …
│   ├── catalog/   ProductCard, Breadcrumbs
│   ├── quote/     QuoteProvider, QuoteDrawer, QuoteForm, EnquiryForm
│   ├── auth/      AuthProvider, AuthModal, SignInForm, SignUpForm
│   └── ui/        Button, Section, Field, Overlay, PageHeader, LegalPage
├── data/catalog.ts                 ← all editable product/category seed data
├── lib/
│   ├── site.ts                     ← all editable brand and contact placeholders
│   ├── supabase/                   client / server / env
│   ├── zoho/                       client.ts + mapping.ts
│   ├── validation/schemas.ts       Zod schemas, shared by client and server
│   ├── rate-limit.ts  utils.ts
├── types/index.ts
└── middleware.ts                   Session refresh + /account guard
```

**Product markup is not duplicated.** One `ProductCard` renders every product
everywhere; the homepage, the listing page and each category page all map over
the same typed data in `src/data/catalog.ts`.

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

## 12. What the business owner must replace

### Must change before launch

| Where | What |
| --- | --- |
| `src/lib/site.ts` → `CONTACT` | `email`, `phone`, `whatsapp`, `addressLines`, `gstin`, `hours` — all bracketed placeholders |
| `src/lib/site.ts` → `SOCIAL` | Four `#` placeholders → your real profile URLs |
| `src/components/layout/Header.tsx` | Text wordmark → your logo (marked `TODO(owner)`) |
| `src/components/layout/Footer.tsx` | Same wordmark placeholder |
| `src/data/catalog.ts` | The whole sample catalogue: products, colours, fabrics, MOQs and the **indicative INR price bands** |
| `src/components/catalog/ProductCard.tsx` | The typographic colour-swatch placeholder → your product photography (marked `TODO(owner)`) |
| `src/app/about/page.tsx` | Placeholder company story — there is an on-page notice flagging it |
| `src/app/privacy/page.tsx` | Retention period, plus a legal review |
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
