# Bazaario — Shared Contract & Design System

> Single source of truth shared by `/server`, `/client`, and `/mobile`.
> Brand: **Bazaario** — "Pakistan's Premium Marketplace". Distinct brand (not OLX).

This document is derived from `marketplace-implementation-blueprint.md` (Release‑1 / Classifieds MVP)
and `category-schema-reference.json` (config‑driven category schema). It defines the API contract,
the data model, and the design tokens so the web and mobile clients stay consistent.

---

## 1. Brand & Design Tokens

| Token | Value | Use |
|---|---|---|
| `brand.name` | Bazaario | Logo / titles |
| `brand.tagline` | Pakistan's Premium Marketplace | Hero / meta |
| color `primary` | `#0D9488` (teal‑600) | Primary actions, links |
| color `primaryDark` | `#0F766E` (teal‑700) | Hover, gradients |
| color `primaryLight` | `#5EEAD4` (teal‑300) | Accents, glows |
| color `accent` | `#F59E0B` (amber‑500) | Featured/promoted, CTAs |
| color `accentDark` | `#D97706` (amber‑600) | Accent hover |
| color `ink` | `#0F172A` (slate‑900) | Headings, text |
| color `muted` | `#64748B` (slate‑500) | Secondary text |
| color `line` | `#E2E8F0` (slate‑200) | Borders |
| color `surface` | `#FFFFFF` | Cards |
| color `bg` | `#F8FAFC` (slate‑50) | Page background |
| color `success` | `#16A34A` | Verified, sold |
| color `danger` | `#DC2626` | Errors, report |
| gradient `brand` | `linear-gradient(135deg,#0F766E 0%,#0D9488 45%,#14B8A6 100%)` | Hero, buttons |
| gradient `gold` | `linear-gradient(135deg,#F59E0B 0%,#FBBF24 100%)` | Featured badge |
| radius `card` | `16px` | Cards |
| radius `pill` | `999px` | Chips, badges |
| shadow `card` | `0 1px 2px rgba(15,23,42,.04), 0 8px 24px -12px rgba(15,23,42,.12)` | Cards |
| shadow `hover` | `0 12px 40px -12px rgba(13,148,136,.35)` | 3D hover lift |
| font `sans` | Inter / system‑ui | Body |
| font `display` | "Plus Jakarta Sans", Inter | Headings |

**Interaction language:** soft cards that lift on hover (translateY + teal glow shadow), gradient brand
buttons, amber "Featured" ribbons, skeleton shimmer loaders, framer‑motion (web) / Reanimated‑style
(mobile) page + card entrance animations, subtle 3D tilt on featured cards. Mobile‑first responsive.

Currency display: `Rs 1,250,000` (PKR). Money is stored as **minor units** (paisa) on the server; format
with `formatPkr(amountMinor)` → divide by 100, group with commas, prefix `Rs`.

---

## 2. Tech

- **server**: Node 20, Express, Prisma ORM + PostgreSQL, JWT auth, zod validation.
- **client**: React 18 + Vite, React Router, Tailwind CSS, framer‑motion, axios, Zustand (auth store).
- **mobile**: Expo (React Native), React Navigation, axios. Mirrors client screens/UX.

Base URL: `http://localhost:4000` (web proxy `/api` → server). Mobile uses `EXPO_PUBLIC_API_URL`.
All API routes are under `/v1`. Auth via `Authorization: Bearer <accessToken>`.

---

## 3. Data Model (server)

- **User**: `id (ULID)`, `publicId`, `name`, `email`, `phone`, `passwordHash`, `avatarUrl`, `bio`,
  `cityId`, `isPhoneVerified`, `isBusiness`, `trustTier (NEW|ACTIVE|VERIFIED)`, `role (USER|MODERATOR|ADMIN)`, `createdAt`.
- **Location**: `id`, `parentId`, `level (country|province|city|area)`, `name`, `slug`, `lat`, `lon`.
- **Category**: `id (e.g. "vehicles.cars")`, `parentId`, `slug`, `label`, `icon`, `listingKind`,
  `priceTypesAllowed (json)`, `schemaVersion`, `sortOrder`, `isLeaf`, `isActive`. Fields/schema come
  from the config loader (see §5), not columns.
