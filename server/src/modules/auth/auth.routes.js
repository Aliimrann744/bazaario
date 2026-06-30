'use strict';
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { z } = require('zod');
const config = require('../../config');
const ApiError = require('../../utils/apiError');
const asyncHandler = require('../../utils/asyncHandler');
const { publicUserId } = require('../../utils/helpers');
const { meUser } = require('../../utils/serializers');
const prisma = require('../../db/prisma');
const { requireAuth } = require('../../middleware/auth');

const router = express.Router();

function issueTokens(user) {
  const accessToken = jwt.sign({ sub: user.id, role: user.role }, config.jwt.accessSecret, { expiresIn: config.jwt.accessTtl });
  const refreshToken = jwt.sign({ sub: user.id, type: 'refresh' }, config.jwt.refreshSecret, { expiresIn: config.jwt.refreshTtl });
  return { accessToken, refreshToken };
}

const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  phone: z.string().min(7).max(20),
  password: z.string().min(8).max(128),
});

router.post('/register', asyncHandler(async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) throw ApiError.validation(zodFields(parsed.error));
  const { name, email, phone, password } = parsed.data;

  const exists = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (exists) throw ApiError.conflict('Email already registered', { email: 'Already registered' });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      publicId: publicUserId(),
      name,
      email: email.toLowerCase(),
      phone,
      passwordHash,
      trustTier: 'ACTIVE',
    },
  });
  const tokens = issueTokens(user);
  res.status(201).json({ user: meUser(user), ...tokens });
}));

const loginSchema = z.object({
  emailOrPhone: z.string().min(3),
  password: z.string().min(1),
});

router.post('/login', asyncHandler(async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) throw ApiError.validation(zodFields(parsed.error));
  const { emailOrPhone, password } = parsed.data;
  const user = await prisma.user.findFirst({
    where: { OR: [{ email: emailOrPhone.toLowerCase() }, { phone: emailOrPhone }] },
  });
  if (!user) throw ApiError.unauthorized('Invalid credentials');
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw ApiError.unauthorized('Invalid credentials');
  const tokens = issueTokens(user);
  res.json({ user: meUser(user), ...tokens });
}));

router.post('/refresh', asyncHandler(async (req, res) => {
  const { refreshToken } = req.body || {};
  if (!refreshToken) throw ApiError.badRequest('refreshToken required');
  let payload;
  try { payload = jwt.verify(refreshToken, config.jwt.refreshSecret); }
  catch { throw ApiError.unauthorized('Invalid refresh token'); }
  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user) throw ApiError.unauthorized('Invalid refresh token');
  const accessToken = jwt.sign({ sub: user.id, role: user.role }, config.jwt.accessSecret, { expiresIn: config.jwt.accessTtl });
  res.json({ accessToken });
}));

router.post('/logout', requireAuth, asyncHandler(async (req, res) => {
  // Stateless JWT — client discards tokens. (Phase 2: refresh-token rotation + revocation list.)
  res.json({ ok: true });
}));

function zodFields(error) {
  const fields = {};
  for (const issue of error.issues) fields[issue.path.join('.')] = issue.message;
  return fields;
}

module.exports = router;
module.exports.issueTokens = issueTokens;
