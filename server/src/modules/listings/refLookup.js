'use strict';
const prisma = require('../../db/prisma');

// Lazy in-memory cache of reference labels for display resolution.
let cache = null;
async function load() {
  if (cache) return cache;
  cache = {};
  const items = await prisma.referenceItem.findMany();
  for (const it of items) {
    cache[it.catalog] = cache[it.catalog] || {};
    cache[it.catalog][it.value] = it.label;
  }
  return cache;
}
function invalidate() { cache = null; }

async function makeResolver() {
  const c = await load();
  return (catalog, value) => (c[catalog] && c[catalog][value]) || null;
}

async function makeValidator() {
  const c = await load();
  return (catalog, value) => !!(c[catalog] && c[catalog][value]);
}

module.exports = { makeResolver, makeValidator, invalidate };
