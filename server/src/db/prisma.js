'use strict';
const { PrismaClient } = require('@prisma/client');

// Single shared Prisma client. In dev with nodemon we reuse a global to avoid
// exhausting connections on hot reload.
const globalForPrisma = globalThis;

const prisma = globalForPrisma.__bazaarioPrisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.__bazaarioPrisma = prisma;

module.exports = prisma;
