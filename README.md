# 🛍 Small Business Storefront Template

A fully functional e-commerce storefront template built with **Next.js**, **Stripe**, and **Supabase**. No coding experience required — all edits are made directly in the GitHub web interface.

## ✨ What's Included

- **Product storefront** — customizable product grid with photos, names, descriptions, and prices
- **Shopping cart** — slide-out cart with quantity controls and discount code support
- **Stripe checkout** — Apple Pay, Google Pay, and credit/debit card support
- **Order confirmation page** — branded receipt customers can download and save
- **Customer accounts** — login, registration, and order history with shipping status tracking
- **Webhook handler** — automatically saves orders to your database when payments complete

---

## 🚀 Quick Start

### Step 1 — Use This Template
Click the green **"Use this template"** button at the top of this page → **Create a new repository**. Give your repo a name (e.g., `my-bakery-store`) and set it to **Private**.

### Step 2 — Create Your Accounts
You need free accounts on three platforms:

| Platform | Purpose | URL |
|----------|---------|-----|
| **Vercel** | Hosts your website | vercel.com |
| **Stripe** | Processes payments | stripe.com |
| **Supabase** | Stores orders & accounts | supabase.com |

### Step 3 — Deploy to Vercel
1. Go to **vercel.com** → **Add New Project**
2. Import your GitHub repository
3. Set **Framework Preset** to `Next.js`
4. Set **Root Directory** to your repo folder name if prompted
5. Click **Deploy**

### Step 4 — Add Environment Variables
Go to **Vercel → Settings → Environments** and add these 6 variables:

```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY    →  from Stripe Dashboard → Developers → API Keys
STRIPE_SECRET_KEY                     →  from Stripe Dashboard → Developers → API Keys
STRIPE_WEBHOOK_SECRET                 →  from Stripe Dashboard → Developers → Webhooks
NEXT_PUBLIC_SUPABASE_URL              →  from Supabase → Project Settings → API (base URL only)
NEXT_PUBLIC_SUPABASE_ANON_KEY         →  from Supabase → Project Settings → API
SUPABASE_SERVICE_ROLE_KEY             →  from Supabase → Project Settings → API
```

> ⚠️ The Supabase URL should be `https://xxxxx.supabase.co` — do NOT include `/rest/v1/` at the end.

### Step 5 — Set Up the Database
1. Go to your **Supabase project → SQL Editor → New Query**
2. Paste the entire contents of `supabase-schema.sql`
3. Click **Run** — you should see "Success"

### Step 6 — Set Up the Stripe Webhook
1. In Stripe Dashboard → **Developers → Webhooks → Add endpoint**
2. Set URL to: `https://your-site.vercel.app/api/webhooks/stripe`
3. Add these events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`
4. Copy the **Signing secret** (`whsec_...`) and add it to Vercel as `STRIPE_WEBHOOK_SECRET`
5. Redeploy your project

### Step 7 — Configure Supabase Auth
1. Go to **Supabase → Authentication → URL Configuration**
2. Set **Site URL** to your Vercel URL (e.g., `https://your-site.vercel.app`)
3. Add **Redirect URL**: `https://your-site.vercel.app/**`
4. Click **Save**

---

## ✏️ Customizing Your Store

### Change Your Business Name & Branding
Edit `pages/index.tsx` and find these lines near the top of the file:

```typescript
// ── CUSTOMIZE YOUR BUSINESS ──────────────────────────────
const BUSINESS_NAME = "Flour & Co."         // ← Your business name
const BUSINESS_TAGLINE = "Baked fresh daily, with love"
const BUSINESS_LOCATION = "Austin, Texas"
const BUSINESS_SOCIAL = "@flourandco"
const BUSINESS_SOCIAL_URL = "https://instagram.com/flourandco"
const COLLECTION_NAME = "Today's Menu"
const COLLECTION_YEAR = "2026"
const ACCENT_COLOR = "#8B4513"              // ← Your brand color (hex code)
const SHIPPING = 6.99                       // ← Your flat rate shipping fee
// ─────────────────────────────────────────────────────────
```

### Update Your Products
In `pages/index.tsx`, find the `PRODUCTS` array and replace the example products with your own:

```typescript
const PRODUCTS = [
  {
    id: 1,
    name: 'Your Product Name',
    description: 'A short, appealing description of your product.',
    price: 12.00,
    image: '/product-1.png',   // ← filename of your photo in the public/ folder
  },
  // add more products here...
]
```

Also update `lib/stripe.ts` with the same products — prices here are in **cents**:

```typescript
export const PRODUCTS = [
  { id: 1, name: 'Your Product Name', price_cents: 1200 },  // $12.00
  // ...
]
```

