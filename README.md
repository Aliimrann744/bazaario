# Bazaario — Pakistan's Premium Marketplace

A modern, config‑driven classifieds marketplace (OLX‑style) built across **web, mobile, and server**.
This is an independent implementation of the **Release‑1 / Classifieds MVP** scope described in
[`marketplace-implementation-blueprint.md`](./marketplace-implementation-blueprint.md), driven by the
category configuration in [`category-schema-reference.json`](./category-schema-reference.json).

> Distinct brand ("Bazaario"), distinct design — not a copy of OLX assets, code, or data.

```
.
├── server/   Node + Express + Prisma + PostgreSQL — the marketplace API
├── client/   React + Vite + Tailwind — premium responsive web app
├── mobile/   React Native (Expo) — mirrors the web UX
├── SHARED-SPEC.md                      design tokens + full API contract (source of truth)
├── marketplace-implementation-blueprint.md   the product/engineering blueprint (input)
└── category-schema-reference.json            the config-driven category schema (input)
```

## What's the core idea?
Categories, their **forms, validation, filters and sort options are data, not code**
(`category-schema-reference.json`). Adding a category or field is a config change. The server loads the
schema, exposes it to the clients, validates listings against it, normalizes values (money → minor units,
area → m²), and derives search facets from it automatically. Both clients render their forms and filters
dynamically from that schema.

## Run it locally (3 terminals)

**1 — API** (needs PostgreSQL — create the DB in pgAdmin 4 first; see `server/README.md` §1)
```bash
cd server
cp .env.example .env          # set DATABASE_URL to your PostgreSQL role/db
npm install
npm run prisma:migrate        # create tables (name it "init")
npm run seed                  # categories, locations, ref catalogs, demo users + ~26 listings
npm run dev                   # http://localhost:4000   (or: npm run setup to do all 3)
```

**2 — Web client**
```bash
cd client
cp .env.example .env
npm install
npm run dev       # http://localhost:5173  (proxies /api -> :4000)
```

**3 — Mobile (optional)**
```bash
cd mobile
npm install
# set EXPO_PUBLIC_API_URL to your machine's LAN IP for a physical device
npx expo start
```

### Demo accounts (password `Password123!`)
| Email | Type |
|---|---|
| `ali@bazaario.pk` | Individual seller |
| `sales@premiumautos.pk` | Verified business (car dealer) |
| `admin@bazaario.pk` | Admin |

## Implemented (Release‑1)
- Identity: register / login / refresh / profile, JWT auth.
- Config‑driven taxonomy: 14 top categories, schema‑backed forms for mobiles, cars, motorcycles,
  houses, apartments (rent), plots, jobs, services (+ generic fallback for the rest).
- Listings: create with schema validation + normalization + basic moderation rules, detail page,
  lifecycle (active / pending / sold / expired / deactivated, renew), My Listings.
- Discovery: full‑text + category + location search, **dynamic facets**, sort, price filter, load‑more,
  suggestions, seller profiles.
- Engagement: favourites (optimistic, synced), REST chat (conversations + messages + read), reports.
- Premium UI on web + mobile with shared design tokens.

## Intentionally deferred (later blueprint phases)
Payments / entitlements / featured‑ad purchase, business storefront bulk import, **Buy with Delivery**
commerce, vehicle inspections, realtime WebSocket chat, recommendation ML, and the full moderation/admin
console. These map to blueprint Phases 2–5 and are scaffolded behind clean module boundaries. See
[`SHARED-SPEC.md`](./SHARED-SPEC.md) and each package's README for details.

## Production notes
The blueprint's production target adds PostGIS, OpenSearch, Redis, object storage and a durable event
bus. This implementation uses **PostgreSQL via Prisma** and keeps the module boundaries that let those
services be slotted in later. Schema changes go through **Prisma Migrate** (`prisma migrate dev` in dev,
`prisma migrate deploy` in production) — never hand‑edit tables.
