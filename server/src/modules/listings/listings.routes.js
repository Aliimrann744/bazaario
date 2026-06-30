'use strict';
const express = require('express');
const { z } = require('zod');
const config = require('../../config');
const asyncHandler = require('../../utils/asyncHandler');
const ApiError = require('../../utils/apiError');
const { publicListingId } = require('../../utils/helpers');
const { listingDetail, listingCard } = require('../../utils/serializers');
const prisma = require('../../db/prisma');
const categorySchema = require('../../schema/categorySchema');
const { requireAuth, optionalAuth } = require('../../middleware/auth');
const { runChecks } = require('./moderation');
const refLookup = require('./refLookup');

const router = express.Router();

const FULL_INCLUDE = { media: true, category: true, location: true, seller: true };
const CARD_INCLUDE = { media: true, category: true, location: true };
// Category ids that have a detailed schema in category-schema-reference.json.
const SCHEMA_IDS = new Set(categorySchema.listSchemaCategoryIds());

const createSchema = z.object({
  categoryId: z.string(),
  title: z.string().min(10).max(100),
  description: z.string().min(20).max(5000),
  priceMinor: z.number().int().nonnegative().optional().default(0),
  priceType: z.string().default('fixed'),
  condition: z.string().optional(),
  locationId: z.string(),
  attributes: z.record(z.any()).optional().default({}),
  media: z.array(z.object({
    url: z.string().url().or(z.string().min(1)),
    sortOrder: z.number().int().optional(),
    width: z.number().int().optional(),
    height: z.number().int().optional(),
  })).optional().default([]),
});

// POST /listings
router.post('/listings', requireAuth, asyncHandler(async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) throw ApiError.validation(zodFields(parsed.error));
  const data = parsed.data;

  const category = await prisma.category.findUnique({ where: { id: data.categoryId } });
  if (!category) throw ApiError.badRequest('Invalid category', { categoryId: 'Unknown category' });
  if (!category.isLeaf) throw ApiError.badRequest('Pick a specific subcategory', { categoryId: 'Choose a leaf category' });

  const location = await prisma.location.findUnique({ where: { id: data.locationId } });
  if (!location) throw ApiError.badRequest('Invalid location', { locationId: 'Unknown location' });

  // price_type allowed by category
  const allowed = category.priceTypesAllowed || ['fixed', 'negotiable'];
  if (allowed.length && !allowed.includes(data.priceType)) {
    throw ApiError.validation({ priceType: `Allowed: ${allowed.join(', ')}` });
  }

  // media rules (Release-1: 1..12)
  if (category.listingKind !== 'job' && (!data.media || data.media.length < 1)) {
    throw ApiError.validation({ media: 'At least 1 image required' });
  }
  if (data.media.length > 12) throw ApiError.validation({ media: 'Maximum 12 images' });

  // category-specific validation + normalization (only when a detailed schema exists;
  // generic categories carry their attributes through as-is).
  const schemaId = category.schemaRef || category.id;
  let attributes = data.attributes || {};
  if (SCHEMA_IDS.has(schemaId)) {
    const validator = await refLookup.makeValidator();
    const result = categorySchema.validateAndNormalize(schemaId, data.attributes, validator);
    if (Object.keys(result.errors).length) throw ApiError.validation(result.errors);
    attributes = result.attributes;
  }

  // moderation
  const mod = runChecks({ title: data.title, description: data.description, priceMinor: data.priceMinor, priceType: data.priceType });

  const now = new Date();
  const expires = new Date(now.getTime() + config.listingExpiryDays * 86400000);
  const listing = await prisma.listing.create({
    data: {
      publicId: publicListingId(),
      userId: req.user.id,
      categoryId: category.id,
      title: data.title,
      description: data.description,
      priceMinor: BigInt(data.priceMinor || 0),
      priceType: data.priceType,
      currency: 'PKR',
      condition: data.condition || attributes.condition || null,
      locationId: location.id,
      attributes,
      schemaVersion: category.schemaVersion || categorySchema.schemaVersion,
      state: mod.decision,
      publishedAt: mod.decision === 'ACTIVE' ? now : null,
      expiresAt: expires,
      media: data.media.length ? {
        create: data.media.map((m, i) => ({ url: m.url, sortOrder: m.sortOrder ?? i, width: m.width, height: m.height })),
      } : undefined,
    },
    include: FULL_INCLUDE,
  });

  res.status(201).json({ listing: listingDetail(listing), moderation: { state: mod.decision, reason: mod.reason } });
}));

