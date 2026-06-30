# Bazaario — Mobile App

The React Native (Expo) client for **Bazaario**, "Pakistan's Premium Marketplace".
It mirrors the web client's UX and screen inventory and shares the same REST API
contract as `/server` (see `../SHARED-SPEC.md`).

Built with **Expo SDK 51** (managed workflow, JavaScript), React Navigation
(native-stack + bottom-tabs), Zustand, axios and `expo-linear-gradient`.

## Prerequisites

- Node 18+
- The Bazaario API server running (default `http://localhost:4000`). From `/server`: `npm run dev`.
- Expo Go on your phone, or an iOS/Android simulator.

## Setup

```bash
cd mobile
npm install
```

Configure the API base URL. Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

- **iOS simulator / web**: `EXPO_PUBLIC_API_URL=http://localhost:4000` works as-is.
- **Android emulator**: use `http://10.0.2.2:4000`.
- **Physical device (Expo Go)**: localhost won't reach your computer — set it to your
  machine's LAN IP, e.g. `EXPO_PUBLIC_API_URL=http://192.168.1.20:4000`. Make sure the
  phone and computer are on the same Wi-Fi.

## Run

```bash
npx expo start
```

Then press `i` (iOS), `a` (Android), or scan the QR code with Expo Go.

Optional sanity check of the dependency tree / config:

```bash
npx expo-doctor
```

## Demo login

The seeded demo account (password for all seed users is `Password123!`):

```
ali@bazaario.pk  /  Password123!
```

The login screen is pre-filled with these credentials.

## Project structure

```
mobile/
  App.js                  # SafeArea + NavigationContainer + auth bootstrap + splash
  index.js                # Expo entry
  app.json                # Expo config (brand colors, bundle ids)
  babel.config.js
  src/
    api/
      client.js           # axios instance, EXPO_PUBLIC_API_URL, token interceptor + refresh,
                          #   AsyncStorage token store, error normalizer
      endpoints.js        # typed wrappers for every /v1 endpoint (auth, taxonomy, listings,
                          #   search, favourites, chat, users, reports, locations)
    theme/
      tokens.js           # colors, gradients, radii, spacing, shadows, typography (mirrors SHARED-SPEC §1)
    store/
      auth.js             # Zustand auth store (bootstrap/login/register/logout/updateProfile)
      favourites.js       # Zustand favourites store (optimistic toggle, shared heart state)
    utils/
      format.js           # formatPkr (minor units → "Rs 1,250,000"), timeAgo, trustBadge, …
      icons.js            # category icon-token → Ionicons mapping + tile tints
    components/
      Button, Badge, PriceTag, Avatar, Chip, Skeleton, EmptyState, SearchBar,
      SectionHeader, ListingCard, CategoryGrid, SellerCard, Gallery,
      DynamicField, MediaInput, OptionSheet, FilterSheet, LocationPicker, ReportSheet
    navigation/
      RootNavigator.js    # native-stack (Tabs + detail/auth/post/chat/profile screens)
      TabNavigator.js     # bottom tabs: Home, Search, Post, Chat, Account
      TabBar.js           # custom tab bar with a prominent gradient "Post" button
    screens/
      HomeScreen, SearchScreen, ResultsScreen, ListingDetailScreen, PostAdScreen,
      LoginScreen, RegisterScreen, FavouritesScreen, MyListingsScreen,
      ChatInboxScreen, ChatThreadScreen, SellerProfileScreen, AccountScreen, EditProfileScreen
```

## How it mirrors the web client

- **Screen inventory** follows `SHARED-SPEC.md §7`: Home, Search results, Listing detail,
  Post ad (multi-step), Auth, Favourites, My Listings, Chat (inbox + thread),
  Seller profile, Account/Edit profile.
- **Component names** match the web client where practical: `ListingCard`, `CategoryGrid`,
  `FilterSheet` (web `FilterPanel`), `SellerCard`, `Gallery`, `PriceTag`, `Badge`, `DynamicField`.
- **Schema-driven**: the post-ad form and the search filters are rendered entirely from
  `GET /categories/:id/form-schema` and the search `facets` — there are **no hard-coded
  per-category field lists**, exactly as the server's category-schema engine intends.
- **Money** is handled in minor units (paisa) and formatted with `formatPkr` → `Rs 1,250,000`.

## Release-1 scope / caveats

To match the server's Release-1 (Classifieds MVP) and the shared contract, these are
intentionally **deferred** (Phase 2):

- **Media**: images are entered as URLs (with quick demo-image helpers) rather than native
  camera/library uploads — the server stores media as URLs in Release-1.
- **Realtime chat**: chat is REST (pull/refresh), not websockets. Messages send optimistically.
- **Phone reveal**: the public API does not expose seller phone numbers; the "Call" action
  routes the user into chat for safety, consistent with the contract.
- **Payments, delivery, inspections, saved-search alerts, push notifications**: not in Release-1.
- Map pins / geolocation are represented by the city/area location picker (no live GPS).
