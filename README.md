# Shekk

Build "ShekelPay" — an Alipay-style super-app for American Jewish students on 

gap-year programs in Israel (yeshiva guys, seminary girls, year-program 

participants). One QR code, one wallet, one app replacing the 15 separate apps 

students currently need.

## Core financial model (reflect this precisely in all copy and screens):

This is a closed-loop CREDIT/VOUCHER system, not a bank account.

- Users PURCHASE app credits with real currency via Apple Pay. This is a sale, 

  not a deposit.

- Credits are shekel-denominated, non-refundable, and non-withdrawable — 

  spendable only in-app or with partner merchants.

- Every top-up screen shows, before confirmation: amount paid, mid-market 

  reference rate, the fee/spread taken, and the final credit amount.

- Every spend appears in Activity like a statement line: merchant, category, 

  amount, date.

- Users must accept Terms & Conditions at signup (checkbox + scrollable summary, 

  linking to a full T&C page — placeholder legal text is fine at prototype stage).

- Every 12 months, trigger a re-verification requirement: an email notification 

  (clear deadline = today + 30 days, brief explanation, one-tap "Re-verify now" 

  CTA, link to T&Cs) plus an in-app countdown banner visible until resolved.

- Never use "deposit," "your money is held," or "withdraw" — use "credits," 

  "top up," "add credits," "spend."

## Design language

- Clean, fast, minimal — Alipay/Cash App energy, not a corporate bank app.

- One dominant object: the user's personal QR/pay code, always one tap away.

- No ads. Bold typography, confident whitespace, mobile-first.

- English-first, transliterated Hebrew terms used naturally where students 

  already know them (Shabbaton, tiyul, madrich, chagim) — should feel built 

  by/for someone who's done a gap year, not a generic tourist app.

## Core structure — bottom nav, 4 tabs:

1. **Pay** — personal QR code front and center, "Scan to pay" / "Show my code" 

   toggle, credit balance, recent activity, "Top up" button.

2. **Explore** — mini-programs grid with DEEP integration (real bookings happen 

   inside the app, not deep-links out):

   - Transit: live bus/rail times + in-app ticket purchase, Rav-Kav top-up

   - Rides: in-app taxi booking/tracking

   - Food delivery: full ordering flow, kosher filter prominent

   - Restaurant/bar reservations, including group Shabbaton bookings

   - Events & tickets: shiurim, Shabbatons, tiyulim, nightlife

   - Housing: dorm/apartment/roommate listings

   - Health: student insurance card, clinic finder, appointment booking

   - Admin: visa status tracker, program document storage

   - Community: shul finder, candle-lighting times, Chabad/Aish event calendar, 

     siddur/Tikkun reader

   - Shops: local directory + promo codes/student discounts

3. **Social** — split-a-bill (pick friends, split evenly/custom, one-tap pay), 

   opt-in lightweight activity feed, program cohort group threads.

4. **Me** — verification status/badge, program & cohort info, saved places, 

   order history, plain-language credit terms, settings.

## Key screens to build with realistic mock data (no real payment processing):

**Onboarding**: welcome → sign up → select program/institution (Aish, Ohr 

Somayach, Meor, Michlala, "Other") → Terms & Conditions acceptance screen 

(scrollable summary + checkbox + "Agree and continue") → ID/passport upload 

(mock) → first top-up

**Top-up flow** (critical screen): enter USD amount → itemized breakdown 

showing amount paid, mid-market rate, fee/spread, and final credits received, 

plus a short non-refundable/non-withdrawable notice → mock Apple Pay 

confirmation sheet

**Pay tab**: QR code ~40% of screen, credit balance, activity feed with 

merchant icons and ILS + USD reference amounts

**Explore tab**: tile grid (Alipay-style, not a plain list); fully mock at 

least 3 end-to-end flows: Transit ticket purchase, Food delivery order, Event 

ticket purchase

**Social tab**: split-the-bill flow (pick friends → split evenly/custom → 

send request → one-tap pay), cohort group thread, opt-in activity feed

**Me tab**: verification badge (Verified / Needs update / Expiring soon), 

program/cohort info, plain-language explanation of credit terms, link to full 

Terms & Conditions

**Re-verification flow**: annual trigger — email mockup (deadline = today + 

30 days, explanation, "Re-verify now" CTA, T&C link) + in-app countdown banner 

("X days left to re-verify") shown on Home and Me until resolved → tapping 

re-verify reuses the onboarding ID-upload flow → confirmation screen

**Terms & Conditions page**: simple scrollable placeholder document covering 

credit purchase terms, annual verification requirement, and account status 

policy — linked from onboarding, top-up screen, Me tab, and the 

re-verification email/banner

## Tone: casual, warm, insider gap-year voice throughout. Kosher/Shabbat-aware 

defaults (food filters, "closed for Shabbat" states) without assuming one 

specific hashkafic stream.

Build this as a fully working clickable prototype with realistic mock data and 

mock payment/verification flows. Demo the complete journey end to end: sign up 

→ accept terms → verify ID → top up → pay/explore/split → receive and act on 

a re-verification reminder.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://shekel-connect.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/6065ce33-b491-4791-8952-2276228ed967).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
