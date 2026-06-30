'use strict';
const express = require('express');
const asyncHandler = require('../../utils/asyncHandler');
const ApiError = require('../../utils/apiError');
const { listingCard } = require('../../utils/serializers');
const prisma = require('../../db/prisma');
const { requireAuth } = require('../../middleware/auth');

const router = express.Router();

async function resolveListing(idOrPublic) {
  return prisma.listing.findFirst({ where: { OR: [{ id: idOrPublic }, { publicId: idOrPublic }] } });
}

router.post('/listings/:id/favourite', requireAuth, asyncHandler(async (req, res) => {
  const listing = await resolveListing(req.params.id);
  if (!listing) throw ApiError.notFound('Listing not found');
  const key = { userId_listingId: { userId: req.user.id, listingId: listing.id } };
  const existing = await prisma.favourite.findUnique({ where: key });
  let favouriteCount = listing.favouriteCount;
  if (!existing) {
    await prisma.favourite.create({ data: { userId: req.user.id, listingId: listing.id } });
    const updated = await prisma.listing.update({ where: { id: listing.id }, data: { favouriteCount: { increment: 1 } } });
    favouriteCount = updated.favouriteCount;
  }
  res.json({ favourited: true, favouriteCount });
}));

router.delete('/listings/:id/favourite', requireAuth, asyncHandler(async (req, res) => {
  const listing = await resolveListing(req.params.id);
  if (!listing) throw ApiError.notFound('Listing not found');
  const { count } = await prisma.favourite.deleteMany({ where: { userId: req.user.id, listingId: listing.id } });
  if (count) await prisma.listing.update({ where: { id: listing.id }, data: { favouriteCount: { decrement: 1 } } });
  res.json({ favourited: false });
}));

router.get('/favourites', requireAuth, asyncHandler(async (req, res) => {
  const favs = await prisma.favourite.findMany({
    where: { userId: req.user.id },
    include: { listing: { include: { media: true, category: true, location: true } } },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
  const items = favs.filter((f) => f.listing).map((f) => listingCard(f.listing));
  res.json({ items, nextCursor: null });
}));

// Saved searches
router.post('/saved-searches', requireAuth, asyncHandler(async (req, res) => {
  const { label, query, cadence } = req.body || {};
  const ss = await prisma.savedSearch.create({ data: { userId: req.user.id, label: label || null, query: query || {}, cadence: cadence || 'daily' } });
  res.status(201).json({ savedSearch: ss });
}));

router.get('/saved-searches', requireAuth, asyncHandler(async (req, res) => {
  const items = await prisma.savedSearch.findMany({ where: { userId: req.user.id }, orderBy: { createdAt: 'desc' } });
  res.json({ items });
}));

module.exports = router;
