# BrownDev Data Hub

A full-stack data bundle vending app for Ghana built with **Next.js 15**, **Tailwind CSS**, **Firebase Firestore**, and **Paystack** payments — powered by the iDATA API.

## Tech Stack
- **Next.js 15** (App Router, TypeScript)
- **Tailwind CSS** for styling
- **Firebase Firestore** for order storage
- **Paystack** for payment processing
- **iDATA API** for placing data orders

---

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── packages/route.ts          # Fetch iDATA packages
│   │   ├── order/route.ts             # Place iDATA order
│   │   ├── order-status/route.ts      # Check order status
│   │   ├── wallet-balance/route.ts    # Check iDATA wallet balance
│   │   └── paystack/
│   │       ├── initialize/route.ts    # Init Paystack payment
│   │       └── verify/route.ts        # Verify payment + dispatch order
│   ├── order-status/page.tsx          # Post-payment status page
│   ├── page.tsx                       # Main buy flow
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── NetworkSelector.tsx
│   ├── PackagePicker.tsx
│   ├── CheckoutForm.tsx
│   └── StepIndicator.tsx
├── lib/
│   ├── firebase.ts                    # Firestore helpers
│   └── idata.ts                       # iDATA API wrapper
├── types/index.ts
└── .env.local                         # Environment variables (fill in yours)
```

---

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment variables

Edit `.env.local` and fill in your real keys:

```env
# iDATA
IDATA_API_KEY=your_actual_idata_api_key

# Paystack
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_xxxxx
PAYSTACK_SECRET_KEY=sk_live_xxxxx

# Firebase — from your Firebase console
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Your deployed URL (important for Paystack callback)
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

### 3. Firebase setup
1. Create a Firebase project at https://console.firebase.google.com
2. Enable **Firestore Database** (start in production mode)
3. Add a Firestore security rule to allow server-side writes only (rules live in Firebase console)
4. Copy your web app config into `.env.local`

### 4. Run locally
```bash
npm run dev
```

---

## Payment Flow

```
User selects bundle
    → POST /api/paystack/initialize
        → Saves pending order to Firestore
        → Returns Paystack authorization_url
    → User redirected to Paystack payment page
    → On success, Paystack redirects to GET /api/paystack/verify?reference=xxx
        → Verifies payment with Paystack
        → Places order with iDATA API
        → Updates Firestore order status
        → Redirects to /order-status?status=success&order_id=xxx
```

---

## Deployment (Vercel)

```bash
npm i -g vercel
vercel --prod
```

Set all `.env.local` variables as **Environment Variables** in your Vercel project settings.

> ⚠️ Make sure `NEXT_PUBLIC_APP_URL` points to your actual Vercel domain so Paystack can redirect back correctly.

---

## Networks Supported
| Network | Prefixes |
|---------|----------|
| MTN | 024, 054, 055, 059, 025 |
| Telecel | 020, 050 |
| AirtelTigo | 026, 027, 056, 057 |

---

Built by **BrownDev** 🇬🇭