- **ReferenceItem**: `id`, `catalog (e.g. car_makes)`, `parentId`, `value`, `label`. (makes/models/etc.)
- **Listing**: `id (ULID)`, `publicId (e.g. A1B2C3)`, `userId`, `categoryId`, `title`, `description`,
  `priceMinor`, `priceType`, `currency`, `condition`, `locationId`, `attributes (json — normalized)`,
  `schemaVersion`, `state (DRAFT|PENDING_REVIEW|ACTIVE|SOLD|EXPIRED|REJECTED|DEACTIVATED|REMOVED)`,
  `isFeatured`, `featuredUntil`, `viewCount`, `favouriteCount`, `publishedAt`, `expiresAt`, `createdAt`.
- **ListingMedia**: `id`, `listingId`, `url`, `sortOrder`, `width`, `height`.
- **Favourite**: `id`, `userId`, `listingId`, `createdAt` (unique userId+listingId).
- **SavedSearch**: `id`, `userId`, `query (json: q, categoryId, locationId, filters, sort)`, `cadence`.
- **Conversation**: `id`, `listingId`, `buyerId`, `sellerId`, `lastMessageAt`.
- **Message**: `id`, `conversationId`, `senderId`, `body`, `type (text|system)`, `readAt`, `createdAt`.
- **Report**: `id`, `reporterId`, `targetType (listing|user)`, `targetId`, `reason`, `detail`, `status`.

State machine (Release‑1 simplified): on submit a listing goes to `PENDING_REVIEW`; an automated rule
check (prohibited terms, price sanity) either auto‑approves to `ACTIVE` or holds for review. Owners can
`mark-sold`, `deactivate`, `renew`. Default expiry 30 days.

---

## 4. REST API Contract (`/v1`)

Envelope: success returns the resource/`{ data, ... }` directly; errors return
`{ error: { code, message, fields? , correlationId } }` with proper HTTP status.
List endpoints return `{ items: [...], nextCursor: string|null, total?: number, facets?: {...} }`.

### Auth & identity
```
POST   /v1/auth/register     { name, email, phone, password } -> { user, accessToken, refreshToken }
POST   /v1/auth/login        { emailOrPhone, password }        -> { user, accessToken, refreshToken }
POST   /v1/auth/refresh      { refreshToken }                  -> { accessToken }
POST   /v1/auth/logout       (auth)                            -> { ok: true }
GET    /v1/me                (auth)                            -> { user }
PATCH  /v1/me/profile        (auth) { name?, bio?, avatarUrl?, cityId? } -> { user }
GET    /v1/users/:publicId                                     -> { user (public), stats }
GET    /v1/users/:publicId/listings?cursor=                    -> { items, nextCursor }
```

### Taxonomy / locations / reference
```
GET    /v1/categories                  -> { items: [tree nodes] }   // full tree, nested children
GET    /v1/categories/:id              -> { category }
GET    /v1/categories/:id/form-schema  -> { categoryId, schemaVersion, listingKind, priceTypesAllowed,
                                            commonFields:[...], fields:[...] }  // for dynamic post form
GET    /v1/reference-data/:catalog?parentId=  -> { items:[{value,label}] }     // makes, models, ...
GET    /v1/locations/suggest?q=        -> { items:[{id,name,path,level}] }
GET    /v1/locations/:id/children      -> { items:[...] }
GET    /v1/locations                   -> { items:[city tree] }
```

`form-schema` field object:
`{ key, type, label, required, options?[{value,label}], referenceCatalog?, dependsOn?, unit?,
   validation?, facetable?, searchable?, sortable?, multi? }` — `type` ∈ field types from the JSON
(`text,textarea,integer,decimal,money,boolean,single_select,multi_select,reference_select,range,date,location,media`).

### Listings
```
POST   /v1/listings           (auth) { categoryId, title, description, priceMinor, priceType,
                                       condition?, locationId, attributes{}, media:[{url,...}] }
                              -> validates against category schema -> { listing }
GET    /v1/listings/:publicId                 -> { listing (full, with seller, media, category, location,
                                                    attributesDisplay[]) }  // increments viewCount
PATCH  /v1/listings/:id        (auth, owner)  -> { listing }
POST   /v1/listings/:id/mark-sold   (auth, owner)
POST   /v1/listings/:id/deactivate  (auth, owner)
POST   /v1/listings/:id/renew       (auth, owner)
GET    /v1/me/listings?state=  (auth)         -> { items, nextCursor }
```

