# Bazaario — Web Client

Premium, responsive marketplace web app built with **React + Vite + Tailwind CSS + framer‑motion**.
Implements the screens in [`../SHARED-SPEC.md`](../SHARED-SPEC.md) §7 against the Bazaario API.

## Quick start
```bash
cd client
cp .env.example .env        # leave VITE_API_URL empty to use the dev proxy
npm install
npm run dev                 # http://localhost:5173
```
The dev server proxies `/api/*` → `http://localhost:4000` (the API), so **start the server first**
(`cd ../server && npm run dev`).

## Highlights
- **Config‑driven UI** — the Post‑Ad form and the search filter sidebar render dynamically from the
  server's category schema (`GET /categories/:id/form-schema` and `GET /search` facets). No per‑category
  field lists are hard‑coded (`components/marketplace/DynamicField.jsx`, `FilterPanel.jsx`).
- **Premium design system** — brand teal + amber, gradient hero, soft 3D card lift on hover, shimmer
  skeletons, framer‑motion page/section transitions, animated stepper, image gallery with zoom.
- **Full Release‑1 flows** — home, search + filters + sort + load‑more, listing detail (gallery,
  attributes, seller card, chat, report, share, favourite), multi‑step posting, auth, favourites,
  my‑listings management, REST chat (inbox + thread), seller profile, account.

## Structure
```
src/
  lib/        api (axios + token refresh), format (PKR/time), icons
  store/      auth + favourites (zustand)
  components/
    layout/      Header, Footer, MobileTabBar, AuthShell
    ui/          Primitives (Avatar, Skeleton, EmptyState…), Modal
    marketplace/ ListingCard, ListingGrid, CategoryGrid, SearchBar, FilterPanel,
                 SellerCard, Gallery, PriceTag, DynamicField
  pages/      Home, Search, ListingDetail, PostAd, Login, Register, Favourites,
              MyListings, Chat, SellerProfile, Account, NotFound
  App.jsx     routes + layout + auth guard
```

## Build
```bash
npm run build && npm run preview
```
