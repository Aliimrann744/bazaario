'use strict';
const express = require('express');
const { z } = require('zod');
const asyncHandler = require('../../utils/asyncHandler');
const ApiError = require('../../utils/apiError');
const prisma = require('../../db/prisma');
const { requireAuth } = require('../../middleware/auth');

const router = express.Router();

const schema = z.object({
  targetType: z.enum(['listing', 'user']),
  targetId: z.string().min(1),
  reason: z.string().min(2).max(80),
  detail: z.string().max(2000).optional(),
});

router.post('/reports', requireAuth, asyncHandler(async (req, res) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    const fields = {};
    for (const i of parsed.error.issues) fields[i.path.join('.')] = i.message;
    throw ApiError.validation(fields);
  }
  const report = await prisma.report.create({ data: { reporterId: req.user.id, ...parsed.data } });
  res.status(201).json({ report: { id: report.id, status: report.status } });
}));

module.exports = router;
