# Threadloom — Wholesale Uniform Storefront

A production-ready Next.js storefront for a B2B wholesale uniform and corporate
workwear business. The conversion path is **Request a Quote**, not a consumer
checkout: there is no cart, no payment gateway and no pricing commitment
anywhere in the application.

- **Framework:** Next.js 15 (App Router) + TypeScript
- **Styling:** Tailwind CSS 3, Poppins via `next/font/google`
- **Icons:** lucide-react
- **Validation:** Zod (server-side on every endpoint, and client-side for fast feedback)
- **Enquiry delivery:** Resend REST API, server-side only — **required**
- **CRM:** Zoho CRM REST API v8 over OAuth 2.0, server-side only — *optional*

---

## Table of contents

1. [Quick start](#1-quick-start)
2. [Image assets](#2-image-assets)
3. [Environment variables](#3-environment-variables)
4. [Enquiry delivery setup (required)](#4-enquiry-delivery-setup-required)
5. [Zoho CRM setup (optional)](#5-zoho-crm-setup-optional)
6. [Finding Zoho Field API Names](#6-finding-zoho-field-api-names)
7. [Testing delivery safely](#7-testing-delivery-safely)
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

The site builds and browses with no credentials, but **enquiry delivery is not
optional**:

| Not configured | What happens |
| --- | --- |
| Resend (`RESEND_API_KEY` + `ENQUIRY_TO_EMAIL`) | The quote API returns **503** and the form tells the visitor to email or call instead. It never reports success for an enquiry nobody will receive. |
| Zoho | Enquiries still arrive by email; the CRM copy is simply skipped. |
| Contact details | The site shows obvious `[bracketed]` placeholders. |

> **There are no customer accounts.** The site is enquiry-led: a visitor builds
> a quote bag and submits it. Nothing is stored server-side, no passwords
> exist, and there is no sign-in.

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

Without this, the quote form cannot deliver anything and deliberately refuses
to accept enquiries. Two values are needed.

1. Create a free account at [resend.com](https://resend.com).
2. **API Keys → Create API Key**. Copy the `re_...` value into
   `RESEND_API_KEY` in `.env.local`.
3. Set `ENQUIRY_TO_EMAIL` to the inbox that should receive enquiries.

```bash
RESEND_API_KEY=re_xxxxxxxxxxxx
ENQUIRY_TO_EMAIL=sales@yourdomain.com
```

### About the sender address

`ENQUIRY_FROM_EMAIL` defaults to Resend's shared sandbox sender,
`onboarding@resend.dev`. **The sandbox sender can only deliver to the email
address that owns the Resend account.** That is fine for testing, but for
production:

1. **Domains → Add Domain** in Resend, and add the DNS records it gives you.
2. Set `ENQUIRY_FROM_EMAIL=enquiries@yourdomain.com`.

### What arrives

One email per enquiry, plain text and HTML, with the reference number and
organization in the subject line. **Reply-to is set to the customer's own
address**, so hitting reply in your inbox answers them directly.

### Contact details

Set these so the site stops showing placeholders — and so the "email or call us
directly" fallback gives customers something real when delivery fails:

```bash
NEXT_PUBLIC_CONTACT_EMAIL=sales@yourdomain.com
NEXT_PUBLIC_CONTACT_PHONE=+91XXXXXXXXXX
NEXT_PUBLIC_CONTACT_ADDRESS=Unit 4|MG Road|Kochi - 682016|India
NEXT_PUBLIC_CONTACT_HOURS=Mon-Sat, 10:00-18:00 IST
NEXT_PUBLIC_GSTIN=32XXXXXXXXXXXZX
```

## 5. Zoho CRM setup (optional)

**Skip this entirely if you do not use Zoho CRM.** Enquiries already reach your
inbox by email; Zoho just files a second copy as a CRM record. A CRM outage
never affects the customer — the email has already been sent by that point.

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

Enquiries default to the stock **Leads** layout, with the full enquiry
(including a structured item summary) written to `Description`:

| Internal | Zoho API Name |
| --- | --- |
| `firstName` | `First_Name` |
| `lastName` | `Last_Name` *(required by Zoho)* |
| `company` | `Company` *(required on stock Leads)* |
| `email` | `Email` |
| `phone` | `Phone` |
| `city` | `City` |
| `description` | `Description` |
| `leadSource` | `Lead_Source` → `"Website Quote Request"` |

> `Lead_Source` is standard, but `"Website Quote Request"` is **not** a stock
> picklist value. Add it under *Setup → Customization → Modules and Fields →
> Leads → Lead Source*, or set `leadSource` to `null`. Writing an unknown
> picklist value makes Zoho reject the whole record.

**Optional custom fields — all `null` until you create them in Zoho:**

| Internal | Suggested field type | Suggested API Name |
| --- | --- | --- |
| `estimatedQuantity` | Number | `Estimated_Quantity` |
| `expectedDate` | Date | `Expected_Delivery_Date` |
| `requirements` | Multi Line | `Requirements` |
| `itemsSummary` | Multi Line | `Quote_Items` |
| `consentTimestamp` | Date/Time | `Consent_Timestamp` |

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
curl -s "https://www.zohoapis.in/crm/v8/settings/fields?module=Leads" \
  -H "Authorization: Zoho-oauthtoken YOUR_ACCESS_TOKEN" \
  | python3 -c "import json,sys; [print(f\"{f['api_name']:<34} {f['field_label']}\") for f in json.load(sys.stdin)['fields']]"
```

Custom fields you create carry a suffix, e.g. `Customer_Type` may actually be
`Customer_Type1` if the label collided. **Copy the API Name exactly.**

Also confirm the field is on the **layout** assigned to the integration user —
a field that exists but is not on the layout will be rejected.

---

## 7. Testing delivery safely

**Test enquiry delivery first — it is the one thing that must never fail
silently.**

```bash
npm run dev
```

Verify all three delivery states:

1. **Unconfigured.** With `RESEND_API_KEY` unset, submit the quote form. You
   must get an on-page "Your enquiry was not sent" panel with your email and
   phone as clickable links, and:

   ```bash
   curl -s -X POST http://localhost:3000/api/quote \
     -H 'Content-Type: application/json' -d '{ ...valid enquiry... }'
   # -> HTTP 503 {"ok":false,"code":"delivery_unavailable",...}
   ```

2. **Broken key.** Set `RESEND_API_KEY=re_invalid` and resubmit — expect
   **HTTP 502** `delivery_failed`, the same fallback panel, and a server log
   line with the key redacted. **Never a success screen.**

3. **Working.** Set the real key and submit. The email must land in
   `ENQUIRY_TO_EMAIL` within seconds, with the reference in the subject and
   reply-to set to the customer's address. Hit reply and confirm it addresses
   the customer, not yourself.

### Zoho (only if configured)

Use a [free Zoho developer edition](https://www.zoho.com/crm/developer/) or a
sandbox before touching production CRM data, and generate separate credentials
for it. Set `ZOHO_DEBUG=1`, submit an enquiry, and confirm a Lead appears with
the enquiry in `Description`. Then break the refresh token deliberately and
confirm the enquiry **still succeeds** — the email has already been sent, so a
CRM failure is logged and swallowed.

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
the email path (configuration gaps, rendering, HTML escaping, and that a
provider failure throws rather than returning success) and the Zoho payload
builders. All network calls and secrets are mocked.

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
   `.env.example`. **`RESEND_API_KEY` and `ENQUIRY_TO_EMAIL` are mandatory**;
   without them the deployed quote form refuses every enquiry. Double-check
   none of the server-only values start with `NEXT_PUBLIC_`.
2. Set **`NEXT_PUBLIC_SITE_URL`** to the production origin. The sitemap,
   canonical tags and Open Graph URLs are derived from it.
   *(Without it the app falls back to Vercel's injected `VERCEL_URL`, and
   finally to `http://localhost:3000`.)*
3. Set **`NEXT_PUBLIC_ALLOW_INDEXING=true`** only once the placeholder content
   is replaced — see §12. Until then the whole site serves `noindex`.
4. Submit a real enquiry against the deployed site and confirm it lands in
   your inbox. Do not consider the deploy finished until it does.

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
- No environment variables means no `RESEND_API_KEY`, so **the quote form
  refuses every enquiry** with the "email or call us directly" fallback. An
  anonymous deployment is a visual preview only, never a working lead-capture
  site.

> **Rate limiting is per-instance.** `src/lib/rate-limit.ts` holds counters in
> process memory, which protects a single server but not a fleet of serverless
> functions. For production traffic, swap its `hits` map for a shared store
> (Upstash Redis, Vercel KV or a Supabase table). Only that one file changes.

---

## 10. Security notes

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

## 11. Project structure

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

## 12. What the business owner must replace

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
