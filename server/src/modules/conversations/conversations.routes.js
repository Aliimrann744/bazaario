'use strict';
const express = require('express');
const { z } = require('zod');
const asyncHandler = require('../../utils/asyncHandler');
const ApiError = require('../../utils/apiError');
const { publicUser } = require('../../utils/serializers');
const prisma = require('../../db/prisma');
const { requireAuth } = require('../../middleware/auth');

const router = express.Router();

// POST /conversations { listingPublicId }
router.post('/conversations', requireAuth, asyncHandler(async (req, res) => {
  const { listingPublicId } = req.body || {};
  if (!listingPublicId) throw ApiError.badRequest('listingPublicId required');
  const listing = await prisma.listing.findUnique({ where: { publicId: listingPublicId } });
  if (!listing) throw ApiError.notFound('Listing not found');
  if (listing.userId === req.user.id) throw ApiError.badRequest('You cannot message your own listing');

  const key = { listingId_buyerId: { listingId: listing.id, buyerId: req.user.id } };
  let conv = await prisma.conversation.findUnique({ where: key });
  if (!conv) {
    conv = await prisma.conversation.create({
      data: { listingId: listing.id, buyerId: req.user.id, sellerId: listing.userId, lastMessageAt: new Date() },
    });
  }
  res.status(201).json({ conversation: await shapeConversation(conv, req.user.id) });
}));

// GET /conversations
router.get('/conversations', requireAuth, asyncHandler(async (req, res) => {
  const convs = await prisma.conversation.findMany({
    where: { OR: [{ buyerId: req.user.id }, { sellerId: req.user.id }] },
    orderBy: { lastMessageAt: 'desc' },
    take: 100,
  });
  const items = [];
  for (const c of convs) items.push(await shapeConversation(c, req.user.id));
  res.json({ items, nextCursor: null });
}));

// GET /conversations/:id/messages
router.get('/conversations/:id/messages', requireAuth, asyncHandler(async (req, res) => {
  const conv = await mustParticipate(req);
  const msgs = await prisma.message.findMany({
    where: { conversationId: conv.id },
    orderBy: { createdAt: 'asc' },
    take: 200,
  });
  res.json({ items: msgs.map(shapeMessage), nextCursor: null });
}));

// POST /conversations/:id/messages
const msgSchema = z.object({ body: z.string().min(1).max(2000) });
router.post('/conversations/:id/messages', requireAuth, asyncHandler(async (req, res) => {
  const conv = await mustParticipate(req);
  const parsed = msgSchema.safeParse(req.body);
  if (!parsed.success) throw ApiError.validation({ body: 'Message required' });
  const msg = await prisma.message.create({ data: { conversationId: conv.id, senderId: req.user.id, body: parsed.data.body } });
  await prisma.conversation.update({ where: { id: conv.id }, data: { lastMessageAt: new Date() } });
  res.status(201).json({ message: shapeMessage(msg) });
}));

// POST /conversations/:id/read
router.post('/conversations/:id/read', requireAuth, asyncHandler(async (req, res) => {
  const conv = await mustParticipate(req);
  const data = conv.buyerId === req.user.id ? { buyerReadAt: new Date() } : { sellerReadAt: new Date() };
  await prisma.conversation.update({ where: { id: conv.id }, data });
  res.json({ ok: true });
}));

async function mustParticipate(req) {
  const conv = await prisma.conversation.findUnique({ where: { id: req.params.id } });
  if (!conv) throw ApiError.notFound('Conversation not found');
  if (conv.buyerId !== req.user.id && conv.sellerId !== req.user.id) throw ApiError.forbidden();
  return conv;
}

function shapeMessage(m) {
  return { id: m.id, senderId: m.senderId, body: m.body, type: m.type, createdAt: m.createdAt };
}

async function shapeConversation(conv, meId) {
  const listing = await prisma.listing.findUnique({ where: { id: conv.listingId }, include: { media: true } });
  const otherId = conv.buyerId === meId ? conv.sellerId : conv.buyerId;
  const other = await prisma.user.findUnique({ where: { id: otherId } });
  const last = await prisma.message.findFirst({ where: { conversationId: conv.id }, orderBy: { createdAt: 'desc' } });
  const myReadAt = conv.buyerId === meId ? conv.buyerReadAt : conv.sellerReadAt;
  const unread = !!(last && last.senderId !== meId && (!myReadAt || last.createdAt > myReadAt));
  return {
    id: conv.id,
    listing: listing ? { publicId: listing.publicId, title: listing.title, thumbnail: listing.media && listing.media[0] ? listing.media[0].url : null, priceMinor: Number(listing.priceMinor) } : null,
    otherUser: publicUser(other),
    role: conv.buyerId === meId ? 'buyer' : 'seller',
    lastMessage: last ? shapeMessage(last) : null,
    lastMessageAt: conv.lastMessageAt,
    unread,
  };
}

module.exports = router;
