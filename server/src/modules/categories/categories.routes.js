'use strict';
const express = require('express');
const asyncHandler = require('../../utils/asyncHandler');
const ApiError = require('../../utils/apiError');
const prisma = require('../../db/prisma');
const categorySchema = require('../../schema/categorySchema');

const router = express.Router();

function buildTree(rows) {
  const byId = {};
  const roots = [];
  rows.forEach((r) => { byId[r.id] = { ...r, children: [] }; });
  rows.forEach((r) => {
    const node = byId[r.id];
    if (r.parentId && byId[r.parentId]) byId[r.parentId].children.push(node);
    else roots.push(node);
  });
  const sortRec = (nodes) => {
    nodes.sort((a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label));
    nodes.forEach((n) => sortRec(n.children));
  };
  sortRec(roots);
  return roots;
}

// GET /categories  -> full nested tree
router.get('/categories', asyncHandler(async (req, res) => {
  const rows = await prisma.category.findMany({ where: { isActive: true } });
  res.json({ items: buildTree(rows) });
}));

// GET /categories/:id
router.get('/categories/:id', asyncHandler(async (req, res) => {
  const cat = await prisma.category.findUnique({ where: { id: req.params.id } });
  if (!cat) throw ApiError.notFound('Category not found');
  res.json({ category: cat });
}));

// GET /categories/:id/form-schema  -> dynamic post-ad form
router.get('/categories/:id/form-schema', asyncHandler(async (req, res) => {
  const cat = await prisma.category.findUnique({ where: { id: req.params.id } });
  const schemaId = (cat && cat.schemaRef) || req.params.id;
  const schema = categorySchema.getFormSchema(schemaId);
  if (schema) {
    // Return under the requested category id so the client posts to the right category.
    return res.json({ ...schema, categoryId: req.params.id, label: (cat && cat.label) || schema.label });
  }
  {
    // Generic goods fallback for categories without a detailed schema
    const generic = categorySchema.getFormSchema('mobiles.mobile_phones');
    if (!cat) throw ApiError.notFound('Category not found');
    return res.json({
      categoryId: cat.id,
      label: cat.label,
      listingKind: cat.listingKind || 'good',
      schemaVersion: categorySchema.schemaVersion,
      priceTypesAllowed: cat.priceTypesAllowed || ['fixed', 'negotiable'],
      commonFields: generic.commonFields,
      fields: [
        { key: 'condition', type: 'single_select', label: 'Condition', required: false,
          options: [
            { value: 'new', label: 'New' }, { value: 'used', label: 'Used' },
            { value: 'open_box', label: 'Open Box' }, { value: 'refurbished', label: 'Refurbished' },
          ], facetable: true },
        { key: 'brand', type: 'text', label: 'Brand', required: false, searchable: true },
      ],
      generic: true,
    });
  }
}));

module.exports = router;
