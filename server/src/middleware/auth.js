'use strict';
const jwt = require('jsonwebtoken');
const config = require('../config');
const ApiError = require('../utils/apiError');
const prisma = require('../db/prisma');

function readToken(req) {
  const h = req.headers.authorization || '';
  if (h.startsWith('Bearer ')) return h.slice(7);
  return null;
}

async function loadUser(req) {
  const token = readToken(req);
  if (!token) return null;
  try {
    const payload = jwt.verify(token, config.jwt.accessSecret);
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    return user || null;
  } catch {
    return null;
  }
}

// Hard gate
async function requireAuth(req, res, next) {
  const user = await loadUser(req);
  if (!user) return next(ApiError.unauthorized());
  req.user = user;
  next();
}

// Soft: attach user if present, else continue
async function optionalAuth(req, res, next) {
  req.user = await loadUser(req);
  next();
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return next(ApiError.unauthorized());
    if (!roles.includes(req.user.role)) return next(ApiError.forbidden());
    next();
  };
}

module.exports = { requireAuth, optionalAuth, requireRole };
