'use strict';
const crypto = require('crypto');

// Short, human-friendly, non-sequential public listing ID (e.g. "A1B2C3").
const ID_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no ambiguous chars
function publicListingId(len = 7) {
  let out = '';
  const bytes = crypto.randomBytes(len);
  for (let i = 0; i < len; i++) out += ID_ALPHABET[bytes[i] % ID_ALPHABET.length];
  return out;
}

function publicUserId() {
  return 'u_' + crypto.randomBytes(6).toString('hex');
}

function slugify(str) {
  return String(str)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Cursor pagination based on a sortable key (createdAt|publishedAt + id). Opaque base64.
function encodeCursor(obj) {
  return Buffer.from(JSON.stringify(obj)).toString('base64url');
}
function decodeCursor(cursor) {
  if (!cursor) return null;
  try { return JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8')); }
  catch { return null; }
}

module.exports = { publicListingId, publicUserId, slugify, encodeCursor, decodeCursor };
