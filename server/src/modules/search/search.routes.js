'use strict';
const express = require('express');
const asyncHandler = require('../../utils/asyncHandler');
const { listingCard } = require('../../utils/serializers');
const prisma = require('../../db/prisma');
const categorySchema = require('../../schema/categorySchema');
const { prettifyOption } = require('../../schema/categorySchema');

const router = express.Router();

const RESERVED = new Set([
  'q', 'categoryId', 'locationId', 'sort', 'cursor', 'limit',
  'minPrice', 'maxPrice', 'featured', 'condition', 'priceType',
]);

const SORTS = {
  newest: [{ publishedAt: 'desc' }],
  price_asc: [{ priceMinor: 'asc' }],
  price_desc: [{ priceMinor: 'desc' }],
  relevance: [{ isFeatured: 'desc' }, { publishedAt: 'desc' }],
};

const CARD_INCLUDE = { media: true, category: true, location: true };

// Collect descendant category ids (so searching "Vehicles" includes "Cars").
async function expandCategory(categoryId) {
  if (!categoryId) return null;
  const all = await prisma.category.findMany({ select: { id: true, parentId: true } });
  const childrenOf = {};
  all.forEach((c) => { (childrenOf[c.parentId] = childrenOf[c.parentId] || []).push(c.id); });
  const out = [];
  const stack = [categoryId];
  while (stack.length) {
    const id = stack.pop();
    out.push(id);
    (childrenOf[id] || []).forEach((c) => stack.push(c));
  }
  return out;
}

// Expand a location to include its descendants (province -> cities -> areas).
async function expandLocation(locationId) {
  if (!locationId) return null;
  const all = await prisma.location.findMany({ select: { id: true, parentId: true } });
  const childrenOf = {};
  all.forEach((l) => { (childrenOf[l.parentId] = childrenOf[l.parentId] || []).push(l.id); });
  const out = [];
  const stack = [locationId];
  while (stack.length) {
    const id = stack.pop();
    out.push(id);
    (childrenOf[id] || []).forEach((c) => stack.push(c));
  }
  return out;
}

// GET /search
router.get('/search', asyncHandler(async (req, res) => {
  const q = (req.query.q || '').trim();
  const sort = SORTS[req.query.sort] ? req.query.sort : 'relevance';
  const limit = Math.min(parseInt(req.query.limit || '24', 10), 48);
  const offset = Math.max(parseInt(req.query.cursor || '0', 10), 0);

  const where = { state: 'ACTIVE' };
  if (q) {
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
    ];
  }
  const catIds = await expandCategory(req.query.categoryId);
  if (catIds) where.categoryId = { in: catIds };
  const locIds = await expandLocation(req.query.locationId);
  if (locIds) where.locationId = { in: locIds };
  if (req.query.priceType) where.priceType = req.query.priceType;
  if (req.query.featured === 'true') where.isFeatured = true;
  const priceClause = {};
  if (req.query.minPrice) priceClause.gte = BigInt(parseInt(req.query.minPrice, 10) * 100);
  if (req.query.maxPrice) priceClause.lte = BigInt(parseInt(req.query.maxPrice, 10) * 100);
  if (Object.keys(priceClause).length) where.priceMinor = priceClause;

  // Base set (core SQL filters). Attribute facets/filters applied in JS (Release-1; OpenSearch in prod).
  const baseRows = await prisma.listing.findMany({
    where,
    include: CARD_INCLUDE,
    orderBy: SORTS[sort],
    take: 500,
  });

  // Determine facetable attribute fields for the active category (if leaf with schema).
  let facetFields = [];
  if (req.query.categoryId) facetFields = categorySchema.getFacetFields(req.query.categoryId);

  // Attribute filters from query (any non-reserved key matching a facet field or attribute).
  const attrFilters = {};
  for (const [k, v] of Object.entries(req.query)) {
    if (RESERVED.has(k)) continue;
    if (v === '' || v === undefined) continue;
    attrFilters[k] = Array.isArray(v) ? v : String(v).split(',');
  }
  if (req.query.condition) attrFilters.condition = String(req.query.condition).split(',');

  function matchesAttrs(row) {
    const a = row.attributes || {};
    for (const [key, vals] of Object.entries(attrFilters)) {
      const av = a[key] !== undefined ? a[key] : (key === 'condition' ? row.condition : undefined);
      if (av === undefined || av === null) return false;
      const avArr = Array.isArray(av) ? av.map(String) : [String(av)];
      const wanted = vals.map(String);
      if (!wanted.some((w) => avArr.includes(w))) return false;
    }
    return true;
  }

  const filtered = baseRows.filter(matchesAttrs);

  // Build facets from baseRows (so counts reflect available refinements).
  const facets = {};
  const facetSource = facetFields.length
    ? facetFields
    : [{ key: 'condition', label: 'Condition', type: 'single_select' }];
  for (const f of facetSource) {
    const counts = {};
    for (const row of baseRows) {
      let v = (row.attributes || {})[f.key];
      if (v === undefined && f.key === 'condition') v = row.condition;
      if (v === undefined || v === null || v === '') continue;
      const arr = Array.isArray(v) ? v : [v];
      arr.forEach((val) => { counts[val] = (counts[val] || 0) + 1; });
    }
    const values = Object.entries(counts)
      .map(([value, count]) => ({ value, label: prettifyOption(value), count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 30);
    if (values.length) facets[f.key] = { label: f.label, type: f.type, values };
  }

  const page = filtered.slice(offset, offset + limit);
  const nextCursor = offset + limit < filtered.length ? String(offset + limit) : null;

  res.json({
    items: page.map(listingCard),
    nextCursor,
    total: filtered.length,
    facets,
    appliedSort: sort,
  });
}));

// GET /search/suggest
router.get('/search/suggest', asyncHandler(async (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q) return res.json({ categories: [], queries: [], locations: [] });
  const cats = await prisma.category.findMany({ where: { label: { contains: q, mode: 'insensitive' }, isActive: true }, take: 6 });
  const locs = await prisma.location.findMany({ where: { name: { contains: q, mode: 'insensitive' }, level: { in: ['city', 'area'] } }, take: 5 });
  const titles = await prisma.listing.findMany({
    where: { title: { contains: q, mode: 'insensitive' }, state: 'ACTIVE' },
    select: { title: true }, take: 6,
  });
  res.json({
    categories: cats.map((c) => ({ id: c.id, label: c.label, listingKind: c.listingKind })),
    locations: locs.map((l) => ({ id: l.id, name: l.name, level: l.level })),
    queries: [...new Set(titles.map((t) => t.title))].slice(0, 6),
  });
}));

module.exports = router;