### Search / discovery
```
GET /v1/search?q=&categoryId=&locationId=&sort=&cursor=&minPrice=&maxPrice=&<attrKey>=<val>&featured=
   -> { items:[listingCard], nextCursor, total, facets:{ <facetKey>:[{value,label,count}], priceBuckets } }
   sort ∈ relevance|newest|price_asc|price_desc
listingCard = { publicId, title, priceMinor, priceType, currency, city, areaLabel, thumbnail,
                isFeatured, condition, publishedAt, categoryLabel, attributesPreview[] }
GET /v1/search/suggest?q=  -> { categories[], queries[], locations[] }
```

### Favourites / saved search / follow
```
POST   /v1/listings/:id/favourite    (auth)  -> { favourited:true, favouriteCount }
DELETE /v1/listings/:id/favourite    (auth)
GET    /v1/favourites                (auth)  -> { items, nextCursor }
POST   /v1/saved-searches            (auth)  -> { savedSearch }
GET    /v1/saved-searches            (auth)  -> { items }
```

### Chat (REST; realtime is a Phase‑2 upgrade)
```
POST   /v1/conversations             (auth) { listingPublicId } -> { conversation }
GET    /v1/conversations             (auth) -> { items:[{id, listing, otherUser, lastMessage, unread}] }
GET    /v1/conversations/:id/messages?cursor=  (auth) -> { items, nextCursor }
POST   /v1/conversations/:id/messages (auth) { body } -> { message }
POST   /v1/conversations/:id/read     (auth)
```

### Reports
```
POST   /v1/reports   (auth) { targetType, targetId, reason, detail? } -> { report }
```

### Health
```
GET /health -> { ok, db, time }
```

---

## 5. Category‑schema engine (the heart of the system)

`category-schema-reference.json` is loaded at boot. For each category it provides `commonListingFields`
(title, description, price, price_type, location_id, media) merged with category‑specific `fields`,
honoring `overrideCommonFields` (e.g. Jobs disable price, make media optional). The server:

1. Exposes the merged, client‑ready schema via `GET /v1/categories/:id/form-schema`.
2. **Validates** every listing create/update against that schema (required, min/max, options, length,
   reference existence, `gteField`, `maxExpression: current_year_plus_1`).
3. **Normalizes**: money kept in minor units; for property, computes `area_square_metres` from
   `area_value` + `area_unit` (using `areaUnits` factors; marla/kanal use a configured market factor —
   default marla = 25.2929 m², kanal = 20 × marla).
4. Stores `schemaVersion` with each listing.
5. Drives **search facets**: any field with `facetable:true` becomes a filter; `sortable:true` becomes a
   sort option.

Clients must render the post‑ad form and the search filter sidebar **dynamically from the schema** — no
hard‑coded per‑category field lists.

---

## 6. Seed data (so the apps look alive)

Categories: all top‑level + subcategories from the blueprint's taxonomy table (§6), with the detailed
field schemas from the JSON wired for: mobile_phones, cars, motorcycles, houses(sale), apartments(rent),
land_plots, jobs, services, delivery_good. Locations: Pakistan → provinces → major cities
(Karachi, Lahore, Islamabad, Rawalpindi, Faisalabad, Peshawar, Quetta, Multan, …) → a few areas each.
Reference catalogs: car_makes/models, mobile_brands/models, motorcycle_makes/models, registration cities,
car_features, colors. Demo users (incl. one business + one admin) and ~40 realistic listings across
categories, a few featured. Default password for all seed users: `Password123!`.

---

## 7. Screen inventory (client + mobile parity)

1. **Home** — hero search + location, category grid (icons), "Featured" carousel, "Fresh near you" grid, trust strip.
2. **Search results** — breadcrumb, query/location bar, left filter sidebar (schema‑driven facets + price + condition + sort), grid/list toggle, listing cards, infinite scroll, featured highlighted.
3. **Listing detail** — image gallery, price + featured badge, title/location/age, structured attributes table, description, seller card (avatar, trust badge, join date, active ads, profile link), actions (favourite, share, chat, reveal phone, report), safety tips, similar listings.
4. **Post ad** — step 1 pick category (tree), step 2 dynamic fields from schema + media, step 3 location + price/contact, step 4 preview + submit. Autosave indicator.
5. **Auth** — login / register (email+phone+password). Premium split layout.
6. **Favourites** — grid of saved listings.
7. **My Listings** — tabs by state (active/pending/sold/…), manage actions.
8. **Chat** — inbox list + conversation thread.
9. **Profile / seller page** — public seller profile with active inventory.
10. **Account** — edit profile, settings.

Keep component names and props consistent between client and mobile where practical
(`ListingCard`, `CategoryGrid`, `FilterPanel`, `SellerCard`, `Gallery`, `PriceTag`, `Badge`).
