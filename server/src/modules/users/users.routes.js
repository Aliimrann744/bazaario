'use strict';
const express = require('express');
const { z } = require('zod');
const asyncHandler = require('../../utils/asyncHandler');
const ApiError = require('../../utils/apiError');
const { meUser, publicUser, listingCard } = require('../../utils/serializers');
const prisma = require('../../db/prisma');
const { requireAuth } = require('../../middleware/auth');

const router = express.Router();

const LISTING_INCLUDE = { media: true, category: true, location: true };

// GET /me
router.get('/me', requireAuth, asyncHandler(async (req, res) => {
  res.json({ user: meUser(req.user) });
}));

const profileSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  bio: z.string().max(200).optional(),
  avatarUrl: z.string().url().optional().or(z.literal('')),
  cityId: z.string().optional(),
});

router.patch('/me/profile', requireAuth, asyncHandler(async (req, res) => {
  const parsed = profileSchema.safeParse(req.body);
  if (!parsed.success) throw ApiError.validation(zodFields(parsed.error));
  const user = await prisma.user.update({ where: { id: req.user.id }, data: parsed.data });
  res.json({ user: meUser(user) });
}));

// GET /me/listings?state=
router.get('/me/listings', requireAuth, asyncHandler(async (req, res) => {
  const where = { userId: req.user.id };
  if (req.query.state) where.state = req.query.state;
  else where.state = { not: 'REMOVED' };
  const rows = await prisma.listing.findMany({
    where,
    include: LISTING_INCLUDE,
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
  res.json({ items: rows.map(listingCard), nextCursor: null });
}));

// GET /users/:publicId
router.get('/users/:publicId', asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { publicId: req.params.publicId } });
  if (!user) throw ApiError.notFound('User not found');
  const activeCount = await prisma.listing.count({ where: { userId: user.id, state: 'ACTIVE' } });
  res.json({ user: publicUser(user), stats: { activeListings: activeCount } });
}));

// GET /users/:publicId/listings
router.get('/users/:publicId/listings', asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { publicId: req.params.publicId } });
  if (!user) throw ApiError.notFound('User not found');
  const rows = await prisma.listing.findMany({
    where: { userId: user.id, state: 'ACTIVE' },
    include: LISTING_INCLUDE,
    orderBy: { publishedAt: 'desc' },
    take: 60,
  });
  res.json({ items: rows.map(listingCard), nextCursor: null });
}));

function zodFields(error) {
  const fields = {};
  for (const issue of error.issues) fields[issue.path.join('.')] = issue.message;
  return fields;
}

module.exports = router;