// GET /listings/:publicId
router.get('/listings/:publicId', optionalAuth, asyncHandler(async (req, res) => {
  const listing = await prisma.listing.findUnique({ where: { publicId: req.params.publicId }, include: FULL_INCLUDE });
  if (!listing) throw ApiError.notFound('Listing not found');

  // increment view (best-effort, not for owner)
  if (!req.user || req.user.id !== listing.userId) {
    prisma.listing.update({ where: { id: listing.id }, data: { viewCount: { increment: 1 } } }).catch(() => {});
    listing.viewCount += 1;
  }

  const resolver = await refLookup.makeResolver();
  const displayAttributes = categorySchema.buildDisplayAttributes(listing.categoryId, listing.attributes, resolver);

  // similar: same category, active, not this one
  const similarRows = await prisma.listing.findMany({
    where: { categoryId: listing.categoryId, state: 'ACTIVE', id: { not: listing.id } },
    include: CARD_INCLUDE,
    orderBy: { publishedAt: 'desc' },
    take: 8,
  });

  let isFavourited = false;
  if (req.user) {
    const fav = await prisma.favourite.findUnique({ where: { userId_listingId: { userId: req.user.id, listingId: listing.id } } });
    isFavourited = !!fav;
  }

  res.json({ listing: listingDetail(listing, { displayAttributes, similar: similarRows.map(listingCard), isFavourited }) });
}));

async function loadOwned(req) {
  const listing = await prisma.listing.findFirst({
    where: { OR: [{ id: req.params.id }, { publicId: req.params.id }] },
    include: FULL_INCLUDE,
  });
  if (!listing) throw ApiError.notFound('Listing not found');
  if (listing.userId !== req.user.id && req.user.role === 'USER') throw ApiError.forbidden('Not your listing');
  return listing;
}

// PATCH /listings/:id
const patchSchema = z.object({
  title: z.string().min(10).max(100).optional(),
  description: z.string().min(20).max(5000).optional(),
  priceMinor: z.number().int().nonnegative().optional(),
  priceType: z.string().optional(),
  attributes: z.record(z.any()).optional(),
});
router.patch('/listings/:id', requireAuth, asyncHandler(async (req, res) => {
  const listing = await loadOwned(req);
  const parsed = patchSchema.safeParse(req.body);
  if (!parsed.success) throw ApiError.validation(zodFields(parsed.error));
  const data = parsed.data;

  const update = {};
  if (data.attributes) {
    const schemaId = (listing.category && listing.category.schemaRef) || listing.categoryId;
    const merged = { ...listing.attributes, ...data.attributes };
    if (SCHEMA_IDS.has(schemaId)) {
      const validator = await refLookup.makeValidator();
      const result = categorySchema.validateAndNormalize(schemaId, merged, validator);
      if (Object.keys(result.errors).length) throw ApiError.validation(result.errors);
      update.attributes = result.attributes;
    } else {
      update.attributes = merged;
    }
  }
  if (data.title !== undefined) update.title = data.title;
  if (data.description !== undefined) update.description = data.description;
  if (data.priceType !== undefined) update.priceType = data.priceType;
  if (data.priceMinor !== undefined) update.priceMinor = BigInt(data.priceMinor);

  const updated = await prisma.listing.update({ where: { id: listing.id }, data: update, include: FULL_INCLUDE });
  res.json({ listing: listingDetail(updated) });
}));

router.post('/listings/:id/mark-sold', requireAuth, asyncHandler(async (req, res) => {
  const listing = await loadOwned(req);
  await prisma.listing.update({ where: { id: listing.id }, data: { state: 'SOLD' } });
  res.json({ ok: true, state: 'SOLD' });
}));

router.post('/listings/:id/deactivate', requireAuth, asyncHandler(async (req, res) => {
  const listing = await loadOwned(req);
  await prisma.listing.update({ where: { id: listing.id }, data: { state: 'DEACTIVATED' } });
  res.json({ ok: true, state: 'DEACTIVATED' });
}));

router.post('/listings/:id/renew', requireAuth, asyncHandler(async (req, res) => {
  const listing = await loadOwned(req);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + config.listingExpiryDays * 86400000);
  await prisma.listing.update({ where: { id: listing.id }, data: { state: 'ACTIVE', publishedAt: now, expiresAt } });
  res.json({ ok: true, state: 'ACTIVE', expiresAt });
}));

function zodFields(error) {
  const fields = {};
  for (const issue of error.issues) fields[issue.path.join('.')] = issue.message;
  return fields;
}

module.exports = router;
