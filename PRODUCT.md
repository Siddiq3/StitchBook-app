# Product

<!-- impeccable:product-schema 1 -->

## Platform

adaptive

Android ships first (Google Play). An iOS release is planned later, so the app must not depend on Android-only patterns that would force a redesign; each OS should get its native conventions (back behaviour, sheets, system font scaling).

## Users

Two audiences with equal weight:

- **Small tailoring shops in India (1–10 people).** The owner runs the counter on a budget Android phone: takes orders, records measurements, collects advances and balances, assigns cutting and stitching to staff, and reminds customers on WhatsApp. Often prefers Telugu or Hindi.
- **Larger boutiques and ateliers.** A front-desk person plus many tailors, more customers and orders per day, heavier use of lists, search, staff management and reports.

Staff (cutters, stitchers) also sign in with an owner-created login to see only their assigned work, mark it done, and see what they earned this month.

## Product Purpose

StitchBook replaces the paper order book and memory of a tailoring shop: every order, customer measurement, payment and staff task in one place, so nothing is lost, deliveries are on time, and the owner knows what is owed and who did what. Success: an owner can take an order with measurements in under a minute and see today's deliveries, overdue work and balances at a glance.

## Positioning

Built specifically for Indian tailoring: outfit-specific measurement sheets (shirt, kurta, blouse, lehenga, sherwani and more), the cutting → stitching → ready → delivered workflow with per-item staff assignment, staff pay tracking, WhatsApp customer updates, and Telugu/Hindi/English throughout. Not a generic invoicing or retail POS app.

## Operating Context

- Used at a busy shop counter, often one-handed, in bright light, with customers waiting.
- Patchy mobile data; the backend runs on Render (can cold-start slowly), Postgres on Supabase, Redis on Upstash.
- Customers are contacted on WhatsApp and phone calls; job sheets and bills are shared from the phone.
- Measurements are recorded in inches.

## Capabilities and Constraints

- Expo / React Native app (SDK 53, RN 0.79, Fabric), React Navigation native stack + bottom tabs, Reanimated 3 and Moti for motion, Inter font.
- Owner and staff roles with permissions (orders, customers, measurements, payments, reports, staff, shop).
- Free 10-day trial, then paid plans bought on the website. **Google Play billing rule: the app must never show plans, prices, upgrade buttons or links to where to pay.** It may only report account status (trial days left, active, inactive).
- Account deletion must stay reachable in the app (Play requirement).
- Languages: English, Telugu, Hindi fully translated; other Indian languages listed but partial.
- Customer list currently shows the latest 100 customers.

## Brand Commitments

- Name: StitchBook. Logo: sewing-machine mark and book wordmark (assets/splash-machine.png, assets/splash-wordmark.png), azure blue #007FFF as the brand colour.
- Tagline in use: "Stitching it together for you".
- Contact: stitchbook3@gmail.com, +91 97051 16606, Hyderabad, Telangana.

## Evidence on Hand

- No customer testimonials, user counts, ratings or press exist. Do not invent them.
- Plans and prices are defined on the website's terms page (Basic ₹299, Team ₹399, Pro ₹599 per 30 days, no auto-renew); never shown in the app.

## Product Principles

1. The counter comes first: the next order, today's deliveries and money owed must be reachable in one or two taps.
2. Speak the shop's language: tailoring terms and the owner's own language, not software jargon.
3. Staff see only their work; money and customer data stay with the owner.
4. Never lose data: slow networks, failures and deletions must be clear and recoverable.
5. Store-compliant by default: no prices, plans or payment links inside the app.

## Accessibility & Inclusion

- Many owners are not tech-savvy and read Telugu or Hindi; labels must be plain and translated, and must survive longer translated strings.
- Large touch targets (44pt+) for one-handed use at the counter; must respect system font scaling and reduced motion.
