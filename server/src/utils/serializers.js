'use strict';
// Shapes DB rows into the public API contract defined in SHARED-SPEC.md.

function publicUser(u) {
  if (!u) return null;
  return {
    publicId: u.publicId,
    name: u.name,
    avatarUrl: u.avatarUrl || null,
    bio: u.bio || null,
    isBusiness: u.isBusiness,
    businessName: u.businessName || null,
    isPhoneVerified: u.isPhoneVerified,
    trustTier: u.trustTier,
    cityId: u.cityId || null,
    memberSince: u.createdAt,
  };
}

// Includes private fields — only for the authenticated owner (GET /me)
function meUser(u) {
  return {
    ...publicUser(u),
    id: u.id,
    email: u.email,
    phone: u.phone,
    role: u.role,
  };
}

function media(m) {
  return { url: m.url, sortOrder: m.sortOrder, width: m.width || null, height: m.height || null };
}

function listingCard(l) {
  const firstMedia = (l.media && l.media[0]) || null;
  return {
    publicId: l.publicId,
    title: l.title,
    priceMinor: Number(l.priceMinor),
    priceType: l.priceType,
    currency: l.currency,
    condition: l.condition || null,
    categoryId: l.categoryId,
    categoryLabel: l.category ? l.category.label : null,
    city: l.location ? l.location.name : null,
    locationId: l.locationId,
    thumbnail: firstMedia ? firstMedia.url : null,
    isFeatured: l.isFeatured,
    state: l.state,
    publishedAt: l.publishedAt,
    favouriteCount: l.favouriteCount,
    viewCount: l.viewCount,
    attributes: l.attributes || {},
  };
}

function listingDetail(l, { displayAttributes = [], similar = [], isFavourited = false } = {}) {
  return {
    publicId: l.publicId,
    id: l.id,
    title: l.title,
    description: l.description,
    priceMinor: Number(l.priceMinor),
    priceType: l.priceType,
    currency: l.currency,
    condition: l.condition || null,
    categoryId: l.categoryId,
    category: l.category ? { id: l.category.id, label: l.category.label, listingKind: l.category.listingKind, parentId: l.category.parentId } : null,
    location: l.location ? { id: l.location.id, name: l.location.name, level: l.location.level, lat: l.location.lat, lon: l.location.lon } : null,
    media: (l.media || []).slice().sort((a, b) => a.sortOrder - b.sortOrder).map(media),
    attributes: l.attributes || {},
    attributesDisplay: displayAttributes,
    state: l.state,
    isFeatured: l.isFeatured,
    featuredUntil: l.featuredUntil,
    viewCount: l.viewCount,
    favouriteCount: l.favouriteCount,
    isFavourited,
    publishedAt: l.publishedAt,
    expiresAt: l.expiresAt,
    createdAt: l.createdAt,
    seller: l.seller ? publicUser(l.seller) : null,
    similar,
  };
}

module.exports = { publicUser, meUser, listingCard, listingDetail, media };