> ⚠️ Always keep `pages/index.tsx` and `lib/stripe.ts` in sync. The display price and the charged price must match.

### Upload Product Photos
1. Go to your GitHub repo → **Add file → Upload files**
2. Type `public/` in the filename field
3. Upload your photos with simple lowercase names (e.g., `product-1.png`, `croissant.png`)
4. Update the `image` field in your `PRODUCTS` array to match each filename

### Add or Change Discount Codes
In `pages/index.tsx`, find the `DISCOUNT_CODES` object:

```typescript
const DISCOUNT_CODES: Record<string, number> = {
  'WELCOME10': 0.10,   // 10% off
  'SUMMER20':  0.20,   // 20% off — add or remove codes here
}
```

### Change Your Brand Colors
In `pages/index.tsx`, update the `ACCENT_COLOR` and background colors to match your brand. You can find hex color codes at [coolors.co](https://coolors.co).

---

## 📁 File Structure

```
your-repo/
├── pages/
│   ├── index.tsx                          # Main storefront — edit this to customize your store
│   ├── _app.tsx                           # Next.js app wrapper (don't edit)
│   ├── checkout.tsx                       # Stripe payment page
│   ├── account.tsx                        # Customer login and order history
│   ├── confirmation.tsx                   # Order confirmation with printable receipt
│   └── api/
│       ├── checkout/
│       │   └── create-payment-intent.ts   # Server-side payment creation (don't edit)
│       └── webhooks/
│           └── stripe.ts                  # Stripe event handler (don't edit)
├── lib/
│   ├── stripe.ts                          # Product catalog + pricing — keep in sync with index.tsx
│   ├── supabase.ts                        # Database client (don't edit)
│   └── supabase-admin.ts                  # Server database client (don't edit)
├── public/
│   └── (upload your product photos here)
├── supabase-schema.sql                    # Run once in Supabase SQL Editor
├── package.json                           # Dependencies (don't edit)
├── next.config.js                         # Next.js config (don't edit)
├── tsconfig.json                          # TypeScript config (don't edit)
└── vercel.json                            # Vercel config (don't edit)
```

> **Rule of thumb:** You should only ever need to edit `pages/index.tsx` and `lib/stripe.ts` for day-to-day changes. Everything else can be left as-is.

---

## 🧪 Testing Payments

Use these Stripe test card numbers (only work in test mode):

| Card Number | Result |
|-------------|--------|
| `4242 4242 4242 4242` | Payment succeeds |
| `4000 0000 0000 0002` | Payment declined |
| `4000 0025 0000 3155` | Requires authentication |

Use any future expiry date and any 3-digit CVC.

---

## 🔴 Going Live

When you're ready to accept real payments:

1. In Stripe, switch to **Live mode** and get your live API keys
2. Update `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` → `pk_live_...` in Vercel
3. Update `STRIPE_SECRET_KEY` → `sk_live_...` in Vercel
4. Add a **new webhook** in Stripe Live mode with the same URL
5. Update `STRIPE_WEBHOOK_SECRET` with the new `whsec_...` value
6. Redeploy your project
7. Test with a real card (you can refund it immediately from Stripe dashboard)

---

## 🌐 Custom Domain

1. Purchase a domain from [Namecheap](https://namecheap.com) or similar
2. Go to **Vercel → Settings → Domains → Add**
3. Follow the DNS instructions
4. Update **Site URL** in Supabase → Authentication → URL Configuration
5. Update your Stripe webhook URL to the new domain
6. Redeploy

---

## 🛠 Managing Orders

- **Stripe Dashboard** → view payments, issue refunds
- **Supabase → Table Editor → orders** → view all order records
- **Your site /account** → customers see their own order history

To add a shipping tracking number, run this in **Supabase → SQL Editor**:

```sql
UPDATE orders
SET status = 'shipped',
    tracking_number = 'USPS1234567890',
    tracking_carrier = 'USPS',
    shipped_at = now()
WHERE order_number = 'YOUR-ORDER-NUMBER';
```

---

## 💡 Tips

- **Compress photos** before uploading at [squoosh.app](https://squoosh.app) — smaller files load faster
- **Remove backgrounds** from product photos at [remove.bg](https://remove.bg)
- **Generate color palettes** at [coolors.co](https://coolors.co)
- **Design your logo** for free at [canva.com](https://canva.com)

---

## 🧰 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 + React + TypeScript |
| Hosting | Vercel |
| Payments | Stripe |
| Database & Auth | Supabase (PostgreSQL) |
| Fonts | Google Fonts |

---

## 📄 License

Free to use for personal and commercial projects. Attribution appreciated but not required.
