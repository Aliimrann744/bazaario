'use strict';
const express = require('express');
const asyncHandler = require('../../utils/asyncHandler');
const prisma = require('../../db/prisma');

const router = express.Router();

// GET /reference-data/:catalog?parentId=
router.get('/reference-data/:catalog', asyncHandler(async (req, res) => {
  const where = { catalog: req.params.catalog };
  if (req.query.parentId) where.parentId = req.query.parentId;
  const rows = await prisma.referenceItem.findMany({ where, orderBy: { label: 'asc' }, take: 500 });
  res.json({ items: rows.map((r) => ({ value: r.value, label: r.label, parentId: r.parentId || null })) });
}));

module.exports = router;
