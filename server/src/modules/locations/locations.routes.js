'use strict';
const express = require('express');
const asyncHandler = require('../../utils/asyncHandler');
const prisma = require('../../db/prisma');

const router = express.Router();

async function pathFor(loc, cache) {
  const parts = [loc.name];
  let current = loc;
  while (current.parentId) {
    const p = cache[current.parentId] || await prisma.location.findUnique({ where: { id: current.parentId } });
    if (!p) break;
    cache[p.id] = p;
    if (p.level !== 'country') parts.unshift(p.name);
    current = p;
  }
  return parts.join(', ');
}

// GET /locations -> city tree (provinces + cities)
router.get('/locations', asyncHandler(async (req, res) => {
  const rows = await prisma.location.findMany({ where: { level: { in: ['province', 'city'] } }, orderBy: { name: 'asc' } });
  res.json({ items: rows });
}));

// GET /locations/suggest?q=
router.get('/locations/suggest', asyncHandler(async (req, res) => {
  const q = (req.query.q || '').trim();
  const where = { level: { in: ['city', 'area'] } };
  if (q) where.name = { contains: q, mode: 'insensitive' };
  const rows = await prisma.location.findMany({ where, take: 15, orderBy: [{ level: 'asc' }, { name: 'asc' }] });
  const cache = {};
  const items = [];
  for (const r of rows) items.push({ id: r.id, name: r.name, level: r.level, path: await pathFor(r, cache), lat: r.lat, lon: r.lon });
  res.json({ items });
}));

// GET /locations/:id/children
router.get('/locations/:id/children', asyncHandler(async (req, res) => {
  const rows = await prisma.location.findMany({ where: { parentId: req.params.id }, orderBy: { name: 'asc' } });
  res.json({ items: rows });
}));

module.exports = router;
